import type { ContentPack } from '../../../content/schema'
import { createLearningContentAdapter, type LearningContentAdapter } from './content-adapter'

type ContentPackModule = { default: ContentPack }

const discoveredModules = import.meta.glob<ContentPackModule>('../../../content/**/index.ts', {
  eager: true,
})

const packs = Object.entries(discoveredModules)
  .map(([path, module]) => {
    if (!module.default) throw new Error(`Content pack ${path} must export its validated pack as the default export.`)
    return module.default
  })
  .sort((left, right) => left.manifest.id.localeCompare(right.manifest.id))

const duplicateIds = packs
  .map((pack) => pack.manifest.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index)

if (duplicateIds.length > 0) {
  throw new Error(`Duplicate content-pack ids: ${[...new Set(duplicateIds)].join(', ')}`)
}

export const contentRegistry: readonly LearningContentAdapter[] = packs.map(createLearningContentAdapter)

export function listAvailableContentAdapters() {
  return contentRegistry.filter((adapter) => adapter.manifest.status === 'available')
}

export function listCatalogueEntries() {
  return listAvailableContentAdapters().map((adapter) => adapter.catalogueEntry)
}

export function getContentAdapter(moduleId: string) {
  return listAvailableContentAdapters().find((adapter) => adapter.manifest.id === moduleId)
}
