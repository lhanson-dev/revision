import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

type SourceRecord = {
  issuer: string
  url: string
  useClass: string
  aiSourceTextPermitted: boolean
  structuredFactsPermitted: boolean
}

type TopicScope = {
  type: 'topic'
  topicNumber: number
  topic: string
}

type OptionScope = {
  type: 'option_group'
  choose: number
  topicNumbers: number[]
  topics: string[]
}

type Section = {
  id: string
  marks: number
  scope: TopicScope | OptionScope
}

type Paper = {
  id: string
  name: string
  durationMinutes: number
  rawMarks: number
  weightingPercentApprox: number
  primaryTopicNumbers: number[]
  sections: Section[]
}

type Ao = {
  overallPercentRange: [number, number]
  paperContributionPercentOfQualification: Record<string, [number, number]>
}

type Blueprint = {
  status: string
  course: { specificationCode: string; firstAlevelExams: string }
  sourceRegister: SourceRecord[]
  assessmentModel: {
    linearQualification: boolean
    allPapersSameSeries: boolean
    paperCount: number
    rawMarksTotal: number
    scalingFactorByPaper: number
    paperScopeClassification: string
    papers: Paper[]
  }
  assessmentObjectives: Record<'AO1' | 'AO2' | 'AO3', Ao>
  crossPaperConstraints: {
    researchMethodsOverallPercentRange: [number, number]
    researchMethodsAssessment: {
      dedicatedPaper2Section: { paper: string; section: string; marks: number }
      alsoAssessableIn: string[]
    }
    mathematicalSkillsOverallPercentMinimum: number
    mathematicalSkillsAlsoAssessableIn: string[]
  }
  questionFamilies: Array<{
    id: string
    maximumMarks?: number
    maximumTariffAoRule?: { AO1Maximum: number; remainingMarksAcross: string[]; remainingMarks: number }
  }>
  commandDemandModel: { commands: Record<string, string[]> }
  completion: {
    courseTruthComplete: boolean
    examTruthComplete: boolean
    deterministicAssuranceRequired: boolean
    freshIndependentAssessmentAssurancePassed: boolean
    learnerAssetReady: boolean
    restrictedPilotPublicationApproved: boolean
  }
}

type ExamManifest = {
  status: string
  examTruth: {
    paperCount: number
    rawMarksPerPaper: number
    durationMinutesPerPaper: number
    rawMarksTotal: number
    assessmentObjectivesRecorded: boolean
    paperAoRangesRecorded: boolean
    researchMethodsConstraintRecorded: boolean
    mathematicalConstraintRecorded: boolean
    paperOptionStructureRecorded: boolean
    questionFamiliesRecorded: boolean
    commandDemandModelRecorded: boolean
    revisionOwnedAssessmentRulesRecorded: boolean
    examTruthComplete: boolean
    freshIndependentAssessmentAssurancePassed: boolean
    learnerAssetReady: boolean
    restrictedPilotPublicationApproved: boolean
  }
  rights: { awardingBodySources: string; unknownSourceRights: number; rule: string }
}

type CourseTruthManifest = {
  courseTruthProgress: {
    namedRequirements: number
    courseTruthReadyRequirements: number
    courseTruthComplete: boolean
  }
  topicShards: Array<{ topicNumber: number; topic: string }>
}

const ROOT = process.cwd()
const PROTOTYPE = join(ROOT, 'research/source-first-course-prototype')
const EXAM_TRUTH = join(PROTOTYPE, 'psychology-exam-truth')
const COURSE_TRUTH = join(PROTOTYPE, 'psychology-course-truth')

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function scopeTopicNumbers(scope: TopicScope | OptionScope): number[] {
  return scope.type === 'topic' ? [scope.topicNumber] : scope.topicNumbers
}

describe('AQA Psychology 7182 source-first Exam Truth', () => {
  it('reconciles current AQA paper structure, options, AOs and cross-paper constraints', () => {
    const blueprint = readJson<Blueprint>(join(EXAM_TRUTH, 'assessment-blueprint.json'))
    const manifest = readJson<ExamManifest>(join(EXAM_TRUTH, 'manifest.json'))
    const courseTruth = readJson<CourseTruthManifest>(join(COURSE_TRUTH, 'manifest.json'))

    expect(blueprint.status).toBe('experimental_exam_truth_complete')
    expect(blueprint.course).toMatchObject({ specificationCode: '7182', firstAlevelExams: 'Summer 2027' })
    expect(blueprint.assessmentModel).toMatchObject({
      linearQualification: true,
      allPapersSameSeries: true,
      paperCount: 3,
      rawMarksTotal: 288,
      scalingFactorByPaper: 1,
      paperScopeClassification: 'genuine_component_specific_content',
    })

    const papers = blueprint.assessmentModel.papers
    expect(papers.map((paper) => paper.id)).toEqual(['7182/1', '7182/2', '7182/3'])
    expect(papers).toHaveLength(3)
    expect(papers.reduce((sum, paper) => sum + paper.rawMarks, 0)).toBe(288)

    for (const paper of papers) {
      expect(paper.durationMinutes, paper.id).toBe(120)
      expect(paper.rawMarks, paper.id).toBe(96)
      expect(paper.weightingPercentApprox, paper.id).toBeCloseTo(33.3, 1)
      expect(paper.sections.reduce((sum, section) => sum + section.marks, 0), paper.id).toBe(96)
    }

    const paper1 = papers[0]
    expect(paper1.primaryTopicNumbers).toEqual([1, 2, 3, 4])
    expect(paper1.sections.map((section) => section.marks)).toEqual([24, 24, 24, 24])

    const paper2 = papers[1]
    expect(paper2.primaryTopicNumbers).toEqual([5, 6, 7])
    expect(paper2.sections.map((section) => section.marks)).toEqual([24, 24, 48])
    expect(paper2.sections[2].scope).toMatchObject({ type: 'topic', topicNumber: 7, topic: 'Research methods' })

    const paper3 = papers[2]
    expect(paper3.sections.map((section) => section.marks)).toEqual([24, 24, 24, 24])
    const optionGroups = paper3.sections.slice(1).map((section) => section.scope)
    for (const scope of optionGroups) {
      expect(scope.type).toBe('option_group')
      if (scope.type === 'option_group') {
        expect(scope.choose).toBe(1)
        expect(scope.topicNumbers).toHaveLength(3)
      }
    }

    const mappedTopicNumbers = papers.flatMap((paper) => paper.sections.flatMap((section) => scopeTopicNumbers(section.scope)))
    expect(mappedTopicNumbers).toHaveLength(17)
    expect(new Set(mappedTopicNumbers).size).toBe(17)
    expect([...mappedTopicNumbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 17 }, (_, index) => index + 1))

    expect(courseTruth.courseTruthProgress).toMatchObject({
      namedRequirements: 118,
      courseTruthReadyRequirements: 118,
      courseTruthComplete: true,
    })
    expect(courseTruth.topicShards.map((topic) => topic.topicNumber).sort((a, b) => a - b)).toEqual(Array.from({ length: 17 }, (_, index) => index + 1))

    expect(blueprint.assessmentObjectives.AO1.overallPercentRange).toEqual([30, 33])
    expect(blueprint.assessmentObjectives.AO2.overallPercentRange).toEqual([30, 33])
    expect(blueprint.assessmentObjectives.AO3.overallPercentRange).toEqual([36, 38])
    expect(blueprint.assessmentObjectives.AO1.paperContributionPercentOfQualification).toEqual({
      '7182/1': [11, 14], '7182/2': [7, 10], '7182/3': [9, 12],
    })
    expect(blueprint.assessmentObjectives.AO2.paperContributionPercentOfQualification).toEqual({
      '7182/1': [6, 9], '7182/2': [16, 19], '7182/3': [5, 8],
    })
    expect(blueprint.assessmentObjectives.AO3.paperContributionPercentOfQualification).toEqual({
      '7182/1': [12, 14], '7182/2': [7, 9], '7182/3': [15, 17],
    })

    expect(blueprint.crossPaperConstraints.researchMethodsOverallPercentRange).toEqual([25, 30])
    expect(blueprint.crossPaperConstraints.researchMethodsAssessment.dedicatedPaper2Section).toEqual({ paper: '7182/2', section: 'C', marks: 48 })
    expect(blueprint.crossPaperConstraints.researchMethodsAssessment.alsoAssessableIn).toEqual(['7182/1', '7182/2', '7182/3'])
    expect(blueprint.crossPaperConstraints.mathematicalSkillsOverallPercentMinimum).toBe(10)
    expect(blueprint.crossPaperConstraints.mathematicalSkillsAlsoAssessableIn).toEqual(['7182/1', '7182/2', '7182/3'])

    const familyIds = blueprint.questionFamilies.map((family) => family.id)
    expect(new Set(familyIds).size).toBe(familyIds.length)
    expect(familyIds.sort()).toEqual(['data_math', 'extended_writing', 'mcq', 'research_methods_practical', 'scenario_application', 'short_answer'].sort())
    const extended = blueprint.questionFamilies.find((family) => family.id === 'extended_writing')
    expect(extended?.maximumMarks).toBe(16)
    expect(extended?.maximumTariffAoRule).toEqual({
      AO1Maximum: 6,
      remainingMarksAcross: ['AO2', 'AO3'],
      remainingMarks: 10,
    })

    const commands = Object.values(blueprint.commandDemandModel.commands).flat()
    expect(commands).toHaveLength(28)
    expect(new Set(commands).size).toBe(28)

    expect(blueprint.sourceRegister.length).toBeGreaterThanOrEqual(7)
    for (const source of blueprint.sourceRegister) {
      expect(source.issuer).toBe('AQA')
      expect(source.url).toMatch(/^https:\/\/(www\.)?aqa\.org\.uk\//)
      expect(source.useClass).toBe('REFERENCE_ONLY')
      expect(source.aiSourceTextPermitted).toBe(false)
      expect(source.structuredFactsPermitted).toBe(true)
    }

    expect(blueprint.completion).toMatchObject({
      courseTruthComplete: true,
      examTruthComplete: true,
      deterministicAssuranceRequired: true,
      freshIndependentAssessmentAssurancePassed: false,
      learnerAssetReady: false,
      restrictedPilotPublicationApproved: false,
    })
    expect(manifest.status).toBe('experimental_exam_truth_complete')
    expect(manifest.examTruth).toMatchObject({
      paperCount: 3,
      rawMarksPerPaper: 96,
      durationMinutesPerPaper: 120,
      rawMarksTotal: 288,
      assessmentObjectivesRecorded: true,
      paperAoRangesRecorded: true,
      researchMethodsConstraintRecorded: true,
      mathematicalConstraintRecorded: true,
      paperOptionStructureRecorded: true,
      questionFamiliesRecorded: true,
      commandDemandModelRecorded: true,
      revisionOwnedAssessmentRulesRecorded: true,
      examTruthComplete: true,
      freshIndependentAssessmentAssurancePassed: false,
      learnerAssetReady: false,
      restrictedPilotPublicationApproved: false,
    })
    expect(manifest.rights).toEqual({
      awardingBodySources: 'REFERENCE_ONLY',
      unknownSourceRights: 0,
      rule: 'Only approved structured assessment facts may flow downstream. Protected AQA question, mark-scheme or explanatory prose is not a reusable generation corpus.',
    })
  })
})
