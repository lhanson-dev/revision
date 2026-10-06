import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { captureEvidence, practicePath, seedReturningStudent } from './practice-seed'

/** Opens the scored session from the start screen. Practice opens its questions in a pop-up. */
async function startQuestions(page: Page) {
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

async function answerOption(page: Page, index: number) {
  await page.locator('.practice-question__options button').nth(index).click()
  await page.getByRole('button', { name: 'Check answer' }).click()
}

test('Practice feedback bar explains why, uses teal for right and coral for wrong, and a missed question comes back after 3 others', async ({ page }) => {
  test.setTimeout(90_000) // a long journey: a miss, 3 more answers, then the retry
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  await startQuestions(page)
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeVisible()

  let missedPrompt = ''
  let missedCorrectIndex = -1
  let answers = 0
  for (; answers < 5 && !missedPrompt; answers += 1) {
    const prompt = (await page.locator('.practice-question__prompt').textContent()) ?? ''
    await answerOption(page, 0)
    // Wait for the feedback bar before deciding right or wrong; isVisible() does not wait and raced the render.
    await expect(page.locator('.ui-feedback-bar')).toBeVisible()
    const wrong = page.getByText('Not quite', { exact: true })
    if (await wrong.isVisible()) {
      missedPrompt = prompt
      missedCorrectIndex = await page.locator('.practice-question__options button').evaluateAll((buttons) => buttons.findIndex((button) => button.classList.contains('ui-answer-option--correct')))
      // Wrong is coral with an icon and words, explains why, and says honestly when it comes back.
      const bar = page.locator('.ui-feedback-bar--wrong')
      await expect(bar).toBeVisible()
      await expect(bar.locator('.ui-feedback-bar__explanation')).not.toBeEmpty()
      await expect(bar.getByText('This will come back later in this session.')).toBeVisible()
      await expect(bar.locator('.ui-feedback-bar__title svg')).toBeVisible()
    } else {
      const bar = page.locator('.ui-feedback-bar--correct')
      await expect(bar).toBeVisible()
      await expect(bar.getByText('Correct', { exact: true })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(missedPrompt, 'one of the first answers should be a miss so the retry can be tested').not.toBe('')
  const missedAt = saved.length

  // Three other answers, then the missed question comes back as "another go".
  for (let other = 0; other < 3; other += 1) {
    await expect(page.getByText('Another go at one you missed')).toHaveCount(0)
    await answerOption(page, 0)
    await page.getByRole('button', { name: 'Next question' }).click()
  }
  await expect(page.getByText('Another go at one you missed')).toBeVisible()
  await expect(page.locator('.practice-question__prompt')).toHaveText(missedPrompt)

  // Getting it right on the retry clears it, says so, and is saved as a real answer.
  await answerOption(page, missedCorrectIndex)
  await expect(page.locator('.ui-feedback-bar--correct').getByText('You’ve got it this time')).toBeVisible()
  await expect(page.getByText('That one is off your list.')).toBeVisible()
  expect(saved.length).toBe(missedAt + 4)
  const missedContent = saved[missedAt - 1].content_id
  const attempts = saved.filter((item) => item.content_id === missedContent).map((item) => (item.payload as Record<string, unknown>).correct)
  expect(attempts).toEqual([false, true])

})

for (const theme of ['light', 'dark'] as const) {
  test(`Practice feedback bar meets the automated WCAG A/AA baseline for right and wrong answers (${theme})`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
    await seedReturningStudent(page)
    await captureEvidence(page)
    await page.goto(practicePath)
    await startQuestions(page)
    await expect(page.getByRole('button', { name: 'Check answer' })).toBeVisible()

    const seen = new Set<string>()
    for (let answers = 0; answers < 5 && seen.size < 2; answers += 1) {
      await answerOption(page, 0)
      await expect(page.locator('.ui-feedback-bar')).toBeVisible()
      const tone = (await page.locator('.ui-feedback-bar--wrong').isVisible()) ? 'wrong' : 'correct'
      if (!seen.has(tone)) {
        seen.add(tone)
        await page.waitForTimeout(500) // let the 220ms slide-up finish so colours are measured at full strength
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), `${tone} feedback in ${theme}`).toEqual([])
      }
      await page.getByRole('button', { name: 'Next question' }).click()
    }
    expect(seen.size, 'both a right and a wrong answer should have been seen').toBe(2)
  })
}
