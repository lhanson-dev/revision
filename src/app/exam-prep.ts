import type { ExamPapersContent, ExamPaperGuide } from '../../content/exam-papers-schema'
import { aqaBusiness7132ExamPapers } from '../../content/business/aqa-a-level/shared/exam-papers'
import type { TopicProgress } from './topic-status'

/**
 * Plain rules behind the Exam Prep page. Everything the page says comes from the paper guide content file,
 * the course's own exams and the student's saved evidence. Nothing is typed in by hand.
 */

const paperGuides: readonly ExamPapersContent[] = [aqaBusiness7132ExamPapers]

/** The paper guide for a board and specification, or null when none has been published for that course yet. */
export function examPapersFor(examBoardName: string, specificationCode: string): ExamPapersContent | null {
  return paperGuides.find((guide) => guide.examBoard === examBoardName && guide.specificationCode === specificationCode) ?? null
}

/** "31 weeks away", "1 week away", "5 days away", "Today". Whole weeks, rounded down; under a week is shown in days. */
export function weeksAwayPhrase(date: string, now: Date = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const target = new Date(`${date}T00:00:00`).getTime()
  const days = Math.max(0, Math.round((target - today) / 86_400_000))
  if (days === 0) return 'Today'
  if (days < 7) return days === 1 ? '1 day away' : `${days} days away`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week away' : `${weeks} weeks away`
}

/** "Tue 11 May 2027". Local date, so the day never shifts with the time zone. */
export function examDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', '')
}

export function durationLabel(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? '1 hour' : `${hours} hours`
  }
  if (minutes > 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
  return `${minutes} min`
}

/** Minutes left at the end of a paper for checking. A pacing rule (Revision guidance), not an exam board rule. */
export const CHECK_MINUTES = 5

export type PacedSection = { name: string; type: string; marks: number; minutes: number }

/**
 * Suggested minutes for each section: the paper's time (less the checking time) shared out in proportion to the
 * marks, so it is plain arithmetic on the factory's own numbers. Rounded, with the last section taking the remainder
 * so the minutes always add up.
 */
export function pacedSections(paper: ExamPaperGuide): PacedSection[] {
  const total = paper.sections.reduce((sum, section) => sum + section.marks, 0)
  const available = paper.durationMinutes - CHECK_MINUTES
  let used = 0
  return paper.sections.map((section, index) => {
    const last = index === paper.sections.length - 1
    const minutes = last ? available - used : Math.round((section.marks / total) * available)
    used += minutes
    return { name: section.name, type: section.type, marks: section.marks, minutes }
  })
}

export type TimeSegment = { id: string; label: string; minutes: number; kind: 'section' | 'check'; tone: 'a' | 'b' | 'check' }

/** The time bar: one segment per section (alternating tints) and a last one for the checking time. */
export function timeSegments(paper: ExamPaperGuide): TimeSegment[] {
  const segments: TimeSegment[] = pacedSections(paper).map((section, index) => ({
    id: `${paper.number}-${index}`, label: section.name, minutes: section.minutes, kind: 'section', tone: index % 2 === 0 ? 'a' : 'b',
  }))
  segments.push({ id: `${paper.number}-check`, label: 'Checking', minutes: CHECK_MINUTES, kind: 'check', tone: 'check' })
  return segments
}

/** "9 of 10 topics covered", from the student's Topics covered. A paper that assesses a list counts only that list. */
export function topicsCoveredPhrase(paper: ExamPaperGuide, progress: Readonly<Record<string, TopicProgress>>, topicIds: readonly string[]): string {
  const relevant = paper.topics === 'all' ? topicIds : topicIds.filter((id) => paper.topics.includes(id))
  const covered = relevant.filter((id) => progress[id] && progress[id].status !== 'notstarted').length
  return `${covered} of ${relevant.length} ${relevant.length === 1 ? 'topic' : 'topics'} covered`
}

/** What the page needs to know about an exam. The simulator's own exam types satisfy it. */
export type MockExamLike = {
  id: string
  title: string
  durationMinutes: number
  totalMarks: number
  questions: ReadonlyArray<{ id: string; topic: string; choiceGroup?: string | null }>
  learnerClaim?: string
}

export type MockRow = {
  id: string
  name: string
  paperNumber: number | null
  meta: string
  minutes: number
  /** An honest note, only when there is something true to say. */
  note: string | null
  /** Where the paper comes from, when the course says so (e.g. "Revision-authored; not an official AQA paper."). */
  claim: string | null
  topicIds: readonly string[]
}

export function paperNumberOf(title: string): number | null {
  const match = title.match(/Paper\s+(\d+)/i)
  return match ? Number(match[1]) : null
}

/** Questions the student actually answers: a choice between two essays counts once. */
export function answeredQuestionCount(exam: MockExamLike): number {
  const groups = new Set<string>()
  let count = 0
  for (const question of exam.questions) {
    if (question.choiceGroup) groups.add(question.choiceGroup)
    else count += 1
  }
  return count + groups.size
}

/** `paperNumber` is the paper the exam belongs to. It is used when the exam's own title does not say (some are named after a business). */
export function mockRowFor(exam: MockExamLike, progress: Readonly<Record<string, TopicProgress>>, paperOfCourse: number | null = null): MockRow {
  const paperNumber = paperNumberOf(exam.title) ?? paperOfCourse
  const topicIds = Array.from(new Set(exam.questions.map((question) => question.topic)))
  const notStarted = topicIds.filter((id) => !progress[id] || progress[id].status === 'notstarted')
  const questions = answeredQuestionCount(exam)
  const style = paperNumber ? `Paper ${paperNumber} style` : 'Mock exam'
  return {
    id: exam.id,
    name: paperNumberOf(exam.title) ? exam.title.replace(/^AQA A-level Business(?: 7132)?\s+[—–·-]\s+/, '') : paperNumber ? `Paper ${paperNumber} · ${exam.title}` : exam.title,
    paperNumber,
    meta: `${style} · ${questions} ${questions === 1 ? 'question' : 'questions'} · ${exam.totalMarks} marks`,
    minutes: exam.durationMinutes,
    note: notStarted.length > 0 ? `Has ${notStarted.length} ${notStarted.length === 1 ? 'topic' : 'topics'} you haven’t started yet.` : null,
    claim: exam.learnerClaim ?? null,
    topicIds,
  }
}

export type MockSuggestion = { mock: MockRow; reason: string }

/**
 * REV's one suggestion: the mock whose topics the student has mostly started. Needs at least half of its topics
 * started, and says exactly how many. No mock fits, no suggestion (no reason, no card).
 */
export function suggestMock(rows: readonly MockRow[], progress: Readonly<Record<string, TopicProgress>>): MockSuggestion | null {
  const scored = rows
    .map((mock) => {
      const started = mock.topicIds.filter((id) => progress[id] && progress[id].status !== 'notstarted').length
      return { mock, started, total: mock.topicIds.length }
    })
    .filter((item) => item.total > 0 && item.started * 2 >= item.total)
    .sort((a, b) => (b.started / b.total) - (a.started / a.total) || a.mock.minutes - b.mock.minutes)
  const best = scored[0]
  if (!best) return null
  const where = best.mock.paperNumber ? `It’s written like Paper ${best.mock.paperNumber}` : 'It follows the real exam'
  const topics = best.started === best.total ? `You’ve started all ${best.total} topics it covers` : `You’ve started ${best.started} of the ${best.total} topics it covers`
  return { mock: best.mock, reason: `${topics}. ${where}, so it’s a fair rehearsal of the real paper.` }
}

export type LastMock = { name: string; marks: string; mode: 'Timed' | 'Untimed'; date: string }

/** The student's latest saved mock attempt, worded for "Last mock: …". Null when they have not sat one. */
export function lastMockFrom(
  evidence: ReadonlyArray<{ source: string; contentId: string; occurredAt: string; marksAwarded?: number; marksAvailable?: number; timed?: boolean }>,
  rows: readonly MockRow[],
): LastMock | null {
  const attempts = evidence
    .filter((item) => item.source === 'exam_attempt' && typeof item.marksAwarded === 'number' && typeof item.marksAvailable === 'number')
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  const latest = attempts[0]
  if (!latest) return null
  const row = rows.find((candidate) => candidate.id === latest.contentId)
  if (!row) return null
  const date = new Date(latest.occurredAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
  return { name: row.name, marks: `${latest.marksAwarded} of ${latest.marksAvailable}`, mode: latest.timed ? 'Timed' : 'Untimed', date }
}
