import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { loadLearnExposures, type LearnPageExposure } from '../services/progress/learn-exposure-service'
import { loadPlannerSetup } from '../services/planning/planner-service'
import { loadPlannedSessions, type PlannedSession } from '../services/planning/planned-session-service'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'
import { createCourseLearningState, createModuleLearningState, type CatalogueSubject, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, projectLearnerProgramme } from './learner-programme'
import { homeToday } from './home-v3-model'
import { buildPlannerSnapshot } from './planner-model'
import { ACCEPTED_COMMITMENT_HORIZON_DAYS, DETAILED_PLANNER_HORIZON_DAYS } from './plan-session-windows'
import { addDays } from './accepted-sessions'
import { todayRecommendations, readTodayChoice } from './today-recommendations'
import { dayKey } from './rev-suggestions'
import { useLocalDay } from './use-local-day'
import { progressActionFromPlannerTask } from './progress-summary'

type Programme = ReturnType<typeof projectLearnerProgramme>['courses']
const NO_EVIDENCE: LearningEvidence[] = []
const NO_EXPOSURES: LearnPageExposure[] = []

function programmeStates(courses: Programme, evidence: readonly LearningEvidence[], exposures: readonly LearnPageExposure[]) {
  return courses.map(({ course, label }) => ({
    courseId: course.id,
    label,
    states: course.sharedLearning
      ? [createCourseLearningState(course, evidence, exposures)]
      : course.modules.map((adapter) => createModuleLearningState(adapter, evidence, exposures, course.id)),
  }))
}

/**
 * The single FI-001 selection projection shared by global and course-local Progress.
 * It reads the entire active programme, not a filtered course's evidence, because
 * Home, Plan and REV decide the next task across all enrolled courses.
 * Exposure and self-assessed work do not acquire new scoring authority here.
 */
export function useProgrammeFi001Progress(
  client: SupabaseClient,
  userId: string,
  catalogue: readonly CatalogueSubject[],
  memberships: readonly LearnerCourseMembership[],
) {
  const programme = useMemo(() => projectLearnerProgramme(catalogue, memberships), [catalogue, memberships])
  const adapters = useMemo(() => adaptersForProgramme(programme.courses), [programme.courses])
  const now = useLocalDay()
  const todayKey = dayKey(now)
  const courseKey = programme.courses.map((item) => item.course.id).sort().join('|')
  const evidenceKey = `${userId}:${courseKey}`
  const plannerKey = `${evidenceKey}:${todayKey}`

  const [evidenceRead, setEvidenceRead] = useState<{
    key: string
    evidence: LearningEvidence[]
    exposures: LearnPageExposure[]
    error: string
  } | null>(null)
  const [plannerRead, setPlannerRead] = useState<{
    key: string
    setup: Awaited<ReturnType<typeof loadPlannerSetup>> | null
    sessions: PlannedSession[] | null
    error: string
  } | null>(null)

  const currentEvidence = evidenceRead?.key === evidenceKey ? evidenceRead : null
  const currentPlanner = plannerRead?.key === plannerKey ? plannerRead : null
  const evidence = currentEvidence?.evidence ?? NO_EVIDENCE
  const exposures = currentEvidence?.exposures ?? NO_EXPOSURES
  const error = currentEvidence?.error ?? ''
  const loading = adapters.length > 0 && currentEvidence === null
  const plannerLoading = programme.courses.length > 0 && currentPlanner === null
  const plannerError = currentPlanner?.error ?? ''
  const plannerSetup = currentPlanner?.setup ?? null
  const acceptedSessions = currentPlanner?.sessions ?? null

  useEffect(() => {
    let active = true
    if (adapters.length === 0) return () => { active = false }
    const store = createSupabaseEvidenceStore(client)
    void Promise.all([
      Promise.all(adapters.map((adapter) => loadLearningEvidence(store, userId, adapter.manifest.id))),
      loadLearnExposures(client, userId),
    ]).then(([items, reviewed]) => {
      if (active) setEvidenceRead({ key: evidenceKey, evidence: items.flat(), exposures: reviewed, error: '' })
    }).catch((caught: unknown) => {
      if (active) setEvidenceRead({
        key: evidenceKey, evidence: [], exposures: [],
        error: caught instanceof Error ? caught.message : 'Could not load your progress.',
      })
    })
    return () => { active = false }
  }, [adapters, client, userId, evidenceKey])

  useEffect(() => {
    let active = true
    if (programme.courses.length === 0) return () => { active = false }
    void Promise.all([
      loadPlannerSetup(client, userId),
      loadPlannedSessions(client, userId, todayKey, addDays(todayKey, ACCEPTED_COMMITMENT_HORIZON_DAYS - 1)),
    ]).then(([setup, sessions]) => {
      if (active) setPlannerRead({ key: plannerKey, setup, sessions, error: '' })
    }).catch((caught: unknown) => {
      if (active) setPlannerRead({
        key: plannerKey, setup: null, sessions: null,
        error: caught instanceof Error ? caught.message : 'Could not read your current plan.',
      })
    })
    return () => { active = false }
  }, [client, userId, todayKey, plannerKey, programme.courses.length])

  const grouped = useMemo(() => programmeStates(programme.courses, evidence, exposures),
    [programme.courses, evidence, exposures])
  const allStates = useMemo<ModuleLearningState[]>(() => grouped.flatMap((item) => item.states), [grouped])
  const activeAssessments = useMemo(() => plannerSetup?.assessments.filter((assessment) => {
    if (!assessment.isActive) return false
    if (assessment.courseId) return programme.courses.some((item) => item.course.id === assessment.courseId)
    return programme.courses.filter((item) => item.subject.id === assessment.subjectId).length === 1
  }) ?? [], [plannerSetup, programme.courses])
  const snapshot = useMemo(() =>
    plannerSetup && acceptedSessions !== null && !loading && !error
      ? buildPlannerSnapshot(allStates, activeAssessments, plannerSetup.availability,
        plannerSetup.exceptions, plannerSetup.preferences, now, acceptedSessions, DETAILED_PLANNER_HORIZON_DAYS)
      : null,
  [plannerSetup, acceptedSessions, loading, error, allStates, activeAssessments, now])
  const nextTask = useMemo(() => {
    if (!plannerSetup || plannerLoading || plannerError || acceptedSessions === null || loading || error) return null
    const todayPlan = homeToday(todayKey, acceptedSessions, snapshot?.schedule ?? [], activeAssessments,
      plannerSetup.availability?.weeklyMinutes ?? null, plannerSetup.exceptions, programme.courses, allStates)
    return todayRecommendations(todayPlan, allStates, programme.courses,
      !plannerSetup.availability || activeAssessments.length === 0, true, now,
      readTodayChoice(userId), activeAssessments, plannerSetup.preferences)[0] ?? null
  }, [plannerSetup, plannerLoading, plannerError, acceptedSessions, loading, error,
    todayKey, snapshot, activeAssessments, programme.courses, allStates, now, userId])
  const nextAction = useMemo(() => progressActionFromPlannerTask(nextTask), [nextTask])

  return { programme, evidence, exposures, grouped, allStates, loading, error, plannerLoading, plannerError, nextAction }
}
