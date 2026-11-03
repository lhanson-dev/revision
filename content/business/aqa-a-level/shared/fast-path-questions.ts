import releaseBank from './fast-path-question-bank.json'
import authoredRechecks from './source-mapped-recheck-questions.json'

export type AqaBusinessQuestionRecord = {
  namespace?: string
  id: string
  batch: string
  label: string
  confidence_label: string
  target_item_ids: string[]
  target_node_ids: string[]
  question: {
    id: string
    family: string
    command_word: string
    marks: number
    ao_tags: string[]
    context: string
    stem: string
    table: null | { title?: string; columns: string[]; rows: Array<{ cells: string[] }> }
    options: Array<{ label: string; text: string }>
    /** Worked numbers behind a calculation question. Empty for the rest. */
    calcs: Array<{ stated_answer: number; unit: string }>
    mark_scheme: {
      type?: string
      correct_option?: string
      option_rationale?: string[]
      points?: unknown[]
      levels?: unknown[]
      indicative_content?: unknown[]
      model_answer?: string
    }
  }
}

type LegacyQuestionRecord = Omit<AqaBusinessQuestionRecord, 'batch'> & { batch?: string }

// Preserve all accepted, stable historic bank ids. Additional original
// questions for any AQA 7132 subject section travel through the SAME validated
// pack and Practice adapter as the original 3.5 file imports, not a new route.
const originalSliceQuestionModules = import.meta.glob('../../../../content-factory/slices/aqa-7132-*/questions/q*.json', {
  eager: true,
  import: 'default',
}) as Record<string, LegacyQuestionRecord>

/**
 * #698 §3.4.5: correct an independently identified policy/answer flaw in the
 * historical published 3.4:q20, without overwriting the immutable original
 * source-bank snapshot or changing its global question identity/marks.
 * This single-record correction is applied to the SAME published Practice bank.
 * Original student marks and saved answers are NOT silently regraded.
 */
function clarifiedInventoryQ20(record: AqaBusinessQuestionRecord): AqaBusinessQuestionRecord {
  if (record.batch !== '3.4' || record.id !== 'q20') return record
  const q = record.question
  return {
    ...record,
    question: {
      ...q,
      context: q.context + ' The proposal does not specify a new re-order trigger, order quantity or maximum inventory level. The finance manager has not demonstrated how merely naming a lower buffer would change the actual stock cycle.',
      mark_scheme: {
        ...q.mark_scheme,
        levels: [
          { level: 1, min_marks: 1, max_marks: 3, descriptor: 'Limited understanding of inventory buffers or the re-order trigger; weak application, analysis or judgement.' },
          { level: 2, min_marks: 4, max_marks: 6, descriptor: 'Explains conditional cash and service impacts using PeakBrew data; some analysis of lead time or the necessary order-policy changes, but an incomplete balanced judgement.' },
          { level: 3, min_marks: 7, max_marks: 9, descriptor: 'Balanced, well-applied evaluation that distinguishes a nominal buffer target from a change to re-order policy, tests conditional holding savings against lead-time/promotional risk, and reaches a justified conditional decision.' },
        ],
        indicative_content: [
          'At the existing 700-filter re-order trigger, four days of normal demand at 100 filters per day would consume 400, so stock normally reaches 300 at delivery. Simply relabelling the buffer 100 does not change this physical outcome.',
          'To aim for 100 filters just before a typical four-day delivery, one possible adjustment is a 500-filter re-order trigger (100 plus 400 expected usage). Re-order quantity, maximum stock and the resulting average inventory need review as well.',
          'Only if actual average stock falls by about 200 filters could the monthly holding-cost benefit be approximately 200 times £0.40 = £80. The existing unchanged 700-filter policy does not establish any saving.',
          'If the trigger is lowered to 500 and delivery takes six days, normal sales would consume 600 filters before receipt and could cause stock-out. Promotional demand as high as 160 filters daily increases this risk.',
          'With the original 700 trigger, six days of normal demand would leave 100 rather than 300 filters on receipt; even the current policy faces disruption exposure.',
          'Potentially released cash should be weighed against customer-service costs, lost sales, supplier reliability and PeakBrew customer switching.',
          'An evidence-based conclusion may keep the current 700 trigger, or consider a properly specified lower-stock policy with supplier, emergency-order and promotional-demand protections. Award credit for identifying the missing policy mechanism.',
        ],
        model_answer: `Reducing PeakBrew's stock could release cash, but the finance manager has not explained how the proposed 100-filter buffer would be achieved. The existing re-order level is 700 filters and typical sales are 100 per day. In the usual four-day lead time, PeakBrew sells 400 filters, leaving 300 on receipt. Simply calling the buffer 100 while retaining the 700 trigger, existing order quantity and timing does not reduce inventory or save money.

One possible operating change would be to lower the re-order trigger to 500 filters, because 400 are normally used during lead time and 100 would then remain on receipt. Management must also consider the order quantity and maximum inventory level. If such a policy genuinely lowered average holdings by 200 filters, it could save approximately £80 per month (200 × £0.40), but that is a conditional illustration, not a benefit proved under the unchanged current policy.

The risk could outweigh the saving. If a new order were placed at 500 and the supplier took six days, sales of 100 per day would need 600 filters before receipt, leading to a stock-out before delivery unless PeakBrew intervened. A promotional weekend raising demand to 160 daily could deplete stock even faster. Customers might then switch to competitors. Even under the original 700 trigger, a six-day lead time would leave only 100 filters before receipt, illustrating that the present system also has risks.

I would not simply announce a lower buffer now. PeakBrew should check supplier delivery reliability, the real cost of a stock-out and seasonal demand, then specify any revised re-order trigger, order quantity and contingency stock. A lower-stock trial could be justified if dependable delivery and accurate forecasts reduce risk and actual average stock confirms the cash saving. Otherwise, retaining the existing protection is safer.`,
      },
    },
  }
}
const retained = (releaseBank.questions as AqaBusinessQuestionRecord[]).map(clarifiedInventoryQ20)
// B2a: small Revision-original *different scenarios* explicitly mapped to
// existing single-target AQA course truth, not copies or repetitions of the
// source bank's worked answers. External educational review remains tracked.
const independentRechecks = authoredRechecks.questions as AqaBusinessQuestionRecord[]
const originalSlices = Object.entries(originalSliceQuestionModules).map(([path, record]): AqaBusinessQuestionRecord => {
  const section = path.match(/aqa-7132-(3\.(?:10|[1-9]))\/questions\//)?.[1]
  if (!record.batch && !section) throw new Error(`Cannot identify exact Business question slice from ${path}`)
  if (record.batch && section && record.batch !== section) {
    throw new Error(`Business question slice mismatch for ${path}: declared ${record.batch}, directory ${section}`)
  }
  return { ...record, batch: record.batch ?? section! }
})

export const aqaBusinessQuestionBank: readonly AqaBusinessQuestionRecord[] = [
  ...retained,
  ...originalSlices,
  ...independentRechecks,
].sort((left, right) =>
  left.batch.localeCompare(right.batch, undefined, { numeric: true })
  || left.id.localeCompare(right.id, undefined, { numeric: true }),
)

// Stable global question identity is required for genuine independent attempts.
const allPublishedIds = aqaBusinessQuestionBank.map((entry) =>
  `${entry.namespace ?? 'aqa7132'}-${entry.batch}-${entry.id}`)
if (new Set(allPublishedIds).size !== allPublishedIds.length) {
  throw new Error('Duplicate published Business AQA practice question identity')
}
