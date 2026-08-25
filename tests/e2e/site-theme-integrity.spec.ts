import { expect, test, type Locator, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000124'
const asCourseId = 'aqa:aqa-as:7131'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

function isResponsiveLayout(page: Page) {
  return (page.viewportSize()?.width ?? 0) <= 960
}

async function seedSession(page: Page) {
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
        email: 'site-theme-integrity@revision.invalid',
        email_confirmed_at: '2026-08-22T15:10:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Theme' },
        identities: [],
        created_at: '2026-08-22T15:10:00.000Z',
        updated_at: '2026-08-22T15:10:00.000Z',
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
        email: 'site-theme-integrity@revision.invalid',
        email_confirmed_at: '2026-08-22T15:10:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Theme' },
        identities: [],
        created_at: '2026-08-22T15:10:00.000Z',
        updated_at: '2026-08-22T15:10:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { user_id: userId, course_id: asCourseId, created_at: '2026-08-22T18:00:00.000Z' },
        { user_id: userId, course_id: aLevelCourseId, created_at: '2026-08-22T18:00:01.000Z' },
      ]),
    })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
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

async function navigation(page: Page) {
  if (isResponsiveLayout(page)) {
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
  if (isResponsiveLayout(page)) await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toHaveCount(0)
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

      const identifier = [
        element.tagName.toLowerCase(),
        element.id ? `#${element.id}` : '',
        [...element.classList].slice(0, 3).map((name) => `.${name}`).join(''),
      ].join('')
      return issues.map((issue) => `${identifier}: ${issue}`)
    })
  })

  expect(findings, `${label} theme leaks:\n${findings.join('\n')}`).toEqual([])
}

async function assertSemanticSurface(locator: Locator, token: string, label: string) {
  const values = await locator.evaluate((element, tokenName) => {
    const probe = document.createElement('div')
    probe.style.position = 'fixed'
    probe.style.visibility = 'hidden'
    probe.style.background = `var(${tokenName})`
    element.appendChild(probe)
    const expected = getComputedStyle(probe).backgroundColor
    probe.remove()
    return {
      actual: getComputedStyle(element).backgroundColor,
      expected,
    }
  }, token)
  expect(values.actual, `${label} must resolve ${token}, not a legacy or light-only surface`).toBe(values.expected)
}

async function assertSemanticText(locator: Locator, token: string, label: string) {
  const values = await locator.evaluate((element, tokenName) => {
    const probe = document.createElement('span')
    probe.style.position = 'fixed'
    probe.style.visibility = 'hidden'
    probe.style.color = `var(${tokenName})`
    element.appendChild(probe)
    const expected = getComputedStyle(probe).color
    probe.remove()
    return {
      actual: getComputedStyle(element).color,
      expected,
    }
  }, token)
  expect(values.actual, `${label} must resolve ${token}`).toBe(values.expected)
}

async function auditRuntime(page: Page, label: string) {
  const runtime = page.locator('.planner-runtime')
  await expect(runtime).toHaveAttribute('data-theme', 'dark')
  await assertNoLegacyThemeLeaks(runtime, label)
}

test('dark theme is coherent across the complete learner application and account surfaces', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hi Theme,\s*what shall we do today\?/ })).toBeVisible()
  await auditRuntime(page, 'Home')

  await clickNavigation(page, 'Plan')
  await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
  await auditRuntime(page, 'Plan')

  await clickNavigation(page, 'Progress')
  await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible()
  await auditRuntime(page, 'Progress')

  await clickNavigation(page, 'Courses')
  await expect(page.getByRole('heading', { name: 'Courses', exact: true })).toBeVisible()
  await auditRuntime(page, 'Courses')

  await clickNavigation(page, 'AQA AS Business')
  await expect(page.getByRole('heading', { name: 'AQA AS Business', exact: true, level: 1 })).toBeVisible()
  await auditRuntime(page, 'Course overview')

  await clickNavigation(page, 'AQA AS Business Learn')
  await expect(page.getByRole('heading', { name: /Learn · AQA AS Business/ })).toBeVisible()
  await auditRuntime(page, 'Learn')

  await clickNavigation(page, 'AQA AS Business Practice')
  await expect(page.getByRole('heading', { name: /Practice · AQA AS Business/ })).toBeVisible()
  const recommendation = page.locator('.focused-practice .recommendation-card')
  await expect(recommendation, 'Practice must exercise the visible REV recommends state').toBeVisible()
  await expect(recommendation.getByText('REV recommends', { exact: true })).toBeVisible()
  await assertSemanticSurface(recommendation, '--color-surface-soft', 'Practice REV recommends card')
  await assertSemanticText(recommendation.getByRole('heading').first(), '--color-text', 'Practice REV recommends heading')
  await assertSemanticText(recommendation.getByText('REV recommends', { exact: true }), '--color-accent-text', 'Practice REV recommends eyebrow')
  await auditRuntime(page, 'Practice with REV recommendation')

  await clickNavigation(page, 'AQA AS Business Exam Prep')
  await expect(page.getByRole('heading', { name: /Exam technique · AQA AS Business/ })).toBeVisible()
  await auditRuntime(page, 'Exam Prep')

  const firstPaper = page.locator('.exam-paper-card').first()
  await expect(firstPaper).toBeVisible()
  await firstPaper.locator('summary').click()
  await expect(firstPaper.locator('.paper-exam-content')).toBeVisible()
  await auditRuntime(page, 'Exam Prep expanded paper')

  await clickNavigation(page, 'AQA AS Business Progress')
  await expect(page.locator('.course-nav button.active')).toHaveText('Progress')
  await auditRuntime(page, 'Course progress')

  await page.goto(`${appPath}#/rev`)
  await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', 'dark')
  await auditRuntime(page, 'REV')

  if (isResponsiveLayout(page)) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await drawer.getByRole('button', { name: 'Theme account options' }).click()
    await drawer.getByRole('button', { name: 'Profile', exact: true }).click()
  } else {
    await page.getByRole('button', { name: 'Theme account menu' }).click()
    await page.getByRole('menu', { name: 'Profile menu' }).getByRole('menuitem', { name: 'Profile', exact: true }).click()
  }

  const account = page.getByRole('dialog', { name: 'Account settings' })
  await expect(account).toBeVisible()
  await assertNoLegacyThemeLeaks(account, 'Account profile')
  await account.getByRole('button', { name: 'Settings' }).click()
  await assertNoLegacyThemeLeaks(account, 'Account settings')
})
