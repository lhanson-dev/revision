import type { SupabaseClient } from '@supabase/supabase-js'

export type LearnerPlanTier = 'free' | 'paid' | 'premium'
export type LearnerPlanIntegrity = 'valid' | 'fallback_missing_or_invalid'
export type LearnerCapabilitySet = 'current_core_student_access'

export type LearnerPlanContext = {
  tier: LearnerPlanTier
  capabilitySet: LearnerCapabilitySet
  integrity: LearnerPlanIntegrity
}

const learnerPlanTiers = new Set<LearnerPlanTier>(['free', 'paid', 'premium'])

export function resolveLearnerPlanTier(value: unknown): LearnerPlanContext {
  if (typeof value === 'string' && learnerPlanTiers.has(value as LearnerPlanTier)) {
    return {
      tier: value as LearnerPlanTier,
      capabilitySet: 'current_core_student_access',
      integrity: 'valid',
    }
  }

  return {
    tier: 'free',
    capabilitySet: 'current_core_student_access',
    integrity: 'fallback_missing_or_invalid',
  }
}

export async function loadLearnerPlanContext(
  client: SupabaseClient,
  userId: string,
): Promise<LearnerPlanContext> {
  const { data, error } = await client
    .from('learner_plan_state')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return resolveLearnerPlanTier(undefined)
  return resolveLearnerPlanTier((data as { tier?: unknown }).tier)
}

export function hasCurrentCoreStudentAccess(_context: LearnerPlanContext): true {
  return true
}
