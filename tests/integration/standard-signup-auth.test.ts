import { describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const active = process.env.REVISION_REAL_AUTH_HOOK_INTEGRATION === '1'
const suite = describe.skipIf(!active)

suite('normal registration with the real local GoTrue Auth hook', () => {
  it('creates and signs in an ordinary email learner without a private code or feature flag', async () => {
    const url = process.env.SUPABASE_URL ?? ''
    const publishable = process.env.SUPABASE_ANON_KEY ?? ''
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    const origin = new URL(url)
    if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname) || origin.port !== '54321') {
      throw new Error('Never run this integration test against production Auth.')
    }
    expect(publishable).toBeTruthy()
    expect(service).toBeTruthy()
    const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } })
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
    const password = 'Synthetic-Ordinary-Signup-19!'
    const email = `ordinary-signup-${crypto.randomUUID()}@revision.invalid`
    const allowed = await client.auth.signUp({ email, password, options: { data: { first_name: 'Synthetic' } } })
    if (allowed.error) throw new Error(`Normal synthetic signup failed: HTTP ${allowed.error.status}, ${allowed.error.message}`)
    expect(allowed.data.user?.id).toBeTruthy()
    const userId = allowed.data.user?.id
    if (!userId) throw new Error('Synthetic signup did not create an account.')
    try {
      expect(allowed.data.user?.user_metadata?.first_name).toBe('Synthetic')
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
