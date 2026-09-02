import { describe, expect, it } from 'vitest'
import {
  assessmentItemV2ProviderOutputSchema,
  compileAssessmentItemV2Candidate,
} from './openai-assessment-item-v2-compiler'
import {
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyClosure,
} from './durable-worker-dependencies'
import type { OpenAIModelAssistedWorkers } from './openai-provider-adapter'

type AssessmentItemInput = Parameters<OpenAIModelAssistedWorkers['generateAssessmentItem']>[0]

const firstWording = 'Calculate the profit earned from revenue of £120,000 and total costs of £95,000.'
const secondWording = 'Interpret the profit margin of 20.8% for the business owner.'

const policy = {
  requirementIds: ['q1-profit', 'q2-margin'],
  maxMark: 4,
  format: 'mixed' as const,
}

function assessmentInput(): AssessmentItemInput {
  return {
    jobId: 'pilot21-question-wording-replay',
    courseIdentity: {
      subject: 'Synthetic Business',
      qualification: 'Synthetic qualification',
      awardingBody: 'Synthetic board',
      specificationId: 'pilot21',
    },
    assessmentBlueprint: {
      schemaVersion: 1,
      jobId: 'pilot21-question-wording-replay',
      fingerprint: 'assessment-pilot21',
      boardAlignmentFingerprint: 'board-pilot21',
      assessmentObjectives: [{ id: 'ao1' }],
      components: [{
        componentId: 'paper-1',
        questionFamilyIds: ['pilot21-family'],
        markTotal: 4,
        timingMinutes: 15,
        constraints: [],
      }],
      quantitativeRequirements: ['Synthetic profit calculation'],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: [],
    },
    questionFamily: {
      schemaVersion: 1,
      id: 'pilot21-family',
      title: 'Synthetic mixed finance question',
      assessmentObjectiveIds: ['ao1'],
      skillProfile: ['calculation', 'interpretation'],
      componentScope: ['paper-1'],
      markRange: { min: 4, max: 4 },
      responseShape: 'Synthetic calculation followed by interpretation',
      contextRequirements: [],
      applicationRequirements: [],
      analysisRequirements: [],
      evaluationRequirements: [],
      commonFailureModes: [],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated',
    },
    targetComponentId: 'paper-1',
    knowledgeNodes: [],
    examPrepRequirements: [],
  }
}

function pilot21MismatchCandidate() {
  return {
    id: 'pilot21-finance-item',
    version: '1',
    title: 'Synthetic finance item',
    knowledgeNodeIds: ['profit-node'],
    command: 'Calculate and interpret',
    // Reproduces the generic Pilot #21 defect class: a stale second provider-authored
    // copy omits q1-profit wording. Contract v9 must discard this clerical duplicate.
    questionWording: secondWording,
    subquestions: [
      {
        id: 'q1-profit',
        command: 'Calculate',
        wording: firstWording,
        maxMark: 2,
        responseDemands: ['calculation'],
        coverageEvidence: [{ requirementId: 'q1-profit', evidence: 'Calculate the profit' }],
      },
      {
        id: 'q2-margin',
        command: 'Interpret',
        wording: secondWording,
        maxMark: 2,
        responseDemands: ['interpretation'],
        coverageEvidence: [{ requirementId: 'q2-margin', evidence: 'Interpret the profit margin' }],
      },
    ],
  }
}

describe('Confirmation Pilot #21 question wording ownership', () => {
  it('removes provider ownership of the duplicated top-level questionWording field', () => {
    const parsed = assessmentItemV2ProviderOutputSchema.parse(pilot21MismatchCandidate())
    expect('questionWording' in parsed).toBe(false)
  })

  it('deterministically composes learner-visible questionWording from validated subquestions', () => {
    const compiled = compileAssessmentItemV2Candidate(
      pilot21MismatchCandidate(),
      assessmentInput(),
      policy,
    )

    expect(compiled.questionWording).toBe(`${firstWording}\n\n${secondWording}`)
    expect(compiled.questionWording).toContain(compiled.subquestions[0]!.wording)
    expect(compiled.questionWording).toContain(compiled.subquestions[1]!.wording)
    expect(compiled.subquestions.map((subquestion) => subquestion.requirementIds)).toEqual([
      ['q1-profit'],
      ['q2-margin'],
    ])
  })

  it('invalidates only Assessment Item outputs and genuine downstream dependants', () => {
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toMatch(/output-integrity-v7$/)

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')
    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
  })
})
