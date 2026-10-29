import { describe, expect, it } from 'vitest'
import type { MultipleChoicePracticeQuestion } from './practice-questions'
import { objectiveItemMappingForPractice } from './practice-questions'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { findSkillRecheckOpportunities } from './skill-recheck'

const moduleId = 'business-aqa-paper-1'
const topicId = 'finance'
function question(id: string, skill: string, nodeId = 'node-breakeven'): MultipleChoicePracticeQuestion {
  return {
    id, type: 'multiple-choice', level: 'Apply', topicId, marks: 1, source: 'aqa-bank',
    context: null, table: null, prompt: id + ' published objective check?',
    options: [{ text: 'A', why: null }, { text: 'B', why: null }], correctOption: 1,
    explanation: 'Worked answer', specItemIds: [skill], nodeIds: [nodeId],
  }
}
function answer(id: string, q: MultipleChoicePracticeQuestion, correct: boolean, confidence: 'guess' | 'certain', when = '2026-10-29T09:00:00.000Z', targetModule = moduleId) {
  return createMultipleChoiceEvidence({
    id, moduleId: targetModule, topicId, contentId: q.id, occurredAt: when,
    selectedOption: correct ? 1 : 0, correctOption: 1, confidence,
    itemMapping: objectiveItemMappingForPractice(q),
  })
}
const skillA = 'aqa-7132-3.5.2:break-even'
const skillB = 'aqa-7132-3.5.2:margin-of-safety'
const q1 = question('authored-q1', skillA)
const q2 = question('authored-q2', skillA)
const q3 = question('authored-q3', skillB, 'node-margin')
const q4 = question('authored-q4', skillB, 'node-margin')

describe('IA-05: finite, evidence-backed skill repair and independent recheck', () => {
  it('finds different fresh source question for missed single target; retains skill identity and exact node', () => {
    const opportunities = findSkillRecheckOpportunities(
      [q1,q2,q3,q4], [answer('miss-A', q1, false, 'certain'), answer('miss-B', q3, false, 'certain')],
      topicId, [moduleId], ['node-breakeven', 'node-margin'])
    expect(opportunities).toEqual([
      { specItemId: skillA, topicId, sourceEvidenceId: 'miss-A', need: 'missed',
        freshQuestionId: q2.id, repairLearnPageId: 'node-breakeven' },
      { specItemId: skillB, topicId, sourceEvidenceId: 'miss-B', need: 'missed',
        freshQuestionId: q4.id, repairLearnPageId: 'node-margin' },
    ])
  })

  it('never repeats the coached item or turns one-item inventory into an independent recheck', () => {
    const one = findSkillRecheckOpportunities([q1], [answer('miss', q1, false, 'certain')], topicId, [moduleId], [])
    expect(one).toEqual([{ specItemId: skillA, topicId, sourceEvidenceId: 'miss',
      need: 'missed', freshQuestionId: null, repairLearnPageId: null }])
    const exhausted = findSkillRecheckOpportunities(
      [q1,q2], [answer('miss', q1, false, 'certain'), answer('prior-q2', q2, false, 'certain')],
      topicId, [moduleId])
    expect(exhausted[0]?.freshQuestionId).toBeNull()
  })

  it('distinguishes guessed correct from a reliable correct and clears immediate retest demand on later independent confirmation', () => {
    const uncertain = findSkillRecheckOpportunities([q1,q2],
      [answer('guess', q1, true, 'guess')], topicId, [moduleId])
    expect(uncertain).toMatchObject([{ need: 'uncertain', freshQuestionId: q2.id }])
    const improved = findSkillRecheckOpportunities([q1,q2],
      [answer('miss', q1, false, 'certain'), answer('independent', q2, true, 'certain', '2026-10-29T10:00:00.000Z')], topicId, [moduleId])
    expect(improved).toEqual([])
    // Clearing a retest opportunity is not a claim of independently assured mastery.
  })

  it('does not use other module, other topic, untagged or multi-target answers', () => {
    expect(findSkillRecheckOpportunities([q1,q2],
      [answer('wrong-module', q1, false, 'certain', undefined, 'psychology-paper-1')],
      topicId, [moduleId])).toEqual([])
    expect(findSkillRecheckOpportunities([q1,q2],
      [{ ...answer('wrong-topic', q1, false, 'certain'), topicId: 'marketing' }],
      topicId, [moduleId])).toEqual([])
    const multiple = { ...q1, id: 'multi', specItemIds: [skillA, skillB] }
    expect(findSkillRecheckOpportunities([multiple,q2],
      [createMultipleChoiceEvidence({ id: 'ambiguous', moduleId, topicId,
        contentId: multiple.id, selectedOption: 0, correctOption: 1,
        itemMapping: objectiveItemMappingForPractice(multiple) })],
      topicId, [moduleId])).toEqual([])
    expect(findSkillRecheckOpportunities([q1,q2],
      [createMultipleChoiceEvidence({ id: 'legacy', moduleId, topicId,
        contentId: q1.id, selectedOption: 0, correctOption: 1 })],
      topicId, [moduleId])).toEqual([])
  })

  it('refuses tampered mapping and never substitutes a broad topic page as precise repair', () => {
    const mismatch = { ...answer('mismatch', q1, false, 'certain'), itemMapping: objectiveItemMappingForPractice(q3) }
    expect(findSkillRecheckOpportunities([q1,q2], [mismatch], topicId, [moduleId])).toEqual([])
    expect(findSkillRecheckOpportunities([q1,q2],
      [answer('miss', q1, false, 'certain')], topicId, [moduleId], ['some-topic-introduction'])[0]?.repairLearnPageId).toBeNull()
  })
})
