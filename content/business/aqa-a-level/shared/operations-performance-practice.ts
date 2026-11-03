import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

/**
 * Issue #698 — original, single-target AQA 7132 §3.4.2 quantitative Practice.
 * Official specification v2.0, printed p18, is REFERENCE_ONLY.
 * Two different original cases for each named capability support independent
 * final-number checks. They DO NOT mark working, interpretation or AO3/AO4.
 * Existing published IDs and historical learner results remain unchanged.
 */
export const businessOperationsPerformanceCases = [
  {
    id: 'weekly-capacity-packaging-01',
    target: 'aqa-7132-3.4.2:capacity',
    node: 'bus-ops-003',
    context: 'A packaging machine is staffed for 7 productive hours each day, 5 days per week. Under these stated conditions, the machine can pack 120 boxes per hour. Assume the effective rate is sustained across the available productive hours.',
    stem: 'Calculate the maximum number of boxes the machine can pack in one week. Enter one final number in boxes; only the final value is marked.',
    expected: 4200,
    unit: 'boxes per week',
    working: 'Maximum weekly capacity = 120 boxes per hour × 7 productive hours per day × 5 days = 4,200 boxes per week. This is possible output, not actual output or utilisation.',
  },
  {
    id: 'weekly-capacity-technicians-02',
    target: 'aqa-7132-3.4.2:capacity',
    node: 'bus-ops-003',
    context: 'A repair service has 5 technicians. Each can complete up to 6 standard appointments per day, and the service operates 4 days per week. Assume those rates can be sustained without a shared bottleneck.',
    stem: 'Calculate the service’s maximum appointment capacity for one week. Enter one final number; only the result is marked.',
    expected: 120,
    unit: 'appointments per week',
    working: 'Maximum weekly capacity = 5 technicians × 6 appointments per technician per day × 4 days = 120 appointments per week. Do not confuse maximum capacity with appointments actually completed.',
  },
  {
    id: 'monthly-labour-productivity-01',
    target: 'aqa-7132-3.4.2:labour-productivity',
    node: 'bus-ops-004',
    context: 'A food producer completes 19,200 packaged meals in one month using 48 production employees throughout that month.',
    stem: 'Calculate the number of packaged meals produced per employee in that month. Enter one final number; only the final value is marked.',
    expected: 400,
    unit: 'meals per employee per month',
    working: 'Labour productivity = 19,200 packaged meals ÷ 48 production employees = 400 meals per employee per month. Total output alone is not productivity.',
  },
  {
    id: 'weekly-labour-productivity-02',
    target: 'aqa-7132-3.4.2:labour-productivity',
    node: 'bus-ops-004',
    context: 'An IT service desk completes 1,560 customer enquiries in a week. Twelve equally allocated service employees handled those enquiries over the same period.',
    stem: 'Calculate completed enquiries per service employee for the week. Enter one final number; only the final value is scored.',
    expected: 130,
    unit: 'enquiries per employee per week',
    working: 'Labour productivity = 1,560 enquiries ÷ 12 service employees = 130 enquiries per employee per week. The result does not show service quality.',
  },
  {
    id: 'monthly-unit-cost-trays-01',
    target: 'aqa-7132-3.4.2:unit-cost-average-cost',
    node: 'bus-ops-004',
    context: 'A factory incurs £96,000 total production costs in a month when it makes 7,500 identical reusable food trays.',
    stem: 'Calculate the average production cost per tray in pounds. Enter one final number; only the result is marked.',
    expected: 12.8,
    unit: '£',
    working: 'Average cost per unit = total production costs ÷ units produced = £96,000 ÷ 7,500 = £12.80 per tray. Do not divide output by total costs or substitute selling price.',
  },
  {
    id: 'monthly-unit-cost-bottles-02',
    target: 'aqa-7132-3.4.2:unit-cost-average-cost',
    node: 'bus-ops-004',
    context: 'A manufacturer makes 18,000 bottles in a month. Its total production costs for that month are £261,000.',
    stem: 'Calculate the average production cost for one bottle in pounds. Enter one final number; only the result is marked.',
    expected: 14.5,
    unit: '£',
    working: 'Unit cost = £261,000 total monthly production cost ÷ 18,000 bottles = £14.50 per bottle. It is not the selling price or the contribution per unit.',
  },
  {
    id: 'weekly-capacity-utilisation-01',
    target: 'aqa-7132-3.4.2:capacity-utilisation',
    node: 'bus-ops-003',
    context: 'A furniture workshop can complete 4,800 repairs in a week at maximum practical capacity. It actually completes 3,120 repairs in that same week.',
    stem: 'Calculate capacity utilisation as a percentage for that week. Enter one final percentage number; only the result is marked.',
    expected: 65,
    unit: '%',
    working: 'Capacity utilisation = actual repairs ÷ possible repairs × 100 = 3,120 ÷ 4,800 × 100 = 65%. The unused capacity is not itself proof of poor efficiency.',
  },
  {
    id: 'daily-capacity-utilisation-02',
    target: 'aqa-7132-3.4.2:capacity-utilisation',
    node: 'bus-ops-003',
    context: 'A bakery has maximum feasible daily output of 4,800 loaves. On Tuesday it makes 4,320 loaves. Both values use the same day and operating assumptions.',
    stem: 'Calculate Tuesday’s capacity utilisation as a percentage. Enter one final percentage number; only the result is marked.',
    expected: 90,
    unit: '%',
    working: 'Capacity utilisation = 4,320 ÷ 4,800 × 100 = 90%. This does not establish that the bakery has no quality or queueing problems.',
  },
] as const

export const businessOperationsPerformanceBank = businessOperationsPerformanceCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    namespace: 'rev7132',
    batch: '3.4.2',
    id: item.id,
    label: 'Revision-original Operations final-number calculation',
    confidence_label: 'Deterministic single-target result only; method, graphing, interpretation and evaluation unassessed',
    topic_id: 'operations',
    target_item_ids: [item.target],
    target_node_ids: [item.node],
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
      calcs: [{ stated_answer: item.expected, unit: item.unit }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct final result for the exact named operational measure and period.', accept: [String(item.expected)] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
