import { expect, test } from '@playwright/test'

test('protected Content Operations entry point renders without exposing admin actions before sign-in', async ({ page }) => {
  await page.goto('/revision/admin/')

  await expect(page.getByRole('heading', { name: 'Content Operations' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add course' })).toHaveCount(0)
})
