import { describe, expect, it } from 'vitest'
import { privateSignupProof } from './private-signup-proof'

describe('private test registration proof', () => {
  const code = 'd1c4ac07b76a4b819d4fa342a717fec0' // deterministic test fixture, never production code
  it('generates an email-and-minute-bound SHA-256 HMAC without returning the secret', async () => {
    const now = Date.UTC(2026, 9, 25, 10, 4, 10)
    const result = await privateSignupProof(code.toUpperCase(), ' TEST@Example.invalid ', now)
    expect(result.minute).toBe(Math.floor(now / 60_000))
    expect(result.signature).toMatch(/^[a-f0-9]{64}$/)
    expect(JSON.stringify(result)).not.toContain(code)
    expect(await privateSignupProof(code, 'test@example.invalid', now)).toEqual(result)
    expect((await privateSignupProof(code, 'other@example.invalid', now)).signature).not.toBe(result.signature)
    expect((await privateSignupProof(code, 'test@example.invalid', now + 60_000)).signature).not.toBe(result.signature)
  })
  it('does not generate proofs from missing or weak codes', async () => {
    await expect(privateSignupProof('example', 'test@example.invalid')).rejects.toThrow()
    await expect(privateSignupProof(code, 'not-an-email')).rejects.toThrow()
  })
})
