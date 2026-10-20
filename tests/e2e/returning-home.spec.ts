import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000041'
const businessCourseId = 'aqa:aqa-a-level:7132'
const psychologyCourseId = 'aqa:aqa-a-level:7182'

async function seedReturningStudent(page: Page, courseId = businessCourseId) {
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
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-22T18:00:00.000Z' }]) })
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
  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_activity_events**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

test('Returning Home keeps the approved REV → Plan/Exams → Progress → Courses hierarchy', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)

  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { name: /Hey Synthetic.*Here.s what I.d do next/ })).toBeVisible()
  await expect(hero.getByRole('textbox', { name: 'Ask REV anything' })).toBeVisible()
  await expect(hero.getByText('Your next useful step')).toBeVisible()
  await expect(hero.locator('.home-v3-hero-reason')).not.toBeEmpty()
  await expect(hero.getByText('Not on a plan yet')).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Today’s plan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your exams' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your progress' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your courses' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What do you want to do?' })).toHaveCount(0)
  await expect(page.getByText('Topics covered', { exact: true })).toBeVisible()
  await expect(page.getByText('Understanding', { exact: true })).toBeVisible()
  await expect(page.getByText('Exam readiness', { exact: true })).toBeVisible()
  await expect(page.locator('.home-v3-course-card').first()).toContainText(/0 of \d+ topics covered/)
  await expect(page.getByText(/% mastered/)).toHaveCount(0)
  await expect(page.locator('.planner-home-primary-grid')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('Home v3 starts the exact governed focused activity with one Start action', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)

  const start = page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*quick check/i })
  await expect(start).toBeVisible()
  await start.click()

  await expect(page.locator('.home-focused-activity')).toBeVisible()
  await expect(page.locator('.home-quick-check__identity')).toContainText('Quick check')
  await expect(page.getByRole('button', { name: 'Pick an answer to check' })).toBeVisible()
  await expect(page.locator('.home-focused-activity')).toContainText(/1 of [0-9]+/)
  await expect(page.getByRole('button', { name: 'Back to Home' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('REV focused question sessions save partial work without completion', async ({ page }) => {
  await seedReturningStudent(page)
  const posted: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') posted.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  await page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*quick check/i }).click()
  const activity = page.locator('.home-focused-activity')
  await expect(activity).toContainText('1 of 5')
  await expect(activity).toContainText('about 8 min')
  await activity.locator('.home-focused-options button').first().click()
  await activity.getByRole('button', { name: /^Check “/ }).click()
  await expect(activity.getByRole('button', { name: 'Next question' })).toBeVisible()
  expect(posted).toHaveLength(1)
  await expect(activity.getByRole('button', { name: 'Back to today’s plan' })).toHaveCount(0)
  await activity.getByRole('button', { name: 'Back to Home' }).click()
  await expect(page.locator('.home-v3-hero')).toBeVisible()
  expect(posted).toHaveLength(1)
})

test('REV focused session does not complete before its final real question', async ({ page }) => {
  await seedReturningStudent(page)
  const posted: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') posted.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  await page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*quick check/i }).click()
  const activity = page.locator('.home-focused-activity')
  await expect(activity).toContainText('1 of 5')
  for (let index = 1; index <= 5; index += 1) {
    await expect(activity).toContainText(`${index} of 5`)
    await activity.locator('.home-focused-options button').first().click()
    await activity.getByRole('button', { name: /^Check “/ }).click()
    if (index < 5) await activity.getByRole('button', { name: 'Next question' }).click()
  }
  await activity.getByRole('button', { name: 'See how it went' }).click()
  await expect(activity.getByRole('button', { name: 'Back to today’s plan' })).toBeVisible()
  expect(posted).toHaveLength(5)
  expect(new Set(posted.map(row => row.content_id)).size).toBe(5)
  await activity.getByRole('button', { name: 'Back to today’s plan' }).click()
  await expect(page.locator('.home-v3-hero')).toBeVisible()
})

test('#647 Psychology real published topic delivers a multi-question session with distinct scoped evidence', async ({ page }) => {
  await seedReturningStudent(page, psychologyCourseId)
  const posted: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') posted.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero).toContainText('Psychology')
  await hero.getByRole('button', { name: /^Start .*quick check/i }).click()
  const activity = page.locator('.home-focused-activity')
  const description = await activity.locator('.home-quick-check__progress').innerText()
  const count = Number(description.match(/1 of (\d+)/)?.[1])
  expect(count).toBeGreaterThan(1)
  await expect(activity).toContainText(`1 of ${count}`)
  await activity.locator('.home-focused-options button').first().click()
  await activity.getByRole('button', { name: /^Check “/ }).click()
  await expect(activity.getByRole('button', { name: 'Next question' })).toBeVisible()
  await activity.getByRole('button', { name: 'Next question' }).click()
  await expect(activity).toContainText(`2 of ${count}`)
  await activity.locator('.home-focused-options button').first().click()
  await activity.getByRole('button', { name: /^Check “/ }).click()
  expect(posted).toHaveLength(2)
  expect(new Set(posted.map(row => row.content_id)).size).toBe(2)
  for (const row of posted) {
    expect(row.topic_id).toBeTruthy()
    expect(row.module_id).toMatch(/^psychology-aqa-a-level-7182-paper-/)
    expect(row.source).toBe('multiple_choice')
  }
  if (count > 2) await expect(activity.getByRole('button', { name: 'Back to today’s plan' })).toHaveCount(0)
})

test('#647 incomplete focused work does not masquerade as completed after leaving and re-entering', async ({ page }) => {
  await seedReturningStudent(page)
  const posted: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') posted.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await hero.getByRole('button', { name: /^Start .*quick check/i }).click()
  const focused = page.locator('.home-focused-activity')
  await focused.locator('.home-focused-options button').first().click()
  await focused.getByRole('button', { name: /^Check “/ }).click()
  await expect(focused.getByRole('button', { name: 'Next question' })).toBeVisible()
  await focused.getByRole('button', { name: 'Back to Home' }).click()
  await page.reload()
  await expect(hero.getByRole('button', { name: /^Start/ })).toBeVisible()
  await hero.getByRole('button', { name: /^Start .*quick check/i }).click()
  await expect(focused).toContainText('1 of 5')
  await expect(focused.getByRole('button', { name: 'Back to today’s plan' })).toHaveCount(0)
  expect(posted).toHaveLength(1)
})

test('quick check keyboard saves once, retains feedback and summarises missed terms', async ({ page }, testInfo) => {
  await seedReturningStudent(page, psychologyCourseId)
  const posted: Array<Record<string, unknown>> = []
  let failFirst = true
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') {
      posted.push(route.request().postDataJSON() as Record<string, unknown>)
      if (failFirst) {
        failFirst = false
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"Please retry"}' })
        return
      }
    }
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  await page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*quick check/i }).click()
  const activity = page.locator('.home-quick-check')
  const count = Number((await activity.locator('.home-quick-check__progress').innerText()).match(/1 of (\d+)/)?.[1])
  const missed: string[] = []
  await page.screenshot({ path: testInfo.outputPath('quick-check-unanswered.png'), fullPage: true })
  await expect(activity.getByRole('button', { name: 'Pick an answer to check' })).toHaveAttribute('aria-disabled', 'true')
  for (let index = 0; index < count; index++) {
    const heading = activity.locator('.home-quick-check__definition h2')
    const hasBlank = await heading.locator('.home-quick-check__blank').count()
    await page.keyboard.press('a')
    const chosen = (await activity.locator('[data-quick-action="option"][aria-pressed="true"] > span:nth-child(2)').innerText()).trim()
    if (hasBlank) await expect(heading.locator('.home-quick-check__term')).toHaveText(chosen)
    if (index === 0) await page.screenshot({ path: testInfo.outputPath('quick-check-picked.png'), fullPage: true })
    await page.keyboard.press('Enter')
    if (index === 0) {
      await expect(activity).toContainText('Could not save')
      await expect(activity.locator('[aria-pressed="true"]')).toBeEnabled()
      await page.keyboard.press('Enter')
    }
    const next = activity.getByRole('button', { name: index === count - 1 ? 'See how it went' : 'Next question' })
    await expect(next).toBeFocused()
    await expect(heading).toBeVisible()
    if (index === 0) await page.screenshot({ path: testInfo.outputPath('quick-check-feedback.png'), fullPage: true })
    await expect(activity.getByText('Correct', { exact: true })).toBeVisible()
    await expect(activity.locator('[data-quick-action="option"]:enabled')).toHaveCount(0)
    if (await activity.getByText('Your answer', { exact: true }).count()) missed.push((await activity.locator('[data-state="right"] > span:nth-child(2)').innerText()).trim())
    await expectNoHorizontalOverflow(page)
    await page.keyboard.press('Enter')
  }
  await page.screenshot({ path: testInfo.outputPath('quick-check-summary.png'), fullPage: true })
  expect(posted).toHaveLength(count + 1)
  expect(posted[0].evidence_id).toBeTruthy()
  expect(posted[0].evidence_id).toBe(posted[1].evidence_id)
  await expect(activity.getByRole('heading', { name: `${count - missed.length} of ${count} right` })).toBeFocused()
  for (const term of missed) await expect(activity.locator('.home-quick-check__summary strong').filter({ hasText: term })).toBeVisible()
  await expect(activity.getByRole('button', { name: 'Back to today’s plan' })).toBeVisible()
})

test('Home v3 exposes one alternative and retains exhausted choices after reload', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)

  const suggestion = page.locator('.home-v3-next')
  const title = suggestion.locator('h2')
  await expect(suggestion).toBeVisible()
  const first = await title.textContent()
  await suggestion.getByRole('button', { name: 'Suggest something else' }).click()
  await expect(title).not.toHaveText(first ?? '')

  await expect(page.locator('.home-v3-hero').getByRole('button', { name: 'Open Plan', exact: true })).toHaveCount(0)
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: 'Not now', exact: true })).toHaveCount(0)
  // Rotating past the last eligible suggestion must not reappear through the fallback path.
  for (let index = 0; index < 100 && await suggestion.isVisible(); index += 1) {
    await suggestion.getByRole('button', { name: 'Suggest something else' }).click()
  }
  await expect(page.locator('.home-v3-no-task')).toContainText("That's everything I'd suggest for today.")
  await expect(page.locator('.home-v3-no-task').getByRole('button', { name: 'Open Plan' })).toBeVisible()
  await expect(page.locator('.home-v3-hero h1')).not.toContainText('today done')
  await expectNoHorizontalOverflow(page)

  await page.reload()
  await expect(page.locator('.home-v3-no-task')).toContainText("That's everything I'd suggest for today.")
})

test('Home exam-date action opens the one Plan-owned Manage Exams editor', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)
  await page.locator('.home-v3-exams').getByRole('button', { name: /Edit dates/ }).click()

  await expect(page).toHaveURL(/#\/plan\?intent=manage-exams/)
  await expect(page.locator('#manage-exams-title')).toBeVisible()
  await expect(page.locator('.pln-dialog')).toBeVisible()
})

test('Submitting Home Ask REV sends once through the shared contextual conversation', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(appPath)
  const input = page.locator('#home-v3-ask-input')
  await input.fill('what should I do today?')
  await input.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('what should I do today?', { exact: true })).toHaveCount(1)
})


// Uses normal learner evidence and an imminent exam to produce an exam-question
// REV recommendation. The actual Home Start must reach the one valid question,
// persist only after explicit self-marking, and return to Home.
test('Home exam-practice Start opens the exact question, saves real evidence once and returns', async ({ page }) => {
  await seedReturningStudent(page)
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  const topicId = 'finance'
  const occurredAt = new Date(Date.now() - 2 * 86_400_000).toISOString()
  const base = { moduleId, topicId, occurredAt, schemaVersion: 1 }
  const stored = [
    ...[2, 1, 1].map((rating, index) => ({
      ...base, id: `existing-recall-${index}`, contentId: `existing-recall-${index}`,
      source: 'flashcard', rating,
    })),
    ...[true, true, false].map((correct, index) => ({
      ...base, id: `existing-check-${index}`, contentId: `existing-check-${index}`,
      source: 'multiple_choice', correct, selectedOption: correct ? 1 : 0, correctOption: 1,
    })),
  ]
  const posted: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      posted.push(body)
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
      return
    }
    const requestedModule = new URL(route.request().url()).searchParams.get('module_id')
    const matches = requestedModule === `eq.${moduleId}`
    const saved = matches ? [...stored.map((payload) => ({ payload })), ...posted.map((row) => ({ payload: row.payload }))] : []
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saved) })
  })
  const date = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10)
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([{ assessment_id: 'known-exam', user_id: userId, subject_id: 'business',
        course_id: businessCourseId, module_id: null, assessment_type: 'public_exam', title: 'AQA Business exam',
        assessment_date: date, relative_importance: 'normal', scope: { topicIds: [topicId] }, is_active: true }]),
    })
  })

  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero).toContainText('Finance')
  const start = hero.getByRole('button', { name: /^Start .*exam practice/i })
  await expect(start).toBeVisible()
  await start.click()

  const activity = page.locator('.home-focused-activity')
  await expect(activity.getByRole('heading', { name: 'Finance' })).toBeVisible()
  await expect(activity.getByRole('heading', { name: 'Practise one exam question' })).toBeVisible()
  await expect(activity).toContainText('Question 16 of 24')
  await expect(activity.getByText(/Calculate the break-even output/)).toBeVisible()
  await expect(activity.getByRole('button', { name: 'Open timed exam' })).toHaveCount(0)
  expect(posted).toHaveLength(0)

  await activity.getByRole('textbox', { name: 'Write your answer' }).fill('Contribution is £16, so £192,000 / £16 = 12,000 units.')
  await activity.getByRole('button', { name: 'Show marking guidance' }).click()
  await expect(activity.getByText('Marking guidance')).toBeVisible()
  expect(posted).toHaveLength(0)
  await activity.locator('.ao-marker-grid input').first().fill('1')
  await activity.getByRole('button', { name: 'Record this result' }).click()
  await expect(activity.getByText(/Result recorded:/)).toBeVisible()
  expect(posted).toHaveLength(1)
  expect(posted[0]).toMatchObject({ module_id: moduleId, topic_id: topicId, source: 'exam_question', content_id: 'p1-q16' })

  await activity.getByRole('button', { name: 'Back to Home' }).click()
  await expect(page.locator('.home-v3-hero')).toBeVisible()
  expect(posted).toHaveLength(1)
  await expectNoHorizontalOverflow(page)
})
