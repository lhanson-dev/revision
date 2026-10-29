import { isTopicScopedEvidence } from '../engine/evidence/evidence'
import type { PlannedSession } from '../services/planning/planned-session-service'
import { applyAcceptedSessionsToDays, withoutPlannedTopics } from './accepted-sessions'
import { GOOD_SCORE_MIN, MEDIUM_SCORE_MIN } from '../engine/knowledge/topic-knowledge'
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
import { focusedActivityMinutes } from './focused-activity-dose'

function confidenceStrength(confidence: ModuleLearningState['readiness']['confidence']) {
  if (confidence === 'high') return 1
  if (confidence === 'medium') return 0.75
  if (confidence === 'low') return 0.5
  return 0.2
}

function estimatedMinutes(activity: string, state?: ModuleLearningState, topicId?: string) {
  if (activity === 'exam-question') return 30
  if (activity === 'learn') return 15
  if (activity === 'quick-check' && state && topicId) return focusedActivityMinutes('quick-check', state.adapter.listQuestions(topicId).length)
  if (activity === 'flashcards' && state && topicId) return focusedActivityMinutes('flashcards', state.adapter.listFlashcards(topicId).length)
  return 0
}

/** An exact focused question is not a 30-minute generic activity. Allocate
 * its share of the published paper's exam duration and attempted marks,
 * rounded up to whole five-minute calendar slots for answering/self-marking.
 * This is an operational estimate, not measured learner speed or an optimal
 * pedagogic interval. Missing/mismatched sources retain the safe fallback.
 */
function focusedQuestionMinutes(
  state: ModuleLearningState | undefined,
  target: NonNullable<PlannerCandidate['examTarget']> | undefined,
) {
  if (!state || !target) return estimatedMinutes('exam-question')
  const module = (state.course?.modules ?? [state.adapter]).find((part) =>
    part.manifest.id === target.moduleId && part.manifest.status === 'available')
  const exam = module?.getExam(target.examId)
  const question = exam?.questions.find((entry) => entry.id === target.questionId)
  if (!exam || !question || !(question.marks > 0) || !(exam.totalMarks > 0)
    || !(exam.durationMinutes > 0)) return estimatedMinutes('exam-question')
  const share = exam.durationMinutes * question.marks / exam.totalMarks
  return Math.min(exam.durationMinutes, Math.max(5, Math.ceil(share / 5) * 5))
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
  return state.evidence.some((item) => isTopicScopedEvidence(item) && item.topicId === topicId && new Date(item.occurredAt).getTime() >= cutoff)
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
  const evidence = state.evidence.filter((item) => isTopicScopedEvidence(item) && item.topicId === topicId)
  // Planning must not infer a supported understanding score from a few answers:
  // the existing Topic Knowledge engine owns sufficiency, distinct-item
  // de-duplication and evidence-family weighting.
  const score = state.topicKnowledge?.topics.find((item) => item.topicId === topicId)?.score
  const understanding = score === null || score === undefined ? null : score / 100
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
      const matches = exam.questions.filter((q) => q.topic === topicId && (allowOption || !q.choiceGroup || q.choiceKind === 'paper-alternative'))
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
      if (!question.choiceGroup || !question.choiceOption || question.choiceKind === 'paper-alternative') continue
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
        estimatedMinutes: activityType === 'exam-question'
          ? focusedQuestionMinutes(state, examTarget) : estimatedMinutes(activityType, state, topicId),
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


/** A published response section is only claimable when the learner-facing
 * question has the matching supported interaction, not just its label.
 * A written input is NOT a multiple-choice question, and an unstructured
 * combined essay prompt is not a verified choose-one-of-two interaction.
 */
function supportsPaperResponseFormat(
  question: { responseType?: 'multiple-choice' | 'written'; options?: readonly { label: string; text: string }[];
    choiceGroup?: string | null; choiceOption?: string | null;
    choiceKind?: 'paper-alternative' | 'syllabus-option' }, 
  section: { type: string },
) {
  const type = section.type.toLowerCase()
  if (type.includes('multiple choice')) {
    return question.responseType === 'multiple-choice' && (question.options?.length ?? 0) >= 2
  }
  if (type.includes('one essay from two')) {
    return question.responseType !== 'multiple-choice' && question.choiceKind === 'paper-alternative'
      && !!question.choiceGroup && !!question.choiceOption
  }
  return question.responseType !== 'multiple-choice'
}

/** Only the published paper's exact question section can attach a response
 * requirement to a supported question. Never infer a section from a topic,
 * paper proximity, question marks or an unapproved coaching note. */
function verifiedPaperResponseSection(
  state: ModuleLearningState,
  target: NonNullable<PlannerCandidate['examTarget']>,
  assessmentId: string,
  topicId: string,
): { id: string; format: string } | null {
  const module = (state.course?.modules ?? [state.adapter]).find((adapter) =>
    adapter.manifest.id === target.moduleId && adapter.manifest.status === 'available')
  const question = module?.getExam(target.examId)?.questions.find((entry) =>
    entry.id === target.questionId && entry.topic === topicId)
  if (!module || !question?.sectionLabel) return null
  const guide = examPapersFor(module.manifest.examBoard.name, module.manifest.specificationCode)
  const paper = guide?.papers.find((entry) => entry.number === module.manifest.paper.number)
  const index = paper?.sections.findIndex((section) =>
    section.name.trim().toLowerCase() === question.sectionLabel?.trim().toLowerCase())
  if (index === undefined || index < 0) return null
  const section = paper!.sections[index]
  if (question.sectionMarks !== section.marks || !supportsPaperResponseFormat(question, section)) return null
  return { id: `${assessmentId}:section:${index + 1}`, format: paper!.sections[index].type }
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
    // A verified weak result is not the same as an unseen topic. Where the
    // published course has a direct Learn page, offer supported explanation
    // before another independent check, without erasing the scored weakness.
    // Insufficient-but-nonzero evidence alone does not force the learner to
    // reread; a valid scored low band or no exposure is required.
    const needsSupportedExplanation =
      score !== null && score < MEDIUM_SCORE_MIN / 100
      || score === null && (knowledge?.distinctContentItems ?? 0) === 0
    const chapter = needsSupportedExplanation
      ? state?.adapter.listLearnChapters?.().find((item) => item.topicId === candidate.topicId)
      : undefined
    const page = chapter?.groups.flatMap((group) => group.pages).find((item) => item.topicId === candidate.topicId)
    // A verified exact exam intent must not be silently substituted with Learn.
    const directSection = state && candidate.examTarget
      ? verifiedPaperResponseSection(state, candidate.examTarget, candidate.assessmentId, candidate.topicId)
      : null
    const practice: PlannerCandidate = { ...candidate, understanding: score, evidenceStrength,
      paperResponseSectionId: directSection?.id, paperResponseFormat: directSection?.format }
    // A quick check and independent recall test different supported material.
    // Offer an additional retrieval session only for *published, unattempted*
    // cards. Scored evidence, rather than an arbitrary timer or a calendar
    // appearance, determines whether those cards have already been used.
    const unseenCards = state?.adapter.listFlashcards(candidate.topicId)
      .filter((card) => !state.evidence.some((evidence) =>
        evidence.source === 'flashcard' && evidence.contentId === card.id))
      .slice(0, 8) ?? []
    const canRetrieve = candidate.activityType === 'quick-check'
      && unseenCards.length > 0
      && (score === null || score < MEDIUM_SCORE_MIN / 100 || evidenceStrength < 0.6)
    const retrieval = (prerequisite?: string): PlannerCandidate[] => canRetrieve ? [{
      ...practice, id: `${candidate.id}:retrieve:${unseenCards[0]!.id}`,
      activityType: 'flashcards', estimatedMinutes: focusedActivityMinutes('flashcards', unseenCards.length),
      preparationStage: 'check', preparationPrerequisiteId: prerequisite,
      examTarget: undefined, retrievalContentIds: unseenCards.map((card) => card.id),
    }] : []
    if (page && candidate.activityType !== 'exam-question') {
      // Teaching and checking are two different preparation opportunities.
      // Neither is evidence of mastery until a legitimate scored result exists.
      // Their independent IDs allow a real sequence instead of repeating Learn.
      const learn: PlannerCandidate = {
        ...practice, id: `${candidate.id}:learn:${page.id}`,
        activityType: 'learn', estimatedMinutes: 15, understanding: score,
        learnTarget: { learnPageId: page.id, moduleId: candidate.moduleId },
        examTarget: undefined, preparationStage: 'acquire',
      }
      const checked: PlannerCandidate = { ...practice,
        preparationStage: 'check', preparationPrerequisiteId: learn.id }
      // A verified exam question already provides an independent application
      // opportunity. A generic knowledge check is not a compulsory gateway
      // before exam-response practice; supported initial Learn still is.
      return [learn, checked, ...retrieval(learn.id), ...paperPractice(practice, learn.id)]
    }
    return [practice, ...retrieval(), ...paperPractice(practice)]

    function paperPractice(known: PlannerCandidate, learningPrerequisiteId?: string): PlannerCandidate[] {
      // Each exact verified paper-response section is an independent practice
      // opportunity; picking just one question per topic hides later formats.
      if (!state) return []
      return (candidate.assessmentTargets ?? []).flatMap((target): PlannerCandidate[] => {
        if (!target.moduleId || !target.paperId || !target.topicIds.includes(candidate.topicId)) return []
        const module = (state.course?.modules ?? [state.adapter]).find((part) =>
          part.manifest.id === target.moduleId && part.manifest.status === 'available')
        if (!module) return []
        const bySection = new Map<string, {
          exact: NonNullable<PlannerCandidate['examTarget']>;
          section: { id: string; format: string } | null
        }>()
        for (const exam of module.listExams()) {
          if (exam.restrictedPilot) continue
          for (const question of exam.questions) {
            if (question.topic !== candidate.topicId) continue
            const exact = { moduleId: target.moduleId, examId: exam.id, questionId: question.id }
            const section = verifiedPaperResponseSection(state, exact, target.assessmentId, candidate.topicId)
            if (section && !bySection.has(section.id)) bySection.set(section.id, { exact, section })
          }
        }
        // A valid unspecific question remains possible when the published
        // assets do not verify any named response section.
        const fallback = exactExamTarget(state, candidate.topicId, target.moduleId, true)
        const supported = bySection.size ? [...bySection.values()]
          : fallback ? [{ exact: fallback, section: null }] : []
        return supported.flatMap(({ exact, section }): PlannerCandidate[] => {
          const alreadySelected = known.activityType === 'exam-question'
            && known.assessmentId === target.assessmentId
            && known.examTarget?.moduleId === exact.moduleId
            && known.examTarget.examId === exact.examId
            && known.examTarget.questionId === exact.questionId
          if (alreadySelected) return []
          return [{
            ...known, id: `${candidate.id}:exam:${target.assessmentId}:${exact.moduleId}:${exact.questionId}`,
            activityType: 'exam-question', estimatedMinutes: focusedQuestionMinutes(state, exact),
            assessmentId: target.assessmentId, daysUntilAssessment: target.daysUntilAssessment,
            assessmentImportance: target.assessmentImportance,
            assessmentTargets: [target], moduleId: exact.moduleId, examTarget: exact,
            learnTarget: undefined, preparationStage: 'exam-practice',
            paperResponseSectionId: section?.id, paperResponseFormat: section?.format,
            // The question itself can check knowledge. Require an actual
            // missing foundation only when source-backed Learn was offered.
            preparationPrerequisiteId: learningPrerequisiteId,
          }]
        })
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
  pilotRestricted = false,
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
    .filter((candidate) => !pilotRestricted || candidate.activityType !== 'exam-question')
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
      // Deduct the loaded part of a boundary week even if its final days are
      // outside the bounded session query. The latter remain provisional.
      const remaining = eligibleKeys.reduce((total, date, i) => {
        const booked = date > nearThrough ? 0 : (acceptedSessions ?? [])
          .filter((item) => item.status !== 'skipped' && item.plannedDate === date)
          .reduce((sum, item) =>
            sum + (Number.isFinite(item.minutes) ? Math.max(0, item.minutes) : 0), 0)
        return total + Math.max(0, values[i]! - booked)
      }, 0)
      return Math.min(raw, remaining)
    },
    (week) => {
      if (!availability) return null
      // Match the same bounded accepted-session confidence used by the
      // programme's weekly capacity; distant commitments stay provisional.
      if (acceptedSessions === null
        && week.visibleFrom <= nearThrough) return null
      const days = weekKeys(week.weekStart)
        .filter((date) => date >= week.visibleFrom && date <= week.visibleUntil)
        .map((date) => {
          const configured = capacityOn(date, availability.weeklyMinutes, exceptions)
          if (configured === null || !Number.isFinite(configured) || configured < 0) return null
          const booked = date <= nearThrough ? (acceptedSessions ?? [])
            .filter((session) => session.plannedDate === date && session.status !== 'skipped')
            .reduce((sum, session) =>
              sum + (Number.isFinite(session.minutes) ? Math.max(0, session.minutes) : 0), 0) : 0
          return { date, availableMinutes: Math.max(0, configured - booked) }
        })
      return days.every((day): day is { date: string; availableMinutes: number } => day !== null)
        ? days : null
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
            : score < MEDIUM_SCORE_MIN ? 'needs-work'
              : score < GOOD_SCORE_MIN ? 'provisional' : 'supported'
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
  const verifiedPaperDemands = pilotRestricted ? [] : assessments.flatMap((assessment) => {
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
        && (!question.choiceGroup || question.choiceKind === 'paper-alternative' || Array.isArray(assessment.scope.topicIds)
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
      if (!question || question.choiceGroup && question.choiceKind !== 'paper-alternative' &&
        (!Array.isArray(assessment.scope.topicIds)
          || !assessment.scope.topicIds.includes(question.topic))) return []
      return [{ candidateId: candidate.id, question }]
    })
    paper.sections.forEach((section, sectionIndex) => {
      const matched = eligiblePractice.filter(({ question }) =>
        question.sectionLabel?.trim().toLowerCase() === section.name.trim().toLowerCase()
        && question.sectionMarks === section.marks
        && supportsPaperResponseFormat(question, section))
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
      ...(pilotRestricted ? ['Restricted pilot: original exam-style simulations and written self-marking are withheld pending independent educational review; no paper-response coverage is claimed.'] : []),
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
  pilotRestricted = false,
): PlannerResult | null {
  // Sessions the student accepted are already placed: the derived plan works around them.
  const { programme, candidates } = buildLearnerPreparationProgramme(
    states, assessments, availability, exceptions, preferences, now, acceptedSessions, undefined, pilotRestricted)
  const boundedDays = plannerDaysFromAvailability(availability, exceptions, assessments, now)
    .slice(0, Math.max(1, Math.min(60, detailedHorizonDays)))
  const days = applyAcceptedSessionsToDays(boundedDays, acceptedSessions)
  if (candidates.length === 0 || days.length === 0) return null
  const lastDetailedDay = days.at(-1)?.date
  const goals = programme.weeks.flatMap((week) =>
    week.visibleFrom <= (lastDetailedDay ?? '') ? week.objectives.map((objective) => ({
      id: objective.candidateId, firstDate: objective.forecastDate ?? week.visibleFrom,
      lastDate: objective.forecastDate ?? week.visibleUntil,
      preparationPurpose: objective.purpose, preparationReason: objective.reason,
    })) : [])
  const selectedWeeks = new Map(goals.map((goal) => [goal.id, goal]))
  const selected = candidates.filter((candidate) => selectedWeeks.has(candidate.id))
    .map((candidate) => ({ ...candidate,
      earliestEligibleDate: selectedWeeks.get(candidate.id)?.firstDate,
      latestEligibleDate: selectedWeeks.get(candidate.id)?.lastDate,
      preparationPurpose: selectedWeeks.get(candidate.id)?.preparationPurpose,
      preparationReason: selectedWeeks.get(candidate.id)?.preparationReason,
    }))
  const totalKnownCapacity = programme.weeks.reduce((sum, week) =>
    sum + (week.availableMinutes ?? 0), 0)
  const underCapacity = programme.unserved.length > 0 && programme.weeks.every((week) => week.availableMinutes !== null)
  const result = buildAdaptivePlan(selected, days, underCapacity ? 'prioritising' : undefined)
  return { ...result, capacityState: underCapacity ? 'prioritising' : result.capacityState,
    requiredUsefulMinutes: programme.requiredMinutes,
    remainingCapacityMinutes: totalKnownCapacity }
}
