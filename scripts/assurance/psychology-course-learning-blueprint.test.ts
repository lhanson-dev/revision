import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { derivePsychologyCourseLearningBlueprint, type RequirementLearningUnit } from '../content/derive-psychology-course-learning-blueprint'

type CourseTruthManifest = {
  courseTruthProgress: {
    namedRequirements: number
    courseTruthReadyRequirements: number
    materialSubjectTruthGapsKnown: number
    materialRightsBlockersKnown: number
    courseTruthComplete: boolean
  }
  topicShards: Array<{ topicNumber: number; path: string; namedRequirements: number; courseTruthReady: number }>
}

type TopicFile = {
  topicNumber: number
  requirements: Array<{ requirementId: string }>
}

type ExamTruth = {
  status: string
  assessmentModel: {
    papers: Array<{
      id: string
      sections: Array<{
        id: string
        scope:
          | { type: 'topic'; topicNumber: number }
          | { type: 'option_group'; topicNumbers: number[]; choose: number }
      }>
    }>
  }
  crossPaperConstraints: {
    researchMethodsAssessment: { alsoAssessableIn: string[] }
    mathematicalSkillsAlsoAssessableIn: string[]
  }
  questionFamilies: Array<{ id: string }>
  commandDemandModel: { commands: Record<string, string[]> }
  extendedResponse: { fixedMaximumEssayCountPerPaper: boolean }
  completion: {
    courseTruthComplete: boolean
    examTruthComplete: boolean
    freshIndependentAssessmentAssurancePassed: boolean
    learnerAssetReady: boolean
    restrictedPilotPublicationApproved: boolean
  }
}

type BlueprintContract = {
  status: string
  inputs: { requiredRequirementCount: number; requiredExamTruthStatus: string }
  projection: { assetQuotaPolicy: string; baselineLearnTreatment: string; baselinePracticeMode: string }
  evidenceBoundary: { learn: string[] }
  rights: { awardingBodyMaterial: string; downstreamAqaSourceTextPermitted: boolean; structuredAssessmentFactsPermitted: boolean }
  completionBoundary: {
    freshIndependentEducationalAssurancePassed: boolean
    freshIndependentAssessmentAssurancePassed: boolean
    learnerAssetReady: boolean
    restrictedPilotPublicationApproved: boolean
  }
}

type BlueprintManifest = {
  status: string
  blueprint: {
    requirementPlanningUnits: number
    examSkillUnits: number
    courseTruthCoverageComplete: boolean
    deterministicDerivationPassed: boolean
    assetQuotaPolicy: string
    freshIndependentEducationalAssurancePassed: boolean
    freshIndependentAssessmentAssurancePassed: boolean
    learnerAssetReady: boolean
    restrictedPilotPublicationApproved: boolean
  }
  economics: { paidProviderSpendGbp: number; paidSourceLicenceSpendGbp: number }
}

const ROOT = process.cwd()
const PROTOTYPE = join(ROOT, 'research/source-first-course-prototype')
const COURSE_TRUTH = join(PROTOTYPE, 'psychology-course-truth')
const EXAM_TRUTH = join(PROTOTYPE, 'psychology-exam-truth')
const BLUEPRINT = join(PROTOTYPE, 'psychology-course-learning-blueprint')

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function expectTreatment(unit: RequirementLearningUnit, classification: string, learn: string[] = [], practice: string[] = []) {
  if (!unit.learningClassifications.includes(classification as never)) return
  for (const treatment of learn) expect(unit.learnTreatments, `${unit.id} ${classification} Learn`).toContain(treatment)
  for (const mode of practice) expect(unit.practiceEvidenceModes, `${unit.id} ${classification} Practice`).toContain(mode)
}

describe('AQA Psychology 7182 source-first Course Learning Blueprint', () => {
  it('projects every Course Truth requirement into governed learning and evidence obligations', () => {
    const courseManifest = readJson<CourseTruthManifest>(join(COURSE_TRUTH, 'manifest.json'))
    const examTruth = readJson<ExamTruth>(join(EXAM_TRUTH, 'assessment-blueprint.json'))
    const contract = readJson<BlueprintContract>(join(BLUEPRINT, 'blueprint-contract.json'))
    const manifest = readJson<BlueprintManifest>(join(BLUEPRINT, 'manifest.json'))
    const derived = derivePsychologyCourseLearningBlueprint(COURSE_TRUTH, join(EXAM_TRUTH, 'assessment-blueprint.json'))

    expect(courseManifest.courseTruthProgress).toMatchObject({
      namedRequirements: 118,
      courseTruthReadyRequirements: 118,
      materialSubjectTruthGapsKnown: 0,
      materialRightsBlockersKnown: 0,
      courseTruthComplete: true,
    })
    expect(courseManifest.topicShards).toHaveLength(17)
    expect(examTruth.status).toBe('experimental_exam_truth_complete')
    expect(examTruth.completion).toMatchObject({
      courseTruthComplete: true,
      examTruthComplete: true,
      freshIndependentAssessmentAssurancePassed: false,
      learnerAssetReady: false,
      restrictedPilotPublicationApproved: false,
    })

    const truthIds = readdirSync(COURSE_TRUTH)
      .filter((name) => /^topic-\d+.*\.json$/.test(name))
      .sort()
      .flatMap((name) => readJson<TopicFile>(join(COURSE_TRUTH, name)).requirements.map((requirement) => requirement.requirementId))

    expect(truthIds).toHaveLength(118)
    expect(new Set(truthIds).size).toBe(118)
    expect(derived.status).toBe('experimental_course_learning_blueprint_complete')
    expect(derived.requirementUnits).toHaveLength(118)
    expect(derived.requirementUnits.map((unit) => unit.knowledgeNodeIds[0]).sort()).toEqual([...truthIds].sort())
    expect(new Set(derived.requirementUnits.map((unit) => unit.id)).size).toBe(118)
    expect(derived.summary).toMatchObject({
      requirementUnitCount: 118,
      courseTruthRequirementCount: 118,
      examSkillUnitCount: 6,
      assetQuotaPolicy: 'none',
      paidProviderSpendGbp: 0,
      paidSourceLicenceSpendGbp: 0,
      freshIndependentEducationalAssurancePassed: false,
      freshIndependentAssessmentAssurancePassed: false,
      learnerAssetReady: false,
      restrictedPilotPublicationApproved: false,
    })

    const validFamilyIds = new Set(examTruth.questionFamilies.map((family) => family.id))
    const validCommandClasses = new Set(Object.keys(examTruth.commandDemandModel.commands))

    for (const unit of derived.requirementUnits) {
      expect(unit.foundationFingerprint).toBe('not_applicable_source_first_experiment')
      expect(unit.knowledgeNodeIds).toHaveLength(1)
      expect(unit.learnTreatments).toContain('core_explanation')
      expect(unit.practiceEvidenceModes).toContain('short_constructed_response')
      expect(unit.practiceEvidenceModes).toContain('contextual_application_scenario')
      expect(unit.permittedEvidenceClaims.learn).toEqual(['reviewed_only'])
      expect(unit.permittedEvidenceClaims.practice.length).toBeGreaterThan(0)
      expect(unit.examDemandLinks).toHaveLength(1)
      expect(unit.provenance.boardAlignmentUseClass).toBe('REFERENCE_ONLY')
      expect(unit.provenance.subjectTruthUse).toBe('rights_safe_course_truth_only')
      expect(unit.accessibilityMediaRequirements.colourNotSoleMeaningCarrier).toBe(true)
      expect(unit.accessibilityMediaRequirements.captionsTranscriptsControlsWhenMediaUsed).toBe(true)
      expect(unit.accessibilityMediaRequirements.mobileMustPreserveLearningSequence).toBe(true)

      for (const family of unit.examDemandLinks[0].questionFamilies) expect(validFamilyIds.has(family), `${unit.id} family ${family}`).toBe(true)
      for (const demandClass of unit.examDemandLinks[0].commandDemandClasses) expect(validCommandClasses.has(demandClass), `${unit.id} demand ${demandClass}`).toBe(true)

      expectTreatment(unit, 'fact_term', ['definition_in_context', 'memory_anchor_recap'], ['retrieval_prompt_flashcard'])
      expectTreatment(unit, 'concept', ['example_non_example'], ['short_constructed_response'])
      expectTreatment(unit, 'comparison_discrimination', ['comparison'], ['recognition_discrimination_check', 'compare_justify_task'])
      expectTreatment(unit, 'relationship_causal', ['relationship_causal_chain'], ['reasoning_chain_construction'])
      expectTreatment(unit, 'process_sequence', ['process_sequence', 'purposeful_visual'], ['classification_matching_ordering'])
      expectTreatment(unit, 'formula_quantitative', ['worked_example', 'faded_guided_example', 'purposeful_visual'], ['calculation_quantitative_drill', 'interpretation_data_graph_source'])
      expectTreatment(unit, 'procedure_skill', ['worked_example', 'faded_guided_example'], ['contextual_application_scenario'])
      expectTreatment(unit, 'analysis_reasoning', ['worked_example', 'self_explanation_prompt'], ['reasoning_chain_construction'])
      expectTreatment(unit, 'evaluation_judgement', [], ['compare_justify_task'])
      expectTreatment(unit, 'misconception_risk', ['misconception_repair'], ['misconception_diagnostic'])
      expectTreatment(unit, 'synoptic_connection', ['connection_synoptic_link'], ['mixed_topic_retrieval'])

      if (unit.learningClassifications.includes('misconception_risk')) expect(unit.misconceptionIds.length, unit.id).toBeGreaterThan(0)
      if (unit.learningClassifications.includes('formula_quantitative')) {
        expect(unit.quantitativeVisualWorkedExampleRequirements).toMatchObject({
          workedExampleRequired: true,
          fadedGuidedExampleRequired: true,
          purposefulVisualRequired: true,
          independentlyCheckableQuantitativeWork: true,
        })
      }
      if (unit.learningClassifications.includes('procedure_skill')) {
        expect(unit.scaffoldingFadingRequirements.required, unit.id).toBe(true)
        expect(unit.scaffoldingFadingRequirements.independentPerformanceRequiredForEvidence, unit.id).toBe(true)
      }
      if (unit.learningClassifications.includes('synoptic_connection')) expect(unit.synopticMixedPracticeLinks.length, unit.id).toBeGreaterThan(0)
    }

    const expectedPaperByTopic = new Map<number, { paperId: string; sectionId: string; scopeType: 'topic' | 'option_group' }>()
    for (const paper of examTruth.assessmentModel.papers) {
      for (const section of paper.sections) {
        const numbers = section.scope.type === 'topic' ? [section.scope.topicNumber] : section.scope.topicNumbers
        for (const topicNumber of numbers) expectedPaperByTopic.set(topicNumber, { paperId: paper.id, sectionId: section.id, scopeType: section.scope.type })
      }
    }
    expect(expectedPaperByTopic.size).toBe(17)
    for (const unit of derived.requirementUnits) {
      expect(unit.examDemandLinks[0], unit.id).toMatchObject(expectedPaperByTopic.get(unit.topicNumber))
    }

    const quantitativeUnits = derived.requirementUnits.filter((unit) => unit.learningClassifications.includes('formula_quantitative'))
    expect(quantitativeUnits.map((unit) => unit.knowledgeNodeIds[0]).sort()).toEqual([
      'PSY-07-26',
      'PSY-07-27',
      'PSY-07-28',
      'PSY-07-29',
      'PSY-07-32',
      'PSY-07-33',
    ])

    const topic7 = derived.requirementUnits.filter((unit) => unit.topicNumber === 7)
    expect(topic7).toHaveLength(34)
    expect(topic7.every((unit) => unit.learningClassifications.includes('procedure_skill'))).toBe(true)
    expect(topic7.every((unit) => unit.examDemandLinks[0].paperId === '7182/2' && unit.examDemandLinks[0].sectionId === 'C')).toBe(true)

    const topic8 = derived.requirementUnits.filter((unit) => unit.topicNumber === 8)
    expect(topic8).toHaveLength(6)
    expect(topic8.every((unit) => unit.learningClassifications.includes('synoptic_connection'))).toBe(true)

    expect(derived.examSkillUnits.map((unit) => unit.id)).toEqual([
      'PSY-EXAM-PAPER-ORIENTATION',
      'PSY-EXAM-COMMAND-DEMAND',
      'PSY-EXAM-EXTENDED-RESPONSE',
      'PSY-EXAM-RESEARCH-METHOD-TRANSFER',
      'PSY-EXAM-DATA-MATH',
      'PSY-EXAM-SYNOPTIC-P3',
    ])
    expect(derived.examSkillUnits.find((unit) => unit.id === 'PSY-EXAM-RESEARCH-METHOD-TRANSFER')?.paperIds).toEqual(examTruth.crossPaperConstraints.researchMethodsAssessment.alsoAssessableIn)
    expect(derived.examSkillUnits.find((unit) => unit.id === 'PSY-EXAM-DATA-MATH')?.paperIds).toEqual(examTruth.crossPaperConstraints.mathematicalSkillsAlsoAssessableIn)
    expect(derived.examSkillUnits.find((unit) => unit.id === 'PSY-EXAM-SYNOPTIC-P3')?.paperIds).toEqual(['7182/3'])
    expect(examTruth.extendedResponse.fixedMaximumEssayCountPerPaper).toBe(false)

    expect(contract).toMatchObject({
      status: 'experimental_blueprint_contract',
      inputs: { requiredRequirementCount: 118, requiredExamTruthStatus: 'experimental_exam_truth_complete' },
      projection: { assetQuotaPolicy: 'none', baselineLearnTreatment: 'core_explanation', baselinePracticeMode: 'short_constructed_response' },
      evidenceBoundary: { learn: ['reviewed_only'] },
      rights: { awardingBodyMaterial: 'REFERENCE_ONLY', downstreamAqaSourceTextPermitted: false, structuredAssessmentFactsPermitted: true },
      completionBoundary: {
        freshIndependentEducationalAssurancePassed: false,
        freshIndependentAssessmentAssurancePassed: false,
        learnerAssetReady: false,
        restrictedPilotPublicationApproved: false,
      },
    })

    expect(manifest).toMatchObject({
      status: 'experimental_course_learning_blueprint_complete',
      blueprint: {
        requirementPlanningUnits: 118,
        examSkillUnits: 6,
        courseTruthCoverageComplete: true,
        deterministicDerivationPassed: true,
        assetQuotaPolicy: 'none',
        freshIndependentEducationalAssurancePassed: false,
        freshIndependentAssessmentAssurancePassed: false,
        learnerAssetReady: false,
        restrictedPilotPublicationApproved: false,
      },
      economics: { paidProviderSpendGbp: 0, paidSourceLicenceSpendGbp: 0 },
    })
  })
})
