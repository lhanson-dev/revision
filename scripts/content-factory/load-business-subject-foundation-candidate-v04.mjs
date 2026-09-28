import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate as loadV03Candidate } from './load-business-subject-foundation-candidate.mjs'

const OVERLAY_PATH = 'research/business-subject-foundation/v0.4-reassurance-remediation/REMEDIATION.json'
const EXPECTED_BASE_VERSION = 'v0.3-reassurance-remediation'
const EXPECTED_EFFECTIVE_VERSION = 'v0.4-reassurance-remediation'
const EXPECTED_NODE_COUNT = 81

const clone = (value) => structuredClone(value)
const uniq = (values) => [...new Set(values)]

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) throw new Error(`${label} mismatch`)
}

function hashParts(parts) {
  const hash = createHash('sha256')
  for (const [name, value] of [...parts].sort(([a], [b]) => a.localeCompare(b))) hash.update(`${name}\0${value}\0`)
  return hash.digest('hex')
}

export async function loadBusinessSubjectFoundationCandidate() {
  const previous = await loadV03Candidate()
  const overlayRaw = await readFile(OVERLAY_PATH, 'utf8')
  const v04Overlay = JSON.parse(overlayRaw)

  if (previous.index.candidate_version !== EXPECTED_BASE_VERSION || previous.nodes.size !== EXPECTED_NODE_COUNT) {
    throw new Error('Unexpected Business v0.3 base candidate identity/count')
  }
  if (v04Overlay.candidate_version !== EXPECTED_EFFECTIVE_VERSION || v04Overlay.base_candidate?.version !== EXPECTED_BASE_VERSION) {
    throw new Error('Unexpected Business v0.4 remediation overlay identity')
  }
  if (v04Overlay.base_candidate?.fingerprint !== previous.fingerprint) {
    throw new Error(`Business v0.4 base fingerprint mismatch: ${previous.fingerprint}`)
  }
  if (v04Overlay.principles?.teaching_content_changed_by_this_remediation !== false) {
    throw new Error('Business v0.4 source-only remediation must explicitly preserve teaching content')
  }
  if ((v04Overlay.node_patches || []).length || (v04Overlay.domain_moves || []).length) {
    throw new Error('Business v0.4 is source-only remediation; node/domain patches are not permitted')
  }

  const index = clone(previous.index)
  index.candidate_version = EXPECTED_EFFECTIVE_VERSION
  index.status = 'targeted_remediation_awaiting_independent_reassurance'

  const nodes = new Map([...previous.nodes].map(([id, node]) => [id, clone(node)]))
  for (const node of nodes.values()) node.candidate_version = EXPECTED_EFFECTIVE_VERSION

  const sources = clone(previous.sources)
  sources.candidate_version = EXPECTED_EFFECTIVE_VERSION
  sources.status = 'targeted_remediation_awaiting_independent_reassurance'
  const sourceIds = new Set(sources.sources.map((source) => source.id))
  for (const source of v04Overlay.source_additions || []) {
    if (sourceIds.has(source.id)) throw new Error(`Business v0.4 duplicate source addition ${source.id}`)
    sources.sources.push(clone(source))
    sourceIds.add(source.id)
  }

  const matrix = clone(previous.matrix)
  matrix.candidate_version = EXPECTED_EFFECTIVE_VERSION
  matrix.status = 'targeted_remediation_awaiting_independent_reassurance'
  matrix.purpose = 'Promotion-provenance composition for Business v0.4 targeted source-support remediation over the immutable v0.3 reviewed candidate.'
  matrix.policy = {
    ...matrix.policy,
    teaching_content_changed_by_this_remediation: false,
    promotion_decision: 'NOT_YET_MADE',
    required_next_gate: 'fresh_independent_reassurance_against_exact_v0.4_composed_fingerprint',
  }
  const rows = new Map(matrix.nodes.map((row) => [row.subject_id, row]))
  for (const row of matrix.nodes) row.promotion_provenance_status = 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE'
  for (const patch of v04Overlay.promotion_source_patches || []) {
    const row = rows.get(patch.subject_id)
    if (!row) throw new Error(`Business v0.4 promotion patch references unknown node ${patch.subject_id}`)
    row.subject_truth_sources = uniq([...(row.subject_truth_sources || []), ...(patch.add || [])])
  }

  const allIndexIds = index.domains.flatMap((domain) => domain.ids || [])
  exactSet(allIndexIds, nodes.keys(), 'Business v0.4 index/node IDs')
  exactSet(rows.keys(), nodes.keys(), 'Business v0.4 matrix/node IDs')
  if (allIndexIds.length !== EXPECTED_NODE_COUNT) throw new Error('Business v0.4 index count changed unexpectedly')

  const excluded = new Set((sources.legacy_promotion_exclusions || []).map((entry) => entry.source_id))
  const sourceById = new Map(sources.sources.map((source) => [source.id, source]))
  if (sourceById.size !== sources.sources.length) throw new Error('Business v0.4 duplicate promotion source IDs')
  for (const [id, node] of nodes) {
    if (!node.teaching_content?.core_explanation) throw new Error(`Missing Business v0.4 teaching explanation for ${id}`)
    const row = rows.get(id)
    if (!row?.subject_truth_sources?.length) throw new Error(`No Business v0.4 promotion truth sources for ${id}`)
    for (const sourceId of row.subject_truth_sources) {
      const source = sourceById.get(sourceId)
      if (!source?.promotion_eligible || excluded.has(sourceId)) throw new Error(`Invalid Business v0.4 promotion truth source ${sourceId} for ${id}`)
    }
  }

  const domains = index.domains.map((domain) => ({
    ...domain,
    composed_from: EXPECTED_BASE_VERSION,
    nodes: domain.ids.map((id) => clone(nodes.get(id))),
  }))
  const fingerprint = hashParts([
    ['v0.3-candidate-fingerprint', previous.fingerprint],
    ['v0.4-remediation-overlay.json', overlayRaw],
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
    v04Overlay,
  }
}
