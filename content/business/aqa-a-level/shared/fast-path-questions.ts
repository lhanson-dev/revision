import releaseBank from './fast-path-question-bank.json'

export type AqaBusinessQuestionRecord = {
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

const originalFinancialModules = import.meta.glob('../../../../content-factory/slices/aqa-7132-3.5/questions/q*.json', {
  eager: true,
  import: 'default',
}) as Record<string, AqaBusinessQuestionRecord>

const retained = releaseBank.questions as AqaBusinessQuestionRecord[]

export const aqaBusinessQuestionBank: readonly AqaBusinessQuestionRecord[] = [
  ...retained,
  ...Object.values(originalFinancialModules),
].sort((left, right) =>
  left.batch.localeCompare(right.batch, undefined, { numeric: true })
  || left.id.localeCompare(right.id, undefined, { numeric: true }),
)
