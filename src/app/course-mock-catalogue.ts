import type { CatalogueCourse } from './catalogue-model'
import { retainedAqa7132MockExamForPaper } from './retained-aqa-business-mock'

/** Same published full mocks in Exam Prep and saved-work discovery. */
export function availableCourseMocks(course: CatalogueCourse) {
  const isAqa7132 = course.examBoardName === 'AQA' && course.specificationCode === '7132'
  return course.modules.flatMap((paper) => {
    const retained = isAqa7132 ? retainedAqa7132MockExamForPaper(paper.manifest.paper.number) : null
    return [
      ...(retained ? [{ exam: retained, moduleId: paper.manifest.id, paperNumber: paper.manifest.paper.number }] : []),
      ...paper.listExams().map((exam) => ({ exam, moduleId: paper.manifest.id, paperNumber: paper.manifest.paper.number })),
    ]
  })
}
