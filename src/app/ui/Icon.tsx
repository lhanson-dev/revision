import type { ReactNode, SVGProps } from 'react'
import { classNames } from './classNames'

export type IconName =
  | 'home'
  | 'plan'
  | 'progress'
  | 'subjects'
  | 'menu'
  | 'close'
  | 'chevron-right'
  | 'arrow-right'
  | 'user'
  | 'settings'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'info'
  | 'warning'
  | 'check'
  | 'error'
  | 'plus'
  | 'trash'

export type IconSize = 'inline' | 'compact' | 'standard' | 'large'

const drawings: Record<IconName, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-6h5v6" /></>,
  plan: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 9.5h17" /><path d="m9 14 2 2 4-4" /></>,
  progress: <><path d="M4 20V10M10 20V5M16 20v-8M22 20V3" /><path d="M2 20h20" /></>,
  subjects: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H6.5A2.5 2.5 0 0 0 4 20.5Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H14v18a3 3 0 0 1 3-3h.5a2.5 2.5 0 0 1 2.5 2.5Z" /></>,
  menu: <><path d="M4 8h16M4 16h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  'arrow-right': <><path d="M4 12h15M14 7l5 5-5 5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-2.78 2.78-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.1 1.65V21h-3.8v-.08A1.8 1.8 0 0 0 9 19.27a1.8 1.8 0 0 0-1.98.36l-.06.06-2.78-2.78.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H3v-3.8h.08A1.8 1.8 0 0 0 4.73 9a1.8 1.8 0 0 0-.36-1.98l-.06-.06 2.78-2.78.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1.1-1.65V3h3.8v.08A1.8 1.8 0 0 0 15 4.73a1.8 1.8 0 0 0 1.98-.36l.06-.06 2.78 2.78-.06.06A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 1.65 1.1H21v3.8h-.08A1.8 1.8 0 0 0 19.4 15Z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
  moon: <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" />,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  warning: <><path d="M10.3 4.2 2.7 18a2 2 0 0 0 1.75 3h15.1a2 2 0 0 0 1.75-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 8.5" /></>,
  error: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  trash: <><path d="M4 7h16M9 3h6l1 4H8l1-4Z" /><path d="m7 7 1 14h8l1-14M10 11v6M14 11v6" /></>,
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: IconSize
  title?: string
}

export function Icon({ name, size = 'standard', title, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classNames('ui-icon', `ui-icon--${size}`, className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      {drawings[name]}
    </svg>
  )
}
