import { describe, expect, it } from 'vitest'
import { businessAqaALevel7132Paper1 } from '../../content/business/aqa-a-level/paper-1'
import { businessAqaALevel7132Paper2 } from '../../content/business/aqa-a-level/paper-2'
import { businessAqaALevel7132Paper3 } from '../../content/business/aqa-a-level/paper-3'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { assessTopicKnowledge } from '../engine/knowledge/topic-knowledge'
import { assessTopicReadiness, recommendNextActivity } from '../engine/readiness/readiness'
import { buildCatalogue, createCourseLearningState, createModuleLearningState } from './catalogue-model'
import { progressMeasuresFor } from './progress-summary'
import { topicProgressFor } from './topic-status'

const course = buildCatalogue([
  createLearningContentAdapter(businessAqaALevel7132Paper1),
  createLearningContentAdapter(businessAqaALevel7132Paper2),
  createLearningContentAdapter(businessAqaALevel7132Paper3),
])[0]!.courses[0]!
const moduleId = businessAqaALevel7132Paper1.manifest.id
const topicIds = course.learningAdapter.listTopics().map((topic) => topic.id)
const firstTopic = topicIds[0]!
const now = new Date('2026-10-21T12:00:00.000Z')
const time = '2026-10-21T10:00:00.000Z'

function wholePaper(marksAwarded: number, topicId = firstTopic): LearningEvidence {
  return {
    id: 'legacy-whole-paper', moduleId, topicId,
    contentId: 'aqa-business-paper-1-mock',
    occurredAt: time, schemaVersion: 1, source: 'exam_attempt',
    marksAwarded, marksAvailable: 100, durationMinutes: 80,
    timed: true, markingMethod: 'self_assessed',
  }
}
function topicCard(index: number): LearningEvidence {
  return {
    id: 'card-' + index, moduleId, topicId: firstTopic, contentId: 'card-' + index,
    occurredAt: time, schemaVersion: 1, source: 'flashcard', rating: 2,
  }
}
function topicQuestion(index: number): LearningEvidence {
  return {
    id: 'question-' + index, moduleId, topicId: firstTopic,
    contentId: 'question-' + index, occurredAt: time, schemaVersion: 1,
    source: 'multiple_choice', correct: true, selectedOption: 1, correctOption: 1,
  }
}

describe('Recovery evidence-scope integrity — legacy full-paper attempts', () => {
  it('retains a saved full-paper result without claiming a randomly assigned topic was attempted', () => {
    const attempt = wholePaper(100)
    const state = createCourseLearningState(course, [attempt])
    const empty = createCourseLearningState(course, [])
    // Raw, append-only attempt history remains available for Exam Prep; no data migration or deletion.
    expect(state.evidence).toEqual([attempt])
    expect(state.evidencedTopics).toBe(0)
    expect(progressMeasuresFor([state])).toEqual(progressMeasuresFor([empty]))
    expect(state.topicKnowledge).toEqual(empty.topicKnowledge)
    expect(state.readiness).toEqual(empty.readiness)
    expect(state.recommendation?.topicId).toBe(empty.recommendation?.topicId)
    expect(state.recommendation?.evidenceCount).toBe(empty.recommendation?.evidenceCount)
    expect(topicProgressFor(state)[firstTopic]).toEqual({ status: 'notstarted', lastPractisedAt: null })

    const module = createModuleLearningState(course.learningAdapter, [attempt])
    expect(module.evidence).toContainEqual(attempt)
    expect(module.evidencedTopics).toBe(0)
  })

  it('does not allow a high or low whole-paper mark to change legitimate individual-topic evidence', () => {
    const scored = [
      ...Array.from({ length: 3 }, (_, i) => topicCard(i)),
      ...Array.from({ length: 3 }, (_, i) => topicQuestion(i)),
    ]
    const topicBaseline = assessTopicKnowledge(moduleId, firstTopic, scored)
    const readinessBaseline = assessTopicReadiness(moduleId, firstTopic, scored, now)
    const recommendationBaseline = recommendNextActivity(moduleId, topicIds, scored, now)
    expect(topicBaseline.band).toBe('good')
    expect(readinessBaseline.score).not.toBeNull()

    for (const marks of [0, 100]) {
      const withPaper = [...scored, wholePaper(marks)]
      expect(assessTopicKnowledge(moduleId, firstTopic, withPaper)).toEqual(topicBaseline)
      expect(assessTopicReadiness(moduleId, firstTopic, withPaper, now)).toEqual(readinessBaseline)
      expect(recommendNextActivity(moduleId, topicIds, withPaper, now)).toEqual(recommendationBaseline)
      const state = createCourseLearningState(course, withPaper)
      expect(state.evidencedTopics).toBe(1)
      expect(state.evidence).toHaveLength(scored.length + 1)
    }
  })

  it('does not let an orphaned topic key inflate the covered count or alter another course', () => {
    const orphan: LearningEvidence = { ...topicCard(0), id: 'orphan', topicId: 'not-in-this-course' }
    const state = createCourseLearningState(course, [orphan, wholePaper(80)])
    expect(state.evidencedTopics).toBe(0)
    expect(progressMeasuresFor([state]).covered).toBe(0)
    const module = createModuleLearningState(course.learningAdapter, [orphan, wholePaper(80)])
    expect(module.evidencedTopics).toBe(0)
  })

  it('continues to recognise a genuinely topic-attributed exam question', () => {
    const question: LearningEvidence = {
      id: 'scoped-written-answer', moduleId, topicId: firstTopic,
      contentId: 'scoped-question', occurredAt: time, schemaVersion: 1,
      source: 'exam_question', marksAwarded: 6, marksAvailable: 10,
      assessmentObjectives: {},
    }
    const state = createCourseLearningState(course, [wholePaper(100), question])
    expect(state.evidencedTopics).toBe(1)
    expect(state.topicKnowledge.topics.find((topic) => topic.topicId === firstTopic)?.distinctContentItems).toBe(1)
    expect(topicProgressFor(state)[firstTopic]?.status).toBe('started')
    expect(state.evidence).toHaveLength(2)
  })
})
