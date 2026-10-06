import { expect, test, type Page } from '@playwright/test'
import { appPath, businessCourseId, seedReturningStudent } from './practice-seed'

async function openExamPrep(page: Page) {
  await page.goto(`${appPath}#/courses/${encodeURIComponent(businessCourseId)}/exam-prep`)
  await expect(page.getByRole('navigation', { name: 'AQA A-level Business navigation' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Choose a paper' })).toBeVisible()
}

test('retained Paper 1 is clearly labelled and enforces its two printed choice sections', async ({ page }) => {
  await seedReturningStudent(page)
  await openExamPrep(page)

  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 1: Business 1' })
  await paper.locator('summary').click()
  const retained = paper.locator('.exam-simulator-section').filter({ hasText: "Revision-authored; not an official AQA paper." }).first()

  await expect(retained.getByText("A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.")).toBeVisible()
  await expect(retained.getByText(/150 marks are printed; you attempt 100 marks/)).toBeVisible()
  await retained.getByRole('button', { name: 'Start timed exam' }).click()

  const finish = page.getByRole('button', { name: 'Finish and self-mark' })
  await expect(finish).toBeDisabled()

  const questions = page.getByRole('navigation', { name: 'Exam questions' }).getByRole('button')
  await questions.nth(21).click()
  await page.getByLabel('Attempt this question for section P1-C').check()
  await questions.nth(23).click()
  await page.getByLabel('Attempt this question for section P1-D').check()
  await expect(finish).toBeEnabled()
})

test('retained Paper 3 renders its shared context without horizontal page overflow', async ({ page }) => {
  await seedReturningStudent(page)
  await openExamPrep(page)

  const paper = page.locator('details.exam-paper-card').filter({ hasText: 'Paper 3: Business 3' })
  await paper.locator('summary').click()
  const retained = paper.locator('.exam-simulator-section').filter({ hasText: "Revision-authored; not an official AQA paper." }).first()
  await retained.getByRole('button', { name: 'Start timed exam' }).click()

  await expect(page.getByRole('region', { name: 'Northstar Home Systems: scaling a connected heating-controls range' })).toBeVisible()
  await expect(page.getByText('Northstar planning and investment data')).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})
