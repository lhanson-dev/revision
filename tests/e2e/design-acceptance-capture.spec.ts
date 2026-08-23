import { mkdirSync } from 'node:fs'
import { expect, test, type Page, type TestInfo } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const learnerId = '00000000-0000-4000-8000-000000000231'
const adminId = '00000000-0000-4000-8000-000000000232'

function captureDir(testInfo: TestInfo) {
  const dir = `design-captures/${testInfo.project.name}`
  mkdirSync(dir, { recursive: true })
  return dir
}

async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(async () => { await document.fonts.ready })
}

async function capture(page: Page, testInfo: TestInfo, name: string, fullPage = true) {
  await settle(page)
  await page.screenshot({
    path: `${captureDir(testInfo)}/${name}.png`,
    fullPage,
    animations: 'disabled',
    caret: 'hide',
  })
}

function syntheticToken(id: string) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${header}.${payload}.synthetic`
}

async function seedLearner(page: Page, theme: 'light' | 'dark') {
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
        email: 'design-acceptance@revision.invalid',
        email_confirmed_at: '2026-08-23T00:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Jamie' },
        identities: [],
        created_at: '2026-08-23T00:30:00.000Z',
        updated_at: '2026-08-23T00:30:00.000Z',
      },
    }))
  }, { key: storageKey, id: learnerId, selectedTheme: theme })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: learnerId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'design-acceptance@revision.invalid',
        email_confirmed_at: '2026-08-23T00:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Jamie' },
        identities: [],
        created_at: '2026-08-23T00:30:00.000Z',
        updated_at: '2026-08-23T00:30:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })

  for (const endpoint of [
    'learning_evidence',
    'revision_assessments',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events',
  ]) {
    await page.route(`**/rest/v1/${endpoint}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }

  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
}

async function seedAdmin(page: Page) {
  await page.addInitScript(({ key, id }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem('revision:theme', 'dark')
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
        email: 'design-admin@revision.invalid',
        email_confirmed_at: '2026-08-23T00:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Admin' },
        identities: [],
        created_at: '2026-08-23T00:30:00.000Z',
        updated_at: '2026-08-23T00:30:00.000Z',
      },
    }))
  }, { key: storageKey, id: adminId })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: adminId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'design-admin@revision.invalid',
        user_metadata: { first_name: 'Admin' },
        app_metadata: { provider: 'email', providers: ['email'] },
        identities: [],
        created_at: '2026-08-23T00:30:00.000Z',
        updated_at: '2026-08-23T00:30:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: true }) })
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
        generatedAt: '2026-08-23T00:30:00.000Z',
        users: {
          totalLearners: 128,
          adminAccounts: 2,
          testAccounts: 4,
          newLearners7d: 19,
          newLearners30d: 61,
          activeLearners1d: 31,
          activeLearners7d: 84,
          activeLearners30d: 109,
          signups14d: [
            { date: '2026-08-20', count: 9 },
            { date: '2026-08-21', count: 12 },
            { date: '2026-08-22', count: 15 },
          ],
        },
        activity: {
          events7d: 611,
          events30d: 2148,
          flashcards30d: 1048,
          quickChecks30d: 701,
          examQuestions30d: 312,
          examAttempts30d: 87,
          modulesWithEvidence30d: 2,
          topicsWithEvidence30d: 41,
          latestEventAt: '2026-08-23T00:20:00.000Z',
          daily14d: [
            { date: '2026-08-20', count: 72 },
            { date: '2026-08-21', count: 84 },
            { date: '2026-08-22', count: 96 },
          ],
          modules30d: [
            { moduleId: 'business-aqa-as-paper-2', count: 1210 },
            { moduleId: 'business-aqa-as-paper-1', count: 938 },
          ],
        },
        content: {
          jobsKnown: true,
          jobsTotal: 3,
          jobsInProgress: 1,
          blockedJobs: 1,
          readyForFounderAction: 1,
          jobs: [
            { jobId: 'content-101', issueNumber: 101, issueUrl: 'https://github.com/lhanson-dev/revision/issues/101', state: 'in_progress', blockers: 0, updatedAt: '2026-08-22T23:30:00.000Z' },
          ],
          visibilityMessage: null,
        },
        health: {
          overall: 'Attention needed',
          checks: [
            { id: 'authentication', label: 'Authentication', status: 'Healthy', detail: 'Authenticated admin access verified.' },
            { id: 'database', label: 'Database', status: 'Healthy', detail: 'Metrics query succeeded.' },
            { id: 'learner-app', label: 'Learner app', status: 'Healthy', detail: 'Canonical production app is reachable.' },
            { id: 'deployment', label: 'Deployment', status: 'Healthy', detail: 'Latest main deployment and smoke passed.' },
            { id: 'path-to-live', label: 'Path to live', status: 'Unknown', detail: 'Correlated evidence is not available in this synthetic capture.' },
            { id: 'content-factory', label: 'Content Factory', status: 'Attention needed', detail: 'One content job is blocked.', action: 'Review the blocked content job.' },
          ],
          needsAttention: [
            { id: 'content-factory', label: 'Content Factory', status: 'Attention needed', detail: 'One content job is blocked.', action: 'Review the blocked content job.' },
          ],
          unknownCount: 1,
        },
      }),
    })
  })
}

async function navigation(page: Page) {
  if ((page.viewportSize()?.width ?? 0) <= 960) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()
    return drawer.getByRole('navigation', { name: 'Mobile navigation' })
  }
  return page.getByRole('navigation', { name: 'Primary navigation' })
}

async function clickNavigation(page: Page, label: string) {
  const nav = await navigation(page)
  await nav.getByRole('button', { name: label, exact: true }).click()
  if ((page.viewportSize()?.width ?? 0) <= 960) {
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toHaveCount(0)
  }
}

async function openBusinessCourse(page: Page) {
  await clickNavigation(page, 'Subjects')
  const businessCard = page.locator('.subject-card').filter({ hasText: 'Business' }).first()
  await businessCard.getByRole('button', { name: /Open Business/ }).click()
  await page.getByLabel('AQA AS Business').getByRole('button', { name: 'Open course' }).click()
}

test('capture unauthenticated entry in both themes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await page.addInitScript(() => localStorage.setItem('revision:theme', 'light'))
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await capture(page, testInfo, '01-sign-in-light')

  await page.evaluate(() => localStorage.setItem('revision:theme', 'dark'))
  await page.reload()
  await expect(page.locator('.auth-shell')).toHaveAttribute('data-theme', 'dark')
  await capture(page, testInfo, '02-sign-in-dark')
})

test('capture canonical learner states', async ({ page }, testInfo) => {
  await seedLearner(page, 'dark')
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Jamie,\s*what shall we do today\?/ })).toBeVisible()
  await capture(page, testInfo, '10-home-dark')

  if (testInfo.project.name === 'phone') {
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible()
    await capture(page, testInfo, '11-mobile-navigation-dark', false)
    await page.getByRole('button', { name: 'Close menu' }).click()
  }

  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
  await capture(page, testInfo, '12-plan-dark')

  await page.goto(`${appPath}#/progress`)
  await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible()
  await capture(page, testInfo, '13-progress-dark')

  await page.goto(appPath)
  await openBusinessCourse(page)
  await expect(page.getByRole('heading', { name: 'AQA AS Business', exact: true, level: 1 })).toBeVisible()
  await capture(page, testInfo, '14-course-overview-dark')

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Learn' }).click()
  await expect(page.getByRole('heading', { name: /Learn · AQA AS Business/ })).toBeVisible()
  await capture(page, testInfo, '15-learn-dark')

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Practice' }).click()
  const recommendation = page.locator('.focused-practice .recommendation-card')
  await expect(recommendation).toBeVisible()
  await capture(page, testInfo, '16-practice-recommendation-dark')

  await page.getByRole('tab', { name: 'Quick check' }).click()
  const firstOption = page.getByRole('radio').first()
  await firstOption.check()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(page.locator('.answer-panel')).toBeVisible()
  await capture(page, testInfo, '17-practice-feedback-dark')

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page.getByRole('heading', { name: /Exam technique · AQA AS Business/ })).toBeVisible()
  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' })
  await paper.locator('summary').click()
  await capture(page, testInfo, '18-exam-prep-expanded-dark')

  await paper.getByRole('button', { name: 'Start timed exam' }).first().click()
  await expect(page.locator('.exam-session-page')).toBeVisible()
  await capture(page, testInfo, '19-timed-exam-active-dark', false)

  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('dialog', { name: 'Exam paused' })).toBeVisible()
  await capture(page, testInfo, '20-timed-exam-paused-dark', false)
  await page.getByRole('dialog', { name: 'Exam paused' }).getByRole('button', { name: /Continue exam/ }).click()

  await page.getByRole('button', { name: 'Stop exam' }).click()
  await expect(page.getByRole('dialog', { name: 'Are you sure?' })).toBeVisible()
  await capture(page, testInfo, '21-timed-exam-stop-confirm-dark', false)
})

test('capture key learner states in light theme', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await seedLearner(page, 'light')
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Jamie,\s*what shall we do today\?/ })).toBeVisible()
  await capture(page, testInfo, '30-home-light')

  await openBusinessCourse(page)
  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Practice' }).click()
  await expect(page.locator('.focused-practice .recommendation-card')).toBeVisible()
  await capture(page, testInfo, '31-practice-recommendation-light')

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' })
  await paper.locator('summary').click()
  await paper.getByRole('button', { name: 'Start timed exam' }).first().click()
  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('dialog', { name: 'Exam paused' })).toBeVisible()
  await capture(page, testInfo, '32-timed-exam-paused-light', false)
})

test('capture Admin and assurance evidence hierarchy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop')
  await seedAdmin(page)
  await page.goto(`${appPath}#/admin`)
  await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()
  await capture(page, testInfo, '40-admin-dashboard-dark')

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Assurance' }).click()
  await expect(page.getByRole('heading', { name: 'Founder Assurance' })).toBeVisible()
  await capture(page, testInfo, '41-founder-assurance-dark')
})

void syntheticToken
