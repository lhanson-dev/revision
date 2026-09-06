import { describe, expect, it } from 'vitest'
import { assertFoundationSourceUniverse } from './foundation-source-universe'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
} from './source-seeds/aqa-a-level-business-7132-2027-source-universe'

function sourceEvidence() {
  return AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.map((requirement) => ({
    id: requirement.sourceId,
    issuer: requirement.issuer,
    sourceType: requirement.sourceType,
    useClass: requirement.requiredUseClass ?? 'REFERENCE_ONLY',
  }))
}

describe('Foundation source universe gate', () => {
  it('accepts the complete independently-declared AQA 7132 source universe', () => {
    const result = assertFoundationSourceUniverse({
      profileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
      requirements: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
      sourceEvidence: sourceEvidence(),
    })

    expect(result.status).toBe('complete')
    expect(result.resolvedSourceIds).toContain('aqa-7131-7132-formulae-key-data')
    expect(result.resolvedSourceIds).toContain('aqa-7131-7132-specification-updates-2023')
  })

  it('fails closed when the formulae/key-data source is missing', () => {
    expect(() => assertFoundationSourceUniverse({
      profileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
      requirements: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
      sourceEvidence: sourceEvidence().filter((source) => source.id !== 'aqa-7131-7132-formulae-key-data'),
    })).toThrow('source_universe_missing_required_source:aqa-7131-7132-formulae-key-data')
  })

  it('fails closed when a required awarding-body source is not reference-only', () => {
    const evidence = sourceEvidence().map((source) => source.id === 'aqa-7131-7132-formulae-key-data'
      ? { ...source, useClass: 'OPEN' }
      : source)

    expect(() => assertFoundationSourceUniverse({
      profileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
      requirements: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
      sourceEvidence: evidence,
    })).toThrow('source_universe_use_class_mismatch:aqa-7131-7132-formulae-key-data:OPEN')
  })
})
