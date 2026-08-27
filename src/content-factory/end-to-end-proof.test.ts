import { describe, expect, it } from 'vitest'
import { createRequestedJob } from './orchestrator'
import { runIntakeToKnowledgeModel, type SourceRightsPolicyRule, type WorkerExecution } from './intake-to-knowledge-model'
import { runLearningAndPracticeFactory } from './learning-and-practice'
import {
  continueContentFactoryToExpertReviewReady,
  runRequestedContentFactoryToExpertReviewReady,
  summariseContentFactoryScaleProof,
  type ContentFactoryEndToEndArtifactKind,
  type ContentFactoryEndToEndArtifactStore,
  type ContentFactoryEndToEndWorkers,
} from './end-to-end-proof'

const now = '2026-08-26T09:00:00+01:00'

type ComponentFixture = {
  id: string
  name: string
  compulsory: boolean
  marks: number
  durationMinutes: number
  weightingPercent?: number
}

type RequirementFixture = {
  id: string
  summary: string
  componentScope: string[]
  learningScope: 'course' | 'component'
  formula?: string
}

type FamilyFixture = {
  id: string
  componentIds: string[]
  maxMark: number
  format?: 'written_question' | 'case_question' | 'calculation' | 'mixed'
  contextRequired?: boolean
}

type ShapeFixture = {
  id: string
  subject: string
  qualification: string
  provider: string
  model: string
  headSha: string
  components: ComponentFixture[]
  requirements: RequirementFixture[]
  families: FamilyFixture[]
}

class MemoryProofStore implements ContentFactoryEndToEndArtifactStore {
  readonly values = new Map<string, unknown>()
  writes = 0

  async writeJson(input: {
    jobId: string
    kind: ContentFactoryEndToEndArtifactKind
    fingerprint: string
    value: unknown
  }) {
    this.writes += 1
    const ref = `proof/${input.jobId}/${input.kind}-${this.writes}-${input.fingerprint.slice(0, 8)}.json`
    this.values.set(ref, input.value)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing proof artifact ${ref}`)
    return this.values.get(ref)
  }
}

function sourceRules(shape: ShapeFixture): SourceRightsPolicyRule[] {
  return [
    {
      id: `board-reference-${shape.id}`,
      issuer: `Proof Board ${shape.id}`,
      hostnames: [`${shape.id}.board.example`],
      sourceTypes: ['course_page'],
      useClass: 'REFERENCE_ONLY',
      permissionBasis: 'Synthetic contract-proof board metadata fixture',
      aiInputPermitted: false,
      derivedCommercialUsePermitted: false,
      attributionRequirements: [],
      restrictions: ['Structured Board Alignment facts only'],
      revalidationConditions: [],
    },
    {
      id: `open-curriculum-${shape.id}`,
      issuer: `Open Curriculum ${shape.id}`,
      hostnames: [`${shape.id}.curriculum.example`],
      sourceTypes: ['subject_content'],
      useClass: 'OPEN',
      permissionBasis: 'Synthetic open-curriculum contract-proof fixture',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: [],
      restrictions: [],
      revalidationConditions: [],
    },
  ]
}

function shapeWorkers(shape: ShapeFixture): ContentFactoryEndToEndWorkers {
  let runNumber = 0
  const boardSourceId = `board-${shape.id}`
  const curriculumSourceId = `curriculum-${shape.id}`
  const courseIdentity = {
    subject: shape.subject,
    qualification: shape.qualification,
    awardingBody: `Proof Board ${shape.id}`,
    specificationId: `spec-${shape.id}`,
  }
  const cohortValidity = { status: 'current' as const, firstAssessment: '2026', notes: [] }

  function success<T>(stage: string, output: T): WorkerExecution<T> {
    runNumber += 1
    return {
      status: 'success',
      output,
      provenance: {
        id: `proof-${shape.id}-${stage}-${runNumber}`,
        contextId: `proof-context-${shape.id}-${stage}-${runNumber}`,
        contractVersion: '1',
        provider: shape.provider,
        model: shape.model,
        retryCount: 0,
        usageCost: 0.01,
      },
    }
  }

  function requirementNodes() {
    return shape.requirements.map((requirement) => ({
      id: `node-${requirement.id}`,
      kind: requirement.formula ? 'formula' as const : 'concept' as const,
      summary: requirement.summary,
      prerequisiteIds: [],
      relatedIds: [],
      formulas: requirement.formula ? [requirement.formula] : [],
      misconceptions: [`Misconception about ${requirement.summary}`],
      applicationContexts: [`Application of ${requirement.summary}`],
      depth: 'core' as const,
      sourceRefs: [curriculumSourceId],
      boardAlignmentRefs: requirement.componentScope.length > 0
        ? requirement.componentScope
        : [shape.components[0].id],
      evidenceTypes: requirement.formula ? ['calculation', 'application'] : ['explanation', 'application'],
    }))
  }

  function familyFixture(familyId: string) {
    const family = shape.families.find((candidate) => candidate.id === familyId)
    if (!family) throw new Error(`Missing family fixture ${familyId}`)
    return family
  }

  return {
    resolveIdentity: async () => success('identity', {
      courseIdentity,
      cohortValidity,
      components: shape.components,
      unresolvedChoices: [],
    }),
    discoverSources: async () => success('source', [
      {
        id: boardSourceId,
        url: `https://${shape.id}.board.example/${shape.id}`,
        title: `${shape.qualification} identity`,
        issuer: `Proof Board ${shape.id}`,
        sourceType: 'course_page' as const,
        educationalRole: ['Course identity', 'Board Alignment'],
        versionOrDate: '2026',
      },
      {
        id: curriculumSourceId,
        url: `https://${shape.id}.curriculum.example/${shape.id}`,
        title: `${shape.subject} open curriculum fixture`,
        issuer: `Open Curriculum ${shape.id}`,
        sourceType: 'subject_content' as const,
        educationalRole: ['Curriculum truth'],
        versionOrDate: '2026',
      },
    ]),
    resolveStructuredEvidence: async () => success('evidence', {
      boardAlignmentFacts: shape.components.map((component) => ({
        id: `fact-${component.id}`,
        sourceRef: boardSourceId,
        category: 'component' as const,
        value: `${component.name}: ${component.marks} marks, ${component.durationMinutes} minutes`,
        verificationStatus: 'verified' as const,
      })),
      curriculumRequirements: shape.requirements.map((requirement) => ({
        requirementId: requirement.id,
        summary: requirement.summary,
        skillsOrKnowledge: [requirement.summary],
        componentScope: requirement.componentScope,
        revisionArea: `Area ${requirement.id}`,
        learnRequired: true,
        practiceRequired: true,
        examPrepRequired: true,
        sourceRefs: [curriculumSourceId],
      })),
    }),
    compileBoardAlignment: async () => success('alignment', {
      schemaVersion: 1,
      jobId: `proof-${shape.id}`,
      fingerprint: `alignment-${shape.id}`,
      courseIdentity,
      cohortValidity,
      components: shape.components,
      assessmentObjectives: [],
      assessmentRequirements: shape.components.map((component) => ({
        id: `assessment-${component.id}`,
        summary: `Assessment requirements for ${component.name}`,
        componentScope: [component.id],
        sourceRefs: [boardSourceId],
      })),
      sourceRefs: [boardSourceId],
      verificationStatus: 'verified' as const,
    }),
    compileCoverage: async ({ sourceLicenceRegister }) => success('coverage', {
      schemaVersion: 1,
      jobId: `proof-${shape.id}`,
      sourceSetFingerprint: sourceLicenceRegister.fingerprint,
      requirements: shape.requirements.map((requirement) => ({
        requirementId: requirement.id,
        officialReference: `${curriculumSourceId}:${requirement.id}`,
        requirementSummary: requirement.summary,
        skillsOrKnowledge: [requirement.summary],
        componentScope: requirement.componentScope,
        revisionArea: `Area ${requirement.id}`,
        learnRequired: true,
        practiceRequired: true,
        examPrepRequired: true,
        coverageStatus: 'planned' as const,
        contentRefs: [],
        sourceRefs: [curriculumSourceId],
      })),
    }),
    compileKnowledgeModel: async () => success('knowledge', {
      schemaVersion: 1,
      jobId: `proof-${shape.id}`,
      fingerprint: `knowledge-${shape.id}`,
      nodes: requirementNodes(),
    }),
    planLearningBlueprint: async () => success('learning-blueprint', {
      schemaVersion: 1,
      jobId: `proof-${shape.id}`,
      knowledgeModelFingerprint: `knowledge-${shape.id}`,
      workUnits: shape.requirements.map((requirement) => ({
        id: `unit-${requirement.id}`,
        title: requirement.summary,
        requirementIds: [requirement.id],
        knowledgeNodeIds: [`node-${requirement.id}`],
        learningModes: requirement.formula
          ? ['explanation', 'worked_example', 'quantitative'] as const
          : ['explanation', 'short_answer'] as const,
        requiredOutputs: ['learning', 'practice'] as const,
        scope: requirement.learningScope,
        componentIds: requirement.learningScope === 'component' ? requirement.componentScope : [],
      })),
    }),
    generateLearningCollateral: async ({ workUnit, requiredTeachingPoints }) => success('learning', {
      title: workUnit.title,
      introduction: `Introduction to ${workUnit.title}`,
      sections: workUnit.learningModes.includes('explanation')
        ? [{ id: `section-${workUnit.id}`, title: 'Core explanation', explanation: `Explain ${workUnit.title}`, keyPoints: [`Key point for ${workUnit.title}`] }]
        : [],
      workedExamples: workUnit.learningModes.includes('worked_example')
        ? [{ id: `example-${workUnit.id}`, title: 'Worked example', setup: `Set up ${workUnit.title}`, steps: ['Apply the structured rule'], conclusion: 'Check the result.' }]
        : [],
      misconceptions: [{ misconception: `Weak understanding of ${workUnit.title}`, correction: `Correct understanding of ${workUnit.title}` }],
      nextAction: `Practise ${workUnit.title}`,
      coverageEvidence: requiredTeachingPoints.map((teachingPoint) => ({
        teachingPoint,
        evidence: `Introduction to ${workUnit.title}`,
      })),
    }),
    generatePracticeCollateral: async ({ workUnit, requiredTeachingPoints }) => {
      const modes = workUnit.learningModes.filter((mode) => ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'].includes(mode))
      return success('practice', {
        title: `Practice ${workUnit.title}`,
        instructions: 'Answer each activity, then use the explanation to improve.',
        activities: modes.map((mode, index) => ({
          id: `activity-${workUnit.id}-${index + 1}`,
          mode,
          prompt: `Demonstrate ${workUnit.title}`,
          expectedResponse: `A valid response about ${workUnit.title}`,
          explanation: `Why the response demonstrates ${workUnit.title}`,
          improvementAction: `Revisit the key point for ${workUnit.title}`,
        })),
        coverageEvidence: requiredTeachingPoints.map((teachingPoint) => ({
          teachingPoint,
          evidence: `Practice ${workUnit.title}`,
        })),
      })
    },
    compileAssessmentBlueprint: async () => success('assessment-blueprint', {
      schemaVersion: 1,
      jobId: `proof-${shape.id}`,
      fingerprint: `assessment-blueprint-${shape.id}`,
      boardAlignmentFingerprint: `alignment-${shape.id}`,
      assessmentObjectives: [],
      components: shape.components.map((component) => ({
        componentId: component.id,
        questionFamilyIds: shape.families.filter((family) => family.componentIds.includes(component.id)).map((family) => family.id),
        markTotal: component.marks,
        timingMinutes: component.durationMinutes,
        constraints: [],
      })),
      quantitativeRequirements: shape.requirements.filter((requirement) => requirement.formula).map((requirement) => requirement.formula!),
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: ['Generate Revision-owned evidence of the intended demand.'],
    }),
    generateQuestionFamilies: async ({ requestedFamilyIds }) => success('question-family', requestedFamilyIds.map((familyId) => {
      const family = familyFixture(familyId)
      return {
        schemaVersion: 1,
        id: family.id,
        title: `Question family ${family.id}`,
        assessmentObjectiveIds: [],
        skillProfile: ['Structured response'],
        componentScope: family.componentIds,
        markRange: { min: 1, max: family.maxMark },
        responseShape: family.format === 'calculation' ? 'Structured calculation with working' : 'Written structured response',
        contextRequirements: family.contextRequired ? ['Use an original Revision-owned scenario'] : [],
        applicationRequirements: family.contextRequired ? ['Apply reasoning to the scenario'] : [],
        analysisRequirements: [],
        evaluationRequirements: [],
        commonFailureModes: ['Unsupported assertion'],
        markingPackTemplateVersion: '1',
        calibrationStatus: 'not_calibrated' as const,
      }
    })),
    generateAssessmentItem: async ({ questionFamily, targetComponentId, examPrepRequirements }) => {
      const family = familyFixture(questionFamily.id)
      const relevantRequirements = examPrepRequirements.filter((requirement) =>
        requirement.componentScope.length === 0 || requirement.componentScope.includes(targetComponentId),
      )
      if (relevantRequirements.length === 0) throw new Error(`No exam requirement for ${targetComponentId}`)
      const context = family.contextRequired
        ? {
            id: `context-${family.id}-${targetComponentId}`,
            title: 'Revision-owned case context',
            body: 'A fictional organisation is making a decision using the concepts in this course.',
            dataPoints: family.format === 'calculation'
              ? [{ label: 'input-a', value: '20', unit: 'units' }, { label: 'input-b', value: '5', unit: 'units' }]
              : [],
          }
        : undefined
      return success('assessment-item', {
        id: `item-${family.id}-${targetComponentId}`,
        version: '1',
        title: `${questionFamily.title} — ${targetComponentId}`,
        componentId: targetComponentId,
        questionFamilyId: family.id,
        requirementIds: relevantRequirements.map((requirement) => requirement.requirementId),
        knowledgeNodeIds: relevantRequirements.map((requirement) => `node-${requirement.requirementId}`),
        format: family.format ?? 'written_question',
        command: family.format === 'calculation' ? 'Calculate' : 'Explain',
        maxMark: family.maxMark,
        questionWording: family.format === 'calculation'
          ? 'Calculate the required value and show your working.'
          : 'Explain the relevant concept and apply it to the Revision-owned scenario where provided.',
        context,
      })
    },
    generateMarkingPack: async ({ questionFamily, assessmentItem }) => success('marking-pack', {
      assessmentObjectiveAllocation: [],
      rubric: [{ id: `rubric-${assessmentItem.id}`, descriptor: 'Accurate, relevant response', minMark: 0, maxMark: assessmentItem.maxMark }],
      applicationRequirements: questionFamily.applicationRequirements.length > 0 ? ['Apply reasoning to the supplied Revision-owned context.'] : [],
      analysisRequirements: [],
      evaluationRequirements: [],
      validReasoningRoutes: ['Award credit for any legitimate reasoning route that satisfies the question demand.'],
      indicativeContent: ['Illustrative content only; equivalent valid content can receive credit.'],
      misconceptions: ['Do not reward contradictory reasoning.'],
      diagnosticFeedbackRules: ['Explain the first material gap before giving additional detail.'],
      improvementActions: ['Revisit the underlying concept and attempt a fresh variant.'],
      ambiguityPolicy: 'Do not award a precise mark when the response is genuinely ambiguous.',
      confidencePolicy: 'Use a bounded range when evidence does not support a single reliable mark.',
    }),
    independentReview: async ({ reviewedCommit, contentFingerprint }) => success('independent-review', {
      reviewedCommit,
      contentFingerprint,
      decision: 'pass' as const,
      findings: [],
    }),
    remediate: async () => {
      throw new Error('Happy-path scale-proof fixtures should not invoke remediation')
    },
  }
}

function proofInput(shape: ShapeFixture, store: MemoryProofStore, workers: ContentFactoryEndToEndWorkers) {
  return {
    workers,
    artifactStore: store,
    sourceRightsRules: sourceRules(shape),
    versionPersister: {
      persist: async () => {
        throw new Error('Happy-path scale-proof fixtures should not persist remediation versions')
      },
    },
    contentHeadSha: shape.headSha,
    now,
    proofMode: 'contract_integration' as const,
    limitations: ['Synthetic course structures are used to prove domain behaviour without importing real awarding-body content.'],
  }
}

const singleComponentQuantitative: ShapeFixture = {
  id: 'single-quant',
  subject: 'Synthetic Quantitative Studies',
  qualification: 'Synthetic Certificate',
  provider: 'proof-provider-a',
  model: 'proof-model-standard',
  headSha: '1111111111111111111111111111111111111111',
  components: [{ id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 60, durationMinutes: 75, weightingPercent: 100 }],
  requirements: [{ id: 'ratio-rule', summary: 'Apply a structured ratio rule', componentScope: ['paper-1'], learningScope: 'course', formula: 'ratio = value_a / value_b' }],
  families: [{ id: 'calculation-family', componentIds: ['paper-1'], maxMark: 6, format: 'calculation', contextRequired: true }],
}

const sharedTwoPaperCourse: ShapeFixture = {
  id: 'shared-two-paper',
  subject: 'Synthetic Applied Studies',
  qualification: 'Synthetic Advanced Certificate',
  provider: 'proof-provider-b',
  model: 'proof-model-reasoning',
  headSha: '2222222222222222222222222222222222222222',
  components: [
    { id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
    { id: 'paper-2', name: 'Paper 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
  ],
  requirements: [{ id: 'shared-concept', summary: 'Apply one shared concept across both papers', componentScope: ['paper-1', 'paper-2'], learningScope: 'course' }],
  families: [{ id: 'shared-case-family', componentIds: ['paper-1', 'paper-2'], maxMark: 8, format: 'case_question', contextRequired: true }],
}

const mixedOptionalCourse: ShapeFixture = {
  id: 'mixed-options',
  subject: 'Synthetic Pathway Studies',
  qualification: 'Synthetic Diploma',
  provider: 'proof-provider-a',
  model: 'proof-model-alternate',
  headSha: '3333333333333333333333333333333333333333',
  components: [
    { id: 'core', name: 'Core component', compulsory: true, marks: 50, durationMinutes: 60, weightingPercent: 50 },
    { id: 'option-a', name: 'Option A', compulsory: false, marks: 25, durationMinutes: 45, weightingPercent: 25 },
    { id: 'option-b', name: 'Option B', compulsory: false, marks: 25, durationMinutes: 45, weightingPercent: 25 },
  ],
  requirements: [
    { id: 'core-concept', summary: 'Understand the compulsory core concept', componentScope: ['core', 'option-a', 'option-b'], learningScope: 'course' },
    { id: 'option-a-skill', summary: 'Apply the Option A specialist skill', componentScope: ['option-a'], learningScope: 'component' },
    { id: 'option-b-skill', summary: 'Apply the Option B specialist skill', componentScope: ['option-b'], learningScope: 'component' },
  ],
  families: [
    { id: 'core-family', componentIds: ['core'], maxMark: 8, format: 'written_question' },
    { id: 'option-a-family', componentIds: ['option-a'], maxMark: 6, format: 'case_question', contextRequired: true },
    { id: 'option-b-family', componentIds: ['option-b'], maxMark: 6, format: 'written_question' },
  ],
}

async function runShape(shape: ShapeFixture) {
  const store = new MemoryProofStore()
  const workers = shapeWorkers(shape)
  const result = await runRequestedContentFactoryToExpertReviewReady({
    ...proofInput(shape, store, workers),
    request: {
      jobId: `proof-${shape.id}`,
      officialUrls: [`https://${shape.id}.board.example/${shape.id}`],
      founderInstruction: `Build the ${shape.qualification} proof fixture`,
      createdAt: now,
    },
  })
  return { ...result, store, workers }
}

describe('Content Factory v2 end-to-end scale proof', () => {
  it('runs a single-component quantitative course from request to expert_review_ready', async () => {
    const result = await runShape(singleComponentQuantitative)

    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.componentShape).toBe('single_component')
    expect(result.report.learningScopeShape).toBe('course_only')
    expect(result.report.markableAssessmentItemCount).toBe(1)
    expect(result.report.markingPackCoverageCount).toBe(1)
    expect(result.report.observedUsageCost).toBeGreaterThan(0)
    expect(result.package?.reviewedCommit).toBe(singleComponentQuantitative.headSha)
  })

  it('runs shared course content across two compulsory papers while reusing one Question Family', async () => {
    const result = await runShape(sharedTwoPaperCourse)

    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.componentShape).toBe('multi_component_all_compulsory')
    expect(result.report.learningScopeShape).toBe('course_only')
    expect(result.report.questionFamilyCount).toBe(1)
    expect(result.report.markableAssessmentItemCount).toBe(2)
    expect(result.report.reusedQuestionFamilyAcrossComponents).toBe(true)
  })

  it('runs a compulsory core plus optional pathways with mixed course/component learning scope', async () => {
    const result = await runShape(mixedOptionalCourse)

    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.componentShape).toBe('multi_component_mixed_compulsory_optional')
    expect(result.report.learningScopeShape).toBe('mixed')
    expect(result.report.workUnitCount).toBe(3)
    expect(result.report.markableAssessmentItemCount).toBe(3)
    expect(result.report.humanInterventionCount).toBe(0)
  })

  it('records three materially distinct structural signatures and provider-route replacement without overstating live-adapter proof', async () => {
    const results = await Promise.all([
      runShape(singleComponentQuantitative),
      runShape(sharedTwoPaperCourse),
      runShape(mixedOptionalCourse),
    ])
    const summary = summariseContentFactoryScaleProof(results.map((result) => result.report))

    expect(summary.shapeProofDecision).toBe('pass')
    expect(summary.distinctShapeCount).toBe(3)
    expect(summary.providerRouteKeys).toEqual(expect.arrayContaining([
      'proof-provider-a:proof-model-standard',
      'proof-provider-b:proof-model-reasoning',
    ]))
    expect(summary.operationalAdapterProof).toBe('not_proven')
    expect(summary.limitations.join(' ')).toContain('live external source/model-provider')
  })

  it('resumes from a durable generating-stage checkpoint without regenerating completed Learn/Practice artifacts', async () => {
    const shape = sharedTwoPaperCourse
    const store = new MemoryProofStore()
    const workers = shapeWorkers(shape)
    const common = proofInput(shape, store, workers)
    let job = createRequestedJob({
      jobId: `proof-${shape.id}`,
      officialUrls: [`https://${shape.id}.board.example/${shape.id}`],
      founderInstruction: `Build the ${shape.qualification} proof fixture`,
      createdAt: now,
      schemaVersion: 2,
    })
    job = await runIntakeToKnowledgeModel({
      job,
      workers,
      artifactStore: store,
      sourceRightsRules: common.sourceRightsRules,
      now,
    })
    job = await runLearningAndPracticeFactory({ job, workers, artifactStore: store, now })

    const checkpointRefs = job.workUnits.flatMap((unit) => unit.outputRefs)
    const checkpointLearningRuns = job.workerRuns.filter((run) => run.stage === 'generation').length
    const result = await continueContentFactoryToExpertReviewReady({ ...common, job })

    expect(result.job.state).toBe('expert_review_ready')
    expect(result.job.workUnits.flatMap((unit) => unit.outputRefs)).toEqual(checkpointRefs)
    expect(result.job.workerRuns.filter((run) => run.stage === 'generation').length).toBe(checkpointLearningRuns + 2)
  })

  it('is idempotent when an already packaged expert_review_ready job is re-entered', async () => {
    const first = await runShape(singleComponentQuantitative)
    const runCount = first.job.workerRuns.length
    const writeCount = first.store.writes
    const packageRef = first.job.expertReviewPackage?.packageRef

    const second = await continueContentFactoryToExpertReviewReady({
      ...proofInput(singleComponentQuantitative, first.store, first.workers),
      job: first.job,
    })

    expect(second.job.workerRuns).toHaveLength(runCount)
    expect(first.store.writes).toBe(writeCount)
    expect(second.job.expertReviewPackage?.packageRef).toBe(packageRef)
  })
})
