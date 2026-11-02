/** Student-facing explanation for an already-verified single-skill Plan task.
 * The shared FI-001 planner owns the decision; this only names its exact
 * existing evidence focus, without inventing another recommendation.
 */
import type { PlannerItem } from '../engine/planning/planning'
import { specItemLabel } from './spec-item-labels'

export function planSkillFocusLabel(focus: NonNullable<PlannerItem['skillFocus']>): string {
  const skill = specItemLabel(focus.specItemId)
  if (focus.treatment === 'repair') return `Review ${skill} after an incorrect answer`
  if (focus.need === 'uncertain') return `Independent check: ${skill} (last result was a guess)`
  return `Independent recheck: ${skill} (last result was incorrect)`
}
