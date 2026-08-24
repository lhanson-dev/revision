import type { SupabaseClient } from '@supabase/supabase-js'

export type PrimaryExperience = 'student'
export type FirstUseStage = 'course' | 'course_ready' | 'starting_check' | 'recommendation' | 'activity' | 'feedback' | 'complete'

export type AccountExperienceState = {
  userId: string
  primaryExperience: PrimaryExperience
  onboardingStage: FirstUseStage
  onboardingCompletedAt: string | null
  createdAt: string
  updatedAt: string
}

export type FirstUseEventType =
  | 'onboarding_started'
  | 'account_type_viewed'
  | 'student_selected'
  | 'first_course_setup_viewed'
  | 'first_course_added'
  | 'starting_check_offered'
  | 'starting_check_started'
  | 'starting_check_completed'
  | 'starting_check_partial'
  | 'starting_check_skipped'
  | 'recommendation_shown'
  | 'recommendation_accepted'
  | 'recommendation_overridden'
  | 'first_activity_started'
  | 'first_activity_completed'
  | 'feedback_viewed'
  | 'onboarding_completed'
  | 'onboarding_error'
  | 'onboarding_resumed'

type AccountExperienceRow = {
  user_id: string
  primary_experience: string
  onboarding_stage: string
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

function stateFromRow(row: AccountExperienceRow): AccountExperienceState {
  if (row.primary_experience !== 'student') throw new Error('This account experience is not available yet.')
  const stages: FirstUseStage[] = ['course', 'course_ready', 'starting_check', 'recommendation', 'activity', 'feedback', 'complete']
  if (!stages.includes(row.onboarding_stage as FirstUseStage)) throw new Error('This account has an unsupported onboarding state.')
  return {
    userId: row.user_id,
    primaryExperience: 'student',
    onboardingStage: row.onboarding_stage as FirstUseStage,
    onboardingCompletedAt: row.onboarding_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function loadAccountExperienceState(
  client: SupabaseClient,
  userId: string,
): Promise<AccountExperienceState | null> {
  const { data, error } = await client
    .from('account_experience_state')
    .select('user_id, primary_experience, onboarding_stage, onboarding_completed_at, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Could not load your Revision setup: ${error.message}`)
  return data ? stateFromRow(data as AccountExperienceRow) : null
}

export async function establishStudentExperience(
  client: SupabaseClient,
  userId: string,
): Promise<AccountExperienceState> {
  const now = new Date().toISOString()
  const { data, error } = await client
    .from('account_experience_state')
    .insert({
      user_id: userId,
      primary_experience: 'student',
      onboarding_stage: 'course',
      onboarding_completed_at: null,
      updated_at: now,
    })
    .select('user_id, primary_experience, onboarding_stage, onboarding_completed_at, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      const existing = await loadAccountExperienceState(client, userId)
      if (existing) return existing
    }
    throw new Error(`Could not save your Student experience: ${error.message}`)
  }
  return stateFromRow(data as AccountExperienceRow)
}

export async function setFirstUseStage(
  client: SupabaseClient,
  userId: string,
  onboardingStage: Exclude<FirstUseStage, 'complete'>,
): Promise<AccountExperienceState> {
  const { data, error } = await client
    .from('account_experience_state')
    .update({ onboarding_stage: onboardingStage, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('user_id, primary_experience, onboarding_stage, onboarding_completed_at, created_at, updated_at')
    .single()

  if (error) throw new Error(`Could not save your Revision setup: ${error.message}`)
  return stateFromRow(data as AccountExperienceRow)
}

export async function completeStudentFirstUse(
  client: SupabaseClient,
  userId: string,
): Promise<AccountExperienceState> {
  const completedAt = new Date().toISOString()
  const { data, error } = await client
    .from('account_experience_state')
    .update({ onboarding_stage: 'complete', onboarding_completed_at: completedAt, updated_at: completedAt })
    .eq('user_id', userId)
    .select('user_id, primary_experience, onboarding_stage, onboarding_completed_at, created_at, updated_at')
    .single()

  if (error) throw new Error(`Could not finish your Revision setup: ${error.message}`)
  return stateFromRow(data as AccountExperienceRow)
}

export async function recordFirstUseEvent(
  client: SupabaseClient,
  userId: string,
  eventType: FirstUseEventType,
  courseId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await client
    .from('student_first_use_events')
    .insert({ user_id: userId, event_type: eventType, course_id: courseId ?? null, metadata })
  if (error) throw new Error(`Could not record onboarding activity: ${error.message}`)
}

export async function recordFirstUseEventBestEffort(
  client: SupabaseClient,
  userId: string,
  eventType: FirstUseEventType,
  courseId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await recordFirstUseEvent(client, userId, eventType, courseId, metadata)
  } catch {
    // Funnel telemetry must never block the Student reaching useful revision.
  }
}
