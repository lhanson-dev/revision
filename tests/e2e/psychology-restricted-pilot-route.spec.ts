import { expect, test, type Page } from '@playwright/test'
import { seedExamAttemptBackend } from './exam-attempt-backend'
import { seedPracticeCheckpoints } from './practice-checkpoint-seed'
import { captureEvidence } from './practice-seed'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000718'
const courseId = 'aqa:aqa-a-level:7182'

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop' && !/^LF-0[346]/.test(testInfo.title), 'The restricted-pilot route gate needs one canonical authenticated browser journey; LF-03 also covers phone and tablet.')
})

async function seedRestrictedPsychologyLearner(page: Page) {
  await page.addInitScript(({ key, id }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem(key, JSON.stringify({
      access_token: `${header}.${payload}.synthetic`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 4102444800,
      refresh_token: 'synthetic-refresh-token',
      user: {
        id,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'psychology-restricted-pilot@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Pilot' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'psychology-restricted-pilot@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Pilot' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.pgrst.object+json',
      body: JSON.stringify({ is_admin: false }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ user_id: userId, course_id: courseId, created_at: '2026-08-23T12:00:00.000Z' }]),
    })
  })

  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })

  await page.route('**/rest/v1/learner_learn_exposures**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })

  for (const endpoint of [
    'revision_assessments',
    'revision_availability_exceptions',
    'revision_planning_preferences',
    'revision_activity_events',
  ]) {
    await page.route(`**/rest/v1/${endpoint}**`, async (route) => {
      await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
    })
  }

  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
}

test('restricted Psychology learner can traverse the canonical course journey on the promotion candidate', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await page.goto(`${appPath}#/courses`)

  await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
  const courseCard = page.locator('.courses-programme-card').filter({ hasText: 'AQA A-level Psychology' })
  await expect(courseCard).toBeVisible()
  await expect(courseCard).toContainText('Specification 7182')
  await expect(courseCard).toContainText('17 syllabus topics')
  await expect(courseCard).toContainText('3 exam papers/components')

  await courseCard.getByRole('button', { name: 'Open course' }).click()

  const encodedCourseId = encodeURIComponent(courseId)
  const courseNav = page.getByRole('navigation', { name: 'AQA A-level Psychology navigation' })
  await expect(courseNav).toBeVisible()
  await expect(courseNav.getByRole('button')).toHaveText(['Overview', 'Learn', 'Practice', 'Exam Prep', 'Progress'])
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/overview$`))
  await expect(courseNav.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
  // Canonical CourseHeader owns the course identity. Topic-count dashboard
  // text was removed from Overview; the 17-topic academic route is still
  // assured below in the Progress section.
  const courseIdentity = page.locator('.course-header-identity')
  await expect(courseIdentity.getByRole('heading', { name: 'Psychology', level: 1 })).toBeVisible()
  await expect(courseIdentity).toContainText('7182')
  await expect(page.getByRole('heading', { name: 'Your next useful step' })).toBeVisible()

  await courseNav.getByRole('button', { name: 'Learn' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/learn$`))
  await expect(courseNav.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByText('Core knowledge', { exact: true }).first()).toBeVisible()

  await courseNav.getByRole('button', { name: 'Practice' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/practice$`))
  await expect(courseNav.getByRole('button', { name: 'Practice' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Start \d+ questions?$/ })).toBeVisible()

  await courseNav.getByRole('button', { name: 'Exam Prep' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/exam-prep$`))
  await expect(courseNav.getByRole('button', { name: 'Exam Prep' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { name: 'Get ready for the exams' })).toBeVisible()
  await expect(page.locator('.exam-paper')).toHaveCount(3)
  await expect(page.locator('.exam-mock')).toHaveCount(3)

  await courseNav.getByRole('button', { name: 'Progress' }).click()
  await expect(page).toHaveURL(new RegExp(`#/courses/${encodedCourseId}/progress$`))
  await expect(courseNav.getByRole('button', { name: 'Progress' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
  await expect(page.locator('.progress-topic-list li')).toHaveCount(17)

  await expect(page.getByText(/not available in the current published catalogue/i)).toHaveCount(0)
  await expect(page.getByText(/course not in active programme/i)).toHaveCount(0)
})

test('LF-02: Psychology Paper 1 saves a genuine zero and permits a clean retake after result review and reload', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  const checkpoints = await seedExamAttemptBackend(page)
  const scored = new Map<string, Record<string, unknown>>()
  // Synthetic owner-scoped API: keep each evidence identity and its original score after checkpoint cleanup.
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') {
      const row = request.postDataJSON() as Record<string, unknown>
      const id = String(row.evidence_id)
      if (scored.has(id)) {
        await route.fulfill({ status: 409, contentType: 'application/json',
          body: JSON.stringify({ code: '23505', message: 'Duplicate evidence identity' }) })
        return
      }
      scored.set(id, row)
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify([...scored.values()].map((row) => ({ payload: row.payload }))) })
  })

  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/exam-prep`)
  await expect(page.getByRole('heading', { name: 'Get ready for the exams' })).toBeVisible()
  const paper = page.locator('.exam-mock').filter({ hasText: 'Paper 1' })
  await expect(paper.getByRole('button', { name: 'Start timed' })).toBeVisible()
  await paper.getByRole('button', { name: 'Start timed' }).click()
  await page.locator('.exam-question-sheet textarea').fill('An intentionally incorrect Psychology answer for a zero-mark result.')
  await expect(page.getByText('Work saved')).toBeVisible()
  await page.getByRole('button', { name: 'Finish and self-mark' }).click()
  await page.getByRole('button', { name: 'Save exam result' }).click()
  await expect(page.getByRole('heading', { name: 'Exam result' })).toBeVisible()
  await expect(page.locator('.exam-score')).toContainText('0/96')
  await expect.poll(() => scored.size).toBe(2)
  const firstResult = [...scored.values()].find((row) =>
    (row.payload as { source?: string }).source === 'exam_attempt')
  expect((firstResult?.payload as { marksAwarded?: number }).marksAwarded).toBe(0)
  expect(checkpoints.size).toBe(1)

  await page.getByRole('button', { name: 'Back to Exam Prep' }).click()
  await expect(paper.getByRole('button', { name: 'Retake exam' })).toBeVisible()
  await paper.getByRole('button', { name: 'View saved result' }).click()
  await expect(page.locator('.exam-score')).toContainText('0/96')
  await page.getByRole('button', { name: 'Back to Exam Prep' }).click()
  await paper.getByRole('button', { name: 'Retake exam' }).click()
  await expect(page.locator('.exam-session-page')).toBeVisible()
  await expect(page.locator('.exam-question-sheet textarea')).toHaveValue('')
  expect([...scored.values()].some((row) => row.evidence_id === firstResult?.evidence_id)).toBe(true)
  expect(checkpoints.size).toBe(1)
  await page.reload()
  await expect(paper.getByRole('button', { name: 'Continue saved exam' })).toBeVisible()
  await paper.getByRole('button', { name: 'Continue saved exam' }).click()
  await expect(page.getByRole('dialog', { name: 'Exam paused' })).toBeVisible()
  expect([...scored.values()].find((row) => row.evidence_id === firstResult?.evidence_id)?.payload)
    .toEqual(firstResult?.payload)
})

test('LF-03 canonical Psychology Practice independently marks four varied Social Influence questions and recovers evidence', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await seedPracticeCheckpoints(page)
  const saved = await captureEvidence(page)
  const course = encodeURIComponent(courseId)
  await page.goto(`${appPath}#/courses/${course}/practice/social-influence`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  // Four LF-03 scored items remain first, and the eight #698 original
  // applied cases extend the same Course Practice session rather than replacing it.
  // The default is 5 questions, so select the supported 15-question length,
  // which correctly caps the session at the 12 available questions.
  await page.locator('.practice-length').filter({
    has: page.locator('.practice-length__number', { hasText: /^15$/ }),
  }).click()
  await expect(page.getByRole('button', { name: 'Start 12 questions' })).toBeVisible()
  await page.getByRole('button', { name: 'Start 12 questions' }).click()
  const positions = [1, 3, 0, 2]
  const expectedPrompts = [/Freya privately thinks/, /respected university/, /One other person openly disagrees/, /small campaign group/]
  for (let index = 0; index < 4; index++) {
    await expect(page.locator('.practice-question__prompt')).toContainText(expectedPrompts[index]!)
    expect(await page.locator('.practice-question__options button').count()).toBe(4)
    await page.locator('.practice-question__options button').nth(positions[index]!).click()
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
    expect(saved).toHaveLength(index + 1)
    const payload = saved[index]!.payload as Record<string, unknown>
    expect(payload).toMatchObject({
      source: 'multiple_choice', correct: true,
      selectedOption: positions[index], correctOption: positions[index],
      contentId: `psy-psy010${index + 1}-check-v2`,
    })
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue saved session' }).click()
      await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
      expect(saved).toHaveLength(1)
    }
    if (index < 3) await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(saved.map(row => (row.payload as Record<string, unknown>).contentId)).toEqual(
    [1, 2, 3, 4].map(number => `psy-psy010${number}-check-v2`),
  )
  // Another scored case must follow the four original LF-03 checks: this is a
  // 12-question session and must not silently present only the old set.
  await page.getByRole('button', { name: 'Next question' }).click()
  // The existing session order need not match authored-bank order. The fifth
  // question must instead be one of the eight genuinely new, contextual
  // Social Influence cases (not an old repeated concept-recognition item).
  await expect(page.locator('.practice-question__context p')).toContainText(
    /^(A pupil sees five classmates|A student compares faint pairs of lines|Two versions of an original authority study|In an original street scenario|In a sixth-form survey|A volunteer initially follows a supervisor|A researcher reports that students with more internal|A small group consistently advocates a safer laboratory routine)/,
  )
  await expect(page.locator('.practice-question__options button')).toHaveCount(4)
  expect(saved).toHaveLength(4)
})

test('LF-03 #787 canonical Memory Practice displays, scores and restores four different original scenario MCQs', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await seedPracticeCheckpoints(page)
  const saved = await captureEvidence(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/memory`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await page.getByRole('button', { name: 'Start 4 questions' }).click()
  const positions = [2, 0, 3, 1]
  const stems = [/briefly sees a grid/, /listening to spoken directions/, /After studying French verbs/, /Two witnesses discuss an accident/]
  const sets = new Set<string>()
  for (let index = 0; index < 4; index++) {
    await expect(page.locator('.practice-question__prompt')).toContainText(stems[index]!)
    const options = page.locator('.practice-question__options button')
    await expect(options).toHaveCount(4)
    const texts = await options.allTextContents()
    sets.add([...texts].map(t => t.trim().toLowerCase()).sort().join('|'))
    await options.nth(positions[index]!).click()
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
    expect(saved).toHaveLength(index + 1)
    expect(saved[index]?.payload).toMatchObject({
      source: 'multiple_choice', contentId: `psy-psy020${index + 1}-check-v2`,
      selectedOption: positions[index], correctOption: positions[index], correct: true,
    })
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue saved session' }).click()
      await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
      expect(saved).toHaveLength(1) // do not double-save on re-entry
    }
    if (index < 3) await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(sets.size).toBe(4)
  expect(saved.map(row => (row.payload as Record<string, unknown>).contentId)).toEqual(
    [1, 2, 3, 4].map(i => `psy-psy020${i}-check-v2`),
  )
})


test('LF-03 #698 canonical Cognition and Development V2 Practice scores four distinct cases and survives reload', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await seedPracticeCheckpoints(page)
  const saved = await captureEvidence(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/cognition-and-development`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await page.getByRole('button', { name: 'Start 4 questions' }).click()

  const positions = [2, 0, 3, 1]
  const stems = [/same water poured/, /sequence of hints/, /looking-time study/, /Sally puts a marble/]
  const distinctOptions = new Set<string>()
  for (let index = 0; index < 4; index++) {
    await expect(page.locator('.practice-question__prompt')).toContainText(stems[index]!)
    const options = page.locator('.practice-question__options button')
    await expect(options).toHaveCount(4)
    distinctOptions.add((await options.allTextContents()).map(t => t.trim().toLowerCase()).sort().join('|'))
    await options.nth(positions[index]!).click()
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
    await expect.poll(() => saved.length).toBe(index + 1)
    expect(saved[index]?.payload).toMatchObject({
      source: 'multiple_choice', contentId: `psy-psy110${index + 1}-check-v2`,
      selectedOption: positions[index], correctOption: positions[index], correct: true,
    })
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue saved session' }).click()
      await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
      expect(saved).toHaveLength(1)
    }
    if (index < 3) await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(distinctOptions.size).toBe(4)
  expect(saved.map(row => (row.payload as Record<string, unknown>).contentId)).toEqual(
    [1, 2, 3, 4].map(i => `psy-psy110${i}-check-v2`),
  )
})

test('LF-03 #787 canonical Attachment Practice independently scores two V2 items and resumes without duplicate evidence', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await seedPracticeCheckpoints(page)
  const saved = await captureEvidence(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/attachment`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await page.getByRole('button', { name: 'Start 5 questions' }).click()

  const expectedIds = [
    'psy-psy0301-check', 'psy-psy0302-check', 'psy-psy0303-check',
    'psy-psy0304-check-v2', 'psy-psy0305-check-v2',
  ]
  for (let index = 0; index < expectedIds.length; index++) {
    if (index === 3) {
      await expect(page.locator('.practice-question__prompt')).toContainText(/Two infants are separated/)
    }
    if (index === 4) {
      await expect(page.locator('.practice-question__prompt')).toContainText(/An adult recalls secure/)
    }
    const options = page.locator('.practice-question__options button')
    await expect(options).toHaveCount(4)
    const selected = index === 3 ? 2 : 0
    await options.nth(selected).click()
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await expect.poll(() => saved.length).toBe(index + 1)
    expect(saved[index]?.payload).toMatchObject({
      source: 'multiple_choice', contentId: expectedIds[index], selectedOption: selected,
    })
    if (index >= 3) {
      expect(saved[index]?.payload).toMatchObject({ correct: true, correctOption: selected })
    }
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue saved session' }).click()
      expect(saved).toHaveLength(1)
    }
    if (index < expectedIds.length - 1) await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(saved.map(row => (row.payload as Record<string, unknown>).contentId)).toEqual(expectedIds)
})

test('LF-04 Psychology exam stimulus is visible in untimed Practice and when self-marking', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await seedExamAttemptBackend(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/exam-prep`)
  await expect(page.getByRole('heading', { name: 'Get ready for the exams' })).toBeVisible()

  const paper = page.locator('.exam-mock').filter({ hasText: 'Paper 1' }).first()
  await paper.getByRole('button', { name: 'Practise untimed' }).click()
  await page.getByRole('button', { name: 'Next question' }).click()
  const untimed = page.locator('.exam-simulator .exam-stimulus')
  await expect(untimed).toBeVisible()
  await expect(untimed).toContainText('At a training centre')
  const originalNarrative = await untimed.locator('p').innerText()
  await expect(untimed.locator('h4')).toHaveText('Revision-owned application and mini-study context')
  await expect(page.getByRole('heading', { level: 3, name: /Using the stimulus/ })).toBeVisible()

  await page.locator('.exam-prep-activity__back').click()
  await paper.getByRole('button', { name: 'Start timed' }).click()
  await page.getByRole('navigation', { name: 'Exam questions' }).getByRole('button').nth(1).click()
  const timedStimulus = page.locator('.exam-question-sheet .exam-stimulus')
  await expect(timedStimulus.locator('h4')).toHaveText('Revision-owned application and mini-study context')
  await expect(timedStimulus.locator('p')).toHaveText(originalNarrative)
  await page.locator('.exam-question-sheet textarea').fill('An independently written trial answer.')
  await page.getByRole('button', { name: 'Finish and self-mark' }).click()
  // The existing marking flow deliberately starts at Question 1.
  await page.locator('.self-marking nav.question-nav button').nth(1).click()
  const marking = page.locator('.self-marking .exam-question-sheet')
  await expect(marking.locator('.exam-stimulus h4')).toHaveText('Revision-owned application and mini-study context')
  await expect(marking.locator('.exam-stimulus p')).toHaveText(originalNarrative)
  await expect(marking).toContainText('An independently written trial answer.')
})


test('LF-03 #787 Issues and Debates V2 Practice retains six questions, exact keys and saved continuation', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await seedPracticeCheckpoints(page)
  const saved = await captureEvidence(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/issues-and-debates-in-psychology`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await page.locator('.practice-length').filter({
    has: page.locator('.practice-length__number', { hasText: /^15$/ }),
  }).click()
  await page.getByRole('button', { name: 'Start 6 questions' }).click()

  const ids = [
    'psy-psy0801-check-v2', 'psy-psy0802-check', 'psy-psy0803-check',
    'psy-psy0804-check-v2', 'psy-psy0805-check', 'psy-psy0806-check',
  ]
  const correctKeys = [1, 2, 1, 3, 1, 1]
  for (let index = 0; index < ids.length; index++) {
    if (index === 0) await expect(page.locator('.practice-question__prompt')).toContainText('university students')
    if (index === 3) await expect(page.locator('.practice-question__prompt')).toContainText('neurotransmitter')
    const options = page.locator('.practice-question__options button')
    await expect(options).toHaveCount(4)
    await options.nth(correctKeys[index]!).click()
    await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Certain' }).click()
    await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
    await expect.poll(() => saved.length).toBe(index + 1)
    expect(saved[index]?.payload).toMatchObject({
      source: 'multiple_choice', contentId: ids[index],
      selectedOption: correctKeys[index], correctOption: correctKeys[index], correct: true,
    })
    if (index === 0) {
      await page.reload()
      await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
      await page.getByRole('button', { name: 'Continue saved session' }).click()
      await expect(page.locator('.ui-feedback-bar--correct')).toBeVisible()
      expect(saved).toHaveLength(1)
    }
    if (index < ids.length - 1) await page.getByRole('button', { name: 'Next question' }).click()
  }
  expect(saved.map(row => (row.payload as Record<string, unknown>).contentId)).toEqual(ids)
})

test('LF-04: Psychology Practice pairs the Social Influence case with its actual question and guidance', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  const scoredWrites: string[] = []
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().includes('/rest/v1/learning_evidence')) {
      scoredWrites.push(request.url())
    }
  })
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/social-influence`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()

  const caseRow = page.locator('.practice-row').filter({ hasText: 'Case study' })
  await expect(caseRow).toContainText('2 written questions')
  await caseRow.click()

  await expect(page.getByRole('heading', { name: 'Instructions at a training centre' })).toBeVisible()
  await expect(page.locator('.case-material')).toContainText('senior supervisor')
  await expect(page.locator('.written-practice')).toContainText('legitimacy of authority')
  await page.getByLabel('Draft your answer').fill('The supervisor has an official position, which might explain the employee continuing despite hesitation.')
  await page.getByRole('button', { name: 'Compare with guidance' }).click()
  await expect(page.locator('.written-practice')).toContainText('recognised supervisor')
  await expect(page.getByText('These questions have no authoritative mark allocation', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Next case question' }).click()
  await expect(page.locator('.written-practice')).toContainText('alternative explanation')
  await page.getByLabel('Draft your answer').fill('The student may fear losing their supervisor’s approval.')
  await page.getByRole('button', { name: 'Compare with guidance' }).click()
  await expect(page.locator('.written-practice')).toContainText('their behaviour is not described')
  // Unscored application warm-ups may guide learning but must never record independent evidence.
  expect(scoredWrites).toHaveLength(0)

  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/biopsychology`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  await expect(page.locator('.practice-row').filter({ hasText: 'Case study' })).toHaveCount(0)
  expect(scoredWrites).toHaveLength(0)
})

test('LF-06: published Social Influence flashcards have short independent retrieval demands in real Practice', async ({ page }) => {
  await seedRestrictedPsychologyLearner(page)
  await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/practice/social-influence`)
  await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
  const flashcards = page.locator('.practice-row').filter({ hasText: 'Flashcards' })
  await expect(flashcards).toContainText('12 cards · 13 on this topic')
  await flashcards.click()
  // One deck intentionally caps at 12; the thirteenth enters a future round
  // based on the student's per-card ratings. No retired composite card is shown.
  await expect(page.locator('.practice-activity__meta')).toContainText('Card 1 of 12')
  await expect(page.locator('.practice-flashcard__question')).toHaveText('What does conformity mean in social psychology?')
  await page.getByRole('button', { name: 'Show answer' }).click()
  await expect(page.locator('.practice-flashcard__answer')).toContainText('Changing behaviour')
  await expect(page.getByRole('group', { name: 'Did you know it?' })).toBeVisible()
})
