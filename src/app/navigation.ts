export type AppRoute =
  | 'home'
  | 'subjects'
  | 'subject-business'
  | 'paper-2-overview'
  | 'paper-2-learn'
  | 'paper-2-practice'
  | 'paper-2-exam-prep'
  | 'paper-2-progress'
  | 'progress'
  | 'rev'

const routeHashes: Record<AppRoute, string> = {
  home: '#/home',
  subjects: '#/subjects',
  'subject-business': '#/subjects/business',
  'paper-2-overview': '#/subjects/business/aqa-as/paper-2',
  'paper-2-learn': '#/subjects/business/aqa-as/paper-2/learn',
  'paper-2-practice': '#/subjects/business/aqa-as/paper-2/practice',
  'paper-2-exam-prep': '#/subjects/business/aqa-as/paper-2/exam-prep',
  'paper-2-progress': '#/subjects/business/aqa-as/paper-2/progress',
  progress: '#/progress',
  rev: '#/rev',
}

const hashRoutes = new Map(Object.entries(routeHashes).map(([route, hash]) => [hash, route as AppRoute]))

export function routeHash(route: AppRoute) {
  return routeHashes[route]
}

export function parseRoute(hash: string): AppRoute {
  return hashRoutes.get(hash) ?? 'home'
}

export function routeBelongsToSubjects(route: AppRoute) {
  return route === 'subjects' || route === 'subject-business' || route.startsWith('paper-2-')
}

export function paperSectionRoute(section: 'overview' | 'learn' | 'practice' | 'exam-prep' | 'progress'): AppRoute {
  if (section === 'overview') return 'paper-2-overview'
  return `paper-2-${section}` as AppRoute
}
