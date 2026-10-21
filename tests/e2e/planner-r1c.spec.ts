import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, seedNewStudentSession, stubFirstUseBackend, aLevelCourseId } from './first-use-seed'
import { seedPlanStudent, plannedRow } from './plan-seed'

test('R1-11: starting-check-only learner receives guidance but no scored Progress/readiness claim after returning', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Full signup-to-replan evidence boundary runs once; responsive planner coverage is in existing suites.')
  await seedNewStudentSession(page)
  const state = await stubFirstUseBackend(page)
  await page.goto(appPath)

  await page.getByRole('button', { name: /^Student\b/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('checkbox', { name: 'Business' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('radio', { name: /AQA A-level · Specification 7132/ }).check()
  await page.getByRole('button', { name: 'Add 1 course' }).click()
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await page.getByRole('button', { name: 'Find my starting point' }).click()

  for (let i = 0; i < 5; i++) {
    const prompt = page.locator('#starting-check-heading')
    const currentPrompt = await prompt.textContent()
    const options = page.locator('.first-use-options input[type="radio"]')
    await expect(options.first()).toBeVisible()
    await options.first().check()
    // The next action is enabled only after the selected answer is accepted.
    // The old loop clicked Continue while the preceding question was still
    // transitioning, intermittently hitting a disabled/stale button.
    const action = page.getByRole('button', { name: i === 4 ? 'See my starting point' : 'Continue' })
    await expect(action).toBeEnabled()
    await action.click()
    if (i < 4 && currentPrompt) await expect(prompt).not.toHaveText(currentPrompt)
  }
  await expect(page.getByText('REV recommends', { exact: true })).toBeVisible()
  expect(state.memberships.map((item) => item.course_id)).toEqual([aLevelCourseId])
  expect(state.startingEvidence).toHaveLength(5)
  expect(state.learningEvidence).toHaveLength(0)

  // Synthetic account transition solely to test later Home/Plan/REV/Progress recomputation
  // without the normal first-value scored flashcard. The product onboarding sequence is unchanged.
  expect(state.account).not.toBeNull()
  if (!state.account) throw new Error('Expected persisted first-use account state')
  state.account.onboarding_stage = 'complete'
  state.account.onboarding_completed_at = '2026-08-24T21:32:00.000Z'
  await page.goto(appPath)

  const hero = page.locator('.home-v3-hero')
  await expect(hero).toBeVisible()
  await expect(hero).toContainText('Not on a plan yet')
  await page.goto(`${appPath}#/plan`)
  await expect(page.locator('#plan-page-title')).toBeVisible()
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toBeVisible()
  await page.goto(`${appPath}#/progress`)
  const covered = page.locator('.ui-progress-measure').filter({ hasText: 'Topics covered' }).first()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  await expect(page.getByText('Not enough evidence yet').first()).toBeVisible()
  await expect(page.getByRole('region', { name: 'Progress summary' })).toContainText('You haven’t answered anything yet')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])

  await page.reload()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  expect(state.startingEvidence).toHaveLength(5)
  expect(state.learningEvidence).toHaveLength(0)
})

test('R1-11: existing accepted Today remains one commitment after directional-only data reload', async ({ page }) => {
  const sessions = [plannedRow('r1c-chosen', '2026-10-05', 'finance')]
  await seedPlanStudent(page, { sessions })
  const observations: Array<Record<string, unknown>> = []
  await page.route('**/rest/v1/starting_check_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(observations) })
  })
  let scoredWrites = 0
  await page.route('**/rest/v1/learner_learn_exposures**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() !== 'GET') scoredWrites += 1
    await route.fulfill({ status: route.request().method() === 'GET' ? 200 : 201, contentType: 'application/json', body: '[]' })
  })
  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero')).toContainText('You chose this session for today.')
  await expect(page.locator('.home-v3-plan-row[data-kind="session"]')).toHaveCount(1)
  observations.push({ payload: {
    id: 'directional-only', schemaVersion: 1, moduleId: 'business-aqa-a-level-7132-paper-1',
    topicId: 'finance', questionId: 'directional-observation', selectedOption: 0, correctOption: 1,
    correct: false, occurredAt: '2026-10-05T11:00:00.000Z',
  } })
  await page.reload()
  await expect(page.locator('.home-v3-hero')).toContainText('You chose this session for today.')
  await expect(page.locator('.home-v3-plan-row[data-kind="session"]')).toHaveCount(1)
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await expect(page.locator('.pln-row[data-kind="session"]')).toHaveCount(1)
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toContainText('Finance — Practice question')
  await page.goto(`${appPath}#/progress`)
  await expect(page.locator('.ui-progress-measure').filter({ hasText: 'Topics covered' }).first().locator('.ui-progress-measure__number')).toHaveText('0')
  expect(scoredWrites).toBe(0)
  expect(sessions).toHaveLength(1)
})

test('R1-11: the actual unscored Learn QuickCheck gives feedback but cannot affect the next plan or scored measures', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The real component is exercised once; other responsive Learn and planner browser suites cover phone/tablet.')
  const sessions = [plannedRow('r1c-learn-check', '2026-10-05', 'finance')]
  await seedPlanStudent(page, { sessions })
  let scoredEvidenceWrites = 0
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    if (route.request().method() !== 'GET') scoredEvidenceWrites += 1
    await route.fulfill({
      status: route.request().method() === 'GET' ? 200 : 201,
      contentType: 'application/json',
      body: '[]',
    })
  })

  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  await expect(hero).toContainText('You chose this session for today.')
  const beforeHeading = await hero.getByRole('heading', { level: 2 }).textContent()
  await page.goto(`${appPath}#/progress`)
  const covered = page.locator('.ui-progress-measure').filter({ hasText: 'Topics covered' }).first()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  await expect(page.getByText('Not enough evidence yet').first()).toBeVisible()

  // Existing dev-only fixture mounts the *production* Learn QuickCheck component without
  // manufacturing a published Business syllabus/question. This is a component-level browser
  // boundary test, not a claim that the fixture's question is shipped to learners.
  await page.goto('http://127.0.0.1:4174/revision/learn-fixtures.html?hue=blue&theme=light&page=break-even')
  const quickCheck = page.locator('.ui-quick-check')
  await expect(quickCheck).toContainText('Not scored')
  await quickCheck.getByRole('button', { name: /It stays the same/ }).click()
  await expect(quickCheck.locator('[aria-live="polite"]')).toContainText('Not quite.')
  await expect(quickCheck.locator('[aria-live="polite"]')).toContainText('This doesn’t count towards your progress.')
  await quickCheck.getByRole('button', { name: 'Try again' }).click()
  await quickCheck.getByRole('button', { name: /It rises by 100 lattes/ }).click()
  await expect(quickCheck.locator('[aria-live="polite"]')).toContainText('Yep.')
  expect(scoredEvidenceWrites).toBe(0)

  await page.goto(appPath)
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText(beforeHeading!)
  await expect(hero).toContainText('You chose this session for today.')
  await expect(page.locator('.home-v3-plan-row[data-kind="session"]')).toHaveCount(1)
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await expect(page.locator('.pln-row[data-kind="session"]')).toHaveCount(1)
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toContainText('Finance — Practice question')
  await page.goto(`${appPath}#/progress`)
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  await expect(page.getByText('Not enough evidence yet').first()).toBeVisible()
  await page.reload()
  await expect(covered.locator('.ui-progress-measure__number')).toHaveText('0')
  expect(scoredEvidenceWrites).toBe(0)
  expect(sessions).toHaveLength(1)
})
