import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

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
        email: 'synthetic-accessibility-test@revision.invalid',
        email_confirmed_at: '2026-08-19T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
        created_at: '2026-08-19T12:00:00.000Z',
        updated_at: '2026-08-19T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  for (const path of [
    'learning_evidence',
    'revision_assessments',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events',
  ]) {
    await page.route(`**/rest/v1/${path}**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
  }
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
    })
  })
}

async function expectWcagBaseline(page: Page, surface: string) {
  const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  const violations = result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target),
  }))
  expect(violations, `${surface} must have no automated WCAG A/AA violations`).toEqual([])
}

function primaryNavigationName(page: Page) {
  return (page.viewportSize()?.width ?? 0) <= 960 ? 'Mobile navigation' : 'Primary navigation'
}

async function openAskRev(page: Page) {
  if ((page.viewportSize()?.width ?? 0) <= 960) {
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Ask REV' }).click()
  } else {
    await page.getByRole('button', { name: 'Ask REV', exact: true }).click()
  }
  await expect(page.getByRole('dialog', { name: 'Ask REV' })).toBeVisible()
}

test('sign-in meets the automated WCAG A/AA baseline', async ({ page }) => {
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expectWcagBaseline(page, 'Sign in')
})

test('global Home, Plan and Ask REV surfaces meet the automated WCAG A/AA baseline', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Synthetic,\s*what shall we do today\?/ })).toBeVisible()
  await expect(page.getByLabel('Ask REV anything')).toBeVisible()
  await expectWcagBaseline(page, 'Home')

  const primaryNavName = primaryNavigationName(page)
  await page.getByRole('navigation', { name: primaryNavName }).getByRole('button', { name: /Plan/ }).click()
  await expect(page.getByRole('heading', { name: 'Plan' })).toBeVisible()
  await expectWcagBaseline(page, 'Plan')

  await openAskRev(page)
  const revDialog = page.getByRole('dialog', { name: 'Ask REV' })
  await expect(revDialog.getByRole('heading', { name: 'Ask REV' })).toBeVisible()
  await expect(revDialog.getByRole('heading', { name: 'How can I help?' })).toBeVisible()
  await expectWcagBaseline(page, 'Ask REV')
})

test('critical subject, learning, practice, exam and progress journey meets the automated WCAG A/AA baseline', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)

  const primaryNavName = primaryNavigationName(page)
  await page.getByRole('navigation', { name: primaryNavName }).getByRole('button', { name: /Subjects/ }).click()
  await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible()
  await expectWcagBaseline(page, 'Subjects')

  const businessCard = page.locator('.subject-card').filter({ hasText: 'Business' }).first()
  await businessCard.getByRole('button', { name: /Open Business/ }).click()
  await expect(page.getByRole('heading', { name: 'Business', exact: true })).toBeVisible()
  await expectWcagBaseline(page, 'Business subject home')

  await page.getByLabel('AQA AS Business').getByRole('button', { name: 'Open course' }).click()
  const courseNav = page.getByRole('navigation', { name: 'AQA AS Business navigation' })
  await expect(courseNav).toBeVisible()
  await expectWcagBaseline(page, 'AQA AS Business course overview')

  await courseNav.getByRole('button', { name: 'Learn' }).click()
  await expect(page.getByRole('heading', { name: 'Learn · AQA AS Business' })).toBeVisible()
  await expectWcagBaseline(page, 'Learn')

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Practice' }).click()
  await expect(page.getByRole('heading', { name: 'Practice · AQA AS Business' })).toBeVisible()
  await expectWcagBaseline(page, 'Practice')

  await page.getByRole('tab', { name: 'Quick check' }).click()
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeVisible()
  await expectWcagBaseline(page, 'Practice quick check')

  await page.getByRole('navigation', { name: 'AQA AS Business navigation' }).getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page.getByRole('heading', { name: 'Exam technique · AQA AS Business' })).toBeVisible()
  await expectWcagBaseline(page, 'Exam Prep')

  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' })
  await paper.locator('summary').click()
  await expectWcagBaseline(page, 'Expanded exam paper')

  await paper.getByRole('button', { name: 'Start timed exam' }).first().click()
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()
  await expectWcagBaseline(page, 'Timed exam')

  await page.goto(`${appPath}#/subjects/business/courses/aqa%3Aaqa-as%3A7131/progress`)
  await expect(page.getByRole('heading', { name: 'What the evidence says' })).toBeVisible()
  await expectWcagBaseline(page, 'Course Progress')

  await page.getByRole('navigation', { name: primaryNavigationName(page) }).getByRole('button', { name: /Progress/ }).click()
  await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible()
  await expectWcagBaseline(page, 'Global Progress')
})
