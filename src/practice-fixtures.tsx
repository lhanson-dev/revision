import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './app/brand-tokens.css'
import './app/app.css'
import './app/auth-entry.css'
import './app/first-use.css'
import './app/guidance.css'
import './app/exam.css'
import './app/rev-home.css'
import './app/hierarchy.css'
import './app/course-exam.css'
import './app/content-operations.css'
import './app/admin-operations-responsive.css'
import './app/planner.css'
import './app/planner-runtime.css'
import './app/planner-today.css'
import './app/planner-rev.css'
import './app/living-e.css'
import './app/living-e-accessibility.css'
import './app/sidebar-account-menu.css'
import './app/account-modal.css'
import './app/profile-edit.css'
import './app/mobile-navigation.css'
import './app/contextual-navigation.css'
import './app/learn-navigation.css'
import './app/courses.css'
import './app/interface-system.css'
import './app/ui/ui-components.css'
import './app/ui/rev-suggestion-card.css'
import './app/ui/learner-v2-components.css'
import './app/interface-plan-progress.css'
import './app/interface-subjects-course.css'
import './app/interface-learn-practice.css'
import './app/learn-reading.css'
import './app/interface-exam-experience.css'
import './app/interface-admin.css'
import './app/ask-rev-cta.css'
import './app/rev-resting-presence.css'
import './app/subject-accents.css'
import './app/returning-home.css'
import './app/returning-home-fidelity.css'
import './app/home-v2.css'
import './app/plan-v2.css'
import './app/courses-v2.css'
import './app/course-overview-v2.css'
import './app/ui/practice/practice.css'
import './app/exam-v2.css'
import './app/auth-v2.css'
import './app/first-use-v2.css'
import './app/onboarding-v2.css'
import './app/progress-v2.css'
import './app/rev-chat-v2.css'
import './app/ask-rev-v2.css'
import './app/course-overview-rev-feature.css'
import './app/interface-layout.css'
import './app/interactive-component-quality.css'
import './app/shell-v2.css'
import { listAvailableContentAdapters } from './engine/content/content-registry'
import { buildCatalogue } from './app/catalogue-model'
import { FocusedLearningWorkspace } from './app/FocusedLearningWorkspace'
import type { LearningEvidence } from './engine/evidence/evidence'
import type { ChallengeInput, ChallengeOutput, MarkerOutput, MarkingInput, WrittenAnswerMarker } from './app/rev-marking'

/**
 * Dev-only fixture page for written answers marked by REV. Revision has no real marker connected yet (it needs its own
 * approved PR), so this page plugs a fixed stand-in marker into the real Practice screen. It exists for tests and
 * screenshots. It is not part of the production build; the Playwright run serves it from the Vite dev server.
 *
 * Open /revision/practice-fixtures.html while developing.
 * Query: ?theme=light|dark  &strict=1 (the first marking misses the last point it could give, so a challenge changes the mark)
 *        &fail=1 (the first marking attempt fails, so the retry path shows)  &marker=off (no marker connected)
 */
const params = new URLSearchParams(window.location.search)
const theme = params.get('theme') === 'dark' ? 'dark' : 'light'
const strict = params.get('strict') === '1'
const failOnce = params.get('fail') === '1'
const markerOff = params.get('marker') === 'off'

const business = buildCatalogue(listAvailableContentAdapters()).flatMap((subject) => subject.courses).find((course) => course.subjectId === 'business' && course.sharedLearning)
if (!business) throw new Error('The Business course is missing from the catalogue.')

/** Gives a mark point when one of its accepted examples appears word for word in the answer. */
function stubMark(input: MarkingInput, skipLast: boolean): MarkerOutput {
  const lower = input.answer.toLowerCase()
  const verdicts = input.points.map((point) => {
    const hit = point.accept.find((example) => lower.includes(example.toLowerCase()))
    if (!hit) return { given: false as const }
    const start = lower.indexOf(hit.toLowerCase())
    return { given: true as const, quote: input.answer.slice(start, start + hit.length) }
  })
  if (skipLast) {
    const last = verdicts.map((verdict) => verdict.given).lastIndexOf(true)
    if (last >= 0) verdicts[last] = { given: false }
  }
  const missing = input.points.find((_, index) => !verdicts[index].given)
  return {
    points: verdicts,
    note: missing ? `To earn the missing mark: ${missing.descriptor.charAt(0).toLowerCase()}${missing.descriptor.slice(1)}` : 'Nothing missing. Every mark point is in your answer.',
    modelVersion: 'fixture-marker-1',
  }
}

let attempts = 0
const marker: WrittenAnswerMarker = {
  async mark(input) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    attempts += 1
    if (failOnce && attempts === 1) throw new Error('fixture failure')
    return stubMark(input, strict)
  },
  async challenge(input: ChallengeInput): Promise<ChallengeOutput> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const output = stubMark(input, false)
    const changed = output.points.some((verdict, index) => verdict.given !== input.previous.given[index])
    return {
      ...output,
      reply: changed
        ? 'You’re right. That mark point is in your answer, so I’ve changed the mark.'
        : 'The mark stays. I looked again for that point in your answer and it isn’t there yet.',
    }
  },
}

function Fixture() {
  const [saved, setSaved] = useState<LearningEvidence[]>([])
  return (
    <div className="planner-runtime" data-theme={theme} style={{ minHeight: '100vh', padding: 24 }}>
      <FocusedLearningWorkspace
        adapter={business!.learningAdapter}
        section="practice"
        recommendation={null}
        saving={false}
        saveError=""
        includeExamQuestions={false}
        marker={markerOff ? null : marker}
        onRecordEvidence={async (evidence) => { setSaved((current) => [...current, evidence]) }}
      />
      <pre data-testid="saved-evidence" hidden>{JSON.stringify(saved)}</pre>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><Fixture /></StrictMode>)
