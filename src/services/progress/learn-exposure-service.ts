import type { SupabaseClient } from '@supabase/supabase-js'

/** Explicitly affirmed Learn reading; not a score or an estimated duration. */
export type LearnPageExposure = {
  userId: string
  courseId: string
  moduleId: string
  topicId: string
  pageId: string
  reviewedAt: string
}

type ExposureRow = {
  user_id: string; course_id: string; module_id: string
  topic_id: string; page_id: string; reviewed_at: string
}

function fromRow(row: ExposureRow): LearnPageExposure {
  return { userId: row.user_id, courseId: row.course_id, moduleId: row.module_id,
    topicId: row.topic_id, pageId: row.page_id, reviewedAt: row.reviewed_at }
}

export async function loadLearnExposures(client: SupabaseClient, userId: string): Promise<LearnPageExposure[]> {
  if (!userId.trim()) throw new Error('Learner is required to load reviewed pages.')
  const { data, error } = await client.from('learner_learn_exposures')
    .select('user_id,course_id,module_id,topic_id,page_id,reviewed_at')
    .eq('user_id', userId)
  if (error) throw new Error(`Could not load reviewed pages: ${error.message}`)
  return (data ?? []).map(row => fromRow(row as ExposureRow))
}

export async function markLearnPageReviewed(
  client: SupabaseClient, input: Omit<LearnPageExposure, 'reviewedAt'>,
): Promise<LearnPageExposure> {
  for (const [key, value] of Object.entries(input)) if (!value.trim()) throw new Error(`Learn page ${key} is required.`)
  const row = { user_id: input.userId, course_id: input.courseId, module_id: input.moduleId,
    topic_id: input.topicId, page_id: input.pageId }
  const { data, error } = await client.from('learner_learn_exposures')
    .upsert(row, { onConflict: 'user_id,course_id,module_id,page_id', ignoreDuplicates: true })
    .select('user_id,course_id,module_id,topic_id,page_id,reviewed_at').maybeSingle()
  if (error) throw new Error(`Could not save reviewed page: ${error.message}`)
  if (data) return fromRow(data as ExposureRow)
  // Uncertain retry or DO NOTHING: verify owner and exact topic rather than
  // treating a collision as evidence that the intended page was saved.
  const { data: existing, error: readError } = await client.from('learner_learn_exposures')
    .select('user_id,course_id,module_id,topic_id,page_id,reviewed_at')
    .eq('user_id', input.userId).eq('course_id', input.courseId)
    .eq('module_id', input.moduleId).eq('page_id', input.pageId).maybeSingle()
  if (readError || !existing || existing.topic_id !== input.topicId) {
    throw new Error('Could not verify the saved page and its topic. Please retry.')
  }
  return fromRow(existing as ExposureRow)
}
