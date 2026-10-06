import { examSchema, type Exam } from '../../../schema'
import paper1Source from '../../../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-1.json'
import paper2Source from '../../../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-2.json'
import paper3Source from '../../../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-3.json'

type RawTable = {
  title: string
  columns: string[]
  rows: Array<{ cells: string[] }>
}

type RawMarkScheme = {
  type: 'single_option' | 'points' | 'levels'
  correct_option: string
  option_rationale: string[]
  points: Array<{ marks: number; descriptor: string; accept: string[] }>
  levels: Array<{ level: number; min_marks: number; max_marks: number; descriptor: string }>
  indicative_content: string[]
  model_answer: string
}

type RawQuestion = {
  slot_id: string
  family: 'MCQ' | 'SHORT_ANSWER' | 'ESSAY' | 'DATA_RESPONSE' | 'CASE_STUDY'
  marks: number
  ao_marks: { AO1: number; AO2: number; AO3: number; AO4: number }
  context: string
  stem: string
  table: RawTable | null
  options: Array<{ label: string; text: string }>
  mark_scheme: RawMarkScheme
}

type RawPaper = {
  component_id: '7132/1' | '7132/2' | '7132/3'
  name: string
  duration_minutes: number
  attempted_raw_marks: number
  printed_raw_marks: number
  learner_claim: string
  shared_contexts: Array<{
    unit_id: string
    title: string
    business_name: string
    narrative: string
    table: RawTable | null
  }>
  questions: Array<{
    target_requirement_ids: string[]
    choice_group: string | null
    required_in_response_path: boolean
    question: RawQuestion
  }>
}

const paper1 = paper1Source as RawPaper
const paper2 = paper2Source as RawPaper
const paper3 = paper3Source as RawPaper

const topicBySpecificationSection: Record<string, string> = {
  '3.1': 'business',
  '3.2': 'leadership',
  '3.3': 'marketing',
  '3.4': 'operations',
  '3.5': 'finance',
  '3.6': 'hr',
  '3.7': 'strategic-position',
  '3.8': 'strategic-direction',
  '3.9': 'strategic-methods',
  '3.10': 'strategic-change',
}

function runtimeId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function topicFor(requirementId: string) {
  const match = requirementId.match(/AQA-7132-(3\.\d+)/)
  const topic = match ? topicBySpecificationSection[match[1]] : undefined
  if (!topic) throw new Error(`Cannot map retained mock requirement to learner topic: ${requirementId}`)
  return topic
}

function sourceIdsFor(paper: RawPaper, slotId: string) {
  if (paper.component_id === '7132/2') {
    const set = slotId.match(/^P2-S([123])-/)?.[1]
    if (!set) throw new Error(`Cannot map Paper 2 slot to source set: ${slotId}`)
    return [runtimeId(`P2-SET-${set}`)]
  }
  if (paper.component_id === '7132/3') return [runtimeId('P3-CASE-1')]
  return []
}

function markingGuidance(markScheme: RawMarkScheme) {
  if (markScheme.type === 'single_option') {
    return [
      `Correct option: ${markScheme.correct_option}`,
      ...markScheme.option_rationale,
    ]
  }

  if (markScheme.type === 'points') {
    return markScheme.points.flatMap((point) => [
      point.descriptor,
      ...point.accept,
    ])
  }

  return [
    ...markScheme.levels.map((level) => `Level ${level.level} (${level.min_marks}–${level.max_marks}): ${level.descriptor}`),
    ...markScheme.indicative_content,
  ]
}

function projectPaper(raw: RawPaper, paperNumber: 1 | 2 | 3): Exam {
  const sources = raw.shared_contexts.map((source) => ({
    id: runtimeId(source.unit_id),
    title: source.title,
    businessName: source.business_name,
    narrative: source.narrative,
    table: source.table,
  }))

  return examSchema.parse({
    id: `aqa-a-level-7132-paper-${paperNumber}-retained-mock-v1`,
    title: `AQA A-level Business — Paper ${paperNumber} realistic practice paper`,
    subtitle: 'Revision-authored retained mock v1',
    durationMinutes: raw.duration_minutes,
    totalMarks: raw.attempted_raw_marks,
    printedMarks: raw.printed_raw_marks,
    learnerClaim: raw.learner_claim,
    caseHtml: `<p>${raw.learner_claim}</p>`,
    sources,
    questions: raw.questions.map((entry) => {
      const question = entry.question
      const requirementId = entry.target_requirement_ids[0]
      if (!requirementId) throw new Error(`Retained mock slot ${question.slot_id} has no target requirement`)
      return {
        id: `mock-v1-${runtimeId(question.slot_id)}`,
        sourceSlotId: question.slot_id,
        family: question.family,
        marks: question.marks,
        topic: topicFor(requirementId),
        assessmentObjectives: {
          ao1: question.ao_marks.AO1,
          ao2: question.ao_marks.AO2,
          ao3: question.ao_marks.AO3,
          ao4: question.ao_marks.AO4,
        },
        prompt: question.stem,
        context: question.context,
        table: question.table,
        options: question.options,
        sourceIds: sourceIdsFor(raw, question.slot_id),
        choiceGroup: entry.choice_group,
        requiredInResponsePath: entry.required_in_response_path,
        markingGuidance: markingGuidance(question.mark_scheme),
      }
    }),
  })
}

export const retainedMockPaper1Exam = projectPaper(paper1, 1)
export const retainedMockPaper2Exam = projectPaper(paper2, 2)
export const retainedMockPaper3Exam = projectPaper(paper3, 3)

export const retainedAqa7132MockV1 = [
  retainedMockPaper1Exam,
  retainedMockPaper2Exam,
  retainedMockPaper3Exam,
] as const
