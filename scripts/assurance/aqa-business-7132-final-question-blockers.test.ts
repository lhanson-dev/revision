import { describe, expect, it } from 'vitest'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import {
  QUESTION_GENERATION_INSTRUCTIONS,
  generationPayload,
  type ResolvedSpec,
} from './aqa-business-7132-slice-questions'

describe('AQA 7132 final question blocker regressions', () => {
  it('requires every item in a multi-target question to be directly assessed', () => {
    const spec: ResolvedSpec = {
      id: 'q-paired-targets',
      family: 'SHORT_ANSWER',
      marks: 4,
      commandWord: 'Explain',
      ao: ['AO1', 'AO2'],
      itemSuffixes: ['social-enterprise', 'limited-and-unlimited-liability'],
      formulaIds: [],
      brief: 'Explain a point that tests both target items.',
      items: [
        {
          id: 'aqa-7132-3.1.2:social-enterprise',
          section: '3.1.2',
          label: 'Social enterprise',
          kind: 'concept',
          taughtBy: ['bus-fnd-003'],
        },
        {
          id: 'aqa-7132-3.1.2:limited-and-unlimited-liability',
          section: '3.1.2',
          label: 'Limited and unlimited liability',
          kind: 'concept',
          taughtBy: ['bus-fnd-003'],
        },
      ],
      nodeIds: ['bus-fnd-003'],
    }

    const payload = generationPayload({ spec, teaching: [], feedback: [] })
    expect(payload.target_item_rule).toContain('Every target item must be directly required by the question stem')
    expect(payload.target_item_rule).toContain('merely mentioned in the context does not count')
    expect(payload.target_item_rule).toContain('mark scheme must not award knowledge or application that the stem does not explicitly require')
    expect(QUESTION_GENERATION_INSTRUCTIONS).toContain('Obey target_item_rule exactly')
  })

  it('teaches the role of regulators in the mapped Foundation node using registered reusable provenance', async () => {
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const node = candidate.nodes.get('BUS-FND-009')
    const definitions = node?.teaching_content?.definitions ?? []
    expect(definitions.some((definition: string) => definition.startsWith('regulators:'))).toBe(true)
    expect(candidate.rows.get('BUS-FND-009')?.subject_truth_sources).toContain('SRC-OER-LOUIS-BUSINESS-2022')
    expect(candidate.changedSinceAssurance).toContain('BUS-FND-009')
  })
})
