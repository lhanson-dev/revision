import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const themeKey = 'revision:theme'
const appPath = '/revision/app/'
const asCourseId = 'aqa:aqa-as:7131'
const aLevelCourseId = 'aqa:aqa-a-level:7132'

async function seedSyntheticSession(page: Page) {
  const userId = '00000000-0000-4000-8000-000000000001'
  await page.addInitScript(({ key, id, preferredThemeKey }) => {
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
    if (!localStorage.getItem(preferredThemeKey)) {
      localStorage.setItem(preferredThemeKey, 'light')
    }
  }, { key: storageKey, id: userId, preferredThemeKey: themeKey })

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

async function readThemeSnapshot(page: Page) {
  return page.evaluate(() => {
    const runtime = document.querySelector<HTMLElement>('.planner-runtime')
    const send = document.querySelector<HTMLElement>('.living-home-send')
    if (!runtime || !send) throw new Error('Brand token assurance could not find the learner runtime.')
    const runtimeStyle = getComputedStyle(runtime)
    const sendStyle = getComputedStyle(send)
    return {
      theme: runtime.dataset.theme,
      backgroundColor: runtimeStyle.backgroundColor,
      backgroundImage: runtimeStyle.backgroundImage,
      actionBackground: sendStyle.backgroundColor,
      actionText: sendStyle.color,
    }
  })
}

type MotionState = 'resting' | 'listening' | 'thinking' | 'responding' | 'complete'

async function readMotionSnapshot(page: Page, state: MotionState) {
  return page.evaluate((requestedState) => {
    const runtime = document.querySelector<HTMLElement>('.planner-runtime')
    const template = runtime?.querySelector<HTMLElement>('.rev-presence')
    if (!runtime || !template) throw new Error('REV motion assurance could not find a Living E instance.')

    const clone = template.cloneNode(true) as HTMLElement
    clone.dataset.state = requestedState
    clone.style.position = 'fixed'
    clone.style.left = '-10000px'
    clone.style.top = '0'
    runtime.appendChild(clone)

    const halo = clone.querySelector<HTMLElement>('.rev-halo')
    const firstBar = clone.querySelector<SVGElement>('.rev-e-bar-one')
    const mark = clone.querySelector<SVGElement>('.rev-living-e')
    if (!halo || !firstBar || !mark) throw new Error('REV motion assurance could not find motion elements.')

    const haloStyle = getComputedStyle(halo)
    const barStyle = getComputedStyle(firstBar)
    const markStyle = getComputedStyle(mark)
    const snapshot = {
      haloDuration: haloStyle.animationDuration,
      haloIterations: haloStyle.animationIterationCount,
      barDuration: barStyle.animationDuration,
      barIterations: barStyle.animationIterationCount,
      markDuration: markStyle.animationDuration,
      markIterations: markStyle.animationIterationCount,
    }
    clone.remove()
    return snapshot
  }, state)
}

async function openAskRev(page: Page) {
  await page.getByRole('button', { name: 'Ask REV', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Ask REV' })).toBeVisible()
}

test('central brand roles drive the governed light and dark learner themes', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)
  await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', 'light')

  const light = await readThemeSnapshot(page)
  expect(light.backgroundColor).toBe('rgb(250, 252, 251)')
  expect(light.backgroundImage).toBe('none')
  expect(light.actionBackground).toBe('rgb(43, 182, 163)')
  expect(light.actionText).toBe('rgb(19, 32, 38)')

  await page.evaluate((key) => localStorage.setItem(key, 'dark'), themeKey)
  await page.reload()
  await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', 'dark')

  const dark = await readThemeSnapshot(page)
  expect(dark.backgroundColor).toBe('rgb(15, 32, 36)')
  expect(dark.backgroundImage).toBe('none')
  expect(dark.actionBackground).toBe('rgb(43, 182, 163)')
  expect(dark.actionText).toBe('rgb(19, 32, 38)')
})

test('REV motion uses governed timings, genuine listening state and reduced-motion fallback', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)

  expect(await readMotionSnapshot(page, 'resting')).toMatchObject({
    haloDuration: '7s',
    haloIterations: 'infinite',
  })
  expect(await readMotionSnapshot(page, 'listening')).toMatchObject({
    haloDuration: '1.5s',
    haloIterations: 'infinite',
    barDuration: '1.5s',
    barIterations: 'infinite',
  })
  expect(await readMotionSnapshot(page, 'thinking')).toMatchObject({
    haloDuration: '1.8s',
    haloIterations: 'infinite',
    barDuration: '1.8s',
    barIterations: 'infinite',
  })
  expect(await readMotionSnapshot(page, 'responding')).toMatchObject({
    haloDuration: '0.8s',
    haloIterations: '1',
    barDuration: '0.8s',
    barIterations: '1',
  })
  expect(await readMotionSnapshot(page, 'complete')).toMatchObject({
    haloDuration: '0.85s',
    haloIterations: '1',
    markDuration: '0.85s',
    markIterations: '1',
  })

  await openAskRev(page)
  const revInput = page.getByRole('dialog', { name: 'Ask REV' }).getByLabel('Talk to REV about your plan')
  await expect(revInput).toBeVisible()
  await revInput.focus()
  await expect(page.locator('.runtime-rev-panel .rev-presence-conversation')).toHaveAttribute('data-state', 'listening')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedMotion = await page.locator('.runtime-rev-panel .rev-presence-conversation .rev-halo').evaluate((halo) => {
    const style = getComputedStyle(halo)
    return { name: style.animationName, duration: style.animationDuration }
  })
  expect(reducedMotion.name).toBe('none')
  expect(reducedMotion.duration).toBe('0s')
})
