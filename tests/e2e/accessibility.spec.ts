import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function seedSyntheticSession(page: Page) {
  const userId = '00000000-0000-4000-8000-000000000001'
  await page.addInitScript(({ key, id }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const accessToken = `${header}.${payload}.synthetic`
    localStorage.setItem(key, JSON.stringify({
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 4102444800,
      refresh_token: 'synthetic-refresh-token',
      user: {
        id,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'synthetic-accessibility-test@revision.invalid',
        email_confirmed_at: '2026-08-19T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
        created_at: '2026-08-19T12:00:00.000Z',
        updated_at: '2026-08-19T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  for (const path of [
    'learning_evidence',
    'revision_assessments',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events',
  ]) {
    await page.route(`**/rest/v1/${path}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
    })
  })
}

async function expectWcagBaseline(page: Page, surface: string) {
  const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  const violations = result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target),
  }))
  expect(violations, `${surface} must have no automated WCAG A/AA violations`).toEqual([])
}

test('sign-in meets the automated WCAG A/AA baseline', async ({ page }) => {
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expectWcagBaseline(page, 'Sign in')
})

test('Home, Plan and REV meet the automated WCAG A/AA baseline', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: 'What matters today?' })).toBeVisible()
  await expectWcagBaseline(page, 'Home')

  const primaryNavName = (page.viewportSize()?.width ?? 0) <= 960 ? 'Mobile navigation' : 'Primary navigation'
  const primaryNav = page.getByRole('navigation', { name: primaryNavName })

  await primaryNav.getByRole('button', { name: /Plan/ }).click()
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()
  await expectWcagBaseline(page, 'Plan')

  await page.getByRole('navigation', { name: primaryNavName }).getByRole('button', { name: /REV/ }).click()
  await expect(page.getByRole('heading', { name: 'REV', exact: true })).toBeVisible()
  await expectWcagBaseline(page, 'REV')
})
