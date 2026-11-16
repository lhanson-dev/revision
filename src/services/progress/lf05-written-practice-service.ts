import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

/** One canonical, source-versioned LF-05 practice catalogue for Business/Psychology.
 * All data come from the server-only reviewed item registry. Original questions
 * contain no marking guides; guides have an independent post-submit DB policy.
 * No unreviewed source in draft PR #834 is bundled into the learner site.
 */
const questionSchema = z.object({
  id: z.string().regex(/^(PSY|BUS)-LF05-/),
  course_id: z.string().min(1),
  paper_number: z.number().int().min(1).max(3),
  topic_id: z.string().min(1),
  skill_ref: z.string().min(3),
  title: z.string().min(1),
  question_prompt: z.string().min(1),
  stimulus: z.string().nullable(),
  marks_style: z.number().int().min(4).max(30),
  content_fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  original_training_only: z.literal(true),
  status: z.literal('published'),
})
export type Lf05Question = z.infer<typeof questionSchema>

const attemptSchema = z.object({
  user_id: z.string().uuid(), course_id: z.string().min(1), question_id: z.string().min(1),
  attempt_id: z.string().uuid(), revision: z.number().int().positive(),
  content_fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  phase: z.enum(['draft','submitted','completed']),
  draft_text: z.string().max(30000), first_answer_text: z.string().max(30000),
  submitted_at: z.string().nullable(), created_at: z.string(), updated_at: z.string(), expires_at: z.string(),
})
export type Lf05Attempt = z.infer<typeof attemptSchema>
export type Lf05Context = { client: SupabaseClient; userId: string; courseId: string }

function safeRow(row: unknown): Lf05Attempt {
  return attemptSchema.parse(row)
}
function keyFilter(client: SupabaseClient, ctx: Lf05Context, q: Lf05Question, attemptId: string) {
  return client.from('lf05_written_attempts').select('*')
    .eq('user_id',ctx.userId).eq('course_id',ctx.courseId)
    .eq('question_id',q.id).eq('attempt_id',attemptId)
}
export async function listLf05Questions(ctx: Lf05Context): Promise<Lf05Question[]> {
  const {data,error}=await ctx.client.from('lf05_written_questions').select('*')
    .eq('course_id',ctx.courseId).eq('status','published').order('paper_number')
  if(error) throw new Error('Cannot verify eligible writing questions. Please retry.')
  return z.array(questionSchema).parse(data??[])
}
export async function latestLf05Attempt(ctx: Lf05Context, q: Lf05Question): Promise<Lf05Attempt|null> {
  const {data,error}=await ctx.client.from('lf05_written_attempts').select('*')
    .eq('user_id',ctx.userId).eq('course_id',ctx.courseId).eq('question_id',q.id)
    .order('updated_at',{ascending:false}).limit(1).maybeSingle()
  if(error) throw new Error('Cannot confirm your saved writing. Please retry.')
  if(!data) return null
  const row=safeRow(data)
  if(row.content_fingerprint!==q.content_fingerprint || Date.parse(row.expires_at)<=Date.now())
    throw new Error('This question changed or the attempt expired. Discard the incompatible attempt before continuing.')
  return row
}
async function readExact(ctx: Lf05Context,q:Lf05Question,attemptId:string):Promise<Lf05Attempt|null> {
  const {data,error}=await keyFilter(ctx.client,ctx,q,attemptId).maybeSingle()
  if(error) throw new Error('Could not confirm the latest writing save.')
  return data?safeRow(data):null
}
export async function startLf05Attempt(ctx: Lf05Context,q:Lf05Question,id:string):Promise<Lf05Attempt> {
  if(q.course_id!==ctx.courseId) throw new Error('Wrong course for this question.')
  const {data,error}=await ctx.client.from('lf05_written_attempts').insert({
    user_id:ctx.userId,course_id:ctx.courseId,question_id:q.id,attempt_id:id,
    content_fingerprint:q.content_fingerprint,revision:1,phase:'draft',draft_text:'',first_answer_text:'',
  }).select('*').single()
  if(!error&&data)return safeRow(data)
  const found=await readExact(ctx,q,id)
  if(found&&found.revision===1&&found.phase==='draft'&&found.draft_text==='')return found
  throw new Error('Could not confirm your first draft was created. No answers have been assumed saved.')
}
async function cas(ctx:Lf05Context,q:Lf05Question,current:Lf05Attempt,
  change:Record<string,unknown>,matches:(row:Lf05Attempt)=>boolean):Promise<Lf05Attempt> {
  if(current.content_fingerprint!==q.content_fingerprint||current.course_id!==ctx.courseId||
     current.user_id!==ctx.userId||current.question_id!==q.id) throw new Error('Wrong learner or question version.')
  if(Date.parse(current.expires_at)<=Date.now())throw new Error('This writing attempt expired.')
  const nextRevision=current.revision+1
  const {data,error}=await ctx.client.from('lf05_written_attempts')
    .update({...change,revision:nextRevision})
    .eq('user_id',ctx.userId).eq('course_id',ctx.courseId).eq('question_id',q.id)
    .eq('attempt_id',current.attempt_id).eq('revision',current.revision).select('*').maybeSingle()
  if(!error&&data)return safeRow(data)
  const found=await readExact(ctx,q,current.attempt_id)
  if(found?.revision===nextRevision&&matches(found))return found
  throw new Error('Your answer changed in another tab or the save is unconfirmed. Reload before editing again.')
}
export async function saveLf05Draft(ctx:Lf05Context,q:Lf05Question,current:Lf05Attempt,answer:string) {
  if(current.phase!=='draft') throw new Error('A submitted first answer cannot be edited.')
  if(answer.length>30000) throw new Error('Written responses cannot exceed 30,000 characters.')
  return cas(ctx,q,current,{draft_text:answer},row=>row.phase==='draft'&&row.draft_text===answer)
}
export async function commitLf05FirstAnswer(ctx:Lf05Context,q:Lf05Question,current:Lf05Attempt) {
  if(current.phase!=='draft'||current.draft_text.trim().length<100)
    throw new Error('Write at least 100 characters and confirm the draft save before submitting.')
  return cas(ctx,q,current,{
    phase:'submitted',draft_text:'',first_answer_text:current.draft_text,
  },row=>row.phase==='submitted'&&row.first_answer_text===current.draft_text&&!!row.submitted_at)
}
export async function completeLf05Attempt(ctx:Lf05Context,q:Lf05Question,current:Lf05Attempt) {
  if(current.phase!=='submitted')throw new Error('Only a submitted response can be completed.')
  return cas(ctx,q,current,{phase:'completed',first_answer_text:'',draft_text:''},
    row=>row.phase==='completed'&&row.first_answer_text===''&&row.submitted_at===current.submitted_at)
}
export async function discardLf05Attempt(ctx:Lf05Context,q:Lf05Question,current:Lf05Attempt) {
  const {data,error}=await ctx.client.from('lf05_written_attempts').delete()
    .eq('user_id',ctx.userId).eq('course_id',ctx.courseId).eq('question_id',q.id)
    .eq('attempt_id',current.attempt_id).eq('revision',current.revision)
    .select('attempt_id')
  if(!error&&data?.length===1)return
  const found=await readExact(ctx,q,current.attempt_id)
  if(!found)return
  throw new Error('Could not confirm this draft was discarded. Reload before retrying.')
}
export async function loadLf05Guide(ctx:Lf05Context,q:Lf05Question):Promise<string[]> {
  const {data,error}=await ctx.client.from('lf05_written_guides')
    .select('content_fingerprint,guidance').eq('question_id',q.id).maybeSingle()
  if(error||!data)throw new Error('Marking guidance is unavailable until your first submission is confirmed.')
  if(data.content_fingerprint!==q.content_fingerprint)throw new Error('The guide no longer matches this question.')
  return z.array(z.string().min(1)).min(3).parse(data.guidance)
}
