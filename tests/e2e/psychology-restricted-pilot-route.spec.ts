import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000718'
const courseId = 'aqa:aqa-a-level:7182'

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The restricted-pilot route gate needs one canonical authenticated browser journey; responsive coverage is exercised elsewhere.')
})

async function seedRestrictedPsychologyLearner(page: Page) {
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
        email: 'psychology-restricted-pilot@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Pilot' },
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
        email: 'psychology-restricted-pilot@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Pilot' },
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
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-23T12:00:00.000Z' }]),
    })
  })

  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })

  for (const endpoint of [
    'revision_assessments',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events',
  ]) {
    await page.route(`**/rest/v1/${endpoint}**`, async (route) => {
      await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
    })
  }

  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
}

test('restricted Psychology learner can traverse the canonical course journey on the promotion candidate', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await page.goto(`${appPath}#/courses`)

  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
  const courseCard = page.locator('.courses-programme-card').filter({ hasText: 'AQA A-level Psychology' })
  await expect(courseCard).toBeVisible()
  await expect(courseCard).toContainText('Specification 7182')
  await expect(courseCard).toContainText('17 syllabus topics')
  await expect(courseCard).toContainText('3 exam papers/components')

  await courseCard.getByRole('button', { name: 'Open course' }).click()

  const encodedCourseId = encodeURIComponent(courseId)
  const courseNav = page.getByRole('navigation', { name: 'AQA A-level Psychology navigation' })
  await expect(courseNav).toBeVisible()
  await expect(courseNav.getByRole('button')).toHaveText(['Overview', 'Learn', 'Practice', 'Exam Prep', 'Progress'])
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/overview$`))
  await expect(courseNav.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByText('Psychology · 17 topics', { exact: true })).toBeVisible()

  await courseNav.getByRole('button', { name: 'Learn' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/learn$`))
  await expect(courseNav.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByText('Core knowledge', { exact: true }).first()).toBeVisible()

  await courseNav.getByRole('button', { name: 'Practice' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/practice$`))
  await expect(courseNav.getByRole('button', { name: 'Practice' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Start \d+ questions?$/ })).toBeVisible()

  await courseNav.getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/exam-prep$`))
  await expect(courseNav.getByRole('button', { name: 'Exam Prep' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { name: 'Get ready for the exams' })).toBeVisible()
  await expect(page.locator('.exam-paper')).toHaveCount(3)
  await expect(page.locator('.exam-mock')).toHaveCount(3)

  await courseNav.getByRole('button', { name: 'Progress' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/progress$`))
  await expect(courseNav.getByRole('button', { name: 'Progress' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
  await expect(page.locator('.progress-topic-list li')).toHaveCount(17)

  await expect(page.getByText(/not available in the current published catalogue/i)).toHaveCount(0)
  await expect(page.getByText(/course not in active programme/i)).toHaveCount(0)
})
