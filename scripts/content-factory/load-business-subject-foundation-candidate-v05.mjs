import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate as loadV04Candidate } from './load-business-subject-foundation-candidate-v04.mjs'

const OVERLAY_PATH = 'research/business-subject-foundation/v0.5-targeted-reassurance/REMEDIATION.json'
const EXPECTED_BASE_VERSION = 'v0.4-reassurance-remediation'
const EXPECTED_EFFECTIVE_VERSION = 'v0.5-targeted-reassurance'
const EXPECTED_NODE_COUNT = 81

const clone = (value) => structuredClone(value)
const uniq = (values) => [...new Set(values)]

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) throw new Error(`${label} mismatch`)
}

function deepMerge(target, patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) return clone(patch)
  const result = target && typeof target === 'object' && !Array.isArray(target) ? clone(target) : {}
  for (const [key, value] of Object.entries(patch)) result[key] = deepMerge(result[key], value)
  return result
}

function hashParts(parts) {
  const hash = createHash('sha256')
  for (const [name, value] of [...parts].sort(([a], [b]) => a.localeCompare(b))) hash.update(`${name}\0${value}\0`)
  return hash.digest('hex')
}

export async function loadBusinessSubjectFoundationCandidate() {
  const previous = await loadV04Candidate()
  const overlayRaw = await readFile(OVERLAY_PATH, 'utf8')
  const v05Overlay = JSON.parse(overlayRaw)

  if (previous.index.candidate_version !== EXPECTED_BASE_VERSION || previous.nodes.size !== EXPECTED_NODE_COUNT) {
    throw new Error('Unexpected Business v0.4 base candidate identity/count')
  }
  if (v05Overlay.candidate_version !== EXPECTED_EFFECTIVE_VERSION || v05Overlay.base_candidate?.version !== EXPECTED_BASE_VERSION) {
    throw new Error('Unexpected Business v0.5 remediation overlay identity')
  }
  if (v05Overlay.base_candidate?.fingerprint !== previous.fingerprint) {
    throw new Error(`Business v0.5 base fingerprint mismatch: ${previous.fingerprint}`)
  }
  if ((v05Overlay.domain_moves || []).length) throw new Error('Business v0.5 must not change domain membership')

  const index = clone(previous.index)
  index.candidate_version = EXPECTED_EFFECTIVE_VERSION
  index.status = 'targeted_remediation_awaiting_scoped_independent_reassurance'

  const nodes = new Map([...previous.nodes].map(([id, node]) => [id, clone(node)]))
  for (const entry of v05Overlay.node_patches || []) {
    const current = nodes.get(entry.subject_id)
    if (!current) throw new Error(`Business v0.5 patch references unknown node ${entry.subject_id}`)
    nodes.set(entry.subject_id, deepMerge(current, entry.patch))
  }
  for (const node of nodes.values()) node.candidate_version = EXPECTED_EFFECTIVE_VERSION

  const sources = clone(previous.sources)
  sources.candidate_version = EXPECTED_EFFECTIVE_VERSION
  sources.status = 'targeted_remediation_awaiting_scoped_independent_reassurance'
  const sourceIds = new Set(sources.sources.map((source) => source.id))
  for (const source of v05Overlay.source_additions || []) {
    if (sourceIds.has(source.id)) throw new Error(`Business v0.5 duplicate source addition ${source.id}`)
    sources.sources.push(clone(source))
    sourceIds.add(source.id)
  }

  const matrix = clone(previous.matrix)
  matrix.candidate_version = EXPECTED_EFFECTIVE_VERSION
  matrix.status = 'targeted_remediation_awaiting_scoped_independent_reassurance'
  matrix.purpose = 'Promotion-provenance composition for Business v0.5 targeted remediation and incremental reassurance over the exact v0.4 candidate.'
  matrix.policy = {
    ...matrix.policy,
    teaching_content_changed_by_this_remediation: true,
    promotion_decision: 'NOT_YET_MADE',
    required_next_gate: 'scoped_independent_reassurance_plus_final_whole_subject_integration_against_exact_v0.5_fingerprint',
  }
  const rows = new Map(matrix.nodes.map((row) => [row.subject_id, row]))
  const freshScope = new Set(v05Overlay.assurance_strategy?.fresh_node_scope || [])
  for (const row of matrix.nodes) {
    row.promotion_provenance_status = freshScope.has(row.subject_id)
      ? 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE'
      : 'PRIOR_ASSURANCE_PRESERVED_UNCHANGED'
  }
  for (const patch of v05Overlay.promotion_source_patches || []) {
    const row = rows.get(patch.subject_id)
    if (!row) throw new Error(`Business v0.5 promotion patch references unknown node ${patch.subject_id}`)
    row.subject_truth_sources = uniq([...(row.subject_truth_sources || []), ...(patch.add || [])])
  }

  const allIndexIds = index.domains.flatMap((domain) => domain.ids || [])
  exactSet(allIndexIds, nodes.keys(), 'Business v0.5 index/node IDs')
  exactSet(rows.keys(), nodes.keys(), 'Business v0.5 matrix/node IDs')
  if (allIndexIds.length !== EXPECTED_NODE_COUNT) throw new Error('Business v0.5 index count changed unexpectedly')
  for (const id of freshScope) if (!nodes.has(id)) throw new Error(`Business v0.5 fresh scope references unknown node ${id}`)

  const excluded = new Set((sources.legacy_promotion_exclusions || []).map((entry) => entry.source_id))
  const sourceById = new Map(sources.sources.map((source) => [source.id, source]))
  if (sourceById.size !== sources.sources.length) throw new Error('Business v0.5 duplicate promotion source IDs')
  for (const [id, node] of nodes) {
    if (!node.teaching_content?.core_explanation) throw new Error(`Missing Business v0.5 teaching explanation for ${id}`)
    const row = rows.get(id)
    if (!row?.subject_truth_sources?.length) throw new Error(`No Business v0.5 promotion truth sources for ${id}`)
    for (const sourceId of row.subject_truth_sources) {
      const source = sourceById.get(sourceId)
      if (!source?.promotion_eligible || excluded.has(sourceId)) throw new Error(`Invalid Business v0.5 promotion truth source ${sourceId} for ${id}`)
    }
  }

  const domains = index.domains.map((domain) => ({
    ...domain,
    composed_from: EXPECTED_BASE_VERSION,
    nodes: domain.ids.map((id) => clone(nodes.get(id))),
  }))
  const fingerprint = hashParts([
    ['v0.4-candidate-fingerprint', previous.fingerprint],
    ['v0.5-remediation-overlay.json', overlayRaw],
  ])

  return {
    ...previous,
    index,
    matrix,
    rows,
    sources,
    sourceById,
    domains,
    nodes,
    fingerprint,
    previousCandidateFingerprint: previous.fingerprint,
    v05Overlay,
    freshNodeScope: [...freshScope],
  }
}
