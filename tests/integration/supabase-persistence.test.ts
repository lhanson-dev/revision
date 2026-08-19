import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { LearningEvidence } from '../../src/engine/evidence/evidence'
import {
  createSupabaseEvidenceStore,
  loadLearningEvidence,
  recordLearningEvidence,
} from '../../src/services/progress/learning-evidence-service'
import {
  loadPlannerSetup,
  recordPlannerActivityEvent,
  saveAssessment,
  saveAvailabilityException,
  saveAvailabilityProfile,
  savePlanningPreference,
} from '../../src/services/planning/planner-service'

const integrationEnabled = process.env.REVISION_SUPABASE_INTEGRATION === '1'
const supabaseUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const anonKey = process.env.SUPABASE_ANON_KEY ?? ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const suite = describe.skipIf(!integrationEnabled)

function authenticatedClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

async function createSyntheticUser(admin: SupabaseClient, label: string) {
  const email = `integration-${label}-${crypto.randomUUID()}@revision.invalid`
  const password = `Revision-${crypto.randomUUID()}-A1!`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(`Could not create synthetic integration user: ${error?.message ?? 'missing user'}`)

  const client = authenticatedClient()
  const { error: signInError } = await client.auth.signInWithPassword({ email, password })
  if (signInError) throw new Error(`Could not sign in synthetic integration user: ${signInError.message}`)

  return { user: data.user, client }
}

suite('isolated Supabase persistence assurance', () => {
  let admin: SupabaseClient
  let learnerA: { user: User; client: SupabaseClient }
  let learnerB: { user: User; client: SupabaseClient }

  beforeAll(async () => {
    if (!anonKey || !serviceRoleKey) {
      throw new Error('SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are required for integration assurance')
    }
    admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    learnerA = await createSyntheticUser(admin, 'a')
    learnerB = await createSyntheticUser(admin, 'b')
  })

  afterAll(async () => {
    await learnerA?.client.auth.signOut()
    await learnerB?.client.auth.signOut()
    if (learnerA?.user.id) await admin?.auth.admin.deleteUser(learnerA.user.id)
    if (learnerB?.user.id) await admin?.auth.admin.deleteUser(learnerB.user.id)
  })

  it('persists and reloads validated learning evidence through the authenticated Data API', async () => {
    const evidence: LearningEvidence = {
      id: `integration-evidence-${crypto.randomUUID()}`,
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'finance',
      source: 'multiple_choice',
      occurredAt: new Date().toISOString(),
      contentId: 'integration-question-1',
      schemaVersion: 1,
      correct: true,
      selectedOption: 1,
      correctOption: 1,
    }

    const learnerAStore = createSupabaseEvidenceStore(learnerA.client)
    await recordLearningEvidence(learnerAStore, learnerA.user.id, evidence)

    const reloaded = await loadLearningEvidence(learnerAStore, learnerA.user.id, evidence.moduleId, evidence.topicId)
    expect(reloaded).toContainEqual(evidence)

    const learnerBStore = createSupabaseEvidenceStore(learnerB.client)
    const crossUserRead = await loadLearningEvidence(learnerBStore, learnerA.user.id, evidence.moduleId, evidence.topicId)
    expect(crossUserRead).toEqual([])
  })

  it('round-trips planner setup through the real service, Auth and RLS boundary', async () => {
    const assessment = await saveAssessment(learnerA.client, learnerA.user.id, {
      subjectId: 'business',
      assessmentType: 'mock',
      title: 'Integration mock',
      assessmentDate: '2026-09-08',
      relativeImportance: 'high',
      scope: { topicIds: ['finance'] },
    })

    await saveAvailabilityProfile(learnerA.client, learnerA.user.id, {
      weekdayMinutes: 90,
      weekendMinutes: 150,
      timezone: 'Europe/London',
    })
    const exception = await saveAvailabilityException(learnerA.client, learnerA.user.id, {
      localDate: '2026-08-25',
      availableMinutes: 30,
      note: 'Integration exception',
    })
    const preference = await savePlanningPreference(learnerA.client, learnerA.user.id, {
      preferenceType: 'prefer_subject',
      subjectId: 'business',
      startsOn: '2026-08-20',
      endsOn: '2026-08-27',
      strength: 2,
      source: 'learner',
      rationale: 'Integration preference',
    })
    const event = await recordPlannerActivityEvent(learnerA.client, learnerA.user.id, {
      recommendationId: 'integration-recommendation',
      eventType: 'completed',
      subjectId: 'business',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'finance',
      activityType: 'quick_check',
      metadata: { integration: true },
    })

    const reloaded = await loadPlannerSetup(learnerA.client, learnerA.user.id)
    expect(reloaded.assessments).toContainEqual(assessment)
    expect(reloaded.availability).toEqual({
      userId: learnerA.user.id,
      weekdayMinutes: 90,
      weekendMinutes: 150,
      timezone: 'Europe/London',
    })
    expect(reloaded.exceptions).toContainEqual(exception)
    expect(reloaded.preferences).toContainEqual(preference)
    expect(reloaded.activityEvents).toContainEqual(event)

    const learnerBViewOfA = await loadPlannerSetup(learnerB.client, learnerA.user.id)
    expect(learnerBViewOfA.assessments).toEqual([])
    expect(learnerBViewOfA.availability).toBeNull()
    expect(learnerBViewOfA.exceptions).toEqual([])
    expect(learnerBViewOfA.preferences).toEqual([])
    expect(learnerBViewOfA.activityEvents).toEqual([])
  })

  it('rejects cross-user planner writes at the authenticated service boundary', async () => {
    await expect(saveAssessment(learnerB.client, learnerA.user.id, {
      subjectId: 'business',
      assessmentType: 'mock',
      title: 'Cross-user integration attempt',
      assessmentDate: '2026-09-10',
      relativeImportance: 'normal',
    })).rejects.toThrow('Could not save assessment')
  })
})
