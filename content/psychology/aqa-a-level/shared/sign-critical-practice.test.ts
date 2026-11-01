import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { bankRecordToPractice, objectiveItemMappingForPractice, bankQuestionId } from '../../../../src/app/practice-questions'
import { checkCalculation } from '../../../../src/app/practice-calculation'
import { createCalculationEvidence } from '../../../../src/app/practice-evidence'
import { individualSpecItemObservation } from '../../../../src/engine/evidence/evidence'
import {
  psychologyOriginalSignCriticalTable,
  psychologySignCriticalPracticeBank,
  psychologySignCriticalCaseContracts,
  psychologySignCriticalDrills,
  signTestTwoTailProbability,
  signTestTwoTailCritical,
} from './sign-critical-practice'

describe('Issue #698 — AQA Psychology 7182 original sign-test critical table and scatter exercise', () => {
  it('reconstructs exact two-tailed 5% and 1% table results from independent binomial counts', () => {
    for (const row of psychologyOriginalSignCriticalTable) {
      expect(signTestTwoTailCritical(row.n, 0.05)).toBe(row.fivePercent)
      expect(signTestTwoTailCritical(row.n, 0.01)).toBe(row.onePercent)
      if (row.fivePercent >= 0) expect(signTestTwoTailProbability(row.n, row.fivePercent)).toBeLessThanOrEqual(0.05)
      if (row.onePercent >= 0) expect(signTestTwoTailProbability(row.n, row.onePercent)).toBeLessThanOrEqual(0.01)
      expect(signTestTwoTailProbability(row.n, row.fivePercent + 1)).toBeGreaterThan(0.05)
    }
    expect(psychologyOriginalSignCriticalTable.map(x => [x.n, x.fivePercent, x.onePercent])).toEqual([
      [8, 0, 0], [9, 1, 0], [10, 1, 0], [11, 1, 0], [12, 2, 1],
    ])
    expect(psychologySignCriticalCaseContracts.map(x => [x.n, x.alpha, x.S, x.critical])).toEqual([
      [9, 0.05, 1, 1], [12, 0.05, 3, 2], [12, 0.01, 2, 1],
    ])
  })

  it('publishes only exact one-mark critical-value lookups and self-checked graph tasks in every paper pack', () => {
    expect(new Set(psychologySignCriticalPracticeBank.map(bankQuestionId)).size).toBe(3)
    for (const pack of [paper1, paper2, paper3]) {
      for (const record of psychologySignCriticalPracticeBank) {
        const actual = pack.practiceBank?.find(x => x.id === record.id && x.namespace === record.namespace)
        expect(actual).toEqual(record)
        expect(actual?.target_item_ids).toEqual(['PSY-SRC-4233-IT05'])
        const question = bankRecordToPractice(record, 'research-methods')
        expect(question?.type).toBe('calculation')
        if (question?.type !== 'calculation') continue
        expect(question.marks).toBe(1)
        expect(question.exactInteger).toBe(true)
        expect(question.expected).toBe(record.question.calcs[0].stated_answer)
        expect(question.table?.rows).toHaveLength(5)
        const mapping = objectiveItemMappingForPractice(question)
        expect(mapping?.singleTargetSpecItemId).toBe('PSY-SRC-4233-IT05')
        const saved = createCalculationEvidence({
          id: 'learner-lookup-' + record.id,
          moduleId: pack.manifest.id,
          topicId: 'research-methods',
          contentId: question.id,
          correct: true,
          enteredValue: question.expected,
          expectedValue: question.expected,
          unit: question.unit,
          confidence: 'guess',
          occurredAt: '2026-11-01T12:00:00Z',
          itemMapping: mapping,
        })
        expect(individualSpecItemObservation(saved)).toMatchObject({
          specItemId: 'PSY-SRC-4233-IT05',
          correct: true,
          scoring: 'software-scored-final-number',
          contentId: question.id,
        })
        expect(individualSpecItemObservation(saved)).not.toHaveProperty('mastery')
        for (const input of [String(question.expected), String(question.expected) + '.0'])
          expect(checkCalculation(input, question.accepted, question.unit, true).status).toBe('right')
        for (const input of [String(question.expected) + '+1', '3 bananas', String(question.expected + 1)])
          expect(checkCalculation(input, question.accepted, question.unit, true).status).not.toBe('right')
      }
      for (const drill of psychologySignCriticalDrills) {
        expect(pack.dataDrills?.find(x => x.id === drill.id)).toEqual(drill)
        expect(pack.practiceBank?.some(record => bankQuestionId(record) === drill.id)).toBe(false)
      }
    }
  })

  it('does not silently credit significance reasoning, independent graph drawing or full course readiness', () => {
    expect(psychologySignCriticalPracticeBank.every(x =>
      x.target_item_ids.length === 1 && x.question.stem.includes('not your significance conclusion'))).toBe(true)
    expect(psychologySignCriticalDrills.some(x => x.id.includes('scatterplot'))).toBe(true)
    expect(psychologySignCriticalDrills.every(x => x.prompt.includes('not independently marked') || x.prompt.includes('not automatically marked'))).toBe(true)
  })
})
