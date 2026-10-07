import { describe, expect, it } from 'vitest'

import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import {
  psychologyCourseSummary,
  psychologyFlashcards,
  psychologyLearn,
  psychologyQuestions,
  psychologyTopics,
} from './shared/course'
import { aqaPsychology7182ExamPapers } from './shared/exam-papers'

describe('AQA Psychology 7182 restricted-pilot content pack', () => {
  it('projects the complete approved Course Truth into learner content', () => {
    expect(psychologyCourseSummary).toEqual({ topicCount: 17, requirementCount: 118 })
    expect(psychologyTopics).toHaveLength(17)
    expect(psychologyLearn.chapters).toHaveLength(17)
    expect(psychologyLearn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))).toHaveLength(118)
    expect(psychologyFlashcards).toHaveLength(118)
    expect(psychologyQuestions).toHaveLength(118)
  })

  it('keeps the three paper modules on one shared learner course', () => {
    expect(paper1.topics).toEqual(paper2.topics)
    expect(paper2.topics).toEqual(paper3.topics)
    expect(paper1.learn).toEqual(paper2.learn)
    expect(paper2.learn).toEqual(paper3.learn)
    expect(paper1.questions).toEqual(paper2.questions)
    expect(paper2.questions).toEqual(paper3.questions)
  })

  it('keeps each representative mock at 96 attempted marks and 120 minutes', () => {
    for (const pack of [paper1, paper2, paper3]) {
      expect(pack.exams).toHaveLength(1)
      expect(pack.exams[0]?.totalMarks).toBe(96)
      expect(pack.exams[0]?.durationMinutes).toBe(120)
    }
  })

  it('represents Paper 3 option groups as whole topic options', () => {
    const exam = paper3.exams[0]
    expect(exam).toBeDefined()
    const groups = new Map<string, Set<string>>()
    exam?.questions.forEach((question) => {
      if (!question.choiceGroup) return
      const options = groups.get(question.choiceGroup) ?? new Set<string>()
      options.add(question.choiceOption ?? question.id)
      groups.set(question.choiceGroup, options)
    })
    expect([...groups.keys()].sort()).toEqual(['section-b', 'section-c', 'section-d'])
    expect([...groups.values()].map((options) => options.size)).toEqual([3, 3, 3])
  })

  it('publishes the exact three-paper guide with Psychology AO1 to AO3', () => {
    expect(aqaPsychology7182ExamPapers.papers).toHaveLength(3)
    expect(aqaPsychology7182ExamPapers.papers.map((paper) => [paper.durationMinutes, paper.totalMarks])).toEqual([
      [120, 96],
      [120, 96],
      [120, 96],
    ])
    expect(aqaPsychology7182ExamPapers.assessmentObjectives.map((ao) => ao.id)).toEqual(['AO1', 'AO2', 'AO3'])
  })

  it('stays preview-only until final independent assurance passes', () => {
    expect([paper1, paper2, paper3].map((pack) => pack.manifest.status)).toEqual(['preview', 'preview', 'preview'])
  })
})
