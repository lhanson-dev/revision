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
    const key = ['user_id', 'course_id', 'module_id', 'topic_id']
      .map(field => (url.searchParams.get(field) ?? '').replace(/^eq\./, '')).join('|')
    const current = checkpointRows.get(key)
    if (method === 'GET') {
      const filters = url.searchParams.get('course_id')
      const values = filters?.startsWith('in.') ? [...checkpointRows.values()] : current ? [current] : []
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(values) })
      return
    }
    if (method === 'POST') {
      const row = request.postDataJSON() as DbRow
      if (current) {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ code: '23505', message: 'duplicate' }) })
        return
      }
      const ownerKey = ['user_id', 'course_id', 'module_id', 'topic_id'].map(field => String(row[field])).join('|')
      checkpointRows.set(ownerKey, row)
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(row) })
      return
    }
    if (method === 'PATCH') {
      const patch = request.postDataJSON() as DbRow
      const revisionParam = url.searchParams.get('revision')
      const revision = revisionParam?.startsWith('eq.') ? Number(revisionParam.slice(3)) : -1
      const sessionId = (url.searchParams.get('session_id') ?? '').replace(/^eq\./, '')
      if (!current || current.revision !== revision || current.session_id !== sessionId) {
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(updated) })
      return
    }
    if (method === 'DELETE') {
      const revisionParam = url.searchParams.get('revision')
      const revision = revisionParam?.startsWith('eq.') ? Number(revisionParam.slice(3)) : -1
      const sessionId = (url.searchParams.get('session_id') ?? '').replace(/^eq\./, '')
      const removed = current && current.revision === revision && current.session_id === sessionId ? [{ session_id: current.session_id }] : []
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
  test.skip(testInfo.project.name !== 'desktop' && !testInfo.title.startsWith('scored Practice restores'), 'Only exact saved-work continuation is cross-device; fault injection remains desktop.')
})

test('scored Practice restores the exact next question after a refresh without another evidence write', async ({ page }, testInfo) => {
  await installRecoveryDatabase(page)
  await page.goto(practicePath)
  await page.getByRole('button', { name: /^Start \d+ questions?$/ }).click()
  await expect(page.getByRole('region', { name: /^Practice:/ })).toBeVisible()
  await answerWith(page, 0)
  expect(evidenceRows.size).toBe(1)
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText('Question 2', { exact: true })).toBeVisible()
  // A different browser need not have any local hint; discovery must use Supabase.
  await page.evaluate(() => {
    Object.keys(localStorage).filter(key => key.startsWith('revision:practice-resume-topic:'))
      .forEach(key => localStorage.removeItem(key))
  })
  await page.goto('/revision/app/#/home')
  await expect(page.getByRole('heading', { name: 'Continue where you left off' })).toBeVisible()
  await expect(page.getByText('1 of 5 questions answered')).toBeVisible()
  await testInfo.attach('saved-practice-home-' + testInfo.project.name + '.png', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' }),
    contentType: 'image/png',
  })
  await page.getByRole('button', { name: 'Open saved Practice' }).click()
  await expect(page.getByRole('heading', { name: 'Continue where you left off' })).toBeVisible()
  // On a different device or topic there is no local hint. The Practice
  // topic selector must identify the server-verified saved Business session.
  await page.goto('/revision/app/#/courses/aqa%3Aaqa-a-level%3A7132/practice/leadership')
  await expect(page.getByRole('heading', { name: 'Test what you know' })).toBeVisible()
  await page.getByRole('button', { name: 'Change topic' }).click()
  const topicPicker = page.getByRole('combobox', { name: 'Topic' })
  await expect(topicPicker.locator('option[value="business"]')).toContainText('In progress')
  await expect(topicPicker.locator('option[value="leadership"]')).not.toContainText('In progress')
  await expect(page.getByText('1 topic has saved work')).toBeVisible()
  await testInfo.attach('saved-practice-topic-selector-' + testInfo.project.name + '.png', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' }),
    contentType: 'image/png',
  })
  await topicPicker.selectOption('business')
  await expect(page.getByRole('button', { name: 'Continue saved session' })).toBeVisible()
  expect(evidenceRows.size).toBe(1)
  await page.goto('/revision/app/#/courses/aqa%3Aaqa-a-level%3A7132/overview')
  await expect(page.getByRole('heading', { name: 'Explore this course' })).toBeVisible()
  const spotlight = page.locator('.course-overview-spotlight--saved').filter({ hasText: 'Practice' })
  await expect(spotlight.getByText('In progress')).toBeVisible()
  await testInfo.attach('saved-practice-overview-' + testInfo.project.name + '.png', {
    body: await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' }),
    contentType: 'image/png',
  })
  await spotlight.getByRole('button', { name: 'Open saved Practice' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Continue where you left off' })).toBeVisible()
  await expect(page.getByText('1 of 5 answered. Your completed answers are saved.')).toBeVisible()
  await expect(page.getByRole('group', { name: 'How many?' })).toHaveCount(0)
  expect([...checkpointRows.values()].map(row => row.topic_id)).toEqual(['business'])
  await page.getByRole('button', { name: 'Continue saved session' }).click()
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
  await expect(page.getByRole('heading', { name: 'Continue where you left off' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue saved session' }).click()
  await expect(page.locator('.ui-feedback-bar')).toBeVisible()
  expect(evidenceRows.size).toBe(1)
  expect([...evidenceRows.keys()][0]).toBe(id)
  expect(savedEvidenceWrites).toBe(2)
})
