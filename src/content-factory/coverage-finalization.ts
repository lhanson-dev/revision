import { coverageMapSchema, type CoverageMap } from './schema'

export type CoverageEvidenceRef = {
  ref: string
  requirementIds: string[]
  kind: 'learning' | 'practice' | 'assessment_item'
}

export function finaliseCoverageMap(input: {
  coverageMap: CoverageMap
  evidence: CoverageEvidenceRef[]
}) {
  const evidenceByRequirement = new Map<string, CoverageEvidenceRef[]>()
  for (const entry of input.evidence) {
    for (const requirementId of entry.requirementIds) {
      evidenceByRequirement.set(requirementId, [...(evidenceByRequirement.get(requirementId) ?? []), entry])
    }
  }

  return coverageMapSchema.parse({
    ...input.coverageMap,
    requirements: input.coverageMap.requirements.map((requirement) => {
      if (requirement.coverageStatus === 'not_applicable' || requirement.coverageStatus === 'deferred') return requirement
      const entries = evidenceByRequirement.get(requirement.requirementId) ?? []
      const learning = entries.some((entry) => entry.kind === 'learning')
      const practice = entries.some((entry) => entry.kind === 'practice')
      const assessment = entries.some((entry) => entry.kind === 'assessment_item')
      const requiredEvidencePresent = (!requirement.learnRequired || learning)
        && (!requirement.practiceRequired || practice)
        && (!requirement.examPrepRequired || assessment)
      const contentRefs = [...new Set(entries.map((entry) => entry.ref))]
      const coverageStatus = requiredEvidencePresent ? 'complete' : contentRefs.length > 0 ? 'partial' : 'planned'
      return { ...requirement, coverageStatus, contentRefs }
    }),
  })
}

export function finalCoverageProblems(input: {
  coverageMap: CoverageMap
  evidence: CoverageEvidenceRef[]
}) {
  const expected = finaliseCoverageMap(input)
  const problems: string[] = []

  for (const requirement of input.coverageMap.requirements) {
    if (requirement.coverageStatus === 'not_applicable' || requirement.coverageStatus === 'deferred') continue
    const finalRequirement = expected.requirements.find((candidate) => candidate.requirementId === requirement.requirementId)!
    if (requirement.coverageStatus !== 'complete') {
      problems.push(`${requirement.requirementId}: final Coverage Map status is ${requirement.coverageStatus}, expected complete`)
    }
    const actualRefs = [...requirement.contentRefs].sort()
    const expectedRefs = [...finalRequirement.contentRefs].sort()
    if (actualRefs.length !== expectedRefs.length || actualRefs.some((ref, index) => ref !== expectedRefs[index])) {
      problems.push(`${requirement.requirementId}: final Coverage Map contentRefs do not match generated evidence`)
    }
  }

  return problems
}
