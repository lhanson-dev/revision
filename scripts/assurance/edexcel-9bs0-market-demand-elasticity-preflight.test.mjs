import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runMarketAuthoringDraft,checkMarketAuthoringDraft} from './edexcel-9bs0-market-demand-elasticity-preflight.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const draft=JSON.parse(readFileSync(path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-demand-elasticity-authoring-v1.json'),'utf8'));
const source=JSON.parse(readFileSync(path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-gated-review-handoff.json'),'utf8'));
const blob=draft.provenance.input_review_handoff_git_blob;
const mutate=fn=>{const d=structuredClone(draft);fn(d);return checkMarketAuthoringDraft(d,source,()=>blob).failures;};
const byId=id=>draft.skill_specimens.find(x=>x.skill_id==='EDX-9BS0-MKT-'+id);

describe('Edexcel Market 1.2 missing demand and elasticity research examples',()=>{
 it('safely covers the previously un-authored demand and elasticity skill set',()=>{
  expect(runMarketAuthoringDraft()).toEqual({
   structural_status:'PASS',failures:[],original_candidate_skill_count:18,
   unverified_drawing_skill_count:1,independently_approved_skill_count:0,
   actual_learner_assets:0,provider_spend_usd:0,production_decision:'HOLD'
  });
  expect(draft.skill_specimens.slice(0,8).every(x=>x.family==='DEMAND')).toBe(true);
  expect(draft.skill_specimens.slice(8).every(x=>x.family==='ELASTICITY')).toBe(true);
 });
 it('checks original PED, revenue and YED worked examples, including real negative tests',()=>{
  expect(byId('15').independent_calculation_contract.expected).toBe(-1.5);
  expect(byId('18').independent_calculation_contract.expected_final_revenue).toBe(1125);
  expect(byId('19A').independent_calculation_contract.expected_revenue_delta).toBe(25);
  expect(byId('20').independent_calculation_contract.expected).toBe(2);
  expect(mutate(x=>x.skill_specimens[8].independent_calculation_contract.expected=-1.2))
   .toContain('ped_arithmetic:EDX-9BS0-MKT-15');
  expect(mutate(x=>x.skill_specimens[11].independent_calculation_contract.expected_final_revenue=1000))
   .toContain('revenue_arithmetic:EDX-9BS0-MKT-18');
  expect(mutate(x=>x.skill_specimens[12].independent_calculation_contract.final_quantity=90))
   .toContain('revenue_arithmetic:EDX-9BS0-MKT-19A');
  expect(mutate(x=>x.skill_specimens[14].independent_calculation_contract.expected=-2))
   .toContain('yed_arithmetic:EDX-9BS0-MKT-20');
 });
 it('does not permit a dropped, renamed, duplicated or misattributed requirement',()=>{
  expect(mutate(x=>x.skill_specimens.pop())).toContain('coverage_or_source_mapping');
  expect(mutate(x=>x.skill_specimens[0].source_reference_id='1.2.2:a/1'))
   .toContain('coverage_or_source_mapping');
  expect(mutate(x=>x.skill_specimens[1].skill_id=x.skill_specimens[0].skill_id))
   .toContain('coverage_or_source_mapping');
  expect(mutate(x=>x.skill_specimens[2].family='SUPPLY_MARKET'))
   .toContain('coverage_or_source_mapping');
  expect(mutate(x=>x.provenance.input_review_handoff_git_blob='a'.repeat(40)))
   .toContain('source_and_rights_fingerprint');
 });
 it('rejects missing teaching, duplicate practice and invented source rights',()=>{
  expect(mutate(x=>x.skill_specimens[0].teaching_note='')).toContain('original_teaching_question_and_no_marks');
  expect(mutate(x=>x.skill_specimens[0].original_practice_prompt=x.skill_specimens[1].original_practice_prompt))
   .toContain('non_unique_original_stimulus');
  expect(mutate(x=>x.provenance.official_use_class='LICENSED')).toContain('source_and_rights_fingerprint');
  expect(mutate(x=>x.provenance.protected_pearson_source_text_ingested=true))
   .toContain('source_and_rights_fingerprint');
 });
 it('rejects fabricated examiner marks, AI review or learner release',()=>{
  expect(mutate(x=>x.review_boundary.independent_educational_review='PASS'))
   .toContain('false_foundation_review_or_publication');
  expect(mutate(x=>x.review_boundary.ai_assured=true))
   .toContain('false_foundation_review_or_publication');
  expect(mutate(x=>x.review_boundary.student_evidence_allowed=true))
   .toContain('false_foundation_review_or_publication');
  expect(mutate(x=>x.skill_specimens[0].numeric_mark=4))
   .toContain('original_teaching_question_and_no_marks');
  expect(mutate(x=>x.review_boundary.publication='APPROVED'))
   .toContain('false_foundation_review_or_publication');
 });
});
