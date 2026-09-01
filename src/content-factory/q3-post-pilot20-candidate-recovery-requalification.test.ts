import { describe, expect, it } from 'vitest'
import evidenceText from '../../content-factory/reliability-post-pilot20-q3-adversarial-requalification.json?raw'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'
import {
  runAssessmentAndMarkingFactory,
  type AssessmentAndMarkingWorkers,
  type AssessmentArtifactKind,
  type AssessmentArtifactStore,
} from './assessment-and-marking'
import type { WorkerExecution } from './intake-to-knowledge-model'
import { q3SubjectShapeFixtures, q3SubjectShapeIds } from './q3-subject-shape-fixtures'

const now = '2026-09-01T08:00:00+01:00'
type Fixture = (typeof q3SubjectShapeFixtures)[number]
type CandidatePlan = {
  assessmentReject?: Record<string, readonly number[]>
  markingReject?: Record<string, readonly number[]>
}
type CandidateTrace = {
  assessment: Array<{ slot: string; candidateNumber: number; maxCandidates?: number }>
  marking: Array<{ slot: string; candidateNumber: number; maxCandidates?: number; questionWording: string }>
}

type Evidence = {
  schemaVersion: number
  gate: string
  scope: string
  baseMainSha: string
  providerCallsUsed: boolean
  historicalRecordsRewritten: boolean
  requiredShapes: string[]
  acceptance: Record<string, boolean>
  limitations: string[]
}

const evidence = JSON.parse(evidenceText) as Evidence

class MemoryStore implements AssessmentArtifactStore {
  readonly values = new Map<string, unknown>()
  readonly refsByKind = new Map<AssessmentArtifactKind, string[]>()
  private writes = 0

  seed(ref: string, value: unknown) {
    this.values.set(ref, value)
  }

  refs(kind: AssessmentArtifactKind) {
    return [...(this.refsByKind.get(kind) ?? [])]
  }

  async writeJson(input: { jobId: string; kind: AssessmentArtifactKind; fingerprint: string; value: unknown }) {
    this.writes += 1
    const ref = `q3-recovery/${input.jobId}/${input.kind}-${this.writes}-${input.fingerprint.slice(0, 8)}.json`
    this.values.set(ref, input.value)
    this.refsByKind.set(input.kind, [...(this.refsByKind.get(input.kind) ?? []), ref])
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing Q3 recovery artifact ${ref}`)
    return this.values.get(ref)
  }
}

function slot(familyId: string, componentId: string) {
  return `${familyId}:${componentId}`
}

function targetCount(fixture: Fixture) {
  return fixture.components.reduce(
    (count, component) => count + fixture.families.filter((family) => family.componentIds.includes(component.id)).length,
    0,
  )
}

function fixtureRefs(fixture: Fixture) {
  const root = `q3-recovery/${fixture.id}`
  return {
    board: `${root}/board-alignment.json`,
    coverage: `${root}/coverage-map.json`,
    knowledge: `${root}/course-knowledge-model.json`,
    learningBlueprint: `${root}/learning-blueprint.json`,
  }
}

function buildPrerequisites(fixture: Fixture) {
  const jobId = `q3-recovery-${fixture.id}`
  const refs = fixtureRefs(fixture)
  const courseIdentity = {
    subject: fixture.subject,
    qualification: fixture.qualification,
    awardingBody: `Q3 Board ${fixture.id}`,
    specificationId: `q3-${fixture.id}`,
  }
  const boardAlignment = {
    schemaVersion: 1 as const,
    jobId,
    fingerprint: `board-${fixture.id}`,
    courseIdentity,
    cohortValidity: { status: 'current' as const, firstAssessment: '2026', notes: [] },
    components: fixture.components,
    assessmentObjectives: [],
    assessmentRequirements: fixture.components.map((component) => ({
      id: `assessment-${component.id}`,
      summary: `Synthetic assessment requirement for ${component.name}`,
      componentScope: [component.id],
      sourceRefs: ['board-reference'],
    })),
    sourceRefs: ['board-reference'],
    verificationStatus: 'verified' as const,
  }
  const coverage = {
    schemaVersion: 1 as const,
    jobId,
    sourceSetFingerprint: `source-set-${fixture.id}`,
    requirements: fixture.requirements.map((requirement) => ({
      requirementId: requirement.id,
      officialReference: `open-curriculum:${requirement.id}`,
      requirementSummary: requirement.summary,
      skillsOrKnowledge: [requirement.summary],
      componentScope: requirement.componentScope,
      revisionArea: `Area ${requirement.id}`,
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned' as const,
      contentRefs: [],
      sourceRefs: ['open-curriculum'],
    })),
  }
  const knowledgeModel = {
    schemaVersion: 1 as const,
    jobId,
    fingerprint: `knowledge-${fixture.id}`,
    nodes: fixture.requirements.map((requirement) => ({
      id: `node-${requirement.id}`,
      kind: requirement.formula ? 'formula' as const : 'concept' as const,
      summary: requirement.summary,
      prerequisiteIds: [],
      relatedIds: [],
      formulas: requirement.formula ? [requirement.formula] : [],
      misconceptions: [`Synthetic misconception for ${requirement.id}`],
      applicationContexts: [`Synthetic application for ${requirement.id}`],
      depth: 'core' as const,
      sourceRefs: ['open-curriculum'],
      boardAlignmentRefs: requirement.componentScope.length > 0 ? requirement.componentScope : [fixture.components[0]!.id],
      evidenceTypes: requirement.formula ? ['calculation', 'application'] : ['explanation', 'application'],
    })),
  }

  const store = new MemoryStore()
  store.seed(refs.board, boardAlignment)
  store.seed(refs.coverage, coverage)
  store.seed(refs.knowledge, knowledgeModel)
  store.seed(refs.learningBlueprint, {
    schemaVersion: 1,
    jobId,
    knowledgeModelFingerprint: knowledgeModel.fingerprint,
    workUnits: [],
  })

  const workUnits = fixture.requirements.map((requirement) => {
    const learningRef = `q3-recovery/${fixture.id}/learning-${requirement.id}.json`
    const practiceRef = `q3-recovery/${fixture.id}/practice-${requirement.id}.json`
    const workUnitId = `unit-${requirement.id}`
    const nodeId = `node-${requirement.id}`
    store.seed(learningRef, {
      schemaVersion: 1,
      artifactType: 'learning',
      jobId,
      workUnitId,
      knowledgeModelFingerprint: knowledgeModel.fingerprint,
      knowledgeNodeIds: [nodeId],
      sourceRefs: ['open-curriculum'],
      content: {
        title: requirement.summary,
        introduction: `Learn ${requirement.summary}`,
        sections: [{ id: `section-${requirement.id}`, title: 'Core idea', explanation: requirement.summary, keyPoints: [requirement.summary] }],
        workedExamples: [],
        misconceptions: [],
        nextAction: `Practise ${requirement.summary}`,
        coverageEvidence: [{ teachingPoint: requirement.summary, evidence: requirement.summary }],
      },
    })
    store.seed(practiceRef, {
      schemaVersion: 1,
      artifactType: 'practice',
      jobId,
      workUnitId,
      knowledgeModelFingerprint: knowledgeModel.fingerprint,
      knowledgeNodeIds: [nodeId],
      sourceRefs: ['open-curriculum'],
      content: {
        title: `Practice ${requirement.summary}`,
        instructions: 'Answer the synthetic practice activity.',
        activities: [{
          id: `activity-${requirement.id}`,
          mode: 'short_answer',
          prompt: `Explain ${requirement.summary}`,
          expectedResponse: requirement.summary,
          explanation: requirement.summary,
          improvementAction: `Revisit ${requirement.summary}`,
        }],
        coverageEvidence: [{ teachingPoint: requirement.summary, evidence: requirement.summary }],
      },
    })
    return {
      id: workUnitId,
      title: requirement.summary,
      requirementIds: [requirement.id],
      componentIds: requirement.componentScope,
      status: 'complete' as const,
      outputRefs: [learningRef, practiceRef],
    }
  })

  const job: ContentFactoryJob = contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId,
    officialUrls: [`https://${fixture.id}.board.example/${fixture.id}`],
    founderInstruction: `Run post-Pilot 20 Q3 recovery fixture for ${fixture.subjectShape}`,
    state: 'generating',
    courseIdentity,
    cohortValidity: boardAlignment.cohortValidity,
    components: fixture.components,
    unresolvedChoices: [],
    sourceLicenceRegisterRef: `q3-recovery/${fixture.id}/source-licence-register.json`,
    sourceRightsStatus: 'approved',
    sourceSetFingerprint: coverage.sourceSetFingerprint,
    boardAlignmentRef: refs.board,
    coverageMapRef: refs.coverage,
    coverageCompleteness: 'pending',
    courseKnowledgeModelRef: refs.knowledge,
    learningBlueprintRef: refs.learningBlueprint,
    workUnits,
    workerRuns: [],
    blockers: [],
    createdAt: now,
    updatedAt: now,
  })

  return { job, store, boardAlignment, coverage, knowledgeModel }
}

function buildWorkers(fixture: Fixture, plan: CandidatePlan, trace: CandidateTrace): AssessmentAndMarkingWorkers {
  let run = 0
  const success = <T,>(stage: string, output: T): WorkerExecution<T> => {
    run += 1
    return {
      status: 'success',
      output,
      provenance: {
        id: `q3-${fixture.id}-${stage}-${run}`,
        contextId: `q3-context-${fixture.id}-${stage}-${run}`,
        contractVersion: '1',
        provider: 'controlled-fixture',
        model: 'q3-candidate-recovery-v1',
        retryCount: 0,
        usageCost: 0,
      },
    }
  }
  const rejected = (stage: string, message: string): WorkerExecution<never> => {
    run += 1
    return {
      status: 'failure',
      error: `provider_contract_failure: ${message}`,
      provenance: {
        id: `q3-${fixture.id}-${stage}-${run}`,
        contextId: `q3-context-${fixture.id}-${stage}-${run}`,
        contractVersion: '1',
        provider: 'controlled-fixture',
        model: 'q3-candidate-recovery-v1',
        retryCount: 0,
        usageCost: 0,
      },
    }
  }

  const familyById = new Map(fixture.families.map((family) => [family.id, family]))
  return {
    compileAssessmentBlueprint: async () => success('blueprint', {
      schemaVersion: 1,
      jobId: `q3-recovery-${fixture.id}`,
      fingerprint: `assessment-blueprint-${fixture.id}`,
      boardAlignmentFingerprint: `board-${fixture.id}`,
      assessmentObjectives: [],
      components: fixture.components.map((component) => ({
        componentId: component.id,
        questionFamilyIds: fixture.families.filter((family) => family.componentIds.includes(component.id)).map((family) => family.id),
        markTotal: component.marks,
        timingMinutes: component.durationMinutes,
        constraints: [],
      })),
      quantitativeRequirements: fixture.requirements.flatMap((requirement) => requirement.formula ? [requirement.formula] : []),
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: ['Use Revision-owned synthetic evidence.'],
    }),
    generateQuestionFamilies: async ({ requestedFamilyIds }) => success('families', requestedFamilyIds.map((familyId) => {
      const family = familyById.get(familyId)
      if (!family) throw new Error(`Missing Q3 family ${familyId}`)
      return {
        schemaVersion: 1,
        id: family.id,
        title: `Synthetic ${family.id}`,
        assessmentObjectiveIds: [],
        skillProfile: family.format === 'calculation' ? ['calculation'] : ['structured response'],
        componentScope: family.componentIds,
        markRange: { min: 1, max: family.maxMark },
        responseShape: family.format === 'calculation' ? 'Structured calculation with working' : 'Written structured response',
        contextRequirements: family.contextKind === 'none' ? [] : ['Use the supplied synthetic context.'],
        applicationRequirements: family.contextKind === 'none' ? [] : ['Apply reasoning to the supplied synthetic context.'],
        analysisRequirements: family.format === 'case_question' ? ['Develop a supported explanation.'] : [],
        evaluationRequirements: [],
        commonFailureModes: ['Unsupported assertion'],
        markingPackTemplateVersion: '1',
        calibrationStatus: 'not_calibrated' as const,
      }
    })),
    generateAssessmentItem: async ({ questionFamily, targetComponentId, examPrepRequirements, candidateNumber = 1, maxCandidates }) => {
      const targetSlot = slot(questionFamily.id, targetComponentId)
      trace.assessment.push({ slot: targetSlot, candidateNumber, maxCandidates })
      if (plan.assessmentReject?.[targetSlot]?.includes(candidateNumber)) {
        return rejected('assessment', `injected Assessment rejection for ${targetSlot} candidate ${candidateNumber}`)
      }
      const family = familyById.get(questionFamily.id)!
      const relevant = examPrepRequirements.filter((requirement) => requirement.componentScope.length === 0 || requirement.componentScope.includes(targetComponentId))
      const itemId = `${questionFamily.id}-${targetComponentId}`
      return success('assessment', {
        id: itemId,
        version: '1',
        title: `Synthetic ${questionFamily.id} — ${targetComponentId}`,
        componentId: targetComponentId,
        questionFamilyId: questionFamily.id,
        requirementIds: relevant.map((requirement) => requirement.requirementId),
        knowledgeNodeIds: relevant.map((requirement) => `node-${requirement.requirementId}`),
        format: family.format,
        command: family.format === 'calculation' ? 'Calculate' : 'Explain',
        maxMark: family.maxMark,
        questionWording: `Complete the synthetic ${questionFamily.id} task for ${targetComponentId}.`,
        ...(family.contextKind === 'none' ? {} : {
          context: {
            id: `context-${questionFamily.id}-${targetComponentId}`,
            title: 'Synthetic Revision-owned context',
            body: 'This invented context exists only for provider-free reliability qualification.',
            dataPoints: family.contextKind === 'numeric_data' ? [{ label: 'synthetic value', value: '42', unit: 'units' }] : [],
          },
        }),
      })
    },
    generateMarkingPack: async ({ questionFamily, assessmentItem, candidateNumber = 1, maxCandidates }) => {
      const targetSlot = slot(questionFamily.id, assessmentItem.componentId)
      trace.marking.push({ slot: targetSlot, candidateNumber, maxCandidates, questionWording: assessmentItem.questionWording })
      if (plan.markingReject?.[targetSlot]?.includes(candidateNumber)) {
        return rejected('marking', `injected Marking Pack rejection for ${targetSlot} candidate ${candidateNumber}`)
      }
      return success('marking', {
        assessmentObjectiveAllocation: [],
        rubric: [{ id: `rubric-${assessmentItem.id}`, descriptor: 'Accurate and relevant synthetic response.', minMark: 0, maxMark: assessmentItem.maxMark }],
        applicationRequirements: [...questionFamily.applicationRequirements],
        analysisRequirements: [...questionFamily.analysisRequirements],
        evaluationRequirements: [...questionFamily.evaluationRequirements],
        validReasoningRoutes: ['Any valid route satisfying the governed question demand.'],
        indicativeContent: ['Synthetic indicative content only.'],
        misconceptions: ['Do not reward contradictory reasoning.'],
        diagnosticFeedbackRules: ['Identify the first material gap before additional detail.'],
        improvementActions: ['Revisit the underlying concept and attempt a fresh variant.'],
        ambiguityPolicy: 'Escalate genuine ambiguity rather than inventing precision.',
        confidencePolicy: 'Do not overstate confidence.',
      })
    },
  }
}

async function runFixture(fixture: Fixture, plan: CandidatePlan = {}) {
  const seeded = buildPrerequisites(fixture)
  const trace: CandidateTrace = { assessment: [], marking: [] }
  const workers = buildWorkers(fixture, plan, trace)
  const job = await runAssessmentAndMarkingFactory({
    job: seeded.job,
    artifactStore: seeded.store,
    workers,
    now,
  })
  return { ...seeded, trace, job }
}

function callsFor<T extends { slot: string; candidateNumber: number }>(calls: T[], targetSlot: string) {
  return calls.filter((call) => call.slot === targetSlot)
}

describe('Post-Pilot #20 Q3 adversarial candidate-recovery requalification', () => {
  it('binds the post-reset evidence to all five governed shapes without changing global qualification state', () => {
    expect(evidence.schemaVersion).toBe(1)
    expect(evidence.gate).toBe('Q3-adversarial-provider-free-subject-matrix')
    expect(evidence.scope).toBe('post_pilot_20_candidate_recovery_adversarial_subject_matrix')
    expect(evidence.baseMainSha).toBe('2063de6836c3f6091b97cc16d92c26f08c49a1ad')
    expect(evidence.providerCallsUsed).toBe(false)
    expect(evidence.historicalRecordsRewritten).toBe(false)
    expect(new Set(evidence.requiredShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(evidence.acceptance.q3EvidenceReady).toBe(true)
    expect(evidence.acceptance.globalQualificationStateChanged).toBe(false)
    expect(evidence.acceptance.q6PassedByThisEvidence).toBe(false)
    expect(evidence.acceptance.q7Eligible).toBe(false)
    expect(evidence.acceptance.q8Eligible).toBe(false)
    expect(evidence.limitations.join(' ')).toContain('Q6 remains separate')
  })

  it.each(q3SubjectShapeFixtures)('recovers rejected Assessment and Marking Pack candidates within the same required slot for $subjectShape', async (fixture) => {
    const family = fixture.families[0]!
    const componentId = family.componentIds[0]!
    const targetSlot = slot(family.id, componentId)
    const result = await runFixture(fixture, {
      assessmentReject: { [targetSlot]: [1] },
      markingReject: { [targetSlot]: [1] },
    })

    expect(result.job.state).toBe('validating')
    expect(callsFor(result.trace.assessment, targetSlot).map((call) => call.candidateNumber)).toEqual([1, 2])
    expect(callsFor(result.trace.marking, targetSlot).map((call) => call.candidateNumber)).toEqual([1, 2])
    expect(callsFor(result.trace.assessment, targetSlot).every((call) => call.maxCandidates === 2)).toBe(true)
    expect(callsFor(result.trace.marking, targetSlot).every((call) => call.maxCandidates === 2)).toBe(true)
    expect(result.trace.assessment.some((call) => call.candidateNumber === 3)).toBe(false)
    expect(result.trace.marking.some((call) => call.candidateNumber === 3)).toBe(false)
    expect(result.store.refs('assessment_item')).toHaveLength(targetCount(fixture))
    expect(result.store.refs('marking_pack')).toHaveLength(targetCount(fixture))
    expect(result.store.refs('course_content_pack')).toHaveLength(1)
    expect(result.job.workerRuns.reduce((sum, run) => sum + (run.usageCost ?? 0), 0)).toBe(0)
  })

  it('preserves an accepted science Assessment sibling while only the rejected second slot advances to candidate 2', async () => {
    const fixture = q3SubjectShapeFixtures.find((candidate) => candidate.subjectShape === 'science')!
    const firstSlot = slot('science-calculation', 'paper-1')
    const secondSlot = slot('science-observation', 'paper-2')
    const result = await runFixture(fixture, { assessmentReject: { [secondSlot]: [1] } })

    expect(result.job.state).toBe('validating')
    expect(callsFor(result.trace.assessment, firstSlot).map((call) => call.candidateNumber)).toEqual([1])
    expect(callsFor(result.trace.assessment, secondSlot).map((call) => call.candidateNumber)).toEqual([1, 2])
    expect(result.store.refs('assessment_item')).toHaveLength(2)
    expect(result.store.refs('marking_pack')).toHaveLength(2)
  })

  it('preserves a shared-family language sibling and freezes the accepted Assessment wording across Marking Pack recovery', async () => {
    const fixture = q3SubjectShapeFixtures.find((candidate) => candidate.subjectShape === 'language_prescribed_text')!
    const firstSlot = slot('text-analysis-family', 'paper-1')
    const secondSlot = slot('text-analysis-family', 'paper-2')
    const result = await runFixture(fixture, { markingReject: { [secondSlot]: [1] } })

    expect(result.job.state).toBe('validating')
    expect(callsFor(result.trace.assessment, firstSlot).map((call) => call.candidateNumber)).toEqual([1])
    expect(callsFor(result.trace.assessment, secondSlot).map((call) => call.candidateNumber)).toEqual([1])
    expect(callsFor(result.trace.marking, firstSlot).map((call) => call.candidateNumber)).toEqual([1])
    const recovered = callsFor(result.trace.marking, secondSlot)
    expect(recovered.map((call) => call.candidateNumber)).toEqual([1, 2])
    expect(new Set(recovered.map((call) => call.questionWording)).size).toBe(1)
    expect(result.store.refs('assessment_item')).toHaveLength(2)
    expect(result.store.refs('marking_pack')).toHaveLength(2)
  })

  it('blocks when a mandatory science Assessment slot exhausts both candidates without deleting the accepted sibling or assembling an incomplete course pack', async () => {
    const fixture = q3SubjectShapeFixtures.find((candidate) => candidate.subjectShape === 'science')!
    const firstSlot = slot('science-calculation', 'paper-1')
    const exhaustedSlot = slot('science-observation', 'paper-2')
    const result = await runFixture(fixture, { assessmentReject: { [exhaustedSlot]: [1, 2] } })

    expect(result.job.state).toBe('blocked')
    expect(callsFor(result.trace.assessment, firstSlot).map((call) => call.candidateNumber)).toEqual([1])
    expect(callsFor(result.trace.assessment, exhaustedSlot).map((call) => call.candidateNumber)).toEqual([1, 2])
    expect(result.trace.assessment.some((call) => call.candidateNumber === 3)).toBe(false)
    expect(result.store.refs('assessment_item')).toHaveLength(1)
    expect(result.store.refs('course_content_pack')).toHaveLength(0)
    expect(result.job.blockers.some((blocker) => blocker.reason.includes('generation candidate recovery exhausted'))).toBe(true)
  })
})
