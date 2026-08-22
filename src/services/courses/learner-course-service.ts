import type { SupabaseClient } from '@supabase/supabase-js'

export type LearnerCourseMembership = {
  userId: string
  courseId: string
  createdAt: string
}

export type LearnerCourseEventType =
  | 'courses_index_viewed'
  | 'add_course_opened'
  | 'course_added'
  | 'course_add_failed'
  | 'course_removed'
  | 'course_remove_cancelled'
  | 'course_opened_from_global_navigation'
  | 'course_opened_from_courses_index'
  | 'course_membership_integrity_exception'

function membershipFromRow(row: Record<string, unknown>): LearnerCourseMembership {
  return {
    userId: String(row.user_id ?? ''),
    courseId: String(row.course_id ?? ''),
    createdAt: String(row.created_at ?? ''),
  }
}

export async function loadLearnerCourses(client: SupabaseClient, userId: string): Promise<LearnerCourseMembership[]> {
  const { data, error } = await client
    .from('learner_courses')
    .select('user_id, course_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Could not load your courses: ${error.message}`)
  return (data ?? []).map((row) => membershipFromRow(row as Record<string, unknown>))
}

export async function addLearnerCourse(client: SupabaseClient, userId: string, courseId: string): Promise<LearnerCourseMembership> {
  const { data, error } = await client
    .from('learner_courses')
    .insert({ user_id: userId, course_id: courseId })
    .select('user_id, course_id, created_at')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('That course is already in your programme.')
    throw new Error(`Could not add that course: ${error.message}`)
  }

  return membershipFromRow(data as Record<string, unknown>)
}

export async function removeLearnerCourse(client: SupabaseClient, userId: string, courseId: string): Promise<void> {
  const { error } = await client
    .from('learner_courses')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId)

  if (error) throw new Error(`Could not remove that course: ${error.message}`)
}

export async function recordLearnerCourseEvent(
  client: SupabaseClient,
  userId: string,
  eventType: LearnerCourseEventType,
  courseId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await client
    .from('learner_course_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      course_id: courseId ?? null,
      metadata,
    })

  if (error) throw new Error(`Could not record course activity: ${error.message}`)
}

export async function recordLearnerCourseEventBestEffort(
  client: SupabaseClient,
  userId: string,
  eventType: LearnerCourseEventType,
  courseId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await recordLearnerCourseEvent(client, userId, eventType, courseId, metadata)
  } catch {
    // Product telemetry must never block course navigation or programme management.
  }
}
