// Fast-path review rules (ADR-0029, `80-company-workflows/Content Factory Fast-Path Process.md`).
// Qualification-neutral: fixed checklists, blocking vs logged findings, the two-round limit,
// Founder escalation, fingerprint reuse and item-level failure handling.
import { z } from 'zod'

export const BLOCKING_CATEGORIES = ['wrong_teaching', 'missing_examinable_item', 'broken_question'] as const
export const LOGGED_CATEGORIES = ['weak_citation', 'opinion_or_style', 'out_of_scope'] as const
export const FINDING_CATEGORIES = [...BLOCKING_CATEGORIES, ...LOGGED_CATEGORIES] as const
export const MAX_REVIEW_ROUNDS = 2
export const MAX_AI_CALL_ATTEMPTS = 3

export type ChecklistItem = {
  id: string
  question: string
  // Accuracy findings only block when they cite a source that contradicts the content.
  requiresContradictingSource?: boolean
}
export type Checklist = { stage: string; version: string; checks: readonly ChecklistItem[] }

export function reviewOutputSchema(checklist: Checklist) {
  const checkIds = checklist.checks.map((check) => check.id) as [string, ...string[]]
  const finding = z.object({
    check_id: z.string().min(1),
    category: z.enum(FINDING_CATEGORIES),
    affected_ids: z.array(z.string().min(1)).min(1),
    finding: z.string().min(1),
    evidence: z.string().min(1),
    contradicting_source_id: z.string().min(1).nullable(),
    proposed_fix: z.string().min(1),
  })
  return z.object({
    unit_id: z.string().min(1),
    answers: z.array(z.object({ check_id: z.enum(checkIds), answer: z.enum(['yes', 'no']), note: z.string() })),
    findings: z.array(finding),
  }).superRefine((output, context) => {
    const answered = output.answers.map((answer) => answer.check_id).sort()
    if (JSON.stringify(answered) !== JSON.stringify([...checkIds].sort())) {
      context.addIssue({ code: 'custom', path: ['answers'], message: 'answer every checklist question exactly once' })
    }
  })
}
export type ReviewOutput = z.infer<ReturnType<typeof reviewOutputSchema>>
export type Finding = ReviewOutput['findings'][number]
export type ClassifiedFinding = Finding & { disposition: 'blocking' | 'logged'; reason: string }

export function checklistInstructions(checklist: Checklist) {
  return [
    `Answer each question below with yes or no for the unit supplied. Do not look for other problems.`,
    ...checklist.checks.map((check) => `- ${check.id}: ${check.question}`),
    `Record a finding only where you answered "no". Each finding must name the check_id it failed and one category:`,
    `wrong_teaching, missing_examinable_item or broken_question if a student would learn something wrong or miss something examinable;`,
    `otherwise weak_citation, opinion_or_style or out_of_scope.`,
    `For wrong_teaching, set contradicting_source_id to a supplied source id that contradicts the content; if you cannot, set it to null.`,
  ].join('\n')
}

// The rules, not the reviewer, decide what blocks.
export function classifyFindings(findings: readonly Finding[], checklist: Checklist, knownSourceIds: ReadonlySet<string>): ClassifiedFinding[] {
  const checks = new Map(checklist.checks.map((check) => [check.id, check]))
  return findings.map((finding) => {
    const check = checks.get(finding.check_id)
    if (!check) return { ...finding, disposition: 'logged', reason: 'does not name a check from the fixed checklist' }
    if (!(BLOCKING_CATEGORIES as readonly string[]).includes(finding.category)) return { ...finding, disposition: 'logged', reason: `${finding.category} is logged, not blocking` }
    if (check.requiresContradictingSource && finding.category === 'wrong_teaching' && !(finding.contradicting_source_id && knownSourceIds.has(finding.contradicting_source_id))) {
      return { ...finding, disposition: 'logged', reason: 'accuracy finding without a supplied contradicting source' }
    }
    return { ...finding, disposition: 'blocking', reason: `failed ${check.id}` }
  })
}

// Ledger: one entry per reviewed unit (e.g. a specification section), committed between runs.
export type LedgerEntry = {
  fingerprint: string
  outcome: UnitOutcome['status']
  consecutive_blocking_rounds: number
  findings: ClassifiedFinding[]
  founder_decision?: { decision: 'accept' | 'fix' | 'remove'; note: string; decided_at: string }
  updated_at: string
}
export type Ledger = { schema_version: 1; stage: string; checklist_version: string; units: Record<string, LedgerEntry> }

export type UnitOutcome =
  | { unit_id: string; status: 'passed'; findings: ClassifiedFinding[] }
  | { unit_id: string; status: 'logged'; findings: ClassifiedFinding[] }
  | { unit_id: string; status: 'blocking'; findings: ClassifiedFinding[]; round: number }
  | { unit_id: string; status: 'escalated'; findings: ClassifiedFinding[] }
  | { unit_id: string; status: 'failed'; error: string; attempts: number }
  | { unit_id: string; status: 'reused'; previous: LedgerEntry['outcome'] }

export type ReviewUnit = { unit_id: string; fingerprint: string; softwareFindings?: ClassifiedFinding[] }
export type AttemptResult = { ok: true; output: unknown } | { ok: false; error: string }

export function outcomeFromFindings(unitId: string, findings: ClassifiedFinding[], previousRounds: number): UnitOutcome {
  if (findings.some((finding) => finding.disposition === 'blocking')) {
    const round = previousRounds + 1
    return round > MAX_REVIEW_ROUNDS ? { unit_id: unitId, status: 'escalated', findings } : { unit_id: unitId, status: 'blocking', findings, round }
  }
  return { unit_id: unitId, status: findings.length ? 'logged' : 'passed', findings }
}

export async function runReviewUnits<U extends ReviewUnit>(input: {
  units: readonly U[]
  ledger: Ledger
  checklist: Checklist
  knownSourceIds: (unit: U) => ReadonlySet<string>
  // One AI call for one unit. Must not throw for provider problems; return { ok: false }.
  review: (unit: U, attempt: number) => Promise<AttemptResult>
  // Units are independent, so several can be reviewed at once.
  concurrency?: number
  now?: () => string
}) {
  const now = input.now ?? (() => new Date().toISOString())
  const schema = reviewOutputSchema(input.checklist)

  const reviewOne = async (unit: U): Promise<UnitOutcome> => {
    const previous = input.ledger.units[unit.unit_id]
    // A Founder decision closes the dispute; later changes start a fresh count.
    const previousRounds = previous?.founder_decision ? 0 : previous?.consecutive_blocking_rounds ?? 0

    // Inputs unchanged since the last completed review: reuse it (rule 6).
    if (previous && previous.fingerprint === unit.fingerprint && previous.outcome !== 'failed') return { unit_id: unit.unit_id, status: 'reused', previous: previous.outcome }

    // Software first: a software-proven blocking finding stops AI review of this unit only.
    // It is a fact, not a dispute, so it does not use up a review round or escalate.
    const software = unit.softwareFindings ?? []
    if (software.some((finding) => finding.disposition === 'blocking')) return { unit_id: unit.unit_id, status: 'blocking', findings: software, round: previousRounds }

    // Two-round limit: never start a third round on a unit still blocking.
    if (previousRounds >= MAX_REVIEW_ROUNDS) return { unit_id: unit.unit_id, status: 'escalated', findings: previous?.findings ?? [] }

    let lastError = 'no attempt made'
    for (let attempt = 1; attempt <= MAX_AI_CALL_ATTEMPTS; attempt++) {
      const result = await input.review(unit, attempt).catch((error: unknown) => ({ ok: false as const, error: error instanceof Error ? error.message : String(error) }))
      if (!result.ok) { lastError = result.error; continue }
      const parsed = schema.safeParse(result.output)
      if (!parsed.success) { lastError = `invalid review output: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`; continue }
      if (parsed.data.unit_id !== unit.unit_id) {
        if (parsed.data.unit_id.toLocaleLowerCase('en-GB') !== unit.unit_id.toLocaleLowerCase('en-GB')) { lastError = `review answered for ${parsed.data.unit_id}`; continue }
        parsed.data.unit_id = unit.unit_id
      }
      return outcomeFromFindings(unit.unit_id, [...software, ...classifyFindings(parsed.data.findings, input.checklist, input.knownSourceIds(unit))], previousRounds)
    }
    return { unit_id: unit.unit_id, status: 'failed', error: lastError, attempts: MAX_AI_CALL_ATTEMPTS }
  }

  const outcomes: UnitOutcome[] = new Array(input.units.length)
  let next = 0
  const worker = async () => { while (next < input.units.length) { const index = next++; outcomes[index] = await reviewOne(input.units[index]) } }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(input.concurrency ?? 1, input.units.length)) }, worker))

  const units: Record<string, LedgerEntry> = { ...input.ledger.units }
  input.units.forEach((unit, index) => {
    const outcome = outcomes[index]
    if (outcome.status === 'reused') return
    const previous = input.ledger.units[unit.unit_id]
    const previousRounds = previous?.founder_decision ? 0 : previous?.consecutive_blocking_rounds ?? 0
    units[unit.unit_id] = {
      fingerprint: unit.fingerprint,
      outcome: outcome.status,
      consecutive_blocking_rounds: outcome.status === 'blocking' ? outcome.round : outcome.status === 'escalated' || outcome.status === 'failed' ? previousRounds : 0,
      findings: 'findings' in outcome ? outcome.findings : [],
      updated_at: now(),
    }
  })

  const ledger: Ledger = { ...input.ledger, units }
  return { outcomes, ledger, summary: summarise(outcomes, ledger) }
}

export function summarise(outcomes: readonly UnitOutcome[], ledger: Ledger) {
  const list = (status: LedgerEntry['outcome']) => outcomes.filter((outcome) => (outcome.status === 'reused' ? outcome.previous : outcome.status) === status).map((outcome) => outcome.unit_id)
  const blocking = list('blocking')
  const escalated = list('escalated').filter((id) => !ledger.units[id]?.founder_decision)
  const failed = list('failed')
  return {
    passed: list('passed'),
    logged: list('logged'),
    blocking,
    escalated,
    failed,
    reused_unchanged: outcomes.filter((outcome) => outcome.status === 'reused').map((outcome) => outcome.unit_id),
    // A course can progress with logged items, never with blocking, unresolved escalated or failed ones.
    can_progress: blocking.length === 0 && escalated.length === 0 && failed.length === 0,
  }
}

// The single end-of-run list, in plain English for the Founder.
export function renderRunSummary(title: string, outcomes: readonly UnitOutcome[], ledger: Ledger) {
  const summary = summarise(outcomes, ledger)
  const blockingLines = (id: string) => (ledger.units[id]?.findings ?? []).filter((finding) => finding.disposition === 'blocking').map((finding) => `  - ${finding.finding} (${finding.reason})`)
  const section = (heading: string, ids: string[], detail?: (id: string) => string[]) => [
    `## ${heading} (${ids.length})`,
    ...(ids.length ? ids.flatMap((id) => [`- ${id}`, ...(detail ? detail(id) : [])]) : ['- none']),
    '',
  ]
  const failedErrors = (id: string) => outcomes.filter((outcome) => outcome.unit_id === id && outcome.status === 'failed').map((outcome) => `  - ${'error' in outcome ? outcome.error : ''}`)
  const loggedLines = (id: string) => (ledger.units[id]?.findings ?? []).filter((finding) => finding.disposition === 'logged').map((finding) => `  - ${finding.finding} (${finding.reason})`)
  return [
    `# ${title}`,
    '',
    summary.can_progress ? '**Result: can progress.** Nothing is blocking, escalated or failed.' : '**Result: cannot progress yet.** See the blocking, escalated and failed lists.',
    '',
    ...section('Blocking — must be fixed', summary.blocking, blockingLines),
    ...section('Escalated — Founder decision needed', summary.escalated, blockingLines),
    ...section('Failed — AI call failed 3 times, rerun needed', summary.failed, failedErrors),
    ...section('Passed with logged notes — fix in a later batch', summary.logged, loggedLines),
    ...section('Passed', summary.passed),
    `Reused without re-review because nothing changed: ${summary.reused_unchanged.length}`,
    '',
  ].join('\n')
}

export function escalationEntries(ledger: Ledger) {
  return Object.entries(ledger.units)
    .filter(([, entry]) => entry.outcome === 'escalated' && !entry.founder_decision)
    .map(([unitId, entry]) => ({
      unit_id: unitId,
      disputed: entry.findings.filter((finding) => finding.disposition === 'blocking').map((finding) => `${finding.check_id}: ${finding.finding}`),
      evidence: entry.findings.filter((finding) => finding.disposition === 'blocking').map((finding) => finding.evidence),
      options: ['accept as it is', 'fix a specific way', 'remove the item'],
    }))
}
