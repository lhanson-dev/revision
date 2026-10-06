/**
 * REV marks a written Practice answer against the question's mark points (Practice v2.2, PR 3).
 *
 * The marker is a model, and a model's word is never taken as it comes. Software checks every verdict against the
 * mark scheme before it reaches the student: a mark point is only given if the marker quotes words that really are in
 * the answer, and, where the mark scheme expects a number, a number it accepts is in the answer. Software can take a
 * mark away that the marker gave; it never adds one. REV's marking is a guide, not an exam board mark.
 *
 * Nothing here calls a model. A `WrittenAnswerMarker` is plugged in from outside. Until one is connected, written
 * answers are not offered at all (see `FocusedLearningWorkspace`), so no student sees pretend marking.
 */

export type MarkPoint = {
  marks: number
  descriptor: string
  /** Examples of what earns the mark, from the mark scheme. */
  accept: readonly string[]
}

export type MarkerPointVerdict = {
  given: boolean
  /** The words from the student's answer that earn the point. Needed for a point to be given. */
  quote?: string
}

export type MarkerOutput = {
  /** One verdict per mark point, in order. */
  points: readonly MarkerPointVerdict[]
  /** One specific note on how to earn a missing mark. */
  note: string
  /** The exact model that did the marking. Saved with the evidence. */
  modelVersion: string
}

export type MarkingInput = {
  questionId: string
  prompt: string
  context: string | null
  points: readonly MarkPoint[]
  answer: string
}

export type ChallengeInput = MarkingInput & {
  previous: MarkedAnswer
  /** What the student says about the mark. */
  challenge: string
}

export type ChallengeOutput = MarkerOutput & {
  /** REV's reply: changes the mark, or says honestly why it stays. */
  reply: string
}

export interface WrittenAnswerMarker {
  mark(input: MarkingInput): Promise<MarkerOutput>
  challenge(input: ChallengeInput): Promise<ChallengeOutput>
}

export type MarkedAnswer = {
  /** Which mark points were given, after the software check. */
  given: boolean[]
  got: number
  available: number
  note: string
  modelVersion: string
  /** Points the marker gave that the check took back. */
  takenBack: number[]
}

export class MarkingError extends Error {}

/** Lower case, no pound signs or thousands commas, single spaces. */
export function normaliseText(text: string): string {
  return text.toLowerCase().replace(/[£,]/g, '').replace(/\s+/g, ' ').trim()
}

function numbersIn(text: string): string[] {
  return normaliseText(text).match(/\d+(?:\.\d+)?/g)?.map((value) => String(Number(value))) ?? []
}

/**
 * A point whose every accepted example contains a number needs one of those numbers in the answer.
 * Points described in words only have no number to check.
 */
export function numbersExpected(point: MarkPoint): string[] | null {
  if (point.accept.length === 0) return null
  const perExample = point.accept.map(numbersIn)
  if (perExample.some((numbers) => numbers.length === 0)) return null
  return [...new Set(perExample.flat())]
}

function pointIsSupported(point: MarkPoint, answer: string, verdict: MarkerPointVerdict): boolean {
  const normalisedAnswer = normaliseText(answer)
  const quote = normaliseText(verdict.quote ?? '')
  if (!quote || !normalisedAnswer.includes(quote)) return false
  const expected = numbersExpected(point)
  if (expected === null) return true
  const inAnswer = new Set(numbersIn(answer))
  return expected.some((value) => inAnswer.has(value))
}

const TAKEN_BACK_NOTE = 'I only give a mark when its words or numbers are in your answer, and I couldn’t find them for the points marked “Not in your answer yet”.'

/** Checks the marker's output against the mark scheme and the answer. Throws `MarkingError` if it is not usable. */
export function verifyMarking(points: readonly MarkPoint[], answer: string, output: MarkerOutput): MarkedAnswer {
  if (output.points.length !== points.length) throw new MarkingError('The marker did not return one verdict per mark point.')
  if (!output.modelVersion.trim()) throw new MarkingError('The marker did not say which model it used.')
  const takenBack: number[] = []
  const given = points.map((point, index) => {
    const verdict = output.points[index]
    if (!verdict.given) return false
    if (pointIsSupported(point, answer, verdict)) return true
    takenBack.push(index)
    return false
  })
  const available = points.reduce((sum, point) => sum + point.marks, 0)
  const got = points.reduce((sum, point, index) => sum + (given[index] ? point.marks : 0), 0)
  const note = [output.note.trim(), takenBack.length > 0 ? TAKEN_BACK_NOTE : ''].filter(Boolean).join(' ')
  return { given, got, available, note, modelVersion: output.modelVersion, takenBack }
}

export type ChallengeOutcome = 'changed' | 'unchanged'

export type ResolvedChallenge = {
  marked: MarkedAnswer
  outcome: ChallengeOutcome
  reply: string
  modelVersion: string
}

/** Applies REV's reply to a challenge. The same checks apply: a challenge cannot talk a mark into the answer. */
export function resolveChallenge(points: readonly MarkPoint[], answer: string, previous: MarkedAnswer, output: ChallengeOutput): ResolvedChallenge {
  const marked = verifyMarking(points, answer, output)
  const outcome: ChallengeOutcome = marked.given.some((value, index) => value !== previous.given[index]) ? 'changed' : 'unchanged'
  if (!output.reply.trim()) throw new MarkingError('REV did not give a reply to the challenge.')
  return { marked, outcome, reply: output.reply.trim(), modelVersion: output.modelVersion }
}
