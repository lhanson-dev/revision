import type { SupabaseClient } from '@supabase/supabase-js'
import type { AssessmentImportance, AssessmentType, RevisionAssessment } from '../planning/planner-service'

export async function saveCourseAssessment(
  client: SupabaseClient,
  userId: string,
  value: {
    courseId: string
    subjectId: string
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

  const { data, error } = await client
    .from('revision_assessments')
    .insert({
      user_id: userId,
      subject_id: value.subjectId,
      course_id: value.courseId,
      module_id: null,
      assessment_type: value.assessmentType,
      title,
      assessment_date: value.assessmentDate,
      relative_importance: value.relativeImportance,
      scope: value.scope ?? {},
      is_active: true,
      updated_at: new Date().toISOString(),
    })
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
