import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000091'

async function seedAdminSession(page: Page) {
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
        email: 'admin-transition-test@revision.invalid',
        email_confirmed_at: '2026-08-21T18:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Admin' },
        identities: [],
        created_at: '2026-08-21T18:00:00.000Z',
        updated_at: '2026-08-21T18:00:00.000Z',
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
        email: 'admin-transition-test@revision.invalid',
        email_confirmed_at: '2026-08-21T18:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Admin' },
        identities: [],
        created_at: '2026-08-21T18:00:00.000Z',
        updated_at: '2026-08-21T18:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: true }),
    })
  })

  for (const endpoint of [
    'learning_evidence',
    'revision_assessments',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events',
  ]) {
    await page.route(`**/rest/v1/${endpoint}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }

  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
}

test('Admin entry never mounts the legacy blue REV Home hero', async ({ page }) => {
  await seedAdminSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Admin,\s*what shall we do today\?/ })).toBeVisible()

  await page.evaluate(() => {
    document.documentElement.dataset.legacyRevHeroObserved = 'false'
    const observer = new MutationObserver(() => {
      if (document.querySelector('.planner-runtime .rev-hero')) {
        document.documentElement.dataset.legacyRevHeroObserved = 'true'
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })

  const viewportWidth = page.viewportSize()?.width ?? 0
  if (viewportWidth <= 960) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()
    await drawer.getByRole('button', { name: 'Admin', exact: true }).click()
  } else {
    await page.getByRole('button', { name: 'Admin account menu' }).click()
    await page.getByRole('menu', { name: 'Profile menu' }).getByRole('menuitem', { name: 'Admin' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()
  await expect(page.locator('.planner-runtime .rev-hero')).toHaveCount(0)
  await expect(page.locator('html')).toHaveAttribute('data-legacy-rev-hero-observed', 'false')
})
