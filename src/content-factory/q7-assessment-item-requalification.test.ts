import { describe, expect, it } from 'vitest'
import defectText from '../../content-factory/reliability-q7-assessment-item-contract-defect.json?raw'
import requalificationText from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'
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
  gates: Record<string, {
    status: 'candidate_pass' | 'pass'
    providerCallsUsed?: boolean
    requiredShapes?: string[]
    currentSemanticVersions?: Record<string, string>
    ownershipExtensions?: Array<{ fieldClass: string; fields: string[]; ownership: string }>
  }>
}

type DefectRecord = {
  id: string
  classification: string
  evidenceKind: string
  syntheticBasis: string
  source: { workflowRunId: number; approvedMainSha: string }
  observedPattern: {
    controlledFailClosedAssessmentItemSamples: number
    subjectShapesAffected: string[]
    repeatedMissingFields: string[]
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

function policy(profile: ShapeProfile) {
  return {
    requirementIds: [requirementId(profile)],
    maxMark: profile.maxMark,
    format: profile.format,
  }
}

function input(profile: ShapeProfile): AssessmentItemInput {
  const familyId = `family-${profile.shape}`
  return {
    jobId: `q7-requal-${profile.shape}`,
    courseIdentity: {
      subject: profile.subject,
      qualification: 'Synthetic Reliability Qualification',
      awardingBody: 'Synthetic Reliability Board',
      specificationId: `q7-${profile.shape}`,
    },
    assessmentBlueprint: {
      schemaVersion: 1,
      jobId: `q7-requal-${profile.shape}`,
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
      responseDemands: [profile.demand],
      coverageEvidence: [{ requirementId: requirementId(profile), evidence }],
    }],
  }
}

function omissionCandidate(profile: ShapeProfile) {
  const complete = candidate(profile)
  return {
    ...complete,
    subquestions: complete.subquestions.map((subquestion) => ({
      id: subquestion.id,
      command: subquestion.command,
      wording: subquestion.wording,
      responseDemands: subquestion.responseDemands,
    })),
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

describe('historical first-Q7 Assessment Item provider-free requalification', () => {
  it('retains the completed historical requalification record without treating it as current eligibility', () => {
    expect(['implemented_pending_exact_head_assurance', 'complete']).toContain(requalification.status)
    expect(Object.keys(requalification.gates)).toEqual(expectedGates)
    expect(Object.values(requalification.gates).every((gate) => ['candidate_pass', 'pass'].includes(gate.status))).toBe(true)
    expect(requalification.providerCallsUsed).toBe(false)
    expect(requalification.paidPilotEligible).toBe(false)
    expect(requalification.globalQualificationRequiredState).toBe('paused')
    expect(requalification.historicalRecordsRewritten).toBe(false)
  })

  it('retains what the first Q7 run actually exposed without rewriting historical evidence', () => {
    expect(defect.id).toBe('q7-assessment-item-subquestion-structure-omission')
    expect(defect.classification).toBe('generic_engineering_provider_contract_class')
    expect(defect.source.workflowRunId).toBe(33265434110)
    expect(defect.source.approvedMainSha).toBe('69d7abb7d3236616b687cbed480e7584ceb69fc9')
    expect(defect.evidenceKind).toBe('synthetic_reproduction')
    expect(defect.syntheticBasis.length).toBeGreaterThan(80)
    expect(defect.observedPattern.controlledFailClosedAssessmentItemSamples).toBe(7)
    expect(new Set(defect.observedPattern.subjectShapesAffected)).toEqual(new Set(q3SubjectShapeIds))
    expect(defect.observedPattern.repeatedMissingFields).toEqual([
      'subquestions[].maxMark',
      'subquestions[].requirementIds',
      'subquestions[].coverageEvidence',
    ])
    expect(defect.replayTests).toContain('src/content-factory/openai-assessment-item-v2-compiler.test.ts')
    expect(defect.historicalRecordsRewritten).toBe(false)
    expect(defect.paidProviderCallsRequiredForReplay).toBe(false)
  })

  it('keeps the historical Q1 ownership extension as evidence of the prior boundary', () => {
    const ownership = requalification.gates['Q1-compiler-worker-ownership-inventory'].ownershipExtensions ?? []
    expect(ownership).toEqual(expect.arrayContaining([
      expect.objectContaining({ ownership: 'deterministically_derived', fields: expect.arrayContaining(['maxMark', 'requirementIds']) }),
      expect.objectContaining({ ownership: 'targeted_repair_eligible', fields: ['subquestions[].maxMark'] }),
      expect.objectContaining({ ownership: 'targeted_repair_eligible', fields: ['subquestions[].requirementIds', 'subquestions[].coverageEvidence'] }),
      expect.objectContaining({ ownership: 'fail_closed' }),
    ]))
  })

  it.each(profiles)('replays the still-relevant omission class and corrected strict compilation for $shape', (profile) => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(omissionCandidate(profile), policy(profile))
    expect(diagnostics.map((entry) => entry.code)).toEqual([
      'ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING',
      'ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING',
    ])

    const compiled = compileAssessmentItemV2Candidate(candidate(profile), input(profile), policy(profile))
    expect(compiled.componentId).toBe('paper-1')
    expect(compiled.questionFamilyId).toBe(`family-${profile.shape}`)
    expect(compiled.requirementIds).toEqual([requirementId(profile)])
    expect(compiled.maxMark).toBe(profile.maxMark)
    expect(compiled.format).toBe(profile.format)
    expect(compiled.subquestions[0]?.maxMark).toBe(profile.maxMark)
    expect(compiled.subquestions[0]?.requirementIds).toEqual([requirementId(profile)])
  })

  it('composes the current corrected Assessment Item boundary with the full Q4 deterministic pipeline simulation', async () => {
    const probe = profiles[0]
    expect(() => compileAssessmentItemV2Candidate(candidate(probe), input(probe), policy(probe))).not.toThrow()

    const result = await runQ4DeterministicPipelineSimulation()
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.latestManifest.publicationStatus).toBe('factory_generated_unassured')
  })

  it('preserves the historical v3 record while the current Assessment Item semantic boundary has advanced to v4', () => {
    const historicalQ5 = requalification.gates['Q5-restart-reuse-dependency-invalidation']
    expect(historicalQ5.currentSemanticVersions).toEqual({ generateAssessmentItem: '2+output-integrity-v3' })
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('2+output-integrity-v4')

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')
    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
  })

  it('repeats the current corrected five-shape boundary and full deterministic pipeline three times provider-free', async () => {
    expect(q6RepetitionCount).toBe(3)
    for (let repetition = 0; repetition < q6RepetitionCount; repetition += 1) {
      for (const profile of orderedProfiles([17, 41, 73][repetition]!)) {
        expect(diagnoseAssessmentItemV2Candidate(omissionCandidate(profile), policy(profile))).toHaveLength(2)
        expect(() => compileAssessmentItemV2Candidate(candidate(profile), input(profile), policy(profile))).not.toThrow()
      }
      const pipeline = await runQ4DeterministicPipelineSimulation()
      expect(pipeline.job.state).toBe('expert_review_ready')
      expect(pipeline.report.observedUsageCost).toBe(0)
    }
  })
})
