import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000128'
const courseId = 'aqa:aqa-as:7131'

function isResponsiveLayout(page: Page) {
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
        email: 'ask-rev-cta-test@revision.invalid',
        email_confirmed_at: '2026-08-23T07:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'CTA' },
        identities: [],
        created_at: '2026-08-23T07:30:00.000Z',
        updated_at: '2026-08-23T07:30:00.000Z',
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
        email: 'ask-rev-cta-test@revision.invalid',
        email_confirmed_at: '2026-08-23T07:30:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'CTA' },
        identities: [],
        created_at: '2026-08-23T07:30:00.000Z',
        updated_at: '2026-08-23T07:30:00.000Z',
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
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-23T07:30:00.000Z' }]),
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

test('Ask REV uses one contained, centred living high-contrast CTA across breakpoints', async ({ page }) => {
  await seedSession(page)
  await page.goto(appPath)
  await expect(page.getByRole('heading', { name: /Hey CTA,\s*what shall we do today\?/ })).toBeVisible()

  const askRev = page.getByRole('button', { name: 'Ask REV', exact: true })
  await expect(askRev).toBeVisible()
  await expect(askRev.locator('.rev-presence-nav')).toHaveCount(1)
  await expect(askRev.locator('.rev-living-e .rev-e-bar')).toHaveCount(3)
  await expect(askRev).not.toContainText('✦')

  if (isResponsiveLayout(page)) {
    await expect(askRev).toHaveClass(/runtime-mobile-ask-rev-dock/)
  } else {
    await expect(askRev).toHaveClass(/runtime-ask-rev/)
  }

  const appearance = await askRev.evaluate((element) => {
    const control = getComputedStyle(element)
    const controlRect = element.getBoundingClientRect()
    const presence = element.querySelector('.rev-presence-nav')
    const bar = element.querySelector('.rev-e-bar')
    const halo = element.querySelector('.rev-halo')
    const mark = element.querySelector('.rev-living-e')
    const label = element.querySelector(':scope > span:last-child')
    const presenceStyle = presence ? getComputedStyle(presence) : null
    const barStyle = bar ? getComputedStyle(bar) : null
    const haloStyle = halo ? getComputedStyle(halo) : null
    const haloBeforeStyle = halo ? getComputedStyle(halo, '::before') : null
    const haloAfterStyle = halo ? getComputedStyle(halo, '::after') : null
    const markStyle = mark ? getComputedStyle(mark) : null
    const labelStyle = label ? getComputedStyle(label) : null
    const presenceRect = presence?.getBoundingClientRect()
    const haloRect = halo?.getBoundingClientRect()
    const labelRect = label?.getBoundingClientRect()
    const groupLeft = presenceRect && labelRect ? Math.min(presenceRect.left, labelRect.left) : 0
    const groupRight = presenceRect && labelRect ? Math.max(presenceRect.right, labelRect.right) : 0
    const groupCenter = (groupLeft + groupRight) / 2
    return {
      background: control.backgroundColor,
      color: control.color,
      minHeight: Number.parseFloat(control.minHeight),
      borderRadius: control.borderRadius,
      backdropFilter: control.backdropFilter,
      overflow: control.overflow,
      presenceWidth: presenceStyle?.width ?? '',
      barFill: barStyle?.fill ?? '',
      haloOpacity: Number.parseFloat(haloStyle?.opacity ?? '0'),
      haloAnimation: haloStyle?.animationName ?? '',
      haloDuration: haloStyle?.animationDuration ?? '',
      haloIterations: haloStyle?.animationIterationCount ?? '',
      haloBeforeTop: haloBeforeStyle?.top ?? '',
      haloAfterTop: haloAfterStyle?.top ?? '',
      markAnimation: markStyle?.animationName ?? '',
      markDuration: markStyle?.animationDuration ?? '',
      markIterations: markStyle?.animationIterationCount ?? '',
      labelFontSize: labelStyle?.fontSize ?? '',
      labelHeight: labelRect?.height ?? 0,
      verticalCenterDelta: presenceRect && labelRect
        ? Math.abs((presenceRect.top + presenceRect.height / 2) - (labelRect.top + labelRect.height / 2))
        : Number.POSITIVE_INFINITY,
      groupCenterDelta: presenceRect && labelRect
        ? Math.abs(groupCenter - (controlRect.left + controlRect.width / 2))
        : Number.POSITIVE_INFINITY,
      haloContained: haloRect
        ? haloRect.top >= controlRect.top - 0.5
          && haloRect.right <= controlRect.right + 0.5
          && haloRect.bottom <= controlRect.bottom + 0.5
          && haloRect.left >= controlRect.left - 0.5
        : false,
    }
  })

  expect(appearance.background).toBe('rgb(43, 182, 163)')
  expect(appearance.color).toBe('rgb(19, 32, 38)')
  expect(appearance.barFill).toBe('rgb(255, 255, 255)')
  expect(appearance.haloOpacity).toBeGreaterThan(0.5)
  expect(appearance.haloAnimation).toBe('revCtaRestingBreathe')
  expect(appearance.haloDuration).toBe('5.8s')
  expect(appearance.haloIterations).toBe('infinite')
  expect(appearance.haloBeforeTop).toBe('0px')
  expect(appearance.haloAfterTop).toBe('0px')
  expect(appearance.markAnimation).toBe('revCtaRestingMark')
  expect(appearance.markDuration).toBe('5.8s')
  expect(appearance.markIterations).toBe('infinite')
  expect(appearance.backdropFilter).toBe('none')
  expect(appearance.overflow).toBe('hidden')
  expect(appearance.presenceWidth).toBe('40px')
  expect(appearance.haloContained).toBe(true)
  expect(appearance.labelHeight).toBe(40)
  expect(appearance.verticalCenterDelta).toBeLessThanOrEqual(0.5)
  expect(appearance.groupCenterDelta).toBeLessThanOrEqual(1)

  if (isResponsiveLayout(page)) {
    expect(appearance.minHeight).toBeGreaterThanOrEqual(58)
    expect(appearance.borderRadius).toBe('18px')
    expect(appearance.labelFontSize).toBe('18px')
  } else {
    expect(appearance.minHeight).toBeGreaterThanOrEqual(52)
    expect(appearance.borderRadius).toBe('14px')
    expect(appearance.labelFontSize).toBe('15px')
  }

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reducedMotion = await askRev.evaluate((element) => {
    const halo = element.querySelector('.rev-halo')
    const mark = element.querySelector('.rev-living-e')
    const haloStyle = halo ? getComputedStyle(halo) : null
    const markStyle = mark ? getComputedStyle(mark) : null
    return {
      haloOpacity: Number.parseFloat(haloStyle?.opacity ?? '0'),
      haloAnimation: haloStyle?.animationName ?? '',
      markAnimation: markStyle?.animationName ?? '',
    }
  })
  expect(reducedMotion.haloOpacity).toBeGreaterThan(0.5)
  expect(reducedMotion.haloAnimation).toBe('none')
  expect(reducedMotion.markAnimation).toBe('none')
})
