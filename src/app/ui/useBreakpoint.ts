import { useEffect, useState } from 'react'

/** Layout bands from docs/design/learner-redesign-v2/guidelines/RESPONSIVE.md. */
export type Breakpoint = 'desktop' | 'laptop' | 'tablet' | 'phone'

export function breakpointForWidth(width: number): Breakpoint {
  if (width <= 620) return 'phone'
  if (width <= 960) return 'tablet'
  if (width <= 1160) return 'laptop'
  return 'desktop'
}

function currentWidth() {
  if (typeof document === 'undefined') return 1440
  return document.documentElement.clientWidth || window.innerWidth || 1440
}

export function useBreakpoint() {
  const [width, setWidth] = useState(currentWidth)

  useEffect(() => {
    const update = () => setWidth(currentWidth())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const breakpoint = breakpointForWidth(width)
  return { width, breakpoint, stacked: width <= 1100, phone: breakpoint === 'phone' }
}
