import { businessAqaAsPaper2 } from '../../../content/business/aqa-as/paper-2'
import type { ContentPack } from '../../../content/schema'
import { createLearningContentAdapter, type LearningContentAdapter } from './content-adapter'

const packs: readonly ContentPack[] = [businessAqaAsPaper2]

export const contentRegistry: readonly LearningContentAdapter[] = packs.map(createLearningContentAdapter)

export function listCatalogueEntries() {
  return contentRegistry.map((adapter) => adapter.catalogueEntry)
}

export function getContentAdapter(moduleId: string) {
  return contentRegistry.find((adapter) => adapter.manifest.id === moduleId)
}
