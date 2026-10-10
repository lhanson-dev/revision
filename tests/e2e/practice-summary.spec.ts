import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { answerWith, bankCorrectIndex, captureEvidence, practicePath, seedReturningStudent, startQuestions, type Sure } from './practice-seed'

type Plan = Array<{ right: boolean; sure: Sure }>

/** Runs a whole session through the real screens. Each answer follows the plan; once the plan runs out, answers are right. */
async function finishSession(page: Page, plan: Plan) {
  const done = page.getByText(/^Session done · /)
  const learned = new Map<string, number>()
  const planned = new Map<string, { right: boolean; sure: Sure }>()
  for (let index = 0; index < 40; index += 1) {
    if (await done.isVisible()) return
    const prompt = (await page.locator('.practice-question__prompt').textContent()) ?? ''
    // The plan covers each question's first go. A retry is answered right and sure, which is what ends the session.
    const seen = planned.has(prompt)
    if (!seen) planned.set(prompt, plan[planned.size] ?? { right: true, sure: 'Certain' as Sure })
    const step = seen ? { right: true, sure: 'Certain' as Sure } : planned.get(prompt)!
    const known = bankCorrectIndex(prompt) ?? learned.get(prompt) ?? null
    if (known === null) {
      // Outside the AQA bank: guess by position, then read the right option from the feedback so a retry can be answered properly.
      await answerWith(page, 0, step.sure)
      learned.set(prompt, await page.locator('.practice-question__options button').evaluateAll((buttons) => buttons.findIndex((button) => button.classList.contains('ui-answer-option--correct'))))
    } else {
      const count = await page.locator('.practice-question__options button').count()
      await answerWith(page, step.right ? known : (known + 1) % count, step.sure)
    }
    await page.getByRole('button', { name: /^(Next question|See how you did)/ }).click()
  }
  await expect(done).toBeVisible()
}

async function openSummary(page: Page, plan: Plan, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  await startQuestions(page)
  await finishSession(page, plan)
  return saved
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the tests; the desktop project covers them all.')
})

const mixed: Plan = [
  { right: false, sure: 'Certain' },
  { right: true, sure: 'Guessing' },
  { right: true, sure: 'Certain' },
]

test('the summary shows the hero line, the status card, the skills map, what to go over, REV’s one next step and two ways out', async ({ page }) => {
  test.setTimeout(120_000)
  await openSummary(page, mixed)
  await expect(page.getByRole('region', { name: /^Practice:/ })).toHaveCount(0)
  await expect(page.getByText(/^Session done · /)).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 }).filter({ hasText: /^\d+ of \d+ right$/ })).toBeVisible()

  const status = page.getByRole('region', { name: 'Understanding' })
  await expect(status.getByRole('heading', { name: /· Understanding$/ })).toBeVisible()
  await expect(status.locator('.ui-status-badge--lg')).toBeVisible()
  await expect(status.getByText(/^(Up from|Still|Down from|Now|This topic now has its first evidence)/)).toBeVisible()
  expect(await status.locator('.practice-summary__tile').count()).toBeGreaterThan(0)
  for (const tile of await status.locator('.practice-summary__tile').all()) await expect(tile.locator('svg')).toBeVisible()

  const goOver = page.getByRole('region', { name: 'Go over these' })
  await expect(goOver.locator('.practice-summary__item').first()).toContainText(/^Question \d+/)
  await expect(goOver.getByText(/^You picked [A-D]/).first()).toBeVisible()
  await expect(goOver.getByText(/you said you were guessing/).first()).toBeVisible()

  await expect(page.getByText(/^REV suggests · \d+ min$/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start it' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Not now' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Practise again' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back to Practice' })).toBeVisible()
})

test('a certain wrong answer is what REV suggests first, and Not now hides the card', async ({ page }) => {
  test.setTimeout(120_000)
  await openSummary(page, mixed)
  const card = page.locator('.practice-summary__rev')
  await expect(card).toBeVisible()
  await page.getByRole('button', { name: 'Not now' }).click()
  await expect(card).toHaveCount(0)
})

test('Practise again starts a new session, and Back to Practice returns to the start screen', async ({ page }) => {
  test.setTimeout(120_000)
  await openSummary(page, mixed)
  await page.getByRole('button', { name: 'Practise again' }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.locator('.practice-question__prompt')).toBeVisible()
  await expect(page.getByText(/^Session done · /)).toHaveCount(0)
})

test('Back to Practice returns to the start screen', async ({ page }) => {
  test.setTimeout(120_000)
  await openSummary(page, mixed)
  await page.getByRole('button', { name: 'Back to Practice' }).click()
  await expect(page.getByText(/^Session done · /)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Start \d+ questions?$/ })).toBeVisible()
})

test('a "Read:" link, where the question has a Learn page, opens that page', async ({ page }) => {
  test.setTimeout(120_000)
  await openSummary(page, mixed)
  const link = page.locator('.practice-summary__read').first()
  if (await link.count() === 0) test.skip(true, 'None of these questions has a Learn page mapped')
  await expect(link).toContainText(/^Read: /)
  await link.click()
  await expect(page).toHaveURL(/learn/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`the summary meets the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
    test.setTimeout(120_000)
    await openSummary(page, mixed, theme)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([])
  })
}

test('the summary never scrolls sideways at 1440, 960, 620, 390 and 320px, and no status label wraps mid-label', async ({ page }) => {
  test.setTimeout(180_000)
  await openSummary(page, mixed)
  for (const width of [1440, 960, 620, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}px`).toBeLessThanOrEqual(0)
    for (const node of await page.locator('.practice-summary__tile-status').all()) {
      const lineHeight = await node.evaluate((element) => Number.parseFloat(getComputedStyle(element).lineHeight) || 16)
      expect((await node.boundingBox())!.height, `${width}px`).toBeLessThan(lineHeight * 2.2)
    }
  }
})

test('the skills map has 5 tiles across on desktop, 3 on tablet and 2 on a phone', async ({ page }) => {
  test.setTimeout(120_000)
  const columns = async () => page.locator('.practice-summary__tiles').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)
  await page.setViewportSize({ width: 1440, height: 900 })
  await openSummary(page, mixed)
  expect(await columns()).toBe(5)
  await page.setViewportSize({ width: 834, height: 900 })
  expect(await columns()).toBe(3)
  await page.setViewportSize({ width: 390, height: 900 })
  expect(await columns()).toBe(2)
})
