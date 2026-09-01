import { describe, expect, it } from 'vitest'
import replayText from '../../content-factory/reliability-post-pilot20-q2-historical-replay.json?raw'
import pilot20Text from '../../content-factory/reliability-pilot20-stop-loss-architecture-review.json?raw'
import legacyCorpusText from '../../content-factory/reliability-v2-b-historical-failure-corpus.json?raw'
import pilot19Text from '../../content-factory/reliability-post-pilot19-requalification.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import { diagnoseStructuredAssessment, type AssessmentSubquestion } from './assessment-integrity'
import {
  runQ4AssessmentCandidateExhaustionSimulation,
  runQ4CandidateRecoverySimulation,
} from './q4-deterministic-pipeline-fixture'

type ReplayEvidence = {
  schemaVersion: number
  status: string
  gate: string
  scope: string
  baseMainSha: string
  providerCallsUsed: boolean
  historicalRecordsRewritten: boolean
  carriedForwardEvidence: {
    pilots1To18Corpus: string
    pilots1To18Regression: string
    pilot19Requalification: string
    pilot19Q2Status: string
  }
  pilot20HistoricalEvidence: {
    record: string
    pilot: number
    workflowRunId: number
    jobIssueNumber: number
    approvedMainSha: string
    artifactId: number
    artifactDigest: string
    defectClass: string
    historicalOutcome: string
  }
  acceptance: Record<string, boolean>
}

type Pilot20Record = {
  status: string
  trigger: {
    pilot: number
    workflowRunId: number
    jobIssueNumber: number
    approvedMainSha: string
    artifactId: number
    artifactDigest: string
    finalState: string
  }
  classification: {
    decision: string
    defectClass: string
    observedFailure: string
    whyGeneric: string
  }
  qualificationReset: {
    q2HistoricalReplayMustIncludePilot20: boolean
  }
  historicalRecordsRewritten: boolean
}

type LegacyCorpus = {
  schemaVersion: number
  workItem: string
  historicalRecordsRewritten: boolean
  pilots: Array<{ pilotNumber: number }>
}

type Pilot19Record = {
  status: string
  gates: Record<string, { status: string; conclusion: string }>
  historicalRecordsRewritten: boolean
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

const replay = JSON.parse(replayText) as ReplayEvidence
const pilot20 = JSON.parse(pilot20Text) as Pilot20Record
const legacyCorpus = JSON.parse(legacyCorpusText) as LegacyCorpus
const pilot19 = JSON.parse(pilot19Text) as Pilot19Record
const qualification = JSON.parse(qualificationText) as Qualification
const assessmentSlotRef = 'assessment-slot:calculation-family:paper-1'

function pilot20DiagnosticReplaySubquestions(): AssessmentSubquestion[] {
  return [
    {
      id: 'q1',
      command: 'State',
      wording: 'State the annual contribution shown by the supplied figures.',
      maxMark: 2,
      requirementIds: ['finance-analysis'],
      responseDemands: ['calculation'],
      coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'annual contribution' }],
    },
    {
      id: 'q5',
      command: 'State',
      wording: 'State what the contribution result shows about the proposal.',
      maxMark: 2,
      requirementIds: ['finance-analysis'],
      responseDemands: ['interpretation'],
      coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'contribution result' }],
    },
  ]
}

function assessmentRuns(
  workerRuns: Awaited<ReturnType<typeof runQ4CandidateRecoverySimulation>>['job']['workerRuns'],
) {
  return workerRuns.filter((run) => run.inputRefs.includes(assessmentSlotRef))
}

describe('Content Factory Q2 post-Pilot #20 historical recovery replay', () => {
  it('extends Q2 through immutable Pilot #20 provenance without rewriting earlier evidence', () => {
    expect(replay.schemaVersion).toBe(1)
    expect(replay.status).toBe('implemented_pending_same_head_assurance')
    expect(replay.gate).toBe('Q2-historical-failure-replay-corpus')
    expect(replay.scope).toBe('post_pilot_20_candidate_recovery_historical_replay')
    expect(replay.baseMainSha).toBe('e906b4c244b1fabaf18e6a4e75c726e7398c1136')
    expect(replay.providerCallsUsed).toBe(false)
    expect(replay.historicalRecordsRewritten).toBe(false)

    expect(legacyCorpus.schemaVersion).toBe(1)
    expect(legacyCorpus.workItem).toBe('V2-B')
    expect(legacyCorpus.historicalRecordsRewritten).toBe(false)
    expect(legacyCorpus.pilots.map((entry) => entry.pilotNumber)).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 1),
    )

    expect(pilot19.status).toBe('complete')
    expect(pilot19.gates['Q2-historical-failure-replay-corpus']?.status).toBe('pass')
    expect(pilot19.historicalRecordsRewritten).toBe(false)

    expect(pilot20.status).toBe('architecture_reset_required')
    expect(pilot20.historicalRecordsRewritten).toBe(false)
    expect(pilot20.qualificationReset.q2HistoricalReplayMustIncludePilot20).toBe(true)
    expect(pilot20.trigger).toMatchObject({
      pilot: replay.pilot20HistoricalEvidence.pilot,
      workflowRunId: replay.pilot20HistoricalEvidence.workflowRunId,
      jobIssueNumber: replay.pilot20HistoricalEvidence.jobIssueNumber,
      approvedMainSha: replay.pilot20HistoricalEvidence.approvedMainSha,
      artifactId: replay.pilot20HistoricalEvidence.artifactId,
      artifactDigest: replay.pilot20HistoricalEvidence.artifactDigest,
      finalState: replay.pilot20HistoricalEvidence.historicalOutcome,
    })
    expect(pilot20.classification.defectClass).toBe(replay.pilot20HistoricalEvidence.defectClass)
    expect(pilot20.classification.decision).toBe('new_generic_engineering_contract_class')
    expect(pilot20.classification.observedFailure).toMatch(/calculation-demand.*q1/i)
    expect(pilot20.classification.observedFailure).toMatch(/interpretation-demand.*q5/i)
    expect(pilot20.classification.whyGeneric).toMatch(/course-level blocker/i)
  })

  it('replays the Pilot #20 complete-diagnostic failure as two simultaneous inspectable findings', () => {
    const subquestions = pilot20DiagnosticReplaySubquestions()
    const diagnostics = diagnoseStructuredAssessment({
      itemId: 'pilot20-generic-replay',
      maxMark: 4,
      governedRequirementIds: ['finance-analysis'],
      subquestions,
    })

    const demandFindings = diagnostics.filter((entry) => entry.code === 'ASSESSMENT_RESPONSE_DEMAND_UNSUPPORTED')
    expect(demandFindings).toEqual([
      expect.objectContaining({
        path: 'subquestions[0].responseDemands',
        message: expect.stringContaining('calculation'),
      }),
      expect.objectContaining({
        path: 'subquestions[1].responseDemands',
        message: expect.stringContaining('interpretation'),
      }),
    ])
  })

  it('replays the generic recovery defect through the production route: reject candidate 1, refill the same slot with candidate 2, continue', async () => {
    const result = await runQ4CandidateRecoverySimulation()
    const runs = assessmentRuns(result.job.workerRuns)

    expect(result.trace.assessmentCandidateCalls).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
      { candidateNumber: 2, maxCandidates: 2 },
    ])
    expect(runs).toHaveLength(2)
    expect(runs.map((run) => run.status)).toEqual(['failure', 'success'])
    expect(runs[0].inputRefs).toContain(`${assessmentSlotRef}:candidate:1`)
    expect(runs[0].outputRefs).toEqual([])
    expect(runs[1].inputRefs).toContain(`${assessmentSlotRef}:candidate:2`)
    expect(runs[1].outputRefs).toHaveLength(1)
    expect(result.latestManifest.assessmentItemRefs).toHaveLength(1)
    expect(result.latestManifest.markingPackRefs).toHaveLength(1)
    expect(result.job.blockers).toEqual([])
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.observedUsageCost).toBe(0)
  })

  it('replays the fail-closed boundary when both candidates are rejected: no candidate 3 and no silent missing slot', async () => {
    const result = await runQ4AssessmentCandidateExhaustionSimulation()
    const runs = assessmentRuns(result.job.workerRuns)

    expect(result.trace.assessmentCandidateCalls).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
      { candidateNumber: 2, maxCandidates: 2 },
    ])
    expect(runs.map((run) => run.status)).toEqual(['failure', 'failure'])
    expect(runs.every((run) => run.outputRefs.length === 0)).toBe(true)
    expect(runs.some((run) => run.inputRefs.includes(`${assessmentSlotRef}:candidate:3`))).toBe(false)
    expect(result.store.refs('assessment_item')).toEqual([])
    expect(result.store.refs('course_content_pack')).toEqual([])
    expect(result.store.refs('expert_review_package')).toEqual([])
    expect(result.job.state).toBe('blocked')
    expect(result.job.blockers.some((blocker) => blocker.reason.includes(assessmentSlotRef))).toBe(true)
  })

  it('preserves Q2 slice history while accepting the later governed Q1-Q6 consolidation', () => {
    expect(replay.acceptance.q2EvidenceReady).toBe(true)
    expect(replay.acceptance.globalQualificationStateChanged).toBe(false)
    expect(replay.acceptance.q7Eligible).toBe(false)
    expect(replay.acceptance.q8Eligible).toBe(false)

    expect(qualification.status).toBe('paused')
    expect(qualification.gateStatus['Q2-historical-failure-replay-corpus']).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
  })
})