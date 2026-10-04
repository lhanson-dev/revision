import { describe, expect, it } from 'vitest'
import { retainedGenerationFailureFeedback } from './aqa-business-7132-mock-generation'

describe('AQA 7132 mock-generation resume feedback', () => {
  it('turns the retained deterministic failure into targeted first-attempt remediation', () => {
    const failure = 'activity_e_total_float_after_amendment answer 1 is absent from the mark scheme'
    const feedback = retainedGenerationFailureFeedback('P3-01', JSON.stringify({ 'P3-01': failure }))

    expect(feedback).toHaveLength(1)
    expect(feedback[0]).toMatchObject({
      check_id: 'generation_resume_failure',
      category: 'broken_question',
      affected_ids: ['P3-01'],
      disposition: 'blocking',
      evidence: 'retained generation-state deterministic failure',
    })
    expect(feedback[0].finding).toContain(failure)
    expect(feedback[0].proposed_fix).toContain('Repair the recorded deterministic generation failure')
  })

  it('does not leak another slot failure into the current slot', () => {
    const feedback = retainedGenerationFailureFeedback('P3-02', JSON.stringify({ 'P3-01': 'known P3-01 defect' }))
    expect(feedback).toEqual([])
  })

  it('fails closed on malformed retained-failure evidence', () => {
    expect(() => retainedGenerationFailureFeedback('P3-01', '{not-json')).toThrow('mock_generation_resume_failures_invalid_json')
    expect(() => retainedGenerationFailureFeedback('P3-01', JSON.stringify(['not', 'a', 'map']))).toThrow('mock_generation_resume_failures_invalid_shape')
  })
})
