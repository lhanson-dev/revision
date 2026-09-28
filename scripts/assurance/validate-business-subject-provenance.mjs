import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate.mjs'

const errors = []
const fail = (message) => errors.push(message)
const sorted = (values) => [...values].sort()
const sameSet = (left, right) => {
  const a = sorted(left)
  const b = sorted(right)
  return a.length === b.length && a.every((value, index) => value === b[index])
}

const candidate = await loadBusinessSubjectFoundationCandidate()
const { index, matrix, sources: supplement, nodes, rows, overlay, sourceReview } = candidate
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
if (index.candidate_version !== 'v0.3-reassurance-remediation') fail(`Unexpected candidate version ${index.candidate_version}.`)
if (matrix.candidate_version !== index.candidate_version || supplement.candidate_version !== index.candidate_version || sourceReview.candidate_version !== index.candidate_version) fail('Effective candidate version is inconsistent across index, matrix, source supplement and source review.')
if (matrix.policy?.teaching_content_changed_by_this_remediation !== true) fail('v0.3 must explicitly record that targeted teaching content changed.')
if (matrix.policy?.promotion_decision !== 'NOT_YET_MADE') fail('Targeted remediation must not self-promote the candidate.')
if (overlay.principles?.fresh_independent_reassurance_required !== true) fail('v0.3 overlay must require fresh independent reassurance.')
if (overlay.principles?.preserve_v02_history !== true) fail('v0.3 overlay must preserve v0.2 history.')
if (overlay.base_candidate?.assured_fingerprint !== candidate.baseFingerprint) fail('v0.3 overlay base fingerprint does not match the composed base candidate.')

const excluded = new Map((supplement.legacy_promotion_exclusions ?? []).map((entry) => [entry.source_id, entry.reason]))
const boardIds = new Set((supplement.legacy_promotion_exclusions ?? []).filter((entry) => entry.reason === 'REFERENCE_ONLY_BOARD_ALIGNMENT').map((entry) => entry.source_id))
const sourceMap = new Map(supplement.sources.map((source) => [source.id, source]))
const profiles = supplement.licence_profiles ?? {}
const allowedSourceUses = new Set(['OPEN_CC_BY_4_0', 'OPEN_CC_BY_3_0', 'OPEN_OGL_V3'])
const requiredSourceFields = ['id','issuer','title','url','date_version','educational_role','licence_profile','restrictions','checked_at','checker_method','confidence']
const requiredProfileFields = ['source_use','permission_basis','ai_context_permission','derived_commercial_use','attribution_requirement']
const rejectedSourceIds = new Set((sourceReview.rejected_source_ids ?? []).map((entry) => entry.id))

if (sourceMap.size !== supplement.sources.length) fail('Promotion source supplement contains duplicate IDs.')

for (const source of supplement.sources) {
  for (const field of requiredSourceFields) {
    if (source[field] === undefined || source[field] === null || source[field] === '') fail(`Promotion source ${source.id ?? '<missing id>'} lacks required field ${field}.`)
  }
  if (source.promotion_eligible !== true) fail(`Promotion source ${source.id} is not explicitly promotion_eligible=true.`)
  const profile = profiles[source.licence_profile]
  if (!profile) {
    fail(`Promotion source ${source.id} references unknown licence profile ${source.licence_profile}.`)
    continue
  }
  for (const field of requiredProfileFields) {
    if (profile[field] === undefined || profile[field] === null || profile[field] === '') fail(`Licence profile ${source.licence_profile} lacks required field ${field}.`)
  }
  if (!allowedSourceUses.has(profile.source_use)) fail(`Promotion source ${source.id} uses disallowed source_use ${profile.source_use}.`)
  if (profile.derived_commercial_use !== true) fail(`Promotion source ${source.id} does not permit derived commercial use.`)
  if (!String(profile.ai_context_permission).startsWith('PERMITTED_')) fail(`Promotion source ${source.id} lacks explicit AI-context permission.`)
  if (excluded.has(source.id)) fail(`Promotion source ${source.id} is also listed in legacy_promotion_exclusions.`)
  if (rejectedSourceIds.has(source.id)) fail(`Independently rejected source ${source.id} remains in the effective promotion source universe.`)
}

for (const entry of matrix.nodes) {
  const truthSources = entry.subject_truth_sources ?? []
  const boardSources = entry.board_challenge_or_mapping_sources ?? []
  if (truthSources.length === 0) fail(`${entry.subject_id} has no promotion subject-truth source.`)
  if (entry.promotion_provenance_status !== 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE') fail(`${entry.subject_id} has invalid v0.3 promotion provenance status.`)

  for (const sourceId of truthSources) {
    if (boardIds.has(sourceId)) fail(`${entry.subject_id} uses board source ${sourceId} as reusable subject truth.`)
    if (excluded.has(sourceId)) fail(`${entry.subject_id} uses excluded source ${sourceId} as reusable subject truth: ${excluded.get(sourceId)}`)
    if (rejectedSourceIds.has(sourceId)) fail(`${entry.subject_id} still uses independently rejected source ${sourceId}.`)
    const source = sourceMap.get(sourceId)
    if (!source) fail(`${entry.subject_id} references promotion source ${sourceId} absent from the effective promotion source supplement.`)
    else if (source.promotion_eligible !== true) fail(`${entry.subject_id} references non-eligible promotion source ${sourceId}.`)
  }

  for (const sourceId of boardSources) {
    if (!boardIds.has(sourceId)) fail(`${entry.subject_id} classifies ${sourceId} as board evidence but it is not a registered board source.`)
    if (truthSources.includes(sourceId)) fail(`${entry.subject_id} uses ${sourceId} as both board evidence and subject truth.`)
  }

  const legacyNode = nodes.get(entry.subject_id)
  const legacyBoardSources = (legacyNode?.sources ?? []).filter((sourceId) => boardIds.has(sourceId))
  if (!sameSet(legacyBoardSources, boardSources)) {
    fail(`${entry.subject_id} board-source quarantine mismatch. Historical node has [${sorted(legacyBoardSources).join(', ')}], matrix records [${sorted(boardSources).join(', ')}].`)
  }
}

for (const source of overlay.source_additions ?? []) {
  if (rejectedSourceIds.has(source.id)) {
    if (sourceMap.has(source.id)) fail(`Rejected v0.3 proposed source ${source.id} was not removed from the effective source universe.`)
    continue
  }
  const effective = sourceMap.get(source.id)
  if (!effective?.promotion_eligible) fail(`v0.3 source addition ${source.id} is not present as promotion-eligible effective evidence.`)
  const used = matrix.nodes.some((entry) => (entry.subject_truth_sources ?? []).includes(source.id))
  if (!used) fail(`v0.3 source addition ${source.id} is not mapped to any node.`)
}

for (const replacement of sourceReview.promotion_source_replacements ?? []) {
  const row = rows.get(replacement.subject_id)
  if (!row) {
    fail(`v0.3 source review references unknown node ${replacement.subject_id}.`)
    continue
  }
  for (const removed of replacement.remove ?? []) if ((row.subject_truth_sources ?? []).includes(removed)) fail(`${replacement.subject_id} still references rejected/replaced source ${removed}.`)
  for (const added of replacement.add ?? []) if (!(row.subject_truth_sources ?? []).includes(added)) fail(`${replacement.subject_id} is missing source-review replacement ${added}.`)
}

for (const patch of overlay.node_patches ?? []) {
  if (!nodes.has(patch.subject_id)) fail(`v0.3 node patch references missing node ${patch.subject_id}.`)
}
for (const move of overlay.domain_moves ?? []) {
  const destination = index.domains.find((domain) => domain.domain === move.to)
  const source = index.domains.find((domain) => domain.domain === move.from)
  if (!destination?.ids.includes(move.subject_id)) fail(`v0.3 moved node ${move.subject_id} is absent from destination domain ${move.to}.`)
  if (source?.ids.includes(move.subject_id)) fail(`v0.3 moved node ${move.subject_id} still appears in source domain ${move.from}.`)
}

if (errors.length > 0) {
  console.error('Business Subject Knowledge Foundation v0.3 promotion-provenance assurance: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const usedTruthSources = new Set(matrix.nodes.flatMap((entry) => entry.subject_truth_sources ?? []))
console.log('Business Subject Knowledge Foundation v0.3 promotion-provenance assurance: PASS')
console.log(`- candidate version: ${index.candidate_version}`)
console.log(`- base fingerprint: ${candidate.baseFingerprint}`)
console.log(`- effective fingerprint: ${candidate.fingerprint}`)
console.log(`- indexed nodes: ${indexIds.length}`)
console.log(`- promotion matrix nodes: ${matrixIds.length}`)
console.log(`- promotion-eligible truth sources used: ${usedTruthSources.size}`)
console.log(`- accepted new v0.3 promotion sources: ${(overlay.source_additions ?? []).length - rejectedSourceIds.size}`)
console.log(`- independently rejected proposed sources: ${rejectedSourceIds.size}`)
console.log(`- quarantined board-source IDs: ${boardIds.size}`)
console.log(`- targeted content patches: ${(overlay.node_patches ?? []).length}`)
console.log('- promotion decision: not yet made; fresh independent reassurance still required')
