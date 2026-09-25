import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const liveReviewRunners = [
  './foundation-internal-learning-assurance-live-proof.integration.test.ts',
  './foundation-internal-learning-reassurance-live-proof.integration.test.ts',
  './foundation-internal-learning-repeat-reassurance-live-proof.integration.test.ts',
] as const

describe('Foundation-native learning review provider contract', () => {
  for (const runner of liveReviewRunners) {
    it(`requires strict structured output in ${runner}`, async () => {
      const source = await readFile(fileURLToPath(new URL(runner, import.meta.url)), 'utf-8')

      expect(source).toContain('foundationInternalLearningBoundReviewOutputSchema')
      expect(source).toContain('strictOutput: true')
      expect(source.indexOf('strictOutput: true')).toBeGreaterThan(source.indexOf('foundationInternalLearningBoundReviewOutputSchema'))
    })
  }
})
