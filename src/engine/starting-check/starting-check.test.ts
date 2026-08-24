import { describe, expect, it } from 'vitest'
import type { LearningContentAdapter } from '../content/content-adapter'
import type { LearningEvidence } from '../evidence/evidence'
import {
  recommendStartingPoint,
  selectStartingCheckQuestions,
  type StartingCheckObservation,
} from './starting-check'

type StartingCheckContent = Pick<LearningContentAdapter, 'listTopics' | 'listQuestions'>

function adapter(topicCount: number, topicsWithoutQuestions: number[] = []): StartingCheckContent {
  const topics = Array.from({ length: topicCount }, (_, index) => ({
    id: `topic-${index + 1}`,
    order: index + 1,
    title: `Topic ${index + 1}`,
    shortTitle: `T${index + 1}`,
    sections: [{ id: `section-${index + 1}`, title: 'Section', points: ['Point'] }],
  }))
  const questions = topics
    .filter((_, index) => !topicsWithoutQuestions.includes(index))
    .map((topic, index) => ({
      id: `question-${index + 1}`,
      topic: topic.id,
      prompt: 'Question?',
      options: ['A', 'B'],
      correctOption: 0,
      explanation: 'Because.',
    }))

  return {
    listTopics: () => topics,
    listQuestions: (topicId) => topicId ? questions.filter((question) => question.topic === topicId) : questions,
  }
}

function evidence(topicId: string): LearningEvidence {
  return {
    id: `evidence-${topicId}`,
    moduleId: 'module-a',
    topicId,
    occurredAt: '2026-08-24T12:00:00.000Z',
    contentId: `content-${topicId}`,
    schemaVersion: 1,
    source: 'flashcard',
    rating: 1,
  }
}

describe('selectStartingCheckQuestions', () => {
  it('selects five distinct topics spread across canonical course order', () => {
    expect(selectStartingCheckQuestions(adapter(10)).map((question) => question.topic))
      .toEqual(['topic-1', 'topic-3', 'topic-6', 'topic-8', 'topic-10'])
  })

  it('returns fewer than five questions rather than duplicating topics', () => {
    expect(selectStartingCheckQuestions(adapter(4))).toHaveLength(4)
  })

  it('samples only topics that have eligible assured questions', () => {
    const selected = selectStartingCheckQuestions(adapter(6, [1, 4]))
    expect(selected.map((question) => question.topic)).toEqual(['topic-1', 'topic-3', 'topic-4', 'topic-6'])
  })
})

describe('recommendStartingPoint', () => {
  const topicIds = ['topic-1', 'topic-2', 'topic-3', 'topic-4']

  it('chooses the earliest incorrectly answered topic in canonical order', () => {
    const observations: StartingCheckObservation[] = [
      { questionId: 'q3', topicId: 'topic-3', correct: false },
      { questionId: 'q2', topicId: 'topic-2', correct: false },
    ]

    expect(recommendStartingPoint('module-a', topicIds, observations, []))
      .toEqual({ topicId: 'topic-2', reason: 'incorrect_sample' })
  })

  it('uses answered partial observations without inventing missing answers', () => {
    const observations: StartingCheckObservation[] = [
      { questionId: 'q3', topicId: 'topic-3', correct: false },
    ]

    expect(recommendStartingPoint('module-a', topicIds, observations, []))
      .toEqual({ topicId: 'topic-3', reason: 'incorrect_sample' })
  })

  it('falls back to the earliest topic without stronger normal evidence', () => {
    expect(recommendStartingPoint('module-a', topicIds, [], [evidence('topic-1'), evidence('topic-2')]))
      .toEqual({ topicId: 'topic-3', reason: 'no_stronger_evidence' })
  })

  it('falls back to canonical course order when every topic has stronger evidence', () => {
    expect(recommendStartingPoint('module-a', topicIds, [], topicIds.map(evidence)))
      .toEqual({ topicId: 'topic-1', reason: 'course_order_fallback' })
  })
})
