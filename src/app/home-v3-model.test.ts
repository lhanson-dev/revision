import { describe, expect, it } from 'vitest'
import { upcomingHomeExams, homeTaskOnToday, homeToday } from './home-v3-model'
import type { PlanDay } from './plan-model'
import type { HomeTask } from './home-task'
import type { RevisionAssessment } from '../services/planning/planner-service'
import type { LearnerProgrammeCourse } from './learner-programme'
import type { PlannedSession } from '../services/planning/planned-session-service'

const course = { course: { id: 'business-aqa' }, subject: { id: 'business' } } as LearnerProgrammeCourse
const assessment = (id: string, date: string, type: 'mock' | 'public_exam', active = true): RevisionAssessment =>
  ({ assessmentId: id, userId: 'u', courseId: 'business-aqa', subjectId: 'business',
    assessmentType: type, assessmentDate: date, isActive: active, title: id }) as RevisionAssessment

describe('Home v3 data boundaries', () => {
  it('groups only real active upcoming mock and public exam dates', () => {
    const result = upcomingHomeExams([
      assessment('past', '2026-09-01', 'mock'),
      assessment('mock', '2026-10-16', 'mock'),
      assessment('official', '2026-10-22', 'public_exam'),
      assessment('inactive', '2026-10-12', 'mock', false),
    ], [course], new Date(2026, 9, 11, 18))
    expect(result.next?.assessment.assessmentId).toBe('mock')
    expect(result.next?.daysAway).toBe(5)
    expect(result.mocks).toHaveLength(0)
    expect(result.officials.map((entry) => entry.assessment.assessmentId)).toEqual(['official'])
  })

  it('combines later mock and official assessments in local date order and bounds to two', () => {
    const result = upcomingHomeExams([
      assessment('later-mock', '2026-10-14', 'mock'),
      assessment('b-official', '2026-10-12', 'public_exam'),
      assessment('a-mock', '2026-10-12', 'mock'),
      assessment('today', '2026-10-11', 'public_exam'),
    ], [course], new Date(2026, 9, 11, 23))
    expect(result.next?.daysAway).toBe(0)
    expect(result.later.map((entry) => entry.assessment.assessmentId)).toEqual(['a-mock', 'b-official'])
  })

  it('will not reveal exams from courses the learner has removed', () => {
    expect(upcomingHomeExams([assessment('x', '2026-10-22', 'public_exam')], [], new Date(2026,9,11)).next).toBeNull()
  })

  it('uses the Plan day builder for real completion counts, not recommendations or starts', () => {
    const session = (id: string, status: 'planned' | 'done'): PlannedSession =>
      ({ sessionId: id, userId: 'u', plannedDate: '2026-10-11', courseId: 'business-aqa',
        topicId: id, activityType: 'practice', minutes: id === 'first' ? 30 : 15,
        addedBy: 'student', recommendationId: null, status, createdAt: '', updatedAt: '' })
    const day = homeToday('2026-10-11',
      [session('first', 'done'), session('second', 'planned')],
      [], [], null, [], [course], [])
    expect(day.studyCount).toBe(2)
    expect(day.doneCount).toBe(1)
    expect(day.plannedMinutes).toBe(45)
    expect(day.doneMinutes).toBe(30)
    expect(day.allDone).toBe(false)
  })

  it('never labels a different activity or completed session as REV’s next task', () => {
    const task = { id: 'rev-exact', courseId: 'business-aqa', topicId: 'finance', activityType: 'flashcards' } as HomeTask
    const day = { items: [{
      kind: 'session', done: false, session: { courseId: 'business-aqa', topicId: 'finance', activityType: 'practice', recommendationId: 'rev-exact' },
    }] } as PlanDay
    expect(homeTaskOnToday(task, day)).toBe(true)
    expect(homeTaskOnToday({ ...task, activityType: 'exam-question' }, day)).toBe(false)
    expect(homeTaskOnToday({ ...task, id: 'different' }, day)).toBe(false)
    expect(homeTaskOnToday(task, { ...day, items: [{ ...day.items[0], done: true }] } as PlanDay)).toBe(false)
  })
})
