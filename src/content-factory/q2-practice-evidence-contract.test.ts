import { describe, expect, it } from 'vitest'
import {
  providerPracticeTeachingPointEvidenceSchema,
  resolvePracticeCoverageEvidence,
} from './provider-coverage-evidence'
import { validateTeachingPointEvidence } from './teaching-point-integrity'

const modes = ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'] as const
const fields = ['prompt', 'expectedResponse', 'explanation', 'improvementAction'] as const

function activity(mode: string) {
  return {
    prompt: `${mode} prompt with a quoted "value" and a second line\nfor exact evidence testing.`,
    expectedResponse: `${mode} expected response with enough detail for audit.`,
    explanation: `${mode} explanation connecting the answer to the teaching point.`,
    improvementAction: `${mode} improvement action that tells the learner what to change.`,
  }
}

describe('Q2 provider-free Practice evidence contract', () => {
  it('resolves every supported Practice mode and evidence field to the exact generated string', () => {
    const activitiesByMode = Object.fromEntries(modes.map((mode) => [mode, [activity(mode)]]))

    for (const mode of modes) {
      for (const field of fields) {
        const teachingPoint = `${mode}-${field}`
        const evidence = providerPracticeTeachingPointEvidenceSchema.parse({
          teachingPoint,
          location: { mode, activityIndex: 1, field },
        })
        const resolved = resolvePracticeCoverageEvidence([evidence], { activitiesByMode })
        const expected = activity(mode)[field]

        expect(resolved).toEqual([{ teachingPoint, evidence: expected }])
        expect(validateTeachingPointEvidence({
          requiredTeachingPoints: [teachingPoint],
          evidence: resolved,
          searchableContent: { activities: [{ mode, ...activity(mode) }] },
          artifactLabel: `Practice ${mode}`,
        })).toEqual(resolved)
      }
    }
  })

  it('fails closed for invalid bounded locations rather than guessing or fuzzy matching', () => {
    const activitiesByMode = { retrieval: [activity('retrieval')] }

    expect(() => resolvePracticeCoverageEvidence([{
      teachingPoint: 'retrieval-point',
      location: { mode: 'retrieval', activityIndex: 2, field: 'prompt' },
    }], { activitiesByMode })).toThrow(/missing retrieval activity 2/)

    expect(() => providerPracticeTeachingPointEvidenceSchema.parse({
      teachingPoint: 'retrieval-point',
      location: { mode: 'essay', activityIndex: 1, field: 'prompt' },
    })).toThrow()

    expect(() => providerPracticeTeachingPointEvidenceSchema.parse({
      teachingPoint: 'retrieval-point',
      location: { mode: 'retrieval', activityIndex: 1, field: 'answer' },
    })).toThrow()
  })

  it('rejects paraphrased evidence even when it has similar meaning', () => {
    const exact = activity('application').explanation
    expect(() => validateTeachingPointEvidence({
      requiredTeachingPoints: ['application-point'],
      evidence: [{
        teachingPoint: 'application-point',
        evidence: 'Application explanation links the answer to the concept.',
      }],
      searchableContent: { explanation: exact },
      artifactLabel: 'Practice application',
    })).toThrow(/not an exact excerpt/)
  })
})
