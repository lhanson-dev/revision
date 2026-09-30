import { describe, expect, it } from 'vitest'
import { buildCourseGateUnits, dependencyFreshness, type CourseGateBundle, type CoverageReport } from './aqa-business-7132-course-gate'

const bundle = (selected = ['FIN-8', 'FIN-1', 'MKT-2']): CourseGateBundle => ({
  exact_course_foundation_identity: { subject_foundation_fingerprint: 'fp-1', selected_subject_node_ids: selected },
  course_truth: {
    requirements: [
      { requirement_id: 'AQA-7132-3.5.3', source_section: '3.5.3', title: 'Sources of finance', rights_safe_requirement_summary: 'Finance sources.', mapped_subject_node_ids: ['FIN-8'] },
      { requirement_id: 'AQA-7132-3.3.1', source_section: '3.3.1', title: 'Marketing objectives', rights_safe_requirement_summary: 'Objectives.', mapped_subject_node_ids: ['MKT-2'] },
    ],
  },
  selected_subject_foundation_nodes: [
    { subject_id: 'FIN-8', prerequisites: ['FIN-1'], promotion_truth_source_ids: ['SRC-A'] },
    { subject_id: 'FIN-1', prerequisites: [] },
    { subject_id: 'MKT-2', prerequisites: ['MKT-1'] },
  ],
  subject_truth_sources: [{ id: 'SRC-A', title: 'Open text', url: 'https://example.org' }],
})
const coverage: CoverageReport = {
  foundation_fingerprint: 'fp-1',
  gaps: [{ id: 'i-crowd', section: '3.5.3', label: 'Crowdfunding', kind: 'concept', status: 'missing', fix: 'teach it' }],
  covered: [{ id: 'i-loan', section: '3.5.3', label: 'Loans', kind: 'concept' }, { id: 'i-share', section: '3.3.1', label: 'Market share', kind: 'formula', aqa_convention: 'firm sales / market sales × 100' }],
}

describe('AQA 7132 course gate units', () => {
  it('refuses to run against an item check made on a different Foundation version', () => {
    expect(dependencyFreshness(bundle(), coverage).ok).toBe(true)
    expect(dependencyFreshness(bundle(), { ...coverage, foundation_fingerprint: 'fp-2' }).ok).toBe(false)
  })

  it('turns item-coverage gaps and missing prerequisites into software-proven blocking findings', () => {
    const [finance, marketing] = buildCourseGateUnits(bundle(), coverage, new Set())
    expect(finance.softwareFindings).toEqual([expect.objectContaining({ check_id: 'item_level_coverage', affected_ids: ['i-crowd'], disposition: 'blocking' })])
    expect(marketing.softwareFindings).toEqual([expect.objectContaining({ check_id: 'prerequisite_closure', affected_ids: ['MKT-2', 'MKT-1'], disposition: 'blocking' })])
  })

  it('gives the reviewer only its own section, covered items, changed-node flags and permitted sources', () => {
    const [finance] = buildCourseGateUnits(bundle(), coverage, new Set(['FIN-8']))
    expect(finance.payload).toMatchObject({
      unit_id: '3.5.3',
      named_items: [{ id: 'i-loan', label: 'Loans', kind: 'concept' }],
      mapped_nodes: [expect.objectContaining({ subject_id: 'FIN-8', changed_since_last_assurance: true })],
      sources: [{ id: 'SRC-A', title: 'Open text', url: 'https://example.org' }],
    })
    expect([...finance.sourceIds]).toEqual(['SRC-A'])
  })

  it('passes AQA calculation conventions to the reviewer with the named items', () => {
    const [, marketing] = buildCourseGateUnits(bundle(['FIN-8', 'FIN-1', 'MKT-2', 'MKT-1']), coverage, new Set())
    expect(marketing.payload.named_items).toEqual([{ id: 'i-share', label: 'Market share', kind: 'formula', aqa_convention: 'firm sales / market sales × 100' }])
  })

  it('keeps a section fingerprint stable until its own inputs change', () => {
    const before = buildCourseGateUnits(bundle(), coverage, new Set())
    const otherSectionChanged = buildCourseGateUnits(bundle(['FIN-8', 'FIN-1', 'MKT-2', 'MKT-1']), coverage, new Set())
    expect(otherSectionChanged[0].fingerprint).toBe(before[0].fingerprint)
    expect(otherSectionChanged[1].fingerprint).not.toBe(before[1].fingerprint)
  })
})
