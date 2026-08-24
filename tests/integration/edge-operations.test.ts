import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { loadLearnerPlanContext } from '../../src/services/subscriptions/learner-plan-service'

const integrationEnabled = process.env.REVISION_EDGE_INTEGRATION === '1'
const supabaseUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const anonKey = process.env.SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const suite = describe.skipIf(!integrationEnabled)

function browserClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

async function createSyntheticUser(admin: SupabaseClient, label: string) {
  const email = `edge-${label}-${crypto.randomUUID()}@revision.invalid`
  const password = `Revision-${crypto.randomUUID()}-A1!`
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !data.user) throw new Error(`Could not create Edge integration user: ${error?.message ?? 'missing user'}`)

  const client = browserClient()
  const { data: signIn, error: signInError } = await client.auth.signInWithPassword({ email, password })
  if (signInError || !signIn.session) throw new Error(`Could not sign in Edge integration user: ${signInError?.message ?? 'missing session'}`)

  return { user: data.user, client, accessToken: signIn.session.access_token }
}

async function invoke(functionName: string, accessToken?: string, body: Record<string, unknown> = {}) {
  const headers: Record<string, string> = {
    apikey: anonKey,
    'Content-Type': 'application/json',
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  return fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

suite('protected operations Edge Functions', () => {
  let admin: SupabaseClient
  let ordinary: { user: User; client: SupabaseClient; accessToken: string }
  let founder: { user: User; client: SupabaseClient; accessToken: string }

  beforeAll(async () => {
    if (!anonKey || !serviceRoleKey) {
      throw new Error('SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are required for Edge integration assurance')
    }

    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    ordinary = await createSyntheticUser(admin, 'ordinary')
    founder = await createSyntheticUser(admin, 'admin')

    const { data, error } = await admin
      .from('profiles')
      .update({ is_admin: true })
      .eq('user_id', founder.user.id)
      .select('user_id,is_admin')
      .single()
    if (error || data?.is_admin !== true) throw new Error(`Could not grant synthetic admin role: ${error?.message ?? 'profile not updated'}`)
  })

  afterAll(async () => {
    await ordinary?.client.auth.signOut()
    await founder?.client.auth.signOut()
    if (ordinary?.user.id) await admin?.auth.admin.deleteUser(ordinary.user.id)
    if (founder?.user.id) await admin?.auth.admin.deleteUser(founder.user.id)
  })

  for (const functionName of ['admin-operations', 'planner-operations', 'learner-plan-operations']) {
    it(`${functionName} rejects unauthenticated requests`, async () => {
      const response = await invoke(functionName)
      expect(response.status).toBe(401)
    })

    it(`${functionName} rejects an authenticated non-admin`, async () => {
      const response = await invoke(functionName, ordinary.accessToken)
      expect(response.status).toBe(403)
    })

    it(`${functionName} permits a database-authorised admin`, async () => {
      const response = await invoke(functionName, founder.accessToken)
      expect(response.status).toBe(200)
      const payload = await response.json() as {
        generatedAt?: unknown
        health?: { checks?: Array<{ id?: string; status?: string }> }
        plans?: { byTier?: { free?: number; paid?: number; premium?: number } }
      }
      expect(payload.generatedAt).toEqual(expect.any(String))
      if (functionName === 'admin-operations') {
        const pathToLive = payload.health?.checks?.find((check) => check.id === 'path-to-live')
        expect(pathToLive).toBeDefined()
        expect(['Healthy', 'Attention needed', 'Unknown']).toContain(pathToLive?.status)
      }
      if (functionName === 'learner-plan-operations') {
        expect(payload.plans?.byTier?.free).toEqual(expect.any(Number))
      }
    }, functionName === 'admin-operations' ? 30_000 : 5_000)
  }

  it('defaults learner plan state, blocks self-upgrade and records protected Admin assignment', async () => {
    const initial = await loadLearnerPlanContext(ordinary.client, ordinary.user.id)
    expect(initial).toEqual({
      tier: 'free',
      capabilitySet: 'current_core_student_access',
      integrity: 'valid',
    })

    const { data: crossUserPlans, error: crossUserReadError } = await ordinary.client
      .from('learner_plan_state')
      .select('user_id,tier')
      .eq('user_id', founder.user.id)
    expect(crossUserReadError).toBeNull()
    expect(crossUserPlans).toEqual([])

    const { error: selfUpdateError } = await ordinary.client
      .from('learner_plan_state')
      .update({ tier: 'premium' })
      .eq('user_id', ordinary.user.id)
    expect(selfUpdateError).not.toBeNull()

    const response = await invoke('learner-plan-operations', founder.accessToken, {
      action: 'assign',
      targetUserId: ordinary.user.id,
      tier: 'paid',
    })
    expect(response.status).toBe(200)
    const payload = await response.json() as {
      assignment?: { userId?: string; tier?: string; assignmentSource?: string; assignedBy?: string }
    }
    expect(payload.assignment).toMatchObject({
      userId: ordinary.user.id,
      tier: 'paid',
      assignmentSource: 'admin_manual',
      assignedBy: founder.user.id,
    })

    const reloaded = await loadLearnerPlanContext(ordinary.client, ordinary.user.id)
    expect(reloaded).toEqual({
      tier: 'paid',
      capabilitySet: 'current_core_student_access',
      integrity: 'valid',
    })

    const { data: events, error: eventsError } = await admin
      .from('learner_plan_assignment_events')
      .select('previous_tier,tier,assigned_by')
      .eq('user_id', ordinary.user.id)
      .order('occurred_at', { ascending: false })
      .limit(1)
    expect(eventsError).toBeNull()
    expect(events?.[0]).toEqual({
      previous_tier: 'free',
      tier: 'paid',
      assigned_by: founder.user.id,
    })
  })
})
