import { useState, type ReactNode } from 'react'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import {
  availableCourseSections,
  availablePaperSections,
  type CatalogueCourse,
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
import { Icon } from './ui'

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

function normalizedNavigationLabel(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function redundantSingletonPage(group: ReturnType<LearningContentAdapter['listLearnChapters']>[number]['groups'][number]) {
  if (group.pages.length !== 1) return null
  const page = group.pages[0]
  return normalizedNavigationLabel(group.title) === normalizedNavigationLabel(page.title) ? page : null
}

function scrollReadingSurfaceToTop() {
  window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
}

function CourseIdentity({ subjectName, course }: { subjectName: string; course: CatalogueCourse }) {
  return (
    <div className="runtime-context-nav-course-identity" aria-label={`${subjectName} ${course.qualificationName} ${course.examBoardName} ${course.specificationCode}`}>
      <strong>{subjectName}</strong>
      <span>{course.qualificationName} · {course.examBoardName} · {course.specificationCode}</span>
    </div>
  )
}

function SectionLinks({
  route,
  sections,
  contextLabel,
  onNavigate,
  destination,
  learnContents,
}: {
  route: AppRoute
  sections: readonly (CourseSection | PaperSection)[]
  contextLabel: string
  onNavigate: (route: AppRoute) => void
  destination: (section: CourseSection | PaperSection) => AppRoute
  learnContents?: ReactNode
}) {
  const learnActive = (route.kind === 'course' || route.kind === 'module') && route.section === 'learn'
  const [learnExpanded, setLearnExpanded] = useState(learnActive)

  return (
    <div className="runtime-context-nav-level runtime-context-nav-sections">
      {sections.map((section) => {
        const active = (route.kind === 'course' || route.kind === 'module') && route.section === section
        const label = sectionLabels[section]
        const expanded = section === 'learn' && active && learnExpanded
        return (
          <div className="runtime-context-nav-section-node" key={section}>
            <button
              className={`runtime-context-nav-item runtime-context-nav-section${section === 'learn' ? ' runtime-context-nav-section-learn' : ''}`}
              data-active={active ? 'true' : undefined}
              aria-label={`${contextLabel} ${label}`}
              aria-current={active && section !== 'learn' ? 'page' : undefined}
              aria-expanded={section === 'learn' ? expanded : undefined}
              onClick={() => {
                if (section === 'learn' && active) {
                  setLearnExpanded((current) => !current)
                  return
                }
                onNavigate(destination(section))
              }}
            >
              <span>{label}</span>
              {section === 'learn' && <Icon name="chevron-right" size="compact" className="runtime-context-nav-section-chevron" />}
            </button>
            {section === 'learn' && expanded && learnContents}
          </div>
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
  const chapters = adapter.listLearnChapters()
  const firstPage = chapters[0]?.groups[0]?.pages[0]
  const requestedPageId = (route.kind === 'course' || route.kind === 'module') ? route.learnPageId ?? firstPage?.id ?? null : firstPage?.id ?? null
  const activePage = chapters
    .flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
    .find((page) => page.id === requestedPageId) ?? firstPage ?? null
  const activePageId = activePage?.id ?? null
  const activeChapter = chapters.find((chapter) => chapter.groups.some((group) => group.pages.some((page) => page.id === activePageId))) ?? chapters[0]
  const activeGroup = activeChapter?.groups.find((group) => group.pages.some((page) => page.id === activePageId)) ?? activeChapter?.groups[0]

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(activeChapter?.id ?? null)
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(activeGroup?.id ?? null)

  function toggleChapter(chapterId: string) {
    const willExpand = expandedChapterId !== chapterId
    setExpandedChapterId(willExpand ? chapterId : null)
    if (!willExpand) {
      setExpandedGroupId(null)
      return
    }
    const chapter = chapters.find((item) => item.id === chapterId)
    const routeGroup = chapter?.groups.find((group) => group.pages.some((page) => page.id === activePageId))
    setExpandedGroupId(routeGroup?.id ?? null)
  }

  function toggleGroup(groupId: string) {
    setExpandedGroupId((current) => current === groupId ? null : groupId)
  }

  function openPage(pageId: string) {
    onNavigate(destination(pageId))
    scrollReadingSurfaceToTop()
  }

  return (
    <div className="runtime-context-nav-level runtime-context-nav-learn" aria-label="Learn contents">
      {chapters.map((chapter) => {
        const chapterContainsActivePage = chapter.groups.some((group) => group.pages.some((page) => page.id === activePageId))
        const chapterExpanded = chapter.id === expandedChapterId
        return (
          <div className="runtime-context-nav-node runtime-context-nav-learn-chapter" key={chapter.id}>
            <button
              className="runtime-context-nav-item runtime-context-nav-disclosure runtime-context-nav-learn-chapter-button"
              data-active={chapterContainsActivePage ? 'true' : undefined}
              aria-expanded={chapterExpanded}
              onClick={() => toggleChapter(chapter.id)}
            >
              <span>{chapter.title}</span>
              <Icon name="chevron-right" size="compact" className="runtime-context-nav-disclosure-icon" />
            </button>
            {chapterExpanded && (
              <div className="runtime-context-nav-level runtime-context-nav-learn-groups">
                {chapter.groups.map((group) => {
                  const groupContainsActivePage = group.pages.some((page) => page.id === activePageId)
                  const singletonPage = redundantSingletonPage(group)

                  if (singletonPage) {
                    return (
                      <div className="runtime-context-nav-node runtime-context-nav-learn-group" key={group.id}>
                        <button
                          className="runtime-context-nav-item runtime-context-nav-group-button runtime-context-nav-learn-singleton-page"
                          aria-current={singletonPage.id === activePageId ? 'page' : undefined}
                          onClick={() => openPage(singletonPage.id)}
                        >
                          <span>{group.title}</span>
                        </button>
                      </div>
                    )
                  }

                  const groupExpanded = group.id === expandedGroupId
                  return (
                    <div className="runtime-context-nav-node runtime-context-nav-learn-group" key={group.id}>
                      <button
                        className="runtime-context-nav-item runtime-context-nav-disclosure runtime-context-nav-group-button"
                        data-active={groupContainsActivePage ? 'true' : undefined}
                        aria-expanded={groupExpanded}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <span>{group.title}</span>
                        <Icon name="chevron-right" size="compact" className="runtime-context-nav-disclosure-icon" />
                      </button>
                      {groupExpanded && (
                        <div className="runtime-context-nav-level runtime-context-nav-learn-pages">
                          {group.pages.map((page) => (
                            <button
                              key={page.id}
                              className="runtime-context-nav-item runtime-context-nav-learn-page"
                              aria-current={page.id === activePageId ? 'page' : undefined}
                              onClick={() => openPage(page.id)}
                            >
                              <span>{page.title}</span>
                            </button>
                          ))}
                        </div>
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
  )
}

export function ContextualLearnerNavigation({ route, courses, onNavigate, onOpenCourse }: ContextualLearnerNavigationProps) {
  const activeCourseId = selectedCourseId(route)
  const activeProgrammeCourse = activeCourseId ? courses.find(({ course }) => course.id === activeCourseId) : undefined

  if (!activeProgrammeCourse) {
    return (
      <div className="runtime-context-nav runtime-context-nav-index" role="group" aria-label="Courses navigation">
        <div className="runtime-context-nav-level runtime-context-nav-courses">
          <button
            className="runtime-context-nav-item"
            aria-current={route.kind === 'courses' ? 'page' : undefined}
            onClick={() => onNavigate(coursesRoute())}
          >
            <span>All courses</span>
          </button>
          {courses.map(({ course, label }) => (
            <button
              className="runtime-context-nav-item runtime-context-nav-course"
              key={course.id}
              onClick={() => onOpenCourse ? onOpenCourse(course.id, learnerCourseRoute(course.id)) : onNavigate(learnerCourseRoute(course.id))}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const { course, subject, label } = activeProgrammeCourse

  if (course.sharedLearning && route.kind === 'course') {
    const learnKey = route.section === 'learn' ? route.learnPageId ?? 'learn-default' : null
    const learnContents = learnKey !== null ? (
      <LearnTree
        key={learnKey}
        adapter={course.learningAdapter}
        route={route}
        onNavigate={onNavigate}
        destination={(pageId) => learnerCourseRoute(course.id, 'learn', { learnPageId: pageId })}
      />
    ) : undefined

    return (
      <div className="runtime-context-nav runtime-context-nav-selected-course" role="group" aria-label="Courses navigation">
        <CourseIdentity subjectName={subject.name} course={course} />
        <SectionLinks
          key={route.section}
          route={route}
          sections={availableCourseSections(course)}
          contextLabel={label}
          onNavigate={onNavigate}
          destination={(section) => learnerCourseRoute(course.id, section as CourseSection)}
          learnContents={learnContents}
        />
      </div>
    )
  }

  return (
    <div className="runtime-context-nav runtime-context-nav-selected-course" role="group" aria-label="Courses navigation">
      <CourseIdentity subjectName={subject.name} course={course} />
      <div className="runtime-context-nav-level runtime-context-nav-components">
        {course.modules.map((module) => {
          const moduleSelected = route.kind === 'module' && route.moduleId === module.manifest.id
          const destination = learnerModuleRoute(course.id, module.manifest.id)
          const learnKey = moduleSelected && route.kind === 'module' && route.section === 'learn'
            ? route.learnPageId ?? 'learn-default'
            : null
          const learnContents = learnKey !== null && route.kind === 'module' ? (
            <LearnTree
              key={learnKey}
              adapter={module}
              route={route}
              onNavigate={onNavigate}
              destination={(pageId) => learnerModuleRoute(course.id, module.manifest.id, 'learn', { learnPageId: pageId })}
            />
          ) : undefined

          return (
            <div className="runtime-context-nav-node" key={module.manifest.id}>
              <button
                className="runtime-context-nav-item runtime-context-nav-component"
                data-selected={moduleSelected ? 'true' : undefined}
                aria-current={moduleSelected && route.section === 'overview' ? 'page' : undefined}
                aria-expanded={moduleSelected}
                onClick={() => onNavigate(destination)}
              >
                <span>{module.manifest.paper.name}</span>
              </button>
              {moduleSelected && route.kind === 'module' && (
                <SectionLinks
                  key={route.section}
                  route={route}
                  sections={availablePaperSections(module)}
                  contextLabel={`${label} ${module.manifest.paper.name}`}
                  onNavigate={onNavigate}
                  destination={(section) => learnerModuleRoute(course.id, module.manifest.id, section as PaperSection)}
                  learnContents={learnContents}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}