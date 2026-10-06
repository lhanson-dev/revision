/**
 * Practice questions for a session (v2.2): every source is turned into one shape here, so the session rules and the
 * screen never care where a question came from. Sources today: the course pack's own multiple-choice questions and
 * the AQA 7132 question bank (multiple choice, and written points-scheme questions up to 6 marks). Calculation questions
 * wait for their evidence migration. Levels-based written questions stay in Exam Prep.
 */
import type { MultipleChoiceQuestion } from '../../content/schema'
import type { AqaBusinessQuestionRecord } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import { levelFromAoTags, type SessionQuestion } from './practice-session'
import { acceptedValuesFor, formatAnswer } from './practice-calculation'
import type { MarkPoint } from './rev-marking'
import type { PracticeQuestionType } from './practice-start'

export type PracticeTable = { title?: string; columns: string[]; rows: string[][] }

type QuestionBase = SessionQuestion & {
  topicId: string
  marks: number
  prompt: string
  context: string | null
  table: PracticeTable | null
  /** AQA specification items the question tests. Used for the skills map in the session summary. */
  specItemIds: string[]
  /** Subject Foundation nodes the question is tagged to. A Learn page has the same id as its node, so this finds the page to read. */
  nodeIds: string[]
  source: 'course-pack' | 'aqa-bank'
}

export type MultipleChoicePracticeQuestion = QuestionBase & {
  type: 'multiple-choice'
  options: Array<{ text: string; /** Why this option is tempting or wrong. Null when the content does not say. */ why: string | null }>
  correctOption: number
  explanation: string
}

/** A written answer marked point by point (a points mark scheme, up to 6 marks). */
export type WrittenPracticeQuestion = QuestionBase & {
  type: 'written'
  aoTags: string[]
  points: MarkPoint[]
}

/** A single-number calculation. The student types the answer and software checks it, so REV is not needed. */
export type CalculationPracticeQuestion = QuestionBase & {
  type: 'calculation'
  /** The mark scheme's answer, in the unit's own terms (24.2 for "£m"). */
  expected: number
  /** Every number that counts as right: the answer, and the roundings the mark scheme accepts. */
  accepted: number[]
  unit: string | null
  /** The answer as the exam writes it, e.g. "£24.2m". */
  answerText: string
  /** The worked answer from the mark scheme, shown after checking. */
  workings: string
}

export type PracticeQuestion = MultipleChoicePracticeQuestion | WrittenPracticeQuestion | CalculationPracticeQuestion

export const WRITTEN_MAX_MARKS = 6

/** "B is incorrect because this describes ..." becomes "This describes ..." so it reads after "You picked B:". */
export function cleanRationale(raw: string | undefined): string | null {
  if (!raw) return null
  const text = raw
    .replace(/^(?:option\s+)?[A-F]\s+is\s+(?:in|not\s+)?(?:correct|wrong|right)\s*(?:because\s+|:\s*)/i, '')
    .replace(/^(?:in)?correct\s*[:\-–]\s*/i, '')
    .trim()
  if (!text) return null
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const INTRO = /^Revision-authored AQA-style practice(?:\s+question)?\s*[.:]\s*/i

export function coursePackQuestionToPractice(question: MultipleChoiceQuestion): MultipleChoicePracticeQuestion {
  return {
    id: question.id,
    type: 'multiple-choice',
    // The course pack has no AO tags, so it counts as Apply (see levelFromAoTags).
    level: levelFromAoTags(undefined),
    topicId: question.topic,
    marks: 1,
    prompt: question.prompt,
    context: null,
    table: null,
    options: question.options.map((text) => ({ text, why: null })),
    correctOption: question.correctOption,
    explanation: question.explanation,
    specItemIds: [],
    nodeIds: [],
    source: 'course-pack',
  }
}

/** Spec section "3.7" is the 7th topic of the AQA Business pack. Returns the topic's order number, or null. */
export function topicOrderForSpecItem(itemId: string): number | null {
  const match = /^aqa-7132-3\.(\d+)(?:\.|:|$)/.exec(itemId)
  return match ? Number(match[1]) : null
}

export function bankQuestionId(record: Pick<AqaBusinessQuestionRecord, 'batch' | 'id'>): string {
  return `aqa7132-${record.batch}-${record.id}`
}

/**
 * A single-number "Calculate" question. These become calculation questions (an input, no marking by REV) once their
 * evidence source is migrated, so they are not offered as written answers.
 */
export function isCalculationRecord(record: AqaBusinessQuestionRecord): boolean {
  const { question } = record
  return question.family === 'SHORT_ANSWER' && question.calcs.length === 1 && !/\(a\)/i.test(question.stem)
}

function commonFields(record: AqaBusinessQuestionRecord, topicId: string) {
  const { question } = record
  const context = question.context.replace(INTRO, '').trim()
  return {
    id: bankQuestionId(record),
    level: levelFromAoTags(question.ao_tags),
    topicId,
    marks: question.marks,
    prompt: question.stem,
    context: context || null,
    table: question.table ? { title: question.table.title, columns: question.table.columns, rows: question.table.rows.map((row) => row.cells) } : null,
    specItemIds: record.target_item_ids,
    nodeIds: record.target_node_ids,
    source: 'aqa-bank' as const,
  }
}

function toMultipleChoice(record: AqaBusinessQuestionRecord, topicId: string): MultipleChoicePracticeQuestion | null {
  const { question } = record
  if (question.family !== 'MCQ' || question.mark_scheme.type !== 'single_option') return null
  const letters = question.options.map((option) => option.label)
  const correctOption = letters.indexOf(question.mark_scheme.correct_option ?? '')
  if (question.options.length < 2 || correctOption < 0) return null
  const rationales = question.mark_scheme.option_rationale ?? []
  // The bank writes rationales in option order, sometimes opening "B is incorrect because" and sometimes "Incorrect:".
  const rationaleFor = (index: number) => cleanRationale(
    rationales.length === question.options.length
      ? rationales[index]
      : rationales.find((entry) => entry.trim().toUpperCase().startsWith(`${letters[index].toUpperCase()} `)),
  )
  return {
    ...commonFields(record, topicId),
    type: 'multiple-choice',
    options: question.options.map((option, index) => ({ text: option.text, why: index === correctOption ? null : rationaleFor(index) })),
    correctOption,
    explanation: rationaleFor(correctOption) ?? 'That is the correct answer.',
  }
}

function toWritten(record: AqaBusinessQuestionRecord, topicId: string): WrittenPracticeQuestion | null {
  const { question } = record
  if (question.family !== 'SHORT_ANSWER' && question.family !== 'DATA_RESPONSE') return null
  if (question.mark_scheme.type !== 'points' || isCalculationRecord(record)) return null
  const raw = (question.mark_scheme.points ?? []) as Array<{ marks?: unknown; descriptor?: unknown; accept?: unknown }>
  const points: MarkPoint[] = raw.map((point) => ({
    marks: typeof point.marks === 'number' ? point.marks : 0,
    descriptor: typeof point.descriptor === 'string' ? point.descriptor : '',
    accept: Array.isArray(point.accept) ? point.accept.filter((entry): entry is string => typeof entry === 'string') : [],
  }))
  const total = points.reduce((sum, point) => sum + point.marks, 0)
  if (points.length === 0 || points.some((point) => point.marks < 1 || !point.descriptor) || total !== question.marks || question.marks > WRITTEN_MAX_MARKS) return null
  return { ...commonFields(record, topicId), type: 'written', aoTags: question.ao_tags, points }
}

function toCalculation(record: AqaBusinessQuestionRecord, topicId: string): CalculationPracticeQuestion | null {
  const { question } = record
  if (!isCalculationRecord(record)) return null
  const calc = question.calcs[0]
  if (typeof calc.stated_answer !== 'number' || !Number.isFinite(calc.stated_answer)) return null
  const points = (question.mark_scheme.points ?? []) as Array<{ accept?: unknown }>
  const finalAccepts = points.length > 0 && Array.isArray(points[points.length - 1].accept)
    ? (points[points.length - 1].accept as unknown[]).filter((entry): entry is string => typeof entry === 'string')
    : []
  const unit = typeof calc.unit === 'string' && calc.unit.trim() ? calc.unit.trim() : null
  const fields = commonFields(record, topicId)
  return {
    ...fields,
    // "Show your working" is for the exam; here the student types the answer, so it would mislead.
    prompt: fields.prompt.replace(/\s*Show your working\.?/i, '').trim(),
    type: 'calculation',
    expected: calc.stated_answer,
    accepted: acceptedValuesFor(calc.stated_answer, unit, finalAccepts),
    unit,
    answerText: formatAnswer(calc.stated_answer, unit),
    workings: question.mark_scheme.model_answer?.trim() ?? '',
  }
}

/** A bank record as a practice question: multiple choice, a calculation, or a written points question. Null for anything else. */
export function bankRecordToPractice(record: AqaBusinessQuestionRecord, topicId: string): PracticeQuestion | null {
  return toMultipleChoice(record, topicId) ?? toCalculation(record, topicId) ?? toWritten(record, topicId)
}

export type PoolInput = {
  topicId: string
  /** The topic's order number in its pack (the 7th topic is spec section 3.7). Only used for the AQA bank. */
  topicOrder: number | null
  coursePack: readonly MultipleChoiceQuestion[]
  /** Pass the AQA 7132 bank for that course only. */
  bank?: readonly AqaBusinessQuestionRecord[] | null
  /**
   * Written questions are only offered when a marker is connected. Without one there is nothing to mark them, and
   * Revision does not pretend otherwise.
   */
  includeWritten?: boolean
}

/** Every question for the topic in a stable order: the course pack's own first, then the bank in bank order. */
export function buildQuestionPool(input: PoolInput): PracticeQuestion[] {
  const own = input.coursePack.filter((question) => question.topic === input.topicId).map(coursePackQuestionToPractice)
  const fromBank = input.topicOrder === null ? [] : (input.bank ?? [])
    .filter((record) => {
      const first = record.target_item_ids.map(topicOrderForSpecItem).find((order) => order !== null)
      return first === input.topicOrder
    })
    .map((record) => bankRecordToPractice(record, input.topicId))
    .filter((question): question is PracticeQuestion => question !== null && (question.type !== 'written' || input.includeWritten === true))
  return [...own, ...fromBank]
}

export function filterByTypes(pool: readonly PracticeQuestion[], types: readonly PracticeQuestionType[]): PracticeQuestion[] {
  return pool.filter((question) => types.includes(question.type))
}

export function availableTypes(pool: readonly PracticeQuestion[]): PracticeQuestionType[] {
  const order: PracticeQuestionType[] = ['multiple-choice', 'calculation', 'written']
  return order.filter((type) => pool.some((question) => question.type === type))
}

/**
 * Questions the student has not answered come first, then the one answered longest ago, so "Practise again" is not
 * the same five questions. The order inside each group stays as it was.
 */
export function orderByFreshness<Q extends { id: string }>(pool: readonly Q[], lastAnsweredAt: Readonly<Record<string, string>> = {}): Q[] {
  return pool
    .map((question, index) => ({ question, index, at: lastAnsweredAt[question.id] ?? '' }))
    .sort((left, right) => (left.at === right.at ? left.index - right.index : left.at < right.at ? -1 : 1))
    .map((entry) => entry.question)
}

/** When each question was last answered, by content id, from the evidence the student has saved. */
export function lastAnsweredByContent(evidence: ReadonlyArray<{ contentId: string; occurredAt: string }>): Record<string, string> {
  const latest: Record<string, string> = {}
  evidence.forEach((item) => {
    if (!latest[item.contentId] || item.occurredAt > latest[item.contentId]) latest[item.contentId] = item.occurredAt
  })
  return latest
}
