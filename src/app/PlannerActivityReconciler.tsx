import { isTopicScopedEvidence } from '../engine/evidence/evidence'
import { useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { loadPlannerSetup, recordPlannerActivityEvent, type RevisionActivityEvent } from '../services/planning/planner-service'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'

const availableAdapters = listAvailableContentAdapters()
const subjectByModuleId = new Map(availableAdapters.map((adapter) => [adapter.manifest.id, adapter.manifest.subject.id]))

/** Whole-paper results are not proof that a particular started topic activity finished. */
export function evidenceCompletesPlannerStart(
  item: LearningEvidence,
  start: Pick<RevisionActivityEvent, 'subjectId' | 'topicId' | 'occurredAt'> & Partial<Pick<RevisionActivityEvent, 'moduleId' | 'activityType'>>,
): boolean {
  // An answered question never proves a longer session, passive Learn exposure,
  // or an unrelated activity was completed after its Start.
  if (start.activityType === 'quick-check' || start.activityType === 'flashcards' || start.activityType === 'learn') return false
  if (start.activityType === 'exam-question' && item.source !== 'exam_question') return false
  return isTopicScopedEvidence(item)
    && (!start.moduleId || item.moduleId === start.moduleId)
    && subjectByModuleId.get(item.moduleId) === start.subjectId
    && item.topicId === start.topicId
    && new Date(item.occurredAt).getTime() >= new Date(start.occurredAt).getTime()
}

interface PlannerActivityReconcilerProps {
  client: SupabaseClient
  userId: string
  routeKey: string
}

export function PlannerActivityReconciler({ client, userId, routeKey }: PlannerActivityReconcilerProps) {
  useEffect(() => {
    let active = true

    async function reconcile() {
      const setup = await loadPlannerSetup(client, userId)
      if (!active) return

      const completedRecommendationIds = new Set(
        setup.activityEvents
          .filter((event) => event.eventType === 'completed' && event.recommendationId)
          .map((event) => event.recommendationId as string),
      )
      const cutoff = Date.now() - (7 * 86_400_000)
      const unmatchedStarts = setup.activityEvents.filter((event) =>
        event.eventType === 'started'
        && event.recommendationId
        && event.topicId
        && new Date(event.occurredAt).getTime() >= cutoff
        && !completedRecommendationIds.has(event.recommendationId)
        // Partial answers do not complete a multi-item focused session.
        && event.metadata.completionMode !== 'explicit_focused_session'
        // Legacy start records without a marker cannot prove the new multi-item
        // session ended merely because one scored answer was saved.
        && event.activityType !== 'quick-check'
        && event.activityType !== 'flashcards',
      )
      if (unmatchedStarts.length === 0) return

      const evidenceStore = createSupabaseEvidenceStore(client)
      const evidence = (await Promise.all(
        availableAdapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id)),
      )).flat()
      if (!active) return

      for (const start of unmatchedStarts) {
        const matchingEvidence = evidence.find((item) => evidenceCompletesPlannerStart(item, start))
        if (!matchingEvidence || !start.recommendationId) continue

        await recordPlannerActivityEvent(client, userId, {
          recommendationId: start.recommendationId,
          eventType: 'completed',
          subjectId: start.subjectId,
          moduleId: matchingEvidence.moduleId,
          topicId: start.topicId ?? undefined,
          activityType: start.activityType ?? undefined,
          metadata: {
            plannerVersion: 1,
            source: 'validated_evidence_reconciliation',
            evidenceId: matchingEvidence.id,
          },
        })
      }
    }

    void reconcile().catch(() => {
      // Reconciliation is best-effort and must never block learner navigation.
    })

    return () => { active = false }
  }, [client, userId, routeKey])

  return null
}
