import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000111'
const asCourseId = 'aqa:aqa-as:7131'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

function isResponsiveLayout(page: Page) {
  return (page.viewportSize()?.width ?? 0) <= 960
}

function durationToMs(value: string) {
  if (value.endsWith('ms')) return Number.parseFloat(value)
  if (value.endsWith('s')) return Number.parseFloat(value) * 1000
  return Number.NaN
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
        email: 'interface-system-test@revision.invalid',
        email_confirmed_at: '2026-08-21T22:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Interface' },
        identities: [],
        created_at: '2026-08-21T22:00:00.000Z',
        updated_at: '2026-08-21T22:00:00.000Z',
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
        email: 'interface-system-test@revision.invalid',
        email_confirmed_at: '2026-08-21T22:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Interface' },
        identities: [],
        created_at: '2026-08-21T22:00:00.000Z',
        updated_at: '2026-08-21T22:00:00.000Z',
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

async function openProfile(page: Page) {
  if (isResponsiveLayout(page)) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()

    const drawerStyle = await drawer.evaluate((element) => {
      const style = getComputedStyle(element)
      return { background: style.backgroundColor, shadow: style.boxShadow }
    })
    expect(drawerStyle.background).not.toBe('rgba(0, 0, 0, 0)')
    expect(drawerStyle.shadow).not.toBe('none')

    await drawer.getByRole('button', { name: 'Interface account options' }).click()
    await drawer.getByRole('button', { name: 'Profile', exact: true }).click()
  } else {
    await page.getByRole('button', { name: 'Interface account menu' }).click()
    const menu = page.getByRole('menu', { name: 'Profile menu' })
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS('border-radius', '16px')
    await menu.getByRole('menuitem', { name: 'Profile', exact: true }).click()
  }
}

test('shared interface primitives provide one account and overlay grammar', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Interface,\s*what shall we do today\?/ })).toBeVisible()

  const runtime = page.locator('.planner-runtime')
  const roles = await runtime.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      fontFamily: style.fontFamily,
      space4: style.getPropertyValue('--space-4').trim(),
      standardControl: style.getPropertyValue('--control-height-standard').trim(),
      fieldHeight: style.getPropertyValue('--field-height-standard').trim(),
      fastMotion: style.getPropertyValue('--motion-fast').trim(),
      overlayRadius: style.getPropertyValue('--overlay-radius').trim(),
    }
  })

  expect(roles.fontFamily).toContain('Manrope')
  expect(roles.space4).toBe('16px')
  expect(roles.standardControl).toBe('44px')
  expect(roles.fieldHeight).toBe('48px')
  expect(durationToMs(roles.fastMotion)).toBe(160)
  expect(roles.overlayRadius).toBe('24px')

  await openProfile(page)

  const modal = page.getByRole('dialog', { name: 'Account settings' })
  await expect(modal).toBeVisible()
  await expect(modal).toHaveClass(/ui-overlay-surface/)
  await expect(modal).toHaveCSS('border-radius', '24px')

  const backdrop = page.locator('.ui-overlay-backdrop[aria-label="Close account window"]')
  await expect(backdrop).toHaveCount(1)
  await expect(backdrop).toHaveClass(/ui-overlay-backdrop/)

  const close = modal.getByRole('button', { name: 'Close account window' })
  await expect(close).toHaveClass(/ui-icon-button/)
  const closeBox = await close.boundingBox()
  expect(closeBox?.width).toBe(44)
  expect(closeBox?.height).toBe(44)

  const firstName = modal.getByRole('textbox', { name: /First name/ })
  await expect(firstName).toHaveClass(/ui-field/)

  const save = modal.getByRole('button', { name: 'Save' })
  await expect(save).toHaveClass(/ui-button--primary/)

  await modal.getByRole('button', { name: 'Settings' }).click()
  const appearance = modal.getByRole('group', { name: 'Appearance' })
  await expect(appearance).toHaveClass(/ui-segmented-control/)
  await expect(appearance.getByRole('button', { name: 'Light' })).toHaveClass(/ui-button/)
  await expect(appearance.getByRole('button', { name: 'Dark' })).toHaveClass(/ui-button/)

  const lightStyles = await modal.evaluate((element) => {
    const runtimeElement = element.closest('.planner-runtime')
    const modalStyle = getComputedStyle(element)
    const runtimeStyle = runtimeElement ? getComputedStyle(runtimeElement) : null
    return {
      background: modalStyle.backgroundColor,
      color: modalStyle.color,
      expectedBackground: runtimeStyle?.getPropertyValue('--color-surface-elevated').trim() ?? '',
      expectedColor: runtimeStyle?.getPropertyValue('--color-text').trim() ?? '',
    }
  })

  await appearance.getByRole('button', { name: 'Dark' }).click()
  await expect(runtime).toHaveAttribute('data-theme', 'dark')

  const darkStyles = await modal.evaluate((element) => {
    const runtimeElement = element.closest('.planner-runtime')
    const modalStyle = getComputedStyle(element)
    const runtimeStyle = runtimeElement ? getComputedStyle(runtimeElement) : null
    return {
      background: modalStyle.backgroundColor,
      color: modalStyle.color,
      expectedBackground: runtimeStyle?.getPropertyValue('--color-surface-elevated').trim() ?? '',
      expectedColor: runtimeStyle?.getPropertyValue('--color-text').trim() ?? '',
    }
  })

  expect(darkStyles.background).not.toBe(lightStyles.background)
  expect(darkStyles.color).not.toBe(lightStyles.color)
  expect(darkStyles.expectedBackground).not.toBe(lightStyles.expectedBackground)
  expect(darkStyles.expectedColor).not.toBe(lightStyles.expectedColor)

  await modal.getByRole('button', { name: 'Profile' }).click()
  const darkFirstName = modal.getByRole('textbox', { name: /First name/ })
  await expect(darkFirstName).toBeVisible()

  const fieldStyles = await darkFirstName.evaluate((element) => {
    const runtimeElement = element.closest('.planner-runtime')
    const fieldStyle = getComputedStyle(element)
    const runtimeStyle = runtimeElement ? getComputedStyle(runtimeElement) : null
    return {
      background: fieldStyle.backgroundColor,
      color: fieldStyle.color,
      expectedSurface: runtimeStyle?.getPropertyValue('--color-surface').trim() ?? '',
      expectedText: runtimeStyle?.getPropertyValue('--color-text').trim() ?? '',
    }
  })

  expect(fieldStyles.background).not.toBe('rgb(255, 255, 255)')
  expect(fieldStyles.color).not.toBe('rgb(29, 39, 51)')
  expect(fieldStyles.expectedSurface).toBeTruthy()
  expect(fieldStyles.expectedText).toBeTruthy()
})
