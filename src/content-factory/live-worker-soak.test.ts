import { describe, expect, it } from 'vitest'
import soakPlanText from '../../content-factory/reliability-v2-e-live-worker-soak-plan.json?raw'
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
  canonicalRuntime: string
  integrationHarness: string
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
  fullCourseAssembly: boolean
  learnerPublication: boolean
  livePilotEligibilityChanged: boolean
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

const plan = JSON.parse(soakPlanText) as SoakPlan
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
  it('locks the governed 20-sample five-shape high-risk soak plan without claiming Q7 PASS', () => {
    expect(plan).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-E',
      gate: 'Q7',
      status: 'runner_ready_pending_merge_and_live_execution',
      baseMainSha: '9738abe542c4f32a37de269f50a6126c017293e5',
      canonicalRuntime: '.github/workflows/content-factory-live-worker-soak.yml',
      integrationHarness: 'src/content-factory/live-worker-soak.integration.test.ts',
      sampleCount: 20,
      samplesPerShape: 4,
      providerCalls: 'live_after_merge_only',
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
  })

  it('requires approved-main manual execution and preserves the US$5 spend ceiling', () => {
    expect(soakWorkflowText).toContain('workflow_dispatch:')
    expect(soakWorkflowText).toContain("if: github.ref == 'refs/heads/main'")
    expect(soakWorkflowText).toContain("CONTENT_FACTORY_LIVE_WORKER_SOAK: '1'")
    expect(soakWorkflowText).toContain("CONTENT_FACTORY_MAX_SPEND_USD: '5'")
    expect(soakWorkflowText).toContain('OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}')
    expect(soakWorkflowText).toContain('live-worker-soak.integration.test.ts')
    expect(soakWorkflowText).not.toContain('live-pilot.integration.test.ts')
    expect(soakWorkflowText).not.toContain('continue-on-error: true')
  })

  it('keeps full-course execution fail closed while Q7 is pending', () => {
    for (const gate of providerFreeGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
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
    expect(soakHarnessText).toContain("createOpenAIModelAssistedWorkers")
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
