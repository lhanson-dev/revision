import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const candidatePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json');
export const triagePath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-reuse-triage.json');
const SHA='0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241';
const expectedIds=['08','09','10','11','12','13','14A','14B'].map(x=>'EDX-9BS0-MKT-'+x);
const sourceId='SRC-OER-LOUIS-MICRO-2024';
export function quantity(curve,price){return curve.quantity_intercept+curve.price_coefficient*price;}
export function equilibrium(demand,supply){
 const slope=demand.price_coefficient-supply.price_coefficient;
 if(!Number.isFinite(slope)||slope===0)throw Error('invalid_or_parallel_curves');
 const price=(supply.quantity_intercept-demand.quantity_intercept)/slope;
 return {price,quantity:quantity(demand,price)};
}
const direction=(change)=>change>0?'UP':change<0?'DOWN':'UNCHANGED';
const validTexts=(vals)=>Array.isArray(vals)&&vals.length>0&&vals.every(v=>typeof v==='string'&&v.trim().length>18);
export function checkSharedMarketDraft(draft,triage,foundation){
 const errors=[];const check=(predicate,code)=>{if(!predicate)errors.push(code);};
 const content=draft?.teaching_content??{};
 const caseData=draft?.original_numeric_case??{};
 const src=draft?.source_provenance??{};
 const registered=foundation?.sourceById?.get(sourceId);
 check(draft?.schema_version===1&&draft?.artifact_type==='subject_knowledge_foundation_node_candidate'
  && draft?.lifecycle==='RESEARCH_DRAFT_REQUIRES_INDEPENDENT_REVIEW'
  && draft?.proposed_stable_node_id==='BUS-MKT-010'
  && draft?.proposed_node_id_assigned===false
  && draft?.reusable_across_boards===true,
  'candidate_identity_or_premature_node_allocation');
 check(draft?.foundation_dependency?.fingerprint===SHA
  && draft?.foundation_dependency?.node_count===81
  && draft?.foundation_dependency?.promotion_decision==='NOT_YET_MADE'
  && draft?.foundation_dependency?.effective_nodes_modified===false
  && foundation?.fingerprint===SHA
  && foundation?.index?.candidate_version==='v0.8-t8-exact-course-remediation'
  && foundation?.index?.status==='t8_exact_course_remediation_awaiting_fresh_reassurance'
  && foundation?.matrix?.policy?.promotion_decision==='NOT_YET_MADE'
  && foundation?.nodes?.size===81
  && !foundation?.nodes?.has('BUS-MKT-010'),
  'foundation_identity_or_promotion_not_verified');
 check(src.source_id===sourceId&&registered?.promotion_eligible===true
  && registered?.licence_profile==='CC_BY_4_0'
  && src.source_licence_url==='https://creativecommons.org/licenses/by/4.0/'
  && src.licence_visible_on_book_and_chapter==='CC BY 4.0 except where otherwise noted'
  && src.new_generation_operation_rights_signoff==='PENDING'
  && src.pearson_prose_sent_to_generation===false
  && src.board_alignment_rights==='REFERENCE_ONLY'
  && src.teaching_wording==='REVISION_ORIGINAL'
  && src.teaching_diagrams==='REVISION_ORIGINAL_DATA_ONLY'
  && src.citation_required_on_eventual_reuse===true
  && src.excluded_material?.includes('third_party_graphics'),
  'rights_provenance_or_attribution_missing');
 check(validTexts(draft?.learning_outcomes)&&draft.learning_outcomes.length===6
  && typeof content.core_explanation==='string'&&content.core_explanation.length>300
  && validTexts(content.definitions)&&content.definitions.length>=7
  && validTexts(content.mechanisms)&&content.mechanisms.length>=6
  && validTexts(content.boundaries)&&content.boundaries.length>=5
  && Array.isArray(content.misconceptions)&&content.misconceptions.length>=5
  && content.misconceptions.every(v=>typeof v.incorrect==='string'&&v.incorrect.length>15
   &&typeof v.correction==='string'&&v.correction.length>40),
  'original_subject_teaching_incomplete');
 const axes=content.graph_contract??{};
 check(axes.horizontal_axis==='Quantity (units per period)'
  && axes.vertical_axis==='Price (currency per unit)'
  && axes.label_required?.includes('D0')
  && axes.label_required?.includes('S0')
  && axes.label_required?.includes('P0')
  && axes.label_required?.includes('Q0')
  && axes.shift_curves?.includes('D1')&&axes.shift_curves?.includes('S1')
  && axes.mark_both_price_and_quantity_at_equilibria===true
  && axes.explain_curve_movement_vs_shift===true,
  'graphical_contract_or_axis_incorrect');
 check(JSON.stringify(content.prerequisites)===JSON.stringify(['BUS-MKT-001','BUS-MKT-008'])
  && content.prerequisites.every(id=>foundation?.nodes?.has(id))
  && draft?.exact_course_impact?.aqa_mapping_changes===0
  && draft?.exact_course_impact?.existing_assured_node_content_modified===false
  && JSON.stringify(draft?.exact_course_impact?.edexcel_requirement_ids)===JSON.stringify(expectedIds),
  'dependency_and_eight_edexcel_skills_unresolved');
 const proposed=triage?.provisional_classifications??[];
 check(proposed.filter(x=>x.proposed_resolution==='ADD_SUBJECT_NODE').length===8
  && expectedIds.every(id=>proposed.some(x=>x.requirement_id===id
   && x.proposed_resolution==='ADD_SUBJECT_NODE'
   && x.independent_educational_decision==='PENDING'))
  && triage?.business_subject_candidate_fingerprint===SHA
  && triage?.independent_reuse_accepted_count===null,
  'triage_dependency_or_unearned_reuse_changed');
 check(caseData.id==='REV-SD-CASE-01'&&caseData.rights==='REVISION_ORIGINAL_SYNTHETIC'
  && caseData.units?.price==='GBP per pack'
  && caseData.units?.quantity==='packs per week'
  && (caseData.demonstration_steps??[]).length===6,
  'original_case_identity_or_unit_convention_wrong');
 const base=caseData.demand&&caseData.supply?equilibrium(caseData.demand,caseData.supply):null;
 check(base?.price===20&&base?.quantity===40&&JSON.stringify(base)===JSON.stringify(caseData.baseline)
  && caseData.demand?.price_coefficient<0&&caseData.supply?.price_coefficient>0,
  'base_market_model_incorrect');
 check(caseData.original_scenarios?.length===2,'market_shock_scenarios_incomplete');
 for(const [i,s] of (caseData.original_scenarios??[]).entries()){
  const actual=equilibrium(s.demand,s.supply);
  check(JSON.stringify(actual)===JSON.stringify(s.result)
   && direction(actual.price-base.price)===s.expected_direction?.price
   && direction(actual.quantity-base.quantity)===s.expected_direction?.quantity,
   'shock_equilibrium_or_direction_incorrect:'+i);
  if(i===0)check(s.shift==='SUPPLY_LEFT'&&s.changed_curve==='S1'
   && s.demand.quantity_intercept===caseData.demand.quantity_intercept
   && s.demand.price_coefficient===caseData.demand.price_coefficient
   && quantity(s.supply,20)<quantity(caseData.supply,20),
   'cost_shock_must_shift_supply_not_demand');
  if(i===1)check(s.shift==='DEMAND_RIGHT'&&s.changed_curve==='D1'
   && s.supply.quantity_intercept===caseData.supply.quantity_intercept
   && s.supply.price_coefficient===caseData.supply.price_coefficient
   && quantity(s.demand,20)>quantity(caseData.demand,20),
   'preference_shock_must_shift_demand_not_supply');
 }
 check(caseData.off_equilibrium?.length===2,'missing_market_disequilibrium_checks');
 for(const [i,point] of (caseData.off_equilibrium??[]).entries()){
  const d=quantity(caseData.demand,point.price),s=quantity(caseData.supply,point.price);
  const type=d>s?'SHORTAGE':s>d?'SURPLUS':'BALANCE';
  check(point.quantity_demanded===d&&point.quantity_supplied===s
   && point.imbalance_type===type&&point.magnitude===Math.abs(d-s)
   && point.magnitude===20,'off_equilibrium_imbalance_incorrect:'+i);
 }
 const ev=draft?.expected_educational_evidence??{};
 check(ev.modes?.includes('construct_graph')&&ev.modes?.includes('interpret_graph')
  && ev.modes?.includes('evaluate_limitation')
  && ev.acceptance_tests?.length>=7
  && ev.human_review_status==='NOT_REVIEWED'
  && ev.fresh_independent_ai_review_status==='NOT_RUN'
  && ev.original_mark_scheme_created===false
  && ev.student_asset_produced===false
  && draft?.assurance?.subject_expert_review==='PENDING'
  && draft?.assurance?.rights_for_new_operation==='PENDING'
  && draft?.assurance?.exact_course_foundation_approved===false
  && draft?.assurance?.learner_content_approved===false
  && draft?.model_calls===0&&draft?.model_cost_usd===0
  && draft?.publication_decision==='HOLD',
  'teaching_exemplar_falsely_promoted_or_published');
 return {structure:errors.length?'FAIL':'PASS',errors,
  proposed_subject_node:draft?.proposed_stable_node_id,
  proposed_node_created:false,assessed_skill_ids:expectedIds,
  checked_original_scenarios:caseData?.original_scenarios?.length??0,
  reviewed_by_independent_subject_expert:false,
  learner_assets_generated:0,production_decision:'HOLD'};
}
export async function runSharedMarketDraftPreflight(){
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 return checkSharedMarketDraft(read(candidatePath),read(triagePath),await loadBusinessSubjectFoundationCandidate());
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=await runSharedMarketDraftPreflight();
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
 if(report.structure!=='PASS')process.exitCode=1;
}
