import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { bankMarkPoints } from './practice-seed'

/**
 * Written answers marked by REV (Practice v2.2, PR 3). Revision has no real marker connected yet, so these run on the
 * dev-only fixture page, which plugs a stand-in marker into the real Practice screen (see src/practice-fixtures.tsx).
 * Served by the Vite dev server on port 4174 (see playwright.config.ts).
 */
const fixture = 'http://127.0.0.1:4174/revision/practice-fixtures.html'

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the tests; the desktop project covers them all.')
})

async function savedEvidence(page: Page) {
  return JSON.parse((await page.getByTestId('saved-evidence').textContent()) ?? '[]') as Array<Record<string, any>>
}

/** Starts a session of written questions only. */
async function startWritten(page: Page, query = '') {
  await page.goto(`${fixture}${query}`)
  const scored = page.getByRole('region', { name: 'Scored questions' })
  await scored.getByRole('button', { name: 'Written answers' }).click()
  await scored.getByRole('button', { name: 'Multiple choice' }).click()
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask REV to mark it' })).toBeVisible()
}

/** Writes an answer made of the examples the mark scheme accepts for the first `count` mark points. */
async function writeAnswer(page: Page, count: number) {
  const prompt = (await page.locator('.practice-question__prompt').textContent()) ?? ''
  const points = bankMarkPoints(prompt)
  const answer = points.slice(0, count).map((point) => point.accept[0]).join('. ')
  await page.getByLabel('Your answer').fill(answer)
  return { points, answer }
}

test('without a marker connected, written answers are not offered at all', async ({ page }) => {
  await page.goto(`${fixture}?marker=off`)
  const scored = page.getByRole('region', { name: 'Scored questions' })
  await expect(scored.getByRole('button', { name: 'Written answers' })).toHaveCount(0)
  await expect(scored.getByRole('button', { name: 'Calculations' })).toHaveCount(1) // calculations need no marker, so they are offered
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.locator('.practice-question__options button').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask REV to mark it' })).toHaveCount(0)
})

test('with a marker, "Written answers" is a kind to choose, and at least one kind stays on', async ({ page }) => {
  await page.goto(fixture)
  const scored = page.getByRole('region', { name: 'Scored questions' })
  await expect(scored.getByRole('button', { name: 'Multiple choice' })).toHaveAttribute('aria-pressed', 'true')
  await expect(scored.getByRole('button', { name: 'Written answers' })).toHaveAttribute('aria-pressed', 'false')
  await scored.getByRole('button', { name: 'Multiple choice' }).click() // the only one on: stays on
  await expect(scored.getByRole('button', { name: 'Multiple choice' })).toHaveAttribute('aria-pressed', 'true')
})

test('REV marks a written answer against each mark point, and the result is saved without the answer text', async ({ page }) => {
  await startWritten(page)
  const markButton = page.getByRole('button', { name: 'Ask REV to mark it' })
  await expect(markButton).toBeDisabled()
  await expect(page.getByText(/^Marked against \d+ mark points?\. You can challenge any mark\.$/)).toBeVisible()

  const { points, answer } = await writeAnswer(page, points3())
  await expect(markButton).toBeEnabled()
  await markButton.click()
  await expect(page.getByText('REV is thinking: checking your answer against each mark point')).toBeVisible()

  const card = page.locator('.practice-rev-card')
  await expect(card.getByText('REV marked this')).toBeVisible()
  await expect(card.locator('.practice-rev-card__score')).toHaveText(`${points3()} / ${points.length}`)
  await expect(card.locator('.practice-rev-card__point')).toHaveCount(points.length)
  await expect(card.getByText('Mark given')).toHaveCount(points3())
  await expect(card.getByText('Not in your answer yet')).toHaveCount(points.length - points3())
  await expect(card.locator('.practice-rev-card__note')).toContainText('To earn the missing mark')
  await expect(card.getByText('REV’s marking is a guide, not an exam board mark.')).toBeVisible()

  const [row] = await savedEvidence(page)
  expect(row).toMatchObject({ source: 'exam_question', markingMethod: 'rev_assessed', schemaVersion: 2, marksAwarded: points3(), marksAvailable: points.length })
  expect(row.revMarking.modelVersion).toBe('fixture-marker-1')
  expect(row.revMarking.pointsGiven).toEqual(points.map((_, index) => index < points3()))
  expect(JSON.stringify(row)).not.toContain(answer.slice(0, 20))
})

function points3() { return 3 }

test('a challenge that REV accepts changes the mark and is saved on a row that replaces the first', async ({ page }) => {
  await startWritten(page, '?strict=1')
  const { points } = await writeAnswer(page, 4)
  await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
  const card = page.locator('.practice-rev-card')
  await expect(card.locator('.practice-rev-card__score')).toHaveText(`3 / ${points.length}`) // strict: the first pass misses the last point it could give

  await card.getByRole('button', { name: 'Challenge a mark' }).click()
  const send = card.getByRole('button', { name: 'Send to REV' })
  await expect(send).toBeDisabled()
  await card.getByLabel('Which mark, and why do you think you got it?').fill('My last sentence covers the final mark point.')
  await send.click()
  await expect(card.getByText('You’re right. That mark point is in your answer, so I’ve changed the mark.')).toBeVisible()
  await expect(card.locator('.practice-rev-card__score')).toHaveText(`4 / ${points.length}`)
  await expect(card.getByRole('button', { name: 'Challenge a mark' })).toHaveCount(0) // one challenge per answer

  const [first, second] = await savedEvidence(page)
  expect(second.supersedesEvidenceId).toBe(first.id)
  expect(second.marksAwarded).toBe(4)
  expect(second.revMarking.challenge).toMatchObject({ text: 'My last sentence covers the final mark point.', outcome: 'changed', modelVersion: 'fixture-marker-1' })
})

test('a challenge REV does not accept says honestly why the mark stays, and that is saved too', async ({ page }) => {
  await startWritten(page)
  const { points } = await writeAnswer(page, 2)
  await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
  const card = page.locator('.practice-rev-card')
  await expect(card.locator('.practice-rev-card__score')).toHaveText(`2 / ${points.length}`)
  await card.getByRole('button', { name: 'Challenge a mark' }).click()
  await card.getByLabel('Which mark, and why do you think you got it?').fill('I think I earned the third mark.')
  await card.getByRole('button', { name: 'Send to REV' }).click()
  await expect(card.getByText('The mark stays. I looked again for that point in your answer and it isn’t there yet.')).toBeVisible()
  await expect(card.locator('.practice-rev-card__score')).toHaveText(`2 / ${points.length}`)
  const [, second] = await savedEvidence(page)
  expect(second.revMarking.challenge.outcome).toBe('unchanged')
})

test('if REV cannot mark, the answer stays on screen, nothing is saved, and trying again works', async ({ page }) => {
  await startWritten(page, '?fail=1')
  const { answer } = await writeAnswer(page, 2)
  await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
  await expect(page.getByRole('alert')).toContainText('Your answer is still here, so try again.')
  await expect(page.getByLabel('Your answer')).toHaveValue(answer)
  expect(await savedEvidence(page)).toHaveLength(0)
  await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
  await expect(page.locator('.practice-rev-card__score')).toBeVisible()
  expect(await savedEvidence(page)).toHaveLength(1)
})

test('Next question moves on after marking, and a written answer is not asked again', async ({ page }) => {
  await startWritten(page)
  await writeAnswer(page, 1)
  await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
  await page.locator('.practice-rev-card').getByRole('button', { name: /^(Next question|See how you did)$/ }).click()
  await expect(page.getByLabel('Your answer')).toHaveValue('')
})

for (const theme of ['light', 'dark'] as const) {
  test(`the written answer screens meet the automated WCAG A/AA baseline (${theme})`, async ({ page }) => {
    // Tall enough for the whole marking card, so no row is scrolled under the page-level workspace bar while axe measures it.
    await page.setViewportSize({ width: 1440, height: 1500 })
    await startWritten(page, `?theme=${theme}`)
    const audit = async (label: string) => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })), label).toEqual([])
    }
    await audit(`writing (${theme})`)
    await writeAnswer(page, 2)
    await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
    await expect(page.locator('.practice-rev-card__score')).toBeVisible()
    await audit(`marked (${theme})`)
    await page.getByRole('button', { name: 'Challenge a mark' }).click()
    await audit(`challenging (${theme})`)
  })
}

for (const width of [1440, 960, 620, 390, 320]) {
  test(`written answers never scroll sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await startWritten(page)
    await writeAnswer(page, 2)
    await page.getByRole('button', { name: 'Ask REV to mark it' }).click()
    await expect(page.locator('.practice-rev-card__score')).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const bodyOverflow = await page.locator('.practice-activity__body').evaluate((node) => node.scrollWidth - node.clientWidth)
    expect(bodyOverflow).toBeLessThanOrEqual(0)
  })
}
