import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { appPath, planUserId, plannedRow, seedPlanStudent } from './plan-seed'
import { answerWith } from './practice-seed'

/** Node-only browser fixture: verify authoritative paper-manifest identities by
 * reading text, not executing the Vite/JSON content-loader module graph. */
type FixtureCourse = {
  id: string
  subjectId: string
  modules: readonly { id: string; status: 'available'; paper: { number: number } }[]
}
function publishedCourse(subject: string, specification: string, papers: readonly number[]): FixtureCourse {
  const modules = papers.map((number) => {
    const path = 'content/' + subject + '/aqa-a-level/paper-' + number + '/manifest.ts'
    const text = readFileSync(resolve(process.cwd(), path), 'utf8')
    const id = subject + '-aqa-a-level-' + specification + '-paper-' + number
    for (const clause of [
      "id: '" + id + "'",
      "status: 'available'",
      "subject: { id: '" + subject + "'",
      "specificationCode: '" + specification + "'",
      "number: " + number,
    ]) {
      if (!text.includes(clause)) throw new Error('Published paper manifest mismatch: ' + path + ', ' + clause)
    }
    return { id, status: 'available' as const, paper: { number } }
  })
  return { id: 'aqa:aqa-a-level:' + specification, subjectId: subject, modules }
}
const business = publishedCourse('business', '7132', [1, 2, 3])
const psychology = publishedCourse('psychology', '7182', [1])

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
  // The programme's exact educational purpose and named paper reach Home,
  // rather than being replaced by a generic independent ranking message.
  const homeReason = await hero.locator('.home-v3-hero-reason').innerText()
  expect(homeReason).toContain('preparation remains relevant to')
  // The chosen paper need not be the first item in the input list when
  // evidence and competing subjects justify a different next action.
  expect(paperNames.some((name) => homeReason.includes(name))).toBe(true)

  await page.goto(appPath + '#/plan')
  await expect(page.locator('.pln-weekview')).toBeVisible()
  const nextWeek = page.locator('.pln-weekview .pln-row').filter({
    has: page.getByRole('button', { name: /^Up next/ }),
  })
  await expect(nextWeek).toContainText(nextTopic)
  const weekProgramme = page.getByRole('region', { name: 'Your full exam programme' })
  await weekProgramme.locator('.pln-programme__disclosure > summary').click()
  await expect(weekProgramme).toContainText('Preparation objectives')
  for (const name of paperNames) await expect(weekProgramme).toContainText(name)

  await page.goto(appPath + '#/plan?view=month&date=' + month)
  await expect(page.locator('.pln-month')).toBeVisible()
  const monthProgramme = page.getByRole('region', { name: 'Your full exam programme' })
  await monthProgramme.locator('.pln-programme__disclosure > summary').click()
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
  const revReply = page.getByRole('log').locator('.rev-chat__message--rev').last()
  await expect(revReply).toContainText(nextTopic)
  await expect(revReply).toContainText(homeReason)
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
  await page.goto(appPath + '#/plan?view=month&date=2027-05-01')
  const programme = page.getByRole('region', { name: 'Your full exam programme' })
  const paperSections = programme.locator('[aria-label="Paper response requirements"]')
  await expect(paperSections).toContainText('Revision-authored questions, not official exam-board questions or mark schemes.')
  await expect(paperSections).toContainText('Revision practice question matched to this paper section.')
  const paperOptions = programme.locator('[aria-label="Paper-style question opportunities"]')
  await expect(paperOptions).toContainText('available Revision-authored question options mapped to this paper')
  await expect(paperOptions).toContainText('not the number of questions you must answer in the exam')
  await expect(programme).not.toContainText('Verified practice covers')
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

// SV-13 also exercises the case when *both* planning inputs are unknown.
// A useful first activity remains possible, but no paper date or time budget
// may be fabricated and navigating ahead must not imply a booked session.
test('SV-13: unknown exam dates and study time keep five learner surfaces honest without invented plans', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false, withAvailability: false })

  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero')).toBeVisible()
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toBeVisible()

  await page.goto(appPath + '#/plan')
  const setup = page.getByLabel('Finish setting up your plan')
  await expect(setup).toBeVisible()
  await expect(setup).toContainText('Add your exam dates and your study time')
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toHaveCount(0)
  await expect(page.locator('.pln-summary, .pln-weekview')).toHaveCount(0)

  await page.goto(appPath + '#/plan?view=month&date=2027-03-01')
  await expect(page.locator('.pln-month')).toBeVisible()
  await expect(page.getByLabel('Finish setting up your plan')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Your full exam programme' })).toHaveCount(0)

  await page.goto(appPath + '#/plan?view=day&date=2026-10-05')
  await expect(page.getByLabel('Finish setting up your plan')).toBeVisible()
  await expect(page.locator('.pln-row[data-kind="suggested"]')).toHaveCount(0)

  await page.goto(appPath + '#/rev')
  // Prompt chips only advertise things the learner has supplied. No dates
  // means there is no exam chip, but REV must still answer a typed question.
  await expect(page.getByRole('button', { name: 'When are my exams?', exact: true })).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Message REV' }).fill('When are my exams?')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  const answer = page.getByRole('log').locator('.rev-chat__message--rev').last()
  await expect(answer).toContainText('I don’t have any exam dates for you yet.')
  await expect(answer).not.toContainText('2027-03-01')
})

/** Published Business course + controlled persisted-shaped scored records.
 * This exercises real React/Supabase-read/Topic Knowledge/Plan/Home/REV wiring
 * across reloads. It does NOT claim the synthetic answers were learner-created.
 */
test('SV-02/SV-09/SV-10: changing scored evidence reclassifies Plan topic needs while Home and REV share next action', async ({ page }) => {
  const examRow = paper(business, 1, '2027-05-18', 'Business scored-evidence paper')
  await seededCourses(page, [business.id], () => [examRow])

  const moduleId = business.modules[0]!.id
  type EvidenceRow = { id: string; moduleId: string; topicId: string; occurredAt: string;
    contentId: string; schemaVersion: 1; source: 'flashcard' | 'multiple_choice';
    rating?: number; correct?: boolean; selectedOption?: number; correctOption?: number }
  const saved: EvidenceRow[] = []
  const makeScores = (topicId: string, passed: boolean, at: string) => {
    for (let index = 0; index < 3; index += 1) {
      saved.push({
        id: 'recall-' + topicId + '-' + at + '-' + index, moduleId, topicId,
        occurredAt: at, contentId: 'published-topic-fixture-' + topicId + '-recall-' + index,
        schemaVersion: 1, source: 'flashcard', rating: passed ? 2 : 0,
      })
      saved.push({
        id: 'apply-' + topicId + '-' + at + '-' + index, moduleId, topicId,
        occurredAt: at, contentId: 'published-topic-fixture-' + topicId + '-apply-' + index,
        schemaVersion: 1, source: 'multiple_choice', correct: passed,
        selectedOption: passed ? 0 : 1, correctOption: 0,
      })
    }
  }
  let scoredEvidenceReads = 0
  await page.route('**/rest/v1/learning_evidence**', (route) => {
    const request = route.request()
    if (request.method() !== 'GET') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
    }
    scoredEvidenceReads += 1
    const moduleFilter = new URL(request.url()).searchParams.get('module_id')
    const requestedModule = moduleFilter?.startsWith('eq.') ? moduleFilter.slice(3) : null
    const rows = saved.filter((entry) => !requestedModule || entry.moduleId === requestedModule)
      .map((payload) => ({ payload }))
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) })
  })

  const checkStatuses = async (weak: number, supported: number) => {
    const route = appPath + '#/plan?view=month&date=2027-03-01'
    const previousReads = scoredEvidenceReads
    if (page.url().endsWith(route)) {
      // A same-hash page.goto does not remount the app or re-read the user's
      // persisted scores. A genuine reload is required after new evidence.
      await page.reload()
    } else {
      await page.goto(route)
    }
    const programme = page.getByRole('region', { name: 'Your full exam programme' })
    await expect(programme).toContainText('Business scored-evidence paper')
    const knowledge = programme.locator('[aria-label="Verified course knowledge requirements"] details')
    await programme.locator('.pln-programme__disclosure > summary').click()
    await knowledge.locator('summary').click()
    const requirements = knowledge.locator('li')
    await expect(requirements).toHaveCount(10)
    await expect(requirements.filter({ hasText: 'Existing scored evidence indicates more work is useful.' }))
      .toHaveCount(weak)
    await expect(requirements.filter({ hasText: 'There is supported scored evidence for this topic, not a guarantee of exam readiness.' }))
      .toHaveCount(supported)
    await expect(requirements.filter({ hasText: 'Current understanding is unknown.' }))
      .toHaveCount(10 - weak - supported)
    // Each phase must come from a fresh persisted-evidence read, not cached
    // React state accidentally matching an expected counter.
    expect(scoredEvidenceReads).toBeGreaterThan(previousReads)
    // Scored topic evidence is not equal to full-paper readiness or coverage.
    await expect(programme).toContainText('not a measurement of all syllabus work')
  }

  // Two real published Business topics, six distinct source-family-mixed
  // observations per topic: one weak, one strong.
  makeScores('business', false, '2026-10-01T09:00:00.000Z')
  makeScores('leadership', true, '2026-10-01T09:00:00.000Z')
  await checkStatuses(1, 1)

  // Six newer independent records for the same content IDs: canonical latest-
  // per-content evidence replaces the earlier weakness, not double counts it.
  makeScores('business', true, '2026-10-04T09:00:00.000Z')
  await checkStatuses(0, 2)

  // A new real evidence weakness is not ignored after a previously strong area.
  makeScores('leadership', false, '2026-10-04T10:00:00.000Z')
  await checkStatuses(1, 1)

  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('button', { name: /^Start/ })).toBeVisible()
  const topic = (await hero.getByRole('heading', { level: 2 }).innerText()).trim()
  await page.goto(appPath + '#/plan')
  await expect(page.locator('.pln-weekview .pln-row').filter({
    has: page.getByRole('button', { name: /^Up next/ }),
  })).toContainText(topic)
  await page.goto(appPath + '#/rev')
  await expect(page.getByRole('log')).toContainText(topic)
})

/** Real application + mutable persisted-shaped session read, not synthetic
 * score mutation: a missed commitment is an event, never an assessment. */
test('SV-07: returning after a missed accepted session replans on Home, Plan and REV without inventing learning evidence', async ({ page }) => {
  const sessions = [plannedRow('sv07-missed-finance', '2026-10-05', 'finance', {
    status: 'planned', activity_type: 'practice', minutes: 30,
  })]
  await seedPlanStudent(page, { sessions })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  await expect(hero).toContainText('You chose this session for today.')

  await page.goto(appPath + '#/plan?view=day&date=2026-10-05')
  await expect(page.locator('.pln-row[data-kind="session"]')).toContainText('Finance')
  await page.goto(appPath + '#/rev')
  await expect(page.getByRole('log')).toContainText('Finance — Practice question')

  // The learner did not complete a scored activity. The persisted row is
  // now skipped, and the real simulated clock has moved three days forward.
  sessions[0]!.status = 'skipped'
  sessions[0]!.updated_at = '2026-10-08T11:00:00.000Z'
  await page.clock.setFixedTime(new Date(2026, 9, 8, 12))
  await page.goto(appPath)
  await expect(hero).toBeVisible()
  await expect(hero).not.toContainText('You chose this session for today.')
  await expect(hero.getByRole('button', { name: /^Start/ })).toBeVisible()
  const nextTopic = (await hero.getByRole('heading', { level: 2 }).innerText()).trim()
  expect(nextTopic.length).toBeGreaterThan(2)

  await page.goto(appPath + '#/plan?view=day&date=2026-10-08')
  const next = page.locator('.pln-row').filter({ has: page.getByRole('button', { name: /^Up next/ }) })
  await expect(next).toContainText(nextTopic)
  await page.goto(appPath + '#/rev')
  await expect(page.getByRole('log')).toContainText(nextTopic)
  await page.getByRole('button', { name: 'What should I do today?', exact: true }).click()
  await expect(page.getByRole('log').locator('.rev-chat__message--rev').last()).toContainText(nextTopic)

  await page.goto(appPath + '#/progress')
  const covered = page.locator('.ui-progress-measure').filter({ hasText: 'Topics covered' }).first()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  await expect(page.getByText('Not enough evidence yet').first()).toBeVisible()

  await page.goto(appPath + '#/plan?view=month&date=2026-10-01')
  const programme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(programme).toBeVisible()
  const knowledge = programme.locator('[aria-label="Verified course knowledge requirements"] details')
  await programme.locator('.pln-programme__disclosure > summary').click()
  await knowledge.locator('summary').click()
  const finance = knowledge.locator('li').filter({ hasText: 'Finance' })
  await expect(finance).toContainText('Current understanding is unknown.')
  await expect(finance).not.toContainText('You have saved a session for this topic')
  expect(sessions).toHaveLength(1)
  expect(sessions[0]?.status).toBe('skipped')
})

/** A real scored answer through the shipped Practice question component must
 * survive the application's evidence insert/load boundary. The mock database
 * stores exactly the row the UI sent, instead of inventing GET-only evidence. */
test('SV-08: a real saved scored Practice answer refreshes Progress and the common Plan/Home/REV decision without inventing readiness', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'One real scored browser journey; existing five-view tests exercise responsive routes.')
  const examRow = paper(business, 1, '2026-11-03', 'Business assessed paper')
  await seededCourses(page, [business.id], () => [examRow])
  const evidenceRows: Array<Record<string, unknown>> = []
  let loaded = 0
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as Record<string, unknown> | Array<Record<string, unknown>>
      const incoming = Array.isArray(body) ? body : [body]
      evidenceRows.push(...incoming)
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
      return
    }
    if (request.method() !== 'GET') throw new Error('Unexpected evidence mutation ' + request.method())
    loaded += 1
    const filter = new URL(request.url()).searchParams.get('module_id')
    const moduleId = filter?.startsWith('eq.') ? filter.slice(3) : null
    const rows = evidenceRows.filter((row) => !moduleId || row.module_id === moduleId)
      .map((row) => ({ payload: row.payload }))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) })
  })

  await page.goto(appPath + '#/progress')
  const covered = page.locator('.ui-progress-measure').filter({ hasText: 'Topics covered' }).first()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  await expect(page.getByText('Not enough evidence yet').first()).toBeVisible()

  // This is an actual rendered scored question and confidence selection.
  // No synthetic evidence payload or score is inserted by the test.
  await page.goto(appPath + '#/courses/' + encodeURIComponent(business.id) + '/practice')
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await answerWith(page, 0, 'Certain')
  await expect.poll(() => evidenceRows.length).toBe(1)
  const persisted = evidenceRows[0]!
  expect(persisted.user_id).toBe(planUserId)
  expect(typeof persisted.content_id).toBe('string')
  expect(business.modules.some((part) => part.id === persisted.module_id)).toBe(true)
  expect(persisted.payload).toMatchObject({
    source: 'multiple_choice', schemaVersion: 2, confidence: 'certain',
  })
  const previousLoads = loaded

  // A real screen navigation reloads precisely the answer that the Practice
  // component saved. It is a meaningful encounter, not a full readiness claim.
  await page.goto(appPath + '#/progress')
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('1')
  await expect(page.getByText('Not enough evidence yet').first()).toBeVisible()
  expect(loaded).toBeGreaterThan(previousLoads)

  await page.goto(appPath + '#/plan?view=month&date=2026-10-01')
  const programme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(programme).toContainText('Business assessed paper')
  await expect(programme).toContainText('not a measurement of all syllabus work')
  await expect(programme.locator('[aria-label="Verified course knowledge requirements"] li')).toHaveCount(10)
  await expect(programme).not.toContainText('All preparation is complete')

  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('button', { name: /^Start/ })).toBeVisible()
  const nextTopic = (await hero.getByRole('heading', { level: 2 }).innerText()).trim()
  expect(nextTopic.length).toBeGreaterThan(2)
  await page.goto(appPath + '#/plan?view=day&date=2026-10-05')
  await expect(page.locator('.pln-row').filter({
    has: page.getByRole('button', { name: /^Up next/ }),
  })).toContainText(nextTopic)
  await page.goto(appPath + '#/rev')
  await expect(page.getByRole('log')).toContainText(nextTopic)
  await page.getByRole('button', { name: 'What should I do today?', exact: true }).click()
  await expect(page.getByRole('log').locator('.rev-chat__message--rev').last()).toContainText(nextTopic)
  expect(evidenceRows).toHaveLength(1) // No duplicate write across routes.
})

test('SV-12: impossible saved capacity shows the exact supported course-topic preparation left out, without promising syllabus completion', async ({ page }) => {
  const paperOne = paper(business, 1, '2026-11-03', 'Business early paper')
  const paperTwo = paper(psychology, 1, '2026-11-17', 'Psychology later paper')
  await seededCourses(page, [business.id, psychology.id], () => [paperOne, paperTwo])
  // A real saved availability profile with every day at zero: the student
  // has dates, but no feasible booked minute. This is not missing availability.
  await page.route('**/rest/v1/revision_availability_profiles**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({
        user_id: planUserId, weekday_minutes: 0, weekend_minutes: 0,
        timezone: 'Europe/London', monday_minutes: 0, tuesday_minutes: 0,
        wednesday_minutes: 0, thursday_minutes: 0, friday_minutes: 0,
        saturday_minutes: 0, sunday_minutes: 0,
      }) }))

  await page.goto(appPath + '#/plan?view=month&date=2026-10-01')
  const programme = page.getByRole('region', { name: 'Your full exam programme' })
  await expect(programme).toContainText('Business early paper')
  await expect(programme).toContainText('Psychology later paper')
  await expect(programme).toContainText('0m can be allocated')
  const omitted = programme.locator('[aria-label="Unallocated preparation opportunities"]')
  await programme.locator('.pln-programme__disclosure > summary').click()
  await expect(omitted).toBeVisible()
  await expect(omitted).toContainText('Business')
  await expect(omitted).toContainText('not the complete measurement of remaining syllabus')
  await expect(omitted.locator('li').first()).toContainText('not allocated before')
  await expect(programme.locator('[aria-label="Preparation limitations"]')).toContainText('not allocated')
  await expect(programme).not.toContainText('All preparation is complete')
  await page.goto(appPath + '#/plan')
  await expect(page.locator('.pln-weekview')).toBeVisible()
  await expect(page.locator('.pln-row[data-kind="suggested"]')).toHaveCount(0)
})
