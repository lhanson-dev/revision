import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const PLANNER = 'scripts/content-factory/plan-aqa-business-7132-mock-set.mjs'
const PROFILE_PATH = 'content-factory/mock-exams/aqa-7132/MOCK_PROFILE.json'
const PLAN_PATH = '.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sumAo(slots) {
  return slots.reduce((totals, slot) => {
    for (const ao of ['AO1', 'AO2', 'AO3', 'AO4']) totals[ao] += slot.ao_marks[ao]
    return totals
  }, { AO1: 0, AO2: 0, AO3: 0, AO4: 0 })
}

function addAo(left, right) {
  return Object.fromEntries(['AO1', 'AO2', 'AO3', 'AO4'].map((ao) => [ao, left[ao] + right[ao]]))
}

function assertAoRanges(aoMarks, profile, componentId, denominatorMarks, label) {
  for (const [ao, marks] of Object.entries(aoMarks)) {
    const qualificationPercentagePoints = (marks / denominatorMarks) * 100
    const [min, max] = profile.invariants.assessment_objectives[ao].paper_percent_ranges[componentId]
    assert(qualificationPercentagePoints >= min - 1e-9 && qualificationPercentagePoints <= max + 1e-9, `${label} ${ao} contributes ${qualificationPercentagePoints.toFixed(2)} qualification percentage points; expected ${min}-${max}`)
  }
}

function choicePaths(paper) {
  const compulsory = paper.slots.filter((slot) => slot.required_in_response_path)
  const groups = new Map()
  for (const slot of paper.slots.filter((item) => item.choice_group)) {
    if (!groups.has(slot.choice_group)) groups.set(slot.choice_group, [])
    groups.get(slot.choice_group).push(slot)
  }
  let paths = [{ id: 'compulsory', slots: compulsory }]
  for (const [groupId, options] of groups) {
    paths = paths.flatMap((path) => options.map((option) => ({ id: `${path.id}+${groupId}:${option.slot_id}`, slots: [...path.slots, option] })))
  }
  return paths
}

async function main() {
  execFileSync(process.execPath, [PLANNER], { stdio: 'pipe' })
  const [profile, plan] = await Promise.all([
    readFile(PROFILE_PATH, 'utf8').then(JSON.parse),
    readFile(PLAN_PATH, 'utf8').then(JSON.parse),
  ])

  assert(plan.schema_version === 1, 'Unexpected mock plan schema')
  assert(plan.status === 'deterministic_pre_generation_plan', 'Mock plan is not pre-generation')
  assert(plan.course_id === profile.course_id && plan.exam_year === profile.exam_year, 'Mock plan course/version mismatch')
  assert(plan.dependencies.mock_profile_id === profile.profile_id, 'Mock plan points at wrong profile')
  assert(plan.provider_calls_used === 0, 'Deterministic planning must not use provider calls')
  assert(plan.generation_gate?.provider_spend_allowed === false, 'Provider spend must remain locked after planning')
  assert(plan.papers.length === 3, 'Mock set must contain exactly three papers')

  const profileComponents = new Map(profile.components.map((component) => [component.component_id, component]))
  const planPapers = new Map(plan.papers.map((paper) => [paper.component_id, paper]))
  assert(planPapers.size === 3 && [...profileComponents.keys()].every((id) => planPapers.has(id)), 'Mock set component IDs mismatch')

  const allPrintedSlots = plan.papers.flatMap((paper) => paper.slots)
  const slotIds = allPrintedSlots.map((slot) => slot.slot_id)
  assert(new Set(slotIds).size === slotIds.length, 'Duplicate mock slot IDs')
  for (const slot of allPrintedSlots) {
    assert(Object.values(slot.ao_marks).reduce((sum, value) => sum + value, 0) === slot.marks, `${slot.slot_id} AO marks do not reconcile`)
    assert(slot.quantitative_marks >= 0 && slot.quantitative_marks <= slot.marks, `${slot.slot_id} has invalid quantitative marks`)
    assert(slot.required_course_truth_requirement_ids?.length === 1, `${slot.slot_id} must have one primary Course Truth target in the initial plan`)
    assert(slot.required_subject_node_ids?.length > 0, `${slot.slot_id} is missing Subject Foundation dependencies`)
    assert(slot.coverage_evidence_rule === 'target_is_directly_demanded_and_necessary_for_full_marks', `${slot.slot_id} coverage rule drift`)
  }

  const targetIds = allPrintedSlots.flatMap((slot) => slot.required_course_truth_requirement_ids)
  assert(new Set(targetIds).size === targetIds.length, 'Initial printed plan must not repeat a primary Course Truth target')
  assert(plan.coverage.selected_requirement_count === 41, 'Initial plan should deliberately cover 41 of 42 Course Truth requirements')
  assert(plan.coverage.omitted_requirement_ids.length === 1, 'Initial plan should omit exactly one requirement rather than force all 42 into one set')

  let representativeOverallAo = { AO1: 0, AO2: 0, AO3: 0, AO4: 0 }
  let representativeQuantitativeMarks = 0

  for (const [componentId, paper] of planPapers) {
    const component = profileComponents.get(componentId)
    assert(paper.duration_minutes === component.duration_minutes, `${componentId} duration mismatch`)
    assert(paper.attempted_raw_marks === component.attempted_raw_marks, `${componentId} attempted-mark contract mismatch`)

    if (componentId === '7132/1') {
      assert(paper.printed_raw_marks === 150, 'Paper 1 must preserve the 150 printed / 100 attempted mark distinction')
      const paths = choicePaths(paper)
      assert(paths.length === 4, 'Paper 1 must expose exactly four permitted C/D response paths')
      for (const path of paths) {
        const marks = path.slots.reduce((sum, slot) => sum + slot.marks, 0)
        const quantitativeMarks = path.slots.reduce((sum, slot) => sum + slot.quantitative_marks, 0)
        const aoMarks = sumAo(path.slots)
        assert(marks === 100, `Paper 1 response path ${path.id} does not reconcile to 100 marks`)
        assertAoRanges(aoMarks, profile, componentId, profile.invariants.total_attempted_raw_marks, `Paper 1 response path ${path.id}`)
        assert(quantitativeMarks === 8, `Paper 1 response path ${path.id} quantitative allocation drift`)
      }
      const representativePath = paths[0]
      representativeOverallAo = addAo(representativeOverallAo, sumAo(representativePath.slots))
      representativeQuantitativeMarks += representativePath.slots.reduce((sum, slot) => sum + slot.quantitative_marks, 0)
    } else {
      const marks = paper.slots.reduce((sum, slot) => sum + slot.marks, 0)
      const aoMarks = sumAo(paper.slots)
      assert(marks === 100, `${componentId} does not reconcile to 100 marks`)
      assertAoRanges(aoMarks, profile, componentId, profile.invariants.total_attempted_raw_marks, componentId)
      representativeOverallAo = addAo(representativeOverallAo, aoMarks)
      representativeQuantitativeMarks += paper.slots.reduce((sum, slot) => sum + slot.quantitative_marks, 0)
    }
  }

  for (const [ao, marks] of Object.entries(representativeOverallAo)) {
    const percent = (marks / profile.invariants.total_attempted_raw_marks) * 100
    const [min, max] = profile.invariants.assessment_objectives[ao].overall_percent_range
    assert(percent >= min - 1e-9 && percent <= max + 1e-9, `Whole-set ${ao} is ${percent.toFixed(2)}%; expected ${min}-${max}%`)
  }

  assert(representativeQuantitativeMarks >= profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set, `Whole-set quantitative allocation ${representativeQuantitativeMarks} is below ${profile.invariants.minimum_quantitative_marks_for_representative_three_paper_set}`)
  assert(representativeQuantitativeMarks === 34, 'Initial quantitative allocation drifted from the reviewed deterministic plan')

  const contextIds = allPrintedSlots.filter((slot) => slot.context_id).map((slot) => slot.context_id)
  assert(contextIds.filter((id) => id === 'P3-CASE-1').length === 6, 'Paper 3 must use one shared case context for all six planned questions')
  for (const id of ['P2-SET-1', 'P2-SET-2', 'P2-SET-3']) assert(contextIds.filter((value) => value === id).length >= 3, `${id} must own a coherent multi-part Paper 2 set`)

  console.log(JSON.stringify({
    status: 'pass',
    planId: plan.plan_id,
    planFingerprint: plan.plan_fingerprint,
    paperCount: plan.papers.length,
    paper1ChoicePathCount: 4,
    selectedCourseTruthRequirements: plan.coverage.selected_requirement_count,
    omittedRequirementIds: plan.coverage.omitted_requirement_ids,
    representativeOverallAoMarks: representativeOverallAo,
    representativeQuantitativeMarks,
    providerCallsUsed: 0,
    providerSpendAllowed: false,
    nextGate: 'founder_approved_planner_merge_then_bounded_mock_generation_runner',
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
