import { describe, expect, it } from 'vitest'
import workflow from '../../.github/workflows/content-factory-foundation-internal-learning-proof.yml?raw'

describe('Foundation internal learning proof workflow', () => {
  it('retains the hard spend ceiling while allowing the provider response capacity required by v5 Practice', () => {
    expect(workflow).toContain("CONTENT_FACTORY_MAX_SPEND_USD: '12'")
    expect(workflow).toContain("CONTENT_FACTORY_GENERATION_MAX_OUTPUT_TOKENS: '8000'")
    expect(workflow).not.toContain("CONTENT_FACTORY_GENERATION_MAX_OUTPUT_TOKENS: '4000'")
  })
})
