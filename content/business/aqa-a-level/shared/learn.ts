import type { LearnBlock, LearnChapter, LearnCourse, LearnPage } from '../../../learn-schema'
import { learn as authoredLearn } from './authored-learn'

type FastPathAsset = {
  node_id: string
  learn: {
    title: string
    sections: Array<{ heading: string; body: string; item_ids: string[] }>
    key_terms: Array<{ term: string; definition: string }>
    worked_examples: Array<{ id: string; scenario: string; steps: string[] }>
  }
  practice: { items: Array<{ item_ids: string[] }> }
}

const assets = import.meta.glob('../../../../content-factory/slices/aqa-7132-*/learn-practice/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, FastPathAsset>

const topicBySection: Record<string, string> = {
  '3.1': 'business',
  '3.2': 'leadership',
  '3.3': 'marketing',
  '3.4': 'operations',
  '3.5': 'finance',
  '3.6': 'hr',
  '3.7': 'strategic-position',
  '3.8': 'strategic-direction',
  '3.9': 'strategic-methods',
  '3.10': 'strategic-change',
}

const topicTitles: Record<string, string> = {
  business: '1. What is Business?',
  leadership: '2. Managers, Leadership & Decision Making',
  marketing: '3. Marketing Management',
  operations: '4. Operational Management',
  finance: '5. Financial Management',
  hr: '6. Human Resource Management',
  'strategic-position': '7. Analysing the Strategic Position',
  'strategic-direction': '8. Choosing Strategic Direction',
  'strategic-methods': '9. Strategic Methods',
  'strategic-change': '10. Managing Strategic Change',
}

function sectionFromItemId(itemId: string) {
  return itemId.match(/aqa-7132-(3\.(?:10|[1-9]))(?:\.|:)/)?.[1] ?? null
}

function topicFor(asset: FastPathAsset, path: string) {
  const itemIds = [
    ...asset.learn.sections.flatMap((section) => section.item_ids),
    ...asset.practice.items.flatMap((item) => item.item_ids),
  ]
  const counts = new Map<string, number>()
  itemIds.forEach((itemId) => {
    const section = sectionFromItemId(itemId)
    if (section) counts.set(section, (counts.get(section) ?? 0) + 1)
  })
  const winner = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], undefined, { numeric: true }))[0]?.[0]
  if (winner) return topicBySection[winner] ?? 'business'
  const fallback = path.match(/aqa-7132-(3\.(?:10|[1-9]))/)?.[1]
  return fallback ? topicBySection[fallback] ?? 'business' : 'business'
}

function blocksFor(asset: FastPathAsset): LearnBlock[] {
  const blocks: LearnBlock[] = asset.learn.sections.map((section) => ({
    type: 'explanation',
    heading: section.heading,
    paragraphs: [section.body],
  }))
  if (asset.learn.key_terms.length > 0) {
    blocks.push({ type: 'key-idea', label: 'Key terms', definitions: asset.learn.key_terms })
  }
  asset.learn.worked_examples.forEach((example) => {
    blocks.push({
      type: 'worked-example',
      label: 'Worked example',
      title: example.scenario,
      steps: example.steps.map((step, index) => ({ label: `Step ${index + 1}`, value: step })),
    })
  })
  return blocks
}

const pages: LearnPage[] = Object.entries(assets)
  .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
  .map(([path, asset]) => ({
    id: asset.node_id,
    topicId: topicFor(asset, path),
    title: asset.learn.title,
    orientation: `Understand ${asset.learn.title.toLowerCase()}, then use Practice to retrieve, apply and test it.`,
    blocks: blocksFor(asset),
  }))

const topicOrder = ['business', 'leadership', 'marketing', 'operations', 'finance', 'hr', 'strategic-position', 'strategic-direction', 'strategic-methods', 'strategic-change']

const fastPathLearn: LearnCourse = {
  chapters: topicOrder.map((topicId): LearnChapter => ({
    id: topicId,
    topicId,
    title: topicTitles[topicId],
    groups: pages
      .filter((page) => page.topicId === topicId)
      .map((page) => ({ id: `${page.id}-guide`, title: page.title, pages: [page] })),
  })).filter((chapter) => chapter.groups.length > 0),
}


export const learn: LearnCourse = {
  chapters: topicOrder.map((topicId): LearnChapter => {
    const authored = authoredLearn.chapters.find((chapter) => chapter.topicId === topicId)
    const fastPath = fastPathLearn.chapters.find((chapter) => chapter.topicId === topicId)
    return {
      id: topicId,
      topicId,
      title: fastPath?.title ?? authored?.title ?? topicTitles[topicId],
      groups: [...(authored?.groups ?? []), ...(fastPath?.groups ?? [])],
    }
  }).filter((chapter) => chapter.groups.length > 0),
}
