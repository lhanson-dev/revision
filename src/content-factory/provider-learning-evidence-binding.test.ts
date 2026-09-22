import { describe, expect, it } from 'vitest'
import {
  providerFoundationLearningInlineEvidenceGuidance,
  resolveFoundationLearningInlineEvidence,
} from './provider-foundation-learning-evidence'

const teachingPoints = ['Generic teaching point']
const treatments = [{ nodeId: 'node-1', treatment: 'core_explanation' as const }]

function content(explanation = 'Section explanation [[REV-C1]] [[REV-T1]]') {
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

describe('Foundation provider Learn v7 inline evidence binding', () => {
  it('derives evidence from the exact marked generated field and strips markers before retention', () => {
    const resolved = resolveFoundationLearningInlineEvidence(content(), teachingPoints, treatments)

    expect(resolved.coverageEvidence).toEqual([{
      teachingPoint: teachingPoints[0],
      evidence: 'Section explanation',
    }])
    expect(resolved.content.sections[0].explanation).toBe('Section explanation')
    expect(JSON.stringify(resolved.content)).not.toContain('[[REV-')
  })

  it('fails closed when a required marker is missing', () => {
    expect(() => resolveFoundationLearningInlineEvidence(
      content('Section explanation [[REV-T1]]'),
      teachingPoints,
      treatments,
    )).toThrow('Missing Learn evidence marker [[REV-C1]]')
  })

  it('fails closed when a marker is duplicated', () => {
    const duplicated = content('Section explanation [[REV-C1]] [[REV-T1]]')
    duplicated.sections[0].keyPoints[0] = 'Unique key point [[REV-C1]]'

    expect(() => resolveFoundationLearningInlineEvidence(
      duplicated,
      teachingPoints,
      treatments,
    )).toThrow('Learn evidence marker [[REV-C1]] must appear exactly once')
  })

  it('fails closed for unexpected or malformed marker identities', () => {
    expect(() => resolveFoundationLearningInlineEvidence(
      content('Section explanation [[REV-C2]] [[REV-T1]]'),
      teachingPoints,
      treatments,
    )).toThrow('Unexpected Learn evidence marker [[REV-C2]]')
  })

  it('preserves atomic Learn placement rules from the actual marked field', () => {
    expect(() => resolveFoundationLearningInlineEvidence({
      ...content('Section explanation [[REV-T1]]'),
      introduction: 'Introduction text [[REV-C1]]',
    }, ['Course Truth [node-1]: Exact course truth'], treatments)).toThrow(
      'must be taught in the Learn explanation body',
    )
  })

  it('preserves treatment placement rules from the actual marked field', () => {
    expect(() => resolveFoundationLearningInlineEvidence(
      content('Section explanation [[REV-C1]] [[REV-T1]]'),
      teachingPoints,
      [{ nodeId: 'node-1', treatment: 'worked_example' as const }],
    )).toThrow('worked_example treatment evidence must point to a worked-example field')
  })

  it('instructs generation to use unique inline markers rather than self-referential evidence', () => {
    const guidance = providerFoundationLearningInlineEvidenceGuidance(teachingPoints, treatments)
    expect(guidance).toContain('inline machine markers')
    expect(guidance).toContain('Place each supplied marker exactly once')
    expect(guidance).toContain('[[REV-C1]] = Generic teaching point')
    expect(guidance).toContain('[[REV-T1]] = node-1::core_explanation')
    expect(guidance).toContain('not evidence arrays, copied text, indexes or positional references')
  })
})
