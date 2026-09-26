import { createHash } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000149'
const asCourseId = 'aqa:aqa-as:7131'
type Theme = 'light' | 'dark'
type VisualState = 'home' | 'plan' | 'courses' | 'learn' | 'practice' | 'exam-prep' | 'timed-exam' | 'admin'

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
 * because only the intentional canvas geometry changed.
 */
const approvedHomeScreenshotDigests: Readonly<Record<string, string>> = {
  'phone:light': 'c47ddbd3d9e97b349e4da7f706854a723d3067c33accd3e478dc9c6f7eb9955d',
  'phone:dark': 'c81b3b3505b468b80e1ac2a26ff90d4977cfa34631cd62a460cd81b15fad6de2',
  'desktop:light': '02fec44dfee9baefc5264b340f0d136a0c5e060ad2f90989693dc743fe6d78d9',
  'desktop:dark': 'cd7ec87330c04abf603ef05c6855dd481056bcb8010510d28b0f4f5a90844831',
}

/**
 * Reading-first Learn baselines captured from exact-head browser assurance.
 * The desktop light and dark captures were manually re-inspected on
 * 26 September 2026 after Learn was aligned to the shared learner canvas while
 * retaining readable prose measure inside that canvas.
 */
const approvedLearnScreenshotDigests: Readonly<Record<string, string>> = {
  'desktop:light': '6da02c6f2196821db3ecd394c0a301ab8392f950269138e167500fb891db9f72',
  'desktop:dark': '65268c6b02d9cd7bc8036b4e08b9385aad3765150ce702ba66f17d7816056270',
}

/**
 * The learner surfaces whose outer geometry intentionally changes in this PR
 * are pinned to the exact manually inspected CI captures. This is stricter than
 * the normal 1% snapshot tolerance and prevents the baseline update from
 * masking any additional pixel drift. Timed exam and Admin retain their
 * existing snapshot baselines because their geometry is deliberately excluded.
 */
const approvedCanvasScreenshotDigests: Readonly<Record<string, string>> = {
  'desktop:plan:light': 'db0d4795dc0081866013c4e3829d16d1d79bab6bafb7d2e9b918840a7927aa82',
  'desktop:plan:dark': '209bab11fde1eef5e740eb47cc8aa99fb062c6d6742e8e2656e6f35aa284d54a',
  'tablet:courses:light': '7f90c35f0fce95e9023ce43cba217aa5a91583a0247fe6f72fd6dd5181990146',
  'tablet:courses:dark': '1a89d60f669cfb01806b6de1f2b0ddaaee74a5c307a604a29f3ace0b34b0114c',
  'phone:practice:light': 'ab694df6d5432dcf3484f0982ffcfdad3560a2e7a94054e000b731cf9f07eb7a',
  'phone:practice:dark': 'f71b477a920246db454a791d66e3cb0eff26fc0f1b1da4f2fbdd067ef3732154',
  'tablet:exam-prep:light': '64811d0529ea9046dc3c7ff58d42c09cda83fe4163951d616c375e787012c464',
  'tablet:exam-prep:dark': 'c173b970f55dcd07ead514c6048f721d5fb770f46d765cb3525df9995c5e1791',
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
      expect(digest).toBe(approved)
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
