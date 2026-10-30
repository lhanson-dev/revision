/** Reuse previously authored Content Factory construction work without claiming software grading.
 * AQA 7132 v2.0 §3.5.2 (printed p20); source is REFERENCE_ONLY.
 * Full tasks and model answers below originate from Revision-owned original assets.
 */
import { dataDrillSchema } from '../../../schema'
import cashFlow from '../../../../content-factory/slices/aqa-7132-3.5/learn-practice/bus-fin-005.json'
import budgets from '../../../../content-factory/slices/aqa-7132-3.5/learn-practice/bus-fin-007.json'

const sources = [
  {
    asset: budgets,
    itemId: 'p-construct-and-reconcile-march-budget',
    id: 'rev7132-35-budget-construction-01',
    title: 'Build a budget and reconcile every variance',
    required: ['aqa-7132-3.5.2:budgets-income-expenditure-profit', 'aqa-7132-3.5.2:variance-analysis'],
  },
  {
    asset: cashFlow,
    itemId: 'p11-three-month-cash-flow-forecast',
    id: 'rev7132-35-cashflow-construction-01',
    title: 'Construct a three-month cash-flow forecast',
    required: ['aqa-7132-3.5.2:cash-flow-forecast', 'aqa-7132-3.5.2:timing-of-payables-and-receivables'],
  },
] as const

export const businessFinancialConstructionDrills = sources.map(({ asset, itemId, id, title, required }) => {
  const task = asset.practice.items.find(item => item.id === itemId)
  if (!task || task.capability !== 'construction'
    || !required.every(target => task.item_ids.includes(target))
    || !task.prompt || !task.answer || !task.explanation) {
    throw new Error(`Missing or unsafe existing Business 7132 construction task: ${itemId}`)
  }
  return dataDrillSchema.parse({
    id,
    topic: 'finance',
    title,
    prompt: task.prompt,
    answer: `${task.answer}\n\n${task.explanation}\n\nThis is an answer-reveal self-check. Revision does not capture or independently mark your constructed table.`,
  })
})
