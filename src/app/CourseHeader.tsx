import { useEffect, useRef } from 'react'
import { Icon, type IconName } from './ui'
import type { CatalogueCourse, CourseSection } from './catalogue-model'

export const courseSectionLabels: Record<CourseSection, string> = {
  overview: 'Overview',
  learn: 'Learn',
  practice: 'Practice',
  'exam-prep': 'Exam Prep',
  progress: 'Progress',
}

// Each subject has its own icon. A subject without one yet falls back to the neutral book.
const subjectIcons: Readonly<Record<string, IconName>> = {
  business: 'briefcase',
  economics: 'trending',
}

function subjectIcon(subjectId: string): IconName {
  return subjectIcons[subjectId.trim().toLocaleLowerCase()] ?? 'subjects'
}

function courseMetadata(course: CatalogueCourse) {
  const level = course.qualificationName.startsWith(course.examBoardName)
    ? course.qualificationName
    : `${course.examBoardName} ${course.qualificationName}`
  return `${level} · ${course.specificationCode}`
}

type CourseHeaderProps = {
  course: CatalogueCourse
  subjectName: string
  navLabel: string
  sections: readonly CourseSection[]
  section: CourseSection
  titleId: string
  onOpenCourses: () => void
  onOpenSection: (section: CourseSection) => void
}

// On narrow screens the course tabs scroll sideways; keep the current section's tab in view.
function useActiveTabInView(activeKey: string) {
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const nav = navRef.current
    const active = nav?.querySelector<HTMLElement>('button.active')
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2
  }, [activeKey])
  return navRef
}

export function CourseHeader({ course, subjectName, sections, section, titleId, navLabel, onOpenCourses, onOpenSection }: CourseHeaderProps) {
  const navRef = useActiveTabInView(section)
  return (
    <header className="course-header">
      <div className="breadcrumbs"><button type="button" onClick={onOpenCourses}>Courses</button><span aria-hidden="true">›</span><span>{subjectName}</span></div>
      <div className="course-header-identity">
        <span className="course-header-tile" aria-hidden="true"><Icon name={subjectIcon(course.subjectId)} size="large" /></span>
        <div>
          <h1 id={titleId}>{subjectName}</h1>
          <p>{courseMetadata(course)}</p>
        </div>
      </div>
      <nav className="course-nav scroll-hint" ref={navRef} aria-label={`${navLabel} navigation`}>
        {sections.map((item) => (
          <button key={item} type="button" className={section === item ? 'active' : ''} aria-current={section === item ? 'page' : undefined} onClick={() => onOpenSection(item)}>{courseSectionLabels[item]}</button>
        ))}
      </nav>
    </header>
  )
}
