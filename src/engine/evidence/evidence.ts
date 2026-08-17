import type { TopicId } from '../../../content/schema'

export type EvidenceSource = 'flashcard' | 'multiple_choice' | 'exam_question' | 'exam_attempt'

export type BaseEvidence = {
  id: string
  moduleId: string
  topicId: TopicId
  source: EvidenceSource
  occurredAt: string
  contentId: string
  schemaVersion: 1
}

export type RecallEvidence = BaseEvidence & {
  source: 'flashcard'
  rating: 0 | 1 | 2
}

export type MultipleChoiceEvidence = BaseEvidence & {
  source: 'multiple_choice'
  correct: boolean
  selectedOption: number
  correctOption: number
}

export type ExamQuestionEvidence = BaseEvidence & {
  source: 'exam_question'
  marksAwarded: number
  marksAvailable: number
  assessmentObjectives: Partial<Record<'ao1' | 'ao2' | 'ao3' | 'ao4', { awarded: number; available: number }>>
}

export type ExamAttemptEvidence = BaseEvidence & {
  source: 'exam_attempt'
  marksAwarded: number
  marksAvailable: number
  durationMinutes: number
  timed: boolean
}

export type LearningEvidence =
  | RecallEvidence
  | MultipleChoiceEvidence
  | ExamQuestionEvidence
  | ExamAttemptEvidence

export function evidencePercentage(evidence: LearningEvidence): number | null {
  switch (evidence.source) {
    case 'flashcard':
      return (evidence.rating / 2) * 100
    case 'multiple_choice':
      return evidence.correct ? 100 : 0
    case 'exam_question':
    case 'exam_attempt':
      return evidence.marksAvailable > 0
        ? (evidence.marksAwarded / evidence.marksAvailable) * 100
        : null
  }
}
