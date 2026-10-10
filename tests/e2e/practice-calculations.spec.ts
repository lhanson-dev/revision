import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { captureEvidence, practicePath, seedReturningStudent } from './practice-seed'

type CalcRecord = { question: { stem: string; family: string; calcs: Array<{ stated_answer: number; unit: string }> } }
const bank = (JSON.parse(readFileSync('content/business/aqa-a-level/shared/fast-path-question-bank.json', 'utf8')) as { questions: CalcRecord[] }).questions
const squash = (text: string) => text.replace(/\s*Show your working\.?/i, '').replace(/\s+/g, ' ').trim()
const answerFor = (prompt: string) => bank.find((record) => record.question.family === 'SHORT_ANSWER' && record.question.calcs.length === 1 && squash(record.question.stem) === squash(prompt))?.question.calcs[0]

/** Starts a session of calculations only (Practice opens on a topic that has one). */
async function startCalculations(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  const scored = page.getByRole('region', { name: 'Scored questions' })
  await scored.getByRole('button', { name: 'Calculations' }).click()
  await scored.getByRole('button', { name: 'Multiple choice' }).click()
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.locator('.practice-calc__input')).toBeVisible()
  return saved
}

const promptText = async (page: Page) => (await page.locator('.practice-question__prompt').textContent()) ?? ''

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the tests; the desktop project covers them all.')
})

test('"Calculations" is a kind to choose when the topic has one, and at least one kind stays on', async ({ page }) => {
  await seedReturningStudent(page)
  await captureEvidence(page)
  await page.goto(practicePath)
  const scored = page.getByRole('region', { name: 'Scored questions' })
  await expect(scored.getByRole('button', { name: 'Multiple choice' })).toHaveAttribute('aria-pressed', 'true')
  await expect(scored.getByRole('button', { name: 'Calculations' })).toHaveAttribute('aria-pressed', 'false')
  await scored.getByRole('button', { name: 'Calculations' }).click()
  await scored.getByRole('button', { name: 'Multiple choice' }).click()
  await expect(scored.getByRole('button', { name: 'Calculations' })).toHaveAttribute('aria-pressed', 'true')
  await scored.getByRole('button', { name: 'Calculations' }).click() // the only one on: stays on
  await expect(scored.getByRole('button', { name: 'Calculations' })).toHaveAttribute('aria-pressed', 'true')
})

test('a calculation shows a number box with its unit, asks how sure you are only once there is a number, and does not say "Show your working"', async ({ page }) => {
  await startCalculations(page)
  const prompt = await promptText(page)
  expect(prompt).not.toMatch(/show your working/i)
  const answer = answerFor(prompt)!
  expect(answer, 'the question should be in the AQA bank').toBeTruthy()
  await expect(page.getByLabel('Your answer')).toBeVisible()
  await expect(page.getByRole('group', { name: 'How sure are you?' })).toHaveCount(0)
  await page.getByLabel('Your answer').fill('no idea')
  await expect(page.getByRole('group', { name: 'How sure are you?' })).toHaveCount(0)
  await page.getByLabel('Your answer').fill(String(answer.stated_answer))
  await expect(page.getByRole('group', { name: 'How sure are you?' })).toBeVisible()
  await expect(page.getByText('Work it out, then type just the number. Your working is not marked here.')).toBeVisible()
})

test('a right answer is green with the working shown, and is saved as calculation evidence with its confidence', async ({ page }) => {
  const saved = await startCalculations(page)
  const answer = answerFor(await promptText(page))!
  await page.getByLabel('Your answer').fill(String(answer.stated_answer))
  await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
  const bar = page.locator('.ui-feedback-bar--correct')
  await expect(bar.getByText('Nice, that’s the one.')).toBeVisible()
  await expect(bar.locator('.ui-feedback-bar__explanation')).toContainText('The answer is')
  await expect(page.locator('.practice-calc__result')).toHaveText(/Correct/)
  await expect(page.locator('.practice-calc__input')).toBeDisabled()
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({ source: 'calculation', schema_version: 2 })
  expect(saved[0].payload).toMatchObject({ source: 'calculation', correct: true, enteredValue: answer.stated_answer, expectedValue: answer.stated_answer, confidence: 'certain', schemaVersion: 2 })
})

test('a wrong answer says what was typed and what the answer is, and a certain miss is flagged', async ({ page }) => {
  const saved = await startCalculations(page)
  const answer = answerFor(await promptText(page))!
  await page.getByLabel('Your answer').fill(String(answer.stated_answer + 7))
  await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
  const bar = page.locator('.ui-feedback-bar--wrong')
  await expect(bar.getByText('Not quite.', { exact: true })).toBeVisible()
  await expect(bar.locator('.ui-feedback-bar__picked')).toContainText(`You answered ${answer.stated_answer + 7}. The answer is`)
  await expect(bar.getByText('You were certain, so this is the one most worth fixing. I’ll bring it back later.')).toBeVisible()
  await expect(bar.locator('.ui-feedback-bar__title svg')).toBeVisible()
  await expect(page.locator('.practice-calc__result')).toHaveText(/Not quite/)
  expect(saved[0].payload).toMatchObject({ source: 'calculation', correct: false, confidence: 'certain' })
})

test('the answer can be typed the way the exam writes it', async ({ page }) => {
  await startCalculations(page)
  const answer = answerFor(await promptText(page))!
  const typed = answer.unit === '£' ? `£${answer.stated_answer.toLocaleString('en-GB')}` : answer.unit === 'percent' ? `${answer.stated_answer}%` : `${answer.stated_answer}`
  await page.getByLabel('Your answer').fill(typed)
  await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Fairly sure' }).click()
  await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
})

test('finishing a session of calculations shows the summary with each miss and the answer', async ({ page }) => {
  test.setTimeout(120_000)
  await startCalculations(page)
  const done = page.getByText(/^Session done · /)
  for (let index = 0; index < 20 && !(await done.isVisible()); index += 1) {
    const answer = answerFor(await promptText(page))!
    // Every first go is wrong and sure; a retry is right, which ends the session.
    const retry = await page.getByText('Another go at one you missed').isVisible()
    await page.getByLabel('Your answer').fill(String(retry ? answer.stated_answer : answer.stated_answer + 1))
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await page.getByRole('button', { name: /^(Next question|See how you did)/ }).click()
  }
  await expect(done).toBeVisible()
  const item = page.getByRole('region', { name: 'Go over these' }).locator('.practice-summary__item').first()
  await expect(item.locator('.practice-summary__item-reason')).toContainText(/^You answered \S+\. The answer is /)
})

for (const theme of ['light', 'dark'] as const) {
  test(`the calculation screens meet the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
    test.setTimeout(120_000)
    await startCalculations(page, theme)
    const audit = async (label: string) => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), label).toEqual([])
    }
    await audit(`empty (${theme})`)
    const answer = answerFor(await promptText(page))!
    await page.getByLabel('Your answer').fill(String(answer.stated_answer + 1))
    await audit(`typed (${theme})`)
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await expect(page.locator('.ui-feedback-bar--wrong')).toBeVisible()
    await page.waitForTimeout(700) // let the feedback bar finish sliding in
    await audit(`wrong (${theme})`)
  })
}

test('the calculation screen never scrolls sideways at 1440, 960, 620, 390 and 320px', async ({ page }) => {
  test.setTimeout(120_000)
  await startCalculations(page)
  const answer = answerFor(await promptText(page))!
  await page.getByLabel('Your answer').fill(String(answer.stated_answer + 1))
  await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
  await expect(page.locator('.ui-feedback-bar--wrong')).toBeVisible()
  for (const width of [1440, 960, 620, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}px`).toBeLessThanOrEqual(0)
    expect(await page.locator('.practice-activity__body').evaluate((node) => node.scrollWidth - node.clientWidth), `${width}px workspace`).toBeLessThanOrEqual(0)
  }
})
