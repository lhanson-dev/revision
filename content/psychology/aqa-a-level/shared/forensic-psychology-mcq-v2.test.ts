import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { psychologyLegacyForensicQuestions } from './course'
import { forensicPsychologyMcqV2 } from './forensic-psychology-mcq-v2'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { coursePackQuestionToPractice } from '../../../../src/app/practice-questions'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { startQuestionSession, recordSessionAnswer } from '../../../../src/app/practice-session'
import { supportsLearningInference } from '../../../../src/engine/evidence/evidence'
import { legacyForensicPool, legacyPsychologyCheckpointPool, loadLf03CompatibleCheckpoint } from '../../../../src/app/practice-checkpoint-compat'
import {
  createPracticeCheckpoint, fingerprintPracticeContent,
  type PracticeCheckpointKey, type PracticeCheckpointRow, type PracticeCheckpointStore,
} from '../../../../src/services/progress/practice-checkpoint-service'
import crosswalk from '../../../../scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'

const topic = 'forensic-psychology'
const oldIds = [1, 2, 3, 4].map(i => `psy-psy160${i}-check`)
const newIds = oldIds.map(id => id + '-v2')
const keys = [1, 3, 0, 2]
const k: PracticeCheckpointKey = {
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

describe('#787 Psychology §4.3.9 Forensic Psychology V2 — source and evidence safety', () => {
  it('maps four official source bullets to four distinct scenario checks, retaining the option-3 topic route', () => {
    expect(crosswalk.qualification.pdfSha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(crosswalk.qualification.rights).toBe('REFERENCE_ONLY')
    expect(crosswalk.rows.filter(row => row.sourceSection === '4.3.9')).toHaveLength(4)
    expect(Object.keys(forensicPsychologyMcqV2)).toEqual(['PSY-16-01', 'PSY-16-02', 'PSY-16-03', 'PSY-16-04'])
    expect(psychologyLegacyForensicQuestions.map(q => q.id)).toEqual(oldIds)
    for (const pack of [paper1, paper2, paper3]) {
      const rows = pack.questions.filter(q => q.topic === topic)
      expect(rows.map(q => q.id)).toEqual(newIds)
      expect(rows.map(q => q.correctOption)).toEqual(keys)
      expect(rows[0]?.prompt).toContain('spatial distribution')
      expect(rows[1]?.prompt).toContain('inherited characteristics')
      expect(rows[2]?.prompt).toContain('queue')
      expect(rows[3]?.prompt).toContain('freely agree')
      expect(rows.every(q => q.explanation.length > 220)).toBe(true)
      expect(rows.every(q => new Set(q.options).size === 4)).toBe(true)
    }
  })
  it('removes repeated V1 option multisets without mistaking automated heuristics for educational A3', () => {
    expect(new Set(psychologyLegacyForensicQuestions.map(q => [...q.options].sort().join('|'))).size).toBe(1)
    const current = paper1.questions.filter(q => q.topic === topic)
    expect(new Set(current.map(q => [...q.options].sort().join('|'))).size).toBe(4)
    expect(reviewMcqQuality(current).filter(f => f.disposition === 'block' ||
      ['repeated-option-set', 'generic-feedback', 'answer-position-run', 'answer-position-bias'].includes(f.rule))).toEqual([])
  })
  it('keeps previous marks but excludes unreliable four V1 answer-pattern outcomes from future inferred mastery', () => {
    oldIds.forEach((contentId, i) => {
      const old = psychologyLegacyForensicQuestions[i]!
      const evidence = createMultipleChoiceEvidence({
        id: 'old-' + i, moduleId: k.moduleId, topicId: topic, contentId,
        selectedOption: old.correctOption, correctOption: old.correctOption, confidence: 'certain',
      })
      expect(evidence).toMatchObject({ source: 'multiple_choice', correct: true, contentId })
      expect(supportsLearningInference(evidence)).toBe(false)
      const current = createMultipleChoiceEvidence({
        id: 'new-' + i, moduleId: k.moduleId, topicId: topic, contentId: newIds[i]!,
        selectedOption: keys[i]!, correctOption: keys[i]!, confidence: 'certain',
      })
      expect(supportsLearningInference(current)).toBe(true)
    })
  })
  it('recovers only exact old saved content fingerprint and never guesses what an unknown student answered', async () => {
    const published = paper1.questions.filter(q => q.topic === topic).map(coursePackQuestionToPractice)
    const legacy = legacyForensicPool('7182', topic, published)
    expect(legacy?.map(q => q.id)).toEqual(oldIds)
    expect(legacyPsychologyCheckpointPool('7182', topic, published)).toEqual(legacy)
    expect(legacyForensicPool('7132', topic, published)).toBeNull()
    expect(legacyForensicPool('7182', 'relationships', published)).toBeNull()
    expect(legacyForensicPool('7182', topic, published.slice(1))).toBeNull()
    const session = recordSessionAnswer(startQuestionSession(legacy!, 4), {
      questionId: oldIds[0]!, correct: false, level: legacy![0]!.level,
      selectedOption: 0, confidence: 'certain',
    })
    const snapshot = { schemaVersion: 1 as const, session, pending: null }
    const saved = store()
    await createPracticeCheckpoint(saved, k, await fingerprintPracticeContent(legacy!), '12345678-1234-4234-8234-123456789012', snapshot)
    const recovered = await loadLf03CompatibleCheckpoint(saved, k, published, legacy)
    expect(recovered.legacy).toBe(true)
    expect(recovered.checkpoint?.snapshot).toEqual(snapshot)
    expect(recovered.checkpoint?.snapshot.session.answers[0]).toMatchObject({
      questionId: oldIds[0], selectedOption: 0, correct: false,
    })
    const unknown = store()
    await createPracticeCheckpoint(unknown, k, 'f'.repeat(64), '12345678-1234-4234-8234-123456789012', snapshot)
    await expect(loadLf03CompatibleCheckpoint(unknown, k, published, legacy)).rejects.toThrow(/content changed/)
  })
})
