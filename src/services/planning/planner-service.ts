import type { SupabaseClient } from '@supabase/supabase-js'

export type AssessmentType = 'topic_test' | 'mock' | 'public_exam' | 'other'
export type AssessmentImportance = 'normal' | 'high'

export interface RevisionAssessment {
  assessmentId: string
  userId: string
  subjectId: string
  courseId: string | null
  moduleId: string | null
  assessmentType: AssessmentType
  title: string
  assessmentDate: string
  relativeImportance: AssessmentImportance
  scope: Record<string, unknown>
  isActive: boolean
}

export interface RevisionAvailabilityProfile {
  userId: string
  weekdayMinutes: number
  weekendMinutes: number
  timezone: string
}

export interface RevisionAvailabilityException {
  exceptionId: string
  userId: string
  localDate: string
  availableMinutes: number
  note: string | null
}

type AssessmentRow = {
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

type AvailabilityRow = {
  user_id: string
  weekday_minutes: number
  weekend_minutes: number
  timezone: string
}

type ExceptionRow = {
  exception_id: string
  user_id: string
  local_date: string
  available_minutes: number
  note: string | null
}

function assessmentFromRow(row: AssessmentRow): RevisionAssessment {
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

export async function loadPlannerSetup(client: SupabaseClient, userId: string) {
  const [assessmentResult, availabilityResult, exceptionsResult] = await Promise.all([
    client
      .from('revision_assessments')
      .select('assessment_id,user_id,subject_id,course_id,module_id,assessment_type,title,assessment_date,relative_importance,scope,is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('assessment_date', { ascending: true }),
    client
      .from('revision_availability_profiles')
      .select('user_id,weekday_minutes,weekend_minutes,timezone')
      .eq('user_id', userId)
      .maybeSingle(),
    client
      .from('revision_availability_exceptions')
      .select('exception_id,user_id,local_date,available_minutes,note')
      .eq('user_id', userId)
      .order('local_date', { ascending: true }),
  ])

  if (assessmentResult.error) throw new Error(`Could not load assessments: ${assessmentResult.error.message}`)
  if (availabilityResult.error) throw new Error(`Could not load availability: ${availabilityResult.error.message}`)
  if (exceptionsResult.error) throw new Error(`Could not load availability exceptions: ${exceptionsResult.error.message}`)

  const availability = availabilityResult.data as AvailabilityRow | null
  const exceptions = (exceptionsResult.data ?? []) as ExceptionRow[]

  return {
    assessments: ((assessmentResult.data ?? []) as AssessmentRow[]).map(assessmentFromRow),
    availability: availability
      ? {
          userId: availability.user_id,
          weekdayMinutes: availability.weekday_minutes,
          weekendMinutes: availability.weekend_minutes,
          timezone: availability.timezone,
        } satisfies RevisionAvailabilityProfile
      : null,
    exceptions: exceptions.map((row) => ({
      exceptionId: row.exception_id,
      userId: row.user_id,
      localDate: row.local_date,
      availableMinutes: row.available_minutes,
      note: row.note,
    } satisfies RevisionAvailabilityException)),
  }
}

export async function saveAssessment(
  client: SupabaseClient,
  userId: string,
  value: {
    assessmentId?: string
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
  if (!value.subjectId.trim()) throw new Error('Subject is required.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.assessmentDate)) throw new Error('Assessment date is required.')

  const payload = {
    user_id: userId,
    subject_id: value.subjectId,
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
  return assessmentFromRow(data as AssessmentRow)
}

export async function archiveAssessment(client: SupabaseClient, userId: string, assessmentId: string) {
  const { error } = await client
    .from('revision_assessments')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('assessment_id', assessmentId)
    .eq('user_id', userId)

  if (error) throw new Error(`Could not remove assessment: ${error.message}`)
}

export async function saveAvailabilityProfile(
  client: SupabaseClient,
  userId: string,
  value: { weekdayMinutes: number; weekendMinutes: number; timezone?: string },
): Promise<RevisionAvailabilityProfile> {
  const weekdayMinutes = Math.max(0, Math.min(1440, Math.round(value.weekdayMinutes)))
  const weekendMinutes = Math.max(0, Math.min(1440, Math.round(value.weekendMinutes)))
  const timezone = value.timezone?.trim() || 'Europe/London'

  const { data, error } = await client
    .from('revision_availability_profiles')
    .upsert({
      user_id: userId,
      weekday_minutes: weekdayMinutes,
      weekend_minutes: weekendMinutes,
      timezone,
      updated_at: new Date().toISOString(),
    })
    .select('user_id,weekday_minutes,weekend_minutes,timezone')
    .single()

  if (error) throw new Error(`Could not save availability: ${error.message}`)
  const row = data as AvailabilityRow
  return {
    userId: row.user_id,
    weekdayMinutes: row.weekday_minutes,
    weekendMinutes: row.weekend_minutes,
    timezone: row.timezone,
  }
}

export async function saveAvailabilityException(
  client: SupabaseClient,
  userId: string,
  value: { localDate: string; availableMinutes: number; note?: string },
): Promise<RevisionAvailabilityException> {
  const availableMinutes = Math.max(0, Math.min(1440, Math.round(value.availableMinutes)))
  const { data, error } = await client
    .from('revision_availability_exceptions')
    .upsert({
      user_id: userId,
      local_date: value.localDate,
      available_minutes: availableMinutes,
      note: value.note?.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,local_date' })
    .select('exception_id,user_id,local_date,available_minutes,note')
    .single()

  if (error) throw new Error(`Could not save availability exception: ${error.message}`)
  const row = data as ExceptionRow
  return {
    exceptionId: row.exception_id,
    userId: row.user_id,
    localDate: row.local_date,
    availableMinutes: row.available_minutes,
    note: row.note,
  }
}
