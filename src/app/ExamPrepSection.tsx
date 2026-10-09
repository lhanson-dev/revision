import { useMemo, useState } from 'react'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { CatalogueCourse, ModuleLearningState } from './catalogue-model'
import type { ExamSimulatorProps } from './ExamSimulator'
import { MockExamFlow } from './MockExamFlow'
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
  userId: string
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
 * Exam Prep in the normal learner shell (v2.2): the page, and the pop-up a mock opens in. The pop-up is the
 * Practice pop-up shell; the mock itself is still the existing simulator until the timed/untimed mock flow lands.
 */
export function ExamPrepSection({ course, state, subjectId, subjectName, userId, nextExam, saving, saveError, onRecordEvidence }: ExamPrepSectionProps) {
  const [now] = useState(() => new Date())
  const [active, setActive] = useState<{ id: string; mode: ExamMockMode } | null>(null)
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

  return (
    <>
      <ExamPrepPage
        courseName={subjectName}
        boardName={`${course.examBoardName} ${course.qualificationName.replace(new RegExp(`^${course.examBoardName}\\s*`, 'i'), '')}`.trim()}
        accentStyle={accentStyle(identity.hue)}
        firstExam={nextExam ? { title: nextExam.title, dateLabel: examDateLabel(nextExam.assessmentDate), away: weeksAwayPhrase(nextExam.assessmentDate, now) } : null}
        guide={guide}
        topicsCovered={topicsCovered}
        mocks={rows}
        suggestion={suggestion}
        lastMock={lastMock}
        onStartMock={(id, mode) => setActive({ id, mode })}
      />
      {active && activeMock && (
        <MockExamFlow
          key={`${active.id}-${active.mode}`}
          exam={activeMock.exam}
          moduleId={activeMock.moduleId}
          name={rows.find((row) => row.id === active.id)?.name ?? activeMock.exam.title}
          mode={active.mode}
          userId={userId}
          subjectMark={identity.mark}
          hue={identity.hue}
          saving={saving}
          saveError={saveError}
          onRecordEvidence={onRecordEvidence}
          onClose={() => setActive(null)}
        />
      )}
    </>
  )
}
