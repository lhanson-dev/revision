import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000041'
const businessCourseId = 'aqa:aqa-a-level:7132'

async function seedReturningStudent(page: Page) {
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
        email: 'returning-home-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
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
        email: 'returning-home-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: businessCourseId, created_at: '2026-08-22T18:00:00.000Z' }]) })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_activity_events**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}


const cid = encodeURIComponent(businessCourseId)

async function expectNoSidewaysScroll(page: Page) {
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1)
}

async function expectNoAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(' | ')}`)).toEqual([])
}

test('Home plan card says what is missing, with a way to fix it, instead of promising a plan', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(`${appPath}#/home`)
  const card = page.locator('.home-v2-plan-link')
  await expect(card).toContainText('Add your exam dates and I’ll start building your plan.')
  await expect(card.getByRole('button', { name: /Add exam dates/ })).toHaveCSS('min-height', '48px')
  await expect(card).not.toContainText('as Revision learns more')
  await card.getByRole('button', { name: /Add exam dates/ }).click()
  await expect(page.getByRole('heading', { name: 'Your week', exact: true })).toBeVisible()
  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})

test('a new student on Plan is told what is missing, and the exam and study-time cards are where to add it', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(`${appPath}#/plan`)
  const note = page.getByLabel('Finish setting up your plan')
  await expect(note).toContainText('Add your exam dates and your study time, and REV will plan what to work on.')
  await expect(page.getByRole('button', { name: 'Add exam date' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Set study time' })).toBeVisible()
  await expect(page.locator('.pln-empty').first()).toContainText('Free. Nothing planned.')
  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})

test('with no answers, readiness says so plainly and does not give "beyond flashcards" advice', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(`${appPath}#/courses/${cid}/overview`)
  await expect(page.getByText('You haven’t answered anything here yet. Once you have, I’ll show how ready you are.')).toBeVisible()
  await expect(page.getByText(/beyond flashcards/)).toHaveCount(0)
  await expectNoSidewaysScroll(page)
})

test('a student with no course sees a clear first step on Home, Plan, Courses and Progress', async ({ page }) => {
  await seedReturningStudent(page)
  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(`${appPath}#/home`)
  await expect(page.getByRole('button', { name: 'Add a course' })).toBeVisible()
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByText('Add a course before building your plan')).toBeVisible()
  await page.goto(`${appPath}#/courses`)
  await expect(page.getByText('Add your first course')).toBeVisible()
  await page.goto(`${appPath}#/progress`)
  await expect(page.getByText('Add a course to build your progress view')).toBeVisible()
  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})
