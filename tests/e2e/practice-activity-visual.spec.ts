import { expect, test } from '@playwright/test'
import { practicePath, seedReturningStudent } from './practice-seed'

/**
 * Additional Practice C3/C4 visual contract. The historical B7 18-state
 * visual acceptance matrix stays unchanged. The Founder explicitly approved
 * all four active Practice screenshots on 10 October 2026 after reviewing
 * CI #2936 (artifact 11663751219) alongside both Practice start screens.
 * SHA-256 protects every static pixel of the approved screenshots. On phone,
 * the only excluded pixels are the 64x64 bounding square around the living REV
 * dock icon (its independent animation produces nondeterministic frames).
 * The full unmasked screenshot is still attached for inspection; any change
 * outside that square fails closed. The hashes below were derived from the
 * Founder-reviewed native CI #2936 PNGs using the same RGBA normalisation.
 */
const cases = [
  { project: 'phone', theme: 'light', sha256: '5bf11bece88b8b726337ad22e957a31bf654776ea4b2c03c971a4eb4b88c50a0' },
  { project: 'phone', theme: 'dark', sha256: '738fad8f44753dfacb0a7422e6cb3a6b22970336a76f84e381a8b2d7c14f7f4b' },
  { project: 'desktop', theme: 'light', sha256: 'd3ba2dc3791abffa78e69a6e8239dfb2ddcc1e97fec3c45ba0865888cd7253c0' },
  { project: 'desktop', theme: 'dark', sha256: '02112642af5ffc011ee697a8a3633769dc87a99eeb3c7e581481fde8db6305b6' },
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
    // Preserve the approved top-of-page framing and allow fonts/layout to settle.
    // Only the animated central REV dock glyph varies between native captures.
    await page.evaluate(async () => {
      await document.fonts.ready
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await expect(page.getByRole('heading', { name: 'Business', exact: true, level: 1 })).toBeInViewport()

    // Keep the original, unmasked PNG for visual evidence. Hash decoded RGBA
    // pixels instead of compression bytes; blank only the moving REV glyph on
    // phone. All remaining pixels retain exact zero-tolerance comparison.
    const screenshot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
    })
    await testInfo.attach(`practice-activity-${visualCase.theme}-${visualCase.project}.png`, {
      body: screenshot,
      contentType: 'image/png',
    })
    const digest = await page.evaluate(async ({ encoded, maskAnimatedRev }) => {
      const image = new Image()
      image.src = `data:image/png;base64,${encoded}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Practice visual comparison needs a 2D canvas')
      context.drawImage(image, 0, 0)
      if (maskAnimatedRev) {
        // 390x844 phone baseline: mask x163–226, y766–829 only.
        // The 54x54 changing-pixel region is entirely inside this square.
        context.fillStyle = '#000000'
        context.fillRect(Math.floor((canvas.width - 64) / 2), canvas.height - 78, 64, 64)
      }
      const rawPixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      const bytes = await crypto.subtle.digest('SHA-256', rawPixels)
      return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
    }, { encoded: screenshot.toString('base64'), maskAnimatedRev: visualCase.project === 'phone' })
    expect(digest).toBe(visualCase.sha256)
  })
}
