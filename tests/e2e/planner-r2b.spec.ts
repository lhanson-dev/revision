import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, businessCourseId, fixedNow, planUserId, seedPlanStudent } from './plan-seed'

const futureDates = ['2027-02-02', '2027-10-05', '2028-10-04']

for (const lastDate of futureDates) {
  test(`R2-01/08/09 full-horizon Plan preserves final paper and bounded accepted reads through ${lastDate}`, async ({ page }) => {
    await seedPlanStudent(page, { sessions: [] })
    await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify([
        { assessment_id: 'paper-1', user_id: planUserId, course_id: businessCourseId, subject_id: 'business', module_id: null, assessment_type: 'public_exam', title: 'Business Paper 1', assessment_date: '2026-10-22', relative_importance: 'normal', scope: {}, is_active: true },
        { assessment_id: 'final-paper', user_id: planUserId, course_id: businessCourseId, subject_id: 'business', module_id: null, assessment_type: 'public_exam', title: 'Business Final Paper', assessment_date: lastDate, relative_importance: 'normal', scope: {}, is_active: true },
      ]),
    }))
    const spans: number[] = []
    page.on('request', (request) => {
      if (request.method() !== 'GET' || !request.url().includes('/learner_planned_sessions')) return
      const parts = new URL(request.url()).searchParams.getAll('planned_date')
      const start = parts.find((part) => part.startsWith('gte.'))?.slice(4)
      const end = parts.find((part) => part.startsWith('lte.'))?.slice(4)
      if (start && end) spans.push((Date.parse(end) - Date.parse(start)) / 86_400_000 + 1)
    })
    await page.goto(`${appPath}#/plan?view=month&date=${lastDate}`)
    const outlook = page.getByRole('region', { name: 'Your full exam programme' })
    await expect(outlook).toContainText('Business Final Paper')
    await expect(outlook).toContainText('not booked sessions')
    await outlook.locator('summary').click()
    await expect(outlook.getByText('Business Final Paper', { exact: false }).first()).toBeVisible()
    await expect(outlook.getByRole('button', { name: /View week/i }).last()).toBeVisible()
    await expect(page.locator('.pln-row[data-kind="suggested"]')).toHaveCount(0)
    expect(spans.length).toBeGreaterThan(0)
    expect(Math.max(...spans)).toBeLessThanOrEqual(42)
    expect((await new AxeBuilder({ page }).include('.pln-programme').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
    // The fixed clock is not the current environment clock.
    expect(fixedNow.getFullYear()).toBe(2026)
  })
}

test('R2-06 no known papers does not fabricate a final date', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false })
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toContainText('Revision will not guess when your final paper is')
})

test('R2-06 failed distant read does not disable near-term Plan guidance', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    const dates = new URL(route.request().url()).searchParams.getAll('planned_date')
    const from = dates.find((part) => part.startsWith('gte.'))?.slice(4)
    if (from && from > '2026-10-18') {
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"unavailable"}' })
    } else await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(`${appPath}#/plan?view=month&date=2027-02-02`)
  await expect(page.getByText('Saved sessions for these dates could not be loaded', { exact: false })).toBeVisible()
  await expect(page.getByText('Your saved sessions could not be loaded', { exact: false })).toHaveCount(0)
})
