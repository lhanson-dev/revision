import { createHash } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000149'
const asCourseId = 'aqa:aqa-as:7131'
type Theme = 'light' | 'dark'
type VisualState = 'home' | 'plan' | 'courses' | 'course-overview' | 'learn' | 'practice' | 'exam-prep' | 'timed-exam' | 'admin'
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
 * Re-pinned on 1 October 2026 with Founder approval ("approve the screenshots, update the baselines")
 * for learner shell v2.1 (PR 4): 248px sidebar, tablet icon rail, phone tab bar with REV raised in
 * the centre, no floating Ask REV button. Digests taken from the PR 4 CI run, after the Founder
 * reviewed the before/after screenshots in docs/design/learner-redesign-v2/screenshots/pr-04/.
 * Re-pinned on 1 October 2026 with Founder approval (Lee: "ok" to the PR 5 before/after screenshots,
 * then "allow it" and "option 1" to this re-pin) for Home v2 (PR 5): rules-chosen REV card with Not now,
 * subject-colour course cards with Topics covered and Understanding, neutral next-exam panel. Digests
 * taken from the PR 5 CI run 36905643720 (the "Expected value" lines), not from a local browser.
 * Desktop Home re-pinned on 2 October 2026 with Founder approval (Lee: "OK baselines", PR 14) for the Empty states
 * sweep: the "Your plan" card names what is missing ("Add your exam dates and I'll start building your plan.", with a
 * 48px button) instead of "A useful next step will appear here". Digests taken from the PR 14 CI runs 36989259361 and
 * 36990097836 (the "Expected value" lines; the two runs agree), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/pr-14/baselines/.
 * Desktop Plan re-pinned on 5 October 2026 for the Plan redesign v2.2 (PR 533). Lee replied "approved" to the PR 533
 * approval request, which listed these two baselines and linked the before/after pictures. Digests taken from the PR 533
 * CI run 37330788981 (the "Expected value" lines), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/plan-v2.2/.
 * Phone Practice (light and dark) re-pinned on 6 October 2026 for Practice v2.2 PR 1 (PR 545: start screen and pop-up shell).
 * Lee said "OK baselines, update them" after the before/after screenshots in
 * docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/. Digests taken from the PR 545 CI run 37455570414
 * (the "Expected value" lines; the run and its retry agree), not from a local browser.
 * Phone Home re-pinned on 7 October 2026 after Founder review of the C2 CI capture sheet and explicit
 * approval ("Approve C2 visual baselines"). The only intended changes are the reconciled shell REV treatment
 * and shell ownership. Digests come from CI #2832 reviewed captures.
 * Desktop Home was re-pinned again on 7 October 2026 after the remaining desktop CTA override was
 * corrected at its canonical owner so genuine REV presence also uses Deep Teal on desktop. The Founder
 * reviewed the CI #2837 desktop capture sheet and explicitly approved it
 * ("Approve C2 desktop Deep Teal baselines").
 * Home (phone + desktop, light + dark) re-pinned on 8 October 2026 after Founder review
 * of the C3 CI #2882 exact captures and explicit approval ("approved") to the requested
 * "Approve C3 Home visual baselines" gate. These captures reflect only the canonical
 * Home token/palette/radius migration in PR #575; Home recommendation behaviour is unchanged.
 */
const approvedHomeScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'phone:light': '290afc86d233e000eca51acbd07f6d579e4d015fddbc6cd2d0ae836d06efa2c3',
  'phone:dark': '7c91ca0d2c4519bb21f74fc4adf9ea65be19fb53861edf8b3cf09a0231e77ebf',
  'desktop:light': '94f82ced34e14dc0a8949982bab9a870fd5a499eaaa9bac2a8c5237e554b7580',
  'desktop:dark': 'd91b1fad53a28d32cfbb3605d1a43e58f6ea8763cd4350bc3c6869d46ec7f4bd',
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
 * Re-pinned on 1 October 2026 with Founder approval ("approve the screenshots, update the baselines")
 * for learner shell v2.1 (PR 4): 248px sidebar, tablet icon rail, phone tab bar with REV raised in
 * the centre, no floating Ask REV button. Digests taken from the PR 4 CI run, after the Founder
 * reviewed the before/after screenshots in docs/design/learner-redesign-v2/screenshots/pr-04/.
 * Re-pinned on 6 October 2026 for Learn content styles v2.2 (PR 536): the Founder was shown the
 * before/after screenshots in docs/design/learner-redesign-v2/screenshots/learn-v2.2/ and replied
 * "approved 536". Digests from CI run 37379430851 (run and retry agree).
 * Re-pinned on 7 October 2026 after Founder review of the C2 CI capture sheet and explicit approval
 * ("Approve C2 visual baselines") for the canonical subject mark/name/hue course identity and reconciled shell.
 * Digests come from CI #2832 reviewed captures.
 * Desktop Learn was re-pinned again on 7 October 2026 after the canonical desktop Ask REV CTA moved to
 * Deep Teal. The Founder reviewed the CI #2837 desktop capture sheet and explicitly approved it
 * ("Approve C2 desktop Deep Teal baselines").
 * Re-pinned on 9 October 2026 for the C3 Learn canonical-token migration after the Founder explicitly
 * approved the reviewed light/dark captures ("Approve C3 Learn visual baselines"). Exact-head CI #2917
 * on 862e0940f9bda8fa7e3a426dff86fb7c7af01b83 reproduced identical run/retry digests:
 * light d23f3be12cec9c1459bf98d8bc051a5b9d623fd89bafe5a0291cba96895b6e1e;
 * dark f860f2a930f5c182076b26f60fe8de2914cda55cec39a64042de5a73cfc92e47.
 */
const approvedLearnScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:light': 'd23f3be12cec9c1459bf98d8bc051a5b9d623fd89bafe5a0291cba96895b6e1e',
  'desktop:dark': 'f860f2a930f5c182076b26f60fe8de2914cda55cec39a64042de5a73cfc92e47',
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
 * Re-pinned on 1 October 2026 with Founder approval ("approve the screenshots, update the baselines")
 * for learner shell v2.1 (PR 4): 248px sidebar, tablet icon rail, phone tab bar with REV raised in
 * the centre, no floating Ask REV button. Digests taken from the PR 4 CI run, after the Founder
 * reviewed the before/after screenshots in docs/design/learner-redesign-v2/screenshots/pr-04/.
 * Tablet Courses re-pinned on 1 October 2026 with Founder approval (Lee: "OK, update them" to the PR 7
 * before/after screenshots) for Courses v2 (PR 7): course cards in the subject's solid colour with its
 * letter mark. Digests taken from the PR 7 CI run 36931767297 (the "Expected value" lines), not from
 * a local browser. Screenshots reviewed: docs/design/learner-redesign-v2/screenshots/pr-07/.
 * Tablet timed-exam re-pinned on 2 October 2026 with Founder approval (Lee: "pictures OK, update the PR 10
 * baselines") for Exam Prep v2 (PR 10): question grid with a key, Flag for review, pre-finish note. Digests
 * taken from the PR 10 CI run 36976555836 (the "Expected value" lines). Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/pr-11/pr-10-tablet-*.png.
 * Desktop Plan re-pinned on 2 October 2026 with Founder approval (Lee: "OK baselines", PR 14) for the Empty states
 * sweep: during set-up the long "Your plan adapts as you go" paragraph sits behind "How does this work?" so the two
 * set-up steps come first. Digests taken from the PR 14 CI runs 36989259361 and 36990097836 (the "Expected value"
 * lines; the two runs agree), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/pr-14/baselines/.
 * Desktop Plan re-pinned on 5 October 2026 for the Plan redesign v2.2 (PR 533). Lee replied "approved" to the PR 533
 * approval request, which listed these two baselines and linked the before/after pictures. Digests taken from the PR 533
 * CI run 37330788981 (the "Expected value" lines), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/plan-v2.2/.
 * Phone Practice (light and dark) re-pinned on 6 October 2026 for Practice v2.2 PR 1 (PR 545: start screen and pop-up shell).
 * Lee said "OK baselines, update them" after the before/after screenshots in
 * docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/. Digests taken from the PR 545 CI run 37455570414
 * (the "Expected value" lines; the run and its retry agree), not from a local browser.
 * Tablet Exam Prep and timed-exam (light and dark) re-pinned on 6 October 2026 for Exam Prep v2.2 PR 1 (PR 559: Exam Prep opens in
 * the normal shell as a page of papers, examiner guide and mock exams). Lee replied "approved 559" after the before/after
 * pictures in docs/design/learner-redesign-v2/screenshots/exam-prep-v2.2-pr1/, and the approval request said these baselines would
 * be re-pinned from CI. Digests taken from the PR 559 CI run 37531070439 (the "Received" lines; the run and its retry agree), not
 * from a local browser. The timed-exam picture is still the existing simulator and will be re-pinned again in PR 2.
 * Phone Practice, Tablet Courses and Tablet Exam Prep were re-pinned on 7 October 2026 after Founder review
 * of the C2 CI capture sheet and explicit approval ("Approve C2 visual baselines"). These captures reflect the
 * reconciled shell REV treatment and canonical course identity. Timed-exam and Admin baselines were not changed.
 * Digests come from CI #2832 reviewed captures.
 * Desktop Plan was re-pinned again on 7 October 2026 after the canonical desktop Ask REV CTA moved to
 * Deep Teal. The Founder reviewed the CI #2837 desktop capture sheet and explicitly approved it
 * ("Approve C2 desktop Deep Teal baselines"). Timed-exam and Admin baselines remain unchanged.
 * Desktop Plan (light and dark) was re-pinned on 8 October 2026 after Founder review of the C3
 * canonical-token migration captures and explicit approval ("Approved" to the requested C3 Plan
 * visual-baseline gate). Exact-head CI #2899 reproduced the reviewed captures identically on run
 * and retry: light 59774a90e0507c436c0f3d6e71470db99c06a3149a6c33b021deb285baf3aa6a;
 * dark 96d8b30f8b1578646837daf095dfae0fff29f9bdb3ab69395005da88b7842577.
 * Tablet Courses (light and dark) was re-pinned on 9 October 2026 after Founder review of the C3
 * canonical-token migration captures and explicit approval ("Approved" to the requested C3 Courses
 * visual-baseline gate). CI #2909 produced identical captures on the initial run and retry:
 * light a83933d230268106d7a94770cfa980d682cdbe278157d60e2ce6ff303645e82a;
 * dark 7409db404f76b82f42e366842f8942de4ebfda5921131659b48d8244c0566f92.
 */
/**
 * Phone Practice start screen (Light/Dark) baseline re-pinned 10 October 2026
 * with the Founder's explicit "approved" response to the six-image PR #589
 * visual review request. The exact captures were inspected from CI #2936,
 * artifact interface-visual-regression-38034719673 (ID 11663751219).
 * The other 16 B7 visual contracts are unchanged; merge is not approved here.
 */
/**
 * PR #591 Exam Prep / timed Exam Simulator (tablet Light/Dark) baselines
 * approved by the Founder on 10 October 2026 ("Approve PR #591"), in response
 * to the explicit "Approve PR #591 Exam visual baselines" review request.
 * Approved captures came from exact-head CI #2948 (run 38042624110,
 * commit 8b2cb15eb78c8d319ebd398cdb714f89aeda53c4), retained artifact
 * interface-visual-regression-38042624110 (ID 11666565708).
 * All 4 initial and retry screenshot SHA-256 digests match; 433 other
 * Playwright checks passed. The remaining 14 B7 visual contracts are intact.
 * This approves the four screenshot baselines only, NOT the PR merge.
 */
const approvedCanvasScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:plan:light': '59774a90e0507c436c0f3d6e71470db99c06a3149a6c33b021deb285baf3aa6a',
  'desktop:plan:dark': '96d8b30f8b1578646837daf095dfae0fff29f9bdb3ab69395005da88b7842577',
  'tablet:courses:light': 'a83933d230268106d7a94770cfa980d682cdbe278157d60e2ce6ff303645e82a',
  'tablet:courses:dark': '7409db404f76b82f42e366842f8942de4ebfda5921131659b48d8244c0566f92',
  'phone:practice:light': 'a71cd28ea165533d3d3c482bf215b6ea35fd591a257c52b1d0ce04cb92fc795c',
  'phone:practice:dark': '652352e87674ce37d0c001656926c8568a7d7168e69e5761ce0ec5b64ccc4e1a',
  'tablet:exam-prep:light': 'bff5bc1af00066e64ce5255c631528725599ae2c325e6a1ab32cb51c365ecee6',
  'tablet:exam-prep:dark': 'bb16589e3ebc911c7ae7a72d51afa9920390a57151e4a24c20b999161755f129',
  'tablet:timed-exam:light': '3a72b9e666f5d44aa2cec8941cd8ab28ceb55fc0dd39d32aa01b7808ae39d882',
  'tablet:timed-exam:dark': 'd1b7023b509c659ee8dc81090382debcfea478d2913261e5fc28077c9e331ec1',
}

/**
 * C4-specific visual acceptance (not part of the fixed 18-state B7 inventory).
 * Four separately approved Course Overview captures fail closed on future
 * visual drift. Keep the original 18 B7 matrix and digests unchanged.
 */
const courseOverviewVisualReview = [
  ['desktop', 'light'],
  ['desktop', 'dark'],
  ['phone', 'light'],
  ['phone', 'dark'],
] as const satisfies readonly (readonly ['desktop' | 'phone', Theme])[]

/**
 * C4 PR #592 Course Overview, desktop/phone Light/Dark visual baselines:
 * Founder explicitly replied "Approve PR #592" on 10 October 2026 to the
 * immediately preceding request "Approve PR #592 Course Overview visual
 * baselines" after seeing the four CI screenshot comparisons. Visual
 * approval only; NOT an instruction to merge PR #592.
 * Source: exact-head CI #2961, run 38057084252, approved head
 * 88ccc7aac1a68bb70304a7666044545d17c76b22.
 * Retained screenshot artifact: interface-visual-regression-38057084252,
 * ID 11671549345; each SHA-256 matches the browser log. 437 other browser
 * checks, all 1,307 unit tests, typecheck, lint, build, security and DB/RLS
 * passed. These four new C4 digests do not alter any of the 18 B7 baselines.
 * Final merge requires separate explicit Founder approval after green CI.
 */
const approvedCourseOverviewDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:light': '72a5d911af7b70dce1223e6fcd5e350ae7b832f2187f3568efb0118a363dbdd6',
  'desktop:dark': '4c2d41dce90d2cb86c52dbb255bda110b798ff80a121f14eaa766a9b6ac1b975',
  'phone:light': '7d183a2bba207e9e731b50434474d575f89fc8c3d8b90268263240e71a91b62d',
  'phone:dark': '7e9b568e351d40e92508f7ce7b859e37a0c869adf1a601763fd8316929c4653c',
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
    'course-overview': `${appPath}#/courses/${course}/overview`,
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
  if (state === 'course-overview') await expect(page.locator('.course-overview-decision')).toBeVisible()
  if (state === 'exam-prep' || state === 'timed-exam') await expect(page.locator('.exam-prep')).toBeVisible()
  if (state === 'admin') await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()

  if (state === 'timed-exam') {
    await page.locator('.exam-mock').filter({ hasText: /Paper 2 style/ }).first().getByRole('button', { name: 'Start timed' }).click()
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

/**
 * C4's additive visual checks are separate from the 18 B7 acceptance slots.
 * Screenshot mismatch is an intentional visual-approval hold, not permission
 * to silently pin a new rendering or expand B7's baseline matrix.
 */
for (const [project, theme] of courseOverviewVisualReview) {
  test(`${project} course overview ${theme} C4 visual review`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== project, `Captured only in the ${project} canonical viewport.`)
    await seedSession(page, theme, false)
    await openState(page, 'course-overview')
    const screenshot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
    })
    await testInfo.attach(`course-overview-${theme}-${project}.png`, { body: screenshot, contentType: 'image/png' })
    const digest = createHash('sha256').update(screenshot).digest('hex')
    const approved = approvedCourseOverviewDigests[`${project}:${theme}`]
    const approvedDigests = typeof approved === 'string' ? [approved] : approved
    expect(approvedDigests).toContain(digest)
  })
}
