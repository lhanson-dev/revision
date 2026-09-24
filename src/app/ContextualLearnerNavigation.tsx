import type { LearningContentAdapter } from '../engine/content/content-adapter'
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
            aria-current={active && section !== 'learn' ? 'page' : undefined}
            onClick={() => onNavigate(destination(section))}
          >
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function LearnTree({
  adapter,
  route,
  onNavigate,
  destination,
}: {
  adapter: LearningContentAdapter
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  destination: (pageId: string) => AppRoute
}) {
  if ((route.kind !== 'course' && route.kind !== 'module') || route.section !== 'learn') return null
  const chapters = adapter.listLearnChapters()
  const firstPage = chapters[0]?.groups[0]?.pages[0]
  const activePageId = route.learnPageId ?? firstPage?.id ?? null
  const activeChapter = chapters.find((chapter) => chapter.groups.some((group) => group.pages.some((page) => page.id === activePageId))) ?? chapters[0]

  return (
    <div className="runtime-context-nav-level runtime-context-nav-learn" aria-label="Learn contents">
      {chapters.map((chapter) => {
        const chapterActive = chapter.id === activeChapter?.id
        const chapterFirstPage = chapter.groups[0]?.pages[0]
        return (
          <div className="runtime-context-nav-node runtime-context-nav-learn-chapter" key={chapter.id}>
            <button
              className="runtime-context-nav-item runtime-context-nav-learn-chapter-button"
              aria-expanded={chapterActive}
              onClick={() => chapterFirstPage && onNavigate(destination(chapterFirstPage.id))}
            >
              <span>{chapter.title}</span>
            </button>
            {chapterActive && (
              <div className="runtime-context-nav-level runtime-context-nav-learn-groups">
                {chapter.groups.map((group) => (
                  <div className="runtime-context-nav-node runtime-context-nav-learn-group" key={group.id}>
                    <span className="runtime-context-nav-group-label">{group.title}</span>
                    <div className="runtime-context-nav-level runtime-context-nav-learn-pages">
                      {group.pages.map((page) => (
                        <button
                          key={page.id}
                          className="runtime-context-nav-item runtime-context-nav-learn-page"
                          aria-current={page.id === activePageId ? 'page' : undefined}
                          onClick={() => onNavigate(destination(page.id))}
                        >
                          <span>{page.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  <>
                    <SectionLinks
                      route={route}
                      sections={availableCourseSections(course)}
                      contextLabel={label}
                      onNavigate={onNavigate}
                      destination={(section) => learnerCourseRoute(course.id, section as CourseSection)}
                    />
                    <LearnTree
                      adapter={course.learningAdapter}
                      route={route}
                      onNavigate={onNavigate}
                      destination={(pageId) => learnerCourseRoute(course.id, 'learn', { learnPageId: pageId })}
                    />
                  </>
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
                        {moduleSelected && route.kind === 'module' && (
                          <>
                            <SectionLinks
                              route={route}
                              sections={availablePaperSections(module)}
                              contextLabel={`${label} ${module.manifest.paper.name}`}
                              onNavigate={onNavigate}
                              destination={(section) => learnerModuleRoute(course.id, module.manifest.id, section as PaperSection)}
                            />
                            <LearnTree
                              adapter={module}
                              route={route}
                              onNavigate={onNavigate}
                              destination={(pageId) => learnerModuleRoute(course.id, module.manifest.id, 'learn', { learnPageId: pageId })}
                            />
                          </>
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
