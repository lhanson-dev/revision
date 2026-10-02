import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import { rankSuggestions } from './rev-suggestions'
import { understandingCounts } from './topic-status'
import { learningStatusMeta, type LearningStatus } from './ui'

/**
 * What the Progress screens say, worked out from the student's real answers (decisions file section 3).
 * Three measures, never blended: Topics covered, Understanding, Exam readiness. No predicted grade.
 */
export type ProgressMeasuresData = {
  covered: number
  total: number
  understanding: Partial<Record<LearningStatus, number>>
}

export function progressMeasuresFor(states: readonly ModuleLearningState[]): ProgressMeasuresData {
  return {
    covered: states.reduce((sum, state) => sum + state.evidencedTopics, 0),
    total: states.reduce((sum, state) => sum + state.topicCount, 0),
    understanding: understandingCounts(states),
  }
}

export type ReadinessData = {
  /** The engine's value, or null for "Not enough evidence yet". */
  value: string | null
  /** How it was worked out, or what would unlock it. */
  note: string
}

/** The readiness of one course or paper, exactly as the engine produced it. */
export function readinessFor(state: ModuleLearningState): ReadinessData {
  if (state.readiness.score === null) return { value: null, note: state.readiness.progress.nextStep }
  return {
    value: `${state.readiness.score}%`,
    note: `Worked out from ${state.readiness.evidenceCount} scored attempts across ${state.readiness.familyCount} kinds of activity. Confidence: ${state.readiness.confidence}.`,
  }
}

/**
 * Readiness across several courses is never averaged into one number. It says how many have enough evidence,
 * and each course shows its own value.
 */
export function readinessAcross(states: readonly ModuleLearningState[]): ReadinessData {
  const ready = states.filter((state) => state.readiness.score !== null).length
  if (ready === 0) return { value: null, note: 'Each course shows its own readiness once there is enough varied work in it.' }
  return { value: `${ready} of ${states.length}`, note: 'Courses with enough varied work for a readiness estimate. Each course shows its own, below.' }
}

/** The plain sentence that opens a Progress screen, before any numbers. */
export function progressSummarySentence(measures: ProgressMeasuresData, nextTopicName: string | null): string {
  if (measures.total === 0) return 'There are no topics to show yet.'
  if (measures.covered === 0) {
    return nextTopicName
      ? `You haven’t answered anything yet. Start with ${nextTopicName} and your progress will build here.`
      : 'You haven’t answered anything yet. Your progress will build here as you work.'
  }
  const rated = (['gotit', 'nearly', 'needswork'] as const)
    .filter((status) => (measures.understanding[status] ?? 0) > 0)
    .map((status) => `${measures.understanding[status]} ${learningStatusMeta[status].label.toLowerCase()}`)
  const covered = `You’ve covered ${measures.covered} of ${measures.total} topics.`
  if (rated.length === 0) return `${covered} None are rated yet: a topic is rated once you’ve answered enough varied questions in it.`
  return `${covered} So far: ${rated.join(', ')}.`
}

export type ProgressNextAction = { label: string; courseId: string; section: 'practice' | 'exam-prep'; topicName: string; reason: string }

/** One next action, chosen by REV's rules (not a model), or null when there is nothing to suggest. */
export function nextProgressAction(
  states: readonly ModuleLearningState[],
  programme: readonly LearnerProgrammeCourse[],
  now: Date,
): ProgressNextAction | null {
  const top = rankSuggestions(states, [], programme, now)[0]
  if (!top) return null
  const section = top.task.activityType === 'exam-question' ? 'exam-prep' : 'practice'
  return {
    label: `Practise ${top.task.topicLabel}`,
    courseId: top.task.courseId,
    section,
    topicName: top.task.topicLabel,
    reason: top.reason,
  }
}

/** The optional "How this is worked out" note: three plain sentences at most. */
export const HOW_THIS_IS_WORKED_OUT: readonly string[] = [
  'Topics covered counts the topics where you’ve answered at least one question.',
  'Understanding sorts each topic by how your answers have gone, once there are enough varied answers to tell.',
  'Exam readiness only appears when there’s enough varied work, and it’s never a predicted grade.',
]
