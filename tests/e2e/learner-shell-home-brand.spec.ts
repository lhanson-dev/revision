import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const themeKey = 'revision:theme'
const appPath = '/revision/app/'

async function seedSyntheticSession(page: Page, theme: 'light' | 'dark' = 'light', firstName = 'Jamie') {
  const userId = '00000000-0000-4000-8000-000000000001'
  await page.addInitScript(({ key, id, preferredThemeKey, preferredTheme, learnerFirstName }) => {
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
        email: `${learnerFirstName.toLowerCase()}@revision.invalid`,
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: learnerFirstName },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      },
    }))
    localStorage.setItem(preferredThemeKey, preferredTheme)
  }, { key: storageKey, id: userId, preferredThemeKey: themeKey, preferredTheme: theme, learnerFirstName: firstName })

  await page.route('**/rest/v1/learning_evidence**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_assessments**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }))
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/revision_activity_events**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/profiles**', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/vnd.pgrst.object+json',
    body: JSON.stringify({ is_admin: false }),
  }))
}

async function loadHome(page: Page, theme: 'light' | 'dark' = 'light', firstName = 'Jamie') {
  await seedSyntheticSession(page, theme, firstName)
  await page.goto(appPath)
  await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', theme)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('what shall we do today?')
}

test('desktop shell uses four-item top navigation and contextual Ask REV access', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await loadHome(page)

  const topbar = page.locator('.runtime-topbar')
  await expect(topbar).toBeVisible()
  await expect(page.locator('.runtime-mobile-topbar')).toBeHidden()
  await expect(page.locator('.runtime-bottom-nav')).toBeHidden()

  const brandButton = topbar.getByRole('button', { name: 'REV home' })
  const brandStyle = await brandButton.evaluate((element) => {
    const style = getComputedStyle(element)
    const fallback = element.querySelector<HTMLElement>('.rev-wordmark')
    return {
      backgroundImage: style.backgroundImage,
      width: style.width,
      height: style.height,
      fallbackVisibility: fallback ? getComputedStyle(fallback).visibility : 'missing',
    }
  })
  expect(brandStyle.backgroundImage).not.toBe('none')
  expect(brandStyle.width).toBe('188px')
  expect(brandStyle.height).toBe('47px')
  expect(brandStyle.fallbackVisibility).toBe('hidden')

  const primaryNav = page.getByRole('navigation', { name: 'Primary navigation' })
  const navButtons = primaryNav.getByRole('button')
  await expect(navButtons).toHaveCount(4)
  expect((await navButtons.allTextContents()).map((label) => label.trim())).toEqual(['Home', 'Plan', 'Progress', 'Subjects'])
  await expect(primaryNav.getByRole('button', { name: 'REV', exact: true })).toHaveCount(0)
  await expect(primaryNav.getByRole('button', { name: 'Home', exact: true })).toHaveClass(/active/)

  const revFab = page.getByRole('button', { name: /Ask REV/i })
  await expect(revFab).toBeVisible()
  const hashBefore = await page.evaluate(() => window.location.hash)
  await revFab.click()
  const revDialog = page.getByRole('dialog', { name: 'Ask REV about Home' })
  await expect(revDialog).toBeVisible()
  await expect(revDialog.getByLabel('Ask REV about Home')).toBeVisible()
  expect(await page.evaluate(() => window.location.hash)).toBe(hashBefore)
  await revDialog.getByRole('button', { name: 'Close REV chat' }).click()
  await expect(revDialog).toBeHidden()

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hey Jamie')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('what shall we do today?')
  await expect(page.getByLabel('Ask REV anything')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send to REV' })).toBeVisible()
  await expect(page.locator('.rev-presence-hero')).toBeVisible()

  const quickActions = page.locator('.living-home-feature')
  await expect(quickActions).toHaveCount(4)
  for (const label of ['Plan smart', 'Continue where you left off', 'Find resources', 'Track progress']) {
    await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
  }

  const iconStyle = await quickActions.first().locator('.living-home-feature-icon').evaluate((element) => {
    const style = getComputedStyle(element)
    const before = getComputedStyle(element, '::before')
    return { fontSize: style.fontSize, maskImage: before.maskImage || before.webkitMaskImage }
  })
  expect(iconStyle.fontSize).toBe('0px')
  expect(iconStyle.maskImage).not.toBe('none')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('Home greeting resolves the signed-in learner first name rather than a hard-coded example', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await loadHome(page, 'light', 'Amara')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hey Amara')
  await expect(page.getByRole('heading', { level: 1 })).not.toContainText('Jamie')
})

test('dark theme swaps to the approved dark wordmark while preserving Calm Teal actions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await loadHome(page, 'dark')

  const snapshot = await page.evaluate(() => {
    const runtime = document.querySelector<HTMLElement>('.planner-runtime')
    const brand = document.querySelector<HTMLElement>('.runtime-topbar .brand-button')
    const send = document.querySelector<HTMLElement>('.living-home-send')
    if (!runtime || !brand || !send) throw new Error('Learner shell assurance could not find themed elements.')
    return {
      runtimeBackground: getComputedStyle(runtime).backgroundColor,
      wordmark: getComputedStyle(brand).backgroundImage,
      actionBackground: getComputedStyle(send).backgroundColor,
      actionText: getComputedStyle(send).color,
    }
  })

  expect(snapshot.runtimeBackground).toBe('rgb(15, 32, 36)')
  expect(snapshot.wordmark).not.toBe('none')
  expect(snapshot.actionBackground).toBe('rgb(43, 182, 163)')
  expect(snapshot.actionText).toBe('rgb(19, 32, 38)')
})

test('tablet and phone keep the five-item bottom navigation with REV as the centre destination', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await loadHome(page)

  await expect(page.locator('.runtime-topbar')).toBeHidden()
  await expect(page.locator('.runtime-mobile-topbar')).toBeVisible()
  await expect(page.locator('.runtime-rev-fab')).toBeHidden()
  const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(mobileNav).toBeVisible()

  const buttons = mobileNav.getByRole('button')
  await expect(buttons).toHaveCount(5)
  const labels = await buttons.allTextContents()
  expect(labels.map((label) => label.trim())).toEqual(['Home', 'Plan', 'REV', 'Progress', 'Subjects'])

  const revButton = mobileNav.getByRole('button', { name: 'Open REV' })
  const revBox = await revButton.boundingBox()
  expect(revBox?.width ?? 0).toBeGreaterThanOrEqual(60)
  expect(revBox?.height ?? 0).toBeGreaterThanOrEqual(60)
  await expect(revButton.locator('.rev-presence-nav')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.runtime-mobile-topbar')).toBeVisible()
  await expect(mobileNav).toBeVisible()
  await expect(page.getByLabel('Ask REV anything')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})
