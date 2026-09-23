import type { LearnChapter, LearnCourse, LearnPage } from '../../../content/learn-schema'
import type {
  CaseStudy,
  ContentManifest,
  ContentPack,
  DataDrill,
  Exam,
  ExamTechniqueGuide,
  Flashcard,
  Formula,
  MultipleChoiceQuestion,
  Topic,
  TopicId,
  TopicLink,
} from '../../../content/schema'

export type CatalogueEntry = {
  id: string
  subjectId: string
  subject: string
  qualificationId: string
  qualification: string
  examBoardId: string
  examBoard: string
  specificationCode: string
  paperId: string
  paperNumber: number
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
  getLearnCourse: () => LearnCourse
  listLearnChapters: () => readonly LearnChapter[]
  getLearnPage: (pageId: string) => LearnPage | undefined
  listFormulas: () => readonly Formula[]
  listTopicLinks: (topicId?: TopicId) => readonly TopicLink[]
  listFlashcards: (topicId?: TopicId) => readonly Flashcard[]
  listQuestions: (topicId?: TopicId) => readonly MultipleChoiceQuestion[]
  listCaseStudies: () => readonly CaseStudy[]
  listDataDrills: () => readonly DataDrill[]
  listExamTechnique: () => readonly ExamTechniqueGuide[]
  listExams: () => readonly Exam[]
  getExam: (examId: string) => Exam | undefined
}

function legacyLearnChapter(topic: Topic): LearnChapter {
  return {
    id: topic.id,
    topicId: topic.id,
    title: topic.title,
    groups: [{
      id: `${topic.id}-guide`,
      title: 'Topic guide',
      pages: topic.sections.map((section) => ({
        id: `${topic.id}-${section.id}`,
        topicId: topic.id,
        title: section.title,
        orientation: `Understand the key ideas in ${section.title.toLowerCase()} and how they connect to the wider topic.`,
        blocks: [{ type: 'explanation' as const, paragraphs: section.points }],
      })),
    }],
  }
}

function buildLearnCourse(topics: readonly Topic[], authored?: LearnCourse): LearnCourse {
  const authoredByTopic = new Map(authored?.chapters.map((chapter) => [chapter.topicId, chapter]) ?? [])
  return {
    chapters: topics.map((topic) => authoredByTopic.get(topic.id) ?? legacyLearnChapter(topic)),
  }
}

export function createLearningContentAdapter(pack: ContentPack): LearningContentAdapter {
  const topics = [...pack.topics].sort((left, right) => left.order - right.order)
  const learnCourse = buildLearnCourse(topics, pack.learn)
  const learnPages = learnCourse.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))

  return {
    manifest: pack.manifest,
    catalogueEntry: {
      id: pack.manifest.id,
      subjectId: pack.manifest.subject.id,
      subject: pack.manifest.subject.name,
      qualificationId: pack.manifest.qualification.id,
      qualification: pack.manifest.qualification.name,
      examBoardId: pack.manifest.examBoard.id,
      examBoard: pack.manifest.examBoard.name,
      specificationCode: pack.manifest.specificationCode,
      paperId: pack.manifest.paper.id,
      paperNumber: pack.manifest.paper.number,
      paper: pack.manifest.paper.name,
      status: pack.manifest.status,
      durationMinutes: pack.manifest.paper.durationMinutes,
      totalMarks: pack.manifest.paper.totalMarks,
      topicCount: topics.length,
    },
    listTopics: () => topics,
    getTopic: (topicId) => topics.find((topic) => topic.id === topicId),
    getLearnCourse: () => learnCourse,
    listLearnChapters: () => learnCourse.chapters,
    getLearnPage: (pageId) => learnPages.find((page) => page.id === pageId),
    listFormulas: () => pack.formulas,
    listTopicLinks: (topicId) => topicId ? pack.topicLinks.filter((item) => item.topic === topicId) : pack.topicLinks,
    listFlashcards: (topicId) => topicId ? pack.flashcards.filter((item) => item.topic === topicId) : pack.flashcards,
    listQuestions: (topicId) => topicId ? pack.questions.filter((item) => item.topic === topicId) : pack.questions,
    listCaseStudies: () => pack.caseStudies,
    listDataDrills: () => pack.dataDrills,
    listExamTechnique: () => pack.examTechnique,
    listExams: () => pack.exams,
    getExam: (examId) => pack.exams.find((exam) => exam.id === examId),
  }
}
