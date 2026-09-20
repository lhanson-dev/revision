import { describe, expect, it } from 'vitest'
import { deriveCourseLearningNodePlan } from './course-learning-blueprint'

function node(overrides: Record<string, unknown> = {}) {
  return {
    id: 'node-1',
    kind: 'concept',
    summary: 'A governed knowledge node.',
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

describe('Course Learning Blueprint deterministic node planning', () => {
  it('turns structured quantitative evidence into worked Learn and active quantitative Practice even when no formula string is present', () => {
    const plan = deriveCourseLearningNodePlan(node({
      id: 'quantitative-skill',
      kind: 'skill',
      summary: 'Apply quantitative skills across ratios and graphical information.',
      misconceptions: ['A numerical result can be interpreted without context.'],
      applicationContexts: ['ratios and percentages', 'graphs'],
      evidenceTypes: ['quantitative calculation', 'graphical interpretation', 'contextual decision making'],
    }))

    expect(plan.classifications).toEqual(expect.arrayContaining([
      'procedure_skill',
      'formula_quantitative',
      'application_context',
      'evaluation_judgement',
      'misconception_risk',
    ]))
    expect(plan.learnTreatments).toEqual(expect.arrayContaining([
      'worked_example',
      'procedure_modelling',
      'misconception_repair',
    ]))
    expect(plan.practiceModes).toEqual(expect.arrayContaining(['retrieval', 'quantitative', 'application']))
    expect(plan.requiredTeachingPoints).toEqual(expect.arrayContaining([
      'Required application context [quantitative-skill]: ratios and percentages',
      'Required application context [quantitative-skill]: graphs',
      'Required evidence demand [quantitative-skill]: quantitative calculation',
      'Misconception to diagnose and repair [quantitative-skill]: A numerical result can be interpreted without context.',
    ]))
  })

  it('selects comparison, framework, reasoning and judgement treatments from governed evidence metadata', () => {
    const plan = deriveCourseLearningNodePlan(node({
      id: 'strategy-framework',
      applicationContexts: ['defined competitive scenario'],
      evidenceTypes: ['comparison', 'framework application', 'causal analysis', 'evaluation'],
    }))

    expect(plan.classifications).toEqual(expect.arrayContaining([
      'concept',
      'comparison_discrimination',
      'model_framework',
      'relationship_causal',
      'analysis_reasoning',
      'evaluation_judgement',
      'application_context',
    ]))
    expect(plan.learnTreatments).toEqual(expect.arrayContaining([
      'structured_comparison',
      'framework_application',
      'causal_chain',
      'modelled_reasoning',
      'justified_judgement',
    ]))
    expect(plan.practiceModes).toEqual(expect.arrayContaining(['retrieval', 'application']))
  })

  it('is qualification-agnostic and derives the same treatment rules from non-Business structured facts', () => {
    const plan = deriveCourseLearningNodePlan(node({
      id: 'science-rate-skill',
      kind: 'skill',
      summary: 'Calculate and interpret a reaction rate from measured data.',
      formulas: ['rate = change in quantity / time'],
      misconceptions: ['A steeper graph always means a larger final quantity.'],
      applicationContexts: ['reaction-rate graph'],
      evidenceTypes: ['quantitative calculation', 'graph interpretation', 'analysis'],
    }))

    expect(plan.classifications).toEqual(expect.arrayContaining([
      'procedure_skill',
      'formula_quantitative',
      'application_context',
      'analysis_reasoning',
      'misconception_risk',
    ]))
    expect(plan.learnTreatments).toEqual(expect.arrayContaining(['worked_example', 'procedure_modelling', 'modelled_reasoning']))
    expect(plan.practiceModes).toEqual(expect.arrayContaining(['quantitative', 'application']))
    expect(plan.requiredTeachingPoints).toContain('Formula or quantitative procedure [science-rate-skill]: rate = change in quantity / time')
  })

  it('binds otherwise identical atomic obligations to their exact node identities', () => {
    const first = deriveCourseLearningNodePlan(node({ id: 'first-node', applicationContexts: ['shared context'] }))
    const second = deriveCourseLearningNodePlan(node({ id: 'second-node', applicationContexts: ['shared context'] }))

    expect(first.requiredTeachingPoints).toContain('Required application context [first-node]: shared context')
    expect(second.requiredTeachingPoints).toContain('Required application context [second-node]: shared context')
    expect(first.requiredTeachingPoints).not.toContain('Required application context [second-node]: shared context')
  })
})
