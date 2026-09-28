import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v07.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const RECEIPT_PATH = 'research/aqa-business-7132/2027/SPECIFICATION_MAPPING_REASSURANCE_RECEIPT.json'
const EXPECTED_MAIN_SHA = '8a62d1ad8da025d5ce27d86e48c08d16fa9d29c2'
const EXPECTED_CANDIDATE_FINGERPRINT = '64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const EXPECTED_REASSURANCE_FINGERPRINT = 'f2b59796d0939d349a4058de0504b75775e08f42dc8a5398ab407187b8535215'
const EXPECTED_REQUIREMENTS = 42
const TARGET_NODE = 'BUS-FIN-008'

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
}

function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) throw new Error(`${label} mismatch`)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function loadDependencies() {
  const candidate = await loadBusinessSubjectFoundationCandidate()
  const receipt = JSON.parse(await readFile(RECEIPT_PATH, 'utf8'))

  assert(candidate.index.candidate_version === 'v0.7-aqa-7132-gap-reconciliation', 'Unexpected Foundation candidate version')
  assert(candidate.fingerprint === EXPECTED_CANDIDATE_FINGERPRINT, 'Unexpected Foundation candidate fingerprint')
  assert(mapping.mapping_id === 'aqa-business-7132-2027-specification-mapping-v1', 'Unexpected specification mapping')
  assert(mapping.course?.course_id === 'aqa:aqa-a-level:7132', 'Unexpected course identity')
  assert(mapping.course?.exam_year === 2027, 'Unexpected exam year')
  assert(mapping.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Mapping/Foundation fingerprint mismatch')
  assert(mapping.requirements?.length === EXPECTED_REQUIREMENTS, 'AQA requirement denominator changed')
  exactSet(mapping.subject_foundation?.pending_fresh_assurance_node_ids || [], [TARGET_NODE], 'Mapping pending reassurance scope')

  assert(receipt.specification_mapping_id === mapping.mapping_id, 'Receipt/mapping identity mismatch')
  assert(receipt.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Receipt/Foundation fingerprint mismatch')
  assert(receipt.subject_foundation?.target_node_id === TARGET_NODE, 'Receipt target mismatch')
  assert(receipt.reassurance?.decision === 'pass_without_changes', 'Foundation reassurance has not passed')
  assert(receipt.reassurance?.reviewed_main_sha === EXPECTED_MAIN_SHA, 'Receipt is not bound to the approved reviewed main SHA')
  assert(receipt.reassurance?.reassurance_fingerprint === EXPECTED_REASSURANCE_FINGERPRINT, 'Unexpected reassurance fingerprint')
  assert(receipt.reassurance?.unresolved_blocking_or_material_findings === 0, 'Reassurance has unresolved material findings')
  exactSet(receipt.state_transition?.resolved_pending_node_ids || [], [TARGET_NODE], 'Resolved reassurance scope')
  assert(receipt.state_transition?.effective_projection_state === 'ready_for_course_truth_projection', 'Projection gate is not open')

  const requirementIds = new Set(mapping.requirements.map((item) => item.requirement_id))
  assert(requirementIds.size === EXPECTED_REQUIREMENTS, 'Duplicate AQA requirement IDs')
  for (const requirement of mapping.requirements) {
    assert(requirement.rights_safe_requirement_summary?.trim(), `${requirement.requirement_id} missing rights-safe summary`)
    assert(requirement.mapped_subject_node_ids?.length, `${requirement.requirement_id} is unmapped`)
    for (const nodeId of requirement.mapped_subject_node_ids) assert(candidate.nodes.has(nodeId), `${requirement.requirement_id} references unknown Foundation node ${nodeId}`)
  }

  return { candidate, receipt }
}

function buildCourseTruth(candidate, receipt) {
  const mappingFingerprint = fingerprint(mapping)
  const projection = {
    schema_version: 1,
    projection_id: 'aqa-business-7132-2027-course-truth-v1',
    status: 'course_truth_projected_from_reassured_foundation',
    course: structuredClone(mapping.course),
    dependencies: {
      subject_foundation: {
        candidate_version: candidate.index.candidate_version,
        candidate_fingerprint: candidate.fingerprint,
        node_count: candidate.nodes.size
      },
      specification_mapping: {
        mapping_id: mapping.mapping_id,
        mapping_fingerprint: mappingFingerprint,
        requirement_count: mapping.requirements.length
      },
      foundation_reassurance: {
        receipt_id: receipt.receipt_id,
        workflow_run_id: receipt.reassurance.workflow_run_id,
        artifact_id: receipt.reassurance.artifact_id,
        reviewed_main_sha: receipt.reassurance.reviewed_main_sha,
        reassurance_fingerprint: receipt.reassurance.reassurance_fingerprint,
        decision: receipt.reassurance.decision
      }
    },
    rights_boundary: {
      awarding_body_use: 'REFERENCE_ONLY',
      policy: 'AQA material supplies exact course/alignment facts only; protected AQA prose is not reusable subject truth or learner teaching copy.'
    },
    requirements: mapping.requirements.map((requirement) => ({
      ...structuredClone(requirement),
      effective_coverage_status: 'covered_after_v07_foundation_reassurance'
    })),
    coverage: {
      governed_requirement_count: mapping.requirements.length,
      mapped_requirement_count: mapping.requirements.filter((item) => item.mapped_subject_node_ids?.length).length,
      unresolved_requirement_count: 0,
      unresolved_reusable_foundation_gap_count: 0,
      projection_ready: true
    },
    known_limitations: [
      'Course Truth defines what this exact AQA course requires; assessment demand is owned separately by Exam Truth.',
      'Course-specific labels, conventions and placement remain mapping facts and do not mutate reusable subject knowledge.'
    ]
  }
  return { ...projection, projection_fingerprint: fingerprint(projection) }
}

function buildExamTruth(courseTruth) {
  const sources = [
    {
      source_id: 'AQA-7132-SCHEME-OF-ASSESSMENT',
      source_type: 'official_scheme_of_assessment',
      url: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/scheme-of-assessment',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['assessment_objectives', 'component_ao_weightings', 'component_raw_marks', 'linear_assessment']
    },
    {
      source_id: 'AQA-7132-SPECIFICATION-AT-A-GLANCE',
      source_type: 'official_specification_summary',
      url: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['paper_duration', 'paper_weighting', 'paper_question_structure', 'whole_course_assessment']
    },
    {
      source_id: 'AQA-7132-QUANTITATIVE-SKILLS',
      source_type: 'official_specification_annex',
      url: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/annex-quantitative-skills-in-business',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['quantitative_skill_scope', 'minimum_quantitative_mark_weighting']
    },
    {
      source_id: 'AQA-7132-ASSESSMENT-RESOURCES',
      source_type: 'official_assessment_resource_index',
      url: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/assessment-resources',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['assessment_resource_provenance']
    },
    {
      source_id: 'AQA-7132-P1-SAMPLE-MARK-SCHEME',
      source_type: 'official_sample_mark_scheme',
      url: 'https://filestore.aqa.org.uk/resources/business/AQA-71321-SMS.PDF',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['sample_question_family_evidence', 'mark_scheme_variability_boundary']
    },
    {
      source_id: 'AQA-7132-P2-SAMPLE-MARK-SCHEME',
      source_type: 'official_sample_mark_scheme',
      url: 'https://filestore.aqa.org.uk/resources/business/AQA-71322-SMS.PDF',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['sample_ao_allocation_evidence', 'mark_scheme_variability_boundary']
    },
    {
      source_id: 'AQA-7132-P3-SAMPLE-MARK-SCHEME',
      source_type: 'official_sample_mark_scheme',
      url: 'https://filestore.aqa.org.uk/resources/business/AQA-71323-SMS.PDF',
      rights_classification: 'REFERENCE_ONLY',
      checked_date: '2026-09-28',
      supports: ['sample_contextual_analysis_evidence', 'mark_scheme_variability_boundary']
    }
  ]

  const truth = {
    schema_version: 1,
    exam_truth_id: 'aqa-business-7132-2027-exam-truth-v1',
    status: 'stable_assessment_core_reconciled',
    course_id: courseTruth.course.course_id,
    exam_year: courseTruth.course.exam_year,
    dependencies: {
      course_truth_projection_id: courseTruth.projection_id,
      course_truth_fingerprint: courseTruth.projection_fingerprint
    },
    rights_boundary: {
      awarding_body_use: 'REFERENCE_ONLY',
      derived_facts_only: true,
      source_text_copied_into_generative_truth: false
    },
    assessment_model: {
      linear: true,
      all_components_taken_in_same_series: true,
      all_papers_assess_full_course_content: true,
      total_raw_marks: 300,
      quantitative_skills_minimum_overall_percent: 10,
      components: [
        {
          component_id: '7132/1',
          name: 'Business 1',
          duration_minutes: 120,
          raw_marks: 100,
          qualification_weight_percent: 33.3,
          question_structure: [
            { family: 'multiple_choice', section: 'A', marks: 15, invariant_from_specification: true },
            { family: 'short_answer', section: 'B', marks: 35, invariant_from_specification: true },
            { family: 'essay_choice', sections: ['C', 'D'], marks_each: 25, required_responses: 2, invariant_from_specification: true }
          ]
        },
        {
          component_id: '7132/2',
          name: 'Business 2',
          duration_minutes: 120,
          raw_marks: 100,
          qualification_weight_percent: 33.3,
          question_structure: [
            { family: 'data_response', compulsory_sets: 3, approximate_marks_per_set: 33, parts_per_set: '3_or_4', invariant_from_specification: true }
          ]
        },
        {
          component_id: '7132/3',
          name: 'Business 3',
          duration_minutes: 120,
          raw_marks: 100,
          qualification_weight_percent: 33.3,
          question_structure: [
            { family: 'case_study', compulsory_case_studies: 1, approximate_follow_up_question_count: 6, invariant_from_specification: true }
          ]
        }
      ]
    },
    assessment_objectives: {
      AO1: { capability: 'knowledge_and_understanding', overall_percent_range: [22, 25], paper_percent_ranges: { '7132/1': [9, 11], '7132/2': [6, 8], '7132/3': [5, 8] } },
      AO2: { capability: 'application_to_business_context', overall_percent_range: [24, 27], paper_percent_ranges: { '7132/1': [9, 11], '7132/2': [8, 11], '7132/3': [5, 7] } },
      AO3: { capability: 'analysis_of_business_information_and_issues', overall_percent_range: [25, 28], paper_percent_ranges: { '7132/1': [5, 8], '7132/2': [8, 11], '7132/3': [9, 12] } },
      AO4: { capability: 'evaluation_and_evidence_based_judgement', overall_percent_range: [23, 26], paper_percent_ranges: { '7132/1': [5, 8], '7132/2': [6, 9], '7132/3': [9, 12] } }
    },
    question_families: [
      { family_id: 'MCQ', course_role: 'selected_response', evidence_status: 'specification_invariant' },
      { family_id: 'SHORT_ANSWER', course_role: 'constructed_response', evidence_status: 'specification_invariant' },
      { family_id: 'ESSAY', course_role: 'extended_argument_and_judgement', evidence_status: 'specification_invariant' },
      { family_id: 'DATA_RESPONSE', course_role: 'contextual_multi_part_response', evidence_status: 'specification_invariant' },
      { family_id: 'CASE_STUDY', course_role: 'synoptic_contextual_response', evidence_status: 'specification_invariant' }
    ],
    sample_mark_scheme_observations: {
      status: 'illustrative_not_invariant',
      safe_use: 'Use samples to understand assessed capabilities and marking approach; do not freeze sample mark allocations, exact level descriptors, or question mixes as future-paper truth.',
      observations: [
        'Sample materials demonstrate explicit AO allocation at question level.',
        'Extended responses use level-based marking in the sample materials.',
        'Contextual analysis and supported judgement are material assessed capabilities in extended responses.'
      ]
    },
    prohibited_extrapolations: [
      'Do not predict topic likelihood or paper placement beyond published specification structure.',
      'Do not treat a sample or past-paper mark allocation as an invariant future question template.',
      'Do not infer hidden examiner preferences or undocumented scoring rules.',
      'Do not copy protected AQA question, mark-scheme or examiner-report prose into generative truth.'
    ],
    sources,
    completeness: {
      stable_assessment_structure: 'complete',
      assessment_objectives: 'complete',
      quantitative_requirement: 'complete',
      stable_question_families: 'complete',
      sample_marking_evidence_boundary: 'complete',
      exact_future_question_mix: 'not_knowable_and_not_required',
      ready_for_exact_course_assurance: true,
      learner_asset_regeneration_allowed: false
    },
    known_limitations: [
      'Future paper-level question marks and detailed mark-scheme wording can vary within the published assessment contract.',
      'Exam dates are operational scheduling data and are intentionally not embedded as durable Exam Truth.',
      'This stage does not grant learner-publication authority; exact-course assurance remains the next gate.'
    ]
  }

  return { ...truth, exam_truth_fingerprint: fingerprint(truth) }
}

function validate(courseTruth, examTruth) {
  assert(courseTruth.coverage.governed_requirement_count === EXPECTED_REQUIREMENTS, 'Course Truth denominator mismatch')
  assert(courseTruth.coverage.mapped_requirement_count === EXPECTED_REQUIREMENTS, 'Course Truth is not fully mapped')
  assert(courseTruth.coverage.unresolved_requirement_count === 0, 'Course Truth has unresolved requirements')
  assert(courseTruth.coverage.unresolved_reusable_foundation_gap_count === 0, 'Course Truth has unresolved Foundation gaps')
  assert(courseTruth.dependencies.foundation_reassurance.decision === 'pass_without_changes', 'Course Truth is not bound to passing reassurance')

  assert(examTruth.assessment_model.components.length === 3, 'Exam Truth must define three components')
  assert(examTruth.assessment_model.components.every((component) => component.duration_minutes === 120 && component.raw_marks === 100), 'AQA paper duration/mark contract mismatch')
  assert(examTruth.assessment_model.total_raw_marks === 300, 'AQA total raw marks mismatch')
  assert(examTruth.assessment_model.quantitative_skills_minimum_overall_percent === 10, 'Quantitative skills minimum mismatch')
  exactSet(Object.keys(examTruth.assessment_objectives), ['AO1', 'AO2', 'AO3', 'AO4'], 'Assessment objective set')
  assert(examTruth.sources.every((source) => source.rights_classification === 'REFERENCE_ONLY'), 'Exam Truth contains a non-reference-only AQA source')
  assert(examTruth.rights_boundary.source_text_copied_into_generative_truth === false, 'Exam Truth must not copy awarding-body source text')
  assert(examTruth.sample_mark_scheme_observations.status === 'illustrative_not_invariant', 'Sample mark schemes must not be treated as invariant')
  assert(examTruth.prohibited_extrapolations.length >= 4, 'Exam Truth extrapolation guard is incomplete')
  assert(examTruth.completeness.ready_for_exact_course_assurance === true, 'Exam Truth is not ready for exact-course assurance')
  assert(examTruth.completeness.learner_asset_regeneration_allowed === false, 'Learner generation must remain blocked before exact-course assurance')
}

async function main() {
  const { candidate, receipt } = await loadDependencies()
  const courseTruth = buildCourseTruth(candidate, receipt)
  const examTruth = buildExamTruth(courseTruth)
  validate(courseTruth, examTruth)

  const summary = {
    status: 'pass',
    courseId: courseTruth.course.course_id,
    examYear: courseTruth.course.exam_year,
    subjectFoundationFingerprint: candidate.fingerprint,
    specificationMappingId: mapping.mapping_id,
    mappedRequirements: courseTruth.coverage.mapped_requirement_count,
    courseTruthFingerprint: courseTruth.projection_fingerprint,
    examTruthFingerprint: examTruth.exam_truth_fingerprint,
    stableQuestionFamilies: examTruth.question_families.length,
    nextGate: 'exact_course_assurance',
    learnerAssetRegenerationAllowed: false
  }

  if (process.argv.includes('--self-test')) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  await mkdir(OUT, { recursive: true })
  await writeFile(`${OUT}/course-truth.json`, JSON.stringify(courseTruth, null, 2))
  await writeFile(`${OUT}/exam-truth.json`, JSON.stringify(examTruth, null, 2))
  await writeFile(`${OUT}/summary.json`, JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
