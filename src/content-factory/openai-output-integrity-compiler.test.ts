import { describe, expect, it, vi } from 'vitest'
import {
  canonicaliseKnownMathematicalFormulas,
  createOpenAIModelAssistedWorkers,
  rebalanceMcqCorrectAnswerPositions,
  validateMcqCorrectAnswerDistribution,
  validateOperationalRubricCoverage,
} from './openai-output-integrity-compiler'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function mcqSubquestion(index: number) {
  const id = `q${index + 1}`
  return {
    id,
    command: 'Choose',
    wording: `Choose the correct answer for ${id}.`,
    maxMark: 1,
    requirementIds: ['requirement'],
    responseDemands: ['selection'] as const,
    coverageEvidence: [{ requirementId: 'requirement', evidence: `correct answer for ${id}` }],
    options: [
      { label: 'A' as const, text: `Correct ${id}`, correct: true },
      { label: 'B' as const, text: `Distractor B ${id}`, correct: false, misconceptionBasis: 'Confuses the first concept.' },
      { label: 'C' as const, text: `Distractor C ${id}`, correct: false, misconceptionBasis: 'Confuses the second concept.' },
      { label: 'D' as const, text: `Distractor D ${id}`, correct: false, misconceptionBasis: 'Confuses the third concept.' },
    ],
  }
}

function assessmentItem(subquestions: unknown[]) {
  return {
    id: 'assessment-item',
    version: '1',
    title: 'Assessment item',
    componentId: 'paper-1',
    questionFamilyId: 'family',
    requirementIds: ['requirement'],
    knowledgeNodeIds: ['requirement'],
    format: 'mixed' as const,
    command: 'Complete',
    maxMark: subquestions.reduce<number>((sum, entry) => sum + Number((entry as { maxMark: number }).maxMark), 0),
    questionWording: 'Complete all subquestions.',
    subquestions,
  }
}

function learningInput() {
  return {
    jobId: 'language-job',
    courseIdentity: {
      subject: 'Synthetic Language and Text',
      qualification: 'Synthetic Language Certificate',
      awardingBody: 'Test Board',
      specificationId: 'language-1',
    },
    workUnit: {
      id: 'language-analysis',
      title: 'Language analysis',
      requirementIds: ['language-analysis'],
      knowledgeNodeIds: ['language-analysis'],
      learningModes: ['explanation'] as Array<'explanation'>,
      requiredOutputs: ['learning'] as Array<'learning'>,
      scope: 'course' as const,
      componentIds: [],
    },
    knowledgeModelFingerprint: 'knowledge-v1',
    requiredTeachingPoints: ['recognise a target-language greeting'],
    knowledgeNodes: [{
      id: 'language-analysis',
      kind: 'concept' as const,
      summary: 'Recognise and analyse language choices.',
      formulas: [],
      misconceptions: [],
      applicationContexts: ['multilingual text'],
      depth: 'core' as const,
      evidenceTypes: ['textual analysis'],
    }],
  }
}

function practiceInput() {
  return {
    jobId: 'generic-practice-job',
    courseIdentity: {
      subject: 'Synthetic Science',
      qualification: 'Synthetic Certificate',
      awardingBody: 'Test Board',
      specificationId: 'science-1',
    },
    workUnit: {
      id: 'condition-check',
      title: 'Condition check',
      requirementIds: ['condition-check'],
      knowledgeNodeIds: ['condition-check'],
      learningModes: ['retrieval'] as Array<'retrieval'>,
      requiredOutputs: ['practice'] as Array<'practice'>,
      scope: 'course' as const,
      componentIds: [],
    },
    knowledgeModelFingerprint: 'knowledge-v1',
    requiredTeachingPoints: ['determine whether a condition is met'],
    knowledgeNodes: [{
      id: 'condition-check',
      kind: 'concept' as const,
      summary: 'Determine whether evidence supports a stated condition.',
      formulas: [],
      misconceptions: [],
      applicationContexts: ['generic evidence set'],
      depth: 'core' as const,
      evidenceTypes: ['reasoning'],
    }],
  }
}

describe('post-Pilot-16 output integrity', () => {
  it('canonicalises the ambiguous percentage-change formula without changing other formulas', () => {
    const model = canonicaliseKnownMathematicalFormulas({
      schemaVersion: 1,
      jobId: 'job',
      fingerprint: 'fingerprint',
      nodes: [{
        id: 'quantitative-business-skills',
        kind: 'formula',
        summary: 'Quantitative business skills',
        formulas: [
          'percentage change (%) = new value - original value / original value × 100',
          'profit = total revenue - total costs',
        ],
        sourceRefs: ['source'],
        evidenceTypes: ['structured_fact'],
      }],
    })

    expect(model.nodes[0].formulas).toEqual([
      'percentage change (%) = ((new value - original value) / original value) × 100',
      'profit = total revenue - total costs',
    ])
  })

  it('rebalances a mechanically biased ten-question MCQ key without changing answer content', () => {
    const item = assessmentItem(Array.from({ length: 10 }, (_, index) => mcqSubquestion(index)))
    expect(() => validateMcqCorrectAnswerDistribution(item)).toThrow(/all four option positions/)

    const balanced = rebalanceMcqCorrectAnswerPositions(item)
    const labels = validateMcqCorrectAnswerDistribution(balanced)
    expect(labels).toEqual(['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'])
    expect(balanced.subquestions.map((subquestion) => subquestion.options?.find((option) => option.correct)?.text)).toEqual(
      Array.from({ length: 10 }, (_, index) => `Correct q${index + 1}`),
    )
  })

  it('preserves legitimate target-language script while carrying a generic anti-contamination guardrail', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string }
      const input = JSON.parse(body.input) as { outputIntegrityGuidance?: string }
      expect(input.outputIntegrityGuidance).toContain('Preserve legitimate target-language')
      expect(input.outputIntegrityGuidance).toContain('never delete or rewrite valid learner content')

      return new Response(JSON.stringify(responseBody({
        title: 'Target-language greeting',
        introduction: 'Analyse the supplied multilingual example.',
        sections: [{
          title: 'Greeting',
          explanation: 'The target-language form should be preserved exactly.',
          keyPoints: ['Recognise the greeting Привет'],
        }],
        misconceptions: [],
        nextAction: 'Compare the greeting with another example.',
        coverageEvidence: [{
          teachingPoint: 'recognise a target-language greeting',
          location: { area: 'section_key_point', itemIndex: 1, detailIndex: 1 },
        }],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    }).generateLearningCollateral(learningInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as {
      sections: Array<{ keyPoints: string[] }>
      coverageEvidence: Array<{ evidence: string }>
    }
    expect(output.sections[0].keyPoints[0]).toBe('Recognise the greeting Привет')
    expect(output.coverageEvidence[0].evidence).toBe('Recognise the greeting Привет')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('uses a course-agnostic prompt/answer consistency guardrail rather than a Business-shaped phrase repair', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string }
      const input = JSON.parse(body.input) as { outputIntegrityGuidance?: string }
      expect(input.outputIntegrityGuidance).toContain('internally consistent with its own expectedResponse')
      expect(input.outputIntegrityGuidance).toContain('phrase the task conditionally')
      expect(input.outputIntegrityGuidance?.toLowerCase()).not.toContain('cash deficit')
      expect(input.outputIntegrityGuidance?.toLowerCase()).not.toContain('business')

      return new Response(JSON.stringify(responseBody({
        title: 'Evidence check',
        instructions: 'Use the supplied evidence.',
        activitiesByMode: {
          retrieval: [{
            prompt: 'Determine whether the stated condition is met. If it is, identify the supporting evidence.',
            expectedResponse: 'The condition is not met by the supplied evidence.',
            explanation: 'The available evidence does not establish the condition.',
            improvementAction: 'Check what the evidence actually establishes before assuming the result.',
          }],
        },
        coverageEvidence: [{
          teachingPoint: 'determine whether a condition is met',
          location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' },
        }],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    }).generatePracticeCollateral(practiceInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as { activities: Array<{ prompt: string; expectedResponse: string }> }
    expect(output.activities[0].prompt).toContain('Determine whether')
    expect(output.activities[0].expectedResponse).toContain('not met')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('requires operational rubric coverage for every structured subquestion', () => {
    const item = assessmentItem([
      {
        id: 'calc',
        command: 'Calculate',
        wording: 'Calculate the contribution.',
        maxMark: 4,
        requirementIds: ['requirement'],
        responseDemands: ['calculation'],
        coverageEvidence: [{ requirementId: 'requirement', evidence: 'Calculate the contribution' }],
      },
      {
        id: 'eval',
        command: 'Evaluate',
        wording: 'Evaluate the options.',
        maxMark: 6,
        requirementIds: ['requirement'],
        responseDemands: ['evaluation'],
        coverageEvidence: [{ requirementId: 'requirement', evidence: 'Evaluate the options' }],
      },
    ])
    const basePack = {
      assessmentObjectiveAllocation: [],
      subquestionGuidance: [],
      applicationRequirements: [],
      analysisRequirements: [],
      evaluationRequirements: [],
      validReasoningRoutes: ['Any valid supported route.'],
      indicativeContent: [],
      misconceptions: [],
      diagnosticFeedbackRules: ['Use the rubric to diagnose gaps.'],
      improvementActions: ['Improve the weakest rewarded demand.'],
      ambiguityPolicy: 'Escalate material ambiguity.',
      confidencePolicy: 'Do not overstate confidence.',
    }

    expect(() => validateOperationalRubricCoverage({
      ...basePack,
      rubric: [{ id: 'eval-level', descriptor: 'Evaluation levels only.', minMark: 0, maxMark: 6 }],
    }, item)).toThrow(/no operational entries for subquestion calc/)

    const valid = validateOperationalRubricCoverage({
      ...basePack,
      rubric: [
        { id: 'calc-zero', descriptor: 'No creditworthy method or answer.', minMark: 0, maxMark: 0 },
        { id: 'calc-method', descriptor: 'Some correct method or working; allow consequential follow-through.', minMark: 1, maxMark: 2 },
        { id: 'calc-accuracy', descriptor: 'Correct method and accurate final answer, with consequential-error treatment where appropriate.', minMark: 3, maxMark: 4 },
        { id: 'eval-low', descriptor: 'Limited evaluation with weak support.', minMark: 0, maxMark: 2 },
        { id: 'eval-mid', descriptor: 'Developed evaluation with relevant support.', minMark: 3, maxMark: 4 },
        { id: 'eval-high', descriptor: 'Well-supported evaluation with a justified judgement.', minMark: 5, maxMark: 6 },
      ],
    }, item)
    expect(valid.rubric).toHaveLength(6)
  })
})
