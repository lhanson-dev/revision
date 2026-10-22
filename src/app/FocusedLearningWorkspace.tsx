import { useEffect, useMemo, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createPracticeCheckpoint, discardPracticeCheckpoint, fingerprintPracticeContent,
  loadPracticeCheckpoint, removePracticeCheckpoint, supabasePracticeCheckpointStore, updatePracticeCheckpoint,
  type PracticeCheckpoint, type PracticeCheckpointKey, type PracticeCheckpointSnapshot,
} from '../services/progress/practice-checkpoint-service'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import { fastPathFlashcards } from '../../content/business/aqa-a-level/shared/fast-path-flashcards'
import type { AnswerConfidence, LearningEvidence } from '../engine/evidence/evidence'
import type { RevisionRecommendation } from '../engine/readiness/readiness'
import { createCalculationEvidence, createFlashcardEvidence, createMultipleChoiceEvidence, createRevMarkedExamQuestionEvidence, createSelfAssessedExamQuestionEvidence } from './practice-evidence'
import { MarkingError, resolveChallenge, verifyMarking, type MarkedAnswer, type WrittenAnswerMarker } from './rev-marking'
import { calculationUnitLabel, checkCalculation, parseAnswer } from './practice-calculation'
import { summariseSession, type SummaryLearnPage } from './practice-summary'
import { specItemLabel } from './spec-item-labels'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import {
  advanceQuestionSession,
  isSessionFinished,
  levelNote,
  recordSessionAnswer,
  reviseLastAnswer,
  startQuestionSession,
  statusDirection,
  type QuestionSession,
} from './practice-session'
import { availableTypes as questionTypesIn, buildQuestionPool, filterByTypes, orderByFreshness, type PracticeQuestion } from './practice-questions'
import {
  PRACTICE_LENGTHS,
  lastPractisedLabel,
  sessionQuestionCount,
  toggleQuestionType,
  usableQuestionTypes,
  type PracticeLength,
  type PracticeQuestionType,
} from './practice-start'
import {
  FLASHCARD_DECK_SIZE,
  isDeckDone,
  rateCurrentCard,
  ratingsAfterDeck,
  startDeck,
  tallyDeck,
  type DeckSession,
  type FlashRating,
} from './practice-flashcards'
import { resolveSubjectIdentity } from './subject-palette'
import type { TopicProgress } from './topic-status'
import {
  Button,
  FeedbackBar,
  Icon,
  PracticeBarTitle,
  PracticeCalculationView,
  PracticeActivityWorkspace,
  PracticeFlashcardDone,
  PracticeFlashcardView,
  PracticeProgressBar,
  PracticeQuestionView,
  PracticeWrittenQuestion,
  PracticeStart,
  PracticeSummary,
  readMinutes,
  SegmentedControl,
  SelectField,
  TextAreaField,
  WarmupChip,
  accentStyle,
  type LearningStatus,
  type PracticeWarmupRow,
  type WrittenChallengeView,
  type WrittenPhase,
} from './ui'

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
  checkpointContext?: { client: SupabaseClient; userId: string; courseId: string }
  contextLabel?: string
  includeExamQuestions?: boolean
  /** Practice only: open this topic first (for example when arriving from a Learn page). */
  preferredTopicId?: string | null
  /** Practice only: each topic's status and when it was last practised, from the student's saved evidence. */
  topicProgress?: Record<string, TopicProgress>
  /** Practice only: when each question (by content id) was last answered, so a new session starts with the ones not seen lately. */
  lastAnsweredAt?: Record<string, string>
  /**
   * Practice only: what marks written answers (REV). Until one is connected, written questions are not offered, so no
   * student sees pretend marking.
   */
  marker?: WrittenAnswerMarker | null
  /** Practice only: the student's latest rating (0 No, 1 Partly, 2 Yes) for each flashcard, so a deck starts with the ones they were not sure of. */
  flashcardRatings?: Record<string, FlashRating>
  /** Practice only: opens a Learn page (the summary's "Read: …" links). Without it the links are left out. */
  onOpenLearnPage?: (pageId: string) => void
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
  checkpointContext,
  contextLabel,
  includeExamQuestions = true,
  preferredTopicId,
  topicProgress,
  lastAnsweredAt,
  marker = null,
  flashcardRatings,
  onOpenLearnPage,
}: FocusedLearningWorkspaceProps) {
  const topics = adapter.listTopics()
  const isPractice = section === 'practice'
  // This browser-only hint contains a topic ID, not learner answers or progress.
  // Always verify the actual checkpoint against the authenticated backend on resume.
  const checkpointTopicHintKey = checkpointContext && isPractice
    ? ['revision:practice-resume-topic:v1', checkpointContext.userId, checkpointContext.courseId, adapter.manifest.id].join(':')
    : null
  const [topicId, setTopicId] = useState(() => {
    if (isPractice && preferredTopicId && adapter.getTopic(preferredTopicId)) return preferredTopicId
    if (checkpointTopicHintKey) {
      try {
        const previousTopic = window.localStorage.getItem(checkpointTopicHintKey)
        if (previousTopic && adapter.getTopic(previousTopic)) return previousTopic
      } catch { /* Storage restrictions must not prevent a normal Practice launch. */ }
    }
    if (isPractice && recommendation && adapter.getTopic(recommendation.topicId)) return recommendation.topicId
    return topics[0]?.id ?? ''
  })
  const [mode, setMode] = useState<WorkspaceMode | null>(null)
  // In-page focused Practice activity and the choices on the start screen.
  const [openActivity, setOpenActivity] = useState<WorkspaceMode | null>(null)
  const activityLaunchLabel = useRef<string | null>(null)
  useEffect(() => {
    if (openActivity || !activityLaunchLabel.current) return
    // Setup is remounted when leaving the focused activity. The old DOM button
    // is detached, so restore focus to the corresponding new launch control.
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.practice-start button'))
    // Start becomes unavailable while its checkpoint is open. Restore focus to
    // Carry on (the accessible continuation), never a disabled button.
    const preferred = buttons.find((button) => button.textContent?.trim() === activityLaunchLabel.current)
    const target = preferred && !preferred.disabled ? preferred
      : buttons.find((button) => button.textContent?.trim() === 'Carry on')
    target?.focus()
    activityLaunchLabel.current = null
  }, [openActivity])
  const [length, setLength] = useState<PracticeLength>(PRACTICE_LENGTHS[0])
  const [selectedTypes, setSelectedTypes] = useState<PracticeQuestionType[]>(['multiple-choice'])
  // The scored session in progress. Leaving the activity keeps it (every answer is already saved as evidence),
  // and the start screen then offers "Carry on".
  const [session, setSession] = useState<QuestionSession | null>(null)
  const checkpointClient = checkpointContext?.client
  const checkpointStore = useMemo(() => checkpointClient ? supabasePracticeCheckpointStore(checkpointClient) : null, [checkpointClient])
  const [checkpoint, setCheckpoint] = useState<PracticeCheckpoint | null>(null)
  const [checkpointPhase, setCheckpointPhase] = useState<'loading' | 'ready' | 'blocked'>(checkpointContext && isPractice ? 'loading' : 'ready')
  const [checkpointBusy, setCheckpointBusy] = useState(false)
  const [checkpointIssue, setCheckpointIssue] = useState('')
  const checkpointLock = useRef(false)
  const [statusSeen, setStatusSeen] = useState<{ topicId: string; status: LearningStatus | undefined } | null>(null)
  const [statusMove, setStatusMove] = useState<'up' | 'down' | null>(null)
  // The topic's status when the session started, and the finished session the summary is built from.
  const [sessionStartStatus, setSessionStartStatus] = useState<LearningStatus | undefined>(undefined)
  const [summary, setSummary] = useState<{ session: QuestionSession; startStatus: LearningStatus | undefined } | null>(null)
  const [nextDismissed, setNextDismissed] = useState(false)
  const answering = useRef(false)
  // A written answer: the draft, where marking has got to, what REV gave, and the one challenge a student may make.
  const [writtenDraft, setWrittenDraft] = useState('')
  const [writtenPhase, setWrittenPhase] = useState<WrittenPhase>('writing')
  const [writtenMarked, setWrittenMarked] = useState<MarkedAnswer | null>(null)
  const [writtenEvidenceId, setWrittenEvidenceId] = useState<string | null>(null)
  const [markingError, setMarkingError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<WrittenChallengeView>({ state: 'closed', text: '', reply: null, error: null })
  // Flashcards: the deck in progress, whether the card is turned over, and ratings given since the page opened.
  const [deck, setDeck] = useState<DeckSession | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [flashRatings, setFlashRatings] = useState<Record<string, FlashRating>>({})
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  /** Set once the answer is checked: what was picked and how sure the student said they were. */
  const [checked, setChecked] = useState<{ selected: number; confidence: AnswerConfidence } | null>(null)
  /** A calculation: what was typed, and once checked, the result and how sure the student said they were. */
  const [calcDraft, setCalcDraft] = useState('')
  const [calcError, setCalcError] = useState<string | null>(null)
  const [calcChecked, setCalcChecked] = useState<{ typed: string; right: boolean; confidence: AnswerConfidence } | null>(null)
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
  const copy = sectionHeading(section, adapter.manifest.paper.number, contextLabel)
  const topic = adapter.getTopic(topicId)
  const cards = useMemo(() => {
    const curated = adapter.listFlashcards(topicId)
    if (adapter.manifest.examBoard.id !== 'aqa' || adapter.manifest.specificationCode !== '7132') return curated
    return [...curated, ...fastPathFlashcards.filter((card) => card.topic === topicId)]
  }, [adapter, topicId])
  const questions = useMemo(() => adapter.listQuestions(topicId), [adapter, topicId])
  const links = useMemo(() => adapter.listTopicLinks(topicId), [adapter, topicId])
  const formulas = adapter.listFormulas()
  const drills = adapter.listDataDrills()
  const examTechnique = adapter.listExamTechnique()
  const caseStudy = adapter.listCaseStudies()[0]
  const exam = adapter.listExams()[0]
  const knownRatings = { ...flashcardRatings, ...flashRatings }
  const deckCard = deck && !isDeckDone(deck) ? cards.find((item) => item.id === deck.ids[deck.index]) : undefined
  const aqaBank = adapter.manifest.examBoard.id === 'aqa' && adapter.manifest.specificationCode === '7132' ? aqaBusinessQuestionBank : null
  const fullPool = useMemo(
    () => orderByFreshness(buildQuestionPool({ topicId, topicOrder: adapter.getTopic(topicId)?.order ?? null, coursePack: questions, bank: aqaBank, includeWritten: marker !== null }), lastAnsweredAt),
    [adapter, topicId, questions, aqaBank, lastAnsweredAt, marker],
  )
  useEffect(() => {
    if (!isPractice || !checkpointContext || !checkpointStore) return
    let mounted = true
    const key = { userId: checkpointContext.userId, courseId: checkpointContext.courseId, moduleId: adapter.manifest.id, topicId }
    void (async () => {
      try {
        const hash = await fingerprintPracticeContent(fullPool)
        const saved = await loadPracticeCheckpoint(checkpointStore, key, hash)
        if (!mounted) return
        setCheckpoint(saved)
        setSession(saved?.snapshot.session ?? null)
        if (saved && !saved.snapshot.pending) restoreFeedback(saved.snapshot.session)
        setCheckpointPhase('ready')
      } catch (error) {
        if (!mounted) return
        setCheckpointIssue(error instanceof Error ? error.message : 'Could not verify saved Practice work.')
        setCheckpointPhase('blocked')
      }
    })()
    return () => { mounted = false }
    // Evidence updates re-order questions but do not change the authored question fingerprint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPractice, checkpointContext?.client, checkpointContext?.userId, checkpointContext?.courseId, checkpointStore, adapter.manifest.id, topicId])
  const question = session?.currentId ? fullPool.find((item) => item.id === session.currentId) : undefined
  const isRetry = session?.currentIsRetry ?? false
  const freshAnswered = session ? session.answers.filter((answer) => !answer.retry).length : 0
  const answeredNow = question?.type === 'written' ? writtenPhase === 'marked' : question?.type === 'calculation' ? Boolean(calcChecked) : Boolean(checked)
  const upcoming = session && answeredNow ? advanceQuestionSession(session, fullPool) : null
  const formula = formulas[formulaIndex % Math.max(formulas.length, 1)]
  const drill = drills[drillIndex % Math.max(drills.length, 1)]
  const caseQuestion = caseStudy?.questions[caseQuestionIndex % Math.max(caseStudy.questions.length, 1)]
  const examQuestion = exam?.questions[examQuestionIndex % Math.max(exam.questions.length, 1)]
  const examTotalAwarded = (Object.keys(aoMarks) as AoKey[]).reduce((sum, key) => sum + aoMarks[key], 0)

  const effectiveMode = mode && availableModes.includes(mode) ? mode : defaultMode(section)

  // Practice: only the activities that have content are offered, and every number on the start screen is real.
  const availableTypes: PracticeQuestionType[] = questionTypesIn(fullPool)
  const chosenTypes = usableQuestionTypes(selectedTypes, availableTypes)
  const typedPool = filterByTypes(fullPool, chosenTypes)
  const availableQuestions = typedPool.length
  const startCount = sessionQuestionCount(length, availableQuestions)
  const warmups: PracticeWarmupRow[] = [
    ...(cards.length > 0 ? [{ id: 'flashcards', name: 'Flashcards', meta: `${Math.min(cards.length, FLASHCARD_DECK_SIZE)} ${Math.min(cards.length, FLASHCARD_DECK_SIZE) === 1 ? 'card' : 'cards'}${cards.length > FLASHCARD_DECK_SIZE ? ` · ${cards.length} on this topic` : ''}` }] : []),
    ...(formulas.length > 0 || drills.length > 0 ? [{ id: 'formulas-data', name: 'Formulas', meta: `${formulas.length} ${formulas.length === 1 ? 'formula' : 'formulas'} · ${drills.length} data ${drills.length === 1 ? 'drill' : 'drills'}` }] : []),
    ...(caseStudy ? [{ id: 'case-study', name: 'Case study', meta: `${caseStudy.questions.length} written ${caseStudy.questions.length === 1 ? 'question' : 'questions'}` }] : []),
  ]
  const extraScored: PracticeWarmupRow[] = includeExamQuestions && exam
    ? [{ id: 'exam-question', name: 'Exam question', meta: `${exam.questions.length} self-marked ${exam.questions.length === 1 ? 'question' : 'questions'}` }]
    : []
  const progress = topic ? topicProgress?.[topic.id] : undefined
  const liveStatus = progress?.status
  if (statusSeen === null || statusSeen.topicId !== topicId) {
    // A new topic: remember where it starts, without calling it a move.
    setStatusSeen({ topicId, status: liveStatus })
  } else if (statusSeen.status !== liveStatus) {
    setStatusSeen({ topicId, status: liveStatus })
    const direction = statusDirection(statusSeen.status, liveStatus)
    if (direction) setStatusMove(direction)
  }
  const revReason = recommendation && recommendation.topicId === topicId ? recommendation.reason : null
  const subjectIdentity = resolveSubjectIdentity(adapter.manifest.subject.id, adapter.manifest.subject.name)

  /** Clears the answer state of the question on screen: the written answer and the calculation box. */
  function resetWritten() {
    setCalcDraft('')
    setCalcChecked(null)
    setCalcError(null)
    setWrittenDraft('')
    setWrittenPhase('writing')
    setWrittenMarked(null)
    setWrittenEvidenceId(null)
    setMarkingError(null)
    setChallenge({ state: 'closed', text: '', reply: null, error: null })
  }

  function changeTopic(nextTopic: string) {
    if (checkpointLock.current) return
    setCheckpoint(null)
    setCheckpointPhase(checkpointContext && isPractice ? 'loading' : 'ready')
    setCheckpointIssue('')
    setTopicId(nextTopic)
    setDeck(null)
    setFlipped(false)
    setSelectedOption(null)
    setChecked(null)
    setSession(null)
    setSummary(null)
    setStatusMove(null)
    resetWritten()
    setOpenActivity(null)
  }

  /** Start the focused in-page activity, remembering the trigger for keyboard focus return. */
  function beginActivity(activity: WorkspaceMode) {
    if (!openActivity && !activityLaunchLabel.current && document.activeElement instanceof HTMLElement) activityLaunchLabel.current = document.activeElement.textContent?.trim() ?? null
    setOpenActivity(activity)
  }

  function checkpointKey(): PracticeCheckpointKey | null {
    return checkpointContext ? { userId: checkpointContext.userId, courseId: checkpointContext.courseId, moduleId: adapter.manifest.id, topicId } : null
  }
  function restoreFeedback(value: QuestionSession) {
    const last = value.answers.at(-1)
    setSelectedOption(null)
    setChecked(null)
    setCalcDraft('')
    setCalcChecked(null)
    if (!last || last.questionId !== value.currentId) return
    if (last.selectedOption !== null && last.confidence) {
      setSelectedOption(last.selectedOption)
      setChecked({ selected: last.selectedOption, confidence: last.confidence })
    } else if (last.typedAnswer !== null && last.confidence) {
      setCalcDraft(last.typedAnswer)
      setCalcChecked({ typed: last.typedAnswer, right: last.correct, confidence: last.confidence })
    }
  }
  async function reloadCheckpoint() {
    const key = checkpointKey()
    if (!key || !checkpointStore || checkpointLock.current) return
    checkpointLock.current = true
    setCheckpointBusy(true)
    try {
      const hash = await fingerprintPracticeContent(fullPool)
      const saved = await loadPracticeCheckpoint(checkpointStore, key, hash)
      setCheckpoint(saved)
      setSession(saved?.snapshot.session ?? null)
      if (saved && !saved.snapshot.pending) restoreFeedback(saved.snapshot.session)
      setCheckpointPhase('ready')
      setCheckpointIssue('')
    } catch (error) {
      setCheckpointIssue(error instanceof Error ? error.message : 'Could not verify your Practice session.')
      setCheckpointPhase('blocked')
    } finally {
      checkpointLock.current = false
      setCheckpointBusy(false)
    }
  }
  async function discardCheckpoint() {
    const key = checkpointKey()
    if (!key || !checkpointStore || checkpointLock.current) return
    checkpointLock.current = true
    setCheckpointBusy(true)
    try {
      if (checkpoint) await removePracticeCheckpoint(checkpointStore, checkpoint)
      else await discardPracticeCheckpoint(checkpointStore, key)
      setCheckpoint(null)
      setSession(null)
      if (checkpointTopicHintKey) {
        try { window.localStorage.removeItem(checkpointTopicHintKey) } catch { /* discard remains verified */ }
      }
      restoreFeedback(startQuestionSession([], 0))
      setCheckpointIssue('')
      setCheckpointPhase('ready')
      setOpenActivity(null)
    } catch (error) {
      setCheckpointIssue(error instanceof Error ? error.message : 'Could not discard this session.')
    } finally {
      checkpointLock.current = false
      setCheckpointBusy(false)
    }
  }
  async function resumeQuestions() {
    if (checkpointLock.current || checkpointPhase === 'loading') return
    if (!checkpointContext || !checkpointStore) { beginActivity('quick-check'); return }
    if (checkpointPhase === 'blocked') { await reloadCheckpoint(); return }
    if (!checkpoint?.snapshot.pending) { beginActivity('quick-check'); return }
    const pending = checkpoint.snapshot.pending
    checkpointLock.current = true
    setCheckpointBusy(true)
    try {
      await onRecordEvidence(pending.evidence)
      const confirmed = await updatePracticeCheckpoint(checkpointStore, checkpoint, {
        schemaVersion: 1, session: pending.nextSession, pending: null,
      })
      setCheckpoint(confirmed)
      setSession(pending.nextSession)
      restoreFeedback(pending.nextSession)
      setCheckpointIssue('')
      setCheckpointPhase('ready')
      beginActivity('quick-check')
    } catch (error) {
      setCheckpointIssue(error instanceof Error ? error.message : 'Could not confirm your previous answer.')
      setCheckpointPhase('blocked')
    } finally {
      checkpointLock.current = false
      setCheckpointBusy(false)
    }
  }
  /** The pending exact evidence ID is committed before attempting the scored write. */
  async function saveObjectiveAnswer(evidence: LearningEvidence, next: QuestionSession): Promise<boolean> {
    if (!checkpointContext || !checkpointStore) { await onRecordEvidence(evidence); setSession(next); return true }
    if (!checkpoint || checkpoint.snapshot.pending || checkpointLock.current) return false
    checkpointLock.current = true
    setCheckpointBusy(true)
    setCheckpointIssue('')
    try {
      const pending: PracticeCheckpointSnapshot = {
        schemaVersion: 1, session: checkpoint.snapshot.session, pending: { evidence, nextSession: next },
      }
      const staged = await updatePracticeCheckpoint(checkpointStore, checkpoint, pending)
      setCheckpoint(staged)
      await onRecordEvidence(evidence)
      const confirmed = await updatePracticeCheckpoint(checkpointStore, staged, { schemaVersion: 1, session: next, pending: null })
      setCheckpoint(confirmed)
      setSession(next)
      return true
    } catch (error) {
      setCheckpointIssue(error instanceof Error ? error.message : 'Could not confirm your answer. Retry saving before continuing.')
      setCheckpointPhase('blocked')
      return false
    } finally {
      checkpointLock.current = false
      setCheckpointBusy(false)
    }
  }

  /** Starts a fresh scored session: the chosen length (capped at what the topic has) and a clean retry queue. */
  async function startQuestions() {
    if (startCount === 0 || checkpointPhase !== 'ready' || checkpointLock.current) return
    // Remember the original control locally across the awaited database write.
    // Do not set the focus ref before the save: an intermediate React render
    // could otherwise clear it while the activity has not opened yet.
    const launchLabel = `Start ${startCount} ${startCount === 1 ? 'question' : 'questions'}`
    if (checkpointContext && checkpoint) {
      setCheckpointIssue('You have an unfinished Practice session. Carry on or discard it before starting another.')
      return
    }
    if (checkpointContext && typedPool.some(item => item.type === 'written')) {
      setCheckpointIssue('Written-answer recovery is not supported yet. Choose objective questions instead.')
      return
    }
    const next = startQuestionSession(typedPool, startCount)
    if (checkpointContext && checkpointStore) {
      const key = checkpointKey()
      if (!key) return
      checkpointLock.current = true
      setCheckpointBusy(true)
      try {
        const hash = await fingerprintPracticeContent(fullPool)
        const saved = await createPracticeCheckpoint(checkpointStore, key, hash, crypto.randomUUID(), {
          schemaVersion: 1, session: next, pending: null,
        })
        setCheckpoint(saved)
        // The recommendation engine may change topics as soon as evidence is
        // recorded. Return to this exact unfinished session after page reload.
        if (checkpointTopicHintKey) {
          try { window.localStorage.setItem(checkpointTopicHintKey, topicId) } catch { /* checkpoint remains in Supabase */ }
        }
      } catch (error) {
        setCheckpointIssue(error instanceof Error ? error.message : 'Could not save your Practice session.')
        setCheckpointPhase('blocked')
        return
      } finally {
        checkpointLock.current = false
        setCheckpointBusy(false)
      }
    }
    setSession(next)
    setCheckpointIssue('')
    setSummary(null)
    setNextDismissed(false)
    setSessionStartStatus(progress?.status)
    setSelectedOption(null)
    setChecked(null)
    resetWritten()
    setStatusMove(null)
    activityLaunchLabel.current = launchLabel
    beginActivity('quick-check')
  }

  /** Returning to setup never discards saved evidence or the resumable session. */
  function closeActivity() {
    if (!checkpointLock.current) setOpenActivity(null)
  }

  /** "See how you did": the focused activity ends on an in-page summary. */
  async function showSummary() {
    if (!session || checkpointLock.current) return
    if (checkpoint && checkpointStore) {
      checkpointLock.current = true
      setCheckpointBusy(true)
      try {
        await removePracticeCheckpoint(checkpointStore, checkpoint)
        setCheckpoint(null)
        if (checkpointTopicHintKey) {
          try { window.localStorage.removeItem(checkpointTopicHintKey) } catch { /* backend deletion is authoritative */ }
        }
      } catch (error) {
        setCheckpointIssue(error instanceof Error ? error.message : 'Could not confirm that this session finished.')
        return
      } finally {
        checkpointLock.current = false
        setCheckpointBusy(false)
      }
    }
    setSummary({ session, startStatus: sessionStartStatus })
    setNextDismissed(false)
    activityLaunchLabel.current = null
    setSession(null)
    setSelectedOption(null)
    setChecked(null)
    resetWritten()
    setOpenActivity(null)
  }

  /** The action after an answer: the next question, or the summary after the last. */
  async function goNext() {
    if (!session || checkpointLock.current) return
    const next = advanceQuestionSession(session, fullPool)
    if (isSessionFinished(next)) await showSummary()
    else await nextQuestion(next)
  }

  function practiseAgain() {
    setSummary(null)
    startQuestions()
  }

  function changeMode(nextMode: WorkspaceMode) {
    if (availableModes.includes(nextMode)) setMode(nextMode)
  }

  /** A deck is a round of cards, ordered with the No and Partly cards first. */
  function openFlashcards() {
    setDeck(startDeck(cards, knownRatings))
    setFlipped(false)
    beginActivity('flashcards')
  }

  async function rateFlashcard(rating: FlashRating) {
    if (!deck || !deckCard || answering.current) return
    answering.current = true
    const evidence = createFlashcardEvidence({
      id: evidenceId('flashcard'),
      moduleId: adapter.manifest.id,
      topicId: deckCard.topic,
      contentId: deckCard.id,
      rating,
    })
    try {
      await onRecordEvidence(evidence)
    } catch {
      return
    } finally {
      answering.current = false
    }
    setFlashRatings((current) => ({ ...current, [deckCard.id]: rating }))
    setDeck(rateCurrentCard(deck, rating))
    setFlipped(false)
  }

  /** Choosing how sure you are checks the answer. Every answer, including a second go, is saved as evidence. */
  async function checkAnswer(confidence: AnswerConfidence) {
    if (question?.type !== 'multiple-choice' || !session || selectedOption === null || checked || answering.current) return
    answering.current = true
    const evidence = createMultipleChoiceEvidence({
      id: evidenceId('mcq'),
      moduleId: adapter.manifest.id,
      topicId: question.topicId,
      contentId: question.id,
      selectedOption,
      correctOption: question.correctOption,
      confidence,
    })
    setStatusMove(null)
    const next = recordSessionAnswer(session, {
      questionId: question.id, correct: selectedOption === question.correctOption,
      confidence, selectedOption, level: question.level,
    })
    try {
      if (!await saveObjectiveAnswer(evidence, next)) return
    } catch {
      return
    } finally {
      answering.current = false
    }
    setChecked({ selected: selectedOption, confidence })
  }

  /** Choosing how sure you are checks the typed number against the mark scheme (software only) and saves it as evidence. */
  async function checkCalculationAnswer(confidence: AnswerConfidence) {
    if (question?.type !== 'calculation' || !session || calcChecked || answering.current) return
    const result = checkCalculation(calcDraft, question.accepted, question.unit)
    if (result.status === 'unreadable' || result.entered === null) {
      setCalcError('I couldn’t read a number there. Type just the number, like 24.2 or £15,150.')
      return
    }
    answering.current = true
    setCalcError(null)
    const right = result.status === 'right'
    const evidence = createCalculationEvidence({
      id: evidenceId('calc'),
      moduleId: adapter.manifest.id,
      topicId: question.topicId,
      contentId: question.id,
      correct: right,
      enteredValue: result.entered,
      expectedValue: question.expected,
      unit: question.unit,
      confidence,
    })
    setStatusMove(null)
    const next = recordSessionAnswer(session, { questionId: question.id, correct: right, confidence, typedAnswer: calcDraft.trim(), level: question.level })
    try {
      if (!await saveObjectiveAnswer(evidence, next)) return
    } catch {
      return
    } finally {
      answering.current = false
    }
    setCalcChecked({ typed: calcDraft.trim(), right, confidence })
  }

  /** REV marks the written answer. The marker's output is checked against the mark scheme before anything is shown or saved. */
  async function markWritten() {
    if (question?.type !== 'written' || !marker || !session || writtenPhase !== 'writing' || !writtenDraft.trim() || answering.current) return
    answering.current = true
    setMarkingError(null)
    setWrittenPhase('marking')
    try {
      const output = await marker.mark({ questionId: question.id, prompt: question.prompt, context: question.context, points: question.points, answer: writtenDraft })
      const result = verifyMarking(question.points, writtenDraft, output)
      const evidence = createRevMarkedExamQuestionEvidence({
        id: evidenceId('written'),
        moduleId: adapter.manifest.id,
        topicId: question.topicId,
        contentId: question.id,
        marksAwarded: result.got,
        marksAvailable: result.available,
        aoTags: question.aoTags,
        pointsGiven: result.given,
        modelVersion: result.modelVersion,
      })
      setStatusMove(null)
      try {
        await onRecordEvidence(evidence)
      } catch {
        setWrittenPhase('writing')
        setMarkingError('REV marked it, but I couldn’t save the result. Your answer is still here, so try again.')
        return
      }
      setWrittenMarked(result)
      setWrittenEvidenceId(evidence.id)
      setSession(recordSessionAnswer(session, {
        questionId: question.id,
        correct: result.got === result.available,
        level: question.level,
        marks: { got: result.got, available: result.available },
        pointsGiven: result.given,
      }))
      setWrittenPhase('marked')
    } catch (error) {
      setWrittenPhase('writing')
      setMarkingError(error instanceof MarkingError
        ? 'REV’s marking didn’t come back in a form I can trust, so I haven’t used it. Your answer is still here, so try again.'
        : 'REV couldn’t mark this just now. Your answer is still here, so try again.')
    } finally {
      answering.current = false
    }
  }

  /** The student challenges a mark. REV re-checks (same checks as the first marking) and replies; the result replaces the earlier row. */
  async function sendChallenge() {
    if (question?.type !== 'written' || !marker || !session || !writtenMarked || !writtenEvidenceId || answering.current) return
    const text = challenge.text.trim()
    if (!text) return
    answering.current = true
    setChallenge((current) => ({ ...current, state: 'sending', error: null }))
    try {
      const output = await marker.challenge({ questionId: question.id, prompt: question.prompt, context: question.context, points: question.points, answer: writtenDraft, previous: writtenMarked, challenge: text })
      const resolved = resolveChallenge(question.points, writtenDraft, writtenMarked, output)
      const evidence = createRevMarkedExamQuestionEvidence({
        id: evidenceId('written'),
        moduleId: adapter.manifest.id,
        topicId: question.topicId,
        contentId: question.id,
        marksAwarded: resolved.marked.got,
        marksAvailable: resolved.marked.available,
        aoTags: question.aoTags,
        pointsGiven: resolved.marked.given,
        modelVersion: resolved.marked.modelVersion,
        supersedes: writtenEvidenceId,
        challenge: { text, outcome: resolved.outcome, modelVersion: resolved.modelVersion },
      })
      await onRecordEvidence(evidence)
      setWrittenMarked(resolved.marked)
      setWrittenEvidenceId(evidence.id)
      setSession(reviseLastAnswer(session, { correct: resolved.marked.got === resolved.marked.available, marks: { got: resolved.marked.got, available: resolved.marked.available }, pointsGiven: resolved.marked.given }))
      setChallenge({ state: 'replied', text, reply: resolved.reply, error: null })
    } catch {
      setChallenge((current) => ({ ...current, state: 'open', error: 'REV couldn’t check that just now. Your challenge is still here, so try again.' }))
    } finally {
      answering.current = false
    }
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

  async function nextQuestion(next: QuestionSession) {
    if (!session || checkpointLock.current) return
    if (checkpoint && checkpointStore) {
      checkpointLock.current = true
      setCheckpointBusy(true)
      try {
        const updated = await updatePracticeCheckpoint(checkpointStore, checkpoint, { schemaVersion: 1, session: next, pending: null })
        setCheckpoint(updated)
      } catch (error) {
        setCheckpointIssue(error instanceof Error ? error.message : 'Could not save the next question. Retry.')
        return
      } finally {
        checkpointLock.current = false
        setCheckpointBusy(false)
      }
    }
    setSession(next)
    setSelectedOption(null)
    setChecked(null)
    resetWritten()
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

  if (isPractice) {
    const topicShort = topic?.shortTitle ?? 'this topic'
    const sessionAnswersLabel = `${freshAnswered} of ${session?.total ?? 0} answered`
    const openLabels: Partial<Record<WorkspaceMode, string>> = {
      'quick-check': 'Questions',
      flashcards: 'Warm-up · Flashcards',
      'formulas-data': 'Warm-up · Formulas',
      'case-study': 'Warm-up · Case study',
      'exam-question': 'Exam question',
    }
    const learnPageFor = (item: PracticeQuestion): SummaryLearnPage | null => {
      if (!onOpenLearnPage) return null
      for (const nodeId of item.nodeIds) {
        const page = adapter.getLearnPage(nodeId)
        if (page) return { id: page.id, title: page.title, minutes: readMinutes(page) }
      }
      return null
    }
    const recommendedTopic = recommendation && recommendation.topicId !== topicId ? adapter.getTopic(recommendation.topicId) : undefined
    const summaryModel = summary
      ? summariseSession({
        session: summary.session,
        questions: fullPool,
        topicTitle: topic?.title ?? topicShort,
        topicOrder: aqaBank ? topic?.order ?? null : null,
        startStatus: summary.startStatus,
        endStatus: progress?.status,
        skillLabel: specItemLabel,
        learnPage: learnPageFor,
        nextTopic: recommendation && recommendedTopic ? { id: recommendedTopic.id, title: recommendedTopic.shortTitle, reason: recommendation.reason } : null,
      })
      : null
    const startNext = () => {
      if (!summaryModel) return
      if (summaryModel.next.kind === 'learn' && summaryModel.next.learnPageId) onOpenLearnPage?.(summaryModel.next.learnPageId)
      else if (summaryModel.next.kind === 'practice-topic' && summaryModel.next.topicId) changeTopic(summaryModel.next.topicId)
      else practiseAgain()
    }
    const hasAnyPractice = availableQuestions > 0 || warmups.length > 0 || extraScored.length > 0

    const optionState = (index: number) => {
      if (question?.type !== 'multiple-choice') return 'idle' as const
      if (checked) return index === question.correctOption ? 'correct' as const : checked.selected === index ? 'wrong' as const : 'idle' as const
      return selectedOption === index ? 'selected' as const : 'idle' as const
    }

    const questionBody = question?.type === 'written' && session ? (
      <PracticeWrittenQuestion
        eyebrow={`Question ${Math.min(session.askedIds.length, session.total)}`}
        level={question.level}
        marksLabel={`${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}`}
        sourceChip={question.source === 'aqa-bank' ? 'AQA-style practice' : null}
        levelNote={writtenPhase === 'writing' && session.answers.length > 0 ? levelNote(session.adaptive) : null}
        context={question.context}
        table={question.table}
        prompt={question.prompt}
        pointCount={question.points.length}
        answer={writtenDraft}
        onAnswerChange={setWrittenDraft}
        phase={writtenPhase}
        onMark={markWritten}
        markingError={markingError}
        result={writtenMarked ? { got: writtenMarked.got, available: writtenMarked.available, note: writtenMarked.note, points: question.points.map((point, index) => ({ descriptor: point.descriptor, given: writtenMarked.given[index] })) } : null}
        challenge={challenge}
        onChallengeOpen={() => setChallenge((current) => ({ ...current, state: 'open', error: null }))}
        onChallengeText={(text) => setChallenge((current) => ({ ...current, text }))}
        onChallengeSend={sendChallenge}
        onChallengeCancel={() => setChallenge((current) => ({ ...current, state: 'closed', error: null }))}
        nextLabel={upcoming && isSessionFinished(upcoming) ? 'See how you did' : 'Next question'}
        onNext={goNext}
      />
    ) : question?.type === 'calculation' && session ? (
      <PracticeCalculationView
        eyebrow={isRetry ? 'Another go at one you missed' : `Question ${Math.min(session.askedIds.length, session.total)}`}
        level={question.level}
        marksLabel={`${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}`}
        sourceChip={question.source === 'aqa-bank' ? 'AQA-style practice' : null}
        levelNote={!isRetry && !calcChecked && session.answers.length > 0 ? levelNote(session.adaptive) : null}
        context={question.context}
        table={question.table}
        prompt={question.prompt}
        answer={calcDraft}
        onAnswerChange={(value) => { setCalcDraft(value); setCalcError(null) }}
        unitLabel={calculationUnitLabel(question.unit)}
        result={calcChecked ? (calcChecked.right ? 'right' : 'wrong') : null}
        locked={Boolean(calcChecked)}
        showConfidence={parseAnswer(calcDraft) !== null && !calcChecked}
        onConfidence={checkCalculationAnswer}
        error={calcError}
        busy={saving || checkpointBusy || checkpointPhase !== 'ready'}
      />
    ) : question?.type === 'multiple-choice' && session ? (
      <PracticeQuestionView
        eyebrow={isRetry ? 'Another go at one you missed' : `Question ${Math.min(session.askedIds.length, session.total)}`}
        level={question.level}
        marksLabel={`${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}`}
        sourceChip={question.source === 'aqa-bank' ? 'AQA-style practice' : null}
        levelNote={!isRetry && !checked && session.answers.length > 0 ? levelNote(session.adaptive) : null}
        context={question.context}
        table={question.table}
        prompt={question.prompt}
        options={question.options.map((option, index) => ({ text: option.text, state: optionState(index) }))}
        locked={Boolean(checked)}
        onPick={setSelectedOption}
        showConfidence={selectedOption !== null && !checked}
        onConfidence={checkAnswer}
        busy={saving || checkpointBusy || checkpointPhase !== 'ready'}
      />
    ) : null

    // The feedback bar: what happened, why, and one action. No Learn or Ask REV links per question (they are in the summary).
    const feedbackFor = () => {
      if (question?.type === 'calculation' && calcChecked) {
        const action = <Button size="large" onClick={goNext}>{upcoming && isSessionFinished(upcoming) ? 'See how you did' : 'Next question'} <Icon name="arrow-right" size="compact" /></Button>
        const workings = question.workings
        if (calcChecked.right) {
          const guessed = calcChecked.confidence === 'guess'
          return (
            <FeedbackBar
              tone="correct"
              title={guessed ? 'Right, but a guess' : 'Nice, that’s the one.'}
              explanation={`The answer is ${question.answerText}.${workings ? `\n${workings}` : ''}`}
              note={isRetry ? 'That one is off your list.' : guessed ? 'Right, but you guessed. I’ll check this one again soon so it sticks.' : undefined}
            >{action}</FeedbackBar>
          )
        }
        return (
          <FeedbackBar
            tone="wrong"
            title="Not quite."
            picked={`You answered ${calcChecked.typed}. The answer is ${question.answerText}.`}
            explanation={workings}
            note={calcChecked.confidence === 'certain'
              ? 'You were certain, so this is the one most worth fixing. I’ll bring it back later.'
              : 'I’ll bring this back later.'}
          >{action}</FeedbackBar>
        )
      }
      if (!checked || question?.type !== 'multiple-choice') return null
      const correct = checked.selected === question.correctOption
      const letter = 'ABCDEF'[checked.selected]
      const why = question.options[checked.selected]?.why
      const action = <Button size="large" onClick={goNext}>{upcoming && isSessionFinished(upcoming) ? 'See how you did' : 'Next question'} <Icon name="arrow-right" size="compact" /></Button>
      if (correct) {
        const guessed = checked.confidence === 'guess'
        return (
          <FeedbackBar
            tone="correct"
            title={guessed ? 'Right, but a guess' : 'Nice, that’s the one.'}
            explanation={question.explanation}
            note={isRetry ? 'That one is off your list.' : guessed ? 'Right, but you guessed. I’ll check this one again soon so it sticks.' : undefined}
          >{action}</FeedbackBar>
        )
      }
      return (
        <FeedbackBar
          tone="wrong"
          title="Not quite."
          picked={why ? `You picked ${letter}: ${why}` : `You picked ${letter}.`}
          explanation={question.explanation}
          note={checked.confidence === 'certain'
            ? 'You were certain, so this is the one most worth fixing. I’ll bring it back later.'
            : 'I’ll bring this back later.'}
        >{action}</FeedbackBar>
      )
    }
    const questionFeedback = <div className="practice-feedback-region" aria-live="polite">{feedbackFor()}</div>

    const activityBar = openActivity === 'quick-check' && session
      ? <PracticeProgressBar total={session.total} done={Math.min(freshAnswered, session.total)} topicName={topicShort} status={progress?.status} move={statusMove} />
      : <PracticeBarTitle title={`${topicShort} · ${openLabels[openActivity ?? 'quick-check'] ?? ''}`} />

    return (
      <section className="learning-workspace focused-workspace focused-practice practice-workspace" aria-label="Practice">
        {!openActivity && (summaryModel ? (
          <PracticeSummary
            topicTitle={topic?.title ?? topicShort}
            topicShort={topicShort}
            model={summaryModel}
            onReadPage={(pageId) => onOpenLearnPage?.(pageId)}
            onStartNext={startNext}
            nextDismissed={nextDismissed}
            onDismissNext={() => setNextDismissed(true)}
            onPractiseAgain={practiseAgain}
            onBack={() => setSummary(null)}
          />
        ) : hasAnyPractice ? (
          <PracticeStart
            topicTitle={topic?.title ?? topicShort}
            status={progress?.status}
            lastPractised={lastPractisedLabel(progress?.lastPractisedAt)}
            topics={topics.map((item) => ({ id: item.id, label: item.shortTitle }))}
            topicId={topicId}
            onChangeTopic={changeTopic}
            length={length}
            onChangeLength={setLength}
            availableQuestions={availableQuestions}
            sessionCount={startCount}
            questionTypes={availableTypes}
            selectedTypes={chosenTypes}
            onToggleType={(type) => setSelectedTypes((current) => toggleQuestionType(usableQuestionTypes(current, availableTypes), type))}
            onStart={() => { void startQuestions() }}
            startDisabled={Boolean(checkpointContext && (checkpointPhase !== 'ready' || checkpointBusy || checkpoint))}
            carryOn={session ? { progress: sessionAnswersLabel, onCarryOn: () => { void resumeQuestions() } } : null}
            extraScored={extraScored}
            onOpenExtraScored={(id) => beginActivity(id as WorkspaceMode)}
            warmups={warmups}
            onOpenWarmup={(id) => (id === 'flashcards' ? openFlashcards() : beginActivity(id as WorkspaceMode))}
            revReason={revReason}
          />
        ) : (
          <div className="pw-empty"><strong>Nothing to practise here yet</strong><p>No practice activities are published for {topicShort} yet. Try another topic.</p></div>
        ))}

        {saveError && <p className="error" role="alert">{saveError}</p>}
        {checkpointContext && checkpointPhase === 'loading' && <p role="status">Checking for saved Practice work…</p>}
        {checkpointIssue && (
          <div className="practice-recovery-state" role="alert">
            <p>{checkpointIssue}</p>
            <Button variant="secondary" disabled={checkpointBusy} onClick={() => { void reloadCheckpoint() }}>Retry loading saved work</Button>
            {checkpointPhase === 'blocked' && /content changed|checkpoint expired/.test(checkpointIssue) && <Button variant="destructive" disabled={checkpointBusy} onClick={() => { void discardCheckpoint() }}>Discard expired session</Button>}
          </div>
        )}
        {checkpoint && !checkpoint.snapshot.pending && checkpointPhase === 'ready' && !openActivity && (
          <div className="practice-recovery-state">
            <Button variant="secondary" disabled={checkpointBusy} onClick={() => { void discardCheckpoint() }}>Discard saved session and start again</Button>
          </div>
        )}
        {checkpoint?.snapshot.pending && checkpointPhase === 'ready' && (
          <div className="practice-recovery-state">
            <p>A previous answer is being confirmed. Revision will not count it twice.</p>
            <Button disabled={checkpointBusy} onClick={() => { void resumeQuestions() }}>Retry saving answer</Button>
          </div>
        )}

        {openActivity && (
          <PracticeActivityWorkspace
            key={openActivity}
            label={`Practice: ${topicShort}, ${(openLabels[openActivity] ?? '').toLowerCase()}`}
            subjectMark={subjectIdentity.mark}
            accentStyle={accentStyle(subjectIdentity.hue)}
            onClose={closeActivity}
            bar={activityBar}
            footer={openActivity === 'quick-check' ? questionFeedback : undefined}
          >
            {openActivity === 'quick-check' && questionBody}
            {openActivity !== 'quick-check' && openActivity !== 'exam-question' && openActivity !== 'flashcards' && <div><WarmupChip /></div>}
            {openActivity === 'flashcards' && deck && (deckCard
              ? (
                <PracticeFlashcardView
                  key={deckCard.id}
                  number={deck.index + 1}
                  total={deck.ids.length}
                  question={deckCard.prompt}
                  answer={deckCard.answer}
                  flipped={flipped}
                  onFlip={() => setFlipped(true)}
                  onRate={rateFlashcard}
                  isLast={deck.index === deck.ids.length - 1}
                  focusOnMount={deck.index > 0}
                  busy={saving || checkpointBusy || checkpointPhase !== 'ready'}
                />
              )
              : (
                <PracticeFlashcardDone
                  {...tallyDeck(deck)}
                  total={deck.ids.length}
                  onStartQuestions={startCount > 0 ? startQuestions : null}
                  onAgain={() => { setDeck(startDeck(cards, ratingsAfterDeck(knownRatings, deck))); setFlipped(false) }}
                />
              ))}

      {openActivity === 'case-study' && caseStudy && caseQuestion && (
        <div className="learn-panel">
          <p className="muted">Guided application practice. These questions have no authoritative mark allocation, so they are not scored.</p>
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
                <Button disabled={!caseDraft.trim()} onClick={() => setShowCaseGuidance(true)}>Compare with guidance</Button>
              ) : (
                <>
                  <div className="answer-panel"><strong>What a strong answer should do</strong><p>{caseQuestion.guidance}</p></div>
                  <div className="next-step"><strong>What should I improve?</strong><span>Compare your answer with the guidance. Look for missing case evidence, weak chains of reasoning, or a judgement that is not conditional enough.</span></div>
                  <Button onClick={nextCaseQuestion}>Next case question</Button>
                </>
              )}
            </article>
          </div>
        </div>
      )}

      {openActivity === 'exam-question' && includeExamQuestions && exam && examQuestion && (
        <div className="learn-panel">
          <div className="activity-kind scored"><strong>Scored exam evidence — self-assessed</strong><span>Write the answer first, then use the marking guidance to award your own AO marks. Self-marked evidence contributes to readiness but cannot produce high confidence on its own.</span></div>
          <div className="exam-context" dangerouslySetInnerHTML={{ __html: exam.caseHtml }} />
          <article className="written-practice exam-practice">
            <div className="practice-meta">{exam.title} · Question {(examQuestionIndex % exam.questions.length) + 1} of {exam.questions.length} · {examQuestion.marks} marks · {adapter.getTopic(examQuestion.topic)?.shortTitle ?? examQuestion.topic}</div>
            <h3>{examQuestion.prompt}</h3>
            <TextAreaField groupClassName="answer-label" label="Write your answer" rows={12} value={examDraft} disabled={examRecorded} onChange={(event) => setExamDraft(event.target.value)} placeholder="Answer as you would in the exam. Use the case where relevant and show calculations." />
            <p className="muted small-note">Your written draft stays on this screen only. Revision saves the marks you record, not the text of this answer.</p>
            {!showMarkingGuidance ? (
              <Button disabled={!examDraft.trim()} onClick={() => setShowMarkingGuidance(true)}>Show marking guidance</Button>
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
                  <Button disabled={saving} onClick={recordExamQuestion}>Record this result</Button>
                ) : (
                  <>
                    <div className="result-explanation" aria-live="polite"><strong>Result recorded: {examTotalAwarded} / {examQuestion.marks}</strong><span>This is exam evidence, but because you marked it yourself Revision limits the confidence it can claim. Use the guidance above to identify what to improve next.</span></div>
                    <Button onClick={nextExamQuestion}>Next exam question</Button>
                  </>
                )}
              </>
            )}
          </article>
        </div>
      )}

      {openActivity === 'formulas-data' && (
        <div className="learn-panel">
          <div className="practice-split">
            {formula && (
              <article className="practice-box">
                <div className="practice-meta">Formula {(formulaIndex % formulas.length) + 1} of {formulas.length}</div>
                <h3>{formula.name}</h3>
                <p className="muted">Write the formula from memory before revealing it.</p>
                {showFormula ? <div className="answer-panel"><strong>Formula</strong><p>{formula.expression}</p></div> : <Button variant="secondary" onClick={() => setShowFormula(true)}>Reveal formula</Button>}
                {showFormula && <Button onClick={nextFormula}>Next formula</Button>}
              </article>
            )}
            {drill && (
              <article className="practice-box">
                <div className="practice-meta">Data drill {(drillIndex % drills.length) + 1} of {drills.length}</div>
                <h3>{drill.title}</h3>
                <p>{drill.prompt}</p>
                {showDrillAnswer ? <div className="answer-panel"><strong>Model answer</strong><p>{drill.answer}</p></div> : <Button variant="secondary" onClick={() => setShowDrillAnswer(true)}>Show model answer</Button>}
                {showDrillAnswer && <Button onClick={nextDrill}>Next data drill</Button>}
              </article>
            )}
          </div>
          <div className="next-step"><strong>What should I do next?</strong><span>{includeExamQuestions ? 'Use Quick check for application evidence or Exam question for stronger written exam evidence.' : 'Use Quick check for application evidence, then move to Exam Prep for paper-specific written practice.'}</span></div>
        </div>
      )}

            {saving && <p className="muted" aria-live="polite">Saving your activity…</p>}
          </PracticeActivityWorkspace>
        )}
      </section>
    )
  }

  return (
    <section
      className={`learning-workspace focused-workspace focused-${section}`}
      aria-labelledby={`focused-${section}-heading`}
    >
      {workspaceHeading}
      {tabs}

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
    </section>
  )
}
