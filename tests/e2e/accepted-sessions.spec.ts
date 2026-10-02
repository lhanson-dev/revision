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


type Row = Record<string, unknown>

/** A stand-in for the learner_planned_sessions table. `rows: null` makes it behave like a table that does not exist yet. */
async function fakePlannedSessions(page: Page, rows: Row[] | null) {
  const store = rows
  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    const request = route.request()
    const method = request.method()
    if (store === null) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: '42P01', message: 'relation "learner_planned_sessions" does not exist' }) })
      return
    }
    const wantsObject = (request.headers().accept ?? '').includes('vnd.pgrst.object')
    const id = new URL(request.url()).searchParams.get('session_id')?.replace('eq.', '')
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(store) })
    } else if (method === 'POST') {
      const row = { session_id: `s${store.length + 1}`, status: 'planned', created_at: '2026-10-02T06:00:00.000Z', updated_at: '2026-10-02T06:00:00.000Z', ...(request.postDataJSON() as Row) }
      store.push(row)
      await route.fulfill({ status: 201, contentType: wantsObject ? 'application/vnd.pgrst.object+json' : 'application/json', body: JSON.stringify(wantsObject ? row : [row]) })
    } else if (method === 'PATCH') {
      const row = store.find((item) => item.session_id === id)
      if (row) Object.assign(row, request.postDataJSON() as Row)
      await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify(row) })
    } else if (method === 'DELETE') {
      const index = store.findIndex((item) => item.session_id === id)
      if (index >= 0) store.splice(index, 1)
      await route.fulfill({ status: 204, body: '' })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
  })
}

async function seedPlanData(page: Page) {
  const exam = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10)
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ assessment_id: 'a1', user_id: userId, subject_id: 'business', course_id: businessCourseId, module_id: null, assessment_type: 'public_exam', title: 'Paper 1', assessment_date: exam, relative_importance: 'high', scope: {}, is_active: true }]) })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ user_id: userId, weekday_minutes: 60, weekend_minutes: 90, monday_minutes: 60, tuesday_minutes: 60, wednesday_minutes: 60, thursday_minutes: 60, friday_minutes: 60, saturday_minutes: 90, sunday_minutes: 90, timezone: 'Europe/London' }) })
  })
}

const todayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

test('Add to plan puts the REV suggestion on a day, says so in words, and REV moves on to something else', async ({ page }) => {
  const rows: Row[] = []
  await seedReturningStudent(page)
  await fakePlannedSessions(page, rows)
  await page.goto(appPath)

  const card = page.locator('.home-v2-hero')
  const before = await card.locator('.rev-suggestion-card__title').textContent()
  const add = card.getByRole('button', { name: /^Add to (today|tomorrow|[A-Z][a-z]+day)$/ })
  await expect(add).toBeVisible()
  await add.click()

  await expect(page.getByRole('status').filter({ hasText: /^Added .+ to (today|tomorrow|[A-Z][a-z]+day)\. You can move it on Plan\.$/ })).toBeVisible()
  expect(rows).toHaveLength(1)
  expect(rows[0]).toMatchObject({ added_by: 'rev', activity_type: 'practice', course_id: businessCourseId })
  await expect(card.locator('.rev-suggestion-card__title')).not.toHaveText(before ?? '')
})

test('Home shows no Add to button and no error when the sessions table is not available yet', async ({ page }) => {
  await seedReturningStudent(page)
  await fakePlannedSessions(page, null)
  await page.goto(appPath)

  const card = page.locator('.home-v2-hero')
  await expect(card).toBeVisible()
  await expect(card.getByRole('button', { name: /^Add to / })).toHaveCount(0)
  await expect(card.getByRole('button', { name: 'Suggest something else' })).toBeVisible()
  await expect(page.getByText(/learner_planned_sessions|does not exist/i)).toHaveCount(0)
})

test('Plan shows accepted sessions with REV pick, lets the student mark one done and remove it', async ({ page }) => {
  const rows: Row[] = [{
    session_id: 'p1', user_id: userId, planned_date: todayKey(), course_id: businessCourseId, topic_id: 'finance', activity_type: 'practice',
    minutes: 25, added_by: 'rev', recommendation_id: 'rec-1', status: 'planned', created_at: '2026-10-02T06:00:00.000Z', updated_at: '2026-10-02T06:00:00.000Z',
  }]
  await seedReturningStudent(page)
  await seedPlanData(page)
  await fakePlannedSessions(page, rows)
  await page.goto(`${appPath}#/plan`)

  const session = page.locator('.plan-session').first()
  await expect(session).toBeVisible()
  await expect(session.getByText('REV pick')).toBeVisible()
  await expect(session.getByText(/Practice · 25 mins/)).toBeVisible()

  await session.getByText('Options').click()
  await session.getByRole('button', { name: 'Mark done' }).click()
  await expect(page.getByText('Marked as done.')).toBeVisible()
  await expect(page.locator('.plan-session[data-status="done"]').getByText('Done', { exact: true })).toBeVisible()
  expect(rows[0].status).toBe('done')

  // The options menu stays open after "Mark done", so only open it if it is closed.
  const remove = page.locator('.plan-session').first().getByRole('button', { name: 'Remove' })
  if (!(await remove.isVisible())) await page.locator('.plan-session').first().getByText('Options').click()
  await remove.click()
  await expect(page.getByText('Removed from your plan.')).toBeVisible()
  await expect(page.locator('.plan-session')).toHaveCount(0)
  expect(rows).toHaveLength(0)
})

test('Plan works as before when the sessions table is not available yet', async ({ page }) => {
  await seedReturningStudent(page)
  await seedPlanData(page)
  await fakePlannedSessions(page, null)
  await page.goto(`${appPath}#/plan`)

  await expect(page.getByRole('heading', { name: 'Plan', exact: true }).first()).toBeVisible()
  await expect(page.locator('.plan-week-day').first()).toBeVisible()
  await expect(page.locator('.plan-session')).toHaveCount(0)
  await expect(page.getByText(/learner_planned_sessions|does not exist/i)).toHaveCount(0)
})

test('Plan and Home with accepted sessions meet the automated WCAG A/AA baseline, including the open menu and a done session', async ({ page }) => {
  const base = { user_id: userId, course_id: businessCourseId, activity_type: 'practice', minutes: 25, added_by: 'rev', recommendation_id: 'rec', created_at: '2026-10-02T06:00:00.000Z', updated_at: '2026-10-02T06:00:00.000Z' }
  const rows: Row[] = [
    { ...base, session_id: 'p1', planned_date: todayKey(), topic_id: 'finance', status: 'planned' },
    { ...base, session_id: 'p2', planned_date: todayKey(), topic_id: 'marketing', status: 'done', added_by: 'student' },
  ]
  await seedReturningStudent(page)
  await seedPlanData(page)
  await fakePlannedSessions(page, rows)

  await page.goto(`${appPath}#/plan`)
  await expect(page.locator('.plan-session')).toHaveCount(2)
  await page.locator('.plan-session').first().getByText('Options').click()
  await page.locator('.plan-session').first().getByRole('button', { name: 'Move it' }).click()
  const plan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(plan.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([])

  await page.goto(appPath)
  await expect(page.getByRole('button', { name: /^Add to / })).toBeVisible()
  const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(home.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([])
})
