import { evidencePercentage, type LearningEvidence } from '../evidence/evidence'

export type TopicKnowledgeBand = 'not-enough-evidence' | 'low' | 'medium' | 'good'
export type TopicKnowledgeEvidenceFamily = 'recall' | 'application' | 'exam' | 'simulation'

export type TopicKnowledgeResult = {
  band: TopicKnowledgeBand
  score: number | null
  distinctContentItems: number
  familyCount: number
  families: TopicKnowledgeEvidenceFamily[]
  latestEvidenceAt: string | null
}

export type TopicKnowledgeTopicResult = TopicKnowledgeResult & {
  topicId: string
}

export type TopicKnowledgeDistribution = {
  good: number
  medium: number
  low: number
  notEnoughEvidence: number
}

export type TopicKnowledgeSummary = {
  topics: TopicKnowledgeTopicResult[]
  distribution: TopicKnowledgeDistribution
}

const REQUIRED_DISTINCT_CONTENT_ITEMS = 6
const REQUIRED_EVIDENCE_FAMILIES = 2

function familyFor(evidence: LearningEvidence): TopicKnowledgeEvidenceFamily {
  switch (evidence.source) {
    case 'flashcard': return 'recall'
    case 'multiple_choice': return 'application'
    case 'exam_question': return 'exam'
    case 'exam_attempt': return 'simulation'
  }
}

function latestDistinctEvidence(
  moduleId: string,
  topicId: string,
  evidence: readonly LearningEvidence[],
) {
  const latestByContent = new Map<string, { item: LearningEvidence; percentage: number }>()

  evidence.forEach((item) => {
    if (item.moduleId !== moduleId || item.topicId !== topicId) return
    const percentage = evidencePercentage(item)
    if (percentage === null) return

    const current = latestByContent.get(item.contentId)
    if (!current
      || item.occurredAt > current.item.occurredAt
      || (item.occurredAt === current.item.occurredAt && item.id > current.item.id)) {
      latestByContent.set(item.contentId, { item, percentage })
    }
  })

  return [...latestByContent.values()]
    .sort((left, right) => left.item.contentId.localeCompare(right.item.contentId))
}

export function assessTopicKnowledge(
  moduleId: string,
  topicId: string,
  evidence: readonly LearningEvidence[],
): TopicKnowledgeResult {
  const usable = latestDistinctEvidence(moduleId, topicId, evidence)
  const families = [...new Set(usable.map(({ item }) => familyFor(item)))]
    .sort() as TopicKnowledgeEvidenceFamily[]
  const hasEvidenceBeyondRecall = families.some((family) => family !== 'recall')
  const latestEvidenceAt = usable.length > 0
    ? usable.reduce((latest, entry) => entry.item.occurredAt > latest ? entry.item.occurredAt : latest, usable[0].item.occurredAt)
    : null

  const sufficient = usable.length >= REQUIRED_DISTINCT_CONTENT_ITEMS
    && families.length >= REQUIRED_EVIDENCE_FAMILIES
    && hasEvidenceBeyondRecall

  if (!sufficient) {
    return {
      band: 'not-enough-evidence',
      score: null,
      distinctContentItems: usable.length,
      familyCount: families.length,
      families,
      latestEvidenceAt,
    }
  }

  const familyMeans = families.map((family) => {
    const familyEvidence = usable.filter(({ item }) => familyFor(item) === family)
    return familyEvidence.reduce((sum, entry) => sum + entry.percentage, 0) / familyEvidence.length
  })
  const score = Math.round(familyMeans.reduce((sum, mean) => sum + mean, 0) / familyMeans.length)
  const band: TopicKnowledgeBand = score >= 75 ? 'good' : score >= 50 ? 'medium' : 'low'

  return {
    band,
    score,
    distinctContentItems: usable.length,
    familyCount: families.length,
    families,
    latestEvidenceAt,
  }
}

export function summariseTopicKnowledge(
  moduleId: string,
  topicIds: readonly string[],
  evidence: readonly LearningEvidence[],
): TopicKnowledgeSummary {
  const topics = topicIds.map((topicId) => ({
    topicId,
    ...assessTopicKnowledge(moduleId, topicId, evidence),
  }))

  return {
    topics,
    distribution: {
      good: topics.filter((topic) => topic.band === 'good').length,
      medium: topics.filter((topic) => topic.band === 'medium').length,
      low: topics.filter((topic) => topic.band === 'low').length,
      notEnoughEvidence: topics.filter((topic) => topic.band === 'not-enough-evidence').length,
    },
  }
}

export function topicKnowledgeLabel(band: TopicKnowledgeBand) {
  switch (band) {
    case 'good': return 'Good'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    case 'not-enough-evidence': return 'Not enough evidence'
  }
}
