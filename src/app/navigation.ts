export type PaperSection = 'overview' | 'learn' | 'practice' | 'exam-prep' | 'progress'
export type CourseSection = PaperSection
export type AdminSection = 'users' | 'activity' | 'health' | 'assurance' | 'content' | 'planner'

export type LearningRouteContext = {
  learnPageId?: string | null
  topicId?: string | null
}

export type AppRoute =
  | { kind: 'home' }
  | { kind: 'plan' }
  | { kind: 'courses' }
  | { kind: 'subjects' }
  | { kind: 'subject'; subjectId: string }
  | { kind: 'course'; subjectId: string; courseId: string; section: CourseSection; learnPageId?: string | null; topicId?: string | null }
  | { kind: 'module'; subjectId: string; courseId: string; moduleId: string; section: PaperSection; learnPageId?: string | null; topicId?: string | null }
  | { kind: 'progress' }
  | { kind: 'rev' }
  | { kind: 'admin'; section?: AdminSection }

export const homeRoute = (): AppRoute => ({ kind: 'home' })
export const planRoute = (): AppRoute => ({ kind: 'plan' })
export const coursesRoute = (): AppRoute => ({ kind: 'courses' })

// Compatibility constructors retained while old subject-first links are migrated.
// routeHash() always emits the governed Courses route family.
export const subjectsRoute = (): AppRoute => ({ kind: 'subjects' })
export const subjectRoute = (subjectId: string): AppRoute => ({ kind: 'subject', subjectId })
export const courseRoute = (subjectId: string, courseId: string, section: CourseSection = 'overview', context: LearningRouteContext = {}): AppRoute => ({ kind: 'course', subjectId, courseId, section, ...context })
export const moduleRoute = (subjectId: string, moduleId: string, section: PaperSection = 'overview', context: LearningRouteContext = {}): AppRoute => ({ kind: 'module', subjectId, courseId: '', moduleId, section, ...context })

export const learnerCourseRoute = (courseId: string, section: CourseSection = 'overview', context: LearningRouteContext = {}): AppRoute => ({
  kind: 'course',
  subjectId: '',
  courseId,
  section,
  ...context,
})

export const learnerModuleRoute = (courseId: string, moduleId: string, section: PaperSection = 'overview', context: LearningRouteContext = {}): AppRoute => ({
  kind: 'module',
  subjectId: '',
  courseId,
  moduleId,
  section,
  ...context,
})

export const progressRoute = (): AppRoute => ({ kind: 'progress' })
export const revRoute = (): AppRoute => ({ kind: 'rev' })
export const adminRoute = (section?: AdminSection): AppRoute => section ? ({ kind: 'admin', section }) : ({ kind: 'admin' })

const clean = (value: string) => encodeURIComponent(value)

export function routeHash(route: AppRoute) {
  switch (route.kind) {
    case 'home': return '#/home'
    case 'plan': return '#/plan'
    case 'courses':
    case 'subjects':
    case 'subject': return '#/courses'
    case 'course': {
      if (route.section === 'learn' && route.learnPageId) return `#/courses/${clean(route.courseId)}/learn/${clean(route.learnPageId)}`
      if (route.section === 'practice' && route.topicId) return `#/courses/${clean(route.courseId)}/practice/${clean(route.topicId)}`
      return `#/courses/${clean(route.courseId)}/${route.section}`
    }
    case 'module': {
      if (!route.courseId) return '#/courses'
      if (route.section === 'learn' && route.learnPageId) return `#/courses/${clean(route.courseId)}/components/${clean(route.moduleId)}/learn/${clean(route.learnPageId)}`
      if (route.section === 'practice' && route.topicId) return `#/courses/${clean(route.courseId)}/components/${clean(route.moduleId)}/practice/${clean(route.topicId)}`
      return `#/courses/${clean(route.courseId)}/components/${clean(route.moduleId)}/${route.section}`
    }
    case 'progress': return '#/progress'
    case 'rev': return '#/rev'
    case 'admin': return route.section ? `#/admin/${route.section}` : '#/admin'
  }
}

function decode(value: string | undefined) {
  if (!value) return null
  try { return decodeURIComponent(value) } catch { return null }
}

function validSection(value: string): value is PaperSection {
  return ['overview', 'learn', 'practice', 'exam-prep', 'progress'].includes(value)
}

function validAdminSection(value: string): value is AdminSection {
  return ['users', 'activity', 'health', 'assurance', 'content', 'planner'].includes(value)
}

export function parseRoute(hash: string): AppRoute {
  if (!hash || hash === '#' || hash === '#/' || hash === '#/home') return homeRoute()
  if (hash === '#/plan') return planRoute()
  if (hash === '#/courses' || hash === '#/subjects') return coursesRoute()
  if (hash === '#/progress') return progressRoute()
  if (hash === '#/rev') return revRoute()
  if (hash === '#/admin') return adminRoute()
  if (hash.startsWith('#/admin/')) {
    const section = hash.replace(/^#\/admin\//, '').split('/')[0]
    return validAdminSection(section) ? adminRoute(section) : adminRoute()
  }

  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)

  if (parts[0] === 'courses' && parts.length === 4) {
    const courseId = decode(parts[1])
    const section = parts[2]
    const contextId = decode(parts[3])
    if (courseId && contextId && section === 'learn') return learnerCourseRoute(courseId, 'learn', { learnPageId: contextId })
    if (courseId && contextId && section === 'practice') return learnerCourseRoute(courseId, 'practice', { topicId: contextId })
  }

  if (parts[0] === 'courses' && parts.length === 3) {
    const courseId = decode(parts[1])
    const section = parts[2]
    if (courseId && validSection(section)) return learnerCourseRoute(courseId, section)
  }

  if (parts[0] === 'courses' && parts[2] === 'components' && parts.length === 6) {
    const courseId = decode(parts[1])
    const moduleId = decode(parts[3])
    const section = parts[4]
    const contextId = decode(parts[5])
    if (courseId && moduleId && contextId && section === 'learn') return learnerModuleRoute(courseId, moduleId, 'learn', { learnPageId: contextId })
    if (courseId && moduleId && contextId && section === 'practice') return learnerModuleRoute(courseId, moduleId, 'practice', { topicId: contextId })
  }

  if (parts[0] === 'courses' && parts[2] === 'components' && parts.length === 5) {
    const courseId = decode(parts[1])
    const moduleId = decode(parts[3])
    const section = parts[4]
    if (courseId && moduleId && validSection(section)) return learnerModuleRoute(courseId, moduleId, section)
  }

  // FI-020 compatibility inputs. These parse into the same route kinds but routeHash()
  // emits the canonical Courses route so the shell can replace the old URL without
  // breaking existing bookmarks or planner/REV links.
  if (parts[0] === 'subjects' && parts.length === 2) {
    const subjectId = decode(parts[1])
    return subjectId ? subjectRoute(subjectId) : coursesRoute()
  }
  if (parts[0] === 'subjects' && parts[2] === 'courses' && parts.length === 5) {
    const subjectId = decode(parts[1])
    const courseId = decode(parts[3])
    const section = parts[4]
    if (subjectId && courseId && validSection(section)) return courseRoute(subjectId, courseId, section)
  }
  if (parts[0] === 'subjects' && parts[2] === 'modules' && parts.length === 5) {
    const subjectId = decode(parts[1])
    const moduleId = decode(parts[3])
    const section = parts[4]
    if (subjectId && moduleId && validSection(section)) return moduleRoute(subjectId, moduleId, section)
  }

  // Compatibility with the short-lived pre-catalogue Business routes from PR #35.
  if (hash === '#/subjects/business/aqa-as/paper-2') return moduleRoute('business', 'business-aqa-as-paper-2', 'overview')
  if (hash.startsWith('#/subjects/business/aqa-as/paper-2/')) {
    const section = hash.split('/').at(-1) ?? ''
    if (validSection(section)) return moduleRoute('business', 'business-aqa-as-paper-2', section)
  }

  return homeRoute()
}

export function routeBelongsToCourses(route: AppRoute) {
  return route.kind === 'courses' || route.kind === 'subjects' || route.kind === 'subject' || route.kind === 'course' || route.kind === 'module'
}

// Compatibility alias for code that has not yet been migrated in this branch.
export const routeBelongsToSubjects = routeBelongsToCourses

export function sameRoute(left: AppRoute, right: AppRoute) {
  return routeHash(left) === routeHash(right)
}
