/**
 * The Practice retry queue for one practice session (Founder decision 1 Oct 2026, decisions file section 7):
 * a wrong answer is queued and comes back later. A queued question comes back after at least 3 other questions,
 * and leaves the queue when it is answered correctly. The spacing is a plain rule, not a model's choice.
 *
 * This queue lives for the session. Carrying a missed question to another day needs the retry-queue table
 * (data model proposal, section 6), which is its own migration PR.
 */
export const RETRY_AFTER_OTHER_QUESTIONS = 3

export type RetryEntry = {
  questionId: string
  /** The number of answers given in this session after which the question is due again. */
  dueAfterAnswers: number
}

/** Queues a missed question (or re-queues one that was missed again), due after 3 more answers. */
export function queueMissed(queue: readonly RetryEntry[], questionId: string, answersGiven: number): RetryEntry[] {
  const without = queue.filter((entry) => entry.questionId !== questionId)
  return [...without, { questionId, dueAfterAnswers: answersGiven + RETRY_AFTER_OTHER_QUESTIONS }]
}

/** Takes a question out of the queue once it has been answered correctly. */
export function clearRetried(queue: readonly RetryEntry[], questionId: string): RetryEntry[] {
  return queue.filter((entry) => entry.questionId !== questionId)
}

/** The queued question to ask now, if one is due: the one that has waited longest. */
export function dueRetry(queue: readonly RetryEntry[], answersGiven: number): RetryEntry | null {
  return queue
    .filter((entry) => answersGiven >= entry.dueAfterAnswers)
    .sort((a, b) => a.dueAfterAnswers - b.dueAfterAnswers)[0] ?? null
}
