import { describe, expect, it, vi } from 'vitest'
import matrixText from '../../content-factory/reliability-v2-c-adversarial-mutation-matrix.json?raw'
import {
  assessmentSubquestionSchema,
  validateStructuredAssessment,
  type AssessmentResponseDemand,
  type AssessmentSubquestion,
} from './assessment-integrity'
import {
  compileMarkingPackV2Candidate,
  createOpenAIModelAssistedWorkers,
  diagnoseMarkingPackV2Candidate,
  markingPackV2ProviderOutputSchema,
} from './openai-marking-pack-v2-compiler'
import { q3SubjectShapeIds, type Q3SubjectShapeId } from './q3-subject-shape-fixtures'

type ModelWorkers = ReturnType<typeof createOpenAIModelAssistedWorkers>
type MarkingPackInput = Parameters<ModelWorkers['generateMarkingPack']>[0]
type PracticeInput = Parameters<ModelWorkers['generatePracticeCollateral']>[0]

type ShapeDemand = {
  demand: AssessmentResponseDemand
  marks: number
  command: string
  alternativeCommand: string
}

type ShapeScenario = {
  shape: Q3SubjectShapeId
  subject: string
  qualification: string
  demands: ShapeDemand[]
  requiresApplication: boolean
}

type MutationMatrix = {
  schemaVersion: number
  workItem: string
  status: string
  baseMainSha: string
  requiredShapes: Q3SubjectShapeId[]
  mutationClasses: Array<{
    id: string
    expectedDisposition: string
    shapes: Q3SubjectShapeId[]
  }>
  mutationSeeds: number[]
  providerCallsRequired: boolean
  liveSoakIncluded: boolean
  historicalRecordsRewritten: boolean
  q3Passed: boolean
  overallReliabilityV2Passed: boolean
  nextWorkItem: string
}

const matrix = JSON.parse(matrixText) as MutationMatrix

const scenarios: ShapeScenario[] = [
  {
    shape: 'quantitative_business_economics',
    subject: 'Synthetic Economics',
    qualification: 'Synthetic Quantitative Certificate',
    requiresApplication: true,
    demands: [
      { demand: 'calculation', marks: 4, command: 'Calculate', alternativeCommand: 'Determine' },
      { demand: 'evaluation', marks: 6, command: 'Evaluate', alternativeCommand: 'Assess' },
    ],
  },
  {
    shape: 'mathematics',
    subject: 'Synthetic Mathematics',
    qualification: 'Synthetic Mathematics Certificate',
    requiresApplication: false,
    demands: [
      { demand: 'calculation', marks: 6, command: 'Calculate', alternativeCommand: 'Work out' },
    ],
  },
  {
    shape: 'science',
    subject: 'Synthetic Science',
    qualification: 'Synthetic Science Certificate',
    requiresApplication: true,
    demands: [
      { demand: 'calculation', marks: 4, command: 'Calculate', alternativeCommand: 'Determine' },
      { demand: 'analysis', marks: 6, command: 'Analyse', alternativeCommand: 'Explain' },
    ],
  },
  {
    shape: 'essay_humanities',
    subject: 'Synthetic History',
    qualification: 'Synthetic Humanities Certificate',
    requiresApplication: true,
    demands: [
      { demand: 'evaluation', marks: 12, command: 'Evaluate', alternativeCommand: 'Justify' },
    ],
  },
  {
    shape: 'language_prescribed_text',
    subject: 'Synthetic Language and Text',
    qualification: 'Synthetic Language Certificate',
    requiresApplication: true,
    demands: [
      { demand: 'analysis', marks: 10, command: 'Analyse', alternativeCommand: 'Explain' },
    ],
  },
]

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function workers(fetchImpl: typeof fetch) {
  return createOpenAIModelAssistedWorkers({
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
  })
}

function requirementId(scenario: ShapeScenario, index: number) {
  return `${scenario.shape}-requirement-${index + 1}`
}

function evidencePhrase(demand: AssessmentResponseDemand, index: number) {
  return `synthetic ${demand} evidence ${index + 1}`
}

function buildAssessment(scenario: ShapeScenario, alternative = false) {
  const subquestions: AssessmentSubquestion[] = scenario.demands.map((entry, index) => {
    const command = alternative ? entry.alternativeCommand : entry.command
    const evidence = evidencePhrase(entry.demand, index)
    return {
      id: `q${index + 1}`,
      command,
      wording: `${command} the ${evidence} for this invented ${scenario.subject} task.`,
      maxMark: entry.marks,
      requirementIds: [requirementId(scenario, index)],
      responseDemands: [entry.demand],
      coverageEvidence: [{
        requirementId: requirementId(scenario, index),
        evidence,
      }],
    }
  })
  return {
    itemId: `${scenario.shape}-item`,
    maxMark: scenario.demands.reduce((sum, entry) => sum + entry.marks, 0),
    governedRequirementIds: scenario.demands.map((_, index) => requirementId(scenario, index)),
    subquestions,
  }
}

function buildCrossReferenceAssessment(scenario: ShapeScenario) {
  const first = `${scenario.shape}-reference-a`
  const second = `${scenario.shape}-reference-b`
  return {
    itemId: `${scenario.shape}-cross-reference`,
    maxMark: 4,
    governedRequirementIds: [first, second],
    subquestions: [{
      id: 'q1',
      command: 'Explain',
      wording: 'Explain the first synthetic reference and the second synthetic reference.',
      maxMark: 4,
      requirementIds: [first, second],
      responseDemands: ['knowledge'] as AssessmentResponseDemand[],
      coverageEvidence: [
        { requirementId: first, evidence: 'first synthetic reference' },
        { requirementId: second, evidence: 'second synthetic reference' },
      ],
    }] satisfies AssessmentSubquestion[],
  }
}

function markingInput(scenario: ShapeScenario): MarkingPackInput {
  const assessment = buildAssessment(scenario)
  const maxMark = assessment.maxMark
  const hasCalculation = scenario.demands.some((entry) => entry.demand === 'calculation')
  const hasAnalysis = scenario.demands.some((entry) => entry.demand === 'analysis')
  const hasEvaluation = scenario.demands.some((entry) => entry.demand === 'evaluation')
  const format = hasCalculation
    ? (scenario.demands.length > 1 ? 'mixed' : 'calculation')
    : (scenario.requiresApplication ? 'case_question' : 'written_question')

  return {
    jobId: `v2-c-${scenario.shape}`,
    courseIdentity: {
      subject: scenario.subject,
      qualification: scenario.qualification,
      awardingBody: 'Synthetic Reliability Board',
      specificationId: `v2-c-${scenario.shape}`,
    },
    assessmentBlueprint: {
      schemaVersion: 1,
      jobId: `v2-c-${scenario.shape}`,
      fingerprint: `blueprint-${scenario.shape}`,
      boardAlignmentFingerprint: `board-${scenario.shape}`,
      assessmentObjectives: [{ id: 'ao1' }],
      components: [{
        componentId: 'paper-1',
        questionFamilyIds: [`family-${scenario.shape}`],
        markTotal: maxMark,
        timingMinutes: 30,
        constraints: [],
      }],
      quantitativeRequirements: hasCalculation ? ['synthetic quantitative requirement'] : [],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: [],
    },
    questionFamily: {
      schemaVersion: 1,
      id: `family-${scenario.shape}`,
      title: `Synthetic ${scenario.shape} family`,
      assessmentObjectiveIds: ['ao1'],
      skillProfile: scenario.demands.map((entry) => entry.demand),
      componentScope: ['paper-1'],
      markRange: { min: maxMark, max: maxMark },
      responseShape: 'Synthetic structured response',
      contextRequirements: scenario.requiresApplication ? ['Use the supplied synthetic context.'] : [],
      applicationRequirements: scenario.requiresApplication ? ['Apply reasoning to the supplied synthetic context.'] : [],
      analysisRequirements: hasAnalysis ? ['Develop supported analysis.'] : [],
      evaluationRequirements: hasEvaluation ? ['Reach a supported judgement.'] : [],
      commonFailureModes: [],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated',
    },
    assessmentItem: {
      id: `${scenario.shape}-item`,
      version: '1',
      title: `Synthetic ${scenario.shape} assessment item`,
      componentId: 'paper-1',
      questionFamilyId: `family-${scenario.shape}`,
      requirementIds: assessment.governedRequirementIds,
      knowledgeNodeIds: assessment.governedRequirementIds.map((id) => `node-${id}`),
      format,
      command: 'Complete',
      maxMark,
      questionWording: 'Complete every synthetic subquestion.',
      subquestions: assessment.subquestions,
    },
    knowledgeNodes: assessment.governedRequirementIds.map((id) => ({
      id: `node-${id}`,
      kind: 'concept',
      summary: `Synthetic knowledge for ${id}.`,
      formulas: [],
      misconceptions: [],
      applicationContexts: [],
      depth: 'core',
      evidenceTypes: ['synthetic'],
    })),
  } as MarkingPackInput
}

function rubricLevels(demand: AssessmentResponseDemand) {
  if (demand === 'calculation') {
    return [
      { descriptor: 'Limited valid method or working with material errors.' },
      { descriptor: 'Valid method with an accurate answer; allow consequential follow-through where appropriate.' },
    ]
  }
  if (demand === 'analysis') {
    return [
      { descriptor: 'Limited analysis with weak development.' },
      { descriptor: 'Developed analysis using relevant support.' },
    ]
  }
  if (demand === 'evaluation') {
    return [
      { descriptor: 'Limited evaluation with weak support.' },
      { descriptor: 'Well-supported evaluation reaching a justified judgement.' },
    ]
  }
  return [
    { descriptor: 'Limited relevant response.' },
    { descriptor: 'Clear and accurate relevant response.' },
  ]
}

function validMarkingCandidate(scenario: ShapeScenario) {
  const input = markingInput(scenario)
  return {
    subquestionGuidance: input.assessmentItem.subquestions.map((subquestion) => ({
      subquestionId: subquestion.id,
      rewardedDemands: [...subquestion.responseDemands],
      assessmentObjectiveAllocation: [{ objectiveId: 'ao1', marks: subquestion.maxMark }],
      answerRequirements: [`Credit a valid ${subquestion.responseDemands[0]} response.`],
    })),
    rubricGuidance: input.assessmentItem.subquestions.map((subquestion) => ({
      subquestionId: subquestion.id,
      levels: rubricLevels(subquestion.responseDemands[0]),
    })),
    applicationRequirements: [...input.questionFamily.applicationRequirements],
    analysisRequirements: [...input.questionFamily.analysisRequirements],
    evaluationRequirements: [...input.questionFamily.evaluationRequirements],
    validReasoningRoutes: ['Any valid route satisfying the stated demand.'],
    indicativeContent: ['Synthetic indicative content only.'],
    misconceptions: ['Do not reward contradictory reasoning.'],
    diagnosticFeedbackRules: ['Identify the weakest rewarded demand first.'],
    improvementActions: ['Improve the weakest rewarded demand and try a fresh variant.'],
    ambiguityPolicy: 'Escalate genuine ambiguity rather than inventing precision.',
    confidencePolicy: 'Do not overstate confidence.',
  }
}

function simultaneousDefectCandidate(scenario: ShapeScenario) {
  const input = markingInput(scenario)
  const candidate = clone(validMarkingCandidate(scenario))
  const firstGuidance = candidate.subquestionGuidance[0]
  firstGuidance.assessmentObjectiveAllocation = [{ objectiveId: 'ao1', marks: 0 }]
  candidate.subquestionGuidance.push(clone(firstGuidance))

  if (input.questionFamily.applicationRequirements.length > 0) candidate.applicationRequirements = []
  if (input.questionFamily.analysisRequirements.length > 0) candidate.analysisRequirements = []
  if (input.questionFamily.evaluationRequirements.length > 0) candidate.evaluationRequirements = []

  const firstSubquestion = input.assessmentItem.subquestions[0]
  candidate.rubricGuidance[0].levels = [{ descriptor: 'Some plausible response.' }]
  if (!firstSubquestion.responseDemands.includes('calculation') && firstSubquestion.maxMark < 6) {
    candidate.rubricGuidance[0].levels = [
      { descriptor: 'Same quality.' },
      { descriptor: 'Same quality.' },
    ]
  }
  return candidate
}

function practiceInput(scenario: ShapeScenario): PracticeInput {
  return {
    jobId: `v2-c-practice-${scenario.shape}`,
    courseIdentity: {
      subject: scenario.subject,
      qualification: scenario.qualification,
      awardingBody: 'Synthetic Reliability Board',
      specificationId: `v2-c-${scenario.shape}`,
    },
    workUnit: {
      id: `practice-${scenario.shape}`,
      title: `Synthetic ${scenario.subject} practice`,
      requirementIds: [`${scenario.shape}-practice`],
      knowledgeNodeIds: [`node-${scenario.shape}-practice`],
      learningModes: ['short_answer'],
      requiredOutputs: ['practice'],
      scope: 'course',
      componentIds: [],
    },
    knowledgeModelFingerprint: `knowledge-${scenario.shape}`,
    requiredTeachingPoints: ['first teaching point', 'second teaching point'],
    knowledgeNodes: [{
      id: `node-${scenario.shape}-practice`,
      kind: 'concept',
      summary: `Synthetic ${scenario.subject} practice knowledge.`,
      formulas: [],
      misconceptions: [],
      applicationContexts: [],
      depth: 'core',
      evidenceTypes: ['synthetic'],
    }],
  } as PracticeInput
}

function practiceProviderOutput(invalidSecondLocator = false) {
  return {
    title: 'Synthetic practice',
    instructions: 'Answer the short question and review the explanation.',
    activitiesByMode: {
      short_answer: [{
        prompt: 'Explain the first teaching point using the synthetic material.',
        expectedResponse: 'A valid synthetic response.',
        explanation: 'The second teaching point is explained here using exact generated text.',
        improvementAction: 'Revisit both teaching points before another attempt.',
      }],
    },
    coverageEvidence: [
      {
        teachingPoint: 'first teaching point',
        location: { mode: 'short_answer', activityIndex: 1, field: 'prompt' },
      },
      {
        teachingPoint: 'second teaching point',
        location: { mode: 'short_answer', activityIndex: invalidSecondLocator ? 2 : 1, field: 'explanation' },
      },
    ],
  }
}

const requiredMutationClasses = [
  'blank_whitespace_malformed_optional',
  'duplicate_missing_reordered_references',
  'inconsistent_totals',
  'compiler_owned_mark_bands',
  'simultaneous_marking_defects',
  'mixed_bounded_locators',
  'plausible_model_phrasing',
  'exact_evidence_paraphrase',
  'demand_metadata_mismatch',
  'complete_diagnostic_single_repair',
  'repair_failure_fail_closed',
  'valid_output_no_extra_call',
]

describe('Reliability v2-C adversarial provider-free mutation matrix', () => {
  it('locks all governed shapes and mutation classes without prematurely claiming Q3 or overall v2 PASS', () => {
    expect(matrix.schemaVersion).toBe(1)
    expect(matrix.workItem).toBe('V2-C')
    expect(matrix.status).toBe('implemented_pending_v2_d_same_head_qualification')
    expect(matrix.baseMainSha).toBe('e5dbef58ab10ffca7c118048b294f2dc8eef5d37')
    expect(new Set(matrix.requiredShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(new Set(matrix.mutationClasses.map((entry) => entry.id))).toEqual(new Set(requiredMutationClasses))
    expect(matrix.mutationSeeds).toEqual([17, 41, 73, 101, 149])
    expect(matrix.providerCallsRequired).toBe(false)
    expect(matrix.liveSoakIncluded).toBe(false)
    expect(matrix.historicalRecordsRewritten).toBe(false)
    expect(matrix.q3Passed).toBe(false)
    expect(matrix.overallReliabilityV2Passed).toBe(false)
    expect(matrix.nextWorkItem).toBe('V2-D')
    for (const mutation of matrix.mutationClasses) {
      expect(new Set(mutation.shapes)).toEqual(new Set(q3SubjectShapeIds))
      expect(mutation.expectedDisposition.length).toBeGreaterThan(5)
    }
  })

  it.each(scenarios)('accepts valid and plausible alternative command phrasing for $shape', (scenario) => {
    expect(() => validateStructuredAssessment(buildAssessment(scenario))).not.toThrow()
    expect(() => validateStructuredAssessment(buildAssessment(scenario, true))).not.toThrow()
  })

  it.each(scenarios)('rejects blank and malformed assessment values while permitting omitted optional fields for $shape', (scenario) => {
    const baseline = buildAssessment(scenario).subquestions[0]
    expect(assessmentSubquestionSchema.safeParse({ ...baseline, command: '   ' }).success).toBe(false)
    expect(assessmentSubquestionSchema.safeParse({ ...baseline }).success).toBe(true)
    expect(assessmentSubquestionSchema.safeParse({ ...baseline, options: 'not-an-array' }).success).toBe(false)
  })

  it.each(scenarios)('rejects duplicate/missing references but preserves harmless reordering for $shape', (scenario) => {
    const baseline = buildCrossReferenceAssessment(scenario)
    const reordered = clone(baseline)
    reordered.subquestions[0].requirementIds.reverse()
    reordered.subquestions[0].coverageEvidence.reverse()
    expect(() => validateStructuredAssessment(reordered)).not.toThrow()

    const duplicated = clone(baseline)
    duplicated.subquestions[0].requirementIds.push(duplicated.subquestions[0].requirementIds[0])
    expect(() => validateStructuredAssessment(duplicated)).toThrow(/repeat requirement IDs/i)

    const missing = clone(baseline)
    missing.subquestions[0].coverageEvidence.pop()
    expect(() => validateStructuredAssessment(missing)).toThrow(/coverage evidence must match/i)
  })

  it.each(scenarios)('rejects paraphrased exact evidence, demand mismatch and inconsistent totals for $shape', (scenario) => {
    const paraphrased = buildAssessment(scenario)
    paraphrased.subquestions[0].coverageEvidence[0].evidence = 'a paraphrased synthetic reference that is not an exact excerpt'
    expect(() => validateStructuredAssessment(paraphrased)).toThrow(/exact question excerpt/i)

    const demandMismatch = buildAssessment(scenario)
    demandMismatch.subquestions[0].command = 'State'
    demandMismatch.subquestions[0].wording = `State the ${evidencePhrase(scenario.demands[0].demand, 0)} for this invented task.`
    expect(() => validateStructuredAssessment(demandMismatch)).toThrow(/does not ask for rewarded demand/i)

    const inconsistentTotal = buildAssessment(scenario)
    inconsistentTotal.maxMark += 1
    expect(() => validateStructuredAssessment(inconsistentTotal)).toThrow(/subquestion marks total/i)
  })

  it.each(scenarios)('keeps numeric rubric mechanics compiler-owned and contiguous for $shape', (scenario) => {
    const input = markingInput(scenario)
    const candidate = validMarkingCandidate(scenario)
    expect(diagnoseMarkingPackV2Candidate(candidate, input)).toEqual([])

    expect(markingPackV2ProviderOutputSchema.safeParse({
      ...candidate,
      rubric: [{ id: 'provider-band', descriptor: 'Provider-authored numeric band.', minMark: 0, maxMark: 1 }],
    }).success).toBe(false)

    const whitespace = clone(candidate)
    whitespace.subquestionGuidance[0].answerRequirements = ['   ']
    expect(markingPackV2ProviderOutputSchema.safeParse(whitespace).success).toBe(false)

    const malformed = { ...candidate, rubricGuidance: 'not-an-array' }
    expect(markingPackV2ProviderOutputSchema.safeParse(malformed).success).toBe(false)

    const reordered = clone(candidate)
    reordered.subquestionGuidance.reverse()
    reordered.rubricGuidance.reverse()
    expect(diagnoseMarkingPackV2Candidate(reordered, input)).toEqual([])

    const compiled = compileMarkingPackV2Candidate(reordered, input)
    for (const subquestion of input.assessmentItem.subquestions) {
      const bands = compiled.rubric.filter((entry) => entry.id.startsWith(`${subquestion.id}-level-`))
      expect(bands.length).toBeGreaterThan(0)
      expect(bands[0].minMark).toBe(0)
      expect(bands.at(-1)?.maxMark).toBe(subquestion.maxMark)
      for (let index = 1; index < bands.length; index += 1) {
        expect(bands[index].minMark).toBe(bands[index - 1].maxMark + 1)
      }
    }
  })

  it.each(scenarios)('collects simultaneous actionable Marking Pack defects for $shape', (scenario) => {
    const input = markingInput(scenario)
    const diagnostics = diagnoseMarkingPackV2Candidate(simultaneousDefectCandidate(scenario), input)
    const codes = diagnostics.map((entry) => entry.code)
    expect(codes).toContain('MARKING_SUBQUESTION_GUIDANCE_DUPLICATE')
    expect(codes).toContain('MARKING_SUBQUESTION_AO_TOTAL_MISMATCH')
    if (scenario.demands.some((entry) => entry.demand === 'calculation')) {
      expect(codes).toContain('MARKING_CALCULATION_METHOD_TREATMENT_MISSING')
      expect(codes).toContain('MARKING_CALCULATION_ACCURACY_TREATMENT_MISSING')
    }
    if (scenario.requiresApplication) expect(codes).toContain('MARKING_APPLICATION_DEMAND_DROPPED')
    if (scenario.demands.some((entry) => entry.demand === 'analysis')) expect(codes).toContain('MARKING_ANALYSIS_DEMAND_DROPPED')
    if (scenario.demands.some((entry) => entry.demand === 'evaluation')) expect(codes).toContain('MARKING_EVALUATION_DEMAND_DROPPED')
    expect(new Set(codes).size).toBeGreaterThanOrEqual(3)
  })

  it.each(scenarios)('uses one provider call for valid Marking Pack output for $shape', async (scenario) => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(validMarkingCandidate(scenario))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch
    const result = await workers(fetchImpl).generateMarkingPack(markingInput(scenario))
    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it.each(scenarios)('sends the complete diagnostic set in one targeted repair for $shape', async (scenario) => {
    const input = markingInput(scenario)
    const invalid = simultaneousDefectCandidate(scenario)
    const expectedCodes = [...new Set(diagnoseMarkingPackV2Candidate(invalid, input).map((entry) => entry.code))]
    let call = 0
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      call += 1
      if (call === 1) {
        return new Response(JSON.stringify(responseBody(invalid)), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const body = JSON.parse(String(init?.body)) as { instructions: string }
      for (const code of expectedCodes) expect(body.instructions).toContain(code)
      return new Response(JSON.stringify(responseBody(validMarkingCandidate(scenario))), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch

    const result = await workers(fetchImpl).generateMarkingPack(input)
    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    if (result.status === 'success') expect(result.provenance.retryCount).toBe(1)
  })

  it.each(scenarios)('fails closed after the one permitted repair for $shape', async (scenario) => {
    const invalid = simultaneousDefectCandidate(scenario)
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalid)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await workers(fetchImpl).generateMarkingPack(markingInput(scenario))
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected bounded repair failure')
    expect(result.error).toContain('marking_pack_v2_after_complete_diagnostic_repair')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it.each(scenarios)('resolves valid bounded locators with no retry for $shape', async (scenario) => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(practiceProviderOutput(false))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch
    const result = await workers(fetchImpl).generatePracticeCollateral(practiceInput(scenario))
    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    if (result.status === 'success') expect(result.output.coverageEvidence).toHaveLength(2)
  })

  it.each(scenarios)('rejects a mixed valid/invalid bounded locator set without retry for $shape', async (scenario) => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(practiceProviderOutput(true))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch
    const result = await workers(fetchImpl).generatePracticeCollateral(practiceInput(scenario))
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected invalid locator failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
