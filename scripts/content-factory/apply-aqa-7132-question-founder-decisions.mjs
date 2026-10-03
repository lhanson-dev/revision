export function applyAqa7132QuestionFounderDecisions({ ledger, decisionFile, batch }) {
  const nextLedger = structuredClone(ledger)
  let appliedDecisions = 0
  const mismatches = []

  for (const decision of decisionFile.decisions ?? []) {
    if (decision.batch !== batch || decision.decision !== 'fix') continue

    const entry = nextLedger.units?.[decision.unit_id]
    if (!entry) {
      throw new Error(`founder_decision_unit_missing:${batch}:${decision.unit_id}`)
    }

    if (entry.fingerprint !== decision.prior_fingerprint) {
      const exhaustedOldDispute = ['blocking', 'escalated'].includes(entry.outcome)
        && Number(entry.consecutive_blocking_rounds ?? 0) >= 2
      if (exhaustedOldDispute) {
        mismatches.push(`${decision.unit_id}:expected=${decision.prior_fingerprint}:actual=${entry.fingerprint}`)
      }
      continue
    }

    entry.founder_decision = {
      decision: 'fix',
      note: decision.note,
      decided_at: decisionFile.decided_at,
    }
    // The explicit Founder fix decision closes the old two-round dispute. Changed inputs must still pass fresh review.
    entry.consecutive_blocking_rounds = 0
    appliedDecisions++
  }

  if (mismatches.length) {
    throw new Error(`founder_decision_fingerprint_mismatch:${batch}:${mismatches.join(',')}`)
  }

  return { ledger: nextLedger, appliedDecisions }
}
