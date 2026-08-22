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

test('sign in keeps the primary path clear and exposes Google only when enabled', async ({ page }) => {
  await stubAuthSettings(page, true)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
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

test('sign in and account creation use the central dark theme without legacy light surfaces', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revision:theme', 'dark'))
  await stubAuthSettings(page, true)
  await page.goto(appPath)

  const authShell = page.locator('.auth-shell')
  await expect(authShell).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
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
  await assertNoLegacyDarkThemeLeaks(authShell, 'Create account')
})
