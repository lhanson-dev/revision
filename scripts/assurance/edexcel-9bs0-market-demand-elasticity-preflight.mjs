import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const draftRel='research/content-production-repeatability/edexcel-9bs0-market-demand-elasticity-authoring-v1.json';
export const handoffRel='research/content-production-repeatability/edexcel-9bs0-market-gated-review-handoff.json';
const fixedHandoffBlob='21c58e9ceca1d2eef3608a68809ddfd41a258e15';
const checks=['15','18','19A','20'];
const approx=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-9;
const gitBlob=(rel)=>{const b=readFileSync(path.join(root,rel));
 return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');};

export function checkMarketAuthoringDraft(d,source,sourceDigest=gitBlob){
 const failures=[],assert=(ok,code)=>{if(!ok)failures.push(code);};
 const p=d?.provenance??{},scope=d?.review_boundary??{};
 const rows=d?.skill_specimens??[],sourceRows=source?.skill_decisions??[];
 const missing=sourceRows.filter(x=>x.authored_specimen_evidence==='NO_ORIGINAL_LEARN_PRACTICE_ASSESSMENT_SPECIMEN');
 assert(d?.schema_version==='edexcel-9bs0-market-demand-elasticity-candidate-v1'
  &&d?.record_type==='REVISION_OWNED_ORIGINAL_TEACHING_PRACTICE_RESEARCH_NOT_LEARNER_CONTENT'
  &&d?.qualification==='9BS0'&&d?.assessment_year===2027
  &&d?.recorded_at==='2026-10-25', 'research_identity');
 assert(p.official_specification_id==='PEARSON-SPEC-9BS0-2014-I1'
  &&p.official_pdf_page_zero_based===18
  &&p.official_use_class==='REFERENCE_ONLY'
  &&p.protected_pearson_source_text_ingested===false
  &&p.input_review_handoff_path===handoffRel
  &&p.input_review_handoff_git_blob===fixedHandoffBlob
  &&sourceDigest(handoffRel)===fixedHandoffBlob
  &&p.original_authoring===true&&p.external_provider_calls===0&&p.provider_cost_usd===0, 'source_and_rights_fingerprint');
 assert(scope.distinct_existing_supply_or_graph_specimens===8
  &&scope.new_original_teaching_and_practice_skill_specimens===18
  &&scope.fully_assessed_student_drawing_skill===false
  &&scope.source_rights_operation_cleared===false
  &&scope.all_26_skills_independently_accepted===false
  &&scope.independent_educational_review==='NOT_PERFORMED'
  &&scope.approved_course_truth===false&&scope.approved_exam_truth===false
  &&scope.ai_assured===false&&scope.qualified_human_approved===false
  &&scope.learner_adapter_integrated===false&&scope.student_evidence_allowed===false
  &&scope.publication==='HOLD'&&scope.numerical_exam_marks_allocated===false
  &&scope.learner_marking_rubrics_approved===false, 'false_foundation_review_or_publication');
 assert(Array.isArray(rows)&&rows.length===18&&missing.length===18
  &&rows.every((row,i)=>row.skill_id===missing[i]?.skill_id
    &&row.source_reference_id===missing[i]?.official_reference_identifier
    &&row.original_semantic_tag===missing[i]?.original_semantic_tag
    &&row.family===(i<8?'DEMAND':'ELASTICITY'))
  &&new Set(rows.map(x=>x.skill_id)).size===18, 'coverage_or_source_mapping');
 assert(rows.every(row=>typeof row.original_case==='string'&&row.original_case.length>=75
  &&typeof row.teaching_note==='string'&&row.teaching_note.length>=90
  &&typeof row.original_practice_prompt==='string'&&row.original_practice_prompt.length>=45
  &&typeof row.unscored_expected_reasoning==='string'
  &&row.unscored_expected_reasoning===row.teaching_note
  &&typeof row.misconception_to_challenge==='string'&&row.misconception_to_challenge.length>=65
  &&['contextual_explanation','calculation_and_interpretation','calculation_and_explanation'].includes(row.performance_mode)
  &&row.external_review==='NOT_PERFORMED'
  &&row.authoring_status==='REVISION_ORIGINAL_RESEARCH_ONLY_NOT_ASSET'
  &&!Object.hasOwn(row,'numeric_mark')
  &&!Object.hasOwn(row,'student_mastery_claim')), 'original_teaching_question_and_no_marks');
 assert(new Set(rows.map(row=>row.original_case)).size===18
  &&new Set(rows.map(row=>row.original_practice_prompt)).size===18, 'non_unique_original_stimulus');

 const mathematical=rows.filter(row=>row.independent_calculation_contract);
 assert(mathematical.map(row=>row.skill_id).join('|')===
  checks.map(id=>'EDX-9BS0-MKT-'+id).join('|'), 'missing_or_extra_numeric_family');
 for(const row of mathematical){
  const c=row.independent_calculation_contract;
  const mode=c?.formula;
  if(mode==='PED_INITIAL_BASE'){
   const pctQ=(c.final_quantity-c.initial_quantity)/c.initial_quantity;
   const pctP=(c.final_price-c.initial_price)/c.initial_price;
   assert(c.initial_quantity>0&&c.initial_price>0&&c.final_price>0&&c.final_quantity>=0
    &&!approx(pctP,0)&&approx(pctQ/pctP,c.expected), 'ped_arithmetic:'+row.skill_id);
  }else if(mode==='YED_INITIAL_BASE'){
   const pctQ=(c.final_quantity-c.initial_quantity)/c.initial_quantity;
   const pctI=(c.final_income-c.initial_income)/c.initial_income;
   assert(c.initial_quantity>0&&c.initial_income>0&&c.final_income>0&&c.final_quantity>=0
    &&!approx(pctI,0)&&approx(pctQ/pctI,c.expected), 'yed_arithmetic:'+row.skill_id);
  }else if(mode!=='REVENUE_ARITHMETIC')assert(false,'unknown_math_contract:'+row.skill_id);
  if(mode==='REVENUE_ARITHMETIC'||row.skill_id==='EDX-9BS0-MKT-18'){
   const first=c.initial_price*c.initial_quantity,last=c.final_price*c.final_quantity;
   assert(approx(first,c.expected_initial_revenue)&&approx(last,c.expected_final_revenue)
    &&(mode!=='REVENUE_ARITHMETIC'||approx(last-first,c.expected_revenue_delta)),
    'revenue_arithmetic:'+row.skill_id);
  }
 }
 return {structural_status:failures.length?'FAIL':'PASS',failures,original_candidate_skill_count:rows.length,
  unverified_drawing_skill_count:1,independently_approved_skill_count:0,
  actual_learner_assets:0,provider_spend_usd:0,production_decision:'HOLD'};
}
export function runMarketAuthoringDraft(){
 const d=JSON.parse(readFileSync(path.join(root,draftRel),'utf8'));
 const s=JSON.parse(readFileSync(path.join(root,handoffRel),'utf8'));
 return checkMarketAuthoringDraft(d,s);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=runMarketAuthoringDraft();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.structural_status!=='PASS')process.exitCode=1;
}
