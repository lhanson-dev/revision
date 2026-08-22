import { expect, test, type Locator, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000125'

async function seedAdminSession(page: Page) {
  await page.addInitScript(({ key, id }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const accessToken = `${header}.${payload}.synthetic`
    localStorage.setItem('revision:theme', 'dark')
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
        email: 'admin-theme-integrity@revision.invalid',
        email_confirmed_at: '2026-08-22T15:15:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'AdminTheme' },
        identities: [],
        created_at: '2026-08-22T15:15:00.000Z',
        updated_at: '2026-08-22T15:15:00.000Z',
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
        email: 'admin-theme-integrity@revision.invalid',
        email_confirmed_at: '2026-08-22T15:15:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'AdminTheme' },
        identities: [],
        created_at: '2026-08-22T15:15:00.000Z',
        updated_at: '2026-08-22T15:15:00.000Z',
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
        generatedAt: '2026-08-22T15:15:00.000Z',
        users: {
          totalLearners: 12,
          adminAccounts: 1,
          testAccounts: 1,
          newLearners7d: 4,
          newLearners30d: 9,
          activeLearners1d: 3,
          activeLearners7d: 8,
          activeLearners30d: 10,
          signups14d: [{ date: '2026-08-22', count: 1 }],
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
          latestEventAt: '2026-08-22T15:10:00.000Z',
          daily14d: [{ date: '2026-08-22', count: 30 }],
          modules30d: [{ moduleId: 'business-aqa-as-paper-2', count: 110 }],
        },
        content: {
          jobsKnown: true,
          jobsTotal: 1,
          jobsInProgress: 0,
          blockedJobs: 0,
          readyForFounderAction: 0,
          jobs: [],
          visibilityMessage: null,
        },
        health: {
          overall: 'Healthy',
          checks: [
            { id: 'authentication', label: 'Authentication', status: 'Healthy', detail: 'Authenticated admin access verified.' },
            { id: 'database', label: 'Database', status: 'Healthy', detail: 'Metrics query succeeded.' },
            { id: 'learner-app', label: 'Learner app', status: 'Healthy', detail: 'The canonical production /app/ route is reachable.' },
            { id: 'deployment', label: 'Deployment', status: 'Healthy', detail: 'Latest main deployment and production smoke passed.' },
            { id: 'path-to-live', label: 'Path to live', status: 'Healthy', detail: 'Current path-to-live evidence is green.' },
            { id: 'content-factory', label: 'Content Factory', status: 'Healthy', detail: 'Content operations are available.' },
          ],
          needsAttention: [],
          unknownCount: 0,
        },
      }),
    })
  })
}

async function assertNoLegacyThemeLeaks(root: Locator, label: string) {
  const findings = await root.locator('*').evaluateAll((elements) => {
    const badBackgrounds = new Set([
      'rgb(255, 255, 255)',
      'rgb(241, 248, 244)',
      'rgb(243, 246, 249)',
      'rgb(250, 251, 252)',
      'rgb(237, 242, 245)',
    ])
    const badText = new Set([
      'rgb(29, 39, 51)',
      'rgb(16, 36, 61)',
      'rgb(31, 41, 55)',
      'rgb(51, 65, 85)',
      'rgb(55, 65, 81)',
      'rgb(71, 85, 105)',
      'rgb(100, 116, 139)',
    ])

    return elements.flatMap((element) => {
      if (!(element instanceof HTMLElement)) return []
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      if (rect.width <= 0 || rect.height <= 0 || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return []
      const directText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()))
      const issues: string[] = []
      if (badBackgrounds.has(style.backgroundColor)) issues.push(`light-only background ${style.backgroundColor}`)
      if (directText && badText.has(style.color)) issues.push(`legacy text ${style.color}`)
      if (!issues.length) return []
      const identifier = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].slice(0, 3).map((name) => `.${name}`).join('')}`
      return issues.map((issue) => `${identifier}: ${issue}`)
    })
  })

  expect(findings, `${label} theme leaks:\n${findings.join('\n')}`).toEqual([])
}

async function auditAdmin(page: Page, label: string) {
  const runtime = page.locator('.planner-runtime')
  await expect(runtime).toHaveAttribute('data-theme', 'dark')
  await assertNoLegacyThemeLeaks(runtime, label)
}

test('dark theme is coherent across all Admin and Founder Assurance destinations', async ({ page }) => {
  await seedAdminSession(page)
  await page.goto(`${appPath}#/admin`)

  await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()
  await auditAdmin(page, 'Admin dashboard')

  const adminNav = page.getByRole('navigation', { name: 'Admin operations' })

  await adminNav.getByRole('button', { name: 'Users' }).click()
  await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible()
  await auditAdmin(page, 'Admin users')

  await adminNav.getByRole('button', { name: 'Activity' }).click()
  await expect(page.getByRole('heading', { name: 'Learning Activity' })).toBeVisible()
  await auditAdmin(page, 'Admin activity')

  await adminNav.getByRole('button', { name: 'System Health' }).click()
  await expect(page.getByRole('heading', { name: 'System Health' })).toBeVisible()
  await auditAdmin(page, 'Admin system health')

  await adminNav.getByRole('button', { name: 'Assurance' }).click()
  await expect(page.getByRole('heading', { name: 'Founder Assurance' })).toBeVisible()
  await auditAdmin(page, 'Founder Assurance')

  await adminNav.getByRole('button', { name: 'Content Operations' }).click()
  await expect(page.getByRole('heading', { name: 'Content Operations' })).toBeVisible()
  await auditAdmin(page, 'Content Operations')
})
