import { expect, test } from '@playwright/test'
import { practicePath, seedReturningStudent } from './practice-seed'

/**
 * Additional Practice C3/C4 visual contract. The historical B7 18-state
 * visual acceptance matrix stays unchanged. New activity baselines must be
 * reviewed by the Founder before any snapshots are committed.
 */
const cases = [
  { project: 'phone', theme: 'light' },
  { project: 'phone', theme: 'dark' },
  { project: 'desktop', theme: 'light' },
  { project: 'desktop', theme: 'dark' },
] as const

for (const visualCase of cases) {
  test(`focused Practice activity ${visualCase.project} ${visualCase.theme} visual contract`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== visualCase.project, `Captured only in the ${visualCase.project} canonical viewport.`)

    await page.addInitScript((theme) => localStorage.setItem('revision:theme', theme), visualCase.theme)
    await seedReturningStudent(page)
    await page.goto(practicePath)
    const start = page.getByRole('button', { name: /^Start [0-9]+ questions?$/ })
    await expect(start).toBeVisible()
    await start.click()
    await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.evaluate(async () => {
      await document.fonts.ready
      window.scrollTo(0, 0)
    })

    // No initial approved snapshots: fail closed and retain the exact captures.
    await expect(page).toHaveScreenshot(`practice-activity-${visualCase.theme}.png`, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    })
  })
}
