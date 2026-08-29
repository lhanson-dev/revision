import { describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
  OpenAIModelRoute,
} from './openai-provider-adapter'
import type { AssessmentResponseDemand } from './assessment-integrity'
import { q3SubjectShapeIds, type Q3SubjectShapeId } from './q3-subject-shape-fixtures'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_LIVE_WORKER_SOAK === '1'
const evidenceDirectory = '.artifacts/content-factory-live-worker-soak'
const liveSoakTimeoutMs = 25 * 60 * 1000
const governedSampleCount = 20
const samplesPerShape = 4

type AssessmentItemInput = Parameters<OpenAIModelAssistedWorkers['generateAssessmentItem']>[0]
type MarkingPackInput = Parameters<OpenAIModelAssistedWorkers['generateMarkingPack']>[0]
type AssessmentFormat = NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']>[string]['format']
type WorkerBoundary = 'assessment_item_generation' | 'marking_pack_generation'
type SampleStatus = 'success' | 'failure' | 'infrastructure_failure' | 'runner_exception'
type SampleDisposition = 'accepted' | 'controlled_fail_closed' | 'infrastructure_incident' | 'engineering_boundary_breach'

type ShapeScenario = {
  shape: Q3SubjectShapeId
  subject: string
  qualification: string
  demand: AssessmentResponseDemand
  command: string
  marks: number
  format: AssessmentFormat
  requiresApplication: boolean
  requirementTopic: string
  knowledgeSummary: string
}

type SampleRecord = {
  sampleId: string
  subjectShape: Q3SubjectShapeId
  workerBoundary: WorkerBoundary
  providerCallCount: number
  repairCount: number
  status: SampleStatus
  disposition: SampleDisposition
  provider?: string
  model?: string
  contractVersion?: string
  retryCount?: number
  usageCostUsd?: number
  error?: string
}

const scenarios: ShapeScenario[] = [
  {
    shape: 'quantitative_business_economics',
    subject: 'Synthetic Business and Economics',
    qualification: 'Synthetic Quantitative Certificate',
    demand: 'calculation',
    command: 'Calculate',
    marks: 6,
    format: 'calculation',
    requiresApplication: true,
    requirementTopic: 'synthetic margin rate',
    knowledgeSummary: 'A synthetic margin rate can be calculated from an invented profit value and an invented revenue value. The arithmetic and interpretation are intentionally generic and rights-safe.',
  },
  {
    shape: 'mathematics',
    subject: 'Synthetic Mathematics',
    qualification: 'Synthetic Mathematics Certificate',
    demand: 'calculation',
    command: 'Calculate',
    marks: 6,
    format: 'calculation',
    requiresApplication: false,
    requirementTopic: 'synthetic proportional value',
    knowledgeSummary: 'A synthetic proportional value can be found from invented numerical quantities using ordinary arithmetic. No external source or protected problem wording is required.',
  },
  {
    shape: 'science',
    subject: 'Synthetic Science',
    qualification: 'Synthetic Science Certificate',
    demand: 'analysis',
    command: 'Analyse',
    marks: 6,
    format: 'case_question',
    requiresApplication: true,
    requirementTopic: 'synthetic experimental change',
    knowledgeSummary: 'An invented experiment may compare a changed variable with an outcome. Analysis should connect the stated change to the stated result without claiming unsupported causation.',
  },
  {
    shape: 'essay_humanities',
    subject: 'Synthetic Humanities',
    qualification: 'Synthetic Humanities Certificate',
    demand: 'evaluation',
    command: 'Evaluate',
    marks: 12,
    format: 'written_question',
    requiresApplication: true,
    requirementTopic: 'synthetic historical interpretation',
    knowledgeSummary: 'An invented historical interpretation can be evaluated by weighing explicitly supplied reasons and limitations. No real historical quotation or source text is used.',
  },
  {
    shape: 'language_prescribed_text',
    subject: 'Synthetic Language and Text',
    qualification: 'Synthetic Language Certificate',
    demand: 'analysis',
    command: 'Analyse',
    marks: 10,
    format: 'written_question',
    requiresApplication: true,
    requirementTopic: 'synthetic textual technique',
    knowledgeSummary: 'An invented micro-text may use a clearly stated language technique. Analysis should explain how that invented technique shapes meaning without reproducing any prescribed or copyrighted text.',
  },
]

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

function positiveNumberEnv(name: string, fallback: number) {
  const raw = env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid_positive_number_runtime_config:${name}`)
  return value
}

function familyId(scenario: ShapeScenario, sampleNumber: number) {
  return `${scenario.shape.replaceAll('_', '-')}-soak-${sampleNumber}`
}

function requirementId(scenario: ShapeScenario) {
  return `${scenario.shape}-soak-requirement`
}

function componentId(scenario: ShapeScenario) {
  return `${scenario.shape}-component`
}

function nodeId(scenario: ShapeScenario) {
  return `${scenario.shape}-knowledge-node`
}

function courseIdentity(scenario: ShapeScenario) {
  return {
    subject: scenario.subject,
    qualification: scenario.qualification,
    awardingBody: 'Synthetic Reliability Board',
    specificationId: `q7-${scenario.shape}`,
  }
}

function assessmentBlueprint(scenario: ShapeScenario, sampleNumber: number) {
  const family = familyId(scenario, sampleNumber)
  return {
    schemaVersion: 1,
    jobId: `q7-${scenario.shape}-${sampleNumber}`,
    fingerprint: `q7-blueprint-${scenario.shape}-${sampleNumber}`,
    boardAlignmentFingerprint: `q7-board-${scenario.shape}`,
    assessmentObjectives: [{ id: 'ao1', weightingPercent: 100 }],
    components: [{
      componentId: componentId(scenario),
      questionFamilyIds: [family],
      markTotal: scenario.marks,
      timingMinutes: 30,
      constraints: [],
    }],
    quantitativeRequirements: scenario.demand === 'calculation' ? ['Use only invented values supplied in the generated item.'] : [],
    synopticRequirements: [],
    commandDemands: [],
    evidenceExpectations: ['Use only the synthetic structured facts supplied for this reliability sample.'],
  }
}

function questionFamily(scenario: ShapeScenario, sampleNumber: number) {
  return {
    schemaVersion: 1,
    id: familyId(scenario, sampleNumber),
    title: `Q7 synthetic ${scenario.shape} family ${sampleNumber}`,
    assessmentObjectiveIds: ['ao1'],
    skillProfile: [scenario.demand],
    componentScope: [componentId(scenario)],
    markRange: { min: scenario.marks, max: scenario.marks },
    responseShape: `One original rights-safe ${scenario.demand} task using invented content only.`,
    contextRequirements: scenario.requiresApplication ? ['Use a short invented scenario supplied or created within the item.'] : [],
    applicationRequirements: scenario.requiresApplication ? ['Apply the response to the invented scenario rather than giving generic assertions.'] : [],
    analysisRequirements: scenario.demand === 'analysis' ? ['Develop a supported analytical link from the stated evidence to the stated outcome.'] : [],
    evaluationRequirements: scenario.demand === 'evaluation' ? ['Reach a supported judgement after weighing more than one relevant consideration.'] : [],
    commonFailureModes: ['Do not invent official wording, examiner authority or external source claims.'],
    markingPackTemplateVersion: '1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

function knowledgeNodes(scenario: ShapeScenario) {
  return [{
    id: nodeId(scenario),
    kind: 'concept' as const,
    summary: scenario.knowledgeSummary,
    formulas: scenario.demand === 'calculation' ? ['synthetic rate = invented numerator / invented denominator × 100'] : [],
    misconceptions: [],
    applicationContexts: scenario.requiresApplication ? ['Invented Q7 reliability scenario only.'] : [],
    depth: 'core' as const,
    evidenceTypes: ['synthetic'],
  }]
}

function assessmentInput(scenario: ShapeScenario, sampleNumber: number): AssessmentItemInput {
  return {
    jobId: `q7-${scenario.shape}-${sampleNumber}`,
    courseIdentity: courseIdentity(scenario),
    assessmentBlueprint: assessmentBlueprint(scenario, sampleNumber),
    questionFamily: questionFamily(scenario, sampleNumber),
    targetComponentId: componentId(scenario),
    knowledgeNodes: knowledgeNodes(scenario),
    examPrepRequirements: [],
  } as AssessmentItemInput
}

function deterministicAssessmentItem(scenario: ShapeScenario, sampleNumber: number) {
  const requirement = requirementId(scenario)
  const evidence = scenario.requirementTopic
  const wording = scenario.demand === 'calculation'
    ? `${scenario.command} the ${evidence} using the invented values 120 and 30, showing your working.`
    : `${scenario.command} how the ${evidence} matters in this wholly invented reliability scenario.`
  return {
    id: `q7-${scenario.shape}-marking-item-${sampleNumber}`,
    version: '1',
    title: `Q7 synthetic ${scenario.shape} marking input ${sampleNumber}`,
    componentId: componentId(scenario),
    questionFamilyId: familyId(scenario, sampleNumber),
    requirementIds: [requirement],
    knowledgeNodeIds: [nodeId(scenario)],
    format: scenario.format,
    command: scenario.command,
    maxMark: scenario.marks,
    questionWording: wording,
    subquestions: [{
      id: 'q1',
      command: scenario.command,
      wording,
      maxMark: scenario.marks,
      requirementIds: [requirement],
      responseDemands: [scenario.demand],
      coverageEvidence: [{ requirementId: requirement, evidence }],
    }],
  }
}

function markingInput(scenario: ShapeScenario, sampleNumber: number): MarkingPackInput {
  return {
    jobId: `q7-${scenario.shape}-marking-${sampleNumber}`,
    courseIdentity: courseIdentity(scenario),
    assessmentBlueprint: assessmentBlueprint(scenario, sampleNumber),
    questionFamily: questionFamily(scenario, sampleNumber),
    assessmentItem: deterministicAssessmentItem(scenario, sampleNumber),
    knowledgeNodes: knowledgeNodes(scenario),
  } as MarkingPackInput
}

function policies(): NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']> {
  return Object.fromEntries(scenarios.flatMap((scenario) => [1, 2].map((sampleNumber) => [
    familyId(scenario, sampleNumber),
    {
      requirementIds: [requirementId(scenario)],
      maxMark: scenario.marks,
      format: scenario.format,
    },
  ]))) as NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']>
}

function route(model: string): OpenAIModelRoute {
  return {
    model,
    inputUsdPerMillion: 2,
    cachedInputUsdPerMillion: 0.2,
    outputUsdPerMillion: 12,
    cacheWriteMultiplier: 1.25,
    longContextThresholdTokens: 272_000,
    longContextInputMultiplier: 2,
    longContextOutputMultiplier: 1.5,
    reasoningEffort: 'medium',
    maxOutputTokens: 4_000,
  }
}

function disposition(status: SampleStatus): SampleDisposition {
  if (status === 'success') return 'accepted'
  if (status === 'failure') return 'controlled_fail_closed'
  if (status === 'infrastructure_failure') return 'infrastructure_incident'
  return 'engineering_boundary_breach'
}

function executionRecord(input: {
  sampleId: string
  scenario: ShapeScenario
  workerBoundary: WorkerBoundary
  providerCallCount: number
  execution: Awaited<ReturnType<OpenAIModelAssistedWorkers['generateAssessmentItem']>> | Awaited<ReturnType<OpenAIModelAssistedWorkers['generateMarkingPack']>>
}): SampleRecord {
  const status = input.execution.status
  return {
    sampleId: input.sampleId,
    subjectShape: input.scenario.shape,
    workerBoundary: input.workerBoundary,
    providerCallCount: input.providerCallCount,
    repairCount: Math.max(0, input.providerCallCount - 1),
    status,
    disposition: disposition(status),
    provider: input.execution.provenance.provider,
    model: input.execution.provenance.model,
    contractVersion: input.execution.provenance.contractVersion,
    retryCount: input.execution.provenance.retryCount,
    ...(input.execution.provenance.usageCost === undefined ? {} : { usageCostUsd: input.execution.provenance.usageCost }),
    ...(status === 'success' ? {} : { error: input.execution.error }),
  }
}

function exceptionRecord(input: {
  sampleId: string
  scenario: ShapeScenario
  workerBoundary: WorkerBoundary
  providerCallCount: number
  error: unknown
}): SampleRecord {
  return {
    sampleId: input.sampleId,
    subjectShape: input.scenario.shape,
    workerBoundary: input.workerBoundary,
    providerCallCount: input.providerCallCount,
    repairCount: Math.max(0, input.providerCallCount - 1),
    status: 'runner_exception',
    disposition: 'engineering_boundary_breach',
    error: input.error instanceof Error ? input.error.message : String(input.error),
  }
}

describe('Reliability v2-E bounded live worker soak', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('samples production Assessment Item and Marking Pack boundaries across all five governed shapes', async () => {
    const apiKey = requiredEnv('OPENAI_API_KEY')
    const repository = requiredEnv('GITHUB_REPOSITORY')
    const contentHeadSha = requiredEnv('CONTENT_FACTORY_CONTENT_HEAD_SHA')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 5)
    const model = env.CONTENT_FACTORY_SOAK_MODEL?.trim() || 'gpt-5.6-terra'
    if (maxSpendUsd > 5) throw new Error(`q7_live_soak_ceiling_exceeds_governed_limit:${maxSpendUsd}`)

    const samples: SampleRecord[] = []
    let activeProviderCallCount = 0
    const trackedFetch: typeof fetch = async (input, init) => {
      activeProviderCallCount += 1
      return fetch(input, init)
    }
    const generation = route(model)
    const workers = createOpenAIModelAssistedWorkers({
      apiKey,
      generation,
      independentReview: generation,
      assessmentItemPolicies: policies(),
      maxSpendUsd,
      maxRetries: 0,
      fetchImpl: trackedFetch,
    })

    const runSample = async (
      scenario: ShapeScenario,
      workerBoundary: WorkerBoundary,
      sampleNumber: number,
    ) => {
      const sampleId = `${scenario.shape}-${workerBoundary}-${sampleNumber}`
      activeProviderCallCount = 0
      try {
        const execution = workerBoundary === 'assessment_item_generation'
          ? await workers.generateAssessmentItem(assessmentInput(scenario, sampleNumber))
          : await workers.generateMarkingPack(markingInput(scenario, sampleNumber))
        samples.push(executionRecord({
          sampleId,
          scenario,
          workerBoundary,
          providerCallCount: activeProviderCallCount,
          execution,
        }))
      } catch (error) {
        samples.push(exceptionRecord({
          sampleId,
          scenario,
          workerBoundary,
          providerCallCount: activeProviderCallCount,
          error,
        }))
      }
    }

    for (const scenario of scenarios) {
      await runSample(scenario, 'assessment_item_generation', 1)
      await runSample(scenario, 'assessment_item_generation', 2)
      await runSample(scenario, 'marking_pack_generation', 1)
      await runSample(scenario, 'marking_pack_generation', 2)
    }

    const knownUsageCostUsd = Number(samples.reduce((sum, sample) => sum + (sample.usageCostUsd ?? 0), 0).toFixed(8))
    const unpricedSampleCount = samples.filter((sample) => sample.usageCostUsd === undefined).length
    const controlledFailClosedSamples = samples.filter((sample) => sample.status === 'failure')
    const infrastructureIncidents = samples.filter((sample) => sample.status === 'infrastructure_failure')
    const engineeringBoundaryBreaches = samples.filter((sample) => sample.status === 'runner_exception')
    const automaticQ7PassCandidate = samples.length === governedSampleCount
      && controlledFailClosedSamples.length === 0
      && infrastructureIncidents.length === 0
      && engineeringBoundaryBreaches.length === 0
      && new Set(samples.map((sample) => sample.subjectShape)).size === q3SubjectShapeIds.length

    const evidence = {
      schemaVersion: 1,
      artifactType: 'content_factory_reliability_v2_q7_live_worker_soak_evidence',
      recordedAt: new Date().toISOString(),
      repository,
      contentHeadSha,
      providerModel: model,
      configuredMaxSpendUsd: maxSpendUsd,
      knownUsageCostUsd,
      unpricedSampleCount,
      plannedSampleCount: governedSampleCount,
      executedSampleCount: samples.length,
      samplesPerShape,
      subjectShapes: q3SubjectShapeIds,
      workerBoundaries: {
        assessment_item_generation: samples.filter((sample) => sample.workerBoundary === 'assessment_item_generation').length,
        marking_pack_generation: samples.filter((sample) => sample.workerBoundary === 'marking_pack_generation').length,
      },
      productionCompilerBoundary: 'createOpenAIModelAssistedWorkers',
      providerRetriesPerRequest: 0,
      targetedRepairsObserved: samples.reduce((sum, sample) => sum + sample.repairCount, 0),
      controlledFailClosedSampleIds: controlledFailClosedSamples.map((sample) => sample.sampleId),
      infrastructureIncidentSampleIds: infrastructureIncidents.map((sample) => sample.sampleId),
      engineeringBoundaryBreachSampleIds: engineeringBoundaryBreaches.map((sample) => sample.sampleId),
      automaticQ7PassCandidate,
      requiresEngineeringVsEducationalClassification: controlledFailClosedSamples.length > 0,
      fullCourseAssembly: false,
      learnerPublication: false,
      samples,
      limitations: [
        'Known usage cost is the sum of worker provenance where provider usage metadata is available; the production shared spend guard remains the hard US$5 control.',
        'A controlled fail-closed sample requires classification before Q7 can be called PASS because the Reliability Standard distinguishes genuine educational rejection from a new generic engineering contract class.',
        'This soak samples live provider variability at the two highest-risk generation boundaries and does not claim educational benchmark approval.',
      ],
    }

    await mkdir(evidenceDirectory, { recursive: true })
    await writeFile(`${evidenceDirectory}/q7-live-worker-soak-${contentHeadSha}.json`, JSON.stringify(evidence, null, 2), 'utf-8')

    expect(samples).toHaveLength(governedSampleCount)
    expect(new Set(samples.map((sample) => sample.subjectShape))).toEqual(new Set(q3SubjectShapeIds))
    for (const shape of q3SubjectShapeIds) {
      const shapeSamples = samples.filter((sample) => sample.subjectShape === shape)
      expect(shapeSamples).toHaveLength(samplesPerShape)
      expect(shapeSamples.filter((sample) => sample.workerBoundary === 'assessment_item_generation')).toHaveLength(2)
      expect(shapeSamples.filter((sample) => sample.workerBoundary === 'marking_pack_generation')).toHaveLength(2)
    }
    expect(knownUsageCostUsd).toBeLessThanOrEqual(maxSpendUsd)
    expect(engineeringBoundaryBreaches, 'Q7 runner exposed an unhandled engineering boundary breach; inspect uploaded evidence.').toEqual([])
    expect(infrastructureIncidents, 'Q7 live soak hit an infrastructure/provider incident; inspect evidence before retrying.').toEqual([])
    expect(controlledFailClosedSamples, 'Q7 live soak produced controlled fail-closed samples requiring engineering-vs-educational classification before PASS.').toEqual([])
    expect(automaticQ7PassCandidate).toBe(true)
  }, liveSoakTimeoutMs)
})
