/** Issue #698: Original AQA Business 7132 v2.0 §3.2.2 decision-tree
 * expected-value and net-gain final-answer checks (printed p14).
 * Reuse canonical ContentPack/Practice adapter; answer only, not tree drawings,
 * probability explanation, business evaluation or persisted exact-skill mastery.
 * Awarding-body requirements are REFERENCE_ONLY. Original Revision contexts.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessDecisionTreeNumericalCases = [
  {
    "id": "expected-value-01",
    "target": "aqa-7132-3.2.2:expected-value",
    "context": "A UK bicycle repair firm considers offering a mobile workshop. If demand is strong (probability 0.60), the project's contribution before any fixed launch costs will be £150,000. If demand is weak (probability 0.40), the contribution will be £20,000. Assume these outcomes are mutually exclusive and exhaustive.",
    "stem": "Calculate the expected value of the contribution in pounds before any separate launch costs. Enter one number; your workings are not marked.",
    "expected": 98000,
    "working": "Expected value = (0.60 × £150,000) + (0.40 × £20,000) = £90,000 + £8,000 = £98,000. This is a probability-weighted average, not a guaranteed return."
  },
  {
    "id": "expected-value-02",
    "target": "aqa-7132-3.2.2:expected-value",
    "context": "An original alternative case: a small events organiser considers a new autumn market. There is a 0.25 probability of a £210,000 contribution and a 0.75 probability of a £30,000 loss (shown as −£30,000), before any separate fixed costs.",
    "stem": "Calculate the expected value in pounds, taking account of the negative outcome. Enter one signed number; only the final answer is marked.",
    "expected": 30000,
    "working": "Expected value = (0.25 × £210,000) + (0.75 × −£30,000) = £52,500 − £22,500 = £30,000. Do not turn the loss outcome into a positive cash inflow."
  },
  {
    "id": "net-gain-01",
    "target": "aqa-7132-3.2.2:net-gain",
    "context": "A company is appraising a warehouse automation option. Before its certain investment cost, the project has a 0.55 chance of a £180,000 financial outcome and a 0.45 chance of a £40,000 outcome. The one-off certain investment cost is £70,000 and is not included in either outcome.",
    "stem": "Calculate the project's net gain in pounds: first find its expected value, then subtract the stated certain cost once. Enter the final number only.",
    "expected": 47000,
    "working": "Expected value = (0.55 × £180,000) + (0.45 × £40,000) = £99,000 + £18,000 = £117,000. Net gain = £117,000 − £70,000 = £47,000. Do not subtract the certain cost once from every probability-weighted outcome."
  },
  {
    "id": "net-gain-02",
    "target": "aqa-7132-3.2.2:net-gain",
    "context": "A different original case: a small catering firm may start a delivery service. The outcomes before a certain £45,000 startup cost are £200,000 with probability 0.40 and a loss of £20,000 with probability 0.60. The certain startup cost is separate from the outcome figures.",
    "stem": "Calculate the delivery option's net gain in pounds, allowing for the loss outcome and subtracting the startup cost exactly once. Enter the final number only.",
    "expected": 23000,
    "working": "Expected value = (0.40 × £200,000) + (0.60 × −£20,000) = £80,000 − £12,000 = £68,000. Net gain = £68,000 − £45,000 = £23,000. A positive expected net gain does not guarantee a profitable outcome or remove risk."
  }
] as const

export const businessDecisionTreeNumericalBank = businessDecisionTreeNumericalCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    namespace: 'rev7132',
    batch: '3.2.2',
    label: 'Revision-original decision tree final-number calculation',
    confidence_label: 'Deterministic final answer; no credit for workings or examiner-grade reasoning',
    topic_id: 'leadership',
    target_item_ids: [item.target],
    target_node_ids: ['bus-evi-004'],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.context,
      stem: item.stem,
      table: null,
      options: [],
      calcs: [{ stated_answer: item.expected, unit: '£' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{marks: 1, descriptor: 'Correct final numerical result in pounds, with the sign of any loss respected.', accept: [String(item.expected)]}],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
