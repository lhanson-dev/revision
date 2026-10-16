import { createHash } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { appPath, syntheticUserId, aLevelCourseId, seedNewStudentSession, stubFirstUseBackend } from './first-use-seed'

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function chooseStudentAndAddAlevelBusiness(page: Page) {
  await page.getByRole('button', { name: /^Student\b/ }).click()
  await expect(page.getByRole('heading', { name: 'Add your courses' })).toBeVisible()
  // Step 1: level. Only levels with a live course are offered; with one, it is already chosen.
  await expect(page.getByText('Step 1 of 4')).toBeVisible()
  await expect(page.getByRole('radio', { name: /A-level/ })).toBeChecked()
  await page.getByRole('button', { name: 'Continue' }).click()
  // Step 2: subjects at that level.
  await expect(page.getByText('Step 2 of 4')).toBeVisible()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  // Step 3: exam board (and AS or full A-level) for each subject.
  await expect(page.getByText('Step 3 of 4')).toBeVisible()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()
  // Step 4: optional exam dates only. Weekly study time belongs to Plan after first value.
  await expect(page.getByText('Step 4 of 4')).toBeVisible()
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  await expect(page.getByText('Course added', { exact: true })).toBeVisible()
}

test('new Student completes first-use journey through useful revision and meaningful Home', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Full journey runs once; responsive selector is covered separately.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: 'How will you use Revision?' })).toBeVisible()
  await chooseStudentAndAddAlevelBusiness(page)

  await page.getByRole('button', { name: 'Find my starting point' }).click()
  await expect(page.getByText('Starting check', { exact: true })).toBeVisible()

  for (let index = 0; index < 5; index += 1) {
    const prompt = page.locator('#starting-check-heading')
    const currentPrompt = await prompt.textContent()
    const options = page.locator('.first-use-options input[type="radio"]')
    await expect(options.first()).toBeVisible()
    await options.first().check()
    const action = page.getByRole('button', { name: index === 4 ? 'See my starting point' : 'Continue' })
    await expect(action).toBeEnabled()
    await action.click()
    if (index < 4 && currentPrompt) await expect(prompt).not.toHaveText(currentPrompt)
  }

  await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start revision' })).toBeVisible()
  await page.getByRole('button', { name: 'Start revision' }).click()

  await expect(page.getByText('Your first useful revision', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('button', { name: 'Knew it' }).click()

  await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'You knew that one.' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do next\./ })).toBeVisible()
  expect(state.memberships.map((item) => item.course_id)).toEqual([aLevelCourseId])
  expect(state.startingEvidence).toHaveLength(5)
  expect(state.learningEvidence).toHaveLength(1)
  expect(state.account?.onboarding_stage).toBe('complete')
  expect(state.account?.onboarding_completed_at).not.toBeNull()

  const eventMetadata = state.firstUseEvents.map((event) => event.metadata ?? {})
  expect(JSON.stringify(eventMetadata)).not.toContain('selectedOption')
  expect(JSON.stringify(eventMetadata)).not.toContain('correctOption')
})

test('Skip for now degrades directly into deterministic useful revision rather than empty Home', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Recovery path runs once.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  await page.goto(appPath)

  await chooseStudentAndAddAlevelBusiness(page)
  await page.getByRole('button', { name: 'Skip for now' }).click()

  await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start revision' })).toBeVisible()
  expect(state.startingEvidence).toHaveLength(0)
  expect(state.firstUseEvents.some((event) => event.event_type === 'starting_check_skipped')).toBe(true)
})

test('account choice remains compact, accessible and themed across supported viewports', async ({ page }) => {
  await seedNewStudentSession(page, { dark: true })
  await stubFirstUseBackend(page)
  await page.goto(appPath)

  const shell = page.locator('.first-use-shell')
  await expect(shell).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('heading', { name: 'How will you use Revision?' })).toBeVisible()

  const choices = page.locator('.first-use-experience-card')
  await expect(choices).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) await expect(choices.nth(index)).toBeVisible()

  await expect(page.getByRole('button', { name: /^Student\b/ })).toBeEnabled()
  await expect(page.getByRole('button', { name: /^Parent\b/ })).toBeDisabled()
  await expect(page.getByRole('button', { name: /^Teacher\b/ })).toBeDisabled()
  await expect(page.getByText('Coming soon', { exact: true })).toHaveCount(2)
  await expectNoPageOverflow(page)

  if ((page.viewportSize()?.width ?? 0) <= 900) {
    const heights = await choices.evaluateAll((elements) => elements.map((element) => Math.round(element.getBoundingClientRect().height)))
    expect(Math.max(...heights)).toBeLessThanOrEqual(110)
  }
})

test('course choice goes Level, then subjects, then exam board, keeps picks when going back, and needs a pick before adding', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Flow runs once; layout is checked at every width below.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  await page.goto(appPath)
  await page.getByRole('button', { name: /^Student\b/ }).click()

  await expect(page.getByText('Only courses that are ready to study are shown here.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  // At least one subject is needed to go on.
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()

  // Business has both AS and A-level, so the student chooses; nothing is added until they do.
  const add = page.getByRole('button', { name: /^Add\s*courses?$/ })
  await expect(add).toBeDisabled()
  await page.getByRole('radio', { name: /AQA AS/ }).check()
  await expect(page.getByRole('button', { name: 'Add 1 course' })).toBeEnabled()

  // Going back keeps the subject picked.
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByRole('checkbox', { name: 'Business' })).toBeChecked()
  expect(state.memberships).toHaveLength(0)
})

test('course choice is usable, accessible and never scrolls sideways from 320px to 1440px', async ({ page }) => {
  await seedNewStudentSession(page)
  await stubFirstUseBackend(page)
  await page.goto(appPath)
  await page.getByRole('button', { name: /^Student\b/ }).click()

  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expectNoPageOverflow(page)
  }
  await expect(page.locator('.onb-card').first()).toHaveCSS('min-height', '56px')
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => item.id)).toEqual([])

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.setViewportSize({ width: 320, height: 900 })
  await expectNoPageOverflow(page)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => item.id)).toEqual([])
  await page.getByRole('button', { name: 'Continue' }).click()
  await expectNoPageOverflow(page)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => item.id)).toEqual([])
})

test('onboarding saves a known exam date before any starting check, without requiring weekly availability', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Flow runs once; layout is checked at every width.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  const assessments: Array<Record<string, unknown>> = []
  const profiles: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      assessments.push(body)
      await route.fulfill({ status: 201, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ assessment_id: `a-${assessments.length}`, user_id: syntheticUserId, subject_id: body.subject_id, course_id: body.course_id, module_id: null, assessment_type: body.assessment_type, title: body.title, assessment_date: body.assessment_date, relative_importance: body.relative_importance, scope: {}, is_active: true }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      profiles.push(body)
      await route.fulfill({ status: 201, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ user_id: syntheticUserId, weekday_minutes: 0, weekend_minutes: 0, monday_minutes: body.monday_minutes, tuesday_minutes: body.tuesday_minutes, wednesday_minutes: body.wednesday_minutes, thursday_minutes: body.thursday_minutes, friday_minutes: body.friday_minutes, saturday_minutes: body.saturday_minutes, sunday_minutes: body.sunday_minutes, timezone: 'Europe/London' }) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: 'null' })
    }
  })
  await page.goto(appPath)
  await page.getByRole('button', { name: /^Student\b/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()

  // Step 4: dates are chosen on the calendar (past days cannot be picked) and saved against the right course.
  await expect(page.getByText('Step 4 of 4')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save dates and continue' })).toBeDisabled()
  await page.getByRole('button', { name: /^Paper 1 date/ }).click()
  const picker = page.getByRole('dialog', { name: 'Choose paper 1 date' })
  await expect(picker.locator('.ui-date-day:disabled').first()).toBeVisible()
  await picker.getByRole('button', { name: 'Next month' }).click()
  const next = new Date(); next.setDate(1); next.setMonth(next.getMonth() + 1)
  const iso = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`
  await picker.locator('.ui-date-day:not(.ui-date-day--outside)').first().click()
  await page.getByRole('button', { name: 'Save dates and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  expect(assessments).toHaveLength(1)
  expect(assessments[0]).toMatchObject({ course_id: aLevelCourseId, assessment_date: iso, assessment_type: 'public_exam' })
  expect(profiles).toHaveLength(0)
  expect(state.startingEvidence).toHaveLength(0)
  expect(state.learningEvidence).toHaveLength(0)
  await expect(page.getByText('How much time can you revise each day?')).toHaveCount(0)
  await page.getByRole('button', { name: 'Find my starting point' }).click()
  await expect(page.getByText('Starting check', { exact: true })).toBeVisible()
  expect(profiles).toHaveLength(0)
})

test('partial two-paper exam save can retry without duplicating paper dates or writing learning evidence', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Multi-paper write recovery runs once.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  const stored: Array<Record<string, unknown>> = []
  let failPaperTwo = true
  let insertCount = 0
  let updateCount = 0

  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(stored) })
      return
    }
    if (method === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      insertCount += 1
      if (body.title === 'Paper 2: Business 2' && failPaperTwo) {
        failPaperTwo = false
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST500', message: 'simulated second paper save failure' }) })
        return
      }
      const saved = { ...body, assessment_id: 'assessment-' + insertCount }
      stored.push(saved)
      await route.fulfill({ status: 201, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(saved) })
      return
    }
    if (method === 'PATCH') {
      updateCount += 1
      const body = route.request().postDataJSON() as Record<string, unknown>
      const id = route.request().url().match(/assessment_id=eq\.([^&]+)/)?.[1]
      const existing = stored.find((row) => row.assessment_id === id)
      if (!existing) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Unknown assessment' }) })
        return
      }
      Object.assign(existing, body)
      await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(existing) })
      return
    }
    await route.fulfill({ status: 405, contentType: 'application/json', body: '{}' })
  })

  await page.goto(appPath)
  await page.getByRole('button', { name: /^Student\b/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()
  await expect(page.getByText('Step 4 of 4')).toBeVisible()

  for (const paper of [1, 2]) {
    await page.getByRole('button', { name: new RegExp('^Paper ' + paper + ' date') }).click()
    const picker = page.getByRole('dialog', { name: 'Choose paper ' + paper + ' date' })
    await picker.getByRole('button', { name: 'Next month' }).click()
    await picker.locator('.ui-date-day:not(.ui-date-day--outside)').first().click()
  }
  await page.getByRole('button', { name: 'Save dates and continue' }).click()
  await expect(page.getByText(/simulated second paper save failure/)).toBeVisible()
  await expect(page.getByText('Step 4 of 4')).toBeVisible()
  expect(stored).toHaveLength(1)
  expect(stored[0]).toMatchObject({ course_id: aLevelCourseId, assessment_type: 'public_exam', is_active: true })
  expect(stored[0].module_id).toBeTruthy()
  expect(state.startingEvidence).toHaveLength(0)
  expect(state.learningEvidence).toHaveLength(0)

  await page.getByRole('button', { name: 'Save dates and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  expect(stored).toHaveLength(2)
  expect(new Set(stored.map((row) => row.module_id)).size).toBe(2)
  expect(stored.every((row) => row.course_id === aLevelCourseId && row.assessment_type === 'public_exam')).toBe(true)
  expect(insertCount).toBe(3) // Paper 1 once, Paper 2 failed once then succeeded.
  expect(updateCount).toBe(0)
  expect(state.startingEvidence).toHaveLength(0)
  expect(state.learningEvidence).toHaveLength(0)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  expect(stored).toHaveLength(2)
})

test('an existing course-and-title exam date is reconciled to the exact paper without another insert', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Legacy exam date reconciliation runs once.')
  await seedNewStudentSession(page)
  await stubFirstUseBackend(page)
  const stored: Record<string, unknown> = {
    assessment_id: 'legacy-paper-1',
    user_id: syntheticUserId,
    subject_id: 'business',
    course_id: aLevelCourseId,
    module_id: null,
    title: 'Paper 1: Business 1',
    assessment_type: 'public_exam',
    assessment_date: '2027-06-01',
    relative_importance: 'high',
    scope: {},
    is_active: true,
  }
  let writes = 0
  let updates = 0
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([stored]) })
      return
    }
    if (method === 'PATCH') {
      updates += 1
      Object.assign(stored, route.request().postDataJSON() as Record<string, unknown>)
      await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(stored) })
      return
    }
    writes += 1
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Unexpected new assessment row' }) })
  })

  await page.goto(appPath)
  await page.getByRole('button', { name: /^Student\b/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()
  await page.getByRole('button', { name: /^Paper 1 date/ }).click()
  const picker = page.getByRole('dialog', { name: 'Choose paper 1 date' })
  await picker.getByRole('button', { name: 'Next month' }).click()
  await picker.locator('.ui-date-day:not(.ui-date-day--outside)').first().click()
  await page.getByRole('button', { name: 'Save dates and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  expect(writes).toBe(0)
  expect(updates).toBe(1)
  expect(stored.module_id).toBeTruthy()
  expect(stored.assessment_id).toBe('legacy-paper-1')
  expect(stored.course_id).toBe(aLevelCourseId)
})

test('optional exam dates screen remains responsive and accessible without a study-time step', async ({ page }) => {
  await seedNewStudentSession(page)
  await stubFirstUseBackend(page)
  await page.goto(appPath)
  await page.getByRole('button', { name: /^Student\b/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()
  for (const width of [320, 390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expectNoPageOverflow(page)
  }
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => item.id)).toEqual([])
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  await page.setViewportSize({ width: 320, height: 900 })
  await expectNoPageOverflow(page)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => item.id)).toEqual([])
})

test('weekly study availability is added from Plan only after first useful revision', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Post-first-value Plan entry runs once.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  const profiles: Array<Record<string, unknown>> = []
  let savedAvailability: Record<string, unknown> | null = null
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown>
      profiles.push(body)
      savedAvailability = { ...body, user_id: syntheticUserId, weekday_minutes: 0, weekend_minutes: 0, timezone: 'Europe/London' }
      await route.fulfill({ status: 201, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(savedAvailability) })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(savedAvailability) })
    }
  })
  await page.goto(appPath)
  await chooseStudentAndAddAlevelBusiness(page)
  expect(profiles).toHaveLength(0)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Start revision' }).click()
  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('button', { name: 'Knew it' }).click()
  await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
  expect(profiles).toHaveLength(0)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do next\./ })).toBeVisible()
  expect(state.learningEvidence).toHaveLength(1)
  expect(profiles).toHaveLength(0)

  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('heading', { name: 'Study time' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Set study time' })).toBeVisible()
  await page.getByRole('button', { name: 'Set study time' }).click()
  await page.getByRole('button', { name: 'More study time on Monday' }).click()
  await page.getByRole('button', { name: 'Save study time' }).click()
  await expect(page.getByRole('button', { name: 'Change study time' })).toBeVisible()
  expect(profiles).toHaveLength(1)
  expect(profiles[0]).toMatchObject({ monday_minutes: 15 })
  expect(state.learningEvidence).toHaveLength(1)
})

test('an interrupted starting check restores only unanswered questions and can use a partial signal', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Recovery journey runs once on the canonical desktop viewport.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  await page.goto(appPath)
  await chooseStudentAndAddAlevelBusiness(page)

  await page.getByRole('button', { name: 'Find my starting point' }).click()
  await expect(page.locator('.first-use-check-progress strong')).toHaveText('1 of 5')
  const firstPrompt = await page.locator('#starting-check-heading').textContent()
  await page.locator('.first-use-options input[type="radio"]').first().check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.locator('.first-use-check-progress strong')).toHaveText('2 of 5')
  expect(state.startingEvidence).toHaveLength(1)
  expect(state.account?.onboarding_stage).toBe('starting_check')
  const firstAnswer = state.startingEvidence[0].payload
  expect(firstAnswer.questionId).toBeTruthy()
  expect(state.learningEvidence).toHaveLength(0)

  await page.reload()
  await expect(page.locator('.first-use-check-progress strong')).toHaveText('2 of 5')
  await expect(page.locator('#starting-check-heading')).not.toHaveText(firstPrompt ?? '')
  expect(state.startingEvidence).toHaveLength(1)
  expect(state.startingEvidence[0].payload.questionId).toBe(firstAnswer.questionId)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
  expect(state.account?.onboarding_stage).toBe('recommendation')
  expect(state.startingEvidence).toHaveLength(1)
  expect(state.learningEvidence).toHaveLength(0)
  await expect.poll(() => state.firstUseEvents.some((event) =>
    event.event_type === 'starting_check_partial' &&
    (event.metadata as Record<string, unknown> | undefined)?.answered_count === 1,
  )).toBe(true)

  await page.reload()
  await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start revision' })).toBeEnabled()
  expect(state.startingEvidence).toHaveLength(1)
  expect(state.account?.onboarding_completed_at).toBeNull()
})

test('a saved first revision activity and its feedback resume after reload without duplicating evidence', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Activity/feedback recovery runs once.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  await page.goto(appPath)
  await chooseStudentAndAddAlevelBusiness(page)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await page.getByRole('button', { name: 'Start revision' }).click()
  const activityPrompt = await page.locator('#first-activity-heading').textContent()
  const starterTopic = state.account?.starter_topic_id
  expect(state.account?.onboarding_stage).toBe('activity')
  expect(starterTopic).toBeTruthy()
  expect(state.account?.starter_activity).toBe('flashcard')
  expect(state.learningEvidence).toHaveLength(0)

  await page.reload()
  await expect(page.locator('#first-activity-heading')).toHaveText(activityPrompt ?? '')
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible()
  expect(state.account?.starter_topic_id).toBe(starterTopic)
  expect(state.learningEvidence).toHaveLength(0)

  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('button', { name: 'Knew it' }).click()
  await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
  expect(state.account?.onboarding_stage).toBe('feedback')
  expect(state.learningEvidence).toHaveLength(1)
  const savedEvidence = state.learningEvidence[0].payload
  expect(savedEvidence.topicId).toBe(starterTopic)

  await page.reload()
  await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'You knew that one.' })).toBeVisible()
  expect(state.learningEvidence).toHaveLength(1)
  expect(state.learningEvidence[0].payload.id).toBe(savedEvidence.id)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do next\./ })).toBeVisible()
  expect(state.account?.onboarding_stage).toBe('complete')
  expect(state.account?.onboarding_completed_at).not.toBeNull()
  expect(state.learningEvidence).toHaveLength(1)
})

test('failed first learning-evidence save leaves the activity retryable and cannot complete onboarding', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Evidence-write recovery runs once.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  let remainingFailures = 1
  let attemptedWrites = 0
  // Intercept only the first write. On retry, fall through to the existing persisted mock store.
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() === 'POST') {
      attemptedWrites += 1
      if (remainingFailures > 0) {
        remainingFailures -= 1
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'simulated evidence store unavailable', code: 'PGRST500' }),
        })
        return
      }
    }
    await route.fallback()
  })

  await page.goto(appPath)
  await chooseStudentAndAddAlevelBusiness(page)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await page.getByRole('button', { name: 'Start revision' }).click()
  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('button', { name: 'Knew it' }).click()

  await expect(page.getByText(/Could not save learning evidence: simulated evidence store unavailable/)).toBeVisible()
  await expect(page.getByText(/Your work is still on screen; try again/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Knew it' })).toBeVisible()
  await expect(page.getByText('First revision complete', { exact: true })).toHaveCount(0)
  expect(attemptedWrites).toBe(1)
  expect(state.account?.onboarding_stage).toBe('activity')
  expect(state.account?.onboarding_completed_at).toBeNull()
  expect(state.learningEvidence).toHaveLength(0)

  await page.getByRole('button', { name: 'Knew it' }).click()
  await expect(page.getByText('First revision complete', { exact: true })).toBeVisible()
  expect(attemptedWrites).toBe(2)
  expect(state.learningEvidence).toHaveLength(1)
  expect(state.account?.onboarding_stage).toBe('feedback')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do next\./ })).toBeVisible()
  expect(state.account?.onboarding_completed_at).not.toBeNull()
  expect(state.learningEvidence).toHaveLength(1)
})

/** C3 approved visual-only account-choice baselines; behavioural checks stay intact.
 * Founder approved PR #593's reviewed phone Light/Dark screenshots on
 * 10 October 2026 (CI #2965, run 38062078446, artifact 11673104330),
 * by replying "Approve PR #593" to the four-baseline review request.
 * Keep outside B7's fixed 18-state visual matrix; no merge approval.
 */
const approvedFirstUseDigests: Record<'light' | 'dark', string> = {
  light: '0d0700c8fe36608b7fb020358797dec8853e797cbd3d602fdc8c94033dc27be0',
  dark: 'c9fe02595f5fe5accd04e866f8647194d28efc26c69c22ec69babb4dae4f21be',
}
for (const theme of ['light', 'dark'] as const) {
  test(`phone experience selection ${theme} C3 visual review`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Canonical phone review viewport only')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript((selectedTheme) => localStorage.setItem('revision:theme', selectedTheme), theme)
    await seedNewStudentSession(page, { dark: theme === 'dark' })
    await stubFirstUseBackend(page)
    await page.goto(appPath)
    await expect(page.getByRole('heading', { name: 'How will you use Revision?' })).toBeVisible()
    // The heading mounts before the theme and all three choice cards have
    // finished rendering. Wait for the actual approved first-use state before
    // hashing pixels, rather than comparing an intermediate frame.
    await expect(page.locator('.first-use-shell')).toHaveAttribute('data-theme', theme)
    const cards = page.locator('.first-use-experience-card')
    await expect(cards).toHaveCount(3)
    for (let index = 0; index < 3; index += 1) await expect(cards.nth(index)).toBeVisible()
    await expect(page.getByRole('button', { name: /^Student\b/ })).toBeEnabled()
    await expect(page.getByText('Coming soon', { exact: true })).toHaveCount(2)
    await page.evaluate(async () => {
      await document.fonts.ready
      window.scrollTo(0, 0)
      // Allow layout/paint to consume the loaded fonts and selected theme.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    })
    const screenshot = await page.screenshot({ animations: 'disabled', caret: 'hide', fullPage: false })
    await testInfo.attach(`first-use-account-${theme}-phone.png`, { body: screenshot, contentType: 'image/png' })
    expect([approvedFirstUseDigests[theme]]).toContain(createHash('sha256').update(screenshot).digest('hex'))
  })
}
