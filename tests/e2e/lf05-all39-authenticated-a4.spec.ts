import { expect, test } from '@playwright/test'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { establishStudentExperience, completeStudentFirstUse } from '../../src/services/onboarding/student-first-use-service'
import { addLearnerCourse } from '../../src/services/courses/learner-course-service'
import { saveCourseAssessment } from '../../src/services/courses/course-planner-service'

// WARNING: Disposably promotes 33 original held items ONLY in CI's local
// isolated Supabase instance, and restores the original statuses in finally.
// Never execute against production or any shared/non-local backend.
const enabled = process.env.REVISION_BROWSER_DB_INTEGRATION === '1'
const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const anonKey = process.env.SUPABASE_ANON_KEY ?? ''
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const business='aqa:aqa-a-level:7132'
const psychology='aqa:aqa-a-level:7182'
const app='/revision/app/'

async function createSyntheticLearner(admin: SupabaseClient, label: string) {
  const email=`lf05-39-${label}-${crypto.randomUUID()}@revision.invalid`
  const password=`Revision-${crypto.randomUUID()}-A1!`
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true})
  if(created.error||!created.data.user)throw new Error(created.error?.message??'Synthetic user creation failed')
  const client=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}})
  const login=await client.auth.signInWithPassword({email,password})
  if(login.error)throw new Error(login.error.message)
  await establishStudentExperience(client,created.data.user.id)
  await completeStudentFirstUse(client,created.data.user.id)
  await addLearnerCourse(client,created.data.user.id,business)
  await addLearnerCourse(client,created.data.user.id,psychology)
  return {client,user:created.data.user,email,password}
}

test('LF-05 real signed-in 39-source rehearsal: Business and Psychology first answer, RLS and genuine Paper 3 options',async({page})=>{
  test.skip(!enabled,'Only disposable local database-backed CI A4 runs')
  test.setTimeout(180000)
  if(!anonKey||!adminKey)throw new Error('Local synthetic Auth credentials missing')
  const backend=new URL(url)
  if(!['127.0.0.1','localhost'].includes(backend.hostname)||backend.protocol!=='http:')
    throw new Error('Refusing promotion rehearsal against non-local Supabase')
  const admin=createClient(url,adminKey,{auth:{persistSession:false,autoRefreshToken:false}})
  const original=await admin.from('lf05_written_questions').select('id,status,course_id')
  if(original.error)throw original.error
  const held=(original.data??[]).filter(q=>q.status==='held').map(q=>q.id)
  expect(original.data).toHaveLength(39)
  expect(held).toHaveLength(33)
  expect((original.data??[]).filter(q=>q.status==='published')).toHaveLength(6)
  let learner:{client:SupabaseClient,user:User,email:string,password:string}|null=null
  let outsider:{client:SupabaseClient,user:User,email:string,password:string}|null=null
  try {
    const promoted=await admin.from('lf05_written_questions').update({status:'published'})
      .in('id',held).select('id')
    if(promoted.error)throw promoted.error
    expect(promoted.data).toHaveLength(33)
    learner=await createSyntheticLearner(admin,'author')
    outsider=await createSyntheticLearner(admin,'outsider')
    const allowed=await learner.client.from('lf05_written_questions').select('id,course_id')
    expect(allowed.error).toBeNull()
    expect(allowed.data).toHaveLength(39)
    expect(allowed.data?.filter(q=>q.course_id===business)).toHaveLength(20)
    expect(allowed.data?.filter(q=>q.course_id===psychology)).toHaveLength(19)
    expect((await learner.client.from('lf05_written_guides').select('guidance')
      .eq('question_id','BUS-LF05-01-16')).data).toEqual([])
    expect((await learner.client.from('lf05_written_guides').select('guidance')
      .eq('question_id','PSY-LF05-16')).data).toEqual([])

    await page.goto(app)
    await page.getByLabel('Email').fill(learner.email)
    await page.getByLabel('Password').fill(learner.password)
    await page.getByRole('button',{name:'Sign in'}).click()
    await page.goto(`${app}#/courses`)
    const bus=page.locator('.course-card').filter({hasText:'AQA A-level Business'}).first()
    await expect(bus).toBeVisible()
    await bus.getByRole('button',{name:'Open course'}).click()
    await page.getByRole('navigation',{name:/AQA A-level Business navigation/})
      .getByRole('button',{name:'Exam Prep'}).click()
    const writing=page.locator('.lf05-writing')
    await expect(writing.getByRole('heading',{name:'Practise an extended answer'})).toBeVisible()
    await writing.getByRole('combobox',{name:'Question'}).selectOption('BUS-LF05-01-16')
    await expect(writing.getByText(/Marshbrook Bakery Ltd has revenue/)).toBeVisible()
    expect((await learner.client.from('lf05_written_guides').select('guidance')
      .eq('question_id','BUS-LF05-01-16')).data).toEqual([])
    await writing.getByRole('button',{name:'Start private written answer'}).click()
    const essay='Marshbrook has £60,000 in accounting profit but only £90,000 of available cash. '+
      'A rapid expansion funded with a £400,000 loan could protect market share but risks short-term liquidity. '+
      'I would require a cash-flow forecast showing repayment timing before deciding whether slower internal funding is better.'
    await writing.getByRole('textbox',{name:'Your independent answer'}).fill(essay)
    await expect(writing.getByText('Last change confirmed saved')).toBeVisible()
    await page.reload()
    const resumed=page.locator('.lf05-writing')
    await resumed.getByRole('combobox',{name:'Question'}).selectOption('BUS-LF05-01-16')
    await expect(resumed.getByRole('textbox',{name:'Your independent answer'})).toHaveValue(essay)
    expect((await outsider.client.from('lf05_written_attempts')
      .select('attempt_id').eq('question_id','BUS-LF05-01-16')).data).toEqual([])
    await resumed.getByRole('button',{name:'Submit first answer and unlock guidance'}).click()
    await expect(resumed.getByText(/Retained profits and borrowing can coexist/)).toBeVisible()
    const submitted=await learner.client.from('lf05_written_attempts')
      .select('phase,first_answer_text,draft_text').eq('question_id','BUS-LF05-01-16').single()
    expect(submitted.error).toBeNull()
    expect(submitted.data?.phase).toBe('submitted')
    expect(submitted.data?.first_answer_text).toBe(essay)
    expect(submitted.data?.draft_text).toBe('')
    expect((await outsider.client.from('lf05_written_guides').select('guidance')
      .eq('question_id','BUS-LF05-01-16')).data).toEqual([])
    await resumed.getByRole('button',{name:'Finish review and delete saved answer text'}).click()
    await expect(resumed.getByText(/Your raw answer has been deleted/)).toBeVisible()

    const assessment=await saveCourseAssessment(learner.client,learner.user.id,{
      courseId:psychology,subjectId:'psychology',
      moduleId:'psychology-aqa-a-level-7182-paper-3',
      title:'Paper 3: Issues and Options in Psychology',assessmentDate:'2027-06-09',
      assessmentType:'public_exam',relativeImportance:'high',
      scope:{topicIds:['issues-and-debates-in-psychology','gender',
        'eating-behaviour','forensic-psychology']},
    })
    expect(assessment.assessmentId).toBeTruthy()
    await page.goto(`${app}#/courses`)
    const psy=page.locator('.course-card').filter({hasText:'AQA A-level Psychology'}).first()
    await expect(psy).toBeVisible()
    await psy.getByRole('button',{name:'Open course'}).click()
    await page.getByRole('navigation',{name:/AQA A-level Psychology navigation/})
      .getByRole('button',{name:'Exam Prep'}).click()
    const p=page.locator('.lf05-writing')
    await expect(p.getByRole('heading',{name:'Practise an extended answer'})).toBeVisible()
    const selector=p.getByRole('combobox',{name:'Question'})
    await expect(selector.locator('option[value="PSY-LF05-16"]')).toHaveCount(1)
    await expect(selector.locator('option[value="PSY-LF05-12"]')).toHaveCount(0)
    await selector.selectOption('PSY-LF05-16')
    await expect(p.getByText(/Compare typology-based and data-driven offender profiling/)).toBeVisible()
    await p.getByRole('button',{name:'Start private written answer'}).click()
    await p.getByRole('textbox',{name:'Your independent answer'}).fill(
      'Organised and disorganised typology can support an investigative hypothesis, but the categories are not proof. '+
      'Geographical profiling uses spatial crime patterns, whereas investigative psychology uses behavioural case data. '+
      'Both approaches have limitations in predictive validity, sampling, bias and possible false positives.'
    )
    await expect(p.getByText('Last change confirmed saved')).toBeVisible()
    await p.getByRole('button',{name:'Submit first answer and unlock guidance'}).click()
    await expect(p.getByText(/geographical profiling as legitimate data-driven comparisons/i)).toBeVisible()
    expect((await learner.client.from('lf05_written_guides').select('guidance')
      .eq('question_id','PSY-LF05-16').single()).data?.guidance).toHaveLength(11)
    expect((await outsider.client.from('lf05_written_attempts').select('attempt_id')
      .eq('question_id','PSY-LF05-16')).data).toEqual([])
  } finally {
    // On CI failure, clean up before the next integration test. The local
    // database is thrown away after the job; no production path exists.
    if(held.length) {
      const restore=await admin.from('lf05_written_questions').update({status:'held'})
        .in('id',held)
      if(restore.error)throw restore.error
    }
    for(const v of [learner,outsider]){
      if(v) {
        await v.client.auth.signOut()
        await admin.auth.admin.deleteUser(v.user.id)
      }
    }
  }
})
