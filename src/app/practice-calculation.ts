/**
 * Checking a calculation answer. The student types one number; software compares it with the mark scheme's answer.
 * No AI is involved. Plain rules, so a right answer is never marked wrong because of how it was typed:
 * "£24.2m", "24.2", "24.2 million" and "24,200,000" are all 24.2 million pounds.
 */

const MAGNITUDES: Array<{ pattern: RegExp; factor: number }> = [
  { pattern: /^(bn|billion)\b/i, factor: 1e9 },
  { pattern: /^(m|mn|million)\b/i, factor: 1e6 },
  { pattern: /^(k|thousand)\b/i, factor: 1e3 },
]

export type ParsedAnswer = { value: number; factor: number | null }

/** Reads the number in what the student typed. Null when there is no number to read. */
export function parseAnswer(text: string): ParsedAnswer | null {
  const cleaned = text.trim().replace(/[£$€]/g, '').replace(/\s+/g, ' ')
  const match = /^[^\d\-+.]*([-+]?\s?(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?)\s*(.*)$/.exec(cleaned)
  if (!match) return null
  const digits = match[1].replace(/[,\s]/g, '')
  if (!/\d/.test(digits)) return null
  const value = Number(digits)
  if (!Number.isFinite(value)) return null
  const rest = match[2].trim()
  const factor = MAGNITUDES.find((magnitude) => magnitude.pattern.test(rest))?.factor ?? null
  return { value, factor }
}

/** How many of the answer's own units make one "m" or "k" (a unit of "£m" means the answer is in millions). */
export function unitScale(unit: string | null | undefined): number {
  const text = (unit ?? '').trim().toLowerCase()
  if (/^£?\s?(m|million)s?$/.test(text)) return 1e6
  if (/^£?\s?(k|thousand)s?$/.test(text)) return 1e3
  if (/^£?\s?(bn|billion)s?$/.test(text)) return 1e9
  return 1
}

function decimalPlaces(value: number): number {
  const text = String(value)
  return text.includes('.') ? text.split('.')[1].length : 0
}

/** The answers that count as right: the mark scheme's number and the other numbers its final mark point accepts. */
export function acceptedValuesFor(expected: number, unit: string | null | undefined, acceptEntries: readonly string[]): number[] {
  const scale = unitScale(unit)
  const values = [expected]
  acceptEntries.forEach((entry) => {
    const parsed = parseAnswer(entry)
    if (!parsed) return
    const absolute = parsed.value * (parsed.factor ?? (Math.abs(parsed.value) >= 1000 && scale > 1 ? 1 : scale))
    const inUnit = absolute / scale
    // Only numbers close to the answer (rounding), so an unrelated figure in a mark point is never accepted.
    if (Math.abs(inUnit - expected) <= Math.abs(expected) * 0.1 && !values.includes(inUnit)) values.push(inUnit)
  })
  return values
}

export type CalculationCheck = { status: 'right' | 'wrong' | 'unreadable'; entered: number | null }

/**
 * Right when the typed number matches an accepted value, allowing for the last decimal place. A bare number is read in
 * the answer's own unit (24.2 for "£m"), and a number with "m", "million" or in full (24,200,000) is read as typed.
 */
export function checkCalculation(typed: string, accepted: readonly number[], unit: string | null | undefined): CalculationCheck {
  const parsed = parseAnswer(typed)
  if (!parsed) return { status: 'unreadable', entered: null }
  const scale = unitScale(unit)
  const candidates = parsed.factor !== null
    ? [(parsed.value * parsed.factor) / scale]
    : [parsed.value, parsed.value / scale]
  const right = accepted.some((expected) => {
    const tolerance = 0.5 * 10 ** -decimalPlaces(expected)
    return candidates.some((candidate) => Math.abs(candidate - expected) <= tolerance + 1e-9)
  })
  const entered = parsed.factor !== null ? (parsed.value * parsed.factor) / scale : parsed.value
  return { status: right ? 'right' : 'wrong', entered }
}

/** How the answer is written for the student, e.g. "£24.2m", "12.5%", "450 units per employee per month". */
export function formatAnswer(value: number, unit: string | null | undefined): string {
  const text = (unit ?? '').trim()
  const number = Number.isInteger(value) && Math.abs(value) >= 1000 ? value.toLocaleString('en-GB') : String(value)
  if (text === '£' ) return `£${number}`
  if (/^£\s?(m|k|bn)$/i.test(text)) return `£${number}${text.slice(1).trim()}`
  if (/^percent$/i.test(text) || text === '%') return `${number}%`
  if (/^ratio$/i.test(text)) return `${number}:1`
  return text ? `${number} ${text}` : number
}

/** The unit beside the answer box: "£m", "%", "days". Null when the unit is part of the number itself. */
export function calculationUnitLabel(unit: string | null | undefined): string | null {
  const text = (unit ?? '').trim()
  if (!text) return null
  if (/^percent$/i.test(text)) return '%'
  if (/^ratio$/i.test(text)) return ': 1'
  return text
}
