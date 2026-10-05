import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { appPath, defaultSessions, seedPlanStudent } from './plan-seed'

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

test('titles follow the period and the address keeps view and date', async ({ page }) => {
  await openPlan(page, '#/plan')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your week')
  await page.getByRole('button', { name: 'Next week' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Next week')
  expect(page.url()).toContain('#/plan?view=day&date=2026-10-12')
  await page.getByRole('button', { name: 'Previous week' }).click()
  await page.getByRole('button', { name: 'Previous week' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Last week')
  await page.getByRole('button', { name: 'This week' }).click()
  await page.getByRole('button', { name: 'Month', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your month')
  expect(page.url()).toContain('view=month')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your month')
  await expect(page.getByRole('button', { name: 'Month', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('summary is time against plan, with a status in words and an icon', async ({ page }) => {
  await openPlan(page, '#/plan')
  const summary = page.locator('.pln-summary')
  await expect(summary).toContainText('This week')
  await expect(summary).toContainText('of 5h 15m planned')
  await expect(summary.locator('.pln-summary__label svg')).toBeVisible()
  await expect(summary.locator('.pln-summary__label')).toHaveText(/On track|Catching up|Finished|Coming up/)
})

test('day strip is a keyboard tablist: arrows move and select, Home and End jump', async ({ page }) => {
  await openPlan(page, '#/plan')
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Week of 9 Nov')
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

test('rows: Continue for a REV pick today, Start for the rest, done is muted with a tick', async ({ page }) => {
  await openPlan(page, '#/plan')
  const list = page.locator('.pln-list')
  await expect(list.getByRole('button', { name: /^Continue/ })).toHaveCount(1)
  await expect(list.getByRole('button', { name: /^Start/ }).first()).toBeVisible()
  const done = page.locator('.pln-row[data-done]')
  await expect(done).toContainText('Done')
  await expect(done.locator('.pln-row__mark')).toHaveCSS('opacity', '0.45')
  await expect(page.getByText('REV pick')).toBeVisible()
  await expect(page.getByText(/REV suggests|Weekly goal/i)).toHaveCount(0)
})

test('study time: steppers change in 15 minutes, 0 is Rest, save calls the planner and keeps done sessions', async ({ page }) => {
  await openPlan(page, '#/plan')
  await page.getByRole('button', { name: 'Change study time' }).click()
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
  await openPlan(page, '#/plan')
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your week')
  await expect(page.getByText('Your plan is waiting on you')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add session' })).toHaveCount(0)
  await expect(page.getByText(/learner_planned_sessions|does not exist/i)).toHaveCount(0)
  await expect(page.locator('.pln-empty')).toContainText('Free. Nothing planned.')
  await expect(page.getByText('No exam dates yet.')).toBeVisible()
  await page.getByRole('button', { name: 'Set study time' }).click()
  await expect(page.getByRole('button', { name: 'Save study time' })).toBeVisible()
  await noSidewaysScroll(page)
})

test('future weeks show only what the planner returns, never invented sessions', async ({ page }) => {
  await openPlan(page, '#/plan?view=week&date=2027-03-01')
  await expect(page.locator('.pln-list')).toHaveCount(0)
  await expect(page.locator('.pln-empty')).toHaveCount(7)
  await expect(page.locator('.pln-summary')).toContainText('Nothing planned yet.')
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
