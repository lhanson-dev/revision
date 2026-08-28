import { describe, expect, it } from 'vitest'
import {
  canonicaliseKnownMathematicalFormulas,
  cleanTrailingLearnerLanguageContamination,
  rebalanceMcqCorrectAnswerPositions,
  repairPracticePromptPresuppositions,
  validateMcqCorrectAnswerDistribution,
  validateOperationalRubricCoverage,
} from './openai-output-integrity-compiler'

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

  it('repairs a cash-forecast prompt that presupposes a deficit contradicted by its expected answer', () => {
    const output = repairPracticePromptPresuppositions({
      title: 'Cash-flow practice',
      instructions: 'Calculate carefully.',
      activities: [{
        id: 'cash-1',
        mode: 'quantitative',
        prompt: 'Calculate closing balances for April, May and June. Identify the month with a cash deficit and state one suitable action before that month.',
        expectedResponse: 'April £2,000; May £6,000; June £3,500. There is no cash deficit in these months.',
        explanation: 'All closing balances remain positive.',
        improvementAction: 'Check the opening balance and net cash flow each month.',
      }],
      coverageEvidence: [{
        teachingPoint: 'Interpret cash-flow forecasts.',
        evidence: 'Calculate closing balances for April, May and June. Identify the month with a cash deficit and state one suitable action before that month.',
      }],
    })

    expect(output.activities[0].prompt).toContain('Determine whether any month has a cash deficit')
    expect(output.activities[0].prompt).toContain('If one does')
    expect(output.coverageEvidence[0].evidence).toBe(output.activities[0].prompt)
  })

  it('removes an isolated trailing non-Latin contamination token while preserving evidence equality', () => {
    const output = cleanTrailingLearnerLanguageContamination({
      title: 'Organisational structures',
      introduction: 'Learn how structure affects accountability.',
      sections: [],
      workedExamples: [{
        id: 'example-1',
        title: 'Worked example',
        setup: 'A business changes its reporting lines.',
        steps: ['Compare the before and after structure. തൊഴില'],
        conclusion: 'Clearer accountability can improve decisions.',
      }],
      misconceptions: [],
      nextAction: 'Practise applying the idea.',
      coverageEvidence: [{
        teachingPoint: 'Explain how structure affects accountability.',
        evidence: 'Compare the before and after structure. തൊഴില',
      }],
    })

    expect(output.workedExamples[0].steps[0]).toBe('Compare the before and after structure.')
    expect(output.coverageEvidence[0].evidence).toBe('Compare the before and after structure.')
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
