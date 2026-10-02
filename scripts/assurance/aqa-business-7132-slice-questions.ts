// AQA 7132 slice production, step 5c: original exam-style questions with mark schemes for one batch (first slice: section 3.5; other batches use plans from aqa-business-7132-question-plan.ts), under the fast-path rules (ADR-0029).
// The plan (what each question must test, how many marks, which command word) is fixed in software so coverage is guaranteed; the AI only writes each question and mark scheme to its spec.
// Software then proves what it can (arithmetic, marks add up, mark scheme agrees with the calculation, numbers are in the stem). Each question is answered blind by a fresh reviewer call,
// then a fixed checklist is answered by one more call that sees the blind answer. Questions are "AQA-style practice", never AQA questions.
import { createHash } from 'node:crypto'
import { z } from 'zod'
import type { Checklist, ClassifiedFinding } from '../../src/content-factory/fast-path-review'
import { FORMULA_LIBRARY, checkCalculation, type Blueprint, type BlueprintItem } from './aqa-business-7132-slice-learn-practice'

export const QUESTIONS_CHECKLIST: Checklist = {
  stage: 'aqa-7132-slice-questions',
  version: 'slice-questions-v1',
  checks: [
    {
      id: 'question_validity',
      question: 'Does the question test its target items at its stated command-word level? Can it be answered correctly without the target knowledge? Does the question text give the answer away?',
    },
    {
      id: 'answer_reconstruction',
      question: 'Compare the blind answer (written by someone who saw only the question) with the mark scheme. Would the blind answer earn the marks the mark scheme implies, and do any numbers or conclusions disagree? A disagreement that comes from the question or the mark scheme being unclear or wrong is a finding; a disagreement caused only by the blind answer making a mistake is not.',
    },
    {
      id: 'mark_scheme_quality',
      question: 'Is the mark scheme unambiguous: do the marking points or level descriptors credit what the question asks, accept valid alternative answers, and add up to the marks available?',
    },
    {
      id: 'exam_authenticity',
      question: 'Would this question sit naturally in a UK A-level Business paper for its family, marks and command word?',
    },
    {
      id: 'originality',
      question: 'Is the question original Revision-authored work, with no quoted or closely paraphrased awarding-body or past-paper text?',
    },
  ],
}

// ---- The plan: Revision-owned design, aligned to the five question families in Exam Truth ----

export type QuestionFamily = 'MCQ' | 'SHORT_ANSWER' | 'DATA_RESPONSE' | 'ESSAY'
export type QuestionSpec = {
  id: string
  family: QuestionFamily
  marks: number
  commandWord: string
  ao: Array<'AO1' | 'AO2' | 'AO3' | 'AO4'>
  // Named item suffixes (the part after "aqa-7132-3.5.x:") the question must test.
  itemSuffixes: string[]
  // Formulas the question must contain a calculation for (proved by software).
  formulaIds: string[]
  brief: string
}

export const QUESTION_PLAN: readonly QuestionSpec[] = [
  { id: 'q01', family: 'MCQ', marks: 1, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['gross-profit-margin'], formulaIds: ['gross_profit_margin'], brief: 'Multiple choice: a business reports gross profit and revenue; which option is its gross profit margin? Distractors are common slips (using cost of sales, forgetting to multiply by 100).' },
  { id: 'q02', family: 'MCQ', marks: 1, commandWord: 'Identify', ao: ['AO1'], itemSuffixes: ['internal-versus-external-finance'], formulaIds: [], brief: 'Multiple choice: which one of four named sources of finance is an internal source of finance for a business? Distractors are external sources.' },
  { id: 'q03', family: 'MCQ', marks: 1, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['contribution-per-unit'], formulaIds: ['contribution_per_unit'], brief: 'Multiple choice: selling price and variable cost per unit are given; which option is the contribution per unit?' },
  { id: 'q04', family: 'SHORT_ANSWER', marks: 4, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['gross-profit', 'operating-profit'], formulaIds: ['gross_profit', 'operating_profit'], brief: 'Short answer: from revenue, cost of sales and other operating expenses, calculate gross profit and then operating profit. Show working.' },
  { id: 'q05', family: 'SHORT_ANSWER', marks: 4, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['profit-for-the-year', 'profit-for-the-year-margin'], formulaIds: ['profit_for_the_year', 'profit_for_the_year_margin'], brief: 'Short answer: from operating profit, net finance costs, taxation and revenue, calculate profit for the year and then the profit for the year margin. Show working.' },
  { id: 'q06', family: 'SHORT_ANSWER', marks: 3, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['return-on-investment'], formulaIds: ['return_on_investment'], brief: 'Short answer: a business invests in new equipment; from the return from the investment and its cost, calculate the return on investment.' },
  { id: 'q07', family: 'SHORT_ANSWER', marks: 4, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['break-even-output', 'margin-of-safety'], formulaIds: ['break_even_output', 'margin_of_safety'], brief: 'Short answer: from fixed costs, selling price, variable cost per unit and actual output, calculate break-even output (provide contribution per unit in the stem or as a value to use) and the margin of safety.' },
  { id: 'q08', family: 'SHORT_ANSWER', marks: 3, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['variance-analysis'], formulaIds: ['variance'], brief: 'Short answer: for a cost or revenue line with a budgeted and an actual figure, calculate the variance and state whether it is favourable or adverse for profit.' },
  { id: 'q09', family: 'SHORT_ANSWER', marks: 3, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['total-contribution'], formulaIds: ['total_contribution'], brief: 'Short answer: contribution per unit and units sold are given; calculate total contribution.' },
  { id: 'q10', family: 'SHORT_ANSWER', marks: 4, commandWord: 'Explain', ao: ['AO1', 'AO3'], itemSuffixes: ['cash-flow-versus-profit', 'timing-of-payables-and-receivables'], formulaIds: [], brief: 'Short answer: explain why a business can be profitable and still run short of cash, using the timing of receipts from customers and payments to suppliers.' },
  { id: 'q11', family: 'DATA_RESPONSE', marks: 4, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['operating-profit-margin'], formulaIds: ['operating_profit_margin'], brief: 'Data response part (a): a short income statement extract for two years is given as a table; calculate the operating profit margin for each year (two calculations).' },
  { id: 'q12', family: 'DATA_RESPONSE', marks: 6, commandWord: 'Analyse', ao: ['AO1', 'AO2', 'AO3'], itemSuffixes: ['advantages-disadvantages-and-choice-of-finance-source', 'loans', 'share-capital'], formulaIds: [], brief: 'Data response part (b): using the same business, analyse the advantages and disadvantages for it of financing an expansion with a bank loan rather than selling shares. Mark scheme is level-based.' },
  { id: 'q13', family: 'DATA_RESPONSE', marks: 9, commandWord: 'Evaluate', ao: ['AO1', 'AO2', 'AO3', 'AO4'], itemSuffixes: ['ways-to-improve-cash-flow', 'difficulties-of-improving-cash-flow-and-profit'], formulaIds: [], brief: 'Data response part (c): using the same business, evaluate two ways it could improve its cash flow and the difficulties it might face, reaching a justified judgement. Mark scheme is level-based.' },
  { id: 'q14', family: 'ESSAY', marks: 25, commandWord: 'Evaluate', ao: ['AO1', 'AO2', 'AO3', 'AO4'], itemSuffixes: ['using-financial-data-for-decisions-and-planning', 'ways-to-improve-profit-and-profitability'], formulaIds: [], brief: 'Essay: a statement that a business should make decisions using financial data above all else; evaluate it, drawing on profit, cash flow, budgets and break-even analysis. Mark scheme is level-based with indicative content. Use a new business context.' },
] as const

export function confidenceLabel(spec: QuestionSpec): 'Proven' | 'Reviewed' | 'Limited' {
  if (spec.family === 'ESSAY') return 'Limited'
  if (spec.formulaIds.length > 0 || spec.family === 'MCQ') return 'Proven'
  return 'Reviewed'
}

// ---- Output shape (strict-output friendly: every field required, no maps) ----

const calcSchema = z.object({
  label: z.string().min(1),
  formula_id: z.enum(FORMULA_LIBRARY.map((formula) => formula.id) as [string, ...string[]]),
  inputs: z.array(z.object({ name: z.string().min(1), value: z.number() })).min(1),
  stated_answer: z.number(),
  unit: z.string().min(1),
})

export const questionSchema = z.object({
  id: z.string().min(1),
  family: z.enum(['MCQ', 'SHORT_ANSWER', 'DATA_RESPONSE', 'ESSAY']),
  command_word: z.string().min(1),
  marks: z.number().int().min(1),
  ao_tags: z.array(z.enum(['AO1', 'AO2', 'AO3', 'AO4'])).min(1),
  context: z.string(),
  stem: z.string().min(1),
  table: z.object({
    title: z.string(),
    columns: z.array(z.string()),
    rows: z.array(z.object({ cells: z.array(z.string()) })),
  }).nullable(),
  options: z.array(z.object({ label: z.string().min(1), text: z.string().min(1) })),
  mark_scheme: z.object({
    type: z.enum(['single_option', 'points', 'levels']),
    correct_option: z.string(),
    option_rationale: z.array(z.string()),
    points: z.array(z.object({ marks: z.number().int().min(1), descriptor: z.string().min(1), accept: z.array(z.string()) })),
    levels: z.array(z.object({ level: z.number().int().min(1), min_marks: z.number().int().min(1), max_marks: z.number().int().min(1), descriptor: z.string().min(1) })),
    indicative_content: z.array(z.string()),
    model_answer: z.string().min(1),
  }),
  calcs: z.array(calcSchema),
})
export type Question = z.infer<typeof questionSchema>

export const blindAnswerSchema = z.object({
  question_id: z.string().min(1),
  answer_text: z.string().min(1),
  numbers: z.array(z.object({ label: z.string().min(1), value: z.number() })),
})
export type BlindAnswer = z.infer<typeof blindAnswerSchema>

// ---- Software checks ----

function softwareFinding(checkId: string, affected: string[], finding: string, fix: string, category: ClassifiedFinding['category'] = 'broken_question'): ClassifiedFinding {
  return { check_id: checkId, category, affected_ids: affected.length ? affected : ['question'], finding, evidence: 'software check', contradicting_source_id: null, proposed_fix: fix, disposition: 'blocking', reason: `software-proven: ${finding}` }
}

const magnitudeMultiplier = {
  thousand: 1_000,
  million: 1_000_000,
  billion: 1_000_000_000,
} as const

// Every number written in the text, as a value. Commas, currency and percent signs are ignored;
// explicit magnitude words are normalised so £61.20 million is returned as 61,200,000.
// A minus sign before a currency symbol is preserved, so -£60,000 is parsed as -60,000 rather than +60,000.
export function numbersIn(text: string): number[] {
  return [...text.matchAll(/([\-−]?)\s*[£$€]?\s*(\d[\d,]*(?:\.\d+)?)(?:\s*(thousand|million|billion)\b)?/gi)]
    .map((match) => {
      const sign = match[1] ? -1 : 1
      const base = sign * Number(match[2].replace(/,/g, ''))
      const magnitude = match[3]?.toLowerCase() as keyof typeof magnitudeMultiplier | undefined
      return base * (magnitude ? magnitudeMultiplier[magnitude] : 1)
    })
    .filter((value) => Number.isFinite(value))
}

// Calculation inputs may intentionally use the same displayed magnitude unit. Keep numbersIn() canonical,
// but accept both the fully normalised and same-unit shorthand representations when proving input presence.
function inputNumbersIn(text: string): number[] {
  const shorthand = [...text.matchAll(/([\-−]?)\s*[£$€]?\s*(\d[\d,]*(?:\.\d+)?)\s*(thousand|million|billion)\b/gi)]
    .map((match) => (match[1] ? -1 : 1) * Number(match[2].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value))
  return [...numbersIn(text), ...shorthand]
}

function questionText(question: Question) {
  return [question.context, question.stem, ...(question.table ? [question.table.title, ...question.table.columns, ...question.table.rows.flatMap((row) => row.cells)] : []), ...question.options.map((option) => option.text)].join(' ')
}

function markSchemeText(question: Question) {
  const scheme = question.mark_scheme
  return [scheme.model_answer, ...scheme.points.flatMap((point) => [point.descriptor, ...point.accept]), ...scheme.levels.map((level) => level.descriptor), ...scheme.indicative_content, ...scheme.option_rationale].join(' ')
}

const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.051, Math.abs(b) * 0.001)

export function validateQuestion(question: Question, spec: QuestionSpec): ClassifiedFinding[] {
  const findings: ClassifiedFinding[] = []
  const id = spec.id
  if (question.id !== spec.id) findings.push(softwareFinding('plan_identity', [id], `question id is ${question.id}, expected ${spec.id}`, 'Use the planned id.'))
  if (question.family !== spec.family) findings.push(softwareFinding('plan_family', [id], `family is ${question.family}, expected ${spec.family}`, 'Use the planned family.'))
  if (question.marks !== spec.marks) findings.push(softwareFinding('plan_marks', [id], `marks are ${question.marks}, expected ${spec.marks}`, 'Use the planned marks.'))
  if (question.command_word.trim().toLowerCase() !== spec.commandWord.toLowerCase()) findings.push(softwareFinding('plan_command_word', [id], `command word is ${question.command_word}, expected ${spec.commandWord}`, 'Use the planned command word.'))
  if (JSON.stringify([...question.ao_tags].sort()) !== JSON.stringify([...spec.ao].sort())) findings.push(softwareFinding('plan_assessment_objectives', [id], `AO tags ${question.ao_tags.join(',')} differ from plan ${spec.ao.join(',')}`, 'Use the planned AO tags.'))

  const scheme = question.mark_scheme
  if (spec.family === 'MCQ') {
    const labels = question.options.map((option) => option.label)
    if (JSON.stringify(labels) !== JSON.stringify(['A', 'B', 'C', 'D'])) findings.push(softwareFinding('mcq_options', [id], `options must be labelled A, B, C, D (got ${labels.join(',') || 'none'})`, 'Give exactly four options A to D.'))
    if (scheme.type !== 'single_option' || !labels.includes(scheme.correct_option)) findings.push(softwareFinding('mcq_key', [id], 'multiple choice needs a single_option mark scheme with a correct option from the options', 'Set type single_option and a correct_option that is one of the labels.'))
    if (scheme.option_rationale.length !== 4) findings.push(softwareFinding('mcq_rationale', [id], 'give one rationale per option (4)', 'Add a rationale for each option, including why each distractor is wrong.'))
  } else {
    if (question.options.length > 0) findings.push(softwareFinding('options_not_allowed', [id], 'only multiple-choice questions have options', 'Leave options empty.'))
    if (spec.marks >= 6) {
      if (scheme.type !== 'levels') findings.push(softwareFinding('levels_required', [id], `a ${spec.marks}-mark question needs a levels mark scheme`, 'Use a levels mark scheme with indicative content.'))
      else {
        const levels = [...scheme.levels].sort((a, b) => a.min_marks - b.min_marks)
        let expected = 1
        let contiguous = levels.length >= 3
        for (const level of levels) {
          if (level.min_marks !== expected || level.max_marks < level.min_marks) contiguous = false
          expected = level.max_marks + 1
        }
        if (!contiguous || expected - 1 !== spec.marks) findings.push(softwareFinding('levels_cover_marks', [id], `levels must be at least 3 bands covering 1 to ${spec.marks} with no gaps or overlaps`, `Cover marks 1 to ${spec.marks} exactly.`))
        if (scheme.indicative_content.length < 3) findings.push(softwareFinding('indicative_content', [id], 'give at least 3 points of indicative content', 'Add indicative content points.'))
      }
    } else {
      if (scheme.type !== 'points') findings.push(softwareFinding('points_required', [id], `a ${spec.marks}-mark question needs a points mark scheme`, 'Use a points mark scheme.'))
      else if (scheme.points.reduce((sum, point) => sum + point.marks, 0) !== spec.marks) findings.push(softwareFinding('points_sum', [id], `marking points add up to ${scheme.points.reduce((sum, point) => sum + point.marks, 0)}, not ${spec.marks}`, `Make the marking points add up to ${spec.marks}.`))
    }
  }

  // Calculations: recompute, cover every planned formula, and prove the question and mark scheme agree with them.
  const calcFormulas = question.calcs.map((calc) => calc.formula_id)
  for (const formulaId of spec.formulaIds.filter((formula) => !calcFormulas.includes(formula))) findings.push(softwareFinding('plan_formula_missing', [id], `no calculation for planned formula ${formulaId}`, `Add a calculation using ${formulaId}.`))
  for (const calc of question.calcs.filter((c) => !spec.formulaIds.includes(c.formula_id))) findings.push(softwareFinding('plan_formula_unexpected', [id], `calculation uses ${calc.formula_id}, which this question does not test`, 'Only calculate the planned formulas.'))
  const stemNumbers = inputNumbersIn(questionText(question))
  const schemeNumbers = numbersIn(markSchemeText(question))
  for (const calc of question.calcs) {
    const problem = checkCalculation(calc)
    if (problem) findings.push(softwareFinding('calculation_recomputes', [id], `${calc.label}: ${problem}`, 'Correct the numbers so the stated answer recomputes.'))
    // Every input must be given in the question (or be the answer to an earlier calculation in it), or the question is unanswerable.
    const earlierAnswers = question.calcs.filter((other) => other !== calc).map((other) => other.stated_answer)
    for (const input of calc.inputs) {
      if (![...stemNumbers, ...earlierAnswers].some((value) => near(value, input.value))) findings.push(softwareFinding('input_in_question', [id], `${calc.label}: input ${input.name} = ${input.value} does not appear in the question`, 'Give every input value in the question text or table (or derive it from an earlier part).'))
    }
    if (!schemeNumbers.some((value) => near(value, calc.stated_answer))) findings.push(softwareFinding('mark_scheme_answer', [id], `${calc.label}: the mark scheme never states the answer ${calc.stated_answer}`, 'State the correct answer in the mark scheme.'))
  }
  if (spec.family === 'MCQ' && question.calcs.length > 0 && scheme.correct_option) {
    const key = question.options.find((option) => option.label === scheme.correct_option)
    if (key && !numbersIn(key.text).some((value) => near(value, question.calcs[0].stated_answer))) findings.push(softwareFinding('mcq_key_matches_calculation', [id], `option ${scheme.correct_option} does not show the calculated answer ${question.calcs[0].stated_answer}`, 'Make the correct option show the calculated answer.'))
    const matching = question.options.filter((option) => numbersIn(option.text).some((value) => near(value, question.calcs[0].stated_answer)))
    if (matching.length > 1) findings.push(softwareFinding('mcq_single_key', [id], 'more than one option shows the calculated answer', 'Make exactly one option correct.'))
  }
  return findings
}

// ---- Units, instructions and generation loop ----

export type QuestionTeaching = { subject_id: string; title?: string | null; teaching_content: unknown; quantitative_content: unknown; source_ids: string[] }
export type ResolvedSpec = QuestionSpec & { items: BlueprintItem[]; nodeIds: string[] }

// The plan is the hand-written 3.5 plan by default; other batches pass their committed plan (built by aqa-business-7132-question-plan.ts).
export function resolvePlan(blueprint: Blueprint, plan: readonly QuestionSpec[] = QUESTION_PLAN): ResolvedSpec[] {
  return plan.map((spec) => {
    const items = spec.itemSuffixes.map((suffix) => {
      const item = blueprint.items.find((candidate) => candidate.id.endsWith(`:${suffix}`))
      if (!item) throw new Error(`question_plan_item_missing:${spec.id}:${suffix}`)
      return item
    })
    const nodeIds = [...new Set(items.flatMap((item) => item.taughtBy))].sort()
    return { ...spec, items, nodeIds }
  })
}

export function generationPayload(input: { spec: ResolvedSpec; teaching: QuestionTeaching[]; feedback: ClassifiedFinding[] }) {
  return {
    plan: { id: input.spec.id, family: input.spec.family, marks: input.spec.marks, command_word: input.spec.commandWord, ao_tags: input.spec.ao, brief: input.spec.brief, formula_ids: input.spec.formulaIds },
    target_items: input.spec.items.map((item) => ({ id: item.id, label: item.label, kind: item.kind, aqa_convention: item.aqaConvention ?? null })),
    node_teaching: input.teaching.map((node) => ({ id: `foundation-node:${node.subject_id}`, title: node.title ?? node.subject_id, teaching_content: node.teaching_content, quantitative_content: node.quantitative_content })),
    formula_library: FORMULA_LIBRARY.filter((formula) => input.spec.formulaIds.includes(formula.id)).map(({ id, label, inputs, series, unit, expression }) => ({ id, label, inputs, series_inputs: series ?? [], unit, expression })),
    fix_these: input.feedback.map((finding) => ({ check_id: finding.check_id, affected_ids: finding.affected_ids, finding: finding.finding, proposed_fix: finding.proposed_fix })),
  }
}

export type GenerateCall = (payload: Record<string, unknown>, attempt: number) => Promise<{ ok: true; output: unknown } | { ok: false; error: string }>

export async function produceQuestion(input: { spec: ResolvedSpec; teaching: QuestionTeaching[]; generate: GenerateCall; feedback?: ClassifiedFinding[]; maxAttempts?: number }): Promise<{ output: Question | null; attempts: number; error?: string }> {
  const maxAttempts = input.maxAttempts ?? 3
  let feedback = input.feedback ?? []
  let last: Question | null = null
  let lastError = 'no attempt made'
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await input.generate(generationPayload({ spec: input.spec, teaching: input.teaching, feedback }), attempt).catch((error: unknown) => ({ ok: false as const, error: error instanceof Error ? error.message : String(error) }))
    if (!result.ok) { lastError = result.error; continue }
    const parsed = questionSchema.safeParse(result.output)
    if (!parsed.success) { lastError = `invalid output: ${parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`; continue }
    last = parsed.data
    const problems = validateQuestion(parsed.data, input.spec)
    if (problems.length === 0) return { output: parsed.data, attempts: attempt }
    feedback = [...(input.feedback ?? []), ...problems]
  }
  return last ? { output: last, attempts: maxAttempts } : { output: null, attempts: maxAttempts, error: lastError }
}

// What the blind answerer sees: the question only. No mark scheme, no teaching, no plan.
export function blindPayload(question: Question) {
  return {
    question_id: question.id,
    family: question.family,
    command_word: question.command_word,
    marks: question.marks,
    context: question.context,
    stem: question.stem,
    table: question.table,
    options: question.options,
  }
}

export type QuestionUnit = { unit_id: string; fingerprint: string; softwareFindings: ClassifiedFinding[]; payload: Record<string, unknown>; sourceIds: Set<string> }

// Software comparison of the blind answer's numbers with the question's own calculations. Shown to the reviewer; the reviewer decides if a difference is the question's fault.
export function numericComparison(question: Question, blind: BlindAnswer) {
  return question.calcs.map((calc) => {
    const answered = blind.numbers.find((entry) => near(entry.value, calc.stated_answer))
    return { label: calc.label, stated_answer: calc.stated_answer, blind_answer_matches: Boolean(answered), blind_numbers: blind.numbers.map((entry) => `${entry.label}=${entry.value}`) }
  })
}

export function buildQuestionUnit(input: { spec: ResolvedSpec; question: Question; blind: BlindAnswer; teaching: QuestionTeaching[] }): QuestionUnit {
  const softwareFindings = validateQuestion(input.question, input.spec)
  const payload = {
    unit_id: input.spec.id,
    sources: input.teaching.map((node) => ({ id: `foundation-node:${node.subject_id}`, text: { teaching_content: node.teaching_content, quantitative_content: node.quantitative_content } })),
    plan: { family: input.spec.family, marks: input.spec.marks, command_word: input.spec.commandWord, ao_tags: input.spec.ao, target_items: input.spec.items.map((item) => ({ id: item.id, label: item.label })) },
    question: input.question,
    blind_answer: input.blind,
    numeric_comparison: numericComparison(input.question, input.blind),
  }
  return {
    unit_id: input.spec.id,
    fingerprint: createHash('sha256').update(JSON.stringify({ payload, checklist: QUESTIONS_CHECKLIST.version })).digest('hex'),
    softwareFindings,
    payload,
    sourceIds: new Set(input.teaching.flatMap((node) => [`foundation-node:${node.subject_id}`, ...node.source_ids])),
  }
}

export const QUESTION_GENERATION_INSTRUCTIONS = [
  'You write one original exam-style question with its mark scheme for UK A-level Business, for students aged 16 to 18, to the plan supplied.',
  'Use ONLY the node teaching supplied as your subject knowledge. British English, UK business contexts, £. Invent a realistic business and realistic numbers.',
  'The question must be Revision-authored. Never quote or closely paraphrase AQA specification wording, mark schemes or past-paper questions. It is "AQA-style practice", never an AQA question.',
  'Follow the plan exactly: the id, family, marks, command_word and ao_tags must match, and the question must test the target items.',
  'Put every number a student needs in the stem or table. Never rely on a number that is not given (except one a student calculates in an earlier part of the same question).',
  'For every planned formula give one entry in calcs: formula_id, inputs using EXACTLY the input names in formula_library, stated_answer (rounded to at most 2 decimal places) and unit. The software recomputes every calculation and rejects any mismatch, and it checks that the mark scheme states each answer.',
  'MCQ: exactly four options labelled A, B, C, D; mark_scheme.type single_option; correct_option; one rationale per option, saying why each distractor is wrong; exactly one correct option; options is empty for every other family.',
  'Points mark scheme (marks under 6): marking points that add up to the marks, each saying what earns the mark and what alternative answers are accepted; calculation questions give method and answer marks and show the correct working in model_answer.',
  'Levels mark scheme (6 marks or more): at least three levels covering 1 to the full marks with no gaps or overlaps, each descriptor saying what the response must show, plus at least three points of indicative content (these are examples, not a checklist) and a model_answer.',
  'Extended questions must supply the business context and data a student needs to apply knowledge, and ask for analysis or evaluation in line with the command word.',
  'Data-response parts that need a table give it in table; otherwise table is null. Use context for the business background.',
  'If fix_these is not empty, this is a later attempt: correct exactly those problems and keep everything else.',
].join('\n')

export const BLIND_ANSWER_INSTRUCTIONS = [
  'You are a capable A-level Business student sitting this question. Answer it as you would in the exam, within the marks available.',
  'Show working for calculations and give every number you calculate in numbers (label and value).',
  'For multiple choice, answer with the option letter and a one-line reason.',
].join('\n')

export const QUESTION_REVIEW_INSTRUCTIONS = [
  'You review one generated exam-style question and its mark scheme against the node teaching supplied as a source.',
  'The software has already proven the arithmetic, that every input is given in the question, that marks add up and that the mark scheme states the calculated answers, so do not recompute them.',
  'A blind answer written by someone who saw only the question is supplied. Judge only the checklist questions below, for the unit supplied.',
].join('\n')

// ---- Whole-set checks (software) ----

export function setChecks(questions: readonly Question[], plan: readonly QuestionSpec[]) {
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
  const quantitativeMarks = questions.filter((q) => q.calcs.length > 0).reduce((sum, q) => sum + q.marks, 0)
  const coveredFormulas = new Set(questions.flatMap((q) => q.calcs.map((c) => c.formula_id)))
  const plannedFormulas = new Set(plan.flatMap((s) => s.formulaIds))
  const byFamily: Record<string, number> = {}
  for (const q of questions) byFamily[q.family] = (byFamily[q.family] ?? 0) + 1
  const aoMarks: Record<string, number> = {}
  for (const q of questions) for (const ao of q.ao_tags) aoMarks[ao] = (aoMarks[ao] ?? 0) + q.marks
  return {
    questions: questions.length,
    totalMarks,
    quantitativeMarks,
    quantitativePercent: totalMarks ? Number(((quantitativeMarks / totalMarks) * 100).toFixed(1)) : 0,
    // Exam Truth: quantitative skills are at least 10% of the qualification's marks; a practice set should not fall below that.
    quantitativeShareOk: totalMarks > 0 && quantitativeMarks / totalMarks >= 0.1,
    missingFormulas: [...plannedFormulas].filter((id) => !coveredFormulas.has(id)).sort(),
    byFamily,
    aoMarksTagged: aoMarks,
  }
}
