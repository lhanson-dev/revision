import type { SupabaseClient } from '@supabase/supabase-js'

export type AssessmentType = 'topic_test' | 'mock' | 'public_exam' | 'other'
export type AssessmentImportance = 'normal' | 'high'
export type PlanningPreferenceType = 'prefer_subject' | 'reduce_subject' | 'prefer_activity'
export type PlanningPreferenceSource = 'learner' | 'rev_negotiated'
export type PlannerActivityEventType = 'offered' | 'started' | 'meaningfully_engaged' | 'completed' | 'chosen_alternative'

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

export interface RevisionPlanningPreference {
  preferenceId: string
  userId: string
  preferenceType: PlanningPreferenceType
  subjectId: string | null
  activityType: string | null
  startsOn: string
  endsOn: string
  strength: 1 | 2 | 3
  source: PlanningPreferenceSource
  rationale: string | null
  isActive: boolean
}

export interface RevisionActivityEvent {
  eventId: string
  userId: string
  recommendationId: string | null
  eventType: PlannerActivityEventType
  subjectId: string
  courseId: string | null
  moduleId: string | null
  topicId: string | null
  activityType: string | null
  occurredAt: string
  metadata: Record<string, unknown>
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

type PreferenceRow = {
  preference_id: string
  user_id: string
  preference_type: PlanningPreferenceType
  subject_id: string | null
  activity_type: string | null
  starts_on: string
  ends_on: string
  strength: number
  source: PlanningPreferenceSource
  rationale: string | null
  is_active: boolean
}

type ActivityEventRow = {
  event_id: string
  user_id: string
  recommendation_id: string | null
  event_type: PlannerActivityEventType
  subject_id: string
  course_id: string | null
  module_id: string | null
  topic_id: string | null
  activity_type: string | null
  occurred_at: string
  metadata: Record<string, unknown> | null
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

function preferenceFromRow(row: PreferenceRow): RevisionPlanningPreference {
  const strength = Math.max(1, Math.min(3, Math.round(row.strength))) as 1 | 2 | 3
  return {
    preferenceId: row.preference_id,
    userId: row.user_id,
    preferenceType: row.preference_type,
    subjectId: row.subject_id,
    activityType: row.activity_type,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    strength,
    source: row.source,
    rationale: row.rationale,
    isActive: row.is_active,
  }
}

function activityEventFromRow(row: ActivityEventRow): RevisionActivityEvent {
  return {
    eventId: row.event_id,
    userId: row.user_id,
    recommendationId: row.recommendation_id,
    eventType: row.event_type,
    subjectId: row.subject_id,
    courseId: row.course_id,
    moduleId: row.module_id,
    topicId: row.topic_id,
    activityType: row.activity_type,
    occurredAt: row.occurred_at,
    metadata: row.metadata ?? {},
  }
}

export async function loadPlannerSetup(client: SupabaseClient, userId: string) {
  const [assessmentResult, availabilityResult, exceptionsResult, preferenceResult, activityResult] = await Promise.all([
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
    client
      .from('revision_planning_preferences')
      .select('preference_id,user_id,preference_type,subject_id,activity_type,starts_on,ends_on,strength,source,rationale,is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('starts_on', { ascending: false }),
    client
      .from('revision_activity_events')
      .select('event_id,user_id,recommendation_id,event_type,subject_id,course_id,module_id,topic_id,activity_type,occurred_at,metadata')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(100),
  ])

  if (assessmentResult.error) throw new Error(`Could not load assessments: ${assessmentResult.error.message}`)
  if (availabilityResult.error) throw new Error(`Could not load availability: ${availabilityResult.error.message}`)
  if (exceptionsResult.error) throw new Error(`Could not load availability exceptions: ${exceptionsResult.error.message}`)
  if (preferenceResult.error) throw new Error(`Could not load planning preferences: ${preferenceResult.error.message}`)
  if (activityResult.error) throw new Error(`Could not load planner activity: ${activityResult.error.message}`)

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
    preferences: ((preferenceResult.data ?? []) as PreferenceRow[]).map(preferenceFromRow),
    activityEvents: ((activityResult.data ?? []) as ActivityEventRow[]).map(activityEventFromRow),
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

export async function savePlanningPreference(
  client: SupabaseClient,
  userId: string,
  value: {
    preferenceType: PlanningPreferenceType
    subjectId?: string
    activityType?: string
    startsOn: string
    endsOn: string
    strength?: 1 | 2 | 3
    source?: PlanningPreferenceSource
    rationale?: string
  },
): Promise<RevisionPlanningPreference> {
  if (value.endsOn < value.startsOn) throw new Error('Preference end date must be on or after its start date.')
  const subjectId = value.subjectId?.trim() || null
  const activityType = value.activityType?.trim() || null
  if (value.preferenceType === 'prefer_activity' && !activityType) throw new Error('Activity preference requires an activity type.')
  if (value.preferenceType !== 'prefer_activity' && !subjectId) throw new Error('Subject preference requires a subject.')

  const { data, error } = await client
    .from('revision_planning_preferences')
    .insert({
      user_id: userId,
      preference_type: value.preferenceType,
      subject_id: subjectId,
      activity_type: activityType,
      starts_on: value.startsOn,
      ends_on: value.endsOn,
      strength: value.strength ?? 1,
      source: value.source ?? 'learner',
      rationale: value.rationale?.trim() || null,
      is_active: true,
    })
    .select('preference_id,user_id,preference_type,subject_id,activity_type,starts_on,ends_on,strength,source,rationale,is_active')
    .single()

  if (error) throw new Error(`Could not save planning preference: ${error.message}`)
  return preferenceFromRow(data as PreferenceRow)
}

export async function recordPlannerActivityEvent(
  client: SupabaseClient,
  userId: string,
  value: {
    recommendationId?: string
    eventType: PlannerActivityEventType
    subjectId: string
    courseId?: string
    moduleId?: string
    topicId?: string
    activityType?: string
    metadata?: Record<string, unknown>
  },
): Promise<RevisionActivityEvent> {
  if (!value.subjectId.trim()) throw new Error('Planner activity subject is required.')
  const { data, error } = await client
    .from('revision_activity_events')
    .insert({
      user_id: userId,
      recommendation_id: value.recommendationId?.trim() || null,
      event_type: value.eventType,
      subject_id: value.subjectId,
      course_id: value.courseId?.trim() || null,
      module_id: value.moduleId?.trim() || null,
      topic_id: value.topicId?.trim() || null,
      activity_type: value.activityType?.trim() || null,
      metadata: value.metadata ?? {},
    })
    .select('event_id,user_id,recommendation_id,event_type,subject_id,course_id,module_id,topic_id,activity_type,occurred_at,metadata')
    .single()

  if (error) throw new Error(`Could not record planner activity: ${error.message}`)
  return activityEventFromRow(data as ActivityEventRow)
}
