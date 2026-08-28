import { describe, expect, it } from 'vitest'
import matrixText from '../../content-factory/reliability-q4-deterministic-pipeline-simulation.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import {
  q4CorrectedHeadSha,
  q4ExpectedStateTrace,
  q4InitialHeadSha,
  runQ4DeterministicPipelineSimulation,
} from './q4-deterministic-pipeline-fixture'

type Q4Matrix = {
  schemaVersion: number
  status: string
  scope: string
  baseMainSha: string
  harness: string
  regressionTest: string
  expectedStateTrace: string[]
  assertions: string[]
  limitations: string[]
  q4Pass: boolean
  paidPilotEligible: boolean
}

type QualificationState = {
  status: string
  qualifiedEvidence: unknown
  livePilotEligible: boolean
}

const matrix = JSON.parse(matrixText) as Q4Matrix
const qualification = JSON.parse(qualificationText) as QualificationState

describe('Content Factory Q4 deterministic full-pipeline simulation', () => {
  it('locks Q4 evidence to the governed provider-free simulation and keeps paid pilots disabled', () => {
    expect(matrix.schemaVersion).toBe(1)
    expect(matrix.status).toBe('complete')
    expect(matrix.scope).toBe('deterministic_full_pipeline_simulation')
    expect(matrix.baseMainSha).toBe('50b7d47054f9535c2d3cc62a1063cea35e89adfc')
    expect(matrix.harness).toBe('src/content-factory/q4-deterministic-pipeline-fixture.ts')
    expect(matrix.regressionTest).toBe('src/content-factory/q4-deterministic-pipeline-simulation.test.ts')
    expect(matrix.expectedStateTrace).toEqual(q4ExpectedStateTrace)
    expect(matrix.q4Pass).toBe(true)
    expect(matrix.paidPilotEligible).toBe(false)
    expect(qualification.status).toBe('paused')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
  })

  it('traverses every governed Q4 stage including remediation and returns only to expert_review_ready', async () => {
    const result = await runQ4DeterministicPipelineSimulation()

    expect(result.trace.states).toEqual(q4ExpectedStateTrace)
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.proofMode).toBe('contract_integration')
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.report.totalRetries).toBe(0)
    expect(result.job.humanReview).toBeUndefined()
    expect(result.store.refs('expert_review_submission')).toHaveLength(0)
  })

  it('validates before review, remediates, then revalidates and independently re-reviews the corrected head', async () => {
    const result = await runQ4DeterministicPipelineSimulation()

    expect(result.validationReports).toHaveLength(2)
    expect(result.validationReports.map((report) => report.decision)).toEqual(['pass', 'pass'])
    expect(result.validationReports.map((report) => report.reviewedCommit)).toEqual([q4InitialHeadSha, q4CorrectedHeadSha])
    expect(result.validationReports[0].contentFingerprint).not.toBe(result.validationReports[1].contentFingerprint)

    expect(result.reviewReports).toHaveLength(2)
    expect(result.reviewReports[0].decision).toBe('fail_hold')
    expect(result.reviewReports[0].reviewedCommit).toBe(q4InitialHeadSha)
    expect(result.reviewReports[0].findings.map((finding) => finding.id).sort()).toEqual([
      'q4-assessment-finding',
      'q4-learning-finding',
    ])
    expect(result.reviewReports[1].decision).toBe('pass')
    expect(result.reviewReports[1].reviewedCommit).toBe(q4CorrectedHeadSha)
    expect(result.reviewReports[1].findings).toHaveLength(0)

    expect(result.job.validation?.headSha).toBe(q4CorrectedHeadSha)
    expect(result.job.independentReview?.reviewedCommit).toBe(q4CorrectedHeadSha)
    expect(result.job.expertReviewPackage?.reviewedCommit).toBe(q4CorrectedHeadSha)
    expect(result.package?.reviewedCommit).toBe(q4CorrectedHeadSha)

    const reviewContexts = result.job.workerRuns
      .filter((run) => run.stage === 'independent_review')
      .map((run) => run.contextId)
    expect(reviewContexts).toHaveLength(2)
    expect(new Set(reviewContexts).size).toBe(2)
  })

  it('repairs only the targeted Learn artifact and assessment item plus its genuine dependent Marking Pack', async () => {
    const result = await runQ4DeterministicPipelineSimulation()

    expect(result.trace.remediationTargets.map((target) => target.kind).sort()).toEqual(['assessment_item', 'learning'])
    expect(result.trace.remediationTargets.find((target) => target.kind === 'learning')?.findingIds).toEqual(['q4-learning-finding'])
    expect(result.trace.remediationTargets.find((target) => target.kind === 'assessment_item')?.findingIds).toEqual(['q4-assessment-finding'])

    expect(result.remediationRecords).toHaveLength(1)
    const replacements = result.remediationRecords[0].replacements
    expect(replacements.map((replacement) => replacement.artifactKind).sort()).toEqual(['assessment_item', 'learning'])
    const assessmentReplacement = replacements.find((replacement) => replacement.artifactKind === 'assessment_item')
    const learningReplacement = replacements.find((replacement) => replacement.artifactKind === 'learning')
    expect(assessmentReplacement?.dependentOldRef).toBeTruthy()
    expect(assessmentReplacement?.dependentNewRef).toBeTruthy()
    expect(learningReplacement?.dependentOldRef).toBeUndefined()
    expect(learningReplacement?.dependentNewRef).toBeUndefined()

    const originalLearningRef = result.store.refs('learning')[0]
    const originalPracticeRef = result.store.refs('practice')[0]
    const originalAssessmentRef = result.store.refs('assessment_item')[0]
    const originalMarkingPackRef = result.store.refs('marking_pack')[0]
    const originalQuestionFamilyRef = result.store.refs('question_family')[0]

    expect(result.latestManifest.learningArtifactRefs).not.toContain(originalLearningRef)
    expect(result.latestManifest.practiceArtifactRefs).toContain(originalPracticeRef)
    expect(result.latestManifest.assessmentItemRefs).not.toContain(originalAssessmentRef)
    expect(result.latestManifest.markingPackRefs).not.toContain(originalMarkingPackRef)
    expect(result.latestManifest.questionFamilyRefs).toContain(originalQuestionFamilyRef)
    expect(result.latestManifest.publicationStatus).toBe('factory_generated_unassured')
  })

  it('persists exactly one corrected remediation head without introducing a publication side effect', async () => {
    const result = await runQ4DeterministicPipelineSimulation()

    expect(result.trace.persistCalls).toHaveLength(1)
    expect(result.trace.persistCalls[0].state).toBe('remediation')
    expect(result.trace.persistCalls[0].priorHeadSha).toBe(q4InitialHeadSha)
    expect(result.trace.persistCalls[0].replacementRefs.length).toBeGreaterThanOrEqual(4)
    expect(result.job.remediation?.status).toBe('complete')
    expect(result.job.remediation?.correctedHeadSha).toBe(q4CorrectedHeadSha)
    expect(result.latestManifest.publicationStatus).toBe('factory_generated_unassured')
    expect(result.job.state).toBe('expert_review_ready')
  })

  it('records the explicit Q4 limitations rather than overstating educational, restart or stability proof', () => {
    expect(matrix.limitations.join(' ')).toContain('not factual or educational correctness')
    expect(matrix.limitations.join(' ')).toContain('remain Q5')
    expect(matrix.limitations.join(' ')).toContain('remains Q6')
    expect(matrix.limitations.join(' ')).toContain('does not execute human review')
  })
})
