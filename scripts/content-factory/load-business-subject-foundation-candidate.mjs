import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const BASE_ROOT = 'research/business-subject-foundation/v0.2-post-board-candidate'
const OVERLAY_PATH = 'research/business-subject-foundation/v0.3-reassurance-remediation/REMEDIATION.json'
const SOURCE_REVIEW_PATH = 'research/business-subject-foundation/v0.3-reassurance-remediation/SOURCE_REVIEW.json'
const EXPECTED_BASE_VERSION = 'v0.2-post-board-candidate'
const EXPECTED_EFFECTIVE_VERSION = 'v0.3-reassurance-remediation'
const EXPECTED_NODE_COUNT = 81

const clone = (value) => structuredClone(value)
const uniq = (values) => [...new Set(values)]

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) {
    throw new Error(`${label} mismatch`)
  }
}

function deepMerge(target, patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) return clone(patch)
  const result = target && typeof target === 'object' && !Array.isArray(target) ? clone(target) : {}
  for (const [key, value] of Object.entries(patch)) result[key] = deepMerge(result[key], value)
  return result
}

function hashParts(parts) {
  const hash = createHash('sha256')
  for (const [name, value] of [...parts].sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(`${name}\0${value}\0`)
  }
  return hash.digest('hex')
}

export async function loadBusinessSubjectFoundationCandidate() {
  const readBase = async (name) => JSON.parse(await readFile(`${BASE_ROOT}/${name}`, 'utf8'))
  const overlayRaw = await readFile(OVERLAY_PATH, 'utf8')
  const sourceReviewRaw = await readFile(SOURCE_REVIEW_PATH, 'utf8')
  const overlay = JSON.parse(overlayRaw)
  const sourceReview = JSON.parse(sourceReviewRaw)
  const index = await readBase('NODE_INDEX.json')
  const matrix = await readBase('PROMOTION_PROVENANCE_MATRIX.json')
  const sources = await readBase('SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json')
  const specialist = await readBase('SPECIALIST_REGISTERS.json')

  if (index.candidate_version !== EXPECTED_BASE_VERSION || index.candidate_node_count !== EXPECTED_NODE_COUNT) {
    throw new Error('Unexpected Business v0.2 base candidate identity/count')
  }
  if (overlay.candidate_version !== EXPECTED_EFFECTIVE_VERSION || overlay.base_candidate?.version !== EXPECTED_BASE_VERSION) {
    throw new Error('Unexpected Business v0.3 remediation overlay identity')
  }
  if (sourceReview.candidate_version !== EXPECTED_EFFECTIVE_VERSION) {
    throw new Error('Unexpected Business v0.3 source-review identity')
  }

  const baseFingerprintParts = []
  for (const name of [
    'NODE_INDEX.json',
    'PROMOTION_PROVENANCE_MATRIX.json',
    'SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json',
    'SPECIALIST_REGISTERS.json',
  ]) {
    baseFingerprintParts.push([name, await readFile(`${BASE_ROOT}/${name}`, 'utf8')])
  }

  const nodes = new Map()
  const baseDomainByNode = new Map()
  for (const domain of index.domains) {
    const raw = await readFile(`${BASE_ROOT}/${domain.file}`, 'utf8')
    baseFingerprintParts.push([domain.file, raw])
    const file = JSON.parse(raw)
    exactSet(file.nodes.map((node) => node.subject_id), domain.ids, `${domain.domain} base IDs`)
    for (const node of file.nodes) {
      if (nodes.has(node.subject_id)) throw new Error(`Duplicate Business base node ${node.subject_id}`)
      nodes.set(node.subject_id, clone(node))
      baseDomainByNode.set(node.subject_id, domain.domain)
    }
  }

  if (nodes.size !== EXPECTED_NODE_COUNT) throw new Error(`Loaded ${nodes.size} Business base nodes, expected ${EXPECTED_NODE_COUNT}`)

  const baseFingerprint = hashParts(baseFingerprintParts)
  if (baseFingerprint !== overlay.base_candidate?.assured_fingerprint) {
    throw new Error(`Business v0.3 base fingerprint mismatch: ${baseFingerprint}`)
  }

  for (const entry of overlay.node_patches || []) {
    const current = nodes.get(entry.subject_id)
    if (!current) throw new Error(`Business v0.3 patch references unknown node ${entry.subject_id}`)
    nodes.set(entry.subject_id, deepMerge(current, entry.patch))
  }

  const effectiveSources = clone(sources)
  effectiveSources.status = 'targeted_remediation_awaiting_independent_reassurance'
  effectiveSources.candidate_version = EXPECTED_EFFECTIVE_VERSION
  const existingSourceIds = new Set(effectiveSources.sources.map((source) => source.id))
  for (const source of overlay.source_additions || []) {
    if (existingSourceIds.has(source.id)) throw new Error(`Business v0.3 duplicate source addition ${source.id}`)
    effectiveSources.sources.push(clone(source))
    existingSourceIds.add(source.id)
  }
  const rejectedSourceIds = new Set((sourceReview.rejected_source_ids || []).map((entry) => entry.id))
  effectiveSources.sources = effectiveSources.sources.filter((source) => !rejectedSourceIds.has(source.id))

  const effectiveMatrix = clone(matrix)
  effectiveMatrix.status = 'targeted_remediation_awaiting_independent_reassurance'
  effectiveMatrix.candidate_version = EXPECTED_EFFECTIVE_VERSION
  effectiveMatrix.purpose = 'Promotion-provenance composition for Business v0.3 targeted reassurance remediation over immutable v0.2 historical evidence.'
  effectiveMatrix.policy = {
    ...effectiveMatrix.policy,
    teaching_content_changed_by_this_remediation: true,
    promotion_decision: 'NOT_YET_MADE',
    required_next_gate: 'fresh_independent_reassurance_against_exact_v0.3_composed_fingerprint',
  }
  const rowById = new Map(effectiveMatrix.nodes.map((row) => [row.subject_id, row]))
  for (const row of effectiveMatrix.nodes) row.promotion_provenance_status = 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE'
  for (const patch of overlay.promotion_source_patches || []) {
    const row = rowById.get(patch.subject_id)
    if (!row) throw new Error(`Business v0.3 promotion patch references unknown node ${patch.subject_id}`)
    row.subject_truth_sources = uniq([...(row.subject_truth_sources || []), ...(patch.add || [])])
  }
  for (const replacement of sourceReview.promotion_source_replacements || []) {
    const row = rowById.get(replacement.subject_id)
    if (!row) throw new Error(`Business v0.3 source-review replacement references unknown node ${replacement.subject_id}`)
    const removals = new Set(replacement.remove || [])
    row.subject_truth_sources = uniq([
      ...(row.subject_truth_sources || []).filter((sourceId) => !removals.has(sourceId)),
      ...(replacement.add || []),
    ])
  }

  const effectiveIndex = clone(index)
  effectiveIndex.candidate_version = EXPECTED_EFFECTIVE_VERSION
  effectiveIndex.status = 'targeted_remediation_awaiting_independent_reassurance'
  const domainByName = new Map(effectiveIndex.domains.map((domain) => [domain.domain, domain]))
  const effectiveDomainByNode = new Map(baseDomainByNode)
  for (const move of overlay.domain_moves || []) {
    const from = domainByName.get(move.from)
    const to = domainByName.get(move.to)
    if (!from || !to) throw new Error(`Business v0.3 domain move uses unknown domain for ${move.subject_id}`)
    if (effectiveDomainByNode.get(move.subject_id) !== move.from) throw new Error(`Business v0.3 domain move source mismatch for ${move.subject_id}`)
    from.ids = from.ids.filter((id) => id !== move.subject_id)
    to.ids = [...to.ids, move.subject_id]
    effectiveDomainByNode.set(move.subject_id, move.to)
  }

  const allIndexIds = effectiveIndex.domains.flatMap((domain) => domain.ids)
  exactSet(allIndexIds, nodes.keys(), 'Business v0.3 index/node IDs')
  if (allIndexIds.length !== EXPECTED_NODE_COUNT) throw new Error('Business v0.3 index count changed unexpectedly')

  for (const [id, node] of nodes) {
    node.domain = effectiveDomainByNode.get(id)
    node.candidate_version = EXPECTED_EFFECTIVE_VERSION
  }

  const domains = effectiveIndex.domains.map((domain) => ({
    ...domain,
    composed_from: BASE_ROOT,
    nodes: domain.ids.map((id) => clone(nodes.get(id))),
  }))

  exactSet(rowById.keys(), nodes.keys(), 'Business v0.3 matrix/node IDs')
  const excluded = new Set((effectiveSources.legacy_promotion_exclusions || []).map((entry) => entry.source_id))
  const sourceById = new Map(effectiveSources.sources.map((source) => [source.id, source]))
  if (sourceById.size !== effectiveSources.sources.length) throw new Error('Business v0.3 duplicate promotion source IDs')
  for (const rejectedSourceId of rejectedSourceIds) {
    if (sourceById.has(rejectedSourceId)) throw new Error(`Rejected Business v0.3 source ${rejectedSourceId} remains in the effective source universe`)
  }
  for (const [id, node] of nodes) {
    const row = rowById.get(id)
    if (!node.teaching_content?.core_explanation) throw new Error(`Missing Business v0.3 teaching explanation for ${id}`)
    if (!row?.subject_truth_sources?.length) throw new Error(`No Business v0.3 promotion truth sources for ${id}`)
    for (const sourceId of row.subject_truth_sources) {
      const source = sourceById.get(sourceId)
      if (!source?.promotion_eligible || excluded.has(sourceId)) throw new Error(`Invalid Business v0.3 promotion truth source ${sourceId} for ${id}`)
    }
  }

  const effectiveFingerprint = hashParts([
    ['base_candidate_fingerprint', baseFingerprint],
    ['v0.3-remediation-overlay.json', overlayRaw],
    ['v0.3-source-review.json', sourceReviewRaw],
  ])

  return {
    index: effectiveIndex,
    matrix: effectiveMatrix,
    rows: rowById,
    sources: effectiveSources,
    sourceById,
    specialist,
    domains,
    nodes,
    fingerprint: effectiveFingerprint,
    baseFingerprint,
    overlay,
    sourceReview,
  }
}
