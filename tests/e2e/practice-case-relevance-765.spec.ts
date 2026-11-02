import { expect, test, type Page } from '@playwright/test'
import { captureEvidence, practicePath, seedReturningStudent } from './practice-seed'

async function openBusinessPractice(page: Page) {
  await seedReturningStudent(page)
  const saved = await captureEvidence(page)
  await page.goto(practicePath)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  return saved
}

async function selectTopic(page: Page, topic: string) {
  await page.getByRole('button', { name: 'Change topic' }).click()
  // SelectField renders a native select inside the existing topic-picker group.
  // Target that stable UI control, not an exact accessible-name match that can
  // include the nested option text in some browser accessibility trees.
  const selector = page.locator('.practice-start__topic-picker select')
  await expect(selector).toBeVisible()
  await selector.selectOption(topic)
}

test('LF-04: Business Practice opens the case relevant to the topic, not the first global case', async ({ page }) => {
  const saved = await openBusinessPractice(page)
  await selectTopic(page, 'strategic-position')
  const warmup = page.getByRole('region', { name: 'Warm-up' })
  await warmup.getByRole('button', { name: /^Case study/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pulse Learning Ltd' })).toBeVisible()
  await expect(page.getByText(/Porter’s five forces/).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Northstar Meals plc' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Back to practice' }).click()
  expect(saved).toHaveLength(0)
})

test('LF-04: absent Finance-specific case stays hidden rather than showing unrelated investment-appraisal material', async ({ page }) => {
  const saved = await openBusinessPractice(page)
  await selectTopic(page, 'finance')
  const warmup = page.getByRole('region', { name: 'Warm-up' })
  await expect(warmup.getByRole('button', { name: /^Case study/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Start \d+ questions?$/ })).toBeVisible()
  expect(saved).toHaveLength(0)
})

test('LF-04: Operations retains its genuinely relevant case and original contextual questions', async ({ page }) => {
  const saved = await openBusinessPractice(page)
  await selectTopic(page, 'operations')
  await page.getByRole('region', { name: 'Warm-up' }).getByRole('button', { name: /^Case study/ }).click()
  await expect(page.getByRole('heading', { name: 'Northstar Meals plc' })).toBeVisible()
  await expect(page.getByText(/96% capacity utilisation/).first()).toBeVisible()
  await expect(page.getByText('Question 1 of 5')).toBeVisible()
  expect(saved).toHaveLength(0)
})
