import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { PlanProgrammeOutlook } from './PlanProgrammeOutlook'
import { buildLearnerPreparationProgramme } from './planner-model'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = courses.find((entry) => entry.course.id === 'aqa:aqa-a-level:7132')!.course
const psychology = courses.find((entry) => entry.course.id === 'aqa:aqa-a-level:7182')!.course
const now = new Date(2026, 9, 31, 10)
const availability: RevisionAvailabilityProfile = {
  userId: 'fixture', timezone: 'Europe/London', weekdayMinutes: 45, weekendMinutes: 0,
  weeklyMinutes: { monday: 45, tuesday: 45, wednesday: 45, thursday: 45, friday: 45, saturday: 0, sunday: 0 },
}
const exams: RevisionAssessment[] = [
  { assessmentId: 'psych-1', userId: 'fixture', courseId: psychology.id, subjectId: 'psychology',
    moduleId: psychology.modules[0]!.manifest.id, title: 'Psychology paper 1',
    assessmentType: 'public_exam', assessmentDate: '2027-04-08',
    relativeImportance: 'normal', scope: {}, isActive: true },
  { assessmentId: 'business-1', userId: 'fixture', courseId: business.id, subjectId: 'business',
    moduleId: business.modules[0]!.manifest.id, title: 'Business paper 1',
    assessmentType: 'public_exam', assessmentDate: '2027-05-20',
    relativeImportance: 'normal', scope: {}, isActive: true },
]

function render(available: RevisionAvailabilityProfile | null, papers = exams) {
  const states = [createCourseLearningState(business, []), createCourseLearningState(psychology, [])]
  const { programme } = buildLearnerPreparationProgramme(states, papers, available, [], [], now)
  return renderToStaticMarkup(createElement(PlanProgrammeOutlook, {
    programme, courseLabel: (id: string) => id === psychology.id ? 'Psychology' : 'Business',
    topicLabel: (_course: string, id: string) => id,
    onOpenWeek() {}, view: 'week', anchor: '2026-10-31',
  }))
}

describe('B3 paper capacity and coverage honesty on canonical Plan', () => {
  it('shows real paper identities and capacity without claiming total effort, mastery or guaranteed exam feasibility', () => {
    const html = render(availability)
    expect(html).toContain('Available time and published activities before each paper')
    expect(html).toContain('Whole-paper feasibility is unknown')
    expect(html).toContain('Psychology paper 1')
    expect(html).toContain('Business paper 1')
    expect(html).toContain('provisionally available before this paper')
    expect(html).toContain('optional choices that have not been saved may be absent')
    expect(html).toContain('currently published, eligible activity options')
    expect(html).toContain('do not add these figures together')
    expect(html).toContain('Overall preparation feasibility: cannot assess')
    expect(html).not.toContain('ready for your exams')
  })

  it('distinguishes unknown time from available hours and never fabricates a paper from missing dates', () => {
    const withoutTime = render(null)
    expect(withoutTime).toContain('Remaining study capacity cannot currently be calculated')
    expect(withoutTime).toContain('Whole-paper feasibility is unknown')
    const withoutExams = render(availability, [])
    expect(withoutExams).toContain('Add known exam dates')
    expect(withoutExams).not.toContain('Time and verified work before each paper')
  })
})
