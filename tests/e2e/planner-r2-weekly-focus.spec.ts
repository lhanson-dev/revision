import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, planUserId, seedPlanStudent } from './plan-seed'

const date = '2027-06-11'

function futurePaper() {
  return {
    assessment_id: 'full-horizon-paper', user_id: planUserId, course_id: businessCourseId,
    subject_id: 'business', module_id: null, assessment_type: 'public_exam',
    title: 'Business final paper', assessment_date: date,
    relative_importance: 'normal', scope: {}, is_active: true,
  }
}

test('R2-08 actual long-range weeks immediately identify changing authored study topics', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([futurePaper()]),
  }))
  let savedWrites = 0
  page.on('request', (request) => {
    if (request.url().includes('/learner_planned_sessions') && request.method() !== 'GET') savedWrites += 1
  })
  await page.goto(`${appPath}#/plan`)
  const outlook = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(outlook).toContainText('Business final paper', { timeout: 15000 })
  const preview = outlook.locator('ol.pln-programme__weeks').first()
  await expect(preview.locator(':scope > li')).toHaveCount(3)
  const focusLists = preview.getByRole('list', { name: /Preparation objectives for week of/i })
  await expect(focusLists).toHaveCount(3)
  const topics = await focusLists.allTextContents()
  expect(topics.every((topic) => topic.includes('Business') && topic.trim().length > 20)).toBe(true)
  expect(new Set(topics).size).toBe(3)
  expect(topics.every((topic) => topic.includes('before the paper') && topic.includes('opportunity'))).toBe(true)
  await outlook.locator('summary').click()
  await expect(outlook.getByText('Business final paper', { exact: false }).last()).toBeVisible()
  await expect(outlook.getByRole('button', { name: /View week/i }).last()).toBeVisible()
  expect(savedWrites).toBe(0)
  expect((await new AxeBuilder({ page }).include('.pln-programme').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
})

test('R2-04 a week with zero declared study time does not invent a study agenda', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([futurePaper()]),
  }))
  await page.route('**/rest/v1/revision_availability_profiles**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({
      user_id: planUserId, timezone: 'Europe/London', weekday_minutes: 0, weekend_minutes: 0,
      monday_minutes: 0, tuesday_minutes: 0, wednesday_minutes: 0, thursday_minutes: 0,
      friday_minutes: 0, saturday_minutes: 0, sunday_minutes: 0,
    }),
  }))
  await page.goto(`${appPath}#/plan`)
  const preview = page.getByRole('region', { name: 'Your full exam programme' })
    .locator('ol.pln-programme__weeks').first()
  await expect(preview.getByRole('list', { name: /Preparation objectives for week of/i })).toHaveCount(0)
  await expect(preview).toContainText('No revision time saved for this week.')
})
