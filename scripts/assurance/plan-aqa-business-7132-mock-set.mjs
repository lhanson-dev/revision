import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const PATHS = {
  profile: 'content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json',
  calibration: 'content-factory/mock-exams/aqa-7132/CALIBRATION.json',
  items: 'research/aqa-business-7132/2027/NAMED_ITEMS.json',
  materialiser: 'scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs',
  course: '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-truth.json',
  exam: '.artifacts/content-factory-aqa-business-7132-course-exam-truth/exam-truth.json',
  out: '.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json',
}
const AOS = ['AO1', 'AO2', 'AO3', 'AO4']
const fail = (ok, msg) => { if (!ok) throw new Error(msg) }
const sum = (xs) => xs.reduce((a, b) => a + b, 0)
const canon = (v) => Array.isArray(v) ? v.map(canon) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v
const hash = (v) => createHash('sha256').update(JSON.stringify(canon(v))).digest('hex')
const aoSum = (slots) => Object.fromEntries(AOS.map((ao) => [ao, sum(slots.map((s) => s.ao[ao] || 0))]))
const major = (id) => id.split('.').slice(0, 2).join('.')
const slot = (id, marks, command, sections, ao, o = {}) => ({
  id, marks, command, sections, ao, qmarks: o.q || 0, context: o.context || null,
  choice: o.choice || null, compulsory: o.compulsory ?? true, family: o.family,
})

function paper1() {
  const sections = ['3.1.1','3.1.2','3.1.3','3.2.1','3.2.2','3.2.3','3.3.1','3.3.3','3.4.1','3.4.3','3.4.4','3.5.1','3.6.1','3.7.1','3.9.2']
  const out = sections.map((section, i) => slot(`P1-A-${String(i + 1).padStart(2, '0')}`, 1, 'selected_response', [section], i < 9 ? {AO1:1,AO2:0,AO3:0,AO4:0} : {AO1:0,AO2:1,AO3:0,AO4:0}, {family:'MCQ', q:i === 0 ? 1 : 0}))
  return out.concat([
    slot('P1-B-01',4,'calculate',['3.3.1'],{AO1:1,AO2:3,AO3:0,AO4:0},{family:'SHORT_ANSWER',q:4}),
    slot('P1-B-02',4,'calculate',['3.4.2'],{AO1:1,AO2:3,AO3:0,AO4:0},{family:'SHORT_ANSWER',q:4}),
    slot('P1-B-03',4,'explain',['3.4.5'],{AO1:2,AO2:2,AO3:0,AO4:0},{family:'SHORT_ANSWER'}),
    slot('P1-B-04',5,'explain',['3.5.3'],{AO1:2,AO2:3,AO3:0,AO4:0},{family:'SHORT_ANSWER'}),
    slot('P1-B-05',9,'analyse',['3.5.4'],{AO1:2,AO2:4,AO3:3,AO4:0},{family:'SHORT_ANSWER'}),
    slot('P1-B-06',9,'analyse',['3.6.3'],{AO1:2,AO2:4,AO3:3,AO4:0},{family:'SHORT_ANSWER'}),
    slot('P1-C-01',25,'extended_evaluation',['3.7.4','3.7.5'],{AO1:6,AO2:3,AO3:8,AO4:8},{family:'ESSAY',choice:'P1-C',compulsory:false}),
    slot('P1-C-02',25,'extended_evaluation',['3.7.6','3.7.7'],{AO1:6,AO2:3,AO3:8,AO4:8},{family:'ESSAY',choice:'P1-C',compulsory:false}),
    slot('P1-D-01',25,'extended_evaluation',['3.8.1','3.8.2'],{AO1:5,AO2:2,AO3:6,AO4:12},{family:'ESSAY',choice:'P1-D',compulsory:false}),
    slot('P1-D-02',25,'extended_evaluation',['3.9.1','3.9.3'],{AO1:5,AO2:2,AO3:6,AO4:12},{family:'ESSAY',choice:'P1-D',compulsory:false}),
  ])
}
function paper2() { return [
  slot('P2-S1-01',3,'describe',['3.3.4'],{AO1:3,AO2:0,AO3:0,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-1'}),
  slot('P2-S1-02',3,'calculate',['3.5.2'],{AO1:1,AO2:2,AO3:0,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-1',q:3}),
  slot('P2-S1-03',9,'analyse',['3.3.2'],{AO1:2,AO2:4,AO3:3,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-1'}),
  slot('P2-S1-04',20,'extended_evaluation',['3.5.4','3.7.3'],{AO1:2,AO2:5,AO3:6,AO4:7},{family:'DATA_RESPONSE',context:'P2-CTX-1'}),
  slot('P2-S2-01',6,'explain',['3.6.4'],{AO1:3,AO2:3,AO3:0,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-2'}),
  slot('P2-S2-02',9,'analyse',['3.6.2'],{AO1:2,AO2:3,AO3:4,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-2',q:6}),
  slot('P2-S2-03',16,'extended_evaluation',['3.6.5','3.6.3'],{AO1:2,AO2:4,AO3:5,AO4:5},{family:'DATA_RESPONSE',context:'P2-CTX-2'}),
  slot('P2-S3-01',9,'analyse',['3.10.3'],{AO1:2,AO2:3,AO3:4,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-3',q:9}),
  slot('P2-S3-02',9,'analyse',['3.9.4'],{AO1:2,AO2:3,AO3:4,AO4:0},{family:'DATA_RESPONSE',context:'P2-CTX-3'}),
  slot('P2-S3-03',16,'extended_evaluation',['3.9.2','3.7.1'],{AO1:2,AO2:2,AO3:2,AO4:10},{family:'DATA_RESPONSE',context:'P2-CTX-3'}),
]}
function paper3() { return [
  slot('P3-Q-01',12,'analyse',['3.2.2'],{AO1:3,AO2:3,AO3:6,AO4:0},{family:'CASE_STUDY',context:'P3-CASE-1',q:6}),
  slot('P3-Q-02',12,'analyse',['3.4.5','3.4.3'],{AO1:3,AO2:3,AO3:6,AO4:0},{family:'CASE_STUDY',context:'P3-CASE-1'}),
  slot('P3-Q-03',16,'evaluate',['3.5.4','3.5.1'],{AO1:3,AO2:3,AO3:5,AO4:5},{family:'CASE_STUDY',context:'P3-CASE-1'}),
  slot('P3-Q-04',16,'extended_evaluation',['3.6.3','3.6.1'],{AO1:3,AO2:3,AO3:4,AO4:6},{family:'CASE_STUDY',context:'P3-CASE-1'}),
  slot('P3-Q-05',20,'extended_evaluation',['3.9.3','3.7.5'],{AO1:3,AO2:3,AO3:5,AO4:9},{family:'CASE_STUDY',context:'P3-CASE-1'}),
  slot('P3-Q-06',24,'extended_evaluation',['3.10.1','3.7.7'],{AO1:3,AO2:3,AO3:6,AO4:12},{family:'CASE_STUDY',context:'P3-CASE-1'}),
]}

function prefs(s, index) {
  if (s.qmarks > 0 && index === 0) return ['formula']
  if (s.command === 'selected_response') return ['concept','model','formula','skill']
  if (s.command === 'calculate') return ['formula']
  if (['describe','explain'].includes(s.command)) return ['concept','model','skill','formula']
  return ['skill','model','concept','formula']
}
function hydrate(slots, bySection, used, requirements) {
  return slots.map((s) => {
    fail(sum(Object.values(s.ao)) === s.marks, `${s.id} AO marks do not reconcile`)
    const targets = s.sections.map((section, i) => {
      const requirementId = `AQA-7132-${section}`
      fail(requirements.has(requirementId), `${s.id} references unknown Course Truth requirement ${requirementId}`)
      const candidates = bySection.get(section) || []
      let chosen
      for (const kind of prefs(s, i)) {
        chosen = candidates.find((x) => x.kind === kind && !used.has(x.id))
        if (chosen) break
      }
      if (!chosen) chosen = candidates.find((x) => !used.has(x.id))
      fail(chosen, `${s.id} cannot allocate an unused named item for ${section}`)
      used.add(chosen.id)
      return {course_requirement_id:requirementId,named_item_id:chosen.id,label:chosen.label,kind:chosen.kind,direct_demand_required:true,necessary_for_full_marks:true}
    })
    fail(s.qmarks === 0 || targets.some((t) => t.kind === 'formula'), `${s.id} quantitative allocation lacks formula evidence`)
    return {...s, targets}
  })
}
function p1Paths(slots) {
  const compulsory = slots.filter((s) => s.compulsory)
  const c = slots.filter((s) => s.choice === 'P1-C'), d = slots.filter((s) => s.choice === 'P1-D')
  fail(c.length === 2 && d.length === 2, 'Paper 1 choice groups drifted')
  return c.flatMap((cs) => d.map((ds) => {
    const selected = [...compulsory, cs, ds]
    return {id:`${cs.id}+${ds.id}`,selected_slot_ids:selected.map((s)=>s.id),attempted_marks:sum(selected.map((s)=>s.marks)),ao:aoSum(selected),quantitative_marks:sum(selected.map((s)=>s.qmarks))}
  }))
}
function bounds(range, total) { return [Math.ceil(range[0] * total / 100 - 1e-9), Math.floor(range[1] * total / 100 + 1e-9)] }
function validAo(component, ao, profile) {
  for (const key of AOS) {
    const b = bounds(profile.invariants.assessment_objectives[key].paper_percent_ranges[component], profile.invariants.total_attempted_raw_marks)
    fail(ao[key] >= b[0] && ao[key] <= b[1], `${component} ${key} ${ao[key]} outside ${b[0]}-${b[1]}`)
  }
}
function context(component) {
  if (component === '7132/1') return {mode:'independent_question_contexts',source_policy:'synthetic_or_context_free'}
  if (component === '7132/2') return {mode:'three_shared_data_response_contexts',source_policy:'synthetic_business_and_synthetic_data',context_ids:['P2-CTX-1','P2-CTX-2','P2-CTX-3'],coherence_rule:'fixed_fact_state_per_set'}
  return {mode:'single_shared_case_study',source_policy:'synthetic_business_and_synthetic_data',context_ids:['P3-CASE-1'],coherence_rule:'one_fixed_case_fact_state'}
}

async function main() {
  const readJson = (p) => readFile(p, 'utf8').then(JSON.parse)
  const [profile, calibration, named] = await Promise.all([readJson(PATHS.profile), readJson(PATHS.calibration), readJson(PATHS.items)])
  fail(calibration.course_id === profile.course_id && calibration.exam_year === profile.exam_year, 'Calibration/profile mismatch')
  fail(calibration.status === 'REFERENCE_ONLY_DERIVED_METADATA' && calibration.sources.every((s) => s.rights_classification === 'REFERENCE_ONLY'), 'Calibration rights boundary drift')
  fail(calibration.observations?.['7132/1']?.section_b?.tariffs?.join(',') === '4,4,4,5,9,9', 'P1 calibration drift')
  fail(calibration.observations?.['7132/2']?.sets?.map((s) => s.attempted_marks).join(',') === '35,31,34', 'P2 calibration drift')
  fail(calibration.observations?.['7132/3']?.single_case_question_tariffs?.join(',') === '12,12,16,16,20,24', 'P3 calibration drift')

  execFileSync(process.execPath, [PATHS.materialiser], {stdio:'pipe'})
  const [course, exam] = await Promise.all([readJson(PATHS.course), readJson(PATHS.exam)])
  fail(course.course.course_id === profile.course_id && course.course.exam_year === profile.exam_year, 'Course Truth/profile mismatch')
  fail(course.coverage?.projection_ready && course.coverage?.unresolved_requirement_count === 0, 'Course Truth is not projection-ready')
  fail(exam.exam_truth_id === profile.exam_truth_id && exam.exam_truth_fingerprint, 'Exam Truth/profile mismatch')

  const requirements = new Set(course.requirements.map((r) => r.requirement_id))
  const bySection = new Map()
  for (const item of named.items) { if (!bySection.has(item.section)) bySection.set(item.section, []); bySection.get(item.section).push(item) }
  const used = new Set()
  const p1 = hydrate(paper1(), bySection, used, requirements), p2 = hydrate(paper2(), bySection, used, requirements), p3 = hydrate(paper3(), bySection, used, requirements)
  const paths = p1Paths(p1)
  fail(sum(p1.map((s) => s.marks)) === 150, 'P1 printed marks must be 150')
  fail(paths.length === 4 && paths.every((p) => p.attempted_marks === 100), 'P1 response paths must each total 100')
  paths.forEach((p) => validAo('7132/1', p.ao, profile))
  fail(paths.every((p) => JSON.stringify(p.ao) === JSON.stringify(paths[0].ao)), 'P1 AO validity depends on option choice')
  fail(sum(p2.map((s) => s.marks)) === 100 && sum(p3.map((s) => s.marks)) === 100, 'P2/P3 marks must each total 100')
  validAo('7132/2', aoSum(p2), profile); validAo('7132/3', aoSum(p3), profile)
  fail(['P2-CTX-1','P2-CTX-2','P2-CTX-3'].map((id) => sum(p2.filter((s)=>s.context===id).map((s)=>s.marks))).join(',') === '35,31,34', 'P2 set totals drifted')
  fail(p3.length === 6 && p3.every((s) => s.context === 'P3-CASE-1'), 'P3 must be one case with six linked questions')

  const qmarks = paths[0].quantitative_marks + sum(p2.map((s)=>s.qmarks)) + sum(p3.map((s)=>s.qmarks))
  fail(qmarks >= profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set, `Only ${qmarks} quantitative marks planned`)
  const wholeAo = aoSum([...p2,...p3]); for (const ao of AOS) wholeAo[ao] += paths[0].ao[ao]
  for (const ao of AOS) { const b = bounds(profile.invariants.assessment_objectives[ao].overall_percent_range, profile.invariants.total_attempted_raw_marks); fail(wholeAo[ao] >= b[0] && wholeAo[ao] <= b[1], `Whole-set ${ao} outside ${b[0]}-${b[1]}`) }
  const covered = new Set([...p1,...p2,...p3].flatMap((s)=>s.sections))
  fail(covered.size >= 30, `Only ${covered.size} distinct Course Truth requirements planned`)
  const majors = [...new Set([...covered].map(major))].sort(); fail(JSON.stringify(majors) === JSON.stringify(['3.1','3.10','3.2','3.3','3.4','3.5','3.6','3.7','3.8','3.9']), 'Major-section breadth drift')

  const papers = [
    {component_id:'7132/1',name:'Business 1',duration_minutes:120,attempted_marks:100,printed_marks:150,structure:'15 MCQs; 35 compulsory short-answer marks; choose one 25-mark essay from C and one from D',context_plan:context('7132/1'),slots:p1,response_paths:paths},
    {component_id:'7132/2',name:'Business 2',duration_minutes:120,attempted_marks:100,printed_marks:100,structure:'three compulsory coherent data-response sets',context_plan:context('7132/2'),slots:p2,response_paths:[{id:'all_compulsory',attempted_marks:100,ao:aoSum(p2),quantitative_marks:sum(p2.map((s)=>s.qmarks))}]},
    {component_id:'7132/3',name:'Business 3',duration_minutes:120,attempted_marks:100,printed_marks:100,structure:'one compulsory shared case followed by six linked questions',context_plan:context('7132/3'),slots:p3,response_paths:[{id:'all_compulsory',attempted_marks:100,ao:aoSum(p3),quantitative_marks:sum(p3.map((s)=>s.qmarks))}]},
  ]
  const components = new Map(profile.components.map((c)=>[c.component_id,c])); for (const p of papers) { const c=components.get(p.component_id); fail(c && c.duration_minutes===p.duration_minutes && c.attempted_raw_marks===p.attempted_marks, `${p.component_id} profile drift`) }
  const core = {
    schema_version:1,plan_id:'aqa-business-7132-2027-mock-set-1-plan-v1',status:'deterministic_pre_generation_plan',course_id:profile.course_id,exam_year:profile.exam_year,planner_version:'aqa-7132-mock-planner-v1',
    dependencies:{mock_profile_id:profile.profile_id,mock_profile_fingerprint:hash(profile),calibration_id:calibration.calibration_id,calibration_fingerprint:hash(calibration),course_truth_projection_id:course.projection_id,course_truth_fingerprint:course.projection_fingerprint,exam_truth_id:exam.exam_truth_id,exam_truth_fingerprint:exam.exam_truth_fingerprint,named_items_fingerprint:hash(named)},
    rights_boundary:{awarding_body_use:'REFERENCE_ONLY',learner_facing_content_source:'Revision_authored_only',context_source:'synthetic_business_and_synthetic_data',protected_assessment_content_reuse_allowed:false},provider_calls_started:false,learner_content_created:false,
    planning_guards:{context_only_mentions_count_as_coverage:false,topic_prediction_prohibited:true,near_duplicate_text_check_required_after_generation:true,repeated_named_targets:'prohibited_in_this_plan',shared_context_fact_state_must_be_fixed_before_question_generation:true,optional_path_validity_required:true},
    papers,summary:{paper_count:3,attempted_marks_per_set:300,paper_1_printed_marks:150,minimum_path_quantitative_marks:qmarks,required_minimum_quantitative_marks:profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set,attempted_ao_marks:wholeAo,attempted_ao_percent_of_qualification:Object.fromEntries(AOS.map((ao)=>[ao,Number((wholeAo[ao]/3).toFixed(2))])),distinct_course_truth_requirements:covered.size,governed_course_truth_requirements:course.coverage.governed_requirement_count,major_sections_covered:majors,distinct_named_items:used.size},next_gate:'whole_paper_generation_runner_with_spend_guard',
  }
  const plan = {...core,plan_fingerprint:hash(core)}
  await mkdir(PATHS.out.slice(0, PATHS.out.lastIndexOf('/')), {recursive:true}); await writeFile(PATHS.out, `${JSON.stringify(plan,null,2)}\n`)
  console.log(JSON.stringify({status:'pass',planId:plan.plan_id,planFingerprint:plan.plan_fingerprint,output:PATHS.out,paperCount:3,attemptedMarks:300,paper1ResponsePaths:paths.length,minimumPathQuantitativeMarks:qmarks,attemptedAoMarks:wholeAo,distinctCourseTruthRequirements:covered.size,distinctNamedItems:used.size,providerSpendStarted:false,nextGate:plan.next_gate},null,2))
}
main().catch((e)=>{ console.error(e); process.exitCode=1 })
