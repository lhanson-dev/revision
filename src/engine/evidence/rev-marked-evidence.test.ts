import { describe, expect, it } from 'vitest'
import { evidencePercentage, learningEvidenceSchema, withoutSuperseded, type LearningEvidence } from './evidence'
import { assessReadiness } from '../readiness/readiness'
import { assessTopicKnowledge } from '../knowledge/topic-knowledge'
import { createRevMarkedExamQuestionEvidence } from '../../app/practice-evidence'
import { toLearningEvidenceRecord } from '../../services/progress/evidence-record'

const base = { moduleId: 'business-aqa-a-level', topicId: 'finance', contentId: 'aqa7132-3.5-q01', marksAvailable: 4, aoTags: ['AO2'] }
const marked = (id: string, over: Partial<Parameters<typeof createRevMarkedExamQuestionEvidence>[0]> = {}) =>
  createRevMarkedExamQuestionEvidence({ ...base, id, marksAwarded: 3, pointsGiven: [true, true, true, false], modelVersion: 'marker-test-1', occurredAt: '2026-10-06T10:00:00.000Z', ...over })

/** The evidence contract for written answers marked by REV (Practice v2.2). No database migration: source stays exam_question, new fields live in the payload. */
describe('REV-marked written answer evidence', () => {
  it('is an exam_question marked rev_assessed, schema version 2, with the model version and mark points', () => {
    const evidence = marked('e1')
    expect(learningEvidenceSchema.parse(evidence)).toEqual(evidence)
    expect(evidence).toMatchObject({ source: 'exam_question', markingMethod: 'rev_assessed', schemaVersion: 2, marksAwarded: 3, marksAvailable: 4 })
    expect((evidence as { revMarking: { modelVersion: string } }).revMarking.modelVersion).toBe('marker-test-1')
    expect(evidencePercentage(evidence)).toBe(75)
    expect(JSON.stringify(evidence)).not.toMatch(/answerText|"answer"/)
  })

  it('is stored in the existing table shape with the version column at 2', () => {
    const record = toLearningEvidenceRecord('user-1', marked('e2'))
    expect(record.source).toBe('exam_question')
    expect(record.schema_version).toBe(2)
  })

  it('puts the marks under the question’s AO when it has one, and leaves the split unknown when it has several', () => {
    expect((marked('e3') as { assessmentObjectives: unknown }).assessmentObjectives).toEqual({ ao2: { awarded: 3, available: 4 } })
    expect((marked('e4', { aoTags: ['AO1', 'AO2', 'AO3'] }) as { assessmentObjectives: unknown }).assessmentObjectives).toEqual({})
  })

  it('records a challenge with its text and outcome on a row that replaces the earlier one', () => {
    const challenged = marked('e5', {
      marksAwarded: 4,
      pointsGiven: [true, true, true, true],
      supersedes: 'e1',
      challenge: { text: 'I did link it to the café in my last line.', outcome: 'changed', modelVersion: 'marker-test-1' },
    })
    expect(learningEvidenceSchema.parse(challenged)).toEqual(challenged)
  })

  it('rejects inconsistent rows', () => {
    const good = marked('e6') as Record<string, unknown>
    expect(learningEvidenceSchema.safeParse({ ...good, revMarking: undefined }).success).toBe(false) // rev_assessed without revMarking
    expect(learningEvidenceSchema.safeParse({ ...good, schemaVersion: 1 }).success).toBe(false)
    expect(learningEvidenceSchema.safeParse({ ...good, markingMethod: 'self_assessed' }).success).toBe(false) // revMarking on another method
    expect(learningEvidenceSchema.safeParse({ ...good, revMarking: { ...(good.revMarking as object), challenge: { text: 'why', outcome: 'changed', modelVersion: 'm' } } }).success).toBe(false) // challenge without supersedes
    expect(learningEvidenceSchema.safeParse({ ...good, revMarking: { modelVersion: '', pointsGiven: [true] } }).success).toBe(false)
    expect(learningEvidenceSchema.safeParse({ ...good, revMarking: { modelVersion: 'm', pointsGiven: [] } }).success).toBe(false)
    expect(learningEvidenceSchema.safeParse({ ...good, supersedesEvidenceId: 'e0', markingMethod: 'self_assessed', revMarking: undefined }).success).toBe(false)
  })

  it('still accepts version 1 exam evidence from self-marking', () => {
    const selfMarked = { id: 'x', moduleId: base.moduleId, topicId: 'finance', occurredAt: '2026-10-06T10:00:00.000Z', contentId: 'c', schemaVersion: 1, source: 'exam_question', markingMethod: 'self_assessed', marksAwarded: 2, marksAvailable: 4, assessmentObjectives: {} }
    expect(learningEvidenceSchema.parse(selfMarked)).toEqual(selfMarked)
  })
})

describe('what REV-marked evidence changes in the engine', () => {
  it('counts a challenged answer once: the replacing row stands and the earlier row stays in the record', () => {
    const first = marked('e1')
    const second = marked('e2', { marksAwarded: 4, pointsGiven: [true, true, true, true], supersedes: 'e1', challenge: { text: 'See my last line.', outcome: 'changed', modelVersion: 'marker-test-1' }, occurredAt: '2026-10-06T10:05:00.000Z' })
    expect(withoutSuperseded([first, second]).map((item) => item.id)).toEqual(['e2'])
    expect(assessReadiness([first, second]).evidenceCount).toBe(1)
    const many: LearningEvidence[] = [first, second]
    expect(assessTopicKnowledge(base.moduleId, 'finance', many).distinctContentItems).toBe(1)
  })

  it('is capped like self-marking: never counts as independently marked, so confidence cannot be high', () => {
    const written = Array.from({ length: 6 }, (_, index) => marked(`m${index}`, { contentId: `c${index}`, occurredAt: '2026-10-05T10:00:00.000Z' }))
    const questions: LearningEvidence[] = Array.from({ length: 6 }, (_, index) => ({ id: `q${index}`, moduleId: base.moduleId, topicId: 'finance', occurredAt: '2026-10-05T10:00:00.000Z', contentId: `mc${index}`, schemaVersion: 1 as const, source: 'multiple_choice' as const, correct: true, selectedOption: 0, correctOption: 0 }))
    const items: LearningEvidence[] = [...written, ...questions]
    const result = assessReadiness(items, new Date('2026-10-06T10:00:00.000Z'))
    expect(result.confidence).not.toBe('high')
    expect(result.explanation).toContain('marked by REV')
  })
})
