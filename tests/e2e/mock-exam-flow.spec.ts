import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { examPrepPath, seedExamPrepStudent } from './exam-prep-seed'
import { captureEvidence } from './practice-seed'

const shots = process.env.EXAM_PREP_SHOTS
const paper1Sim = /Paper 1 Simulation 1/
const northstar = /Paper 3: Business 3/
const retained1 = /Paper 1: Business 1/

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the tests; the desktop project covers them all.')
})

async function openPage(page: Page, options: Parameters<typeof seedExamPrepStudent>[1] = {}) {
  await seedExamPrepStudent(page, options)
  await page.goto(examPrepPath)
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
}

function row(page: Page, name: RegExp) {
  return page.locator('.exam-mock').filter({ hasText: name })
}

async function openMock(page: Page, name: RegExp, mode: 'timed' | 'untimed') {
  await row(page, name).getByRole('button', { name: mode === 'timed' ? 'Start timed' : 'Practise untimed' }).click()
  await expect(page.getByRole('dialog', { name: /^Mock exam:/ })).toBeVisible()
}

async function begin(page: Page, mode: 'timed' | 'untimed') {
  await page.getByRole('button', { name: mode === 'timed' ? 'Start the clock' : 'Start', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Questions' })).toBeVisible()
}

const strip = (page: Page) => page.getByRole('group', { name: 'Questions' }).getByRole('button')
const noSidewaysScroll = async (page: Page) => {
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1)
}

test('Before you start (timed): the exam’s own numbers, no help, counts towards readiness, and Not now', async ({ page }) => {
  await openPage(page)
  const opener = row(page, paper1Sim).getByRole('button', { name: 'Start timed' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: /^Mock exam:/ })
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await expect(dialog.getByText('Before you start', { exact: true })).toBeVisible()
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Paper 1 Simulation 1, timed')
  await expect(dialog.locator('.practice-bar-title__detail')).toHaveText('Timed mock · like the real exam')
  await expect(dialog.locator('.mock-rule__copy strong')).toHaveText(['120 minutes, and the timer doesn’t stop', '24 questions, 100 marks', 'No help while the clock runs', 'Flag a question and come back', 'Marked straight after'])
  await expect(dialog.getByText('Counts towards Exam readiness', { exact: true })).toBeVisible()
  // No clock before the student starts it, and a 44px close button.
  await expect(dialog.getByRole('timer')).toHaveCount(0)
  const close = dialog.getByRole('button', { name: 'Close mock exam' })
  expect((await close.boundingBox())?.width).toBeGreaterThanOrEqual(44)
  await dialog.getByRole('button', { name: 'Not now' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('Before you start (untimed): no timer, does not count, and the mode is fixed by the button chosen', async ({ page }) => {
  await openPage(page)
  await openMock(page, paper1Sim, 'untimed')
  const dialog = page.getByRole('dialog', { name: /^Mock exam:/ })
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Paper 1 Simulation 1, untimed')
  await expect(dialog.locator('.mock-rule__copy strong').first()).toHaveText('No timer')
  await expect(dialog.getByText(/^Doesn’t count towards Exam readiness/)).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Start the clock' })).toHaveCount(0)
  await begin(page, 'untimed')
  await expect(page.getByRole('timer')).toHaveText('Untimed · 0 min in')
})

test('the question strip and question: squares, flags, no feedback, words saved', async ({ page }) => {
  await openPage(page)
  await openMock(page, retained1, 'timed')
  await begin(page, 'timed')

  const squares = strip(page)
  await expect(squares).toHaveCount(25)
  expect((await squares.first().boundingBox())?.height).toBeGreaterThanOrEqual(44)
  await expect(squares.first()).toHaveAccessibleName('Question 1, not answered, current question')
  await expect(page.getByText('0 of 25 answered · 0 flagged')).toBeVisible()
  await expect(page.getByText('QUESTION 1 OF 25')).toBeVisible()
  await expect(page.locator('.mock-question__meta .exam-chip')).toHaveText('1 mark')
  await expect(page.locator('.mock-question__time')).toHaveText('about 1 min')

  // A multiple choice answer is just picked: no right or wrong is shown.
  const options = page.locator('.practice-question__options button')
  await options.nth(1).click()
  await expect(options.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.ui-answer-option--correct, .ui-answer-option--wrong, .ui-feedback-bar')).toHaveCount(0)
  await expect(squares.first()).toHaveAccessibleName('Question 1, answered, current question')

  await page.getByRole('button', { name: 'Flag to check' }).click()
  await expect(page.getByRole('button', { name: 'Flagged', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(squares.first()).toHaveAccessibleName('Question 1, answered, flagged, current question')
  await expect(page.getByText('1 of 25 answered · 1 flagged')).toBeVisible()

  // A written question: a box, a word count and "saved".
  await squares.nth(15).click()
  const box = page.getByLabel('Your answer')
  await box.fill('Revenue minus costs gives profit.')
  await expect(page.locator('.mock-question__saved')).toHaveText('5 words · saved')
  await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next question' })).toBeVisible()
})

test('the timer: not read out every second, yellow with words at 5 minutes, announced once at 5 and 1 minute', async ({ page }) => {
  await page.clock.install()
  await openPage(page)
  await openMock(page, paper1Sim, 'timed')
  await begin(page, 'timed')

  const timer = page.getByRole('timer')
  await expect(timer).toHaveAttribute('aria-live', 'off')
  await expect(timer).toHaveText(/^(2:00:00|1:59:5\d)$/)
  const announce = page.locator('.mock-announce')
  await expect(announce).toHaveAttribute('aria-live', 'polite')
  await expect(announce).toHaveText('')
  expect(await timer.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(await page.evaluate(() => getComputedStyle(document.body).backgroundColor))

  await page.clock.fastForward((120 * 60 - 299) * 1000)
  await expect(timer).toHaveClass(/mock-timer--low/)
  await expect(timer.locator('svg')).toBeVisible()
  await expect(timer).toHaveText(/^4:5\d$/)
  await expect(announce).toHaveText('5 minutes left.')
  await page.clock.fastForward(240 * 1000)
  await expect(announce).toHaveText('1 minute left.')
})

test('when time is up the answers are handed in and there is no way back to the questions', async ({ page }) => {
  await page.clock.install()
  await openPage(page)
  await openMock(page, paper1Sim, 'timed')
  await begin(page, 'timed')
  await page.getByLabel('Your answer').fill('Answer written before time ran out.')
  await page.clock.fastForward(121 * 60 * 1000)
  await expect(page.getByText('Time’s up.')).toBeVisible()
  await expect(page.getByText('Your answers have been handed in.')).toBeVisible()
  await expect(page.getByRole('group', { name: 'Questions' })).toHaveCount(0)
  await expect(page.getByText('Self-mark your paper')).toBeVisible()
  await expect(page.getByRole('timer')).toHaveCount(0)
})

test('leaving: the panel says what happens, a timed mock is saved as untimed, and it can be carried on', async ({ page }) => {
  await openPage(page)
  await openMock(page, paper1Sim, 'timed')
  await begin(page, 'timed')
  await strip(page).nth(15).click()
  await page.getByLabel('Your answer').fill('My saved answer about break-even.')
  await page.getByRole('button', { name: 'Close mock exam' }).click()
  const leave = page.getByRole('alertdialog', { name: 'Leave this mock?' })
  await expect(leave).toContainText('Your answers are saved and you can finish it later. The timer stops, so it won’t count as a timed mock.')
  await leave.getByRole('button', { name: 'Save and leave' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await openMock(page, paper1Sim, 'timed')
  const dialog = page.getByRole('dialog', { name: /^Mock exam:/ })
  await expect(dialog.getByText('You have a saved attempt.')).toBeVisible()
  await expect(dialog).toContainText('1 of 24 answered')
  await expect(dialog).toContainText('carries on untimed and won’t count as a timed mock')
  await dialog.getByRole('button', { name: 'Carry on' }).click()
  await expect(page.getByRole('timer')).toHaveText(/^Untimed · \d+ min in$/)
  await strip(page).nth(15).click()
  await expect(page.getByLabel('Your answer')).toHaveValue('My saved answer about break-even.')
})

test('autosave: a refresh never loses what was typed', async ({ page }) => {
  await openPage(page)
  await openMock(page, paper1Sim, 'untimed')
  await begin(page, 'untimed')
  await strip(page).nth(15).click()
  await page.getByLabel('Your answer').fill('Typed just before a refresh.')
  await page.getByRole('button', { name: 'Flag to check' }).click()
  await expect(page.locator('.mock-question__saved')).toContainText('saved')
  await page.waitForTimeout(700)
  await page.reload()
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
  await openMock(page, paper1Sim, 'untimed')
  await page.getByRole('dialog').getByRole('button', { name: 'Carry on' }).click()
  await strip(page).nth(15).click()
  await expect(page.getByLabel('Your answer')).toHaveValue('Typed just before a refresh.')
  await expect(page.getByRole('button', { name: 'Flagged', exact: true })).toBeVisible()
})

test('handing in an untimed mock saves each question’s marks but no whole-paper attempt, so it never feeds Exam readiness', async ({ page }) => {
  await openPage(page)
  const saved = await captureEvidence(page)
  await openMock(page, paper1Sim, 'untimed')
  await begin(page, 'untimed')
  await strip(page).last().click()
  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(page.getByText('Self-mark your paper')).toBeVisible()
  await page.getByRole('button', { name: 'Save exam result' }).click()
  await expect(page.getByRole('heading', { name: 'Exam result', exact: true })).toBeVisible()
  expect(saved.length).toBeGreaterThan(0)
  expect(saved.every((entry) => entry.source === 'exam_question')).toBe(true)
  expect(saved.some((entry) => entry.source === 'exam_attempt')).toBe(false)
})

test('handing in a timed mock that stayed timed saves the whole-paper attempt as timed', async ({ page }) => {
  await openPage(page)
  const saved = await captureEvidence(page)
  await openMock(page, paper1Sim, 'timed')
  await begin(page, 'timed')
  await strip(page).last().click()
  await page.getByRole('button', { name: 'Finish' }).click()
  await page.getByRole('button', { name: 'Save exam result' }).click()
  await expect(page.getByRole('heading', { name: 'Exam result', exact: true })).toBeVisible()
  const attempt = saved.find((entry) => entry.source === 'exam_attempt')
  expect(attempt).toBeDefined()
  expect(JSON.stringify(attempt)).toContain('"timed":true')
})

test('the case study opens by default on desktop, is a real details box, and shows the paper’s own context', async ({ page }) => {
  await openPage(page)
  await openMock(page, northstar, 'timed')
  await begin(page, 'timed')
  const box = page.locator('details.mock-case')
  await expect(box).toHaveAttribute('open', '')
  await expect(box.locator('summary')).toHaveText('Northstar Home Systems: scaling a connected heating-controls range')
  await expect(box.getByText('Northstar planning and investment data')).toBeVisible()
})

for (const width of [1440, 960, 620, 390, 320]) {
  test(`the mock never scrolls the page sideways at ${width}px, and the strip scrolls inside itself`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await openMock(page, paper1Sim, 'timed')
    await noSidewaysScroll(page)
    await begin(page, 'timed')
    await noSidewaysScroll(page)
    const squares = page.locator('.mock-strip__squares')
    const sizes = await squares.evaluate((node) => ({ scroll: node.scrollWidth, client: node.clientWidth }))
    if (width <= 620) expect(sizes.scroll).toBeGreaterThan(sizes.client)
    // Chips, the timer and the flag never wrap mid-label.
    const wrapped = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('.mock-timer, .mock-flag, .mock-question__meta .exam-chip, .mock-question__time')).filter((node) => node.getClientRects().length > 0 && node.getBoundingClientRect().height > 52).map((node) => node.textContent))
    expect(wrapped).toEqual([])
    await page.getByRole('button', { name: 'Close mock exam' }).click()
    await noSidewaysScroll(page)
  })
}

for (const theme of ['light', 'dark'] as const) {
  test(`accessibility: before you start, a question and the leave panel (${theme})`, async ({ page }) => {
    await openPage(page, { theme })
    await openMock(page, paper1Sim, 'timed')
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await begin(page, 'timed')
    await page.getByRole('button', { name: 'Flag to check' }).click()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.getByRole('button', { name: 'Close mock exam' }).click()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
}

if (shots) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1440, 834, 390]) {
      test(`screenshots ${theme} ${width}`, async ({ page }) => {
        test.setTimeout(60_000)
        await page.setViewportSize({ width, height: 900 })
        await page.clock.install()
        await openPage(page, { theme })
        const at = (name: string) => page.screenshot({ path: `${shots}/mock-${name}-${theme}-${width}.png` })

        await openMock(page, paper1Sim, 'timed')
        await at('before-timed')
        await page.getByRole('dialog').getByRole('button', { name: 'Not now' }).click()
        await openMock(page, paper1Sim, 'untimed')
        await at('before-untimed')
        await page.getByRole('dialog').getByRole('button', { name: 'Not now' }).click()

        await openMock(page, retained1, 'timed')
        await begin(page, 'timed')
        await page.locator('.practice-question__options button').nth(1).click()
        await page.getByRole('button', { name: 'Flag to check' }).click()
        await at('question-choice')
        await strip(page).nth(15).click()
        await page.getByLabel('Your answer').fill('Contribution per unit is price minus variable cost, so break-even output is fixed costs divided by it.')
        await page.waitForTimeout(700)
        await at('question-written')
        await page.clock.fastForward((120 * 60 - 250) * 1000)
        await at('low-time')
        await page.getByRole('button', { name: 'Close mock exam' }).click()
        await at('leave')
        await page.getByRole('button', { name: 'Save and leave' }).click()

        await openMock(page, northstar, 'untimed')
        await begin(page, 'untimed')
        await at('case-study-untimed')
      })
    }
  }
}
