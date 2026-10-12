import { createHash } from 'node:crypto'
import { expect, test, type Locator, type Page } from '@playwright/test'

const appPath = '/revision/app/'

async function stubAuthSettings(page: Page, google: boolean) {
  await page.route('**/auth/v1/settings', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ external: { google } }),
    })
  })
}

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function assertCanonicalWordmark(page: Page, theme: 'light' | 'dark') {
  const brand = page.locator('.auth-brand[data-brand-asset="wordmark"]')
  await expect(brand).toBeVisible()
  await expect(brand).not.toContainText('✦')

  const images = brand.locator('.ui-brand-asset__image')
  await expect(images).toHaveCount(2)
  const visibility = await images.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).visibility))
  expect(visibility).toEqual(theme === 'dark' ? ['hidden', 'visible'] : ['visible', 'hidden'])
}

async function assertNoLegacyDarkThemeLeaks(root: Locator, label: string) {
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

test('sign in keeps the primary path clear and uses the canonical Revision identity', async ({ page }) => {
  await stubAuthSettings(page, true)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await assertCanonicalWordmark(page, 'light')
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Forgot password?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  await expect(page.getByLabel('First name')).toHaveCount(0)
  await expectNoPageOverflow(page)
})

test('email account creation asks for first name and keeps Google as the low-friction alternative', async ({ page }) => {
  await stubAuthSettings(page, true)
  await page.goto(appPath)

  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  await expect(page.getByLabel('First name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('Google sign in is hidden rather than broken when the provider is not configured', async ({ page }) => {
  await stubAuthSettings(page, false)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('sign in and account creation use the canonical dark identity and central dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revision:theme', 'dark'))
  await stubAuthSettings(page, true)
  await page.goto(appPath)

  const authShell = page.locator('.auth-shell')
  await expect(authShell).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await assertCanonicalWordmark(page, 'dark')
  await assertNoLegacyDarkThemeLeaks(authShell, 'Sign in')

  const card = page.locator('.auth-card')
  const signInStyles = await card.evaluate((element) => {
    const style = getComputedStyle(element)
    const shellStyle = getComputedStyle(element.closest('.auth-shell') as Element)
    return {
      background: style.backgroundColor,
      color: style.color,
      expectedBackground: shellStyle.getPropertyValue('--color-surface').trim(),
      expectedColor: shellStyle.getPropertyValue('--color-text').trim(),
    }
  })
  expect(signInStyles.background).not.toBe('rgb(255, 255, 255)')
  expect(signInStyles.expectedBackground).toBeTruthy()
  expect(signInStyles.expectedColor).toBeTruthy()

  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  await assertCanonicalWordmark(page, 'dark')
  await assertNoLegacyDarkThemeLeaks(authShell, 'Create account')
})

/** C3 entry-design visual baselines, separate from the fixed B7 18-state visual matrix.
 * Founder explicitly approved the four PR #593 screenshots (desktop sign-in
 * Light/Dark and phone first-use Light/Dark) on 10 October 2026 by replying
 * "Approve PR #593" to the immediately preceding visual-baseline request.
 * These hashes are from exact-head CI #2965 (run 38062078446, artifact
 * interface-visual-regression-38062078446 ID 11673104330), originally
 * captured on head 52b09049e94ef98a4fa886d9c20556cc3acd1aba.
 * This approval covers visual baselines only, NOT the PR merge.
 */
const approvedSignInDigests: Record<'light' | 'dark', string> = {
  light: 'd69e3bdb83fa5f5188e8f62bf31add2cc525fc7b99654a8980f8397bd2853128',
  dark: '005c17ae47f605d2bcc2e0a2aef5535a0256271dd84f9373290352bf899771b5',
}
for (const theme of ['light', 'dark'] as const) {
  test(`desktop sign-in ${theme} C3 visual review`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Canonical desktop review viewport only')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript((selectedTheme) => localStorage.setItem('revision:theme', selectedTheme), theme)
    await stubAuthSettings(page, true)
    await page.goto(appPath)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0) })
    const screenshot = await page.screenshot({ animations: 'disabled', caret: 'hide', fullPage: false })
    await testInfo.attach(`auth-entry-${theme}-desktop.png`, { body: screenshot, contentType: 'image/png' })
    expect([approvedSignInDigests[theme]]).toContain(createHash('sha256').update(screenshot).digest('hex'))
  })
}
