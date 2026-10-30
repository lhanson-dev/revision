import { describe, expect, it } from 'vitest'
import sourceAudit from '../../../audits/2026-10-30-aqa-business-7132-section-311-source-to-live.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessPurposeProfitNumericCases } from './shared/purpose-profit-numeric-practice'
import { buildQuestionPool, bankQuestionId } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'
import { createCalculationEvidence } from '../../../src/app/practice-evidence'

const packs = [paper1, paper2, paper3] as const
const exactIds = [
  'rev7132-3.1.1-revenue-01',
  'rev7132-3.1.1-total-cost-01',
  'rev7132-3.1.1-profit-01',
  'rev7132-3.1.1-profit-02',
]

describe('Issue #698: exact AQA 7132 §3.1.1 profit teaching and final-value Practice', () => {
  it('records 16 distinct source-derived obligations, without laundering old keyword hits into coverage PASS', () => {
    expect(sourceAudit.source_section).toBe('3.1.1')
    expect(sourceAudit.official_version_reviewed).toBe(true)
    expect(sourceAudit.original_user_upload_sha_verified).toBe(false)
    expect(sourceAudit.items).toHaveLength(16)
    expect(new Set(sourceAudit.items.map(item => item.atomic_id)).size).toBe(16)
    expect(sourceAudit.items.every(item =>
      [11, 12].includes(item.source_printed_page)
      && item.teaching_adequacy === 'unverified'
      && item.live_acceptance === 'unverified'
      && item.learn_page_ids.length > 0)).toBe(true)
    const objectives = sourceAudit.items.filter(item => item.atomic_id.endsWith('-as-objective'))
    expect(objectives).toHaveLength(4)
    expect(new Set(objectives.map(item => item.prior_344_candidate_id)).size).toBe(1)
    const profitImportance = sourceAudit.items.find(item => item.atomic_id.endsWith('-profit-importance'))
    expect(profitImportance?.prior_344_candidate_id).toBeNull()
    expect(profitImportance?.published_assessment_evidence).toBe('unverified')
  })

  it('publishes explicit measurement AND importance in the actual Learn page for all three A-level papers', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      const page = pages.find(p => p.id === 'bus-fnd-005')
      expect(page?.topicId).toBe('business')
      const section = page?.blocks.find(block => block.type === 'explanation'
        && block.heading === 'Measuring profit and judging its importance')
      expect(section?.type).toBe('explanation')
      if (section?.type !== 'explanation') continue
      const body = section.paragraphs.join(' ')
      expect(body).toContain('profit = revenue − total cost')
      expect(body).toContain('retained earnings')
      expect(body).toContain('social enterprise')
      expect(body).toContain('A positive profit does not prove cash is available')
      expect(body).toContain('£2,040')
      expect(pages.filter(p => p.id === 'bus-fnd-005')).toHaveLength(1)
    }
  })

  it('includes original single-target, correctly attributed, typed-scored numerical Practice for the selected Business topic', () => {
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(record => record.namespace === 'rev7132' && record.batch === '3.1.1')
      expect(records).toHaveLength(4)
      expect(records.map(bankQuestionId)).toEqual(exactIds)
      expect(records.every(record => record.topic_id === 'business' && record.target_item_ids.length === 1 && record.target_node_ids.length === 1)).toBe(true)
      expect(records.map(record => record.target_node_ids[0])).toEqual(['bus-fnd-005', 'bus-fin-002', 'bus-fnd-005', 'bus-fnd-005'])
      const pool = buildQuestionPool({
        topicId: 'business', topicOrder: 1, coursePack: pack.questions, bank: pack.practiceBank,
      })
      const selected = exactIds.map(id => pool.find(question => question.id === id))
      expect(selected.every(Boolean)).toBe(true)
      for (const [i, q] of selected.entries()) {
        expect(q?.type).toBe('calculation')
        if (!q || q.type !== 'calculation') continue
        expect(q.expected).toBe(businessPurposeProfitNumericCases[i]!.expected)
        expect(q.marks).toBe(1)
        expect(q.specItemIds).toEqual([businessPurposeProfitNumericCases[i]!.target])
        expect(q.workings.length).toBeGreaterThan(75)
        expect(checkCalculation(String(q.expected), q.accepted, q.unit).status).toBe('right')
        expect(checkCalculation(String(q.expected + 20), q.accepted, q.unit).status).toBe('wrong')
      }
    }
  })

  it('independently reconstructs original examples and distinct answer-check cases', () => {
    expect([120 * 85, 120 * 33, 120 * 33 + 4200, 120 * 85 - (120 * 33 + 4200)])
      .toEqual([10200, 3960, 8160, 2040])
    expect([
      320 * 27,
      7400 + 450 * 12,
      350 * 12 - (350 * 4.5 + 1800),
      600 * 18 - (600 * 11.25 + 2400),
    ]).toEqual(businessPurposeProfitNumericCases.map(item => item.expected))
    expect(businessPurposeProfitNumericCases[2]!.context)
      .not.toEqual(businessPurposeProfitNumericCases[3]!.context)
  })

  it('does not turn a correct final value into false proof of workings, applied judgement or persisted exact-skill mastery', () => {
    const evidence = createCalculationEvidence({
      id: 'test-business-311-final-value',
      moduleId: paper1.manifest.id,
      topicId: 'business',
      contentId: exactIds[2]!,
      correct: true,
      enteredValue: 825,
      expectedValue: 825,
      unit: '£',
      confidence: 'certain',
      occurredAt: '2026-10-30T00:00:00.000Z',
    })
    expect(evidence.source).toBe('calculation')
    expect(evidence).not.toHaveProperty('itemMapping')
    expect(evidence).not.toHaveProperty('awardedSkillMastery')
    expect(evidence).not.toHaveProperty('validatedWorking')
    expect(evidence).not.toHaveProperty('examinerJudgement')
  })
})
