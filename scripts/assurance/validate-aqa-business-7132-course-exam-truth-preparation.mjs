import courseTruth from '../../research/aqa-business-7132/2027/COURSE_TRUTH_PREPARATION.mjs'
import examTruth from '../../research/aqa-business-7132/2027/EXAM_TRUTH_PREPARATION.mjs'

const EXPECTED_FOUNDATION_FINGERPRINT='64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const exactSet=(actual,expected,label)=>{const a=[...actual].sort(),e=[...expected].sort();if(a.length!==e.length||a.some((value,index)=>value!==e[index]))throw new Error(`${label} mismatch`)}

if(courseTruth.authority_status!=='research_evidence_only'||examTruth.authority_status!=='research_evidence_only')throw new Error('Preparation artifacts must remain research evidence only before v0.7 reassurance PASS')
for(const artifact of [courseTruth,examTruth]){
  if(artifact.course?.course_id!=='aqa:aqa-a-level:7132'||artifact.course?.exam_year!==2027)throw new Error('Exact AQA 7132 / 2027 identity mismatch')
  if(artifact.promotion_dependency?.required_subject_foundation_fingerprint!==EXPECTED_FOUNDATION_FINGERPRINT)throw new Error('Preparation artifact Foundation dependency mismatch')
  if(artifact.promotion_dependency?.required_targeted_reassurance_node_id!=='BUS-FIN-008'||artifact.promotion_dependency?.required_targeted_reassurance_decision!=='pass')throw new Error('Preparation artifact does not fail closed on BUS-FIN-008 reassurance')
  if(artifact.promotion_dependency?.promotion_before_dependency_pass_prohibited!==true)throw new Error('Premature promotion is not prohibited')
}

if(courseTruth.requirements.length!==42||courseTruth.summary.lowest_level_requirement_count!==42)throw new Error('Course Truth preparation must contain 42 lowest-level mapped AQA sections')
if(courseTruth.summary.mapped_requirement_count!==42)throw new Error('Course Truth preparation has unmapped curriculum requirements')
exactSet(courseTruth.summary.blocked_requirement_ids,['AQA-7132-3.1.2'],'Course Truth blocked requirements')
if(new Set(courseTruth.requirements.map((item)=>item.course_truth_id)).size!==42)throw new Error('Duplicate Course Truth IDs')
for(const item of courseTruth.requirements){
  if(!item.mapped_subject_node_ids.length)throw new Error(`${item.requirement_id} has no subject mapping`)
  if(!item.rights_safe_requirement_summary?.trim())throw new Error(`${item.requirement_id} has no rights-safe summary`)
}

if(examTruth.source_register.length<6)throw new Error('Exam Truth preparation source register incomplete')
for(const source of examTruth.source_register){
  if(source.source_use_classification!=='REFERENCE_ONLY')throw new Error(`${source.id} must remain REFERENCE_ONLY`)
  if(source.substantial_source_text_permitted_in_generation!==false)throw new Error(`${source.id} incorrectly permits protected source text in generation`)
}

if(examTruth.papers.length!==3)throw new Error('Expected three AQA 7132 papers')
exactSet(examTruth.papers.map((paper)=>paper.component_code),['7132/1','7132/2','7132/3'],'paper component codes')
if(examTruth.papers.some((paper)=>paper.duration_minutes!==120||paper.raw_marks!==100||paper.content_scope!=='all_course_content'))throw new Error('Paper duration/marks/content scope mismatch')
if(examTruth.papers.reduce((sum,paper)=>sum+paper.raw_marks,0)!==300)throw new Error('Raw paper marks do not total 300')
if(examTruth.qualification_rules.raw_mark_total!==300||examTruth.qualification_rules.scaled_mark_total!==300)throw new Error('Qualification mark totals mismatch')
if(examTruth.qualification_rules.linear_qualification!==true||examTruth.qualification_rules.all_exams_required_in_same_may_june_series!==true)throw new Error('Linear/same-series qualification rule missing')
if(examTruth.cross_paper_requirements.quantitative_skills_minimum_overall_percent!==10)throw new Error('AQA quantitative-skills minimum must be 10%')
exactSet(Object.keys(examTruth.assessment_objectives),['AO1','AO2','AO3','AO4'],'assessment objectives')
for(const paper of examTruth.papers)exactSet(Object.keys(paper.ao_weighting_percent_ranges),['AO1','AO2','AO3','AO4'],`${paper.component_code} AO ranges`)
exactSet(Object.keys(examTruth.command_word_alignment),['source_scope_note','calculate','describe','explain','analyse','evaluate','justify','to_what_extent'],'command-word alignment')

if(examTruth.assessment_requirement_denominator.length<14)throw new Error('Assessment requirement denominator unexpectedly small')
if(new Set(examTruth.assessment_requirement_denominator.map((item)=>item.id)).size!==examTruth.assessment_requirement_denominator.length)throw new Error('Duplicate assessment requirement IDs')
const examTruthIds=new Set(examTruth.papers.map((paper)=>paper.exam_truth_id))
for(const requirement of examTruth.assessment_requirement_denominator){
  if(!requirement.mapped_exam_truth_ids?.length)throw new Error(`${requirement.id} has no Exam Truth mapping`)
  for(const id of requirement.mapped_exam_truth_ids)if(!examTruthIds.has(id))throw new Error(`${requirement.id} references unknown Exam Truth ID ${id}`)
}
if(!examTruth.remaining_before_exam_truth_promotion.length)throw new Error('Exam Truth preparation must retain explicit unresolved promotion work')

console.log('AQA Business 7132 Course/Exam Truth preparation: PASS')
console.log(`- Course Truth requirements prepared: ${courseTruth.requirements.length}/42`)
console.log(`- curriculum blockers retained: ${courseTruth.summary.blocked_requirement_ids.join(', ')}`)
console.log(`- Exam Truth paper records prepared: ${examTruth.papers.length}/3`)
console.log(`- assessment requirements currently structured: ${examTruth.assessment_requirement_denominator.length}`)
console.log('- common AQA Business command-word demand layer prepared from REFERENCE_ONLY alignment evidence')
console.log('- promotion remains prohibited until BUS-FIN-008 v0.7 reassurance PASS and question-family/marking-behaviour denominator completion')
