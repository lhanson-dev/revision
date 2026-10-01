import { createHash } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000149'
const asCourseId = 'aqa:aqa-as:7131'
type Theme = 'light' | 'dark'
type VisualState = 'home' | 'plan' | 'courses' | 'learn' | 'practice' | 'exam-prep' | 'timed-exam' | 'admin'
type ApprovedDigest = string | readonly string[]

type VisualCase = { project: 'phone' | 'tablet' | 'desktop'; state: VisualState; theme: Theme }

const cases: ReadonlyArray<VisualCase> = [
  { project: 'phone', state: 'home', theme: 'light' },
  { project: 'phone', state: 'home', theme: 'dark' },
  { project: 'desktop', state: 'home', theme: 'light' },
  { project: 'desktop', state: 'home', theme: 'dark' },
  { project: 'desktop', state: 'plan', theme: 'light' },
  { project: 'desktop', state: 'plan', theme: 'dark' },
  { project: 'tablet', state: 'courses', theme: 'light' },
  { project: 'tablet', state: 'courses', theme: 'dark' },
  { project: 'desktop', state: 'learn', theme: 'light' },
  { project: 'desktop', state: 'learn', theme: 'dark' },
  { project: 'phone', state: 'practice', theme: 'light' },
  { project: 'phone', state: 'practice', theme: 'dark' },
  { project: 'tablet', state: 'exam-prep', theme: 'light' },
  { project: 'tablet', state: 'exam-prep', theme: 'dark' },
  { project: 'tablet', state: 'timed-exam', theme: 'light' },
  { project: 'tablet', state: 'timed-exam', theme: 'dark' },
  { project: 'desktop', state: 'admin', theme: 'light' },
  { project: 'desktop', state: 'admin', theme: 'dark' },
]

/**
 * Founder-directed Returning Student Home fidelity baselines. The desktop
 * captures remain unchanged; the phone captures were manually re-inspected on
 * 26 September 2026 after the shared learner-canvas correction and approved
 * because only the intentional canvas geometry changed. All four were re-pinned
 * on 30 September 2026 for the approved learner quick fixes: the "Hey {name}"
 * greeting and the plain-language first recommendation reason. Re-pinned again on
 * 30 September 2026 for the Founder-supplied v2 Home design (design_handoff_revision_v2,
 * screen 01), taken from the CI run on PR 459.
 */
const approvedHomeScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'phone:light': '6605a76cc3d4fb1c3af7f1159d9266d245ca6f4b7d1bb9fb5fdce0d354f7fecb',
  'phone:dark': '4405a687ccd7d69846aba1611bab972544455663f08db31cef0bddf0332ef758',
  'desktop:light': '91860eff9077b7f7281c83b6c1082d8de1ff05183b50de8cbe0dfe232a4afd8e',
  'desktop:dark': 'c1bb04c8a2a1d8ce448d353fddb2c711f0c3c5f9927296346eedb69247d365be',
}

/**
 * Reading-first Learn baselines captured from exact-head browser assurance.
 * The captures were re-inspected on 29 September 2026 after the approved 48px
 * learner-control refinement. Desktop light has two explicitly reviewed digests
 * because Chromium produced two visually equivalent rasterisations across the
 * initial run and retry; no unreviewed digest is accepted.
 * Both desktop pairs were re-pinned on 30 September 2026 with Founder approval
 * for the shared course header (breadcrumb, subject tile, underline tabs; the
 * old eyebrow and intro sentence are gone). The Learn page itself is unchanged.
 * Desktop dark has two digests because the run and its retry rasterised the page
 * differently; both come from the reviewed CI run.
 */
const approvedLearnScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:light': '2bd68bde10ae1aab59e44d9c085eeeee5751c32f9cd9c8ba379b520c3c2816ac',
  'desktop:dark': '52bfcaf7ff257614c1923a0506e6ad9747bbd043233ecc6e4204adf69f864468',
}

/**
 * Learner surfaces whose geometry changes are pinned to manually inspected CI
 * captures. These baselines were re-inspected on 29 September 2026 after the
 * approved 48px learner-button and touch-target refinement. The Plan dark pair
 * represents two visually equivalent Chromium rasterisations from the run and
 * retry; accepting only those reviewed digests preserves fail-closed assurance.
 * Timed exam now uses the same exact-digest contract because its shared learner
 * actions intentionally inherit the new button geometry. Admin remains on its
 * existing snapshot baseline because its compact operational controls are not
 * part of the learner-size change. Courses and Practice were re-pinned on
 * 30 September 2026 for the approved learner quick fixes: the Courses heading,
 * card layout and separated remove action, and the plain-language
 * recommendation reason shown in Practice. Phone Practice and tablet Exam Prep
 * were re-pinned again on 30 September 2026 with Founder approval ("yes, re-pin
 * the baselines") for the redesign PR 2 shared course header, and for Practice
 * the new single-task layout. Phone Practice light has two digests because the
 * run and its retry rasterised the page differently.
 */
const approvedCanvasScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:plan:light': 'bcb18ea96eba3442103fe1e8fb6772758f8b831a05d39fa942b5cfe6f5f1fbb9',
  'desktop:plan:dark': 'a1c563320b0ed1b7182ef1b9c30bd6044dfd1a59afb7333c03a9d3f3e377159c',
  'tablet:courses:light': 'b22530777afd479dc8dd7203b3a4ef2a650ca1f61165ac8417b8943c93125c05',
  'tablet:courses:dark': '4d9a5c76bd8a3634b57c9de381c07522d992e05b4958cebc89ab5faae6e21190',
  'phone:practice:light': '11578378079b5f22fd429cda1d55fbac82d437794df1bd80d45ee7f9bdcfa339',
  'phone:practice:dark': 'a2a0344cc13db06139c35a9bdd8c9f1c9d7bc5cbd8c62de51208d5e21970f564',
  'tablet:exam-prep:light': '9fe857393dc5a7f0dec3fd0ed202801d52e216f7df6d4630741b414e3cddb687',
  'tablet:exam-prep:dark': '46b9ebf430f0ffcd596323a4841455304b5f0dd3a49d0b5bec8b081056365027',
  'tablet:timed-exam:light': '6121d7ca86804199e07e847984bb03d02d43617198b5531e7d17b8da8ab6c25e',
  'tablet:timed-exam:dark': '848c385e7e0aa086f9f34d3c2f8a7bf60a3f7b262e6d3864a80b5ad0f604c6fd',
}

async function seedSession(page: Page, theme: Theme, isAdmin: boolean) {
  await page.clock.setFixedTime(new Date('2026-08-23T12:00:00.000Z'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(({ key, id, selectedTheme }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem('revision:theme', selectedTheme)
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
        email: 'visual-regression@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId, selectedTheme: theme })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'visual-regression@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      }),
    })
  })
  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: asCourseId, created_at: '2026-08-23T12:00:00.000Z' }]) })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
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
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: isAdmin }) })
  })

  if (isAdmin) {
    await page.route('**/functions/v1/admin-operations', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type', 'access-control-allow-methods': 'POST, OPTIONS' }, body: 'ok' })
        return
      }
      await route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify({
          generatedAt: '2026-08-23T12:00:00.000Z',
          users: { totalLearners: 12, adminAccounts: 1, testAccounts: 1, newLearners7d: 4, newLearners30d: 9, activeLearners1d: 3, activeLearners7d: 8, activeLearners30d: 10, signups14d: [{ date: '2026-08-23', count: 1 }] },
          activity: { events7d: 64, events30d: 181, flashcards30d: 90, quickChecks30d: 55, examQuestions30d: 30, examAttempts30d: 6, modulesWithEvidence30d: 2, topicsWithEvidence30d: 17, latestEventAt: '2026-08-23T11:50:00.000Z', daily14d: [{ date: '2026-08-23', count: 30 }], modules30d: [{ moduleId: 'business-aqa-as-paper-2', count: 110 }] },
          content: { jobsKnown: true, jobsTotal: 1, jobsInProgress: 0, blockedJobs: 0, readyForFounderAction: 0, jobs: [], visibilityMessage: null },
          health: { overall: 'Healthy', checks: [{ id: 'authentication', label: 'Authentication', status: 'Healthy', detail: 'Authenticated admin access verified.' }, { id: 'database', label: 'Database', status: 'Healthy', detail: 'Metrics query succeeded.' }, { id: 'learner-app', label: 'Learner app', status: 'Healthy', detail: 'The canonical production /app/ route is reachable.' }, { id: 'deployment', label: 'Deployment', status: 'Healthy', detail: 'Latest main deployment and production smoke passed.' }, { id: 'path-to-live', label: 'Path to live', status: 'Healthy', detail: 'Current path-to-live evidence is green.' }, { id: 'content-factory', label: 'Content Factory', status: 'Healthy', detail: 'Content operations are available.' }], needsAttention: [], unknownCount: 0 },
        }),
      })
    })
  }
}

async function openState(page: Page, state: VisualState) {
  const course = encodeURIComponent(asCourseId)
  const paths: Record<Exclude<VisualState, 'timed-exam'>, string> = {
    home: appPath,
    plan: `${appPath}#/plan`,
    courses: `${appPath}#/courses`,
    learn: `${appPath}#/courses/${course}/learn`,
    practice: `${appPath}#/courses/${course}/practice`,
    'exam-prep': `${appPath}#/courses/${course}/exam-prep`,
    admin: `${appPath}#/admin`,
  }

  await page.goto(state === 'timed-exam' ? `${appPath}#/courses/${course}/exam-prep` : paths[state])
  await expect(page.locator('.planner-runtime')).toBeVisible()
  await expect(page.locator('.loading-shell')).toHaveCount(0)

  if (state === 'learn') await expect(page.locator('article.learn-reading-page')).toBeVisible()
  if (state === 'practice') await expect(page.locator('.focused-practice')).toBeVisible()
  if (state === 'exam-prep' || state === 'timed-exam') await expect(page.locator('.focused-exam-prep')).toBeVisible()
  if (state === 'admin') await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()

  if (state === 'timed-exam') {
    const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' }).first()
    await paper.locator('summary').click()
    await paper.getByRole('button', { name: 'Start timed exam' }).first().click()
    await expect(page.locator('.exam-session-page')).toBeVisible()
  }

  await page.evaluate(async () => {
    await document.fonts.ready
    window.scrollTo(0, 0)
  })
}

for (const visualCase of cases) {
  test(`${visualCase.project} ${visualCase.state} ${visualCase.theme} visual contract`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== visualCase.project, `Captured only in the ${visualCase.project} canonical viewport.`)
    await seedSession(page, visualCase.theme, visualCase.state === 'admin')
    await openState(page, visualCase.state)

    const canvasKey = `${visualCase.project}:${visualCase.state}:${visualCase.theme}`
    const approvedCanvasDigest = approvedCanvasScreenshotDigests[canvasKey]
    if (visualCase.state === 'home' || visualCase.state === 'learn' || approvedCanvasDigest) {
      const screenshot = await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        fullPage: false,
      })
      await testInfo.attach(`${visualCase.state}-${visualCase.theme}-${visualCase.project}.png`, { body: screenshot, contentType: 'image/png' })
      const digest = createHash('sha256').update(screenshot).digest('hex')
      const approved = visualCase.state === 'home'
        ? approvedHomeScreenshotDigests[`${visualCase.project}:${visualCase.theme}`]
        : visualCase.state === 'learn'
          ? approvedLearnScreenshotDigests[`${visualCase.project}:${visualCase.theme}`]
          : approvedCanvasDigest
      const approvedDigests = typeof approved === 'string' ? [approved] : approved
      expect(approvedDigests).toContain(digest)
      return
    }

    await expect(page).toHaveScreenshot(`${visualCase.state}-${visualCase.theme}.png`, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    })
  })
}
