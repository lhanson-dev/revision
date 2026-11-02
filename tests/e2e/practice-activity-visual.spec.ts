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
/**
 * PR #618 learner consolidation: Founder approved the visual bundle on
 * 13 October 2026: "images are approved so you can continue".
 * The 20 changed active baselines use CI run 38443372753 on head
 * 970db224507a28fec2c4e305ca6175e1af85b9f6; initial/retry digests agree.
 * Provenance and old/new digests: audits/2026-10-13-learner-616-visual-approval.md.
 * Existing comparison algorithms, masks and unchanged baselines are retained.
 * This is visual approval only; PR #618 merge approval remains separate.
 */
/**
 * PR #780 LF-10 visual direction approval (Founder, 2 November 2026):
 * all four changed active-Practice phone/desktop × light/dark frames reviewed
 * from exact candidate head 1f32a0d28f4a10665cee31e0e65182466564afbf,
 * CI 41500300206; phone artifact 13167514743, desktop artifact 13167889595.
 * See PR #780 Founder approval comment and the technical B4 implementation note
 * for old/new digest mapping and evidence boundaries. This is approval of
 * the larger mark-label direction, NOT merge approval or real learner acceptance.
 * The pixel hash, full-PNG attachments and phone REV dock mask are unchanged.
 */
const cases = [
  { project: 'phone', theme: 'light', sha256: '9c78f928c7fb0be57278a8e1e0916d747271830359817a193c1f381619fcdb89' },
  { project: 'phone', theme: 'dark', sha256: 'b071b8ea37d4aa5df8d33c7df56a5b089958091489d672fe51af8339d639db4a' },
  { project: 'desktop', theme: 'light', sha256: 'c76e0074741b04732725e8cc1e2310437523f664d589918dc90e41faa26e9906' },
  { project: 'desktop', theme: 'dark', sha256: '4ff48ab96b498c070667f8cd7fea54c8bd563f4afca9cfa6db21c19bc6daafc4' },
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
