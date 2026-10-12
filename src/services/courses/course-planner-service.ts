import type { SupabaseClient } from '@supabase/supabase-js'
import type { AssessmentImportance, AssessmentType, RevisionAssessment } from '../planning/planner-service'

export async function saveCourseAssessment(
  client: SupabaseClient,
  userId: string,
  value: {
    courseId: string
    subjectId: string
    assessmentId?: string
    moduleId?: string
    assessmentType: AssessmentType
    title: string
    assessmentDate: string
    relativeImportance: AssessmentImportance
    scope?: Record<string, unknown>
  },
): Promise<RevisionAssessment> {
  const title = value.title.trim()
  if (!title) throw new Error('Assessment title is required.')
  if (!value.courseId.trim()) throw new Error('Course is required.')
  if (!value.subjectId.trim()) throw new Error('Course subject is required.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.assessmentDate)) throw new Error('Assessment date is required.')

  const payload = {
    user_id: userId,
    subject_id: value.subjectId,
    course_id: value.courseId,
    module_id: value.moduleId ?? null,
    assessment_type: value.assessmentType,
    title,
    assessment_date: value.assessmentDate,
    relative_importance: value.relativeImportance,
    scope: value.scope ?? {},
    is_active: true,
    updated_at: new Date().toISOString(),
  }
  const query = value.assessmentId
    ? client.from('revision_assessments').update(payload).eq('assessment_id', value.assessmentId).eq('user_id', userId)
    : client.from('revision_assessments').insert(payload)

  const { data, error } = await query
    .select('assessment_id,user_id,subject_id,course_id,module_id,assessment_type,title,assessment_date,relative_importance,scope,is_active')
    .single()

  if (error) throw new Error(`Could not save assessment: ${error.message}`)

  const row = data as {
    assessment_id: string
    user_id: string
    subject_id: string
    course_id: string | null
    module_id: string | null
    assessment_type: AssessmentType
    title: string
    assessment_date: string
    relative_importance: AssessmentImportance
    scope: Record<string, unknown> | null
    is_active: boolean
  }

  return {
    assessmentId: row.assessment_id,
    userId: row.user_id,
    subjectId: row.subject_id,
    courseId: row.course_id,
    moduleId: row.module_id,
    assessmentType: row.assessment_type,
    title: row.title,
    assessmentDate: row.assessment_date,
    relativeImportance: row.relative_importance,
    scope: row.scope ?? {},
    isActive: row.is_active,
  }
}

/**
 * Save known, course-specific public-exam paper dates during first use.
 *
 * A prior attempt may have saved some papers before a later write failed (or
 * the response was lost). Read durable rows afresh before each write, reusing
 * exactly one matching paper rather than inserting a duplicate on retry.
 * Legacy dates created without module_id are matched by their course + title;
 * ambiguous matches fail closed rather than overwriting the wrong assessment.
 *
 * The general assessment editor still supports distinct mocks/topic tests.
 * This is a bounded browser recovery rule, not an atomic multi-tab upsert.
 */
export async function saveKnownPaperDates(
  client: SupabaseClient,
  userId: string,
  papers: readonly {
    courseId: string
    subjectId: string
    moduleId: string
    title: string
    assessmentDate: string
  }[],
): Promise<void> {
  for (const paper of papers) {
    if (!paper.moduleId.trim()) throw new Error('An exact exam paper is required.')

    const { data, error } = await client
      .from('revision_assessments')
      .select('assessment_id,module_id,title,assessment_date')
      .eq('user_id', userId)
      .eq('course_id', paper.courseId)
      .eq('assessment_type', 'public_exam')
      .eq('is_active', true)

    if (error) throw new Error(`Could not check saved exam dates: ${error.message}`)

    const matches = (data ?? []).filter((row) =>
      row.module_id === paper.moduleId ||
      (row.module_id === null && row.title === paper.title.trim()),
    )
    if (matches.length > 1) {
      throw new Error('More than one date is saved for this paper. Review your existing dates in Plan before adding another.')
    }

    const existing = matches[0]
    if (existing && existing.module_id === paper.moduleId && existing.assessment_date === paper.assessmentDate) {
      continue
    }

    await saveCourseAssessment(client, userId, {
      assessmentId: existing?.assessment_id,
      courseId: paper.courseId,
      subjectId: paper.subjectId,
      moduleId: paper.moduleId,
      title: paper.title,
      assessmentDate: paper.assessmentDate,
      assessmentType: 'public_exam',
      relativeImportance: 'high',
    })
  }
}
