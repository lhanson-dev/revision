import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { psychologyLegacyRelationshipsQuestions } from './course'
import { relationshipsMcqV2 } from './relationships-mcq-v2'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { buildQuestionPool, coursePackQuestionToPractice } from '../../../../src/app/practice-questions'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { supportsLearningInference } from '../../../../src/engine/evidence/evidence'
import { legacyRelationshipsPool, legacyPsychologyCheckpointPool, loadLf03CompatibleCheckpoint } from '../../../../src/app/practice-checkpoint-compat'
import { startQuestionSession, recordSessionAnswer } from '../../../../src/app/practice-session'
import {
  createPracticeCheckpoint, fingerprintPracticeContent,
  type PracticeCheckpointKey, type PracticeCheckpointRow, type PracticeCheckpointStore,
} from '../../../../src/services/progress/practice-checkpoint-service'
import crosswalk from '../../../../scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'

const packs = [paper1, paper2, paper3]
const topicId = 'relationships'
const originals = [1, 2, 3, 4].map(i => `psy-psy090${i}-check`)
const replacements = originals.map(id => id + '-v2')
const keys = [2, 0, 3, 1]
const checkpointKey: PracticeCheckpointKey = {
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

describe('#787 Relations V2 source-first learner question correction', () => {
  it('preserves four exact AQA §4.3.2 source obligations, across all three published shared Practice packs', () => {
    expect(crosswalk.qualification.pdfSha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(crosswalk.qualification.rights).toBe('REFERENCE_ONLY')
    expect(crosswalk.rows.filter(row => row.sourceSection === '4.3.2')).toHaveLength(4)
    expect(Object.keys(relationshipsMcqV2)).toEqual(['PSY-09-01', 'PSY-09-02', 'PSY-09-03', 'PSY-09-04'])
    expect(psychologyLegacyRelationshipsQuestions.map(q => q.id)).toEqual(originals)
    for (const pack of packs) {
      const questions = pack.questions.filter(q => q.topic === topicId)
      expect(questions.map(q => q.id)).toEqual(replacements)
      expect(questions.map(q => q.correctOption)).toEqual(keys)
      expect(questions[0]?.prompt).toContain('volunteering group')
      expect(questions[1]?.prompt).toContain('Leah is unhappy')
      expect(questions[2]?.prompt).toContain('face-to-face')
      expect(questions[3]?.prompt).toContain('commentator')
      expect(questions.every(q => q.explanation.length > 240)).toBe(true)
      const pool = buildQuestionPool({ topicId, topicOrder: 9, coursePack: questions, bank: pack.practiceBank })
      expect(pool.map(q => q.id)).toEqual(replacements)
    }
  })

  it('prevents the prior four-identical-option-set and answer-length shortcut, without mistaking heuristics for A3', () => {
    const old = psychologyLegacyRelationshipsQuestions
    expect(new Set(old.map(q => [...q.options].sort().join('|'))).size).toBe(1)
    const items = paper1.questions.filter(q => q.topic === topicId)
    const findings = reviewMcqQuality(items)
    expect(findings.filter(f =>
      f.disposition === 'block' || ['repeated-option-set', 'generic-feedback', 'length-clue', 'answer-position-run'].includes(f.rule)
    )).toEqual([])
    expect(new Set(items.map(q => [...q.options].sort().join('|'))).size).toBe(4)
    for (const q of items) {
      const sizes = q.options.map(option => option.length)
      expect(Math.max(...sizes) / Math.min(...sizes), q.id).toBeLessThan(1.25)
      expect(q.options.every(option => option.length > 85), q.id).toBe(true)
      expect(q.explanation.toLowerCase()).not.toContain('the keyed answer names the concept')
    }
    // An independent examiner or blinded reviewer still must adjudicate each
    // plausible distractor, answer key, contextual AO and explanation.
  })

  it('retains previous raw marks but prevents V1 repeated-option recognition being promoted to current mastery', () => {
    for (let index = 0; index < originals.length; index++) {
      const old = psychologyLegacyRelationshipsQuestions[index]!
      const historical = createMultipleChoiceEvidence({
        id: 'v1-' + index, moduleId: checkpointKey.moduleId, topicId,
        contentId: old.id, selectedOption: old.correctOption, correctOption: old.correctOption,
        confidence: 'certain',
      })
      expect(historical).toMatchObject({ correct: true, contentId: originals[index] })
      expect(supportsLearningInference(historical)).toBe(false)
      const current = createMultipleChoiceEvidence({
        id: 'v2-' + index, moduleId: checkpointKey.moduleId, topicId,
        contentId: replacements[index]!, selectedOption: keys[index]!, correctOption: keys[index]!,
        confidence: 'certain',
      })
      expect(supportsLearningInference(current)).toBe(true)
      expect(supportsLearningInference(createMultipleChoiceEvidence({
        id: 'not-this-course-' + index, moduleId: 'business-aqa-a-level-7132-paper-1',
        topicId, contentId: originals[index]!, selectedOption: 0, correctOption: 0,
      }))).toBe(true)
    }
  })

  it('restores a precisely matching four-question V1 saved session and fails closed for other fingerprints', async () => {
    const published = paper1.questions.filter(q => q.topic === topicId).map(coursePackQuestionToPractice)
    const legacy = legacyRelationshipsPool('7182', topicId, published)
    expect(legacy?.map(q => q.id)).toEqual(originals)
    expect(legacyPsychologyCheckpointPool('7182', topicId, published)).toEqual(legacy)
    expect(legacyRelationshipsPool('7132', topicId, published)).toBeNull()
    expect(legacyRelationshipsPool('7182', 'memory', published)).toBeNull()
    expect(legacyRelationshipsPool('7182', topicId, published.slice(1))).toBeNull()
    const prior = recordSessionAnswer(startQuestionSession(legacy!, 4), {
      questionId: originals[0]!, correct: false, level: legacy![0]!.level,
      selectedOption: 0, confidence: 'certain',
    })
    const store = memoryStore()
    await createPracticeCheckpoint(store, checkpointKey, await fingerprintPracticeContent(legacy!), crypto.randomUUID(), {
      schemaVersion: 1, session: prior, pending: null,
    })
    const restored = await loadLf03CompatibleCheckpoint(store, checkpointKey, published, legacy)
    expect(restored.legacy).toBe(true)
    expect(restored.checkpoint?.snapshot.session).toEqual(prior)
    expect(restored.checkpoint?.snapshot.session.answers[0]).toMatchObject({
      questionId: originals[0], selectedOption: 0, correct: false,
    })
    const unknown = memoryStore()
    await createPracticeCheckpoint(unknown, checkpointKey, 'f'.repeat(64), crypto.randomUUID(), {
      schemaVersion: 1, session: prior, pending: null,
    })
    await expect(loadLf03CompatibleCheckpoint(unknown, checkpointKey, published, legacy)).rejects.toThrow(/content changed/)
  })
})
