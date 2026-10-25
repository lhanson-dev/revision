import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const trialRel='research/content-production-repeatability/edexcel-9bs0-market-blind-marking-trial-v1.json';
const correctionRel='research/content-production-repeatability/edexcel-9bs0-market-assessment-remediation-v2.json';
const correctionBlob='04868a3cb253212981b7ae240ce4eb87e08ee497';
const digest=(rel)=>{const b=readFileSync(path.join(root,rel));
 return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
};
export function checkBlindMarkingTrial(d,c,hash=digest){
 const problems=[],require=(ok,id)=>{if(!ok)problems.push(id);};
 const source=d?.source??{},submission=d?.submission??{},decision=d?.required_independent_decision??{},telemetry=d?.telemetry??{};
 require(d?.schema_version==='edexcel-9bs0-market-blind-marking-trial-v1'
  &&d?.record_type==='ORIGINAL_UNSCORED_AUTHOR_SIMULATED_RESPONSES_NOT_INDEPENDENT_ASSESSMENT',
  'research_not_independent_boundary');
 require(source.correction_path===correctionRel
  &&source.correction_git_blob===correctionBlob
  &&hash(correctionRel)===correctionBlob
  &&source.question_id==='EXAM-ORIGINAL-02-V2'
  &&source.exact_original_prompt===c?.new_assessment_candidate?.prompt
  &&c?.new_assessment_candidate?.paper_alignment==='NOT_YET_APPROVED'
  &&c?.review_decision?.A4==='UNRESOLVED',
  'source_question_version_or_gate_changed');
 require(source.pearson_reference_url==='https://qualifications.pearson.com/en/news-policy/subject-updates/business/gce-business-assessment-support.html'
  &&source.pearson_use==='REFERENCE_ONLY'
  &&source.protected_source_text_included===false,
  'rights_expansion');
 require(submission.response_origin==='REVISION_AUTHORED_SYNTHETIC_FOR_REVIEW_ONLY'
  &&submission.reviewer_receives_only_prompt_and_anonymised_responses===true
  &&submission.quality_or_mark_labels_disclosed_to_reviewer===false
  &&submission.reviewer_identity===null&&submission.independent_context_id===null
  &&submission.review_outcome==='NOT_PERFORMED'
  &&submission.human_assessment_approval==='PENDING'
  &&submission.estimated_mark_values===null
  &&submission.official_level_descriptors_embedded===false
  &&submission.approved_exam_truth===false
  &&submission.source_operation_rights_approved===false
  &&submission.ai_assured===false
  &&submission.learner_publication_eligible===false,
  'fake_review_or_approval');
 const samples=d?.blind_responses;
 require(Array.isArray(samples)&&samples.length===4
  &&samples.map(s=>s.id).join('|')==='R-A|R-B|R-C|R-D'
  &&samples.every(s=>Object.keys(s).sort().join('|')==='id|text'
   &&typeof s.text==='string'&&s.text.length>=220)
  &&new Set(samples.map(s=>s.text)).size===4,
  'blind_sample_coverage_or_labels');
 require(decision.A3==='PENDING_FRESH_CONTEXT_REVIEW'
  &&decision.A4==='PENDING_BLIND_MARKING_AND_CALIBRATION'
  &&decision.rights==='PENDING_OPERATION_SPECIFIC_REVIEW'
  &&decision.qualified_expert==='PENDING'
  &&decision.response_grades_recorded===0
  &&decision.reviewer_must_use_separate_approved_marking_reference===true
  &&decision.alternative_valid_reasoning_must_not_be_penalised===true
  &&decision.calibration_output_path==='NOT_CREATED',
  'marking_calibration_not_yet_performed');
 require(telemetry.recorded_external_provider_calls===0&&telemetry.recorded_provider_spend_usd===0
  &&telemetry.reviewer_time_minutes===null&&telemetry.number_of_actual_independent_reviewers===0,
  'invented_review_or_spend');
 return {status:problems.length?'FAIL':'PASS',problems,decision:'HOLD',
  original_unscored_samples:samples?.length??0,independently_marked_samples:0,
  course_published:false};
}
export function reviewerOnlyPacket(d,c,hash=digest){
 const checked=checkBlindMarkingTrial(d,c,hash);
 if(checked.status!=='PASS')throw new Error('Blind assessment package invalid: '+checked.problems.join(', '));
 return {question_id:d.source.question_id,prompt:d.source.exact_original_prompt,
  unscored_responses:d.blind_responses.map(x=>({id:x.id,text:x.text}))};
}
export function runBlindMarkingTrial(){
 const trial=JSON.parse(readFileSync(path.join(root,trialRel),'utf8'));
 const correction=JSON.parse(readFileSync(path.join(root,correctionRel),'utf8'));
 return {trial,correction,result:checkBlindMarkingTrial(trial,correction)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {trial,correction,result}=runBlindMarkingTrial();
 if(result.status!=='PASS'){process.stderr.write(JSON.stringify(result,null,2)+'\n');process.exitCode=1;}
 else if(process.argv.includes('--reviewer-packet'))process.stdout.write(JSON.stringify(reviewerOnlyPacket(trial,correction),null,2)+'\n');
 else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
