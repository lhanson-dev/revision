import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const EXPECTED_REQUIREMENTS = 42

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

  // Mapping names the Foundation version it targets; the exact fingerprint is recorded in Course Truth below.
  assert(candidate.index.candidate_version === mapping.subject_foundation?.candidate_version, `Mapping targets ${mapping.subject_foundation?.candidate_version} but the current Foundation is ${candidate.index.candidate_version}`)
  assert(mapping.mapping_id === 'aqa-business-7132-2027-specification-mapping-v1', 'Unexpected specification mapping')
  assert(mapping.course?.course_id === 'aqa:aqa-a-level:7132', 'Unexpected course identity')
  assert(mapping.course?.exam_year === 2027, 'Unexpected exam year')
  assert(mapping.requirements?.length === EXPECTED_REQUIREMENTS, 'AQA requirement denominator changed')

  const requirementIds = new Set(mapping.requirements.map((item) => item.requirement_id))
  assert(requirementIds.size === EXPECTED_REQUIREMENTS, 'Duplicate AQA requirement IDs')
  for (const requirement of mapping.requirements) {
    assert(requirement.rights_safe_requirement_summary?.trim(), `${requirement.requirement_id} missing rights-safe summary`)
    assert(requirement.mapped_subject_node_ids?.length, `${requirement.requirement_id} is unmapped`)
    for (const nodeId of requirement.mapped_subject_node_ids) assert(candidate.nodes.has(nodeId), `${requirement.requirement_id} references unknown Foundation node ${nodeId}`)
  }

  return { candidate }
}

// The course's Subject Foundation nodes: everything mapped to a requirement plus everything those nodes depend on.
function prerequisiteClosure(nodes, seedIds) {
  const selected = new Set(seedIds)
  const queue = [...seedIds]
  while (queue.length) {
    const id = queue.shift()
    const node = nodes.get(id)
    assert(node, `Prerequisite closure references unknown node ${id}`)
    for (const prerequisite of node.prerequisites || []) if (!selected.has(prerequisite)) { selected.add(prerequisite); queue.push(prerequisite) }
  }
  return [...selected].sort()
}

function buildCourseTruth(candidate) {
  const mappingFingerprint = fingerprint(mapping)
  const requirements = mapping.requirements.map((requirement) => ({
    ...structuredClone(requirement),
    source_coverage_status: requirement.coverage_status,
    effective_coverage_status: requirement.coverage_status,
  }))
  const unresolved = requirements.filter((requirement) => requirement.effective_coverage_status !== 'mapped')
  const mappedNodeIds = [...new Set(requirements.flatMap((requirement) => requirement.mapped_subject_node_ids))].sort()
  const selectedNodeIds = prerequisiteClosure(candidate.nodes, mappedNodeIds)

  const projection = {
    schema_version: 1,
    projection_id: 'aqa-business-7132-2027-course-truth-v1',
    status: 'course_truth_projected_from_current_foundation',
    course: structuredClone(mapping.course),
    dependencies: {
      subject_foundation: {
        candidate_version: candidate.index.candidate_version,
        candidate_fingerprint: candidate.fingerprint,
        node_count: candidate.nodes.size,
        // Accuracy of these nodes is checked by the T8 course gate (fast path, ADR-0029), not a separate reassurance run.
        nodes_pending_course_gate_accuracy: [...(candidate.freshNodeScope || [])].sort()
      },
      specification_mapping: {
        mapping_id: mapping.mapping_id,
        mapping_fingerprint: mappingFingerprint,
        immutable_source_status: mapping.status,
        requirement_count: mapping.requirements.length
      }
    },
    rights_boundary: {
      awarding_body_use: 'REFERENCE_ONLY',
      policy: 'AQA material supplies exact course/alignment facts only; protected AQA prose is not reusable subject truth or learner teaching copy.'
    },
    requirements,
    selected_subject_node_ids: selectedNodeIds,
    prerequisite_only_node_ids: selectedNodeIds.filter((id) => !mappedNodeIds.includes(id)),
    coverage: {
      governed_requirement_count: requirements.length,
      mapped_requirement_count: requirements.filter((item) => item.mapped_subject_node_ids?.length).length,
      unresolved_requirement_count: unresolved.length,
      selected_node_count: selectedNodeIds.length,
      projection_ready: unresolved.length === 0
    },
    known_limitations: [
      'Course Truth defines what this exact AQA course requires; assessment demand is owned separately by Exam Truth.',
      'Course-specific labels, conventions and placement remain mapping facts and do not mutate reusable subject knowledge.',
      'Named-item coverage is proven separately by the item-level coverage check (NAMED_ITEMS.json).'
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
      supports: ['linear_assessment', 'assessment_objectives', 'component_ao_weightings', 'component_raw_marks', 'extended_response_requirement']
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
      supports: ['official_assessment_resource_location']
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
      source_text_copied_into_generative_truth: false,
      mark_scheme_or_examiner_prose_promoted_to_truth: false
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
      AO2: { capability: 'application_to_business_contexts', overall_percent_range: [24, 27], paper_percent_ranges: { '7132/1': [9, 11], '7132/2': [8, 11], '7132/3': [5, 7] } },
      AO3: { capability: 'analysis_of_business_issues_and_influences', overall_percent_range: [25, 28], paper_percent_ranges: { '7132/1': [5, 8], '7132/2': [8, 11], '7132/3': [9, 12] } },
      AO4: { capability: 'evaluation_and_evidence_based_judgement', overall_percent_range: [23, 26], paper_percent_ranges: { '7132/1': [5, 8], '7132/2': [6, 9], '7132/3': [9, 12] } }
    },
    question_families: [
      { family_id: 'MCQ', response_form: 'selected_response', evidence_status: 'specification_invariant' },
      { family_id: 'SHORT_ANSWER', response_form: 'constructed_response', evidence_status: 'specification_invariant' },
      { family_id: 'ESSAY', response_form: 'extended_response', evidence_status: 'specification_invariant' },
      { family_id: 'DATA_RESPONSE', response_form: 'contextual_multi_part_response', evidence_status: 'specification_invariant' },
      { family_id: 'CASE_STUDY', response_form: 'contextual_multi_part_response', evidence_status: 'specification_invariant' }
    ],
    assessment_resource_boundary: {
      official_resource_index_recorded: true,
      mark_scheme_detail_status: 'not_promoted_to_stable_exam_truth',
      rationale: 'Question-specific mark allocations, indicative content and detailed mark-scheme wording can change by paper. Stable Exam Truth is limited to the published assessment contract and assessment objectives.',
      later_use_rule: 'Past papers, mark schemes and examiner materials may support exact-course assurance, calibration and Exam Prep only under reference-only provenance and must not be treated as invariant future-paper truth.'
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
      variable_mark_scheme_details: 'deliberately_outside_stable_truth',
      exact_future_question_mix: 'not_knowable_and_not_required',
      ready_for_exact_course_assurance: true,
      learner_asset_regeneration_allowed: false
    },
    known_limitations: [
      'Future question-level marks, indicative content and detailed mark-scheme wording can vary within the published assessment contract.',
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
  const selected = new Set(courseTruth.selected_subject_node_ids)
  for (const requirement of courseTruth.requirements) for (const id of requirement.mapped_subject_node_ids) assert(selected.has(id), `${id} is mapped but not selected`)

  assert(examTruth.assessment_model.components.length === 3, 'Exam Truth must define three components')
  assert(examTruth.assessment_model.components.every((component) => component.duration_minutes === 120 && component.raw_marks === 100), 'AQA paper duration/mark contract mismatch')
  assert(examTruth.assessment_model.components.every((component) => component.qualification_weight_percent === 33.3), 'AQA paper weighting contract mismatch')
  assert(examTruth.assessment_model.total_raw_marks === 300, 'AQA total raw marks mismatch')
  assert(examTruth.assessment_model.quantitative_skills_minimum_overall_percent === 10, 'Quantitative skills minimum mismatch')
  exactSet(Object.keys(examTruth.assessment_objectives), ['AO1', 'AO2', 'AO3', 'AO4'], 'Assessment objective set')
  exactSet(examTruth.question_families.map((family) => family.family_id), ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'DATA_RESPONSE', 'CASE_STUDY'], 'Stable question-family set')
  assert(examTruth.sources.length === 4, 'Exam Truth source set changed unexpectedly')
  assert(examTruth.sources.every((source) => source.rights_classification === 'REFERENCE_ONLY' && /^https:\/\/www\.aqa\.org\.uk\//.test(source.url)), 'Exam Truth contains an unapproved AQA source boundary')
  assert(examTruth.rights_boundary.source_text_copied_into_generative_truth === false, 'Exam Truth must not copy awarding-body source text')
  assert(examTruth.rights_boundary.mark_scheme_or_examiner_prose_promoted_to_truth === false, 'Mark-scheme/examiner prose must not become stable Exam Truth')
  assert(examTruth.assessment_resource_boundary.mark_scheme_detail_status === 'not_promoted_to_stable_exam_truth', 'Variable mark-scheme detail must stay outside stable Exam Truth')
  assert(examTruth.prohibited_extrapolations.length >= 4, 'Exam Truth extrapolation guard is incomplete')
  assert(examTruth.completeness.ready_for_exact_course_assurance === true, 'Exam Truth is not ready for exact-course assurance')
  assert(examTruth.completeness.learner_asset_regeneration_allowed === false, 'Learner generation must remain blocked before exact-course assurance')
}

async function main() {
  const { candidate } = await loadDependencies()
  const courseTruth = buildCourseTruth(candidate)
  const examTruth = buildExamTruth(courseTruth)
  validate(courseTruth, examTruth)

  const summary = {
    status: 'pass',
    courseId: courseTruth.course.course_id,
    examYear: courseTruth.course.exam_year,
    subjectFoundationFingerprint: candidate.fingerprint,
    specificationMappingId: mapping.mapping_id,
    mappedRequirements: courseTruth.coverage.mapped_requirement_count,
    selectedSubjectNodes: courseTruth.coverage.selected_node_count,
    prerequisiteOnlyNodes: courseTruth.prerequisite_only_node_ids,
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
