import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {reviewerOnlyPacket} from './edexcel-9bs0-market-blind-marking-trial.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const manifestRel='research/content-production-repeatability/edexcel-9bs0-market-current-reviewer-gate-v1.json';
const refs={
 original_26_skill_handoff:'research/content-production-repeatability/edexcel-9bs0-market-gated-review-handoff.json',
 historical_7_skill_specimen:'research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json',
 corrected_original_written_question:'research/content-production-repeatability/edexcel-9bs0-market-assessment-remediation-v2.json',
 unscored_blind_marking_answers:'research/content-production-repeatability/edexcel-9bs0-market-blind-marking-trial-v1.json',
 additional_18_skill_drafts:'research/content-production-repeatability/edexcel-9bs0-market-demand-elasticity-authoring-v1.json',
};
export const blobSha=(rel)=>{const bytes=readFileSync(path.join(root,rel));
 return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');};
const read=(rel)=>JSON.parse(readFileSync(path.join(root,rel),'utf8'));
export function loadMarketGateInputs(){
 const manifest=read(manifestRel),inputs={};
 for(const [key,p] of Object.entries(refs))inputs[key]=read(p);
 return {manifest,inputs};
}
export function checkCurrentMarketGate(m,d,hash=blobSha){
 const errors=[],assert=(ok,reason)=>{if(!ok)errors.push(reason);};
 const c=m?.current_disposition??{},r=m?.review_boundaries??{},rights=m?.source_permissions??{};
 assert(m?.schema_version==='edexcel-9bs0-market-current-reviewer-gate-v1'
  &&m?.record_kind==='PREPARED_UNREVIEWED_DECISION_GATE_NOT_FOUNDATION_OR_PUBLICATION'
  &&m?.course?.qualification==='Pearson Edexcel 9BS0'
  &&m?.course?.assessment_year===2027&&m?.course?.scope==='Theme 1 / Market section 1.2'
  &&m?.course?.source_universe_complete===false&&m?.course?.atomic_requirements_approved===false,
  'research_not_accepted_course');
 for(const [key,p] of Object.entries(refs)){
  const ref=m?.exact_inputs?.[key];
  assert(ref?.path===p&&ref?.git_blob===hash(p),'wrong_or_stale_input:'+key);
 }
 assert(Object.keys(m?.exact_inputs??{}).length===Object.keys(refs).length,'unexpected_unvetted_inputs');
 assert(c.provisional_market_skill_count===26&&c.original_joined_research_skills===7
  &&c.new_original_teaching_practice_research_skills===18
  &&c.unassessed_graph_construction_skills===1&&c.independently_accepted_skill_count===0
  &&c.withdrawn_exam_question_id==='EXAM-ORIGINAL-01'
  &&c.superseded_exam_question_id==='EXAM-ORIGINAL-02'
  &&c.only_current_written_assessment_review_candidate_id==='EXAM-ORIGINAL-02-V2'
  &&c.blind_synthetic_response_count===4
  &&c.independently_scored_response_count===0&&c.learner_release_items===0,'wrong_candidate_disposition');
 const hand=d?.original_26_skill_handoff??{},old=d?.historical_7_skill_specimen??{},
       correction=d?.corrected_original_written_question??{},
       blind=d?.unscored_blind_marking_answers??{},added=d?.additional_18_skill_drafts??{};
 const skills=hand.skill_decisions??[],authoring=added.skill_specimens??[];
 const oldSkill=skills.filter(x=>x.authored_specimen_evidence==='LEARN_PRACTICE_AND_EXAM_SPECIMEN_NOT_REVIEWED');
 const newSkill=skills.filter(x=>x.authored_specimen_evidence==='NO_ORIGINAL_LEARN_PRACTICE_ASSESSMENT_SPECIMEN');
 const diagram=skills.filter(x=>x.skill_id==='EDX-9BS0-MKT-14A'&&x.authored_specimen_evidence==='DIAGRAM_EXPLANATION_ONLY_DRAWING_UNASSESSED');
 assert(skills.length===26&&new Set(skills.map(x=>x.skill_id)).size===26
  &&oldSkill.length===7&&newSkill.length===18&&diagram.length===1
  &&authoring.length===18&&newSkill.every((x,i)=>x.skill_id===authoring[i]?.skill_id
   &&x.official_reference_identifier===authoring[i]?.source_reference_id)
  &&oldSkill.every(x=>old.practice_specimens?.some(p=>p.skill_ids.includes(x.skill_id)))
  &&old.scope?.visual_demonstration_but_no_assessed_construction?.includes('EDX-9BS0-MKT-14A')
  &&added.review_boundary?.student_evidence_allowed===false
  &&added.review_boundary?.all_26_skills_independently_accepted===false,
  'skill_roster_or_actual_authoring_mismatch');
 assert(old.exam_assessment_specimen?.id==='EXAM-ORIGINAL-01'
  &&old.supplementary_exam_assessment_specimen?.id==='EXAM-ORIGINAL-02'
  &&correction.original_question_disposition?.['EXAM-ORIGINAL-01']?.status==='RESEARCH_HISTORY_WITHDRAWN'
  &&correction.original_question_disposition?.['EXAM-ORIGINAL-02']?.status==='RESEARCH_HISTORY_SUPERSEDED'
  &&correction.new_assessment_candidate?.id==='EXAM-ORIGINAL-02-V2'
  &&correction.new_assessment_candidate?.numeric_mark_allocation===null
  &&correction.new_assessment_candidate?.auto_marking_allowed===false
  &&blind.source?.exact_original_prompt===correction.new_assessment_candidate?.prompt
  &&blind.blind_responses?.length===4
  &&blind.submission?.review_outcome==='NOT_PERFORMED'
  &&blind.submission?.learner_publication_eligible===false,
  'superseded_exam_or_blind_marks_leaked');
 assert(rights.pearson_source_class==='REFERENCE_ONLY'
  &&rights.pearson_source_text_in_worker===false&&rights.official_mark_scheme_prose_embedded===false
  &&rights.louis_displayed_licence==='CC BY 4.0 except where otherwise noted'
  &&rights.louis_embedded_media_reuse_allowed===false&&rights.louis_new_operation_signed_off===false
  &&rights.board_material_copy_permission===false
  &&rights.pearson_assessment_support_url==='https://qualifications.pearson.com/en/news-policy/subject-updates/business/gce-business-assessment-support.html',
  'source_rights_or_authenticity_expanded');
 assert(r.A1_curriculum_atomic_depth==='PENDING_FRESH_INDEPENDENT_SOURCE_VALIDATION'
  &&r.A2_subject_model_and_practice==='PENDING_QUALIFIED_SUBJECT_REVIEW'
  &&r.A3_question_authenticity==='PENDING_QUALIFIED_ASSESSMENT_REVIEW'
  &&r.A4_blind_marking_and_level_discrimination==='PENDING_QUALIFIED_BLIND_MARKING'
  &&r.RIGHTS_operation_specific==='PENDING_AUTHORISED_RIGHTS_DECISION'
  &&r.QUALIFIED_EXPERT==='PENDING'
  &&r.full_2027_course_exam_truth==='INCOMPLETE'
  &&r.ai_assured===false&&r.foundation_approved===false&&r.student_publication_eligible===false
  &&r.reviewer_identity===null&&r.reviewer_context_id===null&&r.human_review_minutes===null
  &&r.external_provider_calls_for_this_package===0&&r.external_provider_spend_usd===0
  &&r.publication==='HOLD','unearned_independent_pass_or_publication');
 return {status:errors.length?'FAIL':'PASS',errors,decision:'HOLD',provisional_skills:skills.length,
  authored_unreviewed_skills:oldSkill.length+newSkill.length,graph_construction_unassessed:diagram.length,
  independently_accepted_skills:0,learner_release_items:0};
}
export function subjectQuestionsOnly(m,d,hash=blobSha){
 const ck=checkCurrentMarketGate(m,d,hash);
 if(ck.status!=='PASS')throw new Error('Current Stage 5 reviewer manifest invalid: '+ck.errors.join(', '));
 const original=d.historical_7_skill_specimen.practice_specimens;
 const newItems=new Map(d.additional_18_skill_drafts.skill_specimens.map(x=>[x.skill_id,x]));
 return {qualification:m.course.qualification,scope:m.course.scope,review_state:'UNREVIEWED',
  source_permission:'PEARSON_REFERENCE_ONLY',
  skills:d.original_26_skill_handoff.skill_decisions.map(x=>{
   const newDraft=newItems.get(x.skill_id);
   if(newDraft)return {skill_id:x.skill_id,source_reference_id:x.official_reference_identifier,
    semantic_tag:x.original_semantic_tag,authoring:'UNREVIEWED_ORIGINAL',
    case:newDraft.original_case,questions:[newDraft.original_practice_prompt]};
   if(x.skill_id==='EDX-9BS0-MKT-14A')return {skill_id:x.skill_id,
    source_reference_id:x.official_reference_identifier,semantic_tag:x.original_semantic_tag,
    authoring:'DRAWING_ASSESSMENT_MISSING',case:null,questions:[]};
   return {skill_id:x.skill_id,source_reference_id:x.official_reference_identifier,
    semantic_tag:x.original_semantic_tag,authoring:'UNREVIEWED_ORIGINAL',
    case:null,questions:original.filter(p=>p.skill_ids.includes(x.skill_id)).map(p=>p.prompt)};
  })};
}
export function blindMarkingOnly(m,d,hash=blobSha){
 const ck=checkCurrentMarketGate(m,d,hash);
 if(ck.status!=='PASS')throw new Error('Current Stage 5 reviewer manifest invalid: '+ck.errors.join(', '));
 return reviewerOnlyPacket(d.unscored_blind_marking_answers,d.corrected_original_written_question,hash);
}
export function independentReviewReturnTemplate(m,d,hash=blobSha){
 const subject=subjectQuestionsOnly(m,d,hash),blind=blindMarkingOnly(m,d,hash);
 return {record_kind:'EMPTY_EXTERNAL_REVIEW_RETURN_NOT_APPROVAL',
  source_gate_git_blob:hash(manifestRel),reviewer_identity:null,qualifications:null,
  independent_context_id:null,relevant_source_rights_approved:null,
  source_rights_basis:null,review_started_at:null,review_completed_at:null,review_minutes:null,
  curriculum_and_subject_decisions:subject.skills.map(x=>({skill_id:x.skill_id,source_reference_id:x.source_reference_id,
    accepted:null,material_findings:[],reasoned_evidence:null})),
  marking_question_id:blind.question_id,marking_question_authentic:null,
  blind_marks:blind.unscored_responses.map(x=>({response_id:x.id,mark:null,level:null,rationale:null})),
  alternate_defensible_conclusions_accepted:null,marking_calibration_agreement:null,
  source_universe_2027_complete:null,qualified_foundation_approval:null,
  recommendation:'PENDING_NOT_FOR_PUBLICATION'};
}
export function runCurrentMarketGate(){const {manifest,inputs}=loadMarketGateInputs();
 return {manifest,inputs,result:checkCurrentMarketGate(manifest,inputs)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {manifest,inputs,result}=runCurrentMarketGate();
 if(result.status!=='PASS'){process.stderr.write(JSON.stringify(result,null,2)+'\n');process.exitCode=1;}
 else if(process.argv.includes('--subject-questions'))process.stdout.write(JSON.stringify(subjectQuestionsOnly(manifest,inputs),null,2)+'\n');
 else if(process.argv.includes('--blind-marking'))process.stdout.write(JSON.stringify(blindMarkingOnly(manifest,inputs),null,2)+'\n');
 else if(process.argv.includes('--review-return-template'))process.stdout.write(JSON.stringify(independentReviewReturnTemplate(manifest,inputs),null,2)+'\n');
 else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
