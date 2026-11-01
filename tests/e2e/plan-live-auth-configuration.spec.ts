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
import { findSkillRecheckOpportunities } from '../../src/app/skill-recheck'
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
    await expect(page.getByRole('heading', { name: /Progress/ })).toBeVisible()
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
