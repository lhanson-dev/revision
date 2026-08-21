import {
  availableCourseSections,
  availablePaperSections,
  type CatalogueCourse,
  type CatalogueSubject,
} from './catalogue-model'
import {
  courseRoute,
  moduleRoute,
  subjectRoute,
  subjectsRoute,
  type AppRoute,
  type CourseSection,
  type PaperSection,
} from './navigation'

type ContextualLearnerNavigationProps = {
  route: AppRoute
  subjects: readonly CatalogueSubject[]
  onNavigate: (route: AppRoute) => void
}

const sectionLabels: Record<CourseSection, string> = {
  overview: 'Overview',
  learn: 'Learn',
  practice: 'Practice',
  'exam-prep': 'Exam Prep',
  progress: 'Progress',
}

function routeSubjectId(route: AppRoute) {
  if (route.kind === 'subject' || route.kind === 'course' || route.kind === 'module') return route.subjectId
  return null
}

function courseLabel(course: CatalogueCourse, subjectName: string) {
  return `${course.examBoardName} ${course.qualificationName} ${subjectName}`
}

function courseContainsModule(course: CatalogueCourse, moduleId: string) {
  return course.modules.some((module) => module.manifest.id === moduleId)
}

function activeCourseId(route: AppRoute, subject: CatalogueSubject) {
  if (route.kind === 'course' && route.subjectId === subject.id) return route.courseId
  if (route.kind === 'module' && route.subjectId === subject.id) {
    return subject.courses.find((course) => courseContainsModule(course, route.moduleId))?.id ?? null
  }
  return null
}

function SectionLinks({
  route,
  sections,
  onNavigate,
  destination,
}: {
  route: AppRoute
  sections: readonly (CourseSection | PaperSection)[]
  onNavigate: (route: AppRoute) => void
  destination: (section: CourseSection | PaperSection) => AppRoute
}) {
  return (
    <div className="runtime-context-nav-level runtime-context-nav-sections">
      {sections.map((section) => {
        const active = (route.kind === 'course' || route.kind === 'module') && route.section === section
        return (
          <button
            key={section}
            className="runtime-context-nav-item runtime-context-nav-section"
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(destination(section))}
          >
            <span>{sectionLabels[section]}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ContextualLearnerNavigation({ route, subjects, onNavigate }: ContextualLearnerNavigationProps) {
  const selectedSubjectId = routeSubjectId(route)

  return (
    <div className="runtime-context-nav" aria-label="Subjects navigation">
      <div className="runtime-context-nav-level runtime-context-nav-subjects">
        <button
          className="runtime-context-nav-item"
          aria-current={route.kind === 'subjects' ? 'page' : undefined}
          onClick={() => onNavigate(subjectsRoute())}
        >
          <span>All subjects</span>
        </button>

        {subjects.map((subject) => {
          const subjectSelected = selectedSubjectId === subject.id
          const selectedCourseId = subjectSelected ? activeCourseId(route, subject) : null

          return (
            <div className="runtime-context-nav-node" key={subject.id}>
              <button
                className="runtime-context-nav-item"
                aria-current={route.kind === 'subject' && route.subjectId === subject.id ? 'page' : undefined}
                onClick={() => onNavigate(subjectRoute(subject.id))}
              >
                <span>{subject.name}</span>
              </button>

              {subjectSelected && (
                <div className="runtime-context-nav-level runtime-context-nav-courses">
                  {subject.courses.map((course) => {
                    const selectedCourse = selectedCourseId === course.id
                    const label = courseLabel(course, subject.name)

                    if (course.sharedLearning) {
                      const sections = availableCourseSections(course)
                      return (
                        <div className="runtime-context-nav-node" key={course.id}>
                          <button
                            className="runtime-context-nav-item"
                            aria-current={route.kind === 'course' && route.courseId === course.id && route.section === 'overview' ? 'page' : undefined}
                            onClick={() => onNavigate(courseRoute(subject.id, course.id))}
                          >
                            <span>{label}</span>
                          </button>
                          {selectedCourse && route.kind === 'course' && (
                            <SectionLinks
                              route={route}
                              sections={sections}
                              onNavigate={onNavigate}
                              destination={(section) => courseRoute(subject.id, course.id, section as CourseSection)}
                            />
                          )}
                        </div>
                      )
                    }

                    return (
                      <div className="runtime-context-nav-node" key={course.id}>
                        <div className="runtime-context-nav-group-label">{label}</div>
                        <div className="runtime-context-nav-level runtime-context-nav-components">
                          {course.modules.map((module) => {
                            const moduleSelected = route.kind === 'module' && route.moduleId === module.manifest.id
                            return (
                              <div className="runtime-context-nav-node" key={module.manifest.id}>
                                <button
                                  className="runtime-context-nav-item"
                                  aria-current={moduleSelected && route.section === 'overview' ? 'page' : undefined}
                                  onClick={() => onNavigate(moduleRoute(subject.id, module.manifest.id))}
                                >
                                  <span>{module.manifest.paper.name}</span>
                                </button>
                                {moduleSelected && (
                                  <SectionLinks
                                    route={route}
                                    sections={availablePaperSections(module)}
                                    onNavigate={onNavigate}
                                    destination={(section) => moduleRoute(subject.id, module.manifest.id, section as PaperSection)}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
