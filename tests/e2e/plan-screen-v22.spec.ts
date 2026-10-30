import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { appPath, defaultSessions, plannedRow, seedPlanStudent } from './plan-seed'

/**
 * Plan redesign v2.2: Day / Week / Month, with the view and date kept in the address.
 * Viewport sizes are set inside each test, so the whole file runs once (desktop project).
 */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'sets its own viewport sizes')
})

const shotDir = process.env.PLAN_SHOT_DIR
const routes = [
  { name: 'plan', hash: '#/plan' },
  { name: 'plan-week', hash: '#/plan?view=week&date=2026-10-05' },
  { name: 'plan-month', hash: '#/plan?view=month&date=2026-10-05' },
] as const
const shotSizes = [[1440, 900], [900, 1100], [390, 844]] as const
const scrollWidths = [1440, 960, 620, 390, 320] as const

async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}

async function openPlan(page: Page, hash: string, width = 1440, height = 900) {
  await page.setViewportSize({ width, height })
  await seedPlanStudent(page)
  await page.goto(`${appPath}${hash}`)
  await expect(page.locator('.pln-summary')).toBeVisible()
}

for (const route of routes) {
  for (const [width, height] of shotSizes) {
    test(`screenshot ${route.name} at ${width}`, async ({ page }) => {
      await openPlan(page, route.hash, width, height)
      await page.mouse.move(0, 0)
      if (shotDir) await page.screenshot({ path: `${shotDir}/${route.name}-${width}.png`, fullPage: true })
    })
  }
  for (const width of scrollWidths) {
    test(`no sideways scroll on ${route.name} at ${width}`, async ({ page }) => {
      await openPlan(page, route.hash, width, 900)
      await noSidewaysScroll(page)
    })
  }
}

test('Plan title stays clear while date navigation retains the selected period and route', async ({ page }) => {
  await openPlan(page, '#/plan')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  expect(page.url()).toContain('#/plan?view=week&date=2026-10-12')
  await page.getByRole('button', { name: 'Previous week' }).click()
  await page.getByRole('button', { name: 'Previous week' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  await page.getByRole('button', { name: 'This week' }).click()
  await page.getByRole('button', { name: 'Month', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  expect(page.url()).toContain('view=month')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  await expect(page.getByRole('button', { name: 'Month', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('summary describes recorded completion without implying mastery or measured study time', async ({ page }) => {
  await openPlan(page, '#/plan')
  const summary = page.locator('.pln-summary')
  await expect(summary).toContainText('activities completed')
  // Programme-derived work changes as evidenced treatment needs change.
  // Unit/domain tests own minute arithmetic; the UI must show a truthful
  // dynamic total instead of an obsolete fixed 8-topic allocation.
  await expect(summary.locator('.pln-summary__time')).toContainText(/\d+ of \d+/)
  await expect(summary.locator('.pln-summary__track')).toBeVisible()
})

test('day strip is a keyboard tablist: arrows move and select, Home and End jump', async ({ page }) => {
  await openPlan(page, '#/plan?view=day&date=2026-10-05')
  const today = page.getByRole('tab', { name: /^Today, Monday 5 October/ })
  await expect(today).toHaveAttribute('aria-selected', 'true')
  await today.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /^Tuesday 6 October/ })).toBeFocused()
  await expect(page.getByRole('tab', { name: /^Tuesday 6 October/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Tue 6 Oct')
  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: /^Sunday 11 October/ })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: /^Sunday 11 October/ })).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.getByRole('tab', { name: /^Today, Monday 5 October/ })).toBeFocused()
  expect(page.url()).toContain('date=2026-10-05')
  // Only the selected tab is a tab stop.
  await expect(page.locator('.pln-tab[tabindex="0"]')).toHaveCount(1)
})

test('date picker opens from the label, moves with arrows, picks with Enter, closes with Escape', async ({ page }) => {
  await openPlan(page, '#/plan')
  const label = page.getByRole('button', { name: /Choose a date/ })
  await label.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Go to date' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /^Monday 5 October 2026/ })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  await expect(dialog.getByRole('button', { name: /^Tuesday 13 October 2026/ })).toBeFocused()
  await page.keyboard.press('PageDown')
  await expect(dialog.getByRole('button', { name: /^Friday 13 November 2026/ })).toBeFocused()
  await expect(dialog).toContainText('November 2026')
  await page.keyboard.press('Enter')
  await expect(dialog).toHaveCount(0)
  await expect(label).toBeFocused()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  expect(page.url()).toContain('date=2026-11-13')

  await page.keyboard.press('Enter')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(label).toBeFocused()
})

test('week view stacks seven days; tapping a day opens it in Day view', async ({ page }) => {
  await openPlan(page, '#/plan?view=week&date=2026-10-05')
  await expect(page.locator('.pln-weekgroup')).toHaveCount(7)
  await page.getByRole('button', { name: 'Open Wednesday 7 October' }).click()
  await expect(page.getByRole('button', { name: 'Day', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Wed 7 Oct')
  expect(page.url()).toContain('view=day&date=2026-10-07')
})

test('phone Week agenda rows use available width and management stays compact', async ({ page }) => {
  await openPlan(page, '#/plan?view=week&date=2026-10-05', 390, 844)
  const today = page.locator('.pln-weekgroup[data-today]')
  const activity = today.locator('.pln-row').first()
  await expect(activity).toBeVisible()
  const todayBox = await today.boundingBox()
  const activityBox = await activity.boundingBox()
  expect(todayBox).not.toBeNull()
  expect(activityBox).not.toBeNull()
  expect(activityBox!.width).toBeGreaterThan(todayBox!.width * 0.78)
  const study = await page.getByRole('button', { name: 'Study time', exact: true }).boundingBox()
  const exams = await page.getByRole('button', { name: 'Exam dates', exact: true }).boundingBox()
  expect(study).not.toBeNull()
  expect(exams).not.toBeNull()
  expect(Math.abs(study!.y - exams!.y)).toBeLessThan(3)
  await noSidewaysScroll(page)
})

test('month view: Monday-first grid, exam day in solid subject colour with its letter mark, tap opens Day', async ({ page }) => {
  await openPlan(page, '#/plan?view=month&date=2026-10-05')
  const cells = page.locator('.pln-cell')
  await expect(cells).toHaveCount(35)
  await expect(cells.first()).toHaveAccessibleName(/Monday 28 September/)
  await expect(cells.first()).toHaveAttribute('data-outside', 'true')
  const exam = page.getByRole('button', { name: /Thursday 22 October, Business exam/ })
  await expect(exam).toContainText('B exam')
  await expect(exam).toHaveCSS('background-color', 'rgb(35, 107, 207)')
  await exam.click()
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Thu 22 Oct')
  await expect(page.locator('.pln-row--exam')).toContainText('Paper 1: Business 1')
  await expect(page.locator('.pln-row--exam')).toContainText('Exam day · in 17 days')
})

test('rows: Up next for the first actionable commitment today, Start for the rest, done is muted with a tick', async ({ page }) => {
  await openPlan(page, '#/plan?view=day&date=2026-10-05')
  const list = page.locator('.pln-list')
  await expect(list.getByRole('button', { name: /^Up next/ })).toHaveCount(1)
  await expect(list.getByRole('button', { name: /^Start/ }).first()).toBeVisible()
  const done = page.locator('.pln-row[data-done]')
  await expect(done).toContainText('Done')
  await expect(done.locator('.pln-row__mark')).toHaveCSS('opacity', '0.45')
  await expect(page.getByText('REV pick')).toHaveCount(0)
  await expect(page.getByText(/REV suggests|Weekly goal/i)).toHaveCount(0)
})

test('study time: steppers change in 15 minutes, 0 is Rest, save calls the planner and keeps done sessions', async ({ page }) => {
  await openPlan(page, '#/plan')
  await page.getByRole('button', { name: 'Study time', exact: true }).click()
  const less = page.getByRole('button', { name: 'Less study time on Sunday' })
  await expect(less).toBeDisabled()
  await page.getByRole('button', { name: 'More study time on Sunday' }).click()
  await expect(page.locator('.pln-study__row').last()).toContainText('15m')
  await page.getByRole('button', { name: 'Less study time on Sunday' }).click()
  await expect(page.locator('.pln-study__row').last()).toContainText('Rest')
  await page.getByRole('button', { name: 'More study time on Saturday' }).click()
  await page.getByRole('button', { name: 'Save and re-plan' }).click()
  await expect(page.getByText(/Study time saved/)).toBeVisible()
  await expect(page.locator('.pln-card__total')).toHaveText('6h a week')
  await expect(page.locator('.pln-row[data-done]')).toHaveCount(1)
})

test('add session puts a session of the student’s choosing on the day being shown', async ({ page }) => {
  await openPlan(page, '#/plan?view=day&date=2026-10-05')
  await page.getByRole('button', { name: 'Add session' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add a session' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Topic').selectOption('hr')
  await dialog.getByRole('button', { name: 'Add to plan' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Today')
  await expect(page.locator('.pln-row[data-kind="session"]').filter({ hasText: 'Business · HR' })).toHaveCount(1)
})

test('with no sessions table and no exams the screen stays quiet and honest', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seedPlanStudent(page, { sessions: null, withExams: false, withAvailability: false })
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan')
  await expect(page.getByText('Your plan is waiting on you')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add session' })).toHaveCount(0)
  await expect(page.getByText(/learner_planned_sessions|does not exist/i)).toHaveCount(0)
  await expect(page.locator('.pln-empty, .pln-summary')).toHaveCount(0)
  await expect(page.getByText(/No exam dates added yet/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add your exams' })).toBeVisible()
  await page.getByRole('button', { name: 'Study time', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Save study time' })).toBeVisible()
  await noSidewaysScroll(page)
})

test('missing study time leads with the one required step and does not invent weekly capacity', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: true, withAvailability: false })
  await page.goto(`${appPath}#/plan`)
  const setup = page.getByLabel('Finish setting up your plan')
  await expect(setup).toContainText('Add your study time and REV will plan what fits your week.')
  await expect(setup.getByRole('button', { name: 'Set study time' })).toBeVisible()
  await expect(setup.getByRole('button', { name: 'Add your exams' })).toHaveCount(0)
  await expect(page.locator('.pln-summary, .pln-empty')).toHaveCount(0)
  await expect(page.locator('.pln-programme-disclosure > summary')).toBeVisible()
  await setup.getByRole('button', { name: 'Set study time' }).click()
  await expect(page.getByRole('button', { name: 'Save study time' })).toBeVisible()
  await noSidewaysScroll(page)
})

test('accepted learner sessions stay visible when exam dates and availability are missing', async ({ page }) => {
  await seedPlanStudent(page, {
    withExams: false,
    withAvailability: false,
    sessions: [plannedRow('manual-existing', '2026-10-05', 'finance')],
  })
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByLabel('Finish setting up your plan')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Week', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.pln-row[data-kind="session"]').filter({ hasText: 'Finance' })).toHaveCount(1)
  await noSidewaysScroll(page)
})

test('explicit Plan deep links remain navigable without setup', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false, withAvailability: false })
  await page.goto(`${appPath}#/plan?view=month&date=2026-11-01`)
  await expect(page.getByRole('button', { name: 'Month', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.pln-month')).toBeVisible()
  await expect(page.getByLabel('Finish setting up your plan')).toBeVisible()
  await noSidewaysScroll(page)
})

test('future weeks show only what the planner returns, never invented sessions', async ({ page }) => {
  await openPlan(page, '#/plan?view=week&date=2027-03-01')
  await expect(page.locator('.pln-list')).toHaveCount(0)
  await expect(page.locator('.pln-empty')).toHaveCount(7)
  await expect(page.locator('.pln-summary')).toContainText('No activities planned')
})

test.describe('data sanity', () => {
  test('default seed has done and planned sessions', () => {
    expect(defaultSessions().filter((row) => row.status === 'done')).toHaveLength(3)
  })
})

for (const route of routes) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${route.name} meets the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme })
      await openPlan(page, route.hash, 1440, 900)
      await page.getByRole('button', { name: /Choose a date/ }).click()
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([])
    })
  }
}

test('Day from this week selects 29 October rather than the 1 November week anchor', async ({ page }) => {
  await seedPlanStudent(page)
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12))
  await page.goto(`${appPath}#/plan?view=week&date=2026-11-01`)
  await expect(page.locator('.pln-summary')).toBeVisible()

  await page.getByRole('button', { name: 'Day', exact: true }).click()
  expect(page.url()).toContain('view=day&date=2026-10-29')
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Today')
  await expect(page.getByRole('button', { name: /Choose a date/ })).toContainText('Thursday 29 October 2026')
  await expect(page.getByRole('button', { name: 'Next day' })).toBeVisible()

  await page.getByRole('button', { name: 'Next day' }).click()
  expect(page.url()).toContain('view=day&date=2026-10-30')
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Fri 30 Oct')
  await page.getByRole('button', { name: 'Next day' }).click()
  await page.getByRole('button', { name: 'Next day' }).click()
  expect(page.url()).toContain('view=day&date=2026-11-01')
  await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  expect(page.url()).toContain('view=day&date=2026-10-29')
})

test('Day from this month starts today, while deliberately browsed November stays in November', async ({ page }) => {
  await seedPlanStudent(page)
  await page.clock.setFixedTime(new Date(2026, 9, 29, 12))
  await page.goto(`${appPath}#/plan?view=month&date=2026-10-01`)
  await expect(page.locator('.pln-summary')).toBeVisible()
  await page.getByRole('button', { name: 'Day', exact: true }).click()
  expect(page.url()).toContain('view=day&date=2026-10-29')

  await page.goto(`${appPath}#/plan?view=month&date=2026-11-01`)
  await expect(page.locator('.pln-month')).toBeVisible()
  await page.getByRole('button', { name: 'Day', exact: true }).click()
  expect(page.url()).toContain('view=day&date=2026-11-01')
  await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeVisible()
})

test('Week highlights exactly the current local day on 30 October in light and dark modes', async ({ page }) => {
  await seedPlanStudent(page)
  await page.clock.setFixedTime(new Date(2026, 9, 30, 12))
  await page.goto(`${appPath}#/plan?view=week&date=2026-11-01`)
  await expect(page.locator('.pln-weekview')).toBeVisible()
  const today = page.locator('.pln-weekgroup[data-today]')
  await expect(today).toHaveCount(1)
  await expect(today).toHaveAttribute('aria-label', 'Today, Friday 30 October')
  await expect(today.locator('.pln-weekgroup__day')).toHaveAttribute('aria-current', 'date')
  await expect(today).toHaveCSS('border-top-width', '2px')
  await expect(today).toHaveCSS('border-top-style', 'solid')
  await expect(today).toHaveCSS('background-color', 'rgb(226, 243, 239)')
  await expect(page.locator('.pln-weekgroup:not([data-today])').first()).not.toHaveCSS('background-color', 'rgb(226, 243, 239)')

  await page.locator('.pln-weekgroup[data-today] .pln-weekgroup__day').click()
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Today')
  await page.getByRole('button', { name: 'Week', exact: true }).click()
  await expect(page.locator('.pln-weekgroup[data-today]')).toHaveCount(1)

  await page.evaluate(() => localStorage.setItem('revision:theme', 'dark'))
  await page.reload()
  await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', 'dark')
  const darkToday = page.locator('.pln-weekgroup[data-today]')
  await expect(darkToday).toHaveCount(1)
  await expect(darkToday).toHaveCSS('background-color', 'rgb(22, 52, 48)')
  await expect(darkToday).toHaveCSS('border-top-width', '2px')
})

test('Today is highlighted consistently across Day, Week and Month; browsing another day is different', async ({ page }) => {
  await seedPlanStudent(page)
  await page.clock.setFixedTime(new Date(2026, 9, 30, 12))

  for (const theme of ['light', 'dark'] as const) {
    await page.goto(`${appPath}#/plan?view=day&date=2026-10-31`)
    await page.evaluate((value) => localStorage.setItem('revision:theme', value), theme)
    await page.reload()
    await expect(page.locator('.planner-runtime')).toHaveAttribute('data-theme', theme)
    const dayToday = page.locator('.pln-tab[data-today]')
    await expect(dayToday).toHaveCount(1)
    await expect(dayToday).toHaveAttribute('aria-current', 'date')
    await expect(dayToday).toHaveAttribute('aria-selected', 'false')
    const chosen = page.locator('.pln-tab[aria-selected="true"]')
    await expect(chosen).toHaveCount(1)
    await expect(chosen).not.toHaveAttribute('data-today', 'true')

    const appearance = async (selector: string) =>
      page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element)
        return { background: style.backgroundColor, ring: style.boxShadow }
      })

    const dayStyle = await appearance('.pln-tab[data-today]')
    const chosenStyle = await appearance('.pln-tab[aria-selected="true"]')
    expect(chosenStyle).not.toEqual(dayStyle)
    expect(dayStyle.ring).not.toBe('none')

    await page.getByRole('button', { name: 'Week', exact: true }).click()
    const weekToday = page.locator('.pln-weekgroup[data-today]')
    await expect(weekToday).toHaveCount(1)
    await expect(weekToday.locator('[aria-current="date"]')).toHaveCount(1)
    expect(await appearance('.pln-weekgroup[data-today]')).toEqual(dayStyle)

    await page.getByRole('button', { name: 'Month', exact: true }).click()
    const monthToday = page.locator('.pln-cell[data-today]')
    await expect(monthToday).toHaveCount(1)
    await expect(monthToday).toHaveAttribute('aria-current', 'date')
    expect(await appearance('.pln-cell[data-today]')).toEqual(dayStyle)
  }
})
