import { RevPresence } from './RevPresence'
import { Icon } from './ui'

interface HomeSetupEmptyProps {
  courseCount: number
  hasExamDates: boolean
  hasStudyTimes: boolean
  onOpenCourses: () => void
  onOpenPlan: () => void
  onOpenRev: () => void
}

type SetupStep = { id: string; title: string; detail: string; done: boolean }

/** What the student should do next, based only on what is actually set up. */
export function nextSetupAction(props: Pick<HomeSetupEmptyProps, 'courseCount' | 'hasExamDates' | 'hasStudyTimes'>) {
  if (props.courseCount === 0) return { step: 1, headline: 'Add your first course and I’ll get you going.', label: 'Add a course', target: 'courses' as const }
  if (!props.hasExamDates) return { step: 2, headline: 'Tell me your exam dates and I’ll build your first week.', label: 'Build my plan', target: 'plan' as const }
  return { step: 3, headline: 'Tell me when you can study and I’ll fit the work around it.', label: 'Choose study times', target: 'plan' as const }
}

/** The "Your plan" card on Home when no session is planned: says what is missing, from what is actually saved. */
export function planCardEmptyCopy(props: Pick<HomeSetupEmptyProps, 'hasExamDates' | 'hasStudyTimes'>) {
  if (!props.hasExamDates) return { text: 'Add your exam dates and I’ll start building your plan.', label: 'Add exam dates' }
  if (!props.hasStudyTimes) return { text: 'Tell me when you can study and I’ll fit sessions around it.', label: 'Choose study times' }
  return { text: 'Nothing is planned yet. Sessions appear here as you work and REV learns what to suggest.', label: 'View full plan' }
}

export function HomeSetupEmpty({ courseCount, hasExamDates, hasStudyTimes, onOpenCourses, onOpenPlan, onOpenRev }: HomeSetupEmptyProps) {
  const next = nextSetupAction({ courseCount, hasExamDates, hasStudyTimes })
  const steps: SetupStep[] = [
    { id: 'courses', title: 'Add your subjects', detail: courseCount > 0 ? `${courseCount} ${courseCount === 1 ? 'course' : 'courses'} added` : 'Pick the courses you’re studying', done: courseCount > 0 },
    { id: 'exams', title: 'Set exam dates', detail: 'So REV knows how long you’ve got', done: hasExamDates },
    { id: 'times', title: 'Choose study times', detail: 'After school, weekends, whatever works', done: hasStudyTimes },
  ]

  return (
    <div className="home-setup">
      <section className="home-setup-hero" aria-labelledby="home-setup-title">
        <RevPresence size="hero" state="resting" decorative />
        <div className="home-setup-hero-copy">
          <p className="home-v2-eyebrow">Step {next.step} of 3</p>
          <h2 id="home-setup-title">{next.headline}</h2>
          <p>Takes about two minutes. After a few sessions I’ll start suggesting what to focus on.</p>
          <div className="home-setup-actions">
            <button type="button" className="home-setup-primary" onClick={next.target === 'courses' ? onOpenCourses : onOpenPlan}>{next.label}<Icon name="arrow-right" size="inline" /></button>
          </div>
        </div>
      </section>
      <aside className="home-setup-side" aria-label="Setup steps">
        <ol>
          {steps.map((step, index) => (
            <li key={step.id} data-done={step.done ? 'true' : undefined} data-current={index + 1 === next.step ? 'true' : undefined}>
              <span className="home-setup-mark" aria-hidden="true">{step.done ? <Icon name="check" size="compact" /> : index + 1}</span>
              <span><strong>{step.title}</strong><small>{step.detail}</small></span>
            </li>
          ))}
        </ol>
        <button type="button" className="home-setup-ask" onClick={onOpenRev}>
          <span className="home-v2-eyebrow">Not sure where to start?</span>
          <strong>Ask REV: “what should I revise first?”</strong>
        </button>
      </aside>
    </div>
  )
}
