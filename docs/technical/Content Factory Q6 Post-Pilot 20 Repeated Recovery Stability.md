# Content Factory Q6 Post-Pilot #20 Repeated Recovery Stability

## Status

Provider-free Q6 evidence slice implemented for same-head CI assurance.

This document records the post-Pilot #20 evidence for `Q6-repeated-provider-free-stability` under the active Content Factory Reliability Qualification Standard. It does not change the reliability standard, production runtime, global qualification state, live-provider eligibility or full-course eligibility.

## Governing authority

- `80-company-workflows/Content Factory Reliability Qualification Standard.md`
- `decisions/ADR-0019-content-factory-candidate-recovery.md`
- `70-ai-operating-system/AI Agent Constitution.md`

The active standard requires Q2-Q5 to be exercised repeatedly at least three times under varied mutation ordering or shuffle seeds. Repeating one fixed fixture three times is not sufficient.

## Why this evidence is required

The older Q6 fixture predates the Pilot #20 candidate-recovery architecture and proves a fixed outcome repeatedly. It remains useful historical evidence but cannot, by itself, requalify the current topology.

After the architecture reset, the current approved-main evidence now includes:

- Q2: the immutable historical failure corpus plus the Pilot #20 complete-diagnostic and same-slot candidate-recovery replay;
- Q3: the immutable adversarial mutation matrix plus post-Pilot #20 candidate recovery across all five governed subject shapes;
- Q4: deterministic full-pipeline Assessment and Marking Pack candidate recovery, including fail-closed exhaustion;
- Q5: candidate-aware restart, accepted-sibling survival, exact terminal reuse and dependency-aware semantic invalidation.

Q6 must demonstrate that those current boundaries remain stable when their execution ordering changes.

## Proof design

The executable regression is:

`src/content-factory/q6-post-pilot20-repeated-recovery-stability.test.ts`

The machine-readable evidence is:

`content-factory/reliability-post-pilot20-q6-repeated-recovery-stability.json`

The Q6 regression binds exactly eight provider-free Q2-Q5 suites:

1. `src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts`
2. `src/content-factory/q2-pilot20-candidate-recovery-replay.test.ts`
3. `src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts`
4. `src/content-factory/q3-post-pilot20-candidate-recovery-requalification.test.ts`
5. `src/content-factory/q4-deterministic-pipeline-simulation.test.ts`
6. `src/content-factory/q4-candidate-recovery-qualification.test.ts`
7. `src/content-factory/q5-dependency-aware-resume.test.ts`
8. `src/content-factory/q5-candidate-recovery-requalification.test.ts`

The complete set is launched three times through the repository's installed Vitest runtime using deterministic shuffle seeds:

- `211`
- `463`
- `887`

Each repetition uses `--sequence.shuffle` and a different `--sequence.seed`. The assertions themselves are unchanged. A repetition passes only when every bound Q2-Q5 test passes under that execution order.

This deliberately reuses the established provider-free V2-D repetition mechanism rather than introducing a new qualification runner.

## What this proves

If exact-head CI is green, the evidence proves that the current provider-free recovery topology is repeatable across three materially different deterministic test/mutation orderings:

- Pilot #20 complete-diagnostic replay remains green;
- same-required-slot candidate replacement remains green;
- rejected candidates do not become coverage;
- adversarial subject-shape cases remain green;
- accepted siblings survive isolated recovery;
- accepted Assessment wording remains frozen while dependent Marking Packs recover;
- candidate exhaustion continues to block rather than silently omit required content;
- deterministic full-pipeline recovery still reaches `expert_review_ready` where recovery succeeds;
- restart/reuse/dependency invalidation remains stable;
- the historical failure corpus and adversarial mutation corpus remain part of every repetition.

A new generic contract-class regression, unhandled candidate failure, missing required slot, sibling loss or dependency inconsistency therefore fails Q6 rather than being hidden by a single favourable execution order.

## Provider and spend boundary

No live provider is invoked by this evidence. No paid course run is performed. The repeated suites use controlled fixtures and deterministic repository code only.

This evidence does not establish educational benchmark quality or live-provider behaviour. Those are separate assurance concerns.

## Qualification-state boundary

This slice deliberately does **not** modify `content-factory/reliability-qualification.json`.

Consequently, after this evidence alone:

- the global Content Factory qualification remains `paused`;
- Q7 bounded live soak remains machine-ineligible;
- no provider call or paid qualification run is authorised;
- Q8 remains separate;
- no full-course confirmation eligibility is created.

A separate governed consolidation step must inspect current approved-main Q1-Q6 evidence together and explicitly decide whether the machine-readable qualification state may transition to bounded Q7 eligibility.

## Documentation impact

No normative authority changes are required. This work implements an existing Q6 requirement and records technical evidence against it.

No historical evidence is rewritten. No production implementation documentation changes are required because production behaviour is unchanged.
