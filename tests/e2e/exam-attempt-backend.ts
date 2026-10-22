import type { Page, Route } from '@playwright/test'

type CheckpointRow = Record<string, unknown>
const scope = ['user_id', 'course_id', 'module_id', 'exam_id'] as const

function identity(row: CheckpointRow) {
  return scope.map((field) => String(row[field])).join('\u001f')
}

function eq(url: URL, field: string): string | undefined {
  const value = url.searchParams.get(field)
  return value?.startsWith('eq.') ? value.slice(3) : undefined
}

function json(route: Route, status: number, data: unknown) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
}

/**
 * Synthetic in-memory PostgREST checkpoint boundary for established learner
 * browser fixtures. This exercises the actual REC-10 saving/recovery code.
 * It does not grant learner access, fabricate auth, or modify production code.
 *
 * Every seed invocation has its own private store; CAS stale-write and draft
 * identity failures behave like the real table. Explicit RLS is separately
 * exercised in isolated Supabase pgTAP tests.
 */
export async function seedExamAttemptBackend(page: Page) {
  const records = new Map<string, CheckpointRow>()
  await page.route('**/rest/v1/learner_exam_attempts**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const selected = Array.from(records.values()).filter((record) =>
      scope.every((field) => eq(url, field) === undefined || eq(url, field) === record[field]) &&
      (eq(url, 'attempt_id') === undefined || eq(url, 'attempt_id') === record.attempt_id))
    const method = request.method()
    if (method === 'GET') {
      return json(route, 200, selected)
    }
    if (method === 'POST') {
      const body = request.postDataJSON() as CheckpointRow
      const key = identity(body)
      if (records.has(key)) return json(route, 409, { code: '23505', message: 'Attempt already exists' })
      const saved = structuredClone(body)
      records.set(key, saved)
      return json(route, 201, saved)
    }
    if (method === 'PATCH') {
      const match = selected.find((record) =>
        eq(url, 'revision') !== undefined && Number(eq(url, 'revision')) === record.revision)
      if (!match) return json(route, 200, [])
      const updated = { ...match, ...(request.postDataJSON() as CheckpointRow) }
      records.set(identity(updated), updated)
      return json(route, 200, updated)
    }
    if (method === 'DELETE') {
      const match = selected.find((record) =>
        eq(url, 'revision') !== undefined && Number(eq(url, 'revision')) === record.revision)
      if (!match) return json(route, 200, [])
      records.delete(identity(match))
      return json(route, 200, [{ attempt_id: match.attempt_id }])
    }
    return json(route, 405, { code: 'METHOD', message: 'Unsupported checkpoint method' })
  })
  return records
}
