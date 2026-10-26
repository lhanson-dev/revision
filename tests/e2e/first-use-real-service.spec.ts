import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const integrationEnabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const supabaseUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const publishableKey = process.env.SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const appPath = '/revision/app/'
const courseId = 'aqa:aqa-a-level:7132'

test('new account uses real local auth and persists first learning value through Home', async ({ page }) => {
  test.skip(!integrationEnabled, 'Runs only in the isolated Supabase browser integration CI job.')

  // The service role must never be sent to the browser or a remotely hosted project.
  const origin = new URL(supabaseUrl)
  if (origin.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(origin.hostname) || origin.port !== '54321') {
    throw new Error('First-use real-service assurance must target the isolated local Supabase API.')
  }
  if (!publishableKey || !serviceRoleKey) {
    throw new Error('Missing isolated Supabase integration credentials.')
  }

  const admin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const learner: SupabaseClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const email = `first-use-real-service-${crypto.randomUUID()}@revision.invalid`
  const password = `Revision-${crypto.randomUUID()}-A1!`
  let userId: string | null = null

  try {
    // Real product sign-up UI → local GoTrue, not a forged JWT or an admin-seeded
    // completed onboarding account. Local email confirmation is disabled in CI.
    await page.goto(appPath)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.getByLabel('First name').fill('New')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    // Normal first-time registration must not need a private admission code.
    await expect(page.getByLabel('Private testing code')).toHaveCount(0)
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'How will you use Revision?' })).toBeVisible()

    // Independent authenticated Data API client validates what the real browser
    // session wrote, rather than relying on a browser's apparent success state.
    const { data: signedIn, error: signInError } = await learner.auth.signInWithPassword({ email, password })
    if (signInError || !signedIn.user) {
      throw new Error(`Could not read the isolated newly registered account: ${signInError?.message ?? 'missing user'}`)
    }
    userId = signedIn.user.id
    expect(signedIn.user.user_metadata?.first_name).toBe('New')

    const { data: initialState, error: initialError } = await learner
      .from('account_experience_state').select('onboarding_stage').eq('user_id', userId).maybeSingle()
    expect(initialError).toBeNull()
    expect(initialState).toBeNull()

    await page.getByRole('button', { name: /^Student\b/ }).click()
    await expect(page.getByRole('heading', { name: 'Add your courses' })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('checkbox', { name: 'Business' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
    await page.getByRole('button', { name: 'Add 1 course' }).click()

    await expect(page.getByText('Step 4 of 4')).toBeVisible()
    await page.getByRole('button', { name: 'Skip for now' }).click()
    await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()

    const { data: memberships, error: coursesError } = await learner
      .from('learner_courses').select('course_id').eq('user_id', userId)
    expect(coursesError).toBeNull()
    expect(memberships).toEqual([{ course_id: courseId }])

    // No diagnostic answer, calendar date or weekly availability is required
    // before the first useful revision activity.
    await page.getByRole('button', { name: 'Skip for now' }).click()
    await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Start revision' }).click()
    await expect(page.getByText('Your first useful revision', { exact: true })).toBeVisible()

    const { data: beforeEvidence, error: beforeError } = await learner
      .from('learning_evidence').select('evidence_id').eq('user_id', userId)
    expect(beforeError).toBeNull()
    expect(beforeEvidence).toEqual([])

    await page.getByRole('button', { name: 'Show answer' }).click()
    await page.getByRole('button', { name: 'Knew it' }).click()
    await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'You knew that one.' })).toBeVisible()

    const { data: afterEvidence, error: afterError } = await learner
      .from('learning_evidence').select('evidence_id,module_id,topic_id,payload').eq('user_id', userId)
    expect(afterError).toBeNull()
    expect(afterEvidence).toHaveLength(1)
    expect(afterEvidence?.[0].evidence_id).toBeTruthy()
    expect(afterEvidence?.[0].module_id).toContain('business-aqa-a-level-7132-')
    expect(afterEvidence?.[0].topic_id).toBeTruthy()
    expect(afterEvidence?.[0].payload?.source).toBe('flashcard')

    const { data: noStartingEvidence, error: startingError } = await learner
      .from('starting_check_evidence').select('evidence_id').eq('user_id', userId)
    expect(startingError).toBeNull()
    expect(noStartingEvidence).toEqual([])

    await page.reload()
    await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do next\./ })).toBeVisible()

    const { data: finalState, error: finalError } = await learner
      .from('account_experience_state')
      .select('onboarding_stage,onboarding_completed_at')
      .eq('user_id', userId).single()
    expect(finalError).toBeNull()
    expect(finalState?.onboarding_stage).toBe('complete')
    expect(finalState?.onboarding_completed_at).toBeTruthy()

    await page.reload()
    await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do next\./ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'How will you use Revision?' })).toHaveCount(0)
    const { data: finalEvidence, error: reloadError } = await learner
      .from('learning_evidence').select('evidence_id').eq('user_id', userId)
    expect(reloadError).toBeNull()
    expect(finalEvidence).toHaveLength(1)
    expect(finalEvidence?.[0].evidence_id).toBe(afterEvidence?.[0].evidence_id)
  } finally {
    await learner.auth.signOut()
    // Clean up even if UI sign-up succeeds but a later assertion fails before
    // the independent learner client receives the new account ID.
    if (!userId) {
      const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      userId = users?.users.find((user) => user.email === email)?.id ?? null
    }
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Isolated first-use test account cleanup must succeed').toBeNull()
    }
  }
})
