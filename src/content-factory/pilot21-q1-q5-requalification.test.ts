import { describe, expect, it } from 'vitest'
import ownershipText from '../../content-factory/reliability-pilot21-q1-ownership-addendum.json?raw'
import requalificationText from '../../content-factory/reliability-post-pilot21-q1-q6-requalification.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
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

type OwnershipEvidence = {
  status: string
  gate: string
  q1Pass: boolean
  reviewedAgainstMainSha: string
  baseInventory: string
  changedWorkerBoundary: {
    providerContractVersion: string
    durableSemanticVersion: string
    mechanicalFields: Array<{ fieldClass: string; ownership: string; fieldPatterns: string[] }>
  }
  blockers: unknown[]
  historicalRecordsRewritten: boolean
}

type RequalificationEvidence = {
  status: string
  scope: string
  baseMainSha: string
  providerCallsUsed: boolean
  historicalRecordsRewritten: boolean
  pilot21DurableResumeTarget: {
    completedWorkUnits: number
    bankedLearningArtifacts: number
    bankedPracticeArtifacts: number
    failureBoundary: string
  }
  gates: Record<string, { status: string }>
  q7: { status: string; maxSpendUsd: number; fullCourseAssembly: boolean; pilot21FullCourseResumePermitted: boolean }
  acceptance: Record<string, boolean>
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string | null
  lastProviderFreeQualificationEvidence: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

const ownership = JSON.parse(ownershipText) as OwnershipEvidence
const requalification = JSON.parse(requalificationText) as RequalificationEvidence
const qualification = JSON.parse(qualificationText) as Qualification

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
] as const

const shapes = [
  'quantitative_business_economics',
  'mathematics',
  'science',
  'essay_humanities',
  'language_prescribed_text',
] as const

function assessmentInput(shape: string): AssessmentItemInput {
  return {
    jobId: `pilot21-q3-${shape}`,
    courseIdentity: {
      subject: `Synthetic ${shape}`,
      qualification: 'Synthetic qualification',
      awardingBody: 'Synthetic board',
      specificationId: `pilot21-${shape}`,
    },
    assessmentBlueprint: {
      schemaVersion: 1,
      jobId: `pilot21-q3-${shape}`,
      fingerprint: `assessment-${shape}`,
      boardAlignmentFingerprint: `board-${shape}`,
      assessmentObjectives: [{ id: 'ao1' }],
      components: [{
        componentId: 'paper-1',
        questionFamilyIds: ['pilot21-family'],
        markTotal: 4,
        timingMinutes: 15,
        constraints: [],
      }],
      quantitativeRequirements: [],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: [],
    },
    questionFamily: {
      schemaVersion: 1,
      id: 'pilot21-family',
      title: 'Synthetic two-part question',
      assessmentObjectiveIds: ['ao1'],
      skillProfile: ['analysis', 'evaluation'],
      componentScope: ['paper-1'],
      markRange: { min: 4, max: 4 },
      responseShape: 'Two linked structured subquestions',
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

function adversarialCandidate(shape: string) {
  const firstWording = `Analyse the first governed idea for the ${shape} scenario.`
  const secondWording = `Evaluate the second governed idea for the ${shape} scenario.`
  return {
    firstWording,
    secondWording,
    candidate: {
      id: `pilot21-${shape}-item`,
      version: '1',
      title: `Synthetic ${shape} item`,
      knowledgeNodeIds: ['synthetic-node'],
      command: 'Analyse and evaluate',
      questionWording: secondWording,
      subquestions: [
        {
          id: 'q1-analysis',
          command: 'Analyse',
          wording: firstWording,
          maxMark: 2,
          responseDemands: ['analysis'],
          coverageEvidence: [{ requirementId: 'q1-analysis', evidence: 'first governed idea' }],
        },
        {
          id: 'q2-evaluation',
          command: 'Evaluate',
          wording: secondWording,
          maxMark: 2,
          responseDemands: ['evaluation'],
          coverageEvidence: [{ requirementId: 'q2-evaluation', evidence: 'second governed idea' }],
        },
      ],
    },
  }
}

const policy = {
  requirementIds: ['q1-analysis', 'q2-evaluation'],
  maxMark: 4,
  format: 'mixed' as const,
}

describe('Content Factory post-Pilot #21 provider-free Q1-Q5 requalification', () => {
  it('Q1 records the corrected compiler/provider ownership without rewriting the historical inventory', () => {
    expect(ownership).toMatchObject({
      status: 'complete',
      gate: 'Q1-compiler-worker-ownership-inventory',
      q1Pass: true,
      reviewedAgainstMainSha: 'df44194f7399dbfe5f6f4e5d7a1bfe311474bf11',
      baseInventory: 'content-factory/reliability-contract-inventory.json',
      historicalRecordsRewritten: false,
      blockers: [],
    })
    expect(ownership.changedWorkerBoundary.providerContractVersion).toBe('9')
    expect(ownership.changedWorkerBoundary.durableSemanticVersion).toBe('3+output-integrity-v7')

    const fields = new Map(ownership.changedWorkerBoundary.mechanicalFields.map((entry) => [entry.fieldClass, entry]))
    expect(fields.get('validated structured learner wording')?.ownership).toBe('generative_judgement')
    expect(fields.get('learner-visible aggregate question wording')?.ownership).toBe('deterministically_derived')
    expect(fields.get('learner-visible aggregate question wording')?.fieldPatterns).toContain('questionWording')
  })

  it('Q2 permanently replays the Pilot #21 stale duplicate and compiles the learner wording from one educational source', () => {
    const { candidate, firstWording, secondWording } = adversarialCandidate(shapes[0])
    const parsed = assessmentItemV2ProviderOutputSchema.parse(candidate)
    expect('questionWording' in parsed).toBe(false)

    const compiled = compileAssessmentItemV2Candidate(candidate, assessmentInput(shapes[0]), policy)
    expect(compiled.questionWording).toBe(`${firstWording}\n\n${secondWording}`)
    expect(compiled.questionWording).toContain(compiled.subquestions[0]!.wording)
    expect(compiled.questionWording).toContain(compiled.subquestions[1]!.wording)
  })

  it.each(shapes)('Q3 applies the corrected wording boundary to governed subject shape %s', (shape) => {
    const { candidate, firstWording, secondWording } = adversarialCandidate(shape)
    const parsed = assessmentItemV2ProviderOutputSchema.parse(candidate)
    expect('questionWording' in parsed).toBe(false)

    const compiled = compileAssessmentItemV2Candidate(candidate, assessmentInput(shape), policy)
    expect(compiled.questionWording).toBe(`${firstWording}\n\n${secondWording}`)
    expect(compiled.subquestions.map((subquestion) => subquestion.requirementIds)).toEqual([
      ['q1-analysis'],
      ['q2-evaluation'],
    ])
  })

  it('Q5 protects Pilot #21 Learn/Practice from an Assessment-only semantic invalidation', () => {
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('3+output-integrity-v7')

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')
    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
    expect(reviewClosure).toContain('generateLearningCollateral')
    expect(reviewClosure).toContain('generatePracticeCollateral')

    expect(requalification.pilot21DurableResumeTarget).toMatchObject({
      completedWorkUnits: 13,
      bankedLearningArtifacts: 13,
      bankedPracticeArtifacts: 13,
      failureBoundary: 'assessment_item_generation',
    })
    expect(requalification.acceptance.pilot21LearnPracticeProtectedFromAssessmentOnlyInvalidation).toBe(true)
  })

  it('preserves provider-free Q1-Q6 evidence while current Q7 PASS still keeps full-course execution and Q8 closed', () => {
    expect(requalification).toMatchObject({
      status: 'implemented_pending_same_head_assurance',
      scope: 'post_pilot_21_q1_q6_provider_free_requalification',
      baseMainSha: 'df44194f7399dbfe5f6f4e5d7a1bfe311474bf11',
      providerCallsUsed: false,
      historicalRecordsRewritten: false,
    })
    for (const gate of providerFreeGates) {
      expect(requalification.gates[gate]?.status).toBe('pass')
      expect(qualification.gateStatus[gate]).toBe('pass')
    }
    expect(requalification.q7).toMatchObject({
      status: 'pending',
      maxSpendUsd: 5,
      fullCourseAssembly: false,
      pilot21FullCourseResumePermitted: false,
    })
    expect(qualification.status).toBe('paused')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pass')
    expect(qualification.providerFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-pilot21-q1-q6-requalification.json',
    )
    expect(qualification.lastProviderFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-pilot20-q1-q6-consolidation.json',
    )
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
  })
})
