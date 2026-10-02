import type { LearnerProgrammeCourse } from './learner-programme'

/**
 * The first-course choice in onboarding (decisions file section 4): Level, then subjects at that level,
 * then the exam board (and AS or full A-level where both exist) for each subject.
 * Everything comes from the live catalogue, so a new course appears without a design change.
 */
export type LevelId = 'gcse' | 'a-level'

export type LevelOption = { id: LevelId; label: string; note: string }

const LEVELS: Readonly<Record<LevelId, LevelOption>> = {
  gcse: { id: 'gcse', label: 'GCSE', note: '' },
  'a-level': { id: 'a-level', label: 'A-level', note: 'Includes AS' },
}

/** Which level a course sits under. AS sits under A-level. */
export function levelOfCourse(item: LearnerProgrammeCourse): LevelId {
  return /gcse/i.test(item.course.qualificationName) ? 'gcse' : 'a-level'
}

/** Only levels that have at least one live course, in a fixed order. */
export function levelsAvailable(courses: readonly LearnerProgrammeCourse[]): LevelOption[] {
  const present = new Set(courses.map(levelOfCourse))
  return (Object.keys(LEVELS) as LevelId[]).filter((id) => present.has(id)).map((id) => LEVELS[id])
}

export type SubjectChoice = { id: string; name: string; offeringCount: number }

/** The subjects that have a live course at this level, in name order. */
export function subjectsAtLevel(courses: readonly LearnerProgrammeCourse[], level: LevelId): SubjectChoice[] {
  const byId = new Map<string, SubjectChoice>()
  courses.filter((item) => levelOfCourse(item) === level).forEach((item) => {
    const existing = byId.get(item.subject.id)
    byId.set(item.subject.id, { id: item.subject.id, name: item.subject.name, offeringCount: (existing?.offeringCount ?? 0) + 1 })
  })
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/** The ways to study one subject at this level: each exam board, and AS or full A-level where both exist. */
export function offeringsFor(courses: readonly LearnerProgrammeCourse[], level: LevelId, subjectId: string): LearnerProgrammeCourse[] {
  return courses
    .filter((item) => levelOfCourse(item) === level && item.subject.id === subjectId)
    .sort((a, b) => a.course.examBoardName.localeCompare(b.course.examBoardName) || a.course.qualificationName.localeCompare(b.course.qualificationName))
}

/** The student's picks as course ids, in subject order. A subject with one offering is picked for them. */
export function chosenCourseIds(
  courses: readonly LearnerProgrammeCourse[],
  level: LevelId,
  subjectIds: readonly string[],
  picks: Readonly<Record<string, string>>,
): string[] {
  return subjectIds.flatMap((subjectId) => {
    const offerings = offeringsFor(courses, level, subjectId)
    if (offerings.length === 1) return [offerings[0].course.id]
    const picked = offerings.find((item) => item.course.id === picks[subjectId])
    return picked ? [picked.course.id] : []
  })
}

/** True when every chosen subject has a course, so the student can continue. */
export function boardsComplete(
  courses: readonly LearnerProgrammeCourse[],
  level: LevelId,
  subjectIds: readonly string[],
  picks: Readonly<Record<string, string>>,
): boolean {
  return subjectIds.length > 0 && chosenCourseIds(courses, level, subjectIds, picks).length === subjectIds.length
}
