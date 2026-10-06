import type { Exam } from '../../content/schema'
import paper1Raw from '../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-1.json?raw'
import paper2Raw from '../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-2.json?raw'
import paper3Raw from '../../content-factory/runs/aqa-7132-mock-v1/artifact/papers/7132-3.json?raw'

type RetainedTable = {
  title: string
  columns: string[]
  rows: Array<{ cells: string[] }>
}

type RetainedContext = {
  unit_id: string
  title: string
  business_name: string
  narrative: string
  table: RetainedTable | null
}

type RetainedMarkScheme = {
  type: string
  correct_option: string
  option_rationale: string[]
  points: string[]
  levels: Array<{ level: number; min_marks: number; max_marks: number; descriptor: string }>
  indicative_content: string[]
  model_answer: string
}

type RetainedQuestionRecord = {
  target_requirement_ids: string[]
  target_subject_node_ids: string[]
  choice_group: string | null
  required_in_response_path: boolean
  question: {
    slot_id: string
    family: string
    marks: number
    ao_marks: { AO1: number; AO2: number; AO3: number; AO4: number }
    context: string
    stem: string
    table: RetainedTable | null
    options: Array<{ label: string; text: string }>
    mark_scheme: RetainedMarkScheme
  }
}

type RetainedPaper = {
  component_id: '7132/1' | '7132/2' | '7132/3'
  name: string
  duration_minutes: number
  attempted_raw_marks: number
  printed_raw_marks: number
  learner_claim: string
  shared_contexts: RetainedContext[]
  questions: RetainedQuestionRecord[]
}

export type RetainedMockStimulus = {
  title: string | null
  narrative: string
  table: RetainedTable | null
}

export type RetainedMockQuestion = Exam['questions'][number] & {
  sourceSlotId: string
  family: string
  choiceGroup: string | null
  requiredInResponsePath: boolean
  responseType: 'multiple-choice' | 'written'
  options: Array<{ label: string; text: string }>
  stimulus: RetainedMockStimulus | null
}

export type RetainedMockExam = Omit<Exam, 'questions'> & {
  questions: RetainedMockQuestion[]
  learnerClaim: string
  printedMarks: number
  retainedComponentId: string
  retainedPaperFingerprint: string
  restrictedPilot: true
}

const paperFingerprints: Record<RetainedPaper['component_id'], string> = {
  '7132/1': '799872e7575cffd782405af591c74eb3e44e11ae259c0bea0dc0960764d81fc0',
  '7132/2': 'fd49c211bcddbd0ab652b0068499ba0b23dcc2863ec2afe0ceec20053267e3f4',
  '7132/3': '9487ab31521272f9e0149bec8a543e5a75f0fd2e314769988f2029563996f4bd',
}

const papers = [paper1Raw, paper2Raw, paper3Raw].map((raw) => JSON.parse(raw) as RetainedPaper)

function topicFor(nodes: string[]): string {
  const joined = nodes.join(' ')
  if (/BUS-MKT/.test(joined)) return 'marketing'
  if (/BUS-FIN/.test(joined)) return 'finance'
  if (/BUS-OPS/.test(joined)) return 'operations'
  if (/BUS-PEO|BUS-HR/.test(joined)) return 'hr'
  if (/BUS-MOD/.test(joined)) return 'strategic-change'
  if (/BUS-STR/.test(joined)) return 'strategic-position'
  return 'business'
}

function sharedContextFor(paper: RetainedPaper, slotId: string): RetainedContext | null {
  if (paper.component_id === '7132/3') return paper.shared_contexts[0] ?? null
  const match = slotId.match(/^P2-S([123])-/)
  if (!match) return null
  return paper.shared_contexts.find((context) => context.unit_id === `P2-SET-${match[1]}`) ?? null
}

function markingGuidance(markScheme: RetainedMarkScheme): string[] {
  if (markScheme.type === 'single_option') {
    return markScheme.option_rationale
  }
  const levelGuidance = markScheme.levels.map(
    (level) => `Level ${level.level} (${level.min_marks}–${level.max_marks}): ${level.descriptor}`,
  )
  return [...markScheme.points, ...levelGuidance, ...markScheme.indicative_content]
}

function projectPaper(paper: RetainedPaper): RetainedMockExam {
  const number = Number(paper.component_id.split('/')[1])
  return {
    id: `aqa-7132-mock-v1-paper-${number}`,
    title: `AQA A-level Business 7132 · Paper ${number}: ${paper.name}`,
    subtitle: paper.learner_claim,
    durationMinutes: paper.duration_minutes,
    totalMarks: paper.attempted_raw_marks,
    caseHtml: '',
    learnerClaim: paper.learner_claim,
    printedMarks: paper.printed_raw_marks,
    retainedComponentId: paper.component_id,
    retainedPaperFingerprint: paperFingerprints[paper.component_id],
    restrictedPilot: true,
    questions: paper.questions.map((record) => {
      const source = record.question
      const shared = sharedContextFor(paper, source.slot_id)
      const localNarrative = source.context
      const stimulus = shared
        ? { title: shared.title, narrative: shared.narrative, table: shared.table }
        : localNarrative || source.table
          ? { title: null, narrative: localNarrative, table: source.table }
          : null
      return {
        id: source.slot_id.toLowerCase(),
        sourceSlotId: source.slot_id,
        marks: source.marks,
        topic: topicFor(record.target_subject_node_ids),
        assessmentObjectives: {
          ao1: source.ao_marks.AO1,
          ao2: source.ao_marks.AO2,
          ao3: source.ao_marks.AO3,
          ao4: source.ao_marks.AO4,
        },
        prompt: source.stem,
        markingGuidance: markingGuidance(source.mark_scheme),
        family: source.family,
        choiceGroup: record.choice_group,
        requiredInResponsePath: record.required_in_response_path,
        responseType: source.family === 'MCQ' ? 'multiple-choice' : 'written',
        options: source.options,
        stimulus,
      }
    }),
  }
}

const retainedMockExams = papers.map(projectPaper)

export function retainedAqa7132MockExamForPaper(paperNumber: number): RetainedMockExam | null {
  return retainedMockExams.find((exam) => exam.retainedComponentId === `7132/${paperNumber}`) ?? null
}

export function listRetainedAqa7132MockExams(): readonly RetainedMockExam[] {
  return retainedMockExams
}
