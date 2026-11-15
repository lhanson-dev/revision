import { useEffect, useMemo, useRef, useState } from 'react'
import {
  commitLf05FirstAnswer, completeLf05Attempt, discardLf05Attempt,
  latestLf05Attempt, listLf05Questions, loadLf05Guide, saveLf05Draft,
  startLf05Attempt, type Lf05Attempt, type Lf05Context, type Lf05Question,
} from '../services/progress/lf05-written-practice-service'
import { Button } from './ui'

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
  const [retry, setRetry] = useState(0)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const writeInProgress = useRef(false)
  const selected = questions.find(q=>q.id===choice)??null
  const eligible = useMemo(()=>questions.filter(q=>
    (markStyle==='all'||q.marks_style===markStyle) &&
    (!preferredTopicId||q.topic_id===preferredTopicId)
  ),[markStyle,preferredTopicId,questions])
  const persisted = attempt?.phase==='draft'&&status!=='error'&&
    answer===attempt.draft_text&&!writeInProgress.current
  const safeToLeave = !attempt||attempt.phase!=='draft'||persisted

  useEffect(()=>{
    let cancelled=false
    setCatalogueState('loading')
    void listLf05Questions(context).then(q=>{
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
  },[context.client,context.userId,context.courseId])

  useEffect(()=>{
    if(!choice||!selected)return
    let cancelled=false
    setStatus('loading');setError('');setAttempt(null);setGuidance([]);setAnswer('')
    void latestLf05Attempt(context,selected).then(async found=>{
      if(!found)return {row:null,guide:[] as string[]}
      return {row:found,guide:found.phase==='draft'?[]:await loadLf05Guide(context,selected)}
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
  },[context.client,context.courseId,context.userId,choice,selected?.content_fingerprint,retry])

  useEffect(()=>{
    if(!attempt||!selected||attempt.phase!=='draft'||status==='error'||status==='loading')return
    if(answer===attempt.draft_text)return
    if(writeInProgress.current)return
    const timer=window.setTimeout(()=>{
      if(writeInProgress.current)return
      writeInProgress.current=true
      setStatus('saving')
      void saveLf05Draft(context,selected,attempt,answer)
        .then(row=>{setAttempt(row);setStatus('saved');setError('')})
        .catch(e=>{
          setStatus('error')
          setError(e instanceof Error?e.message:'Latest draft is not confirmed saved.')
        })
        .finally(()=>{writeInProgress.current=false;setRetry(x=>x+1)})
    },700)
    return()=>window.clearTimeout(timer)
  },[answer,attempt,context.client,context.courseId,context.userId,selected?.id,status,retry])

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
      const row=await startLf05Attempt(context,selected,id)
      setAttempt(row);setAnswer(row.draft_text);setGuidance([]);setStatus('saved')
    } catch(e) {
      setStatus('error');setError(e instanceof Error?e.message:'The draft could not be started.')
    }
  }
  async function submit() {
    if(!selected||!attempt||!persisted||answer.trim().length<100)return
    setStatus('saving');setError('')
    try {
      const row=await commitLf05FirstAnswer(context,selected,attempt)
      const guide=await loadLf05Guide(context,selected)
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
      const row=await completeLf05Attempt(context,selected,attempt)
      setAttempt(row);setAnswer('');setStatus('submitted')
    } catch(e) {setStatus('error');setError(e instanceof Error?e.message:'Could not confirm deletion of raw answer.')}
  }
  async function discard() {
    if(!selected||!attempt||status==='saving')return
    try {
      await discardLf05Attempt(context,selected,attempt)
      setAttempt(null);setAnswer('');setGuidance([]);setError('');setStatus('saved')
      setConfirmDiscard(false)
    } catch(e){setStatus('error');setError(e instanceof Error?e.message:'Unable to discard saved writing.')}
  }
  function switchQuestion(id:string) {
    if(!safeToLeave)return
    setChoice(id);setConfirmDiscard(false)
  }

  // No cohort membership or no individually published reviewed questions:
  // do not show a phantom 16/25-mark option, private-review claim or a prompt
  // that someone else's course doesn't have access to.
  if(catalogueState==='loading'||catalogueState==='unavailable'||questions.length===0)return null

  return <section className="exam-simulator lf05-writing" aria-label="Original extended-writing practice">
    <p className="eyebrow">Original Revision written-answer training</p>
    <h2>Practise an extended answer</h2>
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
          {Array.from(new Set(questions.map(q=>q.marks_style))).sort((a,b)=>a-b)
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
          {status==='error'&&<Button variant="secondary" onClick={()=>setRetry(x=>x+1)}>Retry / reload saved state</Button>}
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
