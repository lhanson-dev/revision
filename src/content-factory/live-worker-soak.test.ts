import { describe, expect, it } from 'vitest'
import soakPlanText from '../../content-factory/reliability-v2-e-live-worker-soak-plan.json?raw'
import soakRequestText from '../../content-factory/reliability-v2-e-live-worker-soak-request.json?raw'
import firstEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence.json?raw'
import secondEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-002.json?raw'
import thirdEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-003.json?raw'
import fourthEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-004.json?raw'
import q8Eligibility002Text from '../../content-factory/reliability-v2-f-q8-eligibility-002.json?raw'
import pilot19Text from '../../content-factory/reliability-pilot19-assessment-architecture-review.json?raw'
import soakWorkflowText from '../../.github/workflows/content-factory-live-worker-soak.yml?raw'
import fullCourseWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import soakHarnessText from './live-worker-soak.integration.test.ts?raw'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'

type Evidence = {
  workflow: { runId: number; runNumber: number; mainSha: string; artifactId: number; artifactDigest?: string }
  sampleSummary: { executed: number; accepted: number; controlledFailClosed: number; infrastructureIncidents: number; engineeringBoundaryBreaches: number; assessmentItemAccepted?: number; markingPackAccepted?: number; targetedRepairsObserved?: number; subjectShapes: string[] }
  assessmentShapeCoverage?: Record<string, string[]>
  costEvidence: { configuredMaxSpendUsd: number; knownUsageCostUsd: number; unpricedSampleCount: number; cumulativeKnownQ7SpendUsd?: number }
  classification: { decision: string; defectClass: string; previousQ7DefectRecurrence?: boolean; allSamplesAccepted?: boolean; requiresEngineeringVsEducationalClassification?: boolean }
  qualificationOutcome: { q7Passed: boolean; overallReliabilityV2Passed: boolean; livePilotEligible: boolean }
  samples: Array<{ workerBoundary: string; disposition: string; provider: string; model: string; repairCount?: number; error?: string }>
}

type Plan = {
  schemaVersion: number; workItem: string; gate: string; status: string; sampleCount: number; samplesPerShape: number; subjectShapes: string[]; maxSpendUsd: number
  liveExecutions: Array<{ attempt: number; workflowRunId: number; defectClass: string; classification: string; acceptedSamples: number; controlledFailClosedSamples: number; knownUsageCostUsd: number; durableEvidence: string }>
  latestLiveExecutionAttempt: number; costCeilingReview: { cumulativeKnownQ7SpendUsd: number }; q7Passed: boolean; overallReliabilityV2Passed: boolean
}

type Qualification = {
  status: string; gateStatus: Record<string, string>; q7FailureEvidence: string; q7FailureEvidenceHistory: string[]; q7PassEvidence: string; q7PassEvidenceHistory: string[]
  qualifiedEvidence: { eligibilityRecord: string; q7PassRecord: string; q7PassingAttempt: number; q7WorkflowRunId: number; passedGates: string[] } | null
  livePilotEligible: boolean
}

type Q8 = { reviewedApprovedMainSha: string; providerCallsUsed: boolean; fullCourseExecutionTriggered: boolean; decision: { qualificationStatus: string; livePilotEligible: boolean; confirmationPilotTriggeredByThisChange: boolean } }

const plan = JSON.parse(soakPlanText) as Plan
const first = JSON.parse(firstEvidenceText) as Evidence
const second = JSON.parse(secondEvidenceText) as Evidence
const third = JSON.parse(thirdEvidenceText) as Evidence
const fourth = JSON.parse(fourthEvidenceText) as Evidence
const q8 = JSON.parse(q8Eligibility002Text) as Q8
const request = JSON.parse(soakRequestText) as { requestId: string; status: string; requestedFromMainSha: string; sampleCount: number; maxSpendUsd: number; fullCourseAssembly: boolean; learnerPublication: boolean }
const pilot19 = JSON.parse(pilot19Text) as { nextQualificationStep: { q7Required: boolean; requiredLiveCoverage: string[] } }
const qualification = JSON.parse(qualificationText) as Qualification

const providerFreeGates = ['Q1-compiler-worker-ownership-inventory','Q2-historical-failure-replay-corpus','Q3-adversarial-provider-free-subject-matrix','Q4-deterministic-full-pipeline-simulation','Q5-restart-reuse-dependency-invalidation','Q6-repeated-provider-free-stability']

describe('Reliability v2-E Q7 live-worker soak governance after Pilot #19', () => {
  it('preserves historical attempts and records the fourth post-Pilot-19 PASS', () => {
    expect(plan).toMatchObject({ schemaVersion: 1, workItem: 'V2-E', gate: 'Q7', status: 'fourth_live_execution_passed_all_samples_accepted', sampleCount: 20, samplesPerShape: 4, maxSpendUsd: 5, latestLiveExecutionAttempt: 4, q7Passed: true, overallReliabilityV2Passed: true })
    expect(new Set(plan.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(plan.liveExecutions).toHaveLength(4)
    expect(plan.liveExecutions[0]).toMatchObject({ attempt: 1, workflowRunId: 33265434110, defectClass: 'assessment_subquestion_required_structure_omission_before_targeted_repair' })
    expect(plan.liveExecutions[1]).toMatchObject({ attempt: 2, workflowRunId: 33282967568, classification: 'q7_fail_generic_engineering_contract_class', defectClass: 'assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair' })
    expect(plan.liveExecutions[2]).toMatchObject({ attempt: 3, workflowRunId: 33364521121, classification: 'q7_pass_no_new_generic_engineering_contract_class' })
    expect(plan.liveExecutions[3]).toMatchObject({ attempt: 4, workflowRunId: 33395187056, acceptedSamples: 20, controlledFailClosedSamples: 0, knownUsageCostUsd: 0.384316, durableEvidence: 'content-factory/reliability-v2-e-q7-live-soak-evidence-004.json', classification: 'q7_pass_no_new_generic_engineering_contract_class' })
    expect(plan.costCeilingReview.cumulativeKnownQ7SpendUsd).toBe(1.697136)
  })

  it('preserves the third historical PASS evidence unchanged', () => {
    expect(first.workflow.runId).toBe(33265434110)
    expect(second.workflow.runId).toBe(33282967568)
    expect(third).toMatchObject({ workflow: { runId: 33364521121, runNumber: 18, mainSha: '9755c7a40d5e61b76a49e51480e7c5403642e593', artifactId: 9747914357 }, sampleSummary: { executed: 20, accepted: 16, controlledFailClosed: 4 }, classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class' } })
  })

  it('binds the fourth PASS to the exact live artifact and expanded Pilot #19 coverage', () => {
    expect(fourth).toMatchObject({ workflow: { runId: 33395187056, runNumber: 19, mainSha: '02fbccbd1979460b63f3e0ee7f85ee2d1fede3c9', artifactId: 9759214890, artifactDigest: 'sha256:bae4232a51535614ba6ad7bd7e7d4a85b177f7aa5d45136c0b3026e8ad08178e' }, sampleSummary: { executed: 20, accepted: 20, controlledFailClosed: 0, infrastructureIncidents: 0, engineeringBoundaryBreaches: 0, assessmentItemAccepted: 10, markingPackAccepted: 10, targetedRepairsObserved: 8 }, costEvidence: { configuredMaxSpendUsd: 5, knownUsageCostUsd: 0.384316, unpricedSampleCount: 0, cumulativeKnownQ7SpendUsd: 1.697136 }, classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class', defectClass: 'none_new_generic_engineering_contract_class', allSamplesAccepted: true, requiresEngineeringVsEducationalClassification: false } })
    expect(fourth.samples).toHaveLength(20)
    expect(fourth.samples.every((sample) => sample.disposition === 'accepted')).toBe(true)
    expect(fourth.assessmentShapeCoverage?.quantitativeBusinessEconomicsAssessmentSamples).toEqual(['knowledge_mcq', 'application_mcq'])
  })

  it('preserves historical Q7/Q8 PASS evidence while current Q1-Q6 are requalified and Q7 is pending', () => {
    expect(qualification.q7FailureEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence.json','content-factory/reliability-v2-e-q7-live-soak-evidence-002.json'])
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-004.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json'])
    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.qualifiedEvidence).toBeNull()
    for (const gate of providerFreeGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(q8).toMatchObject({ reviewedApprovedMainSha: 'f2b9b43ccddc0111859da39cff4900343065f7a2', providerCallsUsed: false, fullCourseExecutionTriggered: false, decision: { qualificationStatus: 'qualified', livePilotEligible: true, confirmationPilotTriggeredByThisChange: false } })
  })

  it('preserves the governed current request and workflow safety envelope', () => {
    expect(pilot19.nextQualificationStep.requiredLiveCoverage).toEqual(expect.arrayContaining(['knowledge MCQ','application MCQ','calculation demand guard','interpretation demand guard']))
    expect(request).toMatchObject({ requestId: 'q7-live-worker-soak-005', status: 'requested', requestedFromMainSha: '654189bbe7888ac8a7a975dc3696190ea1ec74b0', sampleCount: 20, maxSpendUsd: 5, fullCourseAssembly: false, learnerPublication: false })
    expect(soakWorkflowText).not.toContain('continue-on-error: true')
    expect(soakHarnessText).toContain('requiresEngineeringVsEducationalClassification')
    const fullCoursePreflight = fullCourseWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const fullCourseRun = fullCourseWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(fullCoursePreflight).toBeGreaterThan(-1)
    expect(fullCourseRun).toBeGreaterThan(fullCoursePreflight)
  })
})
