import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { fingerprintPracticeContent } from '../services/progress/practice-checkpoint-service'
import { fingerprintExamContent } from '../services/progress/exam-attempt-service'
import { buildCatalogue } from './catalogue-model'
import { availableCourseMocks } from './course-mock-catalogue'
import { allCatalogueCourses } from './learner-programme'
import { buildQuestionPool } from './practice-questions'
import { loadSavedWork } from './saved-work'

const userId = '00000000-0000-4000-8000-000000000041'
const programme = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
  .filter(item => item.course.id === 'aqa:aqa-a-level:7132')
const entry = programme[0]!
const adapter = entry.course.learningAdapter
const topic = adapter.listTopics()[0]!
const pool = buildQuestionPool({
  topicId: topic.id, topicOrder: topic.order,
  coursePack: adapter.listQuestions(topic.id), bank: adapter.listPracticeBank(),
  includeWritten: false,
})
const now = Date.parse('2026-10-30T12:00:00.000Z')

function fakeClient(rows: { practice?: unknown[]; exam?: unknown[]; practiceError?: boolean; examError?: boolean }) {
  const reads: Array<{ table: string; user: string; courses: string[] }> = []
  const client = {
    from(table: string) {
      return {
        select(columns: string) {
          void columns
          return {
            eq(_field: string, user: string) {
              return {
                in(_field: string, courses: string[]) {
                  return {
                    limit(max: number) {
                      void max
                      reads.push({ table, user, courses })
                      const failed = table === 'learner_practice_checkpoints' ? rows.practiceError : rows.examError
                      const data = table === 'learner_practice_checkpoints' ? rows.practice : rows.exam
                      return Promise.resolve({ data: data ?? [], error: failed ? { message: 'unavailable' } : null })
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  } as unknown as SupabaseClient
  return { client, reads }
}

async function practiceRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: userId, course_id: entry.course.id, module_id: adapter.manifest.id,
    topic_id: topic.id, content_fingerprint: await fingerprintPracticeContent(pool),
    expires_at: '2026-11-09T12:00:00.000Z', updated_at: '2026-10-30T11:00:00.000Z',
    snapshot: {
      schemaVersion: 1,
      session: {
        total: 5, currentId: pool[1]!.id, poolIds: pool.map(q => q.id),
        answers: [{ retry: false }],
      },
      pending: null,
    },
    ...overrides,
  }
}

describe('saved Practice and timed exam discovery', () => {
  it('returns an exact active-course Practice topic and confirmed count, without changing REV', async () => {
    const { client, reads } = fakeClient({ practice: [await practiceRow()] })
    const result = await loadSavedWork(client, userId, programme, now)
    expect(result.partialError).toBe(false)
    expect(result.practiceError).toBe(false)
    expect(result.items).toMatchObject([{
      kind: 'practice', courseId: entry.course.id, moduleId: adapter.manifest.id,
      topicId: topic.id, detail: '1 of 5 questions answered', actionLabel: 'Open saved Practice',
    }])
    expect(reads).toHaveLength(2)
    expect(reads.every(read => read.user === userId && read.courses.includes(entry.course.id))).toBe(true)
  })

  it('filters wrong owner, expired, changed content, unknown topic and submitted mocks', async () => {
    for (const invalid of [
      { user_id: 'different-user' }, { expires_at: '2026-10-29T09:00:00Z' },
      { content_fingerprint: '0'.repeat(64) }, { topic_id: 'non-existent' },
    ]) {
      const { client } = fakeClient({ practice: [await practiceRow(invalid)] })
      expect((await loadSavedWork(client, userId, programme, now)).items).toEqual([])
    }
    const { client } = fakeClient({ exam: [{
      user_id: userId, course_id: entry.course.id, module_id: adapter.manifest.id,
      exam_id: 'fake', content_fingerprint: '0'.repeat(64),
      phase: 'submitted',
      expires_at: '2026-11-09T12:00:00Z', updated_at: '2026-10-30T11:00:00Z',
    }] })
    expect((await loadSavedWork(client, userId, programme, now)).items).toEqual([])
  })

  it('identifies a real saved mock and distinguishes submission recovery', async () => {
    const mock = availableCourseMocks(entry.course)[0]!
    const { client } = fakeClient({ exam: [{
      user_id: userId, course_id: entry.course.id, module_id: mock.moduleId,
      exam_id: mock.exam.id, content_fingerprint: await fingerprintExamContent(mock.exam),
      phase: 'submitting',
      expires_at: '2026-11-09T12:00:00Z', updated_at: '2026-10-30T11:00:00Z',
    }] })
    expect((await loadSavedWork(client, userId, programme, now)).items).toMatchObject([{
      kind: 'exam', actionLabel: 'Open saved Exam Prep', detail: 'Exam submission needs finishing',
    }])
  })

  it('keeps recoverable Practice visible when only exam lookup fails; fails closed if both fail', async () => {
    const partial = fakeClient({ practice: [await practiceRow()], examError: true })
    expect(await loadSavedWork(partial.client, userId, programme, now)).toMatchObject({
      partialError: true, practiceError: false, items: [{ kind: 'practice' }],
    })
    const lostPractice = fakeClient({ practiceError: true })
    expect(await loadSavedWork(lostPractice.client, userId, programme, now)).toMatchObject({
      partialError: true, practiceError: true, items: [],
    })
    const both = fakeClient({ practiceError: true, examError: true })
    await expect(loadSavedWork(both.client, userId, programme, now)).rejects.toThrow(/Could not check/)
  })
})
