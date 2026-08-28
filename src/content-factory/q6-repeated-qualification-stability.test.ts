import { describe, expect, it } from 'vitest'
import q6RecordText from '../../content-factory/reliability-q6-repeated-stability.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'
import { q4ExpectedStateTrace } from './q4-deterministic-pipeline-fixture'
import {
  durableWorkerMethods,
  q4CorrectedHeadSha,
  q6ExpectedQ5InvalidationSets,
  q6Q5ScenarioIds,
  q6RepetitionCount,
  q6ReviewedMainSha,
  runQ6RepeatedQualificationStability,
} from './q6-repeated-qualification-fixture'

type Q6Record = {
  schemaVersion: number
  gate: string
  status: string
  scope: string
  reviewedAgainstMainSha: string
  repetitionCount: number
  evidence: Record<string, string>
  repeatedCoverage: {
    subjectShapesPerRepetition: number
    totalSubjectShapePipelineRuns: number
    deterministicPipelineRuns: number
    restartReuseScenarioSets: number
    restartReuseScenariosPerSet: string[]
  }
  assertions: string[]
  providerCallsUsed: boolean
  q6Pass: boolean
  paidPilotEligible: boolean
  limitations: string[]
}

type QualificationState = {
  status: string
  qualifiedEvidence: unknown
  livePilotEligible: boolean
}

const q6Record = JSON.parse(q6RecordText) as Q6Record
const qualification = JSON.parse(qualificationText) as QualificationState

function sorted(values: readonly string[]) {
  return [...values].sort()
}

describe('Content Factory Q6 repeated qualification stability', () => {
  it('locks the governed repetition count and keeps overall qualification paused', () => {
    expect(q6Record.schemaVersion).toBe(1)
    expect(q6Record.gate).toBe('Q6')
    expect(q6Record.status).toBe('complete')
    expect(q6Record.scope).toBe('repeated_qualification_stability')
    expect(q6Record.reviewedAgainstMainSha).toBe(q6ReviewedMainSha)
    expect(q6Record.repetitionCount).toBe(q6RepetitionCount)
    expect(q6Record.repeatedCoverage.subjectShapesPerRepetition).toBe(q3SubjectShapeIds.length)
    expect(q6Record.repeatedCoverage.totalSubjectShapePipelineRuns).toBe(q3SubjectShapeIds.length * q6RepetitionCount)
    expect(q6Record.repeatedCoverage.deterministicPipelineRuns).toBe(q6RepetitionCount)
    expect(q6Record.repeatedCoverage.restartReuseScenarioSets).toBe(q6RepetitionCount)
    expect(q6Record.repeatedCoverage.restartReuseScenariosPerSet).toEqual([...q6Q5ScenarioIds])
    expect(q6Record.providerCallsUsed).toBe(false)
    expect(q6Record.q6Pass).toBe(true)
    expect(q6Record.paidPilotEligible).toBe(false)
    expect(qualification.status).toBe('paused')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
  })

  it('passes Q3, Q4 and Q5 three times with stable outcomes and no new contract-class failure', async () => {
    const repetitions = await runQ6RepeatedQualificationStability()
    const expectedInvalidation = q6ExpectedQ5InvalidationSets()

    expect(repetitions).toHaveLength(q6RepetitionCount)

    for (const repetition of repetitions) {
      expect(repetition.q3).toHaveLength(q3SubjectShapeIds.length)
      expect(new Set(repetition.q3.map((shape) => shape.subjectShape))).toEqual(new Set(q3SubjectShapeIds))

      for (const shape of repetition.q3) {
        expect(shape.finalState).toBe('expert_review_ready')
        expect(shape.reachedExpertReviewReady).toBe(true)
        expect(shape.workUnitCount).toBe(shape.expectedWorkUnitCount)
        expect(shape.workerRunCount).toBeGreaterThan(0)
        expect(shape.markableAssessmentItemCount).toBeGreaterThan(0)
        expect(shape.markingPackCoverageCount).toBe(shape.markableAssessmentItemCount)
        expect(shape.observedUsageCost).toBe(0)
        expect(shape.totalRetries).toBe(0)
        expect(shape.humanInterventionCount).toBe(0)
        expect(shape.providerRoutes).toHaveLength(1)
        expect(shape.providerRoutes[0].provider).toBe('controlled-fixture')
        expect(shape.providerRoutes[0].model).toBe('q3-subject-shape-v1')
        expect(shape.providerRoutes[0].observedUsageCost).toBe(0)
        expect(shape.providerRoutes[0].unpricedRuns).toBe(0)
        expect(shape.reviewedCommit).toMatch(/^[0-9a-f]{40}$/)
      }

      expect(repetition.q4.stateTrace).toEqual(q4ExpectedStateTrace)
      expect(repetition.q4.finalState).toBe('expert_review_ready')
      expect(repetition.q4.reachedExpertReviewReady).toBe(true)
      expect(repetition.q4.observedUsageCost).toBe(0)
      expect(repetition.q4.totalRetries).toBe(0)
      expect(repetition.q4.humanReviewPresent).toBe(false)
      expect(repetition.q4.expertReviewSubmissionCount).toBe(0)
      expect(repetition.q4.validationDecisions).toEqual(['pass', 'pass'])
      expect(repetition.q4.reviewDecisions).toEqual(['fail_hold', 'pass'])
      expect(repetition.q4.remediationTargetKinds).toEqual(['assessment_item', 'learning'])
      expect(repetition.q4.correctedHeadSha).toBe(q4CorrectedHeadSha)
      expect(repetition.q4.packageReviewedCommit).toBe(q4CorrectedHeadSha)
      expect(repetition.q4.publicationStatus).toBe('factory_generated_unassured')

      expect(repetition.q5.headOnly.executedOnSecondPass).toEqual([])
      expect(repetition.q5.headOnly.reusedExecutionCount).toBe(durableWorkerMethods.length)
      expect(repetition.q5.headOnly.reusedAcrossHeadCount).toBe(durableWorkerMethods.length)
      expect(repetition.q5.headOnly.executedWorkerCount).toBe(0)
      expect(repetition.q5.headOnly.durableWorkerCoverage).toBe(durableWorkerMethods.length)

      expect(sorted(repetition.q5.practice.executedOnSecondPass)).toEqual(sorted(expectedInvalidation.practice))
      expect(sorted(repetition.q5.assessment.executedOnSecondPass)).toEqual(sorted(expectedInvalidation.assessment))
      expect(sorted(repetition.q5.coverage.executedOnSecondPass)).toEqual(sorted(expectedInvalidation.coverage))

      expect(repetition.q5.provenanceAndSpend.firstExecutions).toBe(1)
      expect(repetition.q5.provenanceAndSpend.secondExecutions).toBe(0)
      expect(repetition.q5.provenanceAndSpend.firstExecutionRetryCount).toBe(2)
      expect(repetition.q5.provenanceAndSpend.reusedExecutionRetryCount).toBe(2)
      expect(repetition.q5.provenanceAndSpend.firstExecutionUsageCost).toBe(0.37)
      expect(repetition.q5.provenanceAndSpend.reusedExecutionUsageCost).toBe(0.37)
      expect(repetition.q5.provenanceAndSpend.cumulativeSpendBeforeRestart).toBe(0.37)
      expect(repetition.q5.provenanceAndSpend.cumulativeSpendAfterRestart).toBe(0.37)
      expect(repetition.q5.provenanceAndSpend.requiresSemanticReplay).toBe(true)
      expect(repetition.q5.provenanceAndSpend.reusedAcrossHeadCount).toBe(1)

      expect(repetition.q5.semanticReplay.sameHeadRetainsLateStage).toBe(true)
      expect(repetition.q5.semanticReplay.changedHeadState).toBe('requested')
      expect(repetition.q5.semanticReplay.preservedJobId).toBe('q6-semantic-replay')
      expect(repetition.q5.semanticReplay.preservedOfficialUrls).toEqual(['https://example.test/q6-course'])
      expect(repetition.q5.semanticReplay.preservedFounderInstruction).toBe('Run the governed Q6 restart fixture.')
      expect(repetition.q5.semanticReplay.workerRunCount).toBe(0)
    }

    const stableOutcomeSignatures = repetitions.map((repetition) => JSON.stringify({
      q3: repetition.q3,
      q4: repetition.q4,
      q5: repetition.q5,
    }))
    expect(new Set(stableOutcomeSignatures).size).toBe(1)
  }, 120_000)

  it('records limitations without confusing provider-free reliability with educational approval or paid-pilot eligibility', () => {
    expect(q6Record.assertions.join(' ')).toContain('No new contract-class failure')
    expect(q6Record.limitations.join(' ')).toContain('do not prove educational correctness')
    expect(q6Record.limitations.join(' ')).toContain('does not itself change overall qualification status')
    expect(q6Record.limitations.join(' ')).toContain('Q7')
  })
})
