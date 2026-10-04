import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

type ScopeRequirement = { id: string }
type ScopeTopic = { number: number; requirements: ScopeRequirement[] }
type Scope = {
  inventorySummary: { topicCount: number; namedRequirementCount: number }
  topics: ScopeTopic[]
}

type SourceEvidence = {
  url?: string
  classification?: string
  licence?: string
  supports?: string[]
}

type CourseTruthRequirement = {
  requirementId: string
  boardAlignment?: { officialSource?: string; classification?: string }
  subjectTruth?: Record<string, unknown>
  sourceEvidence?: SourceEvidence[]
  readiness?: {
    courseTruthStatus?: string
    materialSubjectTruthGap?: boolean
    materialRightsBlocker?: boolean
    learnerAssetReady?: boolean
  }
}

type TopicShard = {
  status?: string
  topicNumber?: number
  sourcePolicy?: { boardAlignment?: string; subjectTruth?: string; learnerFacing?: boolean }
  requirements?: CourseTruthRequirement[]
  topicReadiness?: { namedRequirements?: number; courseTruthReady?: number }
}

type ManifestShard = {
  topicNumber: number
  path: string
  namedRequirements: number
  courseTruthReady: number
  status: string
}

type Manifest = {
  sourceReviewBaseline: {
    namedRequirements: number
    requirementsWithSomeReusableSourceSupport: number
    coveredCandidates: number
    partial: number
    gap: number
  }
  courseTruthProgress: {
    namedRequirements: number
    courseTruthReadyRequirements: number
    remainingRequirements: number
    courseTruthReadyPercent: number
    candidateCoverageComplete: boolean
    materialSubjectTruthGapsKnown: number
    materialRightsBlockersKnown: number
    learnerAssetReady: boolean
    wholeCourseIndependentAssurancePassed: boolean
    courseTruthComplete: boolean
  }
  topicShards: ManifestShard[]
}

const ROOT = process.cwd()
const PROTOTYPE = join(ROOT, 'research/source-first-course-prototype')
const COURSE_TRUTH = join(PROTOTYPE, 'psychology-course-truth')
const VERIFIED_SOURCE_LICENCES = new Map<string, string>([
  ['https://stats.libretexts.org/Workbench/Statistics_for_Behavioral_Science_Majors/12%3A_Nonparametric_Tests', 'CC BY-SA 1.0'],
])

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function nonEmptySubjectTruth(subjectTruth: Record<string, unknown> | undefined) {
  if (!subjectTruth) return false
  return Object.values(subjectTruth).some((value) => Array.isArray(value) && value.some((item) => typeof item === 'string' && item.trim().length > 0))
}

function isReusableEvidence(source: SourceEvidence) {
  const classification = source.classification?.trim().toUpperCase()
  return classification !== undefined && classification !== 'REFERENCE_ONLY'
}

describe('AQA Psychology 7182 source-first Course Truth candidate', () => {
  it('reconciles the exact 118-requirement scope to one rights-traceable ready record per requirement', () => {
    const scope = readJson<Scope>(join(PROTOTYPE, 'AQA-PSYCHOLOGY-7182-SCOPE.json'))
    const manifest = readJson<Manifest>(join(COURSE_TRUTH, 'manifest.json'))

    const expectedIds = scope.topics.flatMap((topic) => topic.requirements.map((requirement) => requirement.id))
    const expectedIdSet = new Set(expectedIds)

    expect(scope.inventorySummary.topicCount).toBe(17)
    expect(scope.inventorySummary.namedRequirementCount).toBe(118)
    expect(scope.topics).toHaveLength(17)
    expect(expectedIds).toHaveLength(118)
    expect(expectedIdSet.size).toBe(118)

    expect(manifest.topicShards).toHaveLength(17)
    expect(manifest.topicShards.reduce((sum, shard) => sum + shard.namedRequirements, 0)).toBe(118)
    expect(manifest.topicShards.reduce((sum, shard) => sum + shard.courseTruthReady, 0)).toBe(118)

    const actualIds: string[] = []

    for (const shard of manifest.topicShards) {
      const topic = readJson<TopicShard>(join(COURSE_TRUTH, shard.path))
      const requirements = topic.requirements ?? []

      expect(shard.status).toBe('topic_complete_candidate')
      expect(topic.status).toBe('experimental_course_truth_topic_complete_candidate')
      expect(topic.topicNumber).toBe(shard.topicNumber)
      expect(topic.sourcePolicy?.boardAlignment).toBe('REFERENCE_ONLY')
      expect(topic.sourcePolicy?.learnerFacing).toBe(false)
      expect(requirements).toHaveLength(shard.namedRequirements)
      expect(shard.courseTruthReady).toBe(shard.namedRequirements)

      if (topic.topicReadiness) {
        expect(topic.topicReadiness.namedRequirements).toBe(shard.namedRequirements)
        expect(topic.topicReadiness.courseTruthReady).toBe(shard.courseTruthReady)
      }

      for (const requirement of requirements) {
        actualIds.push(requirement.requirementId)
        expect(expectedIdSet.has(requirement.requirementId), `unexpected requirement ${requirement.requirementId}`).toBe(true)
        expect(requirement.boardAlignment?.classification, requirement.requirementId).toBe('REFERENCE_ONLY')
        expect(requirement.boardAlignment?.officialSource, requirement.requirementId).toMatch(/^https:\/\/www\.aqa\.org\.uk\//)
        expect(nonEmptySubjectTruth(requirement.subjectTruth), `${requirement.requirementId} has no material subject truth`).toBe(true)

        const sources = requirement.sourceEvidence ?? []
        expect(sources.length, `${requirement.requirementId} has no source evidence`).toBeGreaterThan(0)
        const reusableSources = sources.filter(isReusableEvidence)
        expect(reusableSources.length, `${requirement.requirementId} has no reusable evidence independent of reference-only alignment`).toBeGreaterThan(0)

        for (const source of reusableSources) {
          expect(source.url?.trim().length ?? 0, `${requirement.requirementId} source missing URL`).toBeGreaterThan(0)
          expect(source.licence?.trim().length ?? 0, `${requirement.requirementId} source missing licence`).toBeGreaterThan(0)
          expect(source.licence ?? '', `${requirement.requirementId} contains non-commercial/unknown evidence`).not.toMatch(/\bNC\b|NON[- ]?COMMERCIAL|UNKNOWN/i)
          expect(source.supports?.length ?? 0, `${requirement.requirementId} source does not say what it supports`).toBeGreaterThan(0)

          const verifiedLicence = source.url ? VERIFIED_SOURCE_LICENCES.get(source.url) : undefined
          if (verifiedLicence) {
            expect(source.licence, `${requirement.requirementId} has stale licence metadata for ${source.url}`).toBe(verifiedLicence)
          }
        }

        expect(requirement.readiness?.courseTruthStatus, requirement.requirementId).toBe('course_truth_ready')
        expect(requirement.readiness?.materialSubjectTruthGap, requirement.requirementId).toBe(false)
        expect(requirement.readiness?.materialRightsBlocker, requirement.requirementId).toBe(false)
        expect(requirement.readiness?.learnerAssetReady, requirement.requirementId).toBe(false)
      }
    }

    expect(actualIds).toHaveLength(118)
    expect(new Set(actualIds).size).toBe(118)
    expect([...actualIds].sort()).toEqual([...expectedIds].sort())

    expect(manifest.sourceReviewBaseline).toMatchObject({
      namedRequirements: 118,
      requirementsWithSomeReusableSourceSupport: 118,
      coveredCandidates: 118,
      partial: 0,
      gap: 0,
    })
    expect(manifest.courseTruthProgress).toMatchObject({
      namedRequirements: 118,
      courseTruthReadyRequirements: 118,
      remainingRequirements: 0,
      courseTruthReadyPercent: 100,
      candidateCoverageComplete: true,
      materialSubjectTruthGapsKnown: 0,
      materialRightsBlockersKnown: 0,
      learnerAssetReady: false,
      wholeCourseIndependentAssurancePassed: false,
      courseTruthComplete: false,
    })
  })
})
