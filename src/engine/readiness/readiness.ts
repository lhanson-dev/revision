import { evidencePercentage, type LearningEvidence } from '../evidence/evidence'

export type EvidenceFamily = 'recall' | 'application' | 'exam' | 'simulation'
export type ConfidenceLevel = 'insufficient' | 'low' | 'medium' | 'high'

export type ReadinessResult = {
  score: number | null
  confidence: ConfidenceLevel
  evidenceCount: number
  familyCount: number
  families: EvidenceFamily[]
  latestEvidenceAt: string | null
  explanation: string
}

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

export function assessReadiness(evidence: readonly LearningEvidence[], now = new Date()): ReadinessResult {
  const usable = evidence
    .map((item) => ({ item, percentage: evidencePercentage(item), family: familyFor(item) }))
    .filter((entry): entry is typeof entry & { percentage: number } => entry.percentage !== null)

  const families = [...new Set(usable.map((entry) => entry.family))]
  const latest = usable.length
    ? [...usable].sort((a, b) => b.item.occurredAt.localeCompare(a.item.occurredAt))[0].item.occurredAt
    : null
  const hasAssessment = families.some((family) => family !== 'recall')
  const enoughForScore = usable.length >= 6 && families.length >= 2 && hasAssessment

  let score: number | null = null
  if (enoughForScore) {
    const familyMeans = families.map((family) => {
      const entries = usable.filter((entry) => entry.family === family)
      return entries.reduce((sum, entry) => sum + entry.percentage, 0) / entries.length
    })
    score = Math.round(familyMeans.reduce((sum, value) => sum + value, 0) / familyMeans.length)
  }

  const recentCount = usable.filter((entry) => ageDays(entry.item.occurredAt, now) <= 30).length
  const latestAge = latest ? ageDays(latest, now) : Infinity

  let confidence: ConfidenceLevel = 'insufficient'
  if (enoughForScore) {
    confidence = 'low'
    if (usable.length >= 8 && families.length >= 2 && recentCount >= 3) confidence = 'medium'
    if (usable.length >= 12 && families.length >= 3 && recentCount >= 5 && families.includes('exam')) confidence = 'high'
    if (latestAge > 60) confidence = 'low'
  }

  const explanation = score === null
    ? `Not enough varied evidence yet. Revision needs at least 6 scored attempts across 2 evidence types, including something beyond flashcards.`
    : `Readiness is ${score}% with ${confidence} confidence, based on ${usable.length} scored attempts across ${families.length} evidence types. Evidence types are averaged separately so repeated flashcards cannot dominate the result.`

  return {
    score,
    confidence,
    evidenceCount: usable.length,
    familyCount: families.length,
    families,
    latestEvidenceAt: latest,
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
    return {
      score: null,
      confidence: 'insufficient',
      evidenceCount: topicResults.reduce((sum, result) => sum + result.evidenceCount, 0),
      familyCount: 0,
      families: [],
      latestEvidenceAt: null,
      explanation: 'Paper readiness is not shown until every topic has enough varied evidence for its own readiness result.',
    }
  }

  const score = Math.round(scored.reduce((sum, result) => sum + (result.score ?? 0), 0) / scored.length)
  const confidenceOrder: ConfidenceLevel[] = ['insufficient', 'low', 'medium', 'high']
  const confidence = scored.reduce<ConfidenceLevel>((lowest, result) =>
    confidenceOrder.indexOf(result.confidence) < confidenceOrder.indexOf(lowest) ? result.confidence : lowest, 'high')

  return {
    score,
    confidence,
    evidenceCount: scored.reduce((sum, result) => sum + result.evidenceCount, 0),
    familyCount: 0,
    families: [],
    latestEvidenceAt: null,
    explanation: `Paper readiness is the equal average of ${topicIds.length} topic readiness results; confidence is capped by the least-supported topic.`,
  }
}
