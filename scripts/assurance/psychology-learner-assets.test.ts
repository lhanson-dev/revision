import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { derivePsychologyCourseLearningBlueprint } from '../content/derive-psychology-course-learning-blueprint'
import { derivePsychologyLearnerAssets } from '../content/derive-psychology-learner-assets'

type ExamTruth = {
  assessmentModel: {
    papers: Array<{
      id: string
      durationMinutes: number
      rawMarks: number
      sections: Array<{
        id: string
        marks: number
        scope:
          | { type: 'topic'; topicNumber: number; topic: string }
          | { type: 'option_group'; choose: number; topicNumbers: number[]; topics: string[] }
      }>
    }>
  }
}

const ROOT = process.cwd()
const PROTOTYPE = join(ROOT, 'research/source-first-course-prototype')
const COURSE_TRUTH = join(PROTOTYPE, 'psychology-course-truth')
const EXAM_TRUTH = join(PROTOTYPE, 'psychology-exam-truth', 'assessment-blueprint.json')

function flattenLearnerText(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(flattenLearnerText).join('\n')
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).map(flattenLearnerText).join('\n')
  return ''
}

describe('AQA Psychology 7182 source-first learner asset corpus', () => {
  it('produces complete Learn, Practice and Exam Prep candidates from Course Truth + Blueprint without publication overclaim', () => {
    const assets = derivePsychologyLearnerAssets(COURSE_TRUTH, EXAM_TRUTH)
    const blueprint = derivePsychologyCourseLearningBlueprint(COURSE_TRUTH, EXAM_TRUTH)

    expect(assets.status).toBe('experimental_learner_asset_candidate_complete')
    expect(assets.courseId).toBe('aqa:aqa-a-level:7182')
    expect(assets.summary).toMatchObject({
      topicCount: 17,
      requirementCount: 118,
      learnChapterCount: 17,
      learnSectionCount: 118,
      examSkillModuleCount: 6,
      topicExamPrepSetCount: 17,
      fullPaperSimulationCount: 3,
      paidProviderSpendGbp: 0,
      paidSourceLicenceSpendGbp: 0,
      learnerAssetCorpusComplete: true,
      markingPacksComplete: false,
      freshIndependentEducationalAssurancePassed: false,
      freshIndependentAssessmentAssurancePassed: false,
      canonicalRuntimeIntegrated: false,
      restrictedPilotPublicationApproved: false,
    })

    const learnSections = assets.learn.chapters.flatMap((chapter) => chapter.sections)
    const learnRequirementIds = learnSections.flatMap((section) => section.requirementIds)
    const blueprintRequirementIds = blueprint.requirementUnits.flatMap((unit) => unit.knowledgeNodeIds)
    expect(learnRequirementIds).toHaveLength(118)
    expect(new Set(learnRequirementIds).size).toBe(118)
    expect([...learnRequirementIds].sort()).toEqual([...blueprintRequirementIds].sort())

    for (const section of learnSections) {
      expect(section.explanationParagraphs.length, section.id).toBeGreaterThan(0)
      expect(section.learningGoal.length, section.id).toBeGreaterThan(20)
      expect(section.provenance.courseTruthRequirementIds, section.id).toEqual(section.requirementIds)
      expect(section.provenance.blueprintUnitIds, section.id).toEqual(section.blueprintUnitIds)
      expect(section.provenance.boardAlignmentUse, section.id).toBe('placement_only_reference_not_learner_text')
      expect(section.memoryRecap.length, section.id).toBeGreaterThan(0)
      for (const source of section.provenance.sourceEvidence) {
        expect(source.classification, `${section.id}:${source.url}`).not.toBe('REFERENCE_ONLY')
      }
    }

    const sectionByRequirementId = new Map(learnSections.map((section) => [section.requirementIds[0], section]))
    for (const unit of blueprint.requirementUnits) {
      const requirementId = unit.knowledgeNodeIds[0]
      const section = sectionByRequirementId.get(requirementId)
      expect(section, requirementId).toBeDefined()
      for (const treatment of unit.learnTreatments) expect(section?.treatmentCoverage, `${requirementId}:${treatment}`).toContain(treatment)

      if (unit.quantitativeVisualWorkedExampleRequirements.workedExampleRequired) {
        const hasWorked = Boolean(section?.workedExample || section?.quantitativeWorkedExample)
        expect(hasWorked, `${requirementId}:worked`).toBe(true)
      }
      if (unit.quantitativeVisualWorkedExampleRequirements.independentlyCheckableQuantitativeWork) {
        expect(section?.quantitativeWorkedExample, `${requirementId}:quantitative`).toBeDefined()
        expect(section?.quantitativeWorkedExample?.data.length, `${requirementId}:quantitative-data`).toBeGreaterThan(0)
        expect(section?.quantitativeWorkedExample?.workedSteps.length, `${requirementId}:quantitative-steps`).toBeGreaterThan(0)
      }
      if (unit.quantitativeVisualWorkedExampleRequirements.purposefulVisualRequired) {
        expect(section?.visual?.textAlternative.length, `${requirementId}:visual-alt`).toBeGreaterThan(20)
      }
      if (unit.misconceptionIds.length > 0) {
        expect(section?.misconceptionRepairs.length, `${requirementId}:misconceptions`).toBe(unit.misconceptionIds.length)
      }
    }

    const practice = assets.practice.activities
    const expectedPracticeModeCount = blueprint.requirementUnits.reduce((sum, unit) => sum + new Set(unit.practiceEvidenceModes).size, 0)
    expect(practice).toHaveLength(expectedPracticeModeCount)
    expect(new Set(practice.map((activity) => activity.id)).size).toBe(practice.length)

    const practiceByUnit = new Map<string, typeof practice>()
    for (const activity of practice) {
      expect(activity.evidenceEligible, activity.id).toBe(false)
      expect(activity.scoringStatus, activity.id).toBe('marking_pack_pending_step_5')
      expect(activity.prompt.length, activity.id).toBeGreaterThan(20)
      expect(activity.feedbackAnchor.length, activity.id).toBeGreaterThan(0)
      expect(activity.intendedEvidenceScope.length, activity.id).toBeGreaterThan(0)
      const unitId = activity.blueprintUnitIds[0]
      const bucket = practiceByUnit.get(unitId) ?? []
      bucket.push(activity)
      practiceByUnit.set(unitId, bucket)
    }
    for (const unit of blueprint.requirementUnits) {
      const modes = (practiceByUnit.get(unit.id) ?? []).map((activity) => activity.mode)
      expect([...modes].sort(), unit.id).toEqual([...new Set(unit.practiceEvidenceModes)].sort())
    }

    expect(assets.examPrep.skillModules.map((module) => module.id).sort()).toEqual(blueprint.examSkillUnits.map((unit) => unit.id).sort())
    for (const module of assets.examPrep.skillModules) {
      expect(module.guidance.length, module.id).toBeGreaterThan(0)
      expect(module.markingBoundary, module.id).toContain('Step 5')
    }

    const topicSetRequirementIds = assets.examPrep.topicSets.flatMap((set) => set.requirementIds)
    expect(new Set(topicSetRequirementIds)).toEqual(new Set(blueprintRequirementIds))
    for (const set of assets.examPrep.topicSets) {
      expect(set.questions.length, set.id).toBeGreaterThan(0)
      expect(set.questionFamiliesRepresented.length, set.id).toBeGreaterThan(0)
      expect(set.commandDemandClassesRepresented.length, set.id).toBeGreaterThan(0)
      expect(set.scoringStatus, set.id).toBe('marking_pack_pending_step_5')
      for (const question of set.questions) {
        expect(question.revisionOwned, question.id).toBe(true)
        expect(question.officialAqaMaterial, question.id).toBe(false)
        expect(question.markingPackStatus, question.id).toBe('pending_step_5')
      }
    }
  })

  it('builds three representative Revision-owned paper simulations with exact current paper/section/option totals', () => {
    const assets = derivePsychologyLearnerAssets(COURSE_TRUTH, EXAM_TRUTH)
    const examTruth = JSON.parse(readFileSync(EXAM_TRUTH, 'utf8')) as ExamTruth
    const simulations = assets.examPrep.fullPaperSimulations

    expect(simulations).toHaveLength(3)
    expect(simulations.map((paper) => paper.paperId)).toEqual(['7182/1', '7182/2', '7182/3'])

    for (const simulation of simulations) {
      const sourcePaper = examTruth.assessmentModel.papers.find((paper) => paper.id === simulation.paperId)
      expect(sourcePaper, simulation.paperId).toBeDefined()
      expect(simulation.durationMinutes, simulation.paperId).toBe(sourcePaper?.durationMinutes)
      expect(simulation.attemptedMarks, simulation.paperId).toBe(sourcePaper?.rawMarks)
      expect(simulation.revisionOwned, simulation.paperId).toBe(true)
      expect(simulation.officialAqaMaterial, simulation.paperId).toBe(false)
      expect(simulation.markingPackStatus, simulation.paperId).toBe('pending_step_5')

      for (const section of simulation.sections) {
        const sourceSection = sourcePaper?.sections.find((candidate) => candidate.id === section.id)
        expect(sourceSection, `${simulation.paperId}:${section.id}`).toBeDefined()
        expect(section.marks, `${simulation.paperId}:${section.id}`).toBe(sourceSection?.marks)
        if (section.options) {
          expect(section.choose, `${simulation.paperId}:${section.id}`).toBe(1)
          expect(section.options).toHaveLength(3)
          for (const option of section.options) {
            expect(option.questions.reduce((sum, question) => sum + question.marks, 0), `${simulation.paperId}:${section.id}:T${option.topicNumber}`).toBe(section.marks)
          }
        } else {
          expect(section.questions?.reduce((sum, question) => sum + question.marks, 0), `${simulation.paperId}:${section.id}`).toBe(section.marks)
        }
      }
    }

    const paper3 = simulations.find((paper) => paper.paperId === '7182/3')
    expect(paper3?.sections[0].questions?.reduce((sum, question) => sum + question.marks, 0)).toBe(24)
    expect(paper3?.sections.slice(1).every((section) => section.choose === 1 && section.options?.length === 3)).toBe(true)
  })

  it('keeps official AQA reference prose and URLs out of learner-facing copy', () => {
    const assets = derivePsychologyLearnerAssets(COURSE_TRUTH, EXAM_TRUTH)
    const learnerFacing = {
      learn: assets.learn.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        introduction: chapter.introduction,
        sections: chapter.sections.map((section) => ({
          id: section.id,
          title: section.title,
          learningGoal: section.learningGoal,
          explanationParagraphs: section.explanationParagraphs,
          researchAndRelationshipParagraphs: section.researchAndRelationshipParagraphs,
          evaluationParagraphs: section.evaluationParagraphs,
          misconceptionRepairs: section.misconceptionRepairs,
          memoryRecap: section.memoryRecap,
          workedExample: section.workedExample,
          quantitativeWorkedExample: section.quantitativeWorkedExample,
          visual: section.visual,
        })),
      })),
      practice: assets.practice.activities.map(({ prompt, support, feedbackAnchor, repairExtension }) => ({ prompt, support, feedbackAnchor, repairExtension })),
      examPrep: {
        skillModules: assets.examPrep.skillModules,
        topicQuestions: assets.examPrep.topicSets.flatMap((set) => set.questions.map((question) => question.prompt)),
        simulationQuestions: assets.examPrep.fullPaperSimulations.flatMap((paper) => paper.sections.flatMap((section) => section.questions?.map((question) => question.prompt) ?? section.options?.flatMap((option) => option.questions.map((question) => question.prompt)) ?? [])),
      },
    }
    const rendered = flattenLearnerText(learnerFacing)
    expect(rendered).not.toMatch(/https:\/\/www\.aqa\.org\.uk/i)
    expect(rendered).not.toMatch(/https:\/\/aqa\.org\.uk/i)
    expect(rendered).not.toContain('officialSource')
  })
})
