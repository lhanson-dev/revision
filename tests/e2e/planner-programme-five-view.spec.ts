import { expect, test, type Page } from '@playwright/test'
// Published, schema-validated paper manifests are plain Node-compatible
// modules. Do NOT load Vite-only import.meta.glob content-registry in Playwright.
import { manifest as businessPaper1 } from '../../content/business/aqa-a-level/paper-1/manifest'
import { manifest as businessPaper2 } from '../../content/business/aqa-a-level/paper-2/manifest'
import { manifest as businessPaper3 } from '../../content/business/aqa-a-level/paper-3/manifest'
import { manifest as psychologyPaper1 } from '../../content/psychology/aqa-a-level/paper-1/manifest'
import { appPath, planUserId, seedPlanStudent } from './plan-seed'

/**
 * FI-001 cross-surface browser traces on genuine published course and paper IDs.
 * Controlled student rows and dates; this is acceptance-path assurance, not
 * real learner comprehension or comparative expert education sign-off.
 */
type FixtureCourse = {
  id: string
  subjectId: string
  modules: ReadonlyArray<{ id: string; status: string; paper: { number: number } }>
}
function realCourse(first: typeof businessPaper1, modules: FixtureCourse['modules']): FixtureCourse {
  return {
    id: first.examBoard.id + ':' + first.qualification.id + ':' + first.specificationCode,
    subjectId: first.subject.id, modules,
  }
}
// These are the same published paper IDs that the production registry imports.
// No synthetic or guessed module identity is allowed in this browser oracle.
const business = realCourse(businessPaper1, [businessPaper1, businessPaper2, businessPaper3])
const psychology = realCourse(psychologyPaper1, [psychologyPaper1])

function paper(course: FixtureCourse, number: number, date: string, name: string) {
  const module = course.modules.find((item) => item.paper.number === number)
  if (!module || module.status !== 'available') throw new Error('An assured published module is required for this browser scenario.')
  return {
    assessment_id: course.id + ':paper-' + number,
    user_id: planUserId, course_id: course.id, subject_id: course.subjectId,
    module_id: module.id, title: name,
    assessment_type: 'public_exam', assessment_date: date,
    relative_importance: 'high', scope: {}, is_active: true,
  }
}
type ExamRow = ReturnType<typeof paper>

async function seededCourses(page: Page, courseIds: string[], getExams: () => ExamRow[]) {
  await seedPlanStudent(page, { sessions: [] })
  await page.route('**/rest/v1/learner_courses**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify(courseIds.map((course_id) =>
      ({ user_id: planUserId, course_id, created_at: '2026-08-22T18:00:00.000Z' }))),
  }))
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(getExams()),
  }))
}

async function observeFiveViews(page: Page, paperNames: string[], month = '2027-03-01') {
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('button', { name: /^Start/ })).toBeVisible()
  const nextTopic = (await hero.getByRole('heading', { level: 2 }).innerText()).trim()
  expect(nextTopic.length).toBeGreaterThan(2)

  await page.goto(appPath + '#/plan')
  await expect(page.locator('.pln-weekview')).toBeVisible()
  const nextWeek = page.locator('.pln-weekview .pln-row').filter({
    has: page.getByRole('button', { name: /^Up next/ }),
  })
  await expect(nextWeek).toContainText(nextTopic)
  const weekProgramme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(weekProgramme).toContainText('Preparation objectives')
  for (const name of paperNames) await expect(weekProgramme).toContainText(name)

  await page.goto(appPath + '#/plan?view=month&date=' + month)
  await expect(page.locator('.pln-month')).toBeVisible()
  const monthProgramme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(monthProgramme).toContainText('Preparation towards your exams')
  await expect(monthProgramme).toContainText('Objectives for this month')
  for (const name of paperNames) await expect(monthProgramme).toContainText(name)
  await expect(monthProgramme).toContainText('not a measurement of all syllabus work')

  await page.goto(appPath + '#/plan?view=day&date=2026-10-05')
  const dayRow = page.locator('.pln-row').filter({
    has: page.getByRole('button', { name: /^Up next/ }),
  })
  await expect(dayRow).toContainText(nextTopic)
  const offered = (await dayRow.locator('.pln-row__meta').innerText()).split(' · ')[0]
  await dayRow.getByRole('button', { name: /^Up next/ }).click()
  if (offered === 'Learn') {
    await expect(page).toHaveURL(/\/learn\//)
    await expect(page.locator('article.learn-reading-page')).toBeVisible()
  } else {
    expect(offered).toMatch(/^(Quick check|Flashcards|Exam practice)$/)
    await expect(page.locator('.home-focused-activity')).toBeVisible()
  }

  await page.goto(appPath + '#/rev')
  await expect(page.getByRole('log')).toContainText(nextTopic)
  await page.getByRole('button', { name: 'What should I do today?', exact: true }).click()
  await expect(page.getByRole('log').locator('.rev-chat__message--rev').last())
    .toContainText(nextTopic)
  return nextTopic
}

test('SV-01/SV-04: real shared Business three-paper programme connects Month, Week, Day, Home, REV and exact Start', async ({ page }) => {
  const exams = [
    paper(business, 1, '2027-05-18', 'Business paper one'),
    paper(business, 2, '2027-06-02', 'Business paper two'),
    paper(business, 3, '2027-06-11', 'Business paper three'),
  ]
  await seededCourses(page, [business.id], () => exams)
  await observeFiveViews(page, exams.map((item) => item.title))
})

test('SV-03: two published subjects share the same next action without dropping later paper requirements', async ({ page }) => {
  const exams = [
    paper(business, 1, '2027-05-18', 'Business earlier paper'),
    paper(psychology, 1, '2027-06-10', 'Psychology later paper'),
  ]
  await seededCourses(page, [business.id, psychology.id], () => exams)
  await observeFiveViews(page, exams.map((item) => item.title))
  await page.goto(appPath + '#/plan')
  const details = page.getByRole('region', { name: 'Your full exam programme' })
    .locator('.pln-programme__details')
  await expect(details.locator('ul[aria-label^="Study objectives for week"] li')
    .filter({ hasText: 'Business' }).first()).toBeAttached()
  await expect(details.locator('ul[aria-label^="Study objectives for week"] li')
    .filter({ hasText: 'Psychology' }).first()).toBeAttached()
})

test('SV-11: changed actual paper dates rebuild milestones and retain common five-view action identity', async ({ page }) => {
  let exams = [
    paper(business, 1, '2027-05-18', 'Business movable paper'),
    paper(business, 2, '2027-06-02', 'Business later paper'),
  ]
  await seededCourses(page, [business.id], () => exams)
  await observeFiveViews(page, exams.map((item) => item.title))
  exams = [
    paper(business, 1, '2027-04-21', 'Business movable paper'),
    paper(business, 2, '2027-06-23', 'Business later paper'),
  ]
  await observeFiveViews(page, exams.map((item) => item.title))
  await page.goto(appPath + '#/plan?view=month&date=2027-06-01')
  const programme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(programme).toContainText('23 June 2027')
  await expect(programme).not.toContainText('2 June 2027')
})
