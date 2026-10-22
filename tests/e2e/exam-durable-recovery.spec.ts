import { expect, test, type Page, type Route } from '@playwright/test'

type Row = Record<string, unknown>
const checkpointRows = new Map<string, Row>()
const evidenceRows = new Map<string, Row>()
let loseUpdateAck = false
let evidenceInsertCount = 0
let failSecondEvidenceWrite = false
const path = 'http://127.0.0.1:4174/revision/exam-recovery-fixtures.html'
const fields = ['user_id', 'course_id', 'module_id', 'exam_id']
const filter = (url: URL, field: string) => (url.searchParams.get(field) ?? '').replace(/^eq\./, '')
const recordKey = (row: Row) => fields.map(field => String(row[field])).join('|')
const queryKey = (url: URL) => fields.map(field => filter(url, field)).join('|')
const respond = async (route: Route, status: number, body: unknown) => route.fulfill({
  status, contentType: 'application/json', body: JSON.stringify(body),
})

async function seedDatabase(page: Page) {
  checkpointRows.clear()
  evidenceRows.clear()
  loseUpdateAck = false
  evidenceInsertCount = 0
  failSecondEvidenceWrite = false
  await page.route('**/rest/v1/learner_exam_attempts**', async (route: Route) => {
    const req = route.request()
    const url = new URL(req.url())
    const key = queryKey(url)
    const previous = checkpointRows.get(key)
    if (req.method() === 'GET') return respond(route, 200, previous ? [previous] : [])
    if (req.method() === 'POST') {
      const row = req.postDataJSON() as Row
      const newKey = recordKey(row)
      if (checkpointRows.has(newKey)) return respond(route, 409, { code: '23505', message: 'Attempt exists' })
      checkpointRows.set(newKey, row)
      return respond(route, 201, row)
    }
    if (req.method() === 'PATCH') {
      const patch = req.postDataJSON() as Row
      const currentRevision = Number(filter(url, 'revision'))
      const currentId = filter(url, 'attempt_id')
      if (!previous || previous.revision !== currentRevision || previous.attempt_id !== currentId) return respond(route, 200, [])
      const updated = { ...previous, ...patch }
      checkpointRows.set(key, updated)
      if (loseUpdateAck) {
        loseUpdateAck = false
        return respond(route, 503, { code: 'PGRST000', message: 'Acknowledgement lost after commit' })
      }
      return respond(route, 200, updated)
    }
    if (req.method() === 'DELETE') {
      const revision = Number(filter(url, 'revision'))
      const attemptId = filter(url, 'attempt_id')
      const rows = previous && previous.revision === revision && previous.attempt_id === attemptId
        ? [{ attempt_id: attemptId }] : []
      if (rows.length) checkpointRows.delete(key)
      return respond(route, 200, rows)
    }
  })
  await page.route('**/rest/v1/learning_evidence**', async (route: Route) => {
    const req = route.request()
    const url = new URL(req.url())
    if (req.method() === 'POST') {
      evidenceInsertCount++
      const row = req.postDataJSON() as Row
      const id = String(row.evidence_id)
      if (failSecondEvidenceWrite && evidenceRows.size === 1 && !evidenceRows.has(id)) {
        failSecondEvidenceWrite = false
        return respond(route, 503, { code: 'PGRST000', message: 'Interrupted evidence save' })
      }
      if (evidenceRows.has(id)) return respond(route, 409, { code: '23505', message: 'Duplicate' })
      evidenceRows.set(id, row)
      return respond(route, 201, [])
    }
    const id = filter(url, 'evidence_id')
    return respond(route, 200, id ? (evidenceRows.has(id) ? [evidenceRows.get(id)] : []) : [...evidenceRows.values()])
  })
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'REC-10 fault injection uses one full desktop fixture; responsive exam smoke remains separate.')
})

test('unfinished full mock restores confirmed answer, flag and position after refresh', async ({ page }) => {
  await seedDatabase(page)
  await page.goto(path)
  await expect(page.getByText('Work saved')).toBeVisible()
  const inputs = page.locator('.exam-question-sheet .exam-mcq input[type="radio"]')
  if (await inputs.count()) await inputs.first().check()
  else await page.locator('.exam-question-sheet textarea').fill('A complete original written response from a learner')
  await page.getByRole('button', { name: 'Flag for review' }).click()
  await expect.poll(() => {
    const checkpoint = [...checkpointRows.values()][0]
    const flags = (checkpoint?.snapshot as { flagged: Record<string, boolean> } | undefined)?.flagged ?? {}
    return Object.values(flags).some(Boolean)
  }).toBe(true)
  await expect(page.getByText('Work saved')).toBeVisible()
  const saved = [...checkpointRows.values()][0]
  const firstSnapshot = saved.snapshot as { answers: Record<string, string>; flagged: Record<string, boolean> }
  expect(Object.values(firstSnapshot.flagged)).toContain(true)
  expect(Object.values(firstSnapshot.answers).some(answer => answer.length > 0)).toBe(true)
  await page.reload()
  await expect(page.getByText('Work saved')).toBeVisible()
  await expect(page.getByRole('button', { name: /Flagged for review/ })).toBeVisible()
  const snapshot = [...checkpointRows.values()][0].snapshot as typeof firstSnapshot
  expect(snapshot.answers).toEqual(firstSnapshot.answers)
  expect(snapshot.flagged).toEqual(firstSnapshot.flagged)
  expect(evidenceRows.size).toBe(0)
})

test('leaving through Save and return only navigates once the draft is confirmed', async ({ page }) => {
  await seedDatabase(page)
  await page.goto(path + '?theme=dark')
  await expect(page.getByText('Work saved')).toBeVisible()
  await page.getByRole('button', { name: 'Save and return to Exam Prep' }).click()
  await expect(page.getByRole('button', { name: 'Reopen saved exam' })).toBeVisible()
  await expect(page.locator('.exam-session-page')).toHaveCount(0)
  await page.getByRole('button', { name: 'Reopen saved exam' }).click()
  await expect(page.getByRole('dialog', { name: 'Exam paused' })).toBeVisible()
  const snapshot = [...checkpointRows.values()][0].snapshot as { timing: { runningSince: string | null } }
  expect(snapshot.timing.runningSince).toBeNull()
  await page.getByRole('dialog', { name: 'Exam paused' }).getByRole('button', { name: /Continue exam/ }).click()
  await expect(page.getByText('Work saved')).toBeVisible()
})

test('ambiguous checkpoint acknowledgement does not produce a second attempt or scored evidence', async ({ page }) => {
  await seedDatabase(page)
  await page.goto(path)
  await expect(page.getByText('Work saved')).toBeVisible()
  loseUpdateAck = true
  await page.getByRole('button', { name: 'Flag for review' }).click()
  await expect.poll(() => {
    const checkpoint = [...checkpointRows.values()][0]
    const flags = (checkpoint?.snapshot as { flagged: Record<string, boolean> } | undefined)?.flagged ?? {}
    return Object.values(flags).some(Boolean)
  }).toBe(true)
  await expect(page.getByText('Work saved')).toBeVisible()
  expect(checkpointRows.size).toBe(1)
  expect(evidenceInsertCount).toBe(0)
})

test('refresh during partially committed exam submission replays frozen identical evidence and records the result once', async ({ page }) => {
  await seedDatabase(page)
  await page.goto(path)
  await expect(page.getByText('Work saved')).toBeVisible()
  const choices = page.locator('.exam-question-sheet .exam-mcq input[type="radio"]')
  if (await choices.count()) await choices.first().check()
  else await page.locator('.exam-question-sheet textarea').fill('A reasoned original Business answer')
  await expect(page.getByText('Work saved')).toBeVisible()
  await page.getByRole('button', { name: 'Finish and self-mark' }).click()
  await expect(page.getByText('Self-mark your paper')).toBeVisible()
  failSecondEvidenceWrite = true
  await page.getByRole('button', { name: 'Save exam result' }).click()
  await expect(page.getByText(/could not confirm your exam result was saved/i)).toBeVisible()
  expect(evidenceRows.size).toBe(1)
  const savedBatch = (([...checkpointRows.values()][0].snapshot as { frozenSubmission: { evidence: Array<{ id: string }> } }).frozenSubmission)
  expect(savedBatch.evidence).toHaveLength(2)
  const exactIds = savedBatch.evidence.map(item => item.id)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Retry saving exam result' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry saving exam result' }).click()
  await expect(page.getByRole('heading', { name: 'Exam result' })).toBeVisible()
  expect(evidenceRows.size).toBe(2)
  expect([...evidenceRows.keys()].sort()).toEqual(exactIds.sort())
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Exam result' })).toBeVisible()
  expect(evidenceRows.size).toBe(2)
})
