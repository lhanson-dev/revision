import { describe, expect, it } from 'vitest'
import type { Ledger } from '../../src/content-factory/fast-path-review'
import {
  remediationFindingsForSlot,
  type MockGenerationUnit,
  type MockPlan,
  type MockPlanSlot,
  type MockQuestion,
} from './aqa-business-7132-mock-generation'
import {
  applyFounderUnitFixDecision,
  founderUnitFixFeedbackTargets,
  type FounderMockUnitResolution,
} from './aqa-business-7132-mock-founder-unit-resolution'

const p301: MockPlanSlot = {
  slot_id: 'P3-01',
  marks: 12,
  command_category: 'analyse',
  ao_marks: { AO1: 3, AO2: 3, AO3: 6, AO4: 0 },
  quantitative_marks: 4,
  context_id: 'P3-CASE-1',
  context_owner: 'paper',
  section_id: null,
  choice_group: null,
  required_in_response_path: true,
  required_course_truth_requirement_ids: ['AQA-7132-NETWORK'],
  required_subject_node_ids: ['BUS-NETWORK'],
  coverage_evidence_rule: 'target_is_directly_demanded_and_necessary_for_full_marks',
}

const unit: MockGenerationUnit = {
  unit_id: 'P3-CASE-1',
  component_id: '7132/3',
  context_policy: 'shared',
  slots: [
    p301,
    { ...p301, slot_id: 'P3-02' },
    { ...p301, slot_id: 'P3-03', quantitative_marks: 0 },
  ],
}

const plan = { plan_fingerprint: 'plan-1', papers: [] } as unknown as MockPlan

const questionFinding = {
  check_id: 'question_validity',
  category: 'missing_examinable_item' as const,
  affected_ids: ['P3-CASE-1', 'P3-01'],
  finding: 'P3-01 omits part of the planned network-analysis demand.',
  evidence: 'review evidence',
  contradicting_source_id: null,
  proposed_fix: 'Require activity-on-arrow and total float.',
  disposition: 'blocking' as const,
  reason: 'failed question_validity',
}
const markFinding = {
  ...questionFinding,
  check_id: 'mark_scheme_validity',
  finding: 'Top-band credit does not require both network skills.',
  reason: 'failed mark_scheme_validity',
}
const loggedFinding = {
  check_id: 'exam_authenticity',
  category: 'opinion_or_style' as const,
  affected_ids: ['P3-CASE-1', 'P3-03'],
  finding: 'Stylistic overlap.',
  evidence: 'review evidence',
  contradicting_source_id: null,
  proposed_fix: 'Consider varying later.',
  disposition: 'logged' as const,
  reason: 'opinion_or_style is logged, not blocking',
}

const ledger: Ledger = {
  schema_version: 1,
  stage: 'aqa-7132-mock-generation',
  checklist_version: 'mock-generation-v1',
  units: {
    'P3-CASE-1': {
      fingerprint: 'unit-old',
      outcome: 'escalated',
      consecutive_blocking_rounds: 2,
      findings: [questionFinding, markFinding, loggedFinding],
      updated_at: '2026-10-06T11:29:21.638Z',
    },
  },
}

const resolution: FounderMockUnitResolution = {
  resolution_id: 'unit-resolution-1',
  plan_fingerprint: 'plan-1',
  source_run_id: 37455690641,
  unit_id: 'P3-CASE-1',
  escalated_fingerprint: 'unit-old',
  decision: 'fix',
  decided_at: '2026-10-06',
  check_ids: ['question_validity', 'mark_scheme_validity'],
  note: 'Fix only P3-01.',
  slot_fixes: {
    'P3-01': {
      instruction: 'Require a drawn or completed activity-on-arrow network and total float.',
      required_stem_phrases: ['activity-on-arrow', 'total float'],
      required_stem_any_phrases: ['draw', 'complete', 'construct'],
      required_top_level_phrases: ['activity-on-arrow', 'total float'],
      required_mark_scheme_phrases: ['activity-on-arrow', 'total float'],
    },
  },
}

function fixedQuestion(): MockQuestion {
  return {
    slot_id: 'P3-01',
    family: 'CASE_STUDY',
    command_word: 'Analyse',
    marks: 12,
    ao_marks: { AO1: 3, AO2: 3, AO3: 6, AO4: 0 },
    context: '',
    stem: 'Draw an activity-on-arrow network, calculate total float and analyse the implementation decision.',
    table: null,
    options: [],
    mark_scheme: {
      type: 'levels',
      correct_option: '',
      option_rationale: [],
      points: [],
      levels: [
        { level: 1, min_marks: 1, max_marks: 4, descriptor: 'Limited.' },
        { level: 2, min_marks: 5, max_marks: 8, descriptor: 'Developed.' },
        { level: 3, min_marks: 9, max_marks: 12, descriptor: 'Top-band work requires a valid activity-on-arrow representation and correct total float.' },
      ],
      indicative_content: ['Valid activity-on-arrow network.', 'Correct total float.', 'Contextual implementation analysis.'],
      model_answer: 'A valid activity-on-arrow network shows the dependencies and the total float is calculated before analysis.',
    },
    calculations: [
      { label: 'route_one', method: 'sum', operands: [2, 4, 3, 2], stated_answer: 11, unit: 'weeks', marks_supported: 1 },
      { label: 'route_two', method: 'sum', operands: [2, 3, 3, 2], stated_answer: 10, unit: 'weeks', marks_supported: 1 },
      { label: 'project_duration', method: 'sum', operands: [2, 4, 3, 2], stated_answer: 11, unit: 'weeks', marks_supported: 1 },
      { label: 'total_float', method: 'difference', operands: [11, 10], stated_answer: 1, unit: 'week', marks_supported: 1 },
    ],
  }
}

describe('AQA 7132 Founder unit escalation resolution', () => {
  it('targets only P3-01 from the exact escalated unit finding', () => {
    const feedback = founderUnitFixFeedbackTargets(plan, unit, ledger.units['P3-CASE-1'], [resolution])
    expect([...feedback.keys()]).toEqual(['P3-01'])
    expect(feedback.get('P3-01')).toHaveLength(2)
    expect(feedback.get('P3-01')?.every((finding) => finding.affected_ids[0] === 'P3-01')).toBe(true)
  })

  it('records the unit as Founder-resolved only after both network skills are explicit', () => {
    const result = applyFounderUnitFixDecision({
      plan,
      unit,
      unitFingerprint: 'unit-new',
      questions: new Map([['P3-01', fixedQuestion()]]),
      ledger,
      resolutions: [resolution],
      now: () => '2026-10-06T12:30:00.000Z',
    })
    expect(result.applied).toBe(true)
    expect(result.ledger.units['P3-CASE-1'].outcome).toBe('passed')
    expect(result.ledger.units['P3-CASE-1'].fingerprint).toBe('unit-new')
    expect(result.ledger.units['P3-CASE-1'].founder_decision?.decision).toBe('fix')
  })

  it('fails closed when total float is missing from the top band', () => {
    const weak = fixedQuestion()
    weak.mark_scheme.levels[2].descriptor = 'Top-band work requires a valid activity-on-arrow representation.'
    expect(() => applyFounderUnitFixDecision({
      plan,
      unit,
      unitFingerprint: 'unit-new',
      questions: new Map([['P3-01', weak]]),
      ledger,
      resolutions: [resolution],
    })).toThrow('mock_founder_unit_resolution_top_level_contract_failed')
  })

  it('does not remediate unaffected slots or logged-only findings', () => {
    const slots = ['P3-01', 'P3-02', 'P3-03']
    expect(remediationFindingsForSlot([questionFinding, loggedFinding], 'P3-01', slots)).toEqual([questionFinding])
    expect(remediationFindingsForSlot([questionFinding, loggedFinding], 'P3-02', slots)).toEqual([])
    expect(remediationFindingsForSlot([questionFinding, loggedFinding], 'P3-03', slots)).toEqual([])
  })

  it('still applies a truly unit-wide blocker to every slot', () => {
    const broad = {
      ...questionFinding,
      check_id: 'context_coherence',
      affected_ids: ['P3-CASE-1'],
      finding: 'The shared context is broken for the unit.',
    }
    const slots = ['P3-01', 'P3-02']
    expect(remediationFindingsForSlot([broad], 'P3-01', slots)).toEqual([broad])
    expect(remediationFindingsForSlot([broad], 'P3-02', slots)).toEqual([broad])
  })
})
