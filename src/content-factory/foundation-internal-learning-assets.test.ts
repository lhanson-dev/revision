import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
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
import { foundationCandidateSchema, type FoundationCandidate } from './foundation-schema'
import {
  generateFoundationInternalLearningAssets,
  planFoundationInternalLearningWorkUnits,
} from './foundation-internal-learning-assets'
import { courseKnowledgeModelSchema } from './schema'
import type { LearningPracticeWorkers } from './learning-and-practice'

const now = '2026-09-19T12:00:00+01:00'
const jobId = 'aqa-a-level-business-7132'
const headSha = 'a'.repeat(40)
const coverageFingerprint = 'b'.repeat(64)
const knowledgeFingerprint = 'c'.repeat(64)

const coverageModel = foundationCoverageModelSchema.parse({
  schemaVersion: 2,
  jobId,
  sourceSetFingerprint: 'source-set-1',
  requirements: [
    {
      requirementId: 'aqa-3-1-1',
      officialReference: '3.1.1',
      requirementSummary: 'Business nature and purpose',
      skillsOrKnowledge: ['business purpose and objectives'],
      componentScope: ['paper-1', 'paper-2', 'paper-3'],
      revisionArea: 'Business foundations',
      sourceRefs: ['governed-business-seed'],
      knowledgeNodeIds: ['aqa-3-1-1.k01'],
      coverageStatus: 'complete',
    },
    {
      requirementId: 'aqa-3-1-2',
      officialReference: '3.1.2',
      requirementSummary: 'Business ownership choices',
      skillsOrKnowledge: ['ownership structures and trade-offs'],
      componentScope: ['paper-1', 'paper-2', 'paper-3'],
      revisionArea: 'Business foundations',
      sourceRefs: ['governed-business-seed'],
      knowledgeNodeIds: ['aqa-3-1-2.k01'],
      coverageStatus: 'complete',
    },
    {
      requirementId: 'aqa-3-3-1',
      officialReference: '3.3.1',
      requirementSummary: 'Marketing decisions',
      skillsOrKnowledge: ['marketing decisions and customer context'],
      componentScope: ['paper-1', 'paper-2', 'paper-3'],
      revisionArea: 'Marketing decisions',
      sourceRefs: ['governed-business-seed'],
      knowledgeNodeIds: ['aqa-3-3-1.k01'],
      coverageStatus: 'complete',
    },
  ],
})

const courseKnowledgeModel = courseKnowledgeModelSchema.parse({
  schemaVersion: 1,
  jobId,
  fingerprint: knowledgeFingerprint,
  nodes: [
    {
      id: 'aqa-3-1-1.k01',
      kind: 'concept',
      summary: 'Businesses exist to pursue objectives by creating value.',
      prerequisiteIds: [],
      relatedIds: ['aqa-3-1-2.k01'],
      formulas: [],
      misconceptions: ['Profit is the only possible objective.'],
      applicationContexts: ['new business planning'],
      depth: 'core',
      sourceRefs: ['governed-business-seed'],
      boardAlignmentRefs: ['aqa-3-1-1'],
      evidenceTypes: ['explain', 'apply'],
    },
    {
      id: 'aqa-3-1-2.k01',
      kind: 'concept',
      summary: 'Ownership structures change control, liability and finance choices.',
      prerequisiteIds: [],
      relatedIds: ['aqa-3-1-1.k01'],
      formulas: [],
      misconceptions: ['All ownership forms have limited liability.'],
      applicationContexts: ['business growth decision'],
      depth: 'core',
      sourceRefs: ['governed-business-seed'],
      boardAlignmentRefs: ['aqa-3-1-2'],
      evidenceTypes: ['compare', 'apply'],
    },
    {
      id: 'aqa-3-3-1.k01',
      kind: 'formula',
      summary: 'Marketing decisions use customer evidence and quantitative measures.',
      prerequisiteIds: [],
      relatedIds: [],
      formulas: ['market share = business sales / market sales x 100'],
      misconceptions: ['Market share is the same as sales revenue.'],
      applicationContexts: ['product launch decision'],
      depth: 'core',
      sourceRefs: ['governed-business-seed'],
      boardAlignmentRefs: ['aqa-3-3-1'],
      evidenceTypes: ['calculate', 'apply'],
    },
  ],
})

function candidate() {
  return foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'aqa-a-level-business-7132-candidate-1',
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: { status: 'outgoing', lastAssessment: '2027', notes: [] },
    sourceLicenceRegister: { ref: 'foundation/source-rights.json', fingerprint: 'source-rights-v1' },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: 'foundation/board-alignment.json', fingerprint: 'board-v1' },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: 'foundation/coverage.json', fingerprint: coverageFingerprint },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: 'foundation/course-truth.json', fingerprint: knowledgeFingerprint },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: 'foundation/exam-truth.json', fingerprint: 'exam-truth-v1' },
    examTruthCompleteness: 'complete',
    questionFamilies: [{ ref: 'foundation/question-family.json', fingerprint: 'question-family-v1' }],
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

async function aiAssuredJob(candidateInput: FoundationCandidate = candidate()) {
  let job = createFoundationJob({ jobId, createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidateInput, now)
  job = advanceFoundationJob(job, 'assuring', now)
  if (!job.candidate) throw new Error('Expected Foundation Candidate')
  const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
  job = await recordDeterministicFoundationAssurance(job, {
    status: 'pass', foundationFingerprint, evidenceRefs: ['deterministic.json'],
  }, now)
  job = await recordIndependentFoundationReview(job, {
    status: 'pass', foundationFingerprint, evidenceRefs: ['independent.json'],
  }, now)
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
      reviewerContextId: 'fresh-external-context',
      excludedContextIds: ['foundation-generation-context', 'foundation-review-context'],
      decision: 'pass',
      findings: [],
      evidenceRefs: ['external-challenge.json'],
      createdAt: now,
    },
    requiredSourceUniverseProfileId: 'aqa-7132-2027-source-universe',
    requiredSourceIds: ['aqa-7132-specification'],
  }, now)
  return { job: await markFoundationAiAssured(job, now), foundationFingerprint }
}

function workerOutputForTeachingPoints(points: string[], mode: 'learning' | 'practice', modes: string[] = []) {
  const evidence = points.map((point) => ({ teachingPoint: point, evidence: point }))
  if (mode === 'learning') {
    return {
      title: 'Generated learning',
      introduction: `Learn ${points.join('; ')}.`,
      sections: [{ id: 'section-1', title: 'Core explanation', explanation: points.join('; '), keyPoints: points }],
      workedExamples: modes.includes('worked_example')
        ? [{ id: 'worked-1', title: 'Worked example', setup: points.join('; '), steps: ['Apply the governed concept.'], conclusion: 'Interpret the result.' }]
        : [],
      misconceptions: [],
      nextAction: 'Practise the same governed knowledge.',
      coverageEvidence: evidence,
    }
  }
  const selected = modes.filter((item) => ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'].includes(item))
  return {
    title: 'Generated practice',
    instructions: `Practise ${points.join('; ')}.`,
    activities: selected.map((activityMode, index) => ({
      id: `activity-${index + 1}`,
      mode: activityMode,
      prompt: `Demonstrate ${points.join('; ')}`,
      expectedResponse: points.join('; '),
      explanation: points.join('; '),
      improvementAction: 'Revisit the governed learning explanation.',
    })),
    coverageEvidence: evidence,
  }
}

describe('Foundation-native internal Learn/Practice production', () => {
  it('plans course-scoped work units directly from governed Foundation coverage without reviving the legacy coupled job', () => {
    const plan = planFoundationInternalLearningWorkUnits({ coverageModel, courseKnowledgeModel })
    expect(plan).toHaveLength(2)
    expect(plan[0]).toMatchObject({
      id: 'foundation-business-foundations',
      title: 'Business foundations',
      requirementIds: ['aqa-3-1-1', 'aqa-3-1-2'],
      requiredOutputs: ['learning', 'practice'],
      scope: 'course',
      componentIds: [],
    })
    expect(plan[0].learningModes).toEqual(expect.arrayContaining(['explanation', 'retrieval', 'application']))
    expect(plan[1].learningModes).toEqual(expect.arrayContaining(['explanation', 'worked_example', 'retrieval', 'application', 'quantitative']))
  })

  it('generates pending internal Learn and Practice bundles from ai_assured and retains the exact Foundation fingerprint', async () => {
    const { job, foundationFingerprint } = await aiAssuredJob()
    const seenInputs: unknown[] = []
    let context = 0
    const workers: Pick<LearningPracticeWorkers, 'generateLearningCollateral' | 'generatePracticeCollateral'> = {
      async generateLearningCollateral(input) {
        seenInputs.push(input)
        context += 1
        return {
          status: 'success',
          output: workerOutputForTeachingPoints(input.requiredTeachingPoints, 'learning', input.workUnit.learningModes),
          provenance: {
            id: `learn-worker-${context}`,
            contextId: `learn-context-${context}`,
            contractVersion: '3',
            provider: 'test',
            model: 'fixture',
            retryCount: 0,
          },
        }
      },
      async generatePracticeCollateral(input) {
        seenInputs.push(input)
        context += 1
        return {
          status: 'success',
          output: workerOutputForTeachingPoints(input.requiredTeachingPoints, 'practice', input.workUnit.learningModes),
          provenance: {
            id: `practice-worker-${context}`,
            contextId: `practice-context-${context}`,
            contractVersion: '3',
            provider: 'test',
            model: 'fixture',
            retryCount: 0,
          },
        }
      },
    }

    const bundle = await generateFoundationInternalLearningAssets({
      job,
      coverageModel,
      coverageModelFingerprint: coverageFingerprint,
      courseKnowledgeModel,
      workers,
      now,
    })

    expect(bundle.foundationFingerprint).toBe(foundationFingerprint)
    expect(bundle.learnAsset.assuranceStatus).toBe('pending')
    expect(bundle.practiceAsset.assuranceStatus).toBe('pending')
    expect(bundle.workUnits).toHaveLength(2)
    expect(bundle.generationContextIds).toHaveLength(4)
    expect(seenInputs).toHaveLength(4)
  })

  it('fails closed when supplied Foundation artifacts are not the exact Candidate artifacts', async () => {
    const { job } = await aiAssuredJob()
    await expect(generateFoundationInternalLearningAssets({
      job,
      coverageModel,
      coverageModelFingerprint: 'd'.repeat(64),
      courseKnowledgeModel,
      workers: {
        async generateLearningCollateral() { throw new Error('must not run') },
        async generatePracticeCollateral() { throw new Error('must not run') },
      },
      now,
    })).rejects.toThrow(/coverage artifact fingerprint/)
  })

  it('fails when Course Truth contains a node omitted by governed coverage', () => {
    const extraModel = courseKnowledgeModelSchema.parse({
      ...courseKnowledgeModel,
      nodes: [
        ...courseKnowledgeModel.nodes,
        {
          id: 'unmapped-node',
          kind: 'concept',
          summary: 'Unmapped truth',
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: [],
          applicationContexts: [],
          depth: 'core',
          sourceRefs: ['governed-business-seed'],
          boardAlignmentRefs: [],
          evidenceTypes: ['explain'],
        },
      ],
    })

    expect(() => planFoundationInternalLearningWorkUnits({
      coverageModel,
      courseKnowledgeModel: extraModel,
    })).toThrow(/not mapped by governed coverage/)
  })
})
