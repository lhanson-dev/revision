import { writeFile } from 'node:fs/promises'
import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { seedReturningStudent, businessCourseId, practicePath, startQuestions, answerWith, bankCorrectIndex, finishQuestionSession, captureEvidence } from './practice-seed'
import { seedNewStudentSession, stubFirstUseBackend } from './first-use-seed'
import { seedPlanStudent } from './plan-seed'
import { seedExamPrepStudent, examPrepPath } from './exam-prep-seed'

test.beforeEach(async ({ page }) => {
  if (process.env.REVISION_BROWSER_PROXY) {
    // Preserve TLS verification through Node's configured CA trust when the
    // managed proxy CA is not installed in Chromium's separate trust store.
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, async route => {
      await route.fulfill({ response: await route.fetch() })
    })
  }
})

async function attachEvidence(info: TestInfo, name: string, body: string | Buffer, contentType: string) {
  // The CI line reporter does not persist in-memory attachments from passing
  // tests. Save the same bytes for the existing test-results artifact upload.
  await writeFile(info.outputPath(name), body)
  await info.attach(name, { body, contentType })
}

// Numeric expectations come from Learner Design System §§3–5, 8, 11–12 and
// Interactive Component Quality Standard. Tokens alone are not evidence.
async function inspect(page: Page, info: TestInfo, state: string) {
  // Inspect the resting state, not a click's lingering hover or an in-flight
  // colour transition. Hover/focus states have their own explicit assertions.
  await page.mouse.move(0, 0)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.querySelectorAll('button, input, select, textarea')]
      .flatMap(el => el.getAnimations()
        .filter(animation => animation instanceof CSSTransition)
        .map(animation => animation.finished.catch(() => undefined))))
  })
  const evidence = await page.evaluate(() => {
    const visible = (el: Element) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
    const nodes = [...document.querySelectorAll<HTMLElement>('button, input, select, textarea, .ui-surface, .ui-progress-measure, .ui-examiner-guide, .rev-suggestion-card')].filter(visible)
    return {
      width: innerWidth, theme: document.querySelector('[data-theme]')?.getAttribute('data-theme'),
      scrollWidth: document.documentElement.scrollWidth,
      fontsLoaded: [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family.replaceAll('"', '')),
      touch: matchMedia('(pointer: coarse)').matches,
      headings: [...document.querySelectorAll<HTMLElement>('h1, h2, h3')].filter(visible).map(el => {
        const css = getComputedStyle(el)
        return { text: el.textContent, classes: el.className, font: css.fontFamily, size: css.fontSize, weight: css.fontWeight, line: css.lineHeight }
      }),
      surfaces: [...document.querySelectorAll<HTMLElement>('section, article, [role="dialog"], [class*="card"], [class*="panel"], [class*="surface"]')].filter(visible).map(el => {
        const css = getComputedStyle(el)
        return { classes: el.className, radius: css.borderRadius, padding: css.padding, gap: css.gap, background: css.backgroundColor, color: css.color, border: css.border, shadow: css.boxShadow }
      }),
      controls: nodes.map(el => {
        const css = getComputedStyle(el), box = el.getBoundingClientRect()
        return { tag: el.tagName, classes: el.className, name: el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 100),
          width: box.width, height: box.height, radius: css.borderRadius, padding: css.padding, gap: css.gap,
          font: css.fontFamily, fontSize: css.fontSize, color: css.color, background: css.backgroundColor,
          border: css.border, shadow: css.boxShadow, disabled: el.matches(':disabled'),
          field: el.matches('.ui-field, .auth-card input, .rev-chat__input'),
          surface: el.matches('.ui-progress-measure, .ui-examiner-guide'),
          flatMeasure: el.matches('.ui-progress-measures--flat > .ui-progress-measure'),
          icon: el.matches('.ui-icon-button, .pln-nav__step, .pln-picker__step, .ui-date-nav, .practice-activity__close'),
          ordinary: el.matches('.ui-button, .primary, .secondary, .rev-suggestion-card__primary, .rev-suggestion-card__secondary, .rev-suggestion-card__plan'),
          // Segmented/theme choices select a state rather than perform an action.
          selector: Boolean(el.closest('.ui-segmented-control, .account-theme-switch')),
        }
      }),
    }
  })
  await attachEvidence(info, `${state}-computed.json`, JSON.stringify(evidence, null, 2), 'application/json')
  if (process.env.LEARNER_DESIGN_SHOTS) {
    // Viewport capture is the actual visible state, especially for fixed layers.
    await attachEvidence(info, `${state}.png`, await page.screenshot({ animations: 'disabled' }), 'image/png')
    if (!await page.getByRole('dialog').isVisible().catch(() => false) && !await page.locator('.exam-session-page').isVisible().catch(() => false)) {
      await attachEvidence(info, `${state}-full.png`, await page.screenshot({ fullPage: true, animations: 'disabled' }), 'image/png')
    }
  }
  expect(evidence.scrollWidth, `${state}: horizontal overflow`).toBeLessThanOrEqual(evidence.width + 1)
  expect(evidence.fontsLoaded, `${state}: real Manrope font loaded`).toContain('Manrope')
  expect(evidence.fontsLoaded, `${state}: real display font loaded`).toContain('Bricolage Grotesque')
  for (const control of evidence.controls.filter(c => c.ordinary && !c.selector)) {
    expect.soft(control.radius, `${state}: ${control.name} radius`).toBe('14px')
    const compact = control.classes.includes('ui-button--compact') && !evidence.touch
    expect.soft(control.classes.includes('ui-button--compact') && control.classes.includes('ui-button--primary'), `${state}: compact primary action`).toBe(false)
    const large = control.classes.includes('ui-button--large')
    // Bounding rectangles can undershoot CSS pixels by subpixel rounding.
    expect.soft(control.height + 0.01, `${state}: ${control.name} target`).toBeGreaterThanOrEqual(large ? 52 : compact ? 36 : 48)
    expect.soft(control.font, `${state}: ${control.name} font`).toContain('Manrope')
    if (control.classes.includes('ui-button--primary')) {
      expect.soft(control.background, `${state}: primary colour`).toBe('rgb(43, 182, 163)')
      expect.soft(control.color, `${state}: primary foreground`).toBe('rgb(19, 32, 38)')
    }
  }
  for (const field of evidence.controls.filter(c => c.field)) {
    expect.soft(field.radius, `${state}: field ${field.classes} radius`).toBe('14px')
    expect.soft(field.height, `${state}: field target`).toBeGreaterThanOrEqual(48)
    expect.soft(field.fontSize, `${state}: field text`).toBe('16px')
  }
  for (const surface of evidence.controls.filter(c => c.surface)) {
    expect.soft(surface.radius, `${state}: surface ${surface.classes}`).toBe(surface.flatMeasure ? '0px' : '20px')
  }
  for (const icon of evidence.controls.filter(c => c.icon)) {
    expect.soft(icon.height, `${state}: icon target height`).toBeGreaterThanOrEqual(44)
    expect.soft(icon.width, `${state}: icon target width`).toBeGreaterThanOrEqual(44)
  }
  for (const selector of evidence.controls.filter(c => c.selector)) {
    expect.soft(selector.height, `${state}: specialist selector target`).toBeGreaterThanOrEqual(44)
  }
  for (const heading of await page.locator('.runtime-account-modal-header h2, .runtime-account-setting-row h3, .pln-dialog__form h2, .exam-interruption-card h2').all()) {
    await expect(heading).toHaveCSS('font-weight', '800')
    expect(await heading.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Bricolage Grotesque')
  }
  return evidence
}

for (const theme of ['light', 'dark'] as const) {
  test(`Learn production components retain shared reveal controls in ${theme}`, async ({ page }, info) => {
    // Supplemental production-component fixture; not a deployed learner route.
    await page.goto(`http://127.0.0.1:4174/revision/learn-fixtures.html?hue=blue&theme=${theme}&page=break-even`)
    const worked = page.locator('.learn-block--worked-example')
    await expect(worked.getByRole('button', { name: 'Show step 2', exact: true })).toBeVisible()
    await inspect(page, info, `component-learn-reveal-${theme}`)
    await worked.getByRole('button', { name: 'Show step 2', exact: true }).click()
    await expect(worked.locator('.learn-worked__counter')).toHaveText('Step 2 of 3')
    await page.getByRole('button', { name: 'Show the data', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Hide the data', exact: true })).toHaveAttribute('aria-expanded', 'true')
    await inspect(page, info, `component-learn-data-${theme}`)
  })

  test(`empty Home keeps its first-course action shared in ${theme}`, async ({ page }, info) => {
    await seedReturningStudent(page)
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await page.route('**/rest/v1/learner_courses**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
    await page.goto('/revision/app/#/home')
    await expect(page.locator('.home-setup')).toBeVisible()
    await inspect(page, info, `home-first-course-${theme}`)
  })

  test(`Practice activity, feedback and summary keep shared actions in ${theme}`, async ({ page }, info) => {
    test.setTimeout(120_000)
    await seedReturningStudent(page)
    await captureEvidence(page)
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await page.goto(practicePath)
    await startQuestions(page)
    await inspect(page, info, `practice-active-${theme}`)
    const prompt = await page.locator('.practice-question__prompt').innerText()
    const correct = bankCorrectIndex(prompt) ?? 0
    const count = await page.locator('.practice-question__options button').count()
    await answerWith(page, (correct + 1) % count, 'Certain')
    await inspect(page, info, `practice-feedback-${theme}`)
    await page.getByRole('button', { name: /^(Next question|See how you did)/ }).click()
    await finishQuestionSession(page, [])
    await expect(page.getByText(/^Session done · /)).toBeVisible()
    await inspect(page, info, `practice-summary-${theme}`)
    await page.getByRole('button', { name: 'Back to Practice', exact: true }).click()
    await page.getByRole('region', { name: 'Warm-up' }).getByRole('button', { name: /^Flashcards/ }).click()
    await expect(page.locator('.practice-flashcard__card')).toBeVisible()
    await inspect(page, info, `practice-flashcard-${theme}`)
    await page.getByRole('button', { name: 'Show answer', exact: true }).click()
    await expect(page.getByRole('group', { name: 'Did you know it?' })).toBeVisible()
    await inspect(page, info, `practice-rating-${theme}`)
  })

  test(`learner routes render canonical control geometry in ${theme}`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await seedReturningStudent(page)
    await page.route('**/rest/v1/learner_planned_sessions**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
    const course = encodeURIComponent(businessCourseId)
    for (const [state, path, ready] of [
      ['home', '#/home', '.home-v3'], ['plan', '#/plan', '.interface-plan-screen'],
      ['progress', '#/progress', '.progress-intro'], ['courses', '#/courses', '.courses-screen'],
      ...['overview', 'learn', 'practice', 'exam-prep', 'progress'].map(s => [`course-${s}`, `#/courses/${course}/${s}`, '.paper-section-content']),
    ]) {
      await page.goto(`/revision/app/${path}`)
      await expect(page.locator('.planner-runtime')).toBeVisible()
      await expect(page.locator(ready).first()).toBeVisible()
      if (state === 'home') {
        for (const area of ['.home-v3-plan', '.home-v3-exams', '.home-v3-progress']) await expect(page.locator(area)).toHaveAttribute('aria-busy', 'false')
      }
      await inspect(page, info, `${state}-${theme}`)
    }
    await page.getByRole('button', { name: 'Ask REV', exact: true }).first().click()
    await expect(page.locator('.rev-chat__input')).toBeVisible()
    await inspect(page, info, `rev-${theme}`)
  })

  test(`authentication controls render canonical geometry in ${theme}`, async ({ page }, info) => {
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await page.route('**/auth/v1/settings', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ external: { google: true } }) }))
    await page.goto('/revision/app/')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await inspect(page, info, `sign-in-${theme}`)
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    await expect(page.getByLabel('First name')).toBeVisible()
    await inspect(page, info, `create-account-${theme}`)
  })

  test(`ordinary action states preserve geometry and entered work in ${theme}`, async ({ page }) => {
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await page.route('**/auth/v1/settings', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ external: { google: false } }) }))
    let release: (() => void) | undefined
    await page.route('**/auth/v1/token**', async r => {
      await new Promise<void>(resolve => { release = resolve })
      await r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'invalid_grant', error_description: 'Synthetic recovery check' }) })
    })
    await page.goto('/revision/app/')
    const action = page.getByRole('button', { name: 'Sign in', exact: true })
    await expect(action).toBeVisible()
    await action.hover()
    await expect(action).not.toHaveCSS('background-color', 'rgb(43, 182, 163)')
    await page.keyboard.press('Tab')
    await action.focus()
    await expect(action).not.toHaveCSS('box-shadow', 'none')
    await expect(action).toHaveCSS('border-radius', '14px')
    await page.getByLabel('Email').fill('design-assurance@revision.invalid')
    await page.getByLabel('Password', { exact: true }).fill('synthetic-design-check')
    await action.click()
    await expect(action).toBeDisabled()
    await expect(action).toHaveAttribute('aria-busy', 'true')
    await expect(action).toHaveCSS('border-radius', '14px')
    await expect(page.getByText('Signing in…', { exact: true })).toBeVisible()
    expect(release).toBeDefined()
    release!()
    await expect(action).toBeEnabled()
    await expect(page.getByLabel('Email')).toHaveValue('design-assurance@revision.invalid')
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue('synthetic-design-check')
  })

  test(`inverse alternatives retain readable hover and focus in ${theme}`, async ({ page }) => {
    await seedReturningStudent(page)
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await page.route('**/rest/v1/learner_planned_sessions**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
    await page.goto('/revision/app/#/home')
    const action = page.locator('.home-v3-hero').getByRole('button', { name: 'Suggest something else', exact: true })
    await expect(action).toBeVisible()
    await action.hover()
    await expect(action).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(action).not.toHaveCSS('background-color', 'rgb(241, 250, 248)')
    await page.keyboard.press('Tab')
    await action.focus()
    await expect(action).not.toHaveCSS('box-shadow', 'none')
    await expect(action).toHaveCSS('color', 'rgb(255, 255, 255)')
    await expect(action).toHaveCSS('border-radius', '14px')
  })

  test(`first use renders canonical actions in ${theme}`, async ({ page }, info) => {
    await seedNewStudentSession(page, { dark: theme === 'dark' })
    await stubFirstUseBackend(page)
    await page.goto('/revision/app/')
    await expect(page.locator('.first-use-experience-list')).toBeVisible()
    await inspect(page, info, `first-use-choice-${theme}`)
    await page.getByRole('button', { name: /^Student\b/ }).click()
    await expect(page.getByRole('heading', { name: 'Add your courses' })).toBeVisible()
    await inspect(page, info, `first-use-course-${theme}`)
  })

  test(`populated Plan and account overlays use shared controls in ${theme}`, async ({ page }, info) => {
    await seedPlanStudent(page)
    await page.addInitScript(t => localStorage.setItem('revision:theme', t), theme)
    await page.goto('/revision/app/#/plan')
    await expect(page.locator('.pln-row').first()).toBeVisible()
    await inspect(page, info, `plan-populated-${theme}`)
    await page.getByRole('button', { name: 'Exam dates', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await inspect(page, info, `plan-exam-dates-${theme}`)
    await page.keyboard.press('Escape')
    if ((page.viewportSize()?.width ?? 0) <= 960) {
      await page.getByRole('button', { name: 'Open menu' }).click()
      const drawer = page.locator('.runtime-mobile-drawer')
      await inspect(page, info, `navigation-drawer-${theme}`)
      await drawer.getByRole('button', { name: /account options/ }).click()
      await drawer.getByRole('button', { name: 'Profile', exact: true }).click()
    } else {
      await page.getByRole('button', { name: /account menu/ }).click()
      await inspect(page, info, `account-menu-${theme}`)
      await page.getByRole('menuitem', { name: 'Profile', exact: true }).click()
    }
    await expect(page.getByRole('dialog', { name: 'Account settings' })).toBeVisible()
    await inspect(page, info, `profile-${theme}`)
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await inspect(page, info, `settings-${theme}`)
  })

  test(`timed exam and interruption actions use shared controls in ${theme}`, async ({ page }, info) => {
    await seedExamPrepStudent(page, { theme })
    await page.goto(examPrepPath)
    await page.getByRole('button', { name: 'Start timed', exact: true }).first().click()
    await expect(page.locator('.exam-session-page')).toBeVisible()
    await inspect(page, info, `exam-focused-${theme}`)
    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Exam paused' })).toBeVisible()
    await inspect(page, info, `exam-paused-${theme}`)
    await page.getByRole('button', { name: 'Continue exam', exact: true }).click()
    await page.getByRole('button', { name: 'Stop exam', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Are you sure?' })).toBeVisible()
    await inspect(page, info, `exam-stop-${theme}`)
    await page.getByRole('button', { name: 'Yes, stop exam', exact: true }).click()
    await expect(page.locator('.exam-prep')).toBeVisible()
  })
}
