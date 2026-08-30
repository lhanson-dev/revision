import { describe, expect, it } from 'vitest'
import defectText from '../../content-factory/reliability-q7-assessment-item-coverage-pointer-defect.json?raw'
import requalificationText from '../../content-factory/reliability-post-q7-second-assessment-item-requalification.json?raw'
import {
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyClosure,
} from './durable-worker-dependencies'
import {
  compileAssessmentItemV2Candidate,
  diagnoseAssessmentItemV2Candidate,
} from './openai-assessment-item-v2-compiler'
import type { OpenAIModelAssistedWorkers } from './openai-provider-adapter'
import { q3SubjectShapeIds, type Q3SubjectShapeId } from './q3-subject-shape-fixtures'
import { runQ4DeterministicPipelineSimulation } from './q4-deterministic-pipeline-fixture'
import { q6RepetitionCount } from './q6-repeated-qualification-fixture'

type AssessmentItemInput = Parameters<OpenAIModelAssistedWorkers['generateAssessmentItem']>[0]
type Format = 'written_question' | 'case_question' | 'calculation' | 'mixed'
type Demand = 'calculation' | 'analysis' | 'evaluation'

type ShapeProfile = {
  shape: Q3SubjectShapeId
  subject: string
  command: string
  demand: Demand
  maxMark: number
  format: Format
}

type Requalification = {
  status: 'implemented_pending_exact_head_assurance' | 'complete'
  providerCallsUsed: boolean
  paidPilotEligible: boolean
  globalQualificationRequiredState: string
  historicalRecordsRewritten: boolean
  providerFreeQualificationPassed: boolean
  q7BoundedLiveSoakEligible: boolean
  gates: Record<string, {
    status: 'candidate_pass' | 'pass'
    currentSemanticVersions?: Record<string, string>
    ownershipExtensions?: Array<{
      fieldClass: string
      fields?: string[]
      providerFields?: string[]
      durableFields?: string[]
      ownership: string
    }>
  }>
}

type DefectRecord = {
  id: string
  classification: string
  defectClass: string
  evidenceKind: string
  syntheticBasis: string
  source: {
    workflowRunId: number
    workflowRunNumber: number
    approvedMainSha: string
    artifactId: number
  }
  observedPattern: {
    controlledFailClosedAssessmentItemSamples: number
    subjectShapesAffected: string[]
    failureSignature: string
    survivedSingleTargetedRepair: boolean
    previousQ7OmissionClassRecurred: boolean
  }
  ownershipReview: {
    educationalRequirementMapping: { ownership: string }
    coverageEvidenceExcerpt: { ownership: string }
    coverageRequirementPointer: {
      providerField: string
      durableField: string
      ownership: string
    }
  }
  correction: {
    providerContractVersion: string
    durableSemanticVersion: string
  }
  replayTests: string[]
  historicalRecordsRewritten: boolean
  paidProviderCallsRequiredForReplay: boolean
}

const requalification = JSON.parse(requalificationText) as Requalification
const defect = JSON.parse(defectText) as DefectRecord

const profiles: ShapeProfile[] = [
  { shape: 'quantitative_business_economics', subject: 'Synthetic Economics', command: 'Calculate', demand: 'calculation', maxMark: 4, format: 'calculation' },
  { shape: 'mathematics', subject: 'Synthetic Mathematics', command: 'Calculate', demand: 'calculation', maxMark: 6, format: 'calculation' },
  { shape: 'science', subject: 'Synthetic Science', command: 'Analyse', demand: 'analysis', maxMark: 6, format: 'case_question' },
  { shape: 'essay_humanities', subject: 'Synthetic History', command: 'Evaluate', demand: 'evaluation', maxMark: 12, format: 'written_question' },
  { shape: 'language_prescribed_text', subject: 'Synthetic Language and Text', command: 'Analyse', demand: 'analysis', maxMark: 10, format: 'written_question' },
]

function requirementId(profile: ShapeProfile) {
  return `${profile.shape}-requirement`
}

function policy(profile: ShapeProfile, requirementIds = [requirementId(profile)]) {
  return {
    requirementIds,
    maxMark: profile.maxMark,
    format: profile.format,
  }
}

function input(profile: ShapeProfile): AssessmentItemInput {
  const familyId = `family-${profile.shape}`
  return {
    jobId: `q7-second-requal-${profile.shape}`,
    courseIdentity: {
      subject: profile.subject,
      qualification: 'Synthetic Reliability Qualification',
      awardingBody: 'Synthetic Reliability Board',
      specificationId: `q7-second-${profile.shape}`,
    },
    assessmentBlueprint: {
      schemaVersion: 1,
      jobId: `q7-second-requal-${profile.shape}`,
      fingerprint: `assessment-${profile.shape}`,
      boardAlignmentFingerprint: `board-${profile.shape}`,
      assessmentObjectives: [{ id: 'ao1' }],
      components: [{
        componentId: 'paper-1',
        questionFamilyIds: [familyId],
        markTotal: profile.maxMark,
        timingMinutes: 30,
        constraints: [],
      }],
      quantitativeRequirements: profile.demand === 'calculation' ? ['Synthetic calculation requirement'] : [],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: [],
    },
    questionFamily: {
      schemaVersion: 1,
      id: familyId,
      title: `Synthetic ${profile.shape} family`,
      assessmentObjectiveIds: ['ao1'],
      skillProfile: [profile.demand],
      componentScope: ['paper-1'],
      markRange: { min: profile.maxMark, max: profile.maxMark },
      responseShape: 'Synthetic structured response',
      contextRequirements: [],
      applicationRequirements: [],
      analysisRequirements: profile.demand === 'analysis' ? ['Develop supported analysis.'] : [],
      evaluationRequirements: profile.demand === 'evaluation' ? ['Reach a supported judgement.'] : [],
      commonFailureModes: [],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated',
    },
    targetComponentId: 'paper-1',
    knowledgeNodes: [],
    examPrepRequirements: [],
  }
}

function candidate(profile: ShapeProfile) {
  const evidence = `synthetic ${profile.shape} evidence`
  const wording = `${profile.command} the ${evidence} using the invented task.`
  return {
    id: `item-${profile.shape}`,
    version: '1',
    title: `Synthetic ${profile.subject} item`,
    knowledgeNodeIds: [`node-${profile.shape}`],
    command: profile.command,
    questionWording: wording,
    subquestions: [{
      id: 'q1',
      command: profile.command,
      wording,
      maxMark: profile.maxMark,
      requirementIds: [requirementId(profile)],
      responseDemands: [profile.demand],
      coverageEvidence: [{ requirementPosition: 1, evidence }],
    }],
  }
}

function legacyCrossReferenceCandidate(profile: ShapeProfile) {
  const valid = candidate(profile)
  return {
    ...valid,
    subquestions: valid.subquestions.map((subquestion) => ({
      ...subquestion,
      coverageEvidence: [{
        requirementId: `${profile.shape}-wrong-provider-pointer`,
        evidence: `synthetic ${profile.shape} evidence`,
      }],
    })),
  }
}

function adversarialLocatorCandidate(profile: ShapeProfile) {
  const valid = candidate(profile)
  const requirementIds = [
    `${profile.shape}-requirement-a`,
    `${profile.shape}-requirement-b`,
    `${profile.shape}-requirement-c`,
  ]
  return {
    policy: policy(profile, requirementIds),
    candidate: {
      ...valid,
      subquestions: valid.subquestions.map((subquestion) => ({
        ...subquestion,
        requirementIds,
        coverageEvidence: [
          { requirementPosition: 1, evidence: `synthetic ${profile.shape} evidence` },
          { requirementPosition: 1, evidence: 'invented task' },
          { requirementPosition: 4, evidence: profile.command },
        ],
      })),
    },
  }
}

function orderedProfiles(seed: number) {
  const offset = seed % profiles.length
  return [...profiles.slice(offset), ...profiles.slice(0, offset)]
}

const expectedGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

describe('provider-free requalification after the second Q7 Assessment Item failure', () => {
  it('keeps candidate evidence fail closed until exact-head assurance promotes Q1-Q6', () => {
    expect(['implemented_pending_exact_head_assurance', 'complete']).toContain(requalification.status)
    expect(Object.keys(requalification.gates)).toEqual(expectedGates)
    expect(Object.values(requalification.gates).every((gate) => ['candidate_pass', 'pass'].includes(gate.status))).toBe(true)
    expect(requalification.providerCallsUsed).toBe(false)
    expect(requalification.paidPilotEligible).toBe(false)
    expect(requalification.globalQualificationRequiredState).toBe('paused')
    expect(requalification.historicalRecordsRewritten).toBe(false)
    if (requalification.status === 'implemented_pending_exact_head_assurance') {
      expect(requalification.providerFreeQualificationPassed).toBe(false)
      expect(requalification.q7BoundedLiveSoakEligible).toBe(false)
    }
  })

  it('retains the second Q7 generic contract class as labelled synthetic reproduction evidence', () => {
    expect(defect.id).toBe('q7-assessment-item-coverage-requirement-cross-reference')
    expect(defect.classification).toBe('generic_engineering_provider_contract_class')
    expect(defect.defectClass).toBe('assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair')
    expect(defect.source).toMatchObject({
      workflowRunId: 33282967568,
      workflowRunNumber: 17,
      approvedMainSha: 'f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9',
      artifactId: 9723581809,
    })
    expect(defect.evidenceKind).toBe('synthetic_reproduction')
    expect(defect.syntheticBasis.length).toBeGreaterThan(120)
    expect(defect.observedPattern.controlledFailClosedAssessmentItemSamples).toBe(3)
    expect(new Set(defect.observedPattern.subjectShapesAffected)).toEqual(new Set([
      'essay_humanities',
      'language_prescribed_text',
    ]))
    expect(defect.observedPattern.failureSignature).toContain('coverage evidence must match its requirement IDs exactly')
    expect(defect.observedPattern.survivedSingleTargetedRepair).toBe(true)
    expect(defect.observedPattern.previousQ7OmissionClassRecurred).toBe(false)
    expect(defect.replayTests).toContain('src/content-factory/openai-assessment-item-v2-compiler.test.ts')
    expect(defect.historicalRecordsRewritten).toBe(false)
    expect(defect.paidProviderCallsRequiredForReplay).toBe(false)
  })

  it('records Q1 ownership at the smallest safe boundary instead of duplicating a deterministic pointer', () => {
    expect(defect.ownershipReview.educationalRequirementMapping.ownership).toBe('targeted_repair_eligible')
    expect(defect.ownershipReview.coverageEvidenceExcerpt.ownership).toBe('generative_judgement_with_deterministic_validation')
    expect(defect.ownershipReview.coverageRequirementPointer).toEqual({
      providerField: 'subquestions[].coverageEvidence[].requirementPosition',
      durableField: 'subquestions[].coverageEvidence[].requirementId',
      ownership: 'bounded_locator_reference',
      reason: expect.any(String),
    })
    expect(defect.correction.providerContractVersion).toBe('5')
    expect(defect.correction.durableSemanticVersion).toBe('2+output-integrity-v4')

    const ownership = requalification.gates['Q1-compiler-worker-ownership-inventory'].ownershipExtensions ?? []
    expect(ownership).toEqual(expect.arrayContaining([
      expect.objectContaining({ ownership: 'targeted_repair_eligible', fields: ['subquestions[].maxMark', 'subquestions[].requirementIds'] }),
      expect.objectContaining({ ownership: 'generative_judgement', fields: ['subquestions[].coverageEvidence[].evidence'] }),
      expect.objectContaining({
        ownership: 'bounded_locator_reference',
        providerFields: ['subquestions[].coverageEvidence[].requirementPosition'],
        durableFields: ['subquestions[].coverageEvidence[].requirementId'],
      }),
    ]))
  })

  it.each(profiles)('replays the second-Q7 legacy cross-reference defect for $shape without allowing a duplicated durable pointer', (profile) => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(legacyCrossReferenceCandidate(profile), policy(profile))
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_MISSING',
        path: 'subquestions[0].coverageEvidence[0].requirementPosition',
      }),
    ])

    const compiled = compileAssessmentItemV2Candidate(candidate(profile), input(profile), policy(profile))
    expect(compiled.subquestions[0]?.coverageEvidence).toEqual([
      {
        requirementId: requirementId(profile),
        evidence: `synthetic ${profile.shape} evidence`,
      },
    ])
    expect(compiled.subquestions[0]?.coverageEvidence[0]).not.toHaveProperty('requirementPosition')
  })

  it.each(profiles)('collects simultaneous duplicate, out-of-range and unevidenced bounded-locator diagnostics for $shape', (profile) => {
    const adversarial = adversarialLocatorCandidate(profile)
    expect(diagnoseAssessmentItemV2Candidate(adversarial.candidate, adversarial.policy).map((entry) => entry.code)).toEqual([
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_DUPLICATE',
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_OUT_OF_RANGE',
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_UNEVIDENCED',
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_UNEVIDENCED',
    ])
  })

  it('composes the corrected pointer compiler with the full Q4 deterministic pipeline simulation', async () => {
    for (const profile of profiles) {
      expect(() => compileAssessmentItemV2Candidate(candidate(profile), input(profile), policy(profile))).not.toThrow()
    }

    const result = await runQ4DeterministicPipelineSimulation()
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.latestManifest.publicationStatus).toBe('factory_generated_unassured')
  })

  it('advances only Assessment Item durable semantics and genuine downstream dependency closure', () => {
    const q5 = requalification.gates['Q5-restart-reuse-dependency-invalidation']
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('2+output-integrity-v4')
    expect(q5.currentSemanticVersions).toEqual({ generateAssessmentItem: '2+output-integrity-v4' })

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')
    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
  })

  it('repeats five-shape legacy replay, adversarial locator validation and full deterministic pipeline three times provider-free', async () => {
    expect(q6RepetitionCount).toBe(3)
    for (let repetition = 0; repetition < q6RepetitionCount; repetition += 1) {
      for (const profile of orderedProfiles([23, 47, 89][repetition]!)) {
        expect(diagnoseAssessmentItemV2Candidate(legacyCrossReferenceCandidate(profile), policy(profile))).toEqual([
          expect.objectContaining({ code: 'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_MISSING' }),
        ])
        const adversarial = adversarialLocatorCandidate(profile)
        expect(diagnoseAssessmentItemV2Candidate(adversarial.candidate, adversarial.policy)).toHaveLength(4)
        expect(() => compileAssessmentItemV2Candidate(candidate(profile), input(profile), policy(profile))).not.toThrow()
      }
      const pipeline = await runQ4DeterministicPipelineSimulation()
      expect(pipeline.job.state).toBe('expert_review_ready')
      expect(pipeline.report.observedUsageCost).toBe(0)
    }
  })

  it('covers all five governed subject shapes', () => {
    expect(new Set(profiles.map((profile) => profile.shape))).toEqual(new Set(q3SubjectShapeIds))
  })
})
