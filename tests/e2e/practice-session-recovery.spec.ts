import { expect, test, type Page, type Route } from '@playwright/test'
import { answerWith, practicePath, seedReturningStudent } from './practice-seed'

type DbRow = Record<string, unknown>
const checkpointRows = new Map<string, DbRow>()
const evidenceRows = new Map<string, DbRow>()
let checkpointSaveFailure = false
let savedEvidenceWrites = 0

async function installRecoveryDatabase(page: Page) {
  checkpointRows.clear()
  evidenceRows.clear()
  checkpointSaveFailure = false
  savedEvidenceWrites = 0
  await seedReturningStudent(page)

  await page.route('**/rest/v1/learner_practice_checkpoints**', async (route: Route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const key = 'student-topic'
    const current = checkpointRows.get(key)
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(current ? [current] : []) })
      return
    }
    if (method === 'POST') {
      const row = request.postDataJSON() as DbRow
      if (current) {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: '23505', message: 'duplicate' }) })
        return
      }
      checkpointRows.set(key, row)
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([row]) })
      return
    }
    if (method === 'PATCH') {
      const patch = request.postDataJSON() as DbRow
      const revisionParam = url.searchParams.get('revision')
      const revision = revisionParam?.startsWith('eq.') ? Number(revisionParam.slice(3)) : -1
      if (!current || current.revision !== revision) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
        return
      }
      const snapshot = patch.snapshot as Record<string, unknown>
      if (checkpointSaveFailure && snapshot?.pending === null && (snapshot.session as { answers?: unknown[] } | undefined)?.answers?.length) {
        checkpointSaveFailure = false
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST000', message: 'Transient checkpoint failure' }) })
        return
      }
      const updated = { ...current, ...patch }
      checkpointRows.set(key, updated)
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([updated]) })
      return
    }
    if (method === 'DELETE') {
      const revisionParam = url.searchParams.get('revision')
      const revision = revisionParam?.startsWith('eq.') ? Number(revisionParam.slice(3)) : -1
      const removed = current && current.revision === revision ? [{ session_id: current.session_id }] : []
      if (removed.length) checkpointRows.delete(key)
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(removed) })
    }
  })

  await page.route('**/rest/v1/learning_evidence**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'POST') {
      const row = request.postDataJSON() as DbRow
      const id = String(row.evidence_id)
      savedEvidenceWrites++
      if (evidenceRows.has(id)) {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: '23505', message: 'duplicate' }) })
        return
      }
      evidenceRows.set(id, row)
      await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
      return
    }
    if (url.searchParams.has('evidence_id')) {
      const value = url.searchParams.get('evidence_id') ?? ''
      const row = evidenceRows.get(value.replace(/^eq\./, ''))
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(row ? [row] : []) })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([...evidenceRows.values()].map(row => ({ payload: row.payload }))) })
  })
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Recovery state is tested through the canonical desktop browser route.')
})

test('scored Practice restores the exact next question after a refresh without another evidence write', async ({ page }) => {
  await installRecoveryDatabase(page)
  await page.goto(practicePath)
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await answerWith(page, 0)
  expect(evidenceRows.size).toBe(1)
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText('Question 2', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('You have a session open.')).toBeVisible()
  await page.getByRole('button', { name: 'Carry on' }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await expect(page.getByText('Question 2', { exact: true })).toBeVisible()
  expect(evidenceRows.size).toBe(1)
  expect(savedEvidenceWrites).toBe(1)
})

test('ambiguous answer checkpoint failure restores the same evidence id and completes by verified retry', async ({ page }) => {
  await installRecoveryDatabase(page)
  await page.goto(practicePath)
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  checkpointSaveFailure = true
  await page.locator('.practice-question__options button').first().click()
  await page.getByRole('group', { name: 'How sure are you?' }).getByRole('button', { name: 'Fairly sure' }).click()
  await expect(page.getByText(/Retry loading saved work/)).toBeVisible()
  expect(evidenceRows.size).toBe(1)
  const id = [...evidenceRows.keys()][0]
  await page.reload()
  await expect(page.getByText('You have a session open.')).toBeVisible()
  await page.getByRole('button', { name: 'Carry on' }).click()
  await expect(page.locator('.ui-feedback-bar')).toBeVisible()
  expect(evidenceRows.size).toBe(1)
  expect([...evidenceRows.keys()][0]).toBe(id)
  expect(savedEvidenceWrites).toBe(2)
})
