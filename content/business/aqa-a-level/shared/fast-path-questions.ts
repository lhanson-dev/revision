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

const retained = releaseBank.questions as AqaBusinessQuestionRecord[]
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
