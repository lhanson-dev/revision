import type { Page, Route } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
export const appPath = '/revision/app/'
export const syntheticUserId = '61000000-0000-4000-8000-000000000061'
export const aLevelCourseId = 'aqa:aqa-a-level:7132'

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

export async function seedNewStudentSession(page: Page, options: { dark?: boolean } = {}) {
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

export async function stubFirstUseBackend(page: Page): Promise<StubState> {
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

