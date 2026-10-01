import { expect, test, type Page } from '@playwright/test'

/**
 * Guardrail: no learner page scrolls sideways.
 *
 * The rule (docs/design/learner-redesign-v2/guidelines/RESPONSIVE.md): the page scrolls down, never
 * sideways, at any width from 320px up. This visits every learner route at every layout width and
 * fails if the page is wider than the window.
 *
 * Add new learner routes to `learnerRoutes` when they are built.
 */

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000001'
const aLevelCourseId = 'aqa:aqa-a-level:7132'
const asCourseId = 'aqa:aqa-as:7131'
const course = encodeURIComponent(aLevelCourseId)

const widths = [1440, 1160, 960, 768, 620, 390, 320] as const

const learnerRoutes: ReadonlyArray<{ name: string; hash: string }> = [
  { name: 'Home', hash: '#/home' },
  { name: 'Plan', hash: '#/plan' },
  { name: 'Courses', hash: '#/courses' },
  { name: 'Progress', hash: '#/progress' },
  { name: 'Ask REV', hash: '#/rev' },
  { name: 'Course overview', hash: `#/courses/${course}/overview` },
  { name: 'Learn', hash: `#/courses/${course}/learn` },
  { name: 'Practice', hash: `#/courses/${course}/practice` },
  { name: 'Exam Prep', hash: `#/courses/${course}/exam-prep` },
  { name: 'Course progress', hash: `#/courses/${course}/progress` },
]

/**
 * Overflow that already existed when this check was added (1 Oct 2026). Each entry is a route and
 * width that is allowed to overflow until the screen PR that redesigns it. The entry must be removed
 * in that PR. Do not add entries to get a build passing: fix the layout.
 */
const knownOverflow: Readonly<Record<string, readonly number[]>> = {
  'Course overview': [320], // 336px wide in a 320px window. Fixed by the Courses overview PR (PR 7).
}

async function seedSyntheticSession(page: Page) {
  await page.addInitScript(({ key, id }) => {
    const b64 = (value: unknown) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const accessToken = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: id, aud: 'authenticated', exp: 4102444800 })}.synthetic`
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
        email: 'synthetic-layout-test@revision.invalid',
        email_confirmed_at: '2026-08-19T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-19T12:00:00.000Z',
        updated_at: '2026-08-19T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { user_id: userId, course_id: aLevelCourseId, created_at: '2026-08-22T18:00:00.000Z' },
        { user_id: userId, course_id: asCourseId, created_at: '2026-08-22T18:00:01.000Z' },
      ]),
    })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  for (const table of ['learning_evidence', 'revision_assessments', 'revision_availability_exceptions', 'revision_planning_preferences', 'revision_activity_events']) {
    await page.route(`**/rest/v1/${table}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}

async function pageOverflow(page: Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
}

// The widths are set explicitly, so one browser project is enough.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the test; the desktop project covers them all.')
})

test('the sign-in page never scrolls sideways', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(appPath)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    const { scrollWidth, clientWidth } = await pageOverflow(page)
    expect(scrollWidth, `Sign in at ${width}px is ${scrollWidth}px wide in a ${clientWidth}px window`).toBeLessThanOrEqual(clientWidth)
  }
})

for (const route of learnerRoutes) {
  test(`${route.name} never scrolls sideways`, async ({ page }) => {
    await seedSyntheticSession(page)
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${appPath}${route.hash}`)
      await page.reload()
      await expect(page.locator('main h1, main h2').first()).toBeVisible()
      const { scrollWidth, clientWidth } = await pageOverflow(page)
      if (knownOverflow[route.name]?.includes(width)) continue
      expect(scrollWidth, `${route.name} at ${width}px is ${scrollWidth}px wide in a ${clientWidth}px window`).toBeLessThanOrEqual(clientWidth)
    }
  })
}
