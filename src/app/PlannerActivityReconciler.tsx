import { useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'

const availableAdapters = listAvailableContentAdapters()
const subjectByModuleId = new Map(availableAdapters.map((adapter) => [adapter.manifest.id, adapter.manifest.subject.id]))

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
        && !completedRecommendationIds.has(event.recommendationId),
      )
      if (unmatchedStarts.length === 0) return

      const evidenceStore = createSupabaseEvidenceStore(client)
      const evidence = (await Promise.all(
        availableAdapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id)),
      )).flat()
      if (!active) return

      for (const start of unmatchedStarts) {
        const matchingEvidence = evidence.find((item) => {
          const subjectId = subjectByModuleId.get(item.moduleId)
          return subjectId === start.subjectId
            && item.topicId === start.topicId
            && new Date(item.occurredAt).getTime() >= new Date(start.occurredAt).getTime()
        })
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
