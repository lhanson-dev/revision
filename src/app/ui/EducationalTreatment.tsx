import type { HTMLAttributes, ReactNode } from 'react'
import { classNames } from './classNames'

export type EducationalTreatmentKind =
  | 'key-idea'
  | 'example'
  | 'worked-example'
  | 'relationship'
  | 'misconception'
  | 'recap'

export type EducationalTreatmentProps = HTMLAttributes<HTMLElement> & {
  kind: EducationalTreatmentKind
  label: string
  title?: string
  children: ReactNode
}

export function EducationalTreatment({
  kind,
  label,
  title,
  children,
  className,
  ...props
}: EducationalTreatmentProps) {
  return (
    <section className={classNames('ui-educational-treatment', `ui-educational-treatment--${kind}`, className)} {...props}>
      <header className="ui-educational-treatment__header">
        <span className="ui-educational-treatment__label">{label}</span>
        {title && <strong className="ui-educational-treatment__title">{title}</strong>}
      </header>
      <div className="ui-educational-treatment__body">{children}</div>
    </section>
  )
}
