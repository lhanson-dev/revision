import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { businessDecisionTreeNumericalBank } from '../../content/business/aqa-a-level/shared/decision-tree-numeric-practice'
import { bankRecordToPractice, objectiveItemMappingForPractice, type CalculationPracticeQuestion } from '../../src/app/practice-questions'
import { createCalculationEvidence } from '../../src/app/practice-evidence'
import { markLearnPageReviewed, loadLearnExposures } from '../../src/services/progress/learn-exposure-service'
import { individualSpecItemObservation } from '../../src/engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../../src/services/progress/learning-evidence-service'
import { findSkillRecheckOpportunities } from '../../src/app/skill-recheck'
import { completeStudentFirstUse, establishStudentExperience } from '../../src/services/onboarding/student-first-use-service'

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

    await page.reload()
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
 * Learn exposure is owner-saved via the existing learner service; teaching
 * UI, two-skill coverage and shared Home/REV response remain separate gates.
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

    // Previously reviewed teaching is legitimate exposure, not knowledge,
    // scored evidence or a fabricated completed activity.
    await markLearnPageReviewed(learner, {
      userId, courseId: businessId, moduleId, topicId, pageId: 'bus-evi-004',
    })
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

    // Leave the unfinished Practice checkpoint intact and navigate normally.
    // The Plan must still derive an independently authored skill recheck from
    // the stored wrong answer rather than substituting a generic question.
    await page.goto(appPath + '#/plan?view=day')
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.locator('.pln-daypanel')).toBeVisible()
    const rows = page.locator('.pln-daypanel .pln-row[data-kind="suggested"]')
      .filter({ hasText: 'Leadership' }).filter({ hasText: 'Practice question' })
    const count = await rows.count()
    expect(count, 'Leadership must offer a real current-day Practice activity').toBeGreaterThan(0)
    let selected = false
    for (let i = 0; i < count; i += 1) {
      await rows.nth(i).getByRole('button', { name: /^(Up next|Start)/ }).click()
      if (await page.getByText('Calculation recheck').isVisible()) {
        selected = true
        break
      }
      await page.getByRole('button', { name: 'Back to Plan' }).click()
    }
    expect(selected, 'Actual learner Plan must launch the distinct expected-value check').toBe(true)
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
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Local learner cleanup').toBeNull()
    }
  }
})
