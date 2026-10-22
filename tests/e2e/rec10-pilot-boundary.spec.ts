import { expect, test, type Page } from '@playwright/test'
import { examPrepPath, seedExamPrepStudent, userId } from './exam-prep-seed'

test.skip(process.env.REVISION_PILOT_GATE_CHECK !== '1',
  'REC-10 pilot gate requires the production-equivalent Vite build with assurance bypass disabled.')

const isDraftRequest = (url: string) => url.includes('/rest/v1/learner_exam_attempts')
async function launchTimed(page: Page) {
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
  await page.locator('.exam-mock').first().getByRole('button', { name: 'Start timed' }).click()
  await expect(page.locator('.exam-session-page')).toBeVisible()
}

test('an ordinary authenticated learner may use transient mocks but cannot start a durable draft', async ({ page }) => {
  await seedExamPrepStudent(page)
  const draftCalls: string[] = []
  page.on('request', (req) => { if (isDraftRequest(req.url())) draftCalls.push(req.method()) })
  await page.goto(examPrepPath)
  await launchTimed(page)
  await expect(page.getByRole('button', { name: /Save and return to Exam Prep/ })).toHaveCount(0)
  expect(draftCalls).toEqual([])
})

test('a server-confirmed REC-10 pilot learner receives a durable checkpoint', async ({ page }) => {
  await seedExamPrepStudent(page)
  await page.route('**/auth/v1/user**', async route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      id: userId, aud: 'authenticated', role: 'authenticated',
      email: 'returning-home-test@revision.invalid',
      app_metadata: { provider: 'email', providers: ['email'], revision_rec10_pilot: true },
      user_metadata: { first_name: 'Synthetic' }, identities: [],
      created_at: '2026-08-17T12:00:00.000Z',
      updated_at: '2026-08-17T12:00:00.000Z',
    }),
  }))
  const attemptRead = page.waitForRequest(req => isDraftRequest(req.url()) && req.method() === 'GET')
  await page.goto(examPrepPath)
  await attemptRead
  const attemptCreate = page.waitForRequest(req => isDraftRequest(req.url()) && req.method() === 'POST')
  await launchTimed(page)
  await attemptCreate
  await expect(page.getByText('Checking your saved exam')).toHaveCount(0)
})

test('forged local REC-10 metadata cannot bypass Auth verification', async ({ page }) => {
  await seedExamPrepStudent(page)
  await page.addInitScript(() => {
    const key = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
    const raw = localStorage.getItem(key)
    if (raw) {
      const session = JSON.parse(raw) as { user: { app_metadata: Record<string, unknown> } }
      session.user.app_metadata.revision_rec10_pilot = true
      localStorage.setItem(key, JSON.stringify(session))
    }
  })
  const calls: string[] = []
  page.on('request', req => { if (isDraftRequest(req.url())) calls.push(req.method()) })
  await page.goto(examPrepPath)
  await launchTimed(page)
  expect(calls).toEqual([])
})

test('a delayed cohort verification cannot silently convert a running transient exam', async ({ page }) => {
  await seedExamPrepStudent(page)
  let releaseAuth: () => void = () => { throw new Error('Auth response gate not ready.') }
  const gate = new Promise<void>((resolve) => { releaseAuth = resolve })
  await page.route('**/auth/v1/user**', async route => {
    await gate
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: userId, aud: 'authenticated', role: 'authenticated',
        email: 'returning-home-test@revision.invalid',
        app_metadata: { provider: 'email', revision_rec10_pilot: true },
        user_metadata: { first_name: 'Synthetic' },
      }),
    })
  })
  const draftCalls: string[] = []
  page.on('request', req => { if (isDraftRequest(req.url())) draftCalls.push(req.method()) })
  await page.goto(examPrepPath)
  await launchTimed(page)
  const authResponse = page.waitForResponse(res => res.url().includes('/auth/v1/user'))
  releaseAuth()
  await authResponse
  await expect(page.locator('.exam-session-page')).toBeVisible()
  // The current exam started without a durable context. Verification only
  // applies when a new exam session is launched after the trusted response.
  expect(draftCalls.filter((method) => method !== 'GET')).toEqual([])
  await expect(page.getByRole('button', { name: /Save and return to Exam Prep/ })).toHaveCount(0)
})
