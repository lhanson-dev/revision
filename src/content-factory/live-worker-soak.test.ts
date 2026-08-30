import { describe, expect, it } from 'vitest'
import soakPlanText from '../../content-factory/reliability-v2-e-live-worker-soak-plan.json?raw'
import soakRequestText from '../../content-factory/reliability-v2-e-live-worker-soak-request.json?raw'
import soakEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence.json?raw'
import soakWorkflowText from '../../.github/workflows/content-factory-live-worker-soak.yml?raw'
import fullCourseWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import soakHarnessText from './live-worker-soak.integration.test.ts?raw'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'

type SoakPlan = {
  schemaVersion: number
  workItem: string
  gate: string
  status: string
  baseMainSha: string
  runnerMergedMainSha: string
  canonicalRuntime: string
  integrationHarness: string
  triggerModes: string[]
  requestFile: string
  sampleCount: number
  samplesPerShape: number
  subjectShapes: string[]
  workerBoundaries: Array<{
    worker: string
    samplesPerShape: number
    totalSamples: number
    productionEntryPoint: string
  }>
  providerCalls: string
  maxSpendUsd: number
  providerRetriesPerRequest: number
  liveExecution: {
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
  }
  affectedQualificationGates: string[]
  costCeilingReview: {
    decision: string
    knownUsageCostUsd: number
  }
  fullCourseAssembly: boolean
  learnerPublication: boolean
  livePilotEligibilityChanged: boolean
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
}

type SoakRequest = {
  schemaVersion: number
  requestId: string
  gate: string
  runClass: string
  status: string
  requestedFromMainSha: string
  sampleCount: number
  maxSpendUsd: number
  fullCourseAssembly: boolean
  learnerPublication: boolean
}

type SoakEvidence = {
  status: string
  workflow: {
    runId: number
    runNumber: number
    mainSha: string
    artifactId: number
  }
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
  costEvidence: {
    configuredMaxSpendUsd: number
    knownUsageCostUsd: number
    unpricedSampleCount: number
    reviewDecision: string
  }
  classification: {
    decision: string
    boundary: string
    defectClass: string
    observedAcrossAllFiveShapes: boolean
    rawProviderCandidateRetention: string
  }
  affectedQualificationGates: string[]
  qualificationOutcome: {
    q7Passed: boolean
    overallReliabilityV2Passed: boolean
    livePilotEligible: boolean
    fullCourseAssembly: boolean
    learnerPublication: boolean
  }
  samples: Array<{
    sampleId: string
    subjectShape: string
    workerBoundary: string
    status: string
    disposition: string
    provider?: string
    model?: string
    contractVersion?: string
    providerCallCount: number
    repairCount: number
    usageCostUsd?: number
  }>
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  q7FailureEvidence?: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

const plan = JSON.parse(soakPlanText) as SoakPlan
const request = JSON.parse(soakRequestText) as SoakRequest
const evidence = JSON.parse(soakEvidenceText) as SoakEvidence
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
  it('records the completed 20-sample live soak without claiming Q7 PASS', () => {
    expect(plan).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-E',
      gate: 'Q7',
      status: 'live_execution_completed_generic_contract_failure',
      baseMainSha: '9738abe542c4f32a37de269f50a6126c017293e5',
      runnerMergedMainSha: 'ba9d5e5fee0ae33bfac22f393f50faad4e8cb4f7',
      canonicalRuntime: '.github/workflows/content-factory-live-worker-soak.yml',
      integrationHarness: 'src/content-factory/live-worker-soak.integration.test.ts',
      triggerModes: ['workflow_dispatch', 'governed_main_request_file_push'],
      requestFile: 'content-factory/reliability-v2-e-live-worker-soak-request.json',
      sampleCount: 20,
      samplesPerShape: 4,
      providerCalls: 'completed_on_approved_main',
      maxSpendUsd: 5,
      providerRetriesPerRequest: 0,
      fullCourseAssembly: false,
      learnerPublication: false,
      livePilotEligibilityChanged: false,
      q7Passed: false,
      overallReliabilityV2Passed: false,
    })
    expect(new Set(plan.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(plan.workerBoundaries).toEqual([
      {
        worker: 'assessment_item_generation',
        samplesPerShape: 2,
        totalSamples: 10,
        productionEntryPoint: 'createOpenAIModelAssistedWorkers().generateAssessmentItem',
      },
      {
        worker: 'marking_pack_generation',
        samplesPerShape: 2,
        totalSamples: 10,
        productionEntryPoint: 'createOpenAIModelAssistedWorkers().generateMarkingPack',
      },
    ])
    expect(plan.liveExecution).toEqual({
      mainSha: '69d7abb7d3236616b687cbed480e7584ceb69fc9',
      workflowRunId: 33265434110,
      workflowRunNumber: 16,
      artifactId: 9718558827,
      durableEvidence: 'content-factory/reliability-v2-e-q7-live-soak-evidence.json',
      executedSamples: 20,
      acceptedSamples: 13,
      controlledFailClosedSamples: 7,
      knownUsageCostUsd: 0.423906,
      targetedRepairsObserved: 9,
      classification: 'q7_fail_generic_engineering_contract_class',
    })
    expect(plan.affectedQualificationGates).toEqual(providerFreeGates)
    expect(plan.costCeilingReview).toMatchObject({
      decision: 'retain_usd_5_ceiling',
      knownUsageCostUsd: 0.423906,
    })
  })

  it('persists the exact live-soak sample evidence and generic contract classification', () => {
    expect(evidence.status).toBe('failed_generic_contract_class')
    expect(evidence.workflow).toMatchObject({
      runId: 33265434110,
      runNumber: 16,
      mainSha: '69d7abb7d3236616b687cbed480e7584ceb69fc9',
      artifactId: 9718558827,
    })
    expect(evidence.sampleSummary).toMatchObject({
      planned: 20,
      executed: 20,
      accepted: 13,
      controlledFailClosed: 7,
      infrastructureIncidents: 0,
      engineeringBoundaryBreaches: 0,
      assessmentItemAccepted: 3,
      assessmentItemControlledFailClosed: 7,
      markingPackAccepted: 10,
      markingPackControlledFailClosed: 0,
      targetedRepairsObserved: 9,
    })
    expect(new Set(evidence.sampleSummary.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(evidence.costEvidence).toMatchObject({
      configuredMaxSpendUsd: 5,
      knownUsageCostUsd: 0.423906,
      unpricedSampleCount: 0,
      reviewDecision: 'retain_usd_5_ceiling',
    })
    expect(evidence.classification).toMatchObject({
      decision: 'q7_fail_generic_engineering_contract_class',
      boundary: 'assessment_item_generation',
      defectClass: 'assessment_subquestion_required_structure_omission_before_targeted_repair',
      observedAcrossAllFiveShapes: true,
      rawProviderCandidateRetention: 'not_retained_in_soak_artifact',
    })
    expect(evidence.affectedQualificationGates).toEqual(providerFreeGates)
    expect(evidence.qualificationOutcome).toMatchObject({
      q7Passed: false,
      overallReliabilityV2Passed: false,
      livePilotEligible: false,
      fullCourseAssembly: false,
      learnerPublication: false,
    })
    expect(evidence.samples).toHaveLength(20)
    expect(evidence.samples.filter((sample) => sample.workerBoundary === 'assessment_item_generation')).toHaveLength(10)
    expect(evidence.samples.filter((sample) => sample.workerBoundary === 'marking_pack_generation')).toHaveLength(10)
    expect(evidence.samples.every((sample) => sample.provider === 'openai' && sample.model === 'gpt-5.6-terra')).toBe(true)
    expect(evidence.samples.every((sample) => typeof sample.contractVersion === 'string' && typeof sample.usageCostUsd === 'number')).toBe(true)
  })

  it('supports manual dispatch plus one governed main request-file push without broad push execution', () => {
    expect(soakWorkflowText).toContain('workflow_dispatch:')
    expect(soakWorkflowText).toContain('push:')
    expect(soakWorkflowText).toContain('branches:')
    expect(soakWorkflowText).toContain('- main')
    expect(soakWorkflowText).toContain('paths:')
    expect(soakWorkflowText).toContain('- content-factory/reliability-v2-e-live-worker-soak-request.json')
    expect(soakWorkflowText).toContain("if: github.ref == 'refs/heads/main'")
    expect(soakWorkflowText).toContain("process.env.GITHUB_EVENT_NAME !== 'push'")
    expect(soakWorkflowText).toContain("request.runClass !== 'bounded_live_worker_soak'")
    expect(soakWorkflowText).toContain('request.maxSpendUsd !== 5')
    expect(soakWorkflowText.match(/run: \|/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
    expect(soakWorkflowText).not.toContain("run: node <<'NODE'")
    expect(soakWorkflowText).toContain("CONTENT_FACTORY_LIVE_WORKER_SOAK: '1'")
    expect(soakWorkflowText).toContain("CONTENT_FACTORY_MAX_SPEND_USD: '5'")
    expect(soakWorkflowText).toContain('OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}')
    expect(soakWorkflowText).toContain('live-worker-soak.integration.test.ts')
    expect(soakWorkflowText).not.toContain('live-pilot.integration.test.ts')
    expect(soakWorkflowText).not.toContain('continue-on-error: true')
  })

  it('uses the second governed request without relaxing the safety envelope', () => {
    expect(request).toEqual({
      schemaVersion: 1,
      requestId: 'q7-live-worker-soak-002',
      gate: 'Q7',
      runClass: 'bounded_live_worker_soak',
      status: 'requested',
      authority: '80-company-workflows/Content Factory Reliability Qualification Standard.md',
      costAuthority: '60-business-operations/Content Factory Bootstrap Cost Strategy.md',
      requestedFromMainSha: 'bacb3e33fc09257a727844162b3b405de2abe611',
      sampleCount: 20,
      maxSpendUsd: 5,
      fullCourseAssembly: false,
      learnerPublication: false,
      purpose: 'Trigger the second Reliability v2 Q7 bounded live worker soak after the generic Assessment Item provider-contract omission class was corrected and Q1-Q6 were requalified provider-free on approved main.',
    })
  })

  it('restores Q1-Q6 after requalification while keeping Q7 and full-course execution fail closed', () => {
    for (const gate of providerFreeGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.q7FailureEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence.json')
    expect(qualification.status).toBe('paused')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)

    const fullCoursePreflight = fullCourseWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const fullCourseRun = fullCourseWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(fullCoursePreflight).toBeGreaterThan(-1)
    expect(fullCourseRun).toBeGreaterThan(fullCoursePreflight)
    expect(fullCourseWorkflowText).toContain('scripts/content-factory-live-pilot-qualification.mjs')
  })

  it('uses production workers, independent Marking inputs and evidence-first failure classification', () => {
    expect(soakHarnessText).toContain('createOpenAIModelAssistedWorkers')
    expect(soakHarnessText).toContain("'assessment_item_generation'")
    expect(soakHarnessText).toContain("'marking_pack_generation'")
    expect(soakHarnessText).toContain('deterministicAssessmentItem')
    expect(soakHarnessText).toContain('providerCallCount')
    expect(soakHarnessText).toContain('repairCount')
    expect(soakHarnessText).toContain('usageCostUsd')
    expect(soakHarnessText).toContain('controlled_fail_closed')
    expect(soakHarnessText).toContain('requiresEngineeringVsEducationalClassification')
    expect(soakHarnessText).toContain('fullCourseAssembly: false')
    expect(soakHarnessText).toContain('learnerPublication: false')
  })
})