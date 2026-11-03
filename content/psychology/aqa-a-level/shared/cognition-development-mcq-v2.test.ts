import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { psychologyLegacyCognitionDevelopmentQuestions } from './course'
import { cognitionDevelopmentMcqV2 } from './cognition-development-mcq-v2'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { coursePackQuestionToPractice } from '../../../../src/app/practice-questions'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { supportsLearningInference } from '../../../../src/engine/evidence/evidence'
import { legacyCognitionDevelopmentPool, legacyPsychologyCheckpointPool, loadLf03CompatibleCheckpoint } from '../../../../src/app/practice-checkpoint-compat'
import {
  createPracticeCheckpoint, fingerprintPracticeContent,
  type PracticeCheckpointKey, type PracticeCheckpointRow, type PracticeCheckpointStore,
} from '../../../../src/services/progress/practice-checkpoint-service'
import crosswalk from '../../../../scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'

const topic = 'cognition-and-development'
const oldIds = [1, 2, 3, 4].map(i => `psy-psy110${i}-check`)
const newIds = oldIds.map(id => id + '-v2')
const correct = [2, 0, 3, 1]
const key: PracticeCheckpointKey = {
  userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  courseId: 'aqa:aqa-a-level:7182', moduleId: paper1.manifest.id, topicId: topic,
}
function store(): PracticeCheckpointStore {
  let row: PracticeCheckpointRow | null = null
  return {
    async read() { return { data: row, error: null } },
    async insert(next) { row = next; return { data: next, error: null } },
    async compareAndSwap() { return { data: null, error: { message: 'unused' } } },
    async remove() { return { data: [], error: null } },
  }
}
describe('#698 Psychology §4.3.4 source-grounded Cognition and Development V2', () => {
  it('keeps four source checkpoints and publishes four independently targeted, versioned one-mark choices in all three packs', () => {
    expect(crosswalk.qualification.pdfSha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(crosswalk.qualification.rights).toBe('REFERENCE_ONLY')
    expect(crosswalk.rows.filter(row => row.sourceSection === '4.3.4')).toHaveLength(4)
    expect(Object.keys(cognitionDevelopmentMcqV2)).toEqual(['PSY-11-01', 'PSY-11-02', 'PSY-11-03', 'PSY-11-04'])
    expect(psychologyLegacyCognitionDevelopmentQuestions.map(q => q.id)).toEqual(oldIds)
    for (const pack of [paper1, paper2, paper3]) {
      const rows = pack.questions.filter(q => q.topic === topic)
      expect(rows.map(q => q.id)).toEqual(newIds)
      expect(rows.map(q => q.correctOption)).toEqual(correct)
      expect(rows[0]?.prompt).toContain('water')
      expect(rows[1]?.prompt).toContain('hints')
      expect(rows[2]?.prompt).toContain('looking-time')
      expect(rows[3]?.prompt).toContain('Sally')
      expect(rows.every(q => q.explanation.length > 220)).toBe(true)
    }
  })
  it('detects the former four-identical-option pattern but no repeated V2 option sets or invalid keys', () => {
    expect(new Set(psychologyLegacyCognitionDevelopmentQuestions.map(q => [...q.options].sort().join('|'))).size).toBe(1)
    const current = paper1.questions.filter(q => q.topic === topic)
    expect(new Set(current.map(q => [...q.options].sort().join('|'))).size).toBe(4)
    expect(reviewMcqQuality(current).filter(f => f.disposition === 'block' ||
      ['repeated-option-set', 'generic-feedback', 'answer-position-run', 'answer-position-bias'].includes(f.rule))).toEqual([])
  })
  it('retains old scored marks without promoting retired generic V1 items to new inferred readiness', () => {
    oldIds.forEach((contentId, i) => {
      const evidence = createMultipleChoiceEvidence({
        id: 'old-' + i, moduleId: key.moduleId, topicId: topic, contentId,
        selectedOption: psychologyLegacyCognitionDevelopmentQuestions[i]!.correctOption,
        correctOption: psychologyLegacyCognitionDevelopmentQuestions[i]!.correctOption,
        confidence: 'certain',
      })
      expect(evidence).toMatchObject({ source: 'multiple_choice', correct: true })
      expect(supportsLearningInference(evidence)).toBe(false)
      const newEvidence = createMultipleChoiceEvidence({
        id: 'new-' + i, moduleId: key.moduleId, topicId: topic, contentId: newIds[i]!,
        selectedOption: correct[i]!, correctOption: correct[i]!, confidence: 'certain',
      })
      expect(supportsLearningInference(newEvidence)).toBe(true)
    })
  })
  it('recovers only the exact old four-item checkpoint fingerprint and rejects unknown fingerprints', async () => {
    const published = paper1.questions.filter(q => q.topic === topic).map(coursePackQuestionToPractice)
    const legacy = legacyCognitionDevelopmentPool('7182', topic, published)
    expect(legacy?.map(q => q.id)).toEqual(oldIds)
    expect(legacyPsychologyCheckpointPool('7182', topic, published)).toEqual(legacy)
    expect(legacyCognitionDevelopmentPool('7132', topic, published)).toBeNull()
    expect(legacyCognitionDevelopmentPool('7182', 'memory', published)).toBeNull()
    expect(legacyCognitionDevelopmentPool('7182', topic, published.slice(1))).toBeNull()
    const snapshot = {
      schemaVersion: 1 as const,
      session: {
        // Use an actual session starter so saved snapshot conforms to runtime schema.
        ...((await import('../../../../src/app/practice-session')).startQuestionSession(legacy!, 4)),
      },
      pending: null,
    }
    const saved = store()
    await createPracticeCheckpoint(saved, key, await fingerprintPracticeContent(legacy!), '12345678-1234-4234-8234-123456789012', snapshot)
    const recovered = await loadLf03CompatibleCheckpoint(saved, key, published, legacy)
    expect(recovered.legacy).toBe(true)
    expect(recovered.checkpoint?.snapshot).toEqual(snapshot)
    const unknown = store()
    await createPracticeCheckpoint(unknown, key, 'f'.repeat(64), '12345678-1234-4234-8234-123456789012', snapshot)
    await expect(loadLf03CompatibleCheckpoint(unknown, key, published, legacy)).rejects.toThrow(/content changed/)
  })
})
