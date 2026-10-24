import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const triagePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-reuse-triage.json');
export const obligationsPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-provisional-obligations.json');
const expectedFingerprint='0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241';
const expectedCounts={REUSE_SUFFICIENT:10,EXPAND_SUBJECT_NODE:8,ADD_SUBJECT_NODE:8};
const GROUP={};
for(let i=0;i<8;i++)GROUP['EDX-9BS0-MKT-'+(['01A','01B','02','03','04','05','06','07'][i])]='EXPAND_SUBJECT_NODE';
for(let i=8;i<16;i++)GROUP['EDX-9BS0-MKT-'+(['08','09','10','11','12','13','14A','14B'][i-8])]='ADD_SUBJECT_NODE';
for(let i=16;i<26;i++)GROUP['EDX-9BS0-MKT-'+(['15','16','17','18','19A','19B','20','21','22','23'][i-16])]='REUSE_SUFFICIENT';

function equilibrium(demand,supply){
 const denom=demand.price_coefficient-supply.price_coefficient;
 if(!Number.isFinite(denom)||denom===0)throw new Error('parallel_market_curves');
 const price=(supply.intercept-demand.intercept)/denom;
 return {price,quantity:demand.intercept+demand.price_coefficient*price};
}
function direction(value,baseline){return value>baseline?'UP':value<baseline?'DOWN':'UNCHANGED';}
export function verifySyntheticMarketDiagnostic(diagnostic){
 const failures=[];const check=(ok,reason)=>{if(!ok)failures.push(reason)};
 check(diagnostic?.status==='ASSURANCE_DIAGNOSTIC_NOT_STUDENT_QUESTION'
  && diagnostic?.price_axis==='vertical'
  && diagnostic?.quantity_axis==='horizontal'
  && diagnostic?.function_contract==='quantity = intercept + price_coefficient * price'
  && diagnostic?.limitation?.includes('no reviewer has approved'), 'synthetic_model_not_marked_research');
 const base=diagnostic?.baseline;
 const eq=base?equilibrium(base.demand,base.supply):null;
 check(eq?.price===20&&eq?.quantity===40&&JSON.stringify(eq)===JSON.stringify(base?.expected_equilibrium),
  'baseline_equilibrium_incorrect');
 check((diagnostic?.scenarios??[]).length===2,'incorrect_scenario_count');
 for(const [i,scenario] of (diagnostic?.scenarios??[]).entries()){
   const result=equilibrium(scenario.demand,scenario.supply);
   check(JSON.stringify(result)===JSON.stringify(scenario.expected_equilibrium),
     'scenario_equilibrium_incorrect:'+i);
   check(direction(result.price,eq.price)===scenario.expected_effect?.price
     && direction(result.quantity,eq.quantity)===scenario.expected_effect?.quantity,
     'scenario_direction_incorrect:'+i);
   if(i===0)check(scenario.curve_changed==='supply'&&scenario.cause==='rising_input_cost'
     && scenario.expected_effect.shift==='SUPPLY_LEFT'
     && JSON.stringify(scenario.demand)===JSON.stringify(base.demand)
     && scenario.supply.intercept<base.supply.intercept,
     'supply_shift_not_distinguished_from_movement');
   if(i===1)check(scenario.curve_changed==='demand'&&scenario.cause==='growing_customer_preference'
     && scenario.expected_effect.shift==='DEMAND_RIGHT'
     && JSON.stringify(scenario.supply)===JSON.stringify(base.supply)
     && scenario.demand.intercept>base.demand.intercept,
     'demand_shift_not_distinguished_from_movement');
 }
 return failures;
}
export function checkEdexcelMarketTriage(triage,requirements,foundation){
 const failures=[];const check=(ok,reason)=>{if(!ok)failures.push(reason)};
 const items=triage?.provisional_classifications??[];
 const original=requirements?.obligations??[];
 const cand=foundation?.nodes instanceof Map?foundation.nodes:new Map();
 check(triage?.schema_version==='edexcel-9bs0-market-review-triage-v1'
  && triage?.status==='PROPOSED_DECISIONS_UNREVIEWED_NOT_GENERATION_INPUT'
  && triage?.official_source_id==='PEARSON-SPEC-9BS0-2014-I1'
  && triage?.source_rights==='REFERENCE_ONLY'
  && triage?.source_pdf_page_zero_based===18
  && triage?.qualification_code==='9BS0',
  'source_or_qualification_rights_boundary_changed');
 check(triage?.business_subject_candidate_version==='v0.8-t8-exact-course-remediation'
  && foundation?.index?.candidate_version===triage?.business_subject_candidate_version
  && foundation?.index?.status==='t8_exact_course_remediation_awaiting_fresh_reassurance'
  && foundation?.matrix?.policy?.promotion_decision==='NOT_YET_MADE'
  && triage?.promotion_state==='NOT_YET_MADE'
  && cand.size===81 && foundation?.fingerprint===expectedFingerprint
  && triage?.business_subject_candidate_fingerprint===expectedFingerprint,
  'foundation_version_fingerprint_or_promotion_changed');
 const source=triage?.existing_registered_external_subject_truth_source??{};
 const sourceRecord=foundation?.sourceById?.get(source.source_id);
 check(source.source_id==='SRC-OER-LOUIS-MICRO-2024'
  && sourceRecord?.licence_profile==='CC_BY_4_0'
  && sourceRecord?.promotion_eligible===true
  && source.recorded_licence_profile==='CC_BY_4_0'
  && source.source_use_review==='APPROVED_FOR_EXISTING_PROMOTION_CONTEXT_NOT_YET_APPROVED_FOR_NEW_NODE_OUTPUT'
  && source.commercial_redistribution_and_ai_rights_review==='REQUIRES_OPERATION_SPECIFIC_RECORD_FOR_NEW_CONTENT',
  'candidate_source_permission_not_verified');
 const model=triage?.proposed_shared_subject_node;
 check(model?.new_node_id_allocated===false && model?.normative_change_approved===false
  && model?.version_created===false && model?.generation_allowed===false
  && model?.source_text_reproduction_allowed===false && model?.review_status==='UNREVIEWED'
  && model?.teaching_facet_design?.includes('graph_axes_and_curve_labels')
  && model?.teaching_facet_design?.includes('movement_along_vs_shift'),
  'proposed_shared_model_unreviewed_boundary_lost');
 check(requirements?.source_use==='REFERENCE_ONLY'
  && requirements?.reuse_count_confirmed===null
  && requirements?.publication_permission===false
  && original.length===26&&items.length===26,
  'market_pilot_scope_or_approval_changed');
 const totals={REUSE_SUFFICIENT:0,EXPAND_SUBJECT_NODE:0,ADD_SUBJECT_NODE:0};
 for(let i=0;i<items.length;i++){
  const row=items[i],skill=original[i];if(!row||!skill)continue;
  const proposed=GROUP[skill.id];
  check(row.requirement_id===skill.id && row.skill_tag===skill.original_skill_tag
   && row.source_reference_id===skill.source_reference_id
   && row.proposed_resolution===proposed
   && JSON.stringify(row.existing_candidate_node_ids)===JSON.stringify(skill.candidate_subject_node_ids)
   && row.proposed_not_approved===true
   && row.independent_educational_decision==='PENDING'
   && row.source_accuracy_review==='NOT_DONE'
   && row.depth_review==='NOT_DONE'
   && row.working_and_evaluation_review==='NOT_DONE'
   && row.learner_evidence_validity_review==='NOT_DONE'
   && row.rights_review_for_candidate_expansion==='NOT_DONE'
   && row.review_outcome==='HOLD'
   && Array.isArray(row.required_reviews) && row.required_reviews.length>=3,
   'individual_educational_review_or_scope_incorrect:'+skill.id);
  check((row.existing_candidate_node_ids??[]).every(id=>cand.has(id)),
   'unrecognised_reusable_node:'+skill.id);
  if(proposed)totals[proposed]++;
 }
 check(Object.keys(expectedCounts).every(key=>totals[key]===expectedCounts[key]
   && triage?.classification_counts?.[key]===expectedCounts[key]),
  'triage_groups_or_counts_corrupted');
 const mkt=cand.get('BUS-MKT-008');
 for(const token of ['PED','YED']){
  check((mkt?.quantitative_content?.methods??[]).some(method=>
    method.name===token
    && typeof method.formula==='string' && method.formula.includes('/')
    && !!method.worked_example && !!method.interpretation),
    'existing_elasticity_method_evidence_missing:'+token);
 }
 check(triage?.independent_reuse_accepted_count===null
  && triage?.independent_reuse_accepted_percentage===null
  && triage?.approved_foundation_candidate===false
  && triage?.qualified_subject_reviewer_signed_off===false
  && triage?.original_learner_assets_produced===0
  && triage?.provider_calls===0 && triage?.provider_spend_usd===0
  && triage?.decision_state==='HOLD',
  'incorrect_final_review_or_publication_state');
 failures.push(...verifySyntheticMarketDiagnostic(triage?.diagnostic));
 return {status:failures.length?'FAIL':'PASS',failures,
  source_skill_count:items.length,
  proposed_candidates:totals,
  live_foundation_fingerprint:foundation?.fingerprint??null,
  evidence_verified_elasticity_methods:['PED','YED'],
  independently_approved_reuse:null,educational_approval:false,
  original_diagnostic_valid:verifySyntheticMarketDiagnostic(triage?.diagnostic).length===0,
  publication_eligible:false,production_decision:'HOLD'};
}
export async function runEdexcelMarketTriage(){
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 return checkEdexcelMarketTriage(read(triagePath),read(obligationsPath),await loadBusinessSubjectFoundationCandidate());
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await runEdexcelMarketTriage();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='PASS')process.exitCode=1;
}
