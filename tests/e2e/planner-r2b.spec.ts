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
    const requestedWindows: Array<{ from: string; to: string }> = []
    page.on('request', (request) => {
      if (request.method() !== 'GET' || !request.url().includes('/learner_planned_sessions')) return
      const parts = new URL(request.url()).searchParams.getAll('planned_date')
      const start = parts.find((part) => part.startsWith('gte.'))?.slice(4)
      const end = parts.find((part) => part.startsWith('lte.'))?.slice(4)
      if (start && end) {
        spans.push((Date.parse(end) - Date.parse(start)) / 86_400_000 + 1)
        requestedWindows.push({ from: start, to: end })
      }
    })
    await page.goto(`${appPath}#/plan?view=month&date=${lastDate}`)
    const expectedMonth = lastDate === '2027-02-02' ? 'February 2027' : lastDate === '2027-10-05' ? 'October 2027' : 'October 2028'
    await expect(page.getByRole('heading', { level: 1, name: expectedMonth })).toBeVisible()
    const outlook = page.getByRole('region', { name: 'Your full exam programme' })
    await expect(outlook).toContainText('Business Final Paper')
    await expect(outlook).toContainText('not booked sessions')
    await outlook.getByText('Explore the whole preparation programme and examination milestones', { exact: true }).click()
    await expect(outlook.getByText('Business Final Paper', { exact: false }).first()).toBeVisible()
    await expect(outlook.getByRole('button', { name: /View week/i }).last()).toBeVisible()
    await expect(page.locator('.pln-row[data-kind="suggested"]')).toHaveCount(0)
    expect(spans.length).toBeGreaterThan(0)
    expect(Math.max(...spans)).toBeLessThanOrEqual(60)
    expect(requestedWindows.some(({ from, to }) => from <= lastDate && to >= lastDate)).toBe(true)
    expect((await new AxeBuilder({ page }).include('.pln-programme').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
    // The fixed clock is not the current environment clock.
    expect(fixedNow.getFullYear()).toBe(2026)
  })
}

test('R2-06 no known papers does not fabricate a final date', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false })
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toHaveCount(0)
  await expect(page.getByText('Your plan is waiting on you', { exact: true })).toBeVisible()
  await expect(page.getByText('Add your exam dates and REV will plan what to work on.', { exact: false })).toBeVisible()
})

test('R2-06 failed distant read does not disable near-term Plan guidance', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  // Exercise a real learner jump from today's Plan to an assured future paper,
  // rather than assuming that the URL alone proves the visible month changed.
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([{
      assessment_id: 'future-paper', user_id: planUserId, course_id: businessCourseId,
      subject_id: 'business', module_id: null, assessment_type: 'public_exam',
      title: 'Future Business paper', assessment_date: '2027-02-02',
      relative_importance: 'normal', scope: {}, is_active: true,
    }]),
  }))
  let distantReads = 0
  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    const dates = new URL(route.request().url()).searchParams.getAll('planned_date')
    const from = dates.find((part) => part.startsWith('gte.'))?.slice(4)
    if (route.request().method() === 'GET' && from && from >= '2027-02-01') {
      distantReads += 1
      // A non-retryable backend rejection exercises the same isolated read failure
      // without transport-layer 503 backoff outrunning the browser assertion timeout.
      await route.fulfill({ status: 400, contentType: 'application/json', body: '{"message":"unavailable"}' })
    } else await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto(`${appPath}#/plan`)
  await expect(page.getByRole('button', { name: 'Add session', exact: true })).toBeVisible()
  const outlook = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(outlook).toContainText('Future Business paper')
  await outlook.getByText('Explore the whole preparation programme and examination milestones', { exact: true }).click()
  await outlook.getByRole('button', { name: /View week of Monday 1 February 2027/ }).click()
  await expect(page.getByRole('heading', { name: /Week of 1 Feb 2027/ })).toBeVisible()
  await expect.poll(() => distantReads).toBeGreaterThan(0)
  await expect(page.getByText('Saved sessions for these dates could not be loaded', { exact: false })).toBeVisible()
  await expect(page.getByText('Your saved sessions could not be loaded', { exact: false })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Add session', exact: true })).toHaveCount(0)
})
