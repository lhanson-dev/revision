import { describe, expect, it } from 'vitest'
import { GUESSED_RIGHT_PERCENTAGE, evidencePercentage, learningEvidenceSchema, type LearningEvidence } from './evidence'
import { recommendNextActivity, unresolvedConfidentMisses } from '../readiness/readiness'
import { toLearningEvidenceRecord } from '../../services/progress/evidence-record'
import { createMultipleChoiceEvidence } from '../../app/practice-evidence'

const base = {
  id: 'e1',
  moduleId: 'business-aqa-a-level',
  topicId: 'finance',
  occurredAt: '2026-10-06T10:00:00.000Z',
  contentId: 'fp:3.5:q01',
  source: 'multiple_choice' as const,
  selectedOption: 1,
  correctOption: 1,
}

/** The evidence contract for "How sure are you?" (Practice v2.2). No database migration: `payload` is jsonb and `schema_version` accepts any value above 0. */
describe('multiple choice evidence with confidence (schema version 2)', () => {
  it('still accepts version 1 evidence with no confidence', () => {
    const old = { ...base, schemaVersion: 1, correct: true }
    expect(learningEvidenceSchema.parse(old)).toEqual(old)
  })

  it('accepts version 2 evidence that carries each confidence level', () => {
    for (const confidence of ['guess', 'fairly', 'certain'] as const) {
      const evidence = { ...base, schemaVersion: 2, correct: true, confidence }
      expect(learningEvidenceSchema.parse(evidence)).toEqual(evidence)
    }
  })

  it('rejects confidence on version 1, an unknown level, and an unknown version', () => {
    expect(learningEvidenceSchema.safeParse({ ...base, schemaVersion: 1, correct: true, confidence: 'certain' }).success).toBe(false)
    expect(learningEvidenceSchema.safeParse({ ...base, schemaVersion: 2, correct: true, confidence: 'sure' }).success).toBe(false)
    expect(learningEvidenceSchema.safeParse({ ...base, schemaVersion: 3, correct: true }).success).toBe(false)
  })

  it('is stored in the existing table shape: payload carries confidence and the version column says 2', () => {
    const evidence = createMultipleChoiceEvidence({ id: 'e2', moduleId: base.moduleId, topicId: base.topicId, contentId: base.contentId, selectedOption: 1, correctOption: 1, confidence: 'fairly' })
    const record = toLearningEvidenceRecord('user-1', evidence)
    expect(record.schema_version).toBe(2)
    expect(record.source).toBe('multiple_choice')
    expect(record.payload).toMatchObject({ confidence: 'fairly', schemaVersion: 2 })
  })

  it('records version 1 when no confidence is given', () => {
    const evidence = createMultipleChoiceEvidence({ id: 'e3', moduleId: base.moduleId, topicId: base.topicId, contentId: base.contentId, selectedOption: 0, correctOption: 1 })
    expect(evidence.schemaVersion).toBe(1)
    expect('confidence' in evidence).toBe(false)
  })
})

describe('what confidence changes in the existing engine', () => {
  const right = (confidence?: 'guess' | 'fairly' | 'certain'): LearningEvidence => learningEvidenceSchema.parse({ ...base, schemaVersion: confidence ? 2 : 1, correct: true, ...(confidence ? { confidence } : {}) })

  it('a right answer that was a guess is weaker evidence than a right answer the student was sure of', () => {
    expect(evidencePercentage(right('guess'))).toBe(GUESSED_RIGHT_PERCENTAGE)
    expect(evidencePercentage(right('fairly'))).toBe(100)
    expect(evidencePercentage(right('certain'))).toBe(100)
    expect(evidencePercentage(right())).toBe(100)
    expect(GUESSED_RIGHT_PERCENTAGE).toBeLessThan(100)
  })

  it('a wrong answer is zero whatever the confidence; the certain miss counts as a stronger gap through the recommendation', () => {
    const wrong = (confidence: 'guess' | 'certain', id: string, contentId: string) => learningEvidenceSchema.parse({ ...base, id, contentId, schemaVersion: 2, correct: false, selectedOption: 0, confidence })
    expect(evidencePercentage(wrong('certain', 'a', 'c1'))).toBe(0)
    expect(evidencePercentage(wrong('guess', 'b', 'c2'))).toBe(0)
    expect(unresolvedConfidentMisses([wrong('certain', 'a', 'c1'), wrong('guess', 'b', 'c2')])).toEqual(['c1'])
  })

  it('a confident miss stops counting once the student answers that question correctly', () => {
    const miss = learningEvidenceSchema.parse({ ...base, id: 'm1', schemaVersion: 2, correct: false, selectedOption: 0, confidence: 'certain', occurredAt: '2026-10-06T10:00:00.000Z' })
    const fixed = learningEvidenceSchema.parse({ ...base, id: 'm2', schemaVersion: 2, correct: true, confidence: 'fairly', occurredAt: '2026-10-06T10:05:00.000Z' })
    expect(unresolvedConfidentMisses([miss])).toHaveLength(1)
    expect(unresolvedConfidentMisses([miss, fixed])).toHaveLength(0)
  })

  it('recommends the topic with a confident miss first, and says why', () => {
    const miss = learningEvidenceSchema.parse({ ...base, topicId: 'marketing', schemaVersion: 2, correct: false, selectedOption: 0, confidence: 'certain' })
    // Finance has no evidence at all, which would normally come first.
    const recommendation = recommendNextActivity(base.moduleId, ['finance', 'marketing'], [miss])
    expect(recommendation?.topicId).toBe('marketing')
    expect(recommendation?.reason).toContain('certain')
  })
})

describe('calculation evidence (Practice v2.2, calculations)', () => {
  const calc = {
    id: 'c1', moduleId: 'business-aqa-a-level', topicId: 'finance', occurredAt: '2026-10-06T10:00:00.000Z', contentId: 'aqa7132-3.3-q01',
    schemaVersion: 2 as const, source: 'calculation' as const, correct: true, enteredValue: 24.2, expectedValue: 24.2, unit: '£m',
  }

  it('accepts a calculation with or without confidence, and nothing but version 2', () => {
    expect(learningEvidenceSchema.parse(calc)).toEqual(calc)
    expect(learningEvidenceSchema.parse({ ...calc, confidence: 'certain' })).toEqual({ ...calc, confidence: 'certain' })
    expect(() => learningEvidenceSchema.parse({ ...calc, schemaVersion: 1 })).toThrow()
    expect(() => learningEvidenceSchema.parse({ ...calc, enteredValue: Number.NaN })).toThrow()
  })

  it('scores like a quick check: right is 100, a right guess is 50, wrong is 0', () => {
    expect(evidencePercentage(calc)).toBe(100)
    expect(evidencePercentage({ ...calc, confidence: 'guess' })).toBe(GUESSED_RIGHT_PERCENTAGE)
    expect(evidencePercentage({ ...calc, correct: false })).toBe(0)
  })

  it('saves as a calculation row that the database accepts', () => {
    const record = toLearningEvidenceRecord('user-1', calc as LearningEvidence)
    expect(record.source).toBe('calculation')
    expect(record.schema_version).toBe(2)
  })

  it('counts a certain wrong calculation as an unresolved confident miss until it is answered right', () => {
    const wrong = { ...calc, correct: false, confidence: 'certain' as const }
    expect(unresolvedConfidentMisses([wrong])).toEqual(['aqa7132-3.3-q01'])
    expect(unresolvedConfidentMisses([wrong, { ...calc, id: 'c2', occurredAt: '2026-10-06T11:00:00.000Z' }])).toEqual([])
  })
})

