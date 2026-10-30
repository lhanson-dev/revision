/** #698 AQA 7132 v2.0 §3.1.1, official printed pp11–12.
 * Original, single-final-value Practice only: no marking of workings, strategic
 * judgement or full specification mastery. All figures are Revision-authored.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessPurposeProfitNumericCases = [
  {
    id: 'revenue-01',
    target: 'aqa-7132-3.1.1:revenue',
    node: 'bus-fnd-005',
    context: 'A small printer sells 320 personalised notebooks at £27 each during June.',
    prompt: 'Calculate the June sales revenue in pounds. Enter the final number only; your method is not marked.',
    expected: 8640,
    working: 'Revenue = 320 × £27 = £8,640. This is sales revenue before deducting costs, not profit.',
  },
  {
    id: 'total-cost-01',
    target: 'aqa-7132-3.1.1:total-costs',
    node: 'bus-fin-002',
    context: 'A joinery workshop makes 450 shelves. Its fixed costs for this order are £7,400 and variable costs are £12 per shelf.',
    prompt: 'Calculate total costs for this order in pounds. Enter the final number only.',
    expected: 12800,
    working: 'Total variable costs = 450 × £12 = £5,400. Total costs = £7,400 fixed + £5,400 variable = £12,800.',
  },
  {
    id: 'profit-01',
    target: 'aqa-7132-3.1.1:profit',
    node: 'bus-fnd-005',
    context: 'A café sells 350 sandwiches at £12 each. Variable cost is £4.50 per sandwich, and fixed costs for the period are £1,800.',
    prompt: 'Calculate the profit for the period in pounds, after both variable and fixed costs. Enter the final number only.',
    expected: 825,
    working: 'Revenue = 350 × £12 = £4,200. Variable costs = 350 × £4.50 = £1,575. Total costs = £1,575 + £1,800 = £3,375. Profit = £4,200 − £3,375 = £825. This is not a measure of cash on hand.',
  },
  {
    id: 'profit-02',
    target: 'aqa-7132-3.1.1:profit',
    node: 'bus-fnd-005',
    context: 'An independent original case: a small manufacturer sells 600 components at £18 each. Variable cost is £11.25 per component and fixed costs for the period are £2,400.',
    prompt: 'Calculate this manufacturer’s profit for the period in pounds, after all stated costs. Enter the final number only.',
    expected: 1650,
    working: 'Revenue = 600 × £18 = £10,800. Variable costs = 600 × £11.25 = £6,750. Total costs = £6,750 + £2,400 = £9,150. Profit = £10,800 − £9,150 = £1,650. This second context is not proof of a later independent skill-level recheck.',
  },
] as const

export const businessPurposeProfitNumericBank = businessPurposeProfitNumericCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    namespace: 'rev7132',
    batch: '3.1.1',
    label: 'Revision-original Business purpose/profit calculation',
    confidence_label: 'Final numerical answer independently checked by deterministic test',
    topic_id: 'business',
    target_item_ids: [item.target],
    target_node_ids: [item.node],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.context,
      stem: item.prompt,
      table: null,
      options: [],
      calcs: [{ stated_answer: item.expected, unit: '£' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct single final numerical result for the original scenario.', accept: [String(item.expected)] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
