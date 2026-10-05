import { useState, type FormEvent } from 'react'
import type { NewPlannedSession, PlannedSessionActivity } from '../services/planning/planned-session-service'
import { PLANNED_SESSION_MAX_MINUTES, PLANNED_SESSION_MIN_MINUTES } from '../services/planning/planned-session-service'
import { Button, ModalShell, OverlayBackdrop, SelectField, TextField } from './ui'

export interface PlanAddSessionCourse {
  courseId: string
  label: string
  topics: readonly { id: string; label: string }[]
}

export interface PlanAddSessionDialogProps {
  courses: readonly PlanAddSessionCourse[]
  /** The day to start on. */
  defaultDate: string
  todayKey: string
  saving: boolean
  error: string
  onSave: (session: NewPlannedSession) => void
  onClose: () => void
}

const activities: readonly { value: PlannedSessionActivity; label: string }[] = [
  { value: 'learn', label: 'Learn' },
  { value: 'practice', label: 'Practice' },
  { value: 'exam_prep', label: 'Exam practice' },
]

const lengths = [15, 20, 25, 30, 45, 60, 90]

/** Puts a session of the student's own choosing on a day. REV plans around it and never moves it. */
export function PlanAddSessionDialog({ courses, defaultDate, todayKey, saving, error, onSave, onClose }: PlanAddSessionDialogProps) {
  const [courseId, setCourseId] = useState(courses[0]?.courseId ?? '')
  const course = courses.find((item) => item.courseId === courseId) ?? courses[0]
  const [topicId, setTopicId] = useState(course?.topics[0]?.id ?? '')
  const [activity, setActivity] = useState<PlannedSessionActivity>('practice')
  const [minutes, setMinutes] = useState(30)
  const [date, setDate] = useState(defaultDate < todayKey ? todayKey : defaultDate)

  function changeCourse(next: string) {
    setCourseId(next)
    setTopicId(courses.find((item) => item.courseId === next)?.topics[0]?.id ?? '')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!course || !topicId || !date) return
    onSave({ plannedDate: date, courseId: course.courseId, topicId, activityType: activity, minutes, addedBy: 'student' })
  }

  const topicIsPicked = course?.topics.some((topic) => topic.id === topicId) ?? false

  return (
    <div className="pln-overlay">
      <OverlayBackdrop label="Close add session" onClick={onClose} />
      <ModalShell className="pln-dialog" labelledBy="pln-add-title" onDismiss={onClose} initialFocusSelector="select, input">
        <form onSubmit={submit} className="pln-dialog__form">
          <div>
            <p className="eyebrow">Your plan</p>
            <h2 id="pln-add-title">Add a session</h2>
            <p className="pln-card__note">Pick what you want to work on and when. REV plans around it and won't move it.</p>
          </div>
          {courses.length > 1 && (
            <SelectField label="Course" value={course?.courseId ?? ''} onChange={(event) => changeCourse(event.target.value)}>
              {courses.map((item) => <option key={item.courseId} value={item.courseId}>{item.label}</option>)}
            </SelectField>
          )}
          <SelectField label="Topic" value={topicIsPicked ? topicId : ''} required onChange={(event) => setTopicId(event.target.value)}>
            {course?.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
          </SelectField>
          <div className="pln-dialog__pair">
            <SelectField label="What kind" value={activity} onChange={(event) => setActivity(event.target.value as PlannedSessionActivity)}>
              {activities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </SelectField>
            <SelectField label="How long" value={String(minutes)} onChange={(event) => setMinutes(Number(event.target.value))}>
              {lengths.filter((value) => value >= PLANNED_SESSION_MIN_MINUTES && value <= PLANNED_SESSION_MAX_MINUTES).map((value) => <option key={value} value={value}>{value} minutes</option>)}
            </SelectField>
          </div>
          <TextField label="Day" type="date" required min={todayKey} value={date} onChange={(event) => setDate(event.target.value)} />
          {error && <p className="error" role="alert">{error}</p>}
          <div className="pln-card__actions">
            <Button type="submit" loading={saving} loadingLabel="Adding…" disabled={!topicIsPicked || !date}>Add to plan</Button>
            <Button variant="secondary" disabled={saving} onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </ModalShell>
    </div>
  )
}
