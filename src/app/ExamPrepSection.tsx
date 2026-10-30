import { useEffect, useMemo, useRef, useState } from 'react'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { CatalogueCourse, ModuleLearningState } from './catalogue-model'
import { ExamSimulator, type ExamSimulatorProps } from './ExamSimulator'
import { examDateLabel, examPapersFor, lastMockFrom, mockRowFor, suggestMock, topicsCoveredPhrase, weeksAwayPhrase, type MockRow } from './exam-prep'
import { availableCourseMocks } from './course-mock-catalogue'
import { resolveSubjectIdentity } from './subject-palette'
import { topicProgressFor } from './topic-status'
import { accentStyle, Button, ExamPrepPage, type ExamMockMode } from './ui'

type ExamPrepSectionProps = {
  course: CatalogueCourse
  state: ModuleLearningState
  subjectId: string
  subjectName: string
  /** The student's next exam from their own exam dates (onboarding). Null when none is set. */
  nextExam: { title: string; assessmentDate: string } | null
  saving: boolean
  saveError: string
  onRecordEvidence: (evidence: LearningEvidence) => Promise<void>
  /** Only supplied after the governed raw-answer retention and timing decision. */
  checkpointContext?: ExamSimulatorProps['checkpointContext']
}

/**
 * Exam Prep is a normal course page. The learner opens untimed questions
 * in-page, while a timed full paper uses ExamSimulator's dedicated viewport.
 * The presentation shell never owns exam timer, marks or saved evidence.
 */
export function ExamPrepSection({ course, state, subjectId, subjectName, nextExam, saving, saveError, onRecordEvidence, checkpointContext }: ExamPrepSectionProps) {
  const [now] = useState(() => new Date())
  const [active, setActive] = useState<{ id: string; mode: ExamMockMode; durableContext?: ExamSimulatorProps['checkpointContext'] } | null>(null)
  const [savedExams, setSavedExams] = useState<Array<{ id: string; phase: string }>>([])
  const [savedExamCheck, setSavedExamCheck] = useState<'checking' | 'ready' | 'unavailable'>(
    checkpointContext ? 'checking' : 'ready',
  )
  const launchControl = useRef<{ id: string; mode: ExamMockMode; label: string } | null>(null)
  useEffect(() => {
    if (active || !launchControl.current) return
    const previous = launchControl.current
    launchControl.current = null
    // The preparation page remounts after focused work: restore focus to the
    // corresponding live button, never to a detached element.
    const rows = Array.from(document.querySelectorAll<HTMLElement>('.exam-mock'))
    const row = rows.find((item) => item.dataset.mockId === previous.id)
    const action = row?.querySelectorAll<HTMLButtonElement>('button')[previous.mode === 'timed' ? 0 : 1]
    const revAction = Array.from(document.querySelectorAll<HTMLButtonElement>('.exam-prep__rev button')).find(
      (item) => item.textContent?.trim() === previous.label,
    )
    ;(previous.label === 'Start it' ? revAction : action)?.focus()
  }, [active])

  function startMock(id: string, mode: ExamMockMode) {
    const label = document.activeElement instanceof HTMLElement ? document.activeElement.textContent?.trim() ?? '' : ''
    launchControl.current = { id, mode, label }
    // Freeze eligibility when a mock begins. A delayed Auth verification must
    // never silently upgrade an already-running transient mock to persisted
    // work (or switch a durable attempt off during the same session).
    setActive({ id, mode, durableContext: mode === 'timed' ? checkpointContext : undefined })
  }
  const identity = resolveSubjectIdentity(subjectId, subjectName)
  const guide = examPapersFor(course.examBoardName, course.specificationCode)
  const progress = useMemo(() => topicProgressFor(state), [state])
  const topicIds = useMemo(() => state.topicKnowledge.topics.map((topic) => topic.topicId), [state])
  const mocks = useMemo(() => availableCourseMocks(course), [course])
  const rows: MockRow[] = useMemo(() => mocks.map(({ exam, paperNumber }) => mockRowFor(exam, progress, paperNumber)), [mocks, progress])
  useEffect(() => {
    if (!checkpointContext) return
    let cancelled = false
    const load = async () => {
      const { data, error } = await checkpointContext.client.from('learner_exam_attempts')
        .select('exam_id,snapshot,expires_at')
        .eq('user_id', checkpointContext.userId).eq('course_id', checkpointContext.courseId)
      if (cancelled) return
      if (error) { setSavedExamCheck('unavailable'); return }
      const valid = new Set(mocks.map((item) => item.exam.id))
      const items = (data ?? []).flatMap((row) =>
        valid.has(String(row.exam_id)) && row.snapshot && typeof row.snapshot === 'object'
          ? [{ id: String(row.exam_id), phase: String((row.snapshot as { phase?: string }).phase ?? 'writing') }]
          : [])
      setSavedExams(items)
      setSavedExamCheck('ready')
    }
    void load()
    return () => { cancelled = true }
  }, [checkpointContext?.client, checkpointContext?.courseId, checkpointContext?.userId, mocks, active])
  const suggestion = useMemo(() => suggestMock(rows, progress), [rows, progress])
  const lastMock = useMemo(() => lastMockFrom(state.evidence, rows), [state.evidence, rows])
  const topicsCovered = useMemo(
    () => Object.fromEntries((guide?.papers ?? []).map((paper) => [paper.number, topicsCoveredPhrase(paper, progress, topicIds)])),
    [guide, progress, topicIds],
  )
  const activeMock = active ? mocks.find(({ exam }) => exam.id === active.id) ?? null : null
  // Untimed question practice is supported for all published mock assets.
  // This is question-by-question study, not a separately implemented untimed full-paper run.
  const untimedUnavailable: string[] = []

  if (active && activeMock) {
    return (
      <section className="exam-prep-activity" aria-label={`Mock exam: ${activeMock.exam.title}`} style={accentStyle(identity.hue)}>
        <header className="exam-prep-activity__header">
          {(!active.durableContext || active.mode !== 'timed') && <Button variant="secondary" className="exam-prep-activity__back" onClick={() => setActive(null)}>
            Back to Exam Prep
          </Button>}
          <div>
            <p className="ui-eyebrow">{active.mode === 'timed' ? 'Timed mock' : 'Untimed paper practice'}</p>
            <h2>{rows.find((row) => row.id === active.id)?.name ?? activeMock.exam.title}</h2>
          </div>
        </header>
        <ExamSimulator
          key={active.id + active.mode}
          exam={activeMock.exam}
          moduleId={activeMock.moduleId}
          saving={saving}
          saveError={saveError}
          onRecordEvidence={onRecordEvidence}
          checkpointContext={active.durableContext}
          autoStart={active.mode}
          onExit={() => setActive(null)}
        />
      </section>
    )
  }

  return (
    <>
      {checkpointContext && (savedExams.length > 0 || savedExamCheck === 'unavailable') && <section className="exam-prep-recovery" aria-label="Saved mock examinations">
        <p>Unfinished full mocks are saved privately for up to 14 days. You can continue from your last confirmed answers after leaving or refreshing. Draft answers are removed after your result is safely recorded.</p>
        {savedExamCheck === 'checking' && <p role="status">Checking unfinished exams…</p>}
        {savedExamCheck === 'unavailable' && <p role="alert">We cannot confirm your saved exams right now. Starting an exam will check again before changing work.</p>}
        {savedExams.map((item) => {
          const mock = mocks.find((candidate) => candidate.exam.id === item.id)
          if (!mock) return null
          return <div key={item.id} className="inline-actions">
            <span>{mock.exam.title}</span>
            <Button variant="secondary" onClick={() => startMock(item.id, 'timed')}>
              {item.phase === 'submitted' ? 'View saved result' :
                item.phase === 'submitting' ? 'Finish saving exam' : 'Continue saved exam'}
            </Button>
          </div>
        })}
      </section>}
      <ExamPrepPage
        courseName={subjectName}
        boardName={`${course.examBoardName} ${course.qualificationName.replace(new RegExp(`^${course.examBoardName}\\s*`, 'i'), '')}`.trim()}
        accentStyle={accentStyle(identity.hue)}
        firstExam={nextExam ? { title: nextExam.title, dateLabel: examDateLabel(nextExam.assessmentDate), away: weeksAwayPhrase(nextExam.assessmentDate, now) } : null}
        guide={guide}
        topicsCovered={topicsCovered}
        mocks={rows}
        untimedUnavailable={untimedUnavailable}
        suggestion={suggestion}
        lastMock={lastMock}
        onStartMock={startMock}
    />
    </>
  )
}
