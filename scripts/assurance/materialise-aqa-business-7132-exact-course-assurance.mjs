import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v07.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const COURSE_OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const OUT = '.artifacts/content-factory-aqa-business-7132-exact-course-assurance'
const RECEIPT_PATH = 'research/aqa-business-7132/2027/SPECIFICATION_MAPPING_REASSURANCE_RECEIPT.json'
const EXPECTED_COURSE_ID = 'aqa:aqa-a-level:7132'
const EXPECTED_EXAM_YEAR = 2027
const EXPECTED_REQUIREMENTS = 42
const EXPECTED_FOUNDATION_NODES = 81
const EXPECTED_SELECTED_NODES = 78
const EXPECTED_FOUNDATION_FINGERPRINT = '64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const EXPECTED_REASSURANCE_FINGERPRINT = 'f2b59796d0939d349a4058de0504b75775e08f42dc8a5398ab407187b8535215'
const EXPECTED_COURSE_TRUTH_FINGERPRINT = '5a8b46266dd6e245004e577cb34b6ad60f94ad6bc022cd2b1c42164fd7cfe870'
const EXPECTED_EXAM_TRUTH_FINGERPRINT = 'd83dadd90eeef3a6af698dd09677ac6844f670f43a94adf226c616ac4562a6ce'

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

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) {
    throw new Error(`${label} mismatch`)
  }
}

function unique(values) {
  return [...new Set(values)]
}

function run(command, args) {
  execFileSync(command, args, { stdio: 'pipe', encoding: 'utf8' })
}

async function materialiseDependencies() {
  run('node', ['scripts/assurance/validate-business-subject-provenance.mjs'])
  run('node', ['scripts/assurance/validate-aqa-business-7132-specification-mapping.mjs'])
  run('node', ['scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'])
  run('node', ['scripts/assurance/materialise-aqa-business-7132-runtime-adapter.mjs'])
}

function reviewNode(canonicalId, node, row) {
  return {
    subject_id: canonicalId,
    title: node.title ?? null,
    node_types: node.node_types ?? [],
    scope_classification: node.scope_classification ?? null,
    recommended_depth: node.recommended_depth ?? null,
    teaching_content: node.teaching_content ?? {},
    quantitative_content: node.quantitative_content ?? {},
    prerequisites: node.prerequisites ?? [],
    related_nodes: node.related_nodes ?? [],
    evidence_of_understanding: node.evidence_of_understanding ?? [],
    promotion_truth_source_ids: [...(row?.subject_truth_sources ?? [])],
  }
}

function reviewSource(source) {
  return {
    id: source.id,
    issuer: source.issuer,
    title: source.title,
    url: source.url,
    date_version: source.date_version,
    educational_role: source.educational_role,
    licence_profile: source.licence_profile,
    restrictions: source.restrictions,
    checked_at: source.checked_at,
    checker_method: source.checker_method,
    confidence: source.confidence,
    promotion_eligible: source.promotion_eligible,
  }
}

function validateExactCourseBundle({ candidate, receipt, courseTruth, examTruth, adapter }) {
  assert(candidate.index.candidate_version === 'v0.7-aqa-7132-gap-reconciliation', 'Unexpected Subject Foundation version')
  assert(candidate.nodes.size === EXPECTED_FOUNDATION_NODES, 'Subject Foundation node denominator changed')
  assert(candidate.fingerprint === EXPECTED_FOUNDATION_FINGERPRINT, 'Subject Foundation fingerprint changed')

  assert(mapping.mapping_id === 'aqa-business-7132-2027-specification-mapping-v1', 'Unexpected specification mapping identity')
  assert(mapping.course?.course_id === EXPECTED_COURSE_ID, 'Specification mapping course identity changed')
  assert(mapping.course?.exam_year === EXPECTED_EXAM_YEAR, 'Specification mapping exam year changed')
  assert(mapping.requirements?.length === EXPECTED_REQUIREMENTS, 'Specification mapping requirement denominator changed')
  assert(mapping.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Specification mapping is not bound to the exact Subject Foundation')

  assert(receipt.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Reassurance receipt is not bound to the exact Subject Foundation')
  assert(receipt.reassurance?.decision === 'pass_without_changes', 'Subject Foundation reassurance did not pass without changes')
  assert(receipt.reassurance?.reassurance_fingerprint === EXPECTED_REASSURANCE_FINGERPRINT, 'Unexpected Subject Foundation reassurance fingerprint')
  assert(receipt.reassurance?.unresolved_blocking_or_material_findings === 0, 'Subject Foundation reassurance retains blocking/material findings')
  assert(receipt.state_transition?.effective_projection_state === 'ready_for_course_truth_projection', 'Reassurance receipt does not permit Course Truth projection')
  assert(receipt.state_transition?.learner_asset_regeneration_allowed === false, 'Upstream reassurance must not unlock learner generation')

  assert(courseTruth.course?.course_id === EXPECTED_COURSE_ID, 'Course Truth course identity changed')
  assert(courseTruth.course?.exam_year === EXPECTED_EXAM_YEAR, 'Course Truth exam year changed')
  assert(courseTruth.projection_fingerprint === EXPECTED_COURSE_TRUTH_FINGERPRINT, 'Unexpected Course Truth fingerprint')
  assert(courseTruth.dependencies?.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Course Truth is not bound to the exact Subject Foundation')
  assert(courseTruth.dependencies?.specification_mapping?.mapping_id === mapping.mapping_id, 'Course Truth is not bound to the exact Specification Mapping')
  assert(courseTruth.dependencies?.foundation_reassurance?.reassurance_fingerprint === receipt.reassurance.reassurance_fingerprint, 'Course Truth is not bound to exact reassurance evidence')
  assert(courseTruth.coverage?.governed_requirement_count === EXPECTED_REQUIREMENTS, 'Course Truth requirement denominator changed')
  assert(courseTruth.coverage?.mapped_requirement_count === EXPECTED_REQUIREMENTS, 'Course Truth is not fully mapped')
  assert(courseTruth.coverage?.unresolved_requirement_count === 0, 'Course Truth retains unresolved exact-course requirements')
  assert(courseTruth.coverage?.unresolved_reusable_foundation_gap_count === 0, 'Course Truth retains an unresolved reusable Subject Foundation gap')
  assert(courseTruth.rights_boundary?.awarding_body_use === 'REFERENCE_ONLY', 'Course Truth awarding-body rights boundary changed')

  const requirementIds = courseTruth.requirements.map((requirement) => requirement.requirement_id)
  assert(new Set(requirementIds).size === EXPECTED_REQUIREMENTS, 'Course Truth contains duplicate requirement IDs')
  exactSet(requirementIds, mapping.requirements.map((requirement) => requirement.requirement_id), 'Course Truth requirement IDs')
  for (const requirement of courseTruth.requirements) {
    assert(['mapped', 'covered_after_v07_foundation_reassurance'].includes(requirement.effective_coverage_status), `${requirement.requirement_id} is not assurance-ready`)
    assert(requirement.mapped_subject_node_ids?.length > 0, `${requirement.requirement_id} is not mapped to Subject Foundation knowledge`)
    for (const nodeId of requirement.mapped_subject_node_ids) {
      assert(candidate.nodes.has(nodeId), `${requirement.requirement_id} references unknown Subject Foundation node ${nodeId}`)
    }
  }

  const selectedSubjectNodeIds = unique(courseTruth.requirements.flatMap((requirement) => requirement.mapped_subject_node_ids))
  assert(selectedSubjectNodeIds.length === EXPECTED_SELECTED_NODES, `Expected ${EXPECTED_SELECTED_NODES} exact-course Subject Foundation nodes, got ${selectedSubjectNodeIds.length}`)

  assert(examTruth.course_id === EXPECTED_COURSE_ID, 'Exam Truth course identity changed')
  assert(examTruth.exam_year === EXPECTED_EXAM_YEAR, 'Exam Truth exam year changed')
  assert(examTruth.exam_truth_fingerprint === EXPECTED_EXAM_TRUTH_FINGERPRINT, 'Unexpected Exam Truth fingerprint')
  assert(examTruth.dependencies?.course_truth_fingerprint === courseTruth.projection_fingerprint, 'Exam Truth is not bound to exact Course Truth')
  assert(examTruth.rights_boundary?.awarding_body_use === 'REFERENCE_ONLY', 'Exam Truth awarding-body rights boundary changed')
  assert(examTruth.rights_boundary?.derived_facts_only === true, 'Exam Truth must retain derived-facts-only boundary')
  assert(examTruth.rights_boundary?.source_text_copied_into_generative_truth === false, 'Exam Truth must not contain copied awarding-body source prose')
  assert(examTruth.rights_boundary?.mark_scheme_or_examiner_prose_promoted_to_truth === false, 'Exam Truth must not promote mark-scheme/examiner prose')
  assert(examTruth.sources?.length === 4, 'Stable Exam Truth source set changed')
  assert(examTruth.sources.every((source) => source.rights_classification === 'REFERENCE_ONLY' && /^https:\/\/www\.aqa\.org\.uk\//.test(source.url)), 'Exam Truth contains a source outside the approved AQA reference-only boundary')
  assert(examTruth.assessment_model?.components?.length === 3, 'Exam Truth component count changed')
  assert(examTruth.assessment_model?.total_raw_marks === 300, 'Exam Truth total raw marks changed')
  assert(examTruth.assessment_model?.quantitative_skills_minimum_overall_percent === 10, 'Exam Truth quantitative minimum changed')
  exactSet(examTruth.question_families.map((family) => family.family_id), ['MCQ', 'SHORT_ANSWER', 'ESSAY', 'DATA_RESPONSE', 'CASE_STUDY'], 'Exam Truth stable question-family set')
  assert(examTruth.assessment_resource_boundary?.mark_scheme_detail_status === 'not_promoted_to_stable_exam_truth', 'Variable mark-scheme detail escaped its boundary')
  assert(examTruth.completeness?.ready_for_exact_course_assurance === true, 'Exam Truth is not ready for exact-course assurance')
  assert(examTruth.completeness?.learner_asset_regeneration_allowed === false, 'Exam Truth must not unlock learner generation before T8 completes')

  assert(adapter.authority?.adapter_is_normative_truth === false, 'Runtime adapter must remain non-authoritative')
  assert(adapter.dependencies?.subject_foundation_fingerprint === candidate.fingerprint, 'Runtime adapter Subject Foundation dependency changed')
  assert(adapter.dependencies?.course_truth_fingerprint === courseTruth.projection_fingerprint, 'Runtime adapter Course Truth dependency changed')
  assert(adapter.dependencies?.exam_truth_fingerprint === examTruth.exam_truth_fingerprint, 'Runtime adapter Exam Truth dependency changed')
  assert(adapter.gates?.exact_course_assurance_required === true, 'Runtime adapter must preserve T8 exact-course assurance')
  assert(adapter.gates?.learner_asset_regeneration_allowed === false, 'Runtime adapter must not unlock learner generation')
  assert(adapter.gates?.publication_allowed === false, 'Runtime adapter must not unlock publication')
  assert(adapter.lineage?.node_crosswalk?.length === selectedSubjectNodeIds.length, 'Runtime adapter node crosswalk is detached from exact Course Truth')
  exactSet(adapter.lineage.node_crosswalk.map((entry) => entry.subject_foundation_node_id), selectedSubjectNodeIds, 'Runtime adapter Subject Foundation node crosswalk')

  const excludedPromotionSources = new Set((candidate.sources.legacy_promotion_exclusions ?? []).map((entry) => entry.source_id))
  const promotionSourceIds = unique(selectedSubjectNodeIds.flatMap((nodeId) => candidate.rows.get(nodeId)?.subject_truth_sources ?? []))
  assert(promotionSourceIds.length > 0, 'Selected exact-course Subject Foundation nodes have no promotion truth sources')
  for (const sourceId of promotionSourceIds) {
    const source = candidate.sourceById.get(sourceId)
    assert(source?.promotion_eligible === true, `Subject truth source ${sourceId} is not promotion-eligible`)
    assert(!excludedPromotionSources.has(sourceId), `Excluded source ${sourceId} is being used as reusable Subject Foundation truth`)
  }

  return { selectedSubjectNodeIds, promotionSourceIds }
}

async function buildPackage() {
  await materialiseDependencies()
  const [candidate, receipt, courseTruth, examTruth, adapter] = await Promise.all([
    loadBusinessSubjectFoundationCandidate(),
    readFile(RECEIPT_PATH, 'utf8').then(JSON.parse),
    readFile(`${COURSE_OUT}/course-truth.json`, 'utf8').then(JSON.parse),
    readFile(`${COURSE_OUT}/exam-truth.json`, 'utf8').then(JSON.parse),
    readFile(`${COURSE_OUT}/runtime-adapter.json`, 'utf8').then(JSON.parse),
  ])

  const { selectedSubjectNodeIds, promotionSourceIds } = validateExactCourseBundle({ candidate, receipt, courseTruth, examTruth, adapter })
  const exactCourseFoundationIdentity = {
    schema_version: 1,
    course_id: EXPECTED_COURSE_ID,
    exam_year: EXPECTED_EXAM_YEAR,
    subject_foundation_fingerprint: candidate.fingerprint,
    specification_mapping_id: mapping.mapping_id,
    specification_mapping_fingerprint: courseTruth.dependencies.specification_mapping.mapping_fingerprint,
    reassurance_fingerprint: receipt.reassurance.reassurance_fingerprint,
    course_truth_fingerprint: courseTruth.projection_fingerprint,
    exam_truth_fingerprint: examTruth.exam_truth_fingerprint,
    selected_subject_node_ids: [...selectedSubjectNodeIds].sort(),
  }
  const exactCourseFoundationFingerprint = fingerprint(exactCourseFoundationIdentity)

  const deterministicChecks = [
    ['subject-foundation-identity', 'Exact Business Subject Foundation v0.7 identity, node denominator and aggregate fingerprint are retained.'],
    ['subject-foundation-rights-and-provenance', 'Every selected Subject Foundation node resolves only to promotion-eligible reusable subject-truth sources.'],
    ['specification-mapping-completeness', 'All 42 governed AQA requirements are represented exactly once and map to existing Subject Foundation nodes.'],
    ['reassurance-binding', 'The exact BUS-FIN-008 reassurance PASS is bound without rewriting the historical mapping candidate.'],
    ['course-truth-dependencies', 'Course Truth is bound to the exact Subject Foundation, Specification Mapping and reassurance evidence.'],
    ['course-truth-coverage', 'Course Truth has 42/42 mapped requirements with no unresolved exact-course or reusable-subject gap.'],
    ['exam-truth-dependency', 'Exam Truth is bound to the exact Course Truth fingerprint.'],
    ['exam-truth-stable-contract', 'Stable component, AO, quantitative and question-family facts remain inside the approved exact-course assessment boundary.'],
    ['awarding-body-rights-boundary', 'AQA evidence remains REFERENCE_ONLY and protected prose/variable mark-scheme detail is excluded from reusable or stable generative truth.'],
    ['runtime-handoff-integrity', 'The non-authoritative runtime adapter remains bound to the exact normative dependencies and selected Subject Foundation node set.'],
    ['pre-t8-release-gate', 'Learner generation and publication remain disabled until fresh T8 review/challenge evidence passes.'],
  ].map(([check_id, message]) => ({ check_id, status: 'pass', severity: 'informational', message }))

  const deterministicAssurance = {
    schema_version: 1,
    artifact_type: 'aqa_7132_exact_course_deterministic_assurance',
    course_id: EXPECTED_COURSE_ID,
    exam_year: EXPECTED_EXAM_YEAR,
    exact_course_foundation_fingerprint: exactCourseFoundationFingerprint,
    decision: 'pass',
    checks: deterministicChecks,
    unresolved_blocking_or_material_findings: 0,
  }

  const selectedSubjectNodes = selectedSubjectNodeIds.map((nodeId) => reviewNode(nodeId, candidate.nodes.get(nodeId), candidate.rows.get(nodeId)))
  const promotionSources = promotionSourceIds.map((sourceId) => reviewSource(candidate.sourceById.get(sourceId)))

  const reviewBundle = {
    schema_version: 1,
    artifact_type: 'aqa_7132_exact_course_review_bundle',
    review_scope: 'exact-course educational and assessment assurance only; no learner-asset generation',
    exact_course_foundation_identity: exactCourseFoundationIdentity,
    exact_course_foundation_fingerprint: exactCourseFoundationFingerprint,
    rights_boundary: {
      reusable_subject_truth: 'promotion-eligible Business Subject Foundation sources only',
      awarding_body_material: 'REFERENCE_ONLY alignment and assessment evidence only',
      protected_aqa_source_body_for_ai_review: false,
    },
    mapping_summary: {
      mapping_id: mapping.mapping_id,
      governed_requirement_count: courseTruth.coverage.governed_requirement_count,
      mapped_requirement_count: courseTruth.coverage.mapped_requirement_count,
      unresolved_requirement_count: courseTruth.coverage.unresolved_requirement_count,
      unresolved_reusable_foundation_gap_count: courseTruth.coverage.unresolved_reusable_foundation_gap_count,
    },
    reassurance: {
      receipt_id: receipt.receipt_id,
      decision: receipt.reassurance.decision,
      reassurance_fingerprint: receipt.reassurance.reassurance_fingerprint,
      target_node_id: receipt.subject_foundation.target_node_id,
      unresolved_blocking_or_material_findings: receipt.reassurance.unresolved_blocking_or_material_findings,
    },
    course_truth: courseTruth,
    exam_truth: examTruth,
    selected_subject_foundation_nodes: selectedSubjectNodes,
    subject_truth_sources: promotionSources,
    runtime_handoff_evidence: {
      adapter_id: adapter.adapter_id,
      adapter_is_normative_truth: false,
      projected_knowledge_nodes: adapter.course_knowledge_model.nodes.length,
      requirement_count: adapter.foundation_coverage_model.requirements.length,
      lineage: adapter.lineage,
    },
    deterministic_assurance: deterministicAssurance,
    deliberate_boundaries: [
      'Future question-level mark allocations, indicative content and detailed mark-scheme wording are not stable Exam Truth.',
      'Operational exam dates are not durable Exam Truth.',
      'The compatibility runtime adapter is implementation evidence, not educational authority.',
      'A T8 AI-assured result permits controlled internal/pre-production derivation only; qualified human approval remains required for foundation_approved and learner publication eligibility.',
    ],
  }

  const candidateRecord = {
    schema_version: 1,
    artifact_type: 'aqa_7132_exact_course_foundation_candidate',
    status: 'deterministic_pass_pending_fresh_review',
    exact_course_foundation_identity: exactCourseFoundationIdentity,
    exact_course_foundation_fingerprint: exactCourseFoundationFingerprint,
    deterministic_assurance: {
      status: 'pass',
      evidence_ref: 'deterministic-assurance.json',
    },
    independent_review: { status: 'pending' },
    external_source_challenge: { status: 'pending' },
    qualified_human_review: { status: 'pending' },
    gates: {
      ai_assured: false,
      controlled_internal_asset_production_allowed: false,
      foundation_approved: false,
      learner_publication_eligible: false,
    },
    known_limitations: unique([
      ...(courseTruth.known_limitations ?? []),
      ...(examTruth.known_limitations ?? []),
      'Qualified subject/assessment review is not part of T8 AI assurance and remains pending.',
    ]),
  }

  const summary = {
    status: 'deterministic_pass_pending_fresh_review',
    courseId: EXPECTED_COURSE_ID,
    examYear: EXPECTED_EXAM_YEAR,
    exactCourseFoundationFingerprint,
    subjectFoundationFingerprint: candidate.fingerprint,
    courseTruthFingerprint: courseTruth.projection_fingerprint,
    examTruthFingerprint: examTruth.exam_truth_fingerprint,
    governedRequirements: courseTruth.coverage.governed_requirement_count,
    selectedSubjectNodes: selectedSubjectNodeIds.length,
    deterministicChecks: deterministicChecks.length,
    nextGate: 'fresh_independent_review_and_external_source_challenge',
    aiAssured: false,
    controlledInternalAssetProductionAllowed: false,
    foundationApproved: false,
    learnerPublicationEligible: false,
  }

  return { candidate, receipt, courseTruth, examTruth, adapter, candidateRecord, deterministicAssurance, reviewBundle, summary }
}

async function selfTest() {
  const built = await buildPackage()

  const badExam = structuredClone(built.examTruth)
  badExam.sources[0].rights_classification = 'OPEN'
  let rightsFailedClosed = false
  try {
    validateExactCourseBundle({ candidate: built.candidate, receipt: built.receipt, courseTruth: built.courseTruth, examTruth: badExam, adapter: built.adapter })
  } catch {
    rightsFailedClosed = true
  }
  assert(rightsFailedClosed, 'Self-test failed: awarding-body rights mutation did not fail closed')

  const badCourse = structuredClone(built.courseTruth)
  badCourse.requirements[0].mapped_subject_node_ids = ['BUS-NOT-A-REAL-NODE']
  let mappingFailedClosed = false
  try {
    validateExactCourseBundle({ candidate: built.candidate, receipt: built.receipt, courseTruth: badCourse, examTruth: built.examTruth, adapter: built.adapter })
  } catch {
    mappingFailedClosed = true
  }
  assert(mappingFailedClosed, 'Self-test failed: unknown Subject Foundation node did not fail closed')

  console.log(JSON.stringify({ ...built.summary, selfTest: 'pass' }, null, 2))
}

async function main() {
  if (process.argv.includes('--self-test')) {
    await selfTest()
    return
  }

  const built = await buildPackage()
  await mkdir(OUT, { recursive: true })
  await Promise.all([
    writeFile(`${OUT}/candidate.json`, JSON.stringify(built.candidateRecord, null, 2)),
    writeFile(`${OUT}/deterministic-assurance.json`, JSON.stringify(built.deterministicAssurance, null, 2)),
    writeFile(`${OUT}/review-bundle.json`, JSON.stringify(built.reviewBundle, null, 2)),
    writeFile(`${OUT}/summary.json`, JSON.stringify(built.summary, null, 2)),
  ])
  console.log(JSON.stringify(built.summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
