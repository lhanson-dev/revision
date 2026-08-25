import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import {
  completeStudentFirstUse,
  establishStudentExperience,
} from '../../src/services/onboarding/student-first-use-service'

const integrationEnabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const supabaseUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const publishableKey = process.env.SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const appPath = '/revision/app/'
const asCourseId = 'aqa:aqa-as:7131'

test.describe('database-backed learner persistence', () => {
  test.skip(!integrationEnabled, 'Runs only against the isolated Supabase CI stack')

  let admin: SupabaseClient
  let learner: SupabaseClient
  let user: User
  let email: string
  let password: string

  test.beforeAll(async () => {
    if (!serviceRoleKey || !publishableKey) throw new Error('Supabase service-role and publishable keys are required for browser database integration assurance')

    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    email = `browser-persistence-${crypto.randomUUID()}@revision.invalid`
    password = `Revision-${crypto.randomUUID()}-A1!`
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (error || !data.user) throw new Error(`Could not create browser integration user: ${error?.message ?? 'missing user'}`)
    user = data.user

    learner = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    const { error: signInError } = await learner.auth.signInWithPassword({ email, password })
    if (signInError) throw new Error(`Could not authenticate browser integration learner: ${signInError.message}`)

    // This scenario validates ordinary FI-020 course/evidence persistence rather
    // than GJ-01. Establish and complete its synthetic Student through the same
    // owner-scoped service path as the product instead of bypassing the initial
    // state policy with a privileged or one-step fixture write.
    await establishStudentExperience(learner, user.id)
    await completeStudentFirstUse(learner, user.id)
  })

  test.afterAll(async () => {
    await learner?.auth.signOut()
    if (user?.id) await admin?.auth.admin.deleteUser(user.id)
  })

  test('course membership and scored Practice evidence survive reload, removal and re-add truthfully', async ({ page }) => {
    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: /Hey .*what shall we do today\?/ })).toBeVisible()

    // This user is created after the FI-020 migration, so it must not inherit the
    // bounded existing-user course compatibility seed.
    await page.goto(`${appPath}#/courses`)
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add your first course' })).toBeVisible()

    await page.getByRole('button', { name: 'Add Course' }).first().click()
    const addDialog = page.getByRole('dialog', { name: 'Add Course' })
    await expect(addDialog).toBeVisible()
    const asChoice = addDialog.getByRole('listitem').filter({ hasText: 'AQA AS Business' })
    await asChoice.getByRole('button', { name: 'Add' }).click()

    const asCourseCard = page.locator('.course-card').filter({ hasText: 'AQA AS Business' }).first()
    await expect(asCourseCard.getByRole('button', { name: 'Open course' })).toBeVisible()

    const { data: firstMemberships, error: firstMembershipError } = await learner
      .from('learner_courses')
      .select('course_id')
    expect(firstMembershipError).toBeNull()
    expect(firstMemberships).toEqual([{ course_id: asCourseId }])

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
    await expect(page.locator('.course-card').filter({ hasText: 'AQA AS Business' }).first()).toBeVisible()

    await page.locator('.course-card').filter({ hasText: 'AQA AS Business' }).first().getByRole('button', { name: 'Open course' }).click()
    const courseNav = page.getByRole('navigation', { name: 'AQA AS Business navigation' })
    await courseNav.getByRole('button', { name: 'Practice' }).click()
    await expect(page.getByRole('heading', { name: 'Practice · AQA AS Business' })).toBeVisible()

    await page.getByRole('tab', { name: 'Quick check' }).click()
    await page.getByRole('radio').first().check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await expect(page.getByRole('button', { name: 'Next question' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Practice · AQA AS Business' })).toBeVisible()
    await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Progress' }).click()
    await expect(page.getByRole('heading', { name: 'What the evidence says' })).toBeVisible()

    const scoredActivities = page.locator('.progress-overview article').filter({ hasText: 'Scored activities' })
    await expect(scoredActivities.locator('strong')).toHaveText('1')
    await expect(page.getByText(/1 scored activity/).first()).toBeVisible()

    // Removal changes active programme context but must not erase learning history.
    await page.goto(`${appPath}#/courses`)
    const removableCard = page.locator('.course-card').filter({ hasText: 'AQA AS Business' }).first()
    await removableCard.getByRole('button', { name: 'Remove course' }).click()
    const removeDialog = page.getByRole('dialog', { name: /Remove AQA AS Business/ })
    await expect(removeDialog).toBeVisible()
    await removeDialog.getByRole('button', { name: 'Remove course' }).click()
    await expect(page.getByRole('heading', { name: 'Add your first course' })).toBeVisible()

    const { data: removedMemberships, error: removedMembershipError } = await learner
      .from('learner_courses')
      .select('course_id')
    expect(removedMembershipError).toBeNull()
    expect(removedMemberships).toEqual([])

    const { data: retainedEvidence, error: retainedEvidenceError } = await learner
      .from('learning_evidence')
      .select('evidence_id')
    expect(retainedEvidenceError).toBeNull()
    expect(retainedEvidence?.length).toBe(1)

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Add your first course' })).toBeVisible()

    // Re-adding the course restores programme scope and its historical evidence.
    await page.getByRole('button', { name: 'Add Course' }).first().click()
    const readdDialog = page.getByRole('dialog', { name: 'Add Course' })
    await readdDialog.getByRole('listitem').filter({ hasText: 'AQA AS Business' }).getByRole('button', { name: 'Add' }).click()
    await page.locator('.course-card').filter({ hasText: 'AQA AS Business' }).first().getByRole('button', { name: 'Open course' }).click()
    await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Progress' }).click()
    await expect(page.locator('.progress-overview article').filter({ hasText: 'Scored activities' }).locator('strong')).toHaveText('1')
  })
})
