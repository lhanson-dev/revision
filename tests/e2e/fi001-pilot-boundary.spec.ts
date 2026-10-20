import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, planUserId, seedPlanStudent } from './plan-seed'

test.skip(process.env.REVISION_PILOT_GATE_CHECK !== '1', 'Production-mode cohort gate has its own restrictive Vite build')

// These are synthetic network fixtures. Production deployment independently pins the
// assurance-bypass flag to zero; neither a local user claim nor a plan tier
// may unlock programme-first recommendations.
test('ordinary signed-in account keeps baseline planning without the pilot feature', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.goto(appPath + '#/plan')
  await expect(page.getByRole('heading', { name: /Your week/ })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toHaveCount(0)
  await expect(page.getByText('Planner pilot:', { exact: false })).toHaveCount(0)
})

test('server-confirmed pilot account sees the programme but cannot enter unreviewed Exam Prep', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  // Supabase Auth, not local storage or self-editable user_metadata, must
  // provide the matching privileged cohort flag after a network GET.
  await page.route('**/auth/v1/user**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      id: planUserId, aud: 'authenticated', role: 'authenticated',
      email: 'plan-test@revision.invalid',
      app_metadata: { provider: 'email', revision_fi001_pilot: true },
      user_metadata: { first_name: 'Synthetic' }, identities: [],
      created_at: '2026-08-17T12:00:00.000Z',
      updated_at: '2026-08-17T12:00:00.000Z',
    }),
  }))
  await page.goto(appPath + '#/plan')
  await expect(page.getByText('Planner pilot:', { exact: false })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Your full exam programme' }))
    .toContainText('Restricted pilot: original exam-style simulations')
  await page.goto(appPath + '#/courses/' + encodeURIComponent(businessCourseId) + '/exam-prep')
  await expect(page.getByRole('main', { name: 'Exam preparation pilot restriction' })).toBeVisible()
  await expect(page.getByText(/Original exam simulations and self-marked written assessments are excluded/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start timed exam' })).toHaveCount(0)
})

test('a purported pilot marker in the saved local user cannot bypass the server refusal', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  // The saved session's metadata is mutable browser state; the authenticated
  // Supabase user endpoint remains the only authority for the cohort.
  await page.addInitScript(({ key }) => {
    const raw = localStorage.getItem(key)
    if (raw) {
      const current = JSON.parse(raw) as { user: { app_metadata: Record<string, unknown> } }
      current.user.app_metadata.revision_fi001_pilot = true
      localStorage.setItem(key, JSON.stringify(current))
    }
  }, { key: 'sb-xwwhshpmeogswxfjtpvq-auth-token' })
  await page.goto(appPath + '#/plan')
  await expect(page.getByRole('heading', { name: /Your week/ })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toHaveCount(0)
})
