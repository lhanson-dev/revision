import { expect, test, type Page } from '@playwright/test'
import { appPath, seedReturningStudent } from './practice-seed'

async function openExamPrep(page: Page) {
  await page.goto(`${appPath}#/subjects/business`)
  await expect(page).toHaveURL(/#\/courses$/)

  const courseCard = page.locator('.course-card').filter({ hasText: 'AQA A-level Business' }).first()
  await expect(courseCard.getByRole('button', { name: 'Open course' })).toBeVisible()
  await courseCard.getByRole('button', { name: 'Open course' }).click()

  const courseNav = page.getByRole('navigation', { name: 'AQA A-level Business navigation' })
  await expect(courseNav).toBeVisible()
  await courseNav.getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page.getByRole('heading', { level: 3, name: 'Mock exams' })).toBeVisible()
}

test('retained Paper 1 is clearly labelled and enforces its two printed choice sections', async ({ page }) => {
  await seedReturningStudent(page)
  await openExamPrep(page)

  const row = page.locator('.exam-mock').filter({ hasText: 'Paper 1: Business 1' })
  await expect(row.getByText('Revision-authored; not an official AQA paper.')).toBeVisible()
  await row.getByRole('button', { name: 'Start timed' }).click()
  await page.getByRole('button', { name: 'Start the clock' }).click()

  const squares = page.getByRole('group', { name: 'Questions' }).getByRole('button')
  // The last question is in a choice section; Finish stays off until both printed choices are made.
  await squares.last().click()
  const finish = page.getByRole('button', { name: 'Finish' })
  await expect(finish).toBeDisabled()
  await expect(page.getByText(/Choose one question from section P1-C and P1-D to finish\./)).toBeVisible()

  await squares.nth(21).click()
  await page.getByLabel('Attempt this question for section P1-C').check()
  await squares.nth(23).click()
  await page.getByLabel('Attempt this question for section P1-D').check()
  await squares.last().click()
  await expect(finish).toBeEnabled()
})

test('retained Paper 3 renders its shared context without horizontal page overflow', async ({ page }) => {
  await seedReturningStudent(page)
  await openExamPrep(page)

  await page.locator('.exam-mock').filter({ hasText: 'Paper 3: Business 3' }).getByRole('button', { name: 'Start timed' }).click()
  await page.getByRole('button', { name: 'Start the clock' }).click()

  await expect(page.getByText('Northstar Home Systems: scaling a connected heating-controls range')).toBeVisible()
  await expect(page.getByText('Northstar planning and investment data')).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})
