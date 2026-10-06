import { describe, expect, it } from 'vitest'
import type { Ledger } from '../../src/content-factory/fast-path-review'
import type { MockPlan, MockPlanPaper, MockQuestion } from './aqa-business-7132-mock-generation'
import {
  applyFounderFixDecision,
  founderFixFeedbackTargets,
  type FounderMockResolution,
} from './aqa-business-7132-mock-founder-resolution'

const paper: MockPlanPaper = {
  component_id: '7132/3',
  name: 'Business 3',
  duration_minutes: 120,
  attempted_raw_marks: 100,
  printed_raw_marks: 100,
  slots: [
    { slot_id: 'P3-04', marks: 16, command_category: 'extended_evaluation', ao_marks: { AO1: 3, AO2: 3, AO3: 5, AO4: 5 }, quantitative_marks: 0, context_id: 'P3-CASE-1', context_owner: 'paper', section_id: null, choice_group: null, required_in_response_path: true, required_course_truth_requirement_ids: ['AQA-7132-3.5.4'], required_subject_node_ids: ['BUS-FIN-012'], coverage_evidence_rule: 'target_is_directly_demanded_and_necessary_for_full_marks' },
    { slot_id: 'P3-05', marks: 20, command_category: 'extended_evaluation', ao_marks: { AO1: 3, AO2: 3, AO3: 5, AO4: 9 }, quantitative_marks: 0, context_id: 'P3-CASE-1', context_owner: 'paper', section_id: null, choice_group: null, required_in_response_path: true, required_course_truth_requirement_ids: ['AQA-7132-3.10.1'], required_subject_node_ids: ['BUS-MOD-005'], coverage_evidence_rule: 'target_is_directly_demanded_and_necessary_for_full_marks' },
  ],
}

const plan = { plan_fingerprint: 'plan-1', papers: [paper] } as MockPlan
const blockingFinding = {
  check_id: 'synoptic_validity',
  category: 'missing_examinable_item' as const,
  affected_ids: ['7132/3', 'P3-04', 'P3-05'],
  finding: 'Mapped targets are not necessary for top-level performance.',
  evidence: 'review evidence',
  contradicting_source_id: null,
  proposed_fix: 'make them necessary',
  disposition: 'blocking' as const,
  reason: 'failed synoptic_validity',
}
const ledger: Ledger = {
  schema_version: 1,
  stage: 'aqa-7132-mock-whole-paper',
  checklist_version: 'mock-whole-paper-v1',
  units: {
    '7132/3': {
      fingerprint: 'paper-old',
      outcome: 'escalated',
      consecutive_blocking_rounds: 2,
      findings: [blockingFinding],
      updated_at: '2026-10-06T09:26:44.932Z',
    },
  },
}
const resolution: FounderMockResolution = {
  resolution_id: 'resolution-1',
  plan_fingerprint: 'plan-1',
  source_run_id: 37442073531,
  unit_id: '7132/3',
  escalated_fingerprint: 'paper-old',
  decision: 'fix',
  decided_at: '2026-10-06',
  check_id: 'synoptic_validity',
  note: 'Fix only P3-04 and P3-05.',
  slot_fixes: {
    'P3-04': {
      instruction: 'Require operating profit margin interpretation.',
      required_stem_phrases: ['operating profit margin'],
      required_level4_phrases: ['operating profit margin'],
      required_mark_scheme_phrases: ['operating profit margin'],
    },
    'P3-05': {
      instruction: "Require Lewin's change model.",
      required_stem_phrases: ["Lewin's change model"],
      required_level4_phrases: ["Lewin's change model"],
      required_mark_scheme_phrases: ["Lewin's change model"],
    },
  },
}

function question(slotId: string, phrase: string, marks: number): MockQuestion {
  return {
    slot_id: slotId,
    family: 'CASE_STUDY',
    command_word: 'Evaluate',
    marks,
    ao_marks: slotId === 'P3-04' ? { AO1: 3, AO2: 3, AO3: 5, AO4: 5 } : { AO1: 3, AO2: 3, AO3: 5, AO4: 9 },
    context: '',
    stem: `Evaluate this decision. Your full-mark response must apply ${phrase}.`,
    table: null,
    options: [],
    mark_scheme: {
      type: 'levels',
      correct_option: '',
      option_rationale: [],
      points: [],
      levels: [
        { level: 1, min_marks: 1, max_marks: 4, descriptor: 'Limited.' },
        { level: 2, min_marks: 5, max_marks: 8, descriptor: 'Some.' },
        { level: 3, min_marks: 9, max_marks: marks === 16 ? 12 : 15, descriptor: 'Developed.' },
        { level: 4, min_marks: marks === 16 ? 13 : 16, max_marks: marks, descriptor: `Top-level response must apply ${phrase}.` },
      ],
      indicative_content: [phrase, 'context', 'judgement'],
      model_answer: `A strong answer applies ${phrase}.`,
    },
    calculations: [],
  }
}

describe('AQA 7132 Founder mock escalation resolution', () => {
  it('targets only the slots named in the exact escalated finding', () => {
    const feedback = founderFixFeedbackTargets(plan, paper, ledger.units['7132/3'], [resolution])
    expect([...feedback.keys()].sort()).toEqual(['P3-04', 'P3-05'])
    expect(feedback.get('P3-04')?.[0].affected_ids).toEqual(['P3-04'])
    expect(feedback.get('P3-05')?.[0].affected_ids).toEqual(['P3-05'])
  })

  it('does not apply a stale resolution to a different escalated fingerprint', () => {
    const stale = structuredClone(ledger)
    stale.units['7132/3'].fingerprint = 'different'
    expect(founderFixFeedbackTargets(plan, paper, stale.units['7132/3'], [resolution]).size).toBe(0)
  })

  it('reuses retained questions that already satisfy the exact Founder fix contract', () => {
    const retained = new Map<string, MockQuestion>([
      ['P3-04', question('P3-04', 'operating profit margin', 16)],
      ['P3-05', question('P3-05', "Lewin's change model", 20)],
    ])
    const feedback = founderFixFeedbackTargets(plan, paper, ledger.units['7132/3'], [resolution], retained)
    expect([...feedback.keys()]).toEqual([])
  })

  it('treats typographic punctuation as equivalent in exact Founder phrase contracts', () => {
    const retained = new Map<string, MockQuestion>([
      ['P3-04', question('P3-04', 'operating profit margin', 16)],
      ['P3-05', question('P3-05', 'Lewin’s change model', 20)],
    ])
    const feedback = founderFixFeedbackTargets(plan, paper, ledger.units['7132/3'], [resolution], retained)
    expect([...feedback.keys()]).toEqual([])

    const result = applyFounderFixDecision({
      plan,
      paper,
      paperFingerprint: 'paper-new-typographic',
      questions: retained,
      ledger,
      resolutions: [resolution],
      now: () => '2026-10-06T13:30:00.000Z',
    })
    expect(result.applied).toBe(true)
    expect(result.ledger.units['7132/3'].outcome).toBe('passed')
  })

  it('keeps remediation targeted when only one retained question satisfies the contract', () => {
    const retained = new Map<string, MockQuestion>([
      ['P3-04', question('P3-04', 'operating profit margin', 16)],
    ])
    const feedback = founderFixFeedbackTargets(plan, paper, ledger.units['7132/3'], [resolution], retained)
    expect([...feedback.keys()]).toEqual(['P3-05'])
  })

  it('records the Founder fix as passed only after the paper changed and exact acceptance contract is met', () => {
    const questions = new Map<string, MockQuestion>([
      ['P3-04', question('P3-04', 'operating profit margin', 16)],
      ['P3-05', question('P3-05', "Lewin's change model", 20)],
    ])
    const result = applyFounderFixDecision({
      plan,
      paper,
      paperFingerprint: 'paper-new',
      questions,
      ledger,
      resolutions: [resolution],
      now: () => '2026-10-06T12:00:00.000Z',
    })
    expect(result.applied).toBe(true)
    expect(result.ledger.units['7132/3'].outcome).toBe('passed')
    expect(result.ledger.units['7132/3'].fingerprint).toBe('paper-new')
    expect(result.ledger.units['7132/3'].founder_decision?.decision).toBe('fix')
    expect(result.ledger.units['7132/3'].consecutive_blocking_rounds).toBe(0)
  })

  it('fails closed if a generated fix does not make the target explicit in the top band', () => {
    const weak = question('P3-04', 'operating profit margin', 16)
    weak.mark_scheme.levels[3].descriptor = 'Top-level contextual judgement.'
    expect(() => applyFounderFixDecision({
      plan,
      paper,
      paperFingerprint: 'paper-new',
      questions: new Map([
        ['P3-04', weak],
        ['P3-05', question('P3-05', "Lewin's change model", 20)],
      ]),
      ledger,
      resolutions: [resolution],
    })).toThrow('mock_founder_resolution_level4_contract_failed')
  })
})
