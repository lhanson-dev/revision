import { Icon, type IconName } from './ui'
import type { CatalogueCourse, CourseSection } from './catalogue-model'

export const courseSectionLabels: Record<CourseSection, string> = {
  overview: 'Overview',
  learn: 'Learn',
  practice: 'Practice',
  'exam-prep': 'Exam Prep',
  progress: 'Progress',
}

// Business gets the briefcase; every other subject gets the neutral book until
// Lee decides on a subject icon set (handover decision 4).
function subjectIcon(subjectId: string): IconName {
  return subjectId.trim().toLocaleLowerCase() === 'business' ? 'briefcase' : 'subjects'
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

export function CourseHeader({ course, subjectName, sections, section, titleId, navLabel, onOpenCourses, onOpenSection }: CourseHeaderProps) {
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
      <nav className="course-nav" aria-label={`${navLabel} navigation`}>
        {sections.map((item) => (
          <button key={item} type="button" className={section === item ? 'active' : ''} aria-current={section === item ? 'page' : undefined} onClick={() => onOpenSection(item)}>{courseSectionLabels[item]}</button>
        ))}
      </nav>
    </header>
  )
}
