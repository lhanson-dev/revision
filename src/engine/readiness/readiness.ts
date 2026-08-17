import { evidencePercentage, type LearningEvidence } from '../evidence/evidence'

export type EvidenceFamily = 'recall' | 'application' | 'exam' | 'simulation'
export type ConfidenceLevel = 'insufficient' | 'low' | 'medium' | 'high'
export type RecommendationActivity = 'flashcards' | 'quick-check' | 'exam-question'

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

export type RevisionRecommendation = {
  topicId: string
  activity: RecommendationActivity
  evidenceCount: number
  evidenceTypes: number
  readinessScore: number | null
  readinessConfidence: ConfidenceLevel
  reason: string
  evidenceSummary: string
  limitation: string
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

function familyMean(items: readonly LearningEvidence[], family: EvidenceFamily): number | null {
  const percentages = items
    .filter((item) => familyFor(item) === family)
    .map((item) => evidencePercentage(item))
    .filter((value): value is number => value !== null)
  if (percentages.length === 0) return null
  return percentages.reduce((sum, value) => sum + value, 0) / percentages.length
}

export function recommendNextActivity(
  moduleId: string,
  topicIds: readonly string[],
  evidence: readonly LearningEvidence[],
  now = new Date(),
): RevisionRecommendation | null {
  if (topicIds.length === 0) return null

  const candidates = topicIds.map((topicId, order) => {
    const items = evidence.filter((item) => item.moduleId === moduleId && item.topicId === topicId && evidencePercentage(item) !== null)
    const readiness = assessReadiness(items, now)
    return { topicId, order, items, readiness }
  })

  candidates.sort((left, right) => {
    const leftHasScore = left.readiness.score !== null ? 1 : 0
    const rightHasScore = right.readiness.score !== null ? 1 : 0
    if (leftHasScore !== rightHasScore) return leftHasScore - rightHasScore
    if (leftHasScore === 0 && left.items.length !== right.items.length) return left.items.length - right.items.length
    if (leftHasScore === 1 && left.readiness.score !== right.readiness.score) return (left.readiness.score ?? 0) - (right.readiness.score ?? 0)
    return left.order - right.order
  })

  const target = candidates[0]
  const families = new Set(target.items.map(familyFor))
  const recallMean = familyMean(target.items, 'recall')
  const applicationMean = familyMean(target.items, 'application')
  const examMean = familyMean(target.items, 'exam')
  let activity: RecommendationActivity
  let reason: string

  if (target.items.length === 0) {
    activity = 'quick-check'
    reason = 'There is no scored evidence for this topic yet, so Revision cannot tell whether it is strong or weak. Start with a Quick check to establish an application baseline.'
  } else if (families.size === 1 && families.has('recall')) {
    activity = 'quick-check'
    reason = 'Revision has recall evidence for this topic but nothing beyond flashcards. Add a Quick check so the evidence picture is based on more than memory alone.'
  } else if (!families.has('recall')) {
    activity = 'flashcards'
    reason = 'Revision has scored evidence beyond recall but no flashcard evidence for this topic. Use Flashcards to check whether the underlying knowledge is secure.'
  } else if (target.readiness.score === null) {
    if ((recallMean ?? 101) <= (applicationMean ?? 101)) {
      activity = 'flashcards'
      reason = 'This topic still needs more evidence, and recall is currently the weaker supported evidence family. Use Flashcards to strengthen the knowledge base before adding more application.'
    } else {
      activity = 'quick-check'
      reason = 'This topic still needs more evidence, and application is currently weaker than recall. Use a Quick check to practise applying the knowledge.'
    }
  } else if (!families.has('exam')) {
    activity = 'exam-question'
    reason = 'This topic now has enough recall and application evidence for a readiness score, but no written exam-question evidence. Add an Exam question to test whether the knowledge transfers into marks.'
  } else {
    const supported: Array<{ family: EvidenceFamily; mean: number; activity: RecommendationActivity }> = [
      ...(recallMean === null ? [] : [{ family: 'recall' as const, mean: recallMean, activity: 'flashcards' as const }]),
      ...(applicationMean === null ? [] : [{ family: 'application' as const, mean: applicationMean, activity: 'quick-check' as const }]),
      ...(examMean === null ? [] : [{ family: 'exam' as const, mean: examMean, activity: 'exam-question' as const }]),
    ].sort((left, right) => left.mean - right.mean)
    const weakest = supported[0]
    activity = weakest?.activity ?? 'quick-check'
    reason = weakest
      ? `${weakest.family[0].toUpperCase()}${weakest.family.slice(1)} is currently the weakest supported evidence family for this topic. Practise that activity next rather than repeating the strongest area.`
      : 'Use a Quick check next to add another scored application result.'
  }

  const hasSelfAssessedExam = target.items.some((item) => item.source === 'exam_question' && item.markingMethod === 'self_assessed')
  const hasExternallyMarkedExam = target.items.some((item) => item.source === 'exam_question' && item.markingMethod === 'externally_marked')
  const evidenceSummary = target.readiness.score === null
    ? `${target.items.length} scored activit${target.items.length === 1 ? 'y' : 'ies'} across ${families.size} evidence type${families.size === 1 ? '' : 's'}; there is not enough varied evidence for a topic readiness score yet.`
    : `${target.items.length} scored activities across ${families.size} evidence types; topic readiness is ${target.readiness.score}% with ${target.readiness.confidence} confidence.`

  let limitation: string
  if (target.items.length === 0) {
    limitation = 'This is a coverage recommendation, not a judgement that the topic is weak.'
  } else if (target.readiness.score === null) {
    limitation = 'Evidence is still limited, so this recommendation is based on coverage and the results available so far rather than a readiness score.'
  } else if (hasSelfAssessedExam && !hasExternallyMarkedExam) {
    limitation = 'Written exam evidence is self-assessed, so confidence remains capped and the recommendation may change as stronger evidence is added.'
  } else {
    limitation = `This recommendation uses ${target.readiness.confidence}-confidence topic evidence and may change when new scored work is recorded.`
  }

  return {
    topicId: target.topicId,
    activity,
    evidenceCount: target.items.length,
    evidenceTypes: families.size,
    readinessScore: target.readiness.score,
    readinessConfidence: target.readiness.confidence,
    reason,
    evidenceSummary,
    limitation,
  }
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
