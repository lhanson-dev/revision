// AQA 7132 slice production, step 5b: Learn + Practice for one slice (first slice: section 3.5) under the fast-path rules (ADR-0029).
// Per node: generate Learn and Practice from the blueprint, prove what software can prove (arithmetic, coverage of named items,
// required treatments and capabilities), then answer a fixed checklist with one AI review. Failures stay small: one failed node never stops the run.
import { createHash } from 'node:crypto'
import { z } from 'zod'
import type { Checklist, ClassifiedFinding } from '../../src/content-factory/fast-path-review'

export const SLICE_CHECKLIST: Checklist = {
  stage: 'aqa-7132-slice-learn-practice',
  version: 'slice-learn-practice-v1',
  checks: [
    {
      id: 'accuracy',
      question: 'Is every definition, fact, formula and worked calculation in the Learn and Practice content correct and consistent with the node teaching supplied? Cite a supplied source id that confirms or contradicts it.',
      requiresContradictingSource: true,
    },
    {
      id: 'coverage',
      question: 'Does the Learn content teach every named item listed for this node, and does Practice test each one, so that a student would not miss something examinable from this node?',
    },
    {
      id: 'treatment_fit',
      question: 'Does the Learn content include each required treatment, and does Practice include each required capability, from the blueprint for this node?',
    },
    {
      id: 'level_and_clarity',
      question: 'Is the content clear, coherent and pitched at A-level for a 16 to 18 year old, without turning into exam coaching and without going beyond what the course requires?',
    },
    {
      id: 'originality',
      question: 'Is the content original Revision-authored teaching, with no quoted or closely paraphrased awarding-body or past-paper text?',
    },
  ],
}

// ---- Formula library: the named 3.5 formulas, computed by software ----

type FormulaSpec = { id: string; label: string; inputs: string[]; unit: 'currency' | 'percent' | 'units'; expression: string; compute: (v: Record<string, number>) => number }

export const FORMULA_LIBRARY: readonly FormulaSpec[] = [
  { id: 'gross_profit', label: 'Gross profit', inputs: ['revenue', 'cost_of_sales'], unit: 'currency', expression: 'revenue - cost_of_sales', compute: (v) => v.revenue - v.cost_of_sales },
  { id: 'operating_profit', label: 'Operating profit', inputs: ['gross_profit', 'other_operating_expenses'], unit: 'currency', expression: 'gross_profit - other_operating_expenses', compute: (v) => v.gross_profit - v.other_operating_expenses },
  { id: 'profit_for_the_year', label: 'Profit for the year', inputs: ['operating_profit', 'net_finance_costs', 'taxation'], unit: 'currency', expression: 'operating_profit - net_finance_costs - taxation', compute: (v) => v.operating_profit - v.net_finance_costs - v.taxation },
  { id: 'return_on_investment', label: 'Return on investment', inputs: ['return_from_investment', 'cost_of_investment'], unit: 'percent', expression: 'return_from_investment / cost_of_investment × 100', compute: (v) => (v.return_from_investment / v.cost_of_investment) * 100 },
  { id: 'variance', label: 'Variance', inputs: ['actual', 'budgeted'], unit: 'currency', expression: 'actual - budgeted (label favourable or adverse by the effect on profit)', compute: (v) => v.actual - v.budgeted },
  { id: 'break_even_output', label: 'Break-even output', inputs: ['fixed_costs', 'contribution_per_unit'], unit: 'units', expression: 'fixed_costs / contribution_per_unit', compute: (v) => v.fixed_costs / v.contribution_per_unit },
  { id: 'margin_of_safety', label: 'Margin of safety', inputs: ['actual_output', 'break_even_output'], unit: 'units', expression: 'actual_output - break_even_output', compute: (v) => v.actual_output - v.break_even_output },
  { id: 'contribution_per_unit', label: 'Contribution per unit', inputs: ['selling_price_per_unit', 'variable_cost_per_unit'], unit: 'currency', expression: 'selling_price_per_unit - variable_cost_per_unit', compute: (v) => v.selling_price_per_unit - v.variable_cost_per_unit },
  { id: 'total_contribution', label: 'Total contribution', inputs: ['contribution_per_unit', 'units_sold'], unit: 'currency', expression: 'contribution_per_unit × units_sold', compute: (v) => v.contribution_per_unit * v.units_sold },
  { id: 'gross_profit_margin', label: 'Gross profit margin', inputs: ['gross_profit', 'revenue'], unit: 'percent', expression: 'gross_profit / revenue × 100', compute: (v) => (v.gross_profit / v.revenue) * 100 },
  { id: 'operating_profit_margin', label: 'Operating profit margin', inputs: ['operating_profit', 'revenue'], unit: 'percent', expression: 'operating_profit / revenue × 100', compute: (v) => (v.operating_profit / v.revenue) * 100 },
  { id: 'profit_for_the_year_margin', label: 'Profit for the year margin', inputs: ['profit_for_the_year', 'revenue'], unit: 'percent', expression: 'profit_for_the_year / revenue × 100', compute: (v) => (v.profit_for_the_year / v.revenue) * 100 },
] as const

const FORMULA_IDS = FORMULA_LIBRARY.map((formula) => formula.id) as [string, ...string[]]

// Named item (the part after "aqa-7132-3.5.x:") to the formula the software uses to prove its calculations.
const ITEM_FORMULA: Record<string, string> = {
  'return-on-investment': 'return_on_investment',
  'gross-profit': 'gross_profit',
  'operating-profit': 'operating_profit',
  'profit-for-the-year': 'profit_for_the_year',
  'variance-analysis': 'variance',
  'break-even-output': 'break_even_output',
  'margin-of-safety': 'margin_of_safety',
  'contribution-per-unit': 'contribution_per_unit',
  'total-contribution': 'total_contribution',
  'gross-profit-margin': 'gross_profit_margin',
  'operating-profit-margin': 'operating_profit_margin',
  'profit-for-the-year-margin': 'profit_for_the_year_margin',
}

export function formulaIdForItem(itemId: string): string | null {
  return ITEM_FORMULA[itemId.split(':')[1] ?? ''] ?? null
}

// Arithmetic check: recompute from the stated inputs. Answers are rounded by the writer, so allow rounding only.
export function checkCalculation(calc: { formula_id: string; inputs: Array<{ name: string; value: number }>; stated_answer: number }): string | null {
  const spec = FORMULA_LIBRARY.find((formula) => formula.id === calc.formula_id)
  if (!spec) return `unknown formula ${calc.formula_id}`
  const values: Record<string, number> = {}
  for (const input of calc.inputs) values[input.name] = input.value
  const names = Object.keys(values).sort()
  if (JSON.stringify(names) !== JSON.stringify([...spec.inputs].sort()) || calc.inputs.length !== spec.inputs.length) {
    return `${spec.id} needs exactly these inputs: ${spec.inputs.join(', ')}`
  }
  const expected = spec.compute(values)
  if (!Number.isFinite(expected)) return `${spec.id} cannot be computed from these inputs (division by zero)`
  const difference = Math.abs(expected - calc.stated_answer)
  const tolerance = Math.max(0.051, Math.abs(expected) * 0.001)
  return difference <= tolerance ? null : `${spec.id} computes to ${Number(expected.toFixed(4))} but the stated answer is ${calc.stated_answer}`
}

// ---- Output shape (strict-output friendly: every field required, no maps) ----

const treatmentIds = ['core_explanation', 'definition_in_context', 'example_non_example', 'comparison', 'relationship_causal_chain', 'process_sequence', 'purposeful_visual', 'worked_example', 'guided_example', 'misconception_repair', 'connection_synoptic_link', 'self_explanation_prompt', 'memory_anchor'] as const
const capabilityIds = ['retrieval', 'discrimination', 'short_constructed_response', 'calculation', 'interpretation', 'procedure_execution', 'construction', 'graph_data_interpretation', 'contextual_application', 'reasoning_chain', 'compare_justify', 'framework_application', 'contextual_judgement', 'misconception_diagnostic', 'mixed_synoptic_selection'] as const

const calcSchema = z.object({
  formula_id: z.enum(FORMULA_IDS),
  inputs: z.array(z.object({ name: z.string().min(1), value: z.number() })).min(1),
  stated_answer: z.number(),
  unit: z.string().min(1),
})

export const nodeOutputSchema = z.object({
  node_id: z.string().min(1),
  learn: z.object({
    title: z.string().min(1),
    sections: z.array(z.object({
      treatment: z.enum(treatmentIds),
      heading: z.string().min(1),
      body: z.string().min(1),
      item_ids: z.array(z.string()),
    })).min(1),
    key_terms: z.array(z.object({ term: z.string().min(1), definition: z.string().min(1) })),
    worked_examples: z.array(z.object({
      id: z.string().min(1),
      item_id: z.string().min(1),
      scenario: z.string().min(1),
      steps: z.array(z.string().min(1)).min(1),
      calc: calcSchema,
    })),
  }),
  practice: z.object({
    items: z.array(z.object({
      id: z.string().min(1),
      capability: z.enum(capabilityIds),
      item_ids: z.array(z.string()),
      prompt: z.string().min(1),
      answer: z.string().min(1),
      explanation: z.string().min(1),
      calc: calcSchema.nullable(),
    })).min(1),
  }),
})
export type NodeOutput = z.infer<typeof nodeOutputSchema>

// ---- Blueprint, node teaching and units ----

export type BlueprintItem = { id: string; section: string; label: string; kind: string; aqaConvention?: string; conventionStatus?: string; taughtBy: string[] }
export type Blueprint = {
  nodes: Array<{ nodeId: string; classifications: string[]; learnTreatments: string[]; practiceCapabilities: string[] }>
  items: BlueprintItem[]
  courseKnowledgeModelFingerprint: string
}

// Each named item is produced by exactly one node (the first slice node that teaches it), so nothing is written twice.
export function assignItemsToNodes(blueprint: Blueprint) {
  const assigned = new Map<string, BlueprintItem[]>(blueprint.nodes.map((node) => [node.nodeId, []]))
  for (const item of blueprint.items) {
    const owner = item.taughtBy.find((nodeId) => assigned.has(nodeId))
    if (owner) assigned.get(owner)!.push(item)
  }
  return assigned
}

function sha(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function softwareFinding(checkId: string, affected: string[], finding: string, fix: string, category: ClassifiedFinding['category'] = 'wrong_teaching'): ClassifiedFinding {
  return { check_id: checkId, category, affected_ids: affected.length ? affected : ['unit'], finding, evidence: 'software check', contradicting_source_id: null, proposed_fix: fix, disposition: 'blocking', reason: `software-proven: ${finding}` }
}

export type NodeExpectation = {
  nodeId: string
  requiredTreatments: string[]
  requiredCapabilities: string[]
  items: BlueprintItem[]
}

// Software: everything that can be proven about a generated node without an AI judgement.
export function validateNodeOutput(output: NodeOutput, expectation: NodeExpectation): ClassifiedFinding[] {
  const findings: ClassifiedFinding[] = []
  const nodeId = expectation.nodeId
  if (output.node_id !== nodeId) findings.push(softwareFinding('identity', [nodeId], `output is for ${output.node_id}, expected ${nodeId}`, 'Generate the requested node.'))

  const ids = [...output.learn.worked_examples.map((w) => w.id), ...output.practice.items.map((p) => p.id)]
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
  if (duplicates.length) findings.push(softwareFinding('ids_unique', [...new Set(duplicates)], 'duplicate ids', 'Give every worked example and practice item a unique id.', 'broken_question'))

  const treatments = new Set(output.learn.sections.map((s) => s.treatment))
  for (const treatment of expectation.requiredTreatments.filter((t) => !treatments.has(t as never))) {
    findings.push(softwareFinding('blueprint_treatments', [treatment], `required Learn treatment missing: ${treatment}`, `Add a Learn section with treatment ${treatment}.`, 'missing_examinable_item'))
  }
  const capabilities = new Set(output.practice.items.map((p) => p.capability))
  for (const capability of expectation.requiredCapabilities.filter((c) => !capabilities.has(c as never))) {
    findings.push(softwareFinding('blueprint_capabilities', [capability], `required Practice capability missing: ${capability}`, `Add a Practice item with capability ${capability}.`, 'missing_examinable_item'))
  }

  for (const item of expectation.items) {
    if (!output.learn.sections.some((s) => s.item_ids.includes(item.id))) findings.push(softwareFinding('item_learn', [item.id], `${item.label} is not taught in any Learn section`, `Add or tag a Learn section that teaches ${item.label}.`, 'missing_examinable_item'))
    if (!output.practice.items.some((p) => p.item_ids.includes(item.id))) findings.push(softwareFinding('item_practice', [item.id], `${item.label} is not tested by any Practice item`, `Add a Practice item that tests ${item.label}.`, 'missing_examinable_item'))
    const formulaId = formulaIdForItem(item.id)
    if (formulaId) {
      if (!output.learn.worked_examples.some((w) => w.item_id === item.id && w.calc.formula_id === formulaId)) findings.push(softwareFinding('item_worked_example', [item.id], `${item.label} has no worked example using ${formulaId}`, `Add a worked example for ${item.label}.`, 'missing_examinable_item'))
      if (!output.practice.items.some((p) => p.item_ids.includes(item.id) && p.calc?.formula_id === formulaId)) findings.push(softwareFinding('item_calculation_task', [item.id], `${item.label} has no calculation Practice item using ${formulaId}`, `Add a calculation Practice item for ${item.label}.`, 'missing_examinable_item'))
    }
  }

  for (const example of output.learn.worked_examples) {
    const problem = checkCalculation(example.calc)
    if (problem) findings.push(softwareFinding('calculation_recomputes', [example.id], `worked example: ${problem}`, 'Correct the numbers so the stated answer recomputes.'))
  }
  for (const practice of output.practice.items) {
    if (!practice.calc) continue
    const problem = checkCalculation(practice.calc)
    if (problem) findings.push(softwareFinding('calculation_recomputes', [practice.id], `practice item: ${problem}`, 'Correct the numbers so the stated answer recomputes.', 'broken_question'))
  }
  return findings
}

export type SliceTeaching = { subject_id: string; title?: string | null; teaching_content: unknown; quantitative_content: unknown; source_ids: string[] }

export type SliceUnit = {
  unit_id: string
  fingerprint: string
  softwareFindings: ClassifiedFinding[]
  payload: Record<string, unknown>
  sourceIds: Set<string>
}

export function generationPayload(input: { nodeId: string; expectation: NodeExpectation; teaching: SliceTeaching; feedback: ClassifiedFinding[] }) {
  return {
    node_id: input.nodeId,
    node_teaching: { id: `foundation-node:${input.teaching.subject_id}`, title: input.teaching.title ?? input.teaching.subject_id, teaching_content: input.teaching.teaching_content, quantitative_content: input.teaching.quantitative_content },
    named_items: input.expectation.items.map((item) => ({ id: item.id, label: item.label, kind: item.kind, aqa_convention: item.aqaConvention ?? null, formula_id: formulaIdForItem(item.id) })),
    required_learn_treatments: input.expectation.requiredTreatments,
    required_practice_capabilities: input.expectation.requiredCapabilities,
    formula_library: FORMULA_LIBRARY.map(({ id, label, inputs, unit, expression }) => ({ id, label, inputs, unit, expression })),
    fix_these: input.feedback.map((finding) => ({ check_id: finding.check_id, affected_ids: finding.affected_ids, finding: finding.finding, proposed_fix: finding.proposed_fix })),
  }
}

export function buildSliceUnit(input: { nodeId: string; expectation: NodeExpectation; teaching: SliceTeaching; output: NodeOutput | null; generationError?: string }): SliceUnit | null {
  if (!input.output) return null
  const softwareFindings = validateNodeOutput(input.output, input.expectation)
  const payload = {
    unit_id: input.nodeId,
    sources: [{ id: `foundation-node:${input.teaching.subject_id}`, text: { teaching_content: input.teaching.teaching_content, quantitative_content: input.teaching.quantitative_content } }],
    named_items: input.expectation.items.map((item) => ({ id: item.id, label: item.label, kind: item.kind, aqa_convention: item.aqaConvention ?? null })),
    required_learn_treatments: input.expectation.requiredTreatments,
    required_practice_capabilities: input.expectation.requiredCapabilities,
    generated: input.output,
  }
  return {
    unit_id: input.nodeId,
    fingerprint: sha({ payload, checklist: SLICE_CHECKLIST.version }),
    softwareFindings,
    payload,
    sourceIds: new Set([`foundation-node:${input.teaching.subject_id}`, ...input.teaching.source_ids]),
  }
}

export const SLICE_GENERATION_INSTRUCTIONS = [
  'You write original Revision teaching for one Subject Foundation node of AQA A-level Business, for students aged 16 to 18.',
  'Use ONLY the node teaching supplied as your subject knowledge. Write in British English, with UK business contexts and £.',
  'Content must be Revision-authored. Never quote or closely paraphrase AQA specification wording, mark schemes or past-paper questions. Practice items are original "AQA-style" practice, never AQA questions.',
  'Learn: write one section for EACH required learn treatment, tagged with that treatment. Tag every section with the named item ids it teaches (item_ids). Every named item must be taught in at least one section.',
  'Key terms: short definitions of the terms a student must know for this node.',
  'Worked examples: for each named item with a formula_id, give at least one worked example using a short realistic scenario. Give the calc with formula_id, inputs using EXACTLY the input names in formula_library for that formula, and the stated_answer (rounded to at most 2 decimal places). Show the steps in words. Do not do arithmetic you are unsure of: the software recomputes every calculation and rejects any mismatch.',
  'Practice: include at least one item for EACH required practice capability, and at least one item testing each named item (tag with item_ids). Each item has a prompt, a concise answer and an explanation of why it is right. For every named item with a formula_id include a calculation item with calc filled in (same rules as worked examples); items without a calculation set calc to null. Vary the numbers from the worked examples.',
  'Follow each aqa_convention exactly where one is given. Profit for the year means operating profit minus net finance costs minus taxation.',
  'If fix_these is not empty, this is a second attempt: correct exactly those problems and keep everything else.',
].join('\n')

export const SLICE_REVIEW_INSTRUCTIONS = [
  'You review generated Learn and Practice content for one node against the node teaching supplied as a source.',
  'The software has already proven the arithmetic, the coverage of named items and the presence of the required treatments and capabilities, so do not recompute them.',
  'Judge only the checklist questions below, for the unit supplied.',
].join('\n')

// ---- Generation loop for one node: generate, prove, feed software findings back, up to 3 attempts ----

export type GenerateCall = (payload: Record<string, unknown>, attempt: number) => Promise<{ ok: true; output: unknown } | { ok: false; error: string }>

export async function produceNode(input: {
  nodeId: string
  expectation: NodeExpectation
  teaching: SliceTeaching
  generate: GenerateCall
  feedback?: ClassifiedFinding[]
  maxAttempts?: number
}): Promise<{ output: NodeOutput | null; attempts: number; error?: string }> {
  const maxAttempts = input.maxAttempts ?? 3
  let feedback = input.feedback ?? []
  let last: NodeOutput | null = null
  let lastError = 'no attempt made'
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const payload = generationPayload({ nodeId: input.nodeId, expectation: input.expectation, teaching: input.teaching, feedback })
    const result = await input.generate(payload, attempt).catch((error: unknown) => ({ ok: false as const, error: error instanceof Error ? error.message : String(error) }))
    if (!result.ok) { lastError = result.error; continue }
    const parsed = nodeOutputSchema.safeParse(result.output)
    if (!parsed.success) { lastError = `invalid output: ${parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`; continue }
    last = parsed.data
    const problems = validateNodeOutput(parsed.data, input.expectation)
    if (problems.length === 0) return { output: parsed.data, attempts: attempt }
    // Next attempt sees what software proved wrong, so a fix is targeted (and a bad attempt is never reviewed by AI for what software already caught).
    feedback = [...(input.feedback ?? []), ...problems]
  }
  return last ? { output: last, attempts: maxAttempts } : { output: null, attempts: maxAttempts, error: lastError }
}

export function expectationsFromBlueprint(blueprint: Blueprint): NodeExpectation[] {
  const assigned = assignItemsToNodes(blueprint)
  return blueprint.nodes.map((node) => ({
    nodeId: node.nodeId,
    requiredTreatments: [...node.learnTreatments].sort(),
    requiredCapabilities: [...node.practiceCapabilities].sort(),
    items: assigned.get(node.nodeId) ?? [],
  }))
}
