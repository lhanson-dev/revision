import { resolveSubjectIdentity } from '../subject-palette'
import { classNames } from './classNames'
import { SubjectBadge } from './SubjectBadge'

export interface CourseIdentityProps {
  subjectId: string
  subjectName: string
  qualificationName: string
  examBoardName: string
  specificationCode: string
  variant?: 'header' | 'compact'
  titleId?: string
  className?: string
}

function courseMetadata(qualificationName: string, examBoardName: string, specificationCode: string) {
  const qualification = qualificationName.toLocaleLowerCase().includes(examBoardName.toLocaleLowerCase())
    ? qualificationName
    : `${examBoardName} ${qualificationName}`
  return `${qualification} · ${specificationCode}`
}

/**
 * Canonical learner course identity: subject letter mark + subject name + qualification/exam-board/specification context.
 * Subject colour is supplemental; the visible subject name carries meaning.
 */
export function CourseIdentity({
  subjectId,
  subjectName,
  qualificationName,
  examBoardName,
  specificationCode,
  variant = 'header',
  titleId,
  className,
}: CourseIdentityProps) {
  const { hue, mark } = resolveSubjectIdentity(subjectId, subjectName)
  const metadata = courseMetadata(qualificationName, examBoardName, specificationCode)

  return (
    <div className={classNames('ui-course-identity', `ui-course-identity--${variant}`, className)}>
      <SubjectBadge hue={hue} mark={mark} size={variant === 'header' ? 'tile' : 'plan'} />
      <div className="ui-course-identity__copy">
        {variant === 'header'
          ? <h1 id={titleId}>{subjectName}</h1>
          : <strong>{subjectName}</strong>}
        <span>{metadata}</span>
      </div>
    </div>
  )
}
