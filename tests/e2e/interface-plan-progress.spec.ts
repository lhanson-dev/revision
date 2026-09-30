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

async function seedSession(page: Page, theme: 'light' | 'dark' = 'light', configured = false) {
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
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
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

  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    const body = configured ? [{
      assessment_id: 'assessment-1',
      user_id: userId,
      subject_id: 'business',
      course_id: asCourseId,
      module_id: null,
      assessment_type: 'public_exam',
      title: 'Paper 2',
      assessment_date: '2027-06-05',
      relative_importance: 'high',
      scope: {},
      is_active: true,
    }] : []
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })

  for (const endpoint of ['revision_availability_exceptions', 'revision_planning_preferences', 'revision_activity_events']) {
    await page.route(`**/rest/v1/${endpoint}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }

  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    const body = configured ? {
      user_id: userId,
      weekday_minutes: 45,
      weekend_minutes: 90,
      monday_minutes: 45,
      tuesday_minutes: 45,
      wednesday_minutes: 60,
      thursday_minutes: 45,
      friday_minutes: 30,
      saturday_minutes: 90,
      sunday_minutes: 60,
      timezone: 'Europe/London',
    } : null
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}

test('Plan missing-input state uses the governed interface grammar and asks only for exams and realistic weekly time', async ({ page }) => {
  await seedSession(page)
  await page.goto(`${appPath}#/plan`)

  const plan = page.locator('.interface-plan-screen')
  await expect(plan).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()
  await expect(page.getByText('Your plan adapts as you go', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Add your exams' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your weekly study time' })).toBeVisible()
  await expect(page.getByText('Your plan will appear here', { exact: true })).toBeVisible()
  await expect(page.getByPlaceholder('Ask REV anything…')).toBeVisible()

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

  const examSetup = page.getByRole('region', { name: 'Add your exams' })
  await expect(examSetup).toHaveCSS('border-radius', '20px')
  const weeklySetup = page.getByRole('region', { name: 'Your weekly study time' })
  await expect(weeklySetup).toHaveCSS('border-radius', '20px')

  await expect(page.getByRole('button', { name: 'Increase Mon study time' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Increase Sun study time' })).toBeVisible()

  const saveWeeklyTime = page.getByRole('button', { name: 'Save weekly time' })
  await expect(saveWeeklyTime).toHaveClass(/ui-button--primary/)
  await expect(saveWeeklyTime).toHaveCSS('min-height', '48px')
  await expect(saveWeeklyTime).toHaveCSS('border-radius', '14px')
  await expect(saveWeeklyTime).toHaveCSS('background-color', 'rgb(43, 182, 163)')
  await expect(saveWeeklyTime).toHaveCSS('color', 'rgb(19, 32, 38)')
  await expectNoPageOverflow(page)

  await page.goto(`${appPath}#/progress`)
  await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Progress by course' })).toBeVisible()

  const scoredActivities = page.locator('main[aria-labelledby="global-progress-title"] .progress-overview article').filter({ hasText: 'Scored activities' })
  await expect(scoredActivities).toBeVisible()
  await expect(scoredActivities.locator('strong')).toHaveText('0')

  const progressSection = page.locator('main[aria-labelledby="global-progress-title"] > .home-section').first()
  await expect(progressSection).toHaveCSS('border-top-width', '0px')
  await expect(progressSection).toHaveCSS('box-shadow', 'none')
  await expect(progressSection).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  const summaryTile = page.locator('main[aria-labelledby="global-progress-title"] .progress-overview article').first()
  // Redesign v2: first tile is the violet tint with 24px corners.
  await expect(summaryTile).toHaveCSS('border-radius', '24px')
  await expect(summaryTile).toHaveCSS('background-color', 'rgb(235, 232, 255)')
  await expect(summaryTile).toHaveCSS('box-shadow', 'none')

  const courseCard = page.locator('main[aria-labelledby="global-progress-title"] .global-progress-card').first()
  await expect(courseCard).toHaveCSS('border-radius', '24px')
  await expect(courseCard).toHaveCSS('box-shadow', 'none')

  const progressAction = courseCard.getByRole('button', { name: 'Open course progress' })
  await expect(progressAction).toHaveClass(/ui-button--primary/)
  await expect(progressAction).toHaveCSS('min-height', '48px')
  await expect(progressAction).toHaveCSS('border-radius', '14px')
  await expect(progressAction).toHaveCSS('background-color', 'rgb(43, 182, 163)')
  await expect(progressAction).toHaveCSS('color', 'rgb(19, 32, 38)')
  await expectNoPageOverflow(page)
})

test('Configured Plan defaults to the adaptive Week view and keeps management secondary', async ({ page }) => {
  await seedSession(page, 'light', true)
  await page.goto(`${appPath}#/plan`)

  await expect(page.getByRole('button', { name: 'Week', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Manage exams' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Plan settings' })).toBeVisible()
  await expect(page.getByText('Next exam', { exact: true })).toBeVisible()
  await expect(page.getByText('This week', { exact: true })).toBeVisible()
  await expect(page.getByText('Plan status', { exact: true })).toBeVisible()

  const week = page.locator('.plan-week-grid')
  await expect(week).toBeVisible()
  await expect(week.locator('.plan-week-day')).toHaveCount(7)
  await expect(week.locator('.plan-task').first()).not.toContainText('Why this?')
  await expect(page.getByRole('heading', { name: 'Upcoming exams' })).toBeVisible()
  await expectNoPageOverflow(page)

  await page.getByRole('button', { name: 'Month', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Next four weeks' })).toBeVisible()
  await expect(page.getByText('Further ahead, Revision shows direction rather than pretending every task is fixed.')).toBeVisible()
  await expectNoPageOverflow(page)
})

test('Plan and Progress consume dark-theme semantic surfaces rather than hard-coded light values', async ({ page }) => {
  await seedSession(page, 'dark')
  await page.goto(`${appPath}#/plan`)

  const runtime = page.locator('.planner-runtime')
  await expect(runtime).toHaveAttribute('data-theme', 'dark')

  const weeklySetup = page.getByRole('region', { name: 'Your weekly study time' })
  const weeklySetupStyle = await weeklySetup.evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, color: style.color }
  })
  expect(weeklySetupStyle.background).not.toBe('rgb(255, 255, 255)')
  expect(weeklySetupStyle.color).toBe('rgb(230, 242, 239)')

  const capacityDay = page.locator('.plan-capacity-day').first()
  await expect(capacityDay).toHaveCSS('background-color', 'rgb(19, 39, 43)')
  await expect(capacityDay).toHaveCSS('color', 'rgb(230, 242, 239)')
  await expectNoPageOverflow(page)

  await page.goto(`${appPath}#/progress`)
  const summaryTile = page.locator('main[aria-labelledby="global-progress-title"] .progress-overview article').first()
  await expect(summaryTile).toHaveCSS('background-color', 'rgb(37, 33, 74)')
  await expect(summaryTile).toHaveCSS('border-radius', '24px')

  const courseCard = page.locator('main[aria-labelledby="global-progress-title"] .global-progress-card').first()
  await expect(courseCard).toHaveCSS('background-color', 'rgb(19, 39, 43)')
  await expect(courseCard).toHaveCSS('border-radius', '24px')
  await expect(courseCard).toHaveCSS('box-shadow', 'none')
  await expectNoPageOverflow(page)
})