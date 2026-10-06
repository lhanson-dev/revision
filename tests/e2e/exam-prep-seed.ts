import type { Page } from '@playwright/test'
import { businessCourseId, seedReturningStudent } from './practice-seed'

const userId = '00000000-0000-4000-8000-000000000041'

/** A returning student with an exam date and some saved answers, so the page shows real coverage and a real countdown. */
export async function seedExamPrepStudent(page: Page, options: { theme?: 'light' | 'dark'; started?: readonly string[]; examDate?: string | null; attempts?: boolean } = {}) {
  const { theme = 'light', started = ['business', 'leadership', 'marketing', 'operations', 'finance', 'hr'], examDate = '2027-05-11', attempts = false } = options
  await page.addInitScript((value) => localStorage.setItem('revision:theme', value), theme)
  await seedReturningStudent(page)
  const rows = started.map((topic, index) => ({
    payload: { id: `seed-${topic}`, moduleId: 'business-aqa-a-level-7132-paper-1', topicId: topic, occurredAt: `2026-10-0${(index % 5) + 1}T10:00:00.000Z`, contentId: `seed-${topic}`, schemaVersion: 1, source: 'multiple_choice', correct: index % 3 !== 0, selectedOption: 0, correctOption: 0 },
  }))
  if (attempts) rows.push({ payload: { id: 'seed-attempt', moduleId: 'business-aqa-a-level-7132-paper-1', topicId: 'business', occurredAt: '2026-10-03T10:00:00.000Z', contentId: 'aqa-a-level-7132-paper-1-sim-1', schemaVersion: 1, source: 'exam_attempt', marksAwarded: 21, marksAvailable: 100, durationMinutes: 95, timed: true, markingMethod: 'self_assessed' } as never })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: route.request().method() === 'POST' ? 201 : 200, contentType: 'application/json', body: route.request().method() === 'POST' ? '[]' : JSON.stringify(rows) })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify(examDate ? [{ assessment_id: 'a1', subject_id: 'business', course_id: businessCourseId, module_id: null, title: 'Paper 1', assessment_date: examDate }] : []),
    })
  })
}

export const examPrepPath = `/revision/app/#/courses/${encodeURIComponent(businessCourseId)}/exam-prep`
export { userId }
