// AQA 7132 question plans, step 5c for every course batch: what each exam-style question must test, built by software from the batch blueprint (no AI, no spend).
// The plan fixes coverage so the AI only has to write each question to its spec: every named formula gets a calculation, every other named item is targeted by at least one
// question, and every course node in the batch has at least one question (so REV can tie results to the course map). Section 3.5 keeps its hand-written plan (QUESTION_PLAN).
import { FORMULA_LIBRARY, assignItemsToNodes, formulaIdForItem, type Blueprint, type BlueprintItem } from './aqa-business-7132-slice-learn-practice'
import type { QuestionSpec } from './aqa-business-7132-slice-questions'

export const QUESTION_PLAN_BUILDER_VERSION = 'question-plan-v1'

// Conservative spend per question, measured on the 3.5 slice ($0.61 for 14 questions, about $0.044 each) with headroom for regeneration.
export const ESTIMATED_USD_PER_QUESTION = 0.06

export type QuestionPlanFile = {
  schema_version: 1
  builder_version: string
  batch: string
  blueprint_fingerprint: string
  // Items of the blueprint that are not planned here (already covered by an earlier plan), so the coverage check is explicit about it.
  excluded_item_ids: string[]
  summary: { questions: number; marks: number; quantitative_marks: number; formulas: number; items: number; nodes: number; estimated_spend_usd: number }
  questions: QuestionSpec[]
}

const suffixOf = (item: BlueprintItem) => item.id.split(':')[1] ?? item.id
const formulaOf = (formulaId: string) => FORMULA_LIBRARY.find((formula) => formula.id === formulaId)!
const isSeries = (formulaId: string) => (formulaOf(formulaId).series?.length ?? 0) > 0
const labels = (items: BlueprintItem[]) => items.map((item) => `"${item.label}"`).join(' and ')

type Draft = Omit<QuestionSpec, 'id'>

const targetedShortAnswerBrief = (group: BlueprintItem[]): string | null => {
  if (group.length !== 1) return null
  const suffix = suffixOf(group[0])
  if (suffix === 'takeovers') {
    return 'Short answer: give a takeover context that requires takeover-specific understanding, then ask the student to explain one takeover-specific reason the deal may fail to create the expected business success. Do not make a generic rapid-growth or working-capital explanation sufficient. The scenario should support routes such as overpayment, integration costs, difficulty combining operations or systems, culture/management clashes, loss of key staff or customers, or expected synergies not materialising. The mark scheme must credit any valid takeover-specific route that is applied to the context rather than requiring one preselected explanation.'
  }
  if (suffix === 'synergy') {
    return 'Short answer: give a context in which two businesses have complementary resources, customer bases, distribution, technology or capabilities, but do not use the word synergy and do not state the combined benefit for the student. Ask the student to explain how combining the businesses could create synergy. The mark scheme should credit valid mechanisms such as sharing resources, removing duplicated costs, cross-selling or combining complementary capabilities, with application to the context.'
  }
  return null
}

const targetedPairBrief = (group: BlueprintItem[]): string | null => {
  const suffixes = group.map(suffixOf)
  const is = (...wanted: string[]) => suffixes.length === wanted.length && wanted.every((value, index) => suffixes[index] === value)
  if (is('social-enterprise', 'limited-and-unlimited-liability')) return 'Short answer: give a business-form context that requires the student to use both social-enterprise knowledge and limited/unlimited liability. Do not state the relevant ownership/liability conclusion in the scenario. Ask for an explanation that connects the organisation purpose or reinvestment model to the liability consequence. The mark scheme must credit any valid explanation route that answers the question rather than requiring one stock phrase.'
  if (is('ordinary-share-capital', 'role-of-shareholders-and-why-they-invest')) return 'Short answer: give a shareholder-investment context and ask the student to explain why an investor might buy ordinary shares. The answer must require ordinary-share-capital/shareholder knowledge. The mark scheme must accept valid routes such as dividends, capital gain from a higher share price, ownership/voting influence where relevant, and other supported shareholder-return reasons; do not require one preselected benefit.'
  if (is('government-enterprise-policy', 'role-of-regulators')) return 'Short answer: give a business context involving government support and a separate regulatory constraint, but do not name or describe the regulator role so explicitly that the target knowledge is supplied. Ask the student to explain one effect of government enterprise policy and one role of a regulator. The mark scheme must require the student to supply and apply the regulator function.'
  if (is('globalisation', 'emerging-economies')) return 'Short answer: give a global expansion context involving a recognisable emerging economy without stating the opportunity. Ask the student to explain one opportunity created by growth in an emerging economy and connect it to globalisation. A generic overseas-growth answer is insufficient: the mark scheme must require an emerging-economy mechanism such as rising incomes, urbanisation, market growth or expanding consumer demand applied to the context.'
  if (is('exporting', 'licensing')) return 'Short answer: give an international-entry context in which licensing is a plausible route, but do not describe the arrangement using wording that effectively defines licensing or gives the answer away. Ask the student to explain why licensing rather than exporting could be suitable. The mark scheme must require the learner to supply licensing knowledge and apply a valid advantage or trade-off to the context.'
  if (is('multinationals', 'local-responsiveness-versus-cost-reduction-pressure')) return 'Short answer: give a business operating across several countries, but do not state the definition or label multinational. Ask the student to explain how being a multinational creates a tension between local responsiveness and cost reduction. The mark scheme must require multinational knowledge plus an applied explanation of adaptation versus standardisation/cost pressure, not reward repeating a fact supplied by the scenario.'
  return null
}

// Formula questions: a formula that feeds another formula in the same node (the second needs the first's answer as an input) goes in one 4-mark question;
// the rest are single-formula questions, alternating between a 1-mark multiple choice (simple two-input formulas only) and a 3-mark short answer.
function formulaDrafts(formulaItems: BlueprintItem[], soloCounter: { value: number }): Draft[] {
  const drafts: Draft[] = []
  const used = new Set<string>()
  const byFormula = new Map<string, BlueprintItem>()
  for (const item of formulaItems) byFormula.set(formulaIdForItem(item.id)!, item)
  for (const item of formulaItems) {
    const id = formulaIdForItem(item.id)!
    if (used.has(id)) continue
    used.add(id)
    const spec = formulaOf(id)
    const partner = formulaItems
      .map((other) => formulaIdForItem(other.id)!)
      .find((otherId) => !used.has(otherId) && (formulaOf(otherId).inputs.includes(id) || spec.inputs.includes(otherId)))
    if (partner) {
      used.add(partner)
      // Producer first, so the second calculation can use the first answer.
      const [first, second] = formulaOf(partner).inputs.includes(id) ? [id, partner] : [partner, id]
      const items = [byFormula.get(first)!, byFormula.get(second)!]
      drafts.push({
        family: 'SHORT_ANSWER', marks: 4, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: items.map(suffixOf), formulaIds: [first, second],
        brief: `Short answer: in a realistic business setting, give the figures needed and ask the student to calculate ${formulaOf(first).label.toLowerCase()} and then ${formulaOf(second).label.toLowerCase()} (the second may use the answer to the first). Show working. Use the AQA calculation convention supplied for each item.`,
      })
      continue
    }
    const simple = !isSeries(id) && spec.inputs.length <= 2
    const asMcq = simple && soloCounter.value % 2 === 0
    soloCounter.value++
    if (asMcq) {
      drafts.push({
        family: 'MCQ', marks: 1, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: [suffixOf(item)], formulaIds: [id],
        brief: `Multiple choice: give the figures needed and ask which option is the ${spec.label.toLowerCase()}. Distractors are common slips (using the wrong figure, forgetting a step or the unit).`,
      })
    } else {
      drafts.push({
        family: 'SHORT_ANSWER', marks: isSeries(id) ? 4 : 3, commandWord: 'Calculate', ao: ['AO2'], itemSuffixes: [suffixOf(item)], formulaIds: [id],
        brief: `Short answer: in a realistic business setting, give the figures needed and ask the student to calculate the ${spec.label.toLowerCase()}. Show working.${isSeries(id) ? ' The inputs are a list (for example several years or outcomes), so give every value in the question.' : ''} Use the AQA calculation convention supplied for the item.`,
      })
    }
  }
  return drafts
}

// Non-formula items of one node: the first concept as a 1-mark multiple choice, remaining concepts two at a time as 4-mark "Explain" short answers,
// skills two at a time as 6-mark "Analyse" data-response questions, and each model as a 9-mark "Evaluate" data-response question.
function otherDrafts(items: BlueprintItem[]): Draft[] {
  const drafts: Draft[] = []
  const concepts = items.filter((item) => item.kind === 'concept')
  const skills = items.filter((item) => item.kind === 'skill')
  const models = items.filter((item) => item.kind === 'model')
  const others = items.filter((item) => !['concept', 'skill', 'model'].includes(item.kind))
  const remaining = [...others, ...concepts]
  const first = remaining.shift()
  if (first) {
    drafts.push({ family: 'MCQ', marks: 1, commandWord: 'Identify', ao: ['AO1'], itemSuffixes: [suffixOf(first)], formulaIds: [], brief: `Multiple choice: one question that tests ${labels([first])} at the Identify level. One option is correct and the distractors are plausible misconceptions about it, set in a short business context.` })
  }
  for (let index = 0; index < remaining.length; index += 2) {
    const group = remaining.slice(index, index + 2)
    drafts.push({ family: 'SHORT_ANSWER', marks: 4, commandWord: 'Explain', ao: ['AO1', 'AO2'], itemSuffixes: group.map(suffixOf), formulaIds: [], brief: targetedPairBrief(group) ?? targetedShortAnswerBrief(group) ?? `Short answer: a short business scenario is given in the context, and the student explains a point that tests ${labels(group)}. The mark scheme credits knowledge and its application to the scenario.` })
  }
  for (let index = 0; index < skills.length; index += 2) {
    const group = skills.slice(index, index + 2)
    drafts.push({ family: 'DATA_RESPONSE', marks: 6, commandWord: 'Analyse', ao: ['AO1', 'AO2', 'AO3'], itemSuffixes: group.map(suffixOf), formulaIds: [], brief: `Data response: a self-contained business scenario with a small data table or short extract (include every figure the student needs), then one part asking the student to analyse a point that tests ${labels(group)}. Mark scheme is level-based.` })
  }
  for (const model of models) {
    drafts.push({ family: 'DATA_RESPONSE', marks: 9, commandWord: 'Evaluate', ao: ['AO1', 'AO2', 'AO3', 'AO4'], itemSuffixes: [suffixOf(model)], formulaIds: [], brief: `Data response: a self-contained business scenario with the data needed, then one part asking the student to evaluate a decision or approach that tests ${labels([model])}, reaching a justified judgement. Mark scheme is level-based.` })
  }
  return drafts
}

// One 25-mark essay per course batch, drawing on up to three items from the same specification section so the essay is about one topic.
// The section with the most models and skills wins (ties go to the earlier section); within it, models come first, then skills, then concepts.
function essayDraft(items: BlueprintItem[]): Draft | null {
  const rank = (item: BlueprintItem) => (item.kind === 'model' ? 0 : item.kind === 'skill' ? 1 : 2)
  const candidates = items.filter((item) => !formulaIdForItem(item.id))
  const sections = [...new Set(candidates.map((item) => item.section))]
  const score = (section: string) => candidates.filter((item) => item.section === section).reduce((total, item) => total + (2 - rank(item)), 0)
  const best = sections.reduce<string | null>((winner, section) => (winner === null || score(section) > score(winner) ? section : winner), null)
  if (best === null) return null
  const picked = candidates.map((item, index) => ({ item, index })).filter(({ item }) => item.section === best).sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index).slice(0, 3).map(({ item }) => item)
  return { family: 'ESSAY', marks: 25, commandWord: 'Evaluate', ao: ['AO1', 'AO2', 'AO3', 'AO4'], itemSuffixes: picked.map(suffixOf), formulaIds: [], brief: `Essay: a statement about a business, set in a new business context, that the student evaluates, drawing on ${labels(picked)}. Mark scheme is level-based with indicative content.` }
}

export function buildQuestionPlan(input: { blueprint: Blueprint; batch: string; excludeItemIds?: ReadonlySet<string>; essay?: boolean }): QuestionPlanFile {
  const exclude = input.excludeItemIds ?? new Set<string>()
  const planned = { ...input.blueprint, items: input.blueprint.items.filter((item) => !exclude.has(item.id)) }
  const assigned = assignItemsToNodes(planned)
  const drafts: Draft[] = []
  const soloCounter = { value: 0 }
  for (const node of planned.nodes) {
    const items = assigned.get(node.nodeId) ?? []
    drafts.push(...formulaDrafts(items.filter((item) => formulaIdForItem(item.id)), soloCounter), ...otherDrafts(items.filter((item) => !formulaIdForItem(item.id))))
  }
  if (input.essay ?? true) {
    const essay = essayDraft(planned.items)
    if (essay) drafts.push(essay)
  }
  const width = Math.max(2, String(drafts.length).length)
  const questions: QuestionSpec[] = drafts.map((draft, index) => ({ id: `q${String(index + 1).padStart(width, '0')}`, ...draft }))
  const marks = questions.reduce((sum, q) => sum + q.marks, 0)
  const quantitative = questions.filter((q) => q.formulaIds.length).reduce((sum, q) => sum + q.marks, 0)
  return {
    schema_version: 1,
    builder_version: QUESTION_PLAN_BUILDER_VERSION,
    batch: input.batch,
    blueprint_fingerprint: input.blueprint.courseKnowledgeModelFingerprint,
    excluded_item_ids: [...exclude].filter((id) => input.blueprint.items.some((item) => item.id === id)).sort(),
    summary: {
      questions: questions.length,
      marks,
      quantitative_marks: quantitative,
      formulas: new Set(questions.flatMap((q) => q.formulaIds)).size,
      items: planned.items.length,
      nodes: planned.nodes.length,
      estimated_spend_usd: Number((questions.length * ESTIMATED_USD_PER_QUESTION).toFixed(2)),
    },
    questions,
  }
}

// Software proof that a plan covers its blueprint. An empty list means the plan is sound.
export function checkQuestionPlan(blueprint: Blueprint, plan: { questions: readonly QuestionSpec[]; excluded_item_ids?: readonly string[] }): string[] {
  const problems: string[] = []
  const excluded = new Set(plan.excluded_item_ids ?? [])
  const planned = blueprint.items.filter((item) => !excluded.has(item.id))
  const bySuffix = new Map(planned.map((item) => [suffixOf(item), item]))
  const ids = plan.questions.map((q) => q.id)
  if (new Set(ids).size !== ids.length) problems.push('duplicate question ids')
  const targeted = new Set<string>()
  const formulas = new Set<string>()
  const nodes = new Set<string>()
  const ownerOf = new Map<string, string>()
  for (const [nodeId, items] of assignItemsToNodes({ ...blueprint, items: planned })) for (const item of items) ownerOf.set(item.id, nodeId)
  for (const q of plan.questions) {
    if (!q.itemSuffixes.length) problems.push(`${q.id}: no target items`)
    for (const suffix of q.itemSuffixes) {
      const item = bySuffix.get(suffix)
      if (!item) { problems.push(`${q.id}: item ${suffix} is not in the planned blueprint items`); continue }
      targeted.add(item.id)
      const nodeId = ownerOf.get(item.id)
      if (nodeId) nodes.add(nodeId)
    }
    for (const formulaId of q.formulaIds) {
      formulas.add(formulaId)
      if (!FORMULA_LIBRARY.some((formula) => formula.id === formulaId)) problems.push(`${q.id}: unknown formula ${formulaId}`)
      if (!q.itemSuffixes.some((suffix) => { const item = bySuffix.get(suffix); return item && formulaIdForItem(item.id) === formulaId })) problems.push(`${q.id}: formula ${formulaId} is not one of the question's target items`)
    }
    if (q.family === 'MCQ' && q.marks !== 1) problems.push(`${q.id}: multiple choice must be 1 mark`)
    if (q.family === 'ESSAY' && q.marks !== 25) problems.push(`${q.id}: essay must be 25 marks`)
    if (q.marks >= 6 && q.family === 'SHORT_ANSWER') problems.push(`${q.id}: a ${q.marks}-mark question cannot be a short answer`)
    if (q.formulaIds.length && q.family !== 'MCQ' && q.family !== 'SHORT_ANSWER') problems.push(`${q.id}: calculations belong in multiple-choice or short-answer questions`)
  }
  for (const item of planned) if (!targeted.has(item.id)) problems.push(`item not targeted by any question: ${item.id}`)
  for (const item of planned) { const formulaId = formulaIdForItem(item.id); if (formulaId && !formulas.has(formulaId)) problems.push(`formula not calculated by any question: ${formulaId}`) }
  for (const nodeId of new Set(ownerOf.values())) if (!nodes.has(nodeId)) problems.push(`node has no question: ${nodeId}`)
  return problems
}
