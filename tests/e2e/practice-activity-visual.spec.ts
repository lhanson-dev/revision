import { createHash } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { practicePath, seedReturningStudent } from './practice-seed'

/**
 * Additional Practice C3/C4 visual contract. The historical B7 18-state
 * visual acceptance matrix stays unchanged. The Founder explicitly approved
 * all four active Practice screenshots on 10 October 2026 after reviewing
 * CI #2936 (artifact 11663751219) alongside both Practice start screens.
 * Each approved screenshot is SHA-256 pinned below; any visual drift fails
 * closed and its new PNG is attached for review, never auto-approved.
 */
const cases = [
  { project: 'phone', theme: 'light', sha256: '78f8c8078cd86423a6566d982558ce32356b29281007c9350864394714e629a5' },
  { project: 'phone', theme: 'dark', sha256: '665438758ac8631ea228dd1865ea9f7461dd2662084a66ad2cd6e01cb53cd495' },
  { project: 'desktop', theme: 'light', sha256: '3746582265280051fd3d8e5e21efdd3eeb2e2118152dab5ce3ed45ae537c442a' },
  { project: 'desktop', theme: 'dark', sha256: 'c39dc3a270e9962c468f6628f8b96fe5c4848729feab46ca199beb4266add3fa' },
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
    // Phone browsers can still be in a smooth-scroll transition from the
    // activity launch. The prior screenshot assertion waited for stability;
    // a single immediate page.screenshot() did not. Explicitly restore the
    // actual page viewport before capturing the already-approved pixels.
    await page.evaluate(async () => {
      await document.fonts.ready
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(page.getByRole('heading', { name: 'Business', exact: true, level: 1 })).toBeInViewport()

    // Digest comparison is exact (stricter than a pixel-difference tolerance).
    // Always attach the native PNG so an unexpected change remains inspectable.
    const screenshot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
    })
    await testInfo.attach(`practice-activity-${visualCase.theme}-${visualCase.project}.png`, {
      body: screenshot,
      contentType: 'image/png',
    })
    const digest = createHash('sha256').update(screenshot).digest('hex')
    expect(digest).toBe(visualCase.sha256)
  })
}
