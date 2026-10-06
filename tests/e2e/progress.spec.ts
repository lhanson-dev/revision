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

const progressPath = `${appPath}#/progress`
const coursePath = `${appPath}#/courses/${encodeURIComponent(businessCourseId)}`

async function expectNoSidewaysScroll(page: Page) {
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1)
}

async function expectNoAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(' | ')}`)).toEqual([])
}

test('a brand-new student sees an honest Progress screen: a plain sentence, one next action with its reason, three separate measures and no grade', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(progressPath)

  const summary = page.getByRole('region', { name: 'Progress summary' })
  await expect(summary).toBeVisible()
  await expect(summary).toContainText('You haven’t answered anything yet')
  await expect(summary.locator('.progress-intro__why')).toContainText('Why:')
  await expect(summary.getByRole('button').first()).toHaveCSS('min-height', '48px')

  // Three separate measures, never one percentage.
  const main = page.locator('main[aria-labelledby="global-progress-title"]')
  await expect(main.getByRole('heading', { name: 'Topics covered' }).first()).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Understanding' }).first()).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Exam readiness' }).first()).toBeVisible()
  await expect(main.getByText('Not enough evidence yet').first()).toBeVisible()
  await expect(main.getByText(/%/)).toHaveCount(0)
  await expect(main.getByText(/grade/i).filter({ hasNotText: /never a predicted grade/ })).toHaveCount(0)

  // The optional note is at most three sentences.
  await summary.getByText('How this is worked out').click()
  await expect(summary.locator('.progress-intro__how p')).toHaveCount(3)

  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})

test('the course Progress tab uses the same measures and names, with a status for every topic', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(`${coursePath}/progress`)

  await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Topics covered' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Understanding' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Exam readiness' })).toBeVisible()
  const rows = page.locator('.progress-topic-list li')
  expect(await rows.count()).toBeGreaterThan(0)
  // Every topic row carries a status in words, not just a colour.
  await expect(rows.first().getByText('Not started')).toBeVisible()
  await expect(page.getByText('Where you have evidence')).toHaveCount(0)

  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})

test('after answering a question the screens count it: one topic covered and a status for it', async ({ page }) => {
  test.setTimeout(90_000)
  await seedReturningStudent(page)
  const rows: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown> | Array<Record<string, unknown>>
      rows.push(...(Array.isArray(body) ? body : [body]))
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) })
    }
  })
  await page.goto(`${coursePath}/practice`)
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await page.locator('.practice-question__options button').first().click()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.locator('.ui-feedback-bar')).toBeVisible()
  expect(rows.length).toBeGreaterThan(0)

  await page.goto(progressPath)
  await page.reload()
  const covered = page.locator('.ui-progress-measure').filter({ hasText: 'Topics covered' }).first()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('1')
  await expect(page.getByRole('region', { name: 'Progress summary' })).toContainText('You’ve covered 1 of')

  await page.goto(`${coursePath}/progress`)
  await page.reload()
  await expect(page.getByText(/^\d+ answers?$/).first()).toBeVisible()
  await expect(page.getByText('Just started').first()).toBeVisible()
  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})

test('Progress never scrolls sideways from 320px to 1440px', async ({ page }) => {
  await seedReturningStudent(page)
  for (const width of [320, 390, 620, 820, 960, 1160, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(progressPath)
    await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
    await expectNoSidewaysScroll(page)
    await page.goto(`${coursePath}/progress`)
    await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
    await expectNoSidewaysScroll(page)
  }
})
