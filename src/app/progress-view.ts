import type { LearningEvidence } from '../engine/evidence/evidence'

export type RecentActivityItem = {
  id: string
  label: string
  detail: string
  occurredAt: string
}

const labelFor = (evidence: LearningEvidence) => {
  switch (evidence.source) {
    case 'flashcard': return 'Flashcard recall'
    case 'multiple_choice': return 'Quick check'
    case 'exam_question': return 'Exam question'
    case 'exam_attempt': return 'Exam simulation'
  }
}

const detailFor = (evidence: LearningEvidence) => {
  switch (evidence.source) {
    case 'flashcard': return evidence.rating === 2 ? 'Strong recall' : evidence.rating === 1 ? 'Partial recall' : 'Needs review'
    case 'multiple_choice': return evidence.correct ? 'Correct answer' : 'Incorrect answer'
    case 'exam_question': return `${evidence.marksAwarded}/${evidence.marksAvailable} marks${evidence.markingMethod === 'self_assessed' ? ' · self-assessed' : ''}`
    case 'exam_attempt': return `${evidence.marksAwarded}/${evidence.marksAvailable} marks${evidence.timed ? ' · timed' : ''}`
  }
}

export function recentActivity(evidence: readonly LearningEvidence[], limit = 6): RecentActivityItem[] {
  return [...evidence]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      label: labelFor(item),
      detail: detailFor(item),
      occurredAt: item.occurredAt,
    }))
}
