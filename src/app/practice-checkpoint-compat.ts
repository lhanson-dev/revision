import type { PracticeQuestion } from './practice-questions'
import { coursePackQuestionToPractice } from './practice-questions'
import { psychologyLegacySocialInfluenceQuestions } from '../../content/psychology/aqa-a-level/shared/course'
import {
  fingerprintPracticeContent, loadPracticeCheckpoint,
  type PracticeCheckpoint, type PracticeCheckpointKey, type PracticeCheckpointStore,
} from '../services/progress/practice-checkpoint-service'

/**
 * LF-03: only the four superseded Social Influence MCQs are eligible for this
 * exact-content recovery. New sessions always use V2. The old question text,
 * options, keys and feedback are retained only inside a previously saved V1
 * session; historical attempts and persisted evidence are never rewritten.
 */
export function legacySocialInfluencePool(
  specificationCode: string,
  topicId: string,
  publishedPool: readonly PracticeQuestion[],
): PracticeQuestion[] | null {
  if (specificationCode !== '7182' || topicId !== 'social-influence') return null
  const previousByCurrentId = new Map(psychologyLegacySocialInfluenceQuestions.map(question => [
    question.id + '-v2', coursePackQuestionToPractice(question),
  ]))
  if ([...previousByCurrentId.keys()].filter(id => publishedPool.some(item => item.id === id)).length !== 4) return null
  return publishedPool.map(question => previousByCurrentId.get(question.id) ?? question)
}

export async function loadLf03CompatibleCheckpoint(
  store: PracticeCheckpointStore,
  key: PracticeCheckpointKey,
  publishedPool: readonly PracticeQuestion[],
  legacyPool: readonly PracticeQuestion[] | null,
): Promise<{ checkpoint: PracticeCheckpoint | null; legacy: boolean }> {
  const currentFingerprint = await fingerprintPracticeContent(publishedPool)
  try {
    return { checkpoint: await loadPracticeCheckpoint(store, key, currentFingerprint), legacy: false }
  } catch (error) {
    // Do not weaken the fail-closed policy for any unrelated content changes,
    // expired checkpoints, or unknown fingerprints. The previous full question
    // pool must match the exact saved fingerprint.
    if (!legacyPool || !(error instanceof Error) || !error.message.includes('content changed')) throw error
    const priorFingerprint = await fingerprintPracticeContent(legacyPool)
    return { checkpoint: await loadPracticeCheckpoint(store, key, priorFingerprint), legacy: true }
  }
}
