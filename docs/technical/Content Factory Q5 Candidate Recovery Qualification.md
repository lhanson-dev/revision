# Content Factory Q5 Candidate Recovery Qualification

## Status

This document records the focused provider-free post-Pilot #20 Q5 restart, reuse and dependency-invalidation proof for the ADR-0019 candidate-recovery topology.

The Content Factory remains **paused**. This evidence does not authorize a Q7 live-provider soak, restore Q8 eligibility, authorize a full-course confirmation, publish learner content or change the machine-readable qualification state.

Active authority remains:

- `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0;
- `decisions/ADR-0019-content-factory-candidate-recovery.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`.

Q5 evidence is provider-free. No external model call is required or permitted by this qualification slice.

## Purpose

Q5 exists to prove that interruption, candidate rejection and semantic implementation changes do not cause Revision to repurchase or regenerate unaffected accepted work.

For the candidate-recovery topology, the governing behavior is:

`durable slot/candidate checkpoint → resume exact next candidate → preserve accepted siblings → reuse semantically unchanged terminal executions → invalidate only genuine dependants`

This supports both reliability and cost control. A restart must not turn a local rejected candidate into unnecessary whole-course regeneration.

## Current production behavior already under test

The production Assessment/Marking factory already has current-head implementation regressions in `src/content-factory/assessment-and-marking.test.ts` proving:

- restart after Assessment candidate 1 rejection resumes that same slot at candidate 2;
- candidate 1 is not regenerated;
- accepted Assessment Blueprint and Question Family artifacts are reused;
- restart after Marking Pack candidate 1 rejection resumes that Marking Pack slot at candidate 2;
- accepted Assessment Items are not regenerated because their dependent Marking Pack failed;
- bounded candidate exhaustion remains fail closed; and
- an already-completed Assessment/Marking stage is idempotent.

Those tests are implementation evidence. The post-Pilot #20 reset requires them to be combined with explicit current semantic-cache, sibling-preservation and dependency-invalidation evidence before Q5 can support the new production topology.

## Focused Q5 candidate-recovery regression

`src/content-factory/q5-candidate-recovery-requalification.test.ts` adds the missing provider-free qualification evidence.

### 1. Accepted sibling Marking Pack survives another slot rejection

The fixture builds two accepted Assessment Items and accepts the first Marking Pack.

The second Marking Pack candidate 1 is deliberately rejected and the process is interrupted immediately after its durable checkpoint.

On resume, the proof requires:

- Assessment Blueprint reuse;
- Question Family reuse;
- both accepted Assessment Items to remain frozen;
- the already accepted sibling Marking Pack to remain unchanged;
- only the rejected second Marking Pack slot to execute;
- that slot to continue at candidate 2 rather than candidate 1; and
- the course to return to `validating` with both required Marking Packs present.

This proves a local Marking Pack failure cannot force unrelated accepted sibling work to be regenerated.

### 2. Exact terminal candidate cache reuse

The dependency-aware durable cache is exercised with explicit Assessment and Marking Pack candidate-2 inputs.

A second execution on a different Git head but with identical candidate input and identical semantic dependency fingerprints must:

- reuse both terminal executions;
- make zero second provider executions;
- retain original retry provenance;
- retain original usage-cost provenance; and
- report cross-head semantic reuse.

The existing general Q5 spend regression continues to prove that cumulative course spend is not charged twice for reused work.

Candidate number remains part of the exact input fingerprint. Semantic reuse therefore cannot silently substitute one candidate attempt for another.

### 3. Pre-candidate semantics fail closed across changed-head replay

The qualification fixture seeds durable cache entries using the pre-candidate semantic revisions for Assessment and Marking Pack, then replays against the current candidate-aware dependency policy.

The required invalidation set is:

- Assessment Item generation;
- Marking Pack generation;
- independent review; and
- remediation.

Unrelated Learn and Practice generation remains reusable, as do upstream Assessment Blueprint and Question Family work whose own semantics did not change.

This proves historical pre-candidate executions are not invented into current candidate-aware evidence merely because the underlying Git records exist.

### 4. Current Assessment semantic change has a bounded blast radius

A simulated Assessment Item semantic-contract change must invalidate:

- Assessment Item generation;
- dependent Marking Pack generation;
- independent review; and
- remediation.

It must not invalidate unrelated Learn or Practice outputs.

### 5. Current Marking semantic change has a narrower bounded blast radius

A simulated Marking Pack semantic-contract change must invalidate:

- Marking Pack generation;
- independent review; and
- remediation.

It must retain the accepted Assessment Item and unrelated Learn/Practice outputs.

## Relationship to existing Q5 evidence

`src/content-factory/q5-dependency-aware-resume.test.ts` remains active and is re-executed by normal exact-head Revision CI. It continues to prove the wider Q5 contract:

- Git-head-only changes do not invalidate semantically unchanged work;
- Practice compiler changes do not invalidate unrelated Course Knowledge Model, Learn or Assessment generation;
- Assessment Blueprint changes invalidate only the genuine assessment branch plus assurance dependants;
- Coverage changes propagate through genuinely coverage-dependent content while preserving unrelated identity/source work;
- retry and usage-cost provenance survives reuse; and
- changed-head durable jobs replay from `requested` while preserving governed request identity.

The new candidate-recovery regression supplements rather than replaces that evidence.

## Qualification effect

On an exact implementation head where Revision CI passes both the existing Q5 suite and the new candidate-recovery regression, the provider-free restart/reuse/dependency-invalidation behavior required by the post-Pilot #20 Q5 reset is evidenced for the current candidate topology.

This focused proof does **not** claim overall Reliability v2 qualification. The machine-readable `content-factory/reliability-qualification.json` remains paused and intentionally unchanged.

The remaining reset gates must still be evidenced on the governed topology before Q7 can run. Q7 remains prohibited until Q1–Q6 are all PASS, and Q8 remains a separate Founder-governed transition after Q1–Q7.

## Documentation impact

No normative authority change is required. The active Reliability Qualification Standard and ADR-0019 already require durable candidate restart, smallest-safe-scope preservation, truthful reuse provenance and dependency-aware invalidation.

No historical Q5 record, pilot evidence or qualification history is rewritten. This document records new current implementation/qualification evidence only.
