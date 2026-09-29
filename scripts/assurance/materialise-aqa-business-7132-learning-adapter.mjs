import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v07.mjs'

const OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const COURSE_TRUTH_PATH = `${OUT}/course-truth.json`
const ADAPTER_PATH = `${OUT}/learning-adapter.json`
const EXPECTED_COURSE_TRUTH_ID = 'aqa-business-7132-2027-course-truth-v1'
const EXPECTED_FOUNDATION_FINGERPRINT = '64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const EXPECTED_REQUIREMENTS = 42
const JOB_ID = 'aqa-business-7132-2027-course-truth'
const COURSE_TRUTH_SOURCE_REF = 'course-truth-aqa-business-7132-2027'

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
  return [...new Set(values)]
}

function identifier(value) {
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  assert(/^[a-z0-9][a-z0-9._-]*$/.test(normalized), `Cannot create legacy identifier from ${value}`)
  return normalized
}

function humanize(value) {
  return String(value)
    .replace(/^AQA_/i, '')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function nodeKind(node) {
  const types = new Set(node.node_types || [])
  if (types.has('procedure_skill')) return 'skill'
  if (types.has('formula_quantitative') || (node.quantitative_content?.methods || []).length > 0) return 'formula'
  return 'concept'
}

function nodeDepth(node) {
  const scope = String(node.scope_classification || '').toLowerCase()
  if (scope.includes('foundational')) return 'foundational'
  if (scope.includes('advanced')) return 'advanced'
  return 'core'
}

function misconceptionText(value) {
  if (typeof value === 'string') return value
  if (value?.incorrect_belief && value?.correction) return `${value.incorrect_belief} Correction: ${value.correction}`
  if (value?.correction) return value.correction
  return JSON.stringify(value)
}

async function buildAdapter() {
  const candidate = await loadBusinessSubjectFoundationCandidate()
  const courseTruth = JSON.parse(await readFile(COURSE_TRUTH_PATH, 'utf8'))

  assert(candidate.fingerprint === EXPECTED_FOUNDATION_FINGERPRINT, 'Unexpected Business Foundation fingerprint')
  assert(courseTruth.projection_id === EXPECTED_COURSE_TRUTH_ID, 'Unexpected Course Truth projection')
  assert(courseTruth.projection_fingerprint?.length === 64, 'Course Truth fingerprint is missing')
  assert(courseTruth.dependencies?.subject_foundation?.candidate_fingerprint === candidate.fingerprint, 'Course Truth/Foundation fingerprint mismatch')
  assert(courseTruth.coverage?.projection_ready === true, 'Course Truth is not projection-ready')
  assert(courseTruth.requirements?.length === EXPECTED_REQUIREMENTS, 'Course Truth requirement denominator changed')

  const originalNodeIds = unique(courseTruth.requirements.flatMap((requirement) => requirement.mapped_subject_node_ids || []))
  assert(originalNodeIds.length > 0 && originalNodeIds.length < candidate.nodes.size, 'Exact-course node subset is invalid')
  for (const nodeId of originalNodeIds) assert(candidate.nodes.has(nodeId), `Course Truth references unknown Foundation node ${nodeId}`)

  const subjectNodeAliases = Object.fromEntries(originalNodeIds.map((nodeId) => [identifier(nodeId), nodeId]))
  assert(Object.keys(subjectNodeAliases).length === originalNodeIds.length, 'Foundation node alias collision')

  const requirementAlias = (requirementId) => identifier(requirementId)
  const requirementsByNode = new Map(originalNodeIds.map((nodeId) => [nodeId, []]))
  for (const requirement of courseTruth.requirements) {
    for (const nodeId of requirement.mapped_subject_node_ids) requirementsByNode.get(nodeId)?.push(requirement)
  }

  const originalSourceIds = unique(originalNodeIds.flatMap((nodeId) => {
    const row = candidate.rows.get(nodeId)
    assert(row?.subject_truth_sources?.length, `Foundation node ${nodeId} has no promotion truth sources`)
    return row.subject_truth_sources
  }))
  const sourceRefAliases = {}
  for (const sourceId of originalSourceIds) {
    const source = candidate.sourceById.get(sourceId)
    assert(source?.promotion_eligible, `Foundation source ${sourceId} is not promotion-eligible`)
    const alias = identifier(`foundation-${sourceId}`)
    assert(!sourceRefAliases[alias], `Foundation source alias collision for ${sourceId}`)
    sourceRefAliases[alias] = {
      foundation_source_id: sourceId,
      issuer: source.issuer,
      title: source.title,
    }
  }
  const sourceAliasByOriginal = new Map(Object.entries(sourceRefAliases).map(([alias, record]) => [record.foundation_source_id, alias]))

  const coverageRequirements = courseTruth.requirements.map((requirement) => ({
    requirementId: requirementAlias(requirement.requirement_id),
    officialReference: `AQA 7132 ${requirement.source_section}`,
    requirementSummary: requirement.rights_safe_requirement_summary,
    skillsOrKnowledge: unique([
      requirement.rights_safe_requirement_summary,
      ...(requirement.required_course_facets || []).map((value) => `Course-specific facet: ${humanize(value)}`),
      ...(requirement.required_quantitative_methods || []).map((value) => `Quantitative method: ${humanize(value)}`),
    ]),
    componentScope: [],
    revisionArea: `${requirement.source_section} ${requirement.title}`,
    sourceRefs: [COURSE_TRUTH_SOURCE_REF],
    knowledgeNodeIds: requirement.mapped_subject_node_ids.map(identifier),
    coverageStatus: 'complete',
  }))

  const coverageModel = {
    schemaVersion: 1,
    jobId: JOB_ID,
    sourceSetFingerprint: courseTruth.projection_fingerprint,
    requirements: coverageRequirements,
  }

  const courseKnowledgeNodes = originalNodeIds.map((originalNodeId) => {
    const node = candidate.nodes.get(originalNodeId)
    const selectedIds = new Set(originalNodeIds)
    const methods = node.quantitative_content?.methods || []
    const sourceRefs = candidate.rows.get(originalNodeId).subject_truth_sources.map((sourceId) => sourceAliasByOriginal.get(sourceId))
    assert(sourceRefs.every(Boolean), `Foundation source alias is missing for ${originalNodeId}`)

    const evidenceTypes = unique([
      ...(node.node_types || []).map(humanize),
      ...(methods.length > 0 ? ['quantitative calculation'] : []),
    ])

    return {
      id: identifier(originalNodeId),
      kind: nodeKind(node),
      summary: node.teaching_content?.core_explanation || node.title,
      prerequisiteIds: (node.prerequisites || []).filter((id) => selectedIds.has(id)).map(identifier),
      relatedIds: (node.related_nodes || []).filter((id) => selectedIds.has(id)).map(identifier),
      formulas: methods.map((method) => `${method.name}: ${method.formula}`),
      misconceptions: (node.teaching_content?.misconceptions || []).map(misconceptionText),
      applicationContexts: unique([
        ...(node.teaching_content?.applications || []),
        ...(node.teaching_content?.real_world_transfer || []),
      ]),
      depth: nodeDepth(node),
      sourceRefs,
      boardAlignmentRefs: (requirementsByNode.get(originalNodeId) || []).map((requirement) => requirementAlias(requirement.requirement_id)),
      evidenceTypes: evidenceTypes.length > 0 ? evidenceTypes : ['explanation'],
    }
  })

  const knowledgeCore = {
    schemaVersion: 1,
    jobId: JOB_ID,
    nodes: courseKnowledgeNodes,
  }
  const courseKnowledgeModel = {
    ...knowledgeCore,
    fingerprint: fingerprint(knowledgeCore),
  }

  const coveredAliasIds = new Set(coverageRequirements.flatMap((requirement) => requirement.knowledgeNodeIds))
  const modelAliasIds = new Set(courseKnowledgeNodes.map((node) => node.id))
  assert(coveredAliasIds.size === modelAliasIds.size && [...modelAliasIds].every((id) => coveredAliasIds.has(id)), 'Course Truth coverage/model node sets diverge')

  const adapterCore = {
    schemaVersion: 1,
    artifactType: 'course_truth_learning_adapter',
    status: 'transitional_exact_course_adapter',
    jobId: JOB_ID,
    courseIdentity: {
      subject: 'Business',
      qualification: courseTruth.course.qualification,
      awardingBody: courseTruth.course.awarding_body,
      specificationId: courseTruth.course.specification_code,
    },
    dependencies: {
      courseTruthProjectionId: courseTruth.projection_id,
      courseTruthFingerprint: courseTruth.projection_fingerprint,
      subjectFoundationVersion: candidate.index.candidate_version,
      subjectFoundationFingerprint: candidate.fingerprint,
    },
    compatibilityTarget: {
      coverageSchema: 'foundationCoverageModelSchema-v1',
      courseKnowledgeModelSchema: 'courseKnowledgeModelSchema-v1',
      planner: 'planFoundationInternalLearningWorkUnits',
      plannerVersion: 'course-learning-blueprint-v2',
    },
    identityBoundary: {
      policy: 'Legacy lowercase identifiers are deterministic aliases only. Canonical Subject Foundation and AQA requirement identities remain authoritative and are retained in the alias maps.',
      subjectNodeAliases,
      sourceRefAliases,
    },
    coverageModel,
    coverageModelFingerprint: fingerprint(coverageModel),
    courseKnowledgeModel,
    learnerAssetRegenerationAllowed: false,
  }

  return { ...adapterCore, adapterFingerprint: fingerprint(adapterCore) }
}

async function main() {
  const adapter = await buildAdapter()
  const summary = {
    status: 'pass',
    adapterFingerprint: adapter.adapterFingerprint,
    courseTruthFingerprint: adapter.dependencies.courseTruthFingerprint,
    subjectFoundationFingerprint: adapter.dependencies.subjectFoundationFingerprint,
    governedRequirements: adapter.coverageModel.requirements.length,
    exactCourseKnowledgeNodes: adapter.courseKnowledgeModel.nodes.length,
    canonicalNodeAliases: Object.keys(adapter.identityBoundary.subjectNodeAliases).length,
    learnerAssetRegenerationAllowed: false,
  }

  if (!process.argv.includes('--self-test')) await writeFile(ADAPTER_PATH, JSON.stringify(adapter, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
