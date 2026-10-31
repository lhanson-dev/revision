import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { individualSpecItemObservation } from '../../../../src/engine/evidence/evidence'
import { createCalculationEvidence } from '../../../../src/app/practice-evidence'
import { checkCalculation } from '../../../../src/app/practice-calculation'
import { bankRecordToPractice, objectiveItemMappingForPractice } from '../../../../src/app/practice-questions'
import { psychologySignTestCaseContracts, psychologySignTestPracticeBank, signTestCounts } from './sign-test-practice'

describe('Issue #698 AQA Psychology 7182 sign-test scored Practice', () => {
  it('independently reconstructs paired signs, removes ties and scores distinct cases', () => {
    expect(psychologySignTestCaseContracts.map(x => x.expected)).toEqual([
      { positive: 5, negative: 2, ties: 1, n: 7, S: 2 },
      { positive: 1, negative: 4, ties: 2, n: 5, S: 1 },
    ])
    for (const item of psychologySignTestCaseContracts) expect(signTestCounts(item.pairs)).toEqual(item.expected)
    expect(new Set(psychologySignTestPracticeBank.map(x => x.id)).size).toBe(2)
    expect(psychologySignTestPracticeBank.every(x => x.target_item_ids.length === 1 && x.target_item_ids[0] === 'PSY-07-32')).toBe(true)
  })

  it('delivers the two source-mapped questions through every existing paper pack', () => {
    for (const paper of [paper1, paper2, paper3]) {
      for (const item of psychologySignTestPracticeBank) {
        const actual = paper.practiceBank?.find(x => x.id === item.id && x.namespace === 'rev7182')
        expect(actual).toEqual(item)
        const question = bankRecordToPractice(actual!, 'research-methods')
        expect(question?.type).toBe('calculation')
        if (question?.type !== 'calculation') continue
        expect(question.expected).toBe(item.question.calcs[0].stated_answer)
        expect(question.unit).toBeNull()
        expect(question.exactInteger).toBe(true)
        for (const valid of [String(question.expected), String(question.expected) + '.0']) {
          expect(checkCalculation(valid, question.accepted, question.unit, question.exactInteger).status).toBe('right')
        }
        for (const invalid of [String(question.expected - 0.4), String(question.expected + 0.4), 'not sure']) {
          expect(checkCalculation(invalid, question.accepted, question.unit, question.exactInteger).status).not.toBe('right')
        }
        expect(question.answerText).toBe(String(question.expected))
        const mapping = objectiveItemMappingForPractice(question)
        expect(mapping?.singleTargetSpecItemId).toBe('PSY-07-32')
        const saved = createCalculationEvidence({
          id: 'learner-' + item.id, moduleId: paper.manifest.id, topicId: 'research-methods',
          contentId: question.id, correct: true, enteredValue: question.expected, expectedValue: question.expected,
          unit: question.unit, confidence: 'guess', occurredAt: '2026-10-31T09:00:00Z',
          itemMapping: mapping,
        })
        expect(individualSpecItemObservation(saved)).toMatchObject({
          specItemId: 'PSY-07-32', correct: true,
          scoring: 'software-scored-final-number', contentId: question.id,
        })
        expect(individualSpecItemObservation(saved)).not.toHaveProperty('mastery')
      }
    }
  })
})
