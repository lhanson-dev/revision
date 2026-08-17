import { learningEvidenceSchema, type LearningEvidence } from '../../engine/evidence/evidence'

export type LearningEvidenceRecord = {
  user_id: string
  evidence_id: string
  module_id: string
  topic_id: string
  source: LearningEvidence['source']
  occurred_at: string
  content_id: string
  payload: LearningEvidence
  schema_version: 1
}

export function toLearningEvidenceRecord(userId: string, value: unknown): LearningEvidenceRecord {
  if (!userId.trim()) throw new Error('userId is required')
  const evidence = learningEvidenceSchema.parse(value)
  return {
    user_id: userId,
    evidence_id: evidence.id,
    module_id: evidence.moduleId,
    topic_id: evidence.topicId,
    source: evidence.source,
    occurred_at: evidence.occurredAt,
    content_id: evidence.contentId,
    payload: evidence,
    schema_version: evidence.schemaVersion,
  }
}
