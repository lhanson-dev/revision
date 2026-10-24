import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {loadBusinessSubjectFoundationCandidate} from '../content-factory/load-business-subject-foundation-candidate-v08.mjs';
import {checkEdexcelMarketTriage,verifySyntheticMarketDiagnostic,triagePath,obligationsPath} from './edexcel-9bs0-market-reuse-triage.mjs';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const triage=read(triagePath),requirements=read(obligationsPath);
const foundation=await loadBusinessSubjectFoundationCandidate();
const mutate=change=>{const next=structuredClone(triage);change(next);return checkEdexcelMarketTriage(next,requirements,foundation);};

describe('Edexcel 9BS0 market reuse triage — provider free and unapproved',()=>{
 it('maps exactly 26 provisional skills into 8 expansion, 8 shared-model addition and 10 reused-method investigation proposals',()=>{
  const out=checkEdexcelMarketTriage(triage,requirements,foundation);
  expect(out).toMatchObject({status:'PASS',source_skill_count:26,
   proposed_candidates:{REUSE_SUFFICIENT:10,EXPAND_SUBJECT_NODE:8,ADD_SUBJECT_NODE:8},
   independently_approved_reuse:null,educational_approval:false,
   original_diagnostic_valid:true,publication_eligible:false,production_decision:'HOLD'});
  expect(out.live_foundation_fingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(out.evidence_verified_elasticity_methods).toEqual(['PED','YED']);
 });
 it('refuses a changed fingerprint or previously unapproved candidate promoted without review',()=>{
  const incorrect={...foundation,fingerprint:'0'.repeat(64)};
  expect(checkEdexcelMarketTriage(triage,requirements,incorrect).failures).toContain('foundation_version_fingerprint_or_promotion_changed');
  const approved={...foundation,matrix:{...foundation.matrix,policy:{...foundation.matrix.policy,promotion_decision:'APPROVED'}}};
  expect(checkEdexcelMarketTriage(triage,requirements,approved).failures).toContain('foundation_version_fingerprint_or_promotion_changed');
 });
 it('will not mistake a candidate node ID or a proposed resolution for independent educational assurance',()=>{
  expect(mutate(x=>x.provisional_classifications[0].independent_educational_decision='REUSE_SUFFICIENT').failures)
   .toContain('individual_educational_review_or_scope_incorrect:EDX-9BS0-MKT-01A');
  expect(mutate(x=>x.provisional_classifications[0].existing_candidate_node_ids=['BUS-UNKNOWN']).failures)
   .toContain('unrecognised_reusable_node:EDX-9BS0-MKT-01A');
  expect(mutate(x=>x.provisional_classifications[14].proposed_resolution='REUSE_SUFFICIENT').failures)
   .toContain('individual_educational_review_or_scope_incorrect:EDX-9BS0-MKT-14A');
 });
 it('rejects unlicensed new-node generation, inflated reuse and fabricated paid-work metrics',()=>{
  expect(mutate(x=>x.source_rights='OPEN').failures).toContain('source_or_qualification_rights_boundary_changed');
  expect(mutate(x=>x.existing_registered_external_subject_truth_source.source_use_review='APPROVED_NEW_NODE_GENERATION').failures)
   .toContain('candidate_source_permission_not_verified');
  expect(mutate(x=>x.proposed_shared_subject_node.generation_allowed=true).failures)
   .toContain('proposed_shared_model_unreviewed_boundary_lost');
  expect(mutate(x=>x.independent_reuse_accepted_percentage=75).failures)
   .toContain('incorrect_final_review_or_publication_state');
  expect(mutate(x=>x.provider_calls=1).failures)
   .toContain('incorrect_final_review_or_publication_state');
 });
 it('checks original demand/supply equilibrium diagnostic both before and after two shifts',()=>{
  expect(verifySyntheticMarketDiagnostic(triage.diagnostic)).toEqual([]);
  expect(mutate(x=>x.diagnostic.baseline.expected_equilibrium.price=19).failures)
   .toContain('baseline_equilibrium_incorrect');
  expect(mutate(x=>x.diagnostic.scenarios[0].expected_equilibrium.quantity=33).failures)
   .toContain('scenario_equilibrium_incorrect:0');
  expect(mutate(x=>x.diagnostic.scenarios[1].expected_effect.price='DOWN').failures)
   .toContain('scenario_direction_incorrect:1');
  expect(mutate(x=>x.diagnostic.scenarios[0].demand.intercept=125).failures)
   .toContain('supply_shift_not_distinguished_from_movement');
 });
 it('ensures formula evidence remains in live v0.8, not just a stale v0.2 heading',()=>{
  const wrong={...foundation,nodes:new Map(foundation.nodes)};
  const old=wrong.nodes.get('BUS-MKT-008');
  wrong.nodes.set('BUS-MKT-008',{...old,quantitative_content:{...old.quantitative_content,methods:[]}});
  const out=checkEdexcelMarketTriage(triage,requirements,wrong);
  expect(out.failures).toContain('existing_elasticity_method_evidence_missing:PED');
  expect(out.failures).toContain('existing_elasticity_method_evidence_missing:YED');
 });
});
