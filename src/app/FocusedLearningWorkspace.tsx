import { useEffect, useMemo, useState } from 'react'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { RevisionRecommendation } from '../engine/readiness/readiness'
import { createFlashcardEvidence, createMultipleChoiceEvidence, createSelfAssessedExamQuestionEvidence } from './practice-evidence'
import { Button, Icon, SegmentedControl, SelectField, TextAreaField } from './ui'

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
  contextLabel?: string
  includeExamQuestions?: boolean
  /** Practice only: open this topic first (for example when arriving from a Learn page). */
  preferredTopicId?: string | null
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

function elapsedLabel(startedAt: number, now: number) {
  const minutes = Math.floor((now - startedAt) / 60_000)
  return minutes < 1 ? 'Under a minute' : `${minutes} min`
}

function evidenceId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function sectionHeading(section: FocusedLearningSection, paperNumber: number, contextLabel?: string) {
  const target = contextLabel ?? `Paper ${paperNumber}`
  if (section === 'learn') return {
    eyebrow: 'Understand the content',
    title: `Learn · ${target}`,
    intro: 'Choose a topic, build understanding and connect ideas before you test yourself.',
  }
  if (section === 'exam-prep') return {
    eyebrow: 'Turn knowledge into marks',
    title: `Exam technique · ${target}`,
    intro: 'Use exam technique guidance here, then choose the relevant paper for timed or full-paper practice.',
  }
  return {
    eyebrow: 'Retrieve, apply and test',
    title: `Practice · ${target}`,
    intro: 'Build evidence with recall, quick checks and application. Paper-specific written exam practice belongs in Exam Prep.',
  }
}

export function FocusedLearningWorkspace({
  adapter,
  section,
  recommendation,
  saving,
  saveError,
  onRecordEvidence,
  contextLabel,
  includeExamQuestions = true,
  preferredTopicId,
}: FocusedLearningWorkspaceProps) {
  const topics = adapter.listTopics()
  const isPractice = section === 'practice'
  const [topicId, setTopicId] = useState(() => {
    if (isPractice && preferredTopicId && adapter.getTopic(preferredTopicId)) return preferredTopicId
    if (isPractice && recommendation && adapter.getTopic(recommendation.topicId)) return recommendation.topicId
    return topics[0]?.id ?? ''
  })
  const [mode, setMode] = useState<WorkspaceMode | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [sessionAnswered, setSessionAnswered] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionStart] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
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

  const availableModes = section === 'practice' && !includeExamQuestions
    ? sectionModes.practice.filter((item) => item !== 'exam-question')
    : sectionModes[section]
  const copy = sectionHeading(section, adapter.manifest.paper.number, contextLabel)
  const topic = adapter.getTopic(topicId)
  const cards = useMemo(() => adapter.listFlashcards(topicId), [adapter, topicId])
  const questions = useMemo(() => adapter.listQuestions(topicId), [adapter, topicId])
  const links = useMemo(() => adapter.listTopicLinks(topicId), [adapter, topicId])
  const formulas = adapter.listFormulas()
  const drills = adapter.listDataDrills()
  const examTechnique = adapter.listExamTechnique()
  const caseStudy = adapter.listCaseStudies()[0]
  const exam = adapter.listExams()[0]
  const card = cards[cardIndex % Math.max(cards.length, 1)]
  const question = questions[questionIndex % Math.max(questions.length, 1)]
  const formula = formulas[formulaIndex % Math.max(formulas.length, 1)]
  const drill = drills[drillIndex % Math.max(drills.length, 1)]
  const caseQuestion = caseStudy?.questions[caseQuestionIndex % Math.max(caseStudy.questions.length, 1)]
  const examQuestion = exam?.questions[examQuestionIndex % Math.max(exam.questions.length, 1)]
  const examTotalAwarded = (Object.keys(aoMarks) as AoKey[]).reduce((sum, key) => sum + aoMarks[key], 0)

  const modeHasContent: Record<WorkspaceMode, boolean> = {
    learn: true,
    links: true,
    answer: true,
    flashcards: cards.length > 0,
    'quick-check': questions.length > 0,
    'case-study': Boolean(caseStudy),
    'exam-question': Boolean(exam),
    'formulas-data': formulas.length > 0 || drills.length > 0,
  }
  const practiceModes = availableModes.filter((item) => modeHasContent[item])
  const recommendedMode = recommendation && recommendation.topicId === topicId
    && practiceModes.includes(recommendation.activity) ? recommendation.activity : null
  const initialMode: WorkspaceMode = isPractice
    ? recommendedMode ?? (practiceModes.includes('quick-check') ? 'quick-check' : practiceModes[0] ?? defaultMode(section))
    : defaultMode(section)
  const effectiveMode = mode && availableModes.includes(mode) ? mode : initialMode
  const otherModes = practiceModes.filter((item) => item !== effectiveMode)
  const modeSummary: Partial<Record<WorkspaceMode, string>> = {
    flashcards: `${cards.length} ${cards.length === 1 ? 'card' : 'cards'} on this topic`,
    'quick-check': `${questions.length} ${questions.length === 1 ? 'question' : 'questions'} on this topic`,
    'case-study': caseStudy ? `${caseStudy.questions.length} written ${caseStudy.questions.length === 1 ? 'question' : 'questions'} on a business case` : undefined,
    'exam-question': exam ? `${exam.questions.length} exam ${exam.questions.length === 1 ? 'question' : 'questions'}` : undefined,
    'formulas-data': `${formulas.length} ${formulas.length === 1 ? 'formula' : 'formulas'} · ${drills.length} data ${drills.length === 1 ? 'drill' : 'drills'}`,
  }
  const whyThisActivity = recommendedMode
    ? recommendation?.reason
    : `You chose ${modeLabels[effectiveMode].toLowerCase()} for ${topic?.shortTitle ?? 'this topic'}.`
  const sessionLabel = sessionAnswered === 0 ? 'None yet' : `${sessionCorrect} of ${sessionAnswered}`

  useEffect(() => {
    if (!isPractice) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [isPractice])

  function changeTopic(nextTopic: string) {
    setTopicId(nextTopic)
    setCardIndex(0)
    setQuestionIndex(0)
    setShowAnswer(false)
    setSelectedOption(null)
    setChecked(false)
    setAttempts(0)
  }

  function changeMode(nextMode: WorkspaceMode) {
    if (availableModes.includes(nextMode)) setMode(nextMode)
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
    // Only the first answer to a question is scored. A retry after seeing the explanation is practice.
    if (attempts === 0) {
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
      setSessionAnswered((count) => count + 1)
      if (selectedOption === question.correctOption) setSessionCorrect((count) => count + 1)
    }
    setAttempts((count) => count + 1)
    setChecked(true)
  }

  function retryQuestion() {
    setSelectedOption(null)
    setChecked(false)
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
    setAttempts(0)
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

  const workspaceHeading = (
    <div className="workspace-heading">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id={`focused-${section}-heading`}>{copy.title}</h2>
        <p className="muted">{copy.intro}</p>
      </div>
      <SelectField groupClassName="topic-picker" label="Topic" value={topicId} onChange={(event) => changeTopic(event.target.value)}>
        {topics.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
      </SelectField>
    </div>
  )

  const practiceContext = (
    <div className="pw-context">
      <h2 id="focused-practice-heading" className="pw-activity-label"><Icon name="pencil" size="compact" />{modeLabels[effectiveMode]}{topic ? ` · ${topic.shortTitle}` : ''}</h2>
      {topics.length > 1 && (
        <SelectField groupClassName="pw-change-topic" label="Change topic" value={topicId} onChange={(event) => changeTopic(event.target.value)}>
          {topics.map((item) => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}
        </SelectField>
      )}
    </div>
  )

  const quickCheckTask = question ? (
    <div className="pw-task">
      <div className="pw-task-meta">
        <span>Question {(questionIndex % questions.length) + 1} of {questions.length}</span>
      </div>
      <div className="pw-progress" aria-hidden="true">
        {questions.map((item, index) => {
          const position = questionIndex % questions.length
          return <span key={item.id} className={index < position ? 'done' : index === position ? 'current' : ''}></span>
        })}
      </div>
      <fieldset className="pw-question">
        <legend><h3>{question.prompt}</h3></legend>
        <div className="pw-options">
          {question.options.map((option, index) => {
            const state = !checked ? '' : index === question.correctOption ? 'correct' : selectedOption === index ? 'missed' : ''
            return (
              <label key={option} className={state}>
                <input type="radio" name="quick-check-answer" checked={selectedOption === index} disabled={checked || saving} onChange={() => setSelectedOption(index)} />
                <span className="pw-option-text">{option}</span>
                {state === 'correct' && <span className="pw-option-tag">Correct answer</span>}
                {state === 'missed' && <span className="pw-option-tag">Your answer</span>}
              </label>
            )
          })}
        </div>
      </fieldset>
      {!checked && <div className="pw-actions"><Button disabled={selectedOption === null || saving} onClick={checkAnswer}>Check answer</Button></div>}
      <div className="pw-feedback-region" aria-live="polite">
        {checked && (
          <div className={`pw-feedback ${selectedOption === question.correctOption ? 'is-correct' : 'is-retry'}`}>
            <strong><Icon name={selectedOption === question.correctOption ? 'check' : 'retry'} size="compact" />{selectedOption === question.correctOption ? 'Correct' : 'Not quite'}</strong>
            <p>{question.explanation}</p>
            {attempts > 1 && <p className="pw-feedback-note">Your first answer to this question is the one that was recorded.</p>}
          </div>
        )}
      </div>
      {checked && (
        <div className="pw-actions">
          {selectedOption === question.correctOption
            ? <Button onClick={nextQuestion}>Next question <Icon name="arrow-right" size="compact" /></Button>
            : <>
                <Button onClick={retryQuestion}>Try again <Icon name="arrow-right" size="compact" /></Button>
                <Button variant="tertiary" onClick={nextQuestion}>Next question</Button>
              </>}
        </div>
      )}
    </div>
  ) : null

  const practiceSide = (
    <aside className="pw-side" aria-label="About this practice">
      {whyThisActivity && (
        <section className="pw-why">
          <h3>Why this activity</h3>
          <p>{whyThisActivity}</p>
        </section>
      )}
      <section className="pw-session">
        <h3>This session</h3>
        <dl>
          <div><dt>Correct so far</dt><dd>{sessionLabel}</dd></div>
          <div><dt>Time</dt><dd>{elapsedLabel(sessionStart, now)}</dd></div>
        </dl>
      </section>
    </aside>
  )

  const otherWays = otherModes.length > 0 && (
    <section className="pw-other" aria-labelledby="practice-other-heading">
      <h2 id="practice-other-heading">Other ways to practise {topic?.shortTitle ?? 'this topic'}</h2>
      <div className="pw-other-grid">
        {otherModes.map((item) => (
          <button key={item} type="button" className="pw-other-card" onClick={() => changeMode(item)}>
            <strong>{modeLabels[item]}</strong>
            <span>{modeSummary[item]}</span>
          </button>
        ))}
      </div>
    </section>
  )

  // A single activity needs no chooser: a one-tab bar reads as navigation that goes nowhere.
  const tabs = availableModes.length > 1 ? (
    <SegmentedControl className="mode-tabs scroll-hint" role="tablist" label={`${copy.title} activities`}>
      {availableModes.map((item) => (
        <Button
          key={item}
          variant={effectiveMode === item ? 'secondary' : 'tertiary'}
          size="compact"
          className={effectiveMode === item ? 'active' : ''}
          onClick={() => changeMode(item)}
          role="tab"
          aria-selected={effectiveMode === item}
        >
          {modeLabels[item]}
        </Button>
      ))}
    </SegmentedControl>
  ) : null

  const emptyActivity = isPractice && practiceModes.length === 0 && (
    <div className="pw-empty"><strong>Nothing to practise here yet</strong><p>No practice activities are published for {topic?.shortTitle ?? 'this topic'} yet. Try another topic.</p></div>
  )

  return (
    <section
      className={`learning-workspace focused-workspace focused-${section}${isPractice ? ' practice-workspace' : ''}`}
      aria-labelledby={`focused-${section}-heading`}
    >
      {isPractice ? practiceContext : <>{workspaceHeading}{tabs}</>}
      {emptyActivity}

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
          <div className="practice-meta">Card {(cardIndex % cards.length) + 1} of {cards.length}</div>
          <h3>{card.prompt}</h3>
          {!showAnswer ? (
            <Button className="primary" onClick={() => setShowAnswer(true)}>Show answer</Button>
          ) : (
            <>
              <div className="answer-panel"><strong>Answer</strong><p>{card.answer}</p></div>
              <p className="rating-prompt">How well did you know it?</p>
              <div className="rating-actions">
                <Button variant="secondary" disabled={saving} onClick={() => rateFlashcard(0)}>Not yet</Button>
                <Button variant="secondary" disabled={saving} onClick={() => rateFlashcard(1)}>Nearly</Button>
                <Button variant="secondary" disabled={saving} onClick={() => rateFlashcard(2)}>Knew it</Button>
              </div>
            </>
          )}
        </div>
      )}

      {effectiveMode === 'quick-check' && quickCheckTask}

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
              <TextAreaField groupClassName="answer-label" label="Draft your answer" rows={9} value={caseDraft} onChange={(event) => setCaseDraft(event.target.value)} placeholder="Use the case evidence and build a clear chain of reasoning." />
              {!showCaseGuidance ? (
                <Button className="primary" disabled={!caseDraft.trim()} onClick={() => setShowCaseGuidance(true)}>Compare with guidance</Button>
              ) : (
                <>
                  <div className="answer-panel"><strong>What a strong answer should do</strong><p>{caseQuestion.guidance}</p></div>
                  <div className="next-step"><strong>What should I improve?</strong><span>Compare your answer with the guidance. Look for missing case evidence, weak chains of reasoning, or a judgement that is not conditional enough.</span></div>
                  <Button className="primary" onClick={nextCaseQuestion}>Next case question</Button>
                </>
              )}
            </article>
          </div>
        </div>
      )}

      {effectiveMode === 'exam-question' && includeExamQuestions && exam && examQuestion && (
        <div className="learn-panel">
          <div className="activity-kind scored"><strong>Scored exam evidence — self-assessed</strong><span>Write the answer first, then use the marking guidance to award your own AO marks. Self-marked evidence contributes to readiness but cannot produce high confidence on its own.</span></div>
          <div className="exam-context" dangerouslySetInnerHTML={{ __html: exam.caseHtml }} />
          <article className="written-practice exam-practice">
            <div className="practice-meta">{exam.title} · Question {(examQuestionIndex % exam.questions.length) + 1} of {exam.questions.length} · {examQuestion.marks} marks · {adapter.getTopic(examQuestion.topic)?.shortTitle ?? examQuestion.topic}</div>
            <h3>{examQuestion.prompt}</h3>
            <TextAreaField groupClassName="answer-label" label="Write your answer" rows={12} value={examDraft} disabled={examRecorded} onChange={(event) => setExamDraft(event.target.value)} placeholder="Answer as you would in the exam. Use the case where relevant and show calculations." />
            <p className="muted small-note">Your written draft stays on this screen only. Revision saves the marks you record, not the text of this answer.</p>
            {!showMarkingGuidance ? (
              <Button className="primary" disabled={!examDraft.trim()} onClick={() => setShowMarkingGuidance(true)}>Show marking guidance</Button>
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
                  <Button className="primary" disabled={saving} onClick={recordExamQuestion}>Record this result</Button>
                ) : (
                  <>
                    <div className="result-explanation" aria-live="polite"><strong>Result recorded: {examTotalAwarded} / {examQuestion.marks}</strong><span>This is exam evidence, but because you marked it yourself Revision limits the confidence it can claim. Use the guidance above to identify what to improve next.</span></div>
                    <Button className="primary" onClick={nextExamQuestion}>Next exam question</Button>
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
                {showFormula ? <div className="answer-panel"><strong>Formula</strong><p>{formula.expression}</p></div> : <Button variant="secondary" className="secondary" onClick={() => setShowFormula(true)}>Reveal formula</Button>}
                {showFormula && <Button className="primary" onClick={nextFormula}>Next formula</Button>}
              </article>
            )}
            {drill && (
              <article className="practice-box">
                <div className="practice-meta">Data drill {(drillIndex % drills.length) + 1} of {drills.length}</div>
                <h3>{drill.title}</h3>
                <p>{drill.prompt}</p>
                {showDrillAnswer ? <div className="answer-panel"><strong>Model answer</strong><p>{drill.answer}</p></div> : <Button variant="secondary" className="secondary" onClick={() => setShowDrillAnswer(true)}>Show model answer</Button>}
                {showDrillAnswer && <Button className="primary" onClick={nextDrill}>Next data drill</Button>}
              </article>
            )}
          </div>
          <div className="next-step"><strong>What should I do next?</strong><span>{includeExamQuestions ? 'Use Quick check for application evidence or Exam question for stronger written exam evidence.' : 'Use Quick check for application evidence, then move to Exam Prep for paper-specific written practice.'}</span></div>
        </div>
      )}

      {effectiveMode === 'answer' && (
        <div className="learn-panel">
          <div className="activity-kind"><strong>Exam technique</strong><span>Learn how to turn knowledge into marks before you attempt longer written questions. Reading this guidance does not count as scored evidence.</span></div>
          <h3>{contextLabel ? `${contextLabel} exam-answer blueprints` : `Paper ${adapter.manifest.paper.number} answer blueprints`}</h3>
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
          <div className="next-step"><strong>What should I do next?</strong><span>Choose the relevant paper below when you want to test this technique under realistic conditions.</span></div>
        </div>
      )}

      {saveError && <p className="error" role="alert">{saveError}</p>}
      {saving && <p className="muted" aria-live="polite">Saving your activity…</p>}
      {isPractice && practiceModes.length > 0 && practiceSide}
      {isPractice && otherWays}
    </section>
  )
}
