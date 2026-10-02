import { useMemo, useState } from 'react'
import type { LearnerProgrammeCourse } from './learner-programme'
import { boardsComplete, chosenCourseIds, levelsAvailable, offeringsFor, subjectsAtLevel, type LevelId } from './onboarding-choices'
import { resolveSubjectIdentity } from './subject-palette'
import { Button, Status, SubjectBadge } from './ui'

type OnboardingCourseChoiceProps = {
  courses: readonly LearnerProgrammeCourse[]
  learner: string
  busy: boolean
  error: string
  onAdd: (courseIds: string[]) => void
}

type Step = 'level' | 'subjects' | 'boards'

function offeringLabel(item: LearnerProgrammeCourse) {
  const { course } = item
  const board = course.examBoardName
  const qualification = course.qualificationName.toLowerCase().startsWith(board.toLowerCase()) ? course.qualificationName : `${board} ${course.qualificationName}`
  return `${qualification} · Specification ${course.specificationCode}`
}

/**
 * Onboarding's first-course choice (decisions file section 4): Level, then subjects at that level,
 * then the exam board for each subject (AS or full A-level where both exist). One question per screen.
 * Only courses that are live in the catalogue are shown, so a student is never offered something we cannot teach.
 */
export function OnboardingCourseChoice({ courses, learner, busy, error, onAdd }: OnboardingCourseChoiceProps) {
  const levels = useMemo(() => levelsAvailable(courses), [courses])
  const [step, setStep] = useState<Step>('level')
  const [levelChoice, setLevelChoice] = useState<LevelId | ''>('')
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [picks, setPicks] = useState<Record<string, string>>({})

  const level = levelChoice || (levels.length === 1 ? levels[0].id : '')
  const subjects = useMemo(() => (level ? subjectsAtLevel(courses, level) : []), [courses, level])
  const stepNumber = step === 'level' ? 1 : step === 'subjects' ? 2 : 3
  const ids = level ? chosenCourseIds(courses, level, subjectIds, picks) : []

  function toggleSubject(id: string) {
    setSubjectIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  if (levels.length === 0) {
    return <Status tone="warning">No courses are available yet. Please try again later.</Status>
  }

  return (
    <div className="onb-choice">
      <div className="first-use-heading">
        <p className="eyebrow">Welcome, {learner}</p>
        <h1 id="first-course-heading">Add your courses</h1>
        <p className="onb-choice__step">Step {stepNumber} of 5</p>
      </div>
      <div className="first-use-rev-note"><strong>REV</strong><span>I only need enough to get you into useful revision. You can add more courses later.</span></div>
      {error && <Status tone="error">{error}</Status>}

      {step === 'level' && (
        <fieldset className="onb-choice__group">
          <legend>What level are you studying?</legend>
          <div className="onb-choice__cards">
            {levels.map((option) => (
              <label key={option.id} className="onb-card">
                <input type="radio" name="onboarding-level" checked={level === option.id} onChange={() => { setLevelChoice(option.id); setSubjectIds([]); setPicks({}) }} />
                <span className="onb-card__text"><strong>{option.label}</strong>{option.note && <small>{option.note}</small>}</span>
              </label>
            ))}
          </div>
          <p className="onb-choice__note">Only courses that are ready to study are shown here.</p>
          <div className="onb-choice__actions"><Button size="large" disabled={!level} onClick={() => setStep('subjects')}>Continue</Button></div>
        </fieldset>
      )}

      {step === 'subjects' && (
        <fieldset className="onb-choice__group">
          <legend>Which subjects do you study?</legend>
          <p className="onb-choice__hint">Pick all that apply.</p>
          <div className="onb-choice__cards">
            {subjects.map((subject) => {
              const { hue, mark } = resolveSubjectIdentity(subject.id, subject.name)
              return (
                <label key={subject.id} className="onb-card">
                  <input type="checkbox" checked={subjectIds.includes(subject.id)} onChange={() => toggleSubject(subject.id)} />
                  <SubjectBadge hue={hue} mark={mark} />
                  <span className="onb-card__text"><strong>{subject.name}</strong></span>
                </label>
              )
            })}
          </div>
          <div className="onb-choice__actions">
            <Button variant="secondary" size="large" onClick={() => setStep('level')}>Back</Button>
            <Button size="large" disabled={subjectIds.length === 0} onClick={() => setStep('boards')}>Continue</Button>
          </div>
        </fieldset>
      )}

      {step === 'boards' && level && (
        <div className="onb-choice__group">
          <h2 className="onb-choice__question">Which exam board for each one?</h2>
          {subjectIds.map((subjectId) => {
            const offerings = offeringsFor(courses, level, subjectId)
            const subject = subjects.find((item) => item.id === subjectId)
            if (!subject || offerings.length === 0) return null
            const { hue, mark } = resolveSubjectIdentity(subject.id, subject.name)
            return (
              <fieldset key={subjectId} className="onb-choice__subject">
                <legend><SubjectBadge hue={hue} mark={mark} size="plan" /> {subject.name}</legend>
                {offerings.length === 1 ? (
                  <p className="onb-choice__single">{offeringLabel(offerings[0])}</p>
                ) : (
                  <div className="onb-choice__cards">
                    {offerings.map((item) => (
                      <label key={item.course.id} className="onb-card">
                        <input type="radio" name={`board-${subjectId}`} checked={picks[subjectId] === item.course.id} onChange={() => setPicks((current) => ({ ...current, [subjectId]: item.course.id }))} />
                        <span className="onb-card__text"><strong>{offeringLabel(item)}</strong></span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
            )
          })}
          <div className="onb-choice__actions">
            <Button variant="secondary" size="large" onClick={() => setStep('subjects')}>Back</Button>
            <Button size="large" disabled={busy || !boardsComplete(courses, level, subjectIds, picks)} onClick={() => onAdd(ids)}>Add {ids.length || ''} {ids.length === 1 ? 'course' : 'courses'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
