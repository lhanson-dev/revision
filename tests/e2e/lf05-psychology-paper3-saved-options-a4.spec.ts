import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { establishStudentExperience, completeStudentFirstUse } from '../../src/services/onboarding/student-first-use-service'
import { addLearnerCourse } from '../../src/services/courses/learner-course-service'
import { saveCourseAssessment } from '../../src/services/courses/course-planner-service'

// A disposable, isolated CI database only. The real six published items and
// all 33 education-HOLD items stay unchanged on approved production.
const enabled=process.env.REVISION_BROWSER_DB_INTEGRATION==='1'
const localUrl=process.env.SUPABASE_URL??'http://127.0.0.1:54321'
const anonKey=process.env.SUPABASE_ANON_KEY??''
const adminKey=process.env.SUPABASE_SERVICE_ROLE_KEY??''
const psychology='aqa:aqa-a-level:7182'
const paper3='psychology-aqa-a-level-7182-paper-3'
const app='/revision/app/'

// Synthetic published-stem response is supplied ONLY to this browser test.
// The real held source inventory is not promoted, even in isolated PostgreSQL.
const paper3Topics=[
  'issues-and-debates-in-psychology','relationships','gender','cognition-and-development',
  'schizophrenia','eating-behaviour','stress','aggression','forensic-psychology','addiction',
] as const
const mockPaper3Rows=paper3Topics.map((topic_id,i)=>({
  id:'PSY-LF05-'+String(i+8).padStart(2,'0'),
  course_id:psychology,paper_number:3,topic_id,
  skill_ref:'AQA 7182 v1.4 synthetic CI option test',
  title:'Synthetic '+topic_id,
  question_prompt:'Synthetic exam-style writing question to validate Paper 3 option visibility.',
  stimulus:null,marks_style:16,content_fingerprint:'0'.repeat(64),
  original_training_only:true,status:'published',
  approved_source_ref:'Disposable browser test fixture only',
}))
const first=['issues-and-debates-in-psychology','relationships','schizophrenia','aggression']
const second=['issues-and-debates-in-psychology','gender','eating-behaviour','forensic-psychology']

test('LF-05 Psychology writing shows only saved Paper 3 choices and updates after a changed Plan scope',async({page})=>{
  test.skip(!enabled,'Requires isolated CI database with 39 original staging records')
  if(!anonKey||!adminKey)throw new Error('Isolated CI credentials missing')
  const admin=createClient(localUrl,adminKey,{auth:{persistSession:false,autoRefreshToken:false}})
  const email=`lf05-options-${crypto.randomUUID()}@revision.invalid`
  const password=`Revision-${crypto.randomUUID()}-A1!`
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true})
  if(created.error||!created.data.user)throw new Error(created.error?.message??'Could not create disposable learner')
  const userId=created.data.user.id
  const client=createClient(localUrl,anonKey,{auth:{persistSession:false,autoRefreshToken:false}})
  try {
    await page.route('**/rest/v1/lf05_written_questions*', async(route) => {
      const response=await route.fetch()
      const published=await response.json()
      if (!Array.isArray(published)) throw new Error('Unexpected authenticated published question response')
      await route.fulfill({response,body:JSON.stringify([...published,...mockPaper3Rows])})
    })
    const signIn=await client.auth.signInWithPassword({email,password})
    if(signIn.error)throw new Error(signIn.error.message)
    await establishStudentExperience(client,userId)
    await completeStudentFirstUse(client,userId)
    await addLearnerCourse(client,userId,psychology)

    await page.goto(app)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button',{name:'Sign in'}).click()
    await page.goto(`${app}#/courses`)
    const course=page.locator('.course-card').filter({hasText:'AQA A-level Psychology'}).first()
    await expect(course).toBeVisible()
    await course.getByRole('button',{name:'Open course'}).click()
    await page.getByRole('navigation',{name:/AQA A-level Psychology navigation/})
      .getByRole('button',{name:'Exam Prep'}).click()
    const area=page.locator('.lf05-writing')
    const options=area.getByRole('combobox',{name:'Question'})
    await expect(area.getByText(/select one topic from each section in Plan/i)).toBeVisible()
    await expect(options.locator('option[value="PSY-LF05-08"]')).toHaveCount(1)
    await expect(options.locator('option[value="PSY-LF05-09"]')).toHaveCount(0)

    const assessment=await saveCourseAssessment(client,userId,{
      courseId:psychology,subjectId:'psychology',moduleId:paper3,
      title:'Paper 3: Issues and Options in Psychology',assessmentDate:'2027-06-09',
      assessmentType:'public_exam',relativeImportance:'high',scope:{topicIds:first},
    })
    await page.reload()
    const firstOptions=page.locator('.lf05-writing').getByRole('combobox',{name:'Question'})
    for(const id of ['PSY-LF05-08','PSY-LF05-09','PSY-LF05-12','PSY-LF05-15']) {
      await expect(firstOptions.locator(`option[value="${id}"]`)).toHaveCount(1)
    }
    for(const id of ['PSY-LF05-10','PSY-LF05-13','PSY-LF05-16']) {
      await expect(firstOptions.locator(`option[value="${id}"]`)).toHaveCount(0)
    }

    await saveCourseAssessment(client,userId,{
      assessmentId:assessment.assessmentId,courseId:psychology,subjectId:'psychology',
      moduleId:paper3,title:'Paper 3: Issues and Options in Psychology',
      assessmentDate:'2027-06-09',assessmentType:'public_exam',
      relativeImportance:'high',scope:{topicIds:second},
    })
    await page.reload()
    const updatedOptions=page.locator('.lf05-writing').getByRole('combobox',{name:'Question'})
    for(const id of ['PSY-LF05-08','PSY-LF05-10','PSY-LF05-13','PSY-LF05-16']) {
      await expect(updatedOptions.locator(`option[value="${id}"]`)).toHaveCount(1)
    }
    for(const id of ['PSY-LF05-09','PSY-LF05-12','PSY-LF05-15']) {
      await expect(updatedOptions.locator(`option[value="${id}"]`)).toHaveCount(0)
    }
  } finally {
    // No database publication state was changed: the ten extra prompts
    // existed only in this Playwright browser's intercepted list response.
    await client.auth.signOut()
    await admin.auth.admin.deleteUser(userId)
  }
})
