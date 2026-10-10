import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { captureEvidence, practicePath, seedReturningStudent } from './practice-seed'

async function openFlashcards(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  await page.getByRole('region', { name: 'Warm-up' }).getByRole('button', { name: /^Flashcards/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.locator('.practice-flashcard__card')).toBeVisible()
  return saved
}

const question = (page: Page) => page.locator('.practice-flashcard__question').textContent()
const total = async (page: Page) => Number((await page.getByText(/^Card \d+ of \d+$/).textContent())?.match(/of (\d+)/)?.[1])

/** Turns the card, rates it, and waits for the next card (or the end) so the next read is not of the old card. */
async function rate(page: Page, label: 'No' | 'Partly' | 'Yes') {
  const count = (await page.getByText(/^Card \d+ of \d+$/).textContent()) ?? ''
  const [, current, of] = /Card (\d+) of (\d+)/.exec(count) ?? []
  await page.getByRole('button', { name: 'Show answer' }).click()
  await page.getByRole('group', { name: 'Did you know it?' }).getByRole('button', { name: label }).click()
  if (Number(current) < Number(of)) await expect(page.getByText(`Card ${Number(current) + 1} of ${of}`)).toBeVisible()
  else await expect(page.getByRole('heading', { name: /^You knew/ })).toBeVisible()
}

test('the flashcard page-level workspace has the warm-up bar, a card count that does not wrap, and the warm-up label', async ({ page }) => {
  await openFlashcards(page)
  const dialog = page.getByRole('region', { name: /^Practice:/ })
  await expect(dialog.getByText(/· Warm-up · Flashcards$/)).toBeVisible()
  await expect(page.getByText(/^Card 1 of \d+$/)).toBeVisible()
  const count = page.getByText(/^Card 1 of \d+$/)
  const lineHeight = await count.evaluate((node) => Number.parseFloat(getComputedStyle(node).lineHeight) || 14)
  expect((await count.boundingBox())!.height).toBeLessThan(lineHeight * 1.6) // one line
  await expect(dialog.getByText('Warm-up · doesn’t count towards Exam readiness')).toBeVisible()
  await expect(dialog.getByText('Tap to turn it over')).toBeVisible()
})

test('the card turns over, then asks "Did you know it?" with No, Partly and Yes, and the next card appears unturned', async ({ page }) => {
  const saved = await openFlashcards(page)
  const card = page.locator('.practice-flashcard__card')
  const firstQuestion = await question(page)
  await expect(card).toHaveAttribute('data-flipped', 'false')
  await expect(page.getByRole('group', { name: 'Did you know it?' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Show answer' }).click()
  await expect(card).toHaveAttribute('data-flipped', 'true')
  const style = await card.evaluate((node) => ({ transition: getComputedStyle(node).transitionDuration, property: getComputedStyle(node).transitionProperty, perspective: getComputedStyle(node.parentElement!).perspective }))
  expect(style.transition).toBe('0.52s')
  expect(style.perspective).toBe('1400px')
  await expect(page.getByRole('heading', { name: 'Did you know it?' })).toBeVisible()
  await expect(page.getByText('Choose one, and the next card appears.')).toBeVisible()
  for (const label of ['No', 'Partly', 'Yes']) {
    const button = page.getByRole('group', { name: 'Did you know it?' }).getByRole('button', { name: label })
    await expect(button).toBeVisible()
    await expect(button.locator('svg')).toBeVisible() // icon and text, never colour alone
  }
  await expect(page.getByRole('button', { name: 'No' })).toBeFocused()

  await page.getByRole('button', { name: 'Partly' }).click()
  await expect(page.getByText(/^Card 2 of \d+$/)).toBeVisible()
  await expect(card).toHaveAttribute('data-flipped', 'false')
  expect(await question(page)).not.toBe(firstQuestion)
  await expect(page.getByRole('button', { name: 'Show answer' })).toBeFocused()
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({ source: 'flashcard', schema_version: 1 })
  expect((saved[0].payload as Record<string, unknown>).rating).toBe(1)
})

test('with reduced motion the card switches over instantly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openFlashcards(page)
  await page.getByRole('button', { name: 'Show answer' }).click()
  const duration = await page.locator('.practice-flashcard__card').evaluate((node) => getComputedStyle(node).transitionDuration)
  expect(duration).toBe('0s')
})

test('No, Partly and Yes save ratings 0, 1 and 2; the last card says it finishes the warm-up; the end shows how many were known', async ({ page }) => {
  test.setTimeout(120_000)
  const saved = await openFlashcards(page)
  const n = await total(page)
  const plan = ['No', 'Partly', 'Yes'] as const
  for (let index = 0; index < n; index += 1) {
    if (index === n - 1) {
      await page.getByRole('button', { name: 'Show answer' }).click()
      await expect(page.getByText('Choose one to finish the warm-up.')).toBeVisible()
      await page.getByRole('button', { name: plan[index % 3] }).click()
    } else {
      await rate(page, plan[index % 3])
    }
  }
  const knew = Array.from({ length: n }, (_, i) => i).filter((i) => i % 3 === 2).length
  await expect(page.getByRole('heading', { name: `You knew ${knew} of ${n}` })).toBeVisible()
  expect(saved.map((row) => (row.payload as Record<string, unknown>).rating).slice(0, 3)).toEqual([0, 1, 2])
  expect(saved).toHaveLength(n)
  await expect(page.getByText(/^Yes \d+$/)).toBeVisible()
  await expect(page.getByText(/^Partly \d+$/)).toBeVisible()
  await expect(page.getByText(/^No \d+$/)).toBeVisible()
  await expect(page.getByText(/I’ll show the ones you weren’t sure of first next time/)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Start the questions/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Go through them again' })).toBeVisible()
})

test('the next deck starts with the cards you said No or Partly to', async ({ page }) => {
  test.setTimeout(120_000)
  await openFlashcards(page)
  const n = await total(page)
  const questions: string[] = []
  for (let index = 0; index < n; index += 1) {
    questions.push((await question(page)) ?? '')
    await rate(page, index === 0 ? 'No' : index === 1 ? 'Partly' : 'Yes')
  }
  await page.getByRole('button', { name: 'Go through them again' }).click()
  await expect(page.getByText(/^Card 1 of \d+$/)).toBeVisible()
  expect(await question(page)).toBe(questions[0])
  await rate(page, 'Yes')
  expect(await question(page)).toBe(questions[1])
})

test('"Start the questions" at the end of the warm-up opens the scored questions', async ({ page }) => {
  test.setTimeout(120_000)
  await openFlashcards(page)
  const n = await total(page)
  for (let index = 0; index < n; index += 1) await rate(page, 'Yes')
  await page.getByRole('button', { name: /^Start the questions/ }).click()
  await expect(page.locator('.practice-question__prompt')).toBeVisible()
})

for (const theme of ['light', 'dark'] as const) {
  test(`the flashcard screens meet the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
    test.setTimeout(120_000)
    await openFlashcards(page, theme)
    const audit = async (label: string) => {
      await page.waitForTimeout(650) // let the 520ms turn finish
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), label).toEqual([])
    }
    await audit(`front (${theme})`)
    await page.getByRole('button', { name: 'Show answer' }).click()
    await audit(`back (${theme})`)
    const n = await total(page)
    await page.getByRole('button', { name: 'Yes' }).click()
    await expect(page.getByText(`Card 2 of ${n}`)).toBeVisible()
    for (let index = 1; index < n; index += 1) await rate(page, 'Yes')
    await audit(`done (${theme})`)
  })
}

for (const width of [1440, 960, 620, 390, 320]) {
  test(`flashcards never scroll sideways at ${width}px, and the card is ${width <= 620 ? 400 : 360}px tall`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openFlashcards(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
    expect((await page.locator('.practice-flashcard__card').boundingBox())!.height).toBe(width <= 620 ? 400 : 360)
    await page.getByRole('button', { name: 'Show answer' }).click()
    await page.waitForTimeout(650)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
    expect(await page.locator('.practice-activity__body').evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(0)
  })
}
