import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { fingerprintPracticeContent } from '../services/progress/practice-checkpoint-service'
import { fingerprintExamContent } from '../services/progress/exam-attempt-service'
import { buildQuestionPool } from './practice-questions'
import { availableCourseMocks } from './course-mock-catalogue'
import type { LearnerProgrammeCourse } from './learner-programme'

const practiceSnapshot = z.object({
  schemaVersion: z.literal(1),
  session: z.object({
    total: z.number().int().min(1).max(100),
    currentId: z.string().min(1).nullable(),
    poolIds: z.array(z.string().min(1)).min(1),
    answers: z.array(z.object({ retry: z.boolean() })),
  }),
  pending: z.unknown().nullable(),
})
type PracticeRow = {
  user_id: string; course_id: string; module_id: string; topic_id: string
  content_fingerprint: string; snapshot: unknown; expires_at: string; updated_at: string
}
type ExamRow = {
  user_id: string; course_id: string; module_id: string; exam_id: string
  content_fingerprint: string; phase: string; expires_at: string; updated_at: string
}

export type SavedWork = {
  kind: 'practice' | 'exam'
  courseId: string
  moduleId: string
  topicId?: string
  courseLabel: string
  title: string
  detail: string
  /** Exact recovery entry action; a saved exam currently opens Exam Prep's own recovery controls. */
  actionLabel: string
  updatedAt: string
}
export type SavedWorkResult = { items: SavedWork[]; partialError: boolean }

const alive = (expiry: string, now: number) => Number.isFinite(Date.parse(expiry)) && Date.parse(expiry) > now
const currentTime = (timestamp: string) => Number.isFinite(Date.parse(timestamp)) ? Date.parse(timestamp) : 0

/**
 * Read-only discovery, never a persistence authority. Every actual Continue action is
 * rechecked by the existing owner-scoped Practice or exam recovery service.
 * Only active published courses are eligible. No raw answers leave this function.
 */
export async function loadSavedWork(
  client: SupabaseClient,
  userId: string,
  programme: readonly LearnerProgrammeCourse[],
  now = Date.now(),
): Promise<SavedWorkResult> {
  if (!userId.trim()) throw new Error('Cannot check saved work without a learner.')
  const courseIds = [...new Set(programme.map(item => item.course.id))]
  if (!courseIds.length) return { items: [], partialError: false }

  const reads = await Promise.allSettled([
    client.from('learner_practice_checkpoints')
      .select('user_id,course_id,module_id,topic_id,content_fingerprint,snapshot,expires_at,updated_at')
      .eq('user_id', userId).in('course_id', courseIds).limit(200),
    client.from('learner_exam_attempts')
      .select('user_id,course_id,module_id,exam_id,content_fingerprint,phase:snapshot->>phase,expires_at,updated_at')
      .eq('user_id', userId).in('course_id', courseIds).limit(200),
  ])
  const [practiceRead, examRead] = reads.map(read =>
    read.status === 'fulfilled' ? read.value : { data: null, error: { message: 'Saved work read failed' } })
  const practiceError = Boolean(practiceRead.error)
  const examError = Boolean(examRead.error)
  if (practiceError && examError) throw new Error('Could not check your saved work.')
  const courses = new Map(programme.map(entry => [entry.course.id, entry]))
  const items: SavedWork[] = []

  for (const row of (practiceRead.data ?? []) as PracticeRow[]) {
    const entry = courses.get(row.course_id)
    if (!entry || row.user_id !== userId || !alive(row.expires_at, now)) continue
    const module = entry.course.modules.find(adapter => adapter.manifest.id === row.module_id)
    const topic = module?.getTopic(row.topic_id)
    if (!module || !topic || (entry.course.sharedLearning && module.manifest.id !== entry.course.learningAdapter.manifest.id)) continue
    const parsed = practiceSnapshot.safeParse(row.snapshot)
    if (!parsed.success) continue
    const session = parsed.data.session
    if (!session.currentId || !session.poolIds.includes(session.currentId)) continue
    const questions = buildQuestionPool({
      topicId: row.topic_id, topicOrder: topic.order ?? null,
      coursePack: module.listQuestions(row.topic_id), bank: module.listPracticeBank(),
      includeWritten: false,
    })
    if (!questions.some(question => question.id === session.currentId)) continue
    if (session.total > session.poolIds.length || session.answers.length > 200) continue
    if (await fingerprintPracticeContent(questions) !== row.content_fingerprint) continue
    const count = Math.min(session.total, session.answers.filter(answer => !answer.retry).length)
    items.push({
      kind: 'practice', courseId: row.course_id, moduleId: row.module_id, topicId: row.topic_id,
      courseLabel: entry.label, title: topic.shortTitle,
      detail: parsed.data.pending ? 'Answer save needs checking before you continue' : `${count} of ${session.total} questions answered`,
      actionLabel: 'Open saved Practice', updatedAt: row.updated_at,
    })
  }

  for (const row of (examRead.data ?? []) as ExamRow[]) {
    const entry = courses.get(row.course_id)
    if (!entry || row.user_id !== userId || !alive(row.expires_at, now)) continue
    if (!['writing', 'marking', 'submitting'].includes(row.phase)) continue
    const mock = availableCourseMocks(entry.course)
      .find(item => item.moduleId === row.module_id && item.exam.id === row.exam_id)
    if (!mock) continue
    if (await fingerprintExamContent(mock.exam) !== row.content_fingerprint) continue
    items.push({
      kind: 'exam', courseId: row.course_id, moduleId: row.module_id,
      courseLabel: entry.label, title: mock.exam.title,
      detail: row.phase === 'submitting' ? 'Exam submission needs finishing'
        : row.phase === 'marking' ? 'Marking in progress'
        : 'Timed mock saved',
      actionLabel: 'Open saved Exam Prep', updatedAt: row.updated_at,
    })
  }
  items.sort((a, b) => currentTime(b.updatedAt) - currentTime(a.updatedAt) ||
    [a.courseId, a.kind, a.moduleId, a.topicId ?? ''].join('|').localeCompare([b.courseId, b.kind, b.moduleId, b.topicId ?? ''].join('|')))
  return { items, partialError: practiceError || examError }
}
