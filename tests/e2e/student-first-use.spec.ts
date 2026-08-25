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
  await expect(page.getByRole('heading', { name: 'Add your first course' })).toBeVisible()
  await page.getByLabel('Qualification').selectOption({ label: 'AQA A-level' })
  await expect(page.getByText('Business', { exact: true })).toBeVisible()
  await expect(page.getByText('AQA', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Add this course' }).click()
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
    const options = page.locator('.first-use-options input[type="radio"]')
    await expect(options.first()).toBeVisible()
    await options.first().check()
    await page.getByRole('button', { name: index === 4 ? 'See my starting point' : 'Continue' }).click()
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

  await expect(page.getByRole('heading', { name: /Hey New,\s*what shall we do today\?/ })).toBeVisible()
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