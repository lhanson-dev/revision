/**
 * Date helpers for the Plan screen. Days are plain `YYYY-MM-DD` keys in the student's own calendar, weeks start
 * on Monday, and nothing here reads the clock: callers pass "today" in.
 */

const pad = (value: number) => String(value).padStart(2, '0')

export function toKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Midday, so a daylight-saving change can never move the day. */
export function fromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

export function addDaysToKey(key: string, count: number) {
  const date = fromKey(key)
  date.setDate(date.getDate() + count)
  return toKey(date)
}

/** Whole days from `fromKeyValue` to `toKeyValue` (negative when the second is earlier). */
export function daysBetween(fromKeyValue: string, toKeyValue: string) {
  return Math.round((fromKey(toKeyValue).getTime() - fromKey(fromKeyValue).getTime()) / 86_400_000)
}

/** 0 for Monday through 6 for Sunday. */
export function mondayIndex(key: string) {
  return (fromKey(key).getDay() + 6) % 7
}

export function weekStart(key: string) {
  return addDaysToKey(key, -mondayIndex(key))
}

export function weekKeys(key: string) {
  const start = weekStart(key)
  return Array.from({ length: 7 }, (_, index) => addDaysToKey(start, index))
}

/** The weeks of a month from the Monday on or before the 1st to the Sunday on or after the last day: 28 to 42 keys. */
export function monthGridKeys(year: number, month: number) {
  const first = toKey(new Date(year, month, 1, 12))
  const last = toKey(new Date(year, month + 1, 0, 12))
  const start = weekStart(first)
  const count = Math.ceil((daysBetween(start, last) + 1) / 7) * 7
  return Array.from({ length: count }, (_, index) => addDaysToKey(start, index))
}

export function monthOf(key: string) {
  const date = fromKey(key)
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function sameMonth(a: string, b: string) {
  const left = monthOf(a)
  const right = monthOf(b)
  return left.year === right.year && left.month === right.month
}

/**
 * Step by whole months. Landing in the current month goes to today; any other month goes to its 1st, so the
 * address always names a day that is clearly inside the month being shown.
 */
export function shiftMonth(key: string, count: number, todayKeyValue: string) {
  const { year, month } = monthOf(key)
  const target = new Date(year, month + count, 1, 12)
  return sameMonth(toKey(target), todayKeyValue) ? todayKeyValue : toKey(target)
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const weekdayLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** "5 Oct" */
export function shortDate(key: string) {
  const date = fromKey(key)
  return `${date.getDate()} ${monthShort[date.getMonth()]}`
}

/** "5 Oct 2027" when the year is not the current one, otherwise "5 Oct". */
export function shortDateWithYear(key: string, todayKeyValue: string) {
  const year = fromKey(key).getFullYear()
  return year === fromKey(todayKeyValue).getFullYear() ? shortDate(key) : `${shortDate(key)} ${year}`
}

/** "Monday 5 October" */
export function longDate(key: string) {
  const date = fromKey(key)
  return `${weekdayLong[mondayIndex(key)]} ${date.getDate()} ${monthNames[date.getMonth()]}`
}

export function weekdayName(key: string) {
  return weekdayShort[mondayIndex(key)]
}

export function monthName(key: string) {
  return monthNames[fromKey(key).getMonth()]
}

export function monthTitle(year: number, month: number) {
  return `${monthNames[month]} ${year}`
}

/** "28 Sep – 4 Oct" */
export function weekRangeLabel(key: string) {
  const days = weekKeys(key)
  return `${shortDate(days[0])} – ${shortDate(days[6])}`
}

/** Minutes as the student reads them: 0m, 45m, 1h, 1h 30m. */
export function formatMinutes(minutes: number) {
  if (minutes <= 0) return '0m'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

/** "In 3 days", "tomorrow", "today": for exam countdowns. */
export function countdownWords(days: number) {
  if (days <= 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}
