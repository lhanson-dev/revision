import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { appPath, seedPlanStudent, plannedRow, businessCourseId, planUserId } from './plan-seed'

test('R1-07 accepted choice agrees on Home, Plan and REV; dismissal persists across routes', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('chosen', '2026-10-05', 'finance')] })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  await expect(hero).toContainText('You chose this session for today.')
  await expect(hero).toContainText('On today’s plan')
  await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
  expect((await new AxeBuilder({ page }).include('.home-v3').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
  await page.goto(`${appPath}#/plan?view=day&date=2026-10-05`)
  await expect(page.locator('.pln-row').filter({ has: page.getByRole('button', { name: /^Up next/ }) })).toContainText('Finance')
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).toContainText('Finance — Quick check')
  await page.goto(appPath)
  await hero.getByText('Other options', { exact: true }).click()
  await hero.getByRole('button', { name: 'Not now', exact: true }).click()
  await expect(hero.getByRole('heading', { level: 2 })).not.toHaveText('Finance')
  await page.goto(`${appPath}#/rev`)
  await expect(page.getByRole('log')).not.toContainText('Finance — Quick check')
})

test('R1-07 exact first Today exam question starts identically from Home, Plan and REV', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [] })
  const moduleId = 'business-aqa-a-level-7132-paper-1'
  const evidence = Array.from({ length: 4 }, (_, i) => ({ payload: { id: `e${i}`, schemaVersion: 1, moduleId, topicId: 'finance', contentId: `q${i}`,
    occurredAt: '2026-10-02T12:00:00Z', source: 'multiple_choice', correct: true, selectedOption: 0, correctOption: 0 } }))
  await page.route('**/rest/v1/learning_evidence**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(new URL(route.request().url()).searchParams.get('module_id') === `eq.${moduleId}` ? evidence : []) }))
  await page.route('**/rest/v1/revision_assessments**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
    { assessment_id: 'paper1', user_id: planUserId, course_id: businessCourseId, subject_id: 'business', module_id: moduleId,
      assessment_type: 'public_exam', title: 'Paper 1', assessment_date: '2026-10-15', relative_importance: 'normal', scope: { topicIds: ['finance'] }, is_active: true },
  ]) }))
  for (const hash of ['', '#/plan?view=day&date=2026-10-05', '#/rev']) {
    await page.goto(appPath + hash)
    if (!hash) {
      await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
      const start = page.locator('.home-v3-hero').getByRole('button', { name: /^Start .*exam practice/i })
      await start.focus()
      await page.keyboard.press('Enter')
    } else if (hash.startsWith('#/plan')) await page.getByRole('button', { name: /^Up next/ }).click()
    else {
      await expect(page.getByRole('log')).toContainText('Finance — Exam practice')
      await page.getByRole('button', { name: 'Start Finance', exact: true }).click()
    }
    await expect(page.getByRole('heading', { name: 'Practise one exam question' })).toBeVisible()
    await expect(page.getByText('Targeted Paper 1 practice', { exact: true })).toBeVisible()
    await expect(page.locator('.exam-simulator')).toContainText('16')
  }
})

test('R1-06/13 missing setup is unscheduled; partial accepted load withholds recommendation', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false, withAvailability: false })
  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero')).toContainText('Not on a plan yet')
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toBeVisible()
  await page.route('**/rest/v1/learner_planned_sessions**', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"unavailable"}' }))
  await page.reload()
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toHaveCount(0)
})


test('R1-07 accepted Flashcards Start opens the same supported activity on all screens', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [plannedRow('cards', '2026-10-05', 'finance', { recommendation_id: 'planner-v1:finance:flashcards' })] })
  for (const hash of ['', '#/plan?view=day&date=2026-10-05', '#/rev']) {
    await page.goto(appPath + hash)
    if (!hash) await page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ }).click()
    else if (hash.startsWith('#/plan')) await page.getByRole('button', { name: /^Up next/ }).click()
    else await page.getByRole('button', { name: 'Start Finance', exact: true }).click()
    await expect(page.locator('.home-focused-practice')).toContainText('Flashcard')
    await expect(page.getByRole('button', { name: 'Show answer', exact: true })).toBeVisible()
    await expect(page.locator('.home-focused-activity').getByRole('heading', { level: 1 })).toHaveText('Finance')
  }
})
