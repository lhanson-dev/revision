import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Accepted sessions: sessions the student put on their plan themselves, or from a REV suggestion they accepted.
 * The rest of the plan is derived and never stored. Table: `learner_planned_sessions`
 * (supabase/migrations/20261002060000_add_learner_planned_sessions.sql). Not used by any screen yet.
 */
export type PlannedSessionActivity = 'learn' | 'practice' | 'exam_prep'
export type PlannedSessionAddedBy = 'student' | 'rev'
export type PlannedSessionStatus = 'planned' | 'done' | 'skipped'

export type PlannedSession = {
  sessionId: string
  userId: string
  plannedDate: string
  courseId: string
  topicId: string
  activityType: PlannedSessionActivity
  minutes: number
  addedBy: PlannedSessionAddedBy
  recommendationId: string | null
  status: PlannedSessionStatus
  createdAt: string
  updatedAt: string
}

export type NewPlannedSession = {
  plannedDate: string
  courseId: string
  topicId: string
  activityType: PlannedSessionActivity
  minutes: number
  addedBy: PlannedSessionAddedBy
  recommendationId?: string | null
}

export const PLANNED_SESSION_MIN_MINUTES = 5
export const PLANNED_SESSION_MAX_MINUTES = 240

const columns = 'session_id, user_id, planned_date, course_id, topic_id, activity_type, minutes, added_by, recommendation_id, status, created_at, updated_at'
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/

function sessionFromRow(row: Record<string, unknown>): PlannedSession {
  return {
    sessionId: String(row.session_id ?? ''),
    userId: String(row.user_id ?? ''),
    plannedDate: String(row.planned_date ?? ''),
    courseId: String(row.course_id ?? ''),
    topicId: String(row.topic_id ?? ''),
    activityType: row.activity_type as PlannedSessionActivity,
    minutes: Number(row.minutes ?? 0),
    addedBy: row.added_by as PlannedSessionAddedBy,
    recommendationId: row.recommendation_id === null || row.recommendation_id === undefined ? null : String(row.recommendation_id),
    status: row.status as PlannedSessionStatus,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

function assertDateKey(value: string, label: string) {
  if (!dateKeyPattern.test(value)) throw new Error(`${label} must be a date like 2026-10-08.`)
}

function assertValidSession(session: NewPlannedSession) {
  assertDateKey(session.plannedDate, 'The day')
  if (!session.courseId.trim()) throw new Error('A course is needed to plan a session.')
  if (!session.topicId.trim()) throw new Error('A topic is needed to plan a session.')
  if (!Number.isInteger(session.minutes) || session.minutes < PLANNED_SESSION_MIN_MINUTES || session.minutes > PLANNED_SESSION_MAX_MINUTES) {
    throw new Error(`A session must be between ${PLANNED_SESSION_MIN_MINUTES} and ${PLANNED_SESSION_MAX_MINUTES} minutes.`)
  }
}

/** The student's accepted sessions from `fromDate` to `toDate` inclusive, earliest first. */
export async function loadPlannedSessions(client: SupabaseClient, userId: string, fromDate: string, toDate: string): Promise<PlannedSession[]> {
  assertDateKey(fromDate, 'The start day')
  assertDateKey(toDate, 'The end day')
  const { data, error } = await client
    .from('learner_planned_sessions')
    .select(columns)
    .eq('user_id', userId)
    .gte('planned_date', fromDate)
    .lte('planned_date', toDate)
    .order('planned_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Could not load your planned sessions: ${error.message}`)
  return (data ?? []).map((row) => sessionFromRow(row as Record<string, unknown>))
}

export async function addPlannedSession(client: SupabaseClient, userId: string, session: NewPlannedSession): Promise<PlannedSession> {
  assertValidSession(session)
  const { data, error } = await client
    .from('learner_planned_sessions')
    .insert({
      user_id: userId,
      planned_date: session.plannedDate,
      course_id: session.courseId.trim(),
      topic_id: session.topicId.trim(),
      activity_type: session.activityType,
      minutes: session.minutes,
      added_by: session.addedBy,
      recommendation_id: session.recommendationId ?? null,
    })
    .select(columns)
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('That is already planned for that day.')
    throw new Error(`Could not add that to your plan: ${error.message}`)
  }
  return sessionFromRow(data as Record<string, unknown>)
}

export async function setPlannedSessionStatus(client: SupabaseClient, userId: string, sessionId: string, status: PlannedSessionStatus): Promise<PlannedSession> {
  const { data, error } = await client
    .from('learner_planned_sessions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .select(columns)
    .single()

  if (error) throw new Error(`Could not update that session: ${error.message}`)
  return sessionFromRow(data as Record<string, unknown>)
}

/** "Move it": the same session on another day. */
export async function movePlannedSession(client: SupabaseClient, userId: string, sessionId: string, plannedDate: string): Promise<PlannedSession> {
  assertDateKey(plannedDate, 'The day')
  const { data, error } = await client
    .from('learner_planned_sessions')
    .update({ planned_date: plannedDate, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .select(columns)
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('That is already planned for that day.')
    throw new Error(`Could not move that session: ${error.message}`)
  }
  return sessionFromRow(data as Record<string, unknown>)
}

export async function removePlannedSession(client: SupabaseClient, userId: string, sessionId: string): Promise<void> {
  const { error } = await client
    .from('learner_planned_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (error) throw new Error(`Could not remove that session: ${error.message}`)
}
