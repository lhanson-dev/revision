import { describe, expect, it } from 'vitest'
import {
  q4ExpectedStateTrace,
  runQ4AssessmentCandidateExhaustionSimulation,
  runQ4CandidateRecoverySimulation,
  runQ4MarkingPackCandidateExhaustionSimulation,
} from './q4-deterministic-pipeline-fixture'

const assessmentSlotRef = 'assessment-slot:calculation-family:paper-1'
const markingPackSlotRef = 'marking-pack-slot:q4-ratio-item'

function runsForSlot(
  workerRuns: Awaited<ReturnType<typeof runQ4CandidateRecoverySimulation>>['job']['workerRuns'],
  slotRef: string,
) {
  return workerRuns.filter((run) => run.inputRefs.includes(slotRef))
}

describe('Content Factory Q4 candidate-recovery qualification', () => {
  it('reaches expert_review_ready after rejecting and replacing both Assessment and Marking Pack candidates', async () => {
    const result = await runQ4CandidateRecoverySimulation()

    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.proofMode).toBe('contract_integration')
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.trace.states).toEqual(q4ExpectedStateTrace)

    expect(result.trace.assessmentCandidateCalls).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
      { candidateNumber: 2, maxCandidates: 2 },
    ])
    expect(result.trace.markingPackCandidateCalls.map(({ candidateNumber, maxCandidates }) => ({ candidateNumber, maxCandidates }))).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
      { candidateNumber: 2, maxCandidates: 2 },
    ])

    const assessmentRuns = runsForSlot(result.job.workerRuns, assessmentSlotRef)
    expect(assessmentRuns).toHaveLength(2)
    expect(assessmentRuns.map((run) => run.status)).toEqual(['failure', 'success'])
    expect(assessmentRuns[0].inputRefs).toContain(`${assessmentSlotRef}:candidate:1`)
    expect(assessmentRuns[1].inputRefs).toContain(`${assessmentSlotRef}:candidate:2`)
    expect(assessmentRuns[0].outputRefs).toEqual([])
    expect(assessmentRuns[1].outputRefs).toHaveLength(1)

    const markingRuns = runsForSlot(result.job.workerRuns, markingPackSlotRef)
    expect(markingRuns).toHaveLength(2)
    expect(markingRuns.map((run) => run.status)).toEqual(['failure', 'success'])
    expect(markingRuns[0].inputRefs).toContain(`${markingPackSlotRef}:candidate:1`)
    expect(markingRuns[1].inputRefs).toContain(`${markingPackSlotRef}:candidate:2`)
    expect(markingRuns[0].outputRefs).toEqual([])
    expect(markingRuns[1].outputRefs).toHaveLength(1)

    expect(result.trace.markingPackCandidateCalls.map((call) => call.assessmentItemId)).toEqual([
      'q4-ratio-item',
      'q4-ratio-item',
    ])
    expect(new Set(result.trace.markingPackCandidateCalls.map((call) => call.questionWording))).toEqual(
      new Set(['Calculate the ratio and show your working.']),
    )

    expect(result.job.markingPackCoverage).toHaveLength(1)
    expect(result.job.markingPackCoverage[0].assessmentItemId).toBe('q4-ratio-item')
    expect(result.latestManifest.learningArtifactRefs).toHaveLength(1)
    expect(result.latestManifest.practiceArtifactRefs).toHaveLength(1)
    expect(result.latestManifest.assessmentItemRefs).toHaveLength(1)
    expect(result.latestManifest.markingPackRefs).toHaveLength(1)
    expect(result.latestManifest.markableAssessmentItemIds).toEqual(['q4-ratio-item'])
    expect(result.report.markableAssessmentItemCount).toBe(1)
    expect(result.report.markingPackCoverageCount).toBe(1)
    expect(result.job.blockers).toEqual([])
  })

  it('blocks after two rejected Assessment candidates and never silently omits the mandatory slot', async () => {
    const result = await runQ4AssessmentCandidateExhaustionSimulation()

    expect(result.job.state).toBe('blocked')
    expect(result.report.reachedExpertReviewReady).toBe(false)
    expect(result.trace.assessmentCandidateCalls).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
      { candidateNumber: 2, maxCandidates: 2 },
    ])
    expect(result.trace.markingPackCandidateCalls).toEqual([])

    const assessmentRuns = runsForSlot(result.job.workerRuns, assessmentSlotRef)
    expect(assessmentRuns).toHaveLength(2)
    expect(assessmentRuns.map((run) => run.status)).toEqual(['failure', 'failure'])
    expect(assessmentRuns.every((run) => run.outputRefs.length === 0)).toBe(true)
    expect(assessmentRuns.some((run) => run.inputRefs.includes(`${assessmentSlotRef}:candidate:3`))).toBe(false)

    expect(result.store.refs('assessment_item')).toEqual([])
    expect(result.store.refs('marking_pack')).toEqual([])
    expect(result.store.refs('course_content_pack')).toEqual([])
    expect(result.store.refs('expert_review_package')).toEqual([])
    expect(result.job.markableAssessmentItemIds).toEqual([])
    expect(result.job.markingPackCoverage).toEqual([])
    expect(result.package).toBeUndefined()
    expect(result.trace.persistCalls).toEqual([])
    expect(result.job.blockers.some((blocker) => blocker.reason.includes('generation candidate recovery exhausted'))).toBe(true)
    expect(result.job.blockers.some((blocker) => blocker.reason.includes(assessmentSlotRef))).toBe(true)
  })

  it('blocks when the required Marking Pack slot exhausts while preserving the accepted Assessment Item', async () => {
    const result = await runQ4MarkingPackCandidateExhaustionSimulation()

    expect(result.job.state).toBe('blocked')
    expect(result.report.reachedExpertReviewReady).toBe(false)
    expect(result.trace.assessmentCandidateCalls).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
    ])
    expect(result.trace.markingPackCandidateCalls.map(({ candidateNumber, maxCandidates }) => ({ candidateNumber, maxCandidates }))).toEqual([
      { candidateNumber: 1, maxCandidates: 2 },
      { candidateNumber: 2, maxCandidates: 2 },
    ])

    const assessmentRuns = runsForSlot(result.job.workerRuns, assessmentSlotRef)
    expect(assessmentRuns).toHaveLength(1)
    expect(assessmentRuns[0].status).toBe('success')
    expect(assessmentRuns[0].outputRefs).toHaveLength(1)

    const markingRuns = runsForSlot(result.job.workerRuns, markingPackSlotRef)
    expect(markingRuns).toHaveLength(2)
    expect(markingRuns.map((run) => run.status)).toEqual(['failure', 'failure'])
    expect(markingRuns.every((run) => run.outputRefs.length === 0)).toBe(true)
    expect(markingRuns.some((run) => run.inputRefs.includes(`${markingPackSlotRef}:candidate:3`))).toBe(false)
    expect(new Set(result.trace.markingPackCandidateCalls.map((call) => call.questionWording))).toEqual(
      new Set(['Calculate the ratio and show your working.']),
    )

    expect(result.store.refs('assessment_item')).toHaveLength(1)
    expect(result.store.refs('marking_pack')).toEqual([])
    expect(result.job.markingPackCoverage).toEqual([])
    expect(result.store.refs('course_content_pack')).toEqual([])
    expect(result.store.refs('expert_review_package')).toEqual([])
    expect(result.package).toBeUndefined()
    expect(result.trace.persistCalls).toEqual([])
    expect(result.job.blockers.some((blocker) => blocker.reason.includes('marking_pack candidate recovery exhausted'))).toBe(true)
    expect(result.job.blockers.some((blocker) => blocker.reason.includes(markingPackSlotRef))).toBe(true)
  })
})
