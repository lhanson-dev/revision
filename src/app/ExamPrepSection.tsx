import { useEffect, useMemo, useRef, useState } from 'react'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { CatalogueCourse, ModuleLearningState } from './catalogue-model'
import { ExamSimulator, type ExamSimulatorProps } from './ExamSimulator'
import { examDateLabel, examPapersFor, lastMockFrom, mockRowFor, suggestMock, topicsCoveredPhrase, weeksAwayPhrase, type MockRow } from './exam-prep'
import { retainedAqa7132MockExamForPaper } from './retained-aqa-business-mock'
import { resolveSubjectIdentity } from './subject-palette'
import { topicProgressFor } from './topic-status'
import { accentStyle, ExamPrepPage, type ExamMockMode } from './ui'

type MockExam = ExamSimulatorProps['exam']

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
}

/** Every full-paper mock this course has: each paper's own simulation, and the retained AQA 7132 mock where there is one. */
function mockExamsFor(course: CatalogueCourse): Array<{ exam: MockExam; moduleId: string; paperNumber: number }> {
  const isAqa7132 = course.examBoardName === 'AQA' && course.specificationCode === '7132'
  return course.modules.flatMap((paper) => {
    const retained = isAqa7132 ? retainedAqa7132MockExamForPaper(paper.manifest.paper.number) : null
    return [
      ...(retained ? [{ exam: retained as MockExam, moduleId: paper.manifest.id, paperNumber: paper.manifest.paper.number }] : []),
      ...paper.listExams().map((exam) => ({ exam: exam as MockExam, moduleId: paper.manifest.id, paperNumber: paper.manifest.paper.number })),
    ]
  })
}

/**
 * Exam Prep is a normal course page. The learner opens untimed questions
 * in-page, while a timed full paper uses ExamSimulator's dedicated viewport.
 * The presentation shell never owns exam timer, marks or saved evidence.
 */
export function ExamPrepSection({ course, state, subjectId, subjectName, nextExam, saving, saveError, onRecordEvidence }: ExamPrepSectionProps) {
  const [now] = useState(() => new Date())
  const [active, setActive] = useState<{ id: string; mode: ExamMockMode } | null>(null)
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
    setActive({ id, mode })
  }
  const identity = resolveSubjectIdentity(subjectId, subjectName)
  const guide = examPapersFor(course.examBoardName, course.specificationCode)
  const progress = useMemo(() => topicProgressFor(state), [state])
  const topicIds = useMemo(() => state.topicKnowledge.topics.map((topic) => topic.topicId), [state])
  const mocks = useMemo(() => mockExamsFor(course), [course])
  const rows: MockRow[] = useMemo(() => mocks.map(({ exam, paperNumber }) => mockRowFor(exam, progress, paperNumber)), [mocks, progress])
  const suggestion = useMemo(() => suggestMock(rows, progress), [rows, progress])
  const lastMock = useMemo(() => lastMockFrom(state.evidence, rows), [state.evidence, rows])
  const topicsCovered = useMemo(
    () => Object.fromEntries((guide?.papers ?? []).map((paper) => [paper.number, topicsCoveredPhrase(paper, progress, topicIds)])),
    [guide, progress, topicIds],
  )
  const activeMock = active ? mocks.find(({ exam }) => exam.id === active.id) ?? null : null
  // Single-question practice is not offered for the retained pilot papers.
  const untimedUnavailable = mocks.filter(({ exam }) => exam.restrictedPilot).map(({ exam }) => exam.id)

  if (active && activeMock) {
    return (
      <section className="exam-prep-activity" aria-label={`Mock exam: ${activeMock.exam.title}`} style={accentStyle(identity.hue)}>
        <header className="exam-prep-activity__header">
          <button type="button" className="exam-prep-activity__back" onClick={() => setActive(null)}>
            Back to Exam Prep
          </button>
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
          autoStart={active.mode}
          onExit={() => setActive(null)}
        />
      </section>
    )
  }

  return (
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
  )
}
