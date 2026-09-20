import { describe, expect, it } from 'vitest'
import {
  validateCourseLearningBlueprintLearningEvidence,
  validateCourseLearningBlueprintPracticeEvidence,
} from './course-learning-blueprint-evidence'
import { deriveCourseLearningNodePlan } from './course-learning-blueprint'
import {
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
} from './learning-and-practice'

function node(overrides: Record<string, unknown> = {}) {
  return {
    id: 'node-1',
    kind: 'formula',
    summary: 'Calculate a governed measure.',
    prerequisiteIds: [],
    relatedIds: [],
    formulas: ['measure = output / input'],
    misconceptions: [],
    applicationContexts: [],
    depth: 'core',
    sourceRefs: ['source-1'],
    boardAlignmentRefs: [],
    evidenceTypes: ['quantitative calculation'],
    ...overrides,
  }
}

const courseTruthPoint = 'Course Truth [node-1]: Calculate a governed measure.'
const formulaPoint = 'Formula or quantitative procedure [node-1]: measure = output / input'
const evidenceDemandPoint = 'Required evidence demand [node-1]: quantitative calculation'

describe('Course Learning Blueprint generated-evidence binding', () => {
  it('rejects quantitative node evidence that is only exercised in another Practice mode', () => {
    const plan = deriveCourseLearningNodePlan(node())
    const output = practiceCollateralWorkerOutputSchema.parse({
      title: 'Practice',
      instructions: 'Attempt every task.',
      activities: [
        {
          id: 'retrieval-1',
          mode: 'retrieval',
          prompt: 'State what the measure represents.',
          expectedResponse: 'It relates output to input.',
          explanation: 'Recall the relationship before calculating.',
          improvementAction: 'Retry from memory.',
        },
        {
          id: 'quantitative-1',
          mode: 'quantitative',
          prompt: 'Calculate an unrelated value.',
          expectedResponse: 'An unrelated numerical answer.',
          explanation: 'This does not evidence the governed node.',
          improvementAction: 'Check the arithmetic.',
        },
        {
          id: 'application-1',
          mode: 'application',
          prompt: 'Apply the governed measure in context.',
          expectedResponse: 'Use measure = output / input to calculate the governed measure.',
          explanation: 'Interpret the result in context.',
          improvementAction: 'Link the result to the scenario.',
        },
      ],
      coverageEvidence: [
        { teachingPoint: courseTruthPoint, evidence: 'It relates output to input.' },
        { teachingPoint: formulaPoint, evidence: 'Use measure = output / input to calculate the governed measure.' },
        { teachingPoint: evidenceDemandPoint, evidence: 'Interpret the result in context.' },
      ],
    })

    expect(() => validateCourseLearningBlueprintPracticeEvidence({
      output,
      nodePlans: [plan],
      workUnitId: 'work-unit-1',
    })).toThrow('did not exercise node node-1 in required mode quantitative')
  })

  it('accepts node evidence only when the quantitative obligation is actively exercised in quantitative Practice', () => {
    const plan = deriveCourseLearningNodePlan(node())
    const output = practiceCollateralWorkerOutputSchema.parse({
      title: 'Practice',
      instructions: 'Attempt every task.',
      activities: [
        {
          id: 'retrieval-1',
          mode: 'retrieval',
          prompt: 'State what the measure represents.',
          expectedResponse: 'It relates output to input.',
          explanation: 'Recall the relationship before calculating.',
          improvementAction: 'Retry from memory.',
        },
        {
          id: 'quantitative-1',
          mode: 'quantitative',
          prompt: 'Use the governed formula with new values.',
          expectedResponse: 'Use measure = output / input to calculate the governed measure.',
          explanation: 'Interpret the result after calculating.',
          improvementAction: 'Check the substitution and units.',
        },
      ],
      coverageEvidence: [
        { teachingPoint: courseTruthPoint, evidence: 'It relates output to input.' },
        { teachingPoint: formulaPoint, evidence: 'Use measure = output / input to calculate the governed measure.' },
        { teachingPoint: evidenceDemandPoint, evidence: 'Use the governed formula with new values.' },
      ],
    })

    expect(() => validateCourseLearningBlueprintPracticeEvidence({
      output,
      nodePlans: [plan],
      workUnitId: 'work-unit-1',
    })).not.toThrow()
  })

  it('rejects formula Learn evidence that is mentioned outside the required worked example', () => {
    const plan = deriveCourseLearningNodePlan(node())
    const output = learningCollateralWorkerOutputSchema.parse({
      title: 'Learn',
      introduction: 'Learn the measure.',
      sections: [{
        id: 'section-1',
        title: 'Meaning',
        explanation: 'It relates output to input.',
        keyPoints: ['Use measure = output / input to calculate the governed measure.'],
      }],
      workedExamples: [{
        id: 'worked-1',
        title: 'Different example',
        setup: 'A different calculation.',
        steps: ['Complete an unrelated calculation.'],
        conclusion: 'Interpret that unrelated result.',
      }],
      misconceptions: [],
      nextAction: 'Try Practice.',
      coverageEvidence: [
        { teachingPoint: courseTruthPoint, evidence: 'It relates output to input.' },
        { teachingPoint: formulaPoint, evidence: 'Use measure = output / input to calculate the governed measure.' },
        { teachingPoint: evidenceDemandPoint, evidence: 'Complete an unrelated calculation.' },
      ],
    })

    expect(() => validateCourseLearningBlueprintLearningEvidence({
      output,
      nodePlans: [plan],
      workUnitId: 'work-unit-1',
    })).toThrow('did not work through formula/procedure evidence for node node-1')
  })

  it('requires governed misconception evidence to appear as Learn repair and active Practice diagnosis', () => {
    const misconception = 'A high numerical result is always favourable.'
    const plan = deriveCourseLearningNodePlan(node({ misconceptions: [misconception] }))
    const misconceptionPoint = `Misconception to diagnose and repair [node-1]: ${misconception}`

    const learning = learningCollateralWorkerOutputSchema.parse({
      title: 'Learn',
      introduction: 'Learn the measure.',
      sections: [{ id: 'section-1', title: 'Meaning', explanation: 'It relates output to input.', keyPoints: ['Interpret the measure in context.'] }],
      workedExamples: [{ id: 'worked-1', title: 'Worked measure', setup: 'Output and input are supplied.', steps: ['Use measure = output / input to calculate the governed measure.'], conclusion: 'Interpret the result in context.' }],
      misconceptions: [{ misconception, correction: 'Whether the result is favourable depends on the business context.' }],
      nextAction: 'Try Practice.',
      coverageEvidence: [
        { teachingPoint: courseTruthPoint, evidence: 'It relates output to input.' },
        { teachingPoint: formulaPoint, evidence: 'Use measure = output / input to calculate the governed measure.' },
        { teachingPoint: misconceptionPoint, evidence: 'Whether the result is favourable depends on the business context.' },
        { teachingPoint: evidenceDemandPoint, evidence: 'Interpret the result in context.' },
      ],
    })

    expect(() => validateCourseLearningBlueprintLearningEvidence({ learning, output: learning, nodePlans: [plan], workUnitId: 'work-unit-1' } as never)).not.toThrow()

    const practice = practiceCollateralWorkerOutputSchema.parse({
      title: 'Practice',
      instructions: 'Attempt every task.',
      activities: [
        { id: 'retrieval-1', mode: 'retrieval', prompt: 'State what the measure represents.', expectedResponse: 'It relates output to input.', explanation: 'Recall the relationship.', improvementAction: 'Retry.' },
        { id: 'short-1', mode: 'short_answer', prompt: 'Why is a high result not automatically favourable?', expectedResponse: 'Whether the result is favourable depends on the business context.', explanation: 'Context determines interpretation.', improvementAction: 'Name the relevant context next time.' },
        { id: 'quantitative-1', mode: 'quantitative', prompt: 'Use the governed formula with new values.', expectedResponse: 'Use measure = output / input to calculate the governed measure.', explanation: 'Interpret after calculating.', improvementAction: 'Check substitution.' },
      ],
      coverageEvidence: [
        { teachingPoint: courseTruthPoint, evidence: 'It relates output to input.' },
        { teachingPoint: formulaPoint, evidence: 'Use measure = output / input to calculate the governed measure.' },
        { teachingPoint: misconceptionPoint, evidence: 'Whether the result is favourable depends on the business context.' },
        { teachingPoint: evidenceDemandPoint, evidence: 'Why is a high result not automatically favourable?' },
      ],
    })

    expect(() => validateCourseLearningBlueprintPracticeEvidence({ output: practice, nodePlans: [plan], workUnitId: 'work-unit-1' })).not.toThrow()
  })
})
