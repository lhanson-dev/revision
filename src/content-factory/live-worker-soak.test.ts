import { describe, expect, it } from 'vitest'
import soakPlanText from '../../content-factory/reliability-v2-e-live-worker-soak-plan.json?raw'
import soakRequestText from '../../content-factory/reliability-v2-e-live-worker-soak-request.json?raw'
import firstEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence.json?raw'
import secondEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-002.json?raw'
import thirdEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-003.json?raw'
import pilot19Text from '../../content-factory/reliability-pilot19-assessment-architecture-review.json?raw'
import soakWorkflowText from '../../.github/workflows/content-factory-live-worker-soak.yml?raw'
import fullCourseWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import soakHarnessText from './live-worker-soak.integration.test.ts?raw'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'

type Evidence = {
  workflow: { runId: number; runNumber: number; mainSha: string; artifactId: number; artifactDigest?: string }
  sampleSummary: {
    executed: number
    accepted: number
    controlledFailClosed: number
    infrastructureIncidents: number
    engineeringBoundaryBreaches: number
    subjectShapes: string[]
  }
  costEvidence: { configuredMaxSpendUsd: number; knownUsageCostUsd: number; unpricedSampleCount: number }
  classification: { decision: string; defectClass: string; previousQ7DefectRecurrence?: boolean }
  qualificationOutcome: { q7Passed: boolean; overallReliabilityV2Passed: boolean; livePilotEligible: boolean }
  samples: Array<{ workerBoundary: string; disposition: string; provider: string; model: string; error?: string }>
}

type Plan = {
  schemaVersion: number
  workItem: string
  gate: string
  sampleCount: number
  samplesPerShape: number
  subjectShapes: string[]
  maxSpendUsd: number
  liveExecutions: Array<{ attempt: number; workflowRunId: number; defectClass: string; classification: string }>
  latestLiveExecutionAttempt: number
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  q7FailureEvidence: string
  q7FailureEvidenceHistory: string[]
  q7PassEvidence: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

const plan = JSON.parse(soakPlanText) as Plan
const first = JSON.parse(firstEvidenceText) as Evidence
const second = JSON.parse(secondEvidenceText) as Evidence
const third = JSON.parse(thirdEvidenceText) as Evidence
const request = JSON.parse(soakRequestText) as { requestId: string; maxSpendUsd: number; fullCourseAssembly: boolean; learnerPublication: boolean }
const pilot19 = JSON.parse(pilot19Text) as { nextQualificationStep: { q7Required: boolean; requiredLiveCoverage: string[] } }
const qualification = JSON.parse(qualificationText) as Qualification

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

describe('Reliability v2-E Q7 live-worker soak governance after Pilot #19', () => {
  it('preserves all three historical Q7 attempts and the classified third-attempt PASS', () => {
    expect(plan).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-E',
      gate: 'Q7',
      sampleCount: 20,
      samplesPerShape: 4,
      maxSpendUsd: 5,
      latestLiveExecutionAttempt: 3,
      q7Passed: true,
      overallReliabilityV2Passed: true,
    })
    expect(new Set(plan.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(plan.liveExecutions).toHaveLength(3)
    expect(plan.liveExecutions[0]).toMatchObject({
      attempt: 1,
      workflowRunId: 33265434110,
      defectClass: 'assessment_subquestion_required_structure_omission_before_targeted_repair',
    })
    expect(plan.liveExecutions[1]).toMatchObject({
      attempt: 2,
      workflowRunId: 33282967568,
      classification: 'q7_fail_generic_engineering_contract_class',
      defectClass: 'assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair',
    })
    expect(plan.liveExecutions[2]).toMatchObject({
      attempt: 3,
      workflowRunId: 33364521121,
      classification: 'q7_pass_no_new_generic_engineering_contract_class',
      defectClass: 'none_new_generic_engineering_contract_class',
    })
  })

  it('preserves the exact third-run classified evidence rather than rewriting it after Pilot #19', () => {
    expect(first.workflow.runId).toBe(33265434110)
    expect(second.workflow.runId).toBe(33282967568)
    expect(third).toMatchObject({
      workflow: {
        runId: 33364521121,
        runNumber: 18,
        mainSha: '9755c7a40d5e61b76a49e51480e7c5403642e593',
        artifactId: 9747914357,
        artifactDigest: 'sha256:1a09cb3242faa1ace9816187ce3b2895bd191c1f9801e846047cd3ba57146d96',
      },
      sampleSummary: {
        executed: 20,
        accepted: 16,
        controlledFailClosed: 4,
        infrastructureIncidents: 0,
        engineeringBoundaryBreaches: 0,
      },
      costEvidence: {
        configuredMaxSpendUsd: 5,
        knownUsageCostUsd: 0.432952,
        unpricedSampleCount: 0,
      },
      classification: {
        decision: 'q7_pass_no_new_generic_engineering_contract_class',
        defectClass: 'none_new_generic_engineering_contract_class',
        previousQ7DefectRecurrence: false,
      },
      qualificationOutcome: {
        q7Passed: true,
        overallReliabilityV2Passed: true,
        livePilotEligible: false,
      },
    })
    expect(new Set(third.sampleSummary.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(third.samples).toHaveLength(20)
    expect(third.samples.every((sample) => sample.provider === 'openai' && sample.model === 'gpt-5.6-terra')).toBe(true)
  })

  it('distinguishes historical Q7 PASS from the post-Pilot #19 pending requalification soak', () => {
    expect(qualification.q7FailureEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-002.json')
    expect(qualification.q7FailureEvidenceHistory).toEqual([
      'content-factory/reliability-v2-e-q7-live-soak-evidence.json',
      'content-factory/reliability-v2-e-q7-live-soak-evidence-002.json',
    ])
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-003.json')
    expect(qualification.status).toBe('paused')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
    for (const gate of providerFreeGates) {
      expect(qualification.gateStatus[gate]).toBe('pass')
    }
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
  })

  it('requests the next bounded Q7 with the MCQ class that historical soak scenarios missed', () => {
    expect(pilot19.nextQualificationStep.q7Required).toBe(true)
    expect(pilot19.nextQualificationStep.requiredLiveCoverage).toEqual(expect.arrayContaining([
      'knowledge MCQ',
      'application MCQ',
      'calculation demand guard',
      'interpretation demand guard',
    ]))
    expect(request).toMatchObject({ requestId: 'q7-live-worker-soak-004', maxSpendUsd: 5, fullCourseAssembly: false, learnerPublication: false })
    expect(soakWorkflowText).toContain('workflow_dispatch:')
    expect(soakWorkflowText).toContain('- content-factory/reliability-v2-e-live-worker-soak-request.json')
    expect(soakWorkflowText).not.toContain('continue-on-error: true')
    expect(soakHarnessText).toContain('requiresEngineeringVsEducationalClassification')

    const fullCoursePreflight = fullCourseWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const fullCourseRun = fullCourseWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(fullCoursePreflight).toBeGreaterThan(-1)
    expect(fullCourseRun).toBeGreaterThan(fullCoursePreflight)
  })
})
