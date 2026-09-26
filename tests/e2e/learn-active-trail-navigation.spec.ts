import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000181'
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
        email: 'active-trail-test@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
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
        email: 'active-trail-test@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
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
        { user_id: userId, course_id: asCourseId, created_at: '2026-08-23T12:00:00.000Z' },
        { user_id: userId, course_id: aLevelCourseId, created_at: '2026-08-23T12:00:01.000Z' },
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
    if (!(await currentDrawer.count())) await page.getByRole('button', { name: 'Open menu' }).click()
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
  if (isResponsiveLayout(page)) await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toHaveCount(0)
}

test('Learn uses an active-trail contents tree and page navigation returns to the top', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hi Synthetic,\s*what shall we do today\?/ })).toBeVisible()

  await clickNavigation(page, 'Courses')
  await clickNavigation(page, 'AQA AS Business')
  await clickNavigation(page, 'AQA AS Business Learn')

  await expect(page.getByRole('heading', { name: 'Purpose, objectives & profit', level: 2 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Learn location' })).toContainText('Learn')

  let nav = await navigation(page)
  let learnContents = nav.getByLabel('Learn contents')
  const businessChapter = learnContents.getByRole('button', { name: '1. What is Business?', exact: true })
  const activeSingleton = learnContents.locator('.runtime-context-nav-learn-singleton-page').filter({ hasText: 'Purpose, objectives & profit' })
  const siblingSingleton = learnContents.locator('.runtime-context-nav-learn-singleton-page').filter({ hasText: 'Business forms & ownership' })

  await expect(businessChapter).toHaveAttribute('aria-expanded', 'true')
  await expect(activeSingleton).toHaveAttribute('aria-current', 'page')
  await expect(siblingSingleton).not.toHaveAttribute('aria-expanded')
  await expect(learnContents.getByRole('button', { name: 'Purpose, objectives & profit', exact: true })).toHaveCount(1)
  await expect(learnContents.getByRole('button', { name: 'Business forms & ownership', exact: true })).toHaveCount(1)
  await expect(learnContents.locator('.runtime-context-nav-group-button[aria-expanded]').filter({ hasText: 'Purpose, objectives & profit' })).toHaveCount(0)

  const hashBeforeDisclosure = await page.evaluate(() => window.location.hash)
  const financeChapter = learnContents.getByRole('button', { name: '5. Financial Management', exact: true })
  await financeChapter.click()
  await expect(financeChapter).toHaveAttribute('aria-expanded', 'true')
  await expect(businessChapter).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => window.location.hash)).toBe(hashBeforeDisclosure)

  await closeResponsiveNavigation(page)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  const sequentialNavigation = page.getByRole('navigation', { name: 'Teaching page navigation' })
  await sequentialNavigation.getByRole('button').filter({ hasText: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Business forms & ownership', level: 2 })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)

  nav = await navigation(page)
  learnContents = nav.getByLabel('Learn contents')
  await expect(learnContents.getByRole('button', { name: '1. What is Business?', exact: true })).toHaveAttribute('aria-expanded', 'true')
  await expect(learnContents.locator('.runtime-context-nav-learn-singleton-page').filter({ hasText: 'Business forms & ownership' })).toHaveAttribute('aria-current', 'page')
  await expect(learnContents.getByRole('button', { name: 'Business forms & ownership', exact: true })).toHaveCount(1)

  const drawerOrRail = isResponsiveLayout(page) ? page.getByRole('dialog', { name: 'Navigation menu' }) : page.locator('.runtime-sidebar')
  const overflow = await drawerOrRail.evaluate((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
})

test('Learn removes redundant singleton levels but preserves meaningful group-to-page hierarchy', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hi Synthetic,\s*what shall we do today\?/ })).toBeVisible()

  await clickNavigation(page, 'Courses')
  await clickNavigation(page, 'AQA A-level Business')
  await clickNavigation(page, 'AQA A-level Business Learn')

  const nav = await navigation(page)
  const learnContents = nav.getByLabel('Learn contents')
  const financeChapter = learnContents.getByRole('button', { name: '5. Financial Management', exact: true })
  await financeChapter.click()
  await expect(financeChapter).toHaveAttribute('aria-expanded', 'true')

  const objectives = learnContents.getByRole('button', { name: 'Objectives, cash & profit', exact: true })
  await expect(objectives).toHaveCount(1)
  await expect(objectives).toHaveClass(/runtime-context-nav-learn-singleton-page/)
  await expect(objectives).not.toHaveAttribute('aria-expanded')

  const breakEvenGroup = learnContents.locator('.runtime-context-nav-group-button').filter({ hasText: 'Break-even and profitability' })
  await expect(breakEvenGroup).toHaveCount(1)
  await expect(breakEvenGroup).toHaveAttribute('aria-expanded', 'false')

  const hashBeforeGroupDisclosure = await page.evaluate(() => window.location.hash)
  await breakEvenGroup.click()
  await expect(breakEvenGroup).toHaveAttribute('aria-expanded', 'true')
  expect(await page.evaluate(() => window.location.hash)).toBe(hashBeforeGroupDisclosure)
  await expect(learnContents.getByRole('button', { name: 'Understanding break-even', exact: true })).toBeVisible()
})
