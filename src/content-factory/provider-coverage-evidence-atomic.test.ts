import { describe, expect, it } from 'vitest'
import {
  resolveLearningCoverageEvidence,
  resolvePracticeCoverageEvidence,
} from './provider-coverage-evidence'

describe('provider coverage evidence atomic Blueprint integration', () => {
  it('rejects atomic Learn evidence in the wrong educational structure', () => {
    expect(() => resolveLearningCoverageEvidence([
      {
        teachingPoint: 'Formula or quantitative procedure [node-1]: result = output / input',
        location: { area: 'section_key_point', itemIndex: 1, detailIndex: 1 },
      },
    ], {
      introduction: 'Introduction',
      sections: [{ explanation: 'Explanation', keyPoints: ['Formula appears here only.'] }],
      workedExamples: [{ setup: 'Values supplied.', steps: ['Calculate the result.'], conclusion: 'Interpret it.' }],
      misconceptions: [],
      nextAction: 'Practise.',
    })).toThrow('must be worked through in a Learn worked example')
  })

  it('rejects atomic Practice evidence that is passive or in the wrong mode', () => {
    expect(() => resolvePracticeCoverageEvidence([
      {
        teachingPoint: 'Required application context [node-1]: unfamiliar scenario',
        location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' },
      },
    ], {
      activitiesByMode: {
        retrieval: [{
          prompt: 'Recall the idea.',
          expectedResponse: 'The idea.',
          explanation: 'Explanation.',
          improvementAction: 'Review.',
        }],
      },
    })).toThrow('must be exercised in application Practice')

    expect(() => resolvePracticeCoverageEvidence([
      {
        teachingPoint: 'Misconception to diagnose and repair [node-1]: A result is always favourable.',
        location: { mode: 'retrieval', activityIndex: 1, field: 'explanation' },
      },
    ], {
      activitiesByMode: {
        retrieval: [{
          prompt: 'Which claim is correct?',
          expectedResponse: 'The context-dependent claim.',
          explanation: 'A result is not automatically favourable.',
          improvementAction: 'Check the context.',
        }],
      },
    })).toThrow('must be evidenced in an active Practice prompt or expected response')
  })

  it('resolves correctly placed atomic evidence to the exact generated fields', () => {
    const learning = resolveLearningCoverageEvidence([
      {
        teachingPoint: 'Formula or quantitative procedure [node-1]: result = output / input',
        location: { area: 'worked_example_step', itemIndex: 1, detailIndex: 1 },
      },
    ], {
      introduction: 'Introduction',
      sections: [{ explanation: 'Explanation', keyPoints: ['Key point'] }],
      workedExamples: [{ setup: 'Values supplied.', steps: ['Calculate output divided by input.'], conclusion: 'Interpret it.' }],
      misconceptions: [],
      nextAction: 'Practise.',
    })

    expect(learning[0].evidence).toBe('Calculate output divided by input.')

    const practice = resolvePracticeCoverageEvidence([
      {
        teachingPoint: 'Required application context [node-1]: unfamiliar scenario',
        location: { mode: 'application', activityIndex: 1, field: 'prompt' },
      },
    ], {
      activitiesByMode: {
        application: [{
          prompt: 'Apply the idea to the unfamiliar scenario.',
          expectedResponse: 'A contextual response.',
          explanation: 'Context matters.',
          improvementAction: 'Use more scenario evidence.',
        }],
      },
    })

    expect(practice[0].evidence).toBe('Apply the idea to the unfamiliar scenario.')
  })
})
