export type PaperSection = 'overview' | 'learn' | 'practice' | 'exam-prep' | 'progress'
export type CourseSection = PaperSection

export type AppRoute =
  | { kind: 'home' }
  | { kind: 'plan' }
  | { kind: 'subjects' }
  | { kind: 'subject'; subjectId: string }
  | { kind: 'course'; subjectId: string; courseId: string; section: CourseSection }
  | { kind: 'module'; subjectId: string; moduleId: string; section: PaperSection }
  | { kind: 'progress' }
  | { kind: 'rev' }
  | { kind: 'admin' }

export const homeRoute = (): AppRoute => ({ kind: 'home' })
export const planRoute = (): AppRoute => ({ kind: 'plan' })
export const subjectsRoute = (): AppRoute => ({ kind: 'subjects' })
export const subjectRoute = (subjectId: string): AppRoute => ({ kind: 'subject', subjectId })
export const courseRoute = (subjectId: string, courseId: string, section: CourseSection = 'overview'): AppRoute => ({ kind: 'course', subjectId, courseId, section })
export const moduleRoute = (subjectId: string, moduleId: string, section: PaperSection = 'overview'): AppRoute => ({ kind: 'module', subjectId, moduleId, section })
export const progressRoute = (): AppRoute => ({ kind: 'progress' })
export const revRoute = (): AppRoute => ({ kind: 'rev' })
export const adminRoute = (): AppRoute => ({ kind: 'admin' })

const clean = (value: string) => encodeURIComponent(value)

export function routeHash(route: AppRoute) {
  switch (route.kind) {
    case 'home': return '#/home'
    case 'plan': return '#/plan'
    case 'subjects': return '#/subjects'
    case 'subject': return `#/subjects/${clean(route.subjectId)}`
    case 'course': return `#/subjects/${clean(route.subjectId)}/courses/${clean(route.courseId)}/${route.section}`
    case 'module': return `#/subjects/${clean(route.subjectId)}/modules/${clean(route.moduleId)}/${route.section}`
    case 'progress': return '#/progress'
    case 'rev': return '#/rev'
    case 'admin': return '#/admin'
  }
}

function decode(value: string | undefined) {
  if (!value) return null
  try { return decodeURIComponent(value) } catch { return null }
}

function validSection(value: string): value is PaperSection {
  return ['overview', 'learn', 'practice', 'exam-prep', 'progress'].includes(value)
}

export function parseRoute(hash: string): AppRoute {
  if (!hash || hash === '#' || hash === '#/' || hash === '#/home') return homeRoute()
  if (hash === '#/plan') return planRoute()
  if (hash === '#/subjects') return subjectsRoute()
  if (hash === '#/progress') return progressRoute()
  if (hash === '#/rev') return revRoute()
  if (hash === '#/admin' || hash.startsWith('#/admin/')) return adminRoute()

  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'subjects' && parts.length === 2) {
    const subjectId = decode(parts[1])
    return subjectId ? subjectRoute(subjectId) : homeRoute()
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

export function routeBelongsToSubjects(route: AppRoute) {
  return route.kind === 'subjects' || route.kind === 'subject' || route.kind === 'course' || route.kind === 'module'
}

export function sameRoute(left: AppRoute, right: AppRoute) {
  return routeHash(left) === routeHash(right)
}
