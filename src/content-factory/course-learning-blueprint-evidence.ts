import { z } from 'zod'
import type { CourseLearningNodePlan, CourseLearningPracticeMode } from './course-learning-blueprint'
import {
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
} from './learning-and-practice'

type LearningOutput = z.infer<typeof learningCollateralWorkerOutputSchema>
type PracticeOutput = z.infer<typeof practiceCollateralWorkerOutputSchema>
type PracticeActivity = PracticeOutput['activities'][number]

type EvidenceEntry = { teachingPoint: string; evidence: string }

function nodeEvidence<T extends EvidenceEntry>(evidence: T[], nodePlan: CourseLearningNodePlan) {
  const required = new Set(nodePlan.requiredTeachingPoints)
  return evidence.filter((entry) => required.has(entry.teachingPoint))
}

function isNodePoint(teachingPoint: string, prefix: string, nodeId: string) {
  return teachingPoint.startsWith(`${prefix} [${nodeId}]:`)
}

function learningEvidenceInSections(output: LearningOutput, evidence: string) {
  return output.sections.some((section) => (
    section.explanation === evidence || section.keyPoints.includes(evidence)
  ))
}

function learningEvidenceInWorkedExample(output: LearningOutput, evidence: string) {
  return output.workedExamples.some((example) => (
    example.setup === evidence || example.steps.includes(evidence) || example.conclusion === evidence
  ))
}

function learningEvidenceInMisconceptionCorrection(output: LearningOutput, evidence: string) {
  return output.misconceptions.some((item) => item.correction === evidence)
}

function activePracticeFieldMatches(activity: PracticeActivity, evidence: string) {
  return activity.prompt === evidence || activity.expectedResponse === evidence
}

function practiceEvidenceInMode(output: PracticeOutput, evidence: string, mode: CourseLearningPracticeMode) {
  return output.activities.some((activity) => activity.mode === mode && activePracticeFieldMatches(activity, evidence))
}

function practiceEvidenceInAnyActiveTask(output: PracticeOutput, evidence: string) {
  return output.activities.some((activity) => activePracticeFieldMatches(activity, evidence))
}

/**
 * Proves that deterministic Learn treatments are represented in the generated
 * learner content for the same Course Truth node, rather than merely existing
 * somewhere else in the revision-area work unit.
 */
export function validateCourseLearningBlueprintLearningEvidence(input: {
  output: LearningOutput
  nodePlans: CourseLearningNodePlan[]
  workUnitId: string
}) {
  for (const nodePlan of input.nodePlans) {
    const evidence = nodeEvidence(input.output.coverageEvidence, nodePlan)
    if (!evidence.some((entry) => learningEvidenceInSections(input.output, entry.evidence))) {
      throw new Error(`Learning work unit ${input.workUnitId} did not teach node ${nodePlan.nodeId} in an explanation section`)
    }

    if (nodePlan.learnTreatments.includes('worked_example') || nodePlan.learnTreatments.includes('procedure_modelling')) {
      if (!evidence.some((entry) => learningEvidenceInWorkedExample(input.output, entry.evidence))) {
        throw new Error(`Learning work unit ${input.workUnitId} did not model node ${nodePlan.nodeId} in a worked example`)
      }
    }

    const formulaPoints = evidence.filter((entry) => isNodePoint(
      entry.teachingPoint,
      'Formula or quantitative procedure',
      nodePlan.nodeId,
    ))
    for (const entry of formulaPoints) {
      if (!learningEvidenceInWorkedExample(input.output, entry.evidence)) {
        throw new Error(`Learning work unit ${input.workUnitId} did not work through formula/procedure evidence for node ${nodePlan.nodeId}`)
      }
    }

    const misconceptionPoints = evidence.filter((entry) => isNodePoint(
      entry.teachingPoint,
      'Misconception to diagnose and repair',
      nodePlan.nodeId,
    ))
    for (const entry of misconceptionPoints) {
      if (!learningEvidenceInMisconceptionCorrection(input.output, entry.evidence)) {
        throw new Error(`Learning work unit ${input.workUnitId} did not repair a governed misconception for node ${nodePlan.nodeId}`)
      }
    }
  }
}

/**
 * Proves that each Course Truth node is actively exercised in every Practice
 * mode selected for that node. Coverage in an explanation or in another node's
 * activity cannot satisfy this gate.
 */
export function validateCourseLearningBlueprintPracticeEvidence(input: {
  output: PracticeOutput
  nodePlans: CourseLearningNodePlan[]
  workUnitId: string
}) {
  for (const nodePlan of input.nodePlans) {
    const evidence = nodeEvidence(input.output.coverageEvidence, nodePlan)

    for (const mode of nodePlan.practiceModes) {
      if (!evidence.some((entry) => practiceEvidenceInMode(input.output, entry.evidence, mode))) {
        throw new Error(`Practice work unit ${input.workUnitId} did not exercise node ${nodePlan.nodeId} in required mode ${mode}`)
      }
    }

    const formulaPoints = evidence.filter((entry) => isNodePoint(
      entry.teachingPoint,
      'Formula or quantitative procedure',
      nodePlan.nodeId,
    ))
    for (const entry of formulaPoints) {
      if (!practiceEvidenceInMode(input.output, entry.evidence, 'quantitative')) {
        throw new Error(`Practice work unit ${input.workUnitId} did not actively calculate formula/procedure evidence for node ${nodePlan.nodeId}`)
      }
    }

    const applicationPoints = evidence.filter((entry) => isNodePoint(
      entry.teachingPoint,
      'Required application context',
      nodePlan.nodeId,
    ))
    for (const entry of applicationPoints) {
      if (!practiceEvidenceInMode(input.output, entry.evidence, 'application')) {
        throw new Error(`Practice work unit ${input.workUnitId} did not actively use required application context for node ${nodePlan.nodeId}`)
      }
    }

    const misconceptionPoints = evidence.filter((entry) => isNodePoint(
      entry.teachingPoint,
      'Misconception to diagnose and repair',
      nodePlan.nodeId,
    ))
    for (const entry of misconceptionPoints) {
      if (!practiceEvidenceInAnyActiveTask(input.output, entry.evidence)) {
        throw new Error(`Practice work unit ${input.workUnitId} did not actively diagnose a governed misconception for node ${nodePlan.nodeId}`)
      }
    }
  }
}
