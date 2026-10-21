import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { recordPlannerActivityEvent } from './planner-service'

const eventId = '5be4f051-31b4-41c6-850e-30252bd9ee25'
const request = {
  eventId, recommendationId: 'rec-7132', eventType: 'completed' as const,
  subjectId: 'business', courseId: 'aqa:aqa-a-level:7132',
  moduleId: 'aqa-business-paper-1', topicId: 'finance',
  activityType: 'quick-check', metadata: { source: 'focused_session_completed', evidenceItems: 5 },
}
const row = {
  event_id: eventId, user_id: 'student-1', recommendation_id: request.recommendationId,
  event_type: request.eventType, subject_id: request.subjectId,
  course_id: request.courseId, module_id: request.moduleId, topic_id: request.topicId,
  activity_type: request.activityType, occurred_at: '2026-10-21T10:00:00.000Z',
  metadata: request.metadata,
}

function fakeClient(input: {
  insertError?: { code: string; message: string }
  existing?: Record<string, unknown> | null
  readError?: { code: string; message: string }
}) {
  let insertCount = 0
  let queryCount = 0
  let inserted: Record<string, unknown> | null = null
  const client = {
    from: () => ({
      insert: (value: Record<string, unknown>) => {
        insertCount += 1
        inserted = value
        return {
          select: () => ({
            single: async () => ({
              data: input.insertError ? null : { ...row },
              error: input.insertError ?? null,
            }),
          }),
        }
      },
      select: () => {
        queryCount += 1
        const chain = {
          eq: () => chain,
          maybeSingle: async () => ({
            data: input.existing === undefined ? row : input.existing,
            error: input.readError ?? null,
          }),
        }
        return chain
      },
    }),
  }
  return { client: client as unknown as SupabaseClient, calls: () => ({ insertCount, queryCount, inserted }) }
}

describe('Focused Plan completion event idempotency', () => {
  it('saves a unique completion event ID with its exact learner and course scope', async () => {
    const fake = fakeClient({})
    const result = await recordPlannerActivityEvent(fake.client, 'student-1', request)
    expect(result.eventId).toBe(eventId)
    expect(fake.calls().inserted).toMatchObject({
      user_id: 'student-1', event_id: eventId, subject_id: 'business',
      course_id: request.courseId, topic_id: 'finance', event_type: 'completed',
    })
    expect(fake.calls()).toMatchObject({ insertCount: 1, queryCount: 0 })
  })

  it('recognises only the identical owner-scoped fact after a duplicate retry', async () => {
    const fake = fakeClient({ insertError: { code: '23505', message: 'duplicate key' },
      existing: { ...row, metadata: { evidenceItems: 5, source: 'focused_session_completed' } } })
    const result = await recordPlannerActivityEvent(fake.client, 'student-1', request)
    expect(result.eventId).toBe(eventId)
    expect(fake.calls()).toMatchObject({ insertCount: 1, queryCount: 1 })
  })

  it('refuses a conflicting event, even if the database reports a duplicate ID', async () => {
    for (const existing of [
      { ...row, topic_id: 'another-topic' },
      { ...row, event_type: 'started' },
      { ...row, metadata: { evidenceItems: 1, source: 'focused_session_completed' } },
      { ...row, user_id: 'student-2' },
    ]) {
      const fake = fakeClient({ insertError: { code: '23505', message: 'duplicate key' }, existing })
      await expect(recordPlannerActivityEvent(fake.client, 'student-1', request))
        .rejects.toThrow('conflicting activity details')
    }
  })

  it('never turns an unreadable duplicate, denied lookup or write failure into completion', async () => {
    for (const existing of [null, { ...row, event_id: 'different' }]) {
      const fake = fakeClient({ insertError: { code: '23505', message: 'duplicate key' }, existing })
      await expect(recordPlannerActivityEvent(fake.client, 'student-1', request)).rejects.toThrow()
    }
    const denied = fakeClient({ insertError: { code: '23505', message: 'duplicate key' },
      readError: { code: '42501', message: 'permission denied' } })
    await expect(recordPlannerActivityEvent(denied.client, 'student-1', request)).rejects.toThrow('Could not verify')
    const failed = fakeClient({ insertError: { code: '42501', message: 'permission denied' } })
    await expect(recordPlannerActivityEvent(failed.client, 'student-1', request)).rejects.toThrow('Could not record')
  })

  it('rejects malformed retry IDs without making a database write', async () => {
    const fake = fakeClient({})
    await expect(recordPlannerActivityEvent(fake.client, 'student-1', { ...request, eventId: 'wrong' })).rejects.toThrow('retry ID is invalid')
    expect(fake.calls().insertCount).toBe(0)
  })
})
