import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const PROFILE_PATH = 'content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json'
const CALIBRATION_PATH = 'content-factory/mock-exams/aqa-7132/CALIBRATION.json'
const MATERIALISER = 'scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'
const COURSE_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-truth.json'
const EXAM_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/exam-truth.json'
const OUT_DIR = '.artifacts/content-factory-aqa-business-7132-mock-plan'
const OUT_PATH = `${OUT_DIR}/mock-set-plan.json`

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
}

function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function hashRank(seed, value) {
  return createHash('sha256').update(`${seed}:${value}`).digest('hex')
}

function deterministicOrder(items, seed) {
  return [...items].sort((a, b) => hashRank(seed, a.requirement_id).localeCompare(hashRank(seed, b.requirement_id)))
}

function isQuantitativeRequirement(requirement) {
  const evidence = JSON.stringify(requirement).toLowerCase()
  return /(expected_value|net_gain|market_growth|market_share|market_size|labour_productivity|unit_cost|capacity_utilisation|stock_control|break_even|margin_of_safety|contribution|profit_margin|labour_turnover|employee_costs|labour_cost_per_unit|roce|current_ratio|gearing|payables_days|receivables_days|inventory_turnover|payback|arr|npv|critical_path|total_float|revenue|cost|profit)/.test(evidence)
}

function ao(ao1, ao2, ao3, ao4) {
  return { AO1: ao1, AO2: ao2, AO3: ao3, AO4: ao4 }
}

function slot(slotId, marks, commandCategory, aoMarks, options = {}) {
  assert(Object.values(aoMarks).reduce((sum, value) => sum + value, 0) === marks, `${slotId} AO marks must reconcile to tariff`)
  return {
    slot_id: slotId,
    marks,
    command_category: commandCategory,
    ao_marks: aoMarks,
    quantitative_marks: options.quantitativeMarks ?? 0,
    context_id: options.contextId ?? null,
    context_owner: options.contextOwner ?? null,
    section_id: options.sectionId ?? null,
    choice_group: options.choiceGroup ?? null,
    required_in_response_path: options.requiredInResponsePath ?? true,
  }
}

function buildStructuralSlots() {
  const paper1 = [
    ...Array.from({ length: 15 }, (_, index) => slot(`P1-A-${String(index + 1).padStart(2, '0')}`, 1, 'selected_response', ao(1, 0, 0, 0), { sectionId: 'A' })),
    slot('P1-B-01', 4, 'calculate', ao(2, 2, 0, 0), { sectionId: 'B', quantitativeMarks: 4 }),
    slot('P1-B-02', 4, 'calculate', ao(1, 3, 0, 0), { sectionId: 'B', quantitativeMarks: 4 }),
    slot('P1-B-03', 4, 'explain', ao(1, 3, 0, 0), { sectionId: 'B' }),
    slot('P1-B-04', 5, 'explain', ao(1, 3, 1, 0), { sectionId: 'B' }),
    slot('P1-B-05', 9, 'analyse', ao(1, 4, 3, 1), { sectionId: 'B' }),
    slot('P1-B-06', 9, 'analyse', ao(1, 3, 2, 3), { sectionId: 'B' }),
    slot('P1-C-01', 25, 'extended_evaluation', ao(4, 6, 7, 8), { sectionId: 'C', choiceGroup: 'P1-C', requiredInResponsePath: false, contextId: 'P1-C-01-CONTEXT', contextOwner: 'slot' }),
    slot('P1-C-02', 25, 'extended_evaluation', ao(4, 6, 7, 8), { sectionId: 'C', choiceGroup: 'P1-C', requiredInResponsePath: false, contextId: 'P1-C-02-CONTEXT', contextOwner: 'slot' }),
    slot('P1-D-01', 25, 'extended_evaluation', ao(4, 6, 7, 8), { sectionId: 'D', choiceGroup: 'P1-D', requiredInResponsePath: false, contextId: 'P1-D-01-CONTEXT', contextOwner: 'slot' }),
    slot('P1-D-02', 25, 'extended_evaluation', ao(4, 6, 7, 8), { sectionId: 'D', choiceGroup: 'P1-D', requiredInResponsePath: false, contextId: 'P1-D-02-CONTEXT', contextOwner: 'slot' }),
  ]

  const paper2 = [
    slot('P2-S1-01', 3, 'describe', ao(2, 1, 0, 0), { contextId: 'P2-SET-1', contextOwner: 'set' }),
    slot('P2-S1-02', 3, 'calculate', ao(1, 2, 0, 0), { contextId: 'P2-SET-1', contextOwner: 'set', quantitativeMarks: 3 }),
    slot('P2-S1-03', 9, 'analyse', ao(2, 3, 4, 0), { contextId: 'P2-SET-1', contextOwner: 'set' }),
    slot('P2-S1-04', 20, 'extended_evaluation', ao(3, 5, 6, 6), { contextId: 'P2-SET-1', contextOwner: 'set' }),
    slot('P2-S2-01', 6, 'explain', ao(2, 4, 0, 0), { contextId: 'P2-SET-2', contextOwner: 'set', quantitativeMarks: 6 }),
    slot('P2-S2-02', 9, 'analyse', ao(2, 3, 4, 0), { contextId: 'P2-SET-2', contextOwner: 'set' }),
    slot('P2-S2-03', 16, 'extended_evaluation', ao(3, 4, 5, 4), { contextId: 'P2-SET-2', contextOwner: 'set' }),
    slot('P2-S3-01', 9, 'analyse', ao(2, 3, 4, 0), { contextId: 'P2-SET-3', contextOwner: 'set', quantitativeMarks: 9 }),
    slot('P2-S3-02', 9, 'analyse', ao(2, 2, 3, 2), { contextId: 'P2-SET-3', contextOwner: 'set' }),
    slot('P2-S3-03', 16, 'extended_evaluation', ao(2, 3, 2, 9), { contextId: 'P2-SET-3', contextOwner: 'set' }),
  ]

  const paper3 = [
    slot('P3-01', 12, 'analyse', ao(3, 3, 6, 0), { contextId: 'P3-CASE-1', contextOwner: 'paper', quantitativeMarks: 4 }),
    slot('P3-02', 12, 'analyse', ao(3, 3, 6, 0), { contextId: 'P3-CASE-1', contextOwner: 'paper', quantitativeMarks: 4 }),
    slot('P3-03', 16, 'evaluate', ao(3, 3, 5, 5), { contextId: 'P3-CASE-1', contextOwner: 'paper' }),
    slot('P3-04', 16, 'extended_evaluation', ao(3, 3, 5, 5), { contextId: 'P3-CASE-1', contextOwner: 'paper' }),
    slot('P3-05', 20, 'extended_evaluation', ao(3, 3, 5, 9), { contextId: 'P3-CASE-1', contextOwner: 'paper' }),
    slot('P3-06', 24, 'extended_evaluation', ao(3, 3, 5, 13), { contextId: 'P3-CASE-1', contextOwner: 'paper' }),
  ]

  return [
    { component_id: '7132/1', name: 'Business 1', duration_minutes: 120, attempted_raw_marks: 100, printed_raw_marks: 150, slots: paper1 },
    { component_id: '7132/2', name: 'Business 2', duration_minutes: 120, attempted_raw_marks: 100, printed_raw_marks: 100, slots: paper2 },
    { component_id: '7132/3', name: 'Business 3', duration_minutes: 120, attempted_raw_marks: 100, printed_raw_marks: 100, slots: paper3 },
  ]
}

function allocateTargets(papers, requirements, seed) {
  const slots = papers.flatMap((paper) => paper.slots)
  assert(requirements.length === 42, 'Expected 42 current AQA Course Truth requirements')
  assert(slots.length === 41, 'Planner structural slot denominator changed')

  const ordered = deterministicOrder(requirements, seed)
  const quantitative = ordered.filter(isQuantitativeRequirement)
  const nonQuantitative = ordered.filter((requirement) => !isQuantitativeRequirement(requirement))
  const used = new Set()

  function take(pool) {
    const found = pool.find((requirement) => !used.has(requirement.requirement_id))
    if (found) used.add(found.requirement_id)
    return found
  }

  for (const current of slots) {
    let requirement = current.quantitative_marks > 0 ? take(quantitative) : take(nonQuantitative)
    requirement ??= take(ordered)
    assert(requirement, `No unused Course Truth target available for ${current.slot_id}`)
    current.required_course_truth_requirement_ids = [requirement.requirement_id]
    current.required_subject_node_ids = [...requirement.mapped_subject_node_ids].sort()
    current.coverage_evidence_rule = 'target_is_directly_demanded_and_necessary_for_full_marks'
    if (current.quantitative_marks > 0) current.quantitative_requirement_evidence = 'deterministic_course_truth_formula_or_metric_signal'
  }

  return {
    selected_requirement_count: used.size,
    omitted_requirement_ids: requirements.map((item) => item.requirement_id).filter((id) => !used.has(id)).sort(),
    selected_requirement_ids: [...used].sort(),
    quantitative_candidate_requirement_ids: quantitative.map((item) => item.requirement_id).sort(),
  }
}

async function main() {
  const [profile, calibration] = await Promise.all([
    readFile(PROFILE_PATH, 'utf8').then(JSON.parse),
    readFile(CALIBRATION_PATH, 'utf8').then(JSON.parse),
  ])

  execFileSync(process.execPath, [MATERIALISER], { stdio: 'pipe' })
  const [courseTruth, examTruth] = await Promise.all([
    readFile(COURSE_TRUTH_PATH, 'utf8').then(JSON.parse),
    readFile(EXAM_TRUTH_PATH, 'utf8').then(JSON.parse),
  ])

  assert(profile.profile_id === 'aqa-business-7132-2027-mock-profile-v1', 'Unexpected Mock Profile')
  assert(courseTruth.projection_id === 'aqa-business-7132-2027-course-truth-v1', 'Unexpected Course Truth')
  assert(examTruth.exam_truth_id === profile.exam_truth_id, 'Mock Profile / Exam Truth mismatch')
  assert(courseTruth.coverage?.projection_ready === true, 'Course Truth is not projection-ready')
  assert(courseTruth.coverage?.unresolved_requirement_count === 0, 'Course Truth has unresolved requirements')

  const papers = buildStructuralSlots()
  const planningSeed = fingerprint({
    profile: profile.profile_id,
    course_truth: courseTruth.projection_fingerprint,
    exam_truth: examTruth.exam_truth_fingerprint,
    calibration: calibration.calibration_id,
    planner_version: 1,
  })
  const coverage = allocateTargets(papers, courseTruth.requirements, planningSeed)

  const planCore = {
    schema_version: 1,
    plan_id: 'aqa-business-7132-2027-mock-set-plan-v1',
    status: 'deterministic_pre_generation_plan',
    course_id: profile.course_id,
    exam_year: profile.exam_year,
    dependencies: {
      mock_profile_id: profile.profile_id,
      course_truth_id: courseTruth.projection_id,
      course_truth_fingerprint: courseTruth.projection_fingerprint,
      exam_truth_id: examTruth.exam_truth_id,
      exam_truth_fingerprint: examTruth.exam_truth_fingerprint,
      calibration_id: calibration.calibration_id,
    },
    planning_seed: planningSeed,
    provider_calls_used: 0,
    rights_boundary: profile.rights_boundary,
    coverage,
    quantitative: {
      minimum_required_marks: profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set,
      planned_marks_before_choice_path_validation: papers.flatMap((paper) => paper.slots).reduce((sum, current) => sum + current.quantitative_marks, 0),
      path_validation_required: true,
    },
    duplication_policy: {
      exact_requirement_target_reuse: 'none_in_initial_printed_plan',
      near_duplicate_question_text: 'must_be_checked_after_generation',
      semantic_repetition_exception: profile.planning_rules.within_paper_target_repetition,
    },
    context_policy: {
      default: profile.rights_boundary.default_mock_context,
      paper_2: 'one_fixed_synthetic_stimulus_and_dataset_per_data_response_set',
      paper_3: 'one_fixed_synthetic_case_and_dataset_for_the_whole_paper',
      paper_1_essays: 'independent_synthetic_context_per_option_if_context_is_needed',
    },
    papers,
    generation_gate: {
      provider_spend_allowed: false,
      unlock_condition: 'validator_passes_for_exact_plan_fingerprint_on_approved_main',
      pilot_new_provider_spend_cap_usd: profile.cost.pilot_new_provider_spend_cap_usd,
    },
  }

  const plan = { ...planCore, plan_fingerprint: fingerprint(planCore) }
  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_PATH, `${JSON.stringify(plan, null, 2)}\n`)
  console.log(JSON.stringify({
    status: 'planned',
    planId: plan.plan_id,
    planFingerprint: plan.plan_fingerprint,
    paperCount: plan.papers.length,
    selectedRequirementCount: plan.coverage.selected_requirement_count,
    omittedRequirementIds: plan.coverage.omitted_requirement_ids,
    plannedQuantitativeMarks: plan.quantitative.planned_marks_before_choice_path_validation,
    providerCallsUsed: 0,
    output: OUT_PATH,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
