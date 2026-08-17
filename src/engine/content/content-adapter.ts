import type {
  CaseStudy,
  ContentManifest,
  ContentPack,
  DataDrill,
  Exam,
  Flashcard,
  Formula,
  MultipleChoiceQuestion,
  Topic,
  TopicId,
  TopicLink,
} from '../../../content/schema'

export type CatalogueEntry = {
  id: string
  subject: string
  qualification: string
  examBoard: string
  paper: string
  status: ContentManifest['status']
  durationMinutes: number
  totalMarks: number
  topicCount: number
}

export type LearningContentAdapter = {
  manifest: ContentManifest
  catalogueEntry: CatalogueEntry
  listTopics: () => readonly Topic[]
  getTopic: (topicId: TopicId) => Topic | undefined
  listFormulas: () => readonly Formula[]
  listTopicLinks: (topicId?: TopicId) => readonly TopicLink[]
  listFlashcards: (topicId?: TopicId) => readonly Flashcard[]
  listQuestions: (topicId?: TopicId) => readonly MultipleChoiceQuestion[]
  listCaseStudies: () => readonly CaseStudy[]
  listDataDrills: () => readonly DataDrill[]
  listExams: () => readonly Exam[]
  getExam: (examId: string) => Exam | undefined
}

export function createLearningContentAdapter(pack: ContentPack): LearningContentAdapter {
  const topics = [...pack.topics].sort((left, right) => left.order - right.order)

  return {
    manifest: pack.manifest,
    catalogueEntry: {
      id: pack.manifest.id,
      subject: pack.manifest.subject.name,
      qualification: pack.manifest.qualification.name,
      examBoard: pack.manifest.examBoard.name,
      paper: pack.manifest.paper.name,
      status: pack.manifest.status,
      durationMinutes: pack.manifest.paper.durationMinutes,
      totalMarks: pack.manifest.paper.totalMarks,
      topicCount: topics.length,
    },
    listTopics: () => topics,
    getTopic: (topicId) => topics.find((topic) => topic.id === topicId),
    listFormulas: () => pack.formulas,
    listTopicLinks: (topicId) => topicId ? pack.topicLinks.filter((item) => item.topic === topicId) : pack.topicLinks,
    listFlashcards: (topicId) => topicId ? pack.flashcards.filter((item) => item.topic === topicId) : pack.flashcards,
    listQuestions: (topicId) => topicId ? pack.questions.filter((item) => item.topic === topicId) : pack.questions,
    listCaseStudies: () => pack.caseStudies,
    listDataDrills: () => pack.dataDrills,
    listExams: () => pack.exams,
    getExam: (examId) => pack.exams.find((exam) => exam.id === examId),
  }
}
