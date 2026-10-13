import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { resolveHomeExamQuestion } from './home-exam-question'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const aLevel = courses.find((item) => item.course.specificationCode === '7132')
if (!aLevel) throw new Error('Published AQA 7132 course missing')

describe('Home exam-question direct Start resolution', () => {
  it('uses a real question, exact topic and eligible module from the saved course', () => {
    const topicId = 'finance'
    const result = resolveHomeExamQuestion({ courseId: aLevel.course.id, topicId }, [aLevel])
    expect(result).not.toBeNull()
    const adapter = aLevel.course.modules.find((item) => item.manifest.id === result?.moduleId)
    expect(adapter?.manifest.status).toBe('available')
    const exactExam = adapter?.getExam(result!.exam.id)
    expect(exactExam?.questions.some((item) => item.id === result?.questionId && item.topic === topicId)).toBe(true)
    expect(exactExam?.restrictedPilot).not.toBe(true)
    expect(result?.exam.id).toBe(exactExam?.id)
  })

  it('never substitutes a paper from another course or an arbitrary topic', () => {
    expect(resolveHomeExamQuestion({ courseId: 'missing-course', topicId: 'finance' }, courses)).toBeNull()
    expect(resolveHomeExamQuestion({ courseId: aLevel.course.id, topicId: 'nonexistent-topic' }, [aLevel])).toBeNull()
    expect(resolveHomeExamQuestion({ courseId: aLevel.course.id, topicId: 'finance' }, courses.filter((c) => c.course.id !== aLevel.course.id))).toBeNull()
  })

  it('does not launch restricted pilot exams as single-question practice', () => {
    const target = resolveHomeExamQuestion({ courseId: aLevel.course.id, topicId: 'business' }, [aLevel])
    if (target) expect(target.exam.restrictedPilot).not.toBe(true)
  })
})
