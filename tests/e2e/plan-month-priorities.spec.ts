import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, planUserId, seedPlanStudent } from './plan-seed'

test('November Month view exposes supported weekly objectives instead of an apparently empty calendar', async ({ page }) => {
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
  await page.goto(`${appPath}#/plan?view=month&date=2026-11-06`)
  const priorities = page.getByRole('region', { name: 'Preparation priorities for November' })
  await expect(page.locator('.pln-month')).toBeVisible()
  await expect(priorities).toBeVisible()
  await expect(priorities).toContainText('provisional preparation goals')
  // Distant weekly objectives cannot be shown as dated calendar appointments.
  await expect(priorities).toContainText('Dated activities are recommended within the rolling two-week view')
  await expect(priorities.getByRole('button', { name: 'View week' }).first()).toBeVisible()
  await priorities.getByRole('button', { name: 'View week' }).first().click()
  await expect(page.locator('.pln-weekview')).toBeVisible()
})
