// AQA 7132 slice production, step 5c: exam-style questions with mark schemes for one batch (3.5 by default) under the fast-path rules (ADR-0029).
// Always-on tests are software only. The live run (provider spend, capped) only runs when the proof flag is set, post-merge on main.
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { createOpenAIFoundationLiveProvider } from '../../src/content-factory/foundation-live-adapter'
import {
  checklistInstructions,
  escalationEntries,
  renderRunSummary,
  reviewOutputSchema,
  runReviewUnits,
  type ClassifiedFinding,
  type Ledger,
} from '../../src/content-factory/fast-path-review'
import { withSharedProviderBudget } from '../../src/content-factory/openai-shared-provider-budget'
import type { Blueprint } from './aqa-business-7132-slice-learn-practice'
import type { QuestionPlanFile } from './aqa-business-7132-question-plan'
import {
  BLIND_ANSWER_INSTRUCTIONS,
  QUESTIONS_CHECKLIST,
  QUESTION_GENERATION_INSTRUCTIONS,
  QUESTION_PLAN,
  QUESTION_REVIEW_INSTRUCTIONS,
  blindAnswerSchema,
  blindPayload,
  buildQuestionUnit,
  confidenceLabel,
  numbersIn,
  produceQuestion,
  questionSchema,
  resolvePlan,
  setChecks,
  validateQuestion,
  type BlindAnswer,
  type Question,
  type QuestionSpec,
  type QuestionTeaching,
  type QuestionUnit,
  type ResolvedSpec,
} from './aqa-business-7132-slice-questions'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_AQA_7132_SLICE_QUESTIONS === '1'
// The batch to run live (default: the first slice, 3.5). Batches are listed in content-factory/slices/aqa-7132-batches.json; their plans are built by software.
const BATCH = env.CONTENT_FACTORY_SLICE_BATCH?.trim() || '3.5'
const BLUEPRINT = 'content-factory/slices/aqa-7132-3.5/BLUEPRINT.json'
const BATCH_BLUEPRINT = `content-factory/slices/aqa-7132-${BATCH}/BLUEPRINT.json`
const OUTPUT = `.artifacts/content-factory-aqa-business-7132-slice-${BATCH}-questions`
const QUESTIONS_DIR = `content-factory/slices/aqa-7132-${BATCH}/questions`
const RUN_DIR = `content-factory/runs/aqa-7132-slice-${BATCH}-questions`
const RETAINED_BLIND_ANSWERS_DIR = `${RUN_DIR}/blind-answers`
const RESUME_CHECKPOINT = `${RUN_DIR}/resume-checkpoint.json`
// Committed between runs so unchanged questions are reused and review rounds are counted.
const LEDGER = `${RUN_DIR}/ledger.json`

type ResumeCheckpoint = {
  schema_version: 1
  source_run_id: number
  reviewed_commit: string
  batch: string
  summary: unknown
  ledger: Ledger
  accepted_units: Record<string, { question_record: { question: unknown }; blind_answer: unknown }>
  latest_units?: Record<string, { question: unknown; blind_answer: unknown }>
}

let resumeCheckpointPromise: Promise<ResumeCheckpoint | null> | null = null
async function readResumeCheckpoint(): Promise<ResumeCheckpoint | null> {
  if (!resumeCheckpointPromise) {
    resumeCheckpointPromise = readFile(RESUME_CHECKPOINT, 'utf8').then((text) => {
      const parsed = JSON.parse(text) as ResumeCheckpoint
      if (parsed.schema_version !== 1 || parsed.batch !== BATCH || parsed.ledger.stage !== QUESTIONS_CHECKLIST.stage || parsed.ledger.checklist_version !== QUESTIONS_CHECKLIST.version) return null
      return parsed
    }).catch(() => null)
  }
  return resumeCheckpointPromise
}

// Section 3.5 keeps its hand-written plan; every other batch uses its committed plan, which must be built from the current blueprint.
async function planFor(batch: string): Promise<readonly QuestionSpec[]> {
  if (batch === '3.5') return QUESTION_PLAN
  const file = JSON.parse(await readFile(`content-factory/slices/aqa-7132-${batch}/QUESTION_PLAN.json`, 'utf8')) as QuestionPlanFile
  const blueprint = JSON.parse(await readFile(`content-factory/slices/aqa-7132-${batch}/BLUEPRINT.json`, 'utf8')) as Blueprint
  if (file.blueprint_fingerprint !== blueprint.courseKnowledgeModelFingerprint) throw new Error(`question_plan_stale:${batch}`)
  return file.questions
}

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

function positiveNumberEnv(name: string, fallback: number) {
  const raw = env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid_positive_number_runtime_config:${name}`)
  return value
}

function model(maxOutputTokens: number, reasoningEffort: 'medium' | 'high') {
  return {
    model: env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra',
    inputUsdPerMillion: 2,
    cachedInputUsdPerMillion: 0.2,
    outputUsdPerMillion: 12,
    cacheWriteMultiplier: 1.25,
    longContextThresholdTokens: 272_000,
    longContextInputMultiplier: 2,
    longContextOutputMultiplier: 1.5,
    reasoningEffort,
    maxOutputTokens,
  }
}

async function readLedger(): Promise<Ledger> {
  try {
    return JSON.parse(await readFile(LEDGER, 'utf8')) as Ledger
  } catch {
    const checkpoint = await readResumeCheckpoint()
    if (checkpoint) return checkpoint.ledger
    return { schema_version: 1, stage: QUESTIONS_CHECKLIST.stage, checklist_version: QUESTIONS_CHECKLIST.version, units: {} }
  }
}

function retainedQuestionUnit(input: {
  spec: ResolvedSpec
  question: Question
  blind: BlindAnswer
  teaching: QuestionTeaching[]
  previous: Ledger['units'][string] | undefined
}) {
  if (!input.previous || !['passed', 'logged'].includes(input.previous.outcome)) return null
  if (input.blind.question_id !== input.spec.id || validateQuestion(input.question, input.spec).length > 0) return null
  const unit = buildQuestionUnit({ spec: input.spec, question: input.question, blind: input.blind, teaching: input.teaching })
  return unit.fingerprint === input.previous.fingerprint ? unit : null
}

function recoverableSoftwareBlockedQuestionUnit(input: {
  spec: ResolvedSpec
  question: Question
  blind: BlindAnswer
  teaching: QuestionTeaching[]
  previous: Ledger['units'][string] | undefined
}) {
  const previous = input.previous
  if (!previous || previous.outcome !== 'blocking' || previous.consecutive_blocking_rounds !== 0) return null
  if (previous.findings.length === 0 || previous.findings.some((finding) => finding.evidence !== 'software check')) return null
  if (input.blind.question_id !== input.spec.id || validateQuestion(input.question, input.spec).length > 0) return null
  const unit = buildQuestionUnit({ spec: input.spec, question: input.question, blind: input.blind, teaching: input.teaching })
  return unit.fingerprint === previous.fingerprint ? unit : null
}

async function readRetainedQuestionUnit(input: { spec: ResolvedSpec; teaching: QuestionTeaching[]; ledger: Ledger }): Promise<{ question: Question; blind: BlindAnswer; unit: QuestionUnit } | null> {
  const previous = input.ledger.units[input.spec.id]
  if (!previous || !['passed', 'logged'].includes(previous.outcome)) return null
  const accept = (questionValue: unknown, blindValue: unknown) => {
    const question = questionSchema.parse(questionValue)
    const blind = blindAnswerSchema.parse(blindValue)
    const unit = retainedQuestionUnit({ spec: input.spec, question, blind, teaching: input.teaching, previous })
    return unit ? { question, blind, unit } : null
  }
  try {
    const record = JSON.parse(await readFile(`${QUESTIONS_DIR}/${input.spec.id}.json`, 'utf8')) as { question: unknown }
    return accept(record.question, JSON.parse(await readFile(`${RETAINED_BLIND_ANSWERS_DIR}/${input.spec.id}.json`, 'utf8')))
  } catch {
    try {
      const saved = (await readResumeCheckpoint())?.accepted_units[input.spec.id]
      return saved ? accept(saved.question_record.question, saved.blind_answer) : null
    } catch {
      return null
    }
  }
}

async function readRecoverableSoftwareBlockedQuestionUnit(input: { spec: ResolvedSpec; teaching: QuestionTeaching[]; ledger: Ledger }): Promise<{ question: Question; blind: BlindAnswer; unit: QuestionUnit } | null> {
  const previous = input.ledger.units[input.spec.id]
  if (!previous || previous.outcome !== 'blocking' || previous.consecutive_blocking_rounds !== 0) return null
  try {
    const saved = (await readResumeCheckpoint())?.latest_units?.[input.spec.id]
    if (!saved) return null
    const question = questionSchema.parse(saved.question)
    const blind = blindAnswerSchema.parse(saved.blind_answer)
    const unit = recoverableSoftwareBlockedQuestionUnit({ spec: input.spec, question, blind, teaching: input.teaching, previous })
    return unit ? { question, blind, unit } : null
  } catch {
    return null
  }
}

const emptyScheme = { correct_option: '', option_rationale: [], points: [], levels: [], indicative_content: [] }

function validShort(spec: ResolvedSpec): Question {
  // gross profit £100,000 then operating profit £70,000
  return {
    id: spec.id, family: 'SHORT_ANSWER', command_word: 'Calculate', marks: 4, ao_tags: ['AO2'], context: 'A bakery reports revenue of £250,000, cost of sales of £150,000 and other operating expenses of £30,000.',
    stem: 'Calculate the bakery’s gross profit and its operating profit. Show your working.', table: null, options: [],
    mark_scheme: { ...emptyScheme, type: 'points', points: [{ marks: 1, descriptor: 'Gross profit = revenue − cost of sales', accept: [] }, { marks: 1, descriptor: 'Gross profit = £100,000', accept: [] }, { marks: 1, descriptor: 'Operating profit = gross profit − other operating expenses', accept: [] }, { marks: 1, descriptor: 'Operating profit = £70,000', accept: [] }], model_answer: 'Gross profit £100,000; operating profit £70,000.' },
    calcs: [
      { label: 'Gross profit', formula_id: 'gross_profit', inputs: [{ name: 'revenue', value: 250000 }, { name: 'cost_of_sales', value: 150000 }], stated_answer: 100000, unit: '£' },
      { label: 'Operating profit', formula_id: 'operating_profit', inputs: [{ name: 'gross_profit', value: 100000 }, { name: 'other_operating_expenses', value: 30000 }], stated_answer: 70000, unit: '£' },
    ],
  }
}

function validMcq(spec: ResolvedSpec): Question {
  return {
    id: spec.id, family: 'MCQ', command_word: 'Calculate', marks: 1, ao_tags: ['AO2'], context: '', stem: 'A business has gross profit of £90,000 and revenue of £300,000. What is its gross profit margin?', table: null,
    options: [{ label: 'A', text: '30%' }, { label: 'B', text: '33.3%' }, { label: 'C', text: '70%' }, { label: 'D', text: '0.3%' }],
    mark_scheme: { ...emptyScheme, type: 'single_option', correct_option: 'A', option_rationale: ['Correct: 90,000 ÷ 300,000 × 100 = 30%', 'Divides by cost of sales', 'Uses cost of sales share', 'Forgets to multiply by 100'], model_answer: 'A: 30%' },
    calcs: [{ label: 'Gross profit margin', formula_id: 'gross_profit_margin', inputs: [{ name: 'gross_profit', value: 90000 }, { name: 'revenue', value: 300000 }], stated_answer: 30, unit: '%' }],
  }
}

function marketCapitalisationMcq(spec: QuestionSpec): Question {
  return {
    id: spec.id,
    family: 'MCQ',
    command_word: 'Calculate',
    marks: 1,
    ao_tags: ['AO2'],
    context: 'Northshore Cycles plc is a quoted UK bicycle manufacturer.',
    stem: 'Northshore Cycles plc has 18,000,000 shares in issue. Its current share price is £3.40. Calculate its market capitalisation.',
    table: null,
    options: [
      { label: 'A', text: '£21.60 million' },
      { label: 'B', text: '£54.00 million' },
      { label: 'C', text: '£61.20 million' },
      { label: 'D', text: '£3.40 million' },
    ],
    mark_scheme: {
      ...emptyScheme,
      type: 'single_option',
      correct_option: 'C',
      option_rationale: [
        'A is wrong because it does not multiply the full number of shares in issue by the current share price.',
        'B is wrong because it uses an incorrect share price or calculation.',
        'C is correct: 18,000,000 × £3.40 = £61,200,000, or £61.20 million.',
        'D is wrong because it gives only the current price of one share, not the value of all shares in issue.',
      ],
      model_answer: '18,000,000 × £3.40 = £61,200,000 = £61.20 million.',
    },
    calcs: [{
      label: 'Market capitalisation of Northshore Cycles plc',
      formula_id: 'market_capitalisation',
      inputs: [{ name: 'shares_in_issue', value: 18000000 }, { name: 'share_price', value: 3.4 }],
      stated_answer: 61200000,
      unit: '£',
    }],
  }
}

const resolved = async () => resolvePlan(JSON.parse(await readFile(BLUEPRINT, 'utf8')) as Blueprint)

describe('AQA 7132 slice questions (software checks)', () => {
  it('has a plan that covers every named 3.5 formula, resolves against the blueprint and meets the quantitative share', async () => {
    const plan = await resolved()
    expect(plan.length).toBe(QUESTION_PLAN.length)
    expect(plan.every((spec) => spec.items.length > 0 && spec.nodeIds.length > 0)).toBe(true)
    const blueprint = JSON.parse(await readFile(BLUEPRINT, 'utf8')) as Blueprint
    const formulaItems = blueprint.items.filter((i) => i.kind === 'formula').length
    expect(new Set(QUESTION_PLAN.flatMap((s) => s.formulaIds)).size).toBe(formulaItems)
    const totalMarks = QUESTION_PLAN.reduce((sum, s) => sum + s.marks, 0)
    const quantitative = QUESTION_PLAN.filter((s) => s.formulaIds.length).reduce((sum, s) => sum + s.marks, 0)
    expect(quantitative / totalMarks).toBeGreaterThanOrEqual(0.1)
    expect(QUESTION_PLAN.length).toBeGreaterThanOrEqual(10)
    expect(QUESTION_PLAN.length).toBeLessThanOrEqual(15)
    expect(new Set(QUESTION_PLAN.map((s) => s.id)).size).toBe(QUESTION_PLAN.length)
    expect(confidenceLabel(QUESTION_PLAN.find((s) => s.family === 'ESSAY')!)).toBe('Limited')
  })

  it('accepts a correct calculation question and an MCQ, and rejects each thing software can prove wrong', async () => {
    const plan = await resolved()
    const short = plan.find((s) => s.id === 'q04')!
    const good = validShort(short)
    expect(validateQuestion(good, short)).toEqual([])

    const wrongAnswer = { ...good, calcs: good.calcs.map((c, i) => (i === 0 ? { ...c, stated_answer: 110000 } : c)) }
    expect(validateQuestion(wrongAnswer, short).map((f) => f.check_id)).toContain('calculation_recomputes')

    const hiddenInput = { ...good, context: 'A bakery reports revenue and cost of sales.' }
    expect(validateQuestion(hiddenInput, short).map((f) => f.check_id)).toContain('input_in_question')

    const badSum = { ...good, mark_scheme: { ...good.mark_scheme, points: good.mark_scheme.points.slice(0, 3) } }
    expect(validateQuestion(badSum, short).map((f) => f.check_id)).toContain('points_sum')

    const schemeDisagrees = { ...good, mark_scheme: { ...good.mark_scheme, points: good.mark_scheme.points.map((p) => ({ ...p, descriptor: p.descriptor.replace('£70,000', '£75,000') })), model_answer: 'Gross profit £100,000; operating profit £75,000.' } }
    expect(validateQuestion(schemeDisagrees, short).map((f) => f.check_id)).toContain('mark_scheme_answer')

    expect(validateQuestion({ ...good, marks: 3 }, short).map((f) => f.check_id)).toContain('plan_marks')
    expect(validateQuestion({ ...good, calcs: good.calcs.slice(0, 1) }, short).map((f) => f.check_id)).toContain('plan_formula_missing')

    const mcqSpec = plan.find((s) => s.id === 'q01')!
    const mcq = validMcq(mcqSpec)
    expect(validateQuestion(mcq, mcqSpec)).toEqual([])
    expect(validateQuestion({ ...mcq, options: mcq.options.slice(0, 3) }, mcqSpec).map((f) => f.check_id)).toContain('mcq_options')
    expect(validateQuestion({ ...mcq, mark_scheme: { ...mcq.mark_scheme, correct_option: 'B' } }, mcqSpec).map((f) => f.check_id)).toContain('mcq_key_matches_calculation')
    expect(validateQuestion({ ...mcq, options: mcq.options.map((o) => (o.label === 'B' ? { ...o, text: '30%' } : o)) }, mcqSpec).map((f) => f.check_id)).toContain('mcq_single_key')
  })

  it('requires a levels mark scheme that covers the marks for extended questions', async () => {
    const plan = await resolved()
    const spec = plan.find((s) => s.id === 'q12')!
    const base: Question = {
      id: 'q12', family: 'DATA_RESPONSE', command_word: 'Analyse', marks: 6, ao_tags: ['AO1', 'AO2', 'AO3'], context: 'A café chain.', stem: 'Analyse one advantage and one disadvantage.', table: null, options: [],
      mark_scheme: { ...emptyScheme, type: 'levels', levels: [{ level: 1, min_marks: 1, max_marks: 2, descriptor: 'Limited.' }, { level: 2, min_marks: 3, max_marks: 4, descriptor: 'Some analysis.' }, { level: 3, min_marks: 5, max_marks: 6, descriptor: 'Developed analysis.' }], indicative_content: ['a', 'b', 'c'], model_answer: 'A model answer.' },
      calcs: [],
    }
    expect(validateQuestion(base, spec)).toEqual([])
    const gap = { ...base, mark_scheme: { ...base.mark_scheme, levels: base.mark_scheme.levels.map((l) => (l.level === 3 ? { ...l, min_marks: 6 } : l)) } }
    expect(validateQuestion(gap, spec).map((f) => f.check_id)).toContain('levels_cover_marks')
    expect(validateQuestion({ ...base, mark_scheme: { ...base.mark_scheme, type: 'points' } }, spec).map((f) => f.check_id)).toContain('levels_required')
  })

  it('extracts numbers from text with commas, currency, percent signs and magnitude words', () => {
    expect(numbersIn('Revenue £250,000, margin 33.3% and a loss of -1,200.50')).toEqual([250000, 33.3, -1200.5])
    expect(numbersIn('Values are £61.20 million, 2.5 thousand and 1 billion.')).toEqual([61200000, 2500, 1000000000])
  })

  it('accepts the retained 3.5-topup q04 market-capitalisation answer written in millions', () => {
    const spec: QuestionSpec = { id: 'q04', family: 'MCQ', marks: 1, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['market-capitalisation'], formulaIds: ['market_capitalisation'], brief: 'Market capitalisation.' }
    const question = marketCapitalisationMcq(spec)
    expect(numbersIn(question.options[2].text)).toEqual([61200000])
    expect(validateQuestion(question, spec)).toEqual([])
  })

  it('retries a question with the software findings fed back, then stops at three attempts', async () => {
    const plan = await resolved()
    const spec = plan.find((s) => s.id === 'q04')!
    const teaching: QuestionTeaching[] = []
    const good = validShort(spec)
    const seen: number[] = []
    const result = await produceQuestion({ spec, teaching, generate: async (payload, attempt) => { seen.push((payload.fix_these as unknown[]).length); return { ok: true, output: attempt === 1 ? { ...good, marks: 3 } : good } } })
    expect(result.attempts).toBe(2)
    expect(seen[0]).toBe(0)
    expect(seen[1]).toBeGreaterThan(0)
    let calls = 0
    const failing = await produceQuestion({ spec, teaching, generate: async () => { calls++; return { ok: false, error: 'timeout' } } })
    expect(calls).toBe(3)
    expect(failing).toMatchObject({ output: null, attempts: 3, error: 'timeout' })
  })

  it('hides the mark scheme and teaching from the blind answerer, and builds a unit whose fingerprint tracks the content', async () => {
    const plan = await resolved()
    const spec = plan.find((s) => s.id === 'q04')!
    const question = validShort(spec)
    const blind = blindPayload(question) as Record<string, unknown>
    expect(Object.keys(blind)).not.toContain('mark_scheme')
    expect(Object.keys(blind)).not.toContain('calcs')
    expect(JSON.stringify(blind)).not.toContain('£70,000')
    const answer: BlindAnswer = { question_id: 'q04', answer_text: 'Gross profit £100,000 and operating profit £70,000.', numbers: [{ label: 'gross profit', value: 100000 }, { label: 'operating profit', value: 70000 }] }
    expect(blindAnswerSchema.safeParse(answer).success).toBe(true)
    const teaching: QuestionTeaching[] = [{ subject_id: 'BUS-FIN-003', teaching_content: {}, quantitative_content: {}, source_ids: ['SRC-A'] }]
    const one = buildQuestionUnit({ spec, question, blind: answer, teaching })
    const two = buildQuestionUnit({ spec, question, blind: answer, teaching })
    const changed = buildQuestionUnit({ spec, question: { ...question, stem: `${question.stem} Also state the unit.` }, blind: answer, teaching })
    expect(one.fingerprint).toBe(two.fingerprint)
    expect(changed.fingerprint).not.toBe(one.fingerprint)
    expect((one.payload.numeric_comparison as Array<{ blind_answer_matches: boolean }>).every((entry) => entry.blind_answer_matches)).toBe(true)
    expect(questionSchema.safeParse(question).success).toBe(true)
    expect(reviewOutputSchema(QUESTIONS_CHECKLIST).safeParse({ unit_id: 'q04', answers: QUESTIONS_CHECKLIST.checks.map((c) => ({ check_id: c.id, answer: 'yes', note: '' })), findings: [] }).success).toBe(true)
    expect(checklistInstructions(QUESTIONS_CHECKLIST)).toContain('Do not look for other problems')
  })

  it('reuses a retained accepted question only when its exact review fingerprint still matches current inputs', async () => {
    const plan = await resolved()
    const spec = plan.find((s) => s.id === 'q04')!
    const question = validShort(spec)
    const blind: BlindAnswer = { question_id: 'q04', answer_text: 'Gross profit £100,000 and operating profit £70,000.', numbers: [{ label: 'gross profit', value: 100000 }, { label: 'operating profit', value: 70000 }] }
    const teaching: QuestionTeaching[] = [{ subject_id: 'BUS-FIN-003', teaching_content: { fact: 'same' }, quantitative_content: {}, source_ids: ['SRC-A'] }]
    const unit = buildQuestionUnit({ spec, question, blind, teaching })
    const previous: Ledger['units'][string] = { fingerprint: unit.fingerprint, outcome: 'passed', consecutive_blocking_rounds: 0, findings: [], updated_at: '2026-10-01T00:00:00Z' }
    expect(retainedQuestionUnit({ spec, question, blind, teaching, previous })?.fingerprint).toBe(unit.fingerprint)
    expect(retainedQuestionUnit({ spec, question, blind, teaching: [{ ...teaching[0], teaching_content: { fact: 'changed' } }], previous })).toBeNull()
    expect(retainedQuestionUnit({ spec, question, blind, teaching, previous: { ...previous, outcome: 'failed' } })).toBeNull()
  })

  it('recovers an unchanged latest candidate only when its old blocker was software-only and is now cleared', () => {
    const baseSpec: QuestionSpec = { id: 'q04', family: 'MCQ', marks: 1, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: ['market-capitalisation'], formulaIds: ['market_capitalisation'], brief: 'Market capitalisation.' }
    const spec: ResolvedSpec = { ...baseSpec, items: [], nodeIds: [] }
    const question = marketCapitalisationMcq(spec)
    const blind: BlindAnswer = {
      question_id: 'q04',
      answer_text: 'C — 18,000,000 × £3.40 = £61.20 million.',
      numbers: [{ label: 'market_capitalisation_gbp', value: 61200000 }],
    }
    const teaching: QuestionTeaching[] = [{ subject_id: 'BUS-FIN-014', teaching_content: { fact: 'same' }, quantitative_content: {}, source_ids: ['SRC-A'] }]
    const unit = buildQuestionUnit({ spec, question, blind, teaching })
    const softwareFinding: ClassifiedFinding = {
      check_id: 'mcq_key_matches_calculation', category: 'broken_question', affected_ids: ['q04'], finding: 'old parser false blocker', evidence: 'software check', contradicting_source_id: null, proposed_fix: 'normalise the magnitude', disposition: 'blocking', reason: 'software-proven',
    }
    const previous: Ledger['units'][string] = { fingerprint: unit.fingerprint, outcome: 'blocking', consecutive_blocking_rounds: 0, findings: [softwareFinding], updated_at: '2026-10-01T00:00:00Z' }
    expect(recoverableSoftwareBlockedQuestionUnit({ spec, question, blind, teaching, previous })?.fingerprint).toBe(unit.fingerprint)
    expect(recoverableSoftwareBlockedQuestionUnit({ spec, question, blind, teaching: [{ ...teaching[0], teaching_content: { fact: 'changed' } }], previous })).toBeNull()
    expect(recoverableSoftwareBlockedQuestionUnit({ spec, question, blind, teaching, previous: { ...previous, consecutive_blocking_rounds: 1 } })).toBeNull()
    expect(recoverableSoftwareBlockedQuestionUnit({ spec, question, blind, teaching, previous: { ...previous, findings: [{ ...softwareFinding, evidence: 'review finding' }] } })).toBeNull()
    expect(recoverableSoftwareBlockedQuestionUnit({ spec, question: { ...question, mark_scheme: { ...question.mark_scheme, correct_option: 'B' } }, blind, teaching, previous })).toBeNull()
  })

  it('reports whole-set facts: marks, quantitative share, formulas not yet covered', async () => {
    const plan = await resolved()
    const spec = plan.find((s) => s.id === 'q04')!
    const facts = setChecks([validShort(spec)], QUESTION_PLAN)
    expect(facts.totalMarks).toBe(4)
    expect(facts.quantitativePercent).toBe(100)
    expect(facts.missingFormulas).toContain('return_on_investment')
    expect(facts.missingFormulas).not.toContain('gross_profit')
  })

  it('keeps every committed question valid against its plan (software re-proof, no AI)', async () => {
    const config = JSON.parse(await readFile('content-factory/slices/aqa-7132-batches.json', 'utf8')) as { batches: Array<{ id: string }>; top_up: { id: string } }
    for (const batch of ['3.5', ...config.batches.map((b) => b.id), config.top_up.id]) {
      const dir = `content-factory/slices/aqa-7132-${batch}/questions`
      if (!existsSync(dir)) continue
      const blueprint = JSON.parse(await readFile(`content-factory/slices/aqa-7132-${batch}/BLUEPRINT.json`, 'utf8')) as Blueprint
      for (const spec of resolvePlan(blueprint, await planFor(batch))) {
        const path = `${dir}/${spec.id}.json`
        if (!existsSync(path)) continue
        const record = JSON.parse(await readFile(path, 'utf8')) as { question: unknown }
        const question = questionSchema.parse(record.question)
        expect(validateQuestion(question, spec), `${batch}/${spec.id}`).toEqual([])
      }
    }
  })

  const proofIt = proofEnabled ? it : it.skip

  proofIt('writes each planned question, has it answered blind, proves what software can, reviews with a fixed checklist, and never unlocks learner publication', async () => {
    const questionPlan = await planFor(BATCH)
    const plan = resolvePlan(JSON.parse(await readFile(BATCH_BLUEPRINT, 'utf8')) as Blueprint, questionPlan)
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const rows = new Map<string, { subject_truth_sources?: string[] }>(candidate.matrix.nodes.map((row: { subject_id: string }) => [row.subject_id, row]))
    await mkdir(`${OUTPUT}/questions`, { recursive: true })
    await mkdir(`${OUTPUT}/blind-answers`, { recursive: true })

    const teachingFor = (spec: ResolvedSpec): QuestionTeaching[] => spec.nodeIds.map((nodeId) => {
      const subjectId = nodeId.toUpperCase()
      const node = candidate.nodes.get(subjectId)
      if (!node) throw new Error(`foundation_node_missing:${subjectId}`)
      return { subject_id: subjectId, title: node.title ?? null, teaching_content: node.teaching_content ?? {}, quantitative_content: node.quantitative_content ?? {}, source_ids: rows.get(subjectId)?.subject_truth_sources ?? [] }
    })

    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 6)
    const provider = createOpenAIFoundationLiveProvider(withSharedProviderBudget({
      apiKey: requiredEnv('OPENAI_API_KEY'),
      maxSpendUsd,
      // Reasoning tokens count towards the output limit, so generation gets medium effort and a large budget.
      generation: model(20_000, 'medium'),
      independentReview: model(8_000, 'high'),
      maxRetries: 0,
    }))

    const generate = (spec: ResolvedSpec) => async (payload: Record<string, unknown>) => {
      const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-questions-generate', contractVersion: QUESTIONS_CHECKLIST.version, routeKind: 'generation', strictOutput: true, outputSchema: questionSchema, instructions: QUESTION_GENERATION_INSTRUCTIONS, payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: `${spec.id} ${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }
    const answerBlind = async (question: Question): Promise<{ answer: BlindAnswer | null; error?: string }> => {
      let lastError = 'no attempt made'
      for (let attempt = 1; attempt <= 3; attempt++) {
        const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-questions-blind-answer', contractVersion: QUESTIONS_CHECKLIST.version, routeKind: 'independent_review', strictOutput: true, outputSchema: blindAnswerSchema, instructions: BLIND_ANSWER_INSTRUCTIONS, payload: blindPayload(question) })
        if (execution.status !== 'success') { lastError = `${execution.status}: ${'error' in execution ? execution.error : ''}`; continue }
        const parsed = blindAnswerSchema.safeParse(execution.output)
        if (parsed.success && parsed.data.question_id === question.id) return { answer: parsed.data }
        lastError = 'invalid blind answer'
      }
      return { answer: null, error: lastError }
    }

    const questions = new Map<string, Question>()
    const generationFailures: Array<{ id: string; error: string }> = []
    const forceFreshReviewIds = new Set<string>()
    const buildUnits = async (targets: ResolvedSpec[], feedback: Map<string, ClassifiedFinding[]>, ledgerForReuse: Ledger, allowRetained: boolean) => {
      const units: QuestionUnit[] = []
      let next = 0
      const worker = async () => {
        while (next < targets.length) {
          const spec = targets[next++]
          const teaching = teachingFor(spec)
          if (allowRetained) {
            const retained = await readRetainedQuestionUnit({ spec, teaching, ledger: ledgerForReuse })
            if (retained) {
              questions.set(spec.id, retained.question)
              await writeFile(`${OUTPUT}/blind-answers/${spec.id}.json`, `${JSON.stringify(retained.blind, null, 2)}\n`)
              units.push(retained.unit)
              continue
            }
            const recoverable = await readRecoverableSoftwareBlockedQuestionUnit({ spec, teaching, ledger: ledgerForReuse })
            if (recoverable) {
              questions.set(spec.id, recoverable.question)
              await writeFile(`${OUTPUT}/blind-answers/${spec.id}.json`, `${JSON.stringify(recoverable.blind, null, 2)}\n`)
              units.push(recoverable.unit)
              forceFreshReviewIds.add(spec.id)
              continue
            }
          }
          const produced = await produceQuestion({ spec, teaching, generate: generate(spec), feedback: feedback.get(spec.id) })
          if (!produced.output) { generationFailures.push({ id: spec.id, error: produced.error ?? 'generation failed' }); continue }
          const blind = await answerBlind(produced.output)
          if (!blind.answer) { generationFailures.push({ id: spec.id, error: `blind answer failed: ${blind.error}` }); continue }
          questions.set(spec.id, produced.output)
          await writeFile(`${OUTPUT}/blind-answers/${spec.id}.json`, `${JSON.stringify(blind.answer, null, 2)}\n`)
          units.push(buildQuestionUnit({ spec, question: produced.output, blind: blind.answer, teaching }))
        }
      }
      await Promise.all(Array.from({ length: Math.min(4, targets.length) }, worker))
      return units.sort((a, b) => a.unit_id.localeCompare(b.unit_id))
    }

    const reviewSchema = reviewOutputSchema(QUESTIONS_CHECKLIST)
    const instructions = `${QUESTION_REVIEW_INSTRUCTIONS}\n${checklistInstructions(QUESTIONS_CHECKLIST)}`
    const review = async (unit: QuestionUnit) => {
      const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-questions-review', contractVersion: QUESTIONS_CHECKLIST.version, routeKind: 'independent_review', strictOutput: true, outputSchema: reviewSchema, instructions, payload: unit.payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: `${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }

    // Round 1: exact-fingerprint accepted artifacts are reused without generation, blind answering or re-review. Anything already blocking after two review rounds is escalated without another provider call.
    let ledger = await readLedger()
    const preEscalated = plan.flatMap((spec) => {
      const previous = ledger.units[spec.id]
      return previous?.outcome === 'blocking' && previous.consecutive_blocking_rounds >= 2
        ? [{ unit_id: spec.id, status: 'escalated' as const, findings: previous.findings }]
        : []
    })
    if (preEscalated.length) {
      const now = new Date().toISOString()
      ledger = {
        ...ledger,
        units: {
          ...ledger.units,
          ...Object.fromEntries(preEscalated.map((outcome) => {
            const previous = ledger.units[outcome.unit_id]!
            return [outcome.unit_id, { ...previous, outcome: 'escalated' as const, updated_at: now }]
          })),
        },
      }
    }
    const preEscalatedIds = new Set(preEscalated.map((outcome) => outcome.unit_id))
    const units1 = await buildUnits(plan.filter((spec) => !preEscalatedIds.has(spec.id)), new Map(), ledger, true)
    // A latest candidate blocked only by the old software checker is exact-fingerprint unchanged, but its old blocking ledger entry must not be reused now that current software clears it. Dropping only that entry gives the unchanged candidate its first AI review without repurchasing generation or blind answering.
    const roundOneLedger = forceFreshReviewIds.size
      ? { ...ledger, units: Object.fromEntries(Object.entries(ledger.units).filter(([id]) => !forceFreshReviewIds.has(id))) }
      : ledger
    let run = await runReviewUnits({ units: units1, ledger: roundOneLedger, checklist: QUESTIONS_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
    ledger = run.ledger
    if (preEscalated.length) run = { ...run, outcomes: [...run.outcomes, ...preEscalated].sort((a, b) => a.unit_id.localeCompare(b.unit_id)) }

    // Round 2 (the last): regenerate only questions that blocked, with the findings fed back.
    const blocked = run.outcomes.filter((o) => o.status === 'blocking')
    if (blocked.length) {
      const feedback = new Map<string, ClassifiedFinding[]>(blocked.map((o) => [o.unit_id, o.findings]))
      const units2 = await buildUnits(plan.filter((spec) => feedback.has(spec.id)), feedback, ledger, false)
      const second = await runReviewUnits({ units: units2, ledger, checklist: QUESTIONS_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
      ledger = second.ledger
      run = { ...second, outcomes: [...run.outcomes.filter((o) => !feedback.has(o.unit_id)), ...second.outcomes].sort((a, b) => a.unit_id.localeCompare(b.unit_id)) }
    }

    const outcomes = run.outcomes
    const accepted = outcomes.filter((o) => o.status === 'passed' || o.status === 'logged' || (o.status === 'reused' && ['passed', 'logged'].includes(o.previous)))
    const acceptedQuestions: Question[] = []
    for (const outcome of accepted) {
      const question = questions.get(outcome.unit_id)
      const spec = plan.find((s) => s.id === outcome.unit_id)!
      if (!question) continue
      acceptedQuestions.push(question)
      await writeFile(`${OUTPUT}/questions/${spec.id}.json`, `${JSON.stringify({ id: spec.id, batch: BATCH, label: 'AQA-style practice (Revision-authored, not an AQA question)', confidence_label: confidenceLabel(spec), target_item_ids: spec.items.map((i) => i.id), target_node_ids: spec.nodeIds, question }, null, 2)}\n`)
    }
    for (const [id, question] of questions) await writeFile(`${OUTPUT}/questions/${id}.latest.json`, `${JSON.stringify(question, null, 2)}\n`)

    const facts = setChecks(acceptedQuestions, questionPlan)
    const summary = {
      planned: plan.length,
      accepted: accepted.length,
      blocking: outcomes.filter((o) => o.status === 'blocking').map((o) => o.unit_id),
      escalated: outcomes.filter((o) => o.status === 'escalated').map((o) => o.unit_id),
      failed: [...outcomes.filter((o) => o.status === 'failed').map((o) => o.unit_id), ...generationFailures.map((f) => f.id)],
      all_questions_accepted: accepted.length === plan.length,
      set: facts,
    }
    await writeFile(`${OUTPUT}/ledger.json`, `${JSON.stringify(ledger, null, 2)}\n`)
    await writeFile(`${OUTPUT}/escalations.json`, `${JSON.stringify(escalationEntries(ledger), null, 2)}\n`)
    await writeFile(`${OUTPUT}/SUMMARY.md`, `${renderRunSummary(`AQA 7132 batch ${BATCH}: exam-style questions`, outcomes, ledger)}\n${generationFailures.length ? `## Generation failed after 3 attempts\n${generationFailures.map((f) => `- ${f.id}: ${f.error}`).join('\n')}\n` : ''}\n## Whole set\n- ${facts.questions} questions, ${facts.totalMarks} marks, quantitative ${facts.quantitativePercent}% (minimum 10%: ${facts.quantitativeShareOk ? 'met' : 'NOT met'})\n- formulas not covered: ${facts.missingFormulas.join(', ') || 'none'}\n`)
    const evidence = {
      schema_version: 1,
      artifact_type: 'aqa_7132_slice_questions_fast_path',
      recorded_at: new Date().toISOString(),
      slice: BATCH,
      reviewed_commit: env.CONTENT_FACTORY_SLICE_REVIEWED_COMMIT ?? null,
      checklist: QUESTIONS_CHECKLIST,
      summary,
      provider_budget: { ...(provider.budgetSnapshot?.() ?? {}), maxSpendUsd },
      // The 10% quantitative share is an Exam Truth floor for the whole qualification, so it only gates the 3.5 slice (which has most of the formulas); other batches report it.
      gates: { ai_assured_questions: summary.all_questions_accepted && (BATCH !== '3.5' || facts.quantitativeShareOk) && facts.missingFormulas.length === 0, qualified_human_review_status: 'pending', learner_publication_eligible: false },
    }
    await writeFile(`${OUTPUT}/slice-questions-proof.json`, `${JSON.stringify(evidence, null, 2)}\n`)
    await writeFile(`${OUTPUT}/summary.json`, `${JSON.stringify({ ...summary, provider_budget: evidence.provider_budget }, null, 2)}\n`)

    expect(evidence.gates.learner_publication_eligible).toBe(false)
    if (!evidence.gates.ai_assured_questions) throw new Error(`slice_questions_not_fully_accepted: see ${OUTPUT}/SUMMARY.md`)
  }, 60 * 60 * 1000)
})
