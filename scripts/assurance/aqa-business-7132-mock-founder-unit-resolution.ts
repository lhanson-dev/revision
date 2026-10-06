import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import type { ClassifiedFinding, Ledger } from '../../src/content-factory/fast-path-review'
import type { MockGenerationUnit, MockPlan, MockQuestion } from './aqa-business-7132-mock-generation'

const unitSlotFixSchema = z.object({
  instruction: z.string().min(1),
  required_stem_phrases: z.array(z.string().min(1)).min(1),
  required_stem_any_phrases: z.array(z.string().min(1)).min(1),
  required_top_level_phrases: z.array(z.string().min(1)).min(1),
  required_mark_scheme_phrases: z.array(z.string().min(1)).min(1),
})

const unitResolutionSchema = z.object({
  resolution_id: z.string().min(1),
  plan_fingerprint: z.string().min(1),
  source_run_id: z.number().int().positive(),
  unit_id: z.string().min(1),
  escalated_fingerprint: z.string().min(1),
  decision: z.literal('fix'),
  decided_at: z.string().min(1),
  check_ids: z.array(z.string().min(1)).min(1),
  note: z.string().min(1),
  slot_fixes: z.record(z.string().min(1), unitSlotFixSchema),
})

const fileSchema = z.object({
  schema_version: z.literal(1),
  unit_resolutions: z.array(unitResolutionSchema).default([]),
})

export type FounderMockUnitResolution = z.infer<typeof unitResolutionSchema>

export async function loadFounderMockUnitResolutions(path: string): Promise<FounderMockUnitResolution[]> {
  const parsed = fileSchema.parse(JSON.parse(await readFile(path, 'utf8')))
  return parsed.unit_resolutions
}

function matchingUnitResolution(
  plan: MockPlan,
  unit: MockGenerationUnit,
  entry: Ledger['units'][string] | undefined,
  resolutions: FounderMockUnitResolution[],
) {
  if (!entry || entry.outcome !== 'escalated' || entry.founder_decision) return undefined
  return resolutions.find((resolution) =>
    resolution.plan_fingerprint === plan.plan_fingerprint
    && resolution.unit_id === unit.unit_id
    && resolution.escalated_fingerprint === entry.fingerprint
    && resolution.decision === 'fix')
}

function containsAll(text: string, phrases: string[]) {
  const normalised = text.toLowerCase()
  return phrases.every((phrase) => normalised.includes(phrase.toLowerCase()))
}

function containsAny(text: string, phrases: string[]) {
  const normalised = text.toLowerCase()
  return phrases.some((phrase) => normalised.includes(phrase.toLowerCase()))
}

function markSchemeText(question: MockQuestion) {
  return [
    question.mark_scheme.model_answer,
    ...question.mark_scheme.indicative_content,
    ...question.mark_scheme.levels.map((level) => level.descriptor),
    ...question.mark_scheme.points.flatMap((point) => [point.descriptor, ...point.accept]),
  ].join('\n')
}

function topLevelDescriptor(question: MockQuestion) {
  if (!question.mark_scheme.levels.length) return ''
  const top = Math.max(...question.mark_scheme.levels.map((level) => level.level))
  return question.mark_scheme.levels.find((level) => level.level === top)?.descriptor ?? ''
}

function questionSatisfiesContract(question: MockQuestion, contract: z.infer<typeof unitSlotFixSchema>) {
  return containsAll(question.stem, contract.required_stem_phrases)
    && containsAny(question.stem, contract.required_stem_any_phrases)
    && containsAll(topLevelDescriptor(question), contract.required_top_level_phrases)
    && containsAll(markSchemeText(question), contract.required_mark_scheme_phrases)
}

export function founderUnitFixFeedbackTargets(
  plan: MockPlan,
  unit: MockGenerationUnit,
  entry: Ledger['units'][string] | undefined,
  resolutions: FounderMockUnitResolution[],
  retainedQuestions?: ReadonlyMap<string, MockQuestion>,
) {
  const resolution = matchingUnitResolution(plan, unit, entry, resolutions)
  const result = new Map<string, ClassifiedFinding[]>()
  if (!resolution) return result

  const slotIds = new Set(unit.slots.map((slot) => slot.slot_id))
  const findings = entry!.findings.filter((candidate) =>
    candidate.disposition === 'blocking'
    && resolution.check_ids.includes(candidate.check_id))
  if (!findings.length) throw new Error(`mock_founder_unit_resolution_blocking_finding_missing:${resolution.resolution_id}`)

  for (const [slotId, fix] of Object.entries(resolution.slot_fixes)) {
    if (!slotIds.has(slotId)) throw new Error(`mock_founder_unit_resolution_unknown_slot:${resolution.resolution_id}:${slotId}`)
    const affected = findings.filter((finding) => finding.affected_ids.includes(slotId))
    if (!affected.length) throw new Error(`mock_founder_unit_resolution_slot_not_in_escalated_finding:${resolution.resolution_id}:${slotId}`)
    const retained = retainedQuestions?.get(slotId)
    if (retained && questionSatisfiesContract(retained, fix)) continue
    result.set(slotId, affected.map((finding) => ({
      ...finding,
      affected_ids: [slotId],
      proposed_fix: fix.instruction,
      reason: `Founder-directed unit fix from ${resolution.resolution_id}`,
    })))
  }
  return result
}

export function applyFounderUnitFixDecision(input: {
  plan: MockPlan
  unit: MockGenerationUnit
  unitFingerprint: string
  questions: ReadonlyMap<string, MockQuestion>
  ledger: Ledger
  resolutions: FounderMockUnitResolution[]
  now?: () => string
}) {
  const entry = input.ledger.units[input.unit.unit_id]
  const resolution = matchingUnitResolution(input.plan, input.unit, entry, input.resolutions)
  if (!resolution) return { applied: false as const, ledger: input.ledger }
  if (input.unitFingerprint === resolution.escalated_fingerprint) {
    throw new Error(`mock_founder_unit_resolution_did_not_change_unit:${resolution.resolution_id}`)
  }

  for (const [slotId, contract] of Object.entries(resolution.slot_fixes)) {
    const question = input.questions.get(slotId)
    if (!question) throw new Error(`mock_founder_unit_resolution_question_missing:${resolution.resolution_id}:${slotId}`)
    if (!containsAll(question.stem, contract.required_stem_phrases) || !containsAny(question.stem, contract.required_stem_any_phrases)) {
      throw new Error(`mock_founder_unit_resolution_stem_contract_failed:${resolution.resolution_id}:${slotId}`)
    }
    if (!containsAll(topLevelDescriptor(question), contract.required_top_level_phrases)) {
      throw new Error(`mock_founder_unit_resolution_top_level_contract_failed:${resolution.resolution_id}:${slotId}`)
    }
    if (!containsAll(markSchemeText(question), contract.required_mark_scheme_phrases)) {
      throw new Error(`mock_founder_unit_resolution_mark_scheme_contract_failed:${resolution.resolution_id}:${slotId}`)
    }
  }

  const now = input.now ?? (() => new Date().toISOString())
  const next = structuredClone(input.ledger)
  next.units[input.unit.unit_id] = {
    ...entry!,
    fingerprint: input.unitFingerprint,
    outcome: 'passed',
    consecutive_blocking_rounds: 0,
    founder_decision: {
      decision: 'fix',
      note: `${resolution.note} Resolution ${resolution.resolution_id} was applied deterministically; no third semantic unit review was started for the same escalated issue.`,
      decided_at: resolution.decided_at,
    },
    updated_at: now(),
  }
  return { applied: true as const, resolution_id: resolution.resolution_id, ledger: next }
}
