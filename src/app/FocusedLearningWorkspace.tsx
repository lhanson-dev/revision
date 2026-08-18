import { useMemo, useState } from 'react'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { RevisionRecommendation } from '../engine/readiness/readiness'
import { createFlashcardEvidence, createMultipleChoiceEvidence, createSelfAssessedExamQuestionEvidence } from './practice-evidence'

export type FocusedLearningSection = 'learn' | 'practice' | 'exam-prep'

type WorkspaceMode = 'learn' | 'flashcards' | 'links' | 'answer' | 'quick-check' | 'case-study' | 'exam-question' | 'formulas-data'
type AoKey = 'ao1' | 'ao2' | 'ao3' | 'ao4'

export type FocusedLearningWorkspaceProps = {
  adapter: LearningContentAdapter
  section: FocusedLearningSection
  recommendation: RevisionRecommendation | null
  saving: boolean
  saveError: string
  onRecordEvidence: (evidence: LearningEvidence) => Promise<void>
}

const emptyAoMarks: Record<AoKey, number> = { ao1: 0, ao2: 0, ao3: 0, ao4: 0 }

const sectionModes: Record<FocusedLearningSection, readonly WorkspaceMode[]> = {
  learn: ['learn', 'links'],
  practice: ['flashcards', 'quick-check', 'case-study', 'exam-question', 'formulas-data'],
  'exam-prep': ['answer'],
}

const modeLabels: Record<WorkspaceMode, string> = {
  learn: 'Topic notes',
  flashcards: 'Flashcards',
  links: 'Link topics',
  answer: 'Exam technique',
  'quick-check': 'Quick check',
  'case-study': 'Case study',
  'exam-question': 'Exam question',
  'formulas-data': 'Formulas & data',
}

function defaultMode(section: FocusedLearningSection): WorkspaceMode {
  if (section === 'practice') return 'flashcards'
  if (section === 'exam-prep') return 'answer'
  return 'learn'
}

function evidenceId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function recommendationActivityLabel(activity: RevisionRecommendation['activity']) {
  if (activity === 'flashcards') return 'Flashcards'
  if (activity === 'exam-question') return 'Exam question'
  return 'Quick check'
}

function sectionHeading(section: FocusedLearningSection, paperNumber: number) {
  if (section === 'learn') return {
    eyebrow: 'Understand the content',
    title: `Learn Paper ${paperNumber}`,
    intro: 'Choose a topic, build understanding and connect ideas before you test yourself.',
  }
  if (section === 'exam-prep') return {
    eyebrow: 'Turn knowledge into marks',
    title: `Exam Prep · Paper ${paperNumber}`,
    intro: 'Use exam technique guidance here, then move into timed or full-paper practice when you are ready.',
  }
  return {
    eyebrow: 'Retrieve, apply and test',
    title: `Practice Paper ${paperNumber}`,
    intro: 'Build evidence with recall, quick checks, application and exam-style questions. Reading alone does not inflate progress.',
  }
}

export function FocusedLearningWorkspace({ adapter, section, recommendation, saving, saveError, onRecordEvidence }: FocusedLearningWorkspaceProps) {
  const topics = adapter.listTopics()
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const [mode, setMode] = useState<WorkspaceMode>(() => defaultMode(section))
  const [cardIndex, setCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [formulaIndex, setFormulaIndex] = useState(0)
  const [showFormula, setShowFormula] = useState(false)
  const [drillIndex, setDrillIndex] = useState(0)
  const [showDrillAnswer, setShowDrillAnswer] = useState(false)
  const [caseQuestionIndex, setCaseQuestionIndex] = useState(0)
  const [caseDraft, setCaseDraft] = useState('')
  const [showCaseGuidance, setShowCaseGuidance] = useState(false)
  const [examQuestionIndex, setExamQuestionIndex] = useState(0)
  const [examDraft, setExamDraft] = useState('')
  const [showMarkingGuidance, setShowMarkingGuidance] = useState(false)
  const [aoMarks, setAoMarks] = useState<Record<AoKey, number>>(emptyAoMarks)
  const [examRecorded, setExamRecorded] = useState(false)

  const availableModes = sectionModes[section]
  const effectiveMode = availableModes.includes(mode) ? mode : defaultMode(section)
  const copy = sectionHeading(section, adapter.manifest.paper.number)
  const topic = adapter.getTopic(topicId)
  const cards = useMemo(() => adapter.listFlashcards(topicId), [adapter, topicId])
  const questions = useMemo(() => adapter.listQuestions(topicId), [adapter, topicId])
  const links = useMemo(() => adapter.listTopicLinks(topicId), [adapter, topicId])
  const formulas = adapter.listFormulas()
  const drills = adapter.listDataDrills()
  const examTechnique = adapter.listExamTechnique()
  const caseStudy = adapter.listCaseStudies()[0]
  const exam = adapter.listExams()[0]
  const recommendationTopic = recommendation ? adapter.getTopic(recommendation.topicId) : undefined
  const card = cards[cardIndex % Math.max(cards.length, 1)]
  const question = questions[questionIndex % Math.max(questions.length, 1)]
  const formula = formulas[formulaIndex % Math.max(formulas.length, 1)]
  const drill = drills[drillIndex % Math.max(drills.length, 1)]
  const caseQuestion = caseStudy?.questions[caseQuestionIndex % Math.max(caseStudy.questions.length, 1)]
  const examQuestion = exam?.questions[examQuestionIndex % Math.max(exam.questions.length, 1)]
  const examTotalAwarded = (Object.keys(aoMarks) as AoKey[]).reduce((sum, key) => sum + aoMarks[key], 0)

  function changeTopic(nextTopic: string) {
    setTopicId(nextTopic)
    setCardIndex(0)
    setQuestionIndex(0)
    setShowAnswer(false)
    setSelectedOption(null)
    setChecked(false)
  }

  function changeMode(nextMode: WorkspaceMode) {
    if (availableModes.includes(nextMode)) setMode(nextMode)
  }

  function startRecommendation() {
    if (!recommendation) return
    changeTopic(recommendation.topicId)
    changeMode(recommendation.activity)
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

  async function recordExamQuestion() {
    if (!examQuestion || !exam || !showMarkingGuidance || examRecorded) return
    const evidence = createSelfAssessedExamQuestionEvidence({
      id: evidenceId('exam-question'),
      moduleId: adapter.manifest.id,
      topicId: examQuestion.topic,
      contentId: examQuestion.id,
      available: examQuestion.assessmentObjectives,
      awarded: aoMarks,
    })
    try {
      await onRecordEvidence(evidence)
    } catch {
      return
    }
    setExamRecorded(true)
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

  function nextCaseQuestion() {
    setCaseQuestionIndex((index) => index + 1)
    setCaseDraft('')
    setShowCaseGuidance(false)
  }

  function nextExamQuestion() {
    setExamQuestionIndex((index) => index + 1)
    setExamDraft('')
    setShowMarkingGuidance(false)
    setAoMarks(emptyAoMarks)
    setExamRecorded(false)
  }

  function updateAoMark(key: AoKey, value: number, available: number) {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(available, Math.trunc(value))) : 0
    setAoMarks((current) => ({ ...current, [key]: safeValue }))
  }

  return (
    <section className={`learning-workspace focused-workspace focused-${section}`} aria-labelledby={`focused-${section}-heading`}>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id={`focused-${section}-heading`}>{copy.title}</h2>
          <p className="muted">{copy.intro}</p>
        </div>
        <label className="topic-picker">Topic
          <select value={topicId} onChange={(event) => changeTopic(event.target.value)}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
          </select>
        </label>
      </div>

      {section === 'practice' && recommendation && recommendationTopic && (
        <aside className="recommendation-card" aria-labelledby="recommendation-heading">
          <div>
            <p className="eyebrow">REV recommends</p>
            <h3 id="recommendation-heading">{recommendationTopic.shortTitle} · {recommendationActivityLabel(recommendation.activity)}</h3>
            <p>{recommendation.reason}</p>
            <p className="recommendation-evidence"><strong>Evidence used:</strong> {recommendation.evidenceSummary}</p>
            <p className="muted"><strong>Confidence limitation:</strong> {recommendation.limitation}</p>
          </div>
          <button className="primary" onClick={startRecommendation}>Start recommended activity</button>
        </aside>
      )}

      <div className="mode-tabs" role="tablist" aria-label={`${copy.title} activities`}>
        {availableModes.map((item) => (
          <button key={item} className={effectiveMode === item ? 'active' : ''} onClick={() => changeMode(item)} role="tab" aria-selected={effectiveMode === item}>{modeLabels[item]}</button>
        ))}
      </div>

      {effectiveMode === 'learn' && topic && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Learning activity</strong><span>Build understanding first. This does not change your readiness score by itself.</span></div>
          <h3>{topic.title}</h3>
          <div className="section-grid">
            {topic.sections.map((sectionItem) => (
              <article className="learn-section" key={sectionItem.id}>
                <h4>{sectionItem.title}</h4>
                <ul>{sectionItem.points.map((point) => <li key={point}>{point}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="next-step"><strong>What should I do next?</strong><span>Move to Practice when you want to check recall or prove the learning with scored evidence.</span></div>
        </div>
      )}

      {effectiveMode === 'links' && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Learning activity</strong><span>Use these chains to connect a decision to its wider business consequences.</span></div>
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

      {effectiveMode === 'flashcards' && card && (
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

      {effectiveMode === 'quick-check' && question && (
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

      {effectiveMode === 'case-study' && caseStudy && caseQuestion && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Guided application practice</strong><span>This develops application and analysis, but it is not scored because these guided questions do not have an authoritative mark allocation.</span></div>
          <h3>{caseStudy.title}</h3>
          <div className="case-layout">
            <article className="case-material">
              <div dangerouslySetInnerHTML={{ __html: caseStudy.bodyHtml }} />
              <div className="fact-chips">{caseStudy.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
            </article>
            <article className="written-practice">
              <div className="practice-meta">Question {(caseQuestionIndex % caseStudy.questions.length) + 1} of {caseStudy.questions.length}</div>
              <h3>{caseQuestion.prompt}</h3>
              <label className="answer-label">Draft your answer
                <textarea rows={9} value={caseDraft} onChange={(event) => setCaseDraft(event.target.value)} placeholder="Use the case evidence and build a clear chain of reasoning." />
              </label>
              {!showCaseGuidance ? (
                <button className="primary" disabled={!caseDraft.trim()} onClick={() => setShowCaseGuidance(true)}>Compare with guidance</button>
              ) : (
                <>
                  <div className="answer-panel"><strong>What a strong answer should do</strong><p>{caseQuestion.guidance}</p></div>
                  <div className="next-step"><strong>What should I improve?</strong><span>Compare your answer with the guidance. Look for missing case evidence, weak chains of reasoning, or a judgement that is not conditional enough.</span></div>
                  <button className="primary" onClick={nextCaseQuestion}>Next case question</button>
                </>
              )}
            </article>
          </div>
        </div>
      )}

      {effectiveMode === 'exam-question' && exam && examQuestion && (
        <div className="learn-panel">
          <div className="activity-kind scored"><strong>Scored exam evidence — self-assessed</strong><span>Write the answer first, then use the marking guidance to award your own AO marks. Self-marked evidence contributes to readiness but cannot produce high confidence on its own.</span></div>
          <div className="exam-context" dangerouslySetInnerHTML={{ __html: exam.caseHtml }} />
          <article className="written-practice exam-practice">
            <div className="practice-meta">{exam.title} · Question {(examQuestionIndex % exam.questions.length) + 1} of {exam.questions.length} · {examQuestion.marks} marks · {adapter.getTopic(examQuestion.topic)?.shortTitle ?? examQuestion.topic}</div>
            <h3>{examQuestion.prompt}</h3>
            <label className="answer-label">Write your answer
              <textarea rows={12} value={examDraft} disabled={examRecorded} onChange={(event) => setExamDraft(event.target.value)} placeholder="Answer as you would in the exam. Use the case where relevant and show calculations." />
            </label>
            <p className="muted small-note">Your written draft stays on this screen only. Revision saves the marks you record, not the text of this answer.</p>
            {!showMarkingGuidance ? (
              <button className="primary" disabled={!examDraft.trim()} onClick={() => setShowMarkingGuidance(true)}>Show marking guidance</button>
            ) : (
              <>
                <div className="answer-panel">
                  <strong>Marking guidance</strong>
                  <ul>{examQuestion.markingGuidance.map((point) => <li key={point}>{point}</li>)}</ul>
                </div>
                <div className="self-mark-panel">
                  <div><strong>Self-assess by assessment objective</strong><p className="muted">Award only the marks you can justify from your written answer. The total is calculated automatically.</p></div>
                  <div className="ao-grid">
                    {(Object.keys(examQuestion.assessmentObjectives) as AoKey[]).filter((key) => examQuestion.assessmentObjectives[key] > 0).map((key) => {
                      const available = examQuestion.assessmentObjectives[key]
                      return (
                        <label key={key}>{key.toUpperCase()} <span>out of {available}</span>
                          <input type="number" min={0} max={available} step={1} disabled={examRecorded} value={aoMarks[key]} onChange={(event) => updateAoMark(key, Number(event.target.value), available)} />
                        </label>
                      )
                    })}
                  </div>
                  <div className="mark-total"><span>Your self-assessed mark</span><strong>{examTotalAwarded} / {examQuestion.marks}</strong></div>
                </div>
                {!examRecorded ? (
                  <button className="primary" disabled={saving} onClick={recordExamQuestion}>Record this result</button>
                ) : (
                  <>
                    <div className="result-explanation" aria-live="polite"><strong>Result recorded: {examTotalAwarded} / {examQuestion.marks}</strong><span>This is exam evidence, but because you marked it yourself Revision limits the confidence it can claim. Use the guidance above to identify what to improve next.</span></div>
                    <button className="primary" onClick={nextExamQuestion}>Next exam question</button>
                  </>
                )}
              </>
            )}
          </article>
        </div>
      )}

      {effectiveMode === 'formulas-data' && (
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
          <div className="next-step"><strong>What should I do next?</strong><span>Use Quick check for application evidence or Exam question for stronger written exam evidence.</span></div>
        </div>
      )}

      {effectiveMode === 'answer' && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Exam technique</strong><span>Learn how to turn knowledge into marks before you attempt longer written questions. Reading this guidance does not count as scored evidence.</span></div>
          <h3>Paper {adapter.manifest.paper.number} answer blueprints</h3>
          <p className="muted">The objective is not longer answers. It is more marks per sentence: apply the case, build the chain, and make the judgement specific.</p>
          <div className="technique-grid">
            {examTechnique.map((guide) => (
              <article className="technique-card" key={guide.id}>
                <h4>{guide.title}</h4>
                <p>{guide.summary}</p>
                <ol className="technique-steps">
                  {guide.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <div className="technique-tip"><strong>Exam habit</strong><span>{guide.tip}</span></div>
              </article>
            ))}
          </div>
          <div className="next-step"><strong>What should I do next?</strong><span>Use the full Exam Simulator below when you want to test this technique under realistic conditions.</span></div>
        </div>
      )}

      {saveError && <p className="error" role="alert">{saveError}</p>}
      {saving && <p className="muted" aria-live="polite">Saving your activity…</p>}
    </section>
  )
}
