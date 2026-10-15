import { expect, test } from '@playwright/test'
import { appPath, seedPlanStudent } from './plan-seed'

// Canonical app smoke; the same checks run at phone/tablet/desktop widths.
test('R1-13 hides derived tasks when accepted commitments cannot be loaded', async ({ page }) => {
  await seedPlanStudent(page, { sessions: null })
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByText('Your saved sessions could not be loaded.', { exact: false })).toBeVisible()
  await expect(page.locator('.pln-row[data-kind="suggested"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Add session', exact: true })).toHaveCount(0)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('R1-13 exact supported Plan Start keeps the chosen course/topic and treatment identity', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  const row = page.locator('.pln-row[data-kind="suggested"]').first()
  await expect(row).toBeVisible()
  const offered = await row.innerText()
  await row.getByRole('button', { name: /^(Start|Up next)/ }).click()
  if (offered.includes('Learn')) {
    await expect(page).toHaveURL(/#\/courses\/aqa%3Aaqa-a-level%3A7132\/learn\/[^/]+$/)
    await expect(page.locator('article.learn-reading-page')).toBeVisible()
  } else {
    await expect(page.locator('.home-focused-activity')).toBeVisible()
    await expect(page.locator('.home-focused-practice')).toContainText(/Quick check|Flashcards|Exam practice/)
  }
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
