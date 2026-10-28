import { describe, it, expect } from 'vitest'
import { evidenceCrosswalk } from './aqa-7132-learner-crosswalk.mjs'

describe('Issue #698 AQA 7132 real student-asset mapping (structural only)', () => {
  it('locates actual published Learn, self-check and independently scored question IDs for exact PDF source', async () => {
    const report = await evidenceCrosswalk()
    expect(report.reference_spec_pdf_version).toBe('2.0')
    expect(report.reference_spec_sha256).toBe('3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332')
    expect(report.summary.register_named_items).toBe(344)
    expect(report.summary.generated_learning_nodes).toBe(79)
    expect(report.summary.structured_questions).toBe(256)
    expect(report.named_requirements).toHaveLength(344)
    expect(Object.keys(report.by_section).sort()).toEqual(['3.1','3.10','3.2','3.3','3.4','3.5','3.6','3.7','3.8','3.9'].sort())
    console.info('Issue #698 source-to-asset preflight:', JSON.stringify({summary:report.summary, by_section:report.by_section, unlinked_learn:report.lacking_learn_binding, unlinked_practice:report.lacking_practice_binding, structural_problems:report.structural_problems}))
    const chart=report.named_requirements.find((x)=>x.id==='aqa-7132-3.5.2:break-even-chart')
    expect(chart?.learn_blocks.some((x)=>x.page_id==='bus-fin-004')).toBe(true)
    expect(chart?.self_check_cards.some((x)=>x.declared_capability==='construction')).toBe(true)
    expect(chart?.independently_scored_questions.some((x)=>x.question_id==='aqa7132-3.5-q15')).toBe(true)
    const cash=report.named_requirements.find((x)=>x.id==='aqa-7132-3.5.2:cash-flow-forecast')
    expect(cash?.self_check_cards.some((x)=>x.card_id.includes('p11-three-month-cash-flow-forecast'))).toBe(true)
    expect(cash?.independently_scored_questions.some((x)=>x.question_id==='aqa7132-3.5-q17')).toBe(true)
    const network=report.named_requirements.find((x)=>x.id==='aqa-7132-3.10.3:amending-network-diagrams')
    expect(network?.self_check_cards.some((x)=>x.card_id.includes('p-amend-activity-on-arrow'))).toBe(true)
    // Explicit linking only. This test intentionally never asserts semantic completeness.
    expect(report.named_requirements.every((x)=>x.semantic_review==='UNVERIFIED' && !x.live_site_verified)).toBe(true)
    expect(report.not_proven.some((x)=>x.includes('344-item'))).toBe(true)
  })
})
