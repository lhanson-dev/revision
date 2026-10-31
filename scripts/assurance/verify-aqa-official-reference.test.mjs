import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { assertReferenceManifest, readReferenceManifest, verifyReferenceBytes } from './verify-aqa-official-reference.mjs'

const sample = Buffer.from('%PDF-1.4\nSynthetic test fixture only\n%%EOF\n')
const digest = createHash('sha256').update(sample).digest('hex')
const fake = { id: 'business-7132', version: 'test', source_use: 'REFERENCE_ONLY', sha256: digest }

describe('Issue #698 — exact AQA PDF source reference', () => {
  it('pins exact upload fingerprints, official versions and reference-only rights', async () => {
    const manifest = await readReferenceManifest()
    expect(assertReferenceManifest(manifest)).toBe(true)
    expect(manifest.sources.map(source => [source.id, source.version, source.pdf_pages, source.sha256])).toEqual([
      ['business-7132', '2.0', 42, '3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332'],
      ['psychology-7182', '1.4', 38, 'db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d'],
    ])
    expect(manifest.sources.every(source => source.source_use === 'REFERENCE_ONLY' &&
      source.allow_pdf_text_in_ai_generation === false && source.allow_pdf_commit === false)).toBe(true)
  })

  it('accepts only byte-identical PDF content; labels or filenames do not suffice', () => {
    expect(verifyReferenceBytes(fake, sample)).toMatchObject({
      verified: true, sha256: digest, source_use: 'REFERENCE_ONLY',
      assurance: 'exact-reference-bytes-only',
    })
    expect(() => verifyReferenceBytes(fake, Buffer.concat([sample, Buffer.from('changed')]))).toThrow('SHA-256 mismatch')
    expect(() => verifyReferenceBytes(fake, Buffer.from('not a PDF'))).toThrow('invalid PDF header')
  })

  it('fails closed on rights escalation, unknown codes, unapproved hosts and hashes', async () => {
    const m = await readReferenceManifest()
    for (const patch of [
      { source_use: 'OPEN' }, { allow_pdf_text_in_ai_generation: true },
      { allow_pdf_commit: true }, { specification_code: '7138' },
      { sha256: 'a' }, { official_pdf_url: 'https://example.com/fake.pdf' },
    ]) {
      const altered = structuredClone(m)
      Object.assign(altered.sources[0], patch)
      expect(() => assertReferenceManifest(altered)).toThrow()
    }
  })
})
