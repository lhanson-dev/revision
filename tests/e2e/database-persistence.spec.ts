import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

const integrationEnabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const supabaseUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const appPath = '/revision/app/'

test.describe('database-backed learner persistence', () => {
  test.skip(!integrationEnabled, 'Runs only against the isolated Supabase CI stack')

  let admin: SupabaseClient
  let user: User
  let email: string
  let password: string

  test.beforeAll(async () => {
    if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for browser database integration assurance')

    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    email = `browser-persistence-${crypto.randomUUID()}@revision.invalid`
    password = `Revision-${crypto.randomUUID()}-A1!`
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (error || !data.user) throw new Error(`Could not create browser integration user: ${error?.message ?? 'missing user'}`)
    user = data.user
  })

  test.afterAll(async () => {
    if (user?.id) await admin?.auth.admin.deleteUser(user.id)
  })

  test('a scored Practice result survives a real browser reload and appears in Progress', async ({ page }) => {
    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: /Hey .*what shall we do today\?/ })).toBeVisible()

    const primaryNavName = (page.viewportSize()?.width ?? 0) <= 960 ? 'Mobile navigation' : 'Primary navigation'
    await page.getByRole('navigation', { name: primaryNavName }).getByRole('button', { name: /Subjects/ }).click()

    const businessCard = page.locator('.subject-card').filter({ hasText: 'Business' }).first()
    await businessCard.getByRole('button', { name: /Open Business/ }).click()
    await page.getByLabel('AQA AS Business').getByRole('button', { name: 'Open course' }).click()

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
  })
})
