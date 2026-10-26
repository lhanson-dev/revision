import { expect, test } from '@playwright/test'

test('isolated learner journey assurance requires the real database', async ({ page }) => {
  test.skip(process.env.REVISION_BROWSER_DB_INTEGRATION !== '1', 'Local Supabase browser assurance only')
  await page.goto('/revision/app/')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})
