import { describe, expect, it } from 'vitest'
import {
  enumerateFoundationLearningFields,
  providerFoundationLearningBindingGuidance,
  providerFoundationLearningBindingSchema,
  resolveFoundationLearningBoundEvidence,
  type ProviderFoundationLearningContent,
} from './provider-foundation-learning-evidence'

const teachingPoints = ['Generic teaching point']
const treatments = [{ nodeId: 'node-1', treatment: 'core_explanation' as const }]

function content(explanation = 'Section explanation'): ProviderFoundationLearningContent {
  return {
    title: 'Learn title',
    introduction: 'Introduction text',
    sections: [{
      title: 'Section one',
      explanation,
      keyPoints: ['Unique key point'],
    }],
    workedExamples: [{
      title: 'Worked example',
      setup: 'Worked setup',
      steps: ['Worked step one'],
      conclusion: 'Worked conclusion',
    }],
    misconceptions: [{ misconception: 'Wrong idea', correction: 'Explicit correction' }],
    nextAction: 'Next action',
  }
}

describe('Foundation provider Learn v9 closed-set evidence binding', () => {
  it('enumerates stable field IDs only after learner content exists', () => {
    expect(enumerateFoundationLearningFields(content())).toEqual([
      { fieldId: 'introduction', area: 'introduction', text: 'Introduction text' },
      { fieldId: 'section_1_explanation', area: 'section_explanation', text: 'Section explanation' },
      { fieldId: 'section_1_key_point_1', area: 'section_key_point', text: 'Unique key point' },
      { fieldId: 'worked_example_1_setup', area: 'worked_example_setup', text: 'Worked setup' },
      { fieldId: 'worked_example_1_step_1', area: 'worked_example_step', text: 'Worked step one' },
      { fieldId: 'worked_example_1_conclusion', area: 'worked_example_conclusion', text: 'Worked conclusion' },
      { fieldId: 'misconception_1_correction', area: 'misconception_correction', text: 'Explicit correction' },
      { fieldId: 'next_action', area: 'next_action', text: 'Next action' },
    ])
  })

  it('requires every deterministic obligation as a schema property and constrains values to generated fields', () => {
    const schema = providerFoundationLearningBindingSchema(content(), teachingPoints, treatments)
    expect(schema.parse({
      coverage_1: 'section_1_explanation',
      treatment_1: 'section_1_explanation',
    })).toEqual({
      coverage_1: 'section_1_explanation',
      treatment_1: 'section_1_explanation',
    })
    expect(() => schema.parse({ coverage_1: 'section_1_explanation' })).toThrow()
    expect(() => schema.parse({
      coverage_1: 'missing_field',
      treatment_1: 'section_1_explanation',
    })).toThrow()
  })

  it('derives retained evidence from the exact selected generated field', () => {
    const resolved = resolveFoundationLearningBoundEvidence(
      content(),
      { coverage_1: 'section_1_explanation', treatment_1: 'section_1_explanation' },
      teachingPoints,
      treatments,
    )

    expect(resolved.coverageEvidence).toEqual([{
      teachingPoint: teachingPoints[0],
      evidence: 'Section explanation',
    }])
    expect(resolved.content.sections[0].explanation).toBe('Section explanation')
    expect(JSON.stringify(resolved.content)).not.toContain('coverage_1')
    expect(JSON.stringify(resolved.content)).not.toContain('fieldId')
  })

  it('fails closed when direct resolver bindings omit a deterministic obligation', () => {
    expect(() => resolveFoundationLearningBoundEvidence(
      content(),
      { coverage_1: 'section_1_explanation' },
      teachingPoints,
      treatments,
    )).toThrow('missing=treatment_1')
  })

  it('fails closed for an unknown field identity in direct resolver use', () => {
    expect(() => resolveFoundationLearningBoundEvidence(
      content(),
      { coverage_1: 'missing_field', treatment_1: 'section_1_explanation' },
      teachingPoints,
      treatments,
    )).toThrow('references unknown field missing_field')
  })

  it('preserves atomic Learn placement rules using the selected field area', () => {
    expect(() => resolveFoundationLearningBoundEvidence(
      content(),
      { coverage_1: 'introduction', treatment_1: 'section_1_explanation' },
      ['Course Truth [node-1]: Exact course truth'],
      treatments,
    )).toThrow('must be taught in the Learn explanation body')
  })

  it('preserves worked-example treatment placement', () => {
    expect(() => resolveFoundationLearningBoundEvidence(
      content(),
      { coverage_1: 'section_1_explanation', treatment_1: 'section_1_explanation' },
      teachingPoints,
      [{ nodeId: 'node-1', treatment: 'worked_example' as const }],
    )).toThrow('worked_example treatment evidence must point to a worked-example field')
  })

  it('preserves misconception-repair treatment placement', () => {
    expect(() => resolveFoundationLearningBoundEvidence(
      content(),
      { coverage_1: 'section_1_explanation', treatment_1: 'section_1_explanation' },
      teachingPoints,
      [{ nodeId: 'node-1', treatment: 'misconception_repair' as const }],
    )).toThrow('misconception_repair treatment evidence must point to a misconception correction')
  })

  it('rejects legacy inline marker text instead of silently accepting it', () => {
    expect(() => enumerateFoundationLearningFields(content('Section explanation [[REV-C1]]'))).toThrow(
      'contains legacy inline evidence marker text',
    )
  })

  it('instructs the binder to use mandatory keys and a closed generated-field registry', () => {
    const guidance = providerFoundationLearningBindingGuidance(teachingPoints, treatments)
    expect(guidance).toContain('after the Learn content is final')
    expect(guidance).toContain('every required evidence ID is a mandatory property')
    expect(guidance).toContain('exact supplied fieldIds')
    expect(guidance).toContain('coverage_1 = Generic teaching point')
    expect(guidance).toContain('treatment_1 = node-1::core_explanation')
    expect(guidance).toContain('Do not copy or rewrite learner text, invent fieldIds, create positional indexes, or add machine markers')
  })
})
