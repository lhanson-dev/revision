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
  await expect(page.locator('.rev-suggestion-card__primary')).toBeVisible()
  return page.evaluate(() => {
    const runtime = document.querySelector<HTMLElement>('.planner-runtime')
    const send = document.querySelector<HTMLElement>('.rev-suggestion-card__primary')
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

type MotionState = 'resting' | 'listening' | 'thinking' | 'responding'

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
  expect(light.actionText).toBe('rgb(19, 32, 38)') // canonical Graphite Ink on Primary Teal

  await page.evaluate((key) => localStorage.setItem(key, 'dark'), themeKey)
  await page.reload()
  await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', 'dark')

  const dark = await readThemeSnapshot(page)
  expect(dark.backgroundColor).toBe('rgb(15, 32, 36)')
  expect(dark.backgroundImage).toBe('none')
  expect(dark.actionBackground).toBe('rgb(43, 182, 163)')
  expect(dark.actionText).toBe('rgb(19, 32, 38)') // same semantic contrast in Dark
})

test('REV motion uses governed timings, genuine listening state and reduced-motion fallback', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)
  await expect(page.locator('.planner-runtime')).toBeVisible()

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
    haloDuration: '1.4s',
    haloIterations: 'infinite',
    barDuration: '1.4s',
    barIterations: 'infinite',
  })
  expect(await readMotionSnapshot(page, 'responding')).toMatchObject({
    haloDuration: '0.8s',
    haloIterations: '1',
    barDuration: '0.8s',
    barIterations: '1',
  })

  await openAskRev(page)
  const revInput = page.getByRole('dialog', { name: 'Ask REV' }).getByLabel('Message REV')
  await expect(revInput).toBeVisible()
  // Listening means the student is typing: focusing the box alone is not enough.
  await revInput.focus()
  await revInput.pressSequentially('hi')
  await expect(page.locator('.runtime-rev-panel .rev-presence')).toHaveAttribute('data-state', 'listening')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedMotion = await page.locator('.runtime-rev-panel .rev-presence .rev-halo').evaluate((halo) => {
    const style = getComputedStyle(halo)
    return { name: style.animationName, duration: style.animationDuration }
  })
  expect(reducedMotion.name).toBe('none')
  expect(reducedMotion.duration).toBe('0s')
})
test('Ask REV messages use canonical semantic roles in both themes', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)
  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') {
      await page.evaluate((key) => localStorage.setItem(key, 'dark'), themeKey)
      await page.reload()
    }
    await openAskRev(page)
    const dialog = page.getByRole('dialog', { name: 'Ask REV' })
    const styles = await dialog.evaluate((element) => {
      const chat = element.querySelector<HTMLElement>('.rev-chat')
      const response = element.querySelector<HTMLElement>('.rev-chat__message--rev')
      const input = element.querySelector<HTMLElement>('.rev-chat__input')
      const chip = element.querySelector<HTMLElement>('.rev-chat__chip')
      if (!chat || !response || !input || !chip) throw new Error('Canonical REV chat specimen missing')
      const role = (name: string) => getComputedStyle(element).getPropertyValue(name).trim()
      const backgroundForRole = (name: string) => {
        const probe = document.createElement('span')
        probe.style.backgroundColor = `var(${name})`
        element.appendChild(probe)
        const value = getComputedStyle(probe).backgroundColor
        probe.remove()
        return value
      }
      return {
        revBackground: getComputedStyle(response).backgroundColor,
        expectedRevBackground: backgroundForRole('--color-inverse-action'),
        inputBackground: getComputedStyle(input).backgroundColor,
        expectedInputBackground: backgroundForRole('--color-surface'),
        chipBackground: getComputedStyle(chip).backgroundColor,
        expectedChipBackground: backgroundForRole('--color-surface'),
        inputFocusRole: role('--focus-ring'),
      }
    })
    expect(styles.revBackground).toBe(styles.expectedRevBackground)
    expect(styles.inputBackground).toBe(styles.expectedInputBackground)
    expect(styles.chipBackground).toBe(styles.expectedChipBackground)
    expect(styles.inputFocusRole).not.toBe('')
    await dialog.getByRole('button', { name: 'Close Ask REV' }).click()
  }
})

test('five learning-status colours survive legacy token retirement in Light and Dark', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)

  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') {
      await page.evaluate((key) => localStorage.setItem(key, 'dark'), themeKey)
      await page.reload()
    }
    await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', theme)
    const palette = await page.locator('.planner-runtime').evaluate((runtime) => {
      const resolved = (role: string) => {
        const probe = document.createElement('span')
        probe.style.backgroundColor = `var(${role})`
        runtime.appendChild(probe)
        const value = getComputedStyle(probe).backgroundColor
        probe.remove()
        return value
      }
      return {
        gotit: resolved('--learning-status-gotit'),
        nearly: resolved('--learning-status-nearly'),
        needswork: resolved('--learning-status-needswork'),
        gotitTint: resolved('--learning-status-gotit-tint'),
        nearlyTint: resolved('--learning-status-nearly-tint'),
        needsworkTint: resolved('--learning-status-needswork-tint'),
        notstarted: resolved('--learning-status-notstarted'),
      }
    })
    expect(palette).toEqual({
      gotit: 'rgb(43, 182, 163)',
      nearly: 'rgb(255, 197, 61)',
      needswork: 'rgb(255, 122, 89)',
      gotitTint: theme === 'light' ? 'rgb(226, 243, 239)' : 'rgb(22, 52, 48)',
      nearlyTint: theme === 'light' ? 'rgb(255, 241, 201)' : 'rgb(55, 45, 20)',
      needsworkTint: theme === 'light' ? 'rgb(255, 231, 223)' : 'rgb(59, 35, 29)',
      notstarted: theme === 'light' ? 'rgb(221, 232, 228)' : 'rgb(35, 54, 57)',
    })
  }
})

test('shared selection and progress roles match approved Light/Dark appearance', async ({ page }) => {
  await seedSyntheticSession(page)
  await page.goto(appPath)

  for (const theme of ['light', 'dark'] as const) {
    if (theme === 'dark') {
      await page.evaluate((key) => localStorage.setItem(key, 'dark'), themeKey)
      await page.reload()
    }
    await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', theme)
    const rendered = await page.locator('.planner-runtime').evaluate((runtime) => {
      const stylesFor = (classes: string) => {
        const element = document.createElement('div')
        element.className = classes
        runtime.appendChild(element)
        const style = getComputedStyle(element)
        const result = { background: style.backgroundColor, text: style.color }
        element.remove()
        return result
      }
      return {
        selectedNav: stylesFor('ui-shell-nav__item is-active'),
        selectedTab: stylesFor('ui-tabbar__item is-active'),
        tag: stylesFor('ui-tag'),
        track: stylesFor('ui-hue-bar__track'),
      }
    })
    const surface = theme === 'light' ? 'rgb(226, 243, 239)' : 'rgb(22, 52, 48)'
    const ink = theme === 'light' ? 'rgb(15, 122, 109)' : 'rgb(82, 214, 194)'
    const track = theme === 'light' ? 'rgb(221, 232, 228)' : 'rgb(35, 54, 57)'
    expect(rendered.selectedNav).toMatchObject({ background: surface, text: ink })
    expect(rendered.selectedTab.text).toBe(ink)
    expect(rendered.tag).toMatchObject({ background: surface, text: ink })
    expect(rendered.track.background).toBe(track)
  }
})
