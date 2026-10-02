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


const practicePath = `${appPath}#/courses/${encodeURIComponent(businessCourseId)}/practice`

/** Reads the evidence the page tried to save, so the test can check what was recorded. */
async function captureEvidence(page: Page) {
  const saved: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown> | Array<Record<string, unknown>>
      saved.push(...(Array.isArray(body) ? body : [body]))
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
  })
  return saved
}

async function answerOption(page: Page, index: number) {
  await page.locator('.pw-options label').nth(index).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
}

test('Practice feedback bar explains why, uses teal for right and coral for wrong, and a missed question comes back after 3 others', async ({ page }) => {
  test.setTimeout(90_000) // a long journey: up to 8 answers, 3 more, then the retry
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeVisible()

  let missedPrompt = ''
  let missedCorrectIndex = -1
  let answers = 0
  for (; answers < 8 && !missedPrompt; answers += 1) {
    const prompt = (await page.locator('.pw-question legend').textContent()) ?? ''
    await answerOption(page, 0)
    const wrong = page.getByText('Not quite', { exact: true })
    if (await wrong.isVisible()) {
      missedPrompt = prompt
      missedCorrectIndex = await page.locator('.pw-options label').evaluateAll((labels) => labels.findIndex((label) => label.classList.contains('correct')))
      // Wrong is coral with an icon and words, explains why, and says honestly when it comes back.
      const bar = page.locator('.ui-feedback-bar--wrong')
      await expect(bar).toBeVisible()
      await expect(bar.locator('.ui-feedback-bar__explanation')).not.toBeEmpty()
      await expect(bar.getByText('This will come back later in this session.')).toBeVisible()
      await expect(bar.locator('.ui-feedback-bar__title svg')).toBeVisible()
    } else {
      const bar = page.locator('.ui-feedback-bar--correct')
      await expect(bar).toBeVisible()
      await expect(bar.getByText('Correct', { exact: true })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(missedPrompt, 'one of the first answers should be a miss so the retry can be tested').not.toBe('')
  const missedAt = saved.length

  // Three other answers, then the missed question comes back as "another go".
  for (let other = 0; other < 3; other += 1) {
    await expect(page.getByText('Another go at one you missed')).toHaveCount(0)
    await answerOption(page, 0)
    await page.getByRole('button', { name: 'Next question' }).click()
  }
  await expect(page.getByText('Another go at one you missed')).toBeVisible()
  await expect(page.locator('.pw-question legend')).toHaveText(missedPrompt)

  // Getting it right on the retry clears it, says so, and is saved as a real answer.
  await answerOption(page, missedCorrectIndex)
  await expect(page.locator('.ui-feedback-bar--correct').getByText('You’ve got it this time')).toBeVisible()
  await expect(page.getByText('That one is off your list.')).toBeVisible()
  expect(saved.length).toBe(missedAt + 4)
  const missedContent = saved[missedAt - 1].content_id
  const attempts = saved.filter((item) => item.content_id === missedContent).map((item) => (item.payload as Record<string, unknown>).correct)
  expect(attempts).toEqual([false, true])

})

for (const theme of ['light', 'dark'] as const) {
  test(`Practice feedback bar meets the automated WCAG A/AA baseline for right and wrong answers (${theme})`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
    await seedReturningStudent(page)
    await captureEvidence(page)
    await page.goto(practicePath)
    await expect(page.getByRole('button', { name: 'Check answer' })).toBeVisible()

    const seen = new Set<string>()
    for (let answers = 0; answers < 10 && seen.size < 2; answers += 1) {
      await answerOption(page, 0)
      const tone = (await page.locator('.ui-feedback-bar--wrong').isVisible()) ? 'wrong' : 'correct'
      if (!seen.has(tone)) {
        seen.add(tone)
        await page.waitForTimeout(500) // let the 220ms slide-up finish so colours are measured at full strength
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), `${tone} feedback in ${theme}`).toEqual([])
      }
      await page.getByRole('button', { name: 'Next question' }).click()
    }
    expect(seen.size, 'both a right and a wrong answer should have been seen').toBe(2)
  })
}
