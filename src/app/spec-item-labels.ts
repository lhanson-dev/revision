import labels from '../../content/business/aqa-a-level/shared/spec-item-labels.json'

const byId = labels as Record<string, string>

/**
 * The short name of an AQA 7132 specification item, for the skills map in the Practice summary. These are the short
 * Revision-authored labels from the item-coverage check (REFERENCE_ONLY: they identify what the specification requires and
 * are not AQA wording or teaching copy). An unknown item falls back to its id's last part, made readable.
 */
export function specItemLabel(itemId: string): string {
  const known = byId[itemId]
  if (known) return known
  const slug = itemId.split(':')[1] ?? itemId
  const words = slug.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
