import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import type { ClassifiedFinding, Ledger } from '../../src/content-factory/fast-path-review'
import type { MockPlan, MockPlanPaper, MockQuestion } from './aqa-business-7132-mock-generation'

const slotFixSchema = z.object({
  instruction: z.string().min(1),
  required_stem_phrases: z.array(z.string().min(1)).min(1),
  required_level4_phrases: z.array(z.string().min(1)).min(1),
  required_mark_scheme_phrases: z.array(z.string().min(1)).min(1),
})

const resolutionSchema = z.object({
  resolution_id: z.string().min(1),
  plan_fingerprint: z.string().min(1),
  source_run_id: z.number().int().positive(),
  unit_id: z.string().min(1),
  escalated_fingerprint: z.string().min(1),
  decision: z.literal('fix'),
  decided_at: z.string().min(1),
  check_id: z.string().min(1),
  note: z.string().min(1),
  slot_fixes: z.record(z.string().min(1), slotFixSchema),
})

const fileSchema = z.object({
  schema_version: z.literal(1),
  resolutions: z.array(resolutionSchema),
})

export type FounderMockResolution = z.infer<typeof resolutionSchema>

export async function loadFounderMockResolutions(path: string): Promise<FounderMockResolution[]> {
  const parsed = fileSchema.parse(JSON.parse(await readFile(path, 'utf8')))
  return parsed.resolutions
}

function matchingResolution(plan: MockPlan, paper: MockPlanPaper, entry: Ledger['units'][string] | undefined, resolutions: FounderMockResolution[]) {
  if (!entry || entry.outcome !== 'escalated' || entry.founder_decision) return undefined
  return resolutions.find((resolution) =>
    resolution.plan_fingerprint === plan.plan_fingerprint
    && resolution.unit_id === paper.component_id
    && resolution.escalated_fingerprint === entry.fingerprint
    && resolution.decision === 'fix')
}

export function founderFixFeedbackTargets(
  plan: MockPlan,
  paper: MockPlanPaper,
  entry: Ledger['units'][string] | undefined,
  resolutions: FounderMockResolution[],
  retainedQuestions?: ReadonlyMap<string, MockQuestion>,
) {
  const resolution = matchingResolution(plan, paper, entry, resolutions)
  const result = new Map<string, ClassifiedFinding[]>()
  if (!resolution) return result

  const slotIds = new Set(paper.slots.map((slot) => slot.slot_id))
  const finding = entry!.findings.find((candidate) =>
    candidate.disposition === 'blocking'
    && candidate.check_id === resolution.check_id)
  if (!finding) throw new Error(`mock_founder_resolution_blocking_finding_missing:${resolution.resolution_id}`)

  for (const [slotId, fix] of Object.entries(resolution.slot_fixes)) {
    if (!slotIds.has(slotId)) throw new Error(`mock_founder_resolution_unknown_slot:${resolution.resolution_id}:${slotId}`)
    if (!finding.affected_ids.includes(slotId)) throw new Error(`mock_founder_resolution_slot_not_in_escalated_finding:${resolution.resolution_id}:${slotId}`)
    const retained = retainedQuestions?.get(slotId)
    if (retained && questionSatisfiesContract(retained, fix)) continue
    result.set(slotId, [{
      ...finding,
      affected_ids: [slotId],
      proposed_fix: fix.instruction,
      reason: `Founder-directed fix from ${resolution.resolution_id}`,
    }])
  }
  return result
}

function containsAll(text: string, phrases: string[]) {
  const normalised = text.toLowerCase()
  return phrases.every((phrase) => normalised.includes(phrase.toLowerCase()))
}

function markSchemeText(question: MockQuestion) {
  return [
    question.mark_scheme.model_answer,
    ...question.mark_scheme.indicative_content,
    ...question.mark_scheme.levels.map((level) => level.descriptor),
    ...question.mark_scheme.points.flatMap((point) => [point.descriptor, ...point.accept]),
  ].join('\n')
}

function questionSatisfiesContract(question: MockQuestion, contract: z.infer<typeof slotFixSchema>) {
  const level4 = question.mark_scheme.levels.find((level) => level.level === 4)
  return containsAll(question.stem, contract.required_stem_phrases)
    && Boolean(level4 && containsAll(level4.descriptor, contract.required_level4_phrases))
    && containsAll(markSchemeText(question), contract.required_mark_scheme_phrases)
}

export function applyFounderFixDecision(input: {
  plan: MockPlan
  paper: MockPlanPaper
  paperFingerprint: string
  questions: ReadonlyMap<string, MockQuestion>
  ledger: Ledger
  resolutions: FounderMockResolution[]
  now?: () => string
}) {
  const entry = input.ledger.units[input.paper.component_id]
  const resolution = matchingResolution(input.plan, input.paper, entry, input.resolutions)
  if (!resolution) return { applied: false as const, ledger: input.ledger }
  if (input.paperFingerprint === resolution.escalated_fingerprint) {
    throw new Error(`mock_founder_resolution_did_not_change_paper:${resolution.resolution_id}`)
  }

  for (const [slotId, contract] of Object.entries(resolution.slot_fixes)) {
    const question = input.questions.get(slotId)
    if (!question) throw new Error(`mock_founder_resolution_question_missing:${resolution.resolution_id}:${slotId}`)
    const level4 = question.mark_scheme.levels.find((level) => level.level === 4)
    if (!containsAll(question.stem, contract.required_stem_phrases)) {
      throw new Error(`mock_founder_resolution_stem_contract_failed:${resolution.resolution_id}:${slotId}`)
    }
    if (!level4 || !containsAll(level4.descriptor, contract.required_level4_phrases)) {
      throw new Error(`mock_founder_resolution_level4_contract_failed:${resolution.resolution_id}:${slotId}`)
    }
    if (!containsAll(markSchemeText(question), contract.required_mark_scheme_phrases)) {
      throw new Error(`mock_founder_resolution_mark_scheme_contract_failed:${resolution.resolution_id}:${slotId}`)
    }
  }

  const now = input.now ?? (() => new Date().toISOString())
  const next = structuredClone(input.ledger)
  next.units[input.paper.component_id] = {
    ...entry!,
    fingerprint: input.paperFingerprint,
    outcome: 'passed',
    consecutive_blocking_rounds: 0,
    founder_decision: {
      decision: 'fix',
      note: `${resolution.note} Resolution ${resolution.resolution_id} was applied deterministically; no third whole-paper review was started for the same escalated issue.`,
      decided_at: resolution.decided_at,
    },
    updated_at: now(),
  }
  return { applied: true as const, resolution_id: resolution.resolution_id, ledger: next }
}
