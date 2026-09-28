import { loadBusinessSubjectFoundationCandidate as loadV04Candidate } from '../content-factory/load-business-subject-foundation-candidate-v04.mjs'
import { loadBusinessSubjectFoundationCandidate as loadV05Candidate } from '../content-factory/load-business-subject-foundation-candidate-v05.mjs'

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

const EXPECTED_FRESH_SCOPE = [
  'BUS-FND-002',
  'BUS-FIN-003',
  'BUS-PEO-011',
  'BUS-EVI-001',
  'BUS-EVI-002',
  'BUS-EVI-003',
  'BUS-EVI-004',
  'BUS-EVI-005',
  'BUS-EVI-006',
  'BUS-EVI-007',
  'BUS-MOD-001',
  'BUS-MOD-002',
  'BUS-MOD-003',
  'BUS-MOD-004',
  'BUS-MOD-005',
]
const EXPECTED_CHANGED_NODES = new Set(['BUS-FIN-003'])
const EXPECTED_SOURCE_PATCH_NODES = new Set(['BUS-FND-002', 'BUS-FIN-003', 'BUS-PEO-011', 'BUS-EVI-002'])

const previous = await loadV04Candidate()
const candidate = await loadV05Candidate()
const { index, matrix, sources: supplement, nodes, rows, v05Overlay } = candidate
const indexIds = index.domains.flatMap((domain) => domain.ids ?? [])
const nodeIds = [...nodes.keys()]
const matrixIds = [...rows.keys()]

for (const [label, ids] of [
  ['effective index', indexIds],
  ['effective nodes', nodeIds],
  ['effective promotion matrix', matrixIds],
]) {
  const duplicates = ids.filter((id, position) => ids.indexOf(id) !== position)
  if (duplicates.length > 0) fail(`${label} contains duplicate IDs: ${[...new Set(duplicates)].join(', ')}`)
  if (ids.length !== 81) fail(`${label} contains ${ids.length} nodes; expected 81.`)
}
if (!sameSet(indexIds, nodeIds)) fail('Effective index and node ID sets differ.')
if (!sameSet(indexIds, matrixIds)) fail('Effective index and promotion-matrix ID sets differ.')
if (!sameSet(previous.index.domains.flatMap((domain) => domain.ids ?? []), indexIds)) fail('v0.5 changed effective node/domain membership.')
if (matrix.counts?.expected_nodes !== 81 || matrix.counts?.matrix_nodes !== 81) fail('Promotion matrix declared counts must both equal 81.')
if (previous.index.candidate_version !== 'v0.4-reassurance-remediation') fail(`Unexpected previous candidate version ${previous.index.candidate_version}.`)
if (index.candidate_version !== 'v0.5-targeted-reassurance') fail(`Unexpected candidate version ${index.candidate_version}.`)
if (v05Overlay.base_candidate?.version !== previous.index.candidate_version) fail('v0.5 overlay does not name v0.4 as its base candidate.')
if (v05Overlay.base_candidate?.fingerprint !== previous.fingerprint || candidate.previousCandidateFingerprint !== previous.fingerprint) fail('v0.5 overlay is not bound to the exact v0.4 fingerprint.')
if (matrix.candidate_version !== index.candidate_version || supplement.candidate_version !== index.candidate_version) fail('Effective candidate version is inconsistent across index, matrix and source supplement.')
if (matrix.policy?.promotion_decision !== 'NOT_YET_MADE') fail('Targeted remediation must not self-promote the candidate.')
if (matrix.policy?.teaching_content_changed_by_this_remediation !== true) fail('v0.5 must record its bounded BUS-FIN-003 teaching change.')
if (v05Overlay.principles?.preserve_v02_v03_v04_history !== true) fail('v0.5 must preserve historical evidence.')
if (v05Overlay.assurance_strategy?.preserve_prior_accepted_node_assessments !== true) fail('v0.5 must explicitly preserve accepted unchanged-node assurance evidence.')
if (v05Overlay.assurance_strategy?.final_integration_review_required !== true) fail('v0.5 must require the final whole-subject integration review.')
if (!sameSet(v05Overlay.assurance_strategy?.fresh_node_scope ?? [], EXPECTED_FRESH_SCOPE)) fail('v0.5 fresh node scope does not match the governed bounded 15-node set.')
if (v05Overlay.assurance_strategy?.preserved_explicit_node !== 'BUS-EVI-008') fail('BUS-EVI-008 preserved-assurance boundary is missing.')
if ((v05Overlay.domain_moves ?? []).length !== 0) fail('v0.5 unexpectedly changes domain membership.')

const declaredChangedNodes = new Set(v05Overlay.principles?.teaching_content_changed_node_ids ?? [])
if (!sameSet(declaredChangedNodes, EXPECTED_CHANGED_NODES)) fail('v0.5 declared teaching-content change set is incorrect.')
for (const id of nodeIds) {
  const prior = previous.nodes.get(id)
  const current = nodes.get(id)
  const changed = JSON.stringify(withoutCandidateVersion(prior)) !== JSON.stringify(withoutCandidateVersion(current))
  if (changed !== EXPECTED_CHANGED_NODES.has(id)) fail(`v0.5 teaching/node drift mismatch for ${id}.`)
}

const excluded = new Map((supplement.legacy_promotion_exclusions ?? []).map((entry) => [entry.source_id, entry.reason]))
const boardIds = new Set((supplement.legacy_promotion_exclusions ?? []).filter((entry) => entry.reason === 'REFERENCE_ONLY_BOARD_ALIGNMENT').map((entry) => entry.source_id))
const sourceMap = new Map(supplement.sources.map((source) => [source.id, source]))
const profiles = supplement.licence_profiles ?? {}
const allowedSourceUses = new Set(['OPEN_CC_BY_4_0', 'OPEN_CC_BY_3_0', 'OPEN_OGL_V3'])
const requiredSourceFields = ['id','issuer','title','url','date_version','educational_role','licence_profile','restrictions','checked_at','checker_method','confidence']
const requiredProfileFields = ['source_use','permission_basis','ai_context_permission','derived_commercial_use','attribution_requirement']
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
  if (truthSources.length === 0) fail(`${entry.subject_id} has no promotion subject-truth source.`)
  const expectedStatus = freshScope.has(entry.subject_id) ? 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE' : 'PRIOR_ASSURANCE_PRESERVED_UNCHANGED'
  if (entry.promotion_provenance_status !== expectedStatus) fail(`${entry.subject_id} has invalid v0.5 assurance status ${entry.promotion_provenance_status}.`)
  for (const sourceId of truthSources) {
    if (boardIds.has(sourceId)) fail(`${entry.subject_id} uses board source ${sourceId} as reusable subject truth.`)
    if (excluded.has(sourceId)) fail(`${entry.subject_id} uses excluded source ${sourceId} as reusable subject truth: ${excluded.get(sourceId)}`)
    const source = sourceMap.get(sourceId)
    if (!source?.promotion_eligible) fail(`${entry.subject_id} references absent/non-eligible promotion source ${sourceId}.`)
  }
  for (const sourceId of boardSources) {
    if (!boardIds.has(sourceId)) fail(`${entry.subject_id} classifies ${sourceId} as board evidence but it is not a registered board source.`)
    if (truthSources.includes(sourceId)) fail(`${entry.subject_id} uses ${sourceId} as both board evidence and subject truth.`)
  }
  const legacyBoardSources = (nodes.get(entry.subject_id)?.sources ?? []).filter((sourceId) => boardIds.has(sourceId))
  if (!sameSet(legacyBoardSources, boardSources)) fail(`${entry.subject_id} board-source quarantine mismatch.`)
}

const expectedChangedRows = new Set((v05Overlay.promotion_source_patches ?? []).map((patch) => patch.subject_id))
if (!sameSet(expectedChangedRows, EXPECTED_SOURCE_PATCH_NODES)) fail('v0.5 source-patch node set is incorrect.')
for (const [id, row] of rows) {
  const priorSources = previous.rows.get(id)?.subject_truth_sources ?? []
  const currentSources = row.subject_truth_sources ?? []
  const added = currentSources.filter((sourceId) => !priorSources.includes(sourceId))
  const removed = priorSources.filter((sourceId) => !currentSources.includes(sourceId))
  if (removed.length) fail(`v0.5 unexpectedly removed promotion truth sources from ${id}: ${removed.join(', ')}`)
  if (!expectedChangedRows.has(id) && added.length) fail(`v0.5 unexpectedly added promotion sources to untargeted node ${id}: ${added.join(', ')}`)
}
for (const patch of v05Overlay.promotion_source_patches ?? []) {
  const row = rows.get(patch.subject_id)
  for (const sourceId of patch.add ?? []) if (!(row?.subject_truth_sources ?? []).includes(sourceId)) fail(`${patch.subject_id} is missing v0.5 source ${sourceId}.`)
}
for (const source of v05Overlay.source_additions ?? []) {
  const effective = sourceMap.get(source.id)
  if (!effective?.promotion_eligible) fail(`v0.5 source addition ${source.id} is not present as promotion-eligible evidence.`)
  if (!matrix.nodes.some((entry) => (entry.subject_truth_sources ?? []).includes(source.id))) fail(`v0.5 source addition ${source.id} is not mapped to any node.`)
}
if ((v05Overlay.source_additions ?? []).length !== 4) fail('v0.5 must add exactly four targeted promotion sources.')
if ((v05Overlay.node_patches ?? []).length !== 1 || v05Overlay.node_patches?.[0]?.subject_id !== 'BUS-FIN-003') fail('v0.5 must contain exactly the bounded BUS-FIN-003 teaching patch.')
const marginMethod = nodes.get('BUS-FIN-003')?.quantitative_content?.methods?.find((method) => method.name === 'Margin percentage')
if (!marginMethod?.formula?.includes('× 100')) fail('BUS-FIN-003 margin method is missing after v0.5 composition.')

if (errors.length > 0) {
  console.error('Business Subject Knowledge Foundation v0.5 promotion-provenance/incremental-assurance validation: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const usedTruthSources = new Set(matrix.nodes.flatMap((entry) => entry.subject_truth_sources ?? []))
console.log('Business Subject Knowledge Foundation v0.5 promotion-provenance/incremental-assurance validation: PASS')
console.log(`- candidate version: ${index.candidate_version}`)
console.log(`- v0.4 base fingerprint: ${candidate.previousCandidateFingerprint}`)
console.log(`- effective fingerprint: ${candidate.fingerprint}`)
console.log(`- indexed nodes: ${indexIds.length}`)
console.log(`- promotion-eligible truth sources used: ${usedTruthSources.size}`)
console.log(`- fresh node assurance scope: ${EXPECTED_FRESH_SCOPE.length}`)
console.log(`- preserved unchanged node scope: ${81 - EXPECTED_FRESH_SCOPE.length}`)
console.log(`- new v0.5 promotion sources: ${(v05Overlay.source_additions ?? []).length}`)
console.log('- teaching content changed only for BUS-FIN-003')
console.log('- promotion decision: not yet made; scoped fresh assurance plus final integration review required')
