/**
 * The one central subject map.
 *
 * Each top-level subject has ONE hue and ONE letter mark, fixed for every student and inherited by
 * every course (GCSE and A-level Business are both blue). Split subjects use a variant of the parent
 * hue. Subject colour values live only in `brand-tokens.css` as `--subject-<hue>[-on|-tint|-ink]`;
 * nothing else in the app may contain a subject hex value.
 *
 * Founder decision 1 Oct 2026: docs/design/decisions/2026-10-01-learner-redesign-v2.md.
 * Palette and contrast ratios: docs/design/learner-redesign-v2/guidelines/SUBJECT_PALETTE.md.
 *
 * This table is the starting catalogue. When the subject catalogue gains `hue` and `mark` columns
 * (see the learner v2 data model proposal) the values come from there and this file becomes the
 * fallback that the catalogue is checked against.
 */

export const subjectHues = [
  'violet', 'violet-bio', 'violet-chem', 'violet-phys',
  'blue', 'sky',
  'magenta', 'magenta-lang', 'magenta-lit',
  'umber', 'plum', 'green', 'olive', 'slate', 'navy',
] as const

export type SubjectHue = (typeof subjectHues)[number]

export interface SubjectIdentity {
  hue: SubjectHue
  /** One or two letters, first capital. Always shown next to the subject name. */
  mark: string
}

/** Keyed by catalogue subject id. */
export const subjectIdentities: Readonly<Record<string, SubjectIdentity>> = {
  'combined-science': { hue: 'violet', mark: 'Sc' },
  science: { hue: 'violet', mark: 'Sc' },
  biology: { hue: 'violet-bio', mark: 'Bi' },
  chemistry: { hue: 'violet-chem', mark: 'Ch' },
  physics: { hue: 'violet-phys', mark: 'Ph' },
  business: { hue: 'blue', mark: 'B' },
  maths: { hue: 'sky', mark: 'M' },
  mathematics: { hue: 'sky', mark: 'M' },
  english: { hue: 'magenta', mark: 'En' },
  'english-language': { hue: 'magenta-lang', mark: 'EL' },
  'english-literature': { hue: 'magenta-lit', mark: 'Li' },
  psychology: { hue: 'umber', mark: 'Ps' },
  history: { hue: 'plum', mark: 'H' },
  geography: { hue: 'green', mark: 'G' },
  'modern-languages': { hue: 'olive', mark: 'La' },
  'computer-science': { hue: 'slate', mark: 'Cs' },
  economics: { hue: 'navy', mark: 'Ec' },
}

const hueSet: ReadonlySet<string> = new Set(subjectHues)

export function isSubjectHue(value: string): value is SubjectHue {
  return hueSet.has(value)
}

/** The identity for a catalogue subject, or null when the catalogue has no mapping for it yet. */
export function subjectIdentity(subjectId: string): SubjectIdentity | null {
  return subjectIdentities[subjectId] ?? null
}

/** Hue used when the subject map has no entry yet: a neutral hue, never teal, yellow or coral. */
export const FALLBACK_HUE: SubjectHue = 'slate'

/** The hue and letter mark to show for a subject. A subject with no entry yet gets the neutral hue and its first letter. */
export function resolveSubjectIdentity(subjectId: string, subjectName: string): SubjectIdentity {
  return subjectIdentity(subjectId) ?? { hue: FALLBACK_HUE, mark: fallbackMark(subjectName) }
}

/** CSS custom property names for a hue. Use them as `var(...)` in component styles. */
export function subjectColourVars(hue: SubjectHue) {
  return {
    solid: `var(--subject-${hue})`,
    on: `var(--subject-${hue}-on)`,
    tint: `var(--subject-${hue}-tint)`,
    ink: `var(--subject-${hue}-ink)`,
  } as const
}

/**
 * A letter mark for a subject the catalogue has no mark for. First letter only, so it is never
 * wrong, only plain. The subject name is always shown beside it.
 */
export function fallbackMark(subjectName: string): string {
  const letter = subjectName.trim().charAt(0)
  return letter ? letter.toUpperCase() : '?'
}
