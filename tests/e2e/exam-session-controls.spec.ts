import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const asCourseId = 'aqa:aqa-as:7131'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

async function seedSyntheticSession(page: Page) {
  const userId = '00000000-0000-4000-8000-000000000001'
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
        email: 'synthetic-exam-test@revision.invalid',
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
        email: 'synthetic-exam-test@revision.invalid',
        user_metadata: { first_name: 'Synthetic' },
        app_metadata: { provider: 'email', providers: ['email'] },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      }),
    })
  })
  await page.route('**/rest/v1/learner_courses**', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { user_id: userId, course_id: asCourseId, created_at: '2026-08-22T18:00:00.000Z' },
      { user_id: userId, course_id: aLevelCourseId, created_at: '2026-08-22T18:00:01.000Z' },
    ]),
  }))
  await page.route('**/rest/v1/learner_course_events**', async (route) => route.fulfill({ status: 201, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/learning_evidence**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/profiles**', async (route) => route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) }))
  await page.route('**/rest/v1/revision_assessments**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }))
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_activity_events**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
}

async function openAsPaper2Exam(page: Page) {
  await page.goto(`${appPath}#/courses`)
  const asCourseCard = page.locator('.course-card').filter({ hasText: 'AQA AS Business' }).first()
  await asCourseCard.getByRole('button', { name: 'Open course' }).click()
  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  // Exam Prep launches timed work in the dedicated full-viewport simulator.
  const mock = page.locator('.exam-mock').filter({ hasText: /Paper 2 style/ }).first()
  await mock.getByRole('button', { name: 'Start timed' }).click()
}

test('timed exam opens as a dedicated page and pause fully blocks the paper while freezing the timer', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)

  const session = page.locator('.exam-session-page')
  await expect(session).toBeVisible()
  expect(await session.evaluate((element) => getComputedStyle(element).position)).toBe('fixed')
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stop exam' })).toBeVisible()

  await page.getByRole('button', { name: 'Pause' }).click()
  const pauseDialog = page.getByRole('dialog', { name: 'Exam paused' })
  await expect(pauseDialog).toBeVisible()
  await expect(page.locator('.exam-session')).toHaveAttribute('aria-hidden', 'true')

  const timer = page.locator('.timer')
  const pausedAt = await timer.textContent()
  await page.waitForTimeout(1600)
  await expect(timer).toHaveText(pausedAt ?? '')

  await pauseDialog.getByRole('button', { name: /Continue exam/ }).click()
  await expect(pauseDialog).toHaveCount(0)
  await expect.poll(async () => timer.textContent()).not.toBe(pausedAt)
})

test('stop exam requires confirmation and lets the learner either continue or discard the attempt', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)

  await page.getByRole('button', { name: 'Stop exam' }).click()
  let stopDialog = page.getByRole('dialog', { name: 'Are you sure?' })
  await expect(stopDialog).toBeVisible()
  await expect(stopDialog.getByText(/discard the answers/)).toBeVisible()
  await stopDialog.getByRole('button', { name: 'Continue exam' }).click()
  await expect(stopDialog).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()

  await page.getByRole('button', { name: 'Stop exam' }).click()
  stopDialog = page.getByRole('dialog', { name: 'Are you sure?' })
  await stopDialog.getByRole('button', { name: 'Yes, stop exam' }).click()

  await expect(page.locator('.exam-session-page')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
})

test('question grid wraps (no sideways scroll), is 48px or more, and says answered, flagged and current in words', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)

  const grid = page.getByRole('navigation', { name: 'Exam questions' })
  const first = grid.getByRole('button').first()
  await expect(first).toHaveAttribute('aria-current', 'true')
  await expect(first).toHaveAccessibleName(/^Question 1, \d+ marks, not answered, current question$/)

  // The grid never needs to scroll sideways, and every square is a comfortable target.
  expect(await grid.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
  for (const box of await grid.getByRole('button').evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height))) {
    expect(box).toBeGreaterThanOrEqual(48)
  }

  await page.getByLabel('Your answer').fill('Revenue minus costs gives profit.')
  await expect(first).toHaveAccessibleName(/^Question 1, \d+ marks, answered, current question$/)

  await page.getByRole('button', { name: 'Flag for review' }).click()
  await expect(first).toHaveAccessibleName(/^Question 1, \d+ marks, answered, flagged for review, current question$/)
  await expect(page.getByRole('button', { name: /Flagged for review/ })).toHaveAttribute('aria-pressed', 'true')

  // What to check before finishing: unanswered questions and flagged ones, by number.
  await expect(page.getByText(/Before you finish:.*not answered: question 2/)).toBeVisible()
  await expect(page.getByText(/flagged: question 1\./)).toBeVisible()
})

test('the exam clock is not read out every second; time notices are announced politely instead', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)

  await expect(page.locator('.timer')).not.toHaveAttribute('aria-live', /./)
  const notice = page.locator('.exam-time-notice')
  await expect(notice).toHaveAttribute('role', 'status')
  await expect(notice).toHaveAttribute('aria-live', 'polite')
  await expect(notice).toHaveText('')
})

test('the timed exam page meets the automated WCAG A/AA baseline with a flagged question', async ({ page }) => {
  await seedSyntheticSession(page)
  await openAsPaper2Exam(page)
  await page.getByRole('button', { name: 'Flag for review' }).click()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([])
})

test('low time shows a clock icon and words in coral and never makes the exam page scroll sideways', async ({ page }) => {
  test.setTimeout(90_000) // running the fake clock through 81 minutes takes a while
  await page.clock.install()
  await seedSyntheticSession(page)
  await page.setViewportSize({ width: 320, height: 700 })
  await openAsPaper2Exam(page)
  await page.clock.runFor(81 * 60 * 1000)

  const timer = page.locator('.timer')
  await expect(timer).toHaveClass(/warning/)
  await expect(timer.getByText('Under 10 min')).toBeVisible()
  await expect(timer.locator('svg')).toBeVisible()
  // Heard once at 10 minutes, not every second.
  await expect(page.locator('.exam-time-notice')).toHaveText(/minutes? left\./)

  const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, barRight: document.querySelector('.exam-sticky-bar')?.getBoundingClientRect().right ?? 0 }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
  expect(overflow.barRight).toBeLessThanOrEqual(overflow.clientWidth + 1)
  const colour = await timer.evaluate((element) => getComputedStyle(element).color)
  expect(colour).not.toMatch(/rgb\(255, 1[89]\d, ?\d+\)|yellow/i)
})
