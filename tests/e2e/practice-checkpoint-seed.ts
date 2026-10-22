import type { Page, Route } from '@playwright/test'

/** Synthetic PostgREST endpoint for owner-only, revision-checked Practice checkpoints.
 * This is test I/O only: real RLS is independently covered by pgTAP.
 */
export async function seedPracticeCheckpoints(page: Page) {
  const rows = new Map<string, Record<string, unknown>>()
  const value = (url: URL, name: string) => (url.searchParams.get(name) ?? '').replace(/^eq\./, '')
  const identify = (item: Record<string, unknown>) =>
    ['user_id', 'course_id', 'module_id', 'topic_id'].map(key => String(item[key])).join('|')
  const identifyQuery = (url: URL) =>
    ['user_id', 'course_id', 'module_id', 'topic_id'].map(key => value(url, key)).join('|')

  await page.route('**/rest/v1/learner_practice_checkpoints**', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const id = identifyQuery(url)
    const current = rows.get(id)
    if (request.method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(current ? [current] : []) })
      return
    }
    if (request.method() === 'POST') {
      const row = request.postDataJSON() as Record<string, unknown>
      const key = identify(row)
      if (rows.has(key)) {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: '23505', message: 'duplicate Practice checkpoint' }) })
        return
      }
      rows.set(key, row)
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([row]) })
      return
    }
    if (request.method() === 'PATCH') {
      const expectedRevision = Number(value(url, 'revision'))
      const expectedSession = value(url, 'session_id')
      const patch = request.postDataJSON() as Record<string, unknown>
      const record = current && current.revision === expectedRevision && current.session_id === expectedSession
        ? { ...current, ...patch } : null
      if (record) rows.set(id, record)
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(record ? [record] : []) })
      return
    }
    if (request.method() === 'DELETE') {
      const expectedRevision = Number(value(url, 'revision'))
      const expectedSession = value(url, 'session_id')
      const deleted = current && current.revision === expectedRevision && current.session_id === expectedSession
        ? [{ session_id: current.session_id }] : []
      if (deleted.length) rows.delete(id)
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(deleted) })
    }
  })
}
