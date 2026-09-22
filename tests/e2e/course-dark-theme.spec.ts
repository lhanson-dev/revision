import { expect, test, type Locator, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000123'
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
    localStorage.setItem('revision:theme', 'dark')
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
        email: 'course-theme-test@revision.invalid',
        email_confirmed_at: '2026-08-22T14:50:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Theme' },
        identities: [],
        created_at: '2026-08-22T14:50:00.000Z',
        updated_at: '2026-08-22T14:50:00.000Z',
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
        email: 'course-theme-test@revision.invalid',
        email_confirmed_at: '2026-08-22T14:50:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Theme' },
        identities: [],
        created_at: '2026-08-22T14:50:00.000Z',
        updated_at: '2026-08-22T14:50:00.000Z',
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
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          assessment_id: '00000000-0000-4000-8000-000000000777',
          subject_id: 'business',
          course_id: asCourseId,
          module_id: null,
          title: 'AS Business public exam',
          assessment_date: '2099-06-10',
        },
      ]),
    })
  })

  for (const endpoint of [
    'learning_evidence',
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
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()
    return drawer.getByRole('navigation', { name: 'Mobile navigation' })
  }
  return page.getByRole('navigation', { name: 'Primary navigation' })
}

async function clickNavigation(page: Page, label: string) {
  const nav = await navigation(page)
  await nav.getByRole('button', { name: label, exact: true }).click()
  if (isResponsiveLayout(page)) await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toHaveCount(0)
}

async function themeStyles(locator: Locator, kind: 'surface' | 'accent') {
  return locator.evaluate((element, requestedKind) => {
    const style = getComputedStyle(element)
    const probe = document.createElement('span')
    probe.style.position = 'fixed'
    probe.style.pointerEvents = 'none'
    if (requestedKind === 'surface') probe.style.backgroundColor = 'var(--color-surface)'
    else probe.style.color = 'var(--color-accent-text)'
    element.appendChild(probe)
    const probeStyle = getComputedStyle(probe)
    const result = requestedKind === 'surface'
      ? { actual: style.backgroundColor, expected: probeStyle.backgroundColor }
      : { actual: style.color, expected: probeStyle.color }
    probe.remove()
    return result
  }, kind)
}

async function backgroundRoleStyles(locator: Locator, role: '--color-surface' | '--color-surface-soft' | '--color-inverse-action') {
  return locator.evaluate((element, requestedRole) => {
    const style = getComputedStyle(element)
    const probe = document.createElement('span')
    probe.style.position = 'fixed'
    probe.style.pointerEvents = 'none'
    probe.style.backgroundColor = `var(${requestedRole})`
    element.appendChild(probe)
    const result = { actual: style.backgroundColor, expected: getComputedStyle(probe).backgroundColor }
    probe.remove()
    return result
  }, role)
}

test('course overview uses the governed REV feature treatment and semantic dark surfaces', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)

  const runtime = page.locator('.planner-runtime')
  await expect(runtime).toHaveAttribute('data-theme', 'dark')

  await clickNavigation(page, 'Courses')
  await clickNavigation(page, 'AQA AS Business')
  await expect(page.getByRole('heading', { name: 'AQA AS Business', exact: true, level: 1 })).toBeVisible()

  const overviewRecommendation = page.locator('.course-overview-recommendation')
  await expect(overviewRecommendation).toBeVisible()
  await expect(overviewRecommendation.locator('.rev-presence-hero')).toHaveCount(1)
  await expect(overviewRecommendation.getByText('Powered by', { exact: true })).toBeVisible()
  await expect(overviewRecommendation.getByRole('heading', { name: /with a quick check$/i })).toBeVisible()
  await expect(overviewRecommendation.getByText(/A quick check is the best starting point because REV has no scored evidence/i)).toBeVisible()
  await expect(overviewRecommendation.getByRole('button', { name: 'Why this?', exact: true })).toHaveCount(0)
  await expect(overviewRecommendation.getByText('Evidence is still limited, so this recommendation is based on coverage and the results available so far rather than a readiness score.', { exact: true })).toHaveCount(0)

  const progressPanel = overviewRecommendation.locator('.course-overview-progress-panel')
  await expect(progressPanel).toBeVisible()
  await expect(progressPanel.getByText('Exam date', { exact: true })).toBeVisible()
  await expect(progressPanel.getByText('10 Jun 2099', { exact: true })).toBeVisible()
  await expect(progressPanel.getByText(/\d+ days to go|1 day to go|Today/)).toBeVisible()
  await expect(progressPanel.getByText('Exam readiness', { exact: true })).toBeVisible()
  await expect(progressPanel.getByText('Topic knowledge', { exact: true })).toBeVisible()
  await expect(progressPanel.getByText('Not enough evidence', { exact: true })).toBeVisible()
  await expect(overviewRecommendation.getByText('Got something else on your mind?', { exact: true })).toBeVisible()

  if (!isResponsiveLayout(page)) {
    const recommendationBox = await overviewRecommendation.locator('.course-overview-recommendation-copy').boundingBox()
    const progressBox = await progressPanel.boundingBox()
    expect(recommendationBox).not.toBeNull()
    expect(progressBox).not.toBeNull()
    expect(progressBox!.x).toBeGreaterThan(recommendationBox!.x)
  }

  const recommendationSurface = await backgroundRoleStyles(overviewRecommendation, '--color-inverse-action')
  expect(recommendationSurface.actual).toBe(recommendationSurface.expected)
  expect(recommendationSurface.actual).not.toBe('rgb(255, 255, 255)')

  const courseRevForm = overviewRecommendation.locator('.course-overview-rev-form')
  await courseRevForm.getByRole('textbox').fill('Help me with this course')
  await courseRevForm.getByRole('button', { name: 'Ask REV', exact: true }).click()
  const revDialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(revDialog).toBeVisible()
  await expect(revDialog.locator('.planner-rev-input input')).toHaveValue('Help me with this course')
  await revDialog.getByRole('button', { name: 'Close Ask REV' }).click()
  await expect(revDialog).toHaveCount(0)

  await clickNavigation(page, 'AQA AS Business Exam Prep')
  await expect(page.getByRole('heading', { name: 'AQA AS Business', exact: true, level: 1 })).toBeVisible()

  const paperCard = page.locator('.exam-paper-card').first()
  await expect(paperCard).toBeVisible()
  const paperSurface = await themeStyles(paperCard, 'surface')
  expect(paperSurface.actual).toBe(paperSurface.expected)
  expect(paperSurface.actual).not.toBe('rgb(255, 255, 255)')

  const expander = paperCard.locator('summary > span').last()
  const expanderAccent = await themeStyles(expander, 'accent')
  expect(expanderAccent.actual).toBe(expanderAccent.expected)

  await paperCard.locator('summary').click()
  const paperContent = paperCard.locator('.paper-exam-content')
  await expect(paperContent).toBeVisible()
  const paperContentSurface = await backgroundRoleStyles(paperContent, '--color-surface-soft')
  expect(paperContentSurface.actual).toBe(paperContentSurface.expected)
  expect(paperContentSurface.actual).not.toBe('rgb(255, 255, 255)')

  const simulator = paperCard.locator('.exam-simulator').first()
  await expect(simulator).toBeVisible()
  const simulatorSurface = await themeStyles(simulator, 'surface')
  expect(simulatorSurface.actual).toBe(simulatorSurface.expected)
  expect(simulatorSurface.actual).not.toBe('rgb(255, 255, 255)')
})
