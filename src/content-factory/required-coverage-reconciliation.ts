import type { CoverageMap } from './schema'

export type RequiredCoverageEvidenceKind = 'learning' | 'practice' | 'assessment_item'

export type RequiredCoverageEvidence = {
  requirementId: string
  kind: RequiredCoverageEvidenceKind
  artifactRef: string
}

export type RequiredCoverageProblem = {
  requirementId: string
  missing: RequiredCoverageEvidenceKind[]
}

function requiredKinds(requirement: CoverageMap['requirements'][number]): RequiredCoverageEvidenceKind[] {
  const kinds: RequiredCoverageEvidenceKind[] = []
  if (requirement.learnRequired) kinds.push('learning')
  if (requirement.practiceRequired) kinds.push('practice')
  if (requirement.examPrepRequired) kinds.push('assessment_item')
  return kinds
}

export function requiredCoverageProblems(input: {
  coverageMap: CoverageMap
  evidence: RequiredCoverageEvidence[]
}): RequiredCoverageProblem[] {
  const kindsByRequirement = new Map<string, Set<RequiredCoverageEvidenceKind>>()
  for (const item of input.evidence) {
    const kinds = kindsByRequirement.get(item.requirementId) ?? new Set<RequiredCoverageEvidenceKind>()
    kinds.add(item.kind)
    kindsByRequirement.set(item.requirementId, kinds)
  }

  const problems: RequiredCoverageProblem[] = []
  for (const requirement of input.coverageMap.requirements) {
    if (requirement.coverageStatus === 'deferred' || requirement.coverageStatus === 'not_applicable') continue
    const actual = kindsByRequirement.get(requirement.requirementId) ?? new Set<RequiredCoverageEvidenceKind>()
    const missing = requiredKinds(requirement).filter((kind) => !actual.has(kind))
    if (missing.length > 0) problems.push({ requirementId: requirement.requirementId, missing })
  }
  return problems
}

export function formatRequiredCoverageProblems(problems: RequiredCoverageProblem[]) {
  return problems.map((problem) => `${problem.requirementId}: missing ${problem.missing.join(', ')}`).join(' | ')
}
