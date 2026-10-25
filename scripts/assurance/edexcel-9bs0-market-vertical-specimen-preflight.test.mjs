import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
  checkMarketVerticalSpecimen,runMarketVerticalSpecimen,specimenPath,draftPath,skillsPath,figuresPath
} from './edexcel-9bs0-market-vertical-specimen-preflight.mjs';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const specimen=read(specimenPath),draft=read(draftPath),skills=read(skillsPath);
const svg=file=>readFileSync(path.join(figuresPath,file),'utf8');
const check=fn=>{const data=structuredClone(specimen);fn(data);return checkMarketVerticalSpecimen(data,draft,skills,svg);};

describe('Stage 5 original Market 1.2 research vertical slice without approval laundering',()=>{
 it('connects original Learn, eight Practice specimens and original exam marking to exactly three preliminary skill candidates',()=>{
  expect(runMarketVerticalSpecimen()).toMatchObject({
   status:'PASS',errors:[],synthetic_skills_in_scope:8,provisional_practised_skills:3,
   visual_only_skills:1,unaddressed_skills:4,
   original_research_lessons:1,original_research_practice_items:8,
   original_research_exam_items:1,independent_educational_review:'NOT_PERFORMED',
   real_student_evidence:false,exact_course_ai_assured:false,published:false,decision:'HOLD'
  });
 });
 it('rejects an inflated whole-course, rights-cleared or trusted-fingerprint claim',()=>{
  expect(check(x=>x.qualification.approved_course_truth=true).errors).toContain('unapproved_course_or_scope_recast');
  expect(check(x=>x.rights.board_source_use='OPEN').errors).toContain('rights_or_source_use_false_approval');
  expect(check(x=>x.rights.new_content_operation_rights_review='CLEARED').errors).toContain('rights_or_source_use_false_approval');
  expect(check(x=>x.exact_dependency.node_activated=true).errors).toContain('foundation_or_canonical_runtime_boundary_invalid');
  expect(check(x=>x.materialization.ai_assured_exact_course=true).errors).toContain('premature_asset_release_or_educational_review_claim');
  expect(check(x=>x.materialization.learner_evidence_writes=true).errors).toContain('premature_asset_release_or_educational_review_claim');
  expect(check(x=>x.materialization.independent_review='PASS').errors).toContain('premature_asset_release_or_educational_review_claim');
 });
 it('detects a missing curriculum capability rather than pretending all eight are mastered',()=>{
  expect(check(x=>x.scope.fully_exercised_in_candidate.push('EDX-9BS0-MKT-14A')).errors)
   .toContain('unsupported_coverage_or_unearned_course_completeness');
  expect(check(x=>x.skill_traceability[6].practice.push('P05')).errors)
   .toContain('false_skill_coverage:EDX-9BS0-MKT-14A');
  expect(check(x=>x.practice_specimens[4].skill_ids.push('EDX-9BS0-MKT-14A')).errors)
   .toContain('missing_or_wrong_scope_practice');
  expect(check(x=>x.skill_traceability[1].status='PROVISIONAL_UNREVIEWED').errors)
   .toContain('false_skill_coverage:EDX-9BS0-MKT-09');
 });
 it('rejects erroneous numerical worked examples and Practice answer keys',()=>{
  expect(check(x=>x.learner_content_specimen.worked_example.answers.new_quantity=42).errors)
   .toContain('worked_example_arithmetic_or_skill_mapping_invalid');
  expect(check(x=>x.practice_specimens[2].expected_number=42).errors)
   .toContain('practice_math_or_type_wrong:P03');
  expect(check(x=>x.practice_specimens[6].expected_number=10).errors)
   .toContain('practice_math_or_type_wrong:P07');
  expect(check(x=>x.practice_specimens[4].correct_option_index=1).errors)
   .toContain('mcq_answer_contract_invalid:P05');
 });
 it('rejects invalid exam point totals or an invented reviewed marking outcome',()=>{
  expect(check(x=>x.exam_assessment_specimen.provisional_marking_points[0].marks=2).errors)
   .toContain('exam_question_markup_or_earned_marks_invalid');
  expect(check(x=>x.exam_assessment_specimen.reviewer_response_sample.mark_outcome=8).errors)
   .toContain('exam_question_markup_or_earned_marks_invalid');
  expect(check(x=>x.exam_assessment_specimen.assessment_objectives='AO1').errors)
   .toContain('exam_question_markup_or_earned_marks_invalid');
  expect(check(x=>x.practice_specimens[7].auto_marking_allowed=true).errors)
   .toContain('written_practice_cannot_be_autoscored');
 });
 it('refuses missing original diagrams or made-up learner content references',()=>{
  expect(check(x=>x.learner_content_specimen.sections[0].diagram='missing.svg').errors)
   .toContain('incomplete_teaching_explanation_or_figure');
  expect(check(x=>x.skill_traceability[0].practice=['P99']).errors)
   .toContain('dangling_skill_to_asset_ids');
  const altered=(file)=>file.includes('supply-left')?svg(file).replace('E1 (P22, Q32)','E1 (P22, Q42)'):svg(file);
  expect(checkMarketVerticalSpecimen(specimen,draft,skills,altered).errors.some(s=>s.startsWith('invalid_original_figure:edexcel-9bs0-market-supply-left.svg'))).toBe(true);
 });
 it('does not count authored research as live learner course output or paid production cost',()=>{
  expect(check(x=>x.measurement_baseline.generated_live_learn_pages=1).errors)
   .toContain('invented_cost_reuse_or_live_asset_measurement');
  expect(check(x=>x.measurement_baseline.factory_provider_spend_usd=5).errors)
   .toContain('invented_cost_reuse_or_live_asset_measurement');
  expect(check(x=>x.measurement_baseline.independently_approved_reuse_count=3).errors)
   .toContain('invented_cost_reuse_or_live_asset_measurement');
 });
});