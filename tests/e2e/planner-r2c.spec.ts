import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, planUserId, plannedRow, seedPlanStudent } from './plan-seed'

/**
 * FI-001 R2c: one accepted action remains exact across all three active learner
 * surfaces while an assured exam lies outside the old 60-day calendar window.
 * Route requests are intercepted; this is controlled browser assurance, not a
 * claim of a genuine external student completion or production account.
 */
test('R2-07 Home, Plan and REV keep the same accepted next work with a 120+ day paper', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('chosen-finance', '2026-10-05', 'finance')] })
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{
      assessment_id: 'business-future-paper', user_id: planUserId,
      course_id: businessCourseId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', title: 'Business future paper',
      assessment_date: '2027-02-02', relative_importance: 'high', scope: {}, is_active: true,
    }]),
  }))

  const acceptedWindows: Array<{ from: string; to: string; route: string }> = []
  page.on('request', (request) => {
    if (request.method() !== 'GET' || !request.url().includes('/learner_planned_sessions')) return
    const dates = new URL(request.url()).searchParams.getAll('planned_date')
    const from = dates.find((value) => value.startsWith('gte.'))?.slice(4)
    const to = dates.find((value) => value.startsWith('lte.'))?.slice(4)
    if (from && to && from === '2026-10-05') acceptedWindows.push({ from, to, route: new URL(page.url()).hash })
  })

  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero').getByRole('heading', { level: 2 })).toHaveText('Finance')
  await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await expect(page.locator('.pln-row').filter({ has: page.getByRole('button', { name: /^Up next/ }) })).toContainText('Finance')
  const outlook = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(outlook).toContainText('Business future paper')
  await outlook.locator('.pln-programme__disclosure > summary').click()
  await outlook.getByText('Explore the whole preparation programme and examination milestones', { exact: true }).click()
  await expect(outlook).toContainText('Preparation objectives')
  await expect(outlook).toContainText('not a measurement of all syllabus work')
  expect((await new AxeBuilder({ page }).include('.pln-programme').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])

  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toContainText('Finance — Practice question')
  await page.getByRole('button', { name: 'What should I do today?', exact: true }).click()
  await expect(page.getByRole('log').locator('.rev-chat__message--rev').last()).toContainText('Finance')
  expect(acceptedWindows.length).toBeGreaterThanOrEqual(3)
  // All three must use the same 60-date-key accepted commitment interval.
  expect(acceptedWindows.every(({ to }) => to === '2026-12-03')).toBe(true)
})

test('R2-06/R2-07 Not now on Home changes REV advice, never the saved accepted booking', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('chosen-finance', '2026-10-05', 'finance')] })
  let mutations = 0
  page.on('request', (request) => {
    if (!request.url().includes('/learner_planned_sessions')) return
    if (request.method() !== 'GET') mutations += 1
  })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  await hero.getByRole('button', { name: 'Suggest something else', exact: true }).click()
  await expect(hero.getByRole('heading', { level: 2 })).not.toHaveText('Finance')
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).not.toContainText('Finance — Practice question')
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await expect(page.locator('.pln-row[data-kind="session"]')).toContainText('Finance')
  expect(mutations).toBe(0)
})

test('R2-05 archived exam disappears from Home, Plan milestone list and REV answer', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([
      { assessment_id: 'real-future', user_id: planUserId, course_id: businessCourseId, subject_id: 'business',
        module_id: null, assessment_type: 'public_exam', title: 'Active Business exam',
        assessment_date: '2027-02-02', relative_importance: 'normal', scope: {}, is_active: true },
      { assessment_id: 'archived-future', user_id: planUserId, course_id: businessCourseId, subject_id: 'business',
        module_id: null, assessment_type: 'public_exam', title: 'Archived Business exam',
        assessment_date: '2027-03-10', relative_importance: 'normal', scope: {}, is_active: false },
    ]),
  }))
  await page.goto(appPath)
  await expect(page.locator('.home-v3-exams')).not.toContainText('Archived Business exam')
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toContainText('Active Business exam')
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).not.toContainText('Archived Business exam')
  await expect(page.getByText('Archived Business exam', { exact: true })).toHaveCount(0)
  await page.goto(`${appPath}#/rev`)
  await page.getByRole('button', { name: 'When are my exams?', exact: true }).click()
  const answer = page.getByRole('log').locator('.rev-chat__message--rev').last()
  await expect(answer).toContainText('Active Business exam')
  await expect(answer).not.toContainText('Archived Business exam')
})
