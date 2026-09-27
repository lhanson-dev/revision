import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const candidateRoot = path.join(
  root,
  'research/business-subject-foundation/v0.2-post-board-candidate',
)

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))

const index = readJson(
  'research/business-subject-foundation/v0.2-post-board-candidate/NODE_INDEX.json',
)
const matrix = readJson(
  'research/business-subject-foundation/v0.2-post-board-candidate/PROMOTION_PROVENANCE_MATRIX.json',
)
const supplement = readJson(
  'research/business-subject-foundation/v0.2-post-board-candidate/SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json',
)

const errors = []
const fail = (message) => errors.push(message)
const sorted = (values) => [...values].sort()
const sameSet = (left, right) => {
  const a = sorted(left)
  const b = sorted(right)
  return a.length === b.length && a.every((value, index) => value === b[index])
}

const indexIds = index.domains.flatMap((domain) =>
  Array.isArray(domain.ids) ? domain.ids : [],
)

const nodeFiles = fs
  .readdirSync(path.join(candidateRoot, 'nodes'))
  .filter((file) => file.endsWith('.json'))
  .sort()

const nodeRecords = nodeFiles.flatMap((file) => {
  const parsed = JSON.parse(
    fs.readFileSync(path.join(candidateRoot, 'nodes', file), 'utf8'),
  )
  if (!Array.isArray(parsed.nodes)) {
    fail(`Node file ${file} does not contain a nodes array.`)
    return []
  }
  return parsed.nodes
})
const nodeIds = nodeRecords.map((node) => node.subject_id)
const matrixIds = matrix.nodes.map((node) => node.subject_id)

for (const [label, ids] of [
  ['NODE_INDEX', indexIds],
  ['node files', nodeIds],
  ['promotion matrix', matrixIds],
]) {
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
  if (duplicates.length > 0) {
    fail(`${label} contains duplicate IDs: ${[...new Set(duplicates)].join(', ')}`)
  }
  if (ids.length !== 81) {
    fail(`${label} contains ${ids.length} nodes; expected 81.`)
  }
}

if (!sameSet(indexIds, nodeIds)) {
  fail('NODE_INDEX and node-file ID sets differ.')
}
if (!sameSet(indexIds, matrixIds)) {
  fail('NODE_INDEX and promotion-matrix ID sets differ.')
}
if (matrix.counts?.expected_nodes !== 81 || matrix.counts?.matrix_nodes !== 81) {
  fail('Promotion matrix declared counts must both equal 81.')
}
if (matrix.policy?.teaching_content_changed_by_this_remediation !== false) {
  fail('Promotion matrix must explicitly state that teaching content was not changed by provenance remediation.')
}
if (matrix.policy?.promotion_decision !== 'NOT_YET_MADE') {
  fail('Provenance remediation must not self-promote the candidate.')
}

const excluded = new Map(
  supplement.legacy_promotion_exclusions.map((entry) => [entry.source_id, entry.reason]),
)
const boardIds = new Set(
  supplement.legacy_promotion_exclusions
    .filter((entry) => entry.reason === 'REFERENCE_ONLY_BOARD_ALIGNMENT')
    .map((entry) => entry.source_id),
)
const sourceMap = new Map(supplement.sources.map((source) => [source.id, source]))
const profiles = supplement.licence_profiles ?? {}
const allowedSourceUses = new Set([
  'OPEN_CC_BY_4_0',
  'OPEN_CC_BY_3_0',
  'OPEN_OGL_V3',
])

const requiredSourceFields = [
  'id',
  'issuer',
  'title',
  'url',
  'date_version',
  'educational_role',
  'licence_profile',
  'restrictions',
  'checked_at',
  'checker_method',
  'confidence',
]
const requiredProfileFields = [
  'source_use',
  'permission_basis',
  'ai_context_permission',
  'derived_commercial_use',
  'attribution_requirement',
]

for (const source of supplement.sources) {
  for (const field of requiredSourceFields) {
    if (source[field] === undefined || source[field] === null || source[field] === '') {
      fail(`Promotion source ${source.id ?? '<missing id>'} lacks required field ${field}.`)
    }
  }
  if (source.promotion_eligible !== true) {
    fail(`Promotion source ${source.id} is not explicitly promotion_eligible=true.`)
  }
  const profile = profiles[source.licence_profile]
  if (!profile) {
    fail(`Promotion source ${source.id} references unknown licence profile ${source.licence_profile}.`)
    continue
  }
  for (const field of requiredProfileFields) {
    if (profile[field] === undefined || profile[field] === null || profile[field] === '') {
      fail(`Licence profile ${source.licence_profile} lacks required field ${field}.`)
    }
  }
  if (!allowedSourceUses.has(profile.source_use)) {
    fail(`Promotion source ${source.id} uses disallowed source_use ${profile.source_use}.`)
  }
  if (profile.derived_commercial_use !== true) {
    fail(`Promotion source ${source.id} does not permit derived commercial use.`)
  }
  if (!String(profile.ai_context_permission).startsWith('PERMITTED_')) {
    fail(`Promotion source ${source.id} lacks explicit AI-context permission.`)
  }
  if (excluded.has(source.id)) {
    fail(`Promotion source ${source.id} is also listed in legacy_promotion_exclusions.`)
  }
}

const nodeById = new Map(nodeRecords.map((node) => [node.subject_id, node]))

for (const entry of matrix.nodes) {
  const truthSources = entry.subject_truth_sources ?? []
  const boardSources = entry.board_challenge_or_mapping_sources ?? []

  if (truthSources.length === 0) {
    fail(`${entry.subject_id} has no promotion subject-truth source.`)
  }
  if (entry.promotion_provenance_status !== 'REMEDIATED_AWAITING_INDEPENDENT_REASSURANCE') {
    fail(`${entry.subject_id} has invalid promotion provenance status.`)
  }

  for (const sourceId of truthSources) {
    if (boardIds.has(sourceId)) {
      fail(`${entry.subject_id} uses board source ${sourceId} as reusable subject truth.`)
    }
    if (excluded.has(sourceId)) {
      fail(`${entry.subject_id} uses excluded source ${sourceId} as reusable subject truth: ${excluded.get(sourceId)}`)
    }
    const source = sourceMap.get(sourceId)
    if (!source) {
      fail(`${entry.subject_id} references promotion source ${sourceId} that is absent from the promotion source supplement.`)
    } else if (source.promotion_eligible !== true) {
      fail(`${entry.subject_id} references non-eligible promotion source ${sourceId}.`)
    }
  }

  for (const sourceId of boardSources) {
    if (!boardIds.has(sourceId)) {
      fail(`${entry.subject_id} classifies ${sourceId} as board evidence but it is not a registered board source.`)
    }
    if (truthSources.includes(sourceId)) {
      fail(`${entry.subject_id} uses ${sourceId} as both board evidence and subject truth.`)
    }
  }

  const legacyNode = nodeById.get(entry.subject_id)
  if (!legacyNode) continue
  const legacyBoardSources = (legacyNode.sources ?? []).filter((sourceId) =>
    boardIds.has(sourceId),
  )
  if (!sameSet(legacyBoardSources, boardSources)) {
    fail(
      `${entry.subject_id} board-source quarantine mismatch. Legacy node has [${sorted(legacyBoardSources).join(', ')}], matrix records [${sorted(boardSources).join(', ')}].`,
    )
  }
}

if (errors.length > 0) {
  console.error('Business Subject Knowledge Foundation promotion-provenance assurance: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const usedTruthSources = new Set(
  matrix.nodes.flatMap((entry) => entry.subject_truth_sources ?? []),
)
console.log('Business Subject Knowledge Foundation promotion-provenance assurance: PASS')
console.log(`- node files: ${nodeFiles.length}`)
console.log(`- indexed nodes: ${indexIds.length}`)
console.log(`- promotion matrix nodes: ${matrixIds.length}`)
console.log(`- promotion-eligible truth sources used: ${usedTruthSources.size}`)
console.log(`- quarantined board-source IDs: ${boardIds.size}`)
console.log('- teaching prose changed by this remediation: no')
console.log('- promotion decision: not yet made; fresh independent re-assurance still required')
