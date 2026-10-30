import { describe, expect, it } from 'vitest'
import source from '../../../audits/2026-10-30-aqa-business-7132-section-322-decision-numeracy.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessDecisionTreeNumericCases } from './shared/decision-tree-numeric-practice'
import { buildQuestionPool, bankQuestionId } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'
import { createCalculationEvidence } from '../../../src/app/practice-evidence'

const packs = [paper1, paper2, paper3] as const
const exactIds = businessDecisionTreeNumericCases.map(item => `rev7132-3.2.2-${item.id}`)

describe('Issue #698: AQA 7132 §3.2.2 exact final-number decision-tree numeracy', () => {
  it('tracks two precise source-derived numerical requirements, not a full 3.2.2 educational pass', () => {
    expect(source.source_section).toBe('3.2.2')
    expect(source.source_printed_page).toBe(14)
    expect(source.pdf_page_index).toBe(13)
    expect(source.source_rights).toBe('REFERENCE_ONLY')
    expect(source.original_uploaded_file_byte_sha_verified).toBe(false)
    expect(source.obligations).toHaveLength(2)
    expect(source.obligations.map(item => item.atomic_id)).toEqual([
      'aqa-7132-3.2.2:expected-value', 'aqa-7132-3.2.2:net-gain',
    ])
    expect(source.obligations.every(item => item.assessment_adequacy === 'partial-final-number-only'
      && item.teaching_adequacy === 'unverified'
      && item.authenticated_learner_acceptance === 'unverified'
      && item.new_final_value_question_ids.length === 2)).toBe(true)
    expect(source.excluded_and_unverified.length).toBeGreaterThanOrEqual(7)
  })

  it('publishes four single-target final-number responses through the existing Practice pool in all three real AQA Business packs', () => {
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(item => item.namespace === 'rev7132' && item.batch === '3.2.2')
      expect(records).toHaveLength(4)
      expect(records.map(bankQuestionId)).toEqual(exactIds)
      expect(records.every(item => item.topic_id === 'leadership'
        && item.target_item_ids.length === 1
        && item.target_node_ids.length === 1
        && item.target_node_ids[0] === 'bus-evi-004'
        && item.question.marks === 1)).toBe(true)
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      expect(pages.filter(page => page.id === 'bus-evi-004' && page.topicId === 'leadership')).toHaveLength(1)
      const pool = buildQuestionPool({
        topicId: 'leadership', topicOrder: 2, coursePack: pack.questions, bank: pack.practiceBank,
      })
      for (const [index, id] of exactIds.entries()) {
        const question = pool.find(item => item.id === id)
        expect(question, id).toBeDefined()
        expect(question?.type).toBe('calculation')
        if (!question || question.type !== 'calculation') continue
        expect(question.specItemIds).toEqual([businessDecisionTreeNumericCases[index]!.target])
        expect(question.nodeIds).toEqual(['bus-evi-004'])
        expect(question.expected).toBe(businessDecisionTreeNumericCases[index]!.expected)
        expect(question.unit).toBe('£')
        expect(question.marks).toBe(1)
        expect(checkCalculation(String(question.expected), question.accepted, question.unit).status).toBe('right')
        expect(checkCalculation(String(question.expected + 5000), question.accepted, question.unit).status).toBe('wrong')
        expect(question.workings).toContain('Expected value')
      }
      expect(pack.practiceBank!.some(record => record.id === 'q03' && record.batch === '3.1-3.2')).toBe(true)
      expect(pool.some(question => question.id === 'rev7132-3.1.3-fair-trade')).toBe(false)
      const businessPool = buildQuestionPool({
        topicId: 'business', topicOrder: 1, coursePack: pack.questions, bank: pack.practiceBank,
      })
      expect(businessPool.some(question => question.id === 'rev7132-3.1.3-fair-trade')).toBe(true)
    }
  })

  it('independently reconstructs four distinct contextual outcomes and their probabilities', () => {
    expect([0.6 * 150000 + 0.4 * -40000,
      0.25 * 240000 + 0.75 * -20000,
      0.7 * 80000 + 0.3 * -20000 - 12000,
      0.55 * 125000 + 0.45 * -45000 - 18500,
    ]).toEqual(businessDecisionTreeNumericCases.map(item => item.expected))
    expect(new Set(businessDecisionTreeNumericCases.map(item => item.context)).size).toBe(4)
    expect(new Set(businessDecisionTreeNumericCases.map(item => item.target)).size).toBe(2)
    expect(new Set(exactIds).size).toBe(4)
  })

  it('does not convert final-number marking into method, tree-drawing, evaluation or skill-mastery claims', () => {
    const result = createCalculationEvidence({
      id: 'original-business-322-number',
      moduleId: paper1.manifest.id,
      topicId: 'leadership',
      contentId: exactIds[0]!,
      correct: true,
      enteredValue: 74000,
      expectedValue: 74000,
      unit: '£',
      confidence: 'certain',
      occurredAt: '2026-10-30T00:00:00.000Z',
    })
    expect(result.source).toBe('calculation')
    expect(result).not.toHaveProperty('validatedWorking')
    expect(result).not.toHaveProperty('drawnDecisionTree')
    expect(result).not.toHaveProperty('examinerJudgement')
    expect(result).not.toHaveProperty('awardedSkillMastery')
  })
})
