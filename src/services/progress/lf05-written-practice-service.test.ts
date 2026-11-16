import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  commitLf05FirstAnswer, listLf05Questions, loadLf05Guide, saveLf05Draft,
  type Lf05Context, type Lf05Attempt, type Lf05Question,
} from './lf05-written-practice-service'

const question: Lf05Question = {
  id:'BUS-LF05-02-16',course_id:'aqa:aqa-a-level:7132',
  paper_number:2,topic_id:'leadership',skill_ref:'7132 §3.2.1',
  title:'Original leadership scenario',question_prompt:'Evaluate a defensible leadership choice in this original case.',
  stimulus:'An original fictional situation',marks_style:16,
  content_fingerprint:'a'.repeat(64),original_training_only:true,status:'published',
}
function context(data:unknown,error:unknown=null):Lf05Context {
  const query={
    select(){return this},
    eq(){return this},
    order(){return Promise.resolve({data,error})},
    maybeSingle(){return Promise.resolve({data,error})},
  }
  const client={from(){return query}} as unknown as SupabaseClient
  return {client,userId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',courseId:question.course_id}
}
const saved:Lf05Attempt={
  user_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  course_id:question.course_id,question_id:question.id,
  attempt_id:'11111111-1111-4111-8111-111111111111',
  revision:2,content_fingerprint:question.content_fingerprint,
  phase:'draft',draft_text:'Only a brief note.',first_answer_text:'',
  submitted_at:null,created_at:'2026-11-15T20:00:00Z',
  updated_at:'2026-11-15T20:00:00Z',expires_at:'2026-11-29T20:00:00Z',
}
describe('LF-05 private reviewed original-writing service',()=>{
  it('does not invent any question or paper tariff for an empty gated catalogue',async()=>{
    expect(await listLf05Questions(context([]))).toEqual([])
  })
  it('accepts correctly versioned original server-approved stems only',async()=>{
    expect(await listLf05Questions(context([question]))).toEqual([question])
  })
  it('rejects a misclassified unreviewed source even if the backend returns it',async()=>{
    await expect(listLf05Questions(context([{...question,status:'held'}]))).rejects.toThrow()
    await expect(listLf05Questions(context([{...question,original_training_only:false}]))).rejects.toThrow()
  })
  it('fails closed rather than presenting a question when the backend is absent',async()=>{
    await expect(listLf05Questions(context(null,{message:'missing'}))).rejects.toThrow('Cannot verify')
  })
  it('requires server-authorised post-submission guide and matching source fingerprint',async()=>{
    await expect(loadLf05Guide(context(null),question)).rejects.toThrow('unavailable')
    await expect(loadLf05Guide(context({content_fingerprint:'b'.repeat(64),
      guidance:['Accurate','Evidence','Conclusion']}),question)).rejects.toThrow('no longer matches')
    expect(await loadLf05Guide(context({content_fingerprint:question.content_fingerprint,
      guidance:['Accurate subject knowledge','Use the original scenario','Allow alternative judgements']}),question))
      .toHaveLength(3)
  })
  it('cannot submit a short or unconfirmed first draft, or edit a submitted answer',async()=>{
    await expect(commitLf05FirstAnswer(context(null),question,saved)).rejects.toThrow('100 characters')
    await expect(saveLf05Draft(context(null),question,{...saved,phase:'submitted'},'tamper'))
      .rejects.toThrow('cannot be edited')
  })
})
