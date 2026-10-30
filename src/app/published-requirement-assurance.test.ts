import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import {
  buildPublishedCourseSupplyReport, type ProvisionalRequirement,
} from './published-requirement-assurance'
import { topicOrderForSpecItem } from './practice-questions'
import { psychologyCourseTruthTopics, psychologyTopics } from '../../content/psychology/aqa-a-level/shared/course'

const catalogue = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = catalogue.find(item => item.course.specificationCode === '7132')?.course
const psychology = catalogue.find(item => item.course.specificationCode === '7182')?.course
if (!business || !psychology) throw new Error('Missing real published AQA Business/Psychology course')

const businessTopics = business.learningAdapter.listTopics()
const businessRecords = business.learningAdapter.listPracticeBank()
const businessItemIds = [...new Set(businessRecords.flatMap(record => record.target_item_ids))]
const businessCandidates: ProvisionalRequirement[] = businessItemIds.map(id => {
  const order = topicOrderForSpecItem(id)
  const topic = businessTopics.find(x => x.order === order)
  if (!topic) throw new Error(`Published Business Practice mapping lacks actual topic: ${id}`)
  return { id, topicId: topic.id, sourceLocator: null,
    inventoryOrigin: 'published-bank-target', sourceSectionIds: [] }
})

const psychologyCandidates: ProvisionalRequirement[] = psychologyCourseTruthTopics
  .flatMap((topic, i) => topic.requirements.map(requirement => ({
    id: requirement.requirementId,
    topicId: psychologyTopics[i]!.id,
    sourceLocator: null,
    inventoryOrigin: 'psychology-prototype-truth' as const,
    sourceSectionIds: [requirement.requirementId.toLowerCase().replaceAll('-', '')],
  })))

const businessReport = buildPublishedCourseSupplyReport(business, businessCandidates)
const psychologyReport = buildPublishedCourseSupplyReport(psychology, psychologyCandidates)

describe('Issue #698: published learner requirement-to-assets evidence crosswalk (NOT source completeness)', () => {
  it('produces a deterministic source-visible audit for exact currently available courses', () => {
    expect(businessReport.specificationCode).toBe('7132')
    expect(psychologyReport.specificationCode).toBe('7182')
    expect(businessReport.publishedModuleIds).toHaveLength(3)
    expect(psychologyReport.publishedModuleIds).toHaveLength(3)
    expect(businessReport.sourceUniverseStatus).toBe('provisional-not-independently-enumerated')
    expect(psychologyReport.sourceUniverseStatus).toBe('provisional-not-independently-enumerated')
    expect(businessReport.counts.provisionalItems).toBe(businessItemIds.length)
    expect(psychologyReport.counts.provisionalItems).toBe(118)
    expect(psychologyReport.rows.every(row => row.sourcePdfVerified === false
      && row.teachingAdequacy === 'unverified' && row.practiceAdequacy === 'unverified')).toBe(true)
    expect(businessReport.rows.every(row => row.sourcePdfVerified === false
      && row.sourceLocator === null && row.practiceAdequacy === 'unverified')).toBe(true)
  })

  it('separates a real Psychology Learn page and generic topic practice from independently attributable skill marking', () => {
    expect(psychologyReport.rows).toHaveLength(118)
    expect(psychologyReport.counts.itemsWithIdentifiedLearnPage).toBe(118)
    expect(psychologyReport.rows.every(row => row.topicOnlyMcqIds.length > 0)).toBe(true)
    // Topic-only course-pack questions do not store their own spec item IDs;
    // the existence of one MCQ per prototype requirement cannot count as
    // 118 independently scored per-requirement assessments.
    const directlyScored = psychologyReport.rows
      .filter(row => row.independentlyScoredMcqIds.length > 0)
    expect(directlyScored).toHaveLength(0)
    expect(psychologyReport.counts.itemsWithIndependentRetestPair).toBe(0)
    // Psychology's banked calculations must be shown separately if present,
    // not mislabelled as individually attributable durable MCQ observations.
    expect(psychologyReport.counts.itemsWithAnySingleTargetScoredPractice)
      .toBeLessThanOrEqual(psychologyReport.counts.provisionalItems)
  })

  it('proves the four new real Business authored recheck pairs, without claiming the entire course', () => {
    const ids = [
      'aqa-7132-3.3.1:market-share',
      'aqa-7132-3.4.2:capacity-utilisation',
      'aqa-7132-3.7.2:payables-days',
      'aqa-7132-3.10.3:critical-path',
    ]
    for (const id of ids) {
      const row = businessReport.rows.find(x => x.requirementId === id)
      expect(row, `Missing real mapped Business requirement ${id}`).toBeDefined()
      expect(row!.independentlyScoredMcqIds.length).toBeGreaterThanOrEqual(2)
      expect(row!.independentRecheckPair, id).not.toBeNull()
      expect(row!.taggedBankQuestionIds.length).toBeGreaterThanOrEqual(2)
      expect(row!.sourcePdfVerified).toBe(false)
      expect(row!.practiceAdequacy).toBe('unverified')
    }
    expect(businessReport.counts.itemsWithIndependentRetestPair).toBeGreaterThanOrEqual(4)
    expect(businessReport.counts.itemsWithIndependentRetestPair)
      .toBeLessThanOrEqual(businessReport.counts.provisionalItems)
  })

  it('counts published Business numerical skills accurately without inventing persistent per-skill observations', () => {
    const cases = [
      { item: 'aqa-7132-3.2.2:expected-value', stem: 'expected-value' },
      { item: 'aqa-7132-3.2.2:net-gain', stem: 'net-gain' },
    ]
    for (const { item, stem } of cases) {
      const row = businessReport.rows.find(r => r.requirementId === item)
      expect(row, `Missing numerical item ${item}`).toBeDefined()
      expect(row!.singleTargetScoredCalculationIds).toEqual([
        `rev7132-3.2.2-${stem}-01`, `rev7132-3.2.2-${stem}-02`,
      ])
      expect(row!.distinctCalculationStimulusPair).toEqual(row!.singleTargetScoredCalculationIds)
      expect(row!.unscoredOrOtherTaggedQuestionIds)
        .not.toContain(`rev7132-3.2.2-${stem}-01`)
      expect(row!.sourcePdfVerified).toBe(false)
      expect(row!.practiceAdequacy).toBe('unverified')
    }
    // Every count is a *provisional published supply* measure, never a source
    // compliance score or a persisted calculation skill-mastery assertion.
    expect(businessReport.counts.itemsWithSingleTargetScoredCalculation).toBeGreaterThanOrEqual(2)
    expect(businessReport.counts.itemsWithDistinctCalculationStimulusPair).toBeGreaterThanOrEqual(2)
    expect(businessReport.counts.itemsWithAnySingleTargetScoredPractice
      + businessReport.counts.itemsWithoutAnySingleTargetScoredPractice)
      .toBe(businessReport.counts.provisionalItems)
  })

  it('rejects duplicated requirement candidates, false source-scoped item credit and unknown topics', () => {
    expect(() => buildPublishedCourseSupplyReport(business, [businessCandidates[0]!, businessCandidates[0]!]))
      .toThrow('Repeated provisional requirement ID')
    expect(() => buildPublishedCourseSupplyReport(business, [{
      id: 'invented-item', topicId: 'invented-topic', sourceLocator: null,
      inventoryOrigin: 'published-bank-target', sourceSectionIds: [],
    }])).toThrow('Unknown published topic')
    // A valid topic but fabricated requirement is NOT evidence of either
    // taught material or a scored assessment for that fabricated requirement.
    const fake = buildPublishedCourseSupplyReport(business, [{
      id: 'invented-item', topicId: businessTopics[0]!.id, sourceLocator: null,
      inventoryOrigin: 'published-bank-target', sourceSectionIds: [],
    }])
    expect(fake.rows[0]?.independentlyScoredMcqIds).toEqual([])
    expect(fake.rows[0]?.singleTargetScoredCalculationIds).toEqual([])
    expect(fake.rows[0]?.distinctCalculationStimulusPair).toBeNull()
    expect(fake.rows[0]?.independentRecheckPair).toBeNull()
  })

  it('makes a complete machine-readable candidate crosswalk exportable without using learner data', () => {
    const summary = {
      snapshotStatus: 'published-content-only; NOT independent AQA PDF completeness or educational sign-off',
      qualifications: [
        { course: businessReport.courseId, ...businessReport.counts },
        { course: psychologyReport.courseId, ...psychologyReport.counts },
      ],
    }
    // Machine-readable full crosswalk, extracted by the separate Node
    // assurance script. No Node globals/dependencies enter frontend tests.
    console.info('REVISION_SOURCE_TO_LIVE_SUPPLY_AUDIT=' + JSON.stringify({
      summary,
      status: 'PROVISIONAL: exact user PDFs not independently enumerated; asset presence is not adequate learning or Practice',
      exactSpecificationPdfHashesVerified: false,
      reports: [businessReport, psychologyReport],
    }))
  })
})
