import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { completeStudentFirstUse, establishStudentExperience } from '../../src/services/onboarding/student-first-use-service'
import { readFileSync } from 'node:fs'
import type { StructuredPracticeBankRecord } from '../../content/structured-practice-bank'
import { bankRecordToPractice, objectiveItemMappingForPractice, topicOrderForSpecItem } from '../../src/app/practice-questions'
import { topics as businessTopics } from '../../content/business/aqa-a-level/shared/topics'
import { createMultipleChoiceEvidence } from '../../src/app/practice-evidence'
import { createCalculationEvidence } from '../../src/app/practice-evidence'
import { businessMarketingQuantitativeBank } from '../../content/business/aqa-a-level/shared/marketing-quantitative-practice'
import type { CalculationPracticeQuestion } from '../../src/app/practice-questions'
import { individualSpecItemObservation } from '../../src/engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../../src/services/progress/learning-evidence-service'

const enabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const url = process.env.SUPABASE_URL ?? ''
const anon = process.env.SUPABASE_ANON_KEY ?? ''
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const app = '/revision/app/'

test('configured ordinary learner sees actual derived Plan activities with no accepted sessions', async ({ page }) => {
  test.skip(!enabled, 'Run only against disposable local Supabase Auth/PostgREST')
  test.setTimeout(120_000)
  const address = new URL(url)
  if (address.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(address.hostname)
    || address.port !== '54321' || !anon || !secret) {
    throw new Error('Real-auth planner assurance must never run against production')
  }
  const admin = createClient(url, secret, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const learner = createClient(url, anon, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const email = `planner-proof-${crypto.randomUUID()}@revision.invalid`
  const password = `Planner-${crypto.randomUUID()}-A1!`
  let userId: string | undefined
  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createError || !created.user) throw new Error('Cannot create synthetic learner: ' + createError?.message)
    userId = created.user.id
    const { error: loginError } = await learner.auth.signInWithPassword({ email, password })
    if (loginError) throw loginError
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)

    const courseIds = ['aqa:aqa-a-level:7132', 'aqa:aqa-a-level:7182']
    const { error: courseError } = await learner.from('learner_courses').insert(
      courseIds.map((course_id) => ({ user_id: userId, course_id })))
    if (courseError) throw courseError
    const exams = [
      { course_id: courseIds[0], subject_id: 'business', assessment_date: '2027-05-20' },
      { course_id: courseIds[0], subject_id: 'business', assessment_date: '2027-06-03' },
      { course_id: courseIds[0], subject_id: 'business', assessment_date: '2027-06-10' },
      { course_id: courseIds[1], subject_id: 'psychology', assessment_date: '2027-04-08' },
    ]
    const { error: examError } = await learner.from('revision_assessments').insert(
      exams.map((item, i) => ({
        ...item, user_id: userId, module_id: null, assessment_type: 'public_exam',
        title: 'Synthetic exam ' + i, relative_importance: 'normal', scope: {}, is_active: true,
      })))
    if (examError) throw examError
    const { error: capacityError } = await learner.from('revision_availability_profiles').upsert({
      user_id: userId, timezone: 'Europe/London', weekday_minutes: 45, weekend_minutes: 0,
      monday_minutes: 45, tuesday_minutes: 45, wednesday_minutes: 45,
      thursday_minutes: 45, friday_minutes: 45, saturday_minutes: 0, sunday_minutes: 0,
    })
    if (capacityError) throw capacityError

    await page.goto(app)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.goto(`${app}#/plan`)
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.locator('.pln-weekview')).toBeVisible()
    // This synthetic learner has zero Saturday/Sunday study minutes. When the
    // test runs at the weekend, the current week can validly contain no future
    // suggested sessions. Check the next week inside the rolling 14-day plan
    // rather than misclassifying that policy as a planner outage.
    const localWeekday = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', timeZone: 'Europe/London',
    }).format(new Date())
    if (localWeekday === 'Saturday' || localWeekday === 'Sunday') {
      await page.getByRole('button', { name: 'Next week' }).click()
    }
    await expect(page.locator('.pln-row[data-kind="suggested"]').first()).toBeVisible()
    await expect(page.locator('.pln-summary')).not.toContainText('No activities planned')
    await page.reload()
    await expect(page.locator('.pln-row[data-kind="suggested"]').first()).toBeVisible()

    // B1a: actual authenticated PostgREST owner save/read of the same mapped
    // question evidence the normal Course Practice screen now constructs.
    // This is a persistence contract, NOT a claim that Plan has learned a
    // separate skill-mastery formula or that every bank question is mapped.
    // Read the published fixture as plain JSON: Playwright executes this test
    // in Node, outside Vite, so importing the Vite bank wrapper would require
    // an unsupported JSON import attribute and crash all browser assurance.
    const bankJson = JSON.parse(readFileSync(new URL(
      '../../content/business/aqa-a-level/shared/fast-path-question-bank.json', import.meta.url,
    ), 'utf8')) as { questions: StructuredPracticeBankRecord[] }
    const bankRecord = bankJson.questions.find((record) =>
      record.question.family === 'MCQ' && record.target_item_ids.length === 1)
    expect(bankRecord).toBeDefined()
    const order = topicOrderForSpecItem(bankRecord!.target_item_ids[0]!)
    const topic = businessTopics.find((entry) => entry.order === order)
    expect(topic).toBeDefined()
    const authored = bankRecordToPractice(bankRecord!, topic!.id)
    expect(authored?.type).toBe('multiple-choice')
    if (!authored || authored.type !== 'multiple-choice') throw new Error('Missing published objective item')
    const sourceMapping = objectiveItemMappingForPractice(authored)
    expect(sourceMapping?.singleTargetSpecItemId).toBe(bankRecord!.target_item_ids[0])
    const fact = createMultipleChoiceEvidence({
      id: 'real-db-mapped-' + crypto.randomUUID(),
      moduleId: 'business-aqa-a-level-7132-paper-1', topicId: authored.topicId,
      contentId: authored.id, selectedOption: authored.correctOption,
      correctOption: authored.correctOption, confidence: 'certain',
      itemMapping: sourceMapping,
    })
    const store = createSupabaseEvidenceStore(learner)
    await recordLearningEvidence(store, userId, fact)
    const saved = await loadLearningEvidence(store, userId, fact.moduleId, fact.topicId)
    expect(saved.find((entry) => entry.id === fact.id)).toEqual(fact)
    expect(individualSpecItemObservation(saved.find((entry) => entry.id === fact.id)!))
      .toMatchObject({ specItemId: bankRecord!.target_item_ids[0],
        contentId: authored.id, correct: true, scoring: 'software-scored-choice' })
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Synthetic test account cleanup must succeed').toBeNull()
    }
  }
})

/** IA-03 / IA-05 / #703: separate *real owner-authenticated PostgREST/browser*
 * proof of the two independent Business Marketing skill deficits.
 *
 * Does not claim the seeded first wrong answers came from browser UI, that
 * method marks were awarded, or that all repair → recheck → Progress behaviour
 * has passed. Never run this against a hosted/production Supabase project.
 */
test('real Business learner retains two distinct wrong Marketing skills and sees source-backed Plan after reload', async ({ page }) => {
  test.skip(!enabled, 'Requires disposable isolated local Supabase stack')
  test.setTimeout(120_000)
  const address = new URL(url)
  if (address.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(address.hostname)
    || address.port !== '54321' || !anon || !secret) {
    throw new Error('Business real-auth evidence acceptance must never target production')
  }
  const admin = createClient(url, secret, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const learner = createClient(url, anon, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const email = `business-skills-${crypto.randomUUID()}@revision.invalid`
  const password = `Revision-${crypto.randomUUID()}-A1!`
  let userId: string | undefined
  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createError || !created.user) throw new Error('Cannot create isolated student: ' + createError?.message)
    userId = created.user.id
    const { error: signInError } = await learner.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)

    const courseId = 'aqa:aqa-a-level:7132'
    const moduleId = 'business-aqa-a-level-7132-paper-1'
    const { error: courseError } = await learner.from('learner_courses').insert({ user_id: userId, course_id: courseId })
    expect(courseError).toBeNull()
    const { error: examError } = await learner.from('revision_assessments').insert({
      user_id: userId, course_id: courseId, subject_id: 'business',
      module_id: null, assessment_type: 'public_exam', title: 'Business Paper 1',
      assessment_date: '2027-05-20', relative_importance: 'high',
      scope: { topicIds: ['marketing'] }, is_active: true,
    })
    expect(examError).toBeNull()
    const { error: timeError } = await learner.from('revision_availability_profiles').upsert({
      user_id: userId, timezone: 'Europe/London', weekday_minutes: 90, weekend_minutes: 90,
      monday_minutes: 90, tuesday_minutes: 90, wednesday_minutes: 90,
      thursday_minutes: 90, friday_minutes: 90, saturday_minutes: 90, sunday_minutes: 90,
    })
    expect(timeError).toBeNull()

    const salesBank = businessMarketingQuantitativeBank.find(x => x.id === 'firm-sales-growth-increase-01')
    const marketBank = businessMarketingQuantitativeBank.find(x => x.id === 'market-growth-decline-02')
    expect(salesBank).toBeDefined()
    expect(marketBank).toBeDefined()
    const getCalculation = (record: NonNullable<typeof salesBank>) => {
      const q = bankRecordToPractice(record, 'marketing')
      if (!q || q.type !== 'calculation') throw new Error('Missing original published Marketing numeric task')
      return q as CalculationPracticeQuestion
    }
    const sales = getCalculation(salesBank!)
    const market = getCalculation(marketBank!)
    const salesSkill = objectiveItemMappingForPractice(sales)?.singleTargetSpecItemId
    const marketSkill = objectiveItemMappingForPractice(market)?.singleTargetSpecItemId
    expect(salesSkill).toBe('aqa-7132-3.3.2:sales-growth')
    expect(marketSkill).toBe('aqa-7132-3.3.1:market-growth')
    expect(salesSkill).not.toBe(marketSkill)

    const start = new Date(Date.now() - 120_000).toISOString()
    const facts = [sales, market].map((question, index) => createCalculationEvidence({
      id: `real-business-wrong-${index}-${crypto.randomUUID()}`,
      moduleId, topicId: 'marketing', contentId: question.id, correct: false,
      enteredValue: question.expected + 7, expectedValue: question.expected,
      unit: question.unit, confidence: 'certain',
      itemMapping: objectiveItemMappingForPractice(question),
      occurredAt: new Date(Date.parse(start) + index * 1000).toISOString(),
    }))
    const store = createSupabaseEvidenceStore(learner)
    for (const fact of facts) await recordLearningEvidence(store, userId, fact)
    const actual = await loadLearningEvidence(store, userId, moduleId, 'marketing')
    expect(actual).toEqual(expect.arrayContaining(facts))
    const observed = actual.map(individualSpecItemObservation).filter(Boolean)
    expect(new Set(observed.map(x => x!.specItemId))).toEqual(new Set([salesSkill, marketSkill]))
    expect(observed.every(x => !x!.correct)).toBe(true)
    expect(observed.every(x => x!.scoring === 'software-scored-final-number')).toBe(true)

    // A fresh signed-in browser, with NO synthetic tokens, response mocking or
    // admin-created evidence, must consume those same persisted owner facts.
    await page.goto(app)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.goto(`${app}#/plan`)
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()
    await expect(page.locator('.pln-weekview')).toBeVisible()
    await expect(page.locator('.pln-row[data-kind="suggested"]').filter({ hasText: 'Marketing' }).first()).toBeVisible()
    await page.reload()
    await expect(page.locator('.pln-row[data-kind="suggested"]').filter({ hasText: 'Marketing' }).first()).toBeVisible()
    await page.goto(`${app}#/progress`)
    await expect(page.getByRole('heading', { level: 1, name: 'Progress', exact: true })).toBeVisible()
    const persisted = await loadLearningEvidence(store, userId, moduleId, 'marketing')
    expect(persisted).toEqual(expect.arrayContaining(facts))
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      expect(error, 'Isolated Business test learner cleanup').toBeNull()
    }
  }
})


/**
 * #703: authentic Psychology Paper 3 choices → owner-scoped persistence →
 * FI-001 Plan programme after changed options, dates and availability.
 * Does not claim educational adequacy or independently assessed mastery.
 */
test('real Psychology learner changes Paper 3 options without planning unselected syllabus topics', async ({ page }) => {
  test.skip(!enabled, 'Requires disposable local real-Auth Supabase/PostgREST')
  test.setTimeout(180_000)
  const address = new URL(url)
  if (address.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(address.hostname)
    || address.port !== '54321' || !anon || !secret) {
    throw new Error('Psychology scope acceptance must never target hosted learners')
  }
  const admin = createClient(url, secret, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const learner = createClient(url, anon, { auth: {
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
  } })
  const courseId = 'aqa:aqa-a-level:7182'
  const moduleId = 'psychology-aqa-a-level-7182-paper-3'
  const firstOptions = ['issues-and-debates-in-psychology', 'relationships', 'schizophrenia', 'aggression']
  const secondOptions = ['issues-and-debates-in-psychology', 'cognition-and-development', 'eating-behaviour', 'forensic-psychology']
  const email = 'psychology-options-' + crypto.randomUUID() + '@revision.invalid'
  const password = 'Psychology-' + crypto.randomUUID() + '-A1!'
  let userId: string | undefined
  try {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    if (created.error || !created.data.user) throw new Error('Local Psychology user setup failed: ' + created.error?.message)
    userId = created.data.user.id
    const auth = await learner.auth.signInWithPassword({ email, password })
    if (auth.error) throw auth.error
    await establishStudentExperience(learner, userId)
    await completeStudentFirstUse(learner, userId)
    const course = await learner.from('learner_courses').insert({ user_id: userId, course_id: courseId })
    expect(course.error).toBeNull()
    const daily = {
      user_id: userId, timezone: 'Europe/London', weekday_minutes: 75, weekend_minutes: 75,
      monday_minutes: 75, tuesday_minutes: 75, wednesday_minutes: 75, thursday_minutes: 75,
      friday_minutes: 75, saturday_minutes: 75, sunday_minutes: 75,
    }
    expect((await learner.from('revision_availability_profiles').upsert(daily)).error).toBeNull()

    const stored = async () => {
      const { data, error } = await learner.from('revision_assessments')
        .select('assessment_id, module_id, scope, assessment_date, is_active')
        .eq('user_id', userId!).eq('course_id', courseId).eq('module_id', moduleId)
      if (error) throw error
      return data ?? []
    }
    const active = async () => (await stored()).filter((row) => row.is_active)
    await page.goto(app)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.goto(app + '#/plan?view=week')
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible()

    async function saveChoice(b: string, c: string, d: string, date: string) {
      await page.locator('.pln-head__actions').getByRole('button', { name: 'Exam dates', exact: true }).click()
      const modal = page.locator('.pln-dialog')
      await expect(modal.getByRole('heading', { name: 'Your exams' })).toBeVisible()
      await modal.getByLabel('Exam', { exact: true }).selectOption(courseId + '::' + moduleId)
      await expect(modal.locator('[aria-label="Psychology Paper 3 options"]')).toBeVisible()
      await modal.getByLabel('Section B').selectOption(b)
      await modal.getByLabel('Section C').selectOption(c)
      await modal.getByLabel('Section D').selectOption(d)
      await modal.getByLabel('Exam date').fill(date)
      await modal.getByRole('button', { name: 'Add exam' }).click()
      await expect(page.getByText('Exam added. REV has re-planned around the new date.')).toBeVisible()
      await expect(modal).toHaveCount(0)
      await expect.poll(async () => (await active()).length).toBe(1)
    }

    async function assertPlanScope(chosen: string[], excluded: string[]) {
      await page.goto(app + '#/plan?view=week')
      await expect(page.locator('.pln-weekview')).toBeVisible()
      const disclosure = page.locator('.pln-programme-disclosure')
      await expect(disclosure).toBeVisible()
      if (await disclosure.getAttribute('open') === null) await disclosure.locator(':scope > summary').click()
      const programme = page.getByRole('region', { name: 'Your full exam programme' })
      await expect(programme).toContainText('not a measurement of all syllabus work')
      const required = programme.locator('[aria-label="Verified course knowledge requirements"]')
      const details = required.locator('details')
      if (await details.getAttribute('open') === null) await details.locator(':scope > summary').click()
      const names = (await required.locator('li strong').allInnerTexts()).map((text) => text.toLowerCase())
      expect(names, 'Only four actual selected Paper 3 topics may be obligations').toHaveLength(4)
      for (const item of chosen) expect(names.some((name) => name.includes(item.toLowerCase()))).toBe(true)
      for (const item of excluded) expect(names.some((name) => name.includes(item.toLowerCase()))).toBe(false)
      await expect(programme).not.toContainText('All preparation is complete')
    }

    await saveChoice('relationships', 'schizophrenia', 'aggression', '2027-06-09')
    const first = (await active())[0]!
    expect(first.scope).toEqual({ topicIds: firstOptions })
    expect(first.assessment_date).toBe('2027-06-09')
    await page.reload()
    await assertPlanScope(
      ['Issues and Debates', 'Relationships', 'Schizophrenia', 'Aggression'],
      ['Gender', 'Cognition', 'Eating behaviour', 'Stress', 'Forensic', 'Addiction'],
    )

    // Change option group and date via ordinary Plan controls, retaining the
    // original archived assessment as historical data, not active scope.
    await page.locator('.pln-head__actions').getByRole('button', { name: 'Exam dates', exact: true }).click()
    const old = page.locator('.plan-exam-list li').filter({ hasText: 'Paper 3' })
    await expect(old).toContainText('Paper 3 options:')
    await old.getByRole('button', { name: /^Remove/ }).click()
    await expect.poll(async () => (await active()).length).toBe(0)
    await page.locator('.pln-dialog').getByRole('button', { name: 'Close' }).click()
    await saveChoice('cognition-and-development', 'eating-behaviour', 'forensic-psychology', '2027-05-20')
    const second = (await active())[0]!
    expect(second.scope).toEqual({ topicIds: secondOptions })
    expect(second.assessment_date).toBe('2027-05-20')
    expect(second.assessment_id).not.toBe(first.assessment_id)
    expect((await stored()).find((row) => row.assessment_id === first.assessment_id)?.is_active).toBe(false)
    await page.reload()
    await assertPlanScope(
      ['Issues and Debates', 'Cognition', 'Eating behaviour', 'Forensic'],
      ['Relationships', 'Gender', 'Schizophrenia', 'Stress', 'Aggression', 'Addiction'],
    )

    // Zero saved study time changes allocation, not the course requirements.
    const zero = Object.fromEntries(Object.keys(daily).filter((key) => key.endsWith('_minutes'))
      .map((key) => [key, 0]))
    expect((await learner.from('revision_availability_profiles').update(zero).eq('user_id', userId)).error).toBeNull()
    await page.reload()
    await assertPlanScope(
      ['Issues and Debates', 'Cognition', 'Eating behaviour', 'Forensic'],
      ['Relationships', 'Gender', 'Schizophrenia', 'Stress', 'Aggression', 'Addiction'],
    )
    await expect(page.getByRole('region', { name: 'Your full exam programme' }))
      .toContainText('No saved study time for this week')
  } finally {
    await learner.auth.signOut()
    if (userId) {
      const removed = await admin.auth.admin.deleteUser(userId)
      expect(removed.error, 'Disposable user cleanup must succeed').toBeNull()
    }
  }
})
