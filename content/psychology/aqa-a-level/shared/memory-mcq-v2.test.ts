import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { buildQuestionPool } from '../../../../src/app/practice-questions'
import { advanceQuestionSession, recordSessionAnswer, startQuestionSession } from '../../../../src/app/practice-session'
import { psychologyLegacyMemoryQuestions } from './course'

const packs = [paper1, paper2, paper3]
const oldIds = ['psy-psy0201-check', 'psy-psy0202-check', 'psy-psy0203-check', 'psy-psy0204-check']
const updatedIds = oldIds.map(id => id + '-v2')
const newIndexes = [2, 0, 3, 1]
const oldIndexes = [0, 1, 1, 2]

describe('LF-03 #787 Memory v2 exact AQA §4.1.2 review cohort', () => {
  it('publishes exactly four independent, original scenario checks on all three real Psychology packs', () => {
    for (const pack of packs) {
      const items = pack.questions.filter(q => q.topic === 'memory')
      expect(items.map(q => q.id)).toEqual(updatedIds)
      expect(items.map(q => q.correctOption)).toEqual(newIndexes)
      expect(items.every(q => q.options.length === 4 && q.explanation.length >= 140)).toBe(true)
      expect(items.every(q => !q.prompt.startsWith('Which concept or approach completes'))).toBe(true)
      expect(new Set(items.map(q => q.options.map(x => x.toLowerCase().trim()).sort().join('|'))).size).toBe(4)
      expect(reviewMcqQuality(items).filter(f =>
        f.disposition === 'block' || ['repeated-option-set','answer-position-run','generic-feedback','answer-position-bias'].includes(f.rule)
      )).toEqual([])
    }
  })

  it('locates all four in source-scoped application, with one unambiguous authored key in each', () => {
    const q = paper1.questions.filter(item => item.topic === 'memory')
    expect(q[0]?.prompt).toContain('grid of letters')
    expect(q[0]?.options[q[0].correctOption]).toContain('sensory register briefly holds input')
    expect(q[1]?.prompt).toContain('spoken directions')
    expect(q[1]?.options[q[1].correctOption]).toContain('phonological loop handles verbal material')
    expect(q[2]?.prompt).toContain('older French words')
    expect(q[2]?.options[q[2].correctOption]).toContain('Proactive interference')
    expect(q[3]?.prompt).toContain('Two witnesses discuss')
    expect(q[3]?.options[q[3].correctOption]).toContain('Post-event discussion')
  })

  it('uses canonical Practice pool, real selected/keyed evidence and original stable V2 IDs', () => {
    const pool = buildQuestionPool({
      topicId: 'memory', topicOrder: 2,
      coursePack: paper1.questions.filter(q => q.topic === 'memory'),
      bank: paper1.practiceBank,
    })
    expect(pool.map(q => q.id)).toEqual(updatedIds)
    let session = startQuestionSession(pool, 4)
    expect(session.currentId).toBe(updatedIds[0])
    for (let i = 0; i < newIndexes.length; i++) {
      const question = pool.find(q => q.id === session.currentId)
      if (!question || question.type !== 'multiple-choice') throw new Error('Missing canonical Memory MCQ')
      const correct = newIndexes[i]!
      expect(question.correctOption).toBe(correct)
      const matched = createMultipleChoiceEvidence({
        id: 'memory-success-' + i, moduleId: paper1.manifest.id, topicId: 'memory',
        contentId: question.id, selectedOption: correct,
        correctOption: question.correctOption, confidence: 'certain',
      })
      const wrong = createMultipleChoiceEvidence({
        id: 'memory-miss-' + i, moduleId: paper1.manifest.id, topicId: 'memory',
        contentId: question.id, selectedOption: (correct + 1) % 4,
        correctOption: question.correctOption, confidence: 'certain',
      })
      expect(matched).toMatchObject({ correct: true, selectedOption: correct, correctOption: correct })
      expect(wrong).toMatchObject({ correct: false })
      session = advanceQuestionSession(recordSessionAnswer(session, {
        questionId: question.id, correct: true, level: question.level,
        selectedOption: correct, confidence: 'certain',
      }), pool)
    }
    expect(session.currentId).toBeNull()
    expect(session.answers).toHaveLength(4)
  })

  it('preserves exact retired content identities and original option keys for scored history', () => {
    expect(psychologyLegacyMemoryQuestions.map(q => q.id)).toEqual(oldIds)
    expect(psychologyLegacyMemoryQuestions.map(q => q.correctOption)).toEqual(oldIndexes)
    const sets = psychologyLegacyMemoryQuestions.map(q => [...q.options].sort().join('|'))
    expect(new Set(sets).size).toBe(1) // reproduces reported systemic pattern
    expect(new Set([...oldIds, ...updatedIds]).size).toBe(8)
  })
})
