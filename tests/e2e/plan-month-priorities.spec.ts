import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, planUserId, seedPlanStudent } from './plan-seed'

async function seedFutureExam(page: Parameters<typeof seedPlanStudent>[0]) {
  await seedPlanStudent(page, { sessions: [] })
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([{
      assessment_id: 'business-2027', user_id: planUserId,
      course_id: businessCourseId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', relative_importance: 'normal',
      title: 'Business final paper', assessment_date: '2027-06-11',
      scope: {}, is_active: true,
    }]),
  }))
}

test('current Month shows genuine provisional objectives and a link into Week', async ({ page }) => {
  await seedFutureExam(page)
  await page.goto(`${appPath}#/plan?view=month&date=2026-10-06`)
  const priorities = page.getByRole('region', { name: 'Preparation priorities for October' })
  await expect(page.locator('.pln-month')).toBeVisible()
  await expect(priorities).toContainText('provisional preparation goals')
  await expect(priorities).toContainText('Dated activities are recommended within the rolling two-week view')
  await expect(priorities.getByRole('button', { name: 'View week' }).first()).toBeVisible()
  await priorities.getByRole('button', { name: 'View week' }).first().click()
  await expect(page.locator('.pln-weekview')).toBeVisible()
})

test('distant Month never invents appointments or implies course completion', async ({ page }) => {
  await seedFutureExam(page)
  await page.goto(`${appPath}#/plan?view=month&date=2026-11-06`)
  const priorities = page.getByRole('region', { name: 'Preparation priorities for November' })
  await expect(page.locator('.pln-month')).toBeVisible()
  await expect(priorities).toContainText('No supported preparation objectives have been allocated to this month')
  await expect(priorities).toContainText('does not mean the exams are prepared for')
  await expect(priorities.getByRole('button', { name: 'View week' })).toHaveCount(0)
})
