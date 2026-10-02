import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'

describe('AQA 7132 post-#499 T8 remediation', () => {
  it('teaches market conditions in reusable Business truth without leaking the AQA diagram convention into the Foundation', async () => {
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const node = candidate.nodes.get('BUS-FND-009')
    expect(node?.teaching_content?.definitions?.some((definition: string) => definition.startsWith('market conditions:'))).toBe(true)
    expect(candidate.changedSinceAssurance).toContain('BUS-FND-009')
    expect(JSON.stringify([...candidate.nodes.values()])).not.toContain('activity-on-arrow')
  })

  it('keeps the network presentation convention in exact AQA Course Truth and carries it into named-item metadata', () => {
    const requirement = mapping.requirements.find((row: { source_section: string }) => row.source_section === '3.10.3')
    expect(requirement?.gap_classification).toBe('D_COURSE_SPECIFIC_REQUIREMENT')
    expect(requirement?.required_course_facets).toContain('AQA_network_diagram_presentation_convention')
    expect(requirement?.rights_safe_requirement_summary).toContain('activity-on-arrow')
    expect(requirement?.rights_safe_requirement_summary).toContain('earliest event time')
    expect(requirement?.rights_safe_requirement_summary).toContain('latest event time')
    expect(mapping.rights_and_sources.network_analysis_teaching_guide_url).toContain('aqa.org.uk')
    expect(mapping.rights_and_sources.network_analysis_sample_paper_url).toContain('filestore.aqa.org.uk')

    const named = JSON.parse(readFileSync('research/aqa-business-7132/2027/NAMED_ITEMS.json', 'utf8')) as { items: Array<{ id: string; aqa_convention?: string; convention_status?: string }> }
    const item = named.items.find((entry) => entry.id === 'aqa-7132-3.10.3:network-analysis')
    expect(item?.convention_status).toBe('confirmed')
    expect(item?.aqa_convention).toContain('activity-on-arrow')
    expect(item?.aqa_convention).toContain('event number on the left')
  })
})
