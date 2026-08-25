import { expect, test, type Locator, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const syntheticUserId = '00000000-0000-4000-8000-000000000148'
const asCourseId = 'aqa:aqa-as:7131'

function usesMobileShell(page: Page) {
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
        email: 'b7-final@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: syntheticUserId })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: syntheticUserId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'b7-final@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ user_id: syntheticUserId, course_id: asCourseId, created_at: '2026-08-23T12:00:00.000Z' }]),
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
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}

async function expectNoDockOverlap(dock: Locator, control: Locator) {
  await control.scrollIntoViewIfNeeded()
  const [dockBox, controlBox] = await Promise.all([dock.boundingBox(), control.boundingBox()])
  expect(dockBox).not.toBeNull()
  expect(controlBox).not.toBeNull()
  if (!dockBox || !controlBox) return

  const horizontalOverlap = controlBox.x < dockBox.x + dockBox.width && controlBox.x + controlBox.width > dockBox.x
  const verticalOverlap = controlBox.y < dockBox.y + dockBox.height && controlBox.y + controlBox.height > dockBox.y
  expect(horizontalOverlap && verticalOverlap).toBe(false)
}

test('mobile Ask REV dock leaves ordinary learner actions reachable without overlap', async ({ page }) => {
  test.skip(!usesMobileShell(page), 'Persistent bottom dock is a tablet/mobile contract.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hi Synthetic/ })).toBeVisible()

  const dock = page.locator('.runtime-mobile-ask-rev-dock')
  await expect(dock).toBeVisible()

  const reservedSpace = await page.locator('.runtime-screen').evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingBottom))
  const dockBox = await dock.boundingBox()
  expect(dockBox).not.toBeNull()
  if (dockBox) expect(reservedSpace).toBeGreaterThanOrEqual(dockBox.height + 24)

  await expectNoDockOverlap(dock, page.locator('.living-home-send'))
  const homeButtons = page.locator('.runtime-screen button:visible')
  const count = await homeButtons.count()
  if (count > 0) await expectNoDockOverlap(dock, homeButtons.nth(count - 1))
})

test('active timed exam suppresses the global Ask REV dock', async ({ page }) => {
  test.skip(!usesMobileShell(page), 'Persistent bottom dock is a tablet/mobile contract.')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seedSession(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(asCourseId)}/exam-prep`)
  await expect(page.getByRole('heading', { name: 'Exam technique · AQA AS Business' })).toBeVisible()
  await expect(page.locator('.runtime-mobile-ask-rev-dock')).toBeVisible()

  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 2: Business 2' }).first()
  await paper.locator('summary').click()
  await paper.getByRole('button', { name: 'Start timed exam' }).first().click()

  await expect(page.locator('.exam-session-page')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Exam questions' })).toBeVisible()
  await expect(page.locator('.runtime-mobile-ask-rev-dock')).toBeHidden()
})
