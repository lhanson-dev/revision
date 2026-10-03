import type { RevisionAssessment } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import { courseIdForLearningState } from './planner-model'
import { nextProgressAction, progressMeasuresFor, progressSummarySentence, type ProgressNextAction } from './progress-summary'

/**
 * What REV can answer today, with no model (decisions file section 2, data model proposal 10.3 step 1):
 * answers built by software from the student's own plan, results and exam dates. Nothing is invented.
 * Anything else gets an honest "I can't answer that yet", never a made-up reply.
 */

export type SafeguardingLevel = 'immediate' | 'concern'

const IMMEDIATE = [
  /\bkill(ing)? myself\b/,
  /\bsuicid/,
  /\bend(ing)? (my|it all|my own) life\b/,
  /\bwant(ed)? to die\b/,
  /\bdon'?t want to (be alive|live)\b/,
  /\bhurt(ing)? myself\b/,
  /\bself[- ]?harm/,
  /\bin (danger|immediate danger)\b/,
  /\b(someone|he|she|they) (is|are) hurting me\b/,
]

const CONCERN = [
  /\breally struggling\b/,
  /\bcan'?t cope\b/,
  /\bcan'?t (do|take) this any ?more\b/,
  /\bhate myself\b/,
  /\bdon'?t want to be here\b/,
  /\bno point in (anything|going on|trying)\b/,
  /\bfeel(ing)? (hopeless|worthless)\b/,
  /\bpanic attack/,
  /\bso (anxious|depressed|stressed) i\b/,
]

/** A plain-text screen for messages that suggest a student is struggling or in danger. Errs on the side of caution. */
export function screenForSafeguarding(text: string): SafeguardingLevel | null {
  const normalised = text.toLowerCase().replace(/[’‘]/g, "'")
  if (IMMEDIATE.some((pattern) => pattern.test(normalised))) return 'immediate'
  if (CONCERN.some((pattern) => pattern.test(normalised))) return 'concern'
  return null
}

export type SafeguardingReply = { paragraphs: string[]; support: string[] }

/**
 * Vetted fixed text (Founder decision 1 Oct: fixed safeguarding text is not a "canned reply").
 * The support names and numbers (999, Childline 0800 1111, Shout 85258) were verified by Lee on 3 October 2026.
 */
export function safeguardingReply(level: SafeguardingLevel): SafeguardingReply {
  const support = [
    'Childline (under 19, free and private): call 0800 1111',
    'Shout (24/7, free): text SHOUT to 85258',
  ]
  if (level === 'immediate') {
    return {
      paragraphs: [
        'If you or someone else might be in danger right now, please call 999.',
        'You can also tell a parent, a teacher or another adult you trust, right now. You don’t have to deal with this alone.',
      ],
      support,
    }
  }
  return {
    paragraphs: [
      'I’m really sorry things feel this heavy. I’m not the right help for this, but there are people who are.',
      'Please talk to a teacher, a parent or another adult you trust. If you’d rather talk to someone else, these are free and kind:',
    ],
    support,
  }
}

export const SAFEGUARDING_FOLLOW_ON = 'Whenever you’re ready, I’m here to carry on with your revision.'

export type QuestionKind = 'today' | 'progress' | 'exams' | 'unknown'

/** Which of the questions REV can answer from the student's data this is, if any. */
export function classifyQuestion(text: string): QuestionKind {
  const normalised = text.toLowerCase().replace(/[’‘]/g, "'")
  if (/\b(exam|exams|paper|papers|test)\b/.test(normalised) && /\b(when|date|dates|how long|how many days|next|coming up|soon)\b/.test(normalised)) return 'exams'
  if (/\b(how am i doing|how'?s my|how is my|my progress|how (well )?am i|am i ready|where am i)\b/.test(normalised)) return 'progress'
  if (/\b(what should i|what shall i|what do i|what next|what now|where (should|do) i start|what('?s| is) (next|today)|today)\b/.test(normalised)) return 'today'
  return 'unknown'
}

export type RevAnswer = { text: string; action?: { label: string; courseId: string; section: ProgressNextAction['section'] } }

export const CANNOT_ANSWER_YET =
  'I can’t answer that one yet. For now I can tell you what to do next, how you’re doing in a course, and when your exams are, and I can shift your plan if you ask. Answers to other questions are coming.'

export function answerToday(
  states: readonly ModuleLearningState[],
  programme: readonly LearnerProgrammeCourse[],
  now: Date,
): RevAnswer {
  if (programme.length === 0) return { text: 'You haven’t added a course yet. Add one in Courses and I can tell you what to do next.' }
  const action = nextProgressAction(states, programme, now)
  if (!action) return { text: 'Nothing needs to jump the queue right now. Pick any topic in Courses and carry on.' }
  return {
    text: `I’d start with ${action.topicName}. ${action.reason}`,
    action: { label: action.label, courseId: action.courseId, section: action.section },
  }
}

function mentionedCourses(programme: readonly LearnerProgrammeCourse[], text: string) {
  const normalised = text.toLowerCase()
  const exact = programme.filter((item) => [item.label, item.course.qualificationName, item.course.specificationCode].some((value) => normalised.includes(value.toLowerCase())))
  if (exact.length > 0) return exact
  return programme.filter((item) => normalised.includes(item.subject.name.toLowerCase()))
}

export function answerProgress(
  states: readonly ModuleLearningState[],
  programme: readonly LearnerProgrammeCourse[],
  text: string,
): RevAnswer {
  if (programme.length === 0) return { text: 'You haven’t added a course yet. Add one in Courses and your progress will build as you work.' }
  const mentioned = mentionedCourses(programme, text)
  const chosen = mentioned.length > 0 ? mentioned : programme
  const lines = chosen.map((item) => {
    const own = states.filter((state) => courseIdForLearningState(state) === item.course.id)
    return `${item.label}: ${progressSummarySentence(progressMeasuresFor(own), null)}`
  })
  return { text: lines.join(' ') }
}

function dayCount(from: Date, to: Date) {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((end - start) / 86_400_000)
}

export function answerExams(
  assessments: readonly RevisionAssessment[],
  programme: readonly LearnerProgrammeCourse[],
  now: Date,
): RevAnswer {
  const courseIds = new Set(programme.map((item) => item.course.id))
  const upcoming = assessments
    .filter((item) => item.isActive && (item.courseId ? courseIds.has(item.courseId) : programme.some((entry) => entry.subject.id === item.subjectId)))
    .map((item) => ({ item, days: dayCount(now, new Date(`${item.assessmentDate}T12:00:00`)) }))
    .filter(({ days }) => Number.isFinite(days) && days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3)
  if (upcoming.length === 0) return { text: 'I don’t have any exam dates for you yet. Add them on Plan and I can use them.' }
  const format = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const lines = upcoming.map(({ item, days }) => `${item.title}: ${format.format(new Date(`${item.assessmentDate}T12:00:00`))} (${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`})`)
  return { text: `Your next ${upcoming.length === 1 ? 'exam is' : 'exams are'}: ${lines.join('; ')}.` }
}

/** Prompt chips shown before the student types, built only from what is true for them. */
export function promptChips(programme: readonly LearnerProgrammeCourse[], hasExamDates: boolean): string[] {
  if (programme.length === 0) return []
  const chips = ['What should I do today?', `How am I doing in ${programme[0].subject.name}?`]
  if (hasExamDates) chips.push('When are my exams?')
  return chips
}
