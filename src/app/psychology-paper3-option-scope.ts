import type { LearningContentAdapter } from '../engine/content/content-adapter'

/**
 * #698: option scope comes exclusively from the already-published AQA 7182
 * Paper 3 exam and topic assets, never from invented or silently chosen topics.
 * The existing planner persists this selection in assessment.scope.topicIds.
 */
export type PsychologyPaper3OptionGroup = {
  id: string
  label: string
  options: { topicId: string; label: string }[]
}
export type PsychologyPaper3OptionContract = {
  compulsoryTopicIds: string[]
  groups: PsychologyPaper3OptionGroup[]
}

export function isAqaPsychologyPaper3(module: LearningContentAdapter): boolean {
  return module.manifest.specificationCode === '7182'
    && module.manifest.paper.number === 3
    && module.manifest.subject.id === 'psychology'
    && module.manifest.examBoard.id === 'aqa'
}

export function psychologyPaper3OptionContract(module: LearningContentAdapter): PsychologyPaper3OptionContract | null {
  if (!isAqaPsychologyPaper3(module)) return null
  const exams = module.listExams()
  if (exams.length !== 1) return null
  const allTopics = new Map(module.listTopics().map((topic) => [topic.id, topic.shortTitle]))
  const compulsoryTopicIds = [...new Set(exams[0].questions
    .filter((question) => !question.choiceGroup)
    .map((question) => question.topic))]
  const groups = new Map<string, Map<string, string>>()
  for (const question of exams[0].questions) {
    if (!question.choiceGroup) continue
    if (question.choiceKind === 'paper-alternative' || !question.choiceOption) return null
    const options = groups.get(question.choiceGroup) ?? new Map<string, string>()
    if (options.has(question.choiceOption) && options.get(question.choiceOption) !== question.topic) return null
    options.set(question.choiceOption, question.topic)
    groups.set(question.choiceGroup, options)
  }
  const groupIds = ['section-b', 'section-c', 'section-d']
  if (compulsoryTopicIds.length !== 1
    || compulsoryTopicIds[0] !== 'issues-and-debates-in-psychology'
    || groups.size !== 3
    || groupIds.some((id) => groups.get(id)?.size !== 3)) return null

  const seen = new Set<string>(compulsoryTopicIds)
  const result: PsychologyPaper3OptionGroup[] = []
  for (const id of groupIds) {
    const entries = [...groups.get(id)!.entries()]
    const options = entries.map(([, topicId]) => ({ topicId, label: allTopics.get(topicId) ?? '' }))
    if (options.some((option) => !option.label || seen.has(option.topicId))) return null
    options.forEach((option) => seen.add(option.topicId))
    result.push({ id, label: 'Section ' + id.slice(-1).toUpperCase(), options })
  }
  return { compulsoryTopicIds, groups: result }
}

/** null = invalid/missing Paper 3 choice; never default to a random option. */
export function psychologyPaper3TopicScope(
  contract: PsychologyPaper3OptionContract | null,
  selectedByGroup: Record<string, string>,
): { topicIds: string[] } | null {
  if (!contract || contract.groups.length !== 3) return null
  if (Object.keys(selectedByGroup).some((id) => !contract.groups.some((group) => group.id === id))) return null
  const chosen = contract.groups.map((group) => selectedByGroup[group.id] ?? '')
  if (chosen.some((topicId, index) => !contract.groups[index].options.some((option) => option.topicId === topicId))) return null
  if (new Set(chosen).size !== 3) return null
  return { topicIds: [...contract.compulsoryTopicIds, ...chosen] }
}
