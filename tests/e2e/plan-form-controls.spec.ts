import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000162'
const courseId = 'aqa:aqa-a-level:7132'

async function seedMissingPlanSetup(page: Page) {
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
        email: 'plan-form-controls@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Plan' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
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
        email: 'plan-form-controls@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Plan' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-09-27T12:00:00.000Z',
      }),
    })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-09-27T12:00:00.000Z' }]) })
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

test('Plan exam setup uses shared field sizing, a usable date calendar and left-aligned content', async ({ page }) => {
  await seedMissingPlanSetup(page)
  await page.goto(`${appPath}#/plan`)

  const examSetup = page.locator('.plan-setup-exams')
  await expect(examSetup).toBeVisible()
  await expect(examSetup.getByRole('heading', { name: 'Add your exams' })).toBeVisible()

  const addExamRow = examSetup.locator('.plan-add-exam')
  const examSelect = addExamRow.locator('select')
  const dateTrigger = addExamRow.locator('.ui-date-trigger')
  await expect(examSelect).toBeVisible()
  await expect(dateTrigger).toBeVisible()

  const selectMetrics = await examSelect.evaluate((element) => {
    const style = getComputedStyle(element)
    return { height: element.getBoundingClientRect().height, fontSize: style.fontSize, fontFamily: style.fontFamily }
  })
  const dateMetrics = await dateTrigger.evaluate((element) => {
    const style = getComputedStyle(element)
    return { height: element.getBoundingClientRect().height, fontSize: style.fontSize, fontFamily: style.fontFamily }
  })

  expect(Math.abs(selectMetrics.height - dateMetrics.height)).toBeLessThanOrEqual(1)
  expect(selectMetrics.fontSize).toBe(dateMetrics.fontSize)
  expect(selectMetrics.fontFamily).toBe(dateMetrics.fontFamily)

  const setupIcon = examSetup.locator('.plan-setup-step-icon')
  const title = examSetup.getByRole('heading', { name: 'Add your exams' })
  const [iconBox, titleBox, selectBox] = await Promise.all([
    setupIcon.boundingBox(),
    title.boundingBox(),
    examSelect.boundingBox(),
  ])
  expect(iconBox).not.toBeNull()
  expect(titleBox).not.toBeNull()
  expect(selectBox).not.toBeNull()
  expect(iconBox!.width).toBeLessThanOrEqual(60)
  expect(iconBox!.x).toBeGreaterThan(titleBox!.x)
  expect(Math.abs(titleBox!.x - selectBox!.x)).toBeLessThanOrEqual(4)

  await dateTrigger.click()
  const calendar = page.getByRole('dialog', { name: 'Choose Exam date' })
  await expect(calendar).toBeVisible()
  const calendarBox = await calendar.boundingBox()
  expect(calendarBox).not.toBeNull()
  expect(calendarBox!.width).toBeGreaterThanOrEqual(320)
  await expect(calendar.getByRole('button', { name: 'Previous month' })).toBeVisible()
  await expect(calendar.getByRole('button', { name: 'Next month' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(calendar).toHaveCount(0)
})
