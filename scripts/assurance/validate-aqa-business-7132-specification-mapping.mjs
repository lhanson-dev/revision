import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v07.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const EXPECTED_BASE_FINGERPRINT='4f2cc0e75bbe364a2e1a1adaf832b4ad26fa6658c5ec4d988c7de38755b4f947'
const EXPECTED_CANDIDATE_FINGERPRINT='64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const EXPECTED_SECTIONS=['3.1.1','3.1.2','3.1.3','3.2.1','3.2.2','3.2.3','3.3.1','3.3.2','3.3.3','3.3.4','3.4.1','3.4.2','3.4.3','3.4.4','3.4.5','3.5.1','3.5.2','3.5.3','3.5.4','3.6.1','3.6.2','3.6.3','3.6.4','3.6.5','3.7.1','3.7.2','3.7.3','3.7.4','3.7.5','3.7.6','3.7.7','3.7.8','3.8.1','3.8.2','3.9.1','3.9.2','3.9.3','3.9.4','3.10.1','3.10.2','3.10.3','3.10.4']
const ALLOWED_CLASSES=new Set(['A_EXISTING_FOUNDATION_SUFFICIENT','B_EXISTING_FOUNDATION_INSUFFICIENT_DEPTH','C_MISSING_REUSABLE_SUBJECT_KNOWLEDGE','D_COURSE_SPECIFIC_REQUIREMENT'])
function exactSet(actual,expected,label){const a=[...actual].sort(),e=[...expected].sort();if(a.length!==e.length||a.some((v,i)=>v!==e[i]))throw new Error(`${label} mismatch`)}

const candidate=await loadBusinessSubjectFoundationCandidate()
if(candidate.index.candidate_version!=='v0.7-aqa-7132-gap-reconciliation')throw new Error('Unexpected v0.7 candidate version')
if(candidate.nodes.size!==81)throw new Error('Business Foundation node count changed unexpectedly')
if(candidate.previousCandidateFingerprint!==EXPECTED_BASE_FINGERPRINT)throw new Error('v0.7 does not compose over exact assured v0.6 fingerprint')
if(candidate.fingerprint!==EXPECTED_CANDIDATE_FINGERPRINT)throw new Error(`Unexpected v0.7 candidate fingerprint ${candidate.fingerprint}`)
exactSet(candidate.freshNodeScope,['BUS-FIN-008'],'v0.7 fresh assurance scope')
if(candidate.v07Overlay.assurance_strategy?.final_integration_review_required!==false)throw new Error('v0.7 should not repurchase a whole-subject integration review')
if((candidate.v07Overlay.node_patches||[]).length!==1||candidate.v07Overlay.node_patches[0]?.subject_id!=='BUS-FIN-008')throw new Error('v0.7 must patch only BUS-FIN-008')
if((candidate.v07Overlay.source_additions||[]).length!==2)throw new Error('v0.7 expected exactly two source additions')
if((candidate.v07Overlay.domain_moves||[]).length)throw new Error('v0.7 must not move domains')

if(mapping.mapping_id!=='aqa-business-7132-2027-specification-mapping-v1')throw new Error('Unexpected mapping identity')
if(mapping.course?.course_id!=='aqa:aqa-a-level:7132'||mapping.course?.specification_code!=='7132'||mapping.course?.exam_year!==2027)throw new Error('AQA 7132 2027 course identity mismatch')
if(mapping.course?.specification_status!=='outgoing_current_for_2027_exams')throw new Error('AQA 7132 2027 specification status not locked')
if(mapping.subject_foundation?.base_assured_fingerprint!==EXPECTED_BASE_FINGERPRINT)throw new Error('Mapping base Foundation fingerprint mismatch')
if(mapping.subject_foundation?.candidate_fingerprint!==candidate.fingerprint)throw new Error('Mapping candidate Foundation fingerprint mismatch')
exactSet(mapping.subject_foundation?.pending_fresh_assurance_node_ids||[],['BUS-FIN-008'],'mapping pending Foundation scope')
if(!Array.isArray(mapping.requirements)||mapping.requirements.length!==42)throw new Error(`Expected 42 mapped AQA sections, got ${mapping.requirements?.length}`)
exactSet(mapping.requirements.map((r)=>r.source_section),EXPECTED_SECTIONS,'AQA section coverage')
if(new Set(mapping.requirements.map((r)=>r.requirement_id)).size!==42)throw new Error('Duplicate mapping requirement IDs')

let classB=0,classC=0,unmapped=0
for(const row of mapping.requirements){
  if(!ALLOWED_CLASSES.has(row.gap_classification))throw new Error(`${row.requirement_id} invalid gap classification`)
  if(!row.rights_safe_requirement_summary?.trim())throw new Error(`${row.requirement_id} missing rights-safe summary`)
  if(!Array.isArray(row.mapped_subject_node_ids)||!row.mapped_subject_node_ids.length)unmapped+=1
  for(const id of row.mapped_subject_node_ids||[])if(!candidate.nodes.has(id))throw new Error(`${row.requirement_id} references unknown node ${id}`)
  if(row.gap_classification==='B_EXISTING_FOUNDATION_INSUFFICIENT_DEPTH')classB+=1
  if(row.gap_classification==='C_MISSING_REUSABLE_SUBJECT_KNOWLEDGE')classC+=1
}
if(unmapped)throw new Error(`AQA mapping has ${unmapped} unmapped sections`)
if(classB!==1||classC!==0)throw new Error(`Expected one bounded reusable depth gap and no missing subject nodes; B=${classB}, C=${classC}`)
const shareGap=mapping.requirements.find((r)=>r.source_section==='3.1.2')
if(shareGap?.gap_classification!=='B_EXISTING_FOUNDATION_INSUFFICIENT_DEPTH'||!shareGap.mapped_subject_node_ids.includes('BUS-FIN-008'))throw new Error('AQA 3.1.2 share-market gap not bound to BUS-FIN-008')
if(shareGap.coverage_status!=='candidate_covered_pending_v07_assurance')throw new Error('AQA 3.1.2 should remain pending until v0.7 reassurance passes')

for(const source of candidate.v07Overlay.source_additions){if(!source.promotion_eligible)throw new Error(`${source.id} not promotion eligible`);if(source.licence_profile!=='OGL_V3')throw new Error(`${source.id} unexpected licence ${source.licence_profile}`);if(/aqa\.org\.uk/i.test(source.url))throw new Error(`${source.id} improperly uses AQA as reusable truth`)}
const financeTruth=new Set(candidate.rows.get('BUS-FIN-008')?.subject_truth_sources||[])
for(const id of ['SRC-GOVUK-SHAREHOLDER-RIGHTS-2026','SRC-ONS-MARKET-CAPITALISATION-2015'])if(!financeTruth.has(id))throw new Error(`BUS-FIN-008 missing ${id}`)
if(mapping.summary?.requirement_section_count!==42||mapping.summary?.unmapped_requirement_count!==0||mapping.summary?.foundation_gap_count!==1)throw new Error('Mapping summary mismatch')

console.log('AQA Business 7132 — 2027 specification mapping / v0.7 gap reconciliation: PASS')
console.log(`- exact course: ${mapping.course.course_id}, exam year ${mapping.course.exam_year}`)
console.log(`- AQA mapped sections: ${mapping.requirements.length}/42`)
console.log(`- unmapped sections: ${unmapped}`)
console.log(`- reusable Foundation gaps: ${classB+classC} (BUS-FIN-008 only)`)
console.log(`- course-specific facet sections retained in mapping: ${mapping.summary.classification_counts.D_COURSE_SPECIFIC_REQUIREMENT}`)
console.log(`- v0.7 candidate fingerprint: ${candidate.fingerprint}`)
console.log('- paid assurance required next: BUS-FIN-008 only; no repeat whole-subject integration review')
