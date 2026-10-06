import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { answerKnown, answerWith, captureEvidence, practicePath, seedReturningStudent, startQuestions } from './practice-seed'

type Saved = Array<Record<string, unknown>>
const payloadOf = (row: Record<string, unknown>) => row.payload as Record<string, unknown>

async function openSession(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
  await seedReturningStudent(page)
  const saved: Saved = await captureEvidence(page)
  await page.goto(practicePath)
  await startQuestions(page)
  return saved
}

test('a certain wrong answer is coral, says what was picked and why, is saved with its confidence, and comes back after 3 others', async ({ page }) => {
  test.setTimeout(90_000)
  const saved = await openSession(page)

  const missedPrompt = await answerKnown(page, false, 'Certain')
  const bar = page.locator('.ui-feedback-bar--wrong')
  await expect(bar.getByText('Not quite.', { exact: true })).toBeVisible()
  await expect(bar.locator('.ui-feedback-bar__picked')).toContainText(/^You picked [A-D]/)
  await expect(bar.locator('.ui-feedback-bar__explanation')).not.toBeEmpty()
  await expect(bar.getByText('You were certain, so this is the one most worth fixing. I’ll bring it back later.')).toBeVisible()
  await expect(bar.locator('.ui-feedback-bar__title svg')).toBeVisible()
  // One action only: no Learn or Ask REV links per question.
  await expect(bar.getByRole('button')).toHaveCount(1)
  await expect(bar.getByRole('link')).toHaveCount(0)
  const missedCorrectIndex = await page.locator('.practice-question__options button').evaluateAll((buttons) => buttons.findIndex((button) => button.classList.contains('ui-answer-option--correct')))

  expect(saved).toHaveLength(1)
  expect(payloadOf(saved[0])).toMatchObject({ source: 'multiple_choice', correct: false, confidence: 'certain', schemaVersion: 2 })
  expect(saved[0].schema_version).toBe(2)

  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText('Same level, so you can steady it.')).toBeVisible()

  // Three other answers, then the missed question comes back as "another go".
  for (let other = 0; other < 3; other += 1) {
    await expect(page.getByText('Another go at one you missed')).toHaveCount(0)
    await answerWith(page, 0)
    await page.getByRole('button', { name: 'Next question' }).click()
  }
  await expect(page.getByText('Another go at one you missed')).toBeVisible()
  await expect(page.locator('.practice-question__prompt')).toHaveText(missedPrompt)

  // Getting it right on the second go clears it, says so, and is saved as a real answer.
  await answerWith(page, missedCorrectIndex, 'Certain')
  await expect(page.locator('.ui-feedback-bar--correct').getByText('Nice, that’s the one.')).toBeVisible()
  await expect(page.getByText('That one is off your list.')).toBeVisible()
  expect(saved).toHaveLength(5)
  const attempts = saved.filter((row) => row.content_id === saved[0].content_id).map((row) => payloadOf(row).correct)
  expect(attempts).toEqual([false, true])
})

test('a right answer that was a guess says so, and is saved as a guess', async ({ page }) => {
  const saved = await openSession(page)
  await answerKnown(page, true, 'Guessing')
  const bar = page.locator('.ui-feedback-bar--correct')
  await expect(bar.getByText('Right, but a guess')).toBeVisible()
  await expect(bar.getByText('Right, but you guessed. I’ll check this one again soon so it sticks.')).toBeVisible()
  expect(payloadOf(saved[0])).toMatchObject({ correct: true, confidence: 'guess', schemaVersion: 2 })
})

test('two right answers in a row step the level up and say so; the answer is checked only when "How sure" is chosen', async ({ page }) => {
  const saved = await openSession(page)
  await expect(page.locator('.practice-chip').filter({ hasText: /^Recall$/ })).toBeVisible()

  // Picking an answer alone checks nothing. The question for confidence appears, and there is no Check button.
  await page.locator('.practice-question__options button').first().click()
  await expect(page.getByRole('button', { name: 'Check answer' })).toHaveCount(0)
  await expect(page.getByText('Choosing one checks your answer.')).toBeVisible()
  expect(saved).toHaveLength(0)

  await page.reload()
  await startQuestions(page)
  await answerKnown(page, true)
  await expect(page.locator('.ui-feedback-bar--correct').getByText('Nice, that’s the one.')).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await answerKnown(page, true)
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText('Stepping up: you got the last 2 right.')).toBeVisible()
  await expect(page.locator('.practice-chip').filter({ hasText: /^Apply$/ })).toBeVisible()
})

for (const theme of ['light', 'dark'] as const) {
  for (const tone of ['wrong', 'correct'] as const) {
    test(`the ${tone} feedback bar meets the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
      await openSession(page, theme)
      await answerKnown(page, tone === 'correct', 'Certain')
      await page.waitForTimeout(500) // let the slide-up finish so colours are measured at full strength
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), `${tone} feedback in ${theme}`).toEqual([])
    })
  }
}
