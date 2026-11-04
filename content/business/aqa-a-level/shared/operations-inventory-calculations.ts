import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

/**
 * #698 AQA Business 7132 v2.0 §3.4.5, printed p19, REFERENCE_ONLY.
 * Original numeric Practice from chart event DATA, not an on-screen chart
 * response. These items score final numbers only and cannot certify visual
 * chart interpretation, reasoning, written AO3/AO4 or construction.
 */
export const businessOperationsInventoryCases = [
  {
    id: 'inventory-reorder-quantity-cartons-01',
    target: 'aqa-7132-3.4.5:re-order-quantity',
    context: 'An inventory-control record for a small distributor shows that 200 cartons remained immediately before a delivery. The receipt raised stock to 1,800 cartons. The order trigger is recorded separately at 800 cartons.',
    stem: 'Calculate the quantity of cartons delivered. Enter one final number in cartons; only the final value is marked.',
    expected: 1600,
    unit: 'cartons',
    working: 'Re-order quantity represented by the delivery = 1,800 − 200 = 1,600 cartons. Do not subtract the 800-carton re-order trigger: that is when an order is placed, not stock necessarily held on delivery.',
  },
  {
    id: 'inventory-reorder-quantity-jars-02',
    target: 'aqa-7132-3.4.5:re-order-quantity',
    context: 'A producer records stock of 175 jars immediately before a delivery on Tuesday. That receipt increases the stock level to 1,325 jars. Its re-order trigger is 480 jars.',
    stem: 'Calculate the number of jars received in the delivery. Enter one final number; only the result is marked.',
    expected: 1150,
    unit: 'jars',
    working: 'Delivery quantity = 1,325 jars after delivery − 175 jars before delivery = 1,150 jars. The order trigger is not an amount to subtract.',
  },
  {
    id: 'inventory-lead-time-delivery-day-01',
    target: 'aqa-7132-3.4.5:lead-time',
    context: 'An order for spare parts is placed at the recorded re-order level on day 4. The supplier delivers the parts on day 11. Assume day numbers indicate the same continuous business timeline.',
    stem: 'Calculate the supplier lead time in days. Enter one final number; only the final value is marked.',
    expected: 7,
    unit: 'days',
    working: 'Lead time = day of receipt − day order placed = 11 − 4 = 7 days. Do not mistake the time to hit the re-order trigger for the delivery lead time.',
  },
  {
    id: 'inventory-lead-time-delivery-day-02',
    target: 'aqa-7132-3.4.5:lead-time',
    context: 'A florist orders new packaging at the stock trigger on day 8 of its inventory cycle. The supplier delivers at the end of day 13. In this case, the chart records the order and receipt as event points at days 8 and 13, respectively.',
    stem: 'Calculate the lead time between the plotted order and receipt events in days. Enter one final number; only the result is marked.',
    expected: 5,
    unit: 'days',
    working: 'Lead time shown by the event positions = day 13 − day 8 = 5 days. This time gap must not be confused with an inventory quantity.',
  },
] as const

export const businessOperationsInventoryBank = businessOperationsInventoryCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    namespace: 'rev7132',
    batch: '3.4.5',
    id: item.id,
    label: 'Original inventory event final-number Practice',
    confidence_label: 'Single-target numeric result; no actual unseen chart diagram or written interpretation scored',
    topic_id: 'operations',
    target_item_ids: [item.target],
    target_node_ids: ['operations-inventory-control-chart'],
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
      calcs: [{ stated_answer: item.expected, unit: item.unit, answer_rule: 'exact-integer' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct final quantity or elapsed time for the explicitly named chart event.', accept: [String(item.expected)] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
