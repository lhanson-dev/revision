import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, seedPlanStudent, plannedRow, businessCourseId, planUserId } from './plan-seed'

test('R1-07 accepted choice agrees on Home, Plan and REV; alternative choice persists across routes', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('chosen', '2026-10-05', 'finance')] })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  await expect(hero).toContainText('You chose this session for today.')
  await expect(hero).toContainText('On today’s plan')
  await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
  expect((await new AxeBuilder({ page }).include('.home-v3').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await expect(page.locator('.pln-row').filter({ has: page.getByRole('button', { name: /^Up next/ }) })).toContainText('Finance')
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toContainText('Finance — Practice question')
  await page.goto(appPath)
  await hero.getByRole('button', { name: 'Suggest something else', exact: true }).click()
  await expect(hero.getByRole('heading', { level: 2 })).not.toHaveText('Finance')
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).not.toContainText('Finance — Practice question')
})

test('R1-07 baseline exact first Today exam question starts identically from Home, Plan and REV', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  // The Topic Knowledge engine requires six distinct valid items across
  // two evidence families before it can justify an exam-practice-first route.
  // Do not make the scheduler treat four insufficient observations as mastery.
  const evidence = [
    ...Array.from({ length: 4 }, (_, i) => ({ payload: { id: `e${i}`, schemaVersion: 1, moduleId,
      topicId: 'finance', contentId: `a-level-mcq-${String(21 + i).padStart(3, '0')}`,
      occurredAt: '2026-10-02T12:00:00Z', source: 'multiple_choice',
      correct: true, selectedOption: 0, correctOption: 0 } })),
    ...Array.from({ length: 2 }, (_, i) => ({ payload: { id: `f${i}`, schemaVersion: 1, moduleId,
      topicId: 'finance', contentId: `a-level-flashcard-${String(41 + i).padStart(3, '0')}`,
      occurredAt: '2026-10-02T12:00:00Z', source: 'flashcard', rating: 2 } })),
  ]
  await page.route('**/rest/v1/learner_learn_exposures**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(new URL(route.request().url()).searchParams.get('module_id') === `eq.${moduleId}` ? evidence : []) }))
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
    { assessment_id: 'paper1', user_id: planUserId, course_id: businessCourseId, subject_id: 'business', module_id: moduleId,
      assessment_type: 'public_exam', title: 'Paper 1', assessment_date: '2026-10-15', relative_importance: 'normal', scope: { topicIds: ['finance'] }, is_active: true },
  ]) }))
  for (const hash of ['', '#/plan?view=day&date=2026-10-05', '#/rev']) {
    await page.goto(appPath + hash)
    if (!hash) {
      await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
      const start = page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*exam practice/i })
      await start.focus()
      await page.keyboard.press('Enter')
    } else if (hash.startsWith('#/plan')) await page.getByRole('button', { name: /^Up next/ }).click()
    else {
      await expect(page.getByRole('log')).toContainText('Finance — Exam practice')
      await page.getByRole('button', { name: 'Start Finance', exact: true }).click()
    }
    await expect(page.getByRole('heading', { name: 'Practise one exam question' })).toBeVisible()
    await expect(page.getByText('Targeted Paper 1 practice', { exact: true })).toBeVisible()
    // The published Business pack now correctly selects the Finance break-even
    // calculation (Section B) as its first supported targeted question.
    await expect(page.locator('.exam-simulator')).toContainText('Question 16 of 24')
    await expect(page.locator('.exam-simulator')).toContainText('break-even output')
  }
})


// A booked 30-minute commitment cannot be closed by an approximately 8-minute
// question sequence. This distinction must hold across all three entry points.
for (const [surface, hash] of [
  ['Home', ''],
  ['Plan', '#/plan?view=day&date=2026-10-05'],
  ['REV', '#/rev'],
] as const) {
  test(`#647 ${surface} retains booked time until the learner explicitly confirms completion`, async ({ page }) => {
    const booking = plannedRow('booked', '2026-10-05', 'finance', { minutes: 30 })
    const sessions = [booking]
    await seedPlanStudent(page, { sessions })
    const writes: string[] = []
    page.on('request', request => {
      if (request.url().includes('/learner_planned_sessions') && request.method() === 'PATCH') writes.push(request.postData() ?? '')
    })
    await page.goto(appPath + hash)
    if (surface === 'Home') {
      const hero = page.locator('.home-v3-hero')
      await expect(hero).toContainText('30 min booked · about 8 min practice')
      await hero.getByRole('button', { name: /^Start about 8 min practice question/ }).click()
    }
    else if (surface === 'Plan') await page.getByRole('button', { name: /^Up next/ }).click()
    else await page.getByRole('button', { name: 'Start Finance', exact: true }).click()

    const activity = page.locator('.home-focused-activity')
    await expect(activity).toContainText('1 of 5')
    await expect(activity).toContainText('about 8 min')
    await expect(activity).toContainText('original 30-minute plan allocation is unchanged')
    for (let index = 1; index <= 5; index++) {
      await expect(activity).toContainText(`${index} of 5`)
      await activity.locator('.home-focused-options button').first().click()
      await activity.getByRole('button', { name: /^Check “/ }).click()
      if (index < 5) await activity.getByRole('button', { name: 'Next question' }).click()
    }
    await activity.getByRole('button', { name: 'See how it went' }).click()
    await expect(activity).toContainText('30-minute booked session is still on your Plan')
    await expect(activity.getByRole('button', { name: "I've finished my planned session" })).toBeVisible()
    expect(sessions[0].status).toBe('planned')
    expect(writes).toHaveLength(0)
    await activity.getByRole('button', { name: "I've finished my planned session" }).click()
    await expect(activity.getByText('Planned session marked done.', { exact: false })).toBeVisible()
    expect(writes).toHaveLength(1)
    expect(sessions[0].status).toBe('done')
  })
}

test('#647 cannot silently close a booked session when its completion save fails', async ({ page }) => {
  const sessions = [plannedRow('booked', '2026-10-05', 'finance', { minutes: 25 })]
  await seedPlanStudent(page, { sessions })
  let failNextSave = true
  await page.route('**/rest/v1/learner_planned_sessions**', async route => {
    if (route.request().method() === 'PATCH' && failNextSave) {
      failNextSave = false
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Service unavailable' }) })
    } else await route.fallback()
  })
  await page.goto(appPath)
  await page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ }).click()
  const activity = page.locator('.home-focused-activity')
  for (let index = 1; index <= 5; index++) {
    await activity.locator('.home-focused-options button').first().click()
    await activity.getByRole('button', { name: /^Check “/ }).click()
    if (index < 5) await activity.getByRole('button', { name: 'Next question' }).click()
  }
  await activity.getByRole('button', { name: 'See how it went' }).click()
  await activity.getByRole('button', { name: "I've finished my planned session" }).click()
  await expect(activity).toContainText('Could not update that session')
  expect(sessions[0].status).toBe('planned')
  await activity.getByRole('button', { name: "I've finished my planned session" }).click()
  await expect(activity).toContainText('Planned session marked done')
  expect(sessions[0].status).toBe('done')
})

test('#647 published Psychology objective Practice offers several distinct questions', async ({ page }) => {
  const psychologyCourseId = 'aqa:aqa-a-level:7182'
  const psychologyModule = 'psychology-aqa-a-level-7182-paper-1'
  const sessions = [plannedRow('psy-booked', '2026-10-05', 'social-influence', {
    course_id: psychologyCourseId, minutes: 25,
  })]
  await seedPlanStudent(page, { sessions })
  // Reuse the real three-paper production course; this is not synthetic
  // Psychology question content or an invented exam-board option.
  await page.route('**/rest/v1/learner_courses**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{ user_id: planUserId, course_id: psychologyCourseId, created_at: '2026-08-22T18:00:00Z' }]),
  }))
  await page.route('**/rest/v1/revision_assessments**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{ assessment_id: 'psychology-paper-1', user_id: planUserId,
      course_id: psychologyCourseId, subject_id: 'psychology', module_id: psychologyModule,
      assessment_type: 'public_exam', title: 'Psychology Paper 1',
      assessment_date: '2026-10-22', relative_importance: 'high',
      scope: { topicIds: ['social-influence'] }, is_active: true }]),
  }))
  const posted: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') posted.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200,
      contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero).toContainText('Psychology')
  await expect(hero).toContainText('Social influence')
  await hero.getByRole('button', { name: /^Start .*practice question/ }).click()
  const activity = page.locator('.home-focused-activity')
  const descriptor = await activity.locator('.home-quick-check__progress').innerText()
  const questionCount = Number(descriptor.match(/1 of (\d+)/)?.[1])
  expect(questionCount).toBeGreaterThan(2)
  for (let number = 1; number <= 2; number++) {
    await expect(activity).toContainText(`${number} of ${questionCount}`)
    await activity.locator('.home-focused-options button').first().click()
    await activity.getByRole('button', { name: /^Check “/ }).click()
    if (number === 1) await activity.getByRole('button', { name: 'Next question' }).click()
  }
  await expect(activity.getByRole('button', { name: 'Back to today’s plan' })).toHaveCount(0)
  expect(posted).toHaveLength(2)
  expect(new Set(posted.map(item => item.content_id)).size).toBe(2)
  for (const item of posted) {
    expect(item.module_id).toMatch(/^psychology-aqa-a-level-7182-paper-/)
    expect(item.topic_id).toBe('social-influence')
    expect(item.source).toBe('multiple_choice')
  }
  expect(sessions[0].status).toBe('planned')
})

test('#647 leaving an unfinished accepted session retains the booked task without claiming resume', async ({ page }) => {
  const sessions = [plannedRow('one-answer', '2026-10-05', 'finance', { minutes: 30 })]
  await seedPlanStudent(page, { sessions })
  const writes: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async route => {
    if (route.request().method() === 'POST') writes.push(route.request().postDataJSON() as Record<string, unknown>)
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200,
      contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  await page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*practice question/ }).click()
  const activity = page.locator('.home-focused-activity')
  await activity.locator('.home-focused-options button').first().click()
  await activity.getByRole('button', { name: /^Check “/ }).click()
  await expect(activity.getByRole('button', { name: 'Next question' })).toBeVisible()
  await activity.getByRole('button', { name: 'Back to Home' }).click()
  await page.reload()
  await expect(page.locator('.home-v3-hero')).toContainText('30 min booked')
  expect(sessions[0].status).toBe('planned')
  await page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*practice question/ }).click()
  await expect(activity).toContainText('1 of 5') // true resume is not implemented
  await expect(activity.getByRole('button', { name: 'Back to today’s plan' })).toHaveCount(0)
  expect(writes).toHaveLength(1)
})

test('R1-06/13 missing setup is unscheduled; partial accepted load withholds recommendation', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false, withAvailability: false })
  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero')).toContainText('Not on a plan yet')
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toBeVisible()
  await page.route('**/rest/v1/learner_planned_sessions**', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"unavailable"}' }))
  await page.reload()
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toHaveCount(0)
})


test('R1-07 accepted Flashcards Start opens the same supported activity on all screens', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('cards', '2026-10-05', 'finance', { recommendation_id: 'planner-v1:finance:flashcards' })] })
  for (const hash of ['', '#/plan?view=day&date=2026-10-05', '#/rev']) {
    await page.goto(appPath + hash)
    if (!hash) await page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ }).click()
    else if (hash.startsWith('#/plan')) await page.getByRole('button', { name: /^Up next/ }).click()
    else await page.getByRole('button', { name: 'Start Finance', exact: true }).click()
    await expect(page.locator('.home-focused-practice')).toContainText('Flashcard')
    await expect(page.getByRole('button', { name: 'Show answer', exact: true })).toBeVisible()
    await expect(page.locator('.home-focused-activity').getByRole('heading', { level: 1 })).toHaveText('Finance')
  }
})


test('review: accepted Learn starts the actual Finance page from Home, Plan and the Today reply', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Cross-surface route contract, no responsive-specific layout change.')
  await seedPlanStudent(page, { sessions: [plannedRow('learn-finance', '2026-10-05', 'finance', { activity_type: 'learn' })] })
  let exactUrl = ''
  for (const hash of ['', '#/plan?view=day&date=2026-10-05', '#/rev']) {
    await page.goto(appPath + hash)
    if (!hash) await page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ }).click()
    else if (hash.startsWith('#/plan')) await page.getByRole('button', { name: /^Up next/ }).click()
    else {
      await page.getByRole('button', { name: 'What should I do today?', exact: true }).click()
      const answer = page.getByRole('log').locator('.rev-chat__message--rev').last()
      await expect(answer).toContainText('Finance — Learn')
      await answer.getByRole('button', { name: 'Start Finance', exact: true }).click()
    }
    await expect(page).toHaveURL(/#\/courses\/aqa%3Aaqa-a-level%3A7132\/learn\/[^/]+$/)
    await expect(page.locator('article.learn-reading-page')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Learn location' })).toContainText(/Financial|Finance/i)
    if (exactUrl) expect(page.url()).toBe(exactUrl)
    else exactUrl = page.url()
  }
})

test('review: ambiguous accepted Exam Prep remains stored with an honest limitation', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('broad-exam', '2026-10-05', 'finance', { activity_type: 'exam_prep' })] })
  await page.route('**/rest/v1/revision_availability_profiles**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    user_id: planUserId, weekday_minutes: 0, weekend_minutes: 0, timezone: 'Europe/London',
    monday_minutes: 0, tuesday_minutes: 0, wednesday_minutes: 0, thursday_minutes: 0, friday_minutes: 0, saturday_minutes: 0, sunday_minutes: 0,
  }) }))
  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toHaveCount(0)
  await expect(page.locator('.home-v3-plan-row')).toHaveCount(0)
  await expect(page.locator('.home-v3-plan')).toContainText('Your remaining sessions have been kept')
  await expect(page.locator('.exam-simulator')).toHaveCount(0)
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await page.locator('.pln-row[data-kind="session"]').getByRole('button', { name: /^Start/ }).click()
  await expect(page.getByRole('status')).toContainText('cannot be verified')
})
