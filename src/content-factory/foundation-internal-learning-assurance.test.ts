import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  assureFoundationInternalLearningAssets,
  runFoundationInternalLearningDeterministicAssurance,
  type FoundationInternalLearningAssuranceWorkers,
} from './foundation-internal-learning-assurance'
import { generateFoundationInternalLearningAssets } from './foundation-internal-learning-assets'
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
import { courseKnowledgeModelSchema } from './schema'
import type { LearningPracticeWorkers } from './learning-and-practice'

const now = '2026-09-20T08:00:00+01:00'
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
  return { job: await markFoundationAiAssured(job, now), foundationFingerprint }
}

function generationWorkers(): Pick<LearningPracticeWorkers, 'generateLearningCollateral' | 'generatePracticeCollateral'> {
  let context = 0
  return {
    async generateLearningCollateral(input) {
      context += 1
      const points = input.requiredTeachingPoints
      const misconceptionPoints = points.filter((point) => point.startsWith('Misconception to diagnose and repair ['))
      return {
        status: 'success',
        output: {
          title: input.workUnit.title,
          introduction: points.join(' '),
          sections: [{ id: 'section-1', title: 'Explanation', explanation: points[0], keyPoints: points }],
          workedExamples: [{ id: 'worked-1', title: 'Worked example', setup: points[0], steps: points, conclusion: points.at(-1) ?? points[0] }],
          misconceptions: misconceptionPoints.map((point, index) => ({ misconception: `Fixture misconception ${index + 1}`, correction: point })),
          nextAction: 'Practise the same knowledge.',
          coverageEvidence: points.map((teachingPoint) => ({ teachingPoint, evidence: teachingPoint })),
        },
        provenance: { id: `learn-run-${context}`, contextId: `learn-context-${context}`, contractVersion: '4', provider: 'test', model: 'fixture', retryCount: 0 },
      }
    },
    async generatePracticeCollateral(input) {
      context += 1
      const points = input.requiredTeachingPoints
      const modes = input.workUnit.learningModes.filter((mode) => ['retrieval', 'application', 'quantitative'].includes(mode))
      return {
        status: 'success',
        output: {
          title: input.workUnit.title,
          instructions: 'Complete each activity.',
          activities: modes.flatMap((mode, modeIndex) => points.map((point, pointIndex) => ({
            id: `activity-${modeIndex + 1}-${pointIndex + 1}`,
            mode,
            prompt: `Demonstrate ${point}`,
            expectedResponse: point,
            explanation: point,
            improvementAction: 'Revisit the explanation.',
          }))),
          coverageEvidence: points.map((teachingPoint) => ({ teachingPoint, evidence: teachingPoint })),
        },
        provenance: { id: `practice-run-${context}`, contextId: `practice-context-${context}`, contractVersion: '4', provider: 'test', model: 'fixture', retryCount: 0 },
      }
    },
  }
}

async function generatedBundle() {
  const { job, foundationFingerprint } = await aiAssuredJob()
  const bundle = await generateFoundationInternalLearningAssets({
    job,
    coverageModel,
    coverageModelFingerprint: coverageFingerprint,
    courseKnowledgeModel,
    workers: generationWorkers(),
    now,
  })
  return { job, bundle, foundationFingerprint }
}

function cleanReviewWorkers(contextId = 'fresh-asset-review-context'): FoundationInternalLearningAssuranceWorkers {
  return {
    async independentReview(input) {
      return {
        status: 'success',
        output: {
          foundationFingerprint: input.foundationFingerprint,
          foundationCandidateId: input.foundationCandidateId,
          sourceBundleFingerprint: input.sourceBundleFingerprint,
          workUnitId: input.plan.id,
          workUnitFingerprint: input.workUnitFingerprint,
          decision: 'pass',
          findings: [],
        },
        provenance: { id: 'asset-review-run-1', contextId, contractVersion: '1', provider: 'test', model: 'fixture', retryCount: 0 },
      }
    },
  }
}

describe('Foundation-native internal learning asset assurance', () => {
  it('deterministically validates the exact generated bundle before independent review', async () => {
    const { job, bundle } = await generatedBundle()
    const report = await runFoundationInternalLearningDeterministicAssurance({
      job,
      bundle,
      coverageModel,
      courseKnowledgeModel,
      now,
    })
    expect(report.decision).toBe('pass')
    expect(report.checks.every((check) => check.status === 'pass')).toBe(true)
  })

  it('marks Learn and Practice assured only after a fresh-context independent pass', async () => {
    const { job, bundle } = await generatedBundle()
    const result = await assureFoundationInternalLearningAssets({
      job,
      bundle,
      coverageModel,
      courseKnowledgeModel,
      workers: cleanReviewWorkers(),
      assuranceEvidenceRef: 'github-actions-run:123',
      now,
    })
    expect(result.status).toBe('pass')
    expect(result.assuredAssets?.learnAsset.assuranceStatus).toBe('pass')
    expect(result.assuredAssets?.practiceAsset.assuranceStatus).toBe('pass')
    expect(result.assuredAssets?.learnAsset.assuranceEvidenceRefs).toEqual(['github-actions-run:123'])
  })

  it('fails closed when the reviewer reuses a generation or Foundation context', async () => {
    const { job, bundle } = await generatedBundle()
    await expect(assureFoundationInternalLearningAssets({
      job,
      bundle,
      coverageModel,
      courseKnowledgeModel,
      workers: cleanReviewWorkers(bundle.generationContextIds[0]),
      assuranceEvidenceRef: 'github-actions-run:123',
      now,
    })).rejects.toThrow(/reused forbidden context/)

    await expect(assureFoundationInternalLearningAssets({
      job,
      bundle,
      coverageModel,
      courseKnowledgeModel,
      workers: cleanReviewWorkers('foundation-review-context'),
      assuranceEvidenceRef: 'github-actions-run:123',
      now,
    })).rejects.toThrow(/reused forbidden context/)
  })

  it('returns targeted remediation and keeps assets pending when material findings remain', async () => {
    const { job, bundle } = await generatedBundle()
    const workers: FoundationInternalLearningAssuranceWorkers = {
      async independentReview(input) {
        return {
          status: 'success',
          output: {
            foundationFingerprint: input.foundationFingerprint,
            foundationCandidateId: input.foundationCandidateId,
            sourceBundleFingerprint: input.sourceBundleFingerprint,
            workUnitId: input.plan.id,
            workUnitFingerprint: input.workUnitFingerprint,
            decision: 'fail_hold',
            findings: [{
              id: 'material-quantitative-error',
              severity: 'material',
              issueType: 'quantitative_accuracy',
              assetKind: 'practice',
              evidence: ['Expected-response arithmetic does not match the supplied values.'],
              finding: 'A quantitative expected response is materially incorrect.',
              recommendedCorrection: 'Correct only the affected Practice work unit and re-run its assurance.',
              resolutionStatus: 'open',
            }],
          },
          provenance: { id: 'asset-review-run-1', contextId: 'fresh-review-context', contractVersion: '1', provider: 'test', model: 'fixture', retryCount: 0 },
        }
      },
    }
    const result = await assureFoundationInternalLearningAssets({
      job,
      bundle,
      coverageModel,
      courseKnowledgeModel,
      workers,
      assuranceEvidenceRef: 'github-actions-run:123',
      now,
    })
    expect(result.status).toBe('fail_hold')
    expect(result.assuredAssets).toBeUndefined()
    expect(result.remediationTargets).toEqual([{ workUnitId: 'foundation-marketing-decisions', assetKind: 'practice', findingIds: ['material-quantitative-error'] }])
    expect(bundle.learnAsset.assuranceStatus).toBe('pending')
    expect(bundle.practiceAsset.assuranceStatus).toBe('pending')
  })
})