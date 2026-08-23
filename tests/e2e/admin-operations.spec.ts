import { expect, test, type Page } from '@playwright/test'
import { mockAuthenticatedSession, mockProductionOperations } from './support/mock-app'

async function openAdmin(page: Page) {
  await mockAuthenticatedSession(page)
  await mockProductionOperations(page)
  await page.goto('/revision/app/#/admin')
  await expect(page.getByRole('heading', { name: 'Admin', exact: true })).toBeVisible()
}

async function waitForAdminPageToSettle(page: Page) {
  await page.waitForTimeout(250)
}

test('admin operations dashboard shows high-level evidence and drills into detail views', async ({ page }) => {
  await openAdmin(page)

  await expect(page.getByRole('heading', { name: 'Operations overview' })).toBeVisible()
  await expect(page.getByText('Production evidence')).toBeVisible()
  await expect(page.getByText('Path to live')).toBeVisible()
  await expect(page.getByText('Users')).toBeVisible()
  await expect(page.getByText('Learning activity')).toBeVisible()
  await expect(page.getByText('Assurance')).toBeVisible()
  await expect(page.getByText('Content operations')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Content Operations' }).click()
  await expect(page.getByRole('heading', { name: 'Content Operations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Add course' })).toBeVisible()

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Users' }).click()
  await expect(page).toHaveURL(/#\/admin\/users$/)
  await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible()
  await expect(page.getByText('Admin and test accounts excluded')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Activity' }).click()
  await expect(page.getByRole('heading', { name: 'Learning Activity' })).toBeVisible()
  await expect(page.getByText('Flashcards')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'System Health' }).click()
  await expect(page.getByRole('heading', { name: 'System Health' })).toBeVisible()
  await expect(page.getByText('Attention needed').first()).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Assurance' }).click()
  await expect(page).toHaveURL(/#\/admin\/assurance$/)
  await expect(page.getByRole('heading', { name: 'Founder Assurance' })).toBeVisible()
  await expect(page.getByText('Evidence, not a confidence score')).toBeVisible()
  await expect(page.getByText('no Founder approval marker is recorded')).toBeVisible()
  await expect(page.getByText('0 P0 · 1 P1 · 0 P2 open')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Defects' })).toBeVisible()
  await expect(page.getByText('No known open P0/P1/P2 defects')).toHaveCount(0)
  await expect(page.getByText('DEF-2026-007')).toBeVisible()
  await expect(page.getByText('Fix in review')).toBeVisible()
  await expect(page.getByText('DEF-2026-001')).toHaveCount(0)
  await expect(page.getByText('DEF-2026-002')).toHaveCount(0)
  await expect(page.getByText('DEF-2026-003')).toHaveCount(0)
  await expect(page.getByText('DEF-2026-004')).toHaveCount(0)
  await expect(page.getByText('DEF-2026-005')).toHaveCount(0)
  await expect(page.getByText('DEF-2026-006')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Critical journeys' })).toBeVisible()
  await expect(page.getByText('JRN-04')).toBeVisible()
  await expect(page.getByText('DATA-01')).toBeVisible()
  await waitForAdminPageToSettle(page)

  await page.getByRole('navigation', { name: 'Admin operations' }).getByRole('button', { name: 'Content Operations' }).click()
  await expect(page.getByRole('heading', { name: 'Content Operations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Add course' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Course Jobs' })).toBeVisible()
})
