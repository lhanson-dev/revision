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
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expectNoPageOverflow(page)
})

test('authenticated learner hierarchy keeps global and course navigation distinct across viewports', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)

  await expect(page.getByRole('heading', { name: /Hi, Synthetic/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What shall we do today?' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Suggest my next step/ })).toBeVisible()

  const viewportWidth = page.viewportSize()?.width ?? 0
  if (viewportWidth <= 960) {
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(mobileNav).toBeVisible()
    await expect(mobileNav.getByRole('button')).toHaveCount(4)
    await expect(mobileNav.getByRole('button', { name: /Home/ })).toBeVisible()
    await expect(mobileNav.getByRole('button', { name: /Subjects/ })).toBeVisible()
    await expect(mobileNav.getByRole('button', { name: /Progress/ })).toBeVisible()
    await expect(mobileNav.getByRole('button', { name: /REV/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  } else {
    const primaryNav = page.getByRole('navigation', { name: 'Primary navigation' })
    await expect(primaryNav).toBeVisible()
    await expect(primaryNav.getByRole('button')).toHaveCount(4)
    await expect(primaryNav.getByRole('button', { name: 'Home' })).toBeVisible()
    await expect(primaryNav.getByRole('button', { name: 'Subjects' })).toBeVisible()
    await expect(primaryNav.getByRole('button', { name: 'Progress' })).toBeVisible()
    await expect(primaryNav.getByRole('button', { name: 'REV' })).toBeVisible()
  }

  await page.getByRole('button', { name: /Suggest my next step/ }).click()
  await expect(page.getByRole('button', { name: /Take me to Business/ })).toBeVisible()
  await expect(page.getByText('This is a coverage recommendation, not a judgement that the topic is weak.').first()).toBeVisible()
  await page.getByRole('button', { name: /Take me to Business/ }).click()

  await expect(page.getByRole('heading', { name: 'Business', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What should I work on in Business?' })).toBeVisible()
  const asCourseCard = page.getByLabel('AQA AS Business')
  await expect(asCourseCard.getByRole('button', { name: 'Open Paper 2' })).toBeVisible()
  await expectNoPageOverflow(page)

  await asCourseCard.getByRole('button', { name: 'Open Paper 2' }).click()
  const paperNav = page.getByRole('navigation', { name: 'Paper 2 navigation' })
  await expect(paperNav).toBeVisible()
  await expect(paperNav.getByRole('button')).toHaveCount(5)
  await expect(paperNav.getByRole('button', { name: 'Overview' })).toBeVisible()
  await expect(paperNav.getByRole('button', { name: 'Learn' })).toBeVisible()
  await expect(paperNav.getByRole('button', { name: 'Practice' })).toBeVisible()
  await expect(paperNav.getByRole('button', { name: 'Exam Prep' })).toBeVisible()
  await expect(paperNav.getByRole('button', { name: 'Progress' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Learn' }).last()).toBeVisible()
  await expectNoPageOverflow(page)

  await paperNav.getByRole('button', { name: 'Learn' }).click()
  await expect(page.getByRole('heading', { name: 'Learn Paper 2' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Topic notes' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Link topics' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Quick check' })).toHaveCount(0)
  await expectNoPageOverflow(page)

  await page.getByRole('navigation', { name: 'Paper 2 navigation' }).getByRole('button', { name: 'Practice' }).click()
  await expect(page.getByRole('heading', { name: 'Practice Paper 2' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Flashcards' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Quick check' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Case study' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Exam question' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start recommended activity' })).toBeVisible()
  await page.getByRole('button', { name: 'Start recommended activity' }).click()
  await expect(page.getByRole('tab', { name: 'Quick check' })).toHaveAttribute('aria-selected', 'true')
  await expectNoPageOverflow(page)

  await page.getByRole('navigation', { name: 'Paper 2 navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page.getByRole('heading', { name: 'Exam Prep · Paper 2' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Exam technique' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Paper 2 answer blueprints' })).toBeVisible()
  await expect(page.getByText('BLT — build analysis')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Full 90-minute Paper 2' })).toBeVisible()
  await expectNoPageOverflow(page)

  await page.getByRole('button', { name: 'Start timed exam' }).click()
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()
  await expect(page.getByText(/90:00|89:59|89:58/)).toBeVisible()
  await expectNoPageOverflow(page)
})
