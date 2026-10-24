import { expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { seedPracticeCheckpoints } from './practice-checkpoint-seed'
import { seedExamAttemptBackend } from './exam-attempt-backend'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
export const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000041'
export const businessCourseId = 'aqa:aqa-a-level:7132'

export async function seedReturningStudent(page: Page) {
  await seedPracticeCheckpoints(page)
  await seedExamAttemptBackend(page)
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
        email: 'returning-home-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
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
        email: 'returning-home-test@revision.invalid',
        email_confirmed_at: '2026-08-17T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-17T12:00:00.000Z',
        updated_at: '2026-08-17T12:00:00.000Z',
      }),
    })
  })

  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: businessCourseId, created_at: '2026-08-22T18:00:00.000Z' }]) })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  // The shared synthetic learner has no previously reviewed Learn pages.
  // Recovery tests override this route explicitly for failure/retry coverage.
  await page.route('**/rest/v1/learner_learn_exposures**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_activity_events**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: false }) })
  })
}


export const practicePath = `${appPath}#/courses/${encodeURIComponent(businessCourseId)}/practice`

/** Reads the evidence the page tried to save, so the test can check what was recorded. */
export async function captureEvidence(page: Page) {
  const saved: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as Record<string, unknown> | Array<Record<string, unknown>>
      saved.push(...(Array.isArray(body) ? body : [body]))
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
  })
  return saved
}


// ---- Answering questions in the Practice pop-up (v2.2) ------------------------------------------------------------

type BankRecord = { question: { stem: string; options: Array<{ label: string }>; mark_scheme: { correct_option?: string; points?: Array<{ marks: number; descriptor: string; accept: string[] }> } } }
const bank: BankRecord[] = (JSON.parse(readFileSync('content/business/aqa-a-level/shared/fast-path-question-bank.json', 'utf8')) as { questions: BankRecord[] }).questions

/** The right option for a question from the AQA bank, found by its wording. Null for questions that are not in the bank. */
export function bankCorrectIndex(prompt: string): number | null {
  const record = bank.find((item) => item.question.stem.trim() === prompt.trim())
  if (!record) return null
  return record.question.options.findIndex((option) => option.label === record.question.mark_scheme.correct_option)
}

export type Sure = 'Guessing' | 'Fairly sure' | 'Certain'

export async function startQuestions(page: Page) {
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.locator('.practice-question__prompt')).toBeVisible()
}

/** Picks an option and says how sure you are, which checks the answer. */
export async function answerWith(page: Page, index: number, sure: Sure = 'Fairly sure') {
  await page.locator('.practice-question__options button').nth(index).click()
  await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: sure }).click()
  await expect(page.locator('.ui-feedback-bar')).toBeVisible()
}

/** Answers the question on screen right or wrong. Needs the question to be in the AQA bank. */
export async function answerKnown(page: Page, right: boolean, sure: Sure = 'Fairly sure') {
  const prompt = (await page.locator('.practice-question__prompt').textContent()) ?? ''
  const correct = bankCorrectIndex(prompt)
  expect(correct, `"${prompt.slice(0, 60)}" should be in the AQA bank`).not.toBeNull()
  const count = await page.locator('.practice-question__options button').count()
  await answerWith(page, right ? correct! : (correct! + 1) % count, sure)
  return prompt
}

/** The mark points of a written question from the AQA bank, found by its wording. */
export function bankMarkPoints(prompt: string) {
  const record = bank.find((item) => item.question.stem.trim() === prompt.trim().replace(/\s+\n/g, '\n'))
    ?? bank.find((item) => item.question.stem.replace(/\s+/g, ' ').trim() === prompt.replace(/\s+/g, ' ').trim())
  expect(record, `"${prompt.slice(0, 60)}" should be in the AQA bank`).toBeTruthy()
  return record!.question.mark_scheme.points ?? []
}

export type QuestionSessionPlan = Array<{ right: boolean; sure: Sure }>

/** Runs a whole session through the real screens. Each answer follows the plan; once the plan runs out, answers are right. */
export async function finishQuestionSession(page: Page, plan: QuestionSessionPlan) {
  const done = page.getByText(/^Session done · /)
  const learned = new Map<string, number>()
  const planned = new Map<string, { right: boolean; sure: Sure }>()
  for (let index = 0; index < 40; index += 1) {
    if (await done.isVisible()) return
    const prompt = (await page.locator('.practice-question__prompt').textContent()) ?? ''
    // The plan covers each question's first go. A retry is answered right and sure, which is what ends the session.
    const seen = planned.has(prompt)
    if (!seen) planned.set(prompt, plan[planned.size] ?? { right: true, sure: 'Certain' as Sure })
    const step = seen ? { right: true, sure: 'Certain' as Sure } : planned.get(prompt)!
    const known = bankCorrectIndex(prompt) ?? learned.get(prompt) ?? null
    if (known === null) {
      // Outside the AQA bank: guess by position, then read the right option from the feedback so a retry can be answered properly.
      await answerWith(page, 0, step.sure)
      learned.set(prompt, await page.locator('.practice-question__options button').evaluateAll((buttons) => buttons.findIndex((button) => button.classList.contains('ui-answer-option--correct'))))
    } else {
      const count = await page.locator('.practice-question__options button').count()
      await answerWith(page, step.right ? known : (known + 1) % count, step.sure)
    }
    await page.getByRole('button', { name: /^(Next question|See how you did)/ }).click()
    // The new versioned checkpoint must be acknowledged before the question
    // changes or the summary appears. Do not race the old question after click.
    await expect(page.getByRole('button', { name: /^(Next question|See how you did)/ })).toHaveCount(0)
  }
  await expect(done).toBeVisible()
}
