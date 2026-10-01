import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000128'
const courseId = 'aqa:aqa-as:7131'

function isResponsiveLayout(page: Page) {
  return (page.viewportSize()?.width ?? 0) <= 960
}

async function seedSession(page: Page) {
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
        email: 'ask-rev-cta-test@revision.invalid',
        email_confirmed_at: '2026-08-23T07:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'CTA' },
        identities: [],
        created_at: '2026-08-23T07:30:00.000Z',
        updated_at: '2026-08-23T07:30:00.000Z',
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
        email: 'ask-rev-cta-test@revision.invalid',
        email_confirmed_at: '2026-08-23T07:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'CTA' },
        identities: [],
        created_at: '2026-08-23T07:30:00.000Z',
        updated_at: '2026-08-23T07:30:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-23T07:30:00.000Z' }]),
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


test('phone and tablet get a bottom tab bar for the four main destinations; desktop does not', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey CTA\.\s*Here.s what I.d do today\./ })).toBeVisible()

  const bar = page.getByRole('navigation', { name: 'Quick navigation' })
  if (!isResponsiveLayout(page)) {
    await expect(bar).toBeHidden()
    return
  }

  await expect(bar).toBeVisible()
  await expect(bar.getByRole('button')).toHaveText(['Home', 'Plan', 'Courses', 'Progress'])
  await expect(bar.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  expect(await bar.evaluate((element) => getComputedStyle(element).position)).toBe('fixed')

  await bar.getByRole('button', { name: 'Plan' }).click()
  await expect(page).toHaveURL(/#\/plan/)
  await expect(bar.getByRole('button', { name: 'Plan' })).toHaveAttribute('aria-current', 'page')

  await bar.getByRole('button', { name: 'Progress' }).click()
  await expect(page).toHaveURL(/#\/progress/)
  await expect(bar.getByRole('button', { name: 'Progress' })).toHaveAttribute('aria-current', 'page')

  // The approved wide Ask REV button stays, sitting above the bar without overlapping it.
  const dock = page.locator('.runtime-mobile-ask-rev-dock')
  const [dockBox, barBox] = await Promise.all([dock.boundingBox(), bar.boundingBox()])
  expect(dockBox).not.toBeNull()
  expect(barBox).not.toBeNull()
  if (dockBox && barBox) expect(dockBox.y + dockBox.height).toBeLessThanOrEqual(barBox.y + 0.5)
})
