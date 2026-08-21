import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function seedSyntheticSession(page: Page, options: { isAdmin?: boolean } = {}) {
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
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  let firstName = 'Synthetic'
  await page.route('**/auth/v1/user**', async (route) => {
    const method = route.request().method()
    if (method === 'PUT' || method === 'PATCH') {
      const payload = route.request().postDataJSON() as { data?: { first_name?: unknown } }
      if (typeof payload.data?.first_name === 'string' && payload.data.first_name.trim()) {
        firstName = payload.data.first_name.trim()
      }
    }

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
        user_metadata: { first_name: firstName },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-21T17:45:00.000Z',
      }),
    })
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
      body: JSON.stringify({ is_admin: options.isAdmin === true }),
    })
  })
}

function primaryNavigation(page: Page) {
  const viewportWidth = page.viewportSize()?.width ?? 0
  return page.getByRole('navigation', { name: viewportWidth <= 960 ? 'Mobile navigation' : 'Primary navigation' })
}

async function openAskRev(page: Page) {
  const viewportWidth = page.viewportSize()?.width ?? 0
  if (viewportWidth <= 960) {
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Ask REV' }).click()
  } else {
    await page.getByRole('button', { name: 'Ask REV', exact: true }).click()
  }
  await expect(page.getByRole('dialog', { name: 'Ask REV' })).toBeVisible()
}

async function openProfileModal(page: Page) {
  const viewportWidth = page.viewportSize()?.width ?? 0
  if (viewportWidth <= 960) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('complementary', { name: 'Account and additional links' })
    await drawer.getByRole('button', { name: /^Profile/ }).click()
  } else {
    await page.getByRole('button', { name: /account menu$/ }).click()
    await page.getByRole('menu', { name: 'Profile menu' }).getByRole('menuitem', { name: 'Profile' }).click()
  }
  await expect(page.getByRole('dialog', { name: 'Account settings' })).toBeVisible()
}

test('sign-in experience remains usable without horizontal page scrolling', async ({ page }) => {
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Forgot password?' })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('authenticated learner hierarchy keeps persistent Ask REV and shared learning hierarchy usable', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: /Hey Synthetic,\s*what shall we do today\?/ })).toBeVisible()
  await expect(page.getByLabel('Ask REV anything')).toBeVisible()
  await expect(page.locator('.rev-presence-hero')).toHaveCount(1)
  await expect(page.getByText(/Tell me roughly how much revision time is realistically available/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Today’s plan' })).toBeVisible()

  const viewportWidth = page.viewportSize()?.width ?? 0
  const primaryNav = primaryNavigation(page)
  await expect(primaryNav).toBeVisible()
  await expect(primaryNav.getByRole('button')).toHaveCount(viewportWidth <= 960 ? 5 : 4)
  await expect(primaryNav.getByRole('button', { name: /Home/ })).toBeVisible()
  await expect(primaryNav.getByRole('button', { name: /Plan/ })).toBeVisible()
  await expect(primaryNav.getByRole('button', { name: /Progress/ })).toBeVisible()
  await expect(primaryNav.getByRole('button', { name: /Subjects/ })).toBeVisible()

  if (viewportWidth <= 960) {
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
    await expect(primaryNav.getByRole('button', { name: 'Ask REV' })).toBeVisible()
    await expect(primaryNav.locator('svg.nav-icon')).toHaveCount(4)
    await expect(primaryNav.locator('.rev-presence-nav')).toHaveCount(1)

    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('complementary', { name: 'Account and additional links' })
    await expect(drawer.getByRole('button', { name: /^Admin/ })).toHaveCount(0)
    await drawer.getByRole('button', { name: /^Profile/ }).click()
  } else {
    await expect(page.getByRole('complementary', { name: 'Learner navigation' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ask REV', exact: true })).toBeVisible()
    await expect(primaryNav.getByRole('button', { name: /Home/ })).toHaveClass(/active/)

    const accountTrigger = page.getByRole('button', { name: 'Synthetic account menu' })
    await expect(accountTrigger).toBeVisible()
    await expect(page.getByRole('menu', { name: 'Profile menu' })).toHaveCount(0)
    await accountTrigger.click()

    const accountMenu = page.getByRole('menu', { name: 'Profile menu' })
    await expect(accountMenu).toBeVisible()
    await expect(accountMenu.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
    await expect(accountMenu.getByRole('menuitem', { name: 'Settings' })).toBeVisible()
    await expect(accountMenu.getByRole('menuitem', { name: 'Admin' })).toHaveCount(0)
    await expect(accountMenu.getByRole('menuitem', { name: /Upgrade plan/ })).toHaveAttribute('aria-disabled', 'true')
    await expect(accountMenu.getByText('Coming soon')).toBeVisible()
    await expect(accountMenu.getByRole('menuitem', { name: 'Log out' })).toBeVisible()

    await accountMenu.getByRole('menuitem', { name: 'Profile' }).click()
  }

  const accountDialog = page.getByRole('dialog', { name: 'Account settings' })
  await expect(accountDialog).toBeVisible()
  await expect(accountDialog.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await expect(accountDialog.getByRole('region', { name: 'Admin tools' })).toHaveCount(0)
  const firstNameInput = accountDialog.getByLabel('First name')
  await expect(firstNameInput).toHaveValue('Synthetic')
  await firstNameInput.fill('Alex')
  await accountDialog.getByRole('button', { name: 'Save' }).click()
  await expect(accountDialog.getByRole('status')).toHaveText('Name updated.')
  await expect(firstNameInput).toHaveValue('Alex')
  await expect(page.getByRole('heading', { name: /Hey Alex,\s*what shall we do today\?/ })).toBeVisible()

  const accountSections = accountDialog.getByRole('navigation', { name: 'Account sections' })
  await expect(accountSections.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
  await accountSections.getByRole('button', { name: 'Settings' }).click()
  await expect(accountDialog.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(accountDialog.getByRole('group', { name: 'Appearance' }).getByRole('button', { name: 'Light' })).toBeVisible()
  await expect(accountDialog.getByRole('group', { name: 'Appearance' }).getByRole('button', { name: 'Dark' })).toBeVisible()

  if (viewportWidth > 960) {
    const box = await accountDialog.boundingBox()
    const viewport = page.viewportSize()
    expect(box).not.toBeNull()
    expect(viewport).not.toBeNull()
    if (box && viewport) {
      expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(3)
      expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(3)
    }
  }

  await page.keyboard.press('Escape')
  await expect(accountDialog).toHaveCount(0)

  await openAskRev(page)
  const revDialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(revDialog.getByRole('heading', { name: 'Ask REV' })).toBeVisible()
  await expect(revDialog.getByRole('heading', { name: 'How can I help?' })).toBeVisible()
  await expect(revDialog.getByLabel('Talk to REV about your plan')).toBeVisible()
  await expectNoPageOverflow(page)
  await revDialog.getByRole('button', { name: 'Close Ask REV' }).click()

  await primaryNavigation(page).getByRole('button', { name: /Plan/ }).click()
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What matters now' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Set your realistic availability' })).toBeVisible()
  await expectNoPageOverflow(page)

  await openAskRev(page)
  await expect(page.getByRole('dialog', { name: 'Ask REV' }).getByRole('heading', { name: 'How can I help?' })).toBeVisible()
  await page.getByRole('dialog', { name: 'Ask REV' }).getByRole('button', { name: 'Close Ask REV' }).click()

  await primaryNavigation(page).getByRole('button', { name: /Subjects/ }).click()
  await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible()
  const businessCard = page.locator('.subject-card').filter({ hasText: 'Business' }).first()
  await businessCard.getByRole('button', { name: /Open Business/ }).click()

  await expect(page.getByRole('heading', { name: 'Business', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What should I work on in Business?' })).toBeVisible()

  const asCourseCard = page.getByLabel('AQA AS Business')
  const aLevelCourseCard = page.getByLabel('AQA A-level Business')
  await expect(asCourseCard.getByRole('button', { name: 'Open course' })).toBeVisible()
  await expect(aLevelCourseCard.getByRole('button', { name: 'Open course' })).toBeVisible()
  await expect(aLevelCourseCard.getByRole('button', { name: /Open Paper/ })).toHaveCount(0)
  await expectNoPageOverflow(page)

  await asCourseCard.getByRole('button', { name: 'Open course' }).click()
  const asCourseNav = page.getByRole('navigation', { name: 'AQA AS Business navigation' })
  await expect(asCourseNav).toBeVisible()
  await expect(asCourseNav.getByRole('button')).toHaveCount(5)
  await expect(asCourseNav.getByRole('button', { name: 'Overview' })).toBeVisible()
  await expect(asCourseNav.getByRole('button', { name: 'Learn' })).toBeVisible()
  await expect(asCourseNav.getByRole('button', { name: 'Practice' })).toBeVisible()
  await expect(asCourseNav.getByRole('button', { name: 'Exam Prep' })).toBeVisible()
  await expect(asCourseNav.getByRole('button', { name: 'Progress' })).toBeVisible()

  await asCourseNav.getByRole('button', { name: 'Learn' }).click()
  await expect(page.getByRole('heading', { name: 'Learn · AQA AS Business' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Topic notes' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Link topics' })).toBeVisible()
  await expectNoPageOverflow(page)

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Practice' }).click()
  await expect(page.getByRole('heading', { name: 'Practice · AQA AS Business' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Flashcards' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Quick check' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Case study' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Exam question' })).toHaveCount(0)
  await expectNoPageOverflow(page)

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page.getByRole('heading', { name: 'Exam technique · AQA AS Business' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AQA AS Business exam-answer blueprints' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Choose a paper' })).toBeVisible()
  const asPaper2 = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' })
  await expect(asPaper2).toHaveCount(1)
  await asPaper2.locator('summary').click()
  await expect(asPaper2.getByRole('button', { name: 'Practise one question' }).first()).toBeVisible()
  await expect(asPaper2.getByRole('heading', { name: 'Full 90-minute exam' }).first()).toBeVisible()
  await expectNoPageOverflow(page)

  await asPaper2.getByRole('button', { name: 'Start timed exam' }).first().click()
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()
  await expect(page.getByText(/90:00|89:59|89:58/)).toBeVisible()
  await expectNoPageOverflow(page)

  await page.goto(`${appPath}#/subjects/business`)
  await page.getByLabel('AQA A-level Business').getByRole('button', { name: 'Open course' }).click()
  const aLevelNav = page.getByRole('navigation', { name: 'AQA A-level Business navigation' })
  await aLevelNav.getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page.getByRole('heading', { name: 'Choose a paper' })).toBeVisible()
  await expect(page.locator('details.exam-paper-card')).toHaveCount(3)
  await expect(page.getByText('Paper 1: Business 1', { exact: true })).toBeVisible()
  await expect(page.getByText('Paper 2: Business 2', { exact: true })).toBeVisible()
  await expect(page.getByText('Paper 3: Business 3', { exact: true })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('database admin access stays secondary while protected Admin remains reachable', async ({ page }) => {
  await seedSyntheticSession(page, { isAdmin: true })
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Synthetic,\s*what shall we do today\?/ })).toBeVisible()

  const viewportWidth = page.viewportSize()?.width ?? 0
  const primaryNav = primaryNavigation(page)
  await expect(primaryNav.getByRole('button')).toHaveCount(viewportWidth <= 960 ? 5 : 4)
  await expect(primaryNav.getByRole('button', { name: /Admin/ })).toHaveCount(0)

  await openProfileModal(page)
  const accountDialog = page.getByRole('dialog', { name: 'Account settings' })
  await expect(accountDialog.getByRole('region', { name: 'Admin tools' })).toHaveCount(0)
  await accountDialog.getByRole('button', { name: 'Close account window' }).click()

  if (viewportWidth <= 960) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const drawer = page.getByRole('complementary', { name: 'Account and additional links' })
    await expect(drawer.getByRole('button', { name: /^Admin/ })).toBeVisible()
    await expect(drawer.getByRole('button', { name: /Planner assurance/ })).toHaveCount(0)
    await drawer.getByRole('button', { name: /^Admin/ }).click()
  } else {
    await page.getByRole('button', { name: 'Synthetic account menu' }).click()
    const accountMenu = page.getByRole('menu', { name: 'Profile menu' })
    await expect(accountMenu.getByRole('menuitem', { name: 'Admin' })).toBeVisible()
    await accountMenu.getByRole('menuitem', { name: 'Admin' }).click()
  }

  await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()
  await expectNoPageOverflow(page)
})
