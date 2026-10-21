import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { appPath, seedPlanStudent, plannedRow, businessCourseId, planUserId } from './plan-seed'

async function noDerivedWork(page: Page) {
  await page.route('**/rest/v1/revision_availability_profiles**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    user_id: planUserId, timezone: 'Europe/London', weekday_minutes: 0, weekend_minutes: 0,
    monday_minutes: 0, tuesday_minutes: 0, wednesday_minutes: 0, thursday_minutes: 0, friday_minutes: 0, saturday_minutes: 0, sunday_minutes: 0,
  }) }))
}
const topics = ['finance', 'marketing', 'operations', 'hr']
async function setup(page: Page, state: string, theme: string) {
  const sessions = state === 'all-done' ? [plannedRow('1', '2026-10-05', 'finance', { status: 'done' })] :
    topics.map((topic, index) => plannedRow(String(index + 1), '2026-10-05', topic))
  await seedPlanStudent(page, { sessions })
  await noDerivedWork(page)
  await page.addInitScript(value => localStorage.setItem('revision:theme', value), theme)
  if (state === 'zero-courses') await page.route('**/rest/v1/learner_courses**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  if (state === 'returning') await page.route('**/rest/v1/learner_courses**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
    { user_id: planUserId, course_id: businessCourseId }, { user_id: planUserId, course_id: 'aqa:aqa-as:7131' },
  ]) }))
  await page.goto(appPath)
  await expect(page.locator('.home-v3')).toBeVisible()
  await expect(page.locator('.home-v3-hero')).not.toContainText('Finding your next useful step')
  if (state === 'exhausted') {
    const button = page.locator('.home-v3-hero').getByRole('button', { name: 'Suggest something else' })
    for (let i = 0; i < topics.length; i++) { await expect(button).toBeVisible(); await button.click() }
    await expect(page.locator('.home-v3-no-task')).toContainText("That's everything I'd suggest for today.")
  }
}

for (const theme of ['light', 'dark']) for (const state of ['returning', 'all-done', 'exhausted', 'zero-courses']) {
  test(`Home refinement ${state} ${theme} review and accessibility`, async ({ page }, info) => {
    await setup(page, state, theme)
    const home = page.locator('.home-v3')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    expect((await new AxeBuilder({ page }).include('.home-v3').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
    if (state === 'returning') {
      await expect(page.locator('.home-v3-plan-row')).toHaveCount(3)
      await expect(page.locator('.home-v3-plan')).toContainText('1 more later today')
      await expect(page.locator('.home-v3-course-card')).toHaveCount(2)
      await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
      // Rotating to the fourth task must not move the first three rows or fake a highlight.
      for (let i = 0; i < 3; i++) await page.locator('.home-v3-hero').getByRole('button', { name: 'Suggest something else' }).click()
      await expect(page.locator('.home-v3-plan-row--next')).toHaveCount(0)
      await expect(page.locator('.home-v3-plan-row').first()).toContainText('Finance')
      await page.evaluate(() => sessionStorage.clear())
      await page.reload()
      await expect(page.locator('.home-v3-plan-row--next')).toContainText('Finance')
    } else if (state === 'all-done') {
      await expect(home).toContainText('That’s today done, Synthetic. Nice work.')
      await expect(home).toContainText('Everything on today’s plan is done.')
      await expect(home.getByRole('button', { name: /^Start/ })).toHaveCount(0)
    } else if (state === 'exhausted') {
      await expect(page.locator('.home-v3-plan-row')).toHaveCount(3)
      await expect(page.locator('.home-v3-hero h1')).not.toContainText('today done')
    } else {
      await expect(home.getByRole('button', { name: /Add a course/ })).toBeVisible()
      await expect(home).toContainText('Exam dates · optional')
      await expect(home).toContainText('Study times · optional')
    }
    const viewport = page.viewportSize()!
    await page.setViewportSize({ width: 320, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate(() => document.fonts.ready)
    if (process.env.HOME_REVIEW_SHOTS || process.env.LEARNER_DESIGN_SHOTS) {
      const directory = process.env.HOME_REVIEW_DIRECTORY ?? (process.env.LEARNER_DESIGN_SHOTS ? info.outputPath('home-622-review') : 'work/home-622-review')
      await mkdir(directory, { recursive: true })
      const name = `${info.project.name}-${state}-${theme}.png`
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ fullPage: true, path: `${directory}/${name}`, animations: 'disabled' })
      await writeFile(`${directory}/${name}.json`, JSON.stringify({ project: info.project.name, state, theme, viewport: page.viewportSize(), fonts: await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)) }, null, 2))
    }
  })
}

test('Home 320px text zoom, single focus ownership and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await setup(page, 'returning', 'dark')
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  const start = page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })
  await start.focus()
  await expect(start).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: 'Suggest something else' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('#home-v3-ask-input')).toBeFocused()
  const motion = await page.locator('.home-v3-hero .rev-halo').evaluate(el => getComputedStyle(el).animationName)
  expect(motion).toBe('none')
  await page.locator('#home-v3-ask-input').fill('Why this task?')
  await expect(page.locator('.home-v3-hero .ui-rev-mark__text')).toBeVisible()
  await page.emulateMedia({ forcedColors: 'none' })
  await page.addStyleTag({ content: '.home-v3 { font-size: 200%; } .home-v3 p, .home-v3 small, .home-v3 button, .home-v3 input { font-size: 1em; }' })
  const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.home-v3 *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ cls: el.className, text: el.textContent?.slice(0, 60), right: el.getBoundingClientRect().right })))
  expect(overflow).toEqual([])
})

test('Home mixed exams use chronological stored dates and Today; no inline Exam Prep', async ({ page }) => {
  await seedPlanStudent(page)
  await page.route('**/rest/v1/revision_assessments**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
    ['z-mock', '2026-10-07', 'mock'], ['today', '2026-10-05', 'public_exam'], ['a-official', '2026-10-06', 'public_exam'], ['b-mock', '2026-10-06', 'mock'],
  ].map(([id, date, kind]) => ({ assessment_id: id, assessment_date: date, assessment_type: kind, title: id,
    user_id: planUserId, subject_id: 'business', course_id: businessCourseId, module_id: null, relative_importance: 'normal', scope: {}, is_active: true }))) }))
  await page.goto(appPath)
  const exams = page.locator('.home-v3-exams')
  await expect(exams.locator('.home-v3-exam-countdown')).toHaveText('Today')
  await expect(exams.locator('.home-v3-exam-group li')).toHaveCount(2)
  await expect(exams.locator('.home-v3-exam-group li').first()).toContainText('a-official · Official exam')
  await expect(exams.locator('.home-v3-exam-group li').last()).toContainText('b-mock · Mock exam')
  await expect(exams.getByRole('button', { name: /Open Exam Prep/ })).toHaveCount(0)
})

test('Home rotation expires on local-day change and never changes accepted work', async ({ page }) => {
  const sessions = [plannedRow('1', '2026-10-05', 'finance'), plannedRow('2', '2026-10-05', 'marketing'), plannedRow('tomorrow', '2026-10-06', 'finance')]
  await seedPlanStudent(page, { sessions })
  await noDerivedWork(page)
  const writes: string[] = []
  page.on('request', request => { if (request.method() !== 'GET' && /learner_planned_sessions|learning_evidence/.test(request.url())) writes.push(request.url()) })
  await page.goto(appPath)
  const hero = page.locator('.home-v3-hero')
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  await hero.getByRole('button', { name: 'Suggest something else' }).click()
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Marketing')
  await page.reload()
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Marketing')
  await page.clock.fastForward(12 * 60 * 60 * 1000 + 1000)
  await expect(hero.getByRole('heading', { level: 2 })).toHaveText('Finance')
  expect(writes).toEqual([])
  expect(sessions.map(row => row.status)).toEqual(['planned', 'planned', 'planned'])
})

test('Home evidence error and no-dates state retain independent navigation and truthful copy', async ({ page }) => {
  await seedPlanStudent(page, { sessions: [], withExams: false, withAvailability: false })
  await page.route('**/rest/v1/learner_learn_exposures**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', route => route.fulfill({ status: 400, contentType: 'application/json', body: '{"message":"unavailable"}' }))
  await page.goto(appPath)
  await expect(page.locator('.home-v3-hero')).toContainText('I couldn’t read your progress just now.')
  await expect(page.locator('.home-v3-hero').getByRole('button', { name: /^Start/ })).toHaveCount(0)
  await expect(page.locator('.home-v3-exams')).toContainText('No upcoming mock or official exam dates added yet.')
  await page.locator('.home-v3-course-card').first().click()
  await expect(page).toHaveURL(/#\/courses\/aqa%3Aaqa-a-level%3A7132\/overview/)
  // A scored-evidence read failure must block misleading course progress and
  // scored activity recommendations. Unscored Learn reading remains accessible.
  const unavailable = page.getByRole('main', { name: 'Course progress temporarily unavailable' })
  await expect(unavailable).toContainText('cannot safely show your progress')
  await expect(unavailable.getByRole('button', { name: 'Open Learn instead' })).toBeVisible()
  await unavailable.getByRole('button', { name: 'Open Learn instead' }).click()
  await expect(page).toHaveURL(/\/learn$/)
  await expect(page.locator('article.learn-reading-page')).toBeVisible()
})

test('Home responsive boundaries preserve canonical presence and control geometry', async ({ page }) => {
  await setup(page, 'returning', 'light')
  for (const width of [320, 390, 620, 621, 820, 960, 961, 1100, 1101, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const geometry = await page.evaluate(() => ({
      width: innerWidth, scroll: document.documentElement.scrollWidth,
      presence: document.querySelector('.home-v3-hero .rev-presence')!.getBoundingClientRect().width,
      start: document.querySelector('.home-v3-hero .ui-button--large')!.getBoundingClientRect().height,
    }))
    expect(geometry.scroll, `overflow at ${width}px`).toBeLessThanOrEqual(width)
    expect(geometry.presence).toBe(width <= 620 ? 88 : width <= 960 ? 150 : width <= 1100 ? 188 : 248)
    expect(geometry.start).toBeGreaterThanOrEqual(52)
  }
})
