import { evidencePercentage, type LearningEvidence } from '../evidence/evidence'

export type EvidenceFamily = 'recall' | 'application' | 'exam' | 'simulation'
export type ConfidenceLevel = 'insufficient' | 'low' | 'medium' | 'high'

export type ReadinessProgress = {
  scoredAttempts: number
  requiredScoredAttempts: number
  evidenceTypes: number
  requiredEvidenceTypes: number
  hasEvidenceBeyondRecall: boolean
  scoreAvailable: boolean
  message: string
  nextStep: string
}

export type RecentActivityItem = {
  evidenceId: string
  contentId: string
  topicId: string
  family: EvidenceFamily
  source: LearningEvidence['source']
  occurredAt: string
  percentage: number | null
}

export type ReadinessResult = {
  score: number | null
  confidence: ConfidenceLevel
  evidenceCount: number
  familyCount: number
  families: EvidenceFamily[]
  latestEvidenceAt: string | null
  progress: ReadinessProgress
  explanation: string
}

const REQUIRED_SCORED_ATTEMPTS = 6
const REQUIRED_EVIDENCE_TYPES = 2

const familyFor = (evidence: LearningEvidence): EvidenceFamily => {
  switch (evidence.source) {
    case 'flashcard': return 'recall'
    case 'multiple_choice': return 'application'
    case 'exam_question': return 'exam'
    case 'exam_attempt': return 'simulation'
  }
}

const ageDays = (occurredAt: string, now: Date) =>
  Math.max(0, (now.getTime() - new Date(occurredAt).getTime()) / 86_400_000)

function readinessProgress(evidenceCount: number, families: EvidenceFamily[]): ReadinessProgress {
  const hasEvidenceBeyondRecall = families.some((family) => family !== 'recall')
  const scoreAvailable = evidenceCount >= REQUIRED_SCORED_ATTEMPTS
    && families.length >= REQUIRED_EVIDENCE_TYPES
    && hasEvidenceBeyondRecall

  if (scoreAvailable) {
    return {
      scoredAttempts: evidenceCount,
      requiredScoredAttempts: REQUIRED_SCORED_ATTEMPTS,
      evidenceTypes: families.length,
      requiredEvidenceTypes: REQUIRED_EVIDENCE_TYPES,
      hasEvidenceBeyondRecall,
      scoreAvailable,
      message: `You have enough varied evidence for a readiness score.`,
      nextStep: 'Keep practising across different activity types to strengthen confidence in the result.',
    }
  }

  const attemptsRemaining = Math.max(0, REQUIRED_SCORED_ATTEMPTS - evidenceCount)
  const evidenceTypesRemaining = Math.max(0, REQUIRED_EVIDENCE_TYPES - families.length)
  const reasons: string[] = []
  if (attemptsRemaining > 0) reasons.push(`${attemptsRemaining} more scored attempt${attemptsRemaining === 1 ? '' : 's'}`)
  if (evidenceTypesRemaining > 0) reasons.push(`${evidenceTypesRemaining} more evidence type${evidenceTypesRemaining === 1 ? '' : 's'}`)
  if (!hasEvidenceBeyondRecall) reasons.push('at least one activity beyond flashcards')

  return {
    scoredAttempts: evidenceCount,
    requiredScoredAttempts: REQUIRED_SCORED_ATTEMPTS,
    evidenceTypes: families.length,
    requiredEvidenceTypes: REQUIRED_EVIDENCE_TYPES,
    hasEvidenceBeyondRecall,
    scoreAvailable,
    message: evidenceCount === 0
      ? 'No scored activity yet. Your work will appear here as soon as you complete it.'
      : `Your work is being recorded. You have ${evidenceCount} scored attempt${evidenceCount === 1 ? '' : 's'} across ${families.length} evidence type${families.length === 1 ? '' : 's'}.`,
    nextStep: `To unlock a readiness score, complete ${reasons.join(', ')}.`,
  }
}

export function recentActivity(evidence: readonly LearningEvidence[], limit = 5): RecentActivityItem[] {
  if (!Number.isInteger(limit) || limit < 0) throw new Error('Recent activity limit must be a non-negative integer.')
  return [...evidence]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, limit)
    .map((item) => ({
      evidenceId: item.id,
      contentId: item.contentId,
      topicId: item.topicId,
      family: familyFor(item),
      source: item.source,
      occurredAt: item.occurredAt,
      percentage: evidencePercentage(item),
    }))
}

export function assessReadiness(evidence: readonly LearningEvidence[], now = new Date()): ReadinessResult {
  const usable = evidence
    .map((item) => ({ item, percentage: evidencePercentage(item), family: familyFor(item) }))
    .filter((entry): entry is typeof entry & { percentage: number } => entry.percentage !== null)

  const families = [...new Set(usable.map((entry) => entry.family))]
  const latest = usable.length
    ? [...usable].sort((a, b) => b.item.occurredAt.localeCompare(a.item.occurredAt))[0].item.occurredAt
    : null
  const progress = readinessProgress(usable.length, families)

  let score: number | null = null
  if (progress.scoreAvailable) {
    const familyMeans = families.map((family) => {
      const entries = usable.filter((entry) => entry.family === family)
      return entries.reduce((sum, entry) => sum + entry.percentage, 0) / entries.length
    })
    score = Math.round(familyMeans.reduce((sum, value) => sum + value, 0) / familyMeans.length)
  }

  const recentCount = usable.filter((entry) => ageDays(entry.item.occurredAt, now) <= 30).length
  const latestAge = latest ? ageDays(latest, now) : Infinity
  const hasExternallyMarkedExamEvidence = usable.some((entry) =>
    entry.item.source === 'exam_question' && entry.item.markingMethod === 'externally_marked')

  let confidence: ConfidenceLevel = 'insufficient'
  if (progress.scoreAvailable) {
    confidence = 'low'
    if (usable.length >= 8 && families.length >= 2 && recentCount >= 3) confidence = 'medium'
    if (usable.length >= 12 && families.length >= 3 && recentCount >= 5 && families.includes('exam') && hasExternallyMarkedExamEvidence) confidence = 'high'
    if (latestAge > 60) confidence = 'low'
  }

  const selfAssessedExamCount = usable.filter((entry) =>
    entry.item.source === 'exam_question' && entry.item.markingMethod === 'self_assessed').length
  const confidenceNote = selfAssessedExamCount > 0 && !hasExternallyMarkedExamEvidence
    ? ' Written exam evidence is currently self-assessed, so confidence cannot be high until independently marked evidence is available.'
    : ''

  const explanation = score === null
    ? `${progress.message} ${progress.nextStep}`
    : `Readiness is ${score}% with ${confidence} confidence, based on ${usable.length} scored attempts across ${families.length} evidence types. Evidence types are averaged separately so repeated flashcards cannot dominate the result.${confidenceNote}`

  return {
    score,
    confidence,
    evidenceCount: usable.length,
    familyCount: families.length,
    families,
    latestEvidenceAt: latest,
    progress,
    explanation,
  }
}

export function assessTopicReadiness(moduleId: string, topicId: string, evidence: readonly LearningEvidence[], now = new Date()) {
  return assessReadiness(evidence.filter((item) => item.moduleId === moduleId && item.topicId === topicId), now)
}

export function assessPaperReadiness(moduleId: string, topicIds: readonly string[], evidence: readonly LearningEvidence[], now = new Date()): ReadinessResult {
  const topicResults = topicIds.map((topicId) => assessTopicReadiness(moduleId, topicId, evidence, now))
  const scored = topicResults.filter((result) => result.score !== null)
  if (topicIds.length === 0 || scored.length !== topicIds.length) {
    const evidenceCount = topicResults.reduce((sum, result) => sum + result.evidenceCount, 0)
    return {
      score: null,
      confidence: 'insufficient',
      evidenceCount,
      familyCount: 0,
      families: [],
      latestEvidenceAt: null,
      progress: {
        scoredAttempts: evidenceCount,
        requiredScoredAttempts: REQUIRED_SCORED_ATTEMPTS * topicIds.length,
        evidenceTypes: 0,
        requiredEvidenceTypes: REQUIRED_EVIDENCE_TYPES,
        hasEvidenceBeyondRecall: topicResults.some((result) => result.progress.hasEvidenceBeyondRecall),
        scoreAvailable: false,
        message: `Your activity is being recorded, but paper readiness is not available yet because ${topicIds.length - scored.length} topic${topicIds.length - scored.length === 1 ? '' : 's'} still need more varied evidence.`,
        nextStep: 'Continue with the least-evidenced topics and include activities beyond flashcards.',
      },
      explanation: `Your activity is being recorded. Paper readiness is not shown until every topic has enough varied evidence for its own readiness result.`,
    }
  }

  const score = Math.round(scored.reduce((sum, result) => sum + (result.score ?? 0), 0) / scored.length)
  const confidenceOrder: ConfidenceLevel[] = ['insufficient', 'low', 'medium', 'high']
  const confidence = scored.reduce<ConfidenceLevel>((lowest, result) =>
    confidenceOrder.indexOf(result.confidence) < confidenceOrder.indexOf(lowest) ? result.confidence : lowest, 'high')
  const evidenceCount = scored.reduce((sum, result) => sum + result.evidenceCount, 0)

  return {
    score,
    confidence,
    evidenceCount,
    familyCount: 0,
    families: [],
    latestEvidenceAt: null,
    progress: {
      scoredAttempts: evidenceCount,
      requiredScoredAttempts: REQUIRED_SCORED_ATTEMPTS * topicIds.length,
      evidenceTypes: 0,
      requiredEvidenceTypes: REQUIRED_EVIDENCE_TYPES,
      hasEvidenceBeyondRecall: true,
      scoreAvailable: true,
      message: 'Every topic has enough varied evidence for a paper readiness score.',
      nextStep: 'Use topic results to focus revision where readiness or confidence is lowest.',
    },
    explanation: `Paper readiness is the equal average of ${topicIds.length} topic readiness results; confidence is capped by the least-supported topic.`,
  }
}
