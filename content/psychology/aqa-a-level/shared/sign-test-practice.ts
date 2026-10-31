/**
 * Issue #698: independently marked AQA 7182 sign-test calculation Practice.
 * Qualification source: Founder-supplied AQA Psychology 7182 v1.4, section
 * 4.2.3.3 (printed p21), mathematical skills section 7.2 (pp35–37).
 * AQA specification is REFERENCE_ONLY. These paired observations, questions
 * and explanations are original Revision work, not exam-board questions.
 *
 * A scored numeric S provides one bounded observation for PSY-07-32.
 * It does NOT verify test selection, critical-value interpretation, written
 * working, an independent later attempt or durable mastery by itself.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

type PairedScore = readonly [number, number]

const cases = [
  {
    id: 'sign-test-01',
    context: 'A psychologist records the number of unrelated words recalled by eight volunteers before and after a memory exercise.',
    pairs: [[4, 6], [7, 7], [6, 4], [5, 9], [9, 10], [8, 6], [3, 5], [10, 11]],
    positive: 5,
    negative: 2,
    ties: 1,
    statistic: 2,
  },
  {
    id: 'sign-test-02',
    context: 'A psychologist compares concentration scores from seven volunteers before and after a quiet-room activity.',
    pairs: [[11, 9], [5, 4], [8, 8], [6, 10], [9, 6], [4, 4], [7, 5]],
    positive: 1,
    negative: 4,
    ties: 2,
    statistic: 1,
  },
] as const satisfies readonly {
  id: string
  context: string
  pairs: readonly PairedScore[]
  positive: number
  negative: number
  ties: number
  statistic: number
}[]

/** Reviewable arithmetic contract; throws if source question data and marking disagree. */
export function signTestCounts(pairs: readonly PairedScore[]) {
  const positive = pairs.filter(([before, after]) => after > before).length
  const negative = pairs.filter(([before, after]) => after < before).length
  const ties = pairs.length - positive - negative
  return { positive, negative, ties, n: positive + negative, S: Math.min(positive, negative) }
}

export const psychologySignTestCaseContracts = cases.map(({ id, pairs, positive, negative, ties, statistic }) => ({
  id,
  pairs,
  expected: { positive, negative, ties, n: positive + negative, S: statistic },
}))

export const psychologySignTestPracticeBank = cases.map((item) => {
  const result = signTestCounts(item.pairs)
  if (result.positive !== item.positive || result.negative !== item.negative
    || result.ties !== item.ties || result.S !== item.statistic) {
    throw new Error('Incorrect authored sign-test key: ' + item.id)
  }
  const scorePairs = item.pairs.map(([before, after]) => `${before} → ${after}`).join('; ')
  return structuredPracticeBankRecordSchema.parse({
    id: item.id,
    batch: '4.2.3',
    label: 'Revision-original paired-score sign-test calculation',
    confidence_label: 'Original arithmetic-verified pilot; educational sign-off pending',
    namespace: 'rev7182',
    topic_id: 'research-methods',
    target_item_ids: ['PSY-07-32'],
    target_node_ids: ['research-methods-psy0732'],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.context,
      stem: `Paired Before → After scores: ${scorePairs}. Mark an increase as +, a decrease as −, and omit ties. Calculate S, the smaller of the plus and minus counts. Enter the number only; the full working is not scored in this quick check.`,
      table: null,
      options: [],
      calcs: [{ stated_answer: item.statistic, unit: 'count' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct smaller sign count S after excluding ties.', accept: [String(item.statistic)] }],
        levels: [],
        indicative_content: [],
        model_answer: `There are ${item.positive} increases, ${item.negative} decreases and ${item.ties} tied pairs. Remove the ties: effective n = ${result.n}. S is the smaller of ${item.positive} and ${item.negative}, so S = ${item.statistic}. This is the sign-test statistic only, not a significance decision; a suitable critical-value table and stated test convention are needed for that.`,
      },
    },
  })
})

export const psychologySignTestRequirementBindings = Object.fromEntries(
  cases.map((item) => [`rev7182-4.2.3-${item.id}`, ['PSY-07-32'] as const]),
)
