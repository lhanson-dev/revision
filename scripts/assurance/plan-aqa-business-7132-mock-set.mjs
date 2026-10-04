import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const PROFILE_PATH = 'content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json'
const CALIBRATION_PATH = 'content-factory/mock-exams/aqa-7132/CALIBRATION.json'
const NAMED_ITEMS_PATH = 'research/aqa-business-7132/2027/NAMED_ITEMS.json'
const MATERIALISER = 'scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'
const COURSE_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-truth.json'
const EXAM_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/exam-truth.json'
const OUT_DIR = '.artifacts/content-factory-aqa-business-7132-mock-plan'
const OUT_PATH = `${OUT_DIR}/mock-set-plan.json`

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
}

function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

function sumAo(slots) {
  const total = { AO1: 0, AO2: 0, AO3: 0, AO4: 0 }
  for (const slot of slots) for (const ao of Object.keys(total)) total[ao] += slot.ao_marks[ao] ?? 0
  return total
}

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  assert(a.length === e.length && a.every((value, index) => value === e[index]), `${label} mismatch`)
}

function aoBoundsFromQualificationPercent(range, qualificationMarks) {
  assert(Array.isArray(range) && range.length === 2, 'AO range must have two values')
  return [
    Math.ceil((range[0] / 100) * qualificationMarks - 1e-9),
    Math.floor((range[1] / 100) * qualificationMarks + 1e-9),
  ]
}

function inRange(value, range) {
  return value >= range[0] && value <= range[1]
}

function majorSection(requirementId) {
  return requirementId.split('.').slice(0, 2).join('.')
}

function slot(slot_id, marks, command_category, target_sections, ao_marks, options = {}) {
  return {
    slot_id,
    marks,
    command_category,
    target_sections,
    ao_marks,
    quantitative_marks: options.quantitative_marks ?? 0,
    context_id: options.context_id ?? null,
    choice_group: options.choice_group ?? null,
    required_for_attempt: options.required_for_attempt ?? true,
    family: options.family,
    target_demand_rule: 'all_named_targets_must_be_directly_demanded_and_necessary_for_full_marks',
  }
}

function paper1Slots() {
  const slots = []
  const mcqSections = [
    '3.1.1', '3.1.2', '3.1.3', '3.2.1', '3.2.2',
    '3.2.3', '3.3.1', '3.3.3', '3.4.1', '3.4.3',
    '3.4.4', '3.5.1', '3.6.1', '3.7.1', '3.9.2',
  ]
  for (let index = 0; index < mcqSections.length; index += 1) {
    const number = String(index + 1).padStart(2, '0')
    slots.push(slot(
      `P1-A-${number}`,
      1,
      'selected_response',
      [mcqSections[index]],
      index < 9 ? { AO1: 1, AO2: 0, AO3: 0, AO4: 0 } : { AO1: 0, AO2: 1, AO3: 0, AO4: 0 },
      { family: 'MCQ', quantitative_marks: index === 0 ? 1 : 0 },
    ))
  }

  slots.push(
    slot('P1-B-01', 4, 'calculate', ['3.3.2'], { AO1: 1, AO2: 3, AO3: 0, AO4: 0 }, { family: 'SHORT_ANSWER', quantitative_marks: 4 }),
    slot('P1-B-02', 4, 'calculate', ['3.4.2'], { AO1: 1, AO2: 3, AO3: 0, AO4: 0 }, { family: 'SHORT_ANSWER', quantitative_marks: 4 }),
    slot('P1-B-03', 4, 'explain', ['3.4.5'], { AO1: 2, AO2: 2, AO3: 0, AO4: 0 }, { family: 'SHORT_ANSWER' }),
    slot('P1-B-04', 5, 'explain', ['3.5.3'], { AO1: 2, AO2: 3, AO3: 0, AO4: 0 }, { family: 'SHORT_ANSWER' }),
    slot('P1-B-05', 9, 'analyse', ['3.5.4'], { AO1: 2, AO2: 4, AO3: 3, AO4: 0 }, { family: 'SHORT_ANSWER' }),
    slot('P1-B-06', 9, 'analyse', ['3.6.3'], { AO1: 2, AO2: 4, AO3: 3, AO4: 0 }, { family: 'SHORT_ANSWER' }),
    slot('P1-C-01', 25, 'extended_evaluation', ['3.7.4', '3.7.5'], { AO1: 6, AO2: 3, AO3: 8, AO4: 8 }, { family: 'ESSAY', choice_group: 'P1-C', required_for_attempt: false }),
    slot('P1-C-02', 25, 'extended_evaluation', ['3.7.6', '3.7.7'], { AO1: 6, AO2: 3, AO3: 8, AO4: 8 }, { family: 'ESSAY', choice_group: 'P1-C', required_for_attempt: false }),
    slot('P1-D-01', 25, 'extended_evaluation', ['3.8.1', '3.8.2'], { AO1: 5, AO2: 2, AO3: 6, AO4: 12 }, { family: 'ESSAY', choice_group: 'P1-D', required_for_attempt: false }),
    slot('P1-D-02', 25, 'extended_evaluation', ['3.9.1', '3.9.3'], { AO1: 5, AO2: 2, AO3: 6, AO4: 12 }, { family: 'ESSAY', choice_group: 'P1-D', required_for_attempt: false }),
  )
  return slots
}

function paper2Slots() {
  return [
    slot('P2-S1-01', 3, 'describe', ['3.3.4'], { AO1: 3, AO2: 0, AO3: 0, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-1' }),
    slot('P2-S1-02', 3, 'calculate', ['3.5.2'], { AO1: 1, AO2: 2, AO3: 0, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-1', quantitative_marks: 3 }),
    slot('P2-S1-03', 9, 'analyse', ['3.3.2'], { AO1: 2, AO2: 4, AO3: 3, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-1' }),
    slot('P2-S1-04', 20, 'extended_evaluation', ['3.5.4', '3.7.3'], { AO1: 2, AO2: 5, AO3: 6, AO4: 7 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-1' }),

    slot('P2-S2-01', 6, 'explain', ['3.6.4'], { AO1: 3, AO2: 3, AO3: 0, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-2' }),
    slot('P2-S2-02', 9, 'analyse', ['3.6.2'], { AO1: 2, AO2: 3, AO3: 4, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-2', quantitative_marks: 6 }),
    slot('P2-S2-03', 16, 'extended_evaluation', ['3.6.5', '3.6.3'], { AO1: 2, AO2: 4, AO3: 5, AO4: 5 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-2' }),

    slot('P2-S3-01', 9, 'analyse', ['3.10.3'], { AO1: 2, AO2: 3, AO3: 4, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-3', quantitative_marks: 9 }),
    slot('P2-S3-02', 9, 'analyse', ['3.9.4'], { AO1: 2, AO2: 3, AO3: 4, AO4: 0 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-3' }),
    slot('P2-S3-03', 16, 'extended_evaluation', ['3.9.2', '3.7.1'], { AO1: 2, AO2: 2, AO3: 2, AO4: 10 }, { family: 'DATA_RESPONSE', context_id: 'P2-CTX-3' }),
  ]
}

function paper3Slots() {
  return [
    slot('P3-Q-01', 12, 'analyse', ['3.2.2'], { AO1: 3, AO2: 3, AO3: 6, AO4: 0 }, { family: 'CASE_STUDY', context_id: 'P3-CASE-1', quantitative_marks: 6 }),
    slot('P3-Q-02', 12, 'analyse', ['3.4.5', '3.4.3'], { AO1: 3, AO2: 3, AO3: 6, AO4: 0 }, { family: 'CASE_STUDY', context_id: 'P3-CASE-1' }),
    slot('P3-Q-03', 16, 'evaluate', ['3.5.4', '3.5.1'], { AO1: 3, AO2: 3, AO3: 5, AO4: 5 }, { family: 'CASE_STUDY', context_id: 'P3-CASE-1' }),
    slot('P3-Q-04', 16, 'extended_evaluation', ['3.6.3', '3.6.1'], { AO1: 3, AO2: 3, AO3: 4, AO4: 6 }, { family: 'CASE_STUDY', context_id: 'P3-CASE-1' }),
    slot('P3-Q-05', 20, 'extended_evaluation', ['3.9.3', '3.7.5'], { AO1: 3, AO2: 3, AO3: 5, AO4: 9 }, { family: 'CASE_STUDY', context_id: 'P3-CASE-1' }),
    slot('P3-Q-06', 24, 'extended_evaluation', ['3.10.1', '3.7.7'], { AO1: 3, AO2: 3, AO3: 6, AO4: 12 }, { family: 'CASE_STUDY', context_id: 'P3-CASE-1' }),
  ]
}

function itemPreferences(slotDef, targetIndex) {
  if (slotDef.quantitative_marks > 0 && targetIndex === 0) return ['formula']
  if (slotDef.command_category === 'selected_response') return ['concept', 'model', 'formula', 'skill']
  if (slotDef.command_category === 'calculate') return ['formula']
  if (['describe', 'explain'].includes(slotDef.command_category)) return ['concept', 'model', 'skill', 'formula']
  return ['skill', 'model', 'concept', 'formula']
}

function selectNamedTargets(slotDef, namedItemsBySection, usedNamedItemIds) {
  return slotDef.target_sections.map((section, targetIndex) => {
    const candidates = namedItemsBySection.get(section) ?? []
    assert(candidates.length > 0, `${slotDef.slot_id} has no named-item candidates for ${section}`)
    const preferences = itemPreferences(slotDef, targetIndex)
    let selected = null
    for (const kind of preferences) {
      selected = candidates.find((item) => item.kind === kind && !usedNamedItemIds.has(item.id))
      if (selected) break
    }
    if (!selected) selected = candidates.find((item) => !usedNamedItemIds.has(item.id))
    assert(selected, `${slotDef.slot_id} cannot allocate an unused named item for ${section}`)
    usedNamedItemIds.add(selected.id)
    return {
      course_requirement_id: section,
      named_item_id: selected.id,
      label: selected.label,
      kind: selected.kind,
      direct_demand_required: true,
      necessary_for_full_marks: true,
    }
  })
}

function hydrateSlots(slotDefs, namedItemsBySection, usedNamedItemIds, requirements) {
  return slotDefs.map((slotDef) => {
    assert(sum(Object.values(slotDef.ao_marks)) === slotDef.marks, `${slotDef.slot_id} AO marks do not reconcile`)
    assert(slotDef.quantitative_marks >= 0 && slotDef.quantitative_marks <= slotDef.marks, `${slotDef.slot_id} has invalid quantitative marks`)
    for (const section of slotDef.target_sections) assert(requirements.has(section), `${slotDef.slot_id} references unknown Course Truth requirement ${section}`)
    const targets = selectNamedTargets(slotDef, namedItemsBySection, usedNamedItemIds)
    if (slotDef.quantitative_marks > 0) assert(targets.some((target) => target.kind === 'formula'), `${slotDef.slot_id} claims quantitative marks without a formula target`)
    return { ...slotDef, targets }
  })
}

function contextPlans() {
  return {
    '7132/1': {
      mode: 'independent_question_contexts',
      source_policy: 'synthetic_or_context_free_as_required_by_slot',
      coherence_rule: 'No Paper 1 slot may depend on facts invented by another independent slot.',
    },
    '7132/2': {
      mode: 'three_shared_data_response_contexts',
      contexts: [
        {
          context_id: 'P2-CTX-1',
          scope: 'consumer_business_market_and_financial_decision',
          source_policy: 'synthetic_business_and_synthetic_data',
          required_fact_domains: ['marketing_mix', 'market_data', 'financial_performance', 'business_performance'],
        },
        {
          context_id: 'P2-CTX-2',
          scope: 'growing_service_business_people_and_workforce_decision',
          source_policy: 'synthetic_business_and_synthetic_data',
          required_fact_domains: ['motivation', 'hr_metrics', 'employee_relations', 'organisational_design'],
        },
        {
          context_id: 'P2-CTX-3',
          scope: 'technology_business_implementation_and_strategy_decision',
          source_policy: 'synthetic_business_and_synthetic_data',
          required_fact_domains: ['network_analysis', 'digital_technology', 'innovation', 'strategy'],
        },
      ],
      coherence_rule: 'Every part in a set must use the same fixed context facts and dataset; later parts may not invent conflicting facts.',
    },
    '7132/3': {
      mode: 'single_shared_case_study',
      contexts: [
        {
          context_id: 'P3-CASE-1',
          scope: 'multi_market_business_facing_cross_functional_strategic_choices',
          source_policy: 'synthetic_business_and_synthetic_data',
          required_fact_domains: ['decision_making', 'operations', 'finance', 'people', 'internationalisation', 'change', 'competition'],
        },
      ],
      coherence_rule: 'All six questions must use one fixed case-study fact state and dataset; no question may add a conflicting case fact.',
    },
  }
}

function responsePathsForPaper1(slots) {
  const compulsory = slots.filter((item) => item.required_for_attempt)
  const c = slots.filter((item) => item.choice_group === 'P1-C')
  const d = slots.filter((item) => item.choice_group === 'P1-D')
  assert(c.length === 2 && d.length === 2, 'Paper 1 choice groups changed unexpectedly')
  const paths = []
  for (const cOption of c) for (const dOption of d) {
    const selected = [...compulsory, cOption, dOption]
    paths.push({
      path_id: `${cOption.slot_id}+${dOption.slot_id}`,
      selected_slot_ids: selected.map((item) => item.slot_id),
      attempted_marks: sum(selected.map((item) => item.marks)),
      ao_marks: sumAo(selected),
      quantitative_marks: sum(selected.map((item) => item.quantitative_marks)),
    })
  }
  return paths
}

function validatePaperAo(componentId, aoMarks, profile) {
  const qualificationMarks = profile.invariants.total_attempted_raw_marks
  for (const ao of ['AO1', 'AO2', 'AO3', 'AO4']) {
    const range = profile.invariants.assessment_objectives[ao].paper_percent_ranges[componentId]
    const bounds = aoBoundsFromQualificationPercent(range, qualificationMarks)
    assert(inRange(aoMarks[ao], bounds), `${componentId} ${ao} planned marks ${aoMarks[ao]} are outside ${bounds[0]}-${bounds[1]}`)
  }
}

function validateCalibration(calibration, profile) {
  assert(calibration.schema_version === 1, 'Unexpected calibration schema version')
  assert(calibration.course_id === profile.course_id && calibration.exam_year === profile.exam_year, 'Calibration does not match Mock Profile course/version')
  assert(calibration.status === 'REFERENCE_ONLY_DERIVED_METADATA', 'Calibration rights status changed unexpectedly')
  assert(Array.isArray(calibration.sources) && calibration.sources.every((source) => source.rights_classification === 'REFERENCE_ONLY'), 'Calibration source rights boundary is invalid')
  assert(calibration.observations?.['7132/1']?.section_b?.tariffs?.join(',') === '4,4,4,5,9,9', 'Paper 1 Section B calibration shape changed')
  assert(calibration.observations?.['7132/2']?.sets?.map((set) => set.attempted_marks).join(',') === '35,31,34', 'Paper 2 calibration set totals changed')
  assert(calibration.observations?.['7132/3']?.single_case_question_tariffs?.join(',') === '12,12,16,16,20,24', 'Paper 3 calibration tariff shape changed')
}

function validatePlan(plan, profile, courseTruth, namedItems) {
  assert(plan.schema_version === 1, 'Unexpected mock plan schema version')
  assert(plan.course_id === profile.course_id && plan.exam_year === profile.exam_year, 'Mock plan course/version mismatch')
  assert(plan.provider_calls_started === false, 'Deterministic planner must not start provider calls')
  assert(plan.learner_content_created === false, 'Paper planner must not create learner content')
  assert(plan.rights_boundary.awarding_body_use === 'REFERENCE_ONLY', 'Plan rights boundary drift')
  assert(plan.rights_boundary.context_source === 'synthetic_business_and_synthetic_data', 'Synthetic mock context default drift')
  assert(plan.papers.length === 3, 'Mock set must contain three papers')
  exactSet(plan.papers.map((paper) => paper.component_id), ['7132/1', '7132/2', '7132/3'], 'Mock plan component IDs')

  const namedItemIds = new Set(namedItems.items.map((item) => item.id))
  const allSlots = plan.papers.flatMap((paper) => paper.slots)
  assert(new Set(allSlots.map((item) => item.slot_id)).size === allSlots.length, 'Duplicate mock plan slot IDs')
  const targetSignatures = new Set()
  for (const plannedSlot of allSlots) {
    assert(sum(Object.values(plannedSlot.ao_marks)) === plannedSlot.marks, `${plannedSlot.slot_id} AO sum does not equal marks`)
    assert(plannedSlot.targets.length === plannedSlot.target_sections.length, `${plannedSlot.slot_id} target allocation mismatch`)
    const signature = plannedSlot.targets.map((target) => target.named_item_id).sort().join('|')
    assert(!targetSignatures.has(signature), `${plannedSlot.slot_id} duplicates an existing target signature`)
    targetSignatures.add(signature)
    for (const target of plannedSlot.targets) {
      assert(namedItemIds.has(target.named_item_id), `${plannedSlot.slot_id} references unknown named item ${target.named_item_id}`)
      assert(target.direct_demand_required === true && target.necessary_for_full_marks === true, `${plannedSlot.slot_id} weakens target-demand rule`)
    }
    if (plannedSlot.quantitative_marks > 0) assert(plannedSlot.targets.some((target) => target.kind === 'formula'), `${plannedSlot.slot_id} quantitative allocation lacks formula evidence`)
  }

  const profileComponents = new Map(profile.components.map((component) => [component.component_id, component]))
  for (const paper of plan.papers) {
    const component = profileComponents.get(paper.component_id)
    assert(component, `${paper.component_id} is absent from Mock Profile`)
    assert(paper.duration_minutes === component.duration_minutes, `${paper.component_id} duration mismatch`)
    assert(paper.attempted_marks === component.attempted_raw_marks, `${paper.component_id} attempted-mark contract mismatch`)
    assert(paper.context_plan, `${paper.component_id} lacks a context plan`)
  }

  const paper1 = plan.papers.find((paper) => paper.component_id === '7132/1')
  assert(paper1.printed_marks === 150, 'Paper 1 printed marks must be 150 including optional essays')
  assert(paper1.response_paths.length === 4, 'Paper 1 must enumerate four permitted essay-choice paths')
  for (const path of paper1.response_paths) {
    assert(path.attempted_marks === 100, `${path.path_id} does not reconcile to 100 attempted marks`)
    validatePaperAo('7132/1', path.ao_marks, profile)
  }
  const firstPathAo = JSON.stringify(paper1.response_paths[0].ao_marks)
  assert(paper1.response_paths.every((path) => JSON.stringify(path.ao_marks) === firstPathAo), 'Paper 1 AO validity depends on selecting a particular essay option')

  for (const componentId of ['7132/2', '7132/3']) {
    const paper = plan.papers.find((candidate) => candidate.component_id === componentId)
    assert(sum(paper.slots.map((plannedSlot) => plannedSlot.marks)) === 100, `${componentId} does not reconcile to 100 attempted marks`)
    validatePaperAo(componentId, sumAo(paper.slots), profile)
  }

  const paper2 = plan.papers.find((paper) => paper.component_id === '7132/2')
  const setTotals = ['P2-CTX-1', 'P2-CTX-2', 'P2-CTX-3'].map((contextId) => sum(paper2.slots.filter((item) => item.context_id === contextId).map((item) => item.marks)))
  assert(setTotals.join(',') === '35,31,34', 'Paper 2 set totals no longer match the calibrated three-set shape')
  for (const contextId of ['P2-CTX-1', 'P2-CTX-2', 'P2-CTX-3']) {
    const partCount = paper2.slots.filter((item) => item.context_id === contextId).length
    assert(partCount >= 3 && partCount <= 4, `${contextId} must contain three or four parts`)
  }

  const paper3 = plan.papers.find((paper) => paper.component_id === '7132/3')
  assert(paper3.slots.length === 6 && paper3.slots.every((item) => item.context_id === 'P3-CASE-1'), 'Paper 3 must use six linked questions against one shared case')

  const quantitativeMarks = sum(allSlots.filter((item) => item.required_for_attempt).map((item) => item.quantitative_marks))
    + paper1.response_paths[0].selected_slot_ids
      .filter((id) => !paper1.slots.find((slotItem) => slotItem.slot_id === id)?.required_for_attempt)
      .reduce((total, id) => total + (paper1.slots.find((slotItem) => slotItem.slot_id === id)?.quantitative_marks ?? 0), 0)
  assert(quantitativeMarks >= profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set, `Mock set plans only ${quantitativeMarks} quantitative marks`)
  assert(quantitativeMarks === plan.summary.minimum_path_quantitative_marks, 'Quantitative summary drift')

  const overallAo = {
    ...sumAo(plan.papers.filter((paper) => paper.component_id !== '7132/1').flatMap((paper) => paper.slots)),
  }
  const p1Ao = paper1.response_paths[0].ao_marks
  for (const ao of ['AO1', 'AO2', 'AO3', 'AO4']) overallAo[ao] += p1Ao[ao]
  for (const ao of ['AO1', 'AO2', 'AO3', 'AO4']) {
    const bounds = aoBoundsFromQualificationPercent(profile.invariants.assessment_objectives[ao].overall_percent_range, profile.invariants.total_attempted_raw_marks)
    assert(inRange(overallAo[ao], bounds), `Whole-set ${ao} planned marks ${overallAo[ao]} are outside ${bounds[0]}-${bounds[1]}`)
  }
  assert(JSON.stringify(overallAo) === JSON.stringify(plan.summary.attempted_ao_marks), 'Whole-set AO summary drift')

  const requirementIds = new Set(courseTruth.requirements.map((requirement) => requirement.requirement_id))
  const coveredRequirements = new Set(allSlots.flatMap((plannedSlot) => plannedSlot.target_sections))
  for (const id of coveredRequirements) assert(requirementIds.has(id), `Plan covers unknown Course Truth requirement ${id}`)
  assert(coveredRequirements.size >= 30, `Mock set breadth is too narrow: only ${coveredRequirements.size} Course Truth requirements planned`)
  exactSet(new Set([...coveredRequirements].map(majorSection)), ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9', '3.10'], 'Mock set major-section breadth')
  assert(coveredRequirements.size === plan.summary.distinct_course_truth_requirements, 'Coverage summary drift')

  assert(plan.planning_guards.context_only_mentions_count_as_coverage === false, 'Context-only mentions cannot count as coverage')
  assert(plan.planning_guards.topic_prediction_prohibited === true, 'Topic prediction must remain prohibited')
  assert(plan.planning_guards.near_duplicate_text_check_required_after_generation === true, 'Generated questions must retain near-duplicate checking')
}

async function main() {
  const [profile, calibration, namedItems] = await Promise.all([
    readFile(PROFILE_PATH, 'utf8').then(JSON.parse),
    readFile(CALIBRATION_PATH, 'utf8').then(JSON.parse),
    readFile(NAMED_ITEMS_PATH, 'utf8').then(JSON.parse),
  ])
  validateCalibration(calibration, profile)

  execFileSync(process.execPath, [MATERIALISER], { stdio: 'pipe' })
  const [courseTruth, examTruth] = await Promise.all([
    readFile(COURSE_TRUTH_PATH, 'utf8').then(JSON.parse),
    readFile(EXAM_TRUTH_PATH, 'utf8').then(JSON.parse),
  ])

  assert(courseTruth.course.course_id === profile.course_id && courseTruth.course.exam_year === profile.exam_year, 'Current Course Truth does not match Mock Profile')
  assert(courseTruth.coverage?.projection_ready === true && courseTruth.coverage?.unresolved_requirement_count === 0, 'Current Course Truth is not fully projected')
  assert(examTruth.exam_truth_id === profile.exam_truth_id, 'Current Exam Truth does not match Mock Profile')
  assert(examTruth.exam_truth_fingerprint, 'Current Exam Truth fingerprint is missing')

  const requirements = new Map(courseTruth.requirements.map((requirement) => [requirement.requirement_id, requirement]))
  const namedItemsBySection = new Map()
  for (const item of namedItems.items) {
    if (!namedItemsBySection.has(item.section)) namedItemsBySection.set(item.section, [])
    namedItemsBySection.get(item.section).push(item)
  }

  const usedNamedItemIds = new Set()
  const p1Slots = hydrateSlots(paper1Slots(), namedItemsBySection, usedNamedItemIds, requirements)
  const p2Slots = hydrateSlots(paper2Slots(), namedItemsBySection, usedNamedItemIds, requirements)
  const p3Slots = hydrateSlots(paper3Slots(), namedItemsBySection, usedNamedItemIds, requirements)
  const responsePaths = responsePathsForPaper1(p1Slots)
  const contexts = contextPlans()

  const papers = [
    {
      component_id: '7132/1',
      name: 'Business 1',
      duration_minutes: 120,
      attempted_marks: 100,
      printed_marks: sum(p1Slots.map((item) => item.marks)),
      structure: '15 compulsory MCQs; 35 marks compulsory short answer; choose one 25-mark essay from C and one 25-mark essay from D',
      context_plan: contexts['7132/1'],
      slots: p1Slots,
      response_paths: responsePaths,
    },
    {
      component_id: '7132/2',
      name: 'Business 2',
      duration_minutes: 120,
      attempted_marks: 100,
      printed_marks: 100,
      structure: 'three compulsory coherent data-response sets',
      context_plan: contexts['7132/2'],
      slots: p2Slots,
      response_paths: [{ path_id: 'all_compulsory', selected_slot_ids: p2Slots.map((item) => item.slot_id), attempted_marks: 100, ao_marks: sumAo(p2Slots), quantitative_marks: sum(p2Slots.map((item) => item.quantitative_marks)) }],
    },
    {
      component_id: '7132/3',
      name: 'Business 3',
      duration_minutes: 120,
      attempted_marks: 100,
      printed_marks: 100,
      structure: 'one compulsory shared case study followed by six linked questions',
      context_plan: contexts['7132/3'],
      slots: p3Slots,
      response_paths: [{ path_id: 'all_compulsory', selected_slot_ids: p3Slots.map((item) => item.slot_id), attempted_marks: 100, ao_marks: sumAo(p3Slots), quantitative_marks: sum(p3Slots.map((item) => item.quantitative_marks)) }],
    },
  ]

  const firstPathAo = responsePaths[0].ao_marks
  const attemptedAoMarks = sumAo([...p2Slots, ...p3Slots])
  for (const ao of ['AO1', 'AO2', 'AO3', 'AO4']) attemptedAoMarks[ao] += firstPathAo[ao]
  const quantitativeMarks = responsePaths[0].quantitative_marks + sum(p2Slots.map((item) => item.quantitative_marks)) + sum(p3Slots.map((item) => item.quantitative_marks))
  const coveredRequirements = new Set([...p1Slots, ...p2Slots, ...p3Slots].flatMap((item) => item.target_sections))

  const planCore = {
    schema_version: 1,
    plan_id: 'aqa-business-7132-2027-mock-set-1-plan-v1',
    status: 'deterministic_pre_generation_plan',
    course_id: profile.course_id,
    exam_year: profile.exam_year,
    planner_version: 'aqa-7132-mock-planner-v1',
    dependencies: {
      mock_profile_id: profile.profile_id,
      mock_profile_fingerprint: fingerprint(profile),
      calibration_id: calibration.calibration_id,
      calibration_fingerprint: fingerprint(calibration),
      course_truth_projection_id: courseTruth.projection_id,
      course_truth_fingerprint: courseTruth.projection_fingerprint,
      exam_truth_id: examTruth.exam_truth_id,
      exam_truth_fingerprint: examTruth.exam_truth_fingerprint,
      named_items_fingerprint: fingerprint(namedItems),
    },
    rights_boundary: {
      awarding_body_use: 'REFERENCE_ONLY',
      learner_facing_content_source: 'Revision_authored_only',
      context_source: 'synthetic_business_and_synthetic_data',
      protected_assessment_content_reuse_allowed: false,
    },
    provider_calls_started: false,
    learner_content_created: false,
    planning_guards: {
      context_only_mentions_count_as_coverage: false,
      topic_prediction_prohibited: true,
      near_duplicate_text_check_required_after_generation: true,
      repeated_named_targets: 'prohibited_in_this_plan',
      shared_context_fact_state_must_be_fixed_before_question_generation: true,
      optional_path_validity_required: true,
    },
    papers,
    summary: {
      paper_count: 3,
      attempted_marks_per_set: 300,
      paper_1_printed_marks: 150,
      minimum_path_quantitative_marks: quantitativeMarks,
      required_minimum_quantitative_marks: profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set,
      attempted_ao_marks: attemptedAoMarks,
      attempted_ao_percent_of_qualification: Object.fromEntries(Object.entries(attemptedAoMarks).map(([ao, marks]) => [ao, Number(((marks / profile.invariants.total_attempted_raw_marks) * 100).toFixed(2))])),
      distinct_course_truth_requirements: coveredRequirements.size,
      governed_course_truth_requirements: courseTruth.coverage.governed_requirement_count,
      major_sections_covered: [...new Set([...coveredRequirements].map(majorSection))].sort(),
      distinct_named_items: usedNamedItemIds.size,
    },
    next_gate: 'whole_paper_generation_runner_with_spend_guard',
  }
  const plan = { ...planCore, plan_fingerprint: fingerprint(planCore) }
  validatePlan(plan, profile, courseTruth, namedItems)

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_PATH, `${JSON.stringify(plan, null, 2)}\n`)

  console.log(JSON.stringify({
    status: 'pass',
    planId: plan.plan_id,
    planFingerprint: plan.plan_fingerprint,
    output: OUT_PATH,
    paperCount: plan.summary.paper_count,
    attemptedMarks: plan.summary.attempted_marks_per_set,
    paper1ResponsePaths: responsePaths.length,
    minimumPathQuantitativeMarks: plan.summary.minimum_path_quantitative_marks,
    attemptedAoMarks: plan.summary.attempted_ao_marks,
    distinctCourseTruthRequirements: plan.summary.distinct_course_truth_requirements,
    distinctNamedItems: plan.summary.distinct_named_items,
    providerSpendStarted: false,
    nextGate: plan.next_gate,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
