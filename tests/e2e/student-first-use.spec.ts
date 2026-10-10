import { createHash } from 'node:crypto'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page, type Route } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const syntheticUserId = '61000000-0000-4000-8000-000000000061'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

type AccountStateRow = {
  user_id: string
  primary_experience: 'student'
  onboarding_stage: string
  onboarding_completed_at: string | null
  starter_topic_id: string | null
  starter_activity: string | null
  created_at: string
  updated_at: string
}

type StubState = {
  account: AccountStateRow | null
  memberships: Array<{ user_id: string; course_id: string; created_at: string }>
  startingEvidence: Array<{ payload: Record<string, unknown> }>
  learningEvidence: Array<{ payload: Record<string, unknown> }>
  firstUseEvents: Array<Record<string, unknown>>
}

function payloadObject(route: Route) {
  const payload = route.request().postDataJSON() as Record<string, unknown> | Record<string, unknown>[]
  return Array.isArray(payload) ? payload[0] ?? {} : payload ?? {}
}

async function seedNewStudentSession(page: Page, options: { dark?: boolean } = {}) {
  await page.addInitScript(({ key, id, dark }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const accessToken = `${header}.${payload}.synthetic`
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
        email: 'new-student-browser-test@revision.invalid',
        email_confirmed_at: '2026-08-24T21:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'New' },
        identities: [],
        created_at: '2026-08-24T21:30:00.000Z',
        updated_at: '2026-08-24T21:30:00.000Z',
      },
    }))
    if (dark) localStorage.setItem('revision:theme', 'dark')
  }, { key: storageKey, id: syntheticUserId, dark: options.dark === true })

  await page.route('**/auth/v1/settings', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ external: { google: true } }) })
  })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: syntheticUserId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'new-student-browser-test@revision.invalid',
        email_confirmed_at: '2026-08-24T21:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'New' },
        identities: [],
        created_at: '2026-08-24T21:30:00.000Z',
        updated_at: '2026-08-24T21:30:00.000Z',
      }),
    })
  })
}

async function stubFirstUseBackend(page: Page): Promise<StubState> {
  const state: StubState = {
    account: null,
    memberships: [],
    startingEvidence: [],
    learningEvidence: [],
    firstUseEvents: [],
  }

  // Keep downstream PlannerRuntime requests deterministic once onboarding completes.
  await page.route('**/rest/v1/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
    })
  })

  await page.route('**/rest/v1/account_experience_state**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.pgrst.object+json',
        body: JSON.stringify(state.account),
      })
      return
    }

    const payload = payloadObject(route)
    const now = '2026-08-24T21:31:00.000Z'
    if (method === 'POST') {
      state.account = {
        user_id: syntheticUserId,
        primary_experience: 'student',
        onboarding_stage: String(payload.onboarding_stage ?? 'course'),
        onboarding_completed_at: null,
        starter_topic_id: null,
        starter_activity: null,
        created_at: now,
        updated_at: now,
      }
      await route.fulfill({ status: 201, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(state.account) })
      return
    }

    if (method === 'PATCH' && state.account) {
      state.account = {
        ...state.account,
        onboarding_stage: String(payload.onboarding_stage ?? state.account.onboarding_stage),
        onboarding_completed_at: payload.onboarding_completed_at === undefined ? state.account.onboarding_completed_at : String(payload.onboarding_completed_at),
        starter_topic_id: payload.starter_topic_id === undefined ? state.account.starter_topic_id : String(payload.starter_topic_id),
        starter_activity: payload.starter_activity === undefined ? state.account.starter_activity : String(payload.starter_activity),
        updated_at: String(payload.updated_at ?? now),
      }
      await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(state.account) })
      return
    }

    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Unsupported account state test request' }) })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.memberships) })
      return
    }
    if (method === 'POST') {
      const payload = payloadObject(route)
      const row = {
        user_id: syntheticUserId,
        course_id: String(payload.course_id ?? aLevelCourseId),
        created_at: '2026-08-24T21:32:00.000Z',
      }
      state.memberships = [row]
      await route.fulfill({ status: 201, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(row) })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/student_first_use_events**', async (route) => {
    state.firstUseEvents.push(payloadObject(route))
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/starting_check_evidence**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.startingEvidence) })
      return
    }
    const payload = payloadObject(route)
    state.startingEvidence.push({ payload: payload.payload as Record<string, unknown> })
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state.learningEvidence) })
      return
    }
    const payload = payloadObject(route)
    state.learningEvidence.unshift({ payload: payload.payload as Record<string, unknown> })
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })

  return state
}

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
  await expect(page.getByText('Step 1 of 5')).toBeVisible()
  await expect(page.getByRole('radio', { name: /A-level/ })).toBeChecked()
  await page.getByRole('button', { name: 'Continue' }).click()
  // Step 2: subjects at that level.
  await expect(page.getByText('Step 2 of 5')).toBeVisible()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  // Step 3: exam board (and AS or full A-level) for each subject.
  await expect(page.getByText('Step 3 of 5')).toBeVisible()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()
  // Steps 4 and 5: exam dates and weekly study time, both optional here and changeable on Plan.
  await expect(page.getByText('Step 4 of 5')).toBeVisible()
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page.getByText('Step 5 of 5')).toBeVisible()
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

  await expect(page.getByRole('heading', { name: /Hey New\.\s*Here.s what I.d do today\./ })).toBeVisible()
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

test('onboarding saves exam dates and weekly study time with the plan, and both can be skipped or changed later on Plan', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Flow runs once; layout is checked at every width.')
  await seedNewStudentSession(page)
  await stubFirstUseBackend(page)
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
  await expect(page.getByText('Step 4 of 5')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save dates and continue' })).toBeDisabled()
  await page.getByRole('button', { name: /^Paper 1 date/ }).click()
  const picker = page.getByRole('dialog', { name: 'Choose paper 1 date' })
  await expect(picker.locator('.ui-date-day:disabled').first()).toBeVisible()
  await picker.getByRole('button', { name: 'Next month' }).click()
  const next = new Date(); next.setDate(1); next.setMonth(next.getMonth() + 1)
  const iso = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`
  await picker.locator('.ui-date-day:not(.ui-date-day--outside)').first().click()
  await page.getByRole('button', { name: 'Save dates and continue' }).click()
  await expect(page.getByText('Step 5 of 5')).toBeVisible()
  expect(assessments).toHaveLength(1)
  expect(assessments[0]).toMatchObject({ course_id: aLevelCourseId, assessment_date: iso, assessment_type: 'public_exam' })

  // Step 5: study time. Nothing can be saved until some time is set; "every day" sets all seven days.
  await expect(page.getByRole('button', { name: 'Save and continue' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Increase Mon study time' })).toHaveCSS('height', '48px')
  await page.getByRole('button', { name: 'Increase every day by 15 minutes' }).click()
  await page.getByRole('button', { name: 'Increase Sat study time' }).click()
  await expect(page.getByText('That’s 2h a week.')).toBeVisible()
  await page.getByRole('button', { name: 'Save and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Business is ready.' })).toBeVisible()
  expect(profiles).toHaveLength(1)
  expect(profiles[0]).toMatchObject({ monday_minutes: 15, saturday_minutes: 30, sunday_minutes: 15 })
})

test('exam dates and study time steps never scroll sideways and pass the accessibility check', async ({ page }) => {
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
  await page.setViewportSize({ width: 320, height: 900 })
  await expectNoPageOverflow(page)
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => item.id)).toEqual([])
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
    await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0) })
    const screenshot = await page.screenshot({ animations: 'disabled', caret: 'hide', fullPage: false })
    await testInfo.attach(`first-use-account-${theme}-phone.png`, { body: screenshot, contentType: 'image/png' })
    expect([approvedFirstUseDigests[theme]]).toContain(createHash('sha256').update(screenshot).digest('hex'))
  })
}
