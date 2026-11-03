import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, seedReturningStudent } from './practice-seed'

/**
 * #698 source-bounded signed-in *UI* proof. Auth is a synthetic seeded local
 * session, not a hosted production student; these Learn quick checks are not
 * objective scoring or graphical interpretation assessment.
 */
test('AQA Business §3.4.5 inventory chart plots actual delivery, reveals accessible data and never scores Learn self-checks', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Covers desktop, tablet and phone viewport widths within the one responsive test.')
  await seedReturningStudent(page)
  for (const width of [1440, 834, 390] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`${appPath}#/courses/${encodeURIComponent(businessCourseId)}/learn/operations-inventory-control-chart`)
    await expect(page.getByRole('heading', { name: 'Inventory control: read what the lines show' })).toBeVisible()
    const chart = page.locator('.learn-block--quantitative')
    await expect(chart).toBeVisible()
    await expect(chart.locator('svg[role="img"]')).toHaveAttribute('aria-label', /Stock level over time.*six-day horizontal gap/i)
    await expect(chart.locator('path.learn-chart__line')).toHaveCount(3)
    // A responsive resize may retain the mounted Learn chart's already-open
    // data state. Verify both states honestly instead of assuming remount.
    const toggle = chart.getByRole('button', { name: /^(Show the data|Hide the data)$/ })
    const initialExpansion = await toggle.getAttribute('aria-expanded')
    expect(['false', 'true']).toContain(initialExpansion)
    if (initialExpansion === 'false') {
      await toggle.click()
    }
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const table = chart.getByRole('table', { name: 'Stock on hand' })
    await expect(table).toBeVisible()
    await expect(table.getByText('Day 16 · before delivery')).toBeVisible()
    await expect(table.getByText('Day 16 · after delivery')).toBeVisible()
    await expect(table.getByRole('cell', { name: '200' })).toHaveCount(1)
    await expect(table.getByRole('cell', { name: '1,800', exact: true })).toHaveCount(2)
    const checks = page.locator('.ui-quick-check')
    await expect(checks).toHaveCount(2)
    await expect(checks.first()).toContainText('Not scored')
    const htmlWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(htmlWidth.scroll, `inventory chart at ${width}px`).toBeLessThanOrEqual(htmlWidth.client)
  }
  // An unscored Learn quick-check must not create independent Practice evidence.
  const quick = page.locator('.ui-quick-check').first()
  await quick.getByRole('button', { name: /Ordered on day 10/ }).click()
  await expect(quick.locator('[aria-live="polite"]')).toContainText('Yep.')
})
