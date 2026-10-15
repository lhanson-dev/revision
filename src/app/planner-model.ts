import type { PlannedSession } from '../services/planning/planned-session-service'
import { applyAcceptedSessionsToDays, withoutPlannedTopics } from './accepted-sessions'
import { evidencePercentage } from '../engine/evidence/evidence'
import type { ModuleLearningState } from './catalogue-model'
import type {
  RevisionAssessment,
  RevisionAvailabilityException,
  RevisionAvailabilityProfile,
  RevisionDayOfWeek,
  RevisionPlanningPreference,
} from '../services/planning/planner-service'
import { buildAdaptivePlan, type PlannerCandidate, type PlannerDay, type PlannerResult } from '../engine/planning/planning'
import { buildPlannerProgramme } from '../engine/planning/programme'
import { buildPreparationProgramme, type PreparationKnowledgeRequirement, type PreparationPaperResponseRequirement } from '../engine/planning/preparation'
import { focusMinutesAfterKnownCommitments } from './plan-weekly-capacity'
import { capacityOn } from './plan-model'
import { weekKeys } from './plan-dates'
import { examPapersFor } from './exam-prep'
import { validDateKey } from './navigation'

function confidenceStrength(confidence: ModuleLearningState['readiness']['confidence']) {
  if (confidence === 'high') return 1
  if (confidence === 'medium') return 0.75
  if (confidence === 'low') return 0.5
  return 0.2
}

function estimatedMinutes(activity: string) {
  if (activity === 'exam-question') return 30
  if (activity === 'quick-check') return 20
  return 15
}

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayDifference(from: Date, toDate: string) {
  if (!validDateKey(toDate)) return NaN
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((Date.parse(`${toDate}T00:00:00Z`) - start) / 86_400_000)
}

const weekDayByJsDay: readonly RevisionDayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export function courseIdForLearningState(state: ModuleLearningState) {
  if (state.course) return state.course.id
  const manifest = state.adapter.manifest
  return `${manifest.examBoard.id}:${manifest.qualification.id}:${manifest.specificationCode}`
}

export function stateForAssessment(states: readonly ModuleLearningState[], assessment: RevisionAssessment) {
  const matches = states.filter((state) => {
    if (state.adapter.manifest.subject.id !== assessment.subjectId) return false
    if (assessment.courseId && courseIdForLearningState(state) !== assessment.courseId) return false
    if (!assessment.moduleId) return true
    return (state.course?.modules ?? [state.adapter]).some((adapter) => adapter.manifest.id === assessment.moduleId)
  })
  // Never select the first component of an ambiguous course or ignore a conflicting module ID.
  return matches.length === 1 ? matches[0] : undefined
}

function recentlyCompletedTopic(state: ModuleLearningState, topicId: string, now: Date) {
  const cutoff = now.getTime() - (2 * 86_400_000)
  return state.evidence.some((item) => item.topicId === topicId && new Date(item.occurredAt).getTime() >= cutoff)
}

function learnerPreferenceForCandidate(
  preferences: readonly RevisionPlanningPreference[],
  subjectId: string,
  activityType: string,
  now: Date,
): -1 | 0 | 1 | 2 | 3 {
  const today = localDate(now)
  let subjectPreference = 0
  let activityPreference = 0

  for (const preference of preferences) {
    if (!preference.isActive || preference.startsOn > today || preference.endsOn < today) continue
    if (preference.preferenceType === 'prefer_subject' && preference.subjectId === subjectId) {
      subjectPreference = Math.max(subjectPreference, preference.strength)
    }
    if (preference.preferenceType === 'reduce_subject' && preference.subjectId === subjectId) {
      subjectPreference = -1
    }
    if (preference.preferenceType === 'prefer_activity' && preference.activityType === activityType) {
      activityPreference = Math.max(activityPreference, preference.strength)
    }
  }

  if (subjectPreference === -1) return -1
  return Math.max(subjectPreference, activityPreference) as 0 | 1 | 2 | 3
}

function topicEvidenceSummary(state: ModuleLearningState, topicId: string) {
  const evidence = state.evidence.filter((item) => item.topicId === topicId)
  const percentages = evidence.map(evidencePercentage).filter((value): value is number => value !== null)
  const understanding = percentages.length === 0
    ? null
    : percentages.reduce((sum, value) => sum + value, 0) / percentages.length / 100
  const evidenceStrength = Math.min(1, evidence.length / 4)
  return { evidence, understanding, evidenceStrength }
}

export function activityForTopic(state: ModuleLearningState, topicId: string, daysUntilAssessment: number, understanding: number | null, moduleId?: string, allowOption = false) {
  if ((state.recommendation?.topicId === topicId && state.recommendation.activity === 'exam-question'
    || daysUntilAssessment <= 21 && understanding !== null && understanding >= 0.55)
    && exactExamTarget(state, topicId, moduleId, allowOption)) return 'exam-question'
  const hasQuickCheck = state.adapter.listQuestions(topicId).length > 0
  const hasFlashcards = state.adapter.listFlashcards(topicId).length > 0
  if (state.recommendation?.topicId === topicId && state.recommendation.activity === 'flashcards' && hasFlashcards) return 'flashcards'
  if (hasQuickCheck) return 'quick-check'
  if (hasFlashcards) return 'flashcards'
  return null
}

/** Published single-question assets only; optional content requires an explicit scoped selection. */
export function exactExamTarget(state: ModuleLearningState, topicId: string, moduleId?: string, allowOption = false) {
  for (const adapter of state.course?.modules ?? [state.adapter]) {
    if (moduleId && adapter.manifest.id !== moduleId || adapter.manifest.status !== 'available') continue
    for (const exam of adapter.listExams()) {
      if (exam.restrictedPilot) continue
      const matches = exam.questions.filter((q) => q.topic === topicId && (allowOption || !q.choiceGroup))
      const question = matches.find((q) => q.marks >= 4) ?? matches[0]
      if (question) return { moduleId: adapter.manifest.id, examId: exam.id, questionId: question.id }
    }
  }
  return undefined
}

export function scopeTopicIds(assessment: Pick<RevisionAssessment, 'scope' | 'moduleId'>, state: ModuleLearningState) {
  if (Object.keys(assessment.scope).some((key) => key !== 'topicIds')) return []
  const explicit = assessment.scope.topicIds
  if (explicit !== undefined && (!Array.isArray(explicit) || explicit.length === 0 || explicit.some((id) => typeof id !== 'string'))) return []
  const modules = state.course?.modules ?? [state.adapter]
  const module = assessment.moduleId ? modules.find((adapter) => adapter.manifest.id === assessment.moduleId) : undefined
  if (assessment.moduleId && !module) return []
  const available = new Set(state.adapter.listTopics().map((topic) => topic.id))
  if (module) {
    const guide = examPapersFor(module.manifest.examBoard.name, module.manifest.specificationCode)
    const paper = guide?.papers.find((item) => item.number === module.manifest.paper.number)
    if (guide && !paper) return []
    // Multi-paper shared packs need an assured mapping; a component's manifest
    // is sufficient only for a standalone/component-specific learning state.
    if (!paper && state.course?.sharedLearning && modules.length > 1) return []
    const mapped = paper?.topics === 'all' ? available : new Set(paper?.topics ?? module.manifest.topicIds)
    for (const id of available) if (!mapped.has(id)) available.delete(id)
  }
  if (explicit && (explicit as string[]).some((id) => !available.has(id))) return []

  // Option metadata belongs to the published exam assets. An explicit topic scope
  // is the only existing selection input; missing or conflicting choices fail closed.
  const optionGroups = new Map<string, Set<string>>()
  for (const adapter of modules) for (const exam of adapter.listExams?.() ?? []) {
    for (const question of exam.questions) {
      if (!question.choiceGroup || !question.choiceOption) continue
      const key = `${adapter.manifest.id}:${question.choiceGroup}`
      const group = optionGroups.get(key) ?? new Set<string>()
      group.add(question.topic)
      optionGroups.set(key, group)
    }
  }
  const selected = new Set(explicit as string[] | undefined)
  for (const group of optionGroups.values()) {
    const choices = [...group].filter((id) => selected.has(id))
    if (choices.length > 1) return []
    for (const id of group) if (!selected.has(id)) available.delete(id)
  }
  return explicit ? [...new Set(explicit as string[])] : [...available]
}

export function plannerCandidatesFromLearningState(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
): PlannerCandidate[] {
  const candidates = assessments.flatMap((assessment) => {
    const daysUntilAssessment = dayDifference(now, assessment.assessmentDate)
    if (!Number.isFinite(daysUntilAssessment) || daysUntilAssessment <= 0 || !assessment.isActive) return []

    const state = stateForAssessment(states, assessment)
    if (!state) return []
    const courseId = courseIdForLearningState(state)
    const topicIds = scopeTopicIds(assessment, state)
    const courseCoverage = state.topicCount === 0 ? 1 : state.evidencedTopics / state.topicCount

    return topicIds.flatMap((topicId) => {
      const summary = topicEvidenceSummary(state, topicId)
      let activityType = activityForTopic(state, topicId, daysUntilAssessment, summary.understanding, assessment.moduleId ?? undefined, Array.isArray(assessment.scope.topicIds))
      const examTarget = activityType === 'exam-question' ? exactExamTarget(state, topicId, assessment.moduleId ?? undefined, Array.isArray(assessment.scope.topicIds)) : undefined
      if (activityType === 'exam-question' && !examTarget) activityType = state.adapter.listQuestions(topicId).length ? 'quick-check' : state.adapter.listFlashcards(topicId).length ? 'flashcards' : null
      if (!activityType) return []
      const topicCoverage = summary.evidence.length > 0 ? 1 : 0
      const evidenceStrength = summary.evidence.length === 0
        ? Math.min(0.2, confidenceStrength(state.readiness.confidence))
        : Math.max(summary.evidenceStrength, confidenceStrength(state.readiness.confidence) * 0.5)

      const shared = state.course?.sharedLearning === true
      const moduleId = shared ? undefined : state.adapter.manifest.id
      const targetModule = assessment.moduleId ? (state.course?.modules ?? [state.adapter]).find((adapter) => adapter.manifest.id === assessment.moduleId) : undefined
      return [{
        id: `${courseId}:${shared ? 'shared' : moduleId}:${topicId}:${activityType}${examTarget ? ':' + examTarget.moduleId + ':' + examTarget.questionId : ''}`,
        examTarget,
        subjectId: assessment.subjectId,
        courseId,
        assessmentId: assessment.assessmentId,
        topicId,
        activityType,
        estimatedMinutes: estimatedMinutes(activityType),
        daysUntilAssessment,
        assessmentImportance: assessment.relativeImportance,
        coverage: Math.min(topicCoverage, courseCoverage + 0.4),
        evidenceStrength,
        understanding: summary.understanding,
        readiness: state.readiness.score === null ? null : state.readiness.score / 100,
        examWeight: null,
        learnerPreference: learnerPreferenceForCandidate(preferences, assessment.subjectId, activityType, now),
        recentlyCompleted: recentlyCompletedTopic(state, topicId, now),
        moduleId,
        assessmentTargets: [{
          assessmentId: assessment.assessmentId,
          moduleId: targetModule?.manifest.id,
          paperId: targetModule?.manifest.paper.id,
          assessmentDate: assessment.assessmentDate,
          topicIds,
          daysUntilAssessment,
          assessmentImportance: assessment.relativeImportance,
        }],
      } satisfies PlannerCandidate]
    })
  })
  const obligations = new Map<string, PlannerCandidate>()
  for (const candidate of candidates) {
    const existing = obligations.get(candidate.id)
    if (!existing) obligations.set(candidate.id, candidate)
    else existing.assessmentTargets = [...existing.assessmentTargets ?? [], ...candidate.assessmentTargets ?? []]
  }
  return [...obligations.values()].map((candidate) => {
    const targets = [...candidate.assessmentTargets ?? []].sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate) || left.assessmentId.localeCompare(right.assessmentId))
    const nearest = targets[0]
    return { ...candidate, assessmentTargets: targets, assessmentId: nearest.assessmentId, daysUntilAssessment: nearest.daysUntilAssessment, assessmentImportance: nearest.assessmentImportance }
  })
}


/** Programme decision consumes the approved Topic Knowledge engine; a raw
 * average of a handful of answers must not confer mastery. An assured Learn
 * page is a supported starting treatment where scored evidence is absent.
 */
export function preparationCandidatesFromLearningState(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
): PlannerCandidate[] {
  return plannerCandidatesFromLearningState(states, assessments, preferences, now).flatMap((candidate): PlannerCandidate[] => {
    const state = states.find((value) => courseIdForLearningState(value) === candidate.courseId
      && value.adapter.getTopic(candidate.topicId)
      && (!candidate.moduleId || value.adapter.manifest.id === candidate.moduleId))
    const knowledge = state?.topicKnowledge?.topics.find((item) => item.topicId === candidate.topicId)
    const score = knowledge?.score == null ? null : knowledge.score / 100
    const strength = Math.min(1, (knowledge?.distinctContentItems ?? 0) / 6)
    const evidenceStrength = score === null ? Math.min(strength, 0.5) : strength
    // Existing scored observations can justify checking further breadth; do not
    // force a fresh Learn page merely because the evidence sufficiency gate
    // has not yet reached a publishable knowledge score.
    const needsFoundation = score === null && (knowledge?.distinctContentItems ?? 0) === 0
    const chapter = needsFoundation ? state?.adapter.listLearnChapters?.().find((item) => item.topicId === candidate.topicId) : undefined
    const page = chapter?.groups.flatMap((group) => group.pages).find((item) => item.topicId === candidate.topicId)
    // A verified exact exam intent must not be silently substituted with Learn.
    const practice = { ...candidate, understanding: score, evidenceStrength }
    if (page && candidate.activityType !== 'exam-question') {
      // Teaching and checking are two different preparation opportunities.
      // Neither is evidence of mastery until a legitimate scored result exists.
      // Their independent IDs allow a real sequence instead of repeating Learn.
      const learn: PlannerCandidate = {
        ...practice, id: `${candidate.id}:learn:${page.id}`,
        activityType: 'learn', estimatedMinutes: 15, understanding: null,
        learnTarget: { learnPageId: page.id, moduleId: candidate.moduleId },
        examTarget: undefined, preparationStage: 'acquire',
      }
      const checked: PlannerCandidate = { ...practice,
        preparationStage: 'check', preparationPrerequisiteId: learn.id }
      return [learn, checked, ...paperPractice(checked)]
    }
    return [practice, ...paperPractice(practice)]

    function paperPractice(known: PlannerCandidate): PlannerCandidate[] {
      // The published Question Bank's exact module/paper question is the only
      // permission to forecast exam-response practice. Shared knowledge
      // remains one obligation; genuine paper demands are separate intents.
      if (!state || candidate.activityType === 'exam-question') return []
      return (candidate.assessmentTargets ?? []).flatMap((target): PlannerCandidate[] => {
        if (!target.moduleId || !target.paperId || !target.topicIds.includes(candidate.topicId)) return []
        const exact = exactExamTarget(state, candidate.topicId, target.moduleId, true)
        if (!exact) return []
        const module = (state.course?.modules ?? [state.adapter]).find((adapter) =>
          adapter.manifest.id === exact.moduleId && adapter.manifest.status === 'available')
        const question = module?.getExam(exact.examId)?.questions.find((entry) =>
          entry.id === exact.questionId && entry.topic === candidate.topicId)
        const guide = module ? examPapersFor(module.manifest.examBoard.name, module.manifest.specificationCode) : null
        const paper = guide?.papers.find((entry) => entry.number === module?.manifest.paper.number)
        const sectionIndex = question?.sectionLabel ? paper?.sections.findIndex((section) =>
          section.name.trim().toLowerCase() === question.sectionLabel?.trim().toLowerCase()) : undefined
        const mappedSection = sectionIndex !== undefined && sectionIndex >= 0
          ? paper?.sections[sectionIndex] : undefined
        return [{
          ...known, id: `${candidate.id}:exam:${target.assessmentId}:${exact.moduleId}:${exact.questionId}`,
          activityType: 'exam-question', estimatedMinutes: estimatedMinutes('exam-question'),
          assessmentId: target.assessmentId, daysUntilAssessment: target.daysUntilAssessment,
          assessmentImportance: target.assessmentImportance,
          assessmentTargets: [target], moduleId: exact.moduleId, examTarget: exact,
          learnTarget: undefined, preparationStage: 'exam-practice',
          paperResponseSectionId: mappedSection ? `${target.assessmentId}:section:${sectionIndex! + 1}` : undefined,
          paperResponseFormat: mappedSection?.type,
          preparationPrerequisiteId: known.id,
        }]
      })
    }
  })
}

/** The sole educational preparation decision shared by the programme and Today. */
export function buildLearnerPreparationProgramme(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  availability: RevisionAvailabilityProfile | null,
  exceptions: readonly RevisionAvailabilityException[],
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
  acceptedSessions: readonly PlannedSession[] | null = [],
  acceptedLoadedThrough?: string,
) {
  const today = localDate(now)
  const verified = assessments.flatMap((assessment) => {
    const state = stateForAssessment(states, assessment)
    if (!state) return []
    return [{
      assessmentId: assessment.assessmentId, subjectId: assessment.subjectId,
      courseId: courseIdForLearningState(state), title: assessment.title,
      assessmentDate: assessment.assessmentDate, isActive: assessment.isActive,
    }]
  })
  const active = new Set(states.map(courseIdForLearningState))
  // The educational requirement inventory must not be narrowed by accepted
  // sessions. Accepted work consumes planning capacity; it does not remove
  // its course topic from the real examination's scope or certify learning.
  const supported = preparationCandidatesFromLearningState(states, assessments, preferences, now)
  const candidates = withoutPlannedTopics(supported, acceptedSessions ?? [])
  const horizon = buildPlannerProgramme(today, verified, active, candidates)
  const nearThrough = acceptedLoadedThrough ??
    localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 59))
  const prepared = buildPreparationProgramme(horizon, candidates, (week) =>
    focusMinutesAfterKnownCommitments(week, availability?.weeklyMinutes ?? null,
      exceptions, acceptedSessions, nearThrough),
    (week, deadline) => {
      if (!availability) return null
      const eligibleKeys = weekKeys(week.weekStart)
        .filter((key) => key >= week.visibleFrom && key <= week.visibleUntil && key < deadline)
      const values = eligibleKeys.map((key) => capacityOn(key, availability.weeklyMinutes, exceptions))
      if (values.some((value) => value === null || !Number.isFinite(value) || value < 0)) return null
      if (acceptedSessions === null && eligibleKeys.some((key) => key <= nearThrough)) return null
      const raw = values.reduce<number>((total, value) => total + (value ?? 0), 0)
      if (week.visibleUntil > nearThrough) return raw // distant bookings not fetched
      const booked = (acceptedSessions ?? []).filter((item) => item.status !== 'skipped'
        && eligibleKeys.includes(item.plannedDate))
        .reduce((total, item) => total + Math.max(0, item.minutes), 0)
      return Math.max(0, raw - booked)
    })
  // Course Truth and verified paper scope define WHAT is required. Supported
  // activities and allocated goals are joined afterwards as separate claims.
  // In particular, an accepted session must not make a topic disappear.
  const requirementMap = new Map<string, PreparationKnowledgeRequirement>()
  const missing = new Map<string, { courseId: string; topicId: string; reason: string }>()
  const applicable = assessments.filter((entry) =>
    entry.isActive && validDateKey(entry.assessmentDate) && entry.assessmentDate > today)
  for (const assessment of applicable) {
    const state = stateForAssessment(states, assessment)
    if (!state) continue
    const courseId = courseIdForLearningState(state)
    const requiredTopics = scopeTopicIds(assessment, state)
    for (const topicId of requiredTopics) {
      const key = `${courseId}:${topicId}`
      let requirement = requirementMap.get(key)
      if (!requirement) {
        const knowledge = state.topicKnowledge?.topics.find((topic) => topic.topicId === topicId)
        const score = knowledge?.score
        const evidenceStatus: PreparationKnowledgeRequirement['evidenceStatus'] =
          score === null || score === undefined ? 'unknown'
            : score < 55 ? 'needs-work'
              : (knowledge?.distinctContentItems ?? 0) < 4 ? 'provisional' : 'supported'
        requirement = {
          courseId, topicId, papers: [], evidenceStatus,
          supportedCandidateIds: [], allocatedCandidateIds: [],
          hasAcceptedSession: false,
        }
        requirementMap.set(key, requirement)
      }
      if (!requirement.papers.some((paper) => paper.assessmentId === assessment.assessmentId)) {
        requirement.papers.push({ assessmentId: assessment.assessmentId,
          assessmentDate: assessment.assessmentDate })
      }
    }
    if (!requiredTopics.length) {
      missing.set(`${courseId}:paper:${assessment.assessmentId}`, {
        courseId, topicId: '',
        reason: `Paper scope for ${assessment.title} is unresolved or unsupported; no topic was assumed.`,
      })
    }
  }
  const allocatedByRequirement = new Map<string, Set<string>>()
  for (const week of prepared.weeks) for (const objective of week.objectives) {
    const key = `${objective.courseId}:${objective.topicId}`
    const ids = allocatedByRequirement.get(key) ?? new Set<string>()
    ids.add(objective.candidateId)
    allocatedByRequirement.set(key, ids)
  }
  for (const requirement of requirementMap.values()) {
    requirement.papers.sort((a, b) => a.assessmentDate.localeCompare(b.assessmentDate)
      || a.assessmentId.localeCompare(b.assessmentId))
    const matching = supported.filter((candidate) =>
      candidate.courseId === requirement.courseId && candidate.topicId === requirement.topicId
      && candidate.assessmentTargets?.some((target) => requirement.papers.some((paper) =>
        paper.assessmentId === target.assessmentId && paper.assessmentDate === target.assessmentDate)))
    requirement.supportedCandidateIds = [...new Set(matching.map((item) => item.id))].sort()
    requirement.allocatedCandidateIds = [...allocatedByRequirement.get(
      `${requirement.courseId}:${requirement.topicId}`) ?? []].sort()
    // Only positive evidence from the *bounded* accepted-session read is
    // reported. False does not claim distant sessions were queried.
    requirement.hasAcceptedSession = (acceptedSessions ?? []).some((session) =>
      session.courseId === requirement.courseId && session.topicId === requirement.topicId
      && session.status !== 'skipped' && session.plannedDate >= today
      && requirement.papers.some((paper) => session.plannedDate < paper.assessmentDate))
    if (!requirement.supportedCandidateIds.length) {
      const key = `${requirement.courseId}:${requirement.topicId}`
      missing.set(key, {
        courseId: requirement.courseId, topicId: requirement.topicId,
        reason: 'The approved course/paper mapping requires this topic, but no verified supported activity is available.',
      })
    }
  }
  const requirements = [...requirementMap.values()].sort((a, b) =>
    a.courseId.localeCompare(b.courseId) || a.topicId.localeCompare(b.topicId))
  const unsupportedRequirements = [...missing.values()].sort((a, b) =>
    a.courseId.localeCompare(b.courseId) || a.topicId.localeCompare(b.topicId))
  // Paper-response intelligence is a factual capability summary, not a
  // learner-readiness score or permission to schedule an unapproved mock.
  const verifiedPaperDemands = assessments.flatMap((assessment) => {
    if (!assessment.isActive || assessment.assessmentDate <= today || !assessment.moduleId) return []
    const state = stateForAssessment(states, assessment)
    const module = (state?.course?.modules ?? (state ? [state.adapter] : []))
      .find((adapter) => adapter.manifest.id === assessment.moduleId
        && adapter.manifest.status === 'available')
    if (!state || !module) return []
    const scoped = new Set(scopeTopicIds(assessment, state))
    if (!scoped.size) return []
    const questions = module.listExams().filter((exam) => !exam.restrictedPilot)
      .flatMap((exam) => exam.questions.map((question) => ({ examId: exam.id, question })))
      .filter(({ question }) => scoped.has(question.topic)
        && (!question.choiceGroup || Array.isArray(assessment.scope.topicIds)
          && (assessment.scope.topicIds as string[]).includes(question.topic)))
    const distinct = [...new Map(questions.map(({ examId, question }) =>
      [`${examId}:${question.id}`, question])).values()]
    if (!distinct.length) return []
    const aos = ['ao1', 'ao2', 'ao3', 'ao4'] as const
    return [{
      courseId: courseIdForLearningState(state), assessmentId: assessment.assessmentId,
      title: assessment.title, date: assessment.assessmentDate,
      questionCount: distinct.length,
      assessmentObjectives: aos.filter((ao) => distinct.some((question) => question.assessmentObjectives[ao] > 0))
        .map((ao) => ao.toUpperCase()),
    }]
  })
  // Exam Truth supplies distinct response formats that knowing the topic
  // cannot establish. Do not assume a candidate exam question covers every
  // section: only a verified exact question with matching section provenance
  // creates an attributed opportunity, still not exam readiness evidence.
  const allocatedCandidateIds = new Set(prepared.weeks.flatMap((week) =>
    week.objectives.map((objective) => objective.candidateId)))
  const paperResponseRequirements: PreparationPaperResponseRequirement[] = []
  for (const assessment of applicable) {
    if (!assessment.moduleId) continue
    const state = stateForAssessment(states, assessment)
    if (!state) continue
    const adapter = (state.course?.modules ?? [state.adapter]).find((module) =>
      module.manifest.id === assessment.moduleId && module.manifest.status === 'available')
    if (!adapter) continue
    const guide = examPapersFor(adapter.manifest.examBoard.name, adapter.manifest.specificationCode)
    const paper = guide?.papers.find((entry) => entry.number === adapter.manifest.paper.number)
    const scopedTopics = new Set(scopeTopicIds(assessment, state))
    if (!paper || !scopedTopics.size) continue
    const eligiblePractice = supported.flatMap((candidate) => {
      const exact = candidate.examTarget
      if (!exact || candidate.activityType !== 'exam-question'
        || exact.moduleId !== adapter.manifest.id || !scopedTopics.has(candidate.topicId)
        || !candidate.assessmentTargets?.some((target) => target.assessmentId === assessment.assessmentId
          && target.assessmentDate === assessment.assessmentDate)) return []
      const question = adapter.getExam(exact.examId)?.questions.find((entry) =>
        entry.id === exact.questionId && entry.topic === candidate.topicId)
      if (!question || question.choiceGroup &&
        (!Array.isArray(assessment.scope.topicIds)
          || !assessment.scope.topicIds.includes(question.topic))) return []
      return [{ candidateId: candidate.id, question }]
    })
    paper.sections.forEach((section, sectionIndex) => {
      const matched = eligiblePractice.filter(({ question }) =>
        question.sectionLabel?.trim().toLowerCase() === section.name.trim().toLowerCase())
      const ids = [...new Set(matched.map((item) => item.candidateId))].sort()
      const aos = ['ao1', 'ao2', 'ao3', 'ao4'] as const
      paperResponseRequirements.push({
        courseId: courseIdForLearningState(state),
        assessmentId: assessment.assessmentId,
        assessmentDate: assessment.assessmentDate,
        sectionId: `${assessment.assessmentId}:section:${sectionIndex + 1}`,
        sectionName: section.name,
        responseFormat: section.type,
        marks: section.marks,
        verifiedPracticeCandidateIds: ids,
        allocatedPracticeCandidateIds: ids.filter((id) => allocatedCandidateIds.has(id)),
        verifiedAssessmentObjectives: aos.filter((ao) => matched.some(({ question }) =>
          question.assessmentObjectives[ao] > 0)).map((ao) => ao.toUpperCase()),
      })
    })
  }
  paperResponseRequirements.sort((a, b) => a.assessmentDate.localeCompare(b.assessmentDate)
    || a.courseId.localeCompare(b.courseId) || a.sectionId.localeCompare(b.sectionId))
  const unmetResponseSections = paperResponseRequirements.filter((requirement) =>
    !requirement.verifiedPracticeCandidateIds.length)
  const responseConstraint = unmetResponseSections.length
    ? `${unmetResponseSections.length} verified paper response sections do not yet have an exact section-mapped practice opportunity. Their preparation cannot be claimed covered.`
    : null
  const programme = { ...prepared, requirements, paperResponseRequirements, unsupportedRequirements, verifiedPaperDemands,
    constraints: [
      ...prepared.constraints,
      ...(unsupportedRequirements.length
        ? [`${unsupportedRequirements.length} applicable topic or paper requirements lack verified activity or option scope; the schedule cannot claim complete syllabus preparation.`]
        : []),
      ...(responseConstraint ? [responseConstraint] : []),
    ] }
  return { programme, candidates }
}

export function plannerDaysFromAvailability(
  availability: RevisionAvailabilityProfile | null,
  exceptions: readonly RevisionAvailabilityException[],
  assessments: readonly RevisionAssessment[],
  now = new Date(),
): PlannerDay[] {
  if (!availability) return []
  const furthestRelevant = assessments.reduce((max, assessment) => {
    if (!assessment.isActive || !validDateKey(assessment.assessmentDate)) return max
    return Math.max(max, Math.max(0, dayDifference(now, assessment.assessmentDate)))
  }, 0)
  const horizon = Math.min(60, Math.max(1, furthestRelevant + 1, 28))
  const overrideByDate = new Map(exceptions.map((item) => [item.localDate, item.availableMinutes]))

  return Array.from({ length: horizon }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    const dateKey = localDate(date)
    const overridden = overrideByDate.get(dateKey)
    const dayKey = weekDayByJsDay[date.getDay()] ?? 'monday'
    return {
      date: dateKey,
      availableMinutes: overridden ?? availability.weeklyMinutes[dayKey],
    }
  })
}

export function buildPlannerSnapshot(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  availability: RevisionAvailabilityProfile | null,
  exceptions: readonly RevisionAvailabilityException[],
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
  acceptedSessions: readonly PlannedSession[] = [],
  detailedHorizonDays = 60,
): PlannerResult | null {
  // Sessions the student accepted are already placed: the derived plan works around them.
  const { programme, candidates } = buildLearnerPreparationProgramme(
    states, assessments, availability, exceptions, preferences, now, acceptedSessions)
  const boundedDays = plannerDaysFromAvailability(availability, exceptions, assessments, now)
    .slice(0, Math.max(1, Math.min(60, detailedHorizonDays)))
  const days = applyAcceptedSessionsToDays(boundedDays, acceptedSessions)
  if (candidates.length === 0 || days.length === 0) return null
  const lastDetailedDay = days.at(-1)?.date
  const goals = programme.weeks.flatMap((week) =>
    week.visibleFrom <= (lastDetailedDay ?? '') ? week.objectives.map((objective) => ({
      id: objective.candidateId, firstDate: week.visibleFrom, lastDate: week.visibleUntil,
    })) : [])
  const selectedWeeks = new Map(goals.map((goal) => [goal.id, goal]))
  const selected = candidates.filter((candidate) => selectedWeeks.has(candidate.id))
    .map((candidate) => ({ ...candidate,
      earliestEligibleDate: selectedWeeks.get(candidate.id)?.firstDate,
      latestEligibleDate: selectedWeeks.get(candidate.id)?.lastDate,
    }))
  const totalKnownCapacity = programme.weeks.reduce((sum, week) =>
    sum + (week.availableMinutes ?? 0), 0)
  const underCapacity = programme.unserved.length > 0 && programme.weeks.every((week) => week.availableMinutes !== null)
  const result = buildAdaptivePlan(selected, days, underCapacity ? 'prioritising' : undefined)
  return { ...result, capacityState: underCapacity ? 'prioritising' : result.capacityState,
    requiredUsefulMinutes: programme.requiredMinutes,
    remainingCapacityMinutes: totalKnownCapacity }
}
