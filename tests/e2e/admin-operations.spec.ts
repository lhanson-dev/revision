import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'

async function seedAdminSession(page: Page) {
  const userId = '00000000-0000-4000-8000-000000000051'
  await page.addInitScript(({ key, id }) => {
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
        email: 'admin-browser-test@revision.invalid',
        email_confirmed_at: '2026-08-19T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Admin' },
        identities: [],
        created_at: '2026-08-19T00:00:00.000Z',
        updated_at: '2026-08-19T00:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: true }),
    })
  })

  await page.route('**/functions/v1/admin-operations', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 200,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
          'access-control-allow-methods': 'POST, OPTIONS',
        },
        body: 'ok',
      })
      return
    }

    await route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: '2026-08-19T00:30:00.000Z',
        users: {
          totalLearners: 12,
          adminAccounts: 1,
          testAccounts: 1,
          newLearners7d: 4,
          newLearners30d: 9,
          activeLearners1d: 3,
          activeLearners7d: 8,
          activeLearners30d: 10,
          signups14d: [
            { date: '2026-08-17', count: 1 },
            { date: '2026-08-18', count: 2 },
            { date: '2026-08-19', count: 1 },
          ],
        },
        activity: {
          events7d: 64,
          events30d: 181,
          flashcards30d: 90,
          quickChecks30d: 55,
          examQuestions30d: 30,
          examAttempts30d: 6,
          modulesWithEvidence30d: 2,
          topicsWithEvidence30d: 17,
          latestEventAt: '2026-08-19T00:20:00.000Z',
          daily14d: [
            { date: '2026-08-17', count: 12 },
            { date: '2026-08-18', count: 22 },
            { date: '2026-08-19', count: 30 },
          ],
          modules30d: [
            { moduleId: 'business-aqa-as-paper-2', count: 110 },
            { moduleId: 'business-aqa-a-level-paper-1', count: 71 },
          ],
        },
        content: {
          jobsKnown: true,
          jobsTotal: 3,
          jobsInProgress: 2,
          blockedJobs: 1,
          readyForFounderAction: 1,
          jobs: [
            {
              jobId: 'cf-example',
              issueNumber: 99,
              issueUrl: 'https://github.com/lhanson-dev/revision/issues/99',
              state: 'ready_for_founder_merge_approval',
              blockers: 0,
              updatedAt: '2026-08-19T00:10:00.000Z',
            },
          ],
          visibilityMessage: null,
        },
        health: {
          overall: 'Attention needed',
          checks: [
            { id: 'authentication', label: 'Authentication', status: 'Healthy', detail: 'Authenticated admin access verified.' },
            { id: 'database', label: 'Database', status: 'Healthy', detail: 'Metrics query succeeded.' },
            { id: 'learner-app', label: 'Learner app', status: 'Healthy', detail: 'The canonical production /app/ route is reachable.' },
            { id: 'deployment', label: 'Deployment', status: 'Healthy', detail: 'Latest main deployment and production smoke passed for abc1234.' },
            { id: 'path-to-live', label: 'Path to live', status: 'Unknown', detail: 'PR #64 exact-head CI and production deployment are green, but no Founder approval marker is recorded for head abc1234.' },
            { id: 'content-factory', label: 'Content Factory', status: 'Attention needed', detail: 'GitHub integration needs configuration.', action: 'Configure the Content Factory secret.' },
          ],
          needsAttention: [
            { id: 'content-factory', label: 'Content Factory', status: 'Attention needed', detail: 'GitHub integration needs configuration.', action: 'Configure the Content Factory secret.' },
          ],
          unknownCount: 0,
        },
      }),
    })
  })
}

async function waitForAdminPageToSettle(page: Page) {
  await page.waitForFunction(() => Math.abs(window.scrollY) <= 1)
}

test('admin operations dashboard shows high-level evidence and drills into detail views', async ({ page }) => {
  await seedAdminSession(page)
  await page.goto(`${appPath}#/admin`)

  await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Learners 12/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Active learners · 7d 8/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Learning activities · 7d 64/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Founder assurance' })).toBeVisible()
  await expect(page.getByText('ProductionHealthy')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Needs attention' })).toBeVisible()
  await expect(page.getByText('GitHub integration needs configuration.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Content Operations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Add course' })).toBeVisible()

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Users' }).click()
  await expect(page).toHaveURL(/#\/admin\/users$/)
  await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible()
  await expect(page.getByText('Admin and test accounts excluded')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Activity' }).click()
  await expect(page.getByRole('heading', { name: 'Learning Activity' })).toBeVisible()
  await expect(page.getByText('Flashcards')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'System Health' }).click()
  await expect(page.getByRole('heading', { name: 'System Health' })).toBeVisible()
  await expect(page.getByText('Attention needed').first()).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Assurance' }).click()
  await expect(page).toHaveURL(/#\/admin\/assurance$/)
  await expect(page.getByRole('heading', { name: 'Founder Assurance' })).toBeVisible()
  await expect(page.getByText('Evidence, not a confidence score')).toBeVisible()
  await expect(page.getByText('no Founder approval marker is recorded')).toBeVisible()
  await expect(page.getByText('0 P0 · 0 P1 · 1 P2 open')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Defects' })).toBeVisible()
  await expect(page.getByText('DEF-2026-001')).toBeVisible()
  await expect(page.getByText('A11Y-01; signed-in global navigation/account drawer')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Critical journeys' })).toBeVisible()
  await expect(page.getByText('JRN-04')).toBeVisible()
  await expect(page.getByText('DATA-01')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Content Operations' }).click()
  await expect(page.getByRole('heading', { name: 'Content Operations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Add course' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Course Jobs' })).toBeVisible()
})
