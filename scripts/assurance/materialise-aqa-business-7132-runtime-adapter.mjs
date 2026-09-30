import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const COURSE_TRUTH_PATH = `${OUT}/course-truth.json`
const EXAM_TRUTH_PATH = `${OUT}/exam-truth.json`
const EXPECTED_REQUIREMENTS = 42
const JOB_ID = 'aqa-business-7132-2027'
const FOUNDATION_RUNTIME_SOURCE_REF = 'subject-foundation-current'
const COURSE_SOURCE_REF = 'aqa-7132-subject-content'

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

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))]
}

function runtimeId(value) {
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  assert(/^[a-z0-9][a-z0-9._-]*$/.test(normalized), `Cannot normalise runtime identifier: ${value}`)
  return normalized
}

function runtimeComponentId(componentId) {
  return runtimeId(`aqa-${componentId.replace('/', '-')}`)
}

function nodeKind(node) {
  const types = new Set(node.node_types || [])
  if (types.has('formula_quantitative') || (node.quantitative_content?.methods || []).length > 0) return 'formula'
  if (types.has('procedure_skill') || types.has('exam_response_skill')) return 'skill'
  return 'concept'
}

function nodeDepth(node) {
  const scope = `${node.scope_classification || ''} ${node.recommended_depth || ''}`.toLowerCase()
  if (scope.includes('extension') || scope.includes('advanced')) return 'advanced'
  if (scope.includes('foundation') || scope.includes('introduct')) return 'foundational'
  return 'core'
}

function misconceptionText(value) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null
  const belief = value.incorrect_belief || value.belief || value.misconception
  const correction = value.correction || value.correct_understanding
  if (belief && correction) return `${belief} Correction: ${correction}`
  return belief || correction || null
}

async function loadInputs() {
  const [courseTruth, examTruth, candidate] = await Promise.all([
    readFile(COURSE_TRUTH_PATH, 'utf8').then(JSON.parse),
    readFile(EXAM_TRUTH_PATH, 'utf8').then(JSON.parse),
    loadBusinessSubjectFoundationCandidate(),
  ])

  assert(courseTruth.dependencies?.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Course Truth is not bound to the loaded Foundation')
  assert(courseTruth.dependencies?.specification_mapping?.mapping_id === mapping.mapping_id, 'Course Truth mapping identity mismatch')
  assert(courseTruth.coverage?.governed_requirement_count === EXPECTED_REQUIREMENTS, 'Course Truth requirement denominator mismatch')
  assert(courseTruth.coverage?.unresolved_requirement_count === 0, 'Course Truth still has unresolved requirements')
  assert(Array.isArray(courseTruth.selected_subject_node_ids) && courseTruth.selected_subject_node_ids.length > 0, 'Course Truth has no selected Subject Foundation nodes')
  assert(examTruth.dependencies?.course_truth_fingerprint === courseTruth.projection_fingerprint, 'Exam Truth is not bound to exact Course Truth')
  assert(examTruth.completeness?.ready_for_exact_course_assurance === true, 'Exam Truth is not ready for exact-course assurance')
  assert(examTruth.completeness?.learner_asset_regeneration_allowed === false, 'Exam Truth must not unlock learner generation')

  return { courseTruth, examTruth, candidate }
}

function buildBoardAlignment(examTruth) {
  const sourceRefs = unique(examTruth.sources.map((source) => runtimeId(source.source_id)))
  const components = examTruth.assessment_model.components.map((component) => ({
    id: runtimeComponentId(component.component_id),
    name: component.name,
    compulsory: true,
    marks: component.raw_marks,
    durationMinutes: component.duration_minutes,
    weightingPercent: component.qualification_weight_percent,
  }))
  const assessmentObjectives = Object.entries(examTruth.assessment_objectives).map(([id, objective]) => ({
    id: runtimeId(id),
    name: objective.capability.replaceAll('_', ' '),
    sourceRefs: ['aqa-7132-scheme-of-assessment'],
  }))
  const assessmentRequirements = [
    {
      id: 'aqa-7132-whole-course-content',
      summary: 'Each of the three written papers can assess content from across the full A-level Business course.',
      componentScope: components.map((component) => component.id),
      sourceRefs: ['aqa-7132-specification-at-a-glance'],
    },
    {
      id: 'aqa-7132-quantitative-minimum',
      summary: 'At least 10% of qualification marks assess quantitative skills.',
      componentScope: components.map((component) => component.id),
      sourceRefs: ['aqa-7132-quantitative-skills'],
    },
    {
      id: 'aqa-7132-ao-range-contract',
      summary: 'AO1 to AO4 are governed by published qualification-level percentage ranges rather than a single invented fixed weighting.',
      componentScope: components.map((component) => component.id),
      sourceRefs: ['aqa-7132-scheme-of-assessment'],
    },
  ]
  const base = {
    schemaVersion: 1,
    jobId: JOB_ID,
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level Business',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: {
      status: 'current',
      notes: ['This adapter is scoped to the 2027 AQA 7132 course projection; operational exam dates are intentionally outside durable Course/Exam Truth.'],
    },
    components,
    assessmentObjectives,
    assessmentRequirements,
    sourceRefs,
    verificationStatus: 'verified',
  }
  return { ...base, fingerprint: fingerprint(base) }
}

// A requirement is taught by its mapped nodes plus the prerequisites those nodes need (within the course node set).
function requirementKnowledgeNodeIds(requirement, candidate, selected) {
  const ids = new Set(requirement.mapped_subject_node_ids)
  const queue = [...requirement.mapped_subject_node_ids]
  while (queue.length) {
    for (const prerequisite of candidate.nodes.get(queue.shift())?.prerequisites || []) {
      if (selected.has(prerequisite) && !ids.has(prerequisite)) { ids.add(prerequisite); queue.push(prerequisite) }
    }
  }
  return [...ids]
}

function buildCoverageModel(courseTruth, candidate, boardAlignment) {
  const selected = new Set(courseTruth.selected_subject_node_ids)
  const componentScope = boardAlignment.components.map((component) => component.id)
  const requirements = courseTruth.requirements.map((requirement) => ({
    requirementId: runtimeId(requirement.requirement_id),
    officialReference: `${requirement.source_section} ${requirement.title}`,
    requirementSummary: requirement.rights_safe_requirement_summary,
    skillsOrKnowledge: unique([
      requirement.rights_safe_requirement_summary,
      ...(requirement.required_course_facets || []).map((facet) => `Course-specific facet: ${facet}`),
      ...(requirement.required_quantitative_methods || []).map((method) => `Course-specific quantitative convention: ${method}`),
    ]),
    componentScope,
    revisionArea: requirement.title,
    sourceRefs: [COURSE_SOURCE_REF, FOUNDATION_RUNTIME_SOURCE_REF],
    knowledgeNodeIds: requirementKnowledgeNodeIds(requirement, candidate, selected).map(runtimeId),
    coverageStatus: 'complete',
  }))
  const sourceSetFingerprint = fingerprint({
    subjectFoundationFingerprint: courseTruth.dependencies.subject_foundation.candidate_fingerprint,
    courseTruthFingerprint: courseTruth.projection_fingerprint,
    boardAlignmentFingerprint: boardAlignment.fingerprint,
  })
  return {
    schemaVersion: 1,
    jobId: JOB_ID,
    sourceSetFingerprint,
    requirements,
  }
}

function buildCourseKnowledgeModel(courseTruth, candidate, boardAlignment) {
  // Course Truth owns the course's node set: mapped nodes plus their prerequisites.
  const selectedCanonicalIds = [...courseTruth.selected_subject_node_ids]
  const selected = new Set(selectedCanonicalIds)
  const componentRefs = boardAlignment.components.map((component) => component.id)

  const nodes = selectedCanonicalIds.map((canonicalId) => {
    const node = candidate.nodes.get(canonicalId)
    assert(node, `Course Truth references unknown Foundation node ${canonicalId}`)
    const teaching = node.teaching_content || {}
    const quantitative = node.quantitative_content || {}
    const formulas = (quantitative.methods || [])
      .filter((method) => method?.formula)
      .map((method) => method.name ? `${method.name}: ${method.formula}` : method.formula)
    const misconceptions = (teaching.misconceptions || []).map(misconceptionText).filter(Boolean)
    const evidenceTypes = unique([
      ...(node.node_types || []).map((value) => value.replaceAll('_', ' ')),
      ...(node.evidence_of_understanding || []),
    ])

    return {
      id: runtimeId(canonicalId),
      kind: nodeKind(node),
      summary: teaching.core_explanation,
      prerequisiteIds: (node.prerequisites || []).filter((id) => selected.has(id)).map(runtimeId),
      relatedIds: (node.related_nodes || []).filter((id) => selected.has(id)).map(runtimeId),
      formulas,
      misconceptions,
      applicationContexts: unique([...(teaching.applications || []), ...(teaching.real_world_transfer || [])]),
      depth: nodeDepth(node),
      sourceRefs: [FOUNDATION_RUNTIME_SOURCE_REF],
      boardAlignmentRefs: componentRefs,
      evidenceTypes: evidenceTypes.length ? evidenceTypes : ['course knowledge explanation'],
    }
  })

  const base = {
    schemaVersion: 1,
    jobId: JOB_ID,
    nodes,
  }
  return { ...base, fingerprint: fingerprint({ ...base, subjectFoundationFingerprint: candidate.fingerprint, courseTruthFingerprint: courseTruth.projection_fingerprint }) }
}

function buildAssessmentBlueprint(examTruth, boardAlignment, courseKnowledgeModel) {
  const familyIdsByComponent = new Map(examTruth.assessment_model.components.map((component) => [
    component.component_id,
    unique(component.question_structure.map((item) => runtimeId(item.family))),
  ]))
  const objectiveRanges = Object.entries(examTruth.assessment_objectives).map(([id, objective]) => ({
    objectiveId: runtimeId(id),
    minPercent: objective.overall_percent_range[0],
    maxPercent: objective.overall_percent_range[1],
  }))

  return {
    schemaVersion: 2,
    jobId: JOB_ID,
    boardAlignmentFingerprint: boardAlignment.fingerprint,
    courseKnowledgeModelFingerprint: courseKnowledgeModel.fingerprint,
    assessmentObjectives: Object.keys(examTruth.assessment_objectives).map((id) => ({ id: runtimeId(id) })),
    assessmentRequirements: boardAlignment.assessmentRequirements.map((requirement) => ({
      id: requirement.id,
      summary: requirement.summary,
      componentScope: requirement.componentScope,
    })),
    components: examTruth.assessment_model.components.map((component) => ({
      componentId: runtimeComponentId(component.component_id),
      questionFamilyIds: familyIdsByComponent.get(component.component_id),
      markTotal: component.raw_marks,
      timingMinutes: component.duration_minutes,
      constraints: ['Stable structure only; future question-level mark allocations and detailed mark-scheme behaviour are not inferred.'],
    })),
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: ['At least 10% of qualification marks assess quantitative skills; no unsupported allocation to particular question families is asserted here.'],
    assessmentObjectiveCoveragePlan: {
      sourceAssessmentRequirementId: 'aqa-7132-ao-range-contract',
      scope: 'qualification_total',
      totalAssessmentMarks: examTruth.assessment_model.total_raw_marks,
      objectives: objectiveRanges,
      generationValidation: 'sum_assessment_objective_marks_within_ranges',
      allocationRequiredAt: 'marking_pack_generation',
    },
    synopticRequirements: ['All three papers can assess content from across the full course.'],
  }
}

function buildLineage(courseTruth, candidate) {
  // Course Truth owns the course's node set: mapped nodes plus their prerequisites.
  const selectedCanonicalIds = [...courseTruth.selected_subject_node_ids]
  return {
    runtime_source_refs: {
      [FOUNDATION_RUNTIME_SOURCE_REF]: {
        meaning: 'Exact assured reusable Subject Knowledge Foundation candidate, not an awarding-body source.',
        candidate_version: candidate.index.candidate_version,
        candidate_fingerprint: candidate.fingerprint,
      },
      [COURSE_SOURCE_REF]: {
        meaning: 'AQA 7132 course-alignment source pointer; REFERENCE_ONLY and excluded from reusable subject teaching truth.',
        mapping_id: mapping.mapping_id,
      },
    },
    node_crosswalk: selectedCanonicalIds.map((canonicalId) => ({
      runtime_node_id: runtimeId(canonicalId),
      subject_foundation_node_id: canonicalId,
      subject_truth_source_ids: [...(candidate.rows.get(canonicalId)?.subject_truth_sources || [])],
    })),
    requirement_crosswalk: courseTruth.requirements.map((requirement) => ({
      runtime_requirement_id: runtimeId(requirement.requirement_id),
      course_truth_requirement_id: requirement.requirement_id,
      subject_foundation_node_ids: [...requirement.mapped_subject_node_ids],
      runtime_knowledge_node_ids: requirement.mapped_subject_node_ids.map(runtimeId),
      course_specific_facets: [...(requirement.required_course_facets || [])],
      course_specific_quantitative_methods: [...(requirement.required_quantitative_methods || [])],
    })),
  }
}

function validateAdapter(adapter) {
  const nodeIds = new Set(adapter.course_knowledge_model.nodes.map((node) => node.id))
  assert(nodeIds.size === adapter.course_knowledge_model.nodes.length, 'Runtime adapter contains duplicate knowledge nodes')
  assert(adapter.foundation_coverage_model.requirements.length === EXPECTED_REQUIREMENTS, 'Runtime adapter lost AQA requirements')
  for (const requirement of adapter.foundation_coverage_model.requirements) {
    assert(requirement.knowledgeNodeIds.length > 0, `${requirement.requirementId} has no runtime knowledge nodes`)
    for (const nodeId of requirement.knowledgeNodeIds) assert(nodeIds.has(nodeId), `${requirement.requirementId} references missing runtime node ${nodeId}`)
  }
  for (const node of adapter.course_knowledge_model.nodes) {
    for (const ref of [...node.prerequisiteIds, ...node.relatedIds]) assert(nodeIds.has(ref), `${node.id} references runtime-external relation ${ref}`)
  }
  assert(adapter.assessment_blueprint_compatibility.quantitativeCoveragePlan === undefined, 'Runtime adapter must not invent question-family quantitative allocation')
  assert(adapter.gates.learner_asset_regeneration_allowed === false, 'Runtime adapter must not unlock learner generation')
  assert(adapter.gates.exact_course_assurance_required === true, 'Runtime adapter must preserve exact-course assurance gate')
}

async function main() {
  const { courseTruth, examTruth, candidate } = await loadInputs()
  const boardAlignment = buildBoardAlignment(examTruth)
  const foundationCoverageModel = buildCoverageModel(courseTruth, candidate, boardAlignment)
  const courseKnowledgeModel = buildCourseKnowledgeModel(courseTruth, candidate, boardAlignment)
  const assessmentBlueprint = buildAssessmentBlueprint(examTruth, boardAlignment, courseKnowledgeModel)

  const adapter = {
    schema_version: 1,
    adapter_id: 'aqa-business-7132-2027-course-truth-runtime-adapter-v1',
    status: 'transitional_runtime_contract_adapter_only',
    authority: {
      source_of_truth: ['course-truth.json', 'exam-truth.json', `subject-foundation ${candidate.index.candidate_version}`],
      adapter_is_normative_truth: false,
      purpose: 'Bridge the Foundation-native Course/Exam Truth projection into current Content Factory runtime schemas without creating a second authority model.',
    },
    dependencies: {
      subject_foundation_fingerprint: candidate.fingerprint,
      course_truth_fingerprint: courseTruth.projection_fingerprint,
      exam_truth_fingerprint: examTruth.exam_truth_fingerprint,
    },
    gates: {
      exact_course_assurance_required: true,
      learner_asset_regeneration_allowed: false,
      publication_allowed: false,
      assessment_blueprint_use: 'contract_compatibility_only_until_exact_course_assurance',
    },
    known_translation_boundaries: [
      'Course-specific facets remain explicit coverage obligations and are not written back into reusable Subject Foundation nodes.',
      'The runtime Course Knowledge Model uses a single assured-Foundation source pointer; canonical per-node source lineage is retained in the crosswalk below.',
      'No quantitative mark allocation to particular question families is asserted because the stable Exam Truth only establishes the qualification-level minimum.',
      'Question-family calibration, detailed marking behaviour and learner generation remain downstream exact-course assurance work.',
    ],
    board_alignment: boardAlignment,
    foundation_coverage_model: foundationCoverageModel,
    course_knowledge_model: courseKnowledgeModel,
    assessment_blueprint_compatibility: assessmentBlueprint,
    lineage: buildLineage(courseTruth, candidate),
  }
  validateAdapter(adapter)

  const summary = {
    status: 'pass',
    adapterId: adapter.adapter_id,
    governedRequirements: foundationCoverageModel.requirements.length,
    projectedKnowledgeNodes: courseKnowledgeModel.nodes.length,
    subjectFoundationFingerprint: candidate.fingerprint,
    courseTruthFingerprint: courseTruth.projection_fingerprint,
    examTruthFingerprint: examTruth.exam_truth_fingerprint,
    boardAlignmentFingerprint: boardAlignment.fingerprint,
    courseKnowledgeModelFingerprint: courseKnowledgeModel.fingerprint,
    learnerAssetRegenerationAllowed: false,
    nextGate: 'exact_course_assurance',
  }

  if (process.argv.includes('--self-test')) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  await mkdir(OUT, { recursive: true })
  await Promise.all([
    writeFile(`${OUT}/runtime-adapter.json`, JSON.stringify(adapter, null, 2)),
    writeFile(`${OUT}/board-alignment.json`, JSON.stringify(boardAlignment, null, 2)),
    writeFile(`${OUT}/foundation-coverage-model.json`, JSON.stringify(foundationCoverageModel, null, 2)),
    writeFile(`${OUT}/course-knowledge-model.json`, JSON.stringify(courseKnowledgeModel, null, 2)),
    writeFile(`${OUT}/assessment-blueprint-compatibility.json`, JSON.stringify(assessmentBlueprint, null, 2)),
    writeFile(`${OUT}/runtime-adapter-summary.json`, JSON.stringify(summary, null, 2)),
  ])
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
