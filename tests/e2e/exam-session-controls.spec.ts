import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'

async function seedSyntheticSession(page: Page) {
  const userId = '00000000-0000-4000-8000-000000000001'
  await page.addInitScript(({ key, id }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem(key, JSON.stringify({
      access_token: `${header}.${payload}.synthetic`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 4102444800,
      refresh_token: 'synthetic-refresh-token',
      user: {
        id,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'synthetic-exam-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'synthetic-exam-test@revision.invalid',
        user_metadata: { first_name: 'Synthetic' },
        app_metadata: { provider: 'email', providers: ['email'] },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      }),
    })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/profiles**', async (route) => route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) }))
  await page.route('**/rest/v1/revision_assessments**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }))
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_activity_events**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
}

async function openAsPaper2Exam(page: Page) {
  await page.goto(`${appPath}#/subjects`)
  const businessCard = page.locator('.subject-card').filter({ hasText: 'Business' }).first()
  await businessCard.getByRole('button', { name: /Open Business/ }).click()
  await page.getByLabel('AQA AS Business').getByRole('button', { name: 'Open course' }).click()
  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' })
  await paper.locator('summary').click()
  await paper.getByRole('button', { name: 'Start timed exam' }).first().click()
}

test('timed exam opens as a dedicated page and pause fully blocks the paper while freezing the timer', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)

  const session = page.locator('.exam-session-page')
  await expect(session).toBeVisible()
  expect(await session.evaluate((element) => getComputedStyle(element).position)).toBe('fixed')
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stop exam' })).toBeVisible()

  await page.getByRole('button', { name: 'Pause' }).click()
  const pauseDialog = page.getByRole('dialog', { name: 'Exam paused' })
  await expect(pauseDialog).toBeVisible()
  await expect(page.locator('.exam-session')).toHaveAttribute('aria-hidden', 'true')

  const timer = page.locator('.timer')
  const pausedAt = await timer.textContent()
  await page.waitForTimeout(1600)
  await expect(timer).toHaveText(pausedAt ?? '')

  await pauseDialog.getByRole('button', { name: /Continue exam/ }).click()
  await expect(pauseDialog).toHaveCount(0)
  await expect.poll(async () => timer.textContent()).not.toBe(pausedAt)
})

test('stop exam requires confirmation and lets the learner either continue or discard the attempt', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)

  await page.getByRole('button', { name: 'Stop exam' }).click()
  let stopDialog = page.getByRole('dialog', { name: 'Are you sure?' })
  await expect(stopDialog).toBeVisible()
  await expect(stopDialog.getByText(/discard the answers/)).toBeVisible()
  await stopDialog.getByRole('button', { name: 'Continue exam' }).click()
  await expect(stopDialog).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()

  await page.getByRole('button', { name: 'Stop exam' }).click()
  stopDialog = page.getByRole('dialog', { name: 'Are you sure?' })
  await stopDialog.getByRole('button', { name: 'Yes, stop exam' }).click()

  await expect(page.locator('.exam-session-page')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Full 90-minute exam' })).toBeVisible()
})
