import { useMemo, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseEvidenceStore, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'
import { supportedActivityMinutes, type HomeTask } from './home-task'
import { Button, Icon, Status } from './ui'
import { ExamSimulator } from './ExamSimulator'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { resolveHomeExamQuestion } from './home-exam-question'
import { focusedActivityCount } from './focused-activity-dose'
import { recordPlannerActivityEvent } from '../services/planning/planner-service'
import { setPlannedSessionStatus } from '../services/planning/planned-session-service'
import type { LearnerProgrammeCourse } from './learner-programme'

interface HomeFocusedActivityProps {
  client: SupabaseClient
  userId: string
  task: HomeTask
  programme: readonly LearnerProgrammeCourse[]
  backLabel?: string
  onBack: () => void
  onFinish: () => void
}

function evidenceId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function HomeFocusedActivity({ client, userId, task, programme, backLabel = 'Home', onBack, onFinish }: HomeFocusedActivityProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [bookedSessionDone, setBookedSessionDone] = useState(false)
  const [activityIndex, setActivityIndex] = useState(0)
  // Reuse the same ID when an uncertain network write is retried.
  const evidenceIds = useRef(new Map<string, string>())
  function stableEvidenceId(prefix: string, contentId: string) {
    const key = prefix + ':' + contentId
    const existing = evidenceIds.current.get(key)
    if (existing) return existing
    const id = evidenceId(prefix)
    evidenceIds.current.set(key, id)
    return id
  }

  async function markSessionFinished(totalItems: number) {
    if (!task.plannerItem) return
    try {
      await recordPlannerActivityEvent(client, userId, {
        recommendationId: task.id,
        eventType: 'completed',
        subjectId: task.subjectId,
        courseId: task.courseId,
        moduleId: task.adapter.manifest.id,
        topicId: task.topicId,
        activityType: task.activityType,
        metadata: { source: 'focused_session_completed', evidenceItems: totalItems },
      })
    } catch {
      setError('Your answers were saved, but Plan could not confirm this session as completed. You can still return to your plan.')
    }
  }
  // The content activity finishing is not proof that a longer student-booked
  // session was completed. Only a separate explicit student declaration may
  // change its durable status; an error leaves the booking open and retryable.
  async function confirmBookedSessionDone() {
    if (!task.sessionId || !completed || bookedSessionDone || saving) return
    setSaving(true)
    setError('')
    try {
      await setPlannedSessionStatus(client, userId, task.sessionId, 'done')
      setBookedSessionDone(true)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not mark your planned session done. It is still on your plan. Please retry.')
    } finally {
      setSaving(false)
    }
  }

  const examTarget = useMemo(() => task.activityType === 'exam-question' ? resolveHomeExamQuestion(task, programme) : null, [task, programme])
  async function saveExamEvidence(evidence: LearningEvidence) {
    setSaving(true)
    setError('')
    try {
      await recordLearningEvidence(createSupabaseEvidenceStore(client), userId, evidence)
      setCompleted(true)
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : 'Could not save this exam answer.'
      setError(message)
      throw reason
    } finally {
      setSaving(false)
    }
  }

  const cards = useMemo(() => task.adapter.listFlashcards(task.topicId), [task])
  const questions = useMemo(() => task.adapter.listQuestions(task.topicId), [task])
  const cardCount = focusedActivityCount('flashcards', cards.length)
  const questionCount = focusedActivityCount('quick-check', questions.length)
  const card = activityIndex < cardCount ? cards[activityIndex] : undefined
  const question = activityIndex < questionCount ? questions[activityIndex] : undefined
  const focused = task.activityType === 'flashcards' || task.activityType === 'quick-check'
  const totalItems = task.activityType === 'flashcards' ? cardCount : questionCount
  const actualMinutes = supportedActivityMinutes(task)

  const finishedBooking = task.sessionId && completed && focused ? (
    <div className="home-focused-booked-session" role="group" aria-label="Your planned session">
      {bookedSessionDone ? (
        <Status tone="success">Planned session marked done. Your answers remain recorded separately.</Status>
      ) : (
        <>
          <p>You completed the supported practice (about {actualMinutes} minutes of suggested work). Your {task.estimatedMinutes}-minute booked session is still on your Plan.</p>
          <p>Only mark the booked session done if you have finished the other work you intended for it. Question count and estimated minutes are not proof of time studied.</p>
          <Button variant="secondary" disabled={saving} onClick={() => void confirmBookedSessionDone()}>I've finished my planned session</Button>
        </>
      )}
    </div>
  ) : null

  async function saveFlashcard(rating: 0 | 1 | 2) {
    if (!card || saving) return
    setSaving(true)
    setError('')
    try {
      await recordLearningEvidence(createSupabaseEvidenceStore(client), userId, createFlashcardEvidence({
        id: stableEvidenceId('home-flashcard', card.id),
        moduleId: task.adapter.manifest.id,
        topicId: card.topic,
        contentId: card.id,
        rating,
      }))
      if (activityIndex + 1 >= cardCount) {
        await markSessionFinished(cardCount)
        setCompleted(true)
      } else {
        setActivityIndex(activityIndex + 1)
        setShowAnswer(false)
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save this activity. Your work is still on screen.')
    } finally {
      setSaving(false)
    }
  }

  async function checkQuestion() {
    if (!question || selectedOption === null || checked || saving) return
    setSaving(true)
    setError('')
    try {
      await recordLearningEvidence(createSupabaseEvidenceStore(client), userId, createMultipleChoiceEvidence({
        id: stableEvidenceId('home-quick-check', question.id),
        moduleId: task.adapter.manifest.id,
        topicId: question.topic,
        contentId: question.id,
        selectedOption,
        correctOption: question.correctOption,
      }))
      setChecked(true)
      if (activityIndex + 1 >= questionCount) {
        await markSessionFinished(questionCount)
        setCompleted(true)
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save this activity. Your answer is still on screen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="dashboard screen-dashboard home-focused-activity" aria-labelledby="home-focused-activity-title" data-subject-accent={task.subjectAccent}>
      <Button variant="tertiary" className="home-focused-back" onClick={completed && task.activityType === 'exam-question' ? onFinish : onBack}><Icon name="arrow-right" size="inline" className="home-focused-back-icon" /> Back to {backLabel}</Button>
      <section className="home-focused-card">
        <header className="home-focused-heading">
          <div className="home-focused-labels">
            <span className="home-subject-chip">{task.subjectName}</span>
            <span className="home-neutral-chip">{focused ? 'Focused practice' : 'Recommended session'} · about {actualMinutes} min{focused ? ' · ' + totalItems + ' ' + (task.activityType === 'flashcards' ? (totalItems === 1 ? 'card' : 'cards') : (totalItems === 1 ? 'question' : 'questions')) : ''}</span>
          </div>
          <h1 id="home-focused-activity-title">{task.topicLabel}</h1>
          <p>{task.courseLabel}</p>
          {focused && task.source === 'planner' && actualMinutes !== task.estimatedMinutes && (
            <p role="status">This topic has about {actualMinutes} minutes of supported practice. Your original {task.estimatedMinutes}-minute plan allocation is unchanged.</p>
          )}
        </header>

        {error && <Status tone="error">{error}</Status>}

        {task.activityType === 'exam-question' && examTarget && (
          <ExamSimulator key={examTarget.questionId} exam={examTarget.exam} moduleId={examTarget.moduleId} saving={saving} saveError={error} onRecordEvidence={saveExamEvidence} autoStart="untimed" preferredQuestionId={examTarget.questionId} />
        )}
        {task.activityType === 'exam-question' && !examTarget && <Status tone="warning">An assured exam question for this course and topic is not available yet. No activity or result has been recorded. Return to Home to choose another activity.</Status>}
        {task.activityType === 'flashcards' && card && !completed && (
          <div className="home-focused-practice">
            <p className="eyebrow">Flashcard {activityIndex + 1} of {cardCount}</p>
            <h2>{card.prompt}</h2>
            {!showAnswer ? (
              <Button onClick={() => setShowAnswer(true)}>Show answer</Button>
            ) : (
              <>
                <div className="home-focused-answer"><strong>Answer</strong><p>{card.answer}</p></div>
                <p className="home-focused-rating">How well did you know it?</p>
                <div className="home-focused-actions">
                  <Button variant="secondary" disabled={saving} onClick={() => void saveFlashcard(0)}>Not yet</Button>
                  <Button variant="secondary" disabled={saving} onClick={() => void saveFlashcard(1)}>Nearly</Button>
                  <Button variant="secondary" disabled={saving} onClick={() => void saveFlashcard(2)}>Knew it</Button>
                </div>
              </>
            )}
          </div>
        )}

        {task.activityType === 'quick-check' && question && !checked && (
          <div className="home-focused-practice">
            <p className="eyebrow">Quick check · Question {activityIndex + 1} of {questionCount}</p>
            <p>Each answer is saved as evidence. One answer alone does not establish understanding or exam readiness.</p>
            <h2>{question.prompt}</h2>
            <div className="home-focused-options">
              {question.options.map((option, index) => (
                <label key={option}>
                  <input type="radio" name="home-focused-answer" checked={selectedOption === index} disabled={saving} onChange={() => setSelectedOption(index)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <Button disabled={selectedOption === null || saving} onClick={() => void checkQuestion()}>Check answer</Button>
          </div>
        )}

        {task.activityType === 'quick-check' && question && checked && (
          <div className="home-focused-result" aria-live="polite">
            <p className="eyebrow">Result saved</p>
            <h2>{selectedOption === question.correctOption ? 'Correct.' : 'Not quite.'}</h2>
            <p>{question.explanation}</p>
            {completed ? (
              <>
                {finishedBooking}
                <Button onClick={onFinish}>Back to today’s plan</Button>
              </>
            ) : <Button onClick={() => { setActivityIndex(activityIndex + 1); setSelectedOption(null); setChecked(false) }}>Next question</Button>}
          </div>
        )}

        {task.activityType === 'flashcards' && card && completed && (
          <div className="home-focused-result" aria-live="polite">
            <p className="eyebrow">Evidence saved</p>
            <h2>Useful revision recorded.</h2>
            <p>Revision will use this result with the rest of your evidence when it recalculates what matters next.</p>
            {finishedBooking}
            <Button onClick={onFinish}>Back to today’s plan</Button>
          </div>
        )}

        {task.activityType === 'flashcards' && !card && <Status tone="warning">This flashcard activity is no longer available for the recommended topic.</Status>}
        {task.activityType === 'quick-check' && !question && <Status tone="warning">This quick check is no longer available for the recommended topic.</Status>}
      </section>
    </main>
  )
}
