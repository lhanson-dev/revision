import { describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { privateSignupProof } from '../../src/services/auth/private-signup-proof'

const active = process.env.REVISION_REAL_AUTH_HOOK_INTEGRATION === '1'
const suite = describe.skipIf(!active)

suite('private registration is enforced by the real local GoTrue Auth hook', () => {
  it('rejects missing and forged admission proofs but admits a real new email learner', async () => {
    const url = process.env.SUPABASE_URL ?? ''
    const publishable = process.env.SUPABASE_ANON_KEY ?? ''
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const code = process.env.REVISION_PRIVATE_SIGNUP_TEST_CODE ?? ''
    const origin = new URL(url)
    if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname) || origin.port !== '54321') {
      throw new Error('This integration must never run against production Auth.')
    }
    expect(code).toMatch(/^[a-f0-9]{32}$/)
    expect(publishable).toBeTruthy()
    expect(service).toBeTruthy()
    const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } })
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
    const password = 'Synthetic-Private-Only-Password-19!'
    const email = `private-admission-${crypto.randomUUID()}@revision.invalid`

    const absent = await client.auth.signUp({ email, password })
    expect(absent.error, 'No admission metadata must be rejected by real Auth').not.toBeNull()
    expect(absent.data.user).toBeNull()

    const forged = await client.auth.signUp({
      email, password,
      options: { data: { revision_signup_minute: Math.floor(Date.now() / 60_000), revision_signup_proof: '0'.repeat(64) } },
    })
    expect(forged.error, 'A syntactically correct but forged proof must be rejected').not.toBeNull()
    expect(forged.data.user).toBeNull()

    const validProof = await privateSignupProof(code, email)
    const allowed = await client.auth.signUp({
      email, password,
      options: { data: { first_name: 'Synthetic', revision_signup_minute: validProof.minute, revision_signup_proof: validProof.signature } },
    })
    expect(allowed.error).toBeNull()
    expect(allowed.data.user?.id).toBeTruthy()
    const userId = allowed.data.user?.id
    if (!userId) throw new Error('Auth hook failed to create permitted synthetic learner.')

    try {
      // A successful signup must still leave normal sign-in available, without any
      // FI-001 or REC-10 claims and without administrator permissions.
      const login = await client.auth.signInWithPassword({ email, password })
      expect(login.error).toBeNull()
      expect(login.data.user?.id).toBe(userId)
      expect(login.data.user?.app_metadata?.revision_fi001_pilot).not.toBe(true)
      expect(login.data.user?.app_metadata?.revision_rec10_pilot).not.toBe(true)
    } finally {
      await client.auth.signOut()
      const removal = await admin.auth.admin.deleteUser(userId)
      expect(removal.error).toBeNull()
    }
  })
})
