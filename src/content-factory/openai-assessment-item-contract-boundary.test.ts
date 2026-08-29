import { describe, expect, it, vi } from 'vitest'
import { assessmentSubquestionSchema } from './assessment-integrity'
import {
  assessmentItemRepairCandidateProviderSchema,
} from './openai-assessment-item-contract-boundary'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import { q3SubjectShapeIds, type Q3SubjectShapeId } from './q3-subject-shape-fixtures'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

type ShapeScenario = {
  shape: Q3SubjectShapeId
  subject: string
  command: 'Calculate' | 'Analyse' | 'Evaluate'
  demand: 'calculation' | 'analysis' | 'evaluation'
  marks: number
}

type RepairableField = 'maxMark' | 'requirementIds' | 'coverageEvidence'

const scenarios: ShapeScenario[] = [
  { shape: 'quantitative_business_economics', subject: 'Synthetic Economics', command: 'Calculate', demand: 'calculation', marks: 4 },
  { shape: 'mathematics', subject: 'Synthetic Mathematics', command: 'Calculate', demand: 'calculation', marks: 6 },
  { shape: 'science', subject: 'Synthetic Science', command: 'Analyse', demand: 'analysis', marks: 6 },
  { shape: 'essay_humanities', subject: 'Synthetic History', command: 'Evaluate', demand: 'evaluation', marks: 12 },
  { shape: 'language_prescribed_text', subject: 'Synthetic Language and Text', command: 'Analyse', demand: 'analysis', marks: 10 },
]

const omissionSets: RepairableField[][] = [
  ['maxMark'],
  ['requirementIds'],
  ['coverageEvidence'],
  ['maxMark', 'requirementIds', 'coverageEvidence'],
]

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function requirementId(scenario: ShapeScenario) {
  return `${scenario.shape}-requirement`
}

function familyId(scenario: ShapeScenario) {
  return `family-${scenario.shape}`
}

function evidencePhrase(scenario: ShapeScenario) {
  return `synthetic ${scenario.shape.replaceAll('_', ' ')} evidence`
}

function validProviderOutput(scenario: ShapeScenario) {
  const evidence = evidencePhrase(scenario)
  const wording = `${scenario.command} the ${evidence} using only the supplied synthetic material.`
  return {
    id: `item-${scenario.shape}`,
    version: '1',
    title: `${scenario.subject} reliability item`,
    knowledgeNodeIds: [`node-${scenario.shape}`],
    command: scenario.command,
    questionWording: wording,
    subquestions: [{
      id: 'q1',
      command: scenario.command,
      wording,
      maxMark: scenario.marks,
      requirementIds: [requirementId(scenario)],
      responseDemands: [scenario.demand],
      coverageEvidence: [{
        requirementId: requirementId(scenario),
        evidence,
      }],
    }],
  }
}

function withOmissions(scenario: ShapeScenario, fields: RepairableField[]) {
  const output = validProviderOutput(scenario)
  const subquestion = { ...output.subquestions[0] } as Record<string, unknown>
  for (const field of fields) delete subquestion[field]
  return { ...output, subquestions: [subquestion] }
}

function assessmentInput(scenario: ShapeScenario) {
  const requirement = requirementId(scenario)
  const family = familyId(scenario)
  return {
    jobId: `q7-replay-${scenario.shape}`,
    courseIdentity: {
      subject: scenario.subject,
      qualification: 'Synthetic Reliability Qualification',
      awardingBody: 'Synthetic Reliability Board',
      specificationId: `q7-replay-${scenario.shape}`,
    },
    assessmentBlueprint: {
      schemaVersion: 1 as const,
      jobId: `q7-replay-${scenario.shape}`,
      fingerprint: `assessment-blueprint-${scenario.shape}`,
      boardAlignmentFingerprint: `board-${scenario.shape}`,
      assessmentObjectives: [{ id: 'ao1' }],
      components: [{
        componentId: 'paper-1',
        questionFamilyIds: [family],
        markTotal: scenario.marks,
        timingMinutes: 30,
        constraints: [],
      }],
      quantitativeRequirements: scenario.demand === 'calculation' ? ['Use synthetic quantitative reasoning.'] : [],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: [],
    },
    questionFamily: {
      schemaVersion: 1 as const,
      id: family,
      title: `${scenario.subject} synthetic family`,
      assessmentObjectiveIds: ['ao1'],
      skillProfile: [scenario.demand],
      componentScope: ['paper-1'],
      markRange: { min: scenario.marks, max: scenario.marks },
      responseShape: `Synthetic ${scenario.demand} response`,
      contextRequirements: [],
      applicationRequirements: [],
      analysisRequirements: scenario.demand === 'analysis' ? ['Develop supported analysis.'] : [],
      evaluationRequirements: scenario.demand === 'evaluation' ? ['Reach a supported judgement.'] : [],
      commonFailureModes: [],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated' as const,
    },
    targetComponentId: 'paper-1',
    knowledgeNodes: [{
      id: `node-${scenario.shape}`,
      kind: scenario.demand === 'calculation' ? 'formula' as const : 'concept' as const,
      summary: `Synthetic knowledge for ${scenario.subject}.`,
      formulas: scenario.demand === 'calculation' ? ['synthetic result = input × 2'] : [],
      misconceptions: [],
      applicationContexts: [],
      depth: 'core' as const,
      evidenceTypes: [scenario.demand],
    }],
    examPrepRequirements: [{
      requirementId: requirement,
      requirementSummary: `Demonstrate ${scenario.demand} for ${scenario.subject}.`,
      skillsOrKnowledge: [scenario.demand],
      componentScope: ['paper-1'],
      revisionArea: 'Synthetic reliability area',
    }],
  }
}

function workersFor(scenario: ShapeScenario, fetchImpl: typeof fetch) {
  return createOpenAIModelAssistedWorkers({
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
    assessmentItemPolicies: {
      [familyId(scenario)]: {
        requirementIds: [requirementId(scenario)],
        maxMark: scenario.marks,
        format: scenario.demand === 'calculation' ? 'calculation' as const : 'written_question' as const,
      },
    },
  })
}

const repairCases = scenarios.flatMap((scenario) => omissionSets.map((fields) => ({ scenario, fields })))

describe('Assessment Item Q7 provider-contract repair boundary', () => {
  it('covers exactly the five governed subject shapes', () => {
    expect(new Set(scenarios.map((scenario) => scenario.shape))).toEqual(new Set(q3SubjectShapeIds))
  })

  it('keeps the three Q7 fields model-owned while allowing omission to reach deterministic diagnostics', () => {
    const scenario = scenarios[0]
    const incomplete = withOmissions(scenario, ['maxMark', 'requirementIds', 'coverageEvidence'])
    expect(assessmentItemRepairCandidateProviderSchema.safeParse(incomplete).success).toBe(true)
    expect(assessmentSubquestionSchema.safeParse(incomplete.subquestions[0]).success).toBe(false)
  })

  it.each(repairCases)(
    'repairs one bounded $scenario.shape candidate with omitted $fields',
    async ({ scenario, fields }) => {
      let call = 0
      const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        call += 1
        if (call === 1) {
          return new Response(JSON.stringify(responseBody(withOmissions(scenario, fields))), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const body = JSON.parse(String(init?.body)) as { input: string }
        const payload = JSON.parse(body.input) as {
          questionFamily: { responseShape: string }
          assessmentBlueprint: { evidenceExpectations: string[] }
        }
        const repairContext = `${payload.questionFamily.responseShape} ${payload.assessmentBlueprint.evidenceExpectations.join(' ')}`
        expect(repairContext).toContain('TARGETED CONTRACT REPAIR REQUIRED')
        for (const field of fields) expect(repairContext).toContain(field)

        return new Response(JSON.stringify(responseBody(validProviderOutput(scenario))), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }) as typeof fetch

      const result = await workersFor(scenario, fetchImpl).generateAssessmentItem(assessmentInput(scenario))

      expect(result.status).toBe('success')
      expect(fetchImpl).toHaveBeenCalledTimes(2)
      if (result.status !== 'success') throw new Error(result.error)
      expect(result.provenance.retryCount).toBe(1)
      expect(result.provenance.contractVersion).toBe('3')
      const output = result.output as { subquestions: Array<Record<string, unknown>> }
      expect(output.subquestions[0]).toMatchObject({
        maxMark: scenario.marks,
        requirementIds: [requirementId(scenario)],
      })
      expect(output.subquestions[0].coverageEvidence).toEqual([{
        requirementId: requirementId(scenario),
        evidence: evidencePhrase(scenario),
      }])
    },
  )

  it.each(scenarios)('uses no repair call for complete $shape output', async (scenario) => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(validProviderOutput(scenario))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await workersFor(scenario, fetchImpl).generateAssessmentItem(assessmentInput(scenario))

    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    if (result.status === 'success') expect(result.provenance.retryCount).toBe(0)
  })

  it.each(scenarios)('fails closed after the one permitted simultaneous-omission repair for $shape', async (scenario) => {
    const incomplete = withOmissions(scenario, ['maxMark', 'requirementIds', 'coverageEvidence'])
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(incomplete)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await workersFor(scenario, fetchImpl).generateAssessmentItem(assessmentInput(scenario))

    expect(result.status).toBe('failure')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    if (result.status !== 'failure') throw new Error('Expected Assessment Item repair failure')
    expect(result.error).toContain('assessment_item_compilation_after_targeted_repair')
    expect(result.error).toContain('maxMark')
    expect(result.error).toContain('requirementIds')
    expect(result.error).toContain('coverageEvidence')
  })
})
