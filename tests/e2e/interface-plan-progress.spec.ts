import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000112'
const asCourseId = 'aqa:aqa-as:7131'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function seedSession(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript(({ key, id, selectedTheme }) => {
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
        email: 'interface-b2-test@revision.invalid',
        email_confirmed_at: '2026-08-22T09:15:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'B2' },
        identities: [],
        created_at: '2026-08-22T09:15:00.000Z',
        updated_at: '2026-08-22T09:15:00.000Z',
      },
    }))
    localStorage.setItem('revision:theme', selectedTheme)
  }, { key: storageKey, id: userId, selectedTheme: theme })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'interface-b2-test@revision.invalid',
        email_confirmed_at: '2026-08-22T09:15:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'B2' },
        identities: [],
        created_at: '2026-08-22T09:15:00.000Z',
        updated_at: '2026-08-22T09:15:00.000Z',
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

test('B2 gives Plan and Progress the shared interface grammar without changing their hierarchy', async ({ page }) => {
  await seedSession(page)
  await page.goto(`${appPath}#/plan`)

  const plan = page.locator('.interface-plan-screen')
  await expect(plan).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What matters now' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Set your realistic availability' })).toBeVisible()

  const heading = page.getByRole('heading', { name: 'Plan' })
  const headingStyle = await heading.evaluate((element) => {
    const style = getComputedStyle(element)
    return { fontSize: style.fontSize, lineHeight: style.lineHeight }
  })
  if ((page.viewportSize()?.width ?? 0) <= 620) {
    expect(headingStyle).toEqual({ fontSize: '30px', lineHeight: '38px' })
  } else {
    expect(headingStyle).toEqual({ fontSize: '36px', lineHeight: '44px' })
  }

  const todayPanel = page.getByRole('region', { name: 'What matters now' })
  await expect(todayPanel).toHaveClass(/ui-surface-standard/)
  await expect(todayPanel).toHaveCSS('border-radius', '20px')

  const weekdayField = page.getByLabel('Weekday minutes')
  await expect(weekdayField).toHaveClass(/ui-field/)
  await expect(weekdayField).toHaveCSS('min-height', '48px')
  await expect(weekdayField).toHaveCSS('border-radius', '14px')

  const saveAvailability = page.getByRole('button', { name: 'Save availability' })
  await expect(saveAvailability).toHaveClass(/ui-button--primary/)
  await expect(saveAvailability).toHaveCSS('min-height', '44px')
  await expect(saveAvailability).toHaveCSS('border-radius', '14px')
  await expect(saveAvailability).toHaveCSS('background-color', 'rgb(43, 182, 163)')
  await expect(saveAvailability).toHaveCSS('color', 'rgb(19, 32, 38)')

  const planEmpty = page.getByRole('heading', { name: 'Set your realistic availability' }).locator('..')
  await expect(planEmpty).toHaveCSS('background-color', 'rgb(241, 250, 248)')
  await expectNoPageOverflow(page)

  await page.goto(`${appPath}#/progress`)
  await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Current evidence' })).toBeVisible()
  await expect(page.getByText('No scored activity yet.', { exact: true })).toBeVisible()

  const progressSection = page.locator('main[aria-labelledby="global-progress-title"] > .home-section').first()
  await expect(progressSection).toHaveCSS('border-top-width', '0px')
  await expect(progressSection).toHaveCSS('box-shadow', 'none')
  await expect(progressSection).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  const summaryTile = page.locator('main[aria-labelledby="global-progress-title"] .progress-overview article').first()
  await expect(summaryTile).toHaveCSS('border-radius', '20px')
  await expect(summaryTile).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(summaryTile).toHaveCSS('box-shadow', 'none')

  const subjectCard = page.locator('main[aria-labelledby="global-progress-title"] .global-progress-card').first()
  await expect(subjectCard).toHaveCSS('border-radius', '20px')
  await expect(subjectCard).toHaveCSS('box-shadow', 'none')

  const progressAction = subjectCard.getByRole('button').first()
  await expect(progressAction).toHaveCSS('min-height', '44px')
  await expect(progressAction).toHaveCSS('border-radius', '14px')
  await expect(progressAction).toHaveCSS('background-color', 'rgb(43, 182, 163)')
  await expect(progressAction).toHaveCSS('color', 'rgb(19, 32, 38)')

  const progressEmpty = page.getByText('No scored activity yet.', { exact: true })
  await expect(progressEmpty).toHaveCSS('background-color', 'rgb(241, 250, 248)')
  await expectNoPageOverflow(page)
})

test('B2 Plan and Progress consume dark-theme semantic surfaces rather than hard-coded light values', async ({ page }) => {
  await seedSession(page, 'dark')
  await page.goto(`${appPath}#/plan`)

  const runtime = page.locator('.planner-runtime')
  await expect(runtime).toHaveAttribute('data-theme', 'dark')

  const planPanel = page.getByRole('region', { name: 'What matters now' })
  const planPanelStyle = await planPanel.evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, color: style.color }
  })
  expect(planPanelStyle.background).not.toBe('rgb(255, 255, 255)')
  expect(planPanelStyle.color).toBe('rgb(230, 242, 239)')

  const weekdayField = page.getByLabel('Weekday minutes')
  await expect(weekdayField).toHaveCSS('background-color', 'rgb(19, 39, 43)')
  await expect(weekdayField).toHaveCSS('color', 'rgb(230, 242, 239)')

  await page.goto(`${appPath}#/progress`)
  const summaryTile = page.locator('main[aria-labelledby="global-progress-title"] .progress-overview article').first()
  await expect(summaryTile).toHaveCSS('background-color', 'rgb(19, 39, 43)')
  await expect(summaryTile).toHaveCSS('border-radius', '20px')

  const subjectCard = page.locator('main[aria-labelledby="global-progress-title"] .global-progress-card').first()
  await expect(subjectCard).toHaveCSS('background-color', 'rgb(19, 39, 43)')
  await expect(subjectCard).toHaveCSS('box-shadow', 'none')
  await expectNoPageOverflow(page)
})
