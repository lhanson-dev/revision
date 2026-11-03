import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { psychologyLegacyIssuesDebatesQuestions } from './course'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { buildQuestionPool, coursePackQuestionToPractice } from '../../../../src/app/practice-questions'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { supportsLearningInference } from '../../../../src/engine/evidence/evidence'
import { legacyIssuesDebatesPool, legacyPsychologyCheckpointPool, loadLf03CompatibleCheckpoint } from '../../../../src/app/practice-checkpoint-compat'
import { startQuestionSession, recordSessionAnswer } from '../../../../src/app/practice-session'
import {
  createPracticeCheckpoint, fingerprintPracticeContent,
  type PracticeCheckpointKey, type PracticeCheckpointRow, type PracticeCheckpointStore,
} from '../../../../src/services/progress/practice-checkpoint-service'
import crosswalk from '../../../../scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'

const packs = [paper1, paper2, paper3]
const topicId = 'issues-and-debates-in-psychology'
const originalIds = [1, 2, 3, 4, 5, 6].map(i => `psy-psy080${i}-check`)
const currentIds = originalIds.map((id, index) => [0, 3].includes(index) ? id + '-v2' : id)
const key: PracticeCheckpointKey = {
  userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  courseId: 'aqa:aqa-a-level:7182',
  moduleId: paper1.manifest.id,
  topicId,
}
function memoryStore(): PracticeCheckpointStore {
  let saved: PracticeCheckpointRow | null = null
  return {
    async read() { return { data: saved, error: null } },
    async insert(record) { saved = record; return { data: record, error: null } },
    async compareAndSwap() { return { data: null, error: { message: 'not used' } } },
    async remove() { return { data: [], error: null } },
  }
}
describe('#698/#787 Issues and Debates V2 candidate — 7182 §4.3.1', () => {
  it('has exact source rights, six source bullet checkpoints and two narrowly changed published question identities', () => {
    expect(crosswalk.qualification.pdfSha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(crosswalk.qualification.rights).toBe('REFERENCE_ONLY')
    expect(crosswalk.rows.filter(row => row.sourceSection === '4.3.1')).toHaveLength(6)
    expect(psychologyLegacyIssuesDebatesQuestions.map(q => q.id)).toEqual(originalIds)
    for (const pack of packs) {
      const questions = pack.questions.filter(q => q.topic === topicId)
      expect(questions.map(q => q.id)).toEqual(currentIds)
      expect(questions[0]?.correctOption).toBe(1)
      expect(questions[3]?.correctOption).toBe(3)
      expect(questions[0]?.prompt).toContain('university students')
      expect(questions[3]?.prompt).toContain('neurotransmitter')
      expect(questions.filter(q => q.id.endsWith('-v2')).every(q => q.explanation.length > 180)).toBe(true)
      expect(reviewMcqQuality(questions.filter(q => q.id.endsWith('-v2'))).filter(f =>
        f.disposition === 'block' || ['repeated-option-set','generic-feedback'].includes(f.rule))).toEqual([])
      // Existence and key checks do not replace independent key, distractor or educational A3 review.
      const pool = buildQuestionPool({topicId, topicOrder: 8, coursePack: questions, bank: pack.practiceBank})
      expect(pool.map(q => q.id)).toEqual(currentIds)
    }
  })
  it('preserves old source keys and does not reinterpret historical answers as new ones', () => {
    const old = psychologyLegacyIssuesDebatesQuestions.filter(q => [originalIds[0], originalIds[3]].includes(q.id))
    expect(old).toHaveLength(2)
    expect(new Set(old.map(q => [...q.options].sort().join('|'))).size).toBe(1)
    for (const i of [0, 3]) {
      const historical = createMultipleChoiceEvidence({
        id: 'old-' + i, moduleId: key.moduleId, topicId,
        contentId: originalIds[i]!, selectedOption: old.find(q => q.id === originalIds[i])!.correctOption,
        correctOption: old.find(q => q.id === originalIds[i])!.correctOption,
        confidence: 'certain',
      })
      expect(historical).toMatchObject({ source: 'multiple_choice', correct: true, contentId: originalIds[i] })
      expect(supportsLearningInference(historical)).toBe(false)
      const replacement = createMultipleChoiceEvidence({
        id: 'new-' + i, moduleId: key.moduleId, topicId,
        contentId: currentIds[i]!, selectedOption: i === 0 ? 1 : 3,
        correctOption: i === 0 ? 1 : 3, confidence: 'certain',
      })
      expect(supportsLearningInference(replacement)).toBe(true)
      expect(supportsLearningInference(createMultipleChoiceEvidence({
        id: 'other-course-' + i, moduleId: 'business-aqa-a-level-7132-paper-1',
        topicId, contentId: originalIds[i]!, selectedOption: 0, correctOption: 0,
      }))).toBe(true)
    }
  })
  it('recovers exact six-question old checkpoint only, and fails closed on unrelated drift', async () => {
    const published = paper1.questions.filter(q => q.topic === topicId).map(coursePackQuestionToPractice)
    const legacy = legacyIssuesDebatesPool('7182', topicId, published)
    expect(legacy?.map(q => q.id)).toEqual(originalIds)
    expect(legacyPsychologyCheckpointPool('7182', topicId, published)).toEqual(legacy)
    expect(legacyIssuesDebatesPool('7132', topicId, published)).toBeNull()
    expect(legacyIssuesDebatesPool('7182', 'memory', published)).toBeNull()
    expect(legacyIssuesDebatesPool('7182', topicId, published.slice(1))).toBeNull()
    const oldSession = recordSessionAnswer(startQuestionSession(legacy!, 6), {
      questionId: originalIds[0]!, correct: false, level: legacy![0]!.level,
      selectedOption: 0, confidence: 'certain',
    })
    const store = memoryStore()
    await createPracticeCheckpoint(store, key, await fingerprintPracticeContent(legacy!), crypto.randomUUID(), {
      schemaVersion: 1, session: oldSession, pending: null,
    })
    const recovered = await loadLf03CompatibleCheckpoint(store, key, published, legacy)
    expect(recovered.legacy).toBe(true)
    expect(recovered.checkpoint?.snapshot.session).toEqual(oldSession)
    expect(recovered.checkpoint?.snapshot.session.answers[0]).toMatchObject({questionId: originalIds[0], selectedOption: 0, correct: false})
    const unrelated = memoryStore()
    await createPracticeCheckpoint(unrelated, key, 'd'.repeat(64), crypto.randomUUID(), {
      schemaVersion: 1, session: oldSession, pending: null,
    })
    await expect(loadLf03CompatibleCheckpoint(unrelated, key, published, legacy)).rejects.toThrow(/content changed/)
  })
})
