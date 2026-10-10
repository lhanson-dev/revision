import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { answerWith, captureEvidence, practicePath, seedReturningStudent } from './practice-seed'

const startButton = (page: Page) => page.getByRole('button', { name: /^Start \d+ questions?$/ })

async function openPractice(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  await expect(startButton(page)).toBeVisible()
  return saved
}

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, 'the page must not scroll sideways').toBeLessThanOrEqual(0)
}

test('the start screen names the topic, not the course, and shows Scored, Warm-up and REV', async ({ page }) => {
  await openPractice(page)
  const start = page.getByRole('region', { name: 'Test what you know' })
  await expect(start.getByRole('heading', { name: 'Test what you know' })).toBeVisible()
  await expect(start.getByText(/^Practice · /)).toBeVisible()
  await expect(start.getByText(/Quick check · Business/)).toHaveCount(0)

  const scored = page.getByRole('region', { name: 'Scored questions' })
  await expect(scored.getByText('Counts towards Understanding and Exam readiness')).toBeVisible()
  await expect(scored.getByRole('button', { name: /^5\s*about 8 min$/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(scored.getByRole('button', { name: /^10\s*about 15 min$/ })).toBeVisible()
  await expect(scored.getByRole('button', { name: /^15\s*about 25 min$/ })).toBeVisible()

  const warmUp = page.getByRole('region', { name: 'Warm-up' })
  await expect(warmUp.getByText('Doesn’t count towards Exam readiness')).toBeVisible()
  await expect(warmUp.getByRole('button', { name: /^Flashcards\s*\d+ cards?/ })).toBeVisible()
  await expect(page.getByText('Other ways to practise')).toHaveCount(0)
})

test('the start button never promises more questions than the topic has', async ({ page }) => {
  await openPractice(page)
  const scored = page.getByRole('region', { name: 'Scored questions' })
  await scored.getByRole('button', { name: /^15\s*about 25 min$/ }).click()
  const label = (await startButton(page).textContent()) ?? ''
  const count = Number(label.match(/\d+/)?.[0])
  expect(count).toBeGreaterThan(0)
  expect(count).toBeLessThanOrEqual(15)
  if (count < 15) await expect(scored.getByText(/for now, so that is what you will get/)).toBeVisible()
})

test('Practice activity is page-level and returns keyboard focus to its launch control', async ({ page }) => {
  await openPractice(page)
  const start = startButton(page)
  await start.click()
  const workspace = page.getByRole('region', { name: /^Practice:/ })
  await expect(workspace).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(start).toHaveCount(0)
  await expect(workspace.getByRole('button', { name: 'Back to practice' })).toBeFocused()
  await workspace.getByRole('button', { name: 'Back to practice' }).click()
  await expect(workspace).toHaveCount(0)
  await expect(start).toBeFocused()

  const flashcards = page.getByRole('button', { name: /^Flashcards/ })
  await flashcards.click()
  await expect(workspace).toBeVisible()
  await expect(page.getByText('Warm-up · doesn’t count towards Exam readiness')).toBeVisible()
  await workspace.getByRole('button', { name: 'Back to practice' }).click()
  await expect(workspace).toHaveCount(0)
  await expect(flashcards).toBeFocused()
})

test('closing mid-session keeps every saved answer and the start screen offers Carry on', async ({ page }) => {
  const saved = await openPractice(page)
  await startButton(page).click()
  await answerWith(page, 0)
  expect(saved).toHaveLength(1)

  await page.getByRole('button', { name: 'Back to practice' }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toHaveCount(0)
  expect(saved, 'closing must not lose or repeat a saved answer').toHaveLength(1)

  await expect(page.getByText('You have a session open.')).toBeVisible()
  await page.getByRole('button', { name: 'Carry on' }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  // The answer that was already checked is still on screen, with its feedback.
  await expect(page.locator('.ui-feedback-bar')).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText('Question 2', { exact: true })).toBeVisible()
})

test('the question page-level workspace shows the segmented strip and the topic status', async ({ page }) => {
  await openPractice(page)
  await startButton(page).click()
  const total = Number((await page.locator('.practice-progress__count').textContent())?.match(/of (\d+)/)?.[1])
  expect(await page.locator('.practice-progress__segment').count()).toBe(total)
  await expect(page.locator('.practice-progress__segment[data-state="current"]')).toHaveCount(1)
  await expect(page.locator('.practice-progress__topic .ui-status-badge')).toBeVisible()
})

for (const theme of ['light', 'dark'] as const) {
  test(`start screen and page-level workspace meet the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
    await openPractice(page, theme)
    const audit = async (label: string) => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), label).toEqual([])
    }
    await audit(`start screen (${theme})`)
    await startButton(page).click()
    await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
    await audit(`question page-level workspace (${theme})`)
    await page.getByRole('button', { name: 'Back to practice' }).click()
    await page.getByRole('button', { name: /^Flashcards/ }).click()
    await expect(page.getByRole('button', { name: 'Show answer' })).toBeVisible()
    await audit(`flashcards page-level workspace (${theme})`)
  })
}

for (const width of [1440, 960, 620, 390, 320]) {
  test(`Practice never scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPractice(page)
    await expectNoSidewaysScroll(page)
    await startButton(page).click()
    await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
    await expectNoSidewaysScroll(page)
    const box = await page.getByRole('region', { name: /^Practice:/ }).boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 0.5)
    await page.getByRole('button', { name: 'Back to practice' }).click()
    await page.getByRole('button', { name: /^Flashcards/ }).click()
    await expectNoSidewaysScroll(page)
  })
}
