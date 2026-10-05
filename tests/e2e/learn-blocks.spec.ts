import { expect, test } from '@playwright/test'

/**
 * Learn blocks render from their content alone, for any subject hue, in light and dark, at every
 * layout width. Uses the dev-only fixture page (built with `vite build --mode learn-fixtures`).
 * Screenshots are attached to the report for review; they are not pixel baselines.
 */
const fixture = '/revision/learn-fixtures.html'
const hues = ['blue', 'violet-bio', 'umber'] as const
const themes = ['light', 'dark'] as const
const screenshotWidths = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'tablet', width: 834, height: 1100 }, { name: 'mobile', width: 390, height: 844 }] as const
const overflowWidths = [1440, 960, 620, 390, 320] as const

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Widths are set inside the tests; the desktop project covers them all.')
})

test('the Break-even output page never scrolls sideways at any layout width, in either theme', async ({ page }) => {
  for (const theme of themes) {
    for (const width of overflowWidths) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${fixture}?hue=blue&theme=${theme}&page=break-even`)
      await expect(page.locator('article.learn-reading-page')).toBeVisible()
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
      expect(scrollWidth, `${theme} at ${width}px is ${scrollWidth}px wide in a ${clientWidth}px window`).toBeLessThanOrEqual(clientWidth)
    }
  }
})

test('every block type renders for three hues in light and dark, with only the hue changing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(fixture)
  for (const theme of themes) {
    for (const hue of hues) {
      const section = page.locator(`[data-fixture="${hue}-${theme}"]`)
      for (const type of ['explanation', 'key-idea', 'example', 'worked-example', 'relationship', 'comparison', 'quantitative', 'misconception', 'recap']) {
        await expect(section.locator(`.learn-block--${type}`).first(), `${type} for ${hue} ${theme}`).toBeVisible()
      }
      await expect(section.locator('.ui-quick-check')).toBeVisible()
    }
  }
  const tints = await page.evaluate(() => [...document.querySelectorAll('[data-fixture$="-light"] .learn-block--recap')].map((element) => getComputedStyle(element).backgroundColor))
  expect(new Set(tints).size).toBe(3)
})

test('places the key idea in the right-hand margin on desktop and stacks it on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${fixture}?hue=blue&theme=light&page=break-even`)
  const explanation = page.locator('.learn-row .learn-block--explanation')
  const keyIdea = page.locator('.learn-row .learn-block--key-idea')
  const wide = { explanation: await explanation.boundingBox(), keyIdea: await keyIdea.boundingBox() }
  expect(wide.keyIdea!.x).toBeGreaterThan(wide.explanation!.x + wide.explanation!.width)
  expect(Math.round(wide.keyIdea!.width)).toBe(264)
  const article = (await page.locator('article.learn-reading-page').boundingBox())!
  const quantitative = (await page.locator('.learn-block--quantitative').boundingBox())!
  expect(Math.round(quantitative.width)).toBe(Math.round(article.width))

  await page.setViewportSize({ width: 834, height: 1100 })
  const stacked = { explanation: await explanation.boundingBox(), keyIdea: await keyIdea.boundingBox() }
  expect(stacked.keyIdea!.y).toBeGreaterThan(stacked.explanation!.y + stacked.explanation!.height - 1)
})

test('worked example steps, chart data and quick check are real buttons and announce changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(`${fixture}?hue=blue&theme=light&page=break-even`)
  const worked = page.locator('.learn-block--worked-example')
  await expect(worked.locator('.learn-worked__counter', { hasText: 'Step 1 of 3' })).toBeVisible()
  await worked.getByRole('button', { name: 'Show step 2' }).click()
  await expect(worked.locator('.learn-worked__counter', { hasText: 'Step 2 of 3' })).toBeVisible()
  await expect(worked.locator('[aria-live="polite"]')).toHaveText('Showing step 2 of 3.')
  await worked.getByRole('button', { name: 'Show all' }).click()
  await expect(worked.getByText('about 80 a day')).toBeVisible()
  await expect(worked.locator('.learn-worked__conclusion')).toBeVisible()
  await expect(worked.getByRole('button')).toHaveCount(0)

  const toggle = page.locator('.learn-block--quantitative').getByRole('button', { name: 'Show the data' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(page.locator('.learn-block--quantitative').getByRole('button', { name: 'Hide the data' })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.learn-chart__data table').first()).toBeVisible()
  await expect(page.locator('.learn-block--quantitative svg[role="img"]')).toHaveAttribute('aria-label', /costs and revenue/)

  const check = page.locator('.ui-quick-check')
  await check.getByRole('button', { name: /It stays the same/ }).click()
  await expect(check.locator('[aria-live="polite"]')).toContainText('Not quite.')
  await check.getByRole('button', { name: 'Try again' }).click()
})

for (const theme of themes) {
  for (const size of screenshotWidths) {
    test(`screenshot: Break-even output, ${size.name} ${size.width}px, ${theme}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.goto(`${fixture}?hue=blue&theme=${theme}&page=break-even`)
      await expect(page.locator('article.learn-reading-page')).toBeVisible()
      await testInfo.attach(`break-even-${size.width}-${theme}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
    })
  }
}
