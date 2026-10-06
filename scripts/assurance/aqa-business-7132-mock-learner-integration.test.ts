import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { retainedAqa7132MockV1 } from '../../content/business/aqa-a-level/shared/retained-mock'

const repoRoot = process.cwd()
const runRoot = resolve(repoRoot, 'content-factory/runs/aqa-7132-mock-v1')
const paperPaths = ['7132-1.json', '7132-2.json', '7132-3.json'].map((name) =>
  resolve(runRoot, 'artifact', 'papers', name),
)

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
  )
}

function fingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

describe('AQA 7132 retained mock learner projection', () => {
  const rawPapers = paperPaths.map(readJson)
  const assurance = readJson(resolve(runRoot, 'ASSURANCE_RECORD.json'))

  it('projects the exact three assured paper fingerprints without creating another content copy', () => {
    expect(rawPapers.map((paper) => fingerprint(paper))).toEqual([
      assurance.exact_paper_fingerprints['7132/1'],
      assurance.exact_paper_fingerprints['7132/2'],
      assurance.exact_paper_fingerprints['7132/3'],
    ])
    expect(retainedAqa7132MockV1).toHaveLength(3)
  })

  it('represents every retained slot exactly once with unchanged learner-visible question data', () => {
    const projected = retainedAqa7132MockV1.flatMap((exam) => exam.questions)
    const raw = rawPapers.flatMap((paper) => paper.questions.map((entry: any) => entry.question))
    expect(projected).toHaveLength(41)
    expect(new Set(projected.map((question) => question.sourceSlotId)).size).toBe(41)
    expect(projected.map((question) => question.sourceSlotId)).toEqual(raw.map((question: any) => question.slot_id))

    projected.forEach((question, index) => {
      const source = raw[index]
      expect(question.prompt).toBe(source.stem)
      expect(question.marks).toBe(source.marks)
      expect(question.family).toBe(source.family)
      expect(question.context).toBe(source.context)
      expect(question.table ?? null).toEqual(source.table)
      expect(question.options ?? []).toEqual(source.options)
      expect(question.assessmentObjectives).toEqual({
        ao1: source.ao_marks.AO1,
        ao2: source.ao_marks.AO2,
        ao3: source.ao_marks.AO3,
        ao4: source.ao_marks.AO4,
      })
    })
  })

  it('preserves timing, printed/attempted marks and Paper 1 choice behaviour', () => {
    expect(retainedAqa7132MockV1.map((exam) => exam.durationMinutes)).toEqual([120, 120, 120])
    expect(retainedAqa7132MockV1.map((exam) => exam.totalMarks)).toEqual([100, 100, 100])
    expect(retainedAqa7132MockV1.map((exam) => exam.printedMarks)).toEqual([150, 100, 100])

    const paper1 = retainedAqa7132MockV1[0]
    const groups = new Map<string, typeof paper1.questions>()
    for (const question of paper1.questions) {
      if (!question.choiceGroup) continue
      groups.set(question.choiceGroup, [...(groups.get(question.choiceGroup) ?? []), question])
    }
    expect([...groups.keys()]).toEqual(['P1-C', 'P1-D'])
    expect([...groups.values()].map((questions) => questions.length)).toEqual([2, 2])
    expect([...groups.values()].every((questions) => questions.every((question) => question.marks === 25))).toBe(true)

    const compulsory = paper1.questions
      .filter((question) => !question.choiceGroup)
      .reduce((sum, question) => sum + question.marks, 0)
    const oneFromEachChoice = [...groups.values()].reduce((sum, questions) => sum + (questions[0]?.marks ?? 0), 0)
    expect(compulsory).toBe(50)
    expect(compulsory + oneFromEachChoice).toBe(100)
    expect(paper1.questions.reduce((sum, question) => sum + question.marks, 0)).toBe(150)
  })

  it('links Papers 2 and 3 to the retained shared contexts without duplication', () => {
    const paper2 = retainedAqa7132MockV1[1]
    const paper3 = retainedAqa7132MockV1[2]
    expect(paper2.sources?.map((source) => source.id)).toEqual(['p2-set-1', 'p2-set-2', 'p2-set-3'])
    expect(paper3.sources?.map((source) => source.id)).toEqual(['p3-case-1'])
    expect(paper2.questions.map((question) => question.sourceIds?.[0])).toEqual([
      'p2-set-1', 'p2-set-1', 'p2-set-1', 'p2-set-1',
      'p2-set-2', 'p2-set-2', 'p2-set-2',
      'p2-set-3', 'p2-set-3', 'p2-set-3',
    ])
    expect(paper3.questions.every((question) => question.sourceIds?.[0] === 'p3-case-1')).toBe(true)
  })

  it('keeps the restricted-pilot learner claim and marking boundary intact', () => {
    const claim = "A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper."
    expect(retainedAqa7132MockV1.every((exam) => exam.learnerClaim === claim)).toBe(true)
    expect(assurance.qualified_human_subject_review.status).toBe('pending')
    expect(assurance.publication.assisted_marking_eligibility_changed).toBe(false)
  })
})
