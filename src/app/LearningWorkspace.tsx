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

type WorkspaceMode = 'learn' | 'flashcards' | 'links' | 'quick-check' | 'formulas-data'

function evidenceId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function LearningWorkspace({ adapter, saving, saveError, onRecordEvidence }: LearningWorkspaceProps) {
  const topics = adapter.listTopics()
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const [mode, setMode] = useState<WorkspaceMode>('learn')
  const [cardIndex, setCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [formulaIndex, setFormulaIndex] = useState(0)
  const [showFormula, setShowFormula] = useState(false)
  const [drillIndex, setDrillIndex] = useState(0)
  const [showDrillAnswer, setShowDrillAnswer] = useState(false)

  const topic = adapter.getTopic(topicId)
  const cards = useMemo(() => adapter.listFlashcards(topicId), [adapter, topicId])
  const questions = useMemo(() => adapter.listQuestions(topicId), [adapter, topicId])
  const links = useMemo(() => adapter.listTopicLinks(topicId), [adapter, topicId])
  const formulas = adapter.listFormulas()
  const drills = adapter.listDataDrills()
  const card = cards[cardIndex % Math.max(cards.length, 1)]
  const question = questions[questionIndex % Math.max(questions.length, 1)]
  const formula = formulas[formulaIndex % Math.max(formulas.length, 1)]
  const drill = drills[drillIndex % Math.max(drills.length, 1)]

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

  function nextFormula() {
    setFormulaIndex((index) => index + 1)
    setShowFormula(false)
  }

  function nextDrill() {
    setDrillIndex((index) => index + 1)
    setShowDrillAnswer(false)
  }

  return (
    <section className="learning-workspace" aria-labelledby="practice-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Learn → Recall → Link → Answer</p>
          <h2 id="practice-heading">Practise Paper 2</h2>
          <p className="muted">Use the topic notes to learn, then build evidence with recall and questions. Reading and revealing examples helps you study, but only scored activities contribute to readiness.</p>
        </div>
        <label className="topic-picker">Topic
          <select value={topicId} onChange={(event) => changeTopic(event.target.value)}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
          </select>
        </label>
      </div>

      <div className="mode-tabs" role="tablist" aria-label="Revision activity">
        <button className={mode === 'learn' ? 'active' : ''} onClick={() => setMode('learn')} role="tab" aria-selected={mode === 'learn'}>Learn</button>
        <button className={mode === 'flashcards' ? 'active' : ''} onClick={() => setMode('flashcards')} role="tab" aria-selected={mode === 'flashcards'}>Flashcards</button>
        <button className={mode === 'links' ? 'active' : ''} onClick={() => setMode('links')} role="tab" aria-selected={mode === 'links'}>Link topics</button>
        <button className={mode === 'quick-check' ? 'active' : ''} onClick={() => setMode('quick-check')} role="tab" aria-selected={mode === 'quick-check'}>Quick check</button>
        <button className={mode === 'formulas-data' ? 'active' : ''} onClick={() => setMode('formulas-data')} role="tab" aria-selected={mode === 'formulas-data'}>Formulas & data</button>
      </div>

      {mode === 'learn' && topic && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Learning activity</strong><span>Build understanding first. This does not change your readiness score by itself.</span></div>
          <h3>{topic.title}</h3>
          <div className="section-grid">
            {topic.sections.map((section) => (
              <article className="learn-section" key={section.id}>
                <h4>{section.title}</h4>
                <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="next-step"><strong>What should I do next?</strong><span>Try Flashcards to check recall, then Quick check to add scored evidence for this topic.</span></div>
        </div>
      )}

      {mode === 'flashcards' && card && (
        <div className="practice-card">
          <div className="activity-kind scored"><strong>Scored evidence</strong><span>Your self-rating is recorded and contributes to the evidence picture.</span></div>
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

      {mode === 'links' && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Learning activity</strong><span>Use these chains to practise connecting a decision to its wider business consequences.</span></div>
          <h3>Link {topic?.shortTitle ?? 'this topic'} to the wider business</h3>
          <div className="link-list">
            {links.map((link) => (
              <article key={link.id}>
                <strong>{link.label}</strong>
                <p>{link.explanation}</p>
              </article>
            ))}
          </div>
          <div className="next-step"><strong>Exam habit</strong><span>Do not stop at the first effect. Build a chain: decision → immediate impact → functional consequence → business outcome.</span></div>
        </div>
      )}

      {mode === 'quick-check' && question && (
        <div className="practice-card">
          <div className="activity-kind scored"><strong>Scored evidence</strong><span>Your answer is recorded and contributes to readiness once there is enough varied evidence.</span></div>
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

      {mode === 'formulas-data' && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Practice activity</strong><span>These reveal-and-check exercises help you prepare. They are not scored readiness evidence yet.</span></div>
          <div className="practice-split">
            {formula && (
              <article className="practice-box">
                <div className="practice-meta">Formula {(formulaIndex % formulas.length) + 1} of {formulas.length}</div>
                <h3>{formula.name}</h3>
                <p className="muted">Write the formula from memory before revealing it.</p>
                {showFormula ? <div className="answer-panel"><strong>Formula</strong><p>{formula.expression}</p></div> : <button className="secondary" onClick={() => setShowFormula(true)}>Reveal formula</button>}
                {showFormula && <button className="primary" onClick={nextFormula}>Next formula</button>}
              </article>
            )}
            {drill && (
              <article className="practice-box">
                <div className="practice-meta">Data drill {(drillIndex % drills.length) + 1} of {drills.length}</div>
                <h3>{drill.title}</h3>
                <p>{drill.prompt}</p>
                {showDrillAnswer ? <div className="answer-panel"><strong>Model answer</strong><p>{drill.answer}</p></div> : <button className="secondary" onClick={() => setShowDrillAnswer(true)}>Show model answer</button>}
                {showDrillAnswer && <button className="primary" onClick={nextDrill}>Next data drill</button>}
              </article>
            )}
          </div>
          <div className="next-step"><strong>What should I do next?</strong><span>Use Quick check for scored evidence. Longer data and exam questions will add stronger application evidence in the next migration slices.</span></div>
        </div>
      )}

      {saveError && <p className="error" role="alert">{saveError}</p>}
      {saving && <p className="muted" aria-live="polite">Saving your activity…</p>}
    </section>
  )
}
