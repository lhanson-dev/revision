import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { assessPaperReadiness, recommendNextActivity, type ReadinessResult, type RevisionRecommendation } from '../engine/readiness/readiness'
export type { CourseSection } from './navigation'

export type CatalogueCourse = {
  id: string
  subjectId: string
  qualificationId: string
  qualificationName: string
  examBoardName: string
  specificationCode: string
  modules: readonly LearningContentAdapter[]
  learningAdapter: LearningContentAdapter
  sharedLearning: boolean
}

export type CatalogueSubject = {
  id: string
  name: string
  courses: readonly CatalogueCourse[]
  modules: readonly LearningContentAdapter[]
}

export type ModuleLearningState = {
  adapter: LearningContentAdapter
  evidence: readonly LearningEvidence[]
  readiness: ReadinessResult
  recommendation: RevisionRecommendation | null
  recommendationTopic: ReturnType<LearningContentAdapter['getTopic']>
  evidencedTopics: number
  topicCount: number
  course?: CatalogueCourse
}

function courseKey(adapter: LearningContentAdapter) {
  const manifest = adapter.manifest
  return `${manifest.examBoard.id}:${manifest.qualification.id}:${manifest.specificationCode}`
}

function learningSignature(adapter: LearningContentAdapter) {
  return JSON.stringify({
    topics: adapter.listTopics(),
    formulas: adapter.listFormulas(),
    topicLinks: adapter.listTopicLinks(),
    flashcards: adapter.listFlashcards(),
    questions: adapter.listQuestions(),
    caseStudies: adapter.listCaseStudies(),
    dataDrills: adapter.listDataDrills(),
  })
}

export function buildCatalogue(adapters: readonly LearningContentAdapter[]): CatalogueSubject[] {
  const subjects = new Map<string, { name: string; modules: LearningContentAdapter[] }>()

  adapters.forEach((adapter) => {
    const { subject } = adapter.manifest
    const current = subjects.get(subject.id) ?? { name: subject.name, modules: [] }
    current.modules.push(adapter)
    subjects.set(subject.id, current)
  })

  return [...subjects.entries()]
    .map(([id, subject]) => {
      const courses = new Map<string, LearningContentAdapter[]>()
      subject.modules.forEach((adapter) => {
        const key = courseKey(adapter)
        const modules = courses.get(key) ?? []
        modules.push(adapter)
        courses.set(key, modules)
      })

      return {
        id,
        name: subject.name,
        modules: [...subject.modules].sort((left, right) => left.manifest.paper.number - right.manifest.paper.number),
        courses: [...courses.entries()]
          .map(([courseId, modules]) => {
            const sortedModules = [...modules].sort((left, right) => left.manifest.paper.number - right.manifest.paper.number)
            const first = sortedModules[0]
            if (!first) throw new Error(`Catalogue course ${courseId} has no modules.`)
            const signature = learningSignature(first)
            return {
              id: courseId,
              subjectId: id,
              qualificationId: first.manifest.qualification.id,
              qualificationName: first.manifest.qualification.name,
              examBoardName: first.manifest.examBoard.name,
              specificationCode: first.manifest.specificationCode,
              modules: sortedModules,
              learningAdapter: first,
              sharedLearning: sortedModules.length === 1 || sortedModules.every((adapter) => learningSignature(adapter) === signature),
            }
          })
          .sort((left, right) => left.qualificationName.localeCompare(right.qualificationName)),
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function createModuleLearningState(adapter: LearningContentAdapter, allEvidence: readonly LearningEvidence[]): ModuleLearningState {
  const moduleId = adapter.manifest.id
  const topics = adapter.listTopics()
  const topicIds = topics.map((topic) => topic.id)
  const evidence = allEvidence.filter((item) => item.moduleId === moduleId)
  const recommendation = recommendNextActivity(moduleId, topicIds, evidence)

  return {
    adapter,
    evidence,
    readiness: assessPaperReadiness(moduleId, topicIds, evidence),
    recommendation,
    recommendationTopic: recommendation ? adapter.getTopic(recommendation.topicId) : undefined,
    evidencedTopics: new Set(evidence.map((item) => item.topicId)).size,
    topicCount: topicIds.length,
  }
}

export function createCourseLearningState(course: CatalogueCourse, allEvidence: readonly LearningEvidence[]): ModuleLearningState {
  const adapter = course.learningAdapter
  const canonicalModuleId = adapter.manifest.id
  const moduleIds = new Set(course.modules.map((module) => module.manifest.id))
  const evidence = allEvidence.filter((item) => moduleIds.has(item.moduleId))
  const normalizedEvidence = evidence.map((item) => item.moduleId === canonicalModuleId ? item : { ...item, moduleId: canonicalModuleId })
  const topicIds = adapter.listTopics().map((topic) => topic.id)
  const recommendation = recommendNextActivity(canonicalModuleId, topicIds, normalizedEvidence)

  return {
    adapter,
    evidence,
    readiness: assessPaperReadiness(canonicalModuleId, topicIds, normalizedEvidence),
    recommendation,
    recommendationTopic: recommendation ? adapter.getTopic(recommendation.topicId) : undefined,
    evidencedTopics: new Set(evidence.map((item) => item.topicId)).size,
    topicCount: topicIds.length,
    course,
  }
}

function evidenceCoverage(state: ModuleLearningState) {
  if (state.topicCount === 0) return 1
  return state.evidencedTopics / state.topicCount
}

export function chooseRecommendedModule(states: readonly ModuleLearningState[]): ModuleLearningState | null {
  if (states.length === 0) return null

  return [...states].sort((left, right) => {
    const leftHasReadiness = left.readiness.score !== null ? 1 : 0
    const rightHasReadiness = right.readiness.score !== null ? 1 : 0
    if (leftHasReadiness !== rightHasReadiness) return leftHasReadiness - rightHasReadiness

    if (leftHasReadiness === 0) {
      const coverageDifference = evidenceCoverage(left) - evidenceCoverage(right)
      if (coverageDifference !== 0) return coverageDifference
      if (left.readiness.evidenceCount !== right.readiness.evidenceCount) return left.readiness.evidenceCount - right.readiness.evidenceCount
    } else if (left.readiness.score !== right.readiness.score) {
      return (left.readiness.score ?? 0) - (right.readiness.score ?? 0)
    }

    const subjectDifference = left.adapter.manifest.subject.name.localeCompare(right.adapter.manifest.subject.name)
    if (subjectDifference !== 0) return subjectDifference
    if (left.course && right.course) return left.course.qualificationName.localeCompare(right.course.qualificationName)
    if (left.course) return -1
    if (right.course) return 1
    return left.adapter.manifest.paper.number - right.adapter.manifest.paper.number
  })[0] ?? null
}

export function globalRecommendationReason(state: ModuleLearningState, allStates: readonly ModuleLearningState[]) {
  if (state.evidence.length === 0) {
    return `${state.adapter.manifest.subject.name} has no scored evidence yet, so establishing a baseline there will improve the overall revision picture.`
  }
  if (state.readiness.score === null) {
    const compared = allStates.filter((item) => item !== state)
    const hasBetterCoverage = compared.some((item) => evidenceCoverage(item) > evidenceCoverage(state))
    return hasBetterCoverage
      ? `${state.adapter.manifest.subject.name} currently has less evidence coverage than another course or component in your revision programme.`
      : `${state.adapter.manifest.subject.name} still needs more varied evidence before Revision can judge readiness confidently.`
  }
  return `${state.adapter.manifest.subject.name} currently has the lowest supported readiness score across the courses or components with enough evidence to compare.`
}

function hasPractice(adapter: LearningContentAdapter) {
  return adapter.listFlashcards().length > 0
    || adapter.listQuestions().length > 0
    || adapter.listCaseStudies().length > 0
    || adapter.listDataDrills().length > 0
    || adapter.listFormulas().length > 0
}

export function availablePaperSections(adapter: LearningContentAdapter) {
  const sections: Array<'overview' | 'learn' | 'practice' | 'exam-prep' | 'progress'> = ['overview', 'learn']
  if (hasPractice(adapter)) sections.push('practice')
  if (adapter.listExamTechnique().length > 0 || adapter.listExams().length > 0) sections.push('exam-prep')
  sections.push('progress')
  return sections
}

export function availableCourseSections(course: CatalogueCourse) {
  const sections: Array<'overview' | 'learn' | 'practice' | 'exam-prep' | 'progress'> = ['overview', 'learn']
  if (hasPractice(course.learningAdapter)) sections.push('practice')
  if (course.modules.some((adapter) => adapter.listExamTechnique().length > 0 || adapter.listExams().length > 0)) sections.push('exam-prep')
  sections.push('progress')
  return sections
}

export function courseLabel(adapter: LearningContentAdapter) {
  return `${adapter.manifest.qualification.name} ${adapter.manifest.subject.name}`
}

export function catalogueCourseLabel(course: CatalogueCourse, subjectName: string) {
  return `${course.qualificationName} ${subjectName}`
}

export function paperLabel(adapter: LearningContentAdapter) {
  return `Paper ${adapter.manifest.paper.number}`
}
