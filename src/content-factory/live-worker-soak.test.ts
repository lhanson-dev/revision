import { describe, expect, it } from 'vitest'
import soakPlanText from '../../content-factory/reliability-v2-e-live-worker-soak-plan.json?raw'
import soakRequestText from '../../content-factory/reliability-v2-e-live-worker-soak-request.json?raw'
import fifthReviewText from '../../content-factory/reliability-post-pilot20-q7-attempt-005-review.json?raw'
import sixthEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-006.json?raw'
import fourthEvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-004.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import soakWorkflowText from '../../.github/workflows/content-factory-live-worker-soak.yml?raw'
import fullCourseWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'
import soakHarnessText from './live-worker-soak.integration.test.ts?raw'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'

type Plan = { status: string; sampleCount: number; samplesPerShape: number; subjectShapes: string[]; maxSpendUsd: number; liveExecutions: Array<Record<string, unknown>>; latestLiveExecutionAttempt: number; costCeilingReview: { cumulativeKnownQ7SpendUsd: number; latestKnownUsageCostUsd: number }; q7Passed: boolean; overallReliabilityV2Passed: boolean }
type Qualification = { status: string; gateStatus: Record<string,string>; q7PassEvidence: string; q7PassEvidenceHistory: string[]; qualifiedEvidence: unknown | null; livePilotEligible: boolean }
type Evidence = { workflow: { runId: number; runNumber: number; mainSha: string; artifactId: number; artifactDigest: string }; sampleSummary: { executed: number; accepted: number; controlledFailClosed: number; infrastructureIncidents: number; engineeringBoundaryBreaches: number; targetedRepairsObserved: number; freshCandidateResamplesObserved: number; providerCallClassificationComplete: boolean }; costEvidence: { knownUsageCostUsd: number; cumulativeKnownQ7SpendUsd: number }; classification: { decision: string; instrumentationComplete: boolean; candidateRecoveryObserved: boolean }; samples: Array<{ disposition: string; providerCallClassificationComplete: boolean }> }

const plan = JSON.parse(soakPlanText) as Plan
const request = JSON.parse(soakRequestText) as { requestId: string; status: string; requestedFromMainSha: string; sampleCount: number; maxSpendUsd: number; fullCourseAssembly: boolean; learnerPublication: boolean }
const fifthReview = JSON.parse(fifthReviewText) as { qualificationDecision: { q7Passed: boolean; q7RemainsPending: boolean }; providerOutcome: { acceptedSamples: number; knownUsageCostUsd: number } }
const sixth = JSON.parse(sixthEvidenceText) as Evidence
const fourth = JSON.parse(fourthEvidenceText) as { workflow: { runId: number }; classification: { decision: string } }
const qualification = JSON.parse(qualificationText) as Qualification
const providerFreeGates = ['Q1-compiler-worker-ownership-inventory','Q2-historical-failure-replay-corpus','Q3-adversarial-provider-free-subject-matrix','Q4-deterministic-full-pipeline-simulation','Q5-restart-reuse-dependency-invalidation','Q6-repeated-provider-free-stability']

describe('Reliability v2-E Q7 live-worker soak governance after Pilot #20', () => {
  it('records all six live executions and the candidate-aware attempt-006 PASS', () => {
    expect(plan).toMatchObject({ status: 'sixth_live_execution_passed_candidate_aware_all_samples_accepted', sampleCount: 20, samplesPerShape: 4, maxSpendUsd: 5, latestLiveExecutionAttempt: 6, q7Passed: true, overallReliabilityV2Passed: true })
    expect(new Set(plan.subjectShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(plan.liveExecutions).toHaveLength(6)
    expect(plan.liveExecutions[4]).toMatchObject({ attempt: 5, workflowRunId: 33549488154, acceptedSamples: 20, classification: 'q7_pending_evidence_instrumentation_correction_required' })
    expect(plan.liveExecutions[5]).toMatchObject({ attempt: 6, workflowRunId: 33554413877, acceptedSamples: 20, knownUsageCostUsd: 0.404658, targetedRepairsObserved: 10, freshCandidateResamplesObserved: 1, providerCallClassificationComplete: true, durableEvidence: 'content-factory/reliability-v2-e-q7-live-soak-evidence-006.json', classification: 'q7_pass_no_new_generic_engineering_contract_class' })
    expect(plan.costCeilingReview).toMatchObject({ latestKnownUsageCostUsd: 0.404658, cumulativeKnownQ7SpendUsd: 2.496296 })
  })

  it('preserves attempt 005 as instrumentation-limited rather than rewriting history', () => {
    expect(fifthReview).toMatchObject({ providerOutcome: { acceptedSamples: 20, knownUsageCostUsd: 0.394502 }, qualificationDecision: { q7Passed: false, q7RemainsPending: true } })
    expect(fourth).toMatchObject({ workflow: { runId: 33395187056 }, classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class' } })
  })

  it('binds Q7 PASS to exact candidate-aware attempt-006 evidence', () => {
    expect(sixth).toMatchObject({
      workflow: { runId: 33554413877, runNumber: 21, mainSha: 'e74e04613c8d9fa8d7eba617bb839ef368d26029', artifactId: 9818944889, artifactDigest: 'sha256:43be3553cf21db5892efbfab888c0211f7a02944408a631d228d06fd8955a30b' },
      sampleSummary: { executed: 20, accepted: 20, controlledFailClosed: 0, infrastructureIncidents: 0, engineeringBoundaryBreaches: 0, targetedRepairsObserved: 10, freshCandidateResamplesObserved: 1, providerCallClassificationComplete: true },
      costEvidence: { knownUsageCostUsd: 0.404658, cumulativeKnownQ7SpendUsd: 2.496296 },
      classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class', instrumentationComplete: true, candidateRecoveryObserved: true },
    })
    expect(sixth.samples).toHaveLength(20)
    expect(sixth.samples.every((sample) => sample.disposition === 'accepted' && sample.providerCallClassificationComplete)).toBe(true)
  })

  it('keeps Q8 fail closed after Q7 PASS', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.qualifiedEvidence).toBeNull()
    for (const gate of providerFreeGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pass')
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-006.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json','content-factory/reliability-v2-e-q7-live-soak-evidence-004.json'])
  })

  it('preserves the governed request and workflow safety envelope', () => {
    expect(request).toMatchObject({ requestId: 'q7-live-worker-soak-006', status: 'requested', requestedFromMainSha: '3126e49350a670aa276adfb45c44fc5c220ac467', sampleCount: 20, maxSpendUsd: 5, fullCourseAssembly: false, learnerPublication: false })
    expect(soakWorkflowText).not.toContain('continue-on-error: true')
    expect(soakHarnessText).toContain('requiresEngineeringVsEducationalClassification')
    const fullCoursePreflight = fullCourseWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const fullCourseRun = fullCourseWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(fullCoursePreflight).toBeGreaterThan(-1)
    expect(fullCourseRun).toBeGreaterThan(fullCoursePreflight)
  })
})
