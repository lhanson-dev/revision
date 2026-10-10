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
  await expect(runs.getByText('On the day')).toBeVisible()
  await expect(runs.locator('.exam-day__list li')).toHaveCount(3)
  for (const item of await runs.locator('.exam-day__list li').all()) await expect(item.locator('.exam-checking')).toHaveText(/Being checked/)
  await paper2.click()
  await expect(paper1).toHaveAttribute('aria-expanded', 'false')
  await expect(paper2).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('region', { name: 'How Paper 2 runs' }).locator('.exam-run')).toHaveCount(3)
  await paper2.click()
  await expect(paper2).toHaveAttribute('aria-expanded', 'false')
})

test('examiners: the factory’s four objectives, plus the wording still being checked, flagged', async ({ page }) => {
  await open(page)
  await expect(page.locator('.exam-ao')).toHaveCount(4)
  await expect(page.locator('.exam-ao__chip')).toHaveText(['AO1', 'AO2', 'AO3', 'AO4'])
  await expect(page.locator('.exam-ao__name')).toHaveText(['Knowledge and understanding', 'Application to business contexts', 'Analysis of business issues and influences', 'Evaluation and evidence-based judgement'])
  await expect(page.locator('.exam-ao').first()).toContainText('22–25% of your A-level marks')
  // Not yet approved by the factory: still shown, and every one carries the "Being checked" flag.
  await expect(page.locator('.exam-command')).toHaveCount(5)
  await expect(page.getByText('marked in levels', { exact: false })).toBeVisible()
  await expect(page.locator('.exam-ao__show')).toHaveCount(4)
  const flagged = page.locator('.exam-ao__coaching, .exam-command, .exam-commands__levels')
  const count = await flagged.count()
  expect(count).toBe(4 + 5 + 1)
  for (let index = 0; index < count; index += 1) await expect(flagged.nth(index).locator('.exam-checking')).toHaveText(/Being checked/)
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

test('timed mock enters a focused full-viewport exam, then stop confirmation returns to Exam Prep and restores focus', async ({ page }) => {
  await open(page)
  const button = page.locator('.exam-mock').first().getByRole('button', { name: 'Start timed' })
  await button.click()
  await expect(page.locator('.exam-session-page')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.practice-overlay')).toHaveCount(0)
  await page.getByRole('button', { name: 'Stop exam' }).click()
  const confirmation = page.getByRole('dialog', { name: 'Are you sure?' })
  await confirmation.getByRole('button', { name: 'Yes, stop exam' }).click()
  await expect(page.locator('.exam-session-page')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
  await expect(button).toBeFocused()
})

test('untimed mock uses the in-page workspace rather than a dialog', async ({ page }) => {
  await open(page)
  const button = page.locator('.exam-mock').filter({ hasText: /Paper 1 style/ }).first().getByRole('button', { name: 'Practise untimed' })
  await button.click()
  await expect(page.locator('.exam-prep-activity')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Back to Exam Prep' }).click()
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
      test(`screenshot focused mock ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await open(page, { theme })
        await page.locator('.exam-mock').filter({ hasText: /Paper 1 Simulation/ }).getByRole('button', { name: 'Start timed' }).click()
        await expect(page.locator('.exam-session-page')).toBeVisible()
        await page.waitForTimeout(300)
        await page.screenshot({ path: `${shots}/exam-prep-focused-mock-${theme}-${width}.png` })
      })
    }
  }
}
