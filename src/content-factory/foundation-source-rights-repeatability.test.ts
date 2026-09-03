import { describe, expect, it } from 'vitest'
import { classifyFoundationSourcesWithApprovedRules } from './foundation-compilation'
import { FOUNDATION_SOURCE_RIGHTS_REGISTRY } from './foundation-source-rights-registry'

const source = {
  id: 'dfe-business-subject-content',
  url: 'https://www.gov.uk/government/publications/gce-as-and-a-level-for-business',
  title: 'GCE AS and A level subject content for business',
  issuer: 'Department for Education',
  sourceType: 'subject_content' as const,
  educationalRole: ['permitted common A-level Business curriculum truth'],
  versionOrDate: 'current publication',
}

describe('Foundation source-rights material identity', () => {
  it('keeps revalidation time as audit metadata rather than changing the material fingerprint', async () => {
    const first = await classifyFoundationSourcesWithApprovedRules({
      jobId: 'source-rights-repeatability',
      sources: [source],
      rules: FOUNDATION_SOURCE_RIGHTS_REGISTRY.rules,
      checkedAt: '2026-09-03T19:00:00+01:00',
    })
    const later = await classifyFoundationSourcesWithApprovedRules({
      jobId: 'source-rights-repeatability',
      sources: [source],
      rules: FOUNDATION_SOURCE_RIGHTS_REGISTRY.rules,
      checkedAt: '2026-09-10T09:00:00+01:00',
    })

    expect(first.status).toBe('approved')
    expect(later.status).toBe('approved')
    expect(first.register.checkedAt).not.toBe(later.register.checkedAt)
    expect(first.register.sources[0]?.checkedAt).not.toBe(later.register.sources[0]?.checkedAt)
    expect(first.register.fingerprint).toBe(later.register.fingerprint)
  })

  it('changes the material fingerprint when source identity materially changes', async () => {
    const first = await classifyFoundationSourcesWithApprovedRules({
      jobId: 'source-rights-material-change',
      sources: [source],
      rules: FOUNDATION_SOURCE_RIGHTS_REGISTRY.rules,
      checkedAt: '2026-09-03T19:00:00+01:00',
    })
    const changed = await classifyFoundationSourcesWithApprovedRules({
      jobId: 'source-rights-material-change',
      sources: [{ ...source, versionOrDate: 'changed publication version' }],
      rules: FOUNDATION_SOURCE_RIGHTS_REGISTRY.rules,
      checkedAt: '2026-09-03T19:00:00+01:00',
    })

    expect(first.register.fingerprint).not.toBe(changed.register.fingerprint)
  })
})
