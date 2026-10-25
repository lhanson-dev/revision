import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {solveEquilibrium,checkMarketGraph} from './edexcel-9bs0-market-graph-preflight.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const specimenPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-learning-assessment-specimen.json');
export const draftPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json');
export const skillsPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-market-provisional-obligations.json');
export const figuresPath=path.join(root,'research/content-production-repeatability/market-graph-exemplars');
const suffix=['08','09','10','11','12','13','14A','14B'];
const ids=suffix.map(s=>'EDX-9BS0-MKT-'+s);
const taught=['EDX-9BS0-MKT-08','EDX-9BS0-MKT-13','EDX-9BS0-MKT-14B'];
const missing=ids.slice(1,5);
const availableFigures=new Map([
 ['edexcel-9bs0-market-baseline.svg','baseline'],
 ['edexcel-9bs0-market-supply-left.svg','cost'],
 ['edexcel-9bs0-market-demand-right.svg','preference']
]);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const distinct=(items)=>new Set(items).size===items.length;
const isText=s=>typeof s==='string'&&s.trim().length>16;

export function checkMarketVerticalSpecimen(data,foundationDraft,obligationIndex,svgRead){
 const errors=[];const require=(condition,code)=>{if(!condition)errors.push(code)};
 const d=data??{},rights=d.rights??{},state=d.materialization??{},s=d.scope??{};
 const model=foundationDraft?.original_numeric_case;
 const lesson=d.learner_content_specimen??{};
 const practices=d.practice_specimens??[];
 const exam=d.exam_assessment_specimen??{};
 const trace=d.skill_traceability??[];
 require(d.schema_version==='edexcel-9bs0-market-research-vertical-specimen-v1'
  && d.classification==='ORIGINAL_AUTHORING_RESEARCH_ONLY_NOT_COURSE_ASSET'
  && d.qualification?.code==='9BS0'
  && d.qualification?.assessment_year===2027
  && d.qualification?.source_scope==='Theme 1 section 1.2'
  && d.qualification?.approved_course_truth===false
  && d.qualification?.approved_exam_truth===false
  && d.qualification?.paper_alignment==='NOT_APPROVED'
  && d.qualification?.cohort_source_universe==='INCOMPLETE',
  'unapproved_course_or_scope_recast');
 require(d.canonical_learner_runtime==='/revision/app/'
  && d.canonical_content_adapter==='src/engine/content/content-adapter.ts'
  && d.runtime_integration==='NONE'
  && d.exact_dependency?.effective_fingerprint==='0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241'
  && d.exact_dependency?.subject_foundation_candidate_version==='v0.8-t8-exact-course-remediation'
  && d.exact_dependency?.node_activated===false
  && foundationDraft?.lifecycle==='RESEARCH_DRAFT_REQUIRES_INDEPENDENT_REVIEW'
  && foundationDraft?.publication_decision==='HOLD'
  && foundationDraft?.proposed_node_id_assigned===false,
  'foundation_or_canonical_runtime_boundary_invalid');
 require(rights.board_source_id==='PEARSON-SPEC-9BS0-2014-I1'
  && rights.board_source_use==='REFERENCE_ONLY'
  && rights.subject_reference_id==='SRC-OER-LOUIS-MICRO-2024'
  && rights.new_content_operation_rights_review==='PENDING'
  && rights.no_board_or_third_party_source_prose_or_image_embedded===true
  && rights.original_text_and_calculations==='REVISION_ORIGINAL_SYNTHETIC'
  && rights.source_credit_due_before_eligible_reuse===true,
  'rights_or_source_use_false_approval');
 require(state.ai_assured_exact_course===false
  && state.foundation_approved===false
  && state.learner_pack_created===false
  && state.content_adapter_import===false
  && state.learner_evidence_writes===false
  && state.learner_release===false
  && state.independent_review==='NOT_PERFORMED'
  && state.qualified_human_review==='NOT_PERFORMED'
  && state.publication_decision==='HOLD',
  'premature_asset_release_or_educational_review_claim');
 require(equal(s.provisional_requirement_ids,ids)
  && equal(s.fully_exercised_in_candidate,taught)
  && equal(s.visual_demonstration_but_no_assessed_construction,['EDX-9BS0-MKT-14A'])
  && equal(s.not_exercised,missing)
  && s.coverage_approved_count===null
  && s.partial_skill_denominator_8_not_whole_course===true
  && (obligationIndex?.obligations??[]).filter(x=>ids.includes(x.id)).length===8
  && ids.every(id=>obligationIndex.obligations.some(x=>x.id===id))
  && obligationIndex?.reuse_count_confirmed===null,
  'unsupported_coverage_or_unearned_course_completeness');
 require(model?.id==='REV-SD-CASE-01'&&d.case_id===model.id,'wrong_original_market_case');

 // The diagrams are actual existing original SVGs, not a reference to a nonexistent learner asset.
 const allSections=lesson.sections??[];
 const sectionIds=allSections.map(x=>x.id);
 require(lesson.id==='EDX-9BS0-MARKET-REVIEW-LEARN-01'
  && isText(lesson.title)&&isText(lesson.orientation)
  && allSections.length===4 && distinct(sectionIds)
  && allSections.every(x=>isText(x.heading)
    && Array.isArray(x.paragraphs)&&x.paragraphs.length>=2
    && x.paragraphs.every(p=>isText(p)&&p.length>=90)
    && x.skill_ids?.every(id=>ids.includes(id))
    && availableFigures.has(x.diagram)),
  'incomplete_teaching_explanation_or_figure');
 const example=lesson.worked_example??{};
 const eq=model?solveEquilibrium(model.demand,model.supply):null;
 const cost=model?.original_scenarios?.find(x=>x.scenario_id==='COST-RISE');
 const preference=model?.original_scenarios?.find(x=>x.scenario_id==='PREFERENCE-RISE');
 const newEq=cost?solveEquilibrium(cost.demand,cost.supply):null;
 const preferenceEq=preference?solveEquilibrium(preference.demand,preference.supply):null;
 require(eq?.price===20&&eq?.quantity===40
  &&newEq?.price===22&&newEq?.quantity===32
  &&preferenceEq?.price===22&&preferenceEq?.quantity===42,
  'synthetic_baseline_or_shock_invalid');
 require(example.id==='EX-01'
  && equal(example.skill_ids,[ids[0],ids[5]])
  && Array.isArray(example.steps)&&example.steps.length===5
  && example.steps.every(isText)
  && equal(example.answers,{original_price:eq?.price,original_quantity:eq?.quantity,
   new_price:newEq?.price,new_quantity:newEq?.quantity,
   price_change:newEq?.price-eq?.price,quantity_change:newEq?.quantity-eq?.quantity})
  &&isText(example.interpretation),
  'worked_example_arithmetic_or_skill_mapping_invalid');
 const allDiagrams=[...allSections.map(x=>x.diagram),...practices.map(x=>x.diagram).filter(Boolean)];
 require(allDiagrams.every(x=>availableFigures.has(x)),'unknown_figure_reference');
 for(const [file,kind] of availableFigures){
  const contents=svgRead(file);
  const findings=typeof contents==='string'&&model?checkMarketGraph(contents,kind,model):['missing_figure'];
  require(findings.length===0,'invalid_original_figure:'+file+':'+findings.join(','));
 }
 const practiceIds=practices.map(x=>x.id);
 require(practices.length===8&&equal(practiceIds,['P01','P02','P03','P04','P05','P06','P07','P08'])
  && distinct(practiceIds)
  && practices.every(x=>isText(x.prompt)&&x.skill_ids?.every(id=>taught.includes(id))),
  'missing_or_wrong_scope_practice');
 const expectedNumeric={P01:20,P02:40,P03:32,P07:20};
 for(const [id,value] of Object.entries(expectedNumeric)){
  const item=practices.find(p=>p.id===id);
  require(item?.mode==='calculation'&&item?.expected_number===value&&isText(item?.explanation)
   && ['GBP_per_pack','packs_per_week'].includes(item?.unit),
   'practice_math_or_type_wrong:'+id);
 }
 const expectedMcq={P04:1,P05:2,P06:0};
 for(const [id,index] of Object.entries(expectedMcq)){
  const item=practices.find(x=>x.id===id);
  require(item?.mode==='multiple_choice'
   && item?.correct_option_index===index
   &&item?.options?.length===4&&distinct(item.options)
   &&item.options.every(isText)&&isText(item.explanation)&&availableFigures.has(item.diagram),
   'mcq_answer_contract_invalid:'+id);
 }
 const written=practices.find(x=>x.id==='P08');
 require(written?.mode==='written_manual_review'
  &&written?.assessment==='QUALIFIED_REVIEW_ONLY'
  && written?.model_points?.length===3
  &&written.model_points.every(isText)
  && written?.auto_marking_allowed===false
  && written?.evidence_status==='NOT_COLLECTED',
  'written_practice_cannot_be_autoscored');

 const markpoints=exam.provisional_marking_points??[];
 require(exam.id==='EXAM-ORIGINAL-01'
  &&exam.type==='ORIGINAL_FICTIONAL_EXAM_STYLE_NOT_OFFICIAL'
  &&exam.answer_mode==='written_extended'
  &&exam.marks_available===8
  &&isText(exam.prompt)&&exam.prompt.includes('(8 marks)')
  &&equal(exam.skill_ids,taught)
  &&markpoints.length===8
  &&markpoints.every((x,i)=>x.id==='M'+(i+1)&&x.marks===1&&isText(x.criterion))
  &&markpoints.reduce((sum,p)=>sum+p.marks,0)===exam.marks_available
  &&exam.assessment_objectives==='UNASSIGNED_PENDING_EXAM_TRUTH'
  &&exam.marking_policy==='HUMAN_REVIEW_PENDING_NO_AUTO_MARK'
  &&exam.review_status==='NOT_INDEPENDENTLY_ASSESSED'
  &&isText(exam.original_example_answer)
  &&exam.reviewer_response_sample?.kind==='AUTHOR_PROVIDED_NOT_BLIND_NOT_SCORED'
  &&exam.reviewer_response_sample?.mark_outcome===null
  &&exam.real_student_response_samples===0,
  'exam_question_markup_or_earned_marks_invalid');

 const lessonRef=new Set([...sectionIds,example.id]);
 const practiceRef=new Set(practiceIds),examRef=new Set([exam.id]);
 require(trace.length===8&&equal(trace.map(t=>t.skill_id),ids)
  &&trace.every(t=>t.learn?.every(l=>lessonRef.has(l))
   && t.practice?.every(p=>practiceRef.has(p))&&t.exam?.every(e=>examRef.has(e))),
  'dangling_skill_to_asset_ids');
 for(const row of trace){
  const mustBeCovered=taught.includes(row.skill_id);
  const isDrawing=row.skill_id===ids[6];
  const shouldBeMissing=missing.includes(row.skill_id);
  require(mustBeCovered
    ? row.status==='PROVISIONAL_UNREVIEWED'&&row.learn.length>0&&row.practice.length>0&&row.exam.length===1
      &&row.learn.some(l=>l==='EX-01'||allSections.some(s=>s.id===l&&s.skill_ids.includes(row.skill_id)))
      &&row.practice.every(p=>practices.some(q=>q.id===p&&q.skill_ids.includes(row.skill_id)))
    :isDrawing
      ?row.status==='NOT_ASSESSED_DRAWING_UNSUPPORTED'&&row.learn.length>0&&row.practice.length===0&&row.exam.length===0
      :shouldBeMissing&&row.status==='UNADDRESSED'&&row.learn.length===0&&row.practice.length===0&&row.exam.length===0,
    'false_skill_coverage:'+row.skill_id);
 }
 // Intentional no inference of graph drawing or student mastery from a diagram or MCQ.
 require(!practices.some(p=>p.skill_ids.includes(ids[6]))&&!exam.skill_ids.includes(ids[6]),
  'graph_drawing_misrepresented_as_assessed');
 const m=d.measurement_baseline??{};
 require(m.factory_provider_calls===0&&m.factory_provider_spend_usd===0
  &&m.independent_ai_review_attempts===0&&m.qualified_human_review_count===0
  &&m.independently_approved_reuse_count===null&&m.elapsed_full_course_production_hours===null
  &&m.human_review_minutes===null
  &&m.generated_live_learn_pages===0
  &&m.generated_live_practice_questions===0
  &&m.generated_live_exam_questions===0
  &&m.authored_research_lessons===1
  &&m.authored_research_practice_items===8
  &&m.authored_research_exam_items===1
  &&m.coverage_measured_only_for_8_candidate_skills===true,
  'invented_cost_reuse_or_live_asset_measurement');
 return {status:errors.length?'FAIL':'PASS',errors,
  synthetic_skills_in_scope:ids.length,provisional_practised_skills:taught.length,
  visual_only_skills:1,unaddressed_skills:missing.length,
  original_research_lessons:1,original_research_practice_items:8,original_research_exam_items:1,
  automated_mathematical_verification:errors.length===0,
  independent_educational_review:'NOT_PERFORMED',real_student_evidence:false,
  exact_course_ai_assured:false,published:false,
  decision:'HOLD'};
}
export function runMarketVerticalSpecimen(){
 const read=p=>JSON.parse(readFileSync(p,'utf8'));
 return checkMarketVerticalSpecimen(read(specimenPath),read(draftPath),read(skillsPath),f=>{
  try{return readFileSync(path.join(figuresPath,f),'utf8')}catch{return null}
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=runMarketVerticalSpecimen();
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='PASS')process.exitCode=1;
}