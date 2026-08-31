import { describe, expect, it } from 'vitest'
import defectText from '../../content-factory/reliability-q7-002-assessment-item-cross-reference-defect.json?raw'
import requalificationText from '../../content-factory/reliability-post-q7-002-assessment-item-requalification.json?raw'
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
  gates: Record<string, {
    status: 'candidate_pass' | 'pass'
    requiredShapes?: string[]
    currentSemanticVersions?: Record<string, string>
    ownershipExtensions?: Array<{ fieldClass: string; fields: string[]; ownership: string }>
  }>
}

type DefectRecord = {
  id: string
  classification: string
  evidenceKind: string
  source: { workflowRunId: number; approvedMainSha: string }
  correctedOwnership: Record<string, string>
  permanentReplayTests: string[]
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

function requirementIds(profile: ShapeProfile) {
  return [`${profile.shape}-requirement-a`, `${profile.shape}-requirement-b`]
}

function policy(profile: ShapeProfile) {
  return { requirementIds: requirementIds(profile), maxMark: profile.maxMark, format: profile.format }
}

function input(profile: ShapeProfile): AssessmentItemInput {
  const familyId = `family-${profile.shape}`
  return {
    jobId: `q7-002-requal-${profile.shape}`,
    courseIdentity: {
      subject: profile.subject,
      qualification: 'Synthetic Reliability Qualification',
      awardingBody: 'Synthetic Reliability Board',
      specificationId: `q7-002-${profile.shape}`,
    },
    assessmentBlueprint: {
      schemaVersion: 1,
      jobId: `q7-002-requal-${profile.shape}`,
      fingerprint: `assessment-${profile.shape}`,
      boardAlignmentFingerprint: `board-${profile.shape}`,
      assessmentObjectives: [{ id: 'ao1' }],
      components: [{ componentId: 'paper-1', questionFamilyIds: [familyId], markTotal: profile.maxMark, timingMinutes: 30, constraints: [] }],
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
  const [first, second] = requirementIds(profile)
  const firstEvidence = `first synthetic ${profile.shape} reference`
  const secondEvidence = `second synthetic ${profile.shape} reference`
  const wording = `${profile.command} using the ${firstEvidence} and the ${secondEvidence}.`
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
      responseDemands: [profile.demand],
      coverageEvidence: [
        { requirementId: first, evidence: firstEvidence },
        { requirementId: second, evidence: secondEvidence },
      ],
    }],
  }
}

function conflictingDuplicateCandidate(profile: ShapeProfile) {
  const complete = candidate(profile)
  return {
    ...complete,
    subquestions: complete.subquestions.map((subquestion) => ({
      ...subquestion,
      requirementIds: [`${profile.shape}-stale-provider-reference`],
    })),
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
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

describe('historical second-Q7 Assessment Item cross-reference requalification', () => {
  it('preserves the completed historical provider-free qualification record', () => {
    expect(['implemented_pending_exact_head_assurance', 'complete']).toContain(requalification.status)
    expect(Object.keys(requalification.gates)).toEqual(expectedGates)
    expect(Object.values(requalification.gates).every((gate) => ['candidate_pass', 'pass'].includes(gate.status))).toBe(true)
    expect(new Set(requalification.gates['Q3-adversarial-provider-free-subject-matrix'].requiredShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(requalification.providerCallsUsed).toBe(false)
    expect(requalification.paidPilotEligible).toBe(false)
    expect(requalification.globalQualificationRequiredState).toBe('paused')
  })

  it('retains the second-Q7 class as append-only synthetic evidence', () => {
    expect(defect.id).toBe('assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair')
    expect(defect.classification).toBe('generic_engineering_provider_contract_class')
    expect(defect.source).toMatchObject({
      workflowRunId: 33282967568,
      approvedMainSha: 'f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9',
    })
    expect(defect.evidenceKind).toBe('synthetic_reproduction')
    expect(defect.permanentReplayTests).toContain('src/content-factory/q7-assessment-item-cross-reference-requalification.test.ts')
    expect(defect.historicalRecordsRewritten).toBe(false)
    expect(defect.paidProviderCallsRequiredForReplay).toBe(false)
  })

  it.each(profiles)('still derives requirementIds from coverageEvidence for $shape', (profile) => {
    const compiled = compileAssessmentItemV2Candidate(conflictingDuplicateCandidate(profile), input(profile), policy(profile))
    expect(compiled.subquestions[0]?.requirementIds).toEqual(requirementIds(profile))
    expect(compiled.requirementIds).toEqual(requirementIds(profile))
    expect(JSON.stringify(compiled)).not.toContain('stale-provider-reference')
  })

  it.each(profiles)('still fails closed on invalid coverage mappings for $shape', (profile) => {
    const duplicate = clone(candidate(profile))
    duplicate.subquestions[0].coverageEvidence.push(clone(duplicate.subquestions[0].coverageEvidence[0]))
    expect(diagnoseAssessmentItemV2Candidate(duplicate, policy(profile))[0]?.message).toMatch(/repeat requirement IDs/i)

    const missing = clone(candidate(profile))
    missing.subquestions[0].coverageEvidence.pop()
    expect(diagnoseAssessmentItemV2Candidate(missing, policy(profile))[0]?.message).toMatch(/governed requirement IDs/i)

    const paraphrase = clone(candidate(profile))
    paraphrase.subquestions[0].coverageEvidence[0].evidence = 'plausible paraphrase absent from the actual question'
    expect(diagnoseAssessmentItemV2Candidate(paraphrase, policy(profile))[0]?.message).toMatch(/exact question excerpt/i)
  })

  it('composes the corrected boundary with the full deterministic pipeline simulation', async () => {
    const result = await runQ4DeterministicPipelineSimulation()
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.latestManifest.publicationStatus).toBe('factory_generated_unassured')
  })

  it('preserves the historical v4 record while current Pilot #19 semantics advance only Assessment Item and downstream dependants', () => {
    const q5 = requalification.gates['Q5-restart-reuse-dependency-invalidation']
    expect(q5.currentSemanticVersions).toEqual({ generateAssessmentItem: '2+output-integrity-v4' })
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('2+output-integrity-v5')

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')
    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
  })

  it('repeats the five-shape cross-reference boundary and deterministic pipeline three times provider-free', async () => {
    expect(q6RepetitionCount).toBe(3)
    for (let repetition = 0; repetition < q6RepetitionCount; repetition += 1) {
      for (const profile of orderedProfiles([17, 41, 73][repetition]!)) {
        const compiled = compileAssessmentItemV2Candidate(conflictingDuplicateCandidate(profile), input(profile), policy(profile))
        expect(new Set(compiled.subquestions[0]?.requirementIds)).toEqual(new Set(requirementIds(profile)))
      }
      const pipeline = await runQ4DeterministicPipelineSimulation()
      expect(pipeline.job.state).toBe('expert_review_ready')
      expect(pipeline.report.observedUsageCost).toBe(0)
    }
  })
})
