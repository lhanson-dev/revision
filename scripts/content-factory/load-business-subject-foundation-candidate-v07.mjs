import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate as loadV06Candidate } from './load-business-subject-foundation-candidate-v06.mjs'

const OVERLAY_PATH = 'research/business-subject-foundation/v0.7-aqa-7132-gap-reconciliation/REMEDIATION.json'
const EXPECTED_BASE_VERSION = 'v0.6-final-targeted-remediation'
const EXPECTED_EFFECTIVE_VERSION = 'v0.7-aqa-7132-gap-reconciliation'
const EXPECTED_NODE_COUNT = 81

const clone = (value) => structuredClone(value)
const uniq = (values) => [...new Set(values)]
function exactSet(actual, expected, label) { const a=[...actual].sort(), e=[...expected].sort(); if (a.length!==e.length || a.some((v,i)=>v!==e[i])) throw new Error(`${label} mismatch`) }
function deepMerge(target, patch) { if (patch===null || typeof patch!=='object' || Array.isArray(patch)) return clone(patch); const result=target&&typeof target==='object'&&!Array.isArray(target)?clone(target):{}; for (const [key,value] of Object.entries(patch)) result[key]=deepMerge(result[key],value); return result }
function hashParts(parts) { const hash=createHash('sha256'); for (const [name,value] of [...parts].sort(([a],[b])=>a.localeCompare(b))) hash.update(`${name}\0${value}\0`); return hash.digest('hex') }

export async function loadBusinessSubjectFoundationCandidate() {
  const previous=await loadV06Candidate()
  const overlayRaw=await readFile(OVERLAY_PATH,'utf8')
  const overlay=JSON.parse(overlayRaw)
  if (previous.index.candidate_version!==EXPECTED_BASE_VERSION || previous.nodes.size!==EXPECTED_NODE_COUNT) throw new Error('Unexpected Business v0.6 base candidate identity/count')
  if (overlay.candidate_version!==EXPECTED_EFFECTIVE_VERSION || overlay.base_candidate?.version!==EXPECTED_BASE_VERSION) throw new Error('Unexpected Business v0.7 remediation overlay identity')
  if (overlay.base_candidate?.fingerprint!==previous.fingerprint) throw new Error(`Business v0.7 base fingerprint mismatch: ${previous.fingerprint}`)
  if ((overlay.domain_moves||[]).length) throw new Error('Business v0.7 must not change domain membership')

  const index=clone(previous.index); index.candidate_version=EXPECTED_EFFECTIVE_VERSION; index.status='aqa_7132_gap_reconciliation_awaiting_scoped_independent_reassurance'
  const nodes=new Map([...previous.nodes].map(([id,node])=>[id,clone(node)]))
  for (const entry of overlay.node_patches||[]) { const current=nodes.get(entry.subject_id); if(!current) throw new Error(`Business v0.7 patch references unknown node ${entry.subject_id}`); nodes.set(entry.subject_id,deepMerge(current,entry.patch)) }
  for (const node of nodes.values()) node.candidate_version=EXPECTED_EFFECTIVE_VERSION

  const sources=clone(previous.sources); sources.candidate_version=EXPECTED_EFFECTIVE_VERSION; sources.status='aqa_7132_gap_reconciliation_awaiting_scoped_independent_reassurance'
  const sourceIds=new Set(sources.sources.map((source)=>source.id))
  for (const source of overlay.source_additions||[]) { if(sourceIds.has(source.id)) throw new Error(`Business v0.7 duplicate source addition ${source.id}`); sources.sources.push(clone(source)); sourceIds.add(source.id) }

  const matrix=clone(previous.matrix); matrix.candidate_version=EXPECTED_EFFECTIVE_VERSION; matrix.status='aqa_7132_gap_reconciliation_awaiting_scoped_independent_reassurance'; matrix.purpose='Promotion-provenance composition for the AQA 7132 specification-gap reconciliation over the exact v0.6 assured Business candidate.'
  matrix.policy={...matrix.policy,teaching_content_changed_by_this_remediation:true,promotion_decision:'NOT_YET_MADE',required_next_gate:'single_node_independent_reassurance_for_BUS_FIN_008_against_exact_v0.7_fingerprint'}
  const rows=new Map(matrix.nodes.map((row)=>[row.subject_id,row])); const freshScope=new Set(overlay.assurance_strategy?.fresh_node_scope||[])
  for (const row of matrix.nodes) row.promotion_provenance_status=freshScope.has(row.subject_id)?'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE':'PRIOR_ASSURANCE_PRESERVED_UNCHANGED'
  for (const patch of overlay.promotion_source_patches||[]) { const row=rows.get(patch.subject_id); if(!row) throw new Error(`Business v0.7 promotion patch references unknown node ${patch.subject_id}`); row.subject_truth_sources=uniq([...(row.subject_truth_sources||[]),...(patch.add||[])]) }

  const allIndexIds=index.domains.flatMap((domain)=>domain.ids||[])
  exactSet(allIndexIds,nodes.keys(),'Business v0.7 index/node IDs'); exactSet(rows.keys(),nodes.keys(),'Business v0.7 matrix/node IDs')
  if(allIndexIds.length!==EXPECTED_NODE_COUNT) throw new Error('Business v0.7 index count changed unexpectedly')
  exactSet(freshScope,['BUS-FIN-008'],'Business v0.7 fresh assurance scope')
  const excluded=new Set((sources.legacy_promotion_exclusions||[]).map((entry)=>entry.source_id)); const sourceById=new Map(sources.sources.map((source)=>[source.id,source]))
  if(sourceById.size!==sources.sources.length) throw new Error('Business v0.7 duplicate promotion source IDs')
  for (const [id,node] of nodes) { if(!node.teaching_content?.core_explanation) throw new Error(`Missing Business v0.7 teaching explanation for ${id}`); const row=rows.get(id); if(!row?.subject_truth_sources?.length) throw new Error(`No Business v0.7 promotion truth sources for ${id}`); for(const sourceId of row.subject_truth_sources){ const source=sourceById.get(sourceId); if(!source?.promotion_eligible || excluded.has(sourceId)) throw new Error(`Invalid Business v0.7 promotion truth source ${sourceId} for ${id}`) } }
  const domains=index.domains.map((domain)=>({...domain,composed_from:EXPECTED_BASE_VERSION,nodes:domain.ids.map((id)=>clone(nodes.get(id)))}))
  const fingerprint=hashParts([['v0.6-candidate-fingerprint',previous.fingerprint],['v0.7-remediation-overlay.json',overlayRaw]])
  return {...previous,index,matrix,rows,sources,sourceById,domains,nodes,fingerprint,previousCandidateFingerprint:previous.fingerprint,v07Overlay:overlay,freshNodeScope:[...freshScope]}
}
