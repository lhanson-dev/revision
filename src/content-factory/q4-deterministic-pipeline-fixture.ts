import {
  runRequestedContentFactoryToExpertReviewReady,
  type ContentFactoryEndToEndArtifactKind,
  type ContentFactoryEndToEndArtifactStore,
  type ContentFactoryEndToEndWorkers,
} from './end-to-end-proof'
import type { SourceRightsPolicyRule, WorkerExecution } from './intake-to-knowledge-model'
import { learningCollateralArtifactSchema } from './learning-and-practice'
import {
  assessmentItemArtifactSchema,
  courseContentPackManifestSchema,
  executableMarkingPackSchema,
} from './assessment-and-marking'
import {
  deterministicValidationReportSchema,
  independentReviewReportSchema,
  remediationRecordSchema,
} from './assurance-and-remediation'
import type { ContentFactoryActiveState, ContentFactoryJob } from './schema'

export const q4InitialHeadSha = '6666666666666666666666666666666666666666'
export const q4CorrectedHeadSha = '7777777777777777777777777777777777777777'
export const q4Now = '2026-08-28T20:00:00+01:00'

export const q4ExpectedStateTrace: ContentFactoryActiveState[] = [
  'requested',
  'identified',
  'sourced',
  'mapped',
  'generating',
  'validating',
  'independent_review',
  'remediation',
  'validating',
  'independent_review',
  'expert_review_packaging',
  'expert_review_ready',
]

type Q4ArtifactKind = ContentFactoryEndToEndArtifactKind

export type Q4Trace = {
  states: ContentFactoryActiveState[]
  refsByKind: Map<Q4ArtifactKind, string[]>
  reviewInputs: Array<{ reviewedCommit: string; contentFingerprint: string; validationDecision: 'pass' | 'fail' }>
  remediationTargets: Array<{ kind: string; artifactRef: string; findingIds: string[] }>
  persistCalls: Array<{ state: ContentFactoryJob['state']; priorHeadSha: string; replacementRefs: string[] }>
}

function recordState(trace: Q4Trace, state: ContentFactoryActiveState) {
  if (trace.states.at(-1) !== state) trace.states.push(state)
}

export class Q4MemoryArtifactStore implements ContentFactoryEndToEndArtifactStore {
  readonly values = new Map<string, unknown>()
  private writes = 0

  constructor(private readonly trace: Q4Trace) {}

  async writeJson(input: {
    jobId: string
    kind: ContentFactoryEndToEndArtifactKind
    fingerprint: string
    value: unknown
  }) {
    this.writes += 1
    const ref = `q4/${input.jobId}/${input.kind}-${this.writes}-${input.fingerprint.slice(0, 8)}.json`
    this.values.set(ref, input.value)
    this.trace.refsByKind.set(input.kind, [...(this.trace.refsByKind.get(input.kind) ?? []), ref])
    if (input.kind === 'validation_report') recordState(this.trace, 'validating')
    if (input.kind === 'expert_review_package') recordState(this.trace, 'expert_review_packaging')
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing Q4 artifact ${ref}`)
    return this.values.get(ref)
  }

  refs(kind: Q4ArtifactKind) {
    return this.trace.refsByKind.get(kind) ?? []
  }
}

const q4Course = {
  jobId: 'q4-deterministic-course',
  subject: 'Synthetic Quantitative Studies',
  qualification: 'Synthetic Q4 Certificate',
  componentId: 'paper-1',
  requirementId: 'ratio-rule',
  familyId: 'calculation-family',
}

function sourceRightsRules(): SourceRightsPolicyRule[] {
  return [
    {
      id: 'q4-board-reference',
      issuer: 'Q4 Synthetic Board',
      hostnames: ['q4.board.example'],
      sourceTypes: ['course_page'],
      useClass: 'REFERENCE_ONLY',
      permissionBasis: 'Synthetic Q4 board metadata fixture',
      aiInputPermitted: false,
      derivedCommercialUsePermitted: false,
      attributionRequirements: [],
      restrictions: ['Structured Board Alignment facts only'],
      revalidationConditions: [],
    },
    {
      id: 'q4-open-curriculum',
      issuer: 'Q4 Open Curriculum',
      hostnames: ['q4.curriculum.example'],
      sourceTypes: ['subject_content'],
      useClass: 'OPEN',
      permissionBasis: 'Synthetic Q4 open-curriculum fixture',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: [],
      restrictions: [],
      revalidationConditions: [],
    },
  ]
}

function createQ4Workers(trace: Q4Trace, store: Q4MemoryArtifactStore): ContentFactoryEndToEndWorkers {
  let runNumber = 0
  let reviewCalls = 0
  const boardSourceId = 'q4-board-source'
  const curriculumSourceId = 'q4-curriculum-source'
  const courseIdentity = {
    subject: q4Course.subject,
    qualification: q4Course.qualification,
    awardingBody: 'Q4 Synthetic Board',
    specificationId: 'q4-specification',
  }
  const cohortValidity = { status: 'current' as const, firstAssessment: '2026', notes: [] }

  function success<T>(stage: string, output: T): WorkerExecution<T> {
    runNumber += 1
    return {
      status: 'success',
      output,
      provenance: {
        id: `q4-${stage}-${runNumber}`,
        contextId: `q4-context-${stage}-${runNumber}`,
        contractVersion: '1',
        provider: 'controlled-fixture',
        model: 'q4-deterministic-v1',
        retryCount: 0,
        usageCost: 0,
      },
    }
  }

  return {
    resolveIdentity: async () => success('identity', {
      courseIdentity,
      cohortValidity,
      components: [{ id: q4Course.componentId, name: 'Paper 1', compulsory: true, marks: 60, durationMinutes: 75, weightingPercent: 100 }],
      unresolvedChoices: [],
    }),

    discoverSources: async () => {
      recordState(trace, 'identified')
      return success('source', [
        {
          id: boardSourceId,
          url: 'https://q4.board.example/q4',
          title: 'Q4 synthetic course identity',
          issuer: 'Q4 Synthetic Board',
          sourceType: 'course_page' as const,
          educationalRole: ['Course identity', 'Board Alignment'],
          versionOrDate: '2026',
        },
        {
          id: curriculumSourceId,
          url: 'https://q4.curriculum.example/q4',
          title: 'Q4 synthetic curriculum',
          issuer: 'Q4 Open Curriculum',
          sourceType: 'subject_content' as const,
          educationalRole: ['Curriculum truth'],
          versionOrDate: '2026',
        },
      ])
    },

    resolveStructuredEvidence: async () => {
      recordState(trace, 'sourced')
      return success('evidence', {
        boardAlignmentFacts: [{
          id: 'fact-paper-1',
          sourceRef: boardSourceId,
          category: 'component' as const,
          value: 'Paper 1: 60 marks, 75 minutes',
          verificationStatus: 'verified' as const,
        }],
        curriculumRequirements: [{
          requirementId: q4Course.requirementId,
          summary: 'Apply a structured ratio rule',
          skillsOrKnowledge: ['Apply a structured ratio rule'],
          componentScope: [q4Course.componentId],
          revisionArea: 'Synthetic quantitative reasoning',
          learnRequired: true,
          practiceRequired: true,
          examPrepRequired: true,
          sourceRefs: [curriculumSourceId],
        }],
      })
    },

    compileBoardAlignment: async () => success('alignment', {
      schemaVersion: 1,
      jobId: q4Course.jobId,
      fingerprint: 'q4-alignment-v1',
      courseIdentity,
      cohortValidity,
      components: [{ id: q4Course.componentId, name: 'Paper 1', compulsory: true, marks: 60, durationMinutes: 75, weightingPercent: 100 }],
      assessmentObjectives: [],
      assessmentRequirements: [{
        id: 'assessment-paper-1',
        summary: 'Apply structured quantitative reasoning.',
        componentScope: [q4Course.componentId],
        sourceRefs: [boardSourceId],
      }],
      sourceRefs: [boardSourceId],
      verificationStatus: 'verified' as const,
    }),

    compileCoverage: async ({ sourceLicenceRegister }) => success('coverage', {
      schemaVersion: 1,
      jobId: q4Course.jobId,
      sourceSetFingerprint: sourceLicenceRegister.fingerprint,
      requirements: [{
        requirementId: q4Course.requirementId,
        officialReference: `${curriculumSourceId}:${q4Course.requirementId}`,
        requirementSummary: 'Apply a structured ratio rule',
        skillsOrKnowledge: ['Apply a structured ratio rule'],
        componentScope: [q4Course.componentId],
        revisionArea: 'Synthetic quantitative reasoning',
        learnRequired: true,
        practiceRequired: true,
        examPrepRequired: true,
        coverageStatus: 'planned' as const,
        contentRefs: [],
        sourceRefs: [curriculumSourceId],
      }],
    }),

    compileKnowledgeModel: async () => success('knowledge', {
      schemaVersion: 1,
      jobId: q4Course.jobId,
      fingerprint: 'q4-knowledge-v1',
      nodes: [{
        id: `node-${q4Course.requirementId}`,
        kind: 'formula' as const,
        summary: 'Apply a structured ratio rule',
        prerequisiteIds: [],
        relatedIds: [],
        formulas: ['ratio = value_a / value_b'],
        misconceptions: ['A ratio can be interpreted without reference to its inputs.'],
        applicationContexts: ['Synthetic quantitative comparison'],
        depth: 'core' as const,
        sourceRefs: [curriculumSourceId],
        boardAlignmentRefs: [q4Course.componentId],
        evidenceTypes: ['calculation', 'application'],
      }],
    }),

    planLearningBlueprint: async () => {
      recordState(trace, 'mapped')
      return success('learning-blueprint', {
        schemaVersion: 1,
        jobId: q4Course.jobId,
        knowledgeModelFingerprint: 'q4-knowledge-v1',
        workUnits: [{
          id: `unit-${q4Course.requirementId}`,
          title: 'Apply a structured ratio rule',
          requirementIds: [q4Course.requirementId],
          knowledgeNodeIds: [`node-${q4Course.requirementId}`],
          learningModes: ['explanation', 'worked_example', 'quantitative'] as const,
          requiredOutputs: ['learning', 'practice'] as const,
          scope: 'course' as const,
          componentIds: [],
        }],
      })
    },

    generateLearningCollateral: async ({ workUnit, requiredTeachingPoints }) => {
      recordState(trace, 'generating')
      return success('learning', {
        title: workUnit.title,
        introduction: `Introduction to ${workUnit.title}`,
        sections: [{ id: `section-${workUnit.id}`, title: 'Core explanation', explanation: `Explain ${workUnit.title}`, keyPoints: [`Key point for ${workUnit.title}`] }],
        workedExamples: [{ id: `example-${workUnit.id}`, title: 'Worked example', setup: `Set up ${workUnit.title}`, steps: ['Apply the structured ratio rule'], conclusion: 'Check the result.' }],
        misconceptions: [{ misconception: `Weak understanding of ${workUnit.title}`, correction: `Correct understanding of ${workUnit.title}` }],
        nextAction: `Practise ${workUnit.title}`,
        coverageEvidence: requiredTeachingPoints.map((teachingPoint) => ({ teachingPoint, evidence: `Introduction to ${workUnit.title}` })),
      })
    },

    generatePracticeCollateral: async ({ workUnit, requiredTeachingPoints }) => success('practice', {
      title: `Practice ${workUnit.title}`,
      instructions: 'Answer each activity, then use the explanation to improve.',
      activities: [{
        id: `activity-${workUnit.id}-1`,
        mode: 'quantitative' as const,
        prompt: `Demonstrate ${workUnit.title}`,
        expectedResponse: `A valid response about ${workUnit.title}`,
        explanation: `Why the response demonstrates ${workUnit.title}`,
        improvementAction: `Revisit the key point for ${workUnit.title}`,
      }],
      coverageEvidence: requiredTeachingPoints.map((teachingPoint) => ({ teachingPoint, evidence: `Practice ${workUnit.title}` })),
    }),

    compileAssessmentBlueprint: async () => success('assessment-blueprint', {
      schemaVersion: 1,
      jobId: q4Course.jobId,
      fingerprint: 'q4-assessment-blueprint-v1',
      boardAlignmentFingerprint: 'q4-alignment-v1',
      assessmentObjectives: [],
      components: [{
        componentId: q4Course.componentId,
        questionFamilyIds: [q4Course.familyId],
        markTotal: 60,
        timingMinutes: 75,
        constraints: [],
      }],
      quantitativeRequirements: ['ratio = value_a / value_b'],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: ['Generate Revision-owned evidence of the intended demand.'],
    }),

    generateQuestionFamilies: async () => success('question-family', [{
      schemaVersion: 1,
      id: q4Course.familyId,
      title: 'Structured ratio calculation',
      assessmentObjectiveIds: [],
      skillProfile: ['calculation'],
      componentScope: [q4Course.componentId],
      markRange: { min: 1, max: 6 },
      responseShape: 'Structured calculation with working',
      contextRequirements: ['Use the supplied synthetic Revision-owned context'],
      applicationRequirements: ['Apply reasoning to the supplied synthetic context'],
      analysisRequirements: [],
      evaluationRequirements: [],
      commonFailureModes: ['Unsupported calculation'],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated' as const,
    }]),

    generateAssessmentItem: async () => success('assessment-item', {
      id: 'q4-ratio-item',
      version: '1',
      title: 'Q4 ratio calculation',
      componentId: q4Course.componentId,
      questionFamilyId: q4Course.familyId,
      requirementIds: [q4Course.requirementId],
      knowledgeNodeIds: [`node-${q4Course.requirementId}`],
      format: 'calculation' as const,
      command: 'Calculate',
      maxMark: 6,
      questionWording: 'Calculate the ratio and show your working.',
      context: {
        id: 'q4-ratio-context',
        title: 'Synthetic quantitative dataset',
        body: 'A fictional dataset supplies the two values required for the calculation.',
        dataPoints: [
          { label: 'value-a', value: '20', unit: 'units' },
          { label: 'value-b', value: '5', unit: 'units' },
        ],
      },
    }),

    generateMarkingPack: async ({ assessmentItem }) => success('marking-pack', {
      assessmentObjectiveAllocation: [],
      rubric: [{ id: `rubric-${assessmentItem.id}`, descriptor: 'Accurate calculation with relevant working', minMark: 0, maxMark: assessmentItem.maxMark }],
      applicationRequirements: ['Apply reasoning to the supplied synthetic context.'],
      analysisRequirements: [],
      evaluationRequirements: [],
      validReasoningRoutes: ['Award credit for any legitimate calculation route that satisfies the question demand.'],
      indicativeContent: ['Illustrative working only; equivalent valid working can receive credit.'],
      misconceptions: ['Do not reward contradictory working.'],
      diagnosticFeedbackRules: ['Explain the first material calculation gap before giving additional detail.'],
      improvementActions: ['Revisit the ratio rule and attempt a fresh variant.'],
      ambiguityPolicy: 'Do not award a precise mark when the response is genuinely ambiguous.',
      confidencePolicy: 'Use a bounded range when evidence does not support a single reliable mark.',
    }),

    independentReview: async (input) => {
      recordState(trace, 'independent_review')
      reviewCalls += 1
      trace.reviewInputs.push({
        reviewedCommit: input.reviewedCommit,
        contentFingerprint: input.contentFingerprint,
        validationDecision: input.deterministicValidation.decision,
      })

      if (reviewCalls === 1) {
        const learningRef = store.refs('learning_collateral')[0]
        const assessmentItemRef = store.refs('assessment_item')[0]
        if (!learningRef || !assessmentItemRef) throw new Error('Q4 review requires generated learning and assessment references')
        return success('independent-review', {
          reviewedCommit: input.reviewedCommit,
          contentFingerprint: input.contentFingerprint,
          decision: 'fail_hold' as const,
          findings: [
            {
              id: 'q4-learning-finding',
              severity: 'material' as const,
              issueType: 'pedagogical_precision',
              artifactRef: learningRef,
              workUnitId: `unit-${q4Course.requirementId}`,
              evidence: ['The synthetic introduction needs a bounded clarification.'],
              finding: 'The introduction needs a clearer statement that the ratio must be interpreted in context.',
              recommendedCorrection: 'Add the bounded clarification without changing governed identity, source provenance or the required evidence locator.',
              resolutionStatus: 'open' as const,
            },
            {
              id: 'q4-assessment-finding',
              severity: 'material' as const,
              issueType: 'assessment_demand_clarity',
              artifactRef: assessmentItemRef,
              evidence: ['The synthetic calculation prompt should identify the supplied values explicitly.'],
              finding: 'The assessment demand can be made more explicit without changing its governed identity or mark demand.',
              recommendedCorrection: 'Clarify that the supplied values must be used and rebuild the dependent Marking Pack against the corrected exact wording.',
              resolutionStatus: 'open' as const,
            },
          ],
        })
      }

      return success('independent-review', {
        reviewedCommit: input.reviewedCommit,
        contentFingerprint: input.contentFingerprint,
        decision: 'pass' as const,
        findings: [],
      })
    },

    remediate: async (input) => {
      recordState(trace, 'remediation')
      trace.remediationTargets.push({
        kind: input.target.kind,
        artifactRef: input.target.artifactRef,
        findingIds: input.findings.map((finding) => finding.id),
      })

      if (input.target.kind === 'learning') {
        const original = learningCollateralArtifactSchema.parse(input.target.artifact)
        return success('remediation-learning', {
          correctedArtifact: {
            ...original,
            content: {
              ...original.content,
              introduction: `${original.content.introduction}. Interpret the ratio only in the context of the supplied values.`,
            },
          },
          resolvedFindingIds: input.findings.map((finding) => finding.id),
          resolutionNotes: ['Added a bounded clarification while preserving governed identity, provenance and exact evidence text.'],
        })
      }

      if (input.target.kind === 'assessment_item') {
        const originalItem = assessmentItemArtifactSchema.parse(input.target.artifact)
        const originalPack = executableMarkingPackSchema.parse(input.target.dependentMarkingPack)
        const correctedItem = {
          ...originalItem,
          questionWording: 'Using the supplied values, calculate the ratio and show your working.',
        }
        return success('remediation-assessment', {
          correctedArtifact: correctedItem,
          correctedDependentMarkingPack: {
            ...originalPack,
            exactQuestionWording: correctedItem.questionWording,
          },
          resolvedFindingIds: input.findings.map((finding) => finding.id),
          resolutionNotes: ['Clarified the assessment demand and rebuilt only its dependent Marking Pack.'],
        })
      }

      throw new Error(`Q4 fixture received unexpected remediation target ${input.target.kind}`)
    },
  }
}

export async function runQ4DeterministicPipelineSimulation() {
  const trace: Q4Trace = {
    states: ['requested'],
    refsByKind: new Map(),
    reviewInputs: [],
    remediationTargets: [],
    persistCalls: [],
  }
  const store = new Q4MemoryArtifactStore(trace)
  const workers = createQ4Workers(trace, store)

  const result = await runRequestedContentFactoryToExpertReviewReady({
    workers,
    artifactStore: store,
    sourceRightsRules: sourceRightsRules(),
    versionPersister: {
      persist: async (input) => {
        trace.persistCalls.push({ state: input.job.state, priorHeadSha: input.priorHeadSha, replacementRefs: [...input.replacementRefs] })
        if (input.job.state !== 'remediation') throw new Error(`Q4 remediation persistence must occur from remediation, received ${input.job.state}`)
        if (input.priorHeadSha !== q4InitialHeadSha) throw new Error('Q4 remediation must persist from the initial reviewed head')
        return { headSha: q4CorrectedHeadSha }
      },
    },
    contentHeadSha: q4InitialHeadSha,
    now: q4Now,
    proofMode: 'contract_integration',
    maxRemediationCycles: 1,
    limitations: [
      'Synthetic provider-free responses prove orchestration reliability, not educational correctness.',
      'The simulation terminates at expert_review_ready and does not exercise learner publication.',
    ],
    request: {
      jobId: q4Course.jobId,
      officialUrls: ['https://q4.board.example/q4'],
      founderInstruction: 'Run the Q4 deterministic reliability simulation',
      createdAt: q4Now,
    },
  })

  recordState(trace, result.job.state as ContentFactoryActiveState)

  const validationReports = await Promise.all(store.refs('validation_report').map(async (ref) => deterministicValidationReportSchema.parse(await store.readJson(ref))))
  const reviewReports = await Promise.all(store.refs('independent_review_report').map(async (ref) => independentReviewReportSchema.parse(await store.readJson(ref))))
  const remediationRecords = await Promise.all(store.refs('remediation_record').map(async (ref) => remediationRecordSchema.parse(await store.readJson(ref))))
  const manifestRefs = store.refs('course_content_pack')
  const latestManifestRef = manifestRefs.at(-1)
  if (!latestManifestRef) throw new Error('Q4 simulation produced no course content pack')
  const latestManifest = courseContentPackManifestSchema.parse(await store.readJson(latestManifestRef))

  return {
    ...result,
    store,
    trace,
    validationReports,
    reviewReports,
    remediationRecords,
    latestManifest,
  }
}
