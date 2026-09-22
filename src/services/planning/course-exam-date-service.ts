import type { SupabaseClient } from '@supabase/supabase-js'

export type CourseExamAssessment = {
  assessmentId: string
  subjectId: string
  courseId: string | null
  moduleId: string | null
  title: string
  assessmentDate: string
}

type CourseExamAssessmentRow = {
  assessment_id: string
  subject_id: string
  course_id: string | null
  module_id: string | null
  title: string
  assessment_date: string
}

export async function loadUpcomingPublicExamAssessments(
  client: SupabaseClient,
  userId: string,
  fromDate: string,
): Promise<CourseExamAssessment[]> {
  const { data, error } = await client
    .from('revision_assessments')
    .select('assessment_id,subject_id,course_id,module_id,title,assessment_date')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('assessment_type', 'public_exam')
    .gte('assessment_date', fromDate)
    .order('assessment_date', { ascending: true })

  if (error) throw new Error(`Could not load exam dates: ${error.message}`)

  return ((data ?? []) as CourseExamAssessmentRow[]).map((row) => ({
    assessmentId: row.assessment_id,
    subjectId: row.subject_id,
    courseId: row.course_id,
    moduleId: row.module_id,
    title: row.title,
    assessmentDate: row.assessment_date,
  }))
}
