import type { CatalogueCourse } from './catalogue-model'
import type { CourseExamAssessment } from '../services/planning/course-exam-date-service'
import { psychologyPaper3OptionContract } from './psychology-paper3-option-scope'

/**
 * The learner's existing Plan public-exam scope is the sole source of Paper 3
 * option choices. Missing, malformed, contradictory or outdated selections
 * cannot turn the other six option topics into "their" exam questions.
 *
 * Null is deliberate: compulsory Paper 3 Issues & Debates remains eligible,
 * but no optional Paper 3 topic is assumed. P1/P2 are always in scope.
 */
export function lf05PsychologyPaper3Selection(
  course: CatalogueCourse,
  assessments: readonly CourseExamAssessment[],
): readonly string[] | null {
  if (course.specificationCode !== '7182' || course.examBoardName !== 'AQA') return null
  const module = course.modules.find((part) => part.manifest.paper.number === 3)
  if (!module) return null
  const contract = psychologyPaper3OptionContract(module)
  if (!contract) return null
  const eligible = assessments.filter((assessment) =>
    assessment.courseId === course.id &&
    assessment.moduleId === module.manifest.id &&
    assessment.subjectId === 'psychology',
  )
  if (!eligible.length) return null
  const expectedOptionGroups = contract.groups
  const allowed = new Set([...contract.compulsoryTopicIds,
    ...expectedOptionGroups.flatMap((group) => group.options.map((option) => option.topicId))])
  let selected: readonly string[] | null = null
  for (const assessment of eligible) {
    const scoped = assessment.scope.topicIds
    if (!Array.isArray(scoped) ||
        scoped.some((id) => typeof id !== 'string' || !allowed.has(id))) return null
    const ids = new Set(scoped)
    if (ids.size !== 4 || contract.compulsoryTopicIds.some((id) => !ids.has(id)) ||
        expectedOptionGroups.some((group) => group.options.filter((option) => ids.has(option.topicId)).length !== 1))
      return null
    const canonical = [...contract.compulsoryTopicIds,
      ...expectedOptionGroups.map((group) => group.options.find((option) => ids.has(option.topicId))!.topicId)]
    if (selected && canonical.some((id, index) => id !== selected![index])) return null
    selected = canonical
  }
  return selected
}

export function lf05QuestionIsInSelectedPsychologyScope(
  courseId: string,
  question: {paper_number: number; topic_id: string},
  paper3SelectedTopics: readonly string[] | null,
): boolean {
  if (courseId !== 'aqa:aqa-a-level:7182' || question.paper_number !== 3) return true
  // Issues and Debates is the one compulsory Paper 3 topic. Do not guess one
  // topic from each option group when Plan's real selection is missing.
  return question.topic_id === 'issues-and-debates-in-psychology'
    || Boolean(paper3SelectedTopics?.includes(question.topic_id))
}
