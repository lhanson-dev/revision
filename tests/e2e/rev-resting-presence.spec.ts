import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000129'
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
        email: 'rev-resting-presence@revision.invalid',
        email_confirmed_at: '2026-08-23T09:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Presence' },
        identities: [],
        created_at: '2026-08-23T09:00:00.000Z',
        updated_at: '2026-08-23T09:00:00.000Z',
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
        email: 'rev-resting-presence@revision.invalid',
        email_confirmed_at: '2026-08-23T09:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Presence' },
        identities: [],
        created_at: '2026-08-23T09:00:00.000Z',
        updated_at: '2026-08-23T09:00:00.000Z',
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
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-23T09:00:00.000Z' }]),
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

test('Home REV visibly breathes while resting without pretending to process', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey Presence,\s*what shall we do today\?/ })).toBeVisible()

  const presence = page.locator('.living-home-hero .rev-presence-hero')
  await expect(presence).toHaveAttribute('data-state', 'resting')

  const resting = await presence.evaluate((element) => {
    const halo = element.querySelector('.rev-halo')
    const mark = element.querySelector('.rev-living-e')
    const firstBar = element.querySelector('.rev-e-bar-one')
    const haloStyle = halo ? getComputedStyle(halo) : null
    const markStyle = mark ? getComputedStyle(mark) : null
    const barStyle = firstBar ? getComputedStyle(firstBar) : null
    return {
      haloAnimation: haloStyle?.animationName ?? '',
      haloDuration: haloStyle?.animationDuration ?? '',
      haloIterations: haloStyle?.animationIterationCount ?? '',
      haloFilter: haloStyle?.filter ?? '',
      markAnimation: markStyle?.animationName ?? '',
      markDuration: markStyle?.animationDuration ?? '',
      markIterations: markStyle?.animationIterationCount ?? '',
      barAnimation: barStyle?.animationName ?? '',
    }
  })

  expect(resting.haloAnimation).toBe('revHomeRestingHalo')
  expect(resting.haloDuration).toBe('6.4s')
  expect(resting.haloIterations).toBe('infinite')
  expect(resting.haloFilter).not.toBe('none')
  expect(resting.markAnimation).toBe('revHomeRestingMark')
  expect(resting.markDuration).toBe('6.4s')
  expect(resting.markIterations).toBe('infinite')
  expect(resting.barAnimation).toBe('none')

  const prompt = page.getByLabel('Ask REV anything')
  await prompt.focus()
  await expect(presence).toHaveAttribute('data-state', 'listening')

  const listening = await presence.evaluate((element) => {
    const halo = element.querySelector('.rev-halo')
    const firstBar = element.querySelector('.rev-e-bar-one')
    return {
      haloAnimation: halo ? getComputedStyle(halo).animationName : '',
      barAnimation: firstBar ? getComputedStyle(firstBar).animationName : '',
    }
  })
  expect(listening.haloAnimation).toBe('revHaloListen')
  expect(listening.barAnimation).toBe('revListenA')

  await prompt.blur()
  await expect(presence).toHaveAttribute('data-state', 'resting')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = await presence.evaluate((element) => {
    const halo = element.querySelector('.rev-halo')
    const mark = element.querySelector('.rev-living-e')
    const haloStyle = halo ? getComputedStyle(halo) : null
    const markStyle = mark ? getComputedStyle(mark) : null
    return {
      haloAnimation: haloStyle?.animationName ?? '',
      haloOpacity: Number.parseFloat(haloStyle?.opacity ?? '0'),
      markAnimation: markStyle?.animationName ?? '',
    }
  })
  expect(reduced.haloAnimation).toBe('none')
  expect(reduced.markAnimation).toBe('none')
  expect(reduced.haloOpacity).toBeGreaterThan(0.5)
})