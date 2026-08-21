import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000101'

function isResponsiveLayout(page: Page) {
  return (page.viewportSize()?.width ?? 0) <= 960
}

async function seedSession(page: Page) {
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
        email: 'context-nav-test@revision.invalid',
        email_confirmed_at: '2026-08-21T19:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-21T19:00:00.000Z',
        updated_at: '2026-08-21T19:00:00.000Z',
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
        email: 'context-nav-test@revision.invalid',
        email_confirmed_at: '2026-08-21T19:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-21T19:00:00.000Z',
        updated_at: '2026-08-21T19:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
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

async function navigation(page: Page) {
  if (isResponsiveLayout(page)) {
    const currentDrawer = page.getByRole('dialog', { name: 'Navigation menu' })
    if (!(await currentDrawer.count())) {
      await page.getByRole('button', { name: 'Open menu' }).click()
    }
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()
    return drawer.getByRole('navigation', { name: 'Mobile navigation' })
  }
  return page.getByRole('navigation', { name: 'Primary navigation' })
}

async function clickNavigation(page: Page, label: string) {
  const nav = await navigation(page)
  await nav.getByRole('button', { name: label, exact: true }).click()
  if (isResponsiveLayout(page)) {
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toHaveCount(0)
  }
}

test('Subjects expands only the active academic branch from subject to course sections', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Synthetic,\s*what shall we do today\?/ })).toBeVisible()

  let nav = await navigation(page)
  await expect(nav.getByRole('group', { name: 'Subjects navigation' })).toHaveCount(0)
  if (isResponsiveLayout(page)) {
    await page.getByRole('button', { name: 'Close menu' }).click()
  }

  await clickNavigation(page, 'Subjects')
  await expect(page.getByRole('heading', { name: 'Subjects', exact: true })).toBeVisible()

  nav = await navigation(page)
  let subjectsTree = nav.getByRole('group', { name: 'Subjects navigation' })
  await expect(subjectsTree).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'All subjects', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(subjectsTree.getByRole('button', { name: 'Business', exact: true })).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'AQA AS Business', exact: true })).toHaveCount(0)
  if (isResponsiveLayout(page)) await page.getByRole('button', { name: 'Close menu' }).click()

  await clickNavigation(page, 'Business')
  await expect(page.getByRole('heading', { name: 'Business', exact: true })).toBeVisible()

  nav = await navigation(page)
  subjectsTree = nav.getByRole('group', { name: 'Subjects navigation' })
  await expect(subjectsTree.getByRole('button', { name: 'Business', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(subjectsTree.getByRole('button', { name: 'AQA AS Business', exact: true })).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'AQA A-level Business', exact: true })).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'Learn', exact: true })).toHaveCount(0)
  if (isResponsiveLayout(page)) await page.getByRole('button', { name: 'Close menu' }).click()

  await clickNavigation(page, 'AQA AS Business')
  await expect(page.getByRole('heading', { name: 'AS Business', exact: true })).toBeVisible()

  nav = await navigation(page)
  subjectsTree = nav.getByRole('group', { name: 'Subjects navigation' })
  await expect(subjectsTree.getByRole('button', { name: 'AQA AS Business', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(subjectsTree.getByRole('button', { name: 'Overview', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(subjectsTree.getByRole('button', { name: 'Learn', exact: true })).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'Practice', exact: true })).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'Exam Prep', exact: true })).toBeVisible()
  await expect(subjectsTree.getByRole('button', { name: 'Progress', exact: true })).toBeVisible()
  if (isResponsiveLayout(page)) await page.getByRole('button', { name: 'Close menu' }).click()

  await clickNavigation(page, 'Learn')
  await expect(page.getByRole('heading', { name: 'Learn · AQA AS Business' })).toBeVisible()

  nav = await navigation(page)
  subjectsTree = nav.getByRole('group', { name: 'Subjects navigation' })
  await expect(subjectsTree.getByRole('button', { name: 'Learn', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(subjectsTree.getByRole('button', { name: 'AQA A-level Business', exact: true })).toBeVisible()
})
