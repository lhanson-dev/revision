import { describe, expect, it } from 'vitest'
import source from '../../../audits/2026-10-30-aqa-business-7132-section-322-source-to-live.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessDecisionTreeNumericalCases } from './shared/decision-tree-numeric-practice'
import { bankQuestionId, buildQuestionPool } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'
import { createCalculationEvidence } from '../../../src/app/practice-evidence'

const packs = [paper1, paper2, paper3] as const
const exactIds = businessDecisionTreeNumericalCases.map(item => `rev7132-3.2.2-${item.id}`)

describe('Issue #698 AQA Business 7132 §3.2.2 scored decision-tree calculations', () => {
  it('records an independently section-scoped requirement split, not a coverage percentage', () => {
    expect(source.source_section).toBe('3.2.2')
    expect(source.source_printed_page).toBe(14)
    expect(source.source_rights).toBe('REFERENCE_ONLY')
    expect(source.user_supplied_pdf_sha_verified).toBe(false)
    expect(source.count).toBe(16)
    expect(source.items).toHaveLength(16)
    expect(new Set(source.items.map(i => i.atomic_id)).size).toBe(16)
    expect(source.items.every(i => i.teaching_adequacy === 'unverified'
      && i.authentic_assessment_adequacy === 'unverified'
      && i.real_student_acceptance === 'unverified')).toBe(true)
  })
  it('publishes four original typed answers in leadership Practice across all three Business papers', () => {
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(q => q.namespace === 'rev7132' && q.batch === '3.2.2')
      expect(records).toHaveLength(4)
      expect(records.map(bankQuestionId)).toEqual(exactIds)
      const pages = pack.learn!.chapters.flatMap(ch => ch.groups.flatMap(group => group.pages))
      expect(pages.filter(p => p.id === 'bus-evi-004')).toHaveLength(1)
      const pool = buildQuestionPool({topicId:'leadership', topicOrder:2, coursePack:pack.questions, bank:pack.practiceBank})
      for (const [i, id] of exactIds.entries()) {
        const question = pool.find(q => q.id === id)
        expect(question?.type).toBe('calculation')
        if (!question || question.type !== 'calculation') continue
        expect(question.expected).toBe(businessDecisionTreeNumericalCases[i]!.expected)
        expect(question.specItemIds).toEqual([businessDecisionTreeNumericalCases[i]!.target])
        expect(question.nodeIds).toEqual(['bus-evi-004'])
        expect(question.unit).toBe('£')
        expect(question.marks).toBe(1)
        expect(question.workings.length).toBeGreaterThan(75)
        expect(checkCalculation(String(question.expected), question.accepted, question.unit).status).toBe('right')
        expect(checkCalculation(String(question.expected+10), question.accepted, question.unit).status).toBe('wrong')
      }
    }
  })
  it('independently reconstructs each numeric answer and keeps alternative contexts distinct', () => {
    expect([0.6*150000+0.4*20000, 0.25*210000+0.75*-30000,
      0.55*180000+0.45*40000-70000, 0.4*200000+0.6*-20000-45000])
      .toEqual(businessDecisionTreeNumericalCases.map(item => item.expected))
    expect(businessDecisionTreeNumericalCases[0]!.context).not.toBe(businessDecisionTreeNumericalCases[1]!.context)
    expect(businessDecisionTreeNumericalCases[2]!.context).not.toBe(businessDecisionTreeNumericalCases[3]!.context)
  })
  it('limits evidence to one final answer, not validated workings or decision judgement', () => {
    const e = createCalculationEvidence({
      id:'test-322-ev',moduleId:paper1.manifest.id,topicId:'leadership',contentId:exactIds[0]!,
      correct:true,enteredValue:98000,expectedValue:98000,unit:'£',confidence:'certain',
      occurredAt:'2026-10-30T00:00:00Z'
    })
    expect(e.source).toBe('calculation')
    expect(e).not.toHaveProperty('validatedWorking')
    expect(e).not.toHaveProperty('awardedSkillMastery')
    expect(e).not.toHaveProperty('examinerJudgement')
  })
})
