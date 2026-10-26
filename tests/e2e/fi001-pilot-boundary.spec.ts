import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, seedPlanStudent } from './plan-seed'

test.skip(process.env.REVISION_PILOT_GATE_CHECK !== '1', 'Production-mode feature access is tested with assurance overrides disabled')

test('ordinary authenticated learner gets programme-first Plan without a pilot claim', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.goto(appPath + '#/plan')
  await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
  await page.locator('.pln-programme-disclosure > summary').click()
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toBeVisible()
  await expect(page.getByText('Planner pilot:', { exact: false })).toHaveCount(0)
})

test('ordinary signed-in learner can open published Business Exam Prep', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.goto(appPath + '#/courses/' + encodeURIComponent(businessCourseId) + '/exam-prep')
  await expect(page.getByRole('main', { name: 'Exam preparation pilot restriction' })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Get ready for the exams' })).toBeVisible()
})
