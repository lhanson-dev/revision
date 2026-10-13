import { useEffect, useState } from 'react'
/** Refresh all date-dependent owners together at local midnight, including DST. */
export function useLocalDay() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timer = window.setTimeout(() => setNow(new Date()), Math.max(1, next.getTime() - Date.now()))
    return () => window.clearTimeout(timer)
  }, [now])
  return now
}
