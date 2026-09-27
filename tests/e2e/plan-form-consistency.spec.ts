import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000118'
const courseId = 'aqa:aqa-a-level:7132'

async function seedPlanSetup(page: Page) {
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
        email: 'plan-form-test@revision.invalid',
        email_confirmed_at: '2026-09-27T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Plan' },
        identities: [],
        created_at: '2026-09-27T12:00:00.000Z',
        updated_at: '2026-09-27T12:00:00.000Z',
      },
    }))
    localStorage.setItem('revision:theme', 'light')
  }, { key: storageKey, id: userId })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'plan-form-test@revision.invalid',
        email_confirmed_at: '2026-09-27T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Plan' },
        identities: [],
        created_at: '2026-09-27T12:00:00.000Z',
        updated_at: '2026-09-27T12:00:00.000Z',
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
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-09-27T12:00:00.000Z' }]),
    })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  for (const endpoint of ['revision_availability_exceptions', 'revision_planning_preferences', 'revision_activity_events']) {
    await page.route(`**/rest/v1/${endpoint}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }
}

test('Plan setup aligns content and uses consistent shared select/date controls', async ({ page }) => {
  await seedPlanSetup(page)
  await page.goto(`${appPath}#/plan`)

  const setup = page.getByRole('region', { name: 'Add your exams' })
  const heading = page.getByRole('heading', { name: 'Add your exams' })
  const icon = setup.locator('.plan-setup-step-icon')
  const exam = page.getByLabel('Exam', { exact: true })
  const examDate = page.getByLabel('Exam date', { exact: true })

  await expect(setup).toBeVisible()
  await expect(icon).toBeVisible()
  await expect(exam).toHaveClass(/ui-select-field/)
  await expect(examDate).toHaveClass(/ui-date-input/)

  const [headingBox, iconBox, examBox, dateBox] = await Promise.all([
    heading.boundingBox(),
    icon.boundingBox(),
    exam.boundingBox(),
    examDate.boundingBox(),
  ])
  expect(headingBox).not.toBeNull()
  expect(iconBox).not.toBeNull()
  expect(examBox).not.toBeNull()
  expect(dateBox).not.toBeNull()
  if (!headingBox || !iconBox || !examBox || !dateBox) return

  expect(Math.abs(headingBox.x - examBox.x)).toBeLessThanOrEqual(2)
  expect(iconBox.x).toBeGreaterThan(headingBox.x + headingBox.width)
  expect(iconBox.width).toBeLessThanOrEqual(60)

  const styles = await Promise.all([exam, examDate].map((locator) => locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return { fontFamily: style.fontFamily, fontSize: style.fontSize, height: style.height }
  })))
  expect(styles[0]).toEqual(styles[1])
  expect(styles[0].fontSize).toBe('16px')
  expect(styles[0].height).toBe('48px')

  await examDate.click()
  const calendar = page.getByRole('dialog', { name: /Choose date/ })
  await expect(calendar).toBeVisible()
  const calendarBox = await calendar.boundingBox()
  expect(calendarBox).not.toBeNull()
  if (calendarBox) {
    const viewportWidth = page.viewportSize()?.width ?? 1280
    expect(calendarBox.width).toBeGreaterThanOrEqual(Math.min(320, viewportWidth - 32) - 2)
  }
  await expect(calendar.getByText(/September|October|November|December|January|February|March|April|May|June|July|August/).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(calendar).toBeHidden()

  await page.getByRole('button', { name: '+ Add a mock, topic test or other assessment' }).click()
  const otherAssessment = setup.locator('.plan-other-assessment')
  await expect(otherAssessment).toBeVisible()
  const otherBox = await otherAssessment.boundingBox()
  expect(otherBox).not.toBeNull()
  if (otherBox) expect(Math.abs(otherBox.x - headingBox.x)).toBeLessThanOrEqual(2)

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})
