import {
  availableCourseSections,
  availablePaperSections,
} from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import {
  coursesRoute,
  learnerCourseRoute,
  learnerModuleRoute,
  type AppRoute,
  type CourseSection,
  type PaperSection,
} from './navigation'

type ContextualLearnerNavigationProps = {
  route: AppRoute
  courses: readonly LearnerProgrammeCourse[]
  onNavigate: (route: AppRoute) => void
  onOpenCourse?: (courseId: string, route: AppRoute) => void
}

const sectionLabels: Record<CourseSection, string> = {
  overview: 'Overview',
  learn: 'Learn',
  practice: 'Practice',
  'exam-prep': 'Exam Prep',
  progress: 'Progress',
}

function selectedCourseId(route: AppRoute) {
  if (route.kind === 'course') return route.courseId
  if (route.kind === 'module') return route.courseId || null
  return null
}

function SectionLinks({
  route,
  sections,
  contextLabel,
  onNavigate,
  destination,
}: {
  route: AppRoute
  sections: readonly (CourseSection | PaperSection)[]
  contextLabel: string
  onNavigate: (route: AppRoute) => void
  destination: (section: CourseSection | PaperSection) => AppRoute
}) {
  return (
    <div className="runtime-context-nav-level runtime-context-nav-sections">
      {sections.map((section) => {
        const active = (route.kind === 'course' || route.kind === 'module') && route.section === section
        const label = sectionLabels[section]
        return (
          <button
            key={section}
            className="runtime-context-nav-item runtime-context-nav-section"
            aria-label={`${contextLabel} ${label}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(destination(section))}
          >
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ContextualLearnerNavigation({ route, courses, onNavigate, onOpenCourse }: ContextualLearnerNavigationProps) {
  const activeCourseId = selectedCourseId(route)

  return (
    <div className="runtime-context-nav" role="group" aria-label="Courses navigation">
      <div className="runtime-context-nav-level runtime-context-nav-courses">
        <button
          className="runtime-context-nav-item"
          aria-current={route.kind === 'courses' ? 'page' : undefined}
          onClick={() => onNavigate(coursesRoute())}
        >
          <span>All courses</span>
        </button>

        {courses.map(({ course, label }) => {
          const selected = activeCourseId === course.id

          if (course.sharedLearning) {
            const destination = learnerCourseRoute(course.id)
            return (
              <div className="runtime-context-nav-node" key={course.id}>
                <button
                  className="runtime-context-nav-item"
                  aria-current={route.kind === 'course' && route.courseId === course.id && route.section === 'overview' ? 'page' : undefined}
                  onClick={() => onOpenCourse ? onOpenCourse(course.id, destination) : onNavigate(destination)}
                >
                  <span>{label}</span>
                </button>
                {selected && route.kind === 'course' && (
                  <SectionLinks
                    route={route}
                    sections={availableCourseSections(course)}
                    contextLabel={label}
                    onNavigate={onNavigate}
                    destination={(section) => learnerCourseRoute(course.id, section as CourseSection)}
                  />
                )}
              </div>
            )
          }

          return (
            <div className="runtime-context-nav-node" key={course.id}>
              <button
                className="runtime-context-nav-item"
                aria-current={selected && route.kind === 'course' ? 'page' : undefined}
                onClick={() => onOpenCourse ? onOpenCourse(course.id, learnerCourseRoute(course.id)) : onNavigate(learnerCourseRoute(course.id))}
              >
                <span>{label}</span>
              </button>
              {selected && (
                <div className="runtime-context-nav-level runtime-context-nav-components">
                  {course.modules.map((module) => {
                    const moduleSelected = route.kind === 'module' && route.moduleId === module.manifest.id
                    const destination = learnerModuleRoute(course.id, module.manifest.id)
                    return (
                      <div className="runtime-context-nav-node" key={module.manifest.id}>
                        <button
                          className="runtime-context-nav-item"
                          aria-current={moduleSelected && route.section === 'overview' ? 'page' : undefined}
                          onClick={() => onNavigate(destination)}
                        >
                          <span>{module.manifest.paper.name}</span>
                        </button>
                        {moduleSelected && (
                          <SectionLinks
                            route={route}
                            sections={availablePaperSections(module)}
                            contextLabel={`${label} ${module.manifest.paper.name}`}
                            onNavigate={onNavigate}
                            destination={(section) => learnerModuleRoute(course.id, module.manifest.id, section as PaperSection)}
                          />
                        )}
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
