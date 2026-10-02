import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000041'
const businessCourseId = 'aqa:aqa-a-level:7132'

async function seedReturningStudent(page: Page) {
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
        email: 'returning-home-test@revision.invalid',
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
        email: 'returning-home-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: businessCourseId, created_at: '2026-08-22T18:00:00.000Z' }]) })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
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
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}

async function expectNoSidewaysScroll(page: Page) {
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1)
}

async function expectNoAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(result.violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(' | ')}`)).toEqual([])
}

async function openAskRev(page: Page) {
  await page.goto(appPath)
  await expect(page.locator('.planner-runtime')).toBeVisible()
  await page.getByRole('button', { name: /^Ask REV/ }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(dialog.getByLabel('Message REV')).toBeFocused()
  return dialog
}

async function ask(dialog: ReturnType<Page['getByRole']>, text: string) {
  await dialog.getByLabel('Message REV').fill(text)
  await dialog.getByRole('button', { name: 'Send' }).click()
}

test('Ask REV is a pop-up that answers "what should I do today?" from the student\'s own data, with its reason and one action', async ({ page }) => {
  await seedReturningStudent(page)
  const dialog = await openAskRev(page)

  // Prompt chips are built only from what is true for this student.
  const chips = dialog.getByRole('group', { name: 'Things you can ask' })
  await expect(chips.getByRole('button', { name: 'What should I do today?' })).toHaveCSS('min-height', '48px')
  await expect(chips.getByRole('button', { name: /^How am I doing in / })).toBeVisible()
  await expect(chips.getByRole('button', { name: 'When are my exams?' })).toHaveCount(0) // no exam dates yet

  await chips.getByRole('button', { name: 'What should I do today?' }).click()
  const log = dialog.getByRole('log', { name: 'Conversation with REV' })
  await expect(log).toContainText('I’d start with')
  await expect(log).toContainText('You said')
  await expect(log).toContainText('REV says')
  await expect(log.getByRole('button', { name: /^Practise / })).toBeVisible()
  await expect(dialog.getByRole('group', { name: 'Things you can ask' })).toHaveCount(0)
  await expect(dialog.getByText('This chat isn’t saved after you close it.')).toBeVisible()

  await expectNoSidewaysScroll(page)
  await expectNoAxeViolations(page)
})

test('REV says honestly when it cannot answer yet, and never makes something up', async ({ page }) => {
  await seedReturningStudent(page)
  const dialog = await openAskRev(page)
  await ask(dialog, 'What is break-even?')
  await expect(dialog.getByRole('log')).toContainText('I can’t answer that one yet')
  await expect(dialog.getByRole('log')).not.toContainText('Break-even is')
  await expectNoAxeViolations(page)
})

test('a student who says they are struggling gets fixed, vetted support text and an offer to carry on, not a plan change or an answer', async ({ page }) => {
  await seedReturningStudent(page)
  const dialog = await openAskRev(page)
  await ask(dialog, 'I am really struggling and can’t cope')
  const log = dialog.getByRole('log')
  await expect(log).toContainText('teacher, a parent or another adult')
  await expect(log).toContainText('0800 1111')
  await expect(log).toContainText('85258')
  await expect(log).toContainText('I’m here to carry on with your revision')
  await expect(dialog.getByText('Apply this change?')).toHaveCount(0)

  await ask(dialog, 'I want to kill myself')
  await expect(log).toContainText('call 999')
  await expectNoAxeViolations(page)
})

test('asking to focus on a course shows what will change and waits for the student to confirm', async ({ page }) => {
  await seedReturningStudent(page)
  const dialog = await openAskRev(page)
  await ask(dialog, 'focus more on Business this week')
  await expect(dialog.getByText('Apply this change?')).toBeVisible()
  await dialog.getByRole('button', { name: 'Keep it as it is' }).click()
  await expect(dialog.getByText('Apply this change?')).toHaveCount(0)
  await expect(dialog.getByRole('log')).toContainText('No change made')
})

test('there is no separate Ask REV page: the old link opens the pop-up over Home, and closing returns to Home', async ({ page }) => {
  await seedReturningStudent(page)
  await page.goto(`${appPath}#/rev`)
  const dialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Expand' })).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Close Ask REV' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/#\/$|#\/home|app\/$/)
  await expect(page.getByRole('heading', { name: /Here.s what I.d do today/ })).toBeVisible()
})

test('on a phone Ask REV fills the screen and never scrolls sideways at 320px', async ({ page }) => {
  await seedReturningStudent(page)
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 })
    const dialog = await openAskRev(page)
    const box = await dialog.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(width - 1)
    await expectNoSidewaysScroll(page)
    await dialog.getByRole('button', { name: 'Close Ask REV' }).click()
  }
})
