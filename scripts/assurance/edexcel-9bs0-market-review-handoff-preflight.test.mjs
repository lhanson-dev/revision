import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkMarketReviewHandoff,runMarketReviewHandoff,handoffPath} from './edexcel-9bs0-market-review-handoff-preflight.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const packet=JSON.parse(readFileSync(handoffPath,'utf8'));
const sourcePaths=[
 'research/content-production-repeatability/edexcel-9bs0-market-provisional-obligations.json',
 'research/content-production-repeatability/edexcel-9bs0-market-reuse-triage.json',
 'research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json',
 'research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json'
];
const [obligations,triage,specimen,node]=sourcePaths.map(read);
const blob=file=>{const bytes=readFileSync(path.join(root,file));return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');};
const evaluate=mutate=>{const data=structuredClone(packet);mutate(data);
 return checkMarketReviewHandoff(data,{obligations,triage,specimen,node,fileBlobHash:blob});
};
describe('Edexcel Market 1.2 fixed-decision review package — never an approval',()=>{
 it('binds the 26 source-safe skill hypotheses and exact sources, preserving 7+1+18 honest scope and HOLD',()=>{
  expect(runMarketReviewHandoff()).toMatchObject({status:'PASS',problems:[],provisional_skills:26,
   source_positions:23,authored_unreviewed:7,visual_only:1,still_without_specimen:18,
   independent_acceptance:'NOT_PERFORMED',licence_operation_authorised:false,
   ai_assured:false,learner_assets_created:false,release:'HOLD'});
 });
 it('detects a stale or forged Git material dependency',()=>{
  expect(evaluate(x=>x.verified_input_git_blobs.original_integrated_specimen.blob='0'.repeat(40)).problems)
   .toContain('exact_input_git_blob_changed:original_integrated_specimen');
  expect(evaluate(x=>x.foundation_exact_dependency.approved_for_exact_edexcel_course=true).problems)
   .toContain('exact_foundation_candidate_falsely_promoted');
 });
 it('keeps protected Pearson text and unresolved LOUIS operations out of workers',()=>{
  expect(evaluate(x=>x.licence_operation_decisions[0].source_prose_into_worker=true).problems)
   .toContain('protected_awarding_body_material_widened');
  expect(evaluate(x=>x.licence_operation_decisions[1].worker_text_ingestion_now=true).problems)
   .toContain('open_textbook_permission_not_yet_authorised');
  expect(evaluate(x=>x.licence_operation_decisions[1].decision='APPROVED').problems)
   .toContain('open_textbook_permission_not_yet_authorised');
  expect(evaluate(x=>x.official_source_factual_crosscheck.independent_full_curriculum_coverage_accepted=true).problems)
   .toContain('pearson_source_use_or_independent_assurance_false');
 });
 it('cannot claim all 26 or the unobserved diagram-drawing skill mastered',()=>{
  expect(evaluate(x=>x.skill_decisions[14].authored_specimen_evidence='LEARN_PRACTICE_AND_EXAM_SPECIMEN_NOT_REVIEWED').problems)
   .toContain('row_false_coverage_or_review_decision:EDX-9BS0-MKT-14A');
  expect(evaluate(x=>x.skill_decisions[0].independently_accepted=true).problems)
   .toContain('row_false_coverage_or_review_decision:EDX-9BS0-MKT-01A');
  expect(evaluate(x=>x.coverage_summary.without_original_complete_specimen=0).problems)
   .toContain('unearned_market_completeness_or_assessed_drawing');
  expect(evaluate(x=>x.skill_decisions[25].reviewer_decision='PASS').problems)
   .toContain('row_false_coverage_or_review_decision:EDX-9BS0-MKT-23');
 });
 it('forbids fabricated independent or qualified education review evidence',()=>{
  expect(evaluate(x=>x.reviewer_packet.review_attempts=1).problems)
   .toContain('fake_independent_or_qualified_review');
  expect(evaluate(x=>x.reviewer_packet.qualified_expert_signed_off=true).problems)
   .toContain('fake_independent_or_qualified_review');
  expect(evaluate(x=>x.reviewer_packet.fixed_questions[2].result='PASS').problems)
   .toContain('fake_independent_or_qualified_review');
  expect(evaluate(x=>x.outcome.publication='PASS').problems)
   .toContain('premature_release_or_closed_issue');
 });
 it('does not accept altered official reference IDs or misleading review readiness',()=>{
  expect(evaluate(x=>x.skill_decisions[0].official_reference_identifier='1.2.3:b').problems)
   .toContain('row_false_coverage_or_review_decision:EDX-9BS0-MKT-01A');
  expect(evaluate(x=>x.blocking_decisions[0].status='CLOSED').problems)
   .toContain('premature_release_or_closed_issue');
  expect(evaluate(x=>x.outcome.derived_student_assets_eligible=true).problems)
   .toContain('premature_release_or_closed_issue');
 });
});