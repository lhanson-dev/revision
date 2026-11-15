import { execFileSync } from 'node:child_process'
import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { establishStudentExperience, completeStudentFirstUse } from '../../src/services/onboarding/student-first-use-service'
import { addLearnerCourse } from '../../src/services/courses/learner-course-service'

const enabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const localUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const anonKey = process.env.SUPABASE_ANON_KEY ?? ''
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const courseId = 'aqa:aqa-a-level:7132'
const itemId = 'BUS-LF05-02-16'
const appPath = '/revision/app/'

// Never run privileged fixture changes on any remote, shared or live project.
// This worker executes only in the disposable local Supabase GitHub CI stack.
function localSql(query:string) {
  const url=new URL(localUrl)
  if(!enabled||url.protocol!=='http:'||url.hostname!=='127.0.0.1'||url.port!=='54321')
    throw new Error('LF-05 A4 fixture is limited to isolated CI localhost')
  if(!/^[\w\s(),.'=;:-]+$/.test(query)) throw new Error('Unsafe fixture SQL')
  execFileSync('docker',['exec','supabase_db_revision','psql','-U','postgres','-d','postgres',
    '-v','ON_ERROR_STOP=1','-c',query],{encoding:'utf8',timeout:20000})
}
async function isolatedUser(admin:SupabaseClient, label:string) {
  const email=`lf05-a4-${label}-${crypto.randomUUID()}@revision.invalid`
  const password=`Revision-${crypto.randomUUID()}-A1!`
  const result=await admin.auth.admin.createUser({email,password,email_confirm:true})
  if(result.error||!result.data.user)throw new Error(result.error?.message??'Missing test user')
  const client=createClient(localUrl,anonKey,{auth:{persistSession:false,autoRefreshToken:false}})
  const signIn=await client.auth.signInWithPassword({email,password})
  if(signIn.error)throw new Error(signIn.error.message)
  await establishStudentExperience(client,result.data.user.id)
  await completeStudentFirstUse(client,result.data.user.id)
  await addLearnerCourse(client,result.data.user.id,courseId)
  return {client,user:result.data.user,email,password}
}

test('LF-05 A4 real signed-in Business written answer saves, reloads, freezes and gates guide',async({page})=>{
  test.skip(!enabled,'Only disposable isolated database-backed CI A4 runs')
  if(!anonKey||!adminKey)throw new Error('Isolated CI credentials missing')
  const admin=createClient(localUrl,adminKey,{auth:{persistSession:false,autoRefreshToken:false}})
  let primary:{client:SupabaseClient,user:User,email:string,password:string}|null=null
  let outsider:{client:SupabaseClient,user:User,email:string,password:string}|null=null
  try {
    primary=await isolatedUser(admin,'author')
    outsider=await isolatedUser(admin,'outsider')
    if(!/^[0-9a-f-]{36}$/.test(primary.user.id))throw new Error('Unexpected synthetic user ID')
    localSql(`insert into lf05_private.lf05_test_memberships(user_id,expires_at) values ('${primary.user.id}',now()+interval '1 day')`)
    localSql(`update public.lf05_written_questions set status='published' where id='${itemId}'`)

    const otherList=await outsider.client.from('lf05_written_questions').select('id')
    expect(otherList.error).toBeNull()
    expect(otherList.data).toEqual([])
    const beforeGuide=await primary.client.from('lf05_written_guides')
      .select('guidance').eq('question_id',itemId)
    expect(beforeGuide.error).toBeNull()
    expect(beforeGuide.data).toEqual([])

    await page.goto(appPath)
    await page.getByLabel('Email').fill(primary.email)
    await page.getByLabel('Password').fill(primary.password)
    await page.getByRole('button',{name:'Sign in'}).click()
    await page.goto(`${appPath}#/courses`)
    const card=page.locator('.course-card').filter({hasText:'AQA A-level Business'}).first()
    await expect(card).toBeVisible()
    await card.getByRole('button',{name:'Open course'}).click()
    await page.getByRole('navigation',{name:/AQA A-level Business navigation/})
      .getByRole('button',{name:'Exam Prep'}).click()

    const area=page.locator('.lf05-writing')
    await expect(area.getByRole('heading',{name:'Practise an extended answer'})).toBeVisible()
    await area.getByRole('combobox',{name:'Question'}).selectOption(itemId)
    await expect(area.getByText(/Larch Medical Supplies employs 220/)).toBeVisible()
    await expect(area.getByText(/Evaluate whether Larch Medical Supplies/)).toBeVisible()
    await area.getByRole('button',{name:'Start private written answer'}).click()
    const answer=area.getByRole('textbox',{name:'Your independent answer'})
    const essay='Democratic leadership could give the staff more input into shift changes. '+
      'Larch has suffered a rise in turnover from twelve to twenty-one percent and orders are late. '+
      'Consultation might improve commitment, although it could delay urgent decisions. '+
      'I would introduce consultation for shifts but keep rapid decisions for emergencies.'
    await answer.fill(essay)
    await expect(area.getByText('Last change confirmed saved')).toBeVisible()
    await expect(area.getByRole('button',{name:'Submit first answer and unlock guidance'})).toBeEnabled()
    expect((await primary.client.from('lf05_written_guides').select('guidance').eq('question_id',itemId)).data)
      .toEqual([])

    await page.reload()
    const resumed=page.locator('.lf05-writing')
    await expect(resumed.getByRole('heading',{name:'Practise an extended answer'})).toBeVisible()
    await resumed.getByRole('combobox',{name:'Question'}).selectOption(itemId)
    await expect(resumed.getByRole('textbox',{name:'Your independent answer'})).toHaveValue(essay)
    await expect(resumed.getByText('Last change confirmed saved')).toBeVisible()
    await resumed.getByRole('button',{name:'Submit first answer and unlock guidance'}).click()
    await expect(resumed.getByText(/Differentiate autocratic and democratic leadership/)).toBeVisible()
    const after=await primary.client.from('lf05_written_attempts')
      .select('phase,first_answer_text,draft_text').eq('question_id',itemId).single()
    expect(after.error).toBeNull()
    expect(after.data?.phase).toBe('submitted')
    expect(after.data?.first_answer_text).toBe(essay)
    expect(after.data?.draft_text).toBe('')
    const guide=await primary.client.from('lf05_written_guides')
      .select('guidance').eq('question_id',itemId).single()
    expect(guide.error).toBeNull()
    expect(guide.data?.guidance).toHaveLength(6)
    const otherGuide=await outsider.client.from('lf05_written_guides').select('guidance')
    expect(otherGuide.error).toBeNull()
    expect(otherGuide.data).toEqual([])
    await resumed.getByRole('button',{name:'Finish review and delete saved answer text'}).click()
    await expect(resumed.getByText(/Your raw answer has been deleted/)).toBeVisible()
    const scrubbed=await primary.client.from('lf05_written_attempts')
      .select('phase,first_answer_text,draft_text').eq('question_id',itemId).single()
    expect(scrubbed.data).toMatchObject({phase:'completed',first_answer_text:'',draft_text:''})
  } finally {
    if(primary)await primary.client.auth.signOut()
    if(outsider)await outsider.client.auth.signOut()
    localSql(`update public.lf05_written_questions set status='held' where id='${itemId}'`)
    if(primary)await admin.auth.admin.deleteUser(primary.user.id)
    if(outsider)await admin.auth.admin.deleteUser(outsider.user.id)
  }
})
