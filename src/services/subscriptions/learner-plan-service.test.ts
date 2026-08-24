import { describe, expect, it } from 'vitest'
import { hasCurrentCoreStudentAccess, resolveLearnerPlanTier } from './learner-plan-service'

describe('learner plan resolution', () => {
  it.each(['free', 'paid', 'premium'] as const)('keeps %s on the temporary full-core capability set', (tier) => {
    const context = resolveLearnerPlanTier(tier)
    expect(context).toEqual({
      tier,
      capabilitySet: 'current_core_student_access',
      integrity: 'valid',
    })
    expect(hasCurrentCoreStudentAccess(context)).toBe(true)
  })

  it('fails safely to Free/full-current-core for missing or invalid plan state', () => {
    const context = resolveLearnerPlanTier('unexpected-tier')
    expect(context).toEqual({
      tier: 'free',
      capabilitySet: 'current_core_student_access',
      integrity: 'fallback_missing_or_invalid',
    })
    expect(hasCurrentCoreStudentAccess(context)).toBe(true)
  })
})
