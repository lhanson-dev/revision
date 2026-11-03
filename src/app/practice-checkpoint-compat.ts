import type { PracticeQuestion } from './practice-questions'
import { coursePackQuestionToPractice } from './practice-questions'
import { psychologyLegacySocialInfluenceQuestions, psychologyLegacyMemoryQuestions, psychologyLegacyAttachmentQuestions } from '../../content/psychology/aqa-a-level/shared/course'
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

/**
 * LF-03 Memory extension. Keep the original Social Influence compatibility
 * function intact; each topic is reconstructed only with the four exactly
 * previously published questions, and only if all four V2 IDs are present.
 */
export function legacyMemoryPool(
  specificationCode: string,
  topicId: string,
  publishedPool: readonly PracticeQuestion[],
): PracticeQuestion[] | null {
  if (specificationCode !== '7182' || topicId !== 'memory') return null
  const previousByCurrentId = new Map(psychologyLegacyMemoryQuestions.map(question => [
    question.id + '-v2', coursePackQuestionToPractice(question),
  ]))
  if ([...previousByCurrentId.keys()].filter(id => publishedPool.some(item => item.id === id)).length !== 4) return null
  return publishedPool.map(question => previousByCurrentId.get(question.id) ?? question)
}

/** #787 Attachment correction: rebuild the exact old five-item pool, swapping only
 * the two newly versioned entries. Never offer this pool to a new session. */
export function legacyAttachmentPool(
  specificationCode: string,
  topicId: string,
  publishedPool: readonly PracticeQuestion[],
): PracticeQuestion[] | null {
  if (specificationCode !== '7182' || topicId !== 'attachment') return null
  const previousByCurrentId = new Map(psychologyLegacyAttachmentQuestions
    .filter(question => ['psy-psy0304-check', 'psy-psy0305-check'].includes(question.id))
    .map(question => [question.id + '-v2', coursePackQuestionToPractice(question)]))
  if ([...previousByCurrentId.keys()].filter(id => publishedPool.some(item => item.id === id)).length !== 2) return null
  return publishedPool.map(question => previousByCurrentId.get(question.id) ?? question)
}

export function legacyPsychologyCheckpointPool(
  specificationCode: string,
  topicId: string,
  publishedPool: readonly PracticeQuestion[],
): PracticeQuestion[] | null {
  return legacySocialInfluencePool(specificationCode, topicId, publishedPool)
    ?? legacyMemoryPool(specificationCode, topicId, publishedPool)
    ?? legacyAttachmentPool(specificationCode, topicId, publishedPool)
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
