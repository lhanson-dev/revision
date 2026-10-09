import { expect, test, type Locator, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const syntheticUserId = '00000000-0000-4000-8000-000000000001'
const asCourseId = 'aqa:aqa-as:7131'
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function isMobileLayout(page: Page) {
  return (page.viewportSize()?.width ?? 0) <= 960
}

async function seedSyntheticSession(page: Page) {
  const userId = syntheticUserId
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
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
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
        email: 'synthetic-browser-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-21T17:45:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ user_id: userId, course_id: asCourseId, created_at: '2026-08-22T18:00:00.000Z' }]),
    })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_activity_events**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
    })
  })
}

async function expectFocusContained(page: Page, dialog: Locator) {
  await dialog.evaluate((root, selector) => {
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => element.getClientRects().length > 0)
    if (focusable.length < 2) throw new Error('Expected at least two focusable controls in overlay')
    focusable[focusable.length - 1].focus()
  }, focusableSelector)
  await page.keyboard.press('Tab')
  await expect.poll(() => dialog.evaluate((root, selector) => {
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => element.getClientRects().length > 0)
    return document.activeElement === focusable[0]
  }, focusableSelector)).toBe(true)

  await dialog.evaluate((root, selector) => {
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => element.getClientRects().length > 0)
    focusable[0]?.focus()
  }, focusableSelector)
  await page.keyboard.press('Shift+Tab')
  await expect.poll(() => dialog.evaluate((root, selector) => {
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => element.getClientRects().length > 0)
    return document.activeElement === focusable[focusable.length - 1]
  }, focusableSelector)).toBe(true)
}

async function openAccountModal(page: Page) {
  if (isMobileLayout(page)) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await drawer.getByRole('button', { name: /account options$/ }).click()
    await drawer.getByRole('button', { name: 'Profile', exact: true }).click()
  } else {
    await page.getByRole('button', { name: /account menu$/ }).click()
    await page.getByRole('menu', { name: 'Profile menu' }).getByRole('menuitem', { name: 'Profile' }).click()
  }
  return page.getByRole('dialog', { name: 'Account settings' })
}

test('shared learner overlays own initial focus, containment, inertness, Escape and focus return', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Synthetic/ })).toBeVisible()

  const askRevTrigger = (page.viewportSize()?.width ?? 0) > 960
    ? page.locator('.runtime-ask-rev')
    : (page.viewportSize()?.width ?? 0) > 620
      ? page.locator('.ui-rail__ask-rev')
      : page.locator('.ui-tabbar__ask-rev')
  await askRevTrigger.click()

  let dialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('Message REV')).toBeFocused()
  await expect(page.locator('.runtime-screen')).toHaveAttribute('inert', '')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await expectFocusContained(page, dialog)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.runtime-screen')).not.toHaveAttribute('inert', '')
  await expect(askRevTrigger).toBeFocused()

  if (isMobileLayout(page)) {
    const menuTrigger = page.getByRole('button', { name: 'Open menu' })
    await menuTrigger.click()
    dialog = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close menu' })).toBeFocused()
    await expect(page.locator('.runtime-screen')).toHaveAttribute('inert', '')
    await expectFocusContained(page, dialog)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(menuTrigger).toBeFocused()
  }

  dialog = await openAccountModal(page)
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close account window' })).toBeFocused()
  await expect(page.locator('.runtime-screen')).toHaveAttribute('inert', '')
  await expectFocusContained(page, dialog)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.runtime-screen')).not.toHaveAttribute('inert', '')
})

test('the mock exam’s leave panel keeps focus inside the pop-up and hands it back', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(asCourseId)}/exam-prep`)
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()

  const opener = page.locator('.exam-mock').filter({ hasText: /Paper 2 style/ }).first().getByRole('button', { name: 'Start timed' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: /^Mock exam:/ })
  await expect(dialog).toBeVisible()
  await page.getByRole('button', { name: 'Start the clock' }).click()
  await expect(page.getByRole('group', { name: 'Questions' })).toBeVisible()

  // Closing asks first, and focus lands on the safe choice.
  await page.getByRole('button', { name: 'Close mock exam' }).click()
  const leave = page.getByRole('alertdialog', { name: 'Leave this mock?' })
  await expect(leave).toBeVisible()
  await expect(leave.getByRole('button', { name: 'Keep going' })).toBeFocused()
  await expectFocusContained(page, dialog)
  await page.keyboard.press('Escape')
  await expect(leave).toBeVisible()
  await leave.getByRole('button', { name: 'Keep going' }).click()
  await expect(leave).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Close mock exam' })).toBeFocused()

  // Saving and leaving closes the pop-up and focus goes back to the button that opened it.
  await page.getByRole('button', { name: 'Close mock exam' }).click()
  await page.getByRole('alertdialog', { name: 'Leave this mock?' }).getByRole('button', { name: 'Save and leave' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})
