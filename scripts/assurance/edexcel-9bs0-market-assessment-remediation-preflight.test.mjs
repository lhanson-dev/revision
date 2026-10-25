import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
 correctionPath,runMarketAssessmentRemediation,checkMarketAssessmentRemediation
} from './edexcel-9bs0-market-assessment-remediation-preflight.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const correction=JSON.parse(readFileSync(correctionPath,'utf8'));
const parentFile='research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json';
const old=JSON.parse(readFileSync(path.join(root,parentFile),'utf8'));
const digest=p=>{const bytes=readFileSync(path.join(root,p));return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');};
const changed=fn=>{const copy=structuredClone(correction);fn(copy);
 return checkMarketAssessmentRemediation(copy,old,digest).problems;};

describe('Edexcel authentic extended assessment correction stays research-only',()=>{
 it('catches the old one-mark-per-bullet error and preserves non-scored holistic replacement',()=>{
  expect(runMarketAssessmentRemediation()).toMatchObject({
   status:'PASS',problems:[],retained_historical_question_count:2,
   withdrawn_from_exam_claims:2,revised_original_assess_candidates:1,
   holistic_diagnostic_dimensions:5,externally_approved_levels:false,
   real_blind_marks:0,drawing_performance_evidence:false,
   published_learner_items:0,decision:'HOLD'
  });
 });
 it('refuses a wrong historical input or expanded Pearson-worker rights',()=>{
  expect(changed(x=>x.basis.original_specimen_git_blob='a'.repeat(40)))
   .toContain('exact_original_input_changed');
  expect(changed(x=>x.basis.pearson_material_for_model_worker=true))
   .toContain('official_reference_only_shape_boundary');
  expect(changed(x=>x.basis.official_source_classification='LICENSED_FOR_COPYING'))
   .toContain('official_reference_only_shape_boundary');
 });
 it('does not leave the original eight- or ten-mark bullet scheme live',()=>{
  expect(changed(x=>x.original_question_disposition['EXAM-ORIGINAL-01'].proposed_exact_mark_scheme_valid=true))
   .toContain('superseded_mark_scheme_still_claimed:EXAM-ORIGINAL-01');
  expect(changed(x=>x.original_question_disposition['EXAM-ORIGINAL-02'].status='APPROVED'))
   .toContain('superseded_mark_scheme_still_claimed:EXAM-ORIGINAL-02');
 });
 it('checks the real two-factor assess question and its invented-data assumptions',()=>{
  expect(changed(x=>x.new_assessment_candidate.command_word='Analyse'))
   .toContain('original_assess_command_or_two_factor_context_invalid');
  expect(changed(x=>x.new_assessment_candidate.fictional_context.technology_option.investing_producers=20))
   .toContain('original_assess_command_or_two_factor_context_invalid');
  expect(changed(x=>x.new_assessment_candidate.marks_available=8))
   .toContain('original_assess_command_or_two_factor_context_invalid');
  expect(changed(x=>x.new_assessment_candidate.provisional_response_quality_dimensions[3].axis='recall_only'))
   .toContain('holistic_reasoning_not_provisionally_evidenced');
 });
 it('does not invent level descriptors, scores, blind reviewer results or release',()=>{
  expect(changed(x=>x.new_assessment_candidate.numeric_mark_allocation={knowledge:2,application:2,analysis:3,evaluation:3}))
   .toContain('invalid_numeric_mark_award_or_premature_publication');
  expect(changed(x=>x.new_assessment_candidate.human_mark_result=10))
   .toContain('invalid_numeric_mark_award_or_premature_publication');
  expect(changed(x=>x.new_assessment_candidate.independent_blind_answer_check='PASS'))
   .toContain('invalid_numeric_mark_award_or_premature_publication');
  expect(changed(x=>x.new_assessment_candidate.learner_question_published=true))
   .toContain('invalid_numeric_mark_award_or_premature_publication');
  expect(changed(x=>x.review_decision.A4='PASSED'))
   .toContain('independent_and_qualified_review_not_done');
 });
 it('preserves graph construction as an unmeasured learner performance',()=>{
  expect(changed(x=>x.graph_construction_boundary.student_mastery_evidence_allowed=true))
   .toContain('unearned_student_graph_construction_mastery');
  expect(changed(x=>x.graph_construction_boundary.actual_student_drawing_capture=true))
   .toContain('unearned_student_graph_construction_mastery');
  expect(changed(x=>x.scope_implications.skills_with_revised_extended_response_candidate=7))
   .toContain('scope_or_provider_evidence_laundered');
 });
});