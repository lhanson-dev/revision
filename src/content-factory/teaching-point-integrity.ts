import type { CoverageMap } from './schema'

export type TeachingPointEvidence = {
  teachingPoint: string
  evidence: string
}

export function requiredTeachingPointsForRequirements(
  coverage: CoverageMap,
  requirementIds: string[],
) {
  const requirementMap = new Map(coverage.requirements.map((requirement) => [requirement.requirementId, requirement]))
  const points: string[] = []

  for (const requirementId of requirementIds) {
    const requirement = requirementMap.get(requirementId)
    if (!requirement) throw new Error(`Unknown coverage requirement ${requirementId} while deriving teaching points`)
    points.push(...requirement.skillsOrKnowledge)
  }

  return [...new Set(points)]
}

function normalise(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function validateTeachingPointEvidence(input: {
  requiredTeachingPoints: string[]
  evidence: TeachingPointEvidence[]
  searchableContent: unknown
  artifactLabel: string
}) {
  const required = [...new Set(input.requiredTeachingPoints.map((point) => point.trim()).filter(Boolean))]
  const evidenceByPoint = new Map<string, TeachingPointEvidence>()

  for (const entry of input.evidence) {
    const key = normalise(entry.teachingPoint)
    if (evidenceByPoint.has(key)) throw new Error(`${input.artifactLabel} repeats teaching-point evidence for ${entry.teachingPoint}`)
    evidenceByPoint.set(key, entry)
  }

  const requiredKeys = new Set(required.map(normalise))
  const missing = required.filter((point) => !evidenceByPoint.has(normalise(point)))
  const unexpected = [...evidenceByPoint.values()].filter((entry) => !requiredKeys.has(normalise(entry.teachingPoint)))
  if (missing.length > 0) throw new Error(`${input.artifactLabel} is missing required teaching-point evidence: ${missing.join('; ')}`)
  if (unexpected.length > 0) throw new Error(`${input.artifactLabel} returned evidence for unassigned teaching points: ${unexpected.map((entry) => entry.teachingPoint).join('; ')}`)

  const searchable = normalise(JSON.stringify(input.searchableContent))
  for (const point of required) {
    const entry = evidenceByPoint.get(normalise(point))!
    const excerpt = normalise(entry.evidence)
    if (excerpt.length < 8) throw new Error(`${input.artifactLabel} evidence for ${point} is too short to be auditable`)
    if (!searchable.includes(excerpt)) {
      throw new Error(`${input.artifactLabel} evidence for ${point} is not an exact excerpt from the generated learner content`)
    }
  }

  return input.evidence
}
