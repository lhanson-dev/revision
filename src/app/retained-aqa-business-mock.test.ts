import { describe, expect, it } from 'vitest'
import paper1Raw from '../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-1.json?raw'
import paper2Raw from '../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-2.json?raw'
import paper3Raw from '../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-3.json?raw'
import releaseRaw from '../../content-factory/releases/aqa-7132-mock-v1.json?raw'
import { listRetainedAqa7132MockExams } from './retained-aqa-business-mock'

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
  )
}

async function fingerprint(value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(canonical(value)))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('retained AQA 7132 mock learner projection', () => {
  const sourcePapers = [paper1Raw, paper2Raw, paper3Raw].map((raw) => JSON.parse(raw))
  const release = JSON.parse(releaseRaw)
  const exams = listRetainedAqa7132MockExams()

  it('projects the exact retained paper fingerprints', async () => {
    expect(await Promise.all(sourcePapers.map(fingerprint))).toEqual([
      release.content.paper_fingerprints['7132/1'],
      release.content.paper_fingerprints['7132/2'],
      release.content.paper_fingerprints['7132/3'],
    ])
    expect(exams.map((exam) => exam.retainedPaperFingerprint)).toEqual([
      release.content.paper_fingerprints['7132/1'],
      release.content.paper_fingerprints['7132/2'],
      release.content.paper_fingerprints['7132/3'],
    ])
  })

  it('represents every retained question slot exactly once without changing the stem', () => {
    const sourceQuestions = sourcePapers.flatMap((paper) => paper.questions)
    const projectedQuestions = exams.flatMap((exam) => exam.questions)
    expect(sourceQuestions).toHaveLength(41)
    expect(projectedQuestions).toHaveLength(41)
    expect(new Set(projectedQuestions.map((question) => question.sourceSlotId)).size).toBe(41)
    expect(projectedQuestions.map((question) => [question.sourceSlotId, question.prompt])).toEqual(
      sourceQuestions.map((record) => [record.question.slot_id, record.question.stem]),
    )
  })

  it('preserves timing, attempted marks, Paper 1 choice groups and linked contexts', () => {
    expect(exams.map((exam) => [exam.durationMinutes, exam.totalMarks])).toEqual([[120, 100], [120, 100], [120, 100]])
    expect(exams[0].printedMarks).toBe(150)
    const paper1RequiredMarks = exams[0].questions.filter((question) => !question.choiceGroup).reduce((sum, question) => sum + question.marks, 0)
    const paper1ChoiceMarks = ['P1-C', 'P1-D'].reduce((sum, group) => sum + (exams[0].questions.find((question) => question.choiceGroup === group)?.marks ?? 0), 0)
    expect(exams[0].questions.filter((question) => question.choiceGroup === 'P1-C')).toHaveLength(2)
    expect(exams[0].questions.filter((question) => question.choiceGroup === 'P1-D')).toHaveLength(2)
    expect(paper1RequiredMarks + paper1ChoiceMarks).toBe(100)
    expect(exams[1].questions.every((question) => question.stimulus?.title)).toBe(true)
    expect(new Set(exams[1].questions.map((question) => question.stimulus?.title)).size).toBe(3)
    expect(new Set(exams[2].questions.map((question) => question.stimulus?.title)).size).toBe(1)
    expect(exams[1].questions[0].stimulus?.narrative).toBe(sourcePapers[1].shared_contexts[0].narrative)
    expect(exams[2].questions[0].stimulus?.table).toEqual(sourcePapers[2].shared_contexts[0].table)
  })

  it('keeps the restricted-pilot learner claim and does not introduce official-AQA claims', () => {
    for (const exam of exams) {
      expect(exam.learnerClaim).toBe("A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.")
      expect(exam.subtitle).toBe(exam.learnerClaim)
      expect(exam.restrictedPilot).toBe(true)
    }
  })
})
