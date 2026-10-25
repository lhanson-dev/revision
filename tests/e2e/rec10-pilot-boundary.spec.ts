import { expect, test, type Page } from '@playwright/test'
import { examPrepPath, seedExamPrepStudent } from './exam-prep-seed'

test.skip(process.env.REVISION_PILOT_GATE_CHECK !== '1', 'Production-mode recovery must require no feature claims')

const isDraftRequest = (url: string) => url.includes('/rest/v1/learner_exam_attempts')
async function launchTimed(page: Page) {
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
  await page.locator('.exam-mock').first().getByRole('button', { name: 'Start timed' }).click()
  await expect(page.locator('.exam-session-page')).toBeVisible()
}

test('ordinary signed-in learner without REC-10 metadata uses durable timed recovery', async ({ page }) => {
  await seedExamPrepStudent(page)
  const read = page.waitForRequest(req => isDraftRequest(req.url()) && req.method() === 'GET')
  await page.goto(examPrepPath)
  await read
  const create = page.waitForRequest(req => isDraftRequest(req.url()) && req.method() === 'POST')
  await launchTimed(page)
  await create
  await expect(page.getByText('Checking your saved exam')).toHaveCount(0)
})

test('self-edited pilot metadata changes no exam feature permission', async ({ page }) => {
  await seedExamPrepStudent(page)
  await page.addInitScript(() => {
    const key = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
    const raw = localStorage.getItem(key)
    if (raw) {
      const session = JSON.parse(raw) as { user: { app_metadata: Record<string, unknown> } }
      session.user.app_metadata.revision_rec10_pilot = false
      localStorage.setItem(key, JSON.stringify(session))
    }
  })
  const read = page.waitForRequest(req => isDraftRequest(req.url()) && req.method() === 'GET')
  await page.goto(examPrepPath)
  await read
  const create = page.waitForRequest(req => isDraftRequest(req.url()) && req.method() === 'POST')
  await launchTimed(page)
  await create
})
