import type { IconName } from './Icon'

/**
 * The five learner-facing status labels (Founder decision 1 Oct 2026). The words are fixed.
 * Which engine state produces which label is decided in the data layer, not here.
 */
export type LearningStatus = 'gotit' | 'nearly' | 'needswork' | 'started' | 'notstarted'

export const learningStatusOrder: readonly LearningStatus[] = ['gotit', 'nearly', 'needswork', 'started', 'notstarted']

export const learningStatusMeta: Record<LearningStatus, { label: string; icon: IconName }> = {
  gotit: { label: 'Got it', icon: 'status-gotit' },
  nearly: { label: 'Nearly there', icon: 'status-nearly' },
  needswork: { label: 'Needs work', icon: 'status-needswork' },
  started: { label: 'Just started', icon: 'status-started' },
  notstarted: { label: 'Not started', icon: 'status-notstarted' },
}
