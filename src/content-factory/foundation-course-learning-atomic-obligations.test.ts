import { describe, expect, it } from 'vitest'
import {
  deriveFoundationCourseLearningAtomicTeachingPoints,
  validateFoundationAtomicLearningEvidenceLocations,
  validateFoundationAtomicPracticeEvidenceLocations,
} from './foundation-course-learning-atomic-obligations'
import { deriveFoundationCourseLearningDesign } from './foundation-course-learning-blueprint'

function node(overrides: Record<string, unknown> = {}) {
  return {
    id: 'node-1',
    kind: 'concept',
    summary: 'A governed concept.',
    prerequisiteIds: [],
    relatedIds: [],
    formulas: [],
    misconceptions: [],
    applicationContexts: [],
    depth: 'core',
    sourceRefs: ['source-1'],
    boardAlignmentRefs: [],
    evidenceTypes: ['explanation'],
    ...overrides,
  }
}

describe('Foundation Course Learning Blueprint atomic obligations', () => {
  it('binds identical structured facts to their exact Course Truth node identities', () => {
    const points = deriveFoundationCourseLearningAtomicTeachingPoints([
      node({ id: 'first-node', applicationContexts: ['shared context'] }),
      node({ id: 'second-node', applicationContexts: ['shared context'] }),
    ])

    expect(points).toContain('Required application context [first-node]: shared context')
    expect(points).toContain('Required application context [second-node]: shared context')
    expect(points.filter((point) => point.includes('shared context'))).toHaveLength(2)
  })

  it('remains qualification-neutral for a non-Business science node', () => {
    const scienceNode = node({
      id: 'reaction-rate',
      kind: 'skill',
      summary: 'Calculate and interpret reaction rate from measured data.',
      formulas: ['rate = change in quantity / time'],
      misconceptions: ['A steeper graph always means a larger final quantity.'],
      applicationContexts: ['reaction-rate graph'],
      evidenceTypes: ['quantitative calculation', 'graph interpretation', 'analysis'],
    })

    const design = deriveFoundationCourseLearningDesign([scienceNode])
    const points = deriveFoundationCourseLearningAtomicTeachingPoints([scienceNode])

    expect(design.classifications).toEqual(expect.arrayContaining([
      'formula_quantitative',
      'procedure_skill',
      'application_context',
      'analysis_reasoning',
      'misconception_risk',
    ]))
    expect(design.practiceCapabilities).toEqual(expect.arrayContaining([
      'calculation',
      'graph_data_interpretation',
      'reasoning_chain',
      'misconception_diagnostic',
    ]))
    expect(points).toEqual(expect.arrayContaining([
      'Formula or quantitative procedure [reaction-rate]: rate = change in quantity / time',
      'Misconception to diagnose and repair [reaction-rate]: A steeper graph always means a larger final quantity.',
      'Required application context [reaction-rate]: reaction-rate graph',
      'Required evidence demand [reaction-rate]: quantitative calculation',
      'Required evidence demand [reaction-rate]: graph interpretation',
    ]))
  })

  it('requires exact Learn placement for formula and misconception obligations', () => {
    expect(() => validateFoundationAtomicLearningEvidenceLocations([
      {
        teachingPoint: 'Formula or quantitative procedure [node-1]: result = output / input',
        location: { area: 'section_key_point', evidenceText: 'Formula appears here only.' },
      },
    ])).toThrow('must be worked through in a Learn worked example')

    expect(() => validateFoundationAtomicLearningEvidenceLocations([
      {
        teachingPoint: 'Misconception to diagnose and repair [node-1]: A result is always favourable.',
        location: { area: 'section_explanation', evidenceText: 'A result is not automatically favourable.' },
      },
    ])).toThrow('must be evidenced in an explicit Learn misconception correction')
  })

  it('requires atomic Practice obligations to be actively exercised in the correct mode', () => {
    expect(() => validateFoundationAtomicPracticeEvidenceLocations([
      {
        teachingPoint: 'Required application context [node-1]: unfamiliar scenario',
        location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' },
      },
    ])).toThrow('must be exercised in application Practice')

    expect(() => validateFoundationAtomicPracticeEvidenceLocations([
      {
        teachingPoint: 'Misconception to diagnose and repair [node-1]: A result is always favourable.',
        location: { mode: 'retrieval', activityIndex: 1, field: 'explanation' },
      },
    ])).toThrow('must be evidenced in an active Practice prompt or expected response')

    expect(() => validateFoundationAtomicPracticeEvidenceLocations([
      {
        teachingPoint: 'Required evidence demand [node-1]: quantitative calculation',
        location: { mode: 'application', activityIndex: 1, field: 'prompt' },
      },
    ])).toThrow('must be exercised in quantitative Practice')
  })

  it('accepts correctly placed atomic Learn and Practice evidence', () => {
    expect(() => validateFoundationAtomicLearningEvidenceLocations([
      {
        teachingPoint: 'Course Truth [node-1]: A governed concept.',
        location: { area: 'section_explanation', evidenceText: 'A governed concept.' },
      },
      {
        teachingPoint: 'Formula or quantitative procedure [node-1]: result = output / input',
        location: { area: 'worked_example_step', evidenceText: 'Calculate output divided by input.' },
      },
      {
        teachingPoint: 'Misconception to diagnose and repair [node-1]: A result is always favourable.',
        location: { area: 'misconception_correction', evidenceText: 'A result is not automatically favourable.' },
      },
    ])).not.toThrow()

    expect(() => validateFoundationAtomicPracticeEvidenceLocations([
      {
        teachingPoint: 'Formula or quantitative procedure [node-1]: result = output / input',
        location: { mode: 'quantitative', activityIndex: 1, field: 'prompt' },
      },
      {
        teachingPoint: 'Required application context [node-1]: unfamiliar scenario',
        location: { mode: 'application', activityIndex: 1, field: 'expectedResponse' },
      },
      {
        teachingPoint: 'Misconception to diagnose and repair [node-1]: A result is always favourable.',
        location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' },
      },
    ])).not.toThrow()
  })
})
