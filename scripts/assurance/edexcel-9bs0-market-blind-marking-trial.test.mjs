import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkBlindMarkingTrial,reviewerOnlyPacket,runBlindMarkingTrial} from './edexcel-9bs0-market-blind-marking-trial.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const trial=JSON.parse(readFileSync(path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-blind-marking-trial-v1.json'),'utf8'));
const correction=JSON.parse(readFileSync(path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-assessment-remediation-v2.json'),'utf8'));
const blob=trial.source.correction_git_blob;
const mutate=fn=>{const x=structuredClone(trial);fn(x);return checkBlindMarkingTrial(x,correction,()=>blob).problems;};

describe('Edexcel Stage 5 four-response unscored marking discrimination trial',()=>{
 it('is structurally valid but correctly remains unreviewed and unpublishable',()=>{
  expect(runBlindMarkingTrial().result).toEqual({
   status:'PASS',problems:[],decision:'HOLD',
   original_unscored_samples:4,independently_marked_samples:0,course_published:false
  });
 });
 it('delivers reviewer-only prompt and anonymous responses, without labels, mark guesses or model answers',()=>{
  const p=reviewerOnlyPacket(trial,correction,()=>blob);
  expect(Object.keys(p)).toEqual(['question_id','prompt','unscored_responses']);
  expect(p.prompt).toEqual(correction.new_assessment_candidate.prompt);
  expect(p.unscored_responses).toHaveLength(4);
  for(const response of p.unscored_responses)expect(Object.keys(response).sort()).toEqual(['id','text']);
  const reviewer=JSON.stringify(p);
  for(const forbidden of ['estimated_mark_values','quality_or_mark_labels','expected_band','correct_mark','original_author_example_answer','approved_exam_truth','review_outcome']){
   expect(reviewer).not.toContain(forbidden);
  }
 });
 it('fails if a new question supersedes the bound source or an approval is asserted',()=>{
  expect(mutate(x=>x.source.correction_git_blob='0'.repeat(40))).toContain('source_question_version_or_gate_changed');
  expect(checkBlindMarkingTrial(trial,correction,()=> '0'.repeat(40)).problems)
   .toContain('source_question_version_or_gate_changed');
  expect(mutate(x=>x.submission.review_outcome='PASS')).toContain('fake_review_or_approval');
  expect(mutate(x=>x.submission.learner_publication_eligible=true)).toContain('fake_review_or_approval');
  expect(mutate(x=>x.submission.independent_context_id='self-review')).toContain('fake_review_or_approval');
 });
 it('fails for score leaks, tampered samples, claimed rights or fabricated paid work',()=>{
  expect(mutate(x=>x.blind_responses[0].expected_mark=2)).toContain('blind_sample_coverage_or_labels');
  expect(mutate(x=>x.blind_responses.pop())).toContain('blind_sample_coverage_or_labels');
  expect(mutate(x=>x.source.pearson_use='LICENSED')).toContain('rights_expansion');
  expect(mutate(x=>x.required_independent_decision.response_grades_recorded=4)).toContain('marking_calibration_not_yet_performed');
  expect(mutate(x=>x.telemetry.number_of_actual_independent_reviewers=1)).toContain('invented_review_or_spend');
 });
 it('blocks reviewer-packet export from an altered or unapproved input',()=>{
  const x=structuredClone(trial);x.submission.human_assessment_approval='PASSED';
  expect(()=>reviewerOnlyPacket(x,correction,()=>blob)).toThrow('Blind assessment package invalid');
 });
});
