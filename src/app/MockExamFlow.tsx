import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { ExamSimulator, type ExamSimulatorProps } from './ExamSimulator'
import { answeredQuestionCount } from './exam-prep'
import {
  addSecond, briefFor, isAttempted, leaveText, milestoneNotice, modeAfterLeaving, suggestedMinutes, timerMilestone, timerView, untimedLabel, wordCount,
  type MockMode,
} from './mock-exam'
import { createBrowserDraftStore, draftAnsweredCount, type MockDraft } from './mock-exam-drafts'
import {
  MockBriefView, MockLeavePanel, MockQuestionView, MockStrip, MockTimerPill, PracticeBarTitle, PracticeDialog, useBreakpoint,
  accentStyle,
} from './ui'
import type { SubjectHue } from './subject-palette'

type MockExam = ExamSimulatorProps['exam']
type Phase = 'before' | 'questions' | 'handed'

export interface MockExamFlowProps {
  exam: MockExam
  moduleId: string
  /** The mock's name as the Exam Prep page shows it. */
  name: string
  mode: MockMode
  userId: string
  subjectMark: string
  hue: SubjectHue
  saving: boolean
  saveError: string
  onRecordEvidence: (evidence: LearningEvidence) => Promise<void>
  onClose: () => void
}

const SAVE_DELAY_MS = 500

/**
 * A mock exam in the Practice pop-up (Exam Prep v2.2, PR 2): Before you start, then the questions with a strip, a
 * clock (timed) or a counter (untimed), flags and autosave. The questions, marks and mark schemes are the paper's
 * own, shown as they are. At the end the written paper is handed to the existing self-marking until REV marking
 * (PR 3) replaces it.
 */
export function MockExamFlow(props: MockExamFlowProps) {
  const { exam, moduleId, name, userId, subjectMark, hue, saving, saveError, onRecordEvidence, onClose } = props
  const store = useMemo(() => createBrowserDraftStore(userId), [userId])
  const [saved, setSaved] = useState<MockDraft | null>(() => store.load(exam.id))
  const { phone } = useBreakpoint()

  // The mode is chosen on the Exam Prep page and cannot change after the Before you start screen.
  const [mode, setMode] = useState<MockMode>(props.mode)
  const [leftWhileTimed, setLeftWhileTimed] = useState(false)
  const [phase, setPhase] = useState<Phase>('before')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [leaveAsk, setLeaveAsk] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved')
  const [ranOut, setRanOut] = useState(false)

  const perQuestion = useRef<Record<string, number>>({})
  const elapsedRef = useRef(0)
  const lastTick = useRef<number | null>(null)
  const previousRemaining = useRef<number | null>(null)
  const latest = useRef({ answers, flagged, selectedChoices, questionIndex, mode, leftWhileTimed })
  useEffect(() => { latest.current = { answers, flagged, selectedChoices, questionIndex, mode, leftWhileTimed } })

  const totalSeconds = exam.durationMinutes * 60
  const remaining = Math.max(0, totalSeconds - elapsed)
  const question = exam.questions[questionIndex]
  const attempted = (item: { id: string; choiceGroup?: string | null }) => isAttempted(item, selectedChoices)
  const answeredNow = exam.questions.filter((item) => attempted(item) && (answers[item.id] ?? '').trim()).length
  const flaggedNow = exam.questions.filter((item) => flagged[item.id]).length
  const questionCount = answeredQuestionCount(exam)
  const choiceGroups = Array.from(new Set(exam.questions.flatMap((item) => (item.choiceGroup ? [item.choiceGroup] : []))))
  const missingChoiceGroups = choiceGroups.filter((group) => !selectedChoices[group])

  const buildDraft = useCallback((overrides: Partial<MockDraft> = {}): MockDraft => ({
    version: 1,
    examId: exam.id,
    mode: latest.current.mode,
    leftWhileTimed: latest.current.leftWhileTimed,
    answers: latest.current.answers,
    flagged: latest.current.flagged,
    selectedChoices: latest.current.selectedChoices,
    questionIndex: latest.current.questionIndex,
    secondsPerQuestion: perQuestion.current,
    elapsedSeconds: elapsedRef.current,
    savedAt: new Date().toISOString(),
    ...overrides,
  }), [exam.id])

  // Autosave: every change to an answer, flag or choice is saved after a short pause, and again when the page is hidden.
  const hasContent = phase === 'questions'
  useEffect(() => {
    if (!hasContent) return
    const timer = window.setTimeout(() => { store.save(buildDraft()); setSaveState('saved') }, SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [answers, flagged, selectedChoices, questionIndex, hasContent, store, buildDraft])
  useEffect(() => {
    if (!hasContent) return
    const flush = () => store.save(buildDraft())
    const onHidden = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHidden)
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onHidden) }
  }, [hasContent, store, buildDraft])

  const handIn = useCallback((outOfTime: boolean) => {
    store.save(buildDraft())
    setRanOut(outOfTime)
    setPhase('handed')
    setLeaveAsk(false)
  }, [store, buildDraft])

  // The clock. It counts real seconds (so a slow tab does not lose time), keeps the seconds spent on each question,
  // and never stops while the leave panel is open: leaving is a choice, not a pause.
  useEffect(() => {
    if (phase !== 'questions') return
    lastTick.current = Date.now()
    const interval = window.setInterval(() => {
      const now = Date.now()
      const delta = Math.max(1, Math.round((now - (lastTick.current ?? now)) / 1000))
      lastTick.current = now
      elapsedRef.current += delta
      const current = exam.questions[latest.current.questionIndex]
      if (current) for (let step = 0; step < delta; step += 1) perQuestion.current = addSecond(perQuestion.current, current.id)
      setElapsed(elapsedRef.current)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [phase, exam.questions])

  // Announce 5 minutes and 1 minute left, once each, politely. Hand in when time is up.
  useEffect(() => {
    if (phase !== 'questions' || latest.current.mode !== 'timed') return
    const previous = previousRemaining.current
    previousRemaining.current = remaining
    if (previous !== null) {
      const milestone = timerMilestone(previous, remaining)
      if (milestone) setAnnouncement(milestoneNotice(milestone))
    }
    if (remaining <= 0) handIn(true)
  }, [remaining, phase, handIn])

  function begin(carryOn: MockDraft | null) {
    if (carryOn) {
      // A saved attempt carries on untimed: it was left, so it no longer counts as a timed mock.
      setMode('untimed')
      setLeftWhileTimed(carryOn.leftWhileTimed || carryOn.mode === 'timed')
      setAnswers(carryOn.answers)
      setFlagged(carryOn.flagged)
      setSelectedChoices(carryOn.selectedChoices)
      setQuestionIndex(Math.min(carryOn.questionIndex, exam.questions.length - 1))
      perQuestion.current = carryOn.secondsPerQuestion
      elapsedRef.current = carryOn.elapsedSeconds
      setElapsed(carryOn.elapsedSeconds)
    } else {
      store.clear(exam.id)
      setSaved(null)
    }
    previousRemaining.current = null
    setPhase('questions')
  }

  function requestClose() {
    if (phase === 'questions') { setLeaveAsk(true); return }
    onClose()
  }

  function saveAndLeave() {
    const leftMode = modeAfterLeaving(latest.current.mode)
    store.save(buildDraft({ mode: leftMode, leftWhileTimed: latest.current.leftWhileTimed || latest.current.mode === 'timed' }))
    onClose()
  }

  const brief = briefFor(exam, name, mode, questionCount)
  const modeLine = mode === 'timed' ? 'Timed mock · like the real exam' : 'Untimed practice'
  const pill = phase === 'questions'
    ? mode === 'timed'
      ? <MockTimerPill mode="timed" {...timerView(remaining)} />
      : <MockTimerPill mode="untimed" label={untimedLabel(elapsed)} />
    : null

  const wordsNote = question ? `${wordCount(answers[question.id] ?? '')} words · ${saveState === 'saved' ? 'saved' : 'saving…'}` : ''

  const caseBox = (() => {
    if (!question) return null
    if (question.stimulus) {
      const stimulus = question.stimulus
      return {
        title: stimulus.title ?? 'Case study',
        body: (
          <>
            {stimulus.narrative && <p>{stimulus.narrative}</p>}
            {stimulus.table && (
              <div className="mock-case__table-wrap">
                <table>
                  <caption>{stimulus.table.title}</caption>
                  <thead><tr>{stimulus.table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                  <tbody>{stimulus.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
          </>
        ),
      }
    }
    if (exam.caseHtml) return { title: 'Source and case material', body: <div dangerouslySetInnerHTML={{ __html: exam.caseHtml }} /> }
    return null
  })()

  const isLast = questionIndex >= exam.questions.length - 1
  const finishBlocked = missingChoiceGroups.length > 0 ? `Choose one question from section ${missingChoiceGroups.join(' and ')} to finish.` : null

  return (
    <PracticeDialog
      className="practice-dialog--mock"
      label={`Mock exam: ${name}`}
      subjectMark={subjectMark}
      accentStyle={accentStyle(hue)}
      onClose={requestClose}
      closeLabel="Close mock exam"
      contentLabel="Mock exam content"
      bar={<><PracticeBarTitle title={name} detail={modeLine} />{pill}</>}
      barExtra={phase === 'questions' ? (
        <MockStrip
          items={exam.questions.map((item, index) => ({ id: item.id, number: index + 1, answered: Boolean((answers[item.id] ?? '').trim()), flagged: Boolean(flagged[item.id]), current: index === questionIndex }))}
          answered={answeredNow}
          flagged={flaggedNow}
          onGo={setQuestionIndex}
        />
      ) : null}
    >
      <p className="mock-announce" role="status" aria-live="polite">{announcement}</p>
      {phase === 'before' && (
        <MockBriefView
          model={brief}
          saved={saved ? { answered: draftAnsweredCount(saved), total: questionCount, wasTimed: saved.mode === 'timed' || saved.leftWhileTimed } : null}
          onBegin={() => begin(null)}
          onCarryOn={() => begin(saved)}
          onNotNow={onClose}
        />
      )}
      {phase === 'questions' && (
        <>
          {leaveAsk && <MockLeavePanel text={leaveText(mode)} onKeepGoing={() => { setLeaveAsk(false); window.requestAnimationFrame(() => document.querySelector<HTMLElement>('.practice-dialog--mock .practice-dialog__close')?.focus()) }} onSaveAndLeave={saveAndLeave} />}
          {question && (
            <MockQuestionView
              number={questionIndex + 1}
              total={exam.questions.length}
              marks={question.marks}
              minutesLabel={`about ${suggestedMinutes(question.marks)} min`}
              caseBox={caseBox}
              caseOpen={!phone || questionIndex === 0}
              prompt={question.prompt}
              kind={question.responseType === 'multiple-choice' ? 'mcq' : 'written'}
              options={question.options}
              value={answers[question.id] ?? ''}
              onChange={(value) => { setSaveState('saving'); setAnswers((current) => ({ ...current, [question.id]: value })) }}
              savedNote={wordsNote}
              choice={question.choiceGroup ? { group: question.choiceGroup, selected: selectedChoices[question.choiceGroup] === question.id, onSelect: () => setSelectedChoices((current) => ({ ...current, [question.choiceGroup as string]: question.id })) } : null}
              flagged={Boolean(flagged[question.id])}
              onToggleFlag={() => { setSaveState('saving'); setFlagged((current) => ({ ...current, [question.id]: !current[question.id] })) }}
              onPrevious={questionIndex > 0 ? () => setQuestionIndex((index) => index - 1) : undefined}
              onNext={!isLast ? () => setQuestionIndex((index) => index + 1) : undefined}
              onFinish={isLast ? () => handIn(false) : undefined}
              finishBlockedNote={isLast ? finishBlocked : null}
            />
          )}
        </>
      )}
      {phase === 'handed' && (
        <>
          {ranOut && <p className="mock-handed-note"><strong>Time’s up.</strong> Your answers have been handed in.</p>}
          <ExamSimulator
            exam={exam}
            moduleId={moduleId}
            saving={saving}
            saveError={saveError}
            onRecordEvidence={onRecordEvidence}
            resume={{ answers, selectedChoices, flagged, elapsedSeconds: Math.min(elapsed, totalSeconds), timed: mode === 'timed' && !leftWhileTimed }}
            onExit={onClose}
            onResultSaved={() => store.clear(exam.id)}
          />
        </>
      )}
    </PracticeDialog>
  )
}
