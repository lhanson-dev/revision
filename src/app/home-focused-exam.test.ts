import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { HomeFocusedActivity } from './HomeFocusedActivity'
import type { HomeTask } from './home-task'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = courses.find((item) => item.course.specificationCode === '7132')
if (!business) throw new Error('AQA Business 7132 not published')
const topic = business.course.learningAdapter.getTopic('finance')
if (!topic) throw new Error('Finance topic unavailable')

function renderExam(courseId = business!.course.id, topicId = topic!.id) {
  const task: HomeTask = {
    id: 'home-test',
    source: 'rules',
    courseId,
    courseLabel: business!.label,
    subjectId: business!.subject.id,
    subjectName: business!.subject.name,
    subjectAccent: 'business',
    topicId,
    topicLabel: topic!.shortTitle,
    activityType: 'exam-question',
    estimatedMinutes: 30,
    reason: 'Exam practice needs supporting evidence.',
    adapter: business!.course.learningAdapter,
  }
  return renderToStaticMarkup(createElement(HomeFocusedActivity, {
    client: {} as SupabaseClient,
    userId: 'synthetic-student',
    task,
    programme: [business!],
    onBack: () => {},
    onFinish: () => {},
  }))
}

describe('Home focused exam-question launch', () => {
  it('renders the existing untimed question and actual topic on first Start, never a full paper launch', () => {
    const html = renderExam()
    expect(html).toContain('Practise one exam question')
    expect(html).toContain('finance')
    expect(html).toContain('Write your answer')
    expect(html).toContain('Show marking guidance')
    expect(html).toContain('Back to Home')
    expect(html).not.toContain('Open timed exam')
    expect(html).not.toContain('Record this result') // no evidence just for navigation
  })

  it('shows recoverable unavailable state, not other-course practice, for an invalid course', () => {
    const html = renderExam('not-in-active-programme')
    expect(html).toContain('not available yet')
    expect(html).toContain('Back to Home')
    expect(html).not.toContain('Practise one exam question')
  })
})
