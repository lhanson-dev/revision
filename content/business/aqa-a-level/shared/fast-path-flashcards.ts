import { flashcardSchema } from '../../../schema'

type FastPathAsset = {
  node_id: string
  practice: {
    items: Array<{
      id: string
      item_ids: string[]
      prompt: string
      answer: string
      explanation: string
    }>
  }
}

const assets = import.meta.glob('../../../../content-factory/slices/aqa-7132-*/learn-practice/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, FastPathAsset>

const topicBySection: Record<string, string> = {
  '3.1': 'business', '3.2': 'leadership', '3.3': 'marketing', '3.4': 'operations',
  '3.5': 'finance', '3.6': 'hr', '3.7': 'strategic-position', '3.8': 'strategic-direction',
  '3.9': 'strategic-methods', '3.10': 'strategic-change',
}

function topicFor(itemIds: readonly string[], path: string) {
  const counts = new Map<string, number>()
  itemIds.forEach((itemId) => {
    const section = itemId.match(/aqa-7132-(3\.(?:10|[1-9]))(?:\.|:)/)?.[1]
    if (section) counts.set(section, (counts.get(section) ?? 0) + 1)
  })
  const winner = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], undefined, { numeric: true }))[0]?.[0]
  if (winner) return topicBySection[winner] ?? 'business'
  const fallback = path.match(/aqa-7132-(3\.(?:10|[1-9]))/)?.[1]
  return fallback ? topicBySection[fallback] ?? 'business' : 'business'
}

export const fastPathFlashcards = Object.entries(assets)
  .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
  .flatMap(([path, asset]) => asset.practice.items.map((item) => flashcardSchema.parse({
    id: `fast-${asset.node_id}-${item.id}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase(),
    topic: topicFor(item.item_ids, path),
    prompt: item.prompt,
    answer: `${item.answer}\n\nWhy: ${item.explanation}`,
  })))
