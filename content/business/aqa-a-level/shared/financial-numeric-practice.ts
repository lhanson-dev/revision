/**
 * Issue #698 — original numeric checks for AQA 7132 v2.0, §3.5.2 (printed p20).
 * Learners type ONE final numerical answer. Worked calculation is shown after
 * marking but construction, working and interpretation are NOT marked.
 * No AQA questions or protected specification prose are reproduced.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessFinanceNumericCases = [
  {
    id: 'budgeted-profit-01',
    item: 'aqa-7132-3.5.2:budgets-income-expenditure-profit',
    node: 'bus-fin-007',
    situation: 'An original practice case: a workshop plans next quarter’s income of £93,000. It budgets £31,000 for parts, £27,000 for wages and £13,000 for overheads.',
    prompt: 'Calculate the total budgeted profit for the quarter in pounds. Enter a single number, without a currency symbol. Only your final value is marked.',
    expected: 22000,
    working: 'Budgeted total expenditure = £31,000 + £27,000 + £13,000 = £71,000. Budgeted profit = £93,000 − £71,000 = £22,000.',
  },
  {
    id: 'adverse-cost-variance-01',
    item: 'aqa-7132-3.5.2:variance-analysis',
    node: 'bus-fin-007',
    situation: 'An original practice case: a repair shop budgets £27,000 for parts and actually spends £29,800.',
    prompt: 'Calculate its cost variance using actual spending minus budget, in pounds. Enter one signed number. Only the numerical difference is marked, not your explanation.',
    expected: 2800,
    working: 'Actual minus budget = £29,800 − £27,000 = +£2,800. Because this is a cost overspend, this is an adverse variance. A positive variance is NOT always favourable.',
  },
  {
    id: 'adverse-sales-variance-01',
    item: 'aqa-7132-3.5.2:adverse-and-favourable-variances',
    node: 'bus-fin-007',
    situation: 'An original practice case: a local service firm budgets £91,000 of income but actually receives £84,000 of income for the period.',
    prompt: 'Using actual minus budget, calculate the income variance in pounds. Enter one signed number. Only your numerical value is marked.',
    expected: -7000,
    working: 'Actual income − budgeted income = £84,000 − £91,000 = −£7,000. This is an adverse income variance; the negative sign matters under the stated convention.',
  },
  {
    id: 'two-month-closing-cash-01',
    item: 'aqa-7132-3.5.2:cash-flow-forecast',
    node: 'bus-fin-005',
    situation: 'An original practice case: a café starts January with £9,000 cash. January receipts/payments are £26,000/£31,000. February receipts/payments are £18,000/£25,000.',
    prompt: 'Construct the two-month cash-flow calculation. What is February’s closing balance in pounds after carrying January’s closing balance forward? Enter one signed number; the table and your working are not independently marked.',
    expected: -3000,
    working: 'January: net £26,000 − £31,000 = −£5,000, closing £9,000 − £5,000 = £4,000. February opens at £4,000, net £18,000 − £25,000 = −£7,000, closing £4,000 − £7,000 = −£3,000. The negative closing balance signals a potential financing shortfall, not an accounting loss.',
  },
  {
    id: 'two-month-closing-cash-02',
    item: 'aqa-7132-3.5.2:cash-flow-forecast',
    node: 'bus-fin-005',
    situation: 'An independent original recheck: a printer starts April with £12,000 cash. April receipts/payments are £15,000/£17,000. May receipts/payments are £14,000/£19,000.',
    prompt: 'What is May’s forecast closing cash balance in pounds, after carrying forward April’s closing balance? Enter one signed number. Only your final value is marked.',
    expected: 5000,
    working: 'April net cash = £15,000 − £17,000 = −£2,000, closing = £10,000. May net cash = £14,000 − £19,000 = −£5,000; May closing = £10,000 − £5,000 = £5,000. This demonstrates carrying each closing balance into the next period.',
  },
  {
    id: 'delayed-receivable-01',
    item: 'aqa-7132-3.5.2:timing-of-payables-and-receivables',
    node: 'bus-fin-005',
    situation: 'An original practice case: a firm opens June with £4,000 cash, expects £23,000 receipts and £25,000 payments, but a £6,000 customer receipt moves from June to July. Assume no other changes.',
    prompt: 'Calculate the revised June forecast closing cash balance in pounds. Enter one signed number. Only the numerical answer is independently scored.',
    expected: -4000,
    working: 'Revised June receipts = £23,000 − £6,000 = £17,000. June net cash = £17,000 − £25,000 = −£8,000. June closing = opening £4,000 − £8,000 = −£4,000. The delayed receivable raises the near-term financing requirement by £6,000 even if later cash ultimately arrives.',
  },
] as const

export const businessFinanceNumericPracticeBank = businessFinanceNumericCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    batch: '3.5.2',
    namespace: 'rev7132',
    label: 'Revision-original Finance final-value calculation',
    confidence_label: 'Original calculation independently checked by deterministic test',
    topic_id: 'finance',
    target_item_ids: [item.item],
    target_node_ids: [item.node],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.situation,
      stem: item.prompt,
      table: null,
      options: [],
      calcs: [{ stated_answer: item.expected, unit: '£' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct final numerical answer under the stated sign and cash-timing conventions.', accept: [`${item.expected}`] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
