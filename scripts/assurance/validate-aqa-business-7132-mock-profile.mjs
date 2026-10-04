import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const PROFILE_PATH = 'content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json'
const EXAM_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/exam-truth.json'
const COURSE_TRUTH_MATERIALISER = 'scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  assert(a.length === e.length && a.every((value, index) => value === e[index]), `${label} mismatch`)
}

function exactRange(actual, expected, label) {
  assert(Array.isArray(actual) && actual.length === 2, `${label} must be a two-value range`)
  assert(actual[0] === expected[0] && actual[1] === expected[1], `${label} mismatch`)
}

function byId(items, key) {
  return new Map(items.map((item) => [item[key], item]))
}

function attemptedMarks(component) {
  if (Array.isArray(component.sections)) return component.sections.reduce((sum, section) => sum + section.attempted_marks, 0)
  return component.attempted_raw_marks
}

function validateProfileShape(profile) {
  assert(profile.schema_version === 1, 'Unexpected Mock Profile schema version')
  assert(profile.profile_id === 'aqa-business-7132-2027-mock-profile-v1', 'Unexpected Mock Profile identity')
  assert(profile.course_id === 'aqa:aqa-a-level:7132', 'Unexpected Mock Profile course')
  assert(profile.exam_year === 2027, 'Unexpected Mock Profile exam year')
  assert(profile.exam_truth_id === 'aqa-business-7132-2027-exam-truth-v1', 'Unexpected Exam Truth dependency')

  assert(profile.rights_boundary?.awarding_body_use === 'REFERENCE_ONLY', 'Awarding-body material must remain reference-only')
  assert(profile.rights_boundary?.derived_facts_only === true, 'Mock Profile must contain derived assessment facts only')
  assert(profile.rights_boundary?.protected_question_text_reusable === false, 'Protected AQA question text must not be reusable')
  assert(profile.rights_boundary?.protected_case_or_dataset_reusable === false, 'Protected AQA cases/datasets must not be reusable')
  assert(profile.rights_boundary?.protected_mark_scheme_prose_reusable === false, 'Protected AQA mark-scheme prose must not be reusable')
  assert(profile.rights_boundary?.default_mock_context === 'synthetic_business_and_synthetic_data', 'Synthetic contexts/data must be the mock default')

  assert(Array.isArray(profile.sources) && profile.sources.length === 4, 'Mock Profile source set changed unexpectedly')
  exactSet(profile.sources.map((source) => source.source_id), [
    'AQA-7132-SCHEME-OF-ASSESSMENT',
    'AQA-7132-SPECIFICATION-AT-A-GLANCE',
    'AQA-7132-QUANTITATIVE-SKILLS',
    'AQA-7132-ASSESSMENT-RESOURCES',
  ], 'Mock Profile source IDs')
  for (const source of profile.sources) {
    assert(source.rights_classification === 'REFERENCE_ONLY', `${source.source_id} must remain reference-only`)
    assert(/^https:\/\/www\.aqa\.org\.uk\//.test(source.url), `${source.source_id} must use an official AQA URL`)
    assert(['invariant', 'calibration_only'].includes(source.evidence_role), `${source.source_id} has invalid evidence role`)
  }

  const invariants = profile.invariants
  assert(invariants.linear === true, 'AQA 7132 mock profile must remain linear')
  assert(invariants.all_components_same_series === true, 'All AQA 7132 components must be in the same series')
  assert(invariants.all_papers_can_assess_full_course === true, 'All AQA 7132 papers must be able to assess full course content')
  assert(invariants.component_count === 3, 'AQA 7132 requires three components')
  assert(invariants.total_attempted_raw_marks === 300, 'AQA 7132 total attempted raw marks must be 300')
  assert(invariants.quantitative_skills_minimum_overall_percent === 10, 'AQA 7132 quantitative minimum must be 10%')
  assert(invariants.minimum_quantitative_marks_for_representative_three_paper_set === 30, 'Three-paper mock set must plan at least 30 quantitative marks')

  assert(Array.isArray(profile.components) && profile.components.length === 3, 'Mock Profile must define exactly three components')
  const components = byId(profile.components, 'component_id')
  exactSet(components.keys(), ['7132/1', '7132/2', '7132/3'], 'Mock Profile component IDs')
  for (const component of components.values()) {
    assert(component.duration_minutes === 120, `${component.component_id} duration must be 120 minutes`)
    assert(component.attempted_raw_marks === 100, `${component.component_id} attempted marks must be 100`)
    assert(component.qualification_weight_percent === 33.3, `${component.component_id} weight must be 33.3%`)
    assert(attemptedMarks(component) === 100, `${component.component_id} section accounting must reconcile to 100 attempted marks`)
  }

  const paper1 = components.get('7132/1')
  const sections = byId(paper1.sections, 'section_id')
  exactSet(sections.keys(), ['A', 'B', 'C', 'D'], 'Paper 1 sections')
  assert(sections.get('A').mode === 'compulsory' && sections.get('A').family === 'MCQ' && sections.get('A').question_count === 15 && sections.get('A').marks_per_question === 1 && sections.get('A').attempted_marks === 15, 'Paper 1 Section A contract mismatch')
  assert(sections.get('B').mode === 'compulsory' && sections.get('B').family === 'SHORT_ANSWER' && sections.get('B').attempted_marks === 35, 'Paper 1 Section B contract mismatch')
  for (const id of ['C', 'D']) {
    const section = sections.get(id)
    assert(section.mode === 'choose_one' && section.family === 'ESSAY', `Paper 1 Section ${id} must be essay choice`)
    assert(section.option_count === 2 && section.required_responses === 1, `Paper 1 Section ${id} must offer two options and require one response`)
    assert(section.marks_per_option === 25 && section.attempted_marks === 25 && section.printed_option_marks === 50, `Paper 1 Section ${id} mark accounting mismatch`)
  }
  assert(paper1.sections.reduce((sum, section) => sum + (section.printed_option_marks ?? section.attempted_marks), 0) === 150, 'Paper 1 printed marks should be 150 including unattempted options')

  const paper2 = components.get('7132/2').structure
  assert(paper2.family === 'DATA_RESPONSE' && paper2.compulsory_sets === 3 && paper2.all_sets_required === true, 'Paper 2 data-response structure mismatch')
  assert(paper2.parts_per_set?.min === 3 && paper2.parts_per_set?.max === 4, 'Paper 2 must use three or four parts per set')
  assert(paper2.marks_per_set === 'approximately_33', 'Paper 2 per-set marks must remain calibration rather than a fixed exact tariff')

  const paper3 = components.get('7132/3').structure
  assert(paper3.family === 'CASE_STUDY' && paper3.compulsory_case_studies === 1 && paper3.all_questions_required === true, 'Paper 3 case-study structure mismatch')
  assert(paper3.follow_up_question_count === 'approximately_6', 'Paper 3 question count must remain approximate calibration')

  assert(profile.planning_rules?.coverage_unit === 'course_truth_requirement_then_named_item', 'Mocks must plan coverage from Course Truth before named-item selection')
  assert(profile.planning_rules?.requirement_count === 42, 'AQA 7132 governed requirement denominator changed')
  assert(profile.planning_rules?.require_all_course_requirements_in_one_set === false, 'Mocks must sample course breadth rather than force all 42 requirements into one set')
  assert(profile.planning_rules?.context_only_mentions_count_as_coverage === false, 'Context-only mentions must not count as assessed coverage')
  assert(profile.planning_rules?.topic_prediction_prohibited === true, 'Topic prediction must remain prohibited')

  assert(profile.assurance?.fresh_round_limit_per_unresolved_fingerprint === 2, 'Fast-Path two-round assurance limit must be preserved')
  assert(profile.assurance?.reuse_unchanged_dependency_evidence === true, 'Unchanged assurance evidence must be reusable')
  assert(profile.assurance?.whole_paper_review_required === true, 'Whole-paper review is required')
  assert(profile.assurance?.question_level_assurance_alone_sufficient === false, 'Question-level assurance alone cannot publish a mock')

  const cap = profile.cost?.pilot_new_provider_spend_cap_usd
  const ceiling = profile.cost?.company_live_course_hard_ceiling_usd
  assert(Number.isFinite(cap) && cap > 0, 'Mock pilot spend cap must be positive')
  assert(Number.isFinite(ceiling) && ceiling === 20, 'Company live-course hard ceiling must remain US$20')
  assert(cap <= ceiling, 'Mock pilot spend cap cannot exceed the company live-course hard ceiling')
  assert(profile.cost?.provider_spend_allowed_before_profile_and_plan_validation === false, 'Provider spend must stay blocked before profile/plan validation')

  assert(profile.learner_claim === "A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.", 'Learner mock claim changed unexpectedly')
  assert(profile.publication?.existing_surface === 'Exam Prep / ExamSimulator', 'Mocks must use the existing Exam Prep surface')
  assert(profile.publication?.duplicate_mock_route_required === false, 'Mock production must not create a duplicate learner route')
  assert(profile.publication?.generation_completion_is_publication_authority === false, 'Generation completion must not grant publication authority')
}

function validateAgainstExamTruth(profile, examTruth) {
  assert(examTruth.exam_truth_id === profile.exam_truth_id, 'Mock Profile points at the wrong Exam Truth')
  assert(examTruth.course_id === profile.course_id && examTruth.exam_year === profile.exam_year, 'Mock Profile course/version does not match Exam Truth')
  assert(examTruth.assessment_model.linear === profile.invariants.linear, 'Linear-assessment invariant drift')
  assert(examTruth.assessment_model.all_components_taken_in_same_series === profile.invariants.all_components_same_series, 'Same-series invariant drift')
  assert(examTruth.assessment_model.all_papers_assess_full_course_content === profile.invariants.all_papers_can_assess_full_course, 'Full-course assessment invariant drift')
  assert(examTruth.assessment_model.total_raw_marks === profile.invariants.total_attempted_raw_marks, 'Total raw-mark invariant drift')
  assert(examTruth.assessment_model.quantitative_skills_minimum_overall_percent === profile.invariants.quantitative_skills_minimum_overall_percent, 'Quantitative minimum drift')

  const truthComponents = byId(examTruth.assessment_model.components, 'component_id')
  const profileComponents = byId(profile.components, 'component_id')
  exactSet(profileComponents.keys(), truthComponents.keys(), 'Mock Profile / Exam Truth component IDs')
  for (const [id, component] of profileComponents) {
    const truth = truthComponents.get(id)
    assert(component.duration_minutes === truth.duration_minutes, `${id} duration drift against Exam Truth`)
    assert(component.attempted_raw_marks === truth.raw_marks, `${id} raw-mark drift against Exam Truth`)
    assert(component.qualification_weight_percent === truth.qualification_weight_percent, `${id} weighting drift against Exam Truth`)
  }

  exactSet(Object.keys(profile.invariants.assessment_objectives), Object.keys(examTruth.assessment_objectives), 'AO set')
  for (const [ao, profileAo] of Object.entries(profile.invariants.assessment_objectives)) {
    const truthAo = examTruth.assessment_objectives[ao]
    exactRange(profileAo.overall_percent_range, truthAo.overall_percent_range, `${ao} overall range`)
    exactSet(Object.keys(profileAo.paper_percent_ranges), Object.keys(truthAo.paper_percent_ranges), `${ao} paper range IDs`)
    for (const [paper, range] of Object.entries(profileAo.paper_percent_ranges)) exactRange(range, truthAo.paper_percent_ranges[paper], `${ao} ${paper} range`)
  }

  exactSet(profile.sources.map((source) => source.source_id), examTruth.sources.map((source) => source.source_id), 'Mock Profile / Exam Truth source set')
  assert(examTruth.rights_boundary?.awarding_body_use === 'REFERENCE_ONLY', 'Current Exam Truth no longer has the expected AQA rights boundary')
}

async function main() {
  const profile = JSON.parse(await readFile(PROFILE_PATH, 'utf8'))
  validateProfileShape(profile)

  execFileSync(process.execPath, [COURSE_TRUTH_MATERIALISER], { stdio: 'pipe' })
  const examTruth = JSON.parse(await readFile(EXAM_TRUTH_PATH, 'utf8'))
  validateAgainstExamTruth(profile, examTruth)

  const summary = {
    status: 'pass',
    profileId: profile.profile_id,
    courseId: profile.course_id,
    examYear: profile.exam_year,
    examTruthFingerprint: examTruth.exam_truth_fingerprint,
    componentCount: profile.components.length,
    totalAttemptedRawMarks: profile.invariants.total_attempted_raw_marks,
    minimumQuantitativeMarks: profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set,
    pilotNewProviderSpendCapUsd: profile.cost.pilot_new_provider_spend_cap_usd,
    providerSpendStarted: false,
    nextGate: 'deterministic_mock_set_plan'
  }
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
