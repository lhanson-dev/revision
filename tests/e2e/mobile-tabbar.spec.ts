import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000128'
const courseId = 'aqa:aqa-as:7131'

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


test('desktop gets the sidebar, tablet the icon rail and phone the bottom tab bar with REV raised in the centre', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey CTA\.\s*Here.s what I.d do today\./ })).toBeVisible()

  const width = page.viewportSize()?.width ?? 0
  const nav = page.getByRole('navigation', { name: 'Primary navigation' })
  const rail = page.locator('.ui-rail')
  const tabBar = page.locator('.ui-tabbar')

  if (width > 960) {
    await expect(page.locator('.runtime-sidebar')).toBeVisible()
    await expect(rail).toHaveCount(0)
    await expect(tabBar).toHaveCount(0)
    await expect(nav.getByRole('button')).toHaveText(['Home', 'Plan', 'Progress', 'Courses'])
    return
  }

  // Never a floating Ask REV button any more.
  await expect(page.locator('.runtime-mobile-ask-rev-dock')).toHaveCount(0)

  if (width > 620) {
    await expect(rail).toBeVisible()
    await expect(tabBar).toHaveCount(0)
    expect(Math.round((await rail.boundingBox())?.width ?? 0)).toBe(84)
    await expect(rail.getByRole('button', { name: 'Open menu' })).toBeVisible()
    for (const name of ['Ask REV', 'Home', 'Plan', 'Progress', 'Courses']) {
      await expect(rail.getByRole('button', { name, exact: true })).toBeVisible()
    }
    for (const [index, name] of ['Home', 'Plan', 'Progress', 'Courses'].entries()) {
      await expect(nav.getByRole('button').nth(index)).toHaveAccessibleName(name)
    }
    await expect(nav.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    await nav.getByRole('button', { name: 'Plan' }).click()
    await expect(page).toHaveURL(/#\/plan/)
    await expect(nav.getByRole('button', { name: 'Plan' })).toHaveAttribute('aria-current', 'page')

    // The two-line menu opens the same full left navigation as on a phone.
    await rail.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible()
    return
  }

  await expect(tabBar).toBeVisible()
  await expect(rail).toHaveCount(0)
  expect(await tabBar.evaluate((element) => getComputedStyle(element).position)).toBe('fixed')
  await expect(nav.getByRole('button')).toHaveCount(5)
  await expect(nav.getByRole('button').nth(2)).toHaveAccessibleName('Ask REV') // raised in the centre
  await expect(nav.getByRole('button').nth(0)).toHaveText('Home')
  await expect(nav.getByRole('button').nth(1)).toHaveText('Plan')
  await expect(nav.getByRole('button').nth(3)).toHaveText('Courses')
  await expect(nav.getByRole('button').nth(4)).toHaveText('Progress')
  const revControl = nav.getByRole('button', { name: 'Ask REV' })
  const home = nav.getByRole('button', { name: 'Home' })
  const [revBox, homeBox] = await Promise.all([revControl.boundingBox(), home.boundingBox()])
  expect(revBox).not.toBeNull()
  expect(homeBox).not.toBeNull()
  if (revBox && homeBox) expect(revBox.y).toBeLessThan(homeBox.y) // raised above the other tabs
  await expect(home).toHaveAttribute('aria-current', 'page')

  await nav.getByRole('button', { name: 'Progress' }).click()
  await expect(page).toHaveURL(/#\/progress/)
  await expect(nav.getByRole('button', { name: 'Progress' })).toHaveAttribute('aria-current', 'page')

  // Ask REV opens over the page and takes the whole screen on a phone.
  await revControl.click()
  const panel = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(panel).toBeVisible()
  const panelBox = await panel.boundingBox()
  expect(Math.round(panelBox?.width ?? 0)).toBe(width)
  expect(Math.round(panelBox?.height ?? 0)).toBe(page.viewportSize()?.height)
  await expect(page).toHaveURL(/#\/progress/)
})
