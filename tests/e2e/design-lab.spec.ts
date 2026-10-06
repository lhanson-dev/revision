import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const designLabPath = '/revision/design-lab.html'

async function seedSession(page: Page, isAdmin: boolean) {
  const userId = isAdmin ? '00000000-0000-4000-8000-000000000425' : '00000000-0000-4000-8000-000000000426'

  await page.addInitScript(({ key, id }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
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
        email: 'design-lab@revision.invalid',
        email_confirmed_at: '2026-09-29T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Founder' },
        identities: [],
        created_at: '2026-09-29T00:00:00.000Z',
        updated_at: '2026-09-29T00:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  await page.route('**/auth/v1/settings**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ external: { google: false } }) })
  })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'design-lab@revision.invalid',
        email_confirmed_at: '2026-09-29T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Founder' },
        identities: [],
        created_at: '2026-09-29T00:00:00.000Z',
        updated_at: '2026-09-29T00:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: isAdmin }),
    })
  })
}

test('admin can use the live Design Lab component canvas and actual app reference', async ({ page }) => {
  await seedSession(page, true)
  await page.goto(designLabPath)

  await expect(page.getByRole('heading', { name: 'Current Revision app' })).toBeVisible()
  await expect(page.locator('.design-lab-runtime-reference-frame')).toHaveCount(2)
  await expect(page.locator('.design-lab-runtime-reference-frame').first()).toHaveAttribute('src', /\?designPreview=1#\/home$/)
  await expect(page.locator('.design-lab-runtime-reference-card[data-preview-theme="light"]')).toHaveCount(1)
  await expect(page.locator('.design-lab-runtime-reference-card[data-preview-theme="dark"]')).toHaveCount(1)

  await page.getByRole('button', { name: 'Course overview' }).click()
  await expect(page.locator('.design-lab-runtime-reference')).toHaveAttribute('data-preview-page', 'course-overview')
  await expect(page.locator('.design-lab-runtime-reference-frame').first()).toHaveAttribute('src', /#\/courses\/aqa%3Aaqa-a-level%3A7132\/overview$/)

  await page.getByRole('button', { name: 'Mobile' }).click()
  await expect(page.locator('.design-lab-runtime-reference-frame-shell[data-viewport="mobile"]')).toHaveCount(2)

  await expect(page.getByRole('heading', { name: 'Revision Design Canvas' })).toBeVisible()

  await page.getByRole('button', { name: 'Dark' }).click()
  await expect(page.locator('.design-lab-runtime')).toHaveAttribute('data-theme', 'dark')

  await expect(page.getByRole('heading', { name: 'Buttons & actions' })).toBeVisible()
  await expect(page.getByText('Approved pattern · shared primitive missing').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Learn blocks' })).toBeVisible()

  await page.getByRole('button', { name: 'Save changes' }).last().click()
  const processingButton = page.getByRole('button', { name: 'Saving changes…' })
  await expect(processingButton).toBeVisible()
  await expect(processingButton).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByText('Your change has been recorded.')).toBeVisible({ timeout: 2500 })

  await page.getByRole('button', { name: 'Open modal' }).click()
  await expect(page.getByRole('dialog', { name: 'Example modal' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Example modal' }).getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog', { name: 'Example modal' })).toHaveCount(0)
})

test('non-admin cannot open the Design Lab', async ({ page }) => {
  await seedSession(page, false)
  await page.goto(designLabPath)

  await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Current Revision app' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Revision Design Canvas' })).toHaveCount(0)
})
