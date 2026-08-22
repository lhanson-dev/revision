import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { getContentAdapter } from '../../src/engine/content/content-registry'
import type { LearningEvidence } from '../../src/engine/evidence/evidence'
import { createModuleLearningState } from '../../src/app/catalogue-model'
import { buildPlannerSnapshot } from '../../src/app/planner-model'
import {
  addLearnerCourse,
  loadLearnerCourses,
  recordLearnerCourseEvent,
  removeLearnerCourse,
} from '../../src/services/courses/learner-course-service'
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
const asCourseId = 'aqa:aqa-as:7131'

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

  it('persists and reloads learner course membership through the authenticated service boundary', async () => {
    // Synthetic users are created after migration replay and therefore must not receive
    // the bounded compatibility seed reserved for users who existed at migration time.
    expect(await loadLearnerCourses(learnerA.client, learnerA.user.id)).toEqual([])

    const added = await addLearnerCourse(learnerA.client, learnerA.user.id, asCourseId)
    expect(added.userId).toBe(learnerA.user.id)
    expect(added.courseId).toBe(asCourseId)
    expect(await loadLearnerCourses(learnerA.client, learnerA.user.id)).toContainEqual(added)

    await expect(addLearnerCourse(learnerA.client, learnerA.user.id, asCourseId))
      .rejects.toThrow('That course is already in your programme.')

    // RLS hides learner A rows from learner B even if B supplies A's user id.
    expect(await loadLearnerCourses(learnerB.client, learnerA.user.id)).toEqual([])
    await expect(addLearnerCourse(learnerB.client, learnerA.user.id, 'aqa:aqa-a-level:7132'))
      .rejects.toThrow('Could not add that course')

    await recordLearnerCourseEvent(learnerA.client, learnerA.user.id, 'course_added', asCourseId, { integration: true })
    const { data: ownEvents, error: ownEventsError } = await learnerA.client
      .from('learner_course_events')
      .select('event_type, course_id')
      .eq('user_id', learnerA.user.id)
    expect(ownEventsError).toBeNull()
    expect(ownEvents).toContainEqual({ event_type: 'course_added', course_id: asCourseId })

    await expect(recordLearnerCourseEvent(learnerB.client, learnerA.user.id, 'course_removed', asCourseId))
      .rejects.toThrow('Could not record course activity')

    await removeLearnerCourse(learnerA.client, learnerA.user.id, asCourseId)
    expect(await loadLearnerCourses(learnerA.client, learnerA.user.id)).toEqual([])
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

  it('round-trips planner setup and uses the reloaded context for deterministic replanning', async () => {
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

    const adapter = getContentAdapter('business-aqa-as-paper-2')
    if (!adapter) throw new Error('Expected Business AS Paper 2 content adapter for planner integration assurance')
    const state = createModuleLearningState(adapter, [])
    const replanned = buildPlannerSnapshot(
      [state],
      reloaded.assessments,
      reloaded.availability,
      reloaded.exceptions,
      reloaded.preferences,
      new Date('2026-08-21T12:00:00Z'),
    )
    expect(replanned).not.toBeNull()
    expect(replanned?.ranked.some((candidate) => candidate.reasons.includes('LEARNER_PRIORITY'))).toBe(true)
    expect(replanned?.today.length).toBeGreaterThan(0)

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