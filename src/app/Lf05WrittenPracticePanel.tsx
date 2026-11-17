import { useEffect, useMemo, useRef, useState } from 'react'
import {
  commitLf05FirstAnswer, completeLf05Attempt, discardLf05Attempt,
  latestLf05Attempt, listLf05Questions, loadLf05Guide, saveLf05Draft,
  startLf05Attempt, type Lf05Attempt, type Lf05Context, type Lf05Question,
} from '../services/progress/lf05-written-practice-service'
import { Button } from './ui'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import {
  isAqaPsychologyPaper3, psychologyPaper3OptionContract, psychologyPaper3SavedTopicScope,
} from './psychology-paper3-option-scope'

const psychologyPaper3Adapter = listAvailableContentAdapters().find(isAqaPsychologyPaper3)
const psychologyPaper3Contract = psychologyPaper3Adapter
  ? psychologyPaper3OptionContract(psychologyPaper3Adapter) : null
const psychologyOptionalTopicIds = new Set(psychologyPaper3Contract?.groups.flatMap(
  (group) => group.options.map((option) => option.topicId),
) ?? [])

/**
 * One source-backed LF-05 written Practice workspace, reused from both
 * Course Practice and Exam Prep. This does not change timed-paper sessions or
 * turn a learner's self-assessment into an objective score.
 *
 * The server exposes the question stem only to entitled learners and the
 * marking guide ONLY after a submitted, immutable first answer. No original
 * essay text is uploaded to model providers or general learning evidence.
 */
export function Lf05WrittenPracticePanel({
  context, preferredTopicId,
}: {
  context: Lf05Context
  preferredTopicId?: string | null
}) {
  const [questions, setQuestions] = useState<Lf05Question[]>([])
  const [catalogueState, setCatalogueState] = useState<'loading'|'available'|'unavailable'>('loading')
  const [choice, setChoice] = useState('')
  const [markStyle, setMarkStyle] = useState<'all'|number>('all')
  const [attempt, setAttempt] = useState<Lf05Attempt|null>(null)
  const [answer, setAnswer] = useState('')
  const [guidance, setGuidance] = useState<string[]>([])
  const [status, setStatus] = useState<'loading'|'saved'|'unsaved'|'saving'|'error'|'submitted'>('loading')
  const [error, setError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)
  const [saveTick, setSaveTick] = useState(0)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [psychologyPaper3, setPsychologyPaper3] = useState<{
    phase: 'loading'|'selected'|'missing'|'error'; topicIds: string[]
  }>({phase:'loading',topicIds:[]})
  const writeInProgress = useRef(false)
  const ctx = useMemo(() => ({client:context.client,userId:context.userId,courseId:context.courseId}),
    [context.client,context.userId,context.courseId])
  const visibleQuestions = useMemo(() => questions.filter((q) =>
    ctx.courseId !== 'aqa:aqa-a-level:7182' || q.paper_number !== 3
    || !psychologyOptionalTopicIds.has(q.topic_id)
    || (psychologyPaper3.phase === 'selected' && psychologyPaper3.topicIds.includes(q.topic_id))
  ),[ctx.courseId,psychologyPaper3,questions])
  const selected = useMemo(() => visibleQuestions.find(q=>q.id===choice)??null, [visibleQuestions,choice])
  const eligible = useMemo(()=>visibleQuestions.filter(q=>
    (markStyle==='all'||q.marks_style===markStyle) &&
    (!preferredTopicId||q.topic_id===preferredTopicId)
  ),[markStyle,preferredTopicId,visibleQuestions])
  const persisted = attempt?.phase==='draft'&&status==='saved'&&
    answer===attempt.draft_text
  const safeToLeave = !attempt||attempt.phase!=='draft'||persisted

  useEffect(() => {
    if (ctx.courseId !== 'aqa:aqa-a-level:7182') return
    let cancelled = false
    setPsychologyPaper3({phase:'loading',topicIds:[]})
    void Promise.resolve(ctx.client.from('revision_assessments').select('scope')
      .eq('user_id',ctx.userId).eq('course_id',ctx.courseId)
      .eq('module_id','psychology-aqa-a-level-7182-paper-3')
      .eq('assessment_type','public_exam').eq('is_active',true))
      .then(({data,error}) => {
        if (cancelled) return
        if (error || !psychologyPaper3Contract) {
          setPsychologyPaper3({phase:'error',topicIds:[]})
          return
        }
        const scope = data?.length === 1
          ? psychologyPaper3SavedTopicScope(psychologyPaper3Contract,data[0].scope) : null
        setPsychologyPaper3(scope
          ? {phase:'selected',topicIds:scope.topicIds}
          : {phase:'missing',topicIds:[]})
      })
      .catch(() => {
        if (!cancelled) setPsychologyPaper3({phase:'error',topicIds:[]})
      })
    return () => { cancelled = true }
  },[ctx])

  useEffect(()=>{
    let cancelled=false
    void listLf05Questions(ctx).then(q=>{
      if(cancelled)return
      setQuestions(q)
      setCatalogueState('available')
    }).catch(()=>{
      if(cancelled)return
      // A missing migration, unapproved account, or network outage never
      // exposes draft research or guides. Existing site journeys still work.
      setCatalogueState('unavailable')
    })
    return()=>{cancelled=true}
  },[ctx])

  useEffect(()=>{
    if(!choice||!selected)return
    let cancelled=false
    // Reset after the effect's synchronous phase. Prior result data must not
    // survive into another account/question's response.
    void Promise.resolve().then(() => {
      if(cancelled)return null
      setStatus('loading');setError('');setAttempt(null);setGuidance([]);setAnswer('')
      return latestLf05Attempt(ctx,selected)
    }).then(async found=>{
      if(!found)return {row:null,guide:[] as string[]}
      return {row:found,guide:found.phase==='draft'?[]:await loadLf05Guide(ctx,selected)}
    }).then(({row,guide})=>{
      if(cancelled)return
      setAttempt(row)
      setAnswer(row?.phase==='draft'?row.draft_text:row?.first_answer_text??'')
      setGuidance(guide)
      setStatus(row?.phase==='draft'||!row?'saved':'submitted')
    }).catch(e=>{
      if(cancelled)return
      setError(e instanceof Error?e.message:'Could not confirm the saved response.')
      setStatus('error')
    })
    return()=>{cancelled=true}
  },[ctx,choice,selected,reloadTick])

  useEffect(()=>{
    if(!attempt||!selected||attempt.phase!=='draft'||status==='error'||status==='loading')return
    if(answer===attempt.draft_text)return
    if(writeInProgress.current)return
    const timer=window.setTimeout(()=>{
      if(writeInProgress.current)return
      writeInProgress.current=true
      setStatus('saving')
      void saveLf05Draft(ctx,selected,attempt,answer)
        .then(row=>{setAttempt(row);setStatus('saved');setError('')})
        .catch(e=>{
          setStatus('error')
          setError(e instanceof Error?e.message:'Latest draft is not confirmed saved.')
        })
        .finally(()=>{writeInProgress.current=false;setSaveTick(x=>x+1)})
    },700)
    return()=>window.clearTimeout(timer)
  },[answer,attempt,ctx,selected,status,saveTick])

  useEffect(()=>{
    if(safeToLeave)return
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''}
    window.addEventListener('beforeunload',warn)
    return()=>window.removeEventListener('beforeunload',warn)
  },[safeToLeave])

  async function start() {
    if(!selected||status==='loading')return
    setStatus('loading');setError('')
    try {
      const id=crypto.randomUUID()
      const row=await startLf05Attempt(ctx,selected,id)
      setAttempt(row);setAnswer(row.draft_text);setGuidance([]);setStatus('saved')
    } catch(e) {
      setStatus('error');setError(e instanceof Error?e.message:'The draft could not be started.')
    }
  }
  async function submit() {
    if(!selected||!attempt||!persisted||answer.trim().length<100)return
    setStatus('saving');setError('')
    try {
      const row=await commitLf05FirstAnswer(ctx,selected,attempt)
      const guide=await loadLf05Guide(ctx,selected)
      setAttempt(row);setGuidance(guide);setStatus('submitted')
    } catch(e) {
      // A committed server response may have succeeded despite a lost guide
      // response: on retry reload the exact attempt, never re-commit blindly.
      setStatus('error')
      setError(e instanceof Error?e.message:'Submission cannot be confirmed; reload before continuing.')
    }
  }
  async function finish() {
    if(!selected||!attempt||attempt.phase!=='submitted')return
    setStatus('saving')
    try {
      const row=await completeLf05Attempt(ctx,selected,attempt)
      setAttempt(row);setAnswer('');setStatus('submitted')
    } catch(e) {setStatus('error');setError(e instanceof Error?e.message:'Could not confirm deletion of raw answer.')}
  }
  async function discard() {
    if(!selected||!attempt||status==='saving')return
    try {
      await discardLf05Attempt(ctx,selected,attempt)
      setAttempt(null);setAnswer('');setGuidance([]);setError('');setStatus('saved')
      setConfirmDiscard(false)
    } catch(e){setStatus('error');setError(e instanceof Error?e.message:'Unable to discard saved writing.')}
  }
  function switchQuestion(id:string) {
    if(!safeToLeave)return
    setChoice(id);setConfirmDiscard(false)
  }

  // When no independently published originals exist for this course,
  // do not show a phantom question or marks option. This is ordinary signed-in
  // Practice; access is not determined by a per-account pilot allowlist.
  if(catalogueState==='loading'||catalogueState==='unavailable'||visibleQuestions.length===0)return null

  return <section className="exam-simulator lf05-writing" aria-label="Original extended-writing practice">
    <p className="eyebrow">Original Revision written-answer training</p>
    <h2>Practise an extended answer</h2>
    {ctx.courseId==='aqa:aqa-a-level:7182' && psychologyPaper3.phase!=='selected' &&
      <p role="status">{psychologyPaper3.phase==='loading'
        ? 'Checking your saved Psychology Paper 3 choices…'
        : psychologyPaper3.phase==='error'
          ? 'Your Paper 3 choices could not be checked. Optional-topic questions are temporarily hidden; retry by reopening this page.'
          : 'To see writing questions for your chosen Paper 3 options, select one topic from each section in Plan → Your exams. Compulsory-topic questions remain available.'}</p>}
    <p>These are original practice questions, not official AQA papers or confirmed 2027 mark tariffs.
      Your first answer is private, saved for up to 14 days and must be submitted before guidance appears.
      Any self-review is not an examiner mark or independent proof of mastery.</p>
    <div className="practice-meta">
      <label>Writing length
        <select value={markStyle} onChange={e=>{
          if(!safeToLeave)return
          setMarkStyle(e.target.value==='all'?'all':Number(e.target.value));setChoice('')
        }}>
          <option value="all">All verified available lengths</option>
          {Array.from(new Set(visibleQuestions.map(q=>q.marks_style))).sort((a,b)=>a-b)
            .map(n=><option key={n} value={n}>{n}-mark-style training</option>)}
        </select>
      </label>
      <label>Question
        <select value={choice} disabled={!safeToLeave&&Boolean(choice)}
          onChange={e=>switchQuestion(e.target.value)}>
          <option value="">Choose a question</option>
          {eligible.map(q=><option value={q.id} key={q.id}>{q.title} · {q.marks_style}-mark style</option>)}
        </select>
      </label>
    </div>
    {preferredTopicId&&eligible.length===0&&<p>No individually cleared extended-writing questions are available for this topic yet.</p>}
    {selected&&<div className="exam-prep-activity">
      <p className="practice-meta">{selected.skill_ref} · Paper {selected.paper_number} · {selected.marks_style}-mark-style training · {selected.id}</p>
      {selected.stimulus&&<section className="exam-stimulus" aria-label="Question scenario">
        <h3>Original question context</h3><p>{selected.stimulus}</p></section>}
      <h3>{selected.question_prompt}</h3>
      {!attempt&&status!=='loading'&&<Button onClick={()=>void start()}>Start private written answer</Button>}
      {status==='loading'&&<p role="status">Checking your latest saved answer…</p>}
      {attempt?.phase==='draft'&&<>
        <label className="answer-label">Your independent answer
          <textarea rows={12} maxLength={30000} value={answer}
            onChange={e=>{setAnswer(e.target.value);setStatus('unsaved')}}
            placeholder="Use the question and scenario to write your first answer before seeing any guidance."/>
        </label>
        <p aria-live="polite" role="status">
          {persisted?'Last change confirmed saved':
            status==='saving'?'Saving your private draft…':
            status==='error'?'Save not confirmed. Your on-screen text has not been submitted.':
            'Changes not yet confirmed saved'}
        </p>
        <div className="inline-actions">
          <Button disabled={!persisted||answer.trim().length<100} onClick={()=>void submit()}>
            Submit first answer and unlock guidance
          </Button>
          {status==='error'&&<><Button variant="secondary" onClick={()=>{setStatus('unsaved');setSaveTick(x=>x+1)}}>Retry saving this text</Button>
            <Button variant="secondary" onClick={()=>{setReloadTick(x=>x+1)}}>Reload last confirmed version</Button></>}
          {!confirmDiscard&&<Button variant="secondary" onClick={()=>setConfirmDiscard(true)}>Discard draft</Button>}
          {confirmDiscard&&<><span>Discard this private answer?</span>
            <Button variant="secondary" onClick={()=>void discard()}>Confirm discard</Button>
            <Button variant="secondary" onClick={()=>setConfirmDiscard(false)}>Keep writing</Button></>}
        </div>
        <p>You must write at least 100 characters. A failed or pending save never unlocks the model guidance.</p>
      </>}
      {attempt?.phase!=='draft'&&attempt&&<>
        <p role="status">First answer submitted and locked. Only your own response can unlock this Revision-authored guide.</p>
        {attempt.phase==='submitted'&&<label className="answer-label">Your original submitted answer
          <textarea rows={8} readOnly value={attempt.first_answer_text}/></label>}
        <div className="mark-guidance"><h4>Self-review guidance (not official or examiner marked)</h4>
          <ul>{guidance.map((line,i)=><li key={i}>{line}</li>)}</ul></div>
        <p>Identify one accurate point, one missing explanation and the next independent practice task.
          Viewing this guide does not change an objectively assessed skill or predicted grade.</p>
        {attempt.phase==='submitted'&&<Button variant="secondary" onClick={()=>void finish()}>
          Finish review and delete saved answer text
        </Button>}
        {attempt.phase==='completed'&&<p role="status">Your raw answer has been deleted from the active attempt; only minimal completion provenance remains until expiry.</p>}
        <Button variant="secondary" onClick={()=>void discard()}>Delete this attempt</Button>
      </>}
      {error&&<p className="error" role="alert">{error}</p>}
    </div>}
  </section>
}
