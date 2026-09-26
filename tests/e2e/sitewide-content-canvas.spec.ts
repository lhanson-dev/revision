import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000197'
const courseId = 'aqa:aqa-a-level:7132'

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
        email: 'canvas-test@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
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
        email: 'canvas-test@revision.invalid',
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
        { user_id: userId, course_id: courseId, created_at: '2026-08-23T12:00:00.000Z' },
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

async function pageCanvas(page: Page, hash: string) {
  await page.goto(`${appPath}${hash}`)
  const canvas = page.locator('main.page-screen')
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).toBeTruthy()
  return box!
}

function expectSameHorizontalCanvas(actual: { x: number; width: number }, expected: { x: number; width: number }) {
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(actual.width - expected.width)).toBeLessThanOrEqual(1)
}

test('learner destinations keep one stable horizontal content canvas', async ({ page }) => {
  await seedSession(page)

  const baseline = await pageCanvas(page, '#/home')
  for (const hash of ['#/plan', '#/progress', '#/courses']) {
    const current = await pageCanvas(page, hash)
    expectSameHorizontalCanvas(current, baseline)
  }

  const encodedCourse = encodeURIComponent(courseId)
  for (const section of ['overview', 'learn', 'practice', 'exam-prep', 'progress']) {
    const current = await pageCanvas(page, `#/courses/${encodedCourse}/${section}`)
    expectSameHorizontalCanvas(current, baseline)
  }
})

test('course sections align their body content and Learn does not narrow the top-level article canvas', async ({ page }) => {
  await seedSession(page)
  const encodedCourse = encodeURIComponent(courseId)

  const sectionBoxes: Array<{ x: number; width: number }> = []
  for (const section of ['overview', 'learn', 'practice', 'exam-prep', 'progress']) {
    await page.goto(`${appPath}#/courses/${encodedCourse}/${section}`)
    const sectionContent = page.locator('.paper-section-content').first()
    await expect(sectionContent).toBeVisible()
    const box = await sectionContent.boundingBox()
    expect(box).toBeTruthy()
    sectionBoxes.push(box!)
  }

  for (const box of sectionBoxes.slice(1)) expectSameHorizontalCanvas(box, sectionBoxes[0])

  await page.goto(`${appPath}#/courses/${encodedCourse}/learn`)
  const surface = page.locator('.learn-reading-workspace')
  const article = page.locator('article.learn-reading-page')
  await expect(surface).toBeVisible()
  await expect(article).toBeVisible()

  const surfaceBox = await surface.boundingBox()
  const articleBox = await article.boundingBox()
  expect(surfaceBox && articleBox).toBeTruthy()

  const insets = await surface.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      left: parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft),
      right: parseFloat(style.borderRightWidth) + parseFloat(style.paddingRight),
    }
  })

  const expectedLeft = surfaceBox!.x + insets.left
  const expectedWidth = surfaceBox!.width - insets.left - insets.right
  expect(Math.abs(articleBox!.x - expectedLeft)).toBeLessThanOrEqual(1)
  expect(Math.abs(articleBox!.width - expectedWidth)).toBeLessThanOrEqual(1)
})
