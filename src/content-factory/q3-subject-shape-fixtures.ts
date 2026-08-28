import type { SourceRightsPolicyRule, WorkerExecution } from './intake-to-knowledge-model'
import {
  runRequestedContentFactoryToExpertReviewReady,
  type ContentFactoryEndToEndArtifactKind,
  type ContentFactoryEndToEndArtifactStore,
  type ContentFactoryEndToEndWorkers,
} from './end-to-end-proof'

export const q3SubjectShapeIds = [
  'quantitative_business_economics',
  'mathematics',
  'science',
  'essay_humanities',
  'language_prescribed_text',
] as const

export type Q3SubjectShapeId = typeof q3SubjectShapeIds[number]

type FixtureLearningMode =
  | 'explanation'
  | 'worked_example'
  | 'retrieval'
  | 'flashcard'
  | 'short_answer'
  | 'application'
  | 'quantitative'

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
  learningModes: FixtureLearningMode[]
  formula?: string
}

type ContextKind = 'none' | 'numeric_data' | 'experimental_observation' | 'synthetic_source' | 'synthetic_extract'

type FamilyFixture = {
  id: string
  componentIds: string[]
  maxMark: number
  format: 'written_question' | 'case_question' | 'calculation' | 'mixed'
  contextKind: ContextKind
}

export type Q3SubjectShapeFixture = {
  id: string
  subjectShape: Q3SubjectShapeId
  subject: string
  qualification: string
  syntheticCommitSha: string
  components: ComponentFixture[]
  requirements: RequirementFixture[]
  families: FamilyFixture[]
  characteristics: string[]
}

export class Q3MemoryArtifactStore implements ContentFactoryEndToEndArtifactStore {
  readonly values = new Map<string, unknown>()
  writes = 0

  async writeJson(input: {
    jobId: string
    kind: ContentFactoryEndToEndArtifactKind
    fingerprint: string
    value: unknown
  }) {
    this.writes += 1
    const ref = `q3/${input.jobId}/${input.kind}-${this.writes}-${input.fingerprint.slice(0, 8)}.json`
    this.values.set(ref, input.value)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing Q3 artifact ${ref}`)
    return this.values.get(ref)
  }
}

function sourceRightsRules(fixture: Q3SubjectShapeFixture): SourceRightsPolicyRule[] {
  return [
    {
      id: `q3-board-reference-${fixture.id}`,
      issuer: `Q3 Board ${fixture.id}`,
      hostnames: [`${fixture.id}.board.example`],
      sourceTypes: ['course_page'],
      useClass: 'REFERENCE_ONLY',
      permissionBasis: 'Synthetic Q3 board metadata fixture',
      aiInputPermitted: false,
      derivedCommercialUsePermitted: false,
      attributionRequirements: [],
      restrictions: ['Structured Board Alignment facts only'],
      revalidationConditions: [],
    },
    {
      id: `q3-open-curriculum-${fixture.id}`,
      issuer: `Q3 Open Curriculum ${fixture.id}`,
      hostnames: [`${fixture.id}.curriculum.example`],
      sourceTypes: ['subject_content'],
      useClass: 'OPEN',
      permissionBasis: 'Synthetic Q3 open-curriculum fixture',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: [],
      restrictions: [],
      revalidationConditions: [],
    },
  ]
}

function contextFor(kind: ContextKind, familyId: string, targetComponentId: string) {
  if (kind === 'none') return undefined

  const base = {
    id: `context-${familyId}-${targetComponentId}`,
    title: 'Synthetic Revision-owned context',
    dataPoints: [] as Array<{ label: string; value: string; unit?: string }>,
  }

  if (kind === 'numeric_data') {
    return {
      ...base,
      title: 'Synthetic quantitative dataset',
      body: 'A fictional organisation has revenue of 120 units and cost of 75 units. Use only this invented dataset.',
      dataPoints: [
        { label: 'revenue', value: '120', unit: 'units' },
        { label: 'cost', value: '75', unit: 'units' },
      ],
    }
  }

  if (kind === 'experimental_observation') {
    return {
      ...base,
      title: 'Synthetic experimental observation',
      body: 'An invented laboratory observation records a measured result below a theoretical prediction.',
      dataPoints: [
        { label: 'predicted', value: '50', unit: 'units' },
        { label: 'measured', value: '42', unit: 'units' },
      ],
    }
  }

  if (kind === 'synthetic_source') {
    return {
      ...base,
      title: 'Synthetic historical source',
      body: 'An invented source claims that one cause mattered more than another. The wording is created solely for this reliability fixture.',
    }
  }

  return {
    ...base,
    title: 'Synthetic text extract',
    body: 'An invented passage uses contrast, repetition and a change in tone. It is not taken from any published or prescribed work.',
  }
}

function createControlledWorkers(fixture: Q3SubjectShapeFixture): ContentFactoryEndToEndWorkers {
  let runNumber = 0
  const boardSourceId = `board-${fixture.id}`
  const curriculumSourceId = `curriculum-${fixture.id}`
  const courseIdentity = {
    subject: fixture.subject,
    qualification: fixture.qualification,
    awardingBody: `Q3 Board ${fixture.id}`,
    specificationId: `q3-spec-${fixture.id}`,
  }
  const cohortValidity = { status: 'current' as const, firstAssessment: '2026', notes: [] }

  function success<T>(stage: string, output: T): WorkerExecution<T> {
    runNumber += 1
    return {
      status: 'success',
      output,
      provenance: {
        id: `q3-${fixture.id}-${stage}-${runNumber}`,
        contextId: `q3-context-${fixture.id}-${stage}-${runNumber}`,
        contractVersion: '1',
        provider: 'controlled-fixture',
        model: 'q3-subject-shape-v1',
        retryCount: 0,
        usageCost: 0,
      },
    }
  }

  function familyFixture(familyId: string) {
    const family = fixture.families.find((candidate) => candidate.id === familyId)
    if (!family) throw new Error(`Missing Q3 family fixture ${familyId}`)
    return family
  }

  return {
    resolveIdentity: async () => success('identity', {
      courseIdentity,
      cohortValidity,
      components: fixture.components,
      unresolvedChoices: [],
    }),
    discoverSources: async () => success('source', [
      {
        id: boardSourceId,
        url: `https://${fixture.id}.board.example/${fixture.id}`,
        title: `${fixture.qualification} identity`,
        issuer: `Q3 Board ${fixture.id}`,
        sourceType: 'course_page' as const,
        educationalRole: ['Course identity', 'Board Alignment'],
        versionOrDate: '2026',
      },
      {
        id: curriculumSourceId,
        url: `https://${fixture.id}.curriculum.example/${fixture.id}`,
        title: `${fixture.subject} synthetic open curriculum`,
        issuer: `Q3 Open Curriculum ${fixture.id}`,
        sourceType: 'subject_content' as const,
        educationalRole: ['Curriculum truth'],
        versionOrDate: '2026',
      },
    ]),
    resolveStructuredEvidence: async () => success('evidence', {
      boardAlignmentFacts: fixture.components.map((component) => ({
        id: `fact-${component.id}`,
        sourceRef: boardSourceId,
        category: 'component' as const,
        value: `${component.name}: ${component.marks} marks, ${component.durationMinutes} minutes`,
        verificationStatus: 'verified' as const,
      })),
      curriculumRequirements: fixture.requirements.map((requirement) => ({
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
      jobId: `q3-${fixture.id}`,
      fingerprint: `alignment-${fixture.id}`,
      courseIdentity,
      cohortValidity,
      components: fixture.components,
      assessmentObjectives: [],
      assessmentRequirements: fixture.components.map((component) => ({
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
      jobId: `q3-${fixture.id}`,
      sourceSetFingerprint: sourceLicenceRegister.fingerprint,
      requirements: fixture.requirements.map((requirement) => ({
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
      jobId: `q3-${fixture.id}`,
      fingerprint: `knowledge-${fixture.id}`,
      nodes: fixture.requirements.map((requirement) => ({
        id: `node-${requirement.id}`,
        kind: requirement.formula ? 'formula' as const : 'concept' as const,
        summary: requirement.summary,
        prerequisiteIds: [],
        relatedIds: [],
        formulas: requirement.formula ? [requirement.formula] : [],
        misconceptions: [`Synthetic misconception about ${requirement.summary}`],
        applicationContexts: [`Synthetic application of ${requirement.summary}`],
        depth: 'core' as const,
        sourceRefs: [curriculumSourceId],
        boardAlignmentRefs: requirement.componentScope.length > 0 ? requirement.componentScope : [fixture.components[0].id],
        evidenceTypes: requirement.formula ? ['calculation', 'application'] : ['explanation', 'application'],
      })),
    }),
    planLearningBlueprint: async () => success('learning-blueprint', {
      schemaVersion: 1,
      jobId: `q3-${fixture.id}`,
      knowledgeModelFingerprint: `knowledge-${fixture.id}`,
      workUnits: fixture.requirements.map((requirement) => ({
        id: `unit-${requirement.id}`,
        title: requirement.summary,
        requirementIds: [requirement.id],
        knowledgeNodeIds: [`node-${requirement.id}`],
        learningModes: requirement.learningModes,
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
      jobId: `q3-${fixture.id}`,
      fingerprint: `assessment-blueprint-${fixture.id}`,
      boardAlignmentFingerprint: `alignment-${fixture.id}`,
      assessmentObjectives: [],
      components: fixture.components.map((component) => ({
        componentId: component.id,
        questionFamilyIds: fixture.families.filter((family) => family.componentIds.includes(component.id)).map((family) => family.id),
        markTotal: component.marks,
        timingMinutes: component.durationMinutes,
        constraints: [],
      })),
      quantitativeRequirements: fixture.requirements.filter((requirement) => requirement.formula).map((requirement) => requirement.formula!),
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
        skillProfile: family.format === 'calculation' ? ['calculation'] : ['structured response'],
        componentScope: family.componentIds,
        markRange: { min: 1, max: family.maxMark },
        responseShape: family.format === 'calculation' ? 'Structured calculation with working' : 'Written structured response',
        contextRequirements: family.contextKind === 'none' ? [] : ['Use the supplied synthetic Revision-owned context'],
        applicationRequirements: family.contextKind === 'none' ? [] : ['Apply reasoning to the supplied synthetic context'],
        analysisRequirements: family.format === 'case_question' ? ['Develop a supported explanation from the supplied context'] : [],
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
      if (relevantRequirements.length === 0) throw new Error(`No Q3 exam requirement for ${targetComponentId}`)

      return success('assessment-item', {
        id: `item-${family.id}-${targetComponentId}`,
        version: '1',
        title: `${questionFamily.title} — ${targetComponentId}`,
        componentId: targetComponentId,
        questionFamilyId: family.id,
        requirementIds: relevantRequirements.map((requirement) => requirement.requirementId),
        knowledgeNodeIds: relevantRequirements.map((requirement) => `node-${requirement.requirementId}`),
        format: family.format,
        command: family.format === 'calculation' ? 'Calculate' : 'Explain',
        maxMark: family.maxMark,
        questionWording: family.format === 'calculation'
          ? 'Calculate the required value and show your working.'
          : 'Explain the relevant concept using the supplied synthetic material where provided.',
        context: contextFor(family.contextKind, family.id, targetComponentId),
      })
    },
    generateMarkingPack: async ({ questionFamily, assessmentItem }) => success('marking-pack', {
      assessmentObjectiveAllocation: [],
      rubric: [{ id: `rubric-${assessmentItem.id}`, descriptor: 'Accurate, relevant response', minMark: 0, maxMark: assessmentItem.maxMark }],
      applicationRequirements: questionFamily.applicationRequirements.length > 0 ? ['Apply reasoning to the supplied synthetic context.'] : [],
      analysisRequirements: questionFamily.analysisRequirements,
      evaluationRequirements: [],
      validReasoningRoutes: ['Award credit for any legitimate reasoning route that satisfies the question demand.'],
      indicativeContent: ['Illustrative synthetic content only; equivalent valid content can receive credit.'],
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
      throw new Error('Q3 happy-path subject-shape fixtures must not invoke remediation')
    },
  }
}

export const q3SubjectShapeFixtures: Q3SubjectShapeFixture[] = [
  {
    id: 'quantitative-economics',
    subjectShape: 'quantitative_business_economics',
    subject: 'Synthetic Economics',
    qualification: 'Synthetic Quantitative Certificate',
    syntheticCommitSha: '1111111111111111111111111111111111111111',
    components: [{ id: 'paper-1', name: 'Quantitative paper', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 100 }],
    requirements: [{
      id: 'margin-analysis',
      summary: 'Calculate and interpret a margin from a supplied dataset',
      componentScope: ['paper-1'],
      learningScope: 'course',
      learningModes: ['explanation', 'worked_example', 'application', 'quantitative'],
      formula: 'margin = (revenue - cost) / revenue',
    }],
    families: [{ id: 'data-calculation', componentIds: ['paper-1'], maxMark: 8, format: 'calculation', contextKind: 'numeric_data' }],
    characteristics: ['formula-driven requirement', 'quantitative practice', 'numeric assessment context', 'single compulsory component'],
  },
  {
    id: 'mathematics',
    subjectShape: 'mathematics',
    subject: 'Synthetic Mathematics',
    qualification: 'Synthetic Mathematics Certificate',
    syntheticCommitSha: '2222222222222222222222222222222222222222',
    components: [{ id: 'paper-1', name: 'Mathematics paper', compulsory: true, marks: 100, durationMinutes: 120, weightingPercent: 100 }],
    requirements: [{
      id: 'linear-rule',
      summary: 'Apply a linear transformation rule and show working',
      componentScope: ['paper-1'],
      learningScope: 'course',
      learningModes: ['explanation', 'worked_example', 'quantitative'],
      formula: 'y = 3x + 2',
    }],
    families: [{ id: 'pure-calculation', componentIds: ['paper-1'], maxMark: 6, format: 'calculation', contextKind: 'none' }],
    characteristics: ['formula-driven requirement', 'quantitative practice', 'context-free calculation', 'single compulsory component'],
  },
  {
    id: 'science',
    subjectShape: 'science',
    subject: 'Synthetic Science',
    qualification: 'Synthetic Science Certificate',
    syntheticCommitSha: '3333333333333333333333333333333333333333',
    components: [
      { id: 'paper-1', name: 'Physical systems', compulsory: true, marks: 60, durationMinutes: 75, weightingPercent: 50 },
      { id: 'paper-2', name: 'Experimental reasoning', compulsory: true, marks: 60, durationMinutes: 75, weightingPercent: 50 },
    ],
    requirements: [
      {
        id: 'rate-rule',
        summary: 'Use a rate relationship in a calculation',
        componentScope: ['paper-1'],
        learningScope: 'course',
        learningModes: ['explanation', 'worked_example', 'quantitative'],
        formula: 'rate = change / time',
      },
      {
        id: 'observation-reasoning',
        summary: 'Explain a difference between an observed and predicted result',
        componentScope: ['paper-2'],
        learningScope: 'component',
        learningModes: ['explanation', 'short_answer', 'application'],
      },
    ],
    families: [
      { id: 'science-calculation', componentIds: ['paper-1'], maxMark: 6, format: 'calculation', contextKind: 'none' },
      { id: 'science-observation', componentIds: ['paper-2'], maxMark: 8, format: 'case_question', contextKind: 'experimental_observation' },
    ],
    characteristics: ['formula and conceptual requirements', 'mixed course/component learning scope', 'experimental observation context', 'two compulsory components'],
  },
  {
    id: 'humanities',
    subjectShape: 'essay_humanities',
    subject: 'Synthetic History',
    qualification: 'Synthetic Humanities Certificate',
    syntheticCommitSha: '4444444444444444444444444444444444444444',
    components: [{ id: 'paper-1', name: 'Interpretation and argument', compulsory: true, marks: 80, durationMinutes: 100, weightingPercent: 100 }],
    requirements: [{
      id: 'causal-argument',
      summary: 'Explain and weigh competing causes using a supported argument',
      componentScope: ['paper-1'],
      learningScope: 'course',
      learningModes: ['explanation', 'retrieval', 'short_answer', 'application'],
    }],
    families: [{ id: 'source-argument', componentIds: ['paper-1'], maxMark: 12, format: 'case_question', contextKind: 'synthetic_source' }],
    characteristics: ['non-quantitative concept', 'retrieval and application practice', 'synthetic source context', 'extended written response'],
  },
  {
    id: 'language-text',
    subjectShape: 'language_prescribed_text',
    subject: 'Synthetic Language and Text',
    qualification: 'Synthetic Language Certificate',
    syntheticCommitSha: '5555555555555555555555555555555555555555',
    components: [
      { id: 'paper-1', name: 'Text analysis', compulsory: true, marks: 50, durationMinutes: 60, weightingPercent: 50 },
      { id: 'paper-2', name: 'Comparative response', compulsory: true, marks: 50, durationMinutes: 60, weightingPercent: 50 },
    ],
    requirements: [{
      id: 'language-analysis',
      summary: 'Analyse how language choices shape meaning across a text',
      componentScope: ['paper-1', 'paper-2'],
      learningScope: 'course',
      learningModes: ['explanation', 'flashcard', 'short_answer', 'application'],
    }],
    families: [{ id: 'text-analysis-family', componentIds: ['paper-1', 'paper-2'], maxMark: 10, format: 'written_question', contextKind: 'synthetic_extract' }],
    characteristics: ['non-quantitative text analysis', 'flashcard and application practice', 'synthetic extract rather than business scenario', 'shared family across two components'],
  },
]

export async function runQ3SubjectShape(fixture: Q3SubjectShapeFixture) {
  const store = new Q3MemoryArtifactStore()
  const workers = createControlledWorkers(fixture)
  const result = await runRequestedContentFactoryToExpertReviewReady({
    workers,
    artifactStore: store,
    sourceRightsRules: sourceRightsRules(fixture),
    versionPersister: {
      persist: async () => {
        throw new Error('Q3 happy-path subject-shape fixtures must not persist remediation versions')
      },
    },
    contentHeadSha: fixture.syntheticCommitSha,
    now: '2026-08-28T12:00:00+01:00',
    proofMode: 'contract_integration',
    limitations: [
      'Synthetic course content proves process compatibility only and is not educational benchmark evidence.',
      'Controlled injected workers make no external provider calls.',
    ],
    request: {
      jobId: `q3-${fixture.id}`,
      officialUrls: [`https://${fixture.id}.board.example/${fixture.id}`],
      founderInstruction: `Run the Q3 ${fixture.subjectShape} reliability fixture`,
      createdAt: '2026-08-28T12:00:00+01:00',
    },
  })

  return { ...result, store }
}
