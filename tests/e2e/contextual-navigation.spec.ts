import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000101'
const asCourseId = 'aqa:aqa-as:7131'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

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
  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { user_id: userId, course_id: asCourseId, created_at: '2026-08-22T18:00:00.000Z' },
        { user_id: userId, course_id: aLevelCourseId, created_at: '2026-08-22T18:00:01.000Z' },
      ]),
    })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
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

async function closeResponsiveNavigation(page: Page) {
  if (!isResponsiveLayout(page)) return
  const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
  await drawer.getByRole('button', { name: 'Close menu' }).click()
  await expect(drawer).toHaveCount(0)
}

async function clickNavigation(page: Page, label: string) {
  const nav = await navigation(page)
  await nav.getByRole('button', { name: label, exact: true }).click()
  if (isResponsiveLayout(page)) {
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toHaveCount(0)
  }
}

test('Courses expands saved courses and only the active course into focused sections', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Synthetic,\s*what shall we do today\?/ })).toBeVisible()

  let nav = await navigation(page)
  await expect(nav.getByRole('group', { name: 'Courses navigation' })).toHaveCount(0)
  await closeResponsiveNavigation(page)

  await clickNavigation(page, 'Courses')
  await expect(page.getByRole('heading', { name: 'Courses', exact: true })).toBeVisible()

  nav = await navigation(page)
  let coursesTree = nav.getByRole('group', { name: 'Courses navigation' })
  await expect(coursesTree).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'All courses', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'AQA A-level Business', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: /Business Learn$/ })).toHaveCount(0)
  await closeResponsiveNavigation(page)

  await clickNavigation(page, 'AQA AS Business')
  await expect(page.getByRole('heading', { name: 'AQA AS Business', exact: true, level: 1 })).toBeVisible()

  nav = await navigation(page)
  coursesTree = nav.getByRole('group', { name: 'Courses navigation' })
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business Overview', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business Learn', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business Practice', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business Exam Prep', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business Progress', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'AQA A-level Business Overview', exact: true })).toHaveCount(0)
  await closeResponsiveNavigation(page)

  await clickNavigation(page, 'AQA AS Business Learn')
  await expect(page.getByRole('heading', { name: 'Learn · AQA AS Business' })).toBeVisible()

  nav = await navigation(page)
  coursesTree = nav.getByRole('group', { name: 'Courses navigation' })
  await expect(coursesTree.getByRole('button', { name: 'AQA AS Business Learn', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(coursesTree.getByRole('button', { name: 'AQA A-level Business', exact: true })).toBeVisible()
  await expect(coursesTree.getByRole('button', { name: 'AQA A-level Business Learn', exact: true })).toHaveCount(0)
})
