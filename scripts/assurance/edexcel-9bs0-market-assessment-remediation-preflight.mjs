import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const parentPath='research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json';
export const correctionPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-assessment-remediation-v2.json');
const sourceBlob=file=>{
 const bytes=readFileSync(path.join(root,file));
 return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
};
const dims=['accurate_subject_knowledge','specific_contextual_application','causal_analysis','balanced_evaluation','supported_judgement'];
export function checkMarketAssessmentRemediation(data,parent,currentSourceBlob){
 const fail=[],require=(ok,id)=>{if(!ok)fail.push(id);};
 const d=data??{},basis=d.basis??{},defects=d.defect_register??[];
 const historic=d.original_question_disposition??{};
 const proposed=d.new_assessment_candidate??{};
 const graph=d.graph_construction_boundary??{};
 const scope=d.scope_implications??{};
 const gates=d.review_decision??{};

 require(d.schema_version==='edexcel-9bs0-market-written-assessment-remediation-v2'
  &&d.record_type==='ORIGINAL_RESEARCH_CORRECTION_NOT_COURSE_OR_EXAM_TRUTH'
  &&basis.original_specimen_path===parentPath
  &&basis.original_specimen_git_blob==='1b7adb93cc1ffca06b9a66a3bfa69033ef2bae9b'
  &&basis.original_specimen_git_blob===currentSourceBlob(parentPath)
  &&basis.exact_foundation_fingerprint==='0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241',
  'exact_original_input_changed');
 require(basis.official_pearson_assessment_support_url===
  'https://qualifications.pearson.com/en/news-policy/subject-updates/business/gce-business-assessment-support.html'
  &&basis.official_page_dated==='2026-10-07'
  &&basis.official_source_classification==='REFERENCE_ONLY'
  &&basis.pearson_material_for_model_worker===false
  &&basis.no_protected_pearson_prose_embedded===true
  &&basis.factual_shape_observations?.length===4,
  'official_reference_only_shape_boundary');
 require(defects.length===3
  &&defects.map(x=>x.id).join('|')==='A3-001|A4-001|DRAW-001'
  &&defects.every(x=>x.external_educational_review==='PENDING'
   &&x.severity.length>10&&x.issue.length>50)
  &&defects[0].disposition==='WITHDRAW_FROM_EXAM_STYLE_ELIGIBILITY'
  &&defects[1].disposition==='REPLACE_WITH_FOCUSED_ORIGINAL_ASSESS_CANDIDATE',
  'real_marking_defect_not_recorded');
 require(parent?.exam_assessment_specimen?.id==='EXAM-ORIGINAL-01'
  &&parent?.supplementary_exam_assessment_specimen?.id==='EXAM-ORIGINAL-02'
  &&parent.exam_assessment_specimen.provisional_marking_points?.length===8
  &&parent.supplementary_exam_assessment_specimen.provisional_marking_points?.length===10
  &&parent.exam_assessment_specimen.provisional_marking_points.every(x=>x.marks===1)
  &&parent.supplementary_exam_assessment_specimen.provisional_marking_points.every(x=>x.marks===1),
  'parent_marking_problem_not_exactly_identified');
 for(const id of ['EXAM-ORIGINAL-01','EXAM-ORIGINAL-02']){
  const entry=historic[id];
  require(entry?.proposed_exact_mark_scheme_valid===false
   &&entry?.approved_paper===null&&entry?.automated_marking===false
   &&entry?.status===(id==='EXAM-ORIGINAL-01'?'RESEARCH_HISTORY_WITHDRAWN':'RESEARCH_HISTORY_SUPERSEDED'),
   'superseded_mark_scheme_still_claimed:'+id);
 }
 const f=proposed.fictional_context??{},tech=f.technology_option??{},sub=f.subsidy_option??{};
 require(proposed.id==='EXAM-ORIGINAL-02-V2'
  &&proposed.type==='REVISION_ORIGINAL_FICTIONAL_GCE_ASSESS_CANDIDATE_NOT_APPROVED'
  &&proposed.command_word==='Assess'
  &&proposed.marks_available===10
  &&proposed.paper_alignment==='NOT_YET_APPROVED'
  &&proposed.curriculum_skill_ids?.join('|')==='EDX-9BS0-MKT-09|EDX-9BS0-MKT-11'
  &&f.sector==='refill-pack production'&&f.producers===20
  &&tech.investing_producers===5&&tech.per_pack_unit_cost_reduction_gbp===0.30
  &&sub.eligible_producers===20&&sub.per_pack_subsidy_gbp===0.50
  &&typeof f.assumptions==='string'&&f.assumptions.length>40
  &&proposed.prompt?.startsWith('A fictional market contains 20 refill-pack producers.')
  &&proposed.prompt?.includes('£0.30')&&proposed.prompt?.includes('£0.50')
  &&proposed.prompt?.startsWith('A fictional')&&proposed.prompt?.endsWith('(10 marks)')
  &&proposed.prompt.includes('Assess whether the subsidy')
  &&proposed.assessment_character==='LEVEL_BASED_HOLISTIC_PROVISIONAL_NO_AWARD',
  'original_assess_command_or_two_factor_context_invalid');
 require(proposed.diagnostic_content_anchors?.length===5
  &&proposed.diagnostic_content_anchors.every(x=>typeof x==='string'&&x.length>50)
  &&proposed.provisional_response_quality_dimensions?.length===5
  &&proposed.provisional_response_quality_dimensions.map(x=>x.axis).join('|')===dims.join('|')
  &&proposed.provisional_response_quality_dimensions.every(x=>typeof x.expected==='string'&&x.expected.length>50)
  &&proposed.original_author_example_answer?.length>330,
  'holistic_reasoning_not_provisionally_evidenced');
 require(proposed.independent_blind_answer_check==='NOT_PERFORMED'
  &&proposed.assessment_objective_mapping==='PENDING_EXACT_EXAM_TRUTH'
  &&proposed.level_descriptors_approved===false
  &&proposed.numeric_mark_allocation===null
  &&proposed.human_mark_result===null
  &&proposed.mark_band_feedback==='PENDING_INDEPENDENT_REVIEW'
  &&proposed.auto_marking_allowed===false
  &&proposed.learner_question_published===false,
  'invalid_numeric_mark_award_or_premature_publication');
 require(graph.original_skill_id==='EDX-9BS0-MKT-14A'
  &&graph.potential_mark_tariff_from_official_support===4
  &&graph.target_performance?.length===4
  &&graph.actual_student_drawing_capture===false
  &&graph.exercise_in_live_app===false
  &&graph.student_mastery_evidence_allowed===false
  &&graph.assessment_scoring_ready===false
  &&graph.requires_separate_governed_feature_decision===true,
  'unearned_student_graph_construction_mastery');
 require(scope.eight_mark_question_eligible===false
  &&scope.ten_mark_original_question_eligible===false
  &&scope.ten_mark_revised_question_is_review_candidate_only===true
  &&scope.research_skill_candidates_with_learn_and_practice===7
  &&scope.skills_with_revised_extended_response_candidate===2
  &&scope.written_assessment_status==='INDEPENDENT_QUALIFIED_ASSESSMENT_REVIEW_REQUIRED'
  &&scope.exact_course_ai_assured===false&&scope.foundation_approved===false
  &&scope.source_new_use_clearance===false
  &&scope.learner_content_eligible===false
  &&scope.reviewer_time_minutes===null
  &&scope.external_model_calls_for_this_correction===0
  &&scope.provider_spend_usd===0,
  'scope_or_provider_evidence_laundered');
 require(gates.A3==='UNRESOLVED'&&gates.A4==='UNRESOLVED'
  &&gates.RIGHTS==='UNRESOLVED'&&gates.QUALIFIED_EXPERT==='UNRESOLVED'
  &&gates.publication==='HOLD'&&gates.independent_context_id===null
  &&gates.blind_marked_samples===0,
  'independent_and_qualified_review_not_done');
 return {status:fail.length?'FAIL':'PASS',problems:fail,
  retained_historical_question_count:2,withdrawn_from_exam_claims:2,
  revised_original_assess_candidates:1,holistic_diagnostic_dimensions:5,
  externally_approved_levels:false,real_blind_marks:0,
  drawing_performance_evidence:false,published_learner_items:0,
  decision:'HOLD'};
}
export function runMarketAssessmentRemediation(){
 const input=JSON.parse(readFileSync(correctionPath,'utf8'));
 const old=JSON.parse(readFileSync(path.join(root,parentPath),'utf8'));
 return checkMarketAssessmentRemediation(input,old,sourceBlob);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=runMarketAssessmentRemediation();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='PASS')process.exitCode=1;
}
