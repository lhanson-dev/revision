import type { LearnBlock, LearnPage } from '../../../../content/learn-schema'

type BlockOf<T extends LearnBlock['type']> = Extract<LearnBlock, { type: T }>

/**
 * One placed item on a Learn page. `margin-row` is a key idea in the right-hand margin (desktop)
 * beside the run of main blocks it belongs with. `main` keeps content order; `keyIdeaFirst` says the
 * key idea came before them in the content, so tablet and phone keep that order too.
 */
export type LearnLayoutItem =
  | { kind: 'block'; block: LearnBlock; key: string }
  | { kind: 'margin-row'; main: LearnBlock[]; keyIdea: BlockOf<'key-idea'>; keyIdeaFirst: boolean; key: string }

/** Blocks a key idea may sit beside. Wide visuals (charts, comparisons, chains) never are narrowed. */
const marginPartners: ReadonlySet<LearnBlock['type']> = new Set(['explanation', 'example', 'worked-example'])

/**
 * Placement rules, from the block types alone (never from the course or the page):
 * - content order is kept, except that `recap` always renders last;
 * - a `key-idea` goes in the right-hand margin, top-aligned with the blocks it sits beside: the run of
 *   `explanation` blocks directly before it, or (when none) the single explanation, example or worked
 *   example directly after it. Tablet and phone stack everything in content order;
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
    if (block.type === 'key-idea') {
      const before: LearnBlock[] = []
      while (items.length > 0) {
        const last = items[items.length - 1]
        if (last.kind === 'block' && last.block.type === 'explanation') before.unshift((items.pop() as { block: LearnBlock }).block)
        else break
      }
      if (before.length > 0) {
        items.push({ kind: 'margin-row', main: before, keyIdea: block, keyIdeaFirst: false, key: `${block.type}-${index}` })
      } else if (following && marginPartners.has(following.block.type)) {
        items.push({ kind: 'margin-row', main: [following.block], keyIdea: block, keyIdeaFirst: true, key: `${block.type}-${index}` })
        position += 1
      } else {
        items.push({ kind: 'block', block, key: `${block.type}-${index}` })
      }
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
    case 'worked-example': return [block.title ?? '', block.setup ?? '', ...block.steps.flatMap((step) => [step.label, step.value]), block.conclusion ?? '']
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
