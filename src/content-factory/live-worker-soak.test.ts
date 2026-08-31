import { describe, expect, it } from 'vitest'
import soakPlanText from '../../content-factory/reliability-v2-e-live-worker-soak-plan.json?raw'
import soakRequestText from '../../content-factory/reliability-v2-e-live-worker-soak-request.json?raw'
import firstEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence.json?raw'
import secondEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-002.json?raw'
import thirdEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-003.json?raw'
import soakWorkflowText from '../../.github/workflows/content-factory-live-worker-soak.yml?raw'
import fullCourseWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import soakHarnessText from './live-worker-soak.integration.test.ts?raw'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'

type Execution = {
  attempt: number
  mainSha: string
  workflowRunId: number
  workflowRunNumber: number
  artifactId: number
  durableEvidence: string
  executedSamples: number
  acceptedSamples: number
  controlledFailClosedSamples: number
  knownUsageCostUsd: number
  targetedRepairsObserved: number
  classification: string
  defectClass: string
}

type SoakPlan = {
  schemaVersion: number
  workItem: string
  gate: string
  status: string
  canonicalRuntime: string
  integrationHarness: string
  triggerModes: string[]
  requestFile: string
  sampleCount: number
  samplesPerShape: number
  subjectShapes: string[]
  providerCalls: string
  maxSpendUsd: number
  providerRetriesPerRequest: number
  liveExecutions: Execution[]
  latestLiveExecutionAttempt: number
  affectedQualificationGates: string[]
  costCeilingReview: {
    decision: string
    latestKnownUsageCostUsd: number
    latestCeilingUtilisationPercent: number
    cumulativeKnownQ7SpendUsd: number
  }
  fullCourseAssembly: boolean
  learnerPublication: boolean
  livePilotEligibilityChanged: boolean
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
}

type SoakEvidence = {
  attempt?: number
  status: string
  workflow: { runId: number; runNumber: number; mainSha: string; artifactId: number; artifactDigest?: string }
  sampleSummary: {
    planned: number
    executed: number
    accepted: number
    controlledFailClosed: number
    infrastructureIncidents: number
    engineeringBoundaryBreaches: number
    assessmentItemAccepted: number
    assessmentItemControlledFailClosed: number
    markingPackAccepted: number
    markingPackControlledFailClosed: number
    targetedRepairsObserved: number
    subjectShapes: string[]
  }
  costEvidence: { configuredMaxSpendUsd: number; knownUsageCostUsd: number; unpricedSampleCount: number; reviewDecision: string }
  classification: {
    decision: string
    boundary: string
    defectClass: string
    rawProviderCandidateRetention: string
    previousQ7DefectRecurrence?: boolean
    observedSubjectShapes?: string[]
    assessmentItemClassification?: { decision: string; observedSubjectShapes: string[] }
    markingPackClassification?: { decision: string; observedSubjectShapes: string[] }
  }
  affectedQualificationGates: string[]
  qualificationOutcome: { q7Passed: boolean; overallReliabilityV2Passed: boolean; livePilotEligible: boolean; fullCourseAssembly: boolean; learnerPublication: boolean }
  samples: Array<{ sampleId: string; subjectShape: string; workerBoundary: string; disposition: string; provider: string; model: string; contractVersion: string; providerCallCount: number; repairCount: number; usageCostUsd: number; error?: string }>
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  q7FailureEvidence: string
  q7FailureEvidenceHistory: string[]
  q7PassEvidence: string
  providerFreeQualificationEvidence: string | null
  lastProviderFreeQualificationEvidence: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

const plan = JSON.parse(soakPlanText) as SoakPlan
const firstEvidence = JSON.parse(firstEvidenceText) as SoakEvidence
const secondEvidence = JSON.parse(secondEvidenceText) as SoakEvidence
const thirdEvidence = JSON.parse(thirdEvidenceText) as SoakEvidence
const request = JSON.parse(soakRequestText) as { requestId: string; maxSpendUsd: number; fullCourseAssembly: boolean; learnerPublication: boolean }
const qualification = JSON.parse(qualificationText) as Qualification

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

describe('Reliability v2-E Q7 live worker soak governance', () => {
  it('retains all three Q7 attempts and records the third classified soak as PASS', () => {
    expect(plan).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-E',
      gate: 'Q7',
      status: 'third_live_execution_passed_controlled_educational_fail_closed',
      canonicalRuntime: '.github/workflows/content-factory-live-worker-soak.yml',
      integrationHarness: 'src/content-factory/live-worker-soak.integration.test.ts',
      triggerModes: ['workflow_dispatch', 'governed_main_request_file_push'],
      requestFile: 'content-factory/reliability-v2-e-live-worker-soak-request.json',
      sampleCount: 20,
      samplesPerShape: 4,
      providerCalls: 'completed_on_approved_main',
      maxSpendUsd: 5,
      providerRetriesPerRequest: 0,
      latestLiveExecutionAttempt: 3,
      fullCourseAssembly: false,
      learnerPublication: false,
      livePilotEligibilityChanged: false,
      q7Passed: true,
      overallReliabilityV2Passed: true,
    })
    expect(new Set(plan.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(plan.liveExecutions).toHaveLength(3)
    expect(plan.liveExecutions[0]).toMatchObject({
      attempt: 1,
      workflowRunId: 33265434110,
      acceptedSamples: 13,
      controlledFailClosedSamples: 7,
      knownUsageCostUsd: 0.423906,
      defectClass: 'assessment_subquestion_required_structure_omission_before_targeted_repair',
    })
    expect(plan.liveExecutions[1]).toMatchObject({
      attempt: 2,
      mainSha: 'f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9',
      workflowRunId: 33282967568,
      workflowRunNumber: 17,
      artifactId: 9723581809,
      durableEvidence: 'content-factory/reliability-v2-e-q7-live-soak-evidence-002.json',
      executedSamples: 20,
      acceptedSamples: 17,
      controlledFailClosedSamples: 3,
      knownUsageCostUsd: 0.455962,
      targetedRepairsObserved: 15,
      classification: 'q7_fail_generic_engineering_contract_class',
      defectClass: 'assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair',
    })
    expect(plan.liveExecutions[2]).toMatchObject({
      attempt: 3,
      mainSha: '9755c7a40d5e61b76a49e51480e7c5403642e593',
      workflowRunId: 33364521121,
      workflowRunNumber: 18,
      artifactId: 9747914357,
      durableEvidence: 'content-factory/reliability-v2-e-q7-live-soak-evidence-003.json',
      executedSamples: 20,
      acceptedSamples: 16,
      controlledFailClosedSamples: 4,
      knownUsageCostUsd: 0.432952,
      targetedRepairsObserved: 12,
      classification: 'q7_pass_no_new_generic_engineering_contract_class',
      defectClass: 'none_new_generic_engineering_contract_class',
    })
    expect(plan.affectedQualificationGates).toEqual([])
    expect(plan.costCeilingReview).toMatchObject({
      decision: 'retain_usd_5_ceiling',
      latestKnownUsageCostUsd: 0.432952,
      latestCeilingUtilisationPercent: 8.65904,
      cumulativeKnownQ7SpendUsd: 1.31282,
    })
  })

  it('preserves historical Q7 failure evidence and persists the exact third-run classified result', () => {
    expect(firstEvidence.workflow.runId).toBe(33265434110)
    expect(firstEvidence.classification.defectClass).toBe('assessment_subquestion_required_structure_omission_before_targeted_repair')
    expect(secondEvidence.workflow.runId).toBe(33282967568)
    expect(secondEvidence.classification.defectClass).toBe('assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair')

    expect(thirdEvidence).toMatchObject({
      attempt: 3,
      status: 'passed_controlled_educational_fail_closed',
      workflow: {
        runId: 33364521121,
        runNumber: 18,
        mainSha: '9755c7a40d5e61b76a49e51480e7c5403642e593',
        artifactId: 9747914357,
        artifactDigest: 'sha256:1a09cb3242faa1ace9816187ce3b2895bd191c1f9801e846047cd3ba57146d96',
      },
      sampleSummary: {
        planned: 20,
        executed: 20,
        accepted: 16,
        controlledFailClosed: 4,
        infrastructureIncidents: 0,
        engineeringBoundaryBreaches: 0,
        assessmentItemAccepted: 8,
        assessmentItemControlledFailClosed: 2,
        markingPackAccepted: 8,
        markingPackControlledFailClosed: 2,
        targetedRepairsObserved: 12,
      },
      costEvidence: {
        configuredMaxSpendUsd: 5,
        knownUsageCostUsd: 0.432952,
        unpricedSampleCount: 0,
        reviewDecision: 'retain_usd_5_ceiling',
      },
      classification: {
        decision: 'q7_pass_no_new_generic_engineering_contract_class',
        boundary: 'assessment_item_generation_and_marking_pack_generation',
        defectClass: 'none_new_generic_engineering_contract_class',
        previousQ7DefectRecurrence: false,
        assessmentItemClassification: {
          decision: 'controlled_educational_semantic_fail_closed',
          observedSubjectShapes: ['essay_humanities', 'language_prescribed_text'],
        },
        markingPackClassification: {
          decision: 'controlled_educational_semantic_fail_closed',
          observedSubjectShapes: ['quantitative_business_economics', 'mathematics'],
        },
      },
      qualificationOutcome: {
        q7Passed: true,
        overallReliabilityV2Passed: true,
        livePilotEligible: false,
        fullCourseAssembly: false,
        learnerPublication: false,
      },
    })
    expect(new Set(thirdEvidence.sampleSummary.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(thirdEvidence.samples).toHaveLength(20)
    const controlled = thirdEvidence.samples.filter((sample) => sample.disposition === 'controlled_fail_closed')
    expect(controlled).toHaveLength(4)
    expect(controlled.filter((sample) => sample.workerBoundary === 'assessment_item_generation')).toHaveLength(2)
    expect(controlled.filter((sample) => sample.workerBoundary === 'marking_pack_generation')).toHaveLength(2)
    expect(thirdEvidence.samples.every((sample) => sample.provider === 'openai' && sample.model === 'gpt-5.6-terra')).toBe(true)
    expect(controlled.filter((sample) => sample.workerBoundary === 'assessment_item_generation').every((sample) => sample.error?.includes('must evidence exactly the governed requirement IDs'))).toBe(true)
    expect(controlled.every((sample) => !sample.error?.includes('coverage evidence must match its requirement IDs exactly'))).toBe(true)
  })

  it('records Q1-Q7 PASS while recognising the later separate Q8 eligibility transition', () => {
    for (const gate of providerFreeGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pass')
    expect(qualification.q7FailureEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-002.json')
    expect(qualification.q7FailureEvidenceHistory).toEqual([
      'content-factory/reliability-v2-e-q7-live-soak-evidence.json',
      'content-factory/reliability-v2-e-q7-live-soak-evidence-002.json',
    ])
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-003.json')
    expect(qualification.providerFreeQualificationEvidence).toBe('content-factory/reliability-post-q7-002-assessment-item-requalification.json')
    expect(qualification.lastProviderFreeQualificationEvidence).toBe('content-factory/reliability-post-q7-assessment-item-requalification.json')

    expect(thirdEvidence.qualificationOutcome.livePilotEligible).toBe(false)
    expect(plan.livePilotEligibilityChanged).toBe(false)
    expect(qualification.status).toBe('qualified')
    expect(qualification.qualifiedEvidence).not.toBeNull()
    expect(qualification.livePilotEligible).toBe(true)

    const fullCoursePreflight = fullCourseWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const fullCourseRun = fullCourseWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(fullCoursePreflight).toBeGreaterThan(-1)
    expect(fullCourseRun).toBeGreaterThan(fullCoursePreflight)
  })

  it('retains the bounded third-soak request and workflow safety envelope', () => {
    expect(request).toMatchObject({ requestId: 'q7-live-worker-soak-003', maxSpendUsd: 5, fullCourseAssembly: false, learnerPublication: false })
    expect(soakWorkflowText).toContain('workflow_dispatch:')
    expect(soakWorkflowText).toContain('- content-factory/reliability-v2-e-live-worker-soak-request.json')
    expect(soakWorkflowText).toContain("request.maxSpendUsd !== 5")
    expect(soakWorkflowText).not.toContain('continue-on-error: true')
    expect(soakHarnessText).toContain('requiresEngineeringVsEducationalClassification')
  })
})
