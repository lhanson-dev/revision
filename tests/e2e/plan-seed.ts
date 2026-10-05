import type { Page } from '@playwright/test'

/**
 * Synthetic student for the Plan screen tests. Everything is intercepted at the network edge; nothing here
 * ships in production. The clock is fixed so the screenshots and date maths are the same on every run.
 */

export const appPath = '/revision/app/'
export const planStorageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
export const planUserId = '00000000-0000-4000-8000-000000000052'
export const businessCourseId = 'aqa:aqa-a-level:7132'

/** Monday 5 October 2026, midday. */
export const fixedNow = new Date(2026, 9, 5, 12, 0, 0)

export type Row = Record<string, unknown>

export function plannedRow(id: string, plannedDate: string, topicId: string, extra: Row = {}): Row {
  return {
    session_id: id,
    user_id: planUserId,
    planned_date: plannedDate,
    course_id: businessCourseId,
    topic_id: topicId,
    activity_type: 'practice',
    minutes: 30,
    added_by: 'student',
    recommendation_id: null,
    status: 'planned',
    created_at: '2026-10-01T06:00:00.000Z',
    updated_at: '2026-10-01T06:00:00.000Z',
    ...extra,
  }
}

/** Accepted sessions: two finished last week, one finished today, one REV pick still to do today, one later this week. */
export function defaultSessions(): Row[] {
  return [
    plannedRow('d1', '2026-09-30', 'finance', { status: 'done', minutes: 40, activity_type: 'learn' }),
    plannedRow('d2', '2026-10-02', 'marketing', { status: 'done', minutes: 25 }),
    plannedRow('t1', '2026-10-05', 'operations', { status: 'done', minutes: 20, activity_type: 'learn' }),
    plannedRow('t2', '2026-10-05', 'finance', { added_by: 'rev', minutes: 30, recommendation_id: 'rec-1' }),
    plannedRow('w1', '2026-10-07', 'hr', { minutes: 25, activity_type: 'learn' }),
  ]
}

export const weeklyMinutes = { monday: 90, tuesday: 60, wednesday: 60, thursday: 45, friday: 30, saturday: 60, sunday: 0 }

export const exams = [
  { assessment_id: 'a1', title: 'Paper 1: Business 1', assessment_date: '2026-10-22' },
  { assessment_id: 'a2', title: 'Paper 2: Business 2', assessment_date: '2026-11-05' },
]

type SeedOptions = {
  sessions?: Row[] | null
  withExams?: boolean
  withAvailability?: boolean
}

/** Seeds a signed-in Business student. `sessions: null` makes the planned-sessions table behave as if it does not exist. */
export async function seedPlanStudent(page: Page, options: SeedOptions = {}) {
  const { sessions = defaultSessions(), withExams = true, withAvailability = true } = options
  const store = sessions
  await page.clock.install({ time: fixedNow })
  await page.addInitScript(({ key, id }) => {
    const b64 = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem(key, JSON.stringify({
      access_token: `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: id, aud: 'authenticated', exp: 4102444800 })}.synthetic`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 4102444800,
      refresh_token: 'synthetic-refresh-token',
      user: {
        id,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'plan-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      },
    }))
  }, { key: planStorageKey, id: planUserId })

  const json = (body: unknown, status = 200, contentType = 'application/json') => ({ status, contentType, body: JSON.stringify(body) })

  await page.route('**/auth/v1/user**', (route) => route.fulfill(json({ id: planUserId, aud: 'authenticated', role: 'authenticated', email: 'plan-test@revision.invalid', email_confirmed_at: '2026-08-17T12:00:00.000Z', app_metadata: {}, user_metadata: { first_name: 'Synthetic' }, identities: [], created_at: '2026-08-17T12:00:00.000Z', updated_at: '2026-08-17T12:00:00.000Z' })))
  await page.route('**/rest/v1/learner_courses**', (route) => route.fulfill(json([{ user_id: planUserId, course_id: businessCourseId, created_at: '2026-08-22T18:00:00.000Z' }])))
  await page.route('**/rest/v1/learner_course_events**', (route) => route.fulfill(json([], 201)))
  await page.route('**/rest/v1/learning_evidence**', (route) => route.fulfill(json([], route.request().method() === 'POST' ? 201 : 200)))
  await page.route('**/rest/v1/revision_availability_exceptions**', (route) => route.fulfill(json([])))
  await page.route('**/rest/v1/revision_planning_preferences**', (route) => route.fulfill(json([])))
  await page.route('**/rest/v1/revision_activity_events**', (route) => route.fulfill(json([])))
  await page.route('**/rest/v1/profiles**', (route) => route.fulfill(json({ is_admin: false }, 200, 'application/vnd.pgrst.object+json')))

  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill(json(withExams
    ? exams.map((exam) => ({ ...exam, user_id: planUserId, subject_id: 'business', course_id: businessCourseId, module_id: null, assessment_type: 'public_exam', relative_importance: 'high', scope: {}, is_active: true }))
    : [])))

  const availabilityRow = {
    user_id: planUserId, weekday_minutes: 57, weekend_minutes: 30, timezone: 'Europe/London',
    monday_minutes: weeklyMinutes.monday, tuesday_minutes: weeklyMinutes.tuesday, wednesday_minutes: weeklyMinutes.wednesday,
    thursday_minutes: weeklyMinutes.thursday, friday_minutes: weeklyMinutes.friday, saturday_minutes: weeklyMinutes.saturday, sunday_minutes: weeklyMinutes.sunday,
  }
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill(withAvailability ? json(availabilityRow, 200, 'application/vnd.pgrst.object+json') : { status: 200, contentType: 'application/json', body: 'null' })
    } else {
      // A save: echo the saved row back so the screen can show it.
      const saved = { ...availabilityRow, ...(route.request().postDataJSON() as Row) }
      Object.assign(availabilityRow, saved)
      await route.fulfill(json(saved, 201, 'application/vnd.pgrst.object+json'))
    }
  })

  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    const request = route.request()
    const method = request.method()
    if (store === null) {
      await route.fulfill(json({ code: '42P01', message: 'relation "learner_planned_sessions" does not exist' }, 404))
      return
    }
    const wantsObject = (request.headers().accept ?? '').includes('vnd.pgrst.object')
    const url = new URL(request.url())
    const id = url.searchParams.get('session_id')?.replace('eq.', '')
    if (method === 'GET') {
      // Honour the date window the screen asks for, as the real table would.
      const from = url.searchParams.getAll('planned_date').find((value) => value.startsWith('gte.'))?.slice(4)
      const to = url.searchParams.getAll('planned_date').find((value) => value.startsWith('lte.'))?.slice(4)
      const rows = store.filter((row) => (!from || String(row.planned_date) >= from) && (!to || String(row.planned_date) <= to))
      await route.fulfill(json(rows))
    } else if (method === 'POST') {
      const row = { session_id: `n${store.length + 1}`, status: 'planned', created_at: '2026-10-05T06:00:00.000Z', updated_at: '2026-10-05T06:00:00.000Z', ...(request.postDataJSON() as Row) }
      store.push(row)
      await route.fulfill(json(wantsObject ? row : [row], 201, wantsObject ? 'application/vnd.pgrst.object+json' : 'application/json'))
    } else if (method === 'PATCH') {
      const row = store.find((item) => item.session_id === id)
      if (row) Object.assign(row, request.postDataJSON() as Row)
      await route.fulfill(json(row, 200, 'application/vnd.pgrst.object+json'))
    } else if (method === 'DELETE') {
      const index = store.findIndex((item) => item.session_id === id)
      if (index >= 0) store.splice(index, 1)
      await route.fulfill({ status: 204, body: '' })
    } else {
      await route.fulfill(json([]))
    }
  })
}
