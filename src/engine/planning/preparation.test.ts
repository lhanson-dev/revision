import { describe, expect, it } from 'vitest'
import { buildPlannerProgramme, type ProgrammeAssessment } from './programme'
import { buildPreparationProgramme } from './preparation'
import type { PlannerCandidate } from './planning'

const today = '2026-10-15'
const business = 'aqa:aqa-a-level:7132'
const psychology = 'aqa:aqa-a-level:7182'
const firstExam = '2027-05-18'
const laterExam = '2027-06-10'
function exam(courseId: string, date: string, suffix: string): ProgrammeAssessment {
  return { assessmentId: suffix, subjectId: courseId === business ? 'business' : 'psychology',
    courseId, title: suffix, assessmentDate: date, isActive: true }
}
function candidate(id: string, courseId: string, deadline: string, assessmentId: string, overrides: Partial<PlannerCandidate> = {}): PlannerCandidate {
  return { id, subjectId: courseId === business ? 'business' : 'psychology', courseId,
    topicId: id, assessmentId, daysUntilAssessment: 215, activityType: 'quick-check',
    estimatedMinutes: 20, assessmentImportance: 'normal', coverage: 0,
    understanding: null, readiness: null, evidenceStrength: 0, examWeight: null,
    learnerPreference: 0, recentlyCompleted: false,
    assessmentTargets: [{ assessmentId, assessmentDate: deadline, topicIds: [id],
      daysUntilAssessment: 215, assessmentImportance: 'normal' }], ...overrides }
}
function make(candidates: PlannerCandidate[], papers: ProgrammeAssessment[], capacity: number | null = 40) {
  const base = buildPlannerProgramme(today, papers, new Set([business, psychology]), candidates)
  return buildPreparationProgramme(base, candidates, () => capacity)
}
describe('FI-001 programme-first preparation: education and calendar contract', () => {
  it('uses actual supported obligations and paper dates rather than rotating topic labels', () => {
    const papers = [exam(business, firstExam, 'business-paper')]
    const candidates = Array.from({ length: 12 }, (_, i) =>
      candidate('business-topic-' + i, business, firstExam, 'business-paper'))
    const result = make(candidates, papers)
    expect(result.weeks.length).toBeGreaterThan(25)
    expect(result.weeks[0].objectives.length).toBeGreaterThan(0)
    expect(result.weeks[0].allocatedMinutes).toBeLessThanOrEqual(40)
    expect(result.weeks.flatMap((week) => week.objectives).map((o) => o.candidateId).sort())
      .toEqual(candidates.map((item) => item.id).sort())
    expect(result.weeks.flatMap((week) => week.objectives).every((o) =>
      o.reason.includes(firstExam) && o.purpose.length > 15)).toBe(true)
    expect(result.unserved).toHaveLength(0)
    expect(make([...candidates].reverse(), [...papers])).toEqual(result)
  })
  it('paces real supported opportunities across a feasible full exam horizon instead of exhausting them in the first two weeks', () => {
    const paper = exam(business, firstExam, 'paper-paced')
    const candidates = Array.from({ length: 25 }, (_, i) =>
      candidate('requirement-' + i, business, firstExam, paper.assessmentId))
    const result = make(candidates, [paper], 120)
    const activeWeeks = result.weeks.filter((week) => week.objectives.length > 0)
    expect(result.weeks.length).toBeGreaterThan(25)
    expect(activeWeeks.length).toBeGreaterThan(12)
    expect((activeWeeks.at(-1)?.weekStart ?? '') > '2027-02-01').toBe(true)
    expect(result.weeks.slice(0, 2).reduce((n, week) => n + week.objectives.length, 0))
      .toBeLessThan(candidates.length / 2)
    expect(result.allocatedMinutes).toBe(result.requiredMinutes)
  })
  it('keeps unknown evidence unknown and does not invent a readiness percentage', () => {
    const paper = exam(business, firstExam, 'paper')
    const result = make([candidate('finance', business, firstExam, paper.assessmentId)], [paper])
    expect(result.weeks[0].objectives[0]).toMatchObject({
      evidenceStatus: 'unknown', treatment: 'check',
    })
    expect(JSON.stringify(result)).not.toMatch(/mastered|grade estimate|optimal/)
  })
  it('changes treatment when genuinely different validated learner evidence is supplied', () => {
    const paper = exam(business, firstExam, 'paper')
    const unknown = make([candidate('finance', business, firstExam, paper.assessmentId)], [paper])
    const weak = make([candidate('finance', business, firstExam, paper.assessmentId,
      { understanding: 0.3, evidenceStrength: 0.8 })], [paper])
    expect(unknown.weeks[0].objectives[0].treatment).toBe('check')
    expect(weak.weeks[0].objectives[0].treatment).toBe('repair')
  })
  it('protects low time and states exactly what is not allocated', () => {
    const p = exam(business, '2026-10-26', 'paper')
    const c = Array.from({ length: 7 }, (_, i) => candidate('topic-' + i, business, p.assessmentDate, p.assessmentId))
    const result = make(c, [p], 15)
    expect(result.weeks.every((w) => w.objectives.length === 0)).toBe(true)
    expect(result.unserved).toHaveLength(7)
    expect(result.constraints.join(' ')).toContain('not allocated')
    expect(make(c, [p], 0).allocatedMinutes).toBe(0)
  })
  it('keeps missing availability distinct from zero and never claims a feasible calendar', () => {
    const p = exam(business, firstExam, 'paper')
    const result = make([candidate('finance', business, firstExam, p.assessmentId)], [p], null)
    expect(result.weeks.every((w) => w.availableMinutes === null && !w.objectives.length)).toBe(true)
    expect(result.constraints.join(' ')).toContain('unknown')
  })
  it('changes the eligible planning horizon when an exam date is moved', () => {
    const early = exam(business, '2026-11-04', 'paper')
    const late = exam(business, laterExam, 'paper')
    const before = make([candidate('x', business, early.assessmentDate, 'paper')], [early])
    const after = make([candidate('x', business, late.assessmentDate, 'paper')], [late])
    expect(after.weeks.length).toBeGreaterThan(before.weeks.length)
    expect(after.finalKnownAssessment).toBe(laterExam)
    expect(before.weeks.flatMap((w) => w.objectives).every((o) => o.assessmentDate === early.assessmentDate)).toBe(true)
  })
  it('keeps shared knowledge alive for a later paper if the earlier deadline passed', () => {
    const first = exam(business, '2026-10-16', 'paper1')
    const second = exam(business, laterExam, 'paper2')
    const shared = candidate('shared', business, first.assessmentDate, 'paper1', {
      assessmentTargets: [
        { assessmentId: 'paper1', assessmentDate: first.assessmentDate, topicIds: ['shared'],
          daysUntilAssessment: 1, assessmentImportance: 'normal' },
        { assessmentId: 'paper2', assessmentDate: second.assessmentDate, topicIds: ['shared'],
          daysUntilAssessment: 236, assessmentImportance: 'normal' },
      ],
    })
    const programme = buildPlannerProgramme(today, [first, second], new Set([business]), [shared])
    const result = buildPreparationProgramme(programme, [shared], (week) =>
      week.weekStart === '2026-10-12' ? 0 : 40)
    expect(result.weeks.find((w) => w.weekStart === '2026-10-19')?.objectives[0]?.assessmentId).toBe('paper2')
    expect(result.weeks.flatMap((w) => w.objectives)).toHaveLength(1)
  })
  it('honours actual capacity before the specific paper, not merely time later in that week', () => {
    const paper = exam(business, '2026-10-20', 'paper')
    const c = [candidate('scope', business, paper.assessmentDate, paper.assessmentId)]
    const base = buildPlannerProgramme(today, [paper], new Set([business]), c)
    const result = buildPreparationProgramme(base, c, () => 80,
      (_week, deadline) => deadline === paper.assessmentDate ? 0 : 80)
    expect(result.weeks.flatMap((w) => w.objectives)).toHaveLength(0)
    expect(result.unserved).toHaveLength(1)
  })
  it('protects a later paper when its only whole-activity slot is now and an earlier paper has a future slot', () => {
    const earlier = exam(business, '2026-10-20', 'business-early')
    const later = exam(psychology, '2026-11-10', 'psychology-later')
    const work = [
      candidate('business-opportunity', business, earlier.assessmentDate, earlier.assessmentId),
      candidate('psychology-opportunity', psychology, later.assessmentDate, later.assessmentId, {
        estimatedMinutes: 30,
      }),
    ]
    const horizon = buildPlannerProgramme(today, [earlier, later],
      new Set([business, psychology]), work)
    // The student has 30 minutes now, 20 minutes next Monday, and no later
    // opportunities. Business can fit next Monday before Tuesday's paper;
    // the 30-minute Psychology task cannot be split into that 20-minute slot.
    const plan = buildPreparationProgramme(horizon, work, (week) =>
      week.weekStart === '2026-10-12' ? 30
        : week.weekStart === '2026-10-19' ? 20 : 0)
    expect(plan.weeks[0].objectives.map((goal) => goal.candidateId))
      .toEqual(['psychology-opportunity'])
    expect(plan.weeks[1].objectives.map((goal) => goal.candidateId))
      .toEqual(['business-opportunity'])
    expect(plan.weeks[0].objectives[0].reason).toContain('too little available time')
    expect(plan.unserved).toHaveLength(0)
    expect(plan.allocatedMinutes).toBe(50)
    expect(plan.weeks.flatMap((week) => week.objectives).every((goal) =>
      goal.assessmentDate > (plan.weeks.find((week) => week.objectives.includes(goal))?.visibleFrom ?? '9999-12-31')))
      .toBe(true)
    expect(buildPreparationProgramme(horizon, [...work].reverse(), (week) =>
      week.weekStart === '2026-10-12' ? 30
        : week.weekStart === '2026-10-19' ? 20 : 0)).toEqual(plan)
  })

  it('prefers the unrepresented verified response format within the same equally pressured paper', () => {
    const p = exam(business, '2026-10-20', 'business-paper')
    const makeQuestion = (id: string, section: string): PlannerCandidate => candidate(
      id, business, p.assessmentDate, p.assessmentId, {
        activityType: 'exam-question', estimatedMinutes: 30,
        examTarget: { moduleId: 'verified-paper', examId: 'published', questionId: id },
        paperResponseSectionId: `${p.assessmentId}:section:${section}`,
        paperResponseFormat: section === '1' ? 'Multiple choice' : 'Extended response',
      },
    )
    const candidates = [
      makeQuestion('a-section-1', '1'), makeQuestion('b-section-1', '1'),
      makeQuestion('z-section-2', '2'),
    ]
    const horizon = buildPlannerProgramme(today, [p], new Set([business]), candidates)
    const capacity = (week: { weekStart: string }) => week.weekStart === '2026-10-12' ? 60 : 0
    const result = buildPreparationProgramme(horizon, candidates, capacity)
    const proposed = result.weeks.flatMap((week) => week.objectives)
    expect(proposed.map((objective) => objective.candidateId)).toEqual([
      'a-section-1', 'z-section-2',
    ])
    expect(proposed[1].paperResponseSectionId).toBe('business-paper:section:2')
    expect(proposed[1].purpose).toContain('Extended response')
    expect(result.unserved.map((objective) => objective.candidateId)).toEqual(['b-section-1'])
    expect(buildPreparationProgramme(horizon, [...candidates].reverse(), capacity)).toEqual(result)
  })

  it('does not treat exam style practice as a flashcard or conflate paper demand', () => {
    const p = exam(psychology, laterExam, 'psych-paper')
    const c = candidate('exam-skill', psychology, laterExam, p.assessmentId, {
      activityType: 'exam-question', estimatedMinutes: 30,
      examTarget: { moduleId: 'verified-paper-module', examId: 'exam', questionId: 'q1' },
    })
    const objective = make([c], [p], 60).weeks[0].objectives[0]
    expect(objective.treatment).toBe('exam-practice')
    expect(objective.purpose).toContain('paper')
    expect(objective.activityType).toBe('exam-question')
  })
})
