import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  foundationInternalLearningIndependentReviewSchema,
  type FoundationInternalLearningRemediationTarget,
} from './foundation-internal-learning-assurance'
import { generateFoundationInternalLearningAssets } from './foundation-internal-learning-assets'
import { remediateFoundationInternalLearningAssets } from './foundation-internal-learning-remediation'
import {
  advanceFoundationJob,
  computeFoundationFingerprint,
  createFoundationJob,
  markFoundationAiAssured,
  recordDeterministicFoundationAssurance,
  recordFoundationExternalSourceChallenge,
  recordIndependentFoundationReview,
  setFoundationCandidate,
} from './foundation-lifecycle'
import { foundationCandidateSchema } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import type { LearningPracticeWorkers } from './learning-and-practice'
import { courseKnowledgeModelSchema } from './schema'

const now = '2026-09-23T09:00:00+01:00'
const remediationNow = '2026-09-23T10:00:00+01:00'
const jobId = 'aqa-a-level-business-7132'
const headSha = 'a'.repeat(40)
const coverageFingerprint = 'b'.repeat(64)
const knowledgeFingerprint = 'c'.repeat(64)

const coverageModel = foundationCoverageModelSchema.parse({
  schemaVersion: 2,
  jobId,
  sourceSetFingerprint: 'source-set-1',
  requirements: [{
    requirementId: 'aqa-3-3-1',
    officialReference: '3.3.1',
    requirementSummary: 'Marketing decisions',
    skillsOrKnowledge: ['Analyse marketing decisions using customer and quantitative evidence.'],
    componentScope: ['paper-1', 'paper-2', 'paper-3'],
    revisionArea: 'Marketing decisions',
    sourceRefs: ['governed-business-seed'],
    knowledgeNodeIds: ['aqa-3-3-1.k01'],
    coverageStatus: 'complete',
  }],
})

const courseKnowledgeModel = courseKnowledgeModelSchema.parse({
  schemaVersion: 1,
  jobId,
  fingerprint: knowledgeFingerprint,
  nodes: [{
    id: 'aqa-3-3-1.k01',
    kind: 'formula',
    summary: 'Marketing decisions combine customer evidence with quantitative measures.',
    prerequisiteIds: [],
    relatedIds: [],
    formulas: ['market share = business sales / market sales x 100'],
    misconceptions: ['Market share is the same as sales revenue.'],
    applicationContexts: ['product launch decision'],
    depth: 'core',
    sourceRefs: ['governed-business-seed'],
    boardAlignmentRefs: ['aqa-3-3-1'],
    evidenceTypes: ['calculate', 'apply'],
  }],
})

function candidate() {
  return foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'aqa-a-level-business-7132-candidate-1',
    courseIdentity: { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' },
    cohortValidity: { status: 'outgoing', lastAssessment: '2027', notes: [] },
    sourceLicenceRegister: { ref: 'foundation/source-rights.json', fingerprint: 'source-rights-v1' },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: 'foundation/board-alignment.json', fingerprint: 'board-v1' },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: 'foundation/coverage.json', fingerprint: coverageFingerprint },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: 'foundation/course-truth.json', fingerprint: knowledgeFingerprint },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: 'foundation/exam-truth.json', fingerprint: 'exam-v1' },
    examTruthCompleteness: 'complete',
    questionFamilies: [{ ref: 'foundation/question-family.json', fingerprint: 'family-v1' }],
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: now,
      producerVersion: 'foundation-factory-v1',
      sourceSetFingerprint: 'source-set-1',
      implementationHeadSha: headSha,
      generationContextIds: ['foundation-generation-context'],
      assuranceContextIds: ['foundation-review-context'],
    },
  })
}

async function aiAssuredJob() {
  let job = createFoundationJob({ jobId, createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidate(), now)
  job = advanceFoundationJob(job, 'assuring', now)
  if (!job.candidate) throw new Error('Expected Foundation Candidate')
  const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
  job = await recordDeterministicFoundationAssurance(job, { status: 'pass', foundationFingerprint, evidenceRefs: ['deterministic.json'] }, now)
  job = await recordIndependentFoundationReview(job, { status: 'pass', foundationFingerprint, evidenceRefs: ['independent.json'] }, now)
  if (!job.candidate) throw new Error('Expected Foundation Candidate')
  job = await recordFoundationExternalSourceChallenge(job, {
    report: {
      schemaVersion: 1,
      artifactType: 'foundation_external_source_challenge_report',
      challengeId: 'challenge-1',
      jobId,
      candidateId: job.candidate.candidateId,
      reviewedCommit: headSha,
      foundationFingerprint,
      sourceUniverseProfileId: 'aqa-7132-2027-source-universe',
      challengedSourceIds: ['aqa-7132-specification'],
      reviewerContextId: 'foundation-external-context',
      excludedContextIds: ['foundation-generation-context', 'foundation-review-context'],
      decision: 'pass',
      findings: [],
      evidenceRefs: ['external.json'],
      createdAt: now,
    },
    requiredSourceUniverseProfileId: 'aqa-7132-2027-source-universe',
    requiredSourceIds: ['aqa-7132-specification'],
  }, now)
  return await markFoundationAiAssured(job, now)
}

function validLearning(points: string[], title = 'Original learning') {
  return {
    title,
    introduction: points.join(' '),
    sections: [{ id: 'section-1', title: 'Explanation', explanation: points.join(' '), keyPoints: points }],
    workedExamples: [{ id: 'worked-1', title: 'Worked example', setup: points.join(' '), steps: ['Apply the formula correctly.'], conclusion: 'Interpret the result.' }],
    misconceptions: [],
    nextAction: 'Practise the same knowledge.',
    coverageEvidence: points.map((teachingPoint) => ({ teachingPoint, evidence: points.join(' ') })),
  }
}

function validPractice(points: string[], modes: string[], title = 'Original practice') {
  return {
    title,
    instructions: 'Complete each activity.',
    activities: modes
      .filter((mode) => ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'].includes(mode))
      .map((mode, index) => ({
        id: `activity-${index + 1}`,
        mode,
        prompt: points.join(' '),
        expectedResponse: points.join(' '),
        explanation: points.join(' '),
        improvementAction: 'Revisit the explanation.',
      })),
    coverageEvidence: points.map((teachingPoint) => ({ teachingPoint, evidence: points.join(' ') })),
  }
}

function generationWorkers(): Pick<LearningPracticeWorkers, 'generateLearningCollateral' | 'generatePracticeCollateral'> {
  return {
    async generateLearningCollateral(input) {
      return {
        status: 'success',
        output: validLearning(input.requiredTeachingPoints),
        provenance: { id: 'learn-run', contextId: 'learn-generation-context', contractVersion: '9', provider: 'test', model: 'fixture', retryCount: 0 },
      }
    },
    async generatePracticeCollateral(input) {
      return {
        status: 'success',
        output: validPractice(input.requiredTeachingPoints, input.workUnit.learningModes),
        provenance: { id: 'practice-run', contextId: 'practice-generation-context', contractVersion: '5', provider: 'test', model: 'fixture', retryCount: 0 },
      }
    },
  }
}

async function sourceFixture(assetKind: 'learn' | 'practice' | 'both' = 'practice') {
  const job = await aiAssuredJob()
  const bundle = await generateFoundationInternalLearningAssets({
    job,
    coverageModel,
    coverageModelFingerprint: coverageFingerprint,
    courseKnowledgeModel,
    workers: generationWorkers(),
    now,
  })
  const sourceBundleFingerprint = await fingerprintValue(bundle)
  const workUnit = bundle.workUnits[0]
  const workUnitFingerprint = await fingerprintValue(workUnit)
  const finding = {
    id: 'material-targeted-defect',
    severity: 'material' as const,
    issueType: 'quantitative_accuracy',
    assetKind,
    evidence: ['The retained expected response contains a material error.'],
    finding: 'The affected learner asset needs a targeted correction.',
    recommendedCorrection: 'Correct the affected asset side and preserve unaffected content.',
    resolutionStatus: 'open' as const,
  }
  const independentReview = foundationInternalLearningIndependentReviewSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_internal_learning_independent_review',
    foundationFingerprint: bundle.foundationFingerprint,
    foundationCandidateId: bundle.foundationCandidateId,
    sourceBundleFingerprint,
    decision: 'fail_hold',
    workUnitReviews: [{
      workUnitId: workUnit.plan.id,
      workUnitFingerprint,
      reviewerRunId: 'review-run-1',
      reviewerContextId: 'prior-independent-review-context',
      contractVersion: '1',
      provider: 'test',
      model: 'fixture',
      retryCount: 0,
      decision: 'fail_hold',
      findingIds: [finding.id],
    }],
    findings: [finding],
    reviewerContextIds: ['prior-independent-review-context'],
    createdAt: now,
  })
  const remediationTargets: FoundationInternalLearningRemediationTarget[] = [{
    workUnitId: workUnit.plan.id,
    assetKind,
    findingIds: [finding.id],
  }]
  return { job, bundle, independentReview, remediationTargets }
}

describe('Foundation-native targeted Learn/Practice remediation', () => {
  it('replaces only the targeted Practice side and preserves Learn plus its aggregate asset', async () => {
    const { job, bundle, independentReview, remediationTargets } = await sourceFixture('practice')
    const originalLearning = structuredClone(bundle.workUnits[0].learning)
    const originalLearnAsset = structuredClone(bundle.learnAsset)

    const result = await remediateFoundationInternalLearningAssets({
      job,
      sourceBundle: bundle,
      coverageModel,
      courseKnowledgeModel,
      independentReview,
      remediationTargets,
      now: remediationNow,
      workers: {
        async remediateLearningCollateral() { throw new Error('Learn must not be regenerated for a Practice-only target') },
        async remediatePracticeCollateral(input) {
          return {
            status: 'success',
            output: validPractice(input.requiredTeachingPoints, input.workUnit.learningModes, 'Corrected practice'),
            provenance: { id: 'practice-remediation-run', contextId: 'practice-remediation-context', contractVersion: '5-remediation', provider: 'test', model: 'fixture', retryCount: 0 },
          }
        },
      },
    })

    expect(result.bundle.workUnits[0].learning).toEqual(originalLearning)
    expect(result.bundle.workUnits[0].practice.title).toBe('Corrected practice')
    expect(result.bundle.learnAsset).toEqual(originalLearnAsset)
    expect(result.bundle.practiceAsset.assetId).not.toBe(bundle.practiceAsset.assetId)
    expect(result.bundle.practiceAsset.assuranceStatus).toBe('pending')
    expect(result.bundle.generationContextIds).toEqual(expect.arrayContaining([
      ...bundle.generationContextIds,
      'practice-remediation-context',
    ]))
    expect(result.remediationRecord.addressedFindingIds).toEqual(['material-targeted-defect'])
    expect(result.remediationRecord.targets).toEqual([{
      workUnitId: bundle.workUnits[0].plan.id,
      assetKind: 'practice',
      findingIds: ['material-targeted-defect'],
    }])
  })

  it('retains both provider contexts from two-stage Learn remediation and refreshes both aggregate assets for a both-side finding', async () => {
    const { job, bundle, independentReview, remediationTargets } = await sourceFixture('both')
    const result = await remediateFoundationInternalLearningAssets({
      job,
      sourceBundle: bundle,
      coverageModel,
      courseKnowledgeModel,
      independentReview,
      remediationTargets,
      now: remediationNow,
      workers: {
        async remediateLearningCollateral(input) {
          return {
            status: 'success',
            output: validLearning(input.requiredTeachingPoints, 'Corrected learning'),
            provenance: {
              id: 'learn-content+binding',
              contextId: 'learn-remediation-content-context',
              contractVersion: '9-remediation',
              provider: 'test',
              model: 'fixture',
              retryCount: 0,
              providerRuns: [
                { contextId: 'learn-remediation-content-context' },
                { contextId: 'learn-remediation-binding-context' },
              ],
            } as never,
          }
        },
        async remediatePracticeCollateral(input) {
          return {
            status: 'success',
            output: validPractice(input.requiredTeachingPoints, input.workUnit.learningModes, 'Corrected practice'),
            provenance: { id: 'practice-remediation-run', contextId: 'practice-remediation-context', contractVersion: '5-remediation', provider: 'test', model: 'fixture', retryCount: 0 },
          }
        },
      },
    })

    expect(result.bundle.workUnits[0].learning.title).toBe('Corrected learning')
    expect(result.bundle.workUnits[0].practice.title).toBe('Corrected practice')
    expect(result.bundle.learnAsset.assetId).not.toBe(bundle.learnAsset.assetId)
    expect(result.bundle.practiceAsset.assetId).not.toBe(bundle.practiceAsset.assetId)
    expect(result.remediationRecord.remediationContextIds).toEqual([
      'learn-remediation-content-context',
      'learn-remediation-binding-context',
      'practice-remediation-context',
    ])
  })

  it('fails closed when targets do not cover every open finding or a remediation context reuses prior evidence context', async () => {
    const { job, bundle, independentReview, remediationTargets } = await sourceFixture('practice')

    await expect(remediateFoundationInternalLearningAssets({
      job,
      sourceBundle: bundle,
      coverageModel,
      courseKnowledgeModel,
      independentReview,
      remediationTargets: [],
      now: remediationNow,
      workers: {
        async remediateLearningCollateral() { throw new Error('must not run') },
        async remediatePracticeCollateral() { throw new Error('must not run') },
      },
    })).rejects.toThrow(/cover every and only open assurance finding/)

    await expect(remediateFoundationInternalLearningAssets({
      job,
      sourceBundle: bundle,
      coverageModel,
      courseKnowledgeModel,
      independentReview,
      remediationTargets,
      now: remediationNow,
      workers: {
        async remediateLearningCollateral() { throw new Error('must not run') },
        async remediatePracticeCollateral(input) {
          return {
            status: 'success',
            output: validPractice(input.requiredTeachingPoints, input.workUnit.learningModes, 'Corrected practice'),
            provenance: { id: 'practice-remediation-run', contextId: 'prior-independent-review-context', contractVersion: '5-remediation', provider: 'test', model: 'fixture', retryCount: 0 },
          }
        },
      },
    })).rejects.toThrow(/reused forbidden context/)
  })
})
