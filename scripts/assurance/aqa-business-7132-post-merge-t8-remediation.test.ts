import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'
import { buildCourseGateUnits, COURSE_GATE_CHECKLIST, COURSE_GATE_INSTRUCTIONS, type CourseGateBundle, type CoverageReport } from './aqa-business-7132-course-gate'
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

  it('reviews board-specific presentation conventions as part of the exact-course projection without copying them into reusable nodes', () => {
    const bundle: CourseGateBundle = {
      exact_course_foundation_identity: { subject_foundation_fingerprint: 'foundation-1', selected_subject_node_ids: ['BUS-EVI-008'] },
      course_truth: {
        requirements: [
          {
            requirement_id: 'AQA-7132-3.10.3',
            source_section: '3.10.3',
            title: 'Implementing strategy',
            rights_safe_requirement_summary: 'Network analysis using the AQA activity-on-arrow presentation.',
            mapped_subject_node_ids: ['BUS-EVI-008'],
            required_course_facets: ['AQA_network_diagram_presentation_convention'],
          },
          {
            requirement_id: 'AQA-7132-3.1.1',
            source_section: '3.1.1',
            title: 'The nature and purpose of business',
            rights_safe_requirement_summary: 'Basic revenue measures.',
            mapped_subject_node_ids: ['BUS-EVI-008'],
          },
        ],
      },
      selected_subject_foundation_nodes: [
        {
          subject_id: 'BUS-EVI-008',
          teaching_content: { definitions: ['network analysis: reusable subject teaching'] },
          prerequisites: [],
          promotion_truth_source_ids: ['SRC-1'],
        },
      ],
      subject_truth_sources: [{ id: 'SRC-1', title: 'Reusable source', url: 'https://example.com/source' }],
    }
    const coverage: CoverageReport = {
      foundation_fingerprint: 'foundation-1',
      gaps: [],
      covered: [
        {
          id: 'aqa-7132-3.10.3:network-analysis',
          section: '3.10.3',
          label: 'Network analysis',
          kind: 'model',
          aqa_convention: 'Use an activity-on-arrow network with the AQA event-circle presentation.',
          convention_status: 'confirmed',
        },
        {
          id: 'aqa-7132-3.1.1:revenue',
          section: '3.1.1',
          label: 'Revenue',
          kind: 'formula',
          aqa_convention: 'selling price × quantity sold',
          convention_status: 'confirmed',
        },
      ],
    }

    const units = buildCourseGateUnits(bundle, coverage, new Set())
    const network = units.find((unit) => unit.unit_id === '3.10.3')!
    const revenue = units.find((unit) => unit.unit_id === '3.1.1')!
    const networkPayload = network.payload as { mapped_nodes: unknown[]; course_specific_projection?: { ownership: string; teaching_obligations: Array<{ id: string; aqa_convention?: string }> } }
    const revenuePayload = revenue.payload as { course_specific_projection?: unknown }

    expect(JSON.stringify(networkPayload.mapped_nodes)).not.toContain('activity-on-arrow')
    expect(networkPayload.course_specific_projection?.ownership).toContain('Course Truth')
    expect(networkPayload.course_specific_projection?.teaching_obligations).toEqual([
      expect.objectContaining({ id: 'aqa-7132-3.10.3:network-analysis', aqa_convention: expect.stringContaining('activity-on-arrow') }),
    ])
    expect(revenuePayload.course_specific_projection).toBeUndefined()
    expect(COURSE_GATE_CHECKLIST.checks.find((check) => check.id === 'mapping_sense')?.question).toContain('effective exact-course projection')
    expect(COURSE_GATE_INSTRUCTIONS).toContain('do not require them to be duplicated inside reusable mapped_nodes')
  })
})
