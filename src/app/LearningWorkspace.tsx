import { useMemo, useState } from 'react'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'

export type LearningWorkspaceProps = {
  adapter: LearningContentAdapter
  saving: boolean
  saveError: string
  onRecordEvidence: (evidence: LearningEvidence) => Promise<void>
}

function evidenceId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function LearningWorkspace({ adapter, saving, saveError, onRecordEvidence }: LearningWorkspaceProps) {
  const topics = adapter.listTopics()
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const [mode, setMode] = useState<'flashcards' | 'quick-check'>('flashcards')
  const [cardIndex, setCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const cards = useMemo(() => adapter.listFlashcards(topicId), [adapter, topicId])
  const questions = useMemo(() => adapter.listQuestions(topicId), [adapter, topicId])
  const card = cards[cardIndex % Math.max(cards.length, 1)]
  const question = questions[questionIndex % Math.max(questions.length, 1)]

  function changeTopic(nextTopic: string) {
    setTopicId(nextTopic)
    setCardIndex(0)
    setQuestionIndex(0)
    setShowAnswer(false)
    setSelectedOption(null)
    setChecked(false)
  }

  async function rateFlashcard(rating: 0 | 1 | 2) {
    if (!card) return
    const evidence = createFlashcardEvidence({
      id: evidenceId('flashcard'),
      moduleId: adapter.manifest.id,
      topicId: card.topic,
      contentId: card.id,
      rating,
    })
    try {
      await onRecordEvidence(evidence)
    } catch {
      return
    }
    setCardIndex((index) => index + 1)
    setShowAnswer(false)
  }

  async function checkAnswer() {
    if (!question || selectedOption === null || checked) return
    const evidence = createMultipleChoiceEvidence({
      id: evidenceId('mcq'),
      moduleId: adapter.manifest.id,
      topicId: question.topic,
      contentId: question.id,
      selectedOption,
      correctOption: question.correctOption,
    })
    try {
      await onRecordEvidence(evidence)
    } catch {
      return
    }
    setChecked(true)
  }

  function nextQuestion() {
    setQuestionIndex((index) => index + 1)
    setSelectedOption(null)
    setChecked(false)
  }

  return (
    <section className="learning-workspace" aria-labelledby="practice-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Build useful evidence</p>
          <h2 id="practice-heading">Practise Paper 2</h2>
          <p className="muted">Every rated flashcard and checked question is saved to your Recent Activity. Readiness only changes when there is enough varied evidence.</p>
        </div>
        <label className="topic-picker">Topic
          <select value={topicId} onChange={(event) => changeTopic(event.target.value)}>
            {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.shortTitle}</option>)}
          </select>
        </label>
      </div>

      <div className="mode-tabs" role="tablist" aria-label="Practice type">
        <button className={mode === 'flashcards' ? 'active' : ''} onClick={() => setMode('flashcards')} role="tab" aria-selected={mode === 'flashcards'}>Flashcards</button>
        <button className={mode === 'quick-check' ? 'active' : ''} onClick={() => setMode('quick-check')} role="tab" aria-selected={mode === 'quick-check'}>Quick check</button>
      </div>

      {mode === 'flashcards' && card && (
        <div className="practice-card">
          <div className="practice-meta">Card {(cardIndex % cards.length) + 1} of {cards.length}</div>
          <h3>{card.prompt}</h3>
          {!showAnswer ? (
            <button className="primary" onClick={() => setShowAnswer(true)}>Show answer</button>
          ) : (
            <>
              <div className="answer-panel"><strong>Answer</strong><p>{card.answer}</p></div>
              <p className="rating-prompt">How well did you know it?</p>
              <div className="rating-actions">
                <button disabled={saving} onClick={() => rateFlashcard(0)}>Not yet</button>
                <button disabled={saving} onClick={() => rateFlashcard(1)}>Nearly</button>
                <button disabled={saving} onClick={() => rateFlashcard(2)}>Knew it</button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'quick-check' && question && (
        <div className="practice-card">
          <div className="practice-meta">Question {(questionIndex % questions.length) + 1} of {questions.length}</div>
          <h3>{question.prompt}</h3>
          <div className="option-list">
            {question.options.map((option, index) => (
              <label key={option} className={checked ? (index === question.correctOption ? 'correct' : selectedOption === index ? 'incorrect' : '') : ''}>
                <input type="radio" name="quick-check-answer" checked={selectedOption === index} disabled={checked || saving} onChange={() => setSelectedOption(index)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {!checked ? (
            <button className="primary" disabled={selectedOption === null || saving} onClick={checkAnswer}>Check answer</button>
          ) : (
            <>
              <div className="answer-panel" aria-live="polite"><strong>{selectedOption === question.correctOption ? 'Correct' : 'Not quite'}</strong><p>{question.explanation}</p></div>
              <button className="primary" onClick={nextQuestion}>Next question</button>
            </>
          )}
        </div>
      )}

      {saveError && <p className="error" role="alert">{saveError}</p>}
      {saving && <p className="muted" aria-live="polite">Saving your activity…</p>}
    </section>
  )
}
