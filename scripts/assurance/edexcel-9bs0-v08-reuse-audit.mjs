import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const firstSlicePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-first-slice-review.json');
export const intakePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-stage5-intake.json');
const EXPECTED='v0.8-t8-exact-course-remediation';
const REVIEW_SET=['1.2.1:a','1.2.2:a','1.2.3:a','1.2.3:b','1.2.4:a','1.2.5:a'];

export function auditEdexcelV08Reuse(candidate, review, intake) {
 const problems=[];
 const requireTruth=(truth,code)=>{if(!truth)problems.push(code)};
 const nodes=candidate?.nodes instanceof Map?candidate.nodes:new Map();
 const provenance=candidate?.rows instanceof Map?candidate.rows:new Map();
 const sourceById=candidate?.sourceById instanceof Map?candidate.sourceById:new Map();
 const lines=review?.lettered_obligations??[];
 const candidateVersion=candidate?.index?.candidate_version??null;
 const fingerprint=candidate?.fingerprint??null;
 const expectedReviewIds=(review?.subtopic_letter_denominator??[])
  .flatMap(p=>[...p.letters].map(letter=>p.id+':'+letter));
 requireTruth(candidateVersion===EXPECTED && nodes.size===81
  && typeof fingerprint==='string' && /^[a-f0-9]{64}$/.test(fingerprint),
  'effective_foundation_identity_invalid');
 requireTruth(candidate?.index?.status==='t8_exact_course_remediation_awaiting_fresh_reassurance'
  && candidate?.matrix?.policy?.promotion_decision==='NOT_YET_MADE'
  && Array.isArray(candidate?.changedSinceAssurance),
  'foundation_unreviewed_promotion_boundary_broken');
 requireTruth(review?.status==='RESEARCH_NON_PUBLISHING'
  && review?.foundation_authority==='RESEARCH_ONLY'
  && review?.rights==='REFERENCE_ONLY'
  && review?.source_text_permitted_as_generation_input===false
  && review?.approved_reuse_count===null
  && review?.reviewed_reuse_percent===null
  && review?.publish_approved===false
  && intake?.qualification?.code==='9BS0'
  && intake?.assurance?.atomic_curriculum_requirements_complete===false,
  'source_or_course_authority_invalid');
 requireTruth(lines.length===26
  && lines.every((item,i)=>item.id===expectedReviewIds[i])
  && lines.every(item=>item.status==='UNREVIEWED'&&item.nested_requirements_complete===false),
  'lettered_mapping_unreviewed_identity_invalid');
 const candidateNodeIds=[...new Set(lines.flatMap(row=>row.candidate_subject_node_ids??[]))].sort();
 requireTruth(lines.every(row=>Array.isArray(row.candidate_subject_node_ids)
  && row.candidate_subject_node_ids.every(id=>nodes.has(id))),
  'candidate_ids_not_in_effective_foundation');
 const nodeEvidence=candidateNodeIds.map(id=>{
  const node=nodes.get(id), row=provenance.get(id);
  const sourceIds=row?.subject_truth_sources??[];
  const sourcesValid=sourceIds.length>0 && sourceIds.every(sourceId=>sourceById.get(sourceId)?.promotion_eligible===true);
  if(!sourcesValid)problems.push('candidate_node_provenance_not_eligible:'+id);
  return {
   node_id:id, node_exists:!!node,
   promotion_truth_source_count:sourceIds.length,
   source_rights_eligible_for_existing_promotion_check:sourcesValid,
   teaching_core_present:!!node?.teaching_content?.core_explanation,
   quantitative_method_count:node?.quantitative_content?.methods?.length??0,
   changed_since_last_assurance:candidate.changedSinceAssurance?.includes(id)??false,
   educational_depth_for_edexcel:'NOT_REVIEWED'
  };
 });
 requireTruth(nodeEvidence.every(x=>x.node_exists&&x.teaching_core_present),
  'candidate_teaching_evidence_missing');
 const sampled=lines.filter(x=>REVIEW_SET.includes(x.id)).map(row=>({
  requirement_id:row.id,candidate_node_ids:row.candidate_subject_node_ids,
  candidate_link_count:row.candidate_subject_node_ids.length,
  evidence_review_status:'NOT_YET_INDEPENDENTLY_ASSESSED',
  possible_depth_gap:row.triage==='DEPTH_OR_SUBJECT_GAP_INVESTIGATION',
  qualification_specific_coverage:'UNDETERMINED'
 }));
 requireTruth(sampled.length===REVIEW_SET.length
  && sampled.every((x,i)=>x.requirement_id===REVIEW_SET[i]),
  'critical_edexcel_market_requirements_not_explicitly_reconciled');
 return {
  audit_status:problems.length?'FAIL':'PASS',problems,
  foundation_candidate_version:candidateVersion,
  foundation_candidate_fingerprint:fingerprint,
  foundation_candidate_nodes:nodes.size,
  foundation_promotion_decision:candidate?.matrix?.policy?.promotion_decision??null,
  effective_candidate_unreviewed_changed_nodes:candidate?.changedSinceAssurance?.length??null,
  edexcel_lettered_references:lines.length,
  references_with_candidate_node_ids:lines.filter(r=>r.candidate_subject_node_ids?.length).length,
  references_without_candidate_node_ids:lines.filter(r=>r.candidate_subject_node_ids?.length===0).map(r=>r.id),
  distinct_candidate_nodes_in_first_slice:candidateNodeIds.length,
  node_evidence:nodeEvidence,
  focused_market_requirements:sampled,
  independently_accepted_reuse_count:null,
  measured_reuse_percent:null,
  rights_clearance_for_new_generation:false,
  exact_course_truth_approved:false,
  original_learner_assets_generated:0,
  provider_calls_this_audit:0,
  production_decision:'HOLD',
  publication_eligible:false
 };
}
export async function runEdexcelV08ReuseAudit(){
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 return auditEdexcelV08Reuse(await loadBusinessSubjectFoundationCandidate(),read(firstSlicePath),read(intakePath));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await runEdexcelV08ReuseAudit();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.audit_status!=='PASS')process.exitCode=1;
}
