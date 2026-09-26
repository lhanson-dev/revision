import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000194'
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
        email: 'course-nav-test@revision.invalid',
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
        email: 'course-nav-test@revision.invalid',
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
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-23T12:00:00.000Z' }]),
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

function verticalGap(upper: { y: number; height: number }, lower: { y: number }) {
  return lower.y - (upper.y + upper.height)
}

test('desktop course navigation resets hierarchy under course identity and stays compact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hi Synthetic,\s*what shall we do today\?/ })).toBeVisible()

  const primary = page.getByRole('navigation', { name: 'Primary navigation' })
  await primary.getByRole('button', { name: 'Courses', exact: true }).click()

  const homeBox = await primary.getByRole('button', { name: 'Home', exact: true }).boundingBox()
  const planBox = await primary.getByRole('button', { name: 'Plan', exact: true }).boundingBox()
  const progressBox = await primary.getByRole('button', { name: 'Progress', exact: true }).boundingBox()
  const coursesBox = await primary.getByRole('button', { name: 'Courses', exact: true }).boundingBox()
  expect(homeBox && planBox && progressBox && coursesBox).toBeTruthy()
  expect(verticalGap(homeBox!, planBox!)).toBeLessThanOrEqual(8)
  expect(verticalGap(planBox!, progressBox!)).toBeLessThanOrEqual(8)
  expect(verticalGap(progressBox!, coursesBox!)).toBeLessThanOrEqual(8)

  await primary.getByRole('button', { name: 'AQA AS Business', exact: true }).click()
  await primary.getByRole('button', { name: 'AQA AS Business Learn', exact: true }).click()

  const contextual = primary.getByRole('group', { name: 'Courses navigation' })
  const identity = contextual.locator('.runtime-context-nav-course-identity')
  await expect(identity).toContainText('Business')
  await expect(identity).toContainText('AQA')
  await expect(identity).toContainText('7131')

  const sections = contextual.locator('.runtime-context-nav-sections > .runtime-context-nav-section-node > .runtime-context-nav-section')
  await expect(sections).toHaveCount(5)
  expect(await sections.allTextContents()).toEqual(['Overview', 'Learn', 'Practice', 'Exam Prep', 'Progress'])

  const learnNode = contextual.locator('.runtime-context-nav-section-node').nth(1)
  await expect(learnNode.locator('.runtime-context-nav-learn')).toBeVisible()
  await expect(contextual.locator('.runtime-context-nav-section-node').nth(2).locator('.runtime-context-nav-learn')).toHaveCount(0)

  const overviewBox = await sections.nth(0).boundingBox()
  const learnBox = await sections.nth(1).boundingBox()
  const practiceBox = await sections.nth(2).boundingBox()
  expect(overviewBox && learnBox && practiceBox).toBeTruthy()
  expect(verticalGap(overviewBox!, learnBox!)).toBeLessThanOrEqual(8)

  const chapter = learnNode.locator('.runtime-context-nav-learn-chapter-button').first()
  const group = learnNode.locator('.runtime-context-nav-group-button').first()
  const pageRow = learnNode.locator('.runtime-context-nav-learn-page').first()
  const sectionX = (await learnBox!)?.x ?? 0
  const chapterX = (await chapter.boundingBox())?.x ?? 0
  const groupX = (await group.boundingBox())?.x ?? 0
  const pageX = (await pageRow.boundingBox())?.x ?? 0
  expect(chapterX).toBeGreaterThan(sectionX)
  expect(groupX).toBeGreaterThan(chapterX)
  expect(pageX).toBeGreaterThan(groupX)
})
