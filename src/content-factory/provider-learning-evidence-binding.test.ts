import { describe, expect, it } from 'vitest'
import { resolveLearningCoverageEvidence } from './provider-coverage-evidence'

const content = {
  introduction: 'Introduction text',
  sections: [
    {
      explanation: 'Section one explanation',
      keyPoints: ['Unique key point', 'Another key point'],
    },
    {
      explanation: 'Section two explanation',
      keyPoints: ['Repeated key point'],
    },
  ],
  workedExamples: [{
    setup: 'Worked setup',
    steps: ['Worked step one', 'Worked step two'],
    conclusion: 'Worked conclusion',
  }],
  misconceptions: [{ correction: 'Explicit correction' }],
  nextAction: 'Next action',
}

describe('provider Learn evidence binding', () => {
  it('resolves a unique verbatim evidence string within the declared generated area', () => {
    expect(resolveLearningCoverageEvidence([
      {
        teachingPoint: 'Generic teaching point',
        location: {
          area: 'section_key_point',
          evidenceText: 'Unique key point',
        },
      },
    ], content)).toEqual([
      {
        teachingPoint: 'Generic teaching point',
        evidence: 'Unique key point',
      },
    ])
  })

  it('fails closed when evidenceText does not exactly exist in the declared area', () => {
    expect(() => resolveLearningCoverageEvidence([
      {
        teachingPoint: 'Generic teaching point',
        location: {
          area: 'section_key_point',
          evidenceText: 'Paraphrased key point',
        },
      },
    ], content)).toThrow('Coverage evidence text does not exactly match generated section_key_point')
  })

  it('fails closed when the same evidenceText is ambiguous within the declared area', () => {
    const ambiguous = {
      ...content,
      sections: [
        { explanation: 'First', keyPoints: ['Repeated key point'] },
        { explanation: 'Second', keyPoints: ['Repeated key point'] },
      ],
    }

    expect(() => resolveLearningCoverageEvidence([
      {
        teachingPoint: 'Generic teaching point',
        location: {
          area: 'section_key_point',
          evidenceText: 'Repeated key point',
        },
      },
    ], ambiguous)).toThrow('Coverage evidence text is ambiguous within generated section_key_point')
  })

  it('preserves atomic Learn placement rules before resolving exact text', () => {
    expect(() => resolveLearningCoverageEvidence([
      {
        teachingPoint: 'Course Truth [node-1]: Exact course truth',
        location: {
          area: 'introduction',
          evidenceText: 'Introduction text',
        },
      },
    ], content)).toThrow('must be taught in the Learn explanation body')
  })
})