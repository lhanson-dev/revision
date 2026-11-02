import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { coursePackQuestionToPractice, buildQuestionPool } from '../../../../src/app/practice-questions'
import { advanceQuestionSession, recordSessionAnswer, startQuestionSession } from '../../../../src/app/practice-session'
import { psychologyLegacySocialInfluenceQuestions } from './course'

const packs = [paper1, paper2, paper3]
const legacyIds = ['psy-psy0101-check', 'psy-psy0102-check', 'psy-psy0103-check', 'psy-psy0104-check']
const ids = legacyIds.map(id => id + '-v2')
const positions = [1, 3, 0, 2]

describe('LF-03 Social Influence V2 source-aligned assessment', () => {
  it('publishes exactly four original scenario checks with stable new identities and different options across all paper packs', () => {
    for (const pack of packs) {
      const items = pack.questions.filter(q => q.topic === 'social-influence')
      expect(items.map(q => q.id)).toEqual(ids)
      expect(items.map(q => q.correctOption)).toEqual(positions)
      expect(items.every(q => q.options.length === 4)).toBe(true)
      expect(items.every(q => q.explanation.length > 100)).toBe(true)
      expect(items.every(q => !/Which concept or approach completes this definition/.test(q.prompt))).toBe(true)
      expect(new Set(items.map(q => q.options.map(t => t.trim().toLowerCase()).sort().join('|'))).size).toBe(4)
      const issues = reviewMcqQuality(items)
      expect(issues.filter(x => x.disposition === 'block')).toEqual([])
      expect(issues.filter(x => x.rule === 'repeated-option-set' || x.rule === 'answer-position-bias' || x.rule === 'answer-position-run' || x.rule === 'generic-feedback')).toEqual([])
    }
  })

  it('correctly attributes four independent source parent obligations without suggesting all AQA subskills are covered', () => {
    const [conformity, obedience, resistance, minority] = paper1.questions.filter(q => q.topic === 'social-influence')
    expect(conformity!.prompt).toMatch(/privately.*still thinks B/)
    expect(conformity!.options[conformity!.correctOption]).toMatch(/^Compliance/)
    expect(obedience!.prompt).toMatch(/university.*rented office/)
    expect(obedience!.options[obedience!.correctOption]).toMatch(/legitimacy/)
    expect(resistance!.prompt).toMatch(/own answer is also wrong/)
    expect(resistance!.options[resistance!.correctOption]).toMatch(/Social support/)
    expect(minority!.prompt).toMatch(/changes parts of its proposed method/)
    expect(minority!.options[minority!.correctOption]).toMatch(/Flexibility/)
  })

  it('actual session pool and software evidence preserve chosen index and authored marking key', () => {
    const pool = buildQuestionPool({
      topicId: 'social-influence', topicOrder: 1,
      coursePack: paper1.questions.filter(q => q.topic === 'social-influence'),
      bank: paper1.practiceBank,
    })
    expect(pool.map(q => q.id)).toEqual(ids)
    const session = startQuestionSession(pool, 4)
    expect(session.currentId).toBe(ids[0])
    let state = session
    for (const expected of positions) {
      const q = pool.find(q => q.id === state.currentId)
      expect(q?.type).toBe('multiple-choice')
      if (!q || q.type !== 'multiple-choice') throw new Error('not an MCQ')
      const matched = createMultipleChoiceEvidence({
        id: `lf03-${q.id}`, moduleId: paper1.manifest.id,
        topicId: q.topicId, contentId: q.id, selectedOption: expected,
        correctOption: q.correctOption, confidence: 'certain',
      })
      expect(matched.source === 'multiple_choice' && matched.correct).toBe(true)
      const miss = createMultipleChoiceEvidence({
        id: `lf03-wrong-${q.id}`, moduleId: paper1.manifest.id,
        topicId: q.topicId, contentId: q.id,
        selectedOption: (expected + 1) % 4, correctOption: q.correctOption,
      })
      expect(miss.source === 'multiple_choice' && miss.correct).toBe(false)
      state = advanceQuestionSession(recordSessionAnswer(state, {
        questionId: q.id, correct: true, level: q.level, selectedOption: expected, confidence: 'certain',
      }), pool)
    }
    expect(state.currentId).toBeNull()
    expect(state.answers).toHaveLength(4)
  })

  it('keeps prior four keys and prompts as separate immutable historical assessment identities', () => {
    expect(psychologyLegacySocialInfluenceQuestions.map(q => q.id)).toEqual(legacyIds)
    expect(psychologyLegacySocialInfluenceQuestions.map(q => q.correctOption)).toEqual([3, 3, 2, 1])
    expect(psychologyLegacySocialInfluenceQuestions.every(q => q.prompt.startsWith('Which concept or approach completes'))).toBe(true)
    expect(new Set([...legacyIds, ...ids]).size).toBe(8)
    const adapted = psychologyLegacySocialInfluenceQuestions.map(coursePackQuestionToPractice)
    expect(adapted.map(q => q.correctOption)).toEqual([3, 3, 2, 1])
  })
})
