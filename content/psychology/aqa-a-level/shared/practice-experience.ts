import matrixJson from '../../../../research/source-first-course-prototype/psychology-practice-experience/practice-experience-matrix.json'
import examTruth from '../../../../research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json'
import {
  contentPackPracticeExperienceSchema,
  practiceExperienceMatrixSchema,
  type PracticeExperienceRequirement,
  type PracticeFormat,
} from '../../../practice-experience-schema'
import { psychologyCourseTruthTopics, psychologyTopics } from './course'

/**
 * AQA Psychology 7182 practice-experience layer, keyed to the same topic and
 * section identities the live content pack already uses (topic slug +
 * `psy0101`-style section id). Site code can look up "how should this spec
 * point be practised?" without touching Course Truth files directly.
 */

export const psychologyPracticeExperienceMatrix = practiceExperienceMatrixSchema.parse(matrixJson)

type ExamSection = {
  id: string
  marks: number
  scope: { type: 'topic'; topicNumber: number } | { type: 'option_group'; topicNumbers: number[]; choose: number }
}
type ExamPaper = { id: string; name: string; sections: ExamSection[] }

const papers = (examTruth as unknown as { assessmentModel: { papers: ExamPaper[] } }).assessmentModel.papers

export type PsychologyPaperPlacement = {
  paperId: string
  paperName: string
  sectionId: string
  sectionMarks: number
  /** Paper 3 option group (1, 2 or 3) when the topic is a choice. */
  optionGroup: number | null
}

function placementFor(topicNumber: number): PsychologyPaperPlacement {
  for (const paper of papers) {
    for (const section of paper.sections) {
      const scope = section.scope
      if (scope.type === 'topic' && scope.topicNumber === topicNumber) {
        return { paperId: paper.id, paperName: paper.name, sectionId: section.id, sectionMarks: section.marks, optionGroup: null }
      }
      if (scope.type === 'option_group' && scope.topicNumbers.includes(topicNumber)) {
        const optionGroup = paper.sections.filter((candidate) => candidate.scope.type === 'option_group').indexOf(section) + 1
        return { paperId: paper.id, paperName: paper.name, sectionId: section.id, sectionMarks: section.marks, optionGroup }
      }
    }
  }
  throw new Error(`Psychology topic ${topicNumber} has no Exam Truth paper placement`)
}

export type PsychologyPracticeDesign = PracticeExperienceRequirement & {
  topicId: string
  topicNumber: number
  topicTitle: string
  /** Matches the learner content pack's topic section id, e.g. `psy0101`. */
  sectionId: string
  requirementSummary: string
  placement: PsychologyPaperPlacement
  leadFormat: PracticeFormat
  supportingFormats: PracticeFormat[]
}

const formatsById = new Map(psychologyPracticeExperienceMatrix.formats.map((format) => [format.id, format]))
const matrixByRequirement = new Map(psychologyPracticeExperienceMatrix.requirements.map((item) => [item.requirementId, item]))

export const psychologyPracticeDesigns: PsychologyPracticeDesign[] = psychologyCourseTruthTopics.flatMap((topic) => {
  const learnerTopic = psychologyTopics.find((candidate) => candidate.shortTitle === topic.topic)
  if (!learnerTopic) throw new Error(`No learner topic for Course Truth topic ${topic.topic}`)
  const placement = placementFor(topic.topicNumber)
  return topic.requirements.map((requirement) => {
    const design = matrixByRequirement.get(requirement.requirementId)
    if (!design) throw new Error(`Practice experience matrix is missing ${requirement.requirementId}`)
    const sectionId = requirement.requirementId.toLowerCase().replaceAll('-', '')
    if (!learnerTopic.sections.some((section) => section.id === sectionId)) {
      throw new Error(`Learner topic ${learnerTopic.id} has no section ${sectionId}`)
    }
    const [lead, ...supporting] = design.formats.map((id) => {
      const format = formatsById.get(id)
      if (!format) throw new Error(`Unknown practice format ${id}`)
      return format
    })
    return {
      ...design,
      topicId: learnerTopic.id,
      topicNumber: topic.topicNumber,
      topicTitle: topic.topic,
      sectionId,
      requirementSummary: requirement.boardAlignment.summary,
      placement,
      leadFormat: lead!,
      supportingFormats: supporting,
    }
  })
})

const designsBySection = new Map(psychologyPracticeDesigns.map((design) => [design.sectionId, design]))
const designsByRequirement = new Map(psychologyPracticeDesigns.map((design) => [design.requirementId, design]))

/** Practice design for one learner topic section (e.g. `psy0101`). */
export function getPsychologyPracticeDesign(sectionOrRequirementId: string) {
  return designsBySection.get(sectionOrRequirementId) ?? designsByRequirement.get(sectionOrRequirementId)
}

/** All practice designs for a learner topic, optionally limited to the learner's chosen Paper 3 options. */
export function listPsychologyPracticeDesigns(filter: { topicId?: string; chosenOptionTopicIds?: readonly string[] } = {}) {
  return psychologyPracticeDesigns.filter((design) => {
    if (filter.topicId && design.topicId !== filter.topicId) return false
    if (filter.chosenOptionTopicIds && design.placement.optionGroup !== null) return filter.chosenOptionTopicIds.includes(design.topicId)
    return true
  })
}

/** Issues and Debates prompts: each debate with the topic points it should be illustrated with. */
export function psychologyDebateLinks(chosenOptionTopicIds?: readonly string[]) {
  return psychologyPracticeDesigns
    .filter((design) => design.topicNumber === 8)
    .map((debate) => ({
      debate,
      examples: debate.crossTopicLinks
        .map((id) => designsByRequirement.get(id)!)
        .filter((example) => !chosenOptionTopicIds || example.placement.optionGroup === null || chosenOptionTopicIds.includes(example.topicId)),
    }))
}

/** The layer as carried in each Psychology paper ContentPack (all three papers share one course). */
export const psychologyPackPracticeExperience = contentPackPracticeExperienceSchema.parse({
  formats: psychologyPracticeExperienceMatrix.formats,
  designs: psychologyPracticeDesigns.map((item) => ({
    requirementId: item.requirementId,
    formats: item.formats,
    demands: item.demands,
    namedInSpecification: item.namedInSpecification,
    ...(item.specificationBoundary ? { specificationBoundary: item.specificationBoundary } : {}),
    issuesAndDebatesLinks: item.issuesAndDebatesLinks,
    crossTopicLinks: item.crossTopicLinks,
    ...(item.scenarioHook ? { scenarioHook: item.scenarioHook } : {}),
    sensitivity: item.sensitivity,
    topicId: item.topicId,
    sectionId: item.sectionId,
    optionGroup: item.placement.optionGroup,
  })),
})
