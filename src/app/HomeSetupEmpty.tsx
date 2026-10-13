import { useState, type FormEvent } from 'react'
import { PoweredByRev } from './RevCompactWordmark'
import { RevSuggestionSteps } from './ui/RevSuggestionCard'
import { Button, Icon, RevMark } from './ui'

interface HomeSetupEmptyProps {
  courseCount: number
  hasExamDates: boolean
  hasStudyTimes: boolean
  onOpenCourses: () => void
  onOpenPlan: () => void
  onOpenRev: (draft?: string, submit?: boolean) => void
}

/** What the student should do next, based only on what is actually set up. */
export function nextSetupAction(props: Pick<HomeSetupEmptyProps, 'courseCount' | 'hasExamDates' | 'hasStudyTimes'>) {
  if (props.courseCount === 0) return { step: 1, headline: 'Add your first course and I’ll get you going.', label: 'Add a course', target: 'courses' as const }
  if (!props.hasExamDates) return { step: 2, headline: 'You can add exam dates when you know them.', label: 'Add exam dates', target: 'plan' as const }
  return { step: 3, headline: 'Tell me when you can study and I’ll fit the work around it.', label: 'Choose study times', target: 'plan' as const }
}

/** The "Your plan" card on Home when no session is planned: says what is missing, from what is actually saved. */
export function planCardEmptyCopy(props: Pick<HomeSetupEmptyProps, 'hasExamDates' | 'hasStudyTimes'>) {
  if (!props.hasExamDates) return { text: 'Add your exam dates and I’ll start building your plan.', label: 'Add exam dates' }
  if (!props.hasStudyTimes) return { text: 'Tell me when you can study and I’ll fit sessions around it.', label: 'Choose study times' }
  return { text: 'Nothing’s planned for today yet. You can choose your own work in Courses.', label: 'View full plan' }
}

export function HomeSetupEmpty({ courseCount, hasExamDates, hasStudyTimes, onOpenCourses, onOpenPlan, onOpenRev }: HomeSetupEmptyProps) {
  const next = nextSetupAction({ courseCount, hasExamDates, hasStudyTimes })
  const [askValue, setAskValue] = useState('')
  const [askFocused, setAskFocused] = useState(false)
  function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = askValue.trim()
    setAskValue('')
    onOpenRev(question || undefined, Boolean(question))
  }
  return (
    <div className="home-setup">
      <section className="home-v3-hero" aria-labelledby="home-setup-title">
        <div className="home-v3-hero-layout">
          <div className="home-v3-hero-presence">
            <RevMark onInverse size="hero" state={askFocused || askValue ? 'listening' : 'waiting'} />
            <PoweredByRev />
          </div>
          <div className="home-v3-hero-main">
            <h1 id="home-setup-title">{next.headline}</h1>
            <div className="home-v3-next">
              <p className="home-v3-hero-reason">Add a course to start useful revision. Exam dates and weekly study times are optional; you can add them later in Plan.</p>
              <div className="home-v3-hero-actions">
                <Button size="large" onClick={next.target === 'courses' ? onOpenCourses : onOpenPlan}>{next.label}<Icon name="arrow-right" size="inline" /></Button>
              </div>
            </div>
          </div>
        </div>
        <form className="home-v3-ask" onSubmit={sendQuestion} aria-label="Ask REV">
          <input aria-label="Ask REV anything" value={askValue} maxLength={240} placeholder="Ask REV anything…"
            onChange={(event) => setAskValue(event.target.value)} onFocus={() => setAskFocused(true)} onBlur={() => setAskFocused(false)} />
          <Button type="submit" aria-label={askValue.trim() ? 'Send question to REV' : 'Open Ask REV'}><Icon name="arrow-up" /></Button>
        </form>
      </section>
      <section className="home-v3-card" aria-label="Getting started">
        <RevSuggestionSteps onInverse={false} steps={[
          { id: 'courses', label: 'Add your subjects', meta: courseCount > 0 ? `${courseCount} courses added` : 'Pick the courses you’re studying', state: courseCount > 0 ? 'done' : 'current' },
          { id: 'exams', label: 'Exam dates · optional', meta: 'So I know how long you’ve got.', state: hasExamDates ? 'done' : 'upcoming' },
          { id: 'times', label: 'Study times · optional', meta: 'After your first revision activity, when you’re ready', state: hasStudyTimes ? 'done' : 'upcoming' },
        ]} />
      </section>
    </div>
  )
}
