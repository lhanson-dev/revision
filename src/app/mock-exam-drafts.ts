import type { MockMode } from './mock-exam'

/**
 * A mock exam in progress, saved as the student types so a refresh or a closed tab never loses work.
 *
 * Where it lives: today in this browser (localStorage), keyed to the student and the exam. Saving it on the server
 * needs the exam-attempts/drafts table (data model proposal section 7), which is its own migration needing the
 * Founder's approval, so it is not built here. The store is an interface so the server version can replace this one
 * without touching the screens.
 */
export type MockDraft = {
  version: 1
  examId: string
  /** The mode the attempt will carry on in. A timed mock that was left is saved as untimed. */
  mode: MockMode
  /** True when the attempt began timed and was left, so it no longer counts as timed. */
  leftWhileTimed: boolean
  answers: Record<string, string>
  flagged: Record<string, boolean>
  selectedChoices: Record<string, string>
  questionIndex: number
  /** Seconds spent on each question, in total. */
  secondsPerQuestion: Record<string, number>
  elapsedSeconds: number
  savedAt: string
}

export interface MockDraftStore {
  load(examId: string): MockDraft | null
  save(draft: MockDraft): void
  clear(examId: string): void
}

const keyFor = (userId: string, examId: string) => `revision:mock-draft:${userId}:${examId}`

function isDraft(value: unknown): value is MockDraft {
  if (!value || typeof value !== 'object') return false
  const draft = value as Partial<MockDraft>
  return draft.version === 1 && typeof draft.examId === 'string' && (draft.mode === 'timed' || draft.mode === 'untimed')
    && typeof draft.answers === 'object' && draft.answers !== null && typeof draft.questionIndex === 'number'
}

/** Browser storage can be missing or full (private windows). Every call is wrapped so the exam never breaks because of it. */
export function createBrowserDraftStore(userId: string, storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = typeof window === 'undefined' ? null : window.localStorage): MockDraftStore {
  return {
    load(examId) {
      try {
        const raw = storage?.getItem(keyFor(userId, examId))
        if (!raw) return null
        const parsed: unknown = JSON.parse(raw)
        return isDraft(parsed) ? parsed : null
      } catch { return null }
    },
    save(draft) {
      try { storage?.setItem(keyFor(userId, draft.examId), JSON.stringify(draft)) } catch { /* nothing to do: the answers are still on screen */ }
    },
    clear(examId) {
      try { storage?.removeItem(keyFor(userId, examId)) } catch { /* ignore */ }
    },
  }
}

/** How many questions have an answer, for "You have a saved attempt: 3 answered". */
export function draftAnsweredCount(draft: MockDraft): number {
  return Object.values(draft.answers).filter((value) => value.trim().length > 0).length
}
