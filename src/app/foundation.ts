export const architectureBoundaries = ['app', 'engine', 'services', 'content'] as const

export type ArchitectureBoundary = (typeof architectureBoundaries)[number]

export function isArchitectureBoundary(value: string): value is ArchitectureBoundary {
  return architectureBoundaries.some((boundary) => boundary === value)
}
