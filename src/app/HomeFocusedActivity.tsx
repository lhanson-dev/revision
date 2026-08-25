import { useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseEvidenceStore, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'
import type { HomeTask } from './home-task'
import { Button, Status } from './ui'

interface HomeFocusedActivityProps {
  client: SupabaseClient
  userId: string
  task: HomeTask
  onBack: () => void
  onFinish: () => void
}

function evidenceId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function HomeFocusedActivity({ client, userId, task, onBack, onFinish }: HomeFocusedActivityProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)

  const cards = useMemo(() => task.adapter.listFlashcards(task.topicId), [task])
  const questions = useMemo(() => task.adapter.listQuestions(task.topicId), [task])
  const card = cards[0]
  const question = questions[0]

  async function saveFlashcard(rating: 0 | 1 | 2) {
    if (!card || saving) return
    setSaving(true)
    setError('')
    try {
      await recordLearningEvidence(createSupabaseEvidenceStore(client), userId, createFlashcardEvidence({
        id: evidenceId('home-flashcard'),
        moduleId: task.adapter.manifest.id,
        topicId: card.topic,
        contentId: card.id,
        rating,
      }))
      setCompleted(true)
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
        id: evidenceId('home-quick-check'),
        moduleId: task.adapter.manifest.id,
        topicId: question.topic,
        contentId: question.id,
        selectedOption,
        correctOption: question.correctOption,
      }))
      setChecked(true)
      setCompleted(true)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save this activity. Your answer is still on screen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="dashboard screen-dashboard home-focused-activity" aria-labelledby="home-focused-activity-title" data-subject-accent={task.subjectAccent}>
      <button type="button" className="home-focused-back" onClick={onBack}>← Back to Home</button>
      <section className="home-focused-card">
        <header className="home-focused-heading">
          <div className="home-focused-labels">
            <span className="home-subject-chip">{task.subjectName}</span>
            <span className="home-neutral-chip">Recommended session · {task.estimatedMinutes} min</span>
          </div>
          <h1 id="home-focused-activity-title">{task.topicLabel}</h1>
          <p>{task.courseLabel}</p>
        </header>

        {error && <Status tone="error">{error}</Status>}

        {task.activityType === 'flashcards' && card && !completed && (
          <div className="home-focused-practice">
            <p className="eyebrow">Flashcard</p>
            <h2>{card.prompt}</h2>
            {!showAnswer ? (
              <Button className="primary" onClick={() => setShowAnswer(true)}>Show answer</Button>
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

        {task.activityType === 'quick-check' && question && !completed && (
          <div className="home-focused-practice">
            <p className="eyebrow">Quick check</p>
            <h2>{question.prompt}</h2>
            <div className="home-focused-options">
              {question.options.map((option, index) => (
                <label key={option}>
                  <input type="radio" name="home-focused-answer" checked={selectedOption === index} disabled={saving} onChange={() => setSelectedOption(index)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <Button className="primary" disabled={selectedOption === null || saving} onClick={() => void checkQuestion()}>Check answer</Button>
          </div>
        )}

        {task.activityType === 'quick-check' && question && completed && checked && (
          <div className="home-focused-result" aria-live="polite">
            <p className="eyebrow">Result saved</p>
            <h2>{selectedOption === question.correctOption ? 'Correct.' : 'Not quite.'}</h2>
            <p>{question.explanation}</p>
            <Button className="primary" onClick={onFinish}>Back to today’s plan</Button>
          </div>
        )}

        {task.activityType === 'flashcards' && card && completed && (
          <div className="home-focused-result" aria-live="polite">
            <p className="eyebrow">Evidence saved</p>
            <h2>Useful revision recorded.</h2>
            <p>Revision will use this result with the rest of your evidence when it recalculates what matters next.</p>
            <Button className="primary" onClick={onFinish}>Back to today’s plan</Button>
          </div>
        )}

        {task.activityType === 'flashcards' && !card && <Status tone="warning">This flashcard activity is no longer available for the recommended topic.</Status>}
        {task.activityType === 'quick-check' && !question && <Status tone="warning">This quick check is no longer available for the recommended topic.</Status>}
      </section>
    </main>
  )
}
