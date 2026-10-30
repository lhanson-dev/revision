/** Issue #698 — AQA A-level Business 7132 v2.0 §3.2.2, printed page 14.
 * Original, independently marked final values for decision-tree arithmetic.
 * These do not mark a drawn tree, intermediate working or a business judgement.
 * The current applicable specification is reference-only: no protected AQA
 * question, source prose or mark scheme is reproduced.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessDecisionTreeNumericCases = [
  {
    id: 'expected-value-01',
    target: 'aqa-7132-3.2.2:expected-value',
    node: 'bus-evi-004',
    context: 'An independent ferry operator is considering a weekend sightseeing service. Its estimated financial outcomes, before any additional investment costs, are a £150,000 gain with probability 0.60 and a £40,000 loss with probability 0.40.',
    prompt: 'Calculate the expected value of the two financial outcomes, in pounds. Enter one signed final number; the working and any decision-tree drawing are not marked.',
    expected: 74000,
    working: 'Expected value = (0.60 × £150,000) + (0.40 × −£40,000) = £90,000 − £16,000 = £74,000. It is a probability-weighted average, not a certain profit.',
  },
  {
    id: 'expected-value-02',
    target: 'aqa-7132-3.2.2:expected-value',
    node: 'bus-evi-004',
    context: 'An original recheck case: a small theatre is evaluating a touring production. It estimates a £240,000 financial gain with probability 0.25, or a £20,000 loss with probability 0.75. These are outcomes before any fixed project cost.',
    prompt: 'Calculate the expected value of these possible outcomes in pounds. Enter one signed final number. Only the final numerical value is marked.',
    expected: 45000,
    working: 'Expected value = (0.25 × £240,000) + (0.75 × −£20,000) = £60,000 − £15,000 = £45,000. The negative branch must be subtracted, not added.',
  },
  {
    id: 'net-gain-01',
    target: 'aqa-7132-3.2.2:net-gain',
    node: 'bus-evi-004',
    context: 'A bicycle-repair chain considers launching mobile servicing. Before the certain £12,000 launch cost, a strong outcome would generate £80,000 with probability 0.70; a weak outcome would lose £20,000 with probability 0.30.',
    prompt: 'Calculate the net gain in pounds after subtracting the certain £12,000 launch cost from the expected value. Enter one signed final number only.',
    expected: 38000,
    working: 'Expected value = (0.70 × £80,000) + (0.30 × −£20,000) = £56,000 − £6,000 = £50,000. Net gain = £50,000 − £12,000 = £38,000. A positive net gain does not remove risk.',
  },
  {
    id: 'net-gain-02',
    target: 'aqa-7132-3.2.2:net-gain',
    node: 'bus-evi-004',
    context: 'An original independent case: a book publisher assesses an audiobook series. Before the fixed production cost of £18,500, the series could produce £125,000 with probability 0.55 or a £45,000 loss with probability 0.45.',
    prompt: 'Calculate the net gain from the series in pounds, including the fixed £18,500 production cost. Enter one signed final number; your workings are not marked.',
    expected: 30000,
    working: 'Expected value = (0.55 × £125,000) + (0.45 × −£45,000) = £68,750 − £20,250 = £48,500. Net gain = £48,500 − £18,500 = £30,000. An expected value should not be confused with a guaranteed result.',
  },
] as const

export const businessDecisionTreeNumericBank = businessDecisionTreeNumericCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    namespace: 'rev7132',
    batch: '3.2.2',
    label: 'Revision-original decision-tree final-value calculation',
    confidence_label: 'Final numerical answer checked; working and business judgement not assessed',
    topic_id: 'leadership',
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
        points: [{ marks: 1, descriptor: 'Correct single final numerical value.', accept: [String(item.expected)] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
