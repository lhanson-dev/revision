/**
 * The end-of-session summary for Practice (v2.2, PR 5), worked out from what the student did. Plain rules, not a model's
 * choice, and no new readiness formula: the topic's status is whatever the existing engine says before and after; the
 * skills map reuses the engine's own score bands for this session's answers only.
 */
import { GUESSED_RIGHT_PERCENTAGE } from '../engine/evidence/evidence'
import { bandForScore } from '../engine/knowledge/topic-knowledge'
import { topicOrderForSpecItem, type PracticeQuestion } from './practice-questions'
import { statusDirection, type QuestionSession, type SessionAnswer } from './practice-session'
import { estimatedMinutes } from './practice-start'
import { learningStatusMeta, type LearningStatus } from './ui/learning-status'

export type SkillStatus = 'gotit' | 'nearly' | 'needswork' | 'nottested'

export type SummaryLearnPage = { id: string; title: string; minutes: number }

export type SummaryInput = {
  session: QuestionSession
  /** Everything the session could have drawn on, to look questions up by id. */
  questions: readonly PracticeQuestion[]
  topicTitle: string
  /** The topic's order in its pack (the 7th topic is spec section 3.7). Null when there is no spec mapping, so no skills map. */
  topicOrder: number | null
  startStatus: LearningStatus | undefined
  endStatus: LearningStatus | undefined
  skillLabel: (specItemId: string) => string
  learnPage: (question: PracticeQuestion) => SummaryLearnPage | null
  /** REV's recommendation when it points at a different topic: where to go once this one is done. */
  nextTopic: { id: string; title: string; reason: string } | null
}

export type SummaryGoOver = {
  key: string
  number: number
  title: string
  reason: string
  tone: 'needswork' | 'nearly'
  learn: SummaryLearnPage | null
}

export type SummaryNextStep = {
  kind: 'learn' | 'practice-topic' | 'again'
  title: string
  reason: string
  minutes: number
  learnPageId?: string
  topicId?: string
}

export type SessionSummaryModel = {
  right: number
  outOf: number
  written: { got: number; available: number } | null
  heroLine: string
  writtenLine: string | null
  status: { start: LearningStatus; end: LearningStatus; line: string } | null
  skills: Array<{ id: string; label: string; status: SkillStatus }>
  goOver: SummaryGoOver[]
  next: SummaryNextStep
}

export const MAX_SKILL_TILES = 10

/** The student's first answer to each question in the session. A miss is worth going over even if the retry was right. */
function firstAnswers(session: QuestionSession): SessionAnswer[] {
  const first = new Map<string, SessionAnswer>()
  session.answers.forEach((answer) => { if (!first.has(answer.questionId)) first.set(answer.questionId, answer) })
  return [...first.values()]
}

/** The student's latest answer to each question in the session, in the order the questions were first answered. */
function latestAnswers(session: QuestionSession): SessionAnswer[] {
  const latest = new Map<string, SessionAnswer>()
  session.answers.forEach((answer) => latest.set(answer.questionId, answer))
  return [...latest.values()]
}

function percentageOf(answer: SessionAnswer): number {
  if (answer.marks) return answer.marks.available > 0 ? (answer.marks.got / answer.marks.available) * 100 : 0
  if (!answer.correct) return 0
  return answer.confidence === 'guess' ? GUESSED_RIGHT_PERCENTAGE : 100
}

const skillStatusFor = (percentage: number): SkillStatus => {
  const band = bandForScore(percentage)
  return band === 'good' ? 'gotit' : band === 'medium' ? 'nearly' : 'needswork'
}

function statusLine(start: LearningStatus, end: LearningStatus): string {
  const from = learningStatusMeta[start].label
  const to = learningStatusMeta[end].label
  const base = 'Based on this session and your earlier answers on this topic.'
  if (start === end) return `Still ${to}. ${base}`
  const direction = statusDirection(start, end)
  if (direction === 'up') return `Up from ${from} to ${to}. ${base}`
  if (direction === 'down') return `Down from ${from} to ${to}. ${base}`
  if (start === 'notstarted') return `This topic now has its first evidence, so it reads ${to}. ${base}`
  return `Now ${to}, it was ${from}. ${base}`
}

function shortTitle(question: PracticeQuestion, skillLabel: (id: string) => string): string {
  const first = question.specItemIds[0]
  if (first) return skillLabel(first)
  const words = question.prompt.replace(/\s+/g, ' ').trim().split(' ')
  return words.length > 7 ? `${words.slice(0, 7).join(' ')}…` : words.join(' ')
}

export function summariseSession(input: SummaryInput): SessionSummaryModel {
  const { session } = input
  const byId = new Map(input.questions.map((question) => [question.id, question]))
  const numberOf = (questionId: string) => session.askedIds.indexOf(questionId) + 1
  const answers = latestAnswers(session)

  // The hero line: multiple-choice questions right out of those asked fresh. Written answers get their own line.
  const freshChoice = session.answers.filter((answer) => !answer.retry && !answer.marks)
  const right = freshChoice.filter((answer) => answer.correct).length
  const writtenAnswers = answers.filter((answer) => answer.marks)
  const written = writtenAnswers.length > 0
    ? { got: writtenAnswers.reduce((sum, answer) => sum + (answer.marks?.got ?? 0), 0), available: writtenAnswers.reduce((sum, answer) => sum + (answer.marks?.available ?? 0), 0) }
    : null
  const onlyWritten = freshChoice.length === 0 && written !== null
  const heroLine = onlyWritten ? `${written.got} of ${written.available} marks` : `${right} of ${freshChoice.length} right`
  const writtenLine = written && !onlyWritten ? `Plus ${written.got} of ${written.available} marks on the written answer${writtenAnswers.length === 1 ? '' : 's'}.` : null

  const status = input.startStatus && input.endStatus
    ? { start: input.startStatus, end: input.endStatus, line: statusLine(input.startStatus, input.endStatus) }
    : null

  // Skills: the spec items in this topic that the session could have tested. Tested ones carry this session's result.
  const skills: SessionSummaryModel['skills'] = []
  if (input.topicOrder !== null) {
    const inTopic = (id: string) => topicOrderForSpecItem(id) === input.topicOrder
    const results = new Map<string, number[]>()
    answers.forEach((answer) => {
      const question = byId.get(answer.questionId)
      question?.specItemIds.filter(inTopic).forEach((id) => results.set(id, [...(results.get(id) ?? []), percentageOf(answer)]))
    })
    const tested = [...results.entries()].map(([id, values]) => ({ id, label: input.skillLabel(id), status: skillStatusFor(values.reduce((sum, value) => sum + value, 0) / values.length) }))
    const untestedIds = [...new Set(session.poolIds.flatMap((id) => byId.get(id)?.specItemIds ?? []).filter((id) => inTopic(id) && !results.has(id)))]
    skills.push(...tested, ...untestedIds.map((id) => ({ id, label: input.skillLabel(id), status: 'nottested' as const })))
    skills.splice(MAX_SKILL_TILES)
  }

  // Go over these: every wrong answer, every right answer that was a guess, and every missed written mark point.
  const goOver: SummaryGoOver[] = []
  firstAnswers(session).forEach((answer) => {
    const question = byId.get(answer.questionId)
    if (!question) return
    const number = numberOf(answer.questionId)
    const title = `Question ${number} · ${shortTitle(question, input.skillLabel)}`
    const learn = input.learnPage(question)
    if (question.type === 'written' && answer.marks) {
      question.points.forEach((point, index) => {
        if (answer.pointsGiven?.[index]) return
        goOver.push({ key: `${answer.questionId}-${index}`, number, title, reason: `A mark point is missing: ${point.descriptor}`, tone: 'needswork', learn })
      })
    } else if (question.type === 'multiple-choice' && answer.selectedOption !== null) {
      const letter = 'ABCDEF'[answer.selectedOption]
      if (!answer.correct) {
        const why = question.options[answer.selectedOption]?.why
        goOver.push({ key: answer.questionId, number, title, reason: `${why ? `You picked ${letter}: ${why}` : `You picked ${letter}.`} ${question.explanation}`, tone: 'needswork', learn })
      } else if (answer.confidence === 'guess') {
        goOver.push({ key: answer.questionId, number, title, reason: `You got this right, but you said you were guessing. ${question.explanation}`, tone: 'nearly', learn })
      }
    }
  })
  goOver.sort((left, right) => left.number - right.number)

  return { right, outOf: freshChoice.length, written, heroLine, writtenLine, status, skills, goOver, next: chooseNextStep(input, answers, byId, numberOf) }
}

/** Certain but wrong beats a missing written mark point, which beats moving on. */
function chooseNextStep(
  input: SummaryInput,
  answers: readonly SessionAnswer[],
  byId: ReadonlyMap<string, PracticeQuestion>,
  numberOf: (questionId: string) => number,
): SummaryNextStep {
  const again: SummaryNextStep = { kind: 'again', title: `Practise ${input.topicTitle} again`, reason: '', minutes: estimatedMinutes(5) }
  const readOrAgain = (question: PracticeQuestion, reason: string): SummaryNextStep => {
    const page = input.learnPage(question)
    return page
      ? { kind: 'learn', title: `Read: ${page.title}`, reason, minutes: page.minutes, learnPageId: page.id }
      : { ...again, reason }
  }

  const certainWrong = answers.find((answer) => !answer.marks && !answer.correct && answer.confidence === 'certain')
  const certainQuestion = certainWrong && byId.get(certainWrong.questionId)
  if (certainWrong && certainQuestion) {
    return readOrAgain(certainQuestion, `You were certain about question ${numberOf(certainWrong.questionId)} and it was wrong, so it is the one most worth fixing.`)
  }

  const missed = answers.find((answer) => answer.marks && answer.pointsGiven?.some((given) => !given))
  const missedQuestion = missed && byId.get(missed.questionId)
  if (missed && missedQuestion?.type === 'written') {
    const point = missedQuestion.points[missed.pointsGiven?.findIndex((given) => !given) ?? 0]
    return readOrAgain(missedQuestion, `Question ${numberOf(missed.questionId)} was missing a mark point: ${point?.descriptor ?? 'one of the points'}`)
  }

  if (input.nextTopic) {
    return { kind: 'practice-topic', title: `Move on to ${input.nextTopic.title}`, reason: input.nextTopic.reason, minutes: estimatedMinutes(5), topicId: input.nextTopic.id }
  }
  return { ...again, reason: 'Nothing here needs fixing. A fresh set of questions will show whether it stays that way.' }
}
