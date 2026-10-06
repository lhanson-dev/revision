import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { derivePsychologyLearnerAssets } from '../content/derive-psychology-learner-assets'
import { derivePsychologyMarkingPacks, type MarkingPack } from '../content/derive-psychology-marking-packs'

const ROOT = process.cwd()
const PROTOTYPE = join(ROOT, 'research/source-first-course-prototype')
const COURSE_TRUTH = join(PROTOTYPE, 'psychology-course-truth')
const EXAM_TRUTH = join(PROTOTYPE, 'psychology-exam-truth', 'assessment-blueprint.json')

const MODE_CLAIM: Record<string, string> = {
  retrieval_prompt_flashcard: 'knowledge_recall',
  recognition_discrimination_check: 'discrimination_or_structure',
  classification_matching_ordering: 'discrimination_or_structure',
  short_constructed_response: 'selected_knowledge_and_explanation',
  contextual_application_scenario: 'contextual_application',
  reasoning_chain_construction: 'analysis_reasoning',
  compare_justify_task: 'comparison_or_evaluation_judgement',
  calculation_quantitative_drill: 'quantitative_execution',
  interpretation_data_graph_source: 'data_interpretation',
  misconception_diagnostic: 'misconception_discrimination',
  mixed_topic_retrieval: 'synoptic_selection',
}

const DEFERRED = new Set([
  'classification_matching_ordering',
  'calculation_quantitative_drill',
  'interpretation_data_graph_source',
  'mixed_topic_retrieval',
])

function criterionTotal(markingPack: MarkingPack): number {
  return markingPack.criteria.reduce((sum, criterion) => sum + criterion.marks, 0)
}

function aoTotal(markingPack: MarkingPack): number {
  return (markingPack.aoAllocation.AO1 ?? 0) + (markingPack.aoAllocation.AO2 ?? 0) + (markingPack.aoAllocation.AO3 ?? 0)
}

describe('AQA Psychology 7182 source-first Step 5 marking packs and evidence mappings', () => {
  it('narrows Practice evidence claim-by-claim and refuses to promote under-specified base activities', () => {
    const assets = derivePsychologyLearnerAssets(COURSE_TRUTH, EXAM_TRUTH)
    const step5 = derivePsychologyMarkingPacks(COURSE_TRUTH, EXAM_TRUTH)
    const mappingById = new Map(step5.practice.evidenceMappings.map((mapping) => [mapping.itemId, mapping]))
    const packIds = new Set(step5.practice.markingPacks.map((markingPack) => markingPack.id))

    expect(step5.practice.evidenceMappings).toHaveLength(assets.practice.activities.length)
    for (const activity of assets.practice.activities) {
      const mapping = mappingById.get(activity.id)
      expect(mapping, activity.id).toBeDefined()
      expect(mapping?.permittedEvidenceClaims, activity.id).toEqual([MODE_CLAIM[activity.mode]])
      expect(mapping?.runtimeEvidenceEligible, activity.id).toBe(false)
      expect(mapping?.readinessEvidenceEligible, activity.id).toBe(false)

      if (DEFERRED.has(activity.mode)) {
        expect(mapping?.scoreability, activity.id).toBe('requires_concrete_variant')
        expect(mapping?.markingPackId, activity.id).toBeUndefined()
        expect(mapping?.limitation?.length, activity.id).toBeGreaterThan(30)
      } else {
        expect(mapping?.scoreability, activity.id).toBe('marking_pack_candidate_complete')
        expect(mapping?.markingPackId, activity.id).toBe(`MP-${activity.id}`)
        expect(packIds.has(`MP-${activity.id}`), activity.id).toBe(true)
        const pack = step5.practice.markingPacks.find((candidate) => candidate.id === `MP-${activity.id}`)
        expect(pack, activity.id).toBeDefined()
        expect(pack?.criteria.every((criterion) => criterion.evidenceClaim === MODE_CLAIM[activity.mode]), activity.id).toBe(true)
        expect(pack?.criteria.every((criterion) => criterion.description.length > 40), `${activity.id}:criterion-description`).toBe(true)
        if (activity.mode === 'recognition_discrimination_check') expect(pack?.scoredItem.alternatives, activity.id).toHaveLength(2)
        if (activity.mode === 'contextual_application_scenario') expect(pack?.scoredItem.context?.length, activity.id).toBeGreaterThan(40)
      }
    }
  })

  it('gives every item represented as scored a complete Revision-owned marking contract with deterministic arithmetic', () => {
    const step5 = derivePsychologyMarkingPacks(COURSE_TRUTH, EXAM_TRUTH)
    const packs = [
      ...step5.practice.markingPacks,
      ...step5.examPrep.topicMarkingPacks,
      ...step5.examPrep.fullPaperQuestionMarkingPacks,
    ]
    expect(packs.length).toBeGreaterThan(100)
    expect(new Set(packs.map((markingPack) => markingPack.id)).size).toBe(packs.length)

    for (const markingPack of packs) {
      expect(markingPack.scoredItem.prompt.length, markingPack.id).toBeGreaterThan(20)
      expect(markingPack.scoredItem.maxMark, markingPack.id).toBeGreaterThan(0)
      expect(criterionTotal(markingPack), `${markingPack.id}:criteria`).toBe(markingPack.scoredItem.maxMark)
      expect(aoTotal(markingPack), `${markingPack.id}:ao`).toBe(markingPack.scoredItem.maxMark)
      expect(markingPack.requirementIds.length, `${markingPack.id}:requirements`).toBeGreaterThan(0)
      expect(markingPack.blueprintUnitIds.length, `${markingPack.id}:blueprint`).toBeGreaterThan(0)
      expect(markingPack.indicativeContent.length, `${markingPack.id}:indicative`).toBeGreaterThan(0)
      expect(markingPack.levelDescriptors[0], `${markingPack.id}:levels`).toMatchObject({ min: 0, max: 0 })
      if (markingPack.scoredItem.maxMark <= 4) {
        expect(markingPack.levelDescriptors, `${markingPack.id}:exact-low-mark-levels`).toHaveLength(markingPack.scoredItem.maxMark + 1)
        expect(markingPack.levelDescriptors.map((level) => [level.min, level.max]), `${markingPack.id}:exact-low-mark-ranges`).toEqual(
          Array.from({ length: markingPack.scoredItem.maxMark + 1 }, (_, mark) => [mark, mark]),
        )
      }
      expect(markingPack.calibration.status, markingPack.id).toBe('uncalibrated_step_5_candidate')
      expect(markingPack.calibration.anchors, markingPack.id).toEqual([])
      expect(markingPack.calibration.independentCalibrationRequired, markingPack.id).toBe(true)
      expect(markingPack.rights.revisionOwnedQuestionAndRubric, markingPack.id).toBe(true)
      expect(markingPack.rights.officialAqaMaterialUsedAsReusableText, markingPack.id).toBe(false)
      expect(markingPack.ambiguityAndConfidence.abstentionRule.length, markingPack.id).toBeGreaterThan(30)
    }
  })

  it('materialises scoreable topic Exam Prep variants rather than pretending missing alternatives, contexts or data are already scoreable', () => {
    const assets = derivePsychologyLearnerAssets(COURSE_TRUTH, EXAM_TRUTH)
    const step5 = derivePsychologyMarkingPacks(COURSE_TRUTH, EXAM_TRUTH)
    const baseQuestions = assets.examPrep.topicSets.flatMap((set) => set.questions)
    const packs = new Map(step5.examPrep.topicMarkingPacks.map((markingPack) => [markingPack.itemId, markingPack]))
    const mappings = new Map(step5.examPrep.topicEvidenceMappings.map((mapping) => [mapping.itemId, mapping]))

    expect(packs.size).toBe(baseQuestions.length)
    for (const question of baseQuestions) {
      const markingPack = packs.get(question.id)
      const mapping = mappings.get(question.id)
      expect(markingPack, question.id).toBeDefined()
      expect(mapping?.scoreability, question.id).toBe('marking_pack_candidate_complete')
      expect(mapping?.runtimeEvidenceEligible, question.id).toBe(false)
      expect(markingPack?.scoredItem.maxMark, question.id).toBe(question.marks)
      if (question.questionFamily === 'mcq') expect(markingPack?.scoredItem.alternatives, question.id).toHaveLength(4)
      if (question.questionFamily === 'scenario_application' || question.questionFamily === 'research_methods_practical') {
        expect(markingPack?.scoredItem.context?.length, question.id).toBeGreaterThan(40)
      }
      if (question.questionFamily === 'data_math') expect(markingPack?.scoredItem.fixedData?.length, question.id).toBeGreaterThan(0)
    }
  })

  it('calibrates three current-structure paper simulations to exact AO, Research Methods and maths constraints for every valid Paper 3 option path', () => {
    const step5 = derivePsychologyMarkingPacks(COURSE_TRUTH, EXAM_TRUTH)
    const examTruth = JSON.parse(readFileSync(EXAM_TRUTH, 'utf8')) as {
      assessmentObjectives: Record<'AO1' | 'AO2' | 'AO3', {
        overallPercentRange: [number, number]
        paperContributionPercentOfQualification: Record<string, [number, number]>
      }>
      crossPaperConstraints: {
        researchMethodsOverallPercentRange: [number, number]
        mathematicalSkillsOverallPercentMinimum: number
      }
    }

    const papers = new Map(step5.examPrep.scoredPaperSimulations.map((paper) => [paper.paperId, paper]))
    expect([...papers.keys()]).toEqual(['7182/1', '7182/2', '7182/3'])
    expect(papers.get('7182/1')?.aoTotalsForAnyValidAttempt).toEqual({ AO1: 36, AO2: 24, AO3: 36 })
    expect(papers.get('7182/2')?.aoTotalsForAnyValidAttempt).toEqual({ AO1: 21, AO2: 54, AO3: 21 })
    expect(papers.get('7182/3')?.aoTotalsForAnyValidAttempt).toEqual({ AO1: 32, AO2: 16, AO3: 48 })
    expect(step5.qualificationCalibration.aoTotals).toEqual({ AO1: 89, AO2: 94, AO3: 105 })
    expect(step5.qualificationCalibration.researchMethodsMarks).toBe(72)
    expect(step5.qualificationCalibration.researchMethodsPercentage).toBe(25)
    expect(step5.qualificationCalibration.mathematicalSkillsMarks).toBe(32)
    expect(step5.qualificationCalibration.mathematicalSkillsPercentage).toBeGreaterThanOrEqual(10)

    for (const ao of ['AO1', 'AO2', 'AO3'] as const) {
      const pct = step5.qualificationCalibration.aoPercentages[ao]
      const [min, max] = examTruth.assessmentObjectives[ao].overallPercentRange
      expect(pct, `${ao}:overall`).toBeGreaterThanOrEqual(min)
      expect(pct, `${ao}:overall`).toBeLessThanOrEqual(max)
      for (const paper of step5.examPrep.scoredPaperSimulations) {
        const contribution = (paper.aoTotalsForAnyValidAttempt[ao] / 288) * 100
        const [paperMin, paperMax] = examTruth.assessmentObjectives[ao].paperContributionPercentOfQualification[paper.paperId]
        expect(contribution, `${paper.paperId}:${ao}`).toBeGreaterThanOrEqual(paperMin)
        expect(contribution, `${paper.paperId}:${ao}`).toBeLessThanOrEqual(paperMax)
      }
    }

    const rmPct = step5.qualificationCalibration.researchMethodsPercentage
    expect(rmPct).toBeGreaterThanOrEqual(examTruth.crossPaperConstraints.researchMethodsOverallPercentRange[0])
    expect(rmPct).toBeLessThanOrEqual(examTruth.crossPaperConstraints.researchMethodsOverallPercentRange[1])
    expect(step5.qualificationCalibration.mathematicalSkillsPercentage).toBeGreaterThanOrEqual(examTruth.crossPaperConstraints.mathematicalSkillsOverallPercentMinimum)

    const paper3 = papers.get('7182/3')
    expect(paper3).toBeDefined()
    const fixedQuestions = paper3?.sections.flatMap((section) => section.questions ?? []) ?? []
    const optionSections = paper3?.sections.filter((section) => section.options) ?? []
    expect(optionSections).toHaveLength(3)
    for (const b of optionSections[0].options ?? []) {
      for (const c of optionSections[1].options ?? []) {
        for (const d of optionSections[2].options ?? []) {
          const attempt = [...fixedQuestions, ...b.questions, ...c.questions, ...d.questions]
          expect(attempt.reduce((sum, question) => sum + question.maxMark, 0)).toBe(96)
          const ao = { AO1: 0, AO2: 0, AO3: 0 }
          for (const question of attempt) {
            ao.AO1 += question.aoAllocation.AO1 ?? 0
            ao.AO2 += question.aoAllocation.AO2 ?? 0
            ao.AO3 += question.aoAllocation.AO3 ?? 0
          }
          expect(ao).toEqual({ AO1: 32, AO2: 16, AO3: 48 })
        }
      }
    }
  })

  it('keeps Step 5 pre-publication and pre-runtime: marking packs are content contracts, not a production marker or readiness engine', () => {
    const step5 = derivePsychologyMarkingPacks(COURSE_TRUTH, EXAM_TRUTH)
    expect(step5.status).toBe('experimental_step_5_marking_evidence_complete')
    expect(step5.summary).toMatchObject({
      allItemsClassifiedForScoreability: true,
      allItemsRepresentedAsScoredHaveMarkingPacks: true,
      practiceEvidenceScopeNarrowingApplied: true,
      learnerAssetsMutated: false,
      runtimeEvidenceEnabled: false,
      markingPacksCompleteForStep5: false,
      markingPackCandidatesCompleteForStep5: true,
      independentCalibrationComplete: false,
      freshIndependentEducationalAssurancePassed: false,
      freshIndependentAssessmentAssurancePassed: false,
      canonicalRuntimeIntegrated: false,
      restrictedPilotPublicationApproved: false,
      paidProviderSpendGbp: 0,
      paidSourceLicenceSpendGbp: 0,
    })
    for (const mapping of [...step5.practice.evidenceMappings, ...step5.examPrep.topicEvidenceMappings]) {
      expect(mapping.runtimeEvidenceEligible, mapping.itemId).toBe(false)
      expect(mapping.readinessEvidenceEligible, mapping.itemId).toBe(false)
    }
  })
})
