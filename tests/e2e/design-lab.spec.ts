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

test('admin can use the live Design Lab component canvas', async ({ page }) => {
  await seedSession(page, true)
  await page.goto(designLabPath)

  await expect(page.getByRole('heading', { name: 'Revision Design Canvas' })).toBeVisible()

  await page.getByRole('button', { name: 'Dark' }).click()
  await expect(page.locator('.design-lab-runtime')).toHaveAttribute('data-theme', 'dark')

  const revStateFamily = page.getByRole('heading', { name: 'REV state family' }).locator('..').locator('..')
  await expect(revStateFamily.locator('.rev-presence')).toHaveCount(4)
  await expect(revStateFamily).toContainText('Resting')
  await expect(revStateFamily).toContainText('Listening')
  await expect(revStateFamily).toContainText('Thinking')
  await expect(revStateFamily).toContainText('Responding')

  await expect(page.getByText('28px', { exact: true })).toBeVisible()
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

test('Design Lab projects production REV, progress, status and typography in both themes', async ({ page }) => {
  await seedSession(page, true)
  await page.goto(designLabPath)

  await expect(page.locator('.rev-suggestion-card')).toHaveCount(1)
  await expect(page.locator('.rev-suggestion-card__title')).toHaveText('Practise price elasticity')
  await expect(page.locator('.ui-progress-measures')).toHaveCount(1)
  await expect(page.locator('.ui-status-badge')).toHaveCount(5)
  await expect(page.locator('.design-lab-tag-cloud .ui-tag')).toHaveText('REV pick')
  await expect(page.locator('.design-lab-family')).toHaveCount(0)
  await expect(page.getByText('Revision Plus')).toHaveCount(0)

  for (const theme of ['light', 'dark'] as const) {
    await page.getByRole('button', { name: theme === 'light' ? 'Light' : 'Dark' }).click()
    await expect(page.locator('.design-lab-runtime')).toHaveAttribute('data-theme', theme)
    const appearance = await page.evaluate(() => {
      const style = (selector: string) => getComputedStyle(document.querySelector(selector)!)
      return {
        heading: { family: style('.design-lab-type-h1').fontFamily, weight: style('.design-lab-type-h1').fontWeight, size: parseFloat(style('.design-lab-type-h1').fontSize) },
        rev: style('.rev-suggestion-card').backgroundColor,
        status: style('.ui-status-badge--gotit').backgroundColor,
        track: style('.ui-hue-bar__track').backgroundColor,
        expectedH1: Math.min(46, Math.max(34, window.innerWidth * .024 + 18)),
      }
    })
    expect(appearance.heading.family).toContain('Bricolage')
    expect(appearance.heading.weight).toBe('800')
    expect(appearance.heading.size).toBeCloseTo(appearance.expectedH1, 0)
    expect(appearance.rev).not.toBe('rgba(0, 0, 0, 0)')
    expect(appearance.status).not.toBe('rgba(0, 0, 0, 0)')
    expect(appearance.track).not.toBe('rgba(0, 0, 0, 0)')
  }
})

test('Design Lab course specimens project production CourseIdentity without duplicate navigation', async ({ page }) => {
  await seedSession(page, true)
  await page.goto(designLabPath)

  const specimens = page.locator('.design-lab-course-identity-specimens')
  await expect(specimens.locator('.ui-course-identity--header')).toHaveCount(1)
  await expect(specimens.locator('.ui-course-identity--compact')).toHaveCount(1)
  await expect(specimens.locator('.ui-subject-badge')).toHaveCount(2)
  await expect(specimens.locator('.ui-course-identity--header h1')).toHaveText('Business')
  await expect(specimens.locator('.ui-course-identity--compact strong')).toHaveText('Business')
  await expect(specimens.getByText('AQA A-level · 7132')).toHaveCount(2)
  await expect(page.getByRole('heading', { name: 'Route-scoped navigation ownership' })).toBeVisible()

  // The Lab must not draw a misleading parallel course header, nav tree or inactive tabs.
  await expect(page.locator('.design-lab-nav-tree, .design-lab-course-header, .design-lab-course-tabs, .design-lab-next-step')).toHaveCount(0)

  for (const theme of ['light', 'dark'] as const) {
    await page.getByRole('button', { name: theme === 'light' ? 'Light' : 'Dark' }).click()
    const style = await specimens.locator('.ui-course-identity--header h1').evaluate((element) => {
      const computed = getComputedStyle(element)
      return { font: computed.fontFamily, weight: computed.fontWeight, color: computed.color }
    })
    expect(style.font).toContain('Bricolage')
    expect(style.weight).toBe('800')
    expect(style.color).not.toBe('rgba(0, 0, 0, 0)')
  }
})

test('Design Lab shows the live unscored Quick Check without a fake exam simulator', async ({ page }) => {
  await seedSession(page, true)
  await page.goto(designLabPath)

  const check = page.locator('.ui-quick-check')
  await expect(check).toHaveCount(1)
  await expect(check.getByText('Not scored')).toBeVisible()
  await check.getByRole('button', { name: /A group of customers with similar needs/ }).click()
  await expect(check.getByText(/This doesn’t count towards your progress/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Exam Prep versus focused exam' })).toBeVisible()
  await expect(page.locator('.exam-simulator, .design-lab-next-step')).toHaveCount(0)
})

test('non-admin cannot open the Design Lab', async ({ page }) => {
  await seedSession(page, false)
  await page.goto(designLabPath)

  await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Revision Design Canvas' })).toHaveCount(0)
})
