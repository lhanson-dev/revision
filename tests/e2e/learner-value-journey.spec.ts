import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { completeStudentFirstUse, establishStudentExperience } from '../../src/services/onboarding/student-first-use-service'

// This test uses an actual local GoTrue account, PostgREST persistence and the
// canonical /revision/app/ React runtime. It does NOT use browser route mocks,
// forged sessions, production credentials or real children's data.
const enabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const appPath = '/revision/app/'
const businessId = 'aqa:aqa-a-level:7132'
const psychologyId = 'aqa:aqa-a-level:7182'

test('one ordinary real-auth learner can practise, see evidence, plan and prepare across Business and Psychology', async ({ page }) => {
  test.skip(!enabled, 'Requires the disposable local Supabase browser integration stack.')
  test.setTimeout(120_000)
  const url = process.env.SUPABASE_URL ?? ''
  const publishableKey = process.env.SUPABASE_ANON_KEY ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const origin = new URL(url)
  if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname) || origin.port !== '54321') {
    throw new Error('Never exercise the learner acceptance scenario against production Auth.')
  }
  if (!publishableKey || !serviceKey) throw new Error('Missing isolated test stack credentials.')

  const admin: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const learner: SupabaseClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const email = `family-value-${crypto.randomUUID()}@revision.invalid`
  const password = `Synthetic-${crypto.randomUUID()}-A1!`
  let userId: string | undefined

  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createError || !created.user) throw new Error(`Synthetic account creation failed: ${createError?.message ?? 'unknown'}`)
    userId = created.user.id

    const { error: loginError } = await learner.auth.signInWithPassword({ email, password })
    if (loginError) throw loginError
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)

    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: 'Add your first course' })).toBeVisible()

    // Add the *actual* two A-level courses through the same UI as a learner.
    for (const course of ['A-level Business', 'A-level Psychology']) {
      await page.goto(`${appPath}#/courses`)
      await page.getByRole('button', { name: /Add course/i }).first().click()
      const dialog = page.getByRole('dialog', { name: /Add course/i })
      await dialog.getByRole('listitem').filter({ hasText: course })
        .getByRole('button', { name: /Add course/i }).click()
      await expect(dialog).toHaveCount(0)
    }

    const { data: courses, error: courseError } = await learner
      .from('learner_courses').select('course_id').eq('user_id', userId)
    expect(courseError).toBeNull()
    expect(courses?.map((item) => item.course_id).sort()).toEqual([businessId, psychologyId].sort())

    // Complete one scored Business Practice question. A displayed feedback
    // panel alone is insufficient: verify a genuinely owner-readable answer.
    await page.goto(`${appPath}#/courses/${encodeURIComponent(businessId)}/practice`)
    await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
    await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
    await page.locator('.practice-question__options button').first().click()
    await page.getByRole('button', { name: 'Fairly sure' }).click()
    await expect(page.locator('.ui-feedback-bar')).toBeVisible()
    await expect.poll(async () => {
      const { data, error } = await learner.from('learning_evidence')
        .select('evidence_id,payload').eq('user_id', userId)
      if (error) throw error
      return data?.filter((entry) => entry.payload?.source === 'multiple_choice').length ?? 0
    }).toBe(1)

    await page.reload()
    await page.goto(`${appPath}#/progress`)
    await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Understanding' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Exam readiness' }).first()).toBeVisible()

    // Real learner availability is saved through Plan and survives a reload.
    await page.goto(`${appPath}#/plan`)
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exam dates', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Study time', exact: true }).click()
    await page.getByRole('button', { name: 'More study time on Monday' }).click()
    await page.getByRole('button', { name: 'Save and re-plan' }).click()
    await expect(page.getByText('Study time saved. REV has re-planned around it. Sessions you have done stay put.')).toBeVisible()
    const { data: availability, error: availabilityError } = await learner
      .from('revision_availability_profiles').select('monday_minutes').eq('user_id', userId).single()
    expect(availabilityError).toBeNull()
    expect(availability?.monday_minutes).toBe(15)

    for (const courseId of [businessId, psychologyId]) {
      await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/exam-prep`)
      await expect(page.getByRole('heading', { name: 'Get ready for the exams' })).toBeVisible()
      await expect(page.locator('.exam-mock').first()).toBeVisible()
      await expect(page.getByText('Planner pilot:', { exact: false })).toHaveCount(0)
    }
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Synthetic learner cleanup must succeed').toBeNull()
    }
  }
})
