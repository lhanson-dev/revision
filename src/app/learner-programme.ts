import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'
import { catalogueCourseLabel, type CatalogueCourse, type CatalogueSubject } from './catalogue-model'

export type LearnerProgrammeCourse = {
  course: CatalogueCourse
  subject: CatalogueSubject
  label: string
}

export type LearnerProgrammeProjection = {
  courses: LearnerProgrammeCourse[]
  unknownCourseIds: string[]
}

export function allCatalogueCourses(catalogue: readonly CatalogueSubject[]): LearnerProgrammeCourse[] {
  return catalogue.flatMap((subject) => subject.courses.map((course) => ({
    course,
    subject,
    label: catalogueCourseLabel(course, subject.name),
  })))
}

export function projectLearnerProgramme(
  catalogue: readonly CatalogueSubject[],
  memberships: readonly LearnerCourseMembership[],
): LearnerProgrammeProjection {
  const byId = new Map(allCatalogueCourses(catalogue).map((item) => [item.course.id, item]))
  const courses: LearnerProgrammeCourse[] = []
  const unknownCourseIds: string[] = []

  for (const membership of memberships) {
    const resolved = byId.get(membership.courseId)
    if (resolved) courses.push(resolved)
    else unknownCourseIds.push(membership.courseId)
  }

  courses.sort((left, right) => {
    const subject = left.subject.name.localeCompare(right.subject.name)
    if (subject !== 0) return subject
    return left.course.qualificationName.localeCompare(right.course.qualificationName)
  })

  return { courses, unknownCourseIds }
}

export function findCatalogueCourse(catalogue: readonly CatalogueSubject[], courseId: string) {
  return allCatalogueCourses(catalogue).find((item) => item.course.id === courseId)
}

export function findCourseForModule(catalogue: readonly CatalogueSubject[], moduleId: string) {
  return allCatalogueCourses(catalogue).find((item) => item.course.modules.some((module) => module.manifest.id === moduleId))
}

export function adaptersForProgramme(programme: readonly LearnerProgrammeCourse[]): LearningContentAdapter[] {
  const adapters = new Map<string, LearningContentAdapter>()
  programme.forEach(({ course }) => course.modules.forEach((adapter) => adapters.set(adapter.manifest.id, adapter)))
  return [...adapters.values()]
}

export function programmeCourseIds(programme: readonly LearnerProgrammeCourse[]) {
  return new Set(programme.map((item) => item.course.id))
}
