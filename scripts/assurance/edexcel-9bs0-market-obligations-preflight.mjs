import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const obligationsPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-provisional-obligations.json');
export const sourceIndexPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-theme1-identifier-index.json');
export const firstSlicePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-first-slice-review.json');

const counts=[
 ['1.2.1:a/1',2],['1.2.1:a/2',1],['1.2.1:a/3',1],['1.2.1:a/4',1],
 ['1.2.1:a/5',1],['1.2.1:a/6',1],['1.2.1:a/7',1],
 ['1.2.2:a/1',1],['1.2.2:a/2',1],['1.2.2:a/3',1],['1.2.2:a/4',1],
 ['1.2.2:a/5',1],['1.2.3:a',1],['1.2.3:b',2],
 ['1.2.4:a',1],['1.2.4:b',1],['1.2.4:c',1],['1.2.4:d',1],['1.2.4:e',2],
 ['1.2.5:a',1],['1.2.5:b',1],['1.2.5:c',1],['1.2.5:d',1]
];
const expectedCapabilities=[
 'causal_explanation','causal_explanation','causal_explanation','causal_explanation',
 'causal_explanation','causal_explanation','causal_explanation','causal_explanation',
 'causal_explanation','causal_explanation','causal_explanation','causal_explanation',
 'causal_explanation','causal_explanation','graph_construction','graph_interpretation',
 'quantitative_calculation','quantitative_interpretation','causal_explanation',
 'decision_application','quantitative_calculation','quantitative_interpretation',
 'quantitative_calculation','quantitative_interpretation','causal_explanation','decision_application'
];
const tags=[
 'substitute-price-shift','complement-price-shift','income-driven-demand',
 'preference-driven-demand','marketing-demand-impact','population-driven-demand',
 'disruption-driven-demand','seasonal-demand','production-cost-supply',
 'technology-supply','indirect-tax-supply','subsidy-supply','supply-disruption',
 'price-equilibrium','supply-demand-diagram-construct','supply-demand-diagram-explain',
 'ped-compute','ped-interpret','ped-determinants','ped-pricing-application',
 'ped-revenue-arithmetic','ped-revenue-judgement','yed-compute','yed-interpret',
 'yed-determinants','yed-business-application'
];

export function checkEdexcelMarketObligations(document,index,firstSlice,foundation){
 const errors=[];const check=(valid,reason)=>{if(!valid)errors.push(reason)};
 const nodes=foundation?.nodes instanceof Map?foundation.nodes:new Map();
 const sourceRows=(index?.terminal_reference_ids??[]).filter(r=>r.id.startsWith('1.2.'));
 const firstSliceById=new Map((firstSlice?.lettered_obligations??[]).map(r=>[r.id,r]));
 const sourceIds=counts.map(x=>x[0]);
 const expectedRowIds=counts.flatMap(([,n],i)=>
  Array.from({length:n},(_,j)=>'EDX-9BS0-MKT-'+String(i+1).padStart(2,'0')+(n>1?String.fromCharCode(65+j):'')));
 const rows=document?.obligations??[];
 check(document?.schema_version==='edexcel-9bs0-market-atomicity-pilot-v1'
  && document?.source_use==='REFERENCE_ONLY'
  && document?.rights_basis==='FACTUAL_ALIGNMENT_ONLY'
  && document?.source_prose_stored_or_sent_to_generation===false
  && document?.current_research_boundary==='UNAPPROVED_SPECIFICATION_ALIGNMENT_ONLY',
  'reference_only_source_or_identity_violation');
 check(document?.educational_denominator_status==='PROVISIONAL_SKILL_DECOMPOSITION_NOT_INDEPENDENTLY_CERTIFIED_ATOMIC'
  && document?.qualified_subject_review==='PENDING'
  && document?.approved_course_truth===false
  && document?.approved_exam_truth===false
  && document?.production_permission===false
  && document?.publication_permission===false
  && document?.reuse_count_confirmed===null && document?.reuse_percentage_confirmed===null
  && document?.asset_production_count===0 && document?.provider_calls===0,
  'unearned_atomicity_reuse_or_publication_approval');
 check(foundation?.index?.candidate_version==='v0.8-t8-exact-course-remediation'
  && foundation?.index?.status==='t8_exact_course_remediation_awaiting_fresh_reassurance'
  && foundation?.matrix?.policy?.promotion_decision==='NOT_YET_MADE'
  && nodes.size===81 && document?.candidate_foundation_version===foundation.index.candidate_version
  && document?.candidate_foundation_fingerprint==='RESOLVED_AT_RUNTIME_NOT_APPROVAL',
  'effective_foundation_incorrect_or_prematurely_promoted');
 check(sourceRows.length===23
  && JSON.stringify(sourceRows.map(x=>x.id))===JSON.stringify(sourceIds)
  && sourceRows.every(x=>x.source_pdf_page_zero_based===18),
  'official_market_source_reference_index_drift');
 check(document?.source_terminal_reference_count===23
  && document?.provisional_learning_obligation_count===26
  && rows.length===26 && JSON.stringify(rows.map(x=>x.id))===JSON.stringify(expectedRowIds)
  && JSON.stringify(rows.map(x=>x.original_skill_tag))===JSON.stringify(tags)
  && JSON.stringify(rows.map(x=>x.competency_type))===JSON.stringify(expectedCapabilities),
  'provisional_skill_inventory_incomplete_or_mutated');
 const expectedRefSequence=counts.flatMap(([id,n])=>Array(n).fill(id));
 check(rows.every((x,i)=>x.source_reference_id===expectedRefSequence[i]
  && x.candidate_link_status==='HYPOTHESIS_NOT_EVIDENCE_OF_SUFFICIENCY'
  && x.atomicity_status==='PROVISIONAL_PENDING_EDUCATIONAL_DECOMPOSITION_REVIEW'
  && x.qualified_human_reuse_decision==='UNREVIEWED'
  && x.asset_generation_status==='NOT_STARTED'
  && Array.isArray(x.required_evidence)
  && x.required_evidence.includes('independent_review')
  && x.required_evidence.includes('learner_practice_validity')
  && (x.competency_type==='quantitative_calculation'
    ? x.required_evidence.includes('calculation_and_worked_example'):true)
  && (x.competency_type.startsWith('graph')
    ? x.required_evidence.includes('draw_and_read_correctness'):true)),
  'educational_requirement_evidence_or_source_identity_invalid');
 check(rows.every(x=>{
   const parent=x.source_reference_id.split(':')[0]+':'+x.source_reference_id.split(':')[1][0];
   const original=firstSliceById.get(parent);
   const linked=x.candidate_subject_node_ids??[];
   return !!original && Array.isArray(linked)
    && new Set(linked).size===linked.length
    && linked.every(id=>nodes.has(id)&&original.candidate_subject_node_ids.includes(id));
 }), 'node_mapping_not_in_original_first_slice_or_effective_foundation');
 const diagrams=rows.filter(x=>x.competency_type.startsWith('graph'));
 check(diagrams.length===2 && diagrams.every(x=>x.candidate_subject_node_ids.length===0),
  'unverified_diagram_reuse_falsely_asserted');
 const sourceCount=new Set(rows.map(r=>r.source_reference_id)).size;
 return {structural_status:errors.length?'FAIL':'PASS',errors,
  official_source_reference_count:sourceRows.length,
  mapped_source_reference_count:sourceCount,
  provisional_skills:rows.length,
  provisional_skills_with_candidate_links:rows.filter(x=>x.candidate_subject_node_ids.length).length,
  unlinked_skill_ids:rows.filter(x=>!x.candidate_subject_node_ids.length).map(x=>x.id),
  candidate_version:foundation?.index?.candidate_version??null,
  candidate_fingerprint:foundation?.fingerprint??null,
  accepted_reuse_percent:null,independent_educational_acceptance:false,
  permitted_generation:false,publication_eligible:false,production_decision:'HOLD'};
}
export async function runEdexcelMarketAudit(){
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 return checkEdexcelMarketObligations(read(obligationsPath),read(sourceIndexPath),read(firstSlicePath),await loadBusinessSubjectFoundationCandidate());
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await runEdexcelMarketAudit();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.structural_status!=='PASS')process.exitCode=1;
}
