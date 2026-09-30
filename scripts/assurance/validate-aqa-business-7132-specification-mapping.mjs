import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const EXPECTED_SECTIONS=['3.1.1','3.1.2','3.1.3','3.2.1','3.2.2','3.2.3','3.3.1','3.3.2','3.3.3','3.3.4','3.4.1','3.4.2','3.4.3','3.4.4','3.4.5','3.5.1','3.5.2','3.5.3','3.5.4','3.6.1','3.6.2','3.6.3','3.6.4','3.6.5','3.7.1','3.7.2','3.7.3','3.7.4','3.7.5','3.7.6','3.7.7','3.7.8','3.8.1','3.8.2','3.9.1','3.9.2','3.9.3','3.9.4','3.10.1','3.10.2','3.10.3','3.10.4']
const ALLOWED_CLASSES=new Set(['A_EXISTING_FOUNDATION_SUFFICIENT','B_EXISTING_FOUNDATION_INSUFFICIENT_DEPTH','C_MISSING_REUSABLE_SUBJECT_KNOWLEDGE','D_COURSE_SPECIFIC_REQUIREMENT'])
function exactSet(actual,expected,label){const a=[...actual].sort(),e=[...expected].sort();if(a.length!==e.length||a.some((v,i)=>v!==e[i]))throw new Error(`${label} mismatch`)}

const candidate=await loadBusinessSubjectFoundationCandidate()
if(candidate.index.candidate_version!==mapping.subject_foundation?.candidate_version)throw new Error(`Mapping targets Foundation ${mapping.subject_foundation?.candidate_version} but the current Foundation is ${candidate.index.candidate_version}`)
if(candidate.nodes.size!==mapping.subject_foundation?.node_count)throw new Error('Business Foundation node count changed unexpectedly')

if(mapping.mapping_id!=='aqa-business-7132-2027-specification-mapping-v1')throw new Error('Unexpected mapping identity')
if(mapping.course?.course_id!=='aqa:aqa-a-level:7132'||mapping.course?.specification_code!=='7132'||mapping.course?.exam_year!==2027)throw new Error('AQA 7132 2027 course identity mismatch')
if(mapping.course?.specification_status!=='outgoing_current_for_2027_exams')throw new Error('AQA 7132 2027 specification status not locked')
if(!Array.isArray(mapping.requirements)||mapping.requirements.length!==42)throw new Error(`Expected 42 mapped AQA sections, got ${mapping.requirements?.length}`)
exactSet(mapping.requirements.map((r)=>r.source_section),EXPECTED_SECTIONS,'AQA section coverage')
if(new Set(mapping.requirements.map((r)=>r.requirement_id)).size!==42)throw new Error('Duplicate mapping requirement IDs')

let unmapped=0
for(const row of mapping.requirements){
  if(!ALLOWED_CLASSES.has(row.gap_classification))throw new Error(`${row.requirement_id} invalid gap classification`)
  if(!row.rights_safe_requirement_summary?.trim())throw new Error(`${row.requirement_id} missing rights-safe summary`)
  if(!Array.isArray(row.mapped_subject_node_ids)||!row.mapped_subject_node_ids.length)unmapped+=1
  for(const id of row.mapped_subject_node_ids||[])if(!candidate.nodes.has(id))throw new Error(`${row.requirement_id} references unknown node ${id}`)
  if(row.coverage_status!=='mapped')throw new Error(`${row.requirement_id} is not mapped`)
}
if(unmapped)throw new Error(`AQA mapping has ${unmapped} unmapped sections`)
if(mapping.summary?.requirement_section_count!==42||mapping.summary?.unmapped_requirement_count!==0)throw new Error('Mapping summary mismatch')

console.log('AQA Business 7132 — 2027 specification mapping: PASS')
console.log(`- exact course: ${mapping.course.course_id}, exam year ${mapping.course.exam_year}`)
console.log(`- AQA mapped sections: ${mapping.requirements.length}/42`)
console.log(`- Subject Foundation: ${candidate.index.candidate_version} (${candidate.fingerprint})`)
console.log('- named-item coverage is checked separately: scripts/assurance/check-aqa-business-7132-item-coverage.mjs')
