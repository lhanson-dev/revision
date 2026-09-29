import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate as loadV07Candidate } from './load-business-subject-foundation-candidate-v07.mjs'

const OVERLAY_PATH = 'research/business-subject-foundation/v0.8-t8-remediation/REMEDIATION.json'
const AUGMENTATION_PATH = 'research/business-subject-foundation/v0.8-t8-remediation/SOURCE_AUGMENTATIONS.json'
const AUGMENTATION_2_PATH = 'research/business-subject-foundation/v0.8-t8-remediation/SOURCE_AUGMENTATIONS_2.json'
const AUGMENTATION_3_PATH = 'research/business-subject-foundation/v0.8-t8-remediation/SOURCE_AUGMENTATIONS_3.json'
const SOURCE_METADATA_PATCH_PATH = 'research/business-subject-foundation/v0.8-t8-remediation/SOURCE_METADATA_PATCHES.json'
const EXPECTED_BASE_VERSION = 'v0.7-aqa-7132-gap-reconciliation'
const EXPECTED_EFFECTIVE_VERSION = 'v0.8-t8-exact-course-remediation'
const EXPECTED_BASE_FINGERPRINT = '64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const EXPECTED_NODE_COUNT = 81

const clone = (value) => structuredClone(value)
const uniq = (values) => [...new Set(values)]
function exactSet(actual, expected, label) { const a=[...actual].sort(), e=[...expected].sort(); if (a.length!==e.length || a.some((v,i)=>v!==e[i])) throw new Error(`${label} mismatch`) }
function deepMerge(target, patch) { if (patch===null || typeof patch!=='object' || Array.isArray(patch)) return clone(patch); const result=target&&typeof target==='object'&&!Array.isArray(target)?clone(target):{}; for (const [key,value] of Object.entries(patch)) result[key]=deepMerge(result[key],value); return result }
function hashParts(parts) { const hash=createHash('sha256'); for (const [name,value] of [...parts].sort(([a],[b])=>a.localeCompare(b))) hash.update(`${name}\0${value}\0`); return hash.digest('hex') }

export async function loadBusinessSubjectFoundationCandidate() {
  const previous=await loadV07Candidate()
  const [overlayRaw,augmentationRaw,augmentation2Raw,augmentation3Raw,sourceMetadataPatchRaw]=await Promise.all([readFile(OVERLAY_PATH,'utf8'),readFile(AUGMENTATION_PATH,'utf8'),readFile(AUGMENTATION_2_PATH,'utf8'),readFile(AUGMENTATION_3_PATH,'utf8'),readFile(SOURCE_METADATA_PATCH_PATH,'utf8')])
  const overlay=JSON.parse(overlayRaw), augmentations=JSON.parse(augmentationRaw), augmentations2=JSON.parse(augmentation2Raw), augmentations3=JSON.parse(augmentation3Raw), sourceMetadataPatches=JSON.parse(sourceMetadataPatchRaw)
  if (previous.index.candidate_version!==EXPECTED_BASE_VERSION || previous.nodes.size!==EXPECTED_NODE_COUNT) throw new Error('Unexpected Business v0.7 base candidate identity/count')
  if (previous.fingerprint!==EXPECTED_BASE_FINGERPRINT) throw new Error(`Unexpected Business v0.7 base fingerprint ${previous.fingerprint}`)
  if (overlay.candidate_version!==EXPECTED_EFFECTIVE_VERSION || overlay.base_candidate?.version!==EXPECTED_BASE_VERSION) throw new Error('Unexpected Business v0.8 remediation overlay identity')
  if (augmentations.candidate_version!==EXPECTED_EFFECTIVE_VERSION || augmentations2.candidate_version!==EXPECTED_EFFECTIVE_VERSION || augmentations3.candidate_version!==EXPECTED_EFFECTIVE_VERSION || sourceMetadataPatches.candidate_version!==EXPECTED_EFFECTIVE_VERSION) throw new Error('Unexpected Business v0.8 source augmentation/metadata patch identity')
  if (overlay.base_candidate?.fingerprint!==previous.fingerprint) throw new Error(`Business v0.8 base fingerprint mismatch: ${previous.fingerprint}`)
  if ((overlay.domain_moves||[]).length) throw new Error('Business v0.8 must not change domain membership')
  if ((overlay.relationship_patches||[]).length) throw new Error('Business v0.8 must not change dependency/relationship edges')

  const freshScope=new Set(overlay.assurance_strategy?.fresh_node_scope||[])
  const patchScope=new Set((overlay.node_patches||[]).map((entry)=>entry.subject_id))
  exactSet(freshScope,patchScope,'Business v0.8 fresh assurance / teaching patch scope')
  if (freshScope.size!==14) throw new Error(`Business v0.8 expected 14 changed nodes, got ${freshScope.size}`)
  if (overlay.assurance_strategy?.preserved_unchanged_node_count!==EXPECTED_NODE_COUNT-freshScope.size) throw new Error('Business v0.8 preserved node count mismatch')
  if (overlay.assurance_strategy?.final_integration_review_required!==true) throw new Error('Business v0.8 must require a fresh changed-scope integration review')

  const index=clone(previous.index); index.candidate_version=EXPECTED_EFFECTIVE_VERSION; index.status='t8_exact_course_remediation_awaiting_fresh_reassurance'
  const nodes=new Map([...previous.nodes].map(([id,node])=>[id,clone(node)]))
  for (const entry of overlay.node_patches||[]) { const current=nodes.get(entry.subject_id); if(!current) throw new Error(`Business v0.8 patch references unknown node ${entry.subject_id}`); nodes.set(entry.subject_id,deepMerge(current,entry.patch)) }
  for (const node of nodes.values()) node.candidate_version=EXPECTED_EFFECTIVE_VERSION

  const sources=clone(previous.sources); sources.candidate_version=EXPECTED_EFFECTIVE_VERSION; sources.status='t8_exact_course_remediation_awaiting_fresh_reassurance'
  const sourceIds=new Set(sources.sources.map((source)=>source.id))
  for (const source of [...(overlay.source_additions||[]),...(augmentations.source_additions||[]),...(augmentations2.source_additions||[]),...(augmentations3.source_additions||[])]) { if(sourceIds.has(source.id)) throw new Error(`Business v0.8 duplicate source addition ${source.id}`); sources.sources.push(clone(source)); sourceIds.add(source.id) }
  const sourceByIdBeforeMetadataPatch=new Map(sources.sources.map((source)=>[source.id,source]))
  for (const entry of sourceMetadataPatches.source_metadata_patches||[]) { const source=sourceByIdBeforeMetadataPatch.get(entry.source_id); if(!source) throw new Error(`Business v0.8 source metadata patch references unknown source ${entry.source_id}`); Object.assign(source,clone(entry.patch)) }

  const matrix=clone(previous.matrix); matrix.candidate_version=EXPECTED_EFFECTIVE_VERSION; matrix.status='t8_exact_course_remediation_awaiting_fresh_reassurance'; matrix.purpose='Promotion-provenance composition for the exact T8 fail-hold remediation over the exact reassured Business v0.7 candidate.'
  matrix.policy={...matrix.policy,teaching_content_changed_by_this_remediation:true,promotion_decision:'NOT_YET_MADE',required_next_gate:'fresh_v08_changed_scope_and_integration_reassurance_against_exact_fingerprint'}
  const rows=new Map(matrix.nodes.map((row)=>[row.subject_id,row]))
  for (const row of matrix.nodes) row.promotion_provenance_status=freshScope.has(row.subject_id)?'T8_TARGETED_REMEDIATION_AWAITING_FRESH_REASSURANCE':'PRIOR_ASSURANCE_PRESERVED_UNCHANGED'
  for (const patch of [...(overlay.promotion_source_patches||[]),...(augmentations.promotion_source_patches||[]),...(augmentations2.promotion_source_patches||[]),...(augmentations3.promotion_source_patches||[])]) { const row=rows.get(patch.subject_id); if(!row) throw new Error(`Business v0.8 promotion patch references unknown node ${patch.subject_id}`); row.subject_truth_sources=uniq([...(row.subject_truth_sources||[]),...(patch.add||[])]) }

  const allIndexIds=index.domains.flatMap((domain)=>domain.ids||[])
  exactSet(allIndexIds,nodes.keys(),'Business v0.8 index/node IDs'); exactSet(rows.keys(),nodes.keys(),'Business v0.8 matrix/node IDs')
  if(allIndexIds.length!==EXPECTED_NODE_COUNT) throw new Error('Business v0.8 index count changed unexpectedly')
  const excluded=new Set((sources.legacy_promotion_exclusions||[]).map((entry)=>entry.source_id)); const sourceById=new Map(sources.sources.map((source)=>[source.id,source]))
  if(sourceById.size!==sources.sources.length) throw new Error('Business v0.8 duplicate promotion source IDs')
  for (const [id,node] of nodes) { if(!node.teaching_content?.core_explanation) throw new Error(`Missing Business v0.8 teaching explanation for ${id}`); const row=rows.get(id); if(!row?.subject_truth_sources?.length) throw new Error(`No Business v0.8 promotion truth sources for ${id}`); for(const sourceId of row.subject_truth_sources){ const source=sourceById.get(sourceId); if(!source?.promotion_eligible || excluded.has(sourceId)) throw new Error(`Invalid Business v0.8 promotion truth source ${sourceId} for ${id}`) } }
  for (const id of freshScope) { const facets=nodes.get(id)?.teaching_content?.course_relevant_named_facets; if(!Array.isArray(facets)||facets.length===0) throw new Error(`Business v0.8 changed node ${id} has no structured named facets`) }

  const domains=index.domains.map((domain)=>({...domain,composed_from:EXPECTED_BASE_VERSION,nodes:domain.ids.map((id)=>clone(nodes.get(id)))}))
  const fingerprint=hashParts([['v0.7-candidate-fingerprint',previous.fingerprint],['v0.8-remediation-overlay.json',overlayRaw],['v0.8-source-augmentations.json',augmentationRaw],['v0.8-source-augmentations-2.json',augmentation2Raw],['v0.8-source-augmentations-3.json',augmentation3Raw],['v0.8-source-metadata-patches.json',sourceMetadataPatchRaw]])
  return {...previous,index,matrix,rows,sources,sourceById,domains,nodes,fingerprint,previousCandidateFingerprint:previous.fingerprint,v08Overlay:overlay,v08SourceAugmentations:augmentations,v08SourceAugmentations2:augmentations2,v08SourceAugmentations3:augmentations3,v08SourceMetadataPatches:sourceMetadataPatches,freshNodeScope:[...freshScope]}
}
