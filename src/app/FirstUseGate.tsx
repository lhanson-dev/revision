import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import {
  recommendStartingPoint,
  selectStartingCheckQuestions,
  type StartingPointReason,
} from '../engine/starting-check/starting-check'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import {
  addLearnerCourse,
  loadLearnerCourses,
  recordLearnerCourseEventBestEffort,
  type LearnerCourseMembership,
} from '../services/courses/learner-course-service'
import {
  completeStudentFirstUse,
  establishStudentExperience,
  loadAccountExperienceState,
  recordFirstUseEventBestEffort,
  setFirstUseStage,
  startFirstUseActivity,
  type AccountExperienceState,
  type FirstUseActivity,
} from '../services/onboarding/student-first-use-service'
import {
  createSupabaseEvidenceStore,
  loadLearningEvidence,
  recordLearningEvidence,
} from '../services/progress/learning-evidence-service'
import {
  createSupabaseStartingCheckEvidenceStore,
  loadStartingCheckEvidence,
  recordStartingCheckEvidence,
  type StartingCheckEvidence,
} from '../services/progress/starting-check-evidence-service'
import { supabase } from '../services/supabase/browser-client'
import { buildCatalogue, type CatalogueCourse } from './catalogue-model'
import { allCatalogueCourses, findCatalogueCourse } from './learner-programme'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'
import { BrandAsset, Button, Icon, SelectField, Status } from './ui'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const catalogueCourses = allCatalogueCourses(catalogue)
const themeStorageKey = 'revision:theme'

type ThemeName = 'light' | 'dark'
type CatalogueCourseItem = ReturnType<typeof allCatalogueCourses>[number]
type StarterTarget = { topicId: string; activity: FirstUseActivity }

function currentTheme(): ThemeName {
  const saved = window.localStorage.getItem(themeStorageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function titleCaseFirstCharacter(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : ''
}

function firstName(user: User | null) {
  if (!user) return 'there'
  const metadata = user.user_metadata ?? {}
  const explicitFirstName = metadata.first_name ?? metadata.given_name
  if (typeof explicitFirstName === 'string' && explicitFirstName.trim()) return titleCaseFirstCharacter(explicitFirstName)
  if (typeof metadata.name === 'string' && metadata.name.trim()) return titleCaseFirstCharacter(metadata.name.trim().split(/\s+/)[0])
  return 'there'
}

function firstUseAdapter(course: CatalogueCourse): LearningContentAdapter {
  return course.sharedLearning ? course.learningAdapter : course.modules[0] ?? course.learningAdapter
}

function unique(values: readonly string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function eligibleStarterTopicIds(adapter: LearningContentAdapter) {
  return adapter.listTopics()
    .map((topic) => topic.id)
    .filter((topicId) => adapter.listFlashcards(topicId).length > 0 || adapter.listQuestions(topicId).length > 0)
}

function resolveStarterTarget(
  adapter: LearningContentAdapter,
  requestedTopicId: string | null | undefined,
  startingEvidence: readonly StartingCheckEvidence[],
): StarterTarget | null {
  const eligible = eligibleStarterTopicIds(adapter)
  const topicId = requestedTopicId && eligible.includes(requestedTopicId) ? requestedTopicId : eligible[0]
  if (!topicId) return null
  if (adapter.listFlashcards(topicId).length > 0) return { topicId, activity: 'flashcard' }

  const startingQuestionIds = new Set(startingEvidence.map((item) => item.questionId))
  const questions = adapter.listQuestions(topicId)
  const freshQuestion = questions.find((question) => !startingQuestionIds.has(question.id))
  if (freshQuestion || questions.length > 0) return { topicId, activity: 'quick-check' }
  return null
}

function recommendationCopy(reason: StartingPointReason | null) {
  if (reason === 'incorrect_sample') {
    return 'One of your starting-check answers suggests this is worth revisiting first. It is an early signal, not a judgement of the whole topic.'
  }
  if (reason === 'no_stronger_evidence') {
    return 'Revision does not have stronger learning evidence yet, so this is a sensible place to begin while it learns from your real revision.'
  }
  return 'This is a deterministic course starting point. Revision will adjust as soon as you create stronger learning evidence.'
}

function activityLabel(activity: FirstUseActivity) {
  return activity === 'flashcard' ? 'Flashcard review' : 'Quick check'
}

function feedbackCopy(evidence: LearningEvidence | null) {
  if (!evidence) {
    return {
      title: 'Your first useful revision is complete.',
      body: 'Revision will keep learning from the work you do next and adjust its recommendations as stronger evidence builds.',
    }
  }
  if (evidence.source === 'flashcard') {
    if (evidence.rating === 2) return { title: 'You knew that one.', body: 'That is one useful piece of normal learning evidence. Revision will keep checking it against future work rather than treating one result as mastery.' }
    if (evidence.rating === 1) return { title: 'You were close.', body: 'That suggests this area is worth another pass. Revision will keep adjusting as you practise it again.' }
    return { title: 'This one needs another look.', body: 'That is useful evidence, not a failure. Revision now has a stronger reason to keep this area near the top of your next steps.' }
  }
  if (evidence.source === 'multiple_choice') {
    return evidence.correct
      ? { title: 'You got that one right.', body: 'Revision has one stronger learning result to use alongside the earlier starting signal. It will keep building the picture rather than over-reading one answer.' }
      : { title: 'That answer needs another look.', body: 'Revision can now use this normal learning evidence to keep the topic in focus and refine what it recommends next.' }
  }
  return { title: 'Your first useful revision is complete.', body: 'Revision now has real learning evidence to use when deciding what should come next.' }
}

function courseIdentity(item: CatalogueCourseItem) {
  const { course, subject } = item
  const boardNeeded = !course.qualificationName.toLocaleLowerCase().includes(course.examBoardName.toLocaleLowerCase())
  return [subject.name, course.qualificationName, boardNeeded ? course.examBoardName : null, `Specification ${course.specificationCode}`]
    .filter(Boolean)
    .join(' · ')
}

function ExperienceChoice({
  title,
  description,
  available,
  disabled = false,
  onSelect,
}: {
  title: string
  description: string
  available: boolean
  disabled?: boolean
  onSelect?: () => void
}) {
  const unavailable = !available
  return (
    <button
      type="button"
      className={`first-use-experience-card ${available ? 'is-available' : 'is-unavailable'}`}
      disabled={disabled || unavailable}
      aria-disabled={disabled || unavailable}
      onClick={onSelect}
    >
      <span className="first-use-experience-copy">
        <span className="first-use-experience-title"><Icon name="user" size="large" /><strong>{title}</strong></span>
        <span>{description}</span>
      </span>
      <span className="first-use-experience-trailing">
        {available ? <><span>Continue</span><Icon name="arrow-right" /></> : <span className="first-use-coming-soon">Coming soon</span>}
      </span>
    </button>
  )
}

function LoadingShell({ theme, message }: { theme: ThemeName; message: string }) {
  return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><div className="first-use-loading">{message}</div></main>
}

export function FirstUseGate({ children }: { children: ReactNode }) {
  const [theme] = useState<ThemeName>(() => currentTheme())
  const [user, setUser] = useState<User | null>(null)
  const [accountState, setAccountState] = useState<AccountExperienceState | null>(null)
  const [memberships, setMemberships] = useState<LearnerCourseMembership[]>([])
  const [initialResolved, setInitialResolved] = useState(false)
  const [startingEvidence, setStartingEvidence] = useState<StartingCheckEvidence[]>([])
  const [normalEvidence, setNormalEvidence] = useState<LearningEvidence[]>([])
  const [loadedEvidenceKey, setLoadedEvidenceKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [qualification, setQualification] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [examBoard, setExamBoard] = useState('')
  const [courseId, setCourseId] = useState('')
  const [startingOption, setStartingOption] = useState<number | null>(null)
  const [overrideTopicId, setOverrideTopicId] = useState('')
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)
  const [activityOption, setActivityOption] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const recommendationEventKeys = useRef(new Set<string>())
  const feedbackEventKeys = useRef(new Set<string>())

  useEffect(() => {
    let active = true
    void supabase.auth.getSession()
      .then(async ({ data }) => {
        const sessionUser = data.session?.user ?? null
        if (!active) return
        if (!sessionUser) {
          setUser(null)
          setInitialResolved(true)
          return
        }
        const [state, savedCourses] = await Promise.all([
          loadAccountExperienceState(supabase, sessionUser.id),
          loadLearnerCourses(supabase, sessionUser.id),
        ])
        if (!active) return
        setUser(sessionUser)
        setAccountState(state)
        setMemberships(savedCourses)
        setInitialResolved(true)
        if (!state) {
          void recordFirstUseEventBestEffort(supabase, sessionUser.id, 'onboarding_started')
          void recordFirstUseEventBestEffort(supabase, sessionUser.id, 'account_type_viewed')
        } else if (!state.onboardingCompletedAt) {
          void recordFirstUseEventBestEffort(supabase, sessionUser.id, 'onboarding_resumed', savedCourses[0]?.courseId ?? null, { stage: state.onboardingStage })
        }
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Could not load your Revision setup.')
        setInitialResolved(true)
      })
    return () => { active = false }
  }, [refreshKey])

  const activeCourseItem = useMemo(() => {
    const firstMembership = memberships[0]
    return firstMembership ? findCatalogueCourse(catalogue, firstMembership.courseId) ?? null : null
  }, [memberships])
  const adapter = activeCourseItem ? firstUseAdapter(activeCourseItem.course) : null
  const evidenceKey = user && adapter ? `${user.id}:${adapter.manifest.id}` : ''
  const evidenceLoading = Boolean(evidenceKey && !accountState?.onboardingCompletedAt && loadedEvidenceKey !== evidenceKey)

  useEffect(() => {
    let active = true
    if (!user || !adapter || accountState?.onboardingCompletedAt) return () => { active = false }
    const key = `${user.id}:${adapter.manifest.id}`
    Promise.all([
      loadStartingCheckEvidence(createSupabaseStartingCheckEvidenceStore(supabase), user.id, adapter.manifest.id),
      loadLearningEvidence(createSupabaseEvidenceStore(supabase), user.id, adapter.manifest.id),
    ])
      .then(([starting, normal]) => {
        if (!active) return
        setStartingEvidence(starting)
        setNormalEvidence(normal)
        setLoadedEvidenceKey(key)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Could not load your starting point.')
        setLoadedEvidenceKey(key)
      })
    return () => { active = false }
  }, [accountState?.onboardingCompletedAt, adapter, user])

  const qualificationOptions = useMemo(() => unique(catalogueCourses.map((item) => item.course.qualificationName)), [])
  const effectiveQualification = qualification || (qualificationOptions.length === 1 ? qualificationOptions[0] : '')
  const qualificationCourses = useMemo(
    () => effectiveQualification ? catalogueCourses.filter((item) => item.course.qualificationName === effectiveQualification) : [],
    [effectiveQualification],
  )
  const subjectOptions = useMemo(() => {
    const byId = new Map(qualificationCourses.map((item) => [item.subject.id, item.subject.name]))
    return [...byId.entries()].sort((left, right) => left[1].localeCompare(right[1]))
  }, [qualificationCourses])
  const effectiveSubjectId = subjectId || (subjectOptions.length === 1 ? subjectOptions[0][0] : '')
  const subjectCourses = useMemo(
    () => effectiveSubjectId ? qualificationCourses.filter((item) => item.subject.id === effectiveSubjectId) : [],
    [effectiveSubjectId, qualificationCourses],
  )
  const examBoardOptions = useMemo(() => unique(subjectCourses.map((item) => item.course.examBoardName)), [subjectCourses])
  const effectiveExamBoard = examBoard || (examBoardOptions.length === 1 ? examBoardOptions[0] : '')
  const boardCourses = useMemo(
    () => effectiveExamBoard ? subjectCourses.filter((item) => item.course.examBoardName === effectiveExamBoard) : [],
    [effectiveExamBoard, subjectCourses],
  )
  const resolvedCourseItem = boardCourses.length === 1 ? boardCourses[0] : boardCourses.find((item) => item.course.id === courseId) ?? null

  const selectedStartingQuestions = useMemo(() => adapter ? selectStartingCheckQuestions(adapter) : [], [adapter])
  const answeredStartingIds = useMemo(() => new Set(startingEvidence.map((item) => item.questionId)), [startingEvidence])
  const currentStartingQuestion = selectedStartingQuestions.find((question) => !answeredStartingIds.has(question.id)) ?? null
  const eligibleTopics = useMemo(() => adapter ? eligibleStarterTopicIds(adapter) : [], [adapter])
  const startingRecommendation = useMemo(() => {
    if (!adapter || eligibleTopics.length === 0) return null
    return recommendStartingPoint(
      adapter.manifest.id,
      eligibleTopics,
      startingEvidence.map((item) => ({ questionId: item.questionId, topicId: item.topicId, correct: item.correct })),
      normalEvidence,
    )
  }, [adapter, eligibleTopics, normalEvidence, startingEvidence])
  const baseStarterTarget = useMemo(
    () => adapter ? resolveStarterTarget(adapter, startingRecommendation?.topicId, startingEvidence) : null,
    [adapter, startingEvidence, startingRecommendation?.topicId],
  )
  const chosenStarterTarget = useMemo(
    () => adapter ? resolveStarterTarget(adapter, overrideTopicId || baseStarterTarget?.topicId, startingEvidence) : null,
    [adapter, baseStarterTarget?.topicId, overrideTopicId, startingEvidence],
  )

  let stage = accountState?.onboardingStage ?? null
  if (accountState && memberships.length === 0) stage = 'course'
  if (accountState && memberships.length > 0 && stage === 'course') stage = 'course_ready'
  if (stage === 'starting_check' && !evidenceLoading && !currentStartingQuestion) stage = 'recommendation'

  useEffect(() => {
    if (!user || !activeCourseItem || stage !== 'recommendation' || !baseStarterTarget) return
    const key = `${user.id}:${activeCourseItem.course.id}:${baseStarterTarget.topicId}:${startingEvidence.length}`
    if (recommendationEventKeys.current.has(key)) return
    recommendationEventKeys.current.add(key)
    void recordFirstUseEventBestEffort(supabase, user.id, 'recommendation_shown', activeCourseItem.course.id, {
      reason: startingRecommendation?.reason ?? 'course_order_fallback',
      starting_answers: startingEvidence.length,
    })
  }, [activeCourseItem, baseStarterTarget, stage, startingEvidence.length, startingRecommendation?.reason, user])

  useEffect(() => {
    if (!user || !activeCourseItem || stage !== 'feedback') return
    const key = `${user.id}:${activeCourseItem.course.id}:${accountState?.starterTopicId ?? ''}`
    if (feedbackEventKeys.current.has(key)) return
    feedbackEventKeys.current.add(key)
    void recordFirstUseEventBestEffort(supabase, user.id, 'feedback_viewed', activeCourseItem.course.id)
  }, [accountState?.starterTopicId, activeCourseItem, stage, user])

  function retryInitialLoad() {
    setError('')
    setInitialResolved(false)
    setRefreshKey((value) => value + 1)
  }

  async function chooseStudent() {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      const state = await establishStudentExperience(supabase, user.id)
      setAccountState(state)
      void recordFirstUseEventBestEffort(supabase, user.id, 'student_selected')
      void recordFirstUseEventBestEffort(supabase, user.id, 'first_course_setup_viewed')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save your Student experience.')
      void recordFirstUseEventBestEffort(supabase, user.id, 'onboarding_error', null, { stage: 'experience' })
    } finally {
      setBusy(false)
    }
  }

  async function addFirstCourse() {
    if (!user || !resolvedCourseItem) return
    setBusy(true)
    setError('')
    try {
      const membership = await addLearnerCourse(supabase, user.id, resolvedCourseItem.course.id)
      setMemberships([membership])
      setLoadedEvidenceKey('')
      void recordLearnerCourseEventBestEffort(supabase, user.id, 'course_added', resolvedCourseItem.course.id, { source: 'first_use' })
      void recordFirstUseEventBestEffort(supabase, user.id, 'first_course_added', resolvedCourseItem.course.id)
      setAccountState(await setFirstUseStage(supabase, user.id, 'course_ready'))
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not add that course.')
      void recordFirstUseEventBestEffort(supabase, user.id, 'onboarding_error', resolvedCourseItem.course.id, { stage: 'course' })
    } finally {
      setBusy(false)
    }
  }

  async function beginStartingCheck() {
    if (!user || !activeCourseItem || evidenceLoading) return
    setBusy(true)
    setError('')
    try {
      void recordFirstUseEventBestEffort(supabase, user.id, 'starting_check_offered', activeCourseItem.course.id, { question_count: selectedStartingQuestions.length })
      if (selectedStartingQuestions.length === 0) {
        setAccountState(await setFirstUseStage(supabase, user.id, 'recommendation'))
        void recordFirstUseEventBestEffort(supabase, user.id, 'starting_check_skipped', activeCourseItem.course.id, { reason: 'no_eligible_questions' })
      } else {
        setAccountState(await setFirstUseStage(supabase, user.id, 'starting_check'))
        void recordFirstUseEventBestEffort(supabase, user.id, 'starting_check_started', activeCourseItem.course.id, { question_count: selectedStartingQuestions.length })
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not start the check.')
    } finally {
      setBusy(false)
    }
  }

  async function skipStartingCheck() {
    if (!user || !activeCourseItem || evidenceLoading) return
    setBusy(true)
    setError('')
    try {
      setAccountState(await setFirstUseStage(supabase, user.id, 'recommendation'))
      void recordFirstUseEventBestEffort(
        supabase,
        user.id,
        startingEvidence.length > 0 ? 'starting_check_partial' : 'starting_check_skipped',
        activeCourseItem.course.id,
        { answered_count: startingEvidence.length },
      )
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not continue without the check.')
    } finally {
      setBusy(false)
    }
  }

  async function answerStartingQuestion() {
    if (!user || !activeCourseItem || !adapter || !currentStartingQuestion || startingOption === null) return
    setBusy(true)
    setError('')
    try {
      const evidence = await recordStartingCheckEvidence(
        createSupabaseStartingCheckEvidenceStore(supabase),
        user.id,
        {
          id: `starting-check-${crypto.randomUUID()}`,
          moduleId: adapter.manifest.id,
          topicId: currentStartingQuestion.topic,
          occurredAt: new Date().toISOString(),
          questionId: currentStartingQuestion.id,
          selectedOption: startingOption,
          correctOption: currentStartingQuestion.correctOption,
          correct: startingOption === currentStartingQuestion.correctOption,
          schemaVersion: 1,
        },
      )
      const nextEvidence = [...startingEvidence, evidence]
      setStartingEvidence(nextEvidence)
      setStartingOption(null)
      if (nextEvidence.length >= selectedStartingQuestions.length) {
        setAccountState(await setFirstUseStage(supabase, user.id, 'recommendation'))
        void recordFirstUseEventBestEffort(supabase, user.id, 'starting_check_completed', activeCourseItem.course.id, { answered_count: nextEvidence.length })
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save that answer.')
      void recordFirstUseEventBestEffort(supabase, user.id, 'onboarding_error', activeCourseItem.course.id, { stage: 'starting_check' })
    } finally {
      setBusy(false)
    }
  }

  async function startRevision() {
    if (!user || !activeCourseItem || !chosenStarterTarget) return
    setBusy(true)
    setError('')
    try {
      setShowFlashcardAnswer(false)
      setActivityOption(null)
      setAccountState(await startFirstUseActivity(supabase, user.id, chosenStarterTarget.topicId, chosenStarterTarget.activity))
      const overridden = Boolean(overrideTopicId && overrideTopicId !== baseStarterTarget?.topicId)
      void recordFirstUseEventBestEffort(
        supabase,
        user.id,
        overridden ? 'recommendation_overridden' : 'recommendation_accepted',
        activeCourseItem.course.id,
        { activity: chosenStarterTarget.activity },
      )
      void recordFirstUseEventBestEffort(supabase, user.id, 'first_activity_started', activeCourseItem.course.id, { activity: chosenStarterTarget.activity })
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not start your revision activity.')
    } finally {
      setBusy(false)
    }
  }

  async function finishActivity(evidence: LearningEvidence) {
    if (!user || !activeCourseItem) return
    setBusy(true)
    setError('')
    try {
      const saved = await recordLearningEvidence(createSupabaseEvidenceStore(supabase), user.id, evidence)
      setNormalEvidence((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
      setAccountState(await setFirstUseStage(supabase, user.id, 'feedback'))
      void recordFirstUseEventBestEffort(supabase, user.id, 'first_activity_completed', activeCourseItem.course.id, { activity: accountState?.starterActivity ?? 'unknown' })
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : 'Could not save this revision activity.'
      setError(`${message} Your work is still on screen; try again.`)
    } finally {
      setBusy(false)
    }
  }

  async function continueToHome() {
    if (!user || !activeCourseItem) return
    setBusy(true)
    setError('')
    try {
      const completed = await completeStudentFirstUse(supabase, user.id)
      void recordFirstUseEventBestEffort(supabase, user.id, 'onboarding_completed', activeCourseItem.course.id)
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/home`)
      setAccountState(completed)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not finish your Revision setup.')
    } finally {
      setBusy(false)
    }
  }

  if (!initialResolved) return <LoadingShell theme={theme} message="Loading your Revision setup…" />
  if (error && !user) {
    return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><section className="first-use-card"><Status tone="error">{error}</Status><Button onClick={retryInitialLoad}>Try again</Button></section></main>
  }
  if (accountState?.onboardingCompletedAt) return children

  const learner = firstName(user)

  if (!accountState) {
    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-choice-screen" aria-labelledby="experience-heading">
          <div className="first-use-heading"><p className="eyebrow">One quick choice</p><h1 id="experience-heading">How will you use Revision?</h1><p>Choose the experience that fits you. You only need to do this once.</p></div>
          {error && <Status tone="error">{error}</Status>}
          <div className="first-use-experience-list" role="group" aria-label="Revision experience type">
            <ExperienceChoice title="Student" description="Plan, learn, practise and get guidance from REV." available disabled={busy} onSelect={() => void chooseStudent()} />
            <ExperienceChoice title="Parent" description="Support a Student and understand how revision is going." available={false} />
            <ExperienceChoice title="Teacher" description="Support classes and Students with Revision." available={false} />
          </div>
        </section>
      </main>
    )
  }

  if (stage === 'course') {
    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-course-screen" aria-labelledby="first-course-heading">
          <div className="first-use-heading"><p className="eyebrow">Welcome, {learner}</p><h1 id="first-course-heading">Add your first course</h1><p>Start with one course so Revision can make your first recommendation relevant. You can add the rest later.</p></div>
          <div className="first-use-rev-note"><strong>REV</strong><span>I only need enough course context to get you into useful revision.</span></div>
          {error && <Status tone="error">{error}</Status>}
          <div className="first-use-course-fields">
            {qualificationOptions.length > 1 ? (
              <SelectField label="Qualification" value={qualification} onChange={(event) => { setQualification(event.target.value); setSubjectId(''); setExamBoard(''); setCourseId('') }}>
                <option value="">Choose qualification</option>{qualificationOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </SelectField>
            ) : effectiveQualification ? <div className="first-use-auto-choice"><span>Qualification</span><strong>{effectiveQualification}</strong></div> : null}

            {effectiveQualification && (subjectOptions.length > 1 ? (
              <SelectField label="Subject" value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setExamBoard(''); setCourseId('') }}>
                <option value="">Choose subject</option>{subjectOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </SelectField>
            ) : subjectOptions[0] ? <div className="first-use-auto-choice"><span>Subject</span><strong>{subjectOptions[0][1]}</strong></div> : null)}

            {effectiveSubjectId && (examBoardOptions.length > 1 ? (
              <SelectField label="Exam board" value={examBoard} onChange={(event) => { setExamBoard(event.target.value); setCourseId('') }}>
                <option value="">Choose exam board</option>{examBoardOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </SelectField>
            ) : effectiveExamBoard ? <div className="first-use-auto-choice"><span>Exam board</span><strong>{effectiveExamBoard}</strong></div> : null)}

            {effectiveExamBoard && boardCourses.length > 1 && (
              <SelectField label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                <option value="">Choose course</option>{boardCourses.map((item) => <option key={item.course.id} value={item.course.id}>{item.label} · {item.course.specificationCode}</option>)}
              </SelectField>
            )}
          </div>

          {resolvedCourseItem && (
            <div className="first-use-course-confirmation">
              <div><span className="tag">{resolvedCourseItem.course.examBoardName} · {resolvedCourseItem.course.specificationCode}</span><strong>{resolvedCourseItem.label}</strong><span>{courseIdentity(resolvedCourseItem)}</span></div>
              <Button size="large" disabled={busy} onClick={() => void addFirstCourse()}>Add this course</Button>
            </div>
          )}
        </section>
      </main>
    )
  }

  if (!activeCourseItem || !adapter) {
    return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><section className="first-use-card"><Status tone="error">Your saved course is not available in the current published catalogue. Revision will not silently substitute a different course.</Status><Button onClick={retryInitialLoad}>Try again</Button></section></main>
  }

  if (stage === 'course_ready') {
    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-ready-screen" aria-labelledby="course-ready-heading">
          <div className="first-use-success"><Icon name="check" /><span>Course added</span></div>
          <div className="first-use-ready-title"><h1 id="course-ready-heading">{activeCourseItem.subject.name} is ready.</h1><p><strong>{activeCourseItem.label}</strong> · {activeCourseItem.course.examBoardName} · {activeCourseItem.course.specificationCode}</p></div>
          {error && <Status tone="error">{error}</Status>}
          <div className="first-use-ready-action">
            <div><h2>Now let’s work out where to start.</h2><p>A short check across the course gives REV a better first signal. It is not a test of the whole course, and Revision will keep adjusting as you revise.</p></div>
            <div className="first-use-ready-actions"><Button size="large" disabled={busy || evidenceLoading} onClick={() => void beginStartingCheck()}>{evidenceLoading ? 'Preparing…' : 'Find my starting point'}</Button><Button variant="tertiary" disabled={busy || evidenceLoading} onClick={() => void skipStartingCheck()}>Skip for now</Button></div>
          </div>
        </section>
      </main>
    )
  }

  if (stage === 'starting_check') {
    if (evidenceLoading) return <LoadingShell theme={theme} message="Preparing your short starting check…" />
    if (!currentStartingQuestion) return <LoadingShell theme={theme} message="Working out a useful place to begin…" />
    const questionNumber = selectedStartingQuestions.findIndex((question) => question.id === currentStartingQuestion.id) + 1
    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-check-screen" aria-labelledby="starting-check-heading">
          <div className="first-use-check-progress"><span>Starting check</span><strong>{questionNumber} of {selectedStartingQuestions.length}</strong></div>
          <div className="first-use-heading"><p className="eyebrow">A quick signal, not a judgement</p><h1 id="starting-check-heading">{currentStartingQuestion.prompt}</h1><p>Choose the answer that seems right. This small sample does not create a grade, readiness score or mastery judgement.</p></div>
          {error && <Status tone="error">{error}</Status>}
          <fieldset className="first-use-options" disabled={busy}>
            <legend className="sr-only">Choose one answer</legend>
            {currentStartingQuestion.options.map((option, index) => (
              <label key={option} className={startingOption === index ? 'is-selected' : ''}><input type="radio" name="starting-check-answer" checked={startingOption === index} onChange={() => setStartingOption(index)} /><span>{option}</span></label>
            ))}
          </fieldset>
          <div className="first-use-check-actions"><Button size="large" disabled={startingOption === null || busy} onClick={() => void answerStartingQuestion()}>{questionNumber === selectedStartingQuestions.length ? 'See my starting point' : 'Continue'}</Button><Button variant="tertiary" disabled={busy} onClick={() => void skipStartingCheck()}>Skip for now</Button></div>
        </section>
      </main>
    )
  }

  if (stage === 'recommendation') {
    if (evidenceLoading) return <LoadingShell theme={theme} message="Working out a useful place to begin…" />
    if (!baseStarterTarget || !chosenStarterTarget) {
      return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><section className="first-use-card"><Status tone="error">This course does not currently contain an assured starter activity Revision can route you into. Your course has been kept; no weakness or result has been invented.</Status><Button onClick={retryInitialLoad}>Try again</Button></section></main>
    }
    const topic = adapter.getTopic(chosenStarterTarget.topicId)
    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-recommendation-screen" aria-labelledby="recommendation-heading">
          <div className="first-use-rev-badge">REV recommends</div>
          <div className="first-use-heading"><p className="eyebrow">A sensible first step</p><h1 id="recommendation-heading">Start with {topic?.shortTitle ?? 'this topic'}.</h1><p>{recommendationCopy(startingRecommendation?.reason ?? null)}</p></div>
          {error && <Status tone="error">{error}</Status>}
          <div className="first-use-recommendation-action"><div><strong>{activityLabel(chosenStarterTarget.activity)}</strong><span>{activeCourseItem.label}</span><p>This will create normal learning evidence. REV can then use that stronger evidence to refine what comes next.</p></div><Button size="large" disabled={busy} onClick={() => void startRevision()}>Start revision</Button></div>
          {!showAlternatives ? <Button variant="tertiary" onClick={() => setShowAlternatives(true)}>Choose something else</Button> : (
            <div className="first-use-alternative"><SelectField label="Choose another topic" value={overrideTopicId || baseStarterTarget.topicId} onChange={(event) => setOverrideTopicId(event.target.value)}>{eligibleTopics.map((topicId) => <option key={topicId} value={topicId}>{adapter.getTopic(topicId)?.shortTitle ?? topicId}</option>)}</SelectField><p className="muted">Revision will respect your choice and keep learning from what you do.</p></div>
          )}
        </section>
      </main>
    )
  }

  const activityTopicId = accountState.starterTopicId ?? baseStarterTarget?.topicId ?? null
  const persistedStarter = resolveStarterTarget(adapter, activityTopicId, startingEvidence)
  const activityMode = accountState.starterActivity ?? persistedStarter?.activity ?? null
  const activityTopic = activityTopicId ? adapter.getTopic(activityTopicId) : null

  if (stage === 'activity') {
    if (!activityTopicId || !activityMode || !activityTopic) {
      return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><section className="first-use-card"><Status tone="error">Revision could not restore the exact first activity. Your saved course and starting evidence are still safe.</Status><Button onClick={retryInitialLoad}>Try again</Button></section></main>
    }

    if (activityMode === 'flashcard') {
      const card = adapter.listFlashcards(activityTopicId)[0]
      if (!card) return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><section className="first-use-card"><Status tone="error">That starter flashcard is not available right now.</Status></section></main>
      return (
        <main className="first-use-shell" data-theme={theme}>
          <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
          <section className="first-use-card first-use-activity-screen" aria-labelledby="first-activity-heading">
            <div className="first-use-activity-context"><span>{activeCourseItem.label}</span><strong>{activityTopic.shortTitle}</strong></div>
            <div className="first-use-heading"><p className="eyebrow">Your first useful revision</p><h1 id="first-activity-heading">{card.prompt}</h1><p>Think of the answer before revealing it. Then rate how well you knew it.</p></div>
            {error && <Status tone="error">{error}</Status>}
            {!showFlashcardAnswer ? <Button size="large" onClick={() => setShowFlashcardAnswer(true)}>Show answer</Button> : <><div className="first-use-answer-panel"><strong>Answer</strong><p>{card.answer}</p></div><div className="first-use-rating"><span>How well did you know it?</span><div><Button variant="secondary" disabled={busy} onClick={() => void finishActivity(createFlashcardEvidence({ id: `flashcard-${crypto.randomUUID()}`, moduleId: adapter.manifest.id, topicId: card.topic, contentId: card.id, rating: 0 }))}>Not yet</Button><Button variant="secondary" disabled={busy} onClick={() => void finishActivity(createFlashcardEvidence({ id: `flashcard-${crypto.randomUUID()}`, moduleId: adapter.manifest.id, topicId: card.topic, contentId: card.id, rating: 1 }))}>Nearly</Button><Button disabled={busy} onClick={() => void finishActivity(createFlashcardEvidence({ id: `flashcard-${crypto.randomUUID()}`, moduleId: adapter.manifest.id, topicId: card.topic, contentId: card.id, rating: 2 }))}>Knew it</Button></div></div></>}
          </section>
        </main>
      )
    }

    const startingQuestionIds = new Set(startingEvidence.map((item) => item.questionId))
    const question = adapter.listQuestions(activityTopicId).find((item) => !startingQuestionIds.has(item.id)) ?? adapter.listQuestions(activityTopicId)[0]
    if (!question) return <main className="first-use-shell" data-theme={theme}><BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" /><section className="first-use-card"><Status tone="error">That starter question is not available right now.</Status></section></main>

    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-activity-screen" aria-labelledby="first-activity-heading">
          <div className="first-use-activity-context"><span>{activeCourseItem.label}</span><strong>{activityTopic.shortTitle}</strong></div>
          <div className="first-use-heading"><p className="eyebrow">Your first useful revision</p><h1 id="first-activity-heading">{question.prompt}</h1><p>This is normal Practice now, so your answer becomes learning evidence Revision can use in future recommendations.</p></div>
          {error && <Status tone="error">{error}</Status>}
          <fieldset className="first-use-options" disabled={busy}>
            <legend className="sr-only">Choose one answer</legend>
            {question.options.map((option, index) => <label key={option} className={activityOption === index ? 'is-selected' : ''}><input type="radio" name="first-activity-answer" checked={activityOption === index} onChange={() => setActivityOption(index)} /><span>{option}</span></label>)}
          </fieldset>
          <Button size="large" disabled={activityOption === null || busy} onClick={() => activityOption !== null && void finishActivity(createMultipleChoiceEvidence({ id: `mcq-${crypto.randomUUID()}`, moduleId: adapter.manifest.id, topicId: question.topic, contentId: question.id, selectedOption: activityOption, correctOption: question.correctOption }))}>Check answer</Button>
        </section>
      </main>
    )
  }

  if (stage === 'feedback') {
    const starterEvidence = normalEvidence.find((item) => !activityTopicId || item.topicId === activityTopicId) ?? normalEvidence[0] ?? null
    const feedback = feedbackCopy(starterEvidence)
    return (
      <main className="first-use-shell" data-theme={theme}>
        <BrandAsset asset="wordmark" className="first-use-brand" alt="Revision" />
        <section className="first-use-card first-use-feedback-screen" aria-labelledby="first-feedback-heading">
          <div className="first-use-success"><Icon name="check" /><span>First revision complete</span></div>
          <div className="first-use-heading"><p className="eyebrow">What this tells us</p><h1 id="first-feedback-heading">{feedback.title}</h1><p>{feedback.body}</p></div>
          {error && <Status tone="error">{error}</Status>}
          <div className="first-use-feedback-next"><div><strong>What happens next?</strong><p>Home can now start with real course context and a credible next action rather than an empty dashboard. You can still choose your own work at any time.</p></div><Button size="large" disabled={busy} onClick={() => void continueToHome()}>Continue</Button></div>
        </section>
      </main>
    )
  }

  return <LoadingShell theme={theme} message="Preparing Revision…" />
}
