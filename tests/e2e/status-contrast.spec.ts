import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, seedPlanStudent } from './plan-seed'

for (const theme of ['light', 'dark'] as const) test(`review: shared information status meets contrast in ${theme}`, async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Shared token/component check in both themes.')
  await seedPlanStudent(page, { sessions: null })
  await page.addInitScript((value) => localStorage.setItem('revision.theme', value), theme)
  await page.goto(`${appPath}#/plan`)
  const status = page.locator('.ui-status--info')
  await expect(status).toContainText('Your saved sessions could not be loaded')
  const runtime = page.locator('.planner-runtime')
  // Use the real theme owner; the test covers the component even if account defaults override stored theme.
  await runtime.evaluate((node, value) => node.setAttribute('data-theme', value), theme)
  const current = await new AxeBuilder({ page }).include('.ui-status--info').withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(current.violations).toEqual([])
  // Reproduce CI's original pair on this real component, then restore the canonical token.
  await runtime.evaluate((node) => (node as HTMLElement).style.setProperty('--status-info-fg', '#3c72a2'))
  const original = await new AxeBuilder({ page }).include('.ui-status--info').withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(original.violations.map((v) => v.id)).toContain('color-contrast')
  await runtime.evaluate((node) => (node as HTMLElement).style.removeProperty('--status-info-fg'))
  expect((await new AxeBuilder({ page }).include('.ui-status--info').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
})
