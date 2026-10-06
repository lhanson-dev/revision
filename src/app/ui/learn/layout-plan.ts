import type { LearnBlock, LearnPage } from '../../../../content/learn-schema'

type BlockOf<T extends LearnBlock['type']> = Extract<LearnBlock, { type: T }>

/** One placed item on a Learn page. `margin-row` is an explanation with its key idea in the right-hand margin. */
export type LearnLayoutItem =
  | { kind: 'block'; block: LearnBlock; key: string }
  | { kind: 'margin-row'; explanation: BlockOf<'explanation'>; keyIdea: BlockOf<'key-idea'>; key: string }

/**
 * Placement rules, from the block types alone (never from the course or the page):
 * - content order is kept, except that `recap` always renders last;
 * - an `explanation` followed directly by a `key-idea` becomes one margin row (desktop puts the
 *   key idea in the margin; tablet and phone stack them in content order);
 * - every other block is full width.
 */
export function planLearnLayout(blocks: readonly LearnBlock[]): LearnLayoutItem[] {
  const ordered = [
    ...blocks.map((block, index) => ({ block, index })).filter(({ block }) => block.type !== 'recap'),
    ...blocks.map((block, index) => ({ block, index })).filter(({ block }) => block.type === 'recap'),
  ]
  const items: LearnLayoutItem[] = []
  for (let position = 0; position < ordered.length; position += 1) {
    const { block, index } = ordered[position]
    const following = ordered[position + 1]
    if (block.type === 'explanation' && following?.block.type === 'key-idea') {
      items.push({ kind: 'margin-row', explanation: block, keyIdea: following.block, key: `${block.type}-${index}` })
      position += 1
    } else {
      items.push({ kind: 'block', block, key: `${block.type}-${index}` })
    }
  }
  return items
}

function textOf(block: LearnBlock): string[] {
  switch (block.type) {
    case 'explanation': return [block.heading ?? '', ...block.paragraphs]
    case 'key-idea': return block.definitions.flatMap((item) => [item.term, item.definition])
    case 'example': return [block.title ?? '', ...block.paragraphs]
    case 'worked-example': return [block.title ?? '', ...block.steps.flatMap((step) => [step.label, step.value]), block.conclusion ?? '']
    case 'relationship': return [block.title ?? '', ...block.items, block.explanation ?? '']
    case 'comparison': return block.columns.flatMap((column) => [column.heading, ...column.items.flatMap((item) => [item.label, item.value])])
    case 'quantitative': return [block.title, block.explanation ?? '']
    case 'misconception': return [block.title, ...block.paragraphs]
    case 'quick-check': return [block.question, ...block.options.map((option) => option.text), block.explanation]
    case 'recap': return block.items
  }
}

const wordsPerMinute = 200

/** Whole minutes to read the page at 200 words a minute, never less than 1. */
export function readMinutes(page: Pick<LearnPage, 'orientation' | 'blocks'>): number {
  const words = [page.orientation, ...page.blocks.flatMap(textOf)]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

const numberWords = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

/** "Six questions" / "One question" / "14 questions". */
export function questionCountPhrase(count: number): string {
  const word = count >= 0 && count < numberWords.length ? numberWords[count] : String(count)
  return `${word} ${count === 1 ? 'question' : 'questions'}`
}
