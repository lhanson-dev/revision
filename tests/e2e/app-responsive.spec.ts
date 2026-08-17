import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function seedSyntheticSession(page: Page) {
  const userId = '00000000-0000-4000-8000-000000000001'
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
        email: 'synthetic-browser-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
}

test('sign-in experience remains usable without horizontal page scrolling', async ({ page }) => {
  await page.goto('/app/')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('authenticated revision and exam journeys remain available across viewports', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto('/app/')

  await expect(page.getByRole('heading', { name: 'Revision Hub' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Practise Paper 2' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Learn' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Flashcards' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Quick check' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Case study' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exam question' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Readiness progress' })).toBeVisible()
  await expectNoPageOverflow(page)

  await page.getByRole('button', { name: 'Case study' }).click()
  await expect(page.getByText('Guided application practice')).toBeVisible()
  await expectNoPageOverflow(page)

  await page.getByRole('button', { name: 'Exam question' }).click()
  await expect(page.getByText('Scored exam evidence — self-assessed')).toBeVisible()
  await expectNoPageOverflow(page)

  await expect(page.getByRole('heading', { name: 'Full 90-minute Paper 2' })).toBeVisible()
  await page.getByRole('button', { name: 'Start timed exam' }).click()
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()
  await expect(page.getByText(/90:00|89:59|89:58/)).toBeVisible()
  await expectNoPageOverflow(page)
})
