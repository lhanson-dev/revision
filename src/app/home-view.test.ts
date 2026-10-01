import { describe, expect, it } from 'vitest'
import { assignSubjectColours, nextExam } from './home-view'
import type { RevisionAssessment } from '../services/planning/planner-service'

const assessment = (id: string, date: string, isActive = true): RevisionAssessment => ({
  assessmentId: id, userId: 'u', subjectId: 'business', courseId: null, moduleId: null,
  assessmentType: 'mock', title: `Exam ${id}`, assessmentDate: date, relativeImportance: 'normal', scope: {}, isActive,
} as RevisionAssessment)

describe('Home view helpers', () => {
  it('keeps named subject colours and hands new subjects the next free colour', () => {
    const colours = assignSubjectColours(['economics', 'business', 'psychology'])
    expect(colours.get('business')?.fill).toBe('#2bb6a3')
    expect(colours.get('psychology')?.fill).toBe('#7b6cf6')
    expect(colours.get('economics')?.fill).toBe('#ff7a59')
  })

  it('finds the next active upcoming exam and counts whole days', () => {
    const now = new Date(2026, 8, 30, 9, 0)
    const result = nextExam([assessment('past', '2026-09-01'), assessment('off', '2026-10-01', false), assessment('far', '2026-11-01'), assessment('near', '2026-10-22')], now)
    expect(result?.title).toBe('Exam near')
    expect(result?.daysAway).toBe(22)
    expect(nextExam([], now)).toBeNull()
  })
})
