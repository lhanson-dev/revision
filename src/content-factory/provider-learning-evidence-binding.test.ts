import { describe, expect, it } from 'vitest'
import {
  providerFoundationLearningEvidenceFieldSchema,
  providerFoundationLearningTypedEvidenceGuidance,
  resolveFoundationLearningTypedEvidence,
  type ProviderFoundationLearningEvidenceField,
} from './provider-foundation-learning-evidence'

const teachingPoints = ['Generic teaching point']
const treatments = [{ nodeId: 'node-1', treatment: 'core_explanation' as const }]

function evidenceField(text: string, evidenceIds: string[] = []): ProviderFoundationLearningEvidenceField {
  return { text, evidenceIds }
}

function content(explanation = evidenceField('Section explanation', ['coverage_1', 'treatment_1'])) {
  return {
    title: 'Learn title',
    introduction: evidenceField('Introduction text'),
    sections: [{
      title: 'Section one',
      explanation,
      keyPoints: [evidenceField('Unique key point')],
    }],
    workedExamples: [{
      title: 'Worked example',
      setup: evidenceField('Worked setup'),
      steps: [evidenceField('Worked step one')],
      conclusion: evidenceField('Worked conclusion'),
    }],
    misconceptions: [{ misconception: 'Wrong idea', correction: evidenceField('Explicit correction') }],
    nextAction: evidenceField('Next action'),
  }
}

describe('Foundation provider Learn v8 typed evidence binding', () => {
  it('derives evidence from the exact evidence-owning generated field without retaining metadata', () => {
    const resolved = resolveFoundationLearningTypedEvidence(content(), teachingPoints, treatments)

    expect(resolved.coverageEvidence).toEqual([{
      teachingPoint: teachingPoints[0],
      evidence: 'Section explanation',
    }])
    expect(resolved.content.sections[0].explanation).toBe('Section explanation')
    expect(JSON.stringify(resolved.content)).not.toContain('evidenceIds')
    expect(JSON.stringify(resolved.content)).not.toContain('coverage_1')
  })

  it('fails closed when a required evidence ID is missing', () => {
    expect(() => resolveFoundationLearningTypedEvidence(
      content(evidenceField('Section explanation', ['treatment_1'])),
      teachingPoints,
      treatments,
    )).toThrow('Missing Learn evidence ID coverage_1')
  })

  it('fails closed when an evidence ID is duplicated', () => {
    const duplicated = content()
    duplicated.sections[0].keyPoints[0] = evidenceField('Unique key point', ['coverage_1'])

    expect(() => resolveFoundationLearningTypedEvidence(
      duplicated,
      teachingPoints,
      treatments,
    )).toThrow('Learn evidence ID coverage_1 must be owned exactly once')
  })

  it('fails closed for unexpected evidence identities', () => {
    expect(() => resolveFoundationLearningTypedEvidence(
      content(evidenceField('Section explanation', ['coverage_2', 'treatment_1'])),
      teachingPoints,
      treatments,
    )).toThrow('Unexpected Learn evidence ID coverage_2')
  })

  it('preserves atomic Learn placement rules from the actual evidence-owning field', () => {
    expect(() => resolveFoundationLearningTypedEvidence({
      ...content(evidenceField('Section explanation', ['treatment_1'])),
      introduction: evidenceField('Introduction text', ['coverage_1']),
    }, ['Course Truth [node-1]: Exact course truth'], treatments)).toThrow(
      'must be taught in the Learn explanation body',
    )
  })

  it('preserves treatment placement rules from the actual evidence-owning field', () => {
    expect(() => resolveFoundationLearningTypedEvidence(
      content(evidenceField('Section explanation', ['coverage_1', 'treatment_1'])),
      teachingPoints,
      [{ nodeId: 'node-1', treatment: 'worked_example' as const }],
    )).toThrow('worked_example treatment evidence must point to a worked-example field')
  })

  it('rejects legacy inline marker text instead of stripping it silently', () => {
    expect(() => resolveFoundationLearningTypedEvidence(
      content(evidenceField('Section explanation [[REV-C1]]', ['coverage_1', 'treatment_1'])),
      teachingPoints,
      treatments,
    )).toThrow('contains legacy inline evidence marker text')
  })

  it('constrains typed evidence IDs in the provider schema', () => {
    const schema = providerFoundationLearningEvidenceFieldSchema(teachingPoints, treatments)
    expect(schema.parse({ text: 'Evidence text', evidenceIds: ['coverage_1', 'treatment_1'] })).toEqual({
      text: 'Evidence text',
      evidenceIds: ['coverage_1', 'treatment_1'],
    })
    expect(() => schema.parse({ text: 'Evidence text', evidenceIds: ['coverage_2'] })).toThrow()
  })

  it('instructs generation to assign typed evidence metadata rather than self-referential evidence', () => {
    const guidance = providerFoundationLearningTypedEvidenceGuidance(teachingPoints, treatments)
    expect(guidance).toContain('typed metadata owned by each generated learner-content field')
    expect(guidance).toContain('text plus evidenceIds')
    expect(guidance).toContain('each supplied evidence ID exactly once')
    expect(guidance).toContain('coverage_1 = Generic teaching point')
    expect(guidance).toContain('treatment_1 = node-1::core_explanation')
    expect(guidance).toContain('Do not put evidence IDs, machine markers, indexes, copied evidence text or positional references inside learner-facing text')
  })
})
