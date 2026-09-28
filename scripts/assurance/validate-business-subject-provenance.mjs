import { loadBusinessSubjectFoundationCandidate as loadV03Candidate } from '../content-factory/load-business-subject-foundation-candidate.mjs'
import { loadBusinessSubjectFoundationCandidate as loadV04Candidate } from '../content-factory/load-business-subject-foundation-candidate-v04.mjs'

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

const previous = await loadV03Candidate()
const candidate = await loadV04Candidate()
const { index, matrix, sources: supplement, nodes, rows, sourceReview, v04Overlay } = candidate
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
if (matrix.counts?.expected_nodes !== 81 || matrix.counts?.matrix_nodes !== 81) fail('Promotion matrix declared counts must both equal 81.')
if (previous.index.candidate_version !== 'v0.3-reassurance-remediation') fail(`Unexpected previous candidate version ${previous.index.candidate_version}.`)
if (index.candidate_version !== 'v0.4-reassurance-remediation') fail(`Unexpected candidate version ${index.candidate_version}.`)
if (v04Overlay.base_candidate?.version !== previous.index.candidate_version) fail('v0.4 overlay does not name v0.3 as its base candidate.')
if (v04Overlay.base_candidate?.fingerprint !== previous.fingerprint || candidate.previousCandidateFingerprint !== previous.fingerprint) fail('v0.4 overlay is not bound to the exact reviewed v0.3 fingerprint.')
if (matrix.candidate_version !== index.candidate_version || supplement.candidate_version !== index.candidate_version) fail('Effective candidate version is inconsistent across index, matrix and source supplement.')
if (matrix.policy?.teaching_content_changed_by_this_remediation !== false) fail('v0.4 must record that this remediation does not change teaching content.')
if (matrix.policy?.promotion_decision !== 'NOT_YET_MADE') fail('Targeted remediation must not self-promote the candidate.')
if (v04Overlay.principles?.fresh_independent_reassurance_required !== true) fail('v0.4 overlay must require fresh independent reassurance.')
if (v04Overlay.principles?.preserve_v02_and_v03_history !== true) fail('v0.4 overlay must preserve v0.2 and v0.3 history.')
if ((v04Overlay.node_patches ?? []).length !== 0 || (v04Overlay.domain_moves ?? []).length !== 0) fail('v0.4 source-only remediation unexpectedly contains content/domain changes.')
if (!sameSet(previous.index.domains.flatMap((domain) => domain.ids ?? []), indexIds)) fail('v0.4 changed the effective node/domain membership.')

for (const id of nodeIds) {
  const prior = previous.nodes.get(id)
  const current = nodes.get(id)
  if (JSON.stringify(withoutCandidateVersion(prior)) !== JSON.stringify(withoutCandidateVersion(current))) {
    fail(`v0.4 unexpectedly changed teaching/node content for ${id}.`)
  }
}

const excluded = new Map((supplement.legacy_promotion_exclusions ?? []).map((entry) => [entry.source_id, entry.reason]))
const boardIds = new Set((supplement.legacy_promotion_exclusions ?? []).filter((entry) => entry.reason === 'REFERENCE_ONLY_BOARD_ALIGNMENT').map((entry) => entry.source_id))
const sourceMap = new Map(supplement.sources.map((source) => [source.id, source]))
const profiles = supplement.licence_profiles ?? {}
const allowedSourceUses = new Set(['OPEN_CC_BY_4_0', 'OPEN_CC_BY_3_0', 'OPEN_OGL_V3'])
const requiredSourceFields = ['id','issuer','title','url','date_version','educational_role','licence_profile','restrictions','checked_at','checker_method','confidence']
const requiredProfileFields = ['source_use','permission_basis','ai_context_permission','derived_commercial_use','attribution_requirement']
const rejectedSourceIds = new Set((sourceReview?.rejected_source_ids ?? []).map((entry) => entry.id))

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
  if (rejectedSourceIds.has(source.id)) fail(`Previously rejected source ${source.id} remains in the effective promotion source universe.`)
}

for (const entry of matrix.nodes) {
  const truthSources = entry.subject_truth_sources ?? []
  const boardSources = entry.board_challenge_or_mapping_sources ?? []
  if (truthSources.length === 0) fail(`${entry.subject_id} has no promotion subject-truth source.`)
  if (entry.promotion_provenance_status !== 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE') fail(`${entry.subject_id} has invalid v0.4 promotion provenance status.`)
  for (const sourceId of truthSources) {
    if (boardIds.has(sourceId)) fail(`${entry.subject_id} uses board source ${sourceId} as reusable subject truth.`)
    if (excluded.has(sourceId)) fail(`${entry.subject_id} uses excluded source ${sourceId} as reusable subject truth: ${excluded.get(sourceId)}`)
    if (rejectedSourceIds.has(sourceId)) fail(`${entry.subject_id} still uses previously rejected source ${sourceId}.`)
    const source = sourceMap.get(sourceId)
    if (!source) fail(`${entry.subject_id} references promotion source ${sourceId} absent from the effective source supplement.`)
    else if (source.promotion_eligible !== true) fail(`${entry.subject_id} references non-eligible promotion source ${sourceId}.`)
  }
  for (const sourceId of boardSources) {
    if (!boardIds.has(sourceId)) fail(`${entry.subject_id} classifies ${sourceId} as board evidence but it is not a registered board source.`)
    if (truthSources.includes(sourceId)) fail(`${entry.subject_id} uses ${sourceId} as both board evidence and subject truth.`)
  }
  const historicalNode = nodes.get(entry.subject_id)
  const legacyBoardSources = (historicalNode?.sources ?? []).filter((sourceId) => boardIds.has(sourceId))
  if (!sameSet(legacyBoardSources, boardSources)) fail(`${entry.subject_id} board-source quarantine mismatch.`)
}

const expectedChangedRows = new Set((v04Overlay.promotion_source_patches ?? []).map((patch) => patch.subject_id))
for (const [id, row] of rows) {
  const priorSources = previous.rows.get(id)?.subject_truth_sources ?? []
  const currentSources = row.subject_truth_sources ?? []
  const added = currentSources.filter((sourceId) => !priorSources.includes(sourceId))
  const removed = priorSources.filter((sourceId) => !currentSources.includes(sourceId))
  if (removed.length) fail(`v0.4 unexpectedly removed promotion truth sources from ${id}: ${removed.join(', ')}`)
  if (!expectedChangedRows.has(id) && added.length) fail(`v0.4 unexpectedly added promotion sources to untargeted node ${id}: ${added.join(', ')}`)
}

for (const patch of v04Overlay.promotion_source_patches ?? []) {
  const row = rows.get(patch.subject_id)
  if (!row) {
    fail(`v0.4 promotion patch references unknown node ${patch.subject_id}.`)
    continue
  }
  for (const sourceId of patch.add ?? []) if (!(row.subject_truth_sources ?? []).includes(sourceId)) fail(`${patch.subject_id} is missing v0.4 source ${sourceId}.`)
}
for (const source of v04Overlay.source_additions ?? []) {
  const effective = sourceMap.get(source.id)
  if (!effective?.promotion_eligible) fail(`v0.4 source addition ${source.id} is not present as promotion-eligible effective evidence.`)
  const used = matrix.nodes.some((entry) => (entry.subject_truth_sources ?? []).includes(source.id))
  if (!used) fail(`v0.4 source addition ${source.id} is not mapped to any node.`)
}

if (errors.length > 0) {
  console.error('Business Subject Knowledge Foundation v0.4 promotion-provenance assurance: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const usedTruthSources = new Set(matrix.nodes.flatMap((entry) => entry.subject_truth_sources ?? []))
console.log('Business Subject Knowledge Foundation v0.4 promotion-provenance assurance: PASS')
console.log(`- candidate version: ${index.candidate_version}`)
console.log(`- v0.3 base fingerprint: ${candidate.previousCandidateFingerprint}`)
console.log(`- effective fingerprint: ${candidate.fingerprint}`)
console.log(`- indexed nodes: ${indexIds.length}`)
console.log(`- promotion matrix nodes: ${matrixIds.length}`)
console.log(`- promotion-eligible truth sources used: ${usedTruthSources.size}`)
console.log(`- new v0.4 promotion sources: ${(v04Overlay.source_additions ?? []).length}`)
console.log(`- targeted source-remediated nodes: ${expectedChangedRows.size}`)
console.log('- teaching content changed by v0.4: no')
console.log('- promotion decision: not yet made; fresh independent reassurance still required')
