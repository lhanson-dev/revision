import {describe,it,expect} from 'vitest';
import {loadMarketGateInputs,runCurrentMarketGate,checkCurrentMarketGate,
 subjectQuestionsOnly,blindMarkingOnly,independentReviewReturnTemplate} from './edexcel-9bs0-market-current-review-gate.mjs';

const {manifest,inputs}=loadMarketGateInputs();
const sha=(rel)=>Object.values(manifest.exact_inputs).find(x=>x.path===rel)?.git_blob;
const mutate=fn=>{const m=structuredClone(manifest);const i=structuredClone(inputs);
 fn(m,i);return checkCurrentMarketGate(m,i,sha).errors;};
const badExport=fn=>{const m=structuredClone(manifest),i=structuredClone(inputs);fn(m,i);
 return ()=>subjectQuestionsOnly(m,i,sha);};

describe('Stage 5 current reviewed-truth boundary after 682/683/685',()=>{
 it('reconciles 26 source hypotheses, 25 authoring candidates, one unassessed drawing, zero approval',()=>{
  expect(runCurrentMarketGate().result).toEqual({
   status:'PASS',errors:[],decision:'HOLD',provisional_skills:26,
   authored_unreviewed_skills:25,graph_construction_unassessed:1,
   independently_accepted_skills:0,learner_release_items:0});
 });
 it('exports exactly 26 structured subject questions without author answer hints',()=>{
  const packet=subjectQuestionsOnly(manifest,inputs,sha);
  expect(packet.skills).toHaveLength(26);
  expect(packet.skills.filter(x=>x.authoring==='UNREVIEWED_ORIGINAL')).toHaveLength(25);
  expect(packet.skills.filter(x=>x.authoring==='DRAWING_ASSESSMENT_MISSING')).toHaveLength(1);
  expect(packet.skills.find(x=>x.skill_id==='EDX-9BS0-MKT-01A').questions).toHaveLength(1);
  expect(packet.skills.find(x=>x.skill_id==='EDX-9BS0-MKT-08').questions.length).toBeGreaterThan(0);
  expect(packet.skills.find(x=>x.skill_id==='EDX-9BS0-MKT-14A').questions).toEqual([]);
  const serialized=JSON.stringify(packet);
  for(const forbidden of ['unscored_expected_reasoning','original_author_example_answer',
   'provisional_marking_points','approved_course_truth','expected_number',
   'EXAM-ORIGINAL-01','EXAM-ORIGINAL-02-V2'])expect(serialized).not.toContain(forbidden);
 });
 it('exports corrected assess-only blind packet and never the historical invalid questions',()=>{
  const blind=blindMarkingOnly(manifest,inputs,sha);
  expect(blind.question_id).toBe('EXAM-ORIGINAL-02-V2');
  expect(blind.unscored_responses).toHaveLength(4);
  const serialized=JSON.stringify(blind);
  for(const forbidden of ['EXAM-ORIGINAL-01','provisional_marking_points',
   'mark_band_feedback','original_author_example_answer','expected_mark','correct_mark'])
   expect(serialized).not.toContain(forbidden);
 });
 it('generates blank reviewer return without claiming independence, marks or rights',()=>{
  const template=independentReviewReturnTemplate(manifest,inputs,sha);
  expect(template.curriculum_and_subject_decisions).toHaveLength(26);
  expect(template.blind_marks).toHaveLength(4);
  expect(template.blind_marks.every(x=>x.mark===null&&x.level===null&&x.rationale===null)).toBe(true);
  expect(template.reviewer_identity).toBeNull();
  expect(template.relevant_source_rights_approved).toBeNull();
  expect(template.qualified_foundation_approval).toBeNull();
  expect(template.recommendation).toBe('PENDING_NOT_FOR_PUBLICATION');
 });
 it('refuses stale hashes or a missing new skill or a substituted source reference',()=>{
  expect(mutate((m)=>{m.exact_inputs.additional_18_skill_drafts.git_blob='0'.repeat(40)}))
   .toContain('wrong_or_stale_input:additional_18_skill_drafts');
  expect(mutate((m,i)=>{i.additional_18_skill_drafts.skill_specimens.pop()}))
   .toContain('skill_roster_or_actual_authoring_mismatch');
  expect(mutate((m,i)=>{i.additional_18_skill_drafts.skill_specimens[0].source_reference_id='other'}))
   .toContain('skill_roster_or_actual_authoring_mismatch');
 });
 it('refuses resurrected checklist scheme, fabricated blind marking and rights widening',()=>{
  expect(mutate((m,i)=>{i.corrected_original_written_question.original_question_disposition['EXAM-ORIGINAL-02'].status='APPROVED'}))
   .toContain('superseded_exam_or_blind_marks_leaked');
  expect(mutate((m,i)=>{i.unscored_blind_marking_answers.submission.review_outcome='PASS'}))
   .toContain('superseded_exam_or_blind_marks_leaked');
  expect(mutate(m=>{m.source_permissions.pearson_source_class='LICENSED'}))
   .toContain('source_rights_or_authenticity_expanded');
  expect(mutate(m=>{m.source_permissions.louis_embedded_media_reuse_allowed=true}))
   .toContain('source_rights_or_authenticity_expanded');
  expect(mutate(m=>{m.review_boundaries.ai_assured=true}))
   .toContain('unearned_independent_pass_or_publication');
  expect(()=>badExport(m=>{m.review_boundaries.reviewer_identity='Self'})())
   .toThrow('Current Stage 5 reviewer manifest invalid');
 });
});
