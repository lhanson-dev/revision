import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { businessDecisionTreeNumericalBank } from '../../content/business/aqa-a-level/shared/decision-tree-numeric-practice'
import { businessOperationsPerformanceBank } from '../../content/business/aqa-a-level/shared/operations-performance-practice'
import { bankRecordToPractice, objectiveItemMappingForPractice, type CalculationPracticeQuestion } from '../../src/app/practice-questions'
import { createCalculationEvidence } from '../../src/app/practice-evidence'
import { markLearnPageReviewed, loadLearnExposures } from '../../src/services/progress/learn-exposure-service'
import { individualSpecItemObservation } from '../../src/engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../../src/services/progress/learning-evidence-service'
import { findSkillRecheckOpportunities } from '../../src/app/skill-recheck'
import { completeStudentFirstUse, establishStudentExperience } from '../../src/services/onboarding/student-first-use-service'
import { addDaysToKey } from '../../src/app/plan-dates'

// This test uses an actual local GoTrue account, PostgREST persistence and the
// canonical /revision/app/ React runtime. It does NOT use browser route mocks,
// forged sessions, production credentials or real children's data.
const enabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const appPath = '/revision/app/'
const businessId = 'aqa:aqa-a-level:7132'
const psychologyId = 'aqa:aqa-a-level:7182'

test('one ordinary real-auth learner can practise, see evidence, plan and prepare across Business and Psychology', async ({ page }) => {
  test.skip(!enabled, 'Requires the disposable local Supabase browser integration stack.')
  test.setTimeout(120_000)
  const url = process.env.SUPABASE_URL ?? ''
  const publishableKey = process.env.SUPABASE_ANON_KEY ?? ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const origin = new URL(url)
  if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname) || origin.port !== '54321') {
    throw new Error('Never exercise the learner acceptance scenario against production Auth.')
  }
  if (!publishableKey || !serviceKey) throw new Error('Missing isolated test stack credentials.')

  const admin: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const learner: SupabaseClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const email = `family-value-${crypto.randomUUID()}@revision.invalid`
  const password = `Synthetic-${crypto.randomUUID()}-A1!`
  let userId: string | undefined

  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createError || !created.user) throw new Error(`Synthetic account creation failed: ${createError?.message ?? 'unknown'}`)
    userId = created.user.id

    const { error: loginError } = await learner.auth.signInWithPassword({ email, password })
    if (loginError) throw loginError
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)

    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: 'Add your first course' })).toBeVisible()

    // Add the *actual* two A-level courses through the same UI as a learner.
    for (const course of ['A-level Business', 'A-level Psychology']) {
      await page.goto(`${appPath}#/courses`)
      await page.getByRole('button', { name: /Add course/i }).first().click()
      const dialog = page.getByRole('dialog', { name: /Add course/i })
      await dialog.getByRole('listitem').filter({ hasText: course })
        .getByRole('button', { name: /Add course/i }).click()
      await expect(dialog).toHaveCount(0)
    }

    const { data: courses, error: courseError } = await learner
      .from('learner_courses').select('course_id').eq('user_id', userId)
    expect(courseError).toBeNull()
    expect(courses?.map((item) => item.course_id).sort()).toEqual([businessId, psychologyId].sort())

    // Complete one scored Business Practice question. A displayed feedback
    // panel alone is insufficient: verify a genuinely owner-readable answer.
    await page.goto(`${appPath}#/courses/${encodeURIComponent(businessId)}/practice`)
    await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
    await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
    await page.locator('.practice-question__options button').first().click()
    await page.getByRole('button', { name: 'Fairly sure' }).click()
    await expect(page.locator('.ui-feedback-bar')).toBeVisible()
    await expect.poll(async () => {
      const { data, error } = await learner.from('learning_evidence')
        .select('evidence_id,payload').eq('user_id', userId)
      if (error) throw error
      return data?.filter((entry) => entry.payload?.source === 'multiple_choice').length ?? 0
    }).toBe(1)

    // LA-14: real local Auth/PostgREST, not fixture routes. Confirm a submitted
    // Practice answer and the durable server checkpoint independently, leave
    // the learner application, then resume the exact next question after reload.
    const { data: beforeEvidence, error: beforeEvidenceError } = await learner
      .from('learning_evidence').select('evidence_id,payload').eq('user_id', userId)
    expect(beforeEvidenceError).toBeNull()
    const originalMcqIds = (beforeEvidence ?? [])
      .filter(item => item.payload?.source === 'multiple_choice')
      .map(item => item.evidence_id).sort()
    expect(originalMcqIds).toHaveLength(1)

    await page.getByRole('button', { name: 'Next question' }).click()
    await expect(page.getByText('Question 2', { exact: true })).toBeVisible()
    const secondPrompt = await page.locator('.practice-question__prompt').textContent()
    expect(secondPrompt).toBeTruthy()
    await expect.poll(async () => {
      const { data, error } = await learner.from('learner_practice_checkpoints')
        .select('session_id').eq('user_id', userId).eq('course_id', businessId)
      if (error) throw error
      return data?.length ?? 0
    }).toBe(1)

    await page.goto(`${appPath}#/home`)
    await expect(page.getByRole('heading', { name: 'Continue where you left off' })).toBeVisible()
    await page.getByRole('button', { name: 'Open saved Practice' }).click()
    await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
    await page.getByRole('button', { name: 'Continue saved session' }).click()
    await expect(page.getByText('Question 2', { exact: true })).toBeVisible()
    await expect(page.locator('.practice-question__prompt')).toHaveText(secondPrompt!.trim())

    // Re-entering an unfinished session cannot score the same answer again.
    const { data: resumedEvidence, error: resumedError } = await learner
      .from('learning_evidence').select('evidence_id,payload').eq('user_id', userId)
    expect(resumedError).toBeNull()
    expect((resumedEvidence ?? [])
      .filter(item => item.payload?.source === 'multiple_choice')
      .map(item => item.evidence_id).sort()).toEqual(originalMcqIds)

    await page.goto(`${appPath}#/progress`)
    await expect(page.getByRole('region', { name: 'Progress summary' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Understanding' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Exam readiness' }).first()).toBeVisible()

    // Real learner availability is saved through Plan and survives a reload.
    await page.goto(`${appPath}#/plan`)
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exam dates', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Study time', exact: true }).click()
    await page.getByRole('button', { name: 'More study time on Monday' }).click()
    // A new learner has no saved availability yet, so the first-save CTA is 'Save study time'.
    await page.getByRole('button', { name: 'Save study time', exact: true }).click()
    await expect(page.getByText('Study time saved. REV has re-planned around it. Sessions you have done stay put.')).toBeVisible()
    const { data: availability, error: availabilityError } = await learner
      .from('revision_availability_profiles').select('monday_minutes').eq('user_id', userId).single()
    expect(availabilityError).toBeNull()
    expect(availability?.monday_minutes).toBe(15)

    for (const courseId of [businessId, psychologyId]) {
      await page.goto(`${appPath}#/courses/${encodeURIComponent(courseId)}/exam-prep`)
      await expect(page.getByRole('heading', { name: 'Get ready for the exams' })).toBeVisible()
      await expect(page.locator('.exam-mock').first()).toBeVisible()
      await expect(page.getByText('Planner pilot:', { exact: false })).toHaveCount(0)
    }
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Synthetic learner cleanup must succeed').toBeNull()
    }
  }
})


/**
 * #703 / #705 next acceptance slice: unlike evidence-seeded Plan-only cases,
 * the *fresh reassessment* is typed, submitted and saved via a real signed-in
 * learner browser. The deliberately wrong prerequisite is seeded through the
 * normal owner-scoped evidence service to select one exact published skill,
 * avoiding any claim that the initial wrong response was browser-entered.
 *
 * Guardrail: never point this test at hosted/production Supabase.
 */
test('Business learner completes an independent Plan calculation recheck and retains its exact skill evidence', async ({ page }) => {
  test.skip(!enabledForBusinessRecheck, 'Requires disposable local Supabase and real Auth.')
  test.setTimeout(180_000)
  const url = process.env.SUPABASE_URL ?? ''
  const anon = process.env.SUPABASE_ANON_KEY ?? ''
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const origin = new URL(url)
  if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname)
    || origin.port !== '54321' || !anon || !secret) {
    throw new Error('Business learner recheck cannot run against hosted/production learner data')
  }

  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const learner = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const email = 'business-recheck-' + crypto.randomUUID() + '@revision.invalid'
  const password = 'Recheck-' + crypto.randomUUID() + '-A1!'
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  const topicId = 'leadership'
  const expectedSkill = 'aqa-7132-3.2.2:expected-value'
  let userId: string | undefined
  try {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (created.error || !created.data.user) throw new Error('Local learner creation failed: ' + created.error?.message)
    userId = created.data.user.id
    const login = await learner.auth.signInWithPassword({ email, password })
    if (login.error) throw login.error
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)
    const { error: courseError } = await learner.from('learner_courses')
      .insert({ user_id: userId, course_id: businessId })
    expect(courseError).toBeNull()
    const { error: assessmentError } = await learner.from('revision_assessments').insert({
      user_id: userId, course_id: businessId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', title: 'Business Paper 1',
      assessment_date: '2027-05-20', relative_importance: 'high',
      scope: { topicIds: [topicId] }, is_active: true,
    })
    expect(assessmentError).toBeNull()
    const { error: capacityError } = await learner.from('revision_availability_profiles').upsert({
      user_id: userId, timezone: 'Europe/London',
      weekday_minutes: 240, weekend_minutes: 240,
      monday_minutes: 240, tuesday_minutes: 240, wednesday_minutes: 240,
      thursday_minutes: 240, friday_minutes: 240,
      saturday_minutes: 240, sunday_minutes: 240,
    })
    expect(capacityError).toBeNull()

    const questions = businessDecisionTreeNumericalBank
      .map((record) => bankRecordToPractice(record, topicId))
      .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation')
    const first = questions.find((q) => q.id === 'rev7132-3.2.2-expected-value-01')
    const second = questions.find((q) => q.id === 'rev7132-3.2.2-expected-value-02')
    expect(first && second, 'Two independently authored published expected-value prompts').toBeTruthy()
    expect(first!.prompt).not.toBe(second!.prompt)
    expect(objectiveItemMappingForPractice(first!)?.singleTargetSpecItemId).toBe(expectedSkill)
    expect(objectiveItemMappingForPractice(second!)?.singleTargetSpecItemId).toBe(expectedSkill)

    // The learner has already reviewed the corresponding published Learn page.
    // This isolates the independent recheck without a pending teaching prerequisite.
    const priorLearn = await markLearnPageReviewed(learner, {
      userId, courseId: businessId, moduleId, topicId, pageId: 'bus-evi-004',
    })
    expect(priorLearn.pageId).toBe('bus-evi-004')
    expect(await loadLearnExposures(learner, userId)).toEqual(expect.arrayContaining([
      expect.objectContaining({ topicId, pageId: 'bus-evi-004' }),
    ]))
    const store = createSupabaseEvidenceStore(learner)
    const initial = createCalculationEvidence({
      id: 'initial-missed-' + crypto.randomUUID(),
      moduleId, topicId, contentId: first!.id, correct: false,
      enteredValue: first!.expected + 9_000, expectedValue: first!.expected,
      unit: first!.unit, confidence: 'certain',
      itemMapping: objectiveItemMappingForPractice(first!),
      occurredAt: new Date(Date.now() - 60_000).toISOString(),
    })
    await recordLearningEvidence(store, userId, initial)
    const before = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(before).toEqual(expect.arrayContaining([initial]))
    expect(findSkillRecheckOpportunities(questions, before, topicId, [moduleId], ['bus-evi-004']))
      .toEqual(expect.arrayContaining([expect.objectContaining({
        specItemId: expectedSkill, freshQuestionId: second!.id, need: 'missed',
      })]))

    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.goto(appPath + '#/plan?view=day')
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.locator('.pln-daypanel')).toBeVisible()
    // Only a today's activity has a Start action. With one scoped topic and
    // available time, locate an actual authored recheck among today's work.
    // Do not force a synthetic Plan row or invoke HomeFocusedActivity directly.
    const practiceRows = page.locator('.pln-daypanel .pln-row[data-kind="suggested"]')
      .filter({ hasText: 'Leadership' }).filter({ hasText: 'Practice question' })
    const count = await practiceRows.count()
    expect(count, 'Supported Leadership Practice must be present in the authentic day Plan').toBeGreaterThan(0)
    let openedRecheck = false
    for (let index = 0; index < count; index += 1) {
      await practiceRows.nth(index).getByRole('button', { name: /^(Up next|Start)/ }).click()
      if (await page.getByText('Calculation recheck').isVisible()) {
        openedRecheck = true
        break
      }
      await page.getByRole('button', { name: 'Back to Plan' }).click()
    }
    expect(openedRecheck, 'A source-backed different calculation recheck must be startable in Plan').toBe(true)
    await expect(page.getByRole('heading', { name: second!.prompt })).toBeVisible()
    await expect(page.getByText('Worked answer')).toHaveCount(0)
    await page.getByLabel('Your final number').fill(String(second!.expected))
    await page.getByRole('button', { name: 'Certain', exact: true }).click()
    await expect(page.getByText('Answer saved')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Correct final number' })).toBeVisible()

    const after = await loadLearningEvidence(store, userId, moduleId, topicId)
    const recheck = after.find((event) => event.contentId === second!.id && event.source === 'calculation')
    expect(recheck).toMatchObject({
      source: 'calculation', correct: true, enteredValue: second!.expected,
      expectedValue: second!.expected, confidence: 'certain',
      itemMapping: { singleTargetSpecItemId: expectedSkill, source: 'structured-practice-bank' },
    })
    expect(individualSpecItemObservation(recheck!)).toMatchObject({
      specItemId: expectedSkill, correct: true, scoring: 'software-scored-final-number',
    })
    expect(after).toEqual(expect.arrayContaining([initial]))
    expect(findSkillRecheckOpportunities(questions, after, topicId, [moduleId], ['bus-evi-004'])
      .filter((opportunity) => opportunity.specItemId === expectedSkill)).toHaveLength(0)

    await page.getByRole('button', { name: 'Back to today’s plan' }).click()
    await page.reload()
    await page.goto(appPath + '#/progress')
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible()
    expect(await loadLearningEvidence(store, userId, moduleId, topicId))
      .toEqual(expect.arrayContaining([initial, recheck!]))
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Isolated learner cleanup').toBeNull()
    }
  }
})

const enabledForBusinessRecheck = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'


/**
 * #703 follow-on: the wrong final number is entered by the actual signed-in
 * learner in canonical Practice, not seeded. The independent other question
 * must then appear and be answered from the actual Plan. The precise earlier
 * The learner opens the actual targeted Learn page and records its
 * reviewed state in the browser, without turning reading into scored proof.
 * Two-skill coverage and shared Home/REV response remain separate gates.
 */
test('Business browser-entered wrong Practice calculation leads to different Plan reassessment', async ({ page }) => {
  test.skip(!enabled, 'Requires disposable local Supabase and real Auth.')
  test.setTimeout(180_000)
  const url = process.env.SUPABASE_URL ?? ''
  const anon = process.env.SUPABASE_ANON_KEY ?? ''
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const origin = new URL(url)
  if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname)
    || origin.port !== '54321' || !anon || !secret) {
    throw new Error('Never run browser-entered Practice acceptance against production')
  }
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const learner = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const email = 'business-practice-to-plan-' + crypto.randomUUID() + '@revision.invalid'
  const password = 'PracticePlan-' + crypto.randomUUID() + '-A1!'
  const topicId = 'leadership'
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  const specItemId = 'aqa-7132-3.2.2:expected-value'
  const first = bankRecordToPractice(businessDecisionTreeNumericalBank.find((q) => q.id === 'expected-value-01')!, topicId)
  const fresh = bankRecordToPractice(businessDecisionTreeNumericalBank.find((q) => q.id === 'expected-value-02')!, topicId)
  if (!first || first.type !== 'calculation' || !fresh || fresh.type !== 'calculation') {
    throw new Error('Required separately authored decision-tree calculation assets missing')
  }
  expect(first.prompt).not.toBe(fresh.prompt)
  expect(objectiveItemMappingForPractice(first)?.singleTargetSpecItemId).toBe(specItemId)
  expect(objectiveItemMappingForPractice(fresh)?.singleTargetSpecItemId).toBe(specItemId)
  let userId: string | undefined
  try {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (error || !data.user) throw new Error('Could not create local learner: ' + error?.message)
    userId = data.user.id
    const signedIn = await learner.auth.signInWithPassword({ email, password })
    if (signedIn.error) throw signedIn.error
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)
    const { error: courseError } = await learner.from('learner_courses')
      .insert({ user_id: userId, course_id: businessId })
    expect(courseError).toBeNull()
    const { error: assessmentError } = await learner.from('revision_assessments').insert({
      user_id: userId, course_id: businessId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', title: 'Business Paper 1',
      assessment_date: '2027-05-20', relative_importance: 'high',
      scope: { topicIds: [topicId] }, is_active: true,
    })
    expect(assessmentError).toBeNull()
    const { error: capacityError } = await learner.from('revision_availability_profiles').upsert({
      user_id: userId, timezone: 'Europe/London',
      weekday_minutes: 240, weekend_minutes: 240,
      monday_minutes: 240, tuesday_minutes: 240, wednesday_minutes: 240,
      thursday_minutes: 240, friday_minutes: 240,
      saturday_minutes: 240, sunday_minutes: 240,
    })
    expect(capacityError).toBeNull()

    // Do not seed any Learn exposure. The real browser must complete that
    // part of the learner journey after the wrong calculation below.
    const startingExposure = await loadLearnExposures(learner, userId)
    expect(startingExposure.some((item) => item.pageId === 'bus-evi-004'
      && item.moduleId === moduleId && item.courseId === businessId)).toBe(false)
    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.goto(appPath + '#/courses/' + encodeURIComponent(businessId) + '/practice')
    await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
    await page.getByRole('button', { name: 'Change topic' }).click()
    await page.getByRole('region', { name: 'Test what you know' }).getByLabel('Topic').selectOption(topicId)
    const kinds = page.locator('.practice-kinds')
    await kinds.getByRole('button', { name: 'Calculations' }).click()
    await kinds.getByRole('button', { name: 'Multiple choice' }).click()
    const start = page.getByRole('button', { name: /^Start \d+ questions?$/ })
    await expect(start).toBeEnabled()
    await start.click()
    // This is the genuine authored question reached through the learner's
    // choice of Practice topic and type, not a forced component or fake answer.
    await expect(page.locator('.practice-question__prompt')).toHaveText(first.prompt)
    await page.getByLabel('Your answer').fill(String(first.expected + 9000))
    await page.getByRole('button', { name: 'Certain', exact: true }).click()
    await expect(page.getByText('Not quite.', { exact: true })).toBeVisible()
    const methodRepair = page.getByRole('region', { name: 'Guided repair: Calculate a probability-weighted expected value' })
    await expect(methodRepair).toContainText('0.7 chance of a £180,000 outcome')
    await expect(methodRepair).toContainText('not marked and cannot clear a weakness')
    await methodRepair.getByText('Reveal the worked method after your attempt').click()
    await expect(methodRepair).toContainText('£126,000 − £30,000 = £96,000')
    const store = createSupabaseEvidenceStore(learner)
    let wrong: Awaited<ReturnType<typeof loadLearningEvidence>>[number] | undefined
    await expect.poll(async () => {
      const saved = await loadLearningEvidence(store, userId!, moduleId, topicId)
      wrong = saved.find((x) => x.contentId === first.id && x.source === 'calculation')
      return wrong?.source === 'calculation' && !wrong.correct
    }).toBe(true)
    expect(individualSpecItemObservation(wrong!)).toMatchObject({
      specItemId, correct: false, scoring: 'software-scored-final-number',
    })
    expect(wrong).toMatchObject({
      source: 'calculation', confidence: 'certain', enteredValue: first.expected + 9000,
    })

    // This is the real learner-facing authored repair page, reached using
    // its canonical Courses/Learn route only AFTER the first incorrect
    // Practice result. The learner explicitly marks it reviewed on-screen.
    // Reviewing is unscored exposure, never proof of understanding.
    const beforeRead = await loadLearnExposures(learner, userId)
    expect(beforeRead.some((item) => item.pageId === 'bus-evi-004'
      && item.moduleId === moduleId && item.courseId === businessId)).toBe(false)
    const repair = page.getByRole('button', { name: /^Read: / })
    await expect(repair, 'Wrong answer should lead to an exact published Learn repair').toBeVisible()
    await repair.click()
    await expect(page).toHaveURL(new RegExp('/learn/bus-evi-004'))
    await expect(page.locator('#learn-page-bus-evi-004')).toBeVisible()
    await expect(page.locator('.learn-reading-body')).not.toBeEmpty()
    const pageReview = page.getByRole('region', { name: 'Learn page review' })
    await pageReview.getByRole('button', { name: 'I have read this page' }).click()
    await expect(pageReview).toContainText('Page reviewed. This records reading, not understanding or exam readiness.')
    await expect.poll(async () => (await loadLearnExposures(learner, userId))
      .some((item) => item.pageId === 'bus-evi-004'
        && item.moduleId === moduleId && item.courseId === businessId)).toBe(true)
    // A review cannot clear the wrong scored observation or manufacture an
    // independently scored result: the fresh question is still needed.
    const afterReviewEvidence = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(afterReviewEvidence.map((item) => item.id).sort())
      .toEqual([wrong!.id])
    expect(findSkillRecheckOpportunities(
      businessDecisionTreeNumericalBank.map((record) => bankRecordToPractice(record, topicId))
        .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation'),
      afterReviewEvidence, topicId, [moduleId], ['bus-evi-004'],
    )).toEqual(expect.arrayContaining([expect.objectContaining({
      specItemId, need: 'missed', freshQuestionId: fresh.id,
    })]))

    // Leaving for Learn must retain the original unfinished Practice checkpoint.
    // Re-enter it using the normal browser navigation; do not fake session completion.
    await page.goto(appPath + '#/courses/' + encodeURIComponent(businessId) + '/practice')
    await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()

    // Returning from Learn opens the ordinary Practice setup with the
    // unfinished checkpoint already visible. Discard that checkpoint using its
    // real control; never delete the previously saved scored answer.
    // There is no Back to practice control unless a focused activity is open.
    await page.getByRole('button', { name: 'Discard saved session and start again' }).click()
    await expect(page.getByRole('button', { name: 'Continue saved session' })).toHaveCount(0)
    const persisted = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(persisted.find((item) => item.id === wrong?.id)).toBeDefined()
    expect(findSkillRecheckOpportunities(
      businessDecisionTreeNumericalBank.map((record) => bankRecordToPractice(record, topicId))
        .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation'),
      persisted, topicId, [moduleId], ['bus-evi-004'],
    )).toEqual(expect.arrayContaining([expect.objectContaining({
      specItemId, need: 'missed', freshQuestionId: fresh.id,
    })]))
    // No synthetic Plan task is injected. It must still derive the authored
    // recheck from the browser-created, persisted wrong final-number evidence.
    await page.goto(appPath + '#/plan?view=day')
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.locator('.pln-daypanel')).toBeVisible()
    const rows = page.locator('.pln-daypanel .pln-row[data-kind="suggested"]')
      .filter({ hasText: 'Leadership' }).filter({ hasText: 'Practice question' })
    const count = await rows.count()
    expect(count, 'Leadership must offer a real current-day Practice activity').toBeGreaterThan(0)
    let selected = false
    const seen: string[] = []
    for (let i = 0; i < count; i += 1) {
      seen.push((await rows.nth(i).innerText()).replace(/\s+/g, ' ').trim())
      await rows.nth(i).getByRole('button', { name: /^(Up next|Start)/ }).click()
      // handleStartSuggested persists a best-effort start event asynchronously
      // before mounting the focused activity. Playwright click() only waits
      // for the click, not the async handler promise; checking isVisible()
      // immediately afterwards can race the real UI launch.
      const back = page.getByRole('button', { name: 'Back to Plan' })
      await expect(back, 'Wait for the actual Plan activity to open before classifying it').toBeVisible()
      if (await page.getByText('Calculation recheck').isVisible()) {
        selected = true
        break
      }
      await back.click()
      await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    }
    expect(selected, `Actual learner Plan must launch the distinct expected-value check. Opened today's Leadership rows: ${JSON.stringify(seen)}`).toBe(true)
    await expect(page.getByRole('heading', { name: fresh.prompt })).toBeVisible()
    await page.getByLabel('Your final number').fill(String(fresh.expected))
    await page.getByRole('button', { name: 'Certain', exact: true }).click()
    await expect(page.getByText('Answer saved')).toBeVisible()
    await expect.poll(async () => {
      const saved = await loadLearningEvidence(store, userId!, moduleId, topicId)
      return saved.some((x) => x.contentId === fresh.id && x.source === 'calculation'
        && x.correct && individualSpecItemObservation(x)?.specItemId === specItemId)
    }).toBe(true)
    const saved = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(saved.find((x) => x.id === wrong?.id)).toBeDefined()
    const opportunities = findSkillRecheckOpportunities(
      businessDecisionTreeNumericalBank.map((record) => bankRecordToPractice(record, topicId))
        .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation'),
      saved, topicId, [moduleId], ['bus-evi-004'],
    )
    expect(opportunities.filter((x) => x.specItemId === specItemId)).toHaveLength(0)

    await page.getByRole('button', { name: 'Back to today’s plan' }).click()
    await page.reload()
    await page.goto(appPath + '#/progress')
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible()

    // The normal canonical Learn route keeps the shared Foundation page but
    // never invents a specific weakness. An FI-001 skill-focused Learn link
    // displays a different unscored method for each exact source item.
    const learnBase = appPath + '#/courses/' + encodeURIComponent(businessId) + '/learn/bus-evi-004'
    await page.goto(learnBase)
    await expect(page.getByRole('region', { name: /^Guided repair:/ })).toHaveCount(0)
    await page.goto(learnBase + '?repairSkill=' + encodeURIComponent('aqa-7132-3.2.2:expected-value'))
    await expect(page.getByRole('region', { name: 'Guided repair: Calculate a probability-weighted expected value' })).toBeVisible()
    await page.goto(learnBase + '?repairSkill=' + encodeURIComponent('aqa-7132-3.2.2:net-gain'))
    await expect(page.getByRole('region', { name: 'Guided repair: Separate net gain from expected value' })).toBeVisible()
    const afterGuidedRead = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(afterGuidedRead.map((item) => item.id).sort()).toEqual(saved.map((item) => item.id).sort())
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Local learner cleanup').toBeNull()
    }
  }
})

/**
 * #703 / #705: two different independently scored weaknesses within the SAME
 * Business topic, no fabricated Plan items and no automatic method marks.
 * Initial observations use the ordinary owner-scoped EvidenceStore; the later
 * independently authored results are entered and scored through the real UI.
 * A separate browser journey covers the actual wrong → Learn link → review.
 */
test('two Business skill weaknesses produce named independent Plan checks without cross-skill credit', async ({ page }) => {
  test.skip(!enabled, 'Requires disposable local Supabase and real Auth.')
  test.setTimeout(240_000)
  const url = process.env.SUPABASE_URL ?? ''
  const anon = process.env.SUPABASE_ANON_KEY ?? ''
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const host = new URL(url)
  if (host.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(host.hostname)
    || host.port !== '54321' || !anon || !secret) throw new Error('Never run against Production')
  const admin = createClient(url, secret, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const learner = createClient(url, anon, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const email = 'business-double-skill-' + crypto.randomUUID() + '@revision.invalid'
  const password = 'TwoSkills-' + crypto.randomUUID() + '-A1!'
  const topicId = 'leadership'
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  const questions = businessDecisionTreeNumericalBank
    .map((record) => bankRecordToPractice(record, topicId))
    .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation')
  const authored = (id: string) => {
    const question = questions.find((q) => q.id === 'rev7132-3.2.2-' + id)
    if (!question) throw new Error('Missing published AQA Business check: ' + id)
    return question
  }
  const cases = [
    { skill: 'aqa-7132-3.2.2:expected-value', label: 'Independent recheck: Expected value',
      wrong: authored('expected-value-01'), fresh: authored('expected-value-02') },
    { skill: 'aqa-7132-3.2.2:net-gain', label: 'Independent recheck: Net gain',
      wrong: authored('net-gain-01'), fresh: authored('net-gain-02') },
  ]
  let userId: string | undefined
  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createError || !created.user) throw new Error('Isolated student creation failed: ' + createError?.message)
    userId = created.user.id
    const signedIn = await learner.auth.signInWithPassword({ email, password })
    if (signedIn.error) throw signedIn.error
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)
    const { error: courseError } = await learner.from('learner_courses')
      .insert({ user_id: userId, course_id: businessId })
    expect(courseError).toBeNull()
    const { error: examError } = await learner.from('revision_assessments').insert({
      user_id: userId, course_id: businessId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', title: 'Business Paper 1',
      assessment_date: '2027-05-20', relative_importance: 'high',
      scope: { topicIds: [topicId] }, is_active: true,
    })
    expect(examError).toBeNull()
    const { error: capacityError } = await learner.from('revision_availability_profiles').upsert({
      user_id: userId, timezone: 'Europe/London',
      weekday_minutes: 240, weekend_minutes: 240,
      monday_minutes: 240, tuesday_minutes: 240, wednesday_minutes: 240,
      thursday_minutes: 240, friday_minutes: 240, saturday_minutes: 240, sunday_minutes: 240,
    })
    expect(capacityError).toBeNull()
    // Exposure only: one shared Foundation page can explain both methods;
    // it does not count as an independent answer for either distinct skill.
    const exposure = await markLearnPageReviewed(learner, {
      userId, courseId: businessId, moduleId, topicId, pageId: 'bus-evi-004',
    })
    expect(exposure.pageId).toBe('bus-evi-004')
    const store = createSupabaseEvidenceStore(learner)
    for (const [i, item] of cases.entries()) {
      expect(item.wrong.prompt).not.toBe(item.fresh.prompt)
      expect(objectiveItemMappingForPractice(item.wrong)?.singleTargetSpecItemId).toBe(item.skill)
      expect(objectiveItemMappingForPractice(item.fresh)?.singleTargetSpecItemId).toBe(item.skill)
      await recordLearningEvidence(store, userId, createCalculationEvidence({
        id: 'two-distinct-misses-' + i + '-' + crypto.randomUUID(),
        moduleId, topicId, contentId: item.wrong.id,
        correct: false, enteredValue: item.wrong.expected + 7000,
        expectedValue: item.wrong.expected, unit: item.wrong.unit,
        confidence: 'certain', itemMapping: objectiveItemMappingForPractice(item.wrong),
        occurredAt: new Date(Date.now() - (120 - i) * 1000).toISOString(),
      }))
    }
    const before = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(new Set(before.map((item) => individualSpecItemObservation(item)?.specItemId)))
      .toEqual(new Set(cases.map((item) => item.skill)))
    const needs = findSkillRecheckOpportunities(questions, before, topicId, [moduleId], ['bus-evi-004'])
    expect(new Set(needs.map((need) => need.freshQuestionId)))
      .toEqual(new Set(cases.map((item) => item.fresh.id)))

    // The student signs in normally and must find two genuinely different
    // actionable Plan entries across the existing rolling 14-day period.
    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Wait for real authenticated navigation to replace the sign-in form;
    // a click alone does not prove Supabase Auth finished asynchronously.
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0)
    const browserErrors: string[] = []
    page.on('pageerror', (error) => browserErrors.push(error.message))

    // The same enrolled student must receive one consistent next-topic
    // recommendation on Home and the actual Ask REV drawer. If Home's
    // scheduled task carries exact skill evidence, REV must repeat that
    // specific wording rather than collapsing to a generic topic.
    await page.goto(appPath + '#/home')
    const homeHero = page.locator('.home-v3-next')
    await expect(homeHero.locator('h2')).toBeVisible()
    const selectedTopic = await homeHero.locator('h2').innerText()
    const homeReasons = await homeHero.locator('.home-v3-hero-reason').allInnerTexts()
    await page.goto(appPath + '#/rev')
    await expect(page.getByRole('heading', { name: 'Ask REV', exact: true })).toBeVisible()
    const revOpening = page.locator('.rev-chat__log .rev-chat__message--rev').first()
    await expect(revOpening).toContainText(selectedTopic)
    for (const reason of homeReasons) {
      if (/^(Independent recheck:|Independent check:|Review .* after an incorrect answer)/.test(reason)) {
        await expect(revOpening).toContainText(reason)
      }
    }
    // Global Progress must project the same configured FI-001 next action, not
    // independently rank a broad-topic practice activity. These saved wrong
    // answers came from actual owner-scoped Auth/DB evidence above.
    await page.goto(appPath + '#/progress')
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible()
    const progressNext = page.locator('.progress-intro__action')
    await expect(progressNext).toContainText(selectedTopic, { timeout: 20_000 })
    for (const reason of homeReasons) {
      if (/^(Independent recheck:|Independent check:|Review .* after an incorrect answer)/.test(reason)) {
        await expect(progressNext).toContainText(reason)
      }
    }
    // Course-local Progress must now show the exact same *programme* decision,
    // not the previously separate course-only rankSuggestions action.
    await page.goto(appPath + '#/courses/aqa%3Aaqa-a-level%3A7132/progress')
    const localProgressNext = page.locator('.progress-intro__action')
    await expect(localProgressNext).toContainText(selectedTopic, { timeout: 20_000 })
    for (const reason of homeReasons) {
      if (/^(Independent recheck:|Independent check:|Review .* after an incorrect answer)/.test(reason)) {
        await expect(localProgressNext).toContainText(reason)
      }
    }
    await localProgressNext.getByRole('button', { name: /Continue on Home:/ }).click()
    await expect(page.locator('.home-v3-next h2')).toHaveText(selectedTopic)

    await page.goto(appPath + '#/progress')
    await progressNext.getByRole('button', { name: /Continue on Home:/ }).click()
    await expect(page.locator('.home-v3-next h2')).toHaveText(selectedTopic)

    await page.goto(appPath + '#/home')
    const launch = async (item: typeof cases[number]) => {
      await page.goto(appPath + '#/plan?view=day')
      try {
        await expect(page.getByRole('heading', { name: 'Plan', exact: true }))
          .toBeVisible({ timeout: 15_000 })
      } catch {
        const visible = (await page.locator('body').innerText()).slice(0, 1500)
        throw new Error('Real-auth Plan never mounted. URL=' + page.url()
          + ' | visible=' + visible + ' | JS errors=' + JSON.stringify(browserErrors))
      }
      await expect(page.locator('.pln-daypanel')).toBeVisible()
      for (let index = 0; index < 14; index++) {
        const row = page.locator('.pln-daypanel .pln-row[data-kind="suggested"]')
          .filter({ hasText: item.label })
        if (await row.count()) {
          await row.first().getByRole('button', { name: /^(Up next|Start)/ }).click()
          await expect(page.getByRole('button', { name: 'Back to Plan' })).toBeVisible()
          await expect(page.getByText('Calculation recheck')).toBeVisible()
          await expect(page.getByRole('heading', { name: item.fresh.prompt })).toBeVisible()
          return
        }
        await page.getByRole('button', { name: 'Next day' }).click()
        await expect(page.locator('.pln-daypanel')).toBeVisible()
      }
      throw new Error('No source-backed distinct ' + item.label + ' task in rolling 14-day Plan')
    }
    await launch(cases[0]!)
    await page.getByLabel('Your final number').fill(String(cases[0]!.fresh.expected))
    await page.getByRole('button', { name: 'Certain', exact: true }).click()
    await expect(page.getByText('Answer saved')).toBeVisible()
    await expect.poll(async () => (await loadLearningEvidence(store, userId!, moduleId, topicId))
      .some((item) => item.contentId === cases[0]!.fresh.id && item.correct
        && individualSpecItemObservation(item)?.specItemId === cases[0]!.skill)).toBe(true)
    const afterFirst = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(findSkillRecheckOpportunities(questions, afterFirst, topicId, [moduleId], ['bus-evi-004'])
      .map((need) => need.specItemId)).toEqual([cases[1]!.skill])

    // Finish the first focused activity through the actual learner control.
    // Hash navigation alone must not abandon an open, already-saved check.
    await page.getByRole('button', { name: 'Back to today’s plan' }).click()
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()

    // First skill's improvement cannot silently remove the other weakness.
    await launch(cases[1]!)
    await page.getByLabel('Your final number').fill(String(cases[1]!.fresh.expected))
    await page.getByRole('button', { name: 'Certain', exact: true }).click()
    await expect(page.getByText('Answer saved')).toBeVisible()
    await expect.poll(async () => (await loadLearningEvidence(store, userId!, moduleId, topicId))
      .some((item) => item.contentId === cases[1]!.fresh.id && item.correct
        && individualSpecItemObservation(item)?.specItemId === cases[1]!.skill)).toBe(true)
    const afterBoth = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(afterBoth).toHaveLength(4)
    expect(findSkillRecheckOpportunities(questions, afterBoth, topicId, [moduleId], ['bus-evi-004']))
      .toEqual([])
    await page.reload()
    await page.goto(appPath + '#/progress')
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible()
    // This is bounded final-number performance; no complete method or
    // exam-readiness grade has been demonstrated.
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const deleted = await admin.auth.admin.deleteUser(userId)
      expect(deleted.error, 'Isolated learner cleanup').toBeNull()
    }
  }
})

/**
 * #698 source-to-learner Marketing §3.3.3: use a real disposable local
 * GoTrue/PostgREST account to prove the new paper-based diagram exercise is
 * discoverable through the integrated Course Practice, not a fixture app.
 * Do not infer scored diagram or written AO3/AO4 evidence from answer reveal.
 */
test('Business 7132 Marketing real learner reaches market-map, Boston Matrix and seven-P drills without false scored evidence', async ({ page }) => {
  test.skip(!enabled, 'Requires disposable local Supabase and real Auth.')
  test.setTimeout(120_000)
  const url = process.env.SUPABASE_URL ?? ''
  const anon = process.env.SUPABASE_ANON_KEY ?? ''
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const origin = new URL(url)
  if (origin.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(origin.hostname)
    || origin.port !== '54321' || !anon || !secret) {
    throw new Error('Never use hosted or production Supabase for this learner acceptance test')
  }

  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const learner = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const email = 'business-map-' + crypto.randomUUID() + '@revision.invalid'
  const password = 'Map-Review-' + crypto.randomUUID() + '-A1!'
  let userId: string | undefined
  try {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (created.error || !created.data.user) throw new Error('Local learner creation failed: ' + created.error?.message)
    userId = created.data.user.id
    const login = await learner.auth.signInWithPassword({ email, password })
    if (login.error) throw login.error
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)
    const { error: courseError } = await learner.from('learner_courses')
      .insert({ user_id: userId, course_id: businessId })
    expect(courseError).toBeNull()

    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.goto(`${appPath}#/courses/${encodeURIComponent(businessId)}/practice`)
    await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
    await page.getByRole('button', { name: 'Change topic' }).click()
    await page.getByLabel('Topic').selectOption('marketing')
    await expect(page.getByText('Practice · 3. Marketing Management')).toBeVisible()
    await page.getByRole('region', { name: 'Warm-up' }).getByRole('button', { name: /^Formulas/ }).click()

    // The first three Marketing drills are historical accepted content.
    // The new fourth drill must be reachable by normal in-app navigation.
    for (let index = 0; index < 3; index++) {
      await page.getByRole('button', { name: 'Show model answer' }).click()
      await page.getByRole('button', { name: 'Next exercise' }).click()
    }
    await expect(page.getByRole('heading', { name: 'Draw and interpret a market-positioning map' })).toBeVisible()
    await expect(page.getByText(/Plot three competitors: CupGo/)).toBeVisible()
    await page.getByRole('button', { name: 'Show model answer' }).click()
    await expect(page.getByText(/cannot score or independently verify a student-drawn graph/i)).toBeVisible()

    // #784: advance in the SAME signed-in Marketing exercise to the two new
    // original Boston Matrix and seven-P unscored scenarios, preserving #777.
    await page.getByRole('button', { name: 'Next exercise' }).click()
    await expect(page.getByRole('heading', { name: 'Build and challenge a Boston Matrix' })).toBeVisible()
    await expect(page.getByText(/Everyday Pans/)).toBeVisible()
    await page.getByRole('button', { name: 'Show model answer' }).click()
    await expect(page.getByText(/Everyday Pans: 30\/15 = 2\.00/)).toBeVisible()
    await page.getByRole('button', { name: 'Next exercise' }).click()
    await expect(page.getByRole('heading', { name: 'Design an integrated seven-P mix for a service' })).toBeVisible()
    await expect(page.getByText(/Northgate Testing/)).toBeVisible()
    await page.getByRole('button', { name: 'Show model answer' }).click()
    await expect(page.getByText(/no marks or mastery are awarded/i)).toBeVisible()

    // Revealing the model must not generate an assessed result or mastery claim.
    const { data: recorded, error: evidenceError } = await learner.from('learning_evidence')
      .select('evidence_id').eq('user_id', userId)
    expect(evidenceError).toBeNull()
    expect(recorded).toEqual([])
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Local learner cleanup').toBeNull()
    }
  }
})


/**
 * Issue #698 AQA Business §3.4.2: authenticate a real disposable student,
 * retain a wrong source-specific unit-cost answer, and prove the existing
 * Plan launches a *different*, actually saved final-number reassessment.
 * This does not mark working, interpretation or exam-readiness mastery.
 */
test('Business Operations unit-cost source mistake leads to a real scored independent Plan check', async ({ page }) => {
  test.skip(!enabled, 'Requires disposable local Supabase Auth and DB.')
  test.setTimeout(240_000)
  const url = process.env.SUPABASE_URL ?? ''
  const anon = process.env.SUPABASE_ANON_KEY ?? ''
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const local = new URL(url)
  if (local.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(local.hostname)
    || local.port !== '54321' || !anon || !secret) {
    throw new Error('Never run this assessment against hosted learner accounts')
  }
  const admin = createClient(url, secret, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const learner = createClient(url, anon, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const email = 'business-operations-' + crypto.randomUUID() + '@revision.invalid'
  const password = 'Operations-' + crypto.randomUUID() + '-A1!'
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  const topicId = 'operations'
  const target = 'aqa-7132-3.4.2:unit-cost-average-cost'
  const candidates = businessOperationsPerformanceBank
    .filter(record => record.target_item_ids.length === 1 && record.target_item_ids[0] === target)
    .map(record => bankRecordToPractice(record, topicId))
    .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation')
  expect(candidates).toHaveLength(2)
  expect(candidates[0]?.id).not.toBe(candidates[1]?.id)
  let userId: string | undefined
  try {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (created.error || !created.data.user) throw new Error('Synthetic account failed: ' + created.error?.message)
    userId = created.data.user.id
    const login = await learner.auth.signInWithPassword({ email, password })
    if (login.error) throw login.error
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)
    const { error: courseError } = await learner.from('learner_courses')
      .insert({ user_id: userId, course_id: businessId })
    expect(courseError).toBeNull()
    const { error: examError } = await learner.from('revision_assessments').insert({
      user_id: userId, course_id: businessId, subject_id: 'business', module_id: null,
      assessment_type: 'public_exam', title: 'Business Paper 1',
      assessment_date: '2027-05-20', relative_importance: 'high',
      scope: { topicIds: [topicId] }, is_active: true,
    })
    expect(examError).toBeNull()
    const { error: availabilityError } = await learner.from('revision_availability_profiles').upsert({
      user_id: userId, timezone: 'Europe/London',
      weekday_minutes: 240, weekend_minutes: 240,
      monday_minutes: 240, tuesday_minutes: 240, wednesday_minutes: 240,
      thursday_minutes: 240, friday_minutes: 240, saturday_minutes: 240, sunday_minutes: 240,
    })
    expect(availabilityError).toBeNull()

    await markLearnPageReviewed(learner, {
      userId, courseId: businessId, moduleId, topicId, pageId: 'operations-four-performance-measures',
    })
    const store = createSupabaseEvidenceStore(learner)
    const wrong = candidates[0]!
    const fresh = candidates[1]!
    expect(objectiveItemMappingForPractice(wrong)?.singleTargetSpecItemId).toBe(target)
    expect(objectiveItemMappingForPractice(fresh)?.singleTargetSpecItemId).toBe(target)
    expect(wrong.prompt).not.toBe(fresh.prompt)
    await recordLearningEvidence(store, userId, createCalculationEvidence({
      id: 'operations-unit-cost-miss-' + crypto.randomUUID(),
      moduleId, topicId, contentId: wrong.id,
      correct: false, enteredValue: wrong.expected + 10,
      expectedValue: wrong.expected, unit: wrong.unit,
      confidence: 'certain', itemMapping: objectiveItemMappingForPractice(wrong),
      occurredAt: new Date(Date.now() - 120_000).toISOString(),
    }))
    const before = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(findSkillRecheckOpportunities(candidates, before, topicId, [moduleId], ['operations-four-performance-measures'])
      .map(need => [need.specItemId, need.freshQuestionId, need.repairLearnPageId]))
      .toEqual([[target, fresh.id, 'operations-four-performance-measures']])

    await page.goto(appPath)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toHaveCount(0)
    await page.goto(`${appPath}#/courses/${encodeURIComponent(businessId)}/practice`)
    await expect(page.getByRole('region', { name: 'Test what you know' })).toBeVisible()
    await page.getByRole('button', { name: 'Change topic' }).click()
    await page.getByLabel('Topic').selectOption(topicId)
    await expect(page.getByText('Practice · 4. Operational Management')).toBeVisible()
    // The same actual enrolled learner must receive the exact source-backed
    // reassessment via deterministic Plan, not a fabricated test-only route.
    await page.goto(appPath + '#/plan?view=day')
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    // A visible Plan heading does not prove that owner-scoped evidence and
    // accepted sessions have finished loading. And a visible day panel after
    // Next day might still belong to the previous day. Require each selected
    // date before deciding that an independent task is absent.
    const dayPanel = page.locator('.pln-daypanel')
    await expect(dayPanel).toBeVisible()
    const initialTab = await dayPanel.getAttribute('aria-labelledby')
    expect(initialTab, 'The rendered Plan day must expose its actual selected date')
      .toMatch(/^pln-tab-\d{4}-\d{2}-\d{2}$/)
    let selectedDay = initialTab!.slice('pln-tab-'.length)
    const scannedDays: string[] = []
    let launched = false
    for (let day = 0; day < 14; day++) {
      await expect(dayPanel).toHaveAttribute('aria-labelledby', `pln-tab-${selectedDay}`)
      const suggested = dayPanel.locator('.pln-row[data-kind="suggested"]')
      const row = suggested.filter({ hasText: /Independent recheck:.*(?:Unit cost|average cost)/i })
      const allLabels = await suggested.allTextContents()
      scannedDays.push(`${selectedDay}: ${allLabels.length} suggested; ${allLabels
        .filter(label => /Independent recheck/i.test(label))
        .map(label => label.trim().replace(/\s+/g, ' ').slice(0, 140))
        .join(' | ') || 'no independent recheck'}`)
      if (await row.count()) {
        await row.first().getByRole('button', { name: /^(Up next|Start)/ }).click()
        launched = true
        break
      }
      if (day < 13) {
        const nextDay = addDaysToKey(selectedDay, 1)
        await page.getByRole('button', { name: 'Next day' }).click()
        await expect(dayPanel).toHaveAttribute('aria-labelledby', `pln-tab-${nextDay}`)
        selectedDay = nextDay
      }
    }
    expect(launched, `Original wrong unit-cost result must generate a source-linked Plan recheck. Rendered days: ${scannedDays.join('; ')}`).toBe(true)
    await expect(page.getByText('Calculation recheck')).toBeVisible()
    await expect(page.getByRole('heading', { name: fresh.prompt })).toBeVisible()
    await page.getByLabel('Your final number').fill(String(fresh.expected))
    await page.getByRole('button', { name: 'Certain', exact: true }).click()
    await expect(page.getByText('Answer saved')).toBeVisible()
    await expect.poll(async () => (await loadLearningEvidence(store, userId!, moduleId, topicId))
      .some(item => item.contentId === fresh.id && item.correct
        && individualSpecItemObservation(item)?.specItemId === target)).toBe(true)
    const after = await loadLearningEvidence(store, userId, moduleId, topicId)
    expect(findSkillRecheckOpportunities(candidates, after, topicId, [moduleId], ['operations-four-performance-measures']))
      .toEqual([])
    await page.reload()
    await page.goto(appPath + '#/progress')
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible()
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const deleted = await admin.auth.admin.deleteUser(userId)
      expect(deleted.error, 'Synthetic learner must be removed').toBeNull()
    }
  }
})
