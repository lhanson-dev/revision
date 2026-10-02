import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  addPlannedSession,
  loadPlannedSessions,
  movePlannedSession,
  removePlannedSession,
  setPlannedSessionStatus,
  type NewPlannedSession,
} from './planned-session-service'

type Call = { table: string; steps: Array<[string, unknown[]]> }

/** A chainable stand-in for the Supabase client that records what was asked and returns a canned answer. */
function fakeClient(result: { data?: unknown; error?: { code?: string; message: string } | null }) {
  const calls: Call[] = []
  const client = {
    from(table: string) {
      const call: Call = { table, steps: [] }
      calls.push(call)
      const chain: Record<string, unknown> = {}
      for (const name of ['select', 'insert', 'update', 'delete', 'eq', 'gte', 'lte', 'order', 'single']) {
        chain[name] = (...args: unknown[]) => {
          call.steps.push([name, args])
          return chain
        }
      }
      chain.then = (resolve: (value: unknown) => void) => resolve({ data: result.data ?? null, error: result.error ?? null })
      return chain
    },
  } as unknown as SupabaseClient
  return { client, calls }
}

const row = {
  session_id: 's1', user_id: 'u1', planned_date: '2026-10-08', course_id: 'aqa:aqa-a-level:7132', topic_id: 'finance',
  activity_type: 'practice', minutes: 20, added_by: 'rev', recommendation_id: 'rec-1', status: 'planned',
  created_at: '2026-10-02T06:00:00.000Z', updated_at: '2026-10-02T06:00:00.000Z',
}
const valid: NewPlannedSession = { plannedDate: '2026-10-08', courseId: 'aqa:aqa-a-level:7132', topicId: 'finance', activityType: 'practice', minutes: 20, addedBy: 'student' }

describe('planned session service', () => {
  it('loads only the student\'s own sessions in the date range, earliest first, as plain objects', async () => {
    const { client, calls } = fakeClient({ data: [row] })
    const sessions = await loadPlannedSessions(client, 'u1', '2026-10-05', '2026-10-11')
    expect(calls[0].table).toBe('learner_planned_sessions')
    const names = calls[0].steps.map(([name]) => name)
    expect(names).toEqual(['select', 'eq', 'gte', 'lte', 'order', 'order'])
    expect(calls[0].steps.find(([name]) => name === 'eq')?.[1]).toEqual(['user_id', 'u1'])
    expect(sessions).toEqual([{
      sessionId: 's1', userId: 'u1', plannedDate: '2026-10-08', courseId: 'aqa:aqa-a-level:7132', topicId: 'finance',
      activityType: 'practice', minutes: 20, addedBy: 'rev', recommendationId: 'rec-1', status: 'planned',
      createdAt: '2026-10-02T06:00:00.000Z', updatedAt: '2026-10-02T06:00:00.000Z',
    }])
  })

  it('refuses bad input before asking the database', async () => {
    const { client, calls } = fakeClient({ data: row })
    await expect(addPlannedSession(client, 'u1', { ...valid, minutes: 3 })).rejects.toThrow('between 5 and 240')
    await expect(addPlannedSession(client, 'u1', { ...valid, minutes: 600 })).rejects.toThrow('between 5 and 240')
    await expect(addPlannedSession(client, 'u1', { ...valid, minutes: 12.5 })).rejects.toThrow('between 5 and 240')
    await expect(addPlannedSession(client, 'u1', { ...valid, plannedDate: 'Thursday' })).rejects.toThrow('date like')
    await expect(addPlannedSession(client, 'u1', { ...valid, topicId: '  ' })).rejects.toThrow('topic is needed')
    await expect(movePlannedSession(client, 'u1', 's1', 'tomorrow')).rejects.toThrow('date like')
    await expect(loadPlannedSessions(client, 'u1', 'x', '2026-10-11')).rejects.toThrow('date like')
    expect(calls).toHaveLength(0)
  })

  it('adds a session for the signed-in student and records who added it', async () => {
    const { client, calls } = fakeClient({ data: row })
    const added = await addPlannedSession(client, 'u1', { ...valid, addedBy: 'rev', recommendationId: 'rec-1' })
    expect(added.addedBy).toBe('rev')
    const insert = calls[0].steps.find(([name]) => name === 'insert')?.[1][0] as Record<string, unknown>
    expect(insert).toMatchObject({ user_id: 'u1', planned_date: '2026-10-08', activity_type: 'practice', minutes: 20, added_by: 'rev', recommendation_id: 'rec-1' })
  })

  it('says plainly when the same thing is already planned that day', async () => {
    const { client } = fakeClient({ error: { code: '23505', message: 'duplicate key' } })
    await expect(addPlannedSession(client, 'u1', valid)).rejects.toThrow('already planned for that day')
    await expect(movePlannedSession(client, 'u1', 's1', '2026-10-09')).rejects.toThrow('already planned for that day')
  })

  it('updates, moves and removes only the student\'s own session', async () => {
    const done = fakeClient({ data: { ...row, status: 'done' } })
    expect((await setPlannedSessionStatus(done.client, 'u1', 's1', 'done')).status).toBe('done')
    const moved = fakeClient({ data: { ...row, planned_date: '2026-10-09' } })
    expect((await movePlannedSession(moved.client, 'u1', 's1', '2026-10-09')).plannedDate).toBe('2026-10-09')
    for (const { calls } of [done, moved]) {
      const eqs = calls[0].steps.filter(([name]) => name === 'eq').map(([, args]) => args)
      expect(eqs).toEqual([['user_id', 'u1'], ['session_id', 's1']])
    }
    const removed = fakeClient({})
    await removePlannedSession(removed.client, 'u1', 's1')
    expect(removed.calls[0].steps.map(([name]) => name)).toEqual(['delete', 'eq', 'eq'])
  })

  it('turns database errors into readable messages', async () => {
    const { client } = fakeClient({ error: { message: 'boom' } })
    await expect(loadPlannedSessions(client, 'u1', '2026-10-05', '2026-10-11')).rejects.toThrow('Could not load your planned sessions: boom')
    await expect(removePlannedSession(client, 'u1', 's1')).rejects.toThrow('Could not remove that session: boom')
  })
})
