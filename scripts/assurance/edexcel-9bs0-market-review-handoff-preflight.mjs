import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const handoffPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-gated-review-handoff.json');
const count=(xs,fn)=>xs.filter(fn).length;
const hashBlob=(file)=>{
 const bytes=readFileSync(path.join(root,file));
 return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
};
const ids=[
 '01A','01B','02','03','04','05','06','07','08','09','10','11','12','13','14A','14B',
 '15','16','17','18','19A','19B','20','21','22','23'
].map(s=>'EDX-9BS0-MKT-'+s);

export function checkMarketReviewHandoff(packet,{obligations,triage,specimen,node,fileBlobHash}){
 const problems=[],check=(ok,id)=>{if(!ok)problems.push(id);};
 const rows=packet?.skill_decisions??[];
 const source=packet?.official_source_factual_crosscheck??{};
 const q=packet?.qualification??{};
 const rights=packet?.licence_operation_decisions??[];
 const reviewer=packet?.reviewer_packet??{};
 const sum=packet?.coverage_summary??{};
 const outcome=packet?.outcome??{};
 const sources=packet?.verified_input_git_blobs??{};
 check(packet?.schema_version==='edexcel-market-acceptance-handoff-v1'
  && packet?.record_kind==='REVIEWER_HANDOFF_NOT_REVIEW_OUTCOME'
  && packet?.status==='HOLD_INDEPENDENT_EDUCATIONAL_AND_RIGHTS_DECISIONS_PENDING'
  &&q.board==='Pearson Edexcel'&&q.code==='9BS0'&&q.assessment_year===2027
  &&q.scope==='Theme 1 / section 1.2'&&q.cohort_source_universe_approved===false,
  'exact_scope_or_review_status_invalid');
 const blobSources={
  source_reference_inventory:'research/content-production-repeatability/edexcel-9bs0-market-provisional-obligations.json',
  provisional_subject_reuse:'research/content-production-repeatability/edexcel-9bs0-market-reuse-triage.json',
  original_integrated_specimen:'research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json',
  original_subject_node_candidate:'research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json'
 };
 for(const [key,file] of Object.entries(blobSources)){
  const ref=sources[key];
  check(ref?.path===file&&typeof ref?.blob==='string'
   &&ref.blob===fileBlobHash(file),'exact_input_git_blob_changed:'+key);
 }
 check(packet?.foundation_exact_dependency?.candidate_version==='v0.8-t8-exact-course-remediation'
  &&packet?.foundation_exact_dependency?.material_fingerprint==='0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241'
  &&packet?.foundation_exact_dependency?.material_fingerprint===node?.foundation_dependency?.fingerprint
  &&packet?.foundation_exact_dependency?.effective_subject_nodes===81
  &&packet?.foundation_exact_dependency?.approved_for_exact_edexcel_course===false
  &&node?.proposed_node_id_assigned===false&&node?.publication_decision==='HOLD',
  'exact_foundation_candidate_falsely_promoted');
 check(source.source_id==='PEARSON-SPEC-9BS0-2014-I1'
  &&source.pdf_page_zero_based===18
  &&source.source_use==='REFERENCE_ONLY'
  &&source.source_page_review_method==='same_execution_context_visual_official_pdf_page_not_fresh_independent_ai'
  &&source.independent_full_curriculum_coverage_accepted===false
  &&source.substantial_pearson_source_text_allowed_in_worker_context===false,
  'pearson_source_use_or_independent_assurance_false');
 const expectedPrefixes=['1.2.1','1.2.2','1.2.3','1.2.4','1.2.5'];
 check(JSON.stringify(source.matching_structural_groups?.map(g=>g.reference_prefix))===JSON.stringify(expectedPrefixes),
  'source_groups_incomplete');
 check(rights.length===3,'source_operation_count_changed');
 const pearson=rights.find(x=>x.operation_id==='PEARSON_REFERENCE_ALIGNMENT');
 const louis=rights.find(x=>x.operation_id==='LOUIS_NEW_SUBJECT_NODE_OR_ASSET_INPUT');
 const owned=rights.find(x=>x.operation_id==='REVISION_OWNED_SPECIMEN_IN_REVIEW');
 check(pearson?.source_class==='REFERENCE_ONLY'
  &&pearson?.source_prose_into_worker===false
  &&pearson?.original_questions_from_protected_papers===false
  &&pearson?.clearance_for_unrestricted_generation===false
  &&pearson?.decision==='RESTRICTED_REFERENCE_ONLY',
  'protected_awarding_body_material_widened');
 check(louis?.source_id==='SRC-OER-LOUIS-MICRO-2024'
  &&louis?.licence_observation==='CC BY 4.0 except separately credited material'
  &&louis?.excluded?.includes('credited_figures')
  &&louis?.excluded?.includes('other_third_party_media')
  &&louis?.commercial_use_and_ai_context_scope==='OPERATION_SPECIFIC_REVIEW_PENDING'
  &&louis?.attribution_record==='REQUIRES_VERIFICATION_AND_RETAINED_CREDIT_BEFORE_REUSE'
  &&louis?.worker_text_ingestion_now===false
  &&louis?.decision==='HUMAN_OR_GOVERNED_POLICY_SIGNOFF_PENDING',
  'open_textbook_permission_not_yet_authorised');
 check(owned?.source_class==='REVISION_OWNED_ORIGINAL_SYNTHETIC'
  &&owned?.approved_exact_course_foundation===false
  &&owned?.learner_publication_eligible===false
  &&owned?.decision==='REVIEW_ONLY_NOT_LEARNER_PRODUCTION',
  'owned_research_miscast_as_approved_learner_asset');
 const obRows=obligations?.obligations??[];
 const triageRows=triage?.provisional_classifications??[];
 const authored=new Set(specimen?.scope?.fully_exercised_in_candidate??[]);
 const visual=new Set(specimen?.scope?.visual_demonstration_but_no_assessed_construction??[]);
 check(rows.length===26&&obRows.length===26&&triageRows.length===26
  &&JSON.stringify(rows.map(x=>x.skill_id))===JSON.stringify(ids)
  &&JSON.stringify(obRows.map(x=>x.id))===JSON.stringify(ids),
  'provisional_26_skill_scope_incomplete');
 const seen=new Set();
 for(const [i,row] of rows.entries()){
  const ob=obRows[i],tr=triageRows[i];
  const expStatus=authored.has(row.skill_id)
   ?'LEARN_PRACTICE_AND_EXAM_SPECIMEN_NOT_REVIEWED'
   :visual.has(row.skill_id)
    ?'DIAGRAM_EXPLANATION_ONLY_DRAWING_UNASSESSED'
    :'NO_ORIGINAL_LEARN_PRACTICE_ASSESSMENT_SPECIMEN';
  const group=row.official_reference_identifier?.startsWith('1.2.1')?'DEMAND'
   :row.official_reference_identifier?.startsWith('1.2.2')||row.official_reference_identifier?.startsWith('1.2.3')?'SUPPLY_MARKET':'ELASTICITY';
  check(row.sequence===i+1
   &&row.skill_id===ob?.id&&row.skill_id===tr?.requirement_id
   &&row.official_reference_identifier===ob?.source_reference_id
   &&row.original_semantic_tag===ob?.original_skill_tag
   &&row.curriculum_group===group
   &&row.proposed_foundation_resolution===tr?.proposed_resolution
   &&JSON.stringify(row.proposed_candidate_nodes)===JSON.stringify(ob?.candidate_subject_node_ids)
   &&row.authored_specimen_evidence===expStatus
   &&row.explicit_provisional_scope===(authored.has(row.skill_id)||visual.has(row.skill_id))
   &&row.independently_accepted===false
   &&row.rights_for_new_generation==='NOT_APPROVED'
   &&row.reviewer_decision==='PENDING'
   &&typeof row.requested_reviewer_evidence==='string'&&row.requested_reviewer_evidence.length>30,
   'row_false_coverage_or_review_decision:'+row.skill_id);
  seen.add(row.official_reference_identifier);
 }
 check(seen.size===23
  &&count(rows,x=>x.curriculum_group==='DEMAND')===8
  &&count(rows,x=>x.curriculum_group==='SUPPLY_MARKET')===8
  &&count(rows,x=>x.curriculum_group==='ELASTICITY')===10,
  'market_23_source_position_partition_changed');
 check(authored.size===7&&visual.size===1
  &&count(rows,x=>x.authored_specimen_evidence==='LEARN_PRACTICE_AND_EXAM_SPECIMEN_NOT_REVIEWED')===7
  &&count(rows,x=>x.authored_specimen_evidence==='DIAGRAM_EXPLANATION_ONLY_DRAWING_UNASSESSED')===1
  &&count(rows,x=>x.authored_specimen_evidence==='NO_ORIGINAL_LEARN_PRACTICE_ASSESSMENT_SPECIMEN')===18
  &&sum.provisional_skills_total===26
  &&sum.source_terminal_identifiers_used_for_provisional_partition===23
  &&sum.assessed_in_original_research_specimen_unreviewed===7
  &&sum.visual_only_not_student_drawing_assessed===1
  &&sum.without_original_complete_specimen===18
  &&sum.independently_accepted===0
  &&sum.independent_reuse_percent===null
  &&sum.all_four_course_themes_assured===false,
  'unearned_market_completeness_or_assessed_drawing');
 check(reviewer.independent_context_id===null
  &&reviewer.source_rights_operation_approver===null
  &&reviewer.educational_reviewer===null
  &&reviewer.qualified_business_assessment_reviewer===null
  &&reviewer.review_attempts===0
  &&reviewer.fixed_questions?.map(x=>x.id).join(',')==='A1,A2,A3,A4,RIGHTS,EXPERT'
  &&reviewer.fixed_questions.every(x=>x.result==='NOT_PERFORMED'&&x.question?.length>60)
  &&Array.isArray(reviewer.issue_register)&&reviewer.issue_register.length===0
  &&reviewer.independent_review_pass===false
  &&reviewer.qualified_expert_signed_off===false,
  'fake_independent_or_qualified_review');
 check(packet.blocking_decisions?.length===6
  &&packet.blocking_decisions.every(x=>x.status==='OPEN'&&x.reason.length>45)
  &&outcome.review_packet_prepared===true&&outcome.source_rights_cleared===false
  &&outcome.independent_quality_accepted===false&&outcome.exact_course_ai_assured===false
  &&outcome.derived_student_assets_eligible===false
  &&outcome.publication==='HOLD'&&outcome.founder_merge_approval===false,
  'premature_release_or_closed_issue');
 return {status:problems.length?'FAIL':'PASS',problems,
  provisional_skills:rows.length,source_positions:seen.size,authored_unreviewed:authored.size,
  visual_only:visual.size,still_without_specimen:18,
  independent_acceptance:'NOT_PERFORMED',licence_operation_authorised:false,
  ai_assured:false,learner_assets_created:false,release:'HOLD'};
}
export function runMarketReviewHandoff(){
 const load=f=>JSON.parse(readFileSync(path.join(root,f),'utf8'));
 const handoff=load('research/content-production-repeatability/edexcel-9bs0-market-gated-review-handoff.json');
 return checkMarketReviewHandoff(handoff,{
  obligations:load('research/content-production-repeatability/edexcel-9bs0-market-provisional-obligations.json'),
  triage:load('research/content-production-repeatability/edexcel-9bs0-market-reuse-triage.json'),
  specimen:load('research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json'),
  node:load('research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json'),
  fileBlobHash:hashBlob
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=runMarketReviewHandoff();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='PASS')process.exitCode=1;
}
