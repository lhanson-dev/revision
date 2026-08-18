import { expect, test, type Page } from '@playwright/test'

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
