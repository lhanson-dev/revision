import { describe, expect, it } from 'vitest'
import type { PlannerCandidate } from './planning'
import { buildPlannerProgramme, type ProgrammeAssessment } from './programme'
import { buildProgrammeFirstDecision, buildProgrammeNearTermSchedule } from './programme-first'

const today = '2026-10-14'
const business = 'aqa:aqa-a-level:7132'
const psychology = 'aqa:aqa-a-level:7182'
const courses = new Set([business, psychology])

function exam(opts: Partial<ProgrammeAssessment> = {}): ProgrammeAssessment {
  return { assessmentId: 'business-paper-1', subjectId: 'business', courseId: business,
    title: 'Business Paper 1', assessmentDate: '2027-05-18', isActive: true, ...opts }
}
function topic(name: string, opts: Partial<PlannerCandidate> = {}): PlannerCandidate {
  return {
    id: `candidate-${name}`, courseId: business, subjectId: 'business',
    assessmentId: 'business-paper-1', topicId: name,
    activityType: 'quick-check', estimatedMinutes: 20,
    daysUntilAssessment: 216, assessmentImportance: 'normal',
    coverage: 0, evidenceStrength: 0.1, understanding: null, readiness: null,
    examWeight: null, learnerPreference: 0, recentlyCompleted: false,
    assessmentTargets: [{ assessmentId: 'business-paper-1', assessmentDate: '2027-05-18',
      topicIds: [name], daysUntilAssessment: 216, assessmentImportance: 'normal' }],
    ...opts,
  }
}
function decide(candidates: PlannerCandidate[], papers: ProgrammeAssessment[] = [exam()],
  capacity: number | null = 40) {
  const baseline = buildPlannerProgramme(today, papers, courses, candidates)
  return buildProgrammeFirstDecision(baseline, candidates, () => capacity)
}

describe('Programme-first FI-001: exam requirements → evidence need → attainable objectives', () => {
  it('SV-01 maps exact topics to paper dates and reports uncertain evidence instead of weakness', () => {
    const result = decide([topic('marketing'), topic('finance')])
    const objectives = result.weeks.flatMap((week) => week.objectives)
    expect(result.policyVersion).toBe('programme-first-v1')
    expect(result.finalKnownAssessment).toBe('2027-05-18')
    expect(result.totalSuggestedMinutes).toBe(40)
    expect(objectives).toHaveLength(2)
    expect(objectives.map((objective) => objective.topicId).sort()).toEqual(['finance', 'marketing'])
    expect(objectives.every((obj) => obj.evidenceNeed === 'unknown'
      && obj.treatment === 'establish-understanding' && obj.paperId === 'business-paper-1')).toBe(true)
    expect(objectives.every((obj) => obj.reason.includes('do not yet have enough valid evidence'))).toBe(true)
    expect(result.weeks.every((week) => !('items' in week))).toBe(true)
  })

  it('SV-02 and SV-10 distinguish scoped evidence-supported gap from demonstrated knowledge', () => {
    const inputs = [
      topic('weak', { evidenceStrength: 0.7, understanding: 0.3 }),
      topic('secure', { evidenceStrength: 0.8, understanding: 0.9 }),
    ]
    const result = decide(inputs)
    const byTopic = new Map(result.weeks.flatMap((week) => week.objectives)
      .map((objective) => [objective.topicId, objective]))
    expect(byTopic.get('weak')?.treatment).toBe('repair-and-check')
    expect(byTopic.get('weak')?.evidenceNeed).toBe('needs-attention')
    expect(byTopic.get('secure')?.treatment).toBe('retrieve-and-check')
    expect(byTopic.get('secure')?.evidenceNeed).toBe('demonstrated')
    const improved = decide([topic('weak', { evidenceStrength: 0.8, understanding: 0.9 }), inputs[1]!])
    expect(improved.weeks.flatMap((week) => week.objectives)
      .find((obj) => obj.topicId === 'weak')?.treatment).toBe('retrieve-and-check')
  })

  it('SV-03 separates two active courses and keeps actual paper identity', () => {
    const psychExam = exam({ assessmentId: 'psychology-paper-1', subjectId: 'psychology',
      courseId: psychology, assessmentDate: '2027-06-11', title: 'Psychology Paper 1' })
    const psych = topic('memory', { courseId: psychology, subjectId: 'psychology',
      assessmentId: psychExam.assessmentId,
      assessmentTargets: [{ assessmentId: psychExam.assessmentId, assessmentDate: psychExam.assessmentDate,
        topicIds: ['memory'], daysUntilAssessment: 240, assessmentImportance: 'normal' }] })
    const result = decide([topic('marketing'), psych], [exam(), psychExam])
    const selected = result.weeks.flatMap((week) => week.objectives)
    expect(new Set(selected.map((obj) => obj.courseId))).toEqual(new Set([business, psychology]))
    expect(result.unserved).toEqual([])
    expect(result.weeks.at(-1)?.milestones.at(-1)?.assessmentId).toBe('psychology-paper-1')
  })

  it('SV-04 deduplicates shared knowledge across two real papers', () => {
    const later = exam({ assessmentId: 'business-paper-2', assessmentDate: '2027-06-02',
      title: 'Business Paper 2' })
    const targets = [
      { assessmentId: 'business-paper-1', assessmentDate: '2027-05-18', topicIds: ['finance'],
        daysUntilAssessment: 216, assessmentImportance: 'normal' as const },
      { assessmentId: 'business-paper-2', assessmentDate: '2027-06-02', topicIds: ['finance'],
        daysUntilAssessment: 231, assessmentImportance: 'normal' as const },
    ]
    const result = decide([topic('finance', { assessmentTargets: targets })], [exam(), later])
    expect(result.weeks.flatMap((week) => week.objectives)).toHaveLength(1)
    expect(result.weeks.flatMap((week) => week.milestones)).toHaveLength(2)
  })

  it('SV-05 and SV-12 explain omissions rather than exceed zero/insufficient capacity', () => {
    const noTime = decide([topic('marketing')], [exam()], 0)
    expect(noTime.weeks.every((week) => week.objectives.length === 0)).toBe(true)
    expect(noTime.unserved).toEqual([{ obligationId: `${business}:marketing`, courseId: business,
      topicId: 'marketing', examDate: '2027-05-18', reason: 'insufficient-capacity' }])
    const small = decide([topic('marketing')], [exam()], 15)
    expect(small.unserved).toHaveLength(1)
    expect(small.totalSuggestedMinutes).toBe(0)
  })

  it('SV-13 unknown capacity remains unknown rather than claiming fitted minutes', () => {
    const result = decide([topic('marketing')], [exam()], null)
    expect(result.weeks[0].capacityMinutes).toBeNull()
    expect(result.weeks[0].remainingMinutes).toBeNull()
    expect(result.weeks.flatMap((week) => week.objectives)).toHaveLength(1)
  })

  it('SV-03/05 never turns fabricated optional paper scope into an objective', () => {
    const result = decide([topic('unsupported', { courseId: psychology,
      assessmentTargets: [{ assessmentId: 'invented-paper', assessmentDate: '2027-05-18',
        topicIds: ['unsupported'], daysUntilAssessment: 216, assessmentImportance: 'normal' }] })])
    expect(result.weeks.flatMap((week) => week.objectives)).toHaveLength(0)
  })

  it('SV-01 surfaces known syllabus demand with no published supported activity', () => {
    const baseline = buildPlannerProgramme(today, [exam()], courses, [])
    const result = buildProgrammeFirstDecision(baseline, [], () => 120, [{
      courseId: business, topicId: 'unserved-required-area', paperId: 'business-paper-1',
      examDate: '2027-05-18',
    }])
    expect(result.unserved).toEqual([{
      obligationId: `${business}:unserved-required-area`, courseId: business,
      topicId: 'unserved-required-area', examDate: '2027-05-18',
      reason: 'unsupported-asset',
    }])
    expect(result.totalSuggestedMinutes).toBe(0)
  })

  it('SV-07 near-term dates respect their assigned week and exam day cutoff', () => {
    const future = exam({ assessmentDate: '2026-10-24' })
    const first = topic('finance', { assessmentTargets: [{ assessmentId: future.assessmentId,
      assessmentDate: future.assessmentDate, topicIds: ['finance'], daysUntilAssessment: 10,
      assessmentImportance: 'normal' }] })
    const second = topic('marketing', { assessmentTargets: [{ assessmentId: future.assessmentId,
      assessmentDate: future.assessmentDate, topicIds: ['marketing'], daysUntilAssessment: 10,
      assessmentImportance: 'normal' }] })
    const decision = decide([first, second], [future], 20)
    const keys = Array.from({ length: 12 }, (_, i) =>
      new Date(Date.parse(today + 'T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10))
    const schedule = buildProgrammeNearTermSchedule(decision, [first, second],
      keys.map((date) => ({ date, availableMinutes: 20 })))
    expect(schedule).not.toBeNull()
    const allocated = schedule!.schedule.flatMap((day) => day.items.map((item) => ({ date: day.date, id: item.candidateId })))
    expect(allocated).toHaveLength(2)
    expect(allocated.every((item) => item.date < future.assessmentDate)).toBe(true)
    expect(allocated.every((item) => {
      const week = decision.weeks.find((x) => item.date >= x.visibleFrom && item.date <= x.visibleUntil)
      return week?.objectives.some((obj) => obj.candidateId === item.id)
    })).toBe(true)
  })

  it('SV-11 detects a moved deadline and moves the horizon/milestones rather than reusing stale paper dates', () => {
    const original = decide([topic('finance')], [exam()])
    const moved = exam({ assessmentDate: '2026-11-03' })
    const candidate = topic('finance', { assessmentTargets: [{
      assessmentId: moved.assessmentId, assessmentDate: moved.assessmentDate,
      topicIds: ['finance'], daysUntilAssessment: 20, assessmentImportance: 'normal' }] })
    const revised = decide([candidate], [moved])
    expect(revised.weeks.length).toBeLessThan(original.weeks.length)
    expect(revised.weeks.flatMap((w) => w.objectives).every((o) => o.examDate === moved.assessmentDate)).toBe(true)
  })

  it('all outputs and deadlines are deterministic across 120/365/730 day horizons', () => {
    for (const days of [120, 365, 730]) {
      const date = new Date(Date.parse(today + 'T00:00:00Z') + days * 86_400_000).toISOString().slice(0, 10)
      const paper = exam({ assessmentDate: date })
      const candidates = Array.from({ length: 10 }, (_, i) =>
        topic(`topic-${i}`, { assessmentTargets: [{
          assessmentId: paper.assessmentId, assessmentDate: date,
          topicIds: [`topic-${i}`], daysUntilAssessment: days, assessmentImportance: 'normal' }] }))
      const a = decide(candidates, [paper])
      const b = decide([...candidates].reverse(), [paper])
      expect(a).toEqual(b)
      expect(a.weeks.at(-1)?.visibleUntil).toBe(date)
    }
  })
})
