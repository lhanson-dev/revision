/**
 * Practice questions for a session (v2.2): every source is turned into one shape here, so the session rules and the
 * screen never care where a question came from. Sources today: the course pack's own multiple-choice questions and
 * the AQA 7132 question bank (multiple choice only for now; calculations wait for their evidence migration, written
 * answers for the REV marking PR).
 */
import type { MultipleChoiceQuestion } from '../../content/schema'
import type { AqaBusinessQuestionRecord } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import { levelFromAoTags, type SessionQuestion } from './practice-session'
import type { PracticeQuestionType } from './practice-start'

export type PracticeTable = { title?: string; columns: string[]; rows: string[][] }

export type PracticeQuestion = SessionQuestion & {
  topicId: string
  marks: number
  prompt: string
  context: string | null
  table: PracticeTable | null
  options: Array<{ text: string; /** Why this option is tempting or wrong. Null when the content does not say. */ why: string | null }>
  correctOption: number
  explanation: string
  /** AQA specification items the question tests. Used for the skills map in the session summary. */
  specItemIds: string[]
  source: 'course-pack' | 'aqa-bank'
}

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

export function coursePackQuestionToPractice(question: MultipleChoiceQuestion): PracticeQuestion {
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

/** A multiple-choice bank record as a practice question, or null when it is not a well-formed single-answer MCQ. */
export function bankRecordToPractice(record: AqaBusinessQuestionRecord, topicId: string): PracticeQuestion | null {
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
  const explanation = rationaleFor(correctOption) ?? 'That is the correct answer.'
  const context = question.context.replace(INTRO, '').trim()
  return {
    id: bankQuestionId(record),
    type: 'multiple-choice',
    level: levelFromAoTags(question.ao_tags),
    topicId,
    marks: question.marks,
    prompt: question.stem,
    context: context || null,
    table: question.table ? { title: question.table.title, columns: question.table.columns, rows: question.table.rows.map((row) => row.cells) } : null,
    options: question.options.map((option, index) => ({ text: option.text, why: index === correctOption ? null : rationaleFor(index) })),
    correctOption,
    explanation,
    specItemIds: record.target_item_ids,
    source: 'aqa-bank',
  }
}

export type PoolInput = {
  topicId: string
  /** The topic's order number in its pack (the 7th topic is spec section 3.7). Only used for the AQA bank. */
  topicOrder: number | null
  coursePack: readonly MultipleChoiceQuestion[]
  /** Pass the AQA 7132 bank for that course only. */
  bank?: readonly AqaBusinessQuestionRecord[] | null
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
    .filter((question): question is PracticeQuestion => question !== null)
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
