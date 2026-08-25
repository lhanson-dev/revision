export type SubjectAccentKey = 'business' | 'economics' | 'neutral'

const subjectAccentById: Readonly<Record<string, SubjectAccentKey>> = {
  business: 'business',
  economics: 'economics',
}

export function subjectAccentKey(subjectId: string): SubjectAccentKey {
  return subjectAccentById[subjectId.trim().toLocaleLowerCase()] ?? 'neutral'
}
