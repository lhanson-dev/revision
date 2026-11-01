/**
 * Issue #698: original AQA 7182 Research Methods two-tailed critical-value
 * lookup and graphical construction Practice candidates.
 * Board reference: Founder-supplied AQA Psychology 7182 v1.4, §4.2.3.3
 * (printed p21), mathematical annex §7.2 (pp35–37), REFERENCE_ONLY.
 * Numerical data, table, questions, decisions and feedback are Revision-authored.
 *
 * Each scored item checks only one critical-value lookup from a supplied table
 * (PSY-SRC-4233-IT05), NOT the significance judgement, written justification,
 * test selection, complete inferential competence or durable mastery.
 * The scatter exercise is on-paper and self-marked; no graph-construction score.
 */
import { dataDrillSchema } from '../../../schema'
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

/** Exact two-tailed binomial sign-test tail, used for answer-key verification. */
function combinations(n: number, k: number): number {
  let result = 1
  for (let j = 1; j <= k; j++) result = (result * (n - j + 1)) / j
  return Math.round(result)
}

export function signTestTwoTailProbability(n: number, smallerSignCount: number): number {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(smallerSignCount)
      || smallerSignCount < 0 || smallerSignCount > Math.floor(n / 2)) {
    throw new Error('Invalid two-tailed sign-test input')
  }
  const lowerTail = Array.from({ length: smallerSignCount + 1 }, (_, k) => combinations(n, k))
    .reduce((sum, count) => sum + count, 0) / 2 ** n
  return Math.min(1, 2 * lowerTail)
}

export function signTestTwoTailCritical(n: number, alpha: number): number {
  if (!Number.isInteger(n) || n < 1 || ![0.05, 0.01].includes(alpha)) throw new Error('Invalid critical-value lookup')
  let critical = -1
  for (let s = 0; s <= Math.floor(n / 2); s++) {
    if (signTestTwoTailProbability(n, s) <= alpha + 1e-12) critical = s
  }
  return critical
}

const criticalTable = [
  { n: 8, fivePercent: 0, onePercent: 0 },
  { n: 9, fivePercent: 1, onePercent: 0 },
  { n: 10, fivePercent: 1, onePercent: 0 },
  { n: 11, fivePercent: 1, onePercent: 0 },
  { n: 12, fivePercent: 2, onePercent: 1 },
] as const

export const psychologyOriginalSignCriticalTable = criticalTable

const cases = [
  { id: 'sign-critical-lookup-01', n: 9, alpha: 0.05, S: 1, critical: 1 },
  { id: 'sign-critical-lookup-02', n: 12, alpha: 0.05, S: 3, critical: 2 },
  { id: 'sign-critical-lookup-03', n: 12, alpha: 0.01, S: 2, critical: 1 },
] as const

for (const row of criticalTable) {
  if (signTestTwoTailCritical(row.n, 0.05) !== row.fivePercent
      || signTestTwoTailCritical(row.n, 0.01) !== row.onePercent) {
    throw new Error('Wrong original critical-value table row: ' + row.n)
  }
}
for (const item of cases) {
  if (signTestTwoTailCritical(item.n, item.alpha) !== item.critical) {
    throw new Error('Wrong critical-value lookup answer: ' + item.id)
  }
}

export const psychologySignCriticalCaseContracts = cases

export const psychologySignCriticalPracticeBank = cases.map((item) =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    batch: '4.2.3',
    namespace: 'rev7182',
    label: 'Revision-original statistical-table lookup',
    confidence_label: 'Original arithmetic-checked pilot; independent A3 review pending',
    topic_id: 'research-methods',
    target_item_ids: ['PSY-SRC-4233-IT05'],
    target_node_ids: ['research-methods-psy0733'],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Identify',
      marks: 1,
      ao_tags: ['AO2'],
      context: 'An original Psychology study uses a two-tailed sign test. Tied pairs have already been excluded from effective n. The table is an original Revision practice table calculated from the exact binomial distribution, not an official AQA critical-value table.',
      stem: `The test has effective n = ${item.n} and observed S = ${item.S}. Using the supplied two-tailed table, identify the critical S value at the ${Math.round(item.alpha * 100)}% level. Enter that critical value as a whole number. This quick check scores the table lookup, not your significance conclusion.`,
      table: {
        title: 'Revision practice: two-tailed sign-test critical S values',
        columns: ['Effective n (ties excluded)', '5% significance', '1% significance'],
        rows: criticalTable.map(row => ({ cells: [String(row.n), String(row.fivePercent), String(row.onePercent)] })),
      },
      options: [],
      calcs: [{ stated_answer: item.critical, unit: '', answer_rule: 'exact-integer' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct two-tailed critical value for the given effective n and significance level.', accept: [String(item.critical)] }],
        levels: [],
        indicative_content: [],
        model_answer: `Find effective n = ${item.n} in the left column and read across to the ${Math.round(item.alpha * 100)}% column. The critical S is ${item.critical}. For this two-tailed sign test, the observed S = ${item.S} is ${item.S <= item.critical ? 'at or below' : 'above'} the critical value, so the result ${item.S <= item.critical ? 'is' : 'is not'} significant at the stated level under the sign-test assumptions. This interpretation is feedback, not a separately scored judgement. A one-tailed test needs a directional rule, not an automatic reuse of the smaller-sign-count comparison.`,
      },
    },
  }),
)

export const psychologySignCriticalDrills = [
  dataDrillSchema.parse({
    id: 'psy-rm-sign-critical-interpret-01',
    title: 'Read the sign-test table and explain the decision',
    prompt: 'On paper, using the Revision practice table in the Research Methods sign-test critical-value questions, compare (a) n=9, two-tailed 5%, observed S=1; (b) n=12, two-tailed 5%, observed S=3; (c) n=12, two-tailed 1%, observed S=2. For each, write the critical value, the correct comparison and a conclusion. State why ties do not enter effective n. This explanation is self-checked, not automatically marked.',
    answer: '(a) Critical S=1: observed 1 ≤ 1, significant at 5%. (b) Critical S=2: observed 3 > 2, not significant at 5%. (c) Critical S=1: observed 2 > 1, not significant at 1%. For a two-tailed sign test, a smaller S at or below the critical value supports rejection of the null hypothesis. Ties provide no directional sign and are excluded from effective n. Not significant does not prove the null hypothesis true.',
  }),
  dataDrillSchema.parse({
    id: 'psy-rm-scatterplot-construction-01',
    title: 'Construct and interpret a scatterplot',
    prompt: 'On paper, plot this original correlational study as a scatterplot: hours of sleep (x) 4, 5, 6, 7, 8; next-day concentration score (y) 5, 7, 6, 9, 11. Give both axes names and scales, plot each coordinate (4,5), (5,7), (6,6), (7,9), (8,11), describe the general direction, and explain whether the plot proves causation. Compare your graph against the answer notes; this construction is not independently marked in Revision.',
    answer: 'Plot five distinct points (4,5), (5,7), (6,6), (7,9), (8,11). Horizontal axis = sleep hours, scale 4–8 in 1-hour steps; vertical axis = concentration score, scale covering at least 5–11. The data show a generally positive association (higher sleep often accompanies a higher concentration score), with one local reversal between 5 and 6 hours. A scatterplot of observational data cannot establish that sleep causes the score change. This is on-paper self-assessment only.',
  }),
]
