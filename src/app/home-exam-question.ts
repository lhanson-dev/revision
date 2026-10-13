import type { Exam } from '../../content/schema'
import type { HomeTask } from './home-task'
import type { LearnerProgrammeCourse } from './learner-programme'

export type HomeExamQuestion = {
  moduleId: string
  exam: Exam
  questionId: string
}

/**
 * Resolve a real published, untimed question from the learner's exact saved
 * course and recommended topic. Paper numbers are not topic ownership: shared
 * Business topics can appear on any of the course's eligible paper packs.
 */
export function resolveHomeExamQuestion(
  task: Pick<HomeTask, 'courseId' | 'topicId' | 'examTarget'>,
  programme: readonly LearnerProgrammeCourse[],
): HomeExamQuestion | null {
  const saved = programme.find(({ course }) => course.id === task.courseId)
  if (!saved) return null

  for (const adapter of saved.course.modules) {
    if (task.examTarget && adapter.manifest.id !== task.examTarget.moduleId) continue
    if (adapter.manifest.status !== 'available' || !adapter.getTopic(task.topicId)) continue
    for (const exam of adapter.listExams()) {
      // The retained pilot packs explicitly prohibit untimed single-question use.
      if (exam.restrictedPilot || (task.examTarget && exam.id !== task.examTarget.examId)) continue
      const matching = exam.questions.filter((question) => question.topic === task.topicId && (!task.examTarget || question.id === task.examTarget.questionId))
      // Prefer a written, multi-mark response when it actually exists in this
      // paper; never invent a question, paper or cross-course fallback.
      const selected = matching.find((question) => question.marks >= 4) ?? matching[0]
      if (selected) return { moduleId: adapter.manifest.id, exam, questionId: selected.id }
    }
  }
  return null
}
