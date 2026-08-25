import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000041'
const businessCourseId = 'aqa:aqa-a-level:7132'

async function seedReturningStudent(page: Page) {
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
        email: 'returning-home-test@revision.invalid',
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
        email: 'returning-home-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: businessCourseId, created_at: '2026-08-22T18:00:00.000Z' }]) })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_activity_events**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function expectApprovedHeroFidelity(page: Page) {
  await expect(page.getByText('Powered by', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'REV' }).filter({ has: page.locator('.rev-compact-wordmark-e') })).toHaveCount(1)

  const hero = page.locator('.returning-home-hero')
  const prompt = page.locator('.returning-home-hero > .living-home-prompt')
  const presence = page.locator('.returning-home-hero .rev-presence-hero')
  const [heroBox, promptBox, presenceBox] = await Promise.all([hero.boundingBox(), prompt.boundingBox(), presence.boundingBox()])
  expect(heroBox).not.toBeNull()
  expect(promptBox).not.toBeNull()
  expect(presenceBox).not.toBeNull()
  if (!heroBox || !promptBox || !presenceBox) return

  expect(promptBox.x - heroBox.x).toBeLessThanOrEqual(50)
  expect((heroBox.x + heroBox.width) - (promptBox.x + promptBox.width)).toBeLessThanOrEqual(50)

  const viewportWidth = page.viewportSize()?.width ?? 1200
  const minimumRevSize = viewportWidth <= 620 ? 170 : viewportWidth <= 960 ? 242 : viewportWidth <= 1160 ? 255 : 320
  expect(presenceBox.width).toBeGreaterThanOrEqual(minimumRevSize)

  const haloBackground = await page.locator('.returning-home-hero .rev-presence-hero .rev-halo').evaluate((element) => getComputedStyle(element).backgroundImage)
  expect(haloBackground).toContain('rgba(255, 255, 255, 0.38)')
  expect(haloBackground).toContain('rgba(230, 251, 244, 0.88)')
}

test('Returning Home keeps REV first and gives a useful fallback without planner setup', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: 'Hi Synthetic, what shall we do today?' })).toBeVisible()
  await expect(page.getByLabel('Ask REV anything')).toBeVisible()
  await expect(page.locator('.returning-home-hero .rev-presence-hero')).toHaveCount(1)
  await expectApprovedHeroFidelity(page)
  await expect(page.getByRole('heading', { name: 'Today’s revision plan' })).toBeVisible()
  await expect(page.getByText('Start here', { exact: true })).toBeVisible()
  await expect(page.locator('.returning-home-start-card')).toHaveAttribute('data-subject-accent', 'business')
  await expect(page.locator('.home-subject-chip')).toHaveText('Business')
  await expect(page.getByRole('heading', { name: 'Business', level: 3 })).toBeVisible()
  await expect(page.getByRole('button', { name: /Why this/ })).toHaveCount(0)
  await expect(page.locator('.planner-home-primary-grid')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('promoted Home task starts the exact quick-check topic in one action', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)

  const start = page.getByRole('button', { name: /^Start \d+ min$/ })
  await expect(start).toBeVisible()
  await start.click()

  await expect(page.locator('.home-focused-activity')).toBeVisible()
  await expect(page.getByText('Quick check', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeVisible()
  await expect(page.getByRole('button', { name: '← Back to Home' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})
