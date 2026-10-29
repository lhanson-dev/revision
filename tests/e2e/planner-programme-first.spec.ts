import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, planUserId, seedPlanStudent } from './plan-seed'

test('PLN-VALUE-01 unknown-evidence supported course has a programme objective and one shared next action', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  const topic = (await hero.getByRole('heading', { level: 2 }).innerText()).trim()
  expect(topic.length).toBeGreaterThan(2)
  await expect(hero.getByRole('button', { name: /^Start/ })).toBeVisible()
  await page.goto(`${appPath}#/plan`)
  await expect(page.locator('.pln-weekview')).toBeVisible()
  const next = page.locator('.pln-weekview .pln-row').filter({
    has: page.getByRole('button', { name: /^Up next/ }),
  })
  await expect(next).toContainText(topic)
  await page.locator('.pln-programme-disclosure > summary').click()
  const programme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(programme).toContainText('Preparation objectives')
  await expect(programme).toContainText(topic)
  await expect(programme).toContainText('Understanding has not been established')
  await expect(page.locator('.pln-month')).toHaveCount(0)
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toContainText(topic)
  await page.getByRole('button', { name: 'What should I do today?', exact: true }).click()
  await expect(page.getByRole('log').locator('.rev-chat__message--rev').last()).toContainText(topic)
})

test('PLN-VALUE-01 Month is an accessible strategic outlook before a genuine later exam, beyond the detailed task window', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  // The default Plan fixture's last paper is November 2026. A month after
  // that exam correctly has no allocated objectives. Supply a genuine later
  // paper to test the full-horizon March 2027 student programme instead.
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{
      assessment_id: 'business-long-horizon-paper', user_id: planUserId,
      course_id: businessCourseId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', title: 'Business future paper',
      assessment_date: '2027-06-11', relative_importance: 'normal',
      scope: {}, is_active: true,
    }]),
  }))
  await page.goto(`${appPath}#/plan?view=month&date=2027-03-01`)
  await page.locator('.pln-programme-disclosure > summary').click()
  const outlook = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(outlook).toContainText('Preparation towards your exams')
  await expect(outlook).toContainText('Objectives for this month')
  // A distant month can have no dated tasks when only a finite inventory
  // of current verified opportunities exists. This is a candid coverage
  // gap, not evidence that the student's preparation is complete.
  await expect(outlook).toContainText('11 June 2027')
  await expect(outlook).toContainText('No further verified activities are allocated this week')
  await expect(outlook).toContainText('not proof the course is complete')
  await expect(outlook).toContainText('not a measurement of all syllabus work')
  await expect(page.locator('.pln-month')).toBeVisible()
  expect((await new AxeBuilder({ page }).include('.pln-programme').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
})
