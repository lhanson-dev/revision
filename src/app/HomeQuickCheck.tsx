import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import type { HomeTask } from './home-task'
import { resolveSubjectIdentity, subjectColourVars } from './subject-palette'
import { Button, Icon, Status } from './ui'
import { SubjectBadge } from './ui/SubjectBadge'
import './home-quick-check.css'

export function displayQuickCheckTerm(term: string) {
  return term.charAt(0).toLocaleUpperCase() + term.slice(1)
}

export function quickCheckDefinition(prompt: string) {
  const text = prompt.replace(/^Which concept or approach completes this definition\?\s*/i, '')
  const blank = /_{3,}/.exec(text)
  return blank ? { pre: text.slice(0, blank.index), post: text.slice(blank.index + blank[0].length), hasBlank: true } : { pre: prompt, post: '', hasBlank: false }
}

interface Question {
  prompt: string
  options: readonly string[]
  correctOption: number
  explanation: string
}

interface Props {
  task: HomeTask
  questions: readonly Question[]
  index: number
  actualMinutes: number
  selected: number | null
  checked: boolean
  saving: boolean
  error: string
  results: readonly boolean[]
  backLabel: string
  finishedBooking: ReactNode
  onSelect: (index: number) => void
  onCheck: () => void
  onNext: () => void
  onBack: () => void
  onFinish: () => void
}

/** Presentation only: the parent retains evidence, dose and planner ownership. */
export function HomeQuickCheck({ task, questions, index, actualMinutes, selected, checked, saving, error, results, backLabel, finishedBooking, onSelect, onCheck, onNext, onBack, onFinish }: Props) {
  const [summary, setSummary] = useState(false)
  const question = questions[index]
  const titleRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLHeadingElement>(null)
  const identity = resolveSubjectIdentity(task.subjectId, task.subjectName)
  const colours = subjectColourVars(identity.hue)
  const style = { '--quick-subject-tint': colours.tint, '--quick-subject-ink': colours.ink } as CSSProperties
  const last = index + 1 === questions.length
  const right = selected === question?.correctOption
  const definition = quickCheckDefinition(question?.prompt ?? '')
  const picked = selected === null ? '' : question?.options[selected] ?? ''
  const term = (value: string) => definition.pre.trim() ? value : displayQuickCheckTerm(value)

  useEffect(() => {
    if (summary) summaryRef.current?.focus()
    else if (checked && !saving) nextRef.current?.querySelector('button')?.focus()
    else if (!checked) titleRef.current?.focus()
  }, [summary, checked, saving, index])

  function advance() {
    if (!checked || saving) return
    if (last) setSummary(true)
    else onNext()
  }

  function keyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (summary || saving || !question || event.repeat || event.altKey || event.ctrlKey || event.metaKey || target.closest('input, textarea, select, [contenteditable="true"]')) return
    const option = 'abcd'.indexOf(event.key.toLowerCase())
    if (!checked && option >= 0 && option < question.options.length) {
      event.preventDefault()
      onSelect(option)
    } else if (event.key === 'Enter' && (!target.closest('button, a') || target.closest('[data-quick-action]'))) {
      event.preventDefault()
      if (checked) advance()
      else if (selected !== null) onCheck()
    }
  }

  return (
    <main className="dashboard screen-dashboard home-focused-activity home-quick-check" aria-labelledby="home-focused-activity-title" data-subject-accent={task.subjectAccent} style={style} onKeyDown={keyboard}>
      <Button variant="tertiary" className="home-focused-back" onClick={onBack}><Icon name="arrow-right" size="inline" className="home-focused-back-icon" /> Back to {backLabel}</Button>
      <section className="home-focused-card">
        <header className="home-quick-check__header">
          <div className="home-quick-check__identity">
            <SubjectBadge hue={identity.hue} mark={identity.mark} />
            <div><h1 id="home-focused-activity-title">{task.topicLabel}</h1><p>{task.courseLabel} · Quick check</p></div>
            {!summary && questions.length > 0 && <span className="home-quick-check__time"><Icon name="clock" size="inline" /> about {Math.max(1, Math.round((questions.length - index) * actualMinutes / questions.length))} min left</span>}
          </div>
          {questions.length > 0 && <div className="home-quick-check__progress"><div aria-hidden="true">{questions.map((_, position) => <span key={position} data-state={position < results.length ? (results[position] ? 'right' : 'wrong') : position === index ? 'current' : 'todo'} />)}</div><span>{summary ? questions.length : index + 1} of {questions.length}</span></div>}
        </header>
        {task.source === 'planner' && actualMinutes !== task.estimatedMinutes && <p className="home-quick-check__notice" role="status">This topic has about {actualMinutes} minutes of supported practice. Your original {task.estimatedMinutes}-minute plan allocation is unchanged.</p>}
        {error && <Status tone="error">{error}</Status>}
        {!question ? <Status tone="warning">This quick check is no longer available for the recommended topic.</Status> : summary ? (
          <div className="home-quick-check__summary">
            <p className="ui-eyebrow">Quick check done · answers saved</p>
            <h2 ref={summaryRef} tabIndex={-1}>{results.filter(Boolean).length} of {questions.length} right</h2>
            {results.some(result => !result) ? <><h3>Worth another look</h3><ul>{questions.map((item, position) => !results[position] && <li key={position}><Icon name="status-needswork" /><div><strong>{displayQuickCheckTerm(item.options[item.correctOption])}</strong><p>{item.explanation}</p></div></li>)}</ul></> : <p>Nothing to go over from this set.</p>}
            {finishedBooking}
            <Button size="large" onClick={onFinish}>Back to today’s plan</Button>
          </div>
        ) : (
          <div className="home-focused-practice home-quick-check__body">
            <div className="home-quick-check__definition">
              <p className="ui-eyebrow">{definition.hasBlank ? 'Complete the definition' : 'Quick check'}</p>
              <h2 ref={titleRef} tabIndex={-1}>{definition.pre}{definition.hasBlank && <>{selected === null ? <span className="home-quick-check__blank" aria-label="blank"> </span> : <span className="home-quick-check__term" data-state={checked ? right ? 'right' : 'wrong' : 'picked'}>{checked && !right ? <s>{term(picked)}</s> : term(picked)}{checked && right && <Icon name="check" size="inline" />}</span>}{checked && !right && <>{' '}<span className="home-quick-check__term" data-state="right">{term(question.options[question.correctOption])}<Icon name="check" size="inline" /></span></>}{definition.post}</>}</h2>
            </div>
            <div className="home-focused-options home-quick-check__options" role="group" aria-label="Answer options">
              {question.options.map((option, position) => {
                const state = checked ? position === question.correctOption ? 'right' : position === selected ? 'wrong' : 'rest' : position === selected ? 'selected' : 'idle'
                return <button key={position} type="button" className="ui-answer-option" data-quick-action="option" data-state={state} aria-pressed={selected === position} disabled={checked || saving} onClick={() => onSelect(position)}><span className="ui-answer-option__letter home-quick-check__letter" aria-hidden="true">{state === 'right' || state === 'wrong' ? <Icon name={state === 'right' ? 'check' : 'close'} size="inline" /> : String.fromCharCode(65 + position)}</span><span className="ui-answer-option__text">{displayQuickCheckTerm(option)}</span>{state === 'right' && <small className="ui-answer-option__note">Correct</small>}{state === 'wrong' && <small className="ui-answer-option__note">Your answer</small>}</button>
              })}
            </div>
            {checked ? <div ref={nextRef} className="home-quick-check__feedback" data-state={right ? 'right' : 'wrong'} aria-live="polite"><span className="home-quick-check__feedback-icon"><Icon name={right ? 'check' : 'close'} /></span><div><h3>{right ? 'Correct.' : `Not quite. It's ${question.options[question.correctOption].toLocaleLowerCase()}.`}</h3><p>{question.explanation}</p></div><Button size="large" data-quick-action="next" disabled={saving} onClick={advance}>{last ? 'See how it went' : 'Next question'}<kbd>Enter</kbd></Button></div> : <div className="home-quick-check__actions"><Button size="large" data-quick-action="check" className={selected === null ? 'home-quick-check__check-empty' : undefined} aria-disabled={selected === null || saving} disabled={saving} onClick={() => { if (selected !== null && !saving) onCheck() }}>{saving ? 'Saving answer…' : selected === null ? 'Pick an answer to check' : <>Check “{displayQuickCheckTerm(picked)}”<kbd>Enter</kbd></>}</Button><p><Icon name="info" size="inline" /> Each answer is saved as evidence. One answer alone doesn’t decide your understanding or exam readiness.</p></div>}
          </div>
        )}
      </section>
    </main>
  )
}
