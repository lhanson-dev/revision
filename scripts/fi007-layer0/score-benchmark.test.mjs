import { describe, expect, it } from 'vitest'
import { scoreBenchmark } from './score-benchmark.mjs'

const references = {
  benchmarkVersion: 'test-v1',
  references: [
    { answerId: 'A', referenceMark: 5, adjudicatedMark: null },
    { answerId: 'B', referenceMark: 10, adjudicatedMark: 9 },
  ],
}

describe('scoreBenchmark', () => {
  it('uses adjudicated marks and calculates accuracy/bias metrics', () => {
    const score = scoreBenchmark(references, {
      runId: 'run-1',
      provider: 'test',
      modelId: 'model',
      results: [
        { answerId: 'A', provisionalMark: 5, unsupportedCriterionDetected: false, reviewRequired: false },
        { answerId: 'B', provisionalMark: 10, unsupportedCriterionDetected: false, reviewRequired: true },
      ],
    })

    expect(score.exactCount).toBe(1)
    expect(score.withinOneCount).toBe(2)
    expect(score.meanAbsoluteError).toBe(0.5)
    expect(score.signedBias).toBe(0.5)
    expect(score.largestAbsoluteError).toBe(1)
    expect(score.reviewRequiredCount).toBe(1)
    expect(score.blockingFabricatedCriterionDefect).toBe(false)
  })

  it('treats fabricated criteria as a blocking defect', () => {
    const score = scoreBenchmark(references, {
      results: [
        { answerId: 'A', provisionalMark: 5, unsupportedCriterionDetected: true },
        { answerId: 'B', provisionalMark: 9, unsupportedCriterionDetected: false },
      ],
    })

    expect(score.fabricatedCriterionCount).toBe(1)
    expect(score.blockingFabricatedCriterionDefect).toBe(true)
  })

  it('rejects incomplete reference sets', () => {
    expect(() => scoreBenchmark(
      { references: [{ answerId: 'A', referenceMark: null }] },
      { results: [{ answerId: 'A', provisionalMark: 1 }] },
    )).toThrow('Incomplete reference mark for A')
  })

  it('rejects missing result IDs', () => {
    expect(() => scoreBenchmark(references, {
      results: [{ answerId: 'A', provisionalMark: 5 }],
    })).toThrow('Missing result IDs: B')
  })
})
