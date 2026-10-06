import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { examPrepPath, seedExamPrepStudent } from './exam-prep-seed'

const widths = [1440, 960, 620, 390, 320]
const shots = process.env.EXAM_PREP_SHOTS

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the tests; the desktop project covers them all.')
})

async function open(page: Page, options: Parameters<typeof seedExamPrepStudent>[1] = {}) {
  await seedExamPrepStudent(page, options)
  await page.goto(examPrepPath)
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
}

async function noSidewaysScroll(page: Page) {
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1)
}

test('Exam Prep opens in the normal shell with the course header and Exam Prep selected', async ({ page }) => {
  await open(page)
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  const tabs = page.locator('nav.course-nav')
  await expect(tabs.getByRole('button', { name: 'Exam Prep', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('button', { name: 'Leave Exam Prep' })).toHaveCount(0)
  await expect(page.locator('.planner-runtime--focus')).toHaveCount(0)
})

test('the page is in the right order and says only true things', async ({ page }) => {
  await open(page)
  const order = await page.locator('.exam-prep h2, .exam-prep h3').allTextContents()
  expect(order).toEqual(['Get ready for the exams', 'Your papers', 'What examiners look for', 'Mock exams'])
  await expect(page.getByText(/^EXAM PREP · Business · AQA/i)).toBeVisible()
  await expect(page.getByText(/^First exam: Paper 1 · Tue 11 May 2027 · \d+ weeks away$/)).toBeVisible()
  await expect(page.locator('.exam-paper')).toHaveCount(3)
  await expect(page.locator('.exam-paper').first()).toContainText('2 hours · 100 marks · a third of your A-level')
  await expect(page.locator('.exam-paper').first()).toContainText('6 of 10 topics covered')
})

test('with no exam date it says so instead of inventing one', async ({ page }) => {
  await open(page, { examDate: null })
  await expect(page.getByText(/^First exam:/)).toHaveCount(0)
  await expect(page.getByText('No exam date set yet.', { exact: false })).toBeVisible()
})

test('a paper opens one at a time and shows how its 2 hours run', async ({ page }) => {
  await open(page)
  const paper1 = page.locator('.exam-paper').nth(0)
  const paper2 = page.locator('.exam-paper').nth(1)
  await expect(paper1).toHaveAttribute('aria-expanded', 'false')
  await paper1.click()
  await expect(paper1).toHaveAttribute('aria-expanded', 'true')
  const runs = page.getByRole('region', { name: 'How Paper 1 runs' })
  await expect(runs.getByText('2 hours, start to finish')).toBeVisible()
  await expect(runs.locator('.exam-run')).toHaveCount(4)
  await expect(runs.locator('.exam-run').first()).toContainText('15 marks')
  await expect(runs.locator('.exam-run').first()).toContainText('about 17 min')
  await expect(runs.locator('.exam-run').nth(1)).toContainText('about 40 min')
  await expect(runs.getByText('Minutes are a suggestion')).toBeVisible()
  await expect(runs.getByText('Leaves 5 minutes to check.')).toBeVisible()
  await expect(runs.getByText('On the day')).toHaveCount(0)
  await paper2.click()
  await expect(paper1).toHaveAttribute('aria-expanded', 'false')
  await expect(paper2).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('region', { name: 'How Paper 2 runs' }).locator('.exam-run')).toHaveCount(3)
  await paper2.click()
  await expect(paper2).toHaveAttribute('aria-expanded', 'false')
})

test('examiners: the four objectives from the factory’s Exam Truth, and no wording the factory has not approved', async ({ page }) => {
  await open(page)
  await expect(page.locator('.exam-ao')).toHaveCount(4)
  await expect(page.locator('.exam-ao__chip')).toHaveText(['AO1', 'AO2', 'AO3', 'AO4'])
  await expect(page.locator('.exam-ao__name')).toHaveText(['Knowledge and understanding', 'Application to business contexts', 'Analysis of business issues and influences', 'Evaluation and evidence-based judgement'])
  await expect(page.locator('.exam-ao').first()).toContainText('22–25% of your A-level marks')
  // Not approved by the factory yet, so not shown.
  await expect(page.locator('.exam-commands')).toHaveCount(0)
  await expect(page.getByText('Command words')).toHaveCount(0)
  await expect(page.getByText('marked in levels')).toHaveCount(0)
})

test('mock exams: real mocks, honest notes, two buttons, and the last mock', async ({ page }) => {
  await open(page, { attempts: true })
  const rows = page.locator('.exam-mock')
  expect(await rows.count()).toBeGreaterThanOrEqual(3)
  const first = rows.first()
  await expect(first.getByRole('button', { name: 'Start timed' })).toBeVisible()
  await expect(first.getByRole('button', { name: 'Practise untimed' })).toBeVisible()
  await expect(first.locator('.exam-mock__meta')).toContainText(/^Paper \d style · \d+ questions? · \d+ marks$/)
  await expect(page.getByText(/^Last mock: .* · 21 of 100 · Timed · /)).toBeVisible()
})

test('Start timed opens the mock as a pop-up over the page and closing returns focus', async ({ page }) => {
  await open(page)
  const button = page.locator('.exam-mock').first().getByRole('button', { name: 'Start timed' })
  await button.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(button).toBeFocused()
})

for (const width of widths) {
  test(`no sideways scroll at ${width}px, with a paper open`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await open(page)
    await page.locator('.exam-paper').first().click()
    await expect(page.getByRole('region', { name: 'How Paper 1 runs' })).toBeVisible()
    await noSidewaysScroll(page)
    // Labels, chips and times never wrap mid-label.
    const wrapped = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('.exam-chip, .exam-ao__chip, .exam-run__time, .exam-mock__time, .exam-button')).filter((node) => { const range = document.createRange(); range.selectNodeContents(node); return range.getClientRects().length > 1 && node.getClientRects().length > 0 && getComputedStyle(node).whiteSpace !== 'nowrap' }).map((node) => node.textContent))
    expect(wrapped).toEqual([])
  })
}

test('no accessibility violations, light and dark', async ({ page }) => {
  await open(page)
  await page.locator('.exam-paper').first().click()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

if (shots) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1440, 834, 390]) {
      test(`screenshot ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 })
        await open(page, { theme, attempts: true })
        await page.locator('.exam-paper').first().click()
        await page.waitForTimeout(300)
        await page.screenshot({ path: `${shots}/exam-prep-page-${theme}-${width}.png`, fullPage: true })
      })
    }
  }
}

if (shots) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [1440, 834, 390]) {
      test(`screenshot pop-up ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await open(page, { theme })
        await page.locator('.exam-mock').filter({ hasText: /Paper 1 Simulation/ }).getByRole('button', { name: 'Start timed' }).click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await page.waitForTimeout(300)
        await page.screenshot({ path: `${shots}/exam-prep-mock-popup-${theme}-${width}.png` })
      })
    }
  }
}
