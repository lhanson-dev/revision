import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';
import {checkSharedMarketDraft,candidatePath,triagePath} from './edexcel-9bs0-shared-market-node-preflight.mjs';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const candidate=read(candidatePath),triage=read(triagePath),foundation=await loadBusinessSubjectFoundationCandidate();
const mutate=fn=>{
 const draft=structuredClone(candidate);fn(draft);
 return checkSharedMarketDraft(draft,triage,foundation);
};
describe('Stage 5 draft reusable market supply-demand subject node (not activated)',()=>{
 it('accepts the original maths and full review scaffold but keeps learner output blocked',()=>{
  const out=checkSharedMarketDraft(candidate,triage,foundation);
  expect(out).toMatchObject({structure:'PASS',proposed_subject_node:'BUS-MKT-010',
   proposed_node_created:false,checked_original_scenarios:2,
   reviewed_by_independent_subject_expert:false,learner_assets_generated:0,
   production_decision:'HOLD'});
  expect(out.assessed_skill_ids).toHaveLength(8);
 });
 it('cannot silently promote a research-only teaching draft into effective v0.8 or publication',()=>{
  expect(mutate(x=>x.proposed_node_id_assigned=true).errors).toContain('candidate_identity_or_premature_node_allocation');
  expect(mutate(x=>x.assurance.exact_course_foundation_approved=true).errors).toContain('teaching_exemplar_falsely_promoted_or_published');
  expect(mutate(x=>x.publication_decision='PASS').errors).toContain('teaching_exemplar_falsely_promoted_or_published');
  expect(mutate(x=>x.expected_educational_evidence.human_review_status='APPROVED').errors).toContain('teaching_exemplar_falsely_promoted_or_published');
 });
 it('rejects source copyright misclassification and missing attribution/review',()=>{
  expect(mutate(x=>x.source_provenance.board_alignment_rights='OPEN').errors).toContain('rights_provenance_or_attribution_missing');
  expect(mutate(x=>x.source_provenance.new_generation_operation_rights_signoff='CLEARED').errors).toContain('rights_provenance_or_attribution_missing');
  expect(mutate(x=>x.source_provenance.citation_required_on_eventual_reuse=false).errors).toContain('rights_provenance_or_attribution_missing');
 });
 it('rejects missing teaching, faulty diagram labels or AQA compatibility assumptions',()=>{
  expect(mutate(x=>x.teaching_content.mechanisms=[]).errors).toContain('original_subject_teaching_incomplete');
  expect(mutate(x=>x.teaching_content.graph_contract.vertical_axis='Quantity').errors).toContain('graphical_contract_or_axis_incorrect');
  expect(mutate(x=>x.exact_course_impact.edexcel_requirement_ids.pop()).errors).toContain('dependency_and_eight_edexcel_skills_unresolved');
  expect(mutate(x=>x.exact_course_impact.aqa_mapping_changes=1).errors).toContain('dependency_and_eight_edexcel_skills_unresolved');
 });
 it('finds wrong equilibrium maths, shift direction, and changes to supposedly fixed curves',()=>{
  expect(mutate(x=>x.original_numeric_case.baseline.price=21).errors).toContain('base_market_model_incorrect');
  expect(mutate(x=>x.original_numeric_case.original_scenarios[0].result.quantity=34).errors).toContain('shock_equilibrium_or_direction_incorrect:0');
  expect(mutate(x=>x.original_numeric_case.original_scenarios[0].demand.quantity_intercept=125).errors).toContain('cost_shock_must_shift_supply_not_demand');
  expect(mutate(x=>x.original_numeric_case.original_scenarios[1].supply.quantity_intercept=18).errors).toContain('preference_shock_must_shift_demand_not_supply');
  expect(mutate(x=>x.original_numeric_case.original_scenarios[1].expected_direction.price='DOWN').errors).toContain('shock_equilibrium_or_direction_incorrect:1');
 });
 it('detects incorrect shortage or surplus magnitudes at off-equilibrium prices',()=>{
  expect(mutate(x=>x.original_numeric_case.off_equilibrium[0].imbalance_type='SURPLUS').errors).toContain('off_equilibrium_imbalance_incorrect:0');
  expect(mutate(x=>x.original_numeric_case.off_equilibrium[1].quantity_supplied=42).errors).toContain('off_equilibrium_imbalance_incorrect:1');
 });
 it('refuses a different v0.8 effective Foundation fingerprint and unsafe mapping promotion',()=>{
  const stale={...foundation,fingerprint:'0'.repeat(64)};
  expect(checkSharedMarketDraft(candidate,triage,stale).errors).toContain('foundation_identity_or_promotion_not_verified');
  const promoted={...foundation,matrix:{...foundation.matrix,policy:{...foundation.matrix.policy,promotion_decision:'APPROVED'}}};
  expect(checkSharedMarketDraft(candidate,triage,promoted).errors).toContain('foundation_identity_or_promotion_not_verified');
  const fake=structuredClone(triage);
  fake.provisional_classifications[14].independent_educational_decision='APPROVED';
  expect(checkSharedMarketDraft(candidate,fake,foundation).errors).toContain('triage_dependency_or_unearned_reuse_changed');
 });
});
