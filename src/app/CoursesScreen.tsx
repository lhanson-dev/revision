import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  addLearnerCourse,
  recordLearnerCourseEventBestEffort,
  removeLearnerCourse,
  type LearnerCourseMembership,
} from '../services/courses/learner-course-service'
import type { CatalogueSubject } from './catalogue-model'
import { allCatalogueCourses, projectLearnerProgramme } from './learner-programme'
import { Button, EmptyState, ModalShell, OverlayBackdrop, Status, TextField } from './ui'

type CoursesScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  onMembershipsChange: (memberships: LearnerCourseMembership[]) => void
  onOpenCourse: (courseId: string, source: 'courses_index') => void
}

function courseIdentity(subjectName: string, qualificationName: string, examBoardName: string, specificationCode: string) {
  const boardNeeded = !qualificationName.toLocaleLowerCase().includes(examBoardName.toLocaleLowerCase())
  return [subjectName, qualificationName, boardNeeded ? examBoardName : null, `Specification ${specificationCode}`].filter(Boolean).join(' · ')
}

export function CoursesScreen({ client, userId, catalogue, memberships, onMembershipsChange, onOpenCourse }: CoursesScreenProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [removeCourseId, setRemoveCourseId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const allCourses = useMemo(() => allCatalogueCourses(catalogue), [catalogue])
  const programme = useMemo(() => projectLearnerProgramme(catalogue, memberships), [catalogue, memberships])
  const activeIds = useMemo(() => new Set(memberships.map((membership) => membership.courseId)), [memberships])
  const availableToAdd = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return allCourses.filter((item) => {
      if (activeIds.has(item.course.id)) return false
      if (!normalized) return true
      return [
        item.subject.name,
        item.course.qualificationName,
        item.course.examBoardName,
        item.course.specificationCode,
      ].some((value) => value.toLocaleLowerCase().includes(normalized))
    })
  }, [activeIds, allCourses, query])

  const pendingRemoval = programme.courses.find((item) => item.course.id === removeCourseId)

  useEffect(() => {
    void recordLearnerCourseEventBestEffort(client, userId, 'courses_index_viewed')
  }, [client, userId])

  useEffect(() => {
    if (programme.unknownCourseIds.length === 0) return
    programme.unknownCourseIds.forEach((courseId) => {
      void recordLearnerCourseEventBestEffort(client, userId, 'course_membership_integrity_exception', courseId, {
        reason: 'saved_course_not_in_published_catalogue',
      })
    })
  }, [client, programme.unknownCourseIds, userId])

  useEffect(() => {
    if (!addOpen && !removeCourseId) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAddOpen(false)
        setRemoveCourseId(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [addOpen, removeCourseId])

  function openAddCourse() {
    setMessage('')
    setQuery('')
    setAddOpen(true)
    void recordLearnerCourseEventBestEffort(client, userId, 'add_course_opened')
  }

  async function addCourse(courseId: string) {
    setSaving(true)
    setMessage('')
    try {
      const membership = await addLearnerCourse(client, userId, courseId)
      onMembershipsChange([...memberships.filter((item) => item.courseId !== courseId), membership])
      setAddOpen(false)
      setQuery('')
      setMessage('Course added to your Revision programme.')
      await recordLearnerCourseEventBestEffort(client, userId, 'course_added', courseId)
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : 'Could not add that course.'
      setMessage(text)
      await recordLearnerCourseEventBestEffort(client, userId, 'course_add_failed', courseId, { message: text })
    } finally {
      setSaving(false)
    }
  }

  async function confirmRemoveCourse() {
    if (!removeCourseId) return
    const courseId = removeCourseId
    setSaving(true)
    setMessage('')
    try {
      await removeLearnerCourse(client, userId, courseId)
      onMembershipsChange(memberships.filter((item) => item.courseId !== courseId))
      setRemoveCourseId(null)
      setMessage('Course removed from your active programme. Your previous learning evidence has been kept.')
      await recordLearnerCourseEventBestEffort(client, userId, 'course_removed', courseId)
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not remove that course.')
    } finally {
      setSaving(false)
    }
  }

  function cancelRemoveCourse() {
    const courseId = removeCourseId
    setRemoveCourseId(null)
    if (courseId) void recordLearnerCourseEventBestEffort(client, userId, 'course_remove_cancelled', courseId)
  }

  return (
    <main className="dashboard screen-dashboard page-screen courses-screen" aria-labelledby="courses-page-title">
      <header className="page-heading courses-heading">
        <div>
          <p className="eyebrow">Your revision programme</p>
          <h1 id="courses-page-title">Courses</h1>
          <p>These are the courses Revision will use for your plan, progress and learner-wide REV guidance.</p>
        </div>
        <Button onClick={openAddCourse}>Add Course</Button>
      </header>

      {message && <Status tone="info" aria-live="polite">{message}</Status>}

      {programme.unknownCourseIds.length > 0 && (
        <Status tone="warning">
          One or more saved courses are no longer available in the published catalogue. Revision has kept their historical evidence but will not use them for new study recommendations.
        </Status>
      )}

      {programme.courses.length === 0 ? (
        <EmptyState
          className="courses-empty"
          title="Add your first course"
          description="Choose a supported course so Revision knows what belongs in your programme. Adding a course does not create progress or mastery evidence."
          action={<Button onClick={openAddCourse}>Add Course</Button>}
        />
      ) : (
        <section className="courses-grid" aria-label="Your active courses">
          {programme.courses.map(({ course, subject, label }) => (
            <article className="course-card courses-programme-card" key={course.id}>
              <div className="courses-programme-card-copy">
                <span className="tag">{course.examBoardName} · {course.specificationCode}</span>
                <h2>{label}</h2>
                <p>{courseIdentity(subject.name, course.qualificationName, course.examBoardName, course.specificationCode)}</p>
                <p className="muted">{course.learningAdapter.catalogueEntry.topicCount} syllabus topics · {course.modules.length} {course.modules.length === 1 ? 'exam paper/component' : 'exam papers/components'}</p>
              </div>
              <div className="courses-programme-card-actions">
                <Button onClick={() => onOpenCourse(course.id, 'courses_index')}>Open course</Button>
                <Button variant="tertiary" onClick={() => setRemoveCourseId(course.id)}>Remove course</Button>
              </div>
            </article>
          ))}
        </section>
      )}

      {addOpen && (
        <>
          <OverlayBackdrop label="Close Add Course" onClick={() => setAddOpen(false)} />
          <ModalShell className="courses-modal" labelledBy="add-course-title">
            <header className="courses-modal-head">
              <div><p className="eyebrow">Programme setup</p><h2 id="add-course-title">Add Course</h2></div>
              <Button variant="tertiary" size="compact" aria-label="Close Add Course" onClick={() => setAddOpen(false)}>Close</Button>
            </header>
            <p>Choose from courses Revision currently supports. Subject is used here to help you find the right course; it is not an extra navigation step after you add it.</p>
            <TextField label="Search courses" placeholder="Subject, level, exam board or specification" value={query} onChange={(event) => setQuery(event.target.value)} />
            <div className="courses-add-list" role="list" aria-label="Courses available to add">
              {availableToAdd.map(({ course, subject, label }) => (
                <article role="listitem" className="courses-add-item" key={course.id}>
                  <div><strong>{label}</strong><span>{courseIdentity(subject.name, course.qualificationName, course.examBoardName, course.specificationCode)}</span></div>
                  <Button size="compact" disabled={saving} onClick={() => void addCourse(course.id)}>Add</Button>
                </article>
              ))}
              {availableToAdd.length === 0 && <p className="muted">No supported courses match this search, or all matching courses are already in your programme.</p>}
            </div>
          </ModalShell>
        </>
      )}

      {removeCourseId && pendingRemoval && (
        <>
          <OverlayBackdrop label="Cancel removing course" onClick={cancelRemoveCourse} />
          <ModalShell className="courses-modal courses-remove-modal" labelledBy="remove-course-title">
            <p className="eyebrow">Change programme</p>
            <h2 id="remove-course-title">Remove {pendingRemoval.label}?</h2>
            <p>This removes the course from your active programme and future learner-wide recommendations. Your existing learning evidence and previous activity will be kept.</p>
            <div className="inline-actions">
              <Button disabled={saving} onClick={() => void confirmRemoveCourse()}>Remove course</Button>
              <Button variant="secondary" disabled={saving} onClick={cancelRemoveCourse}>Keep course</Button>
            </div>
          </ModalShell>
        </>
      )}
    </main>
  )
}
