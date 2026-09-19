import { describe, expect, it } from 'vitest'
import { sourceLicenceRecordSchema } from './schema'
import {
  inspectAqaReferenceOnlySource,
  validateAqa7132ReferenceOnlySourceContract,
} from './foundation-external-source-challenge-live'
import { AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE } from './source-seeds/aqa-a-level-business-7132-2027-source-universe'

const specificationRequirement = AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE[0]

function source(overrides: Record<string, unknown> = {}) {
  return sourceLicenceRecordSchema.parse({
    id: specificationRequirement.sourceId,
    issuer: 'AQA',
    urlOrReference: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification',
    sourceType: 'specification',
    educationalRole: ['reference-only course identity and alignment'],
    versionOrDate: 'current runtime reference',
    useClass: 'REFERENCE_ONLY',
    permissionBasis: 'Governed AQA reference-only alignment rule.',
    aiInputPermitted: false,
    derivedCommercialUsePermitted: false,
    attributionRequirements: [],
    restrictions: ['alignment-facts-only', 'no-generative-source-text'],
    checkedAt: '2026-09-19T10:00:00.000Z',
    checkerMethod: 'test',
    sourceFingerprint: 'test-source-fingerprint',
    revalidationConditions: ['source changes'],
    ...overrides,
  })
}

describe('AQA 7132 live external-source challenge', () => {
  it('accepts only the governed AQA reference-only source contract', () => {
    expect(validateAqa7132ReferenceOnlySourceContract(source(), specificationRequirement)).toEqual([])

    const findings = validateAqa7132ReferenceOnlySourceContract(source({
      urlOrReference: 'https://example.com/business-7132',
    }), specificationRequirement)
    expect(findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ severity: 'material', issueType: 'source_universe' }),
    ]))
  })

  it('hashes fresh source bytes without exposing source prose to a generative worker', async () => {
    const fetchImpl: typeof fetch = async () => new Response('reference-only-source-bytes', {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        etag: 'test-etag',
      },
    })

    const result = await inspectAqaReferenceOnlySource({
      source: source(),
      fetchImpl,
      checkedAt: '2026-09-19T10:00:00.000Z',
    })

    expect(result.sourceId).toBe(specificationRequirement.sourceId)
    expect(result.requestedUrl).toContain('aqa.org.uk')
    expect(result.contentLengthBytes).toBeGreaterThan(0)
    expect(result.contentSha256).toMatch(/^[0-9a-f]{64}$/)
    expect(result).not.toHaveProperty('content')
    expect(result).not.toHaveProperty('text')
  })

  it('fails closed when the current official source cannot be retrieved', async () => {
    const fetchImpl: typeof fetch = async () => new Response('missing', { status: 503 })
    await expect(inspectAqaReferenceOnlySource({
      source: source(),
      fetchImpl,
      checkedAt: '2026-09-19T10:00:00.000Z',
    })).rejects.toThrow('http_503')
  })
})
