import { loadBusinessSubjectFoundationCandidate as loadV05Candidate } from '../content-factory/load-business-subject-foundation-candidate-v05.mjs'
import { loadBusinessSubjectFoundationCandidate as loadV06Candidate } from '../content-factory/load-business-subject-foundation-candidate-v06.mjs'

const errors = []
const fail = (message) => errors.push(message)
const sorted = (values) => [...values].sort()
const sameSet = (left, right) => {
  const a = sorted(left)
  const b = sorted(right)
  return a.length === b.length && a.every((value, index) => value === b[index])
}
const withoutCandidateVersion = (node) => {
  const copy = structuredClone(node)
  delete copy.candidate_version
  return copy
}

const EXPECTED_FRESH_SCOPE = ['BUS-FND-002', 'BUS-FIN-003', 'BUS-EVI-006']
const EXPECTED_CHANGED_NODES = new Set(EXPECTED_FRESH_SCOPE)
const EXPECTED_TEACHING_CHANGED = new Set(['BUS-FND-002', 'BUS-FIN-003'])
const EXPECTED_RELATIONSHIP_CHANGED = new Set(['BUS-EVI-006'])
const EXPECTED_EVI006_RELATED = new Set(['BUS-STR-001', 'BUS-EVI-007', 'BUS-MKT-002', 'BUS-FIN-003', 'BUS-FIN-005', 'BUS-OPS-003', 'BUS-PEO-011'])

const previous = await loadV05Candidate()
const candidate = await loadV06Candidate()
const { index, matrix, sources: supplement, nodes, rows, v06Overlay } = candidate
const indexIds = index.domains.flatMap((domain) => domain.ids ?? [])
const nodeIds = [...nodes.keys()]
const matrixIds = [...rows.keys()]

for (const [label, ids] of [['effective index', indexIds], ['effective nodes', nodeIds], ['effective promotion matrix', matrixIds]]) {
  const duplicates = ids.filter((id, position) => ids.indexOf(id) !== position)
  if (duplicates.length) fail(`${label} contains duplicate IDs: ${[...new Set(duplicates)].join(', ')}`)
  if (ids.length !== 81) fail(`${label} contains ${ids.length} nodes; expected 81.`)
}
if (!sameSet(indexIds, nodeIds)) fail('Effective index and node ID sets differ.')
if (!sameSet(indexIds, matrixIds)) fail('Effective index and promotion-matrix ID sets differ.')
if (!sameSet(previous.index.domains.flatMap((domain) => domain.ids ?? []), indexIds)) fail('v0.6 changed effective node/domain membership.')
if (matrix.counts?.expected_nodes !== 81 || matrix.counts?.matrix_nodes !== 81) fail('Promotion matrix declared counts must both equal 81.')
if (previous.index.candidate_version !== 'v0.5-targeted-reassurance') fail(`Unexpected previous candidate version ${previous.index.candidate_version}.`)
if (index.candidate_version !== 'v0.6-final-targeted-remediation') fail(`Unexpected candidate version ${index.candidate_version}.`)
if (v06Overlay.base_candidate?.version !== previous.index.candidate_version) fail('v0.6 overlay does not name v0.5 as its base candidate.')
if (v06Overlay.base_candidate?.fingerprint !== previous.fingerprint || candidate.previousCandidateFingerprint !== previous.fingerprint) fail('v0.6 overlay is not bound to the exact v0.5 fingerprint.')
if (matrix.candidate_version !== index.candidate_version || supplement.candidate_version !== index.candidate_version) fail('Effective candidate version is inconsistent across index, matrix and source supplement.')
if (matrix.policy?.promotion_decision !== 'NOT_YET_MADE') fail('v0.6 remediation must not self-promote the candidate.')
if (v06Overlay.principles?.preserve_v02_v03_v04_v05_history !== true) fail('v0.6 must preserve historical evidence.')
if (v06Overlay.assurance_strategy?.preserve_prior_accepted_node_assessments !== true) fail('v0.6 must preserve accepted unchanged-node assurance evidence.')
if (v06Overlay.assurance_strategy?.final_integration_review_required !== true) fail('v0.6 must require the final whole-subject integration review.')
if (!sameSet(v06Overlay.assurance_strategy?.fresh_node_scope ?? [], EXPECTED_FRESH_SCOPE)) fail('v0.6 fresh node scope must be exactly the three unresolved nodes.')
if ((v06Overlay.domain_moves ?? []).length) fail('v0.6 unexpectedly changes domain membership.')
if ((v06Overlay.source_additions ?? []).length || (v06Overlay.promotion_source_patches ?? []).length) fail('v0.6 unexpectedly changes sources or source mappings.')
if (v06Overlay.principles?.source_universe_changed_by_this_remediation !== false) fail('v0.6 must declare the source universe unchanged.')
if (!sameSet(v06Overlay.principles?.teaching_content_changed_node_ids ?? [], EXPECTED_TEACHING_CHANGED)) fail('v0.6 teaching-content change set is incorrect.')
if (!sameSet(v06Overlay.principles?.relationship_metadata_changed_node_ids ?? [], EXPECTED_RELATIONSHIP_CHANGED)) fail('v0.6 relationship-metadata change set is incorrect.')

for (const id of nodeIds) {
  const prior = previous.nodes.get(id)
  const current = nodes.get(id)
  const changed = JSON.stringify(withoutCandidateVersion(prior)) !== JSON.stringify(withoutCandidateVersion(current))
  if (changed !== EXPECTED_CHANGED_NODES.has(id)) fail(`v0.6 node drift mismatch for ${id}.`)
}

const priorSourcesJson = JSON.stringify(previous.sources.sources)
const currentSourcesJson = JSON.stringify(supplement.sources)
if (priorSourcesJson !== currentSourcesJson) fail('v0.6 changed the promotion source universe.')
for (const [id, row] of rows) {
  const priorSources = previous.rows.get(id)?.subject_truth_sources ?? []
  if (!sameSet(row.subject_truth_sources ?? [], priorSources)) fail(`v0.6 changed promotion truth sources for ${id}.`)
}

const excluded = new Map((supplement.legacy_promotion_exclusions ?? []).map((entry) => [entry.source_id, entry.reason]))
const boardIds = new Set((supplement.legacy_promotion_exclusions ?? []).filter((entry) => entry.reason === 'REFERENCE_ONLY_BOARD_ALIGNMENT').map((entry) => entry.source_id))
const sourceMap = new Map(supplement.sources.map((source) => [source.id, source]))
const profiles = supplement.licence_profiles ?? {}
const allowedSourceUses = new Set(['OPEN_CC_BY_4_0', 'OPEN_CC_BY_3_0', 'OPEN_OGL_V3'])
const requiredSourceFields = ['id', 'issuer', 'title', 'url', 'date_version', 'educational_role', 'licence_profile', 'restrictions', 'checked_at', 'checker_method', 'confidence']
const requiredProfileFields = ['source_use', 'permission_basis', 'ai_context_permission', 'derived_commercial_use', 'attribution_requirement']
if (sourceMap.size !== supplement.sources.length) fail('Promotion source supplement contains duplicate IDs.')
for (const source of supplement.sources) {
  for (const field of requiredSourceFields) if (source[field] === undefined || source[field] === null || source[field] === '') fail(`Promotion source ${source.id ?? '<missing id>'} lacks required field ${field}.`)
  if (source.promotion_eligible !== true) fail(`Promotion source ${source.id} is not explicitly promotion_eligible=true.`)
  const profile = profiles[source.licence_profile]
  if (!profile) {
    fail(`Promotion source ${source.id} references unknown licence profile ${source.licence_profile}.`)
    continue
  }
  for (const field of requiredProfileFields) if (profile[field] === undefined || profile[field] === null || profile[field] === '') fail(`Licence profile ${source.licence_profile} lacks required field ${field}.`)
  if (!allowedSourceUses.has(profile.source_use)) fail(`Promotion source ${source.id} uses disallowed source_use ${profile.source_use}.`)
  if (profile.derived_commercial_use !== true) fail(`Promotion source ${source.id} does not permit derived commercial use.`)
  if (!String(profile.ai_context_permission).startsWith('PERMITTED_')) fail(`Promotion source ${source.id} lacks explicit AI-context permission.`)
  if (excluded.has(source.id)) fail(`Promotion source ${source.id} is also listed in legacy_promotion_exclusions.`)
}

const freshScope = new Set(EXPECTED_FRESH_SCOPE)
for (const entry of matrix.nodes) {
  const truthSources = entry.subject_truth_sources ?? []
  const boardSources = entry.board_challenge_or_mapping_sources ?? []
  const expectedStatus = freshScope.has(entry.subject_id) ? 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE' : 'PRIOR_ASSURANCE_PRESERVED_UNCHANGED'
  if (entry.promotion_provenance_status !== expectedStatus) fail(`${entry.subject_id} has invalid v0.6 assurance status ${entry.promotion_provenance_status}.`)
  if (!truthSources.length) fail(`${entry.subject_id} has no promotion subject-truth source.`)
  for (const sourceId of truthSources) {
    if (boardIds.has(sourceId)) fail(`${entry.subject_id} uses board source ${sourceId} as reusable subject truth.`)
    if (excluded.has(sourceId)) fail(`${entry.subject_id} uses excluded source ${sourceId} as reusable subject truth: ${excluded.get(sourceId)}`)
    if (!sourceMap.get(sourceId)?.promotion_eligible) fail(`${entry.subject_id} references absent/non-eligible promotion source ${sourceId}.`)
  }
  for (const sourceId of boardSources) {
    if (!boardIds.has(sourceId)) fail(`${entry.subject_id} classifies ${sourceId} as board evidence but it is not a registered board source.`)
    if (truthSources.includes(sourceId)) fail(`${entry.subject_id} uses ${sourceId} as both board evidence and subject truth.`)
  }
}

const fnd = nodes.get('BUS-FND-002')
const fndText = JSON.stringify(fnd)
for (const unsupported of ['reversible experiments', 'staged investment limits downside', 'first-mover action can create learning', 'resource constraints can encourage focus']) {
  if (fndText.includes(unsupported)) fail(`BUS-FND-002 retains unsupported v0.5 phrase: ${unsupported}`)
}
if (!fnd?.teaching_content?.definitions?.some((value) => value.startsWith('enterprise: in this node'))) fail('BUS-FND-002 does not clarify the enterprise-skills definition boundary.')

const fin = nodes.get('BUS-FIN-003')
if (!fin?.teaching_content?.definitions?.some((value) => value.startsWith('sales revenue:'))) fail('BUS-FIN-003 lacks a sales-revenue definition.')
if (!fin?.teaching_content?.definitions?.some((value) => value.startsWith('total reported revenue:'))) fail('BUS-FIN-003 lacks the total-revenue boundary.')
const marginMethod = fin?.quantitative_content?.methods?.find((method) => method.name === 'Margin percentage')
if (!marginMethod?.formula?.includes('denominator') || !marginMethod?.formula?.includes('× 100')) fail('BUS-FIN-003 margin method does not require a stated comparable denominator.')
if (fin?.quantitative_content?.methods?.some((method) => method.name === 'Revenue')) fail('BUS-FIN-003 retains the unqualified Revenue method name.')

if (!sameSet(nodes.get('BUS-EVI-006')?.related_nodes ?? [], EXPECTED_EVI006_RELATED)) fail('BUS-EVI-006 related_nodes do not contain the required cross-functional dependencies.')

if (errors.length) {
  console.error('Business Subject Knowledge Foundation v0.6 promotion-provenance/incremental-assurance validation: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const usedTruthSources = new Set(matrix.nodes.flatMap((entry) => entry.subject_truth_sources ?? []))
console.log('Business Subject Knowledge Foundation v0.6 promotion-provenance/incremental-assurance validation: PASS')
console.log(`- candidate version: ${index.candidate_version}`)
console.log(`- v0.5 base fingerprint: ${candidate.previousCandidateFingerprint}`)
console.log(`- effective fingerprint: ${candidate.fingerprint}`)
console.log(`- indexed nodes: ${indexIds.length}`)
console.log(`- promotion-eligible truth sources used: ${usedTruthSources.size}`)
console.log(`- fresh node assurance scope: ${EXPECTED_FRESH_SCOPE.length}`)
console.log(`- preserved unchanged node scope: ${81 - EXPECTED_FRESH_SCOPE.length}`)
console.log('- promotion source universe/mappings: unchanged')
console.log('- teaching content changed only for BUS-FND-002 and BUS-FIN-003')
console.log('- relationship metadata changed only for BUS-EVI-006')
console.log('- promotion decision: not yet made; three-node reassurance plus final integration review required')
