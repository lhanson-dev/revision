# Content Factory Q1 Contract Ownership Qualification

**Status:** Provider-free qualification evidence  
**Reviewed baseline:** `721063a9e31e3cf695a99bfa63af74af7d36c7bc`  
**Authority:** `80-company-workflows/Content Factory Reliability Qualification Standard.md`  
**Architecture decision:** `decisions/ADR-0019-content-factory-candidate-recovery.md`

## Purpose

This evidence refreshes Q1 after Confirmation Pilot #20 reset the reliability qualification around candidate-based manufacturing and bounded automatic recovery.

The governing question is not whether a provider can usually return valid JSON. It is whether every mechanically provable part of the production contract has an explicit owner and whether Revision, rather than the generative provider, owns recovery mechanics that must be deterministic.

The canonical inventory remains:

- `content-factory/reliability-contract-inventory.json`

The executable drift proof is:

- `tests/content-factory-q1-ownership-refresh.test.mjs`

## Post-Pilot #20 ownership decision

Revision owns the recovery topology. The provider owns semantic educational candidate content inside that topology.

Revision deterministically owns or fail-closes:

1. Assessment slot identity from the governed Question Family and component.
2. Assessment candidate ordinal and the maximum candidate count.
3. Assessment candidate acceptance or rejection and whether an output reference exists.
4. Marking Pack slot identity from the frozen accepted Assessment Item.
5. Marking Pack candidate ordinal and the maximum candidate count.
6. Marking Pack acceptance or rejection and whether it satisfies Marking Pack coverage.
7. Durable candidate execution state used for restart and reuse.
8. Preservation of accepted dependencies and siblings during targeted recovery.
9. Recovery exhaustion and the resulting explicit course blocker.
10. Required-coverage reconciliation before course-pack assembly.

The generative provider may receive `candidateNumber` and `maxCandidates` as bounded context, but it does not author those values and cannot change the slot being filled.

## Production evidence

The production Assessment loop derives the next candidate from durable worker-run state, uses a fixed two-candidate ceiling, records rejected candidates without output references, persists accepted candidates, and blocks explicitly when the ceiling is exhausted:

- `src/content-factory/assessment-candidate-recovery.ts`
- `src/content-factory/assessment-and-marking.ts`

The Marking Pack loop applies the same bounded mechanics to a slot derived from the already accepted Assessment Item:

- `src/content-factory/marking-pack-candidate-recovery.ts`
- `src/content-factory/assessment-and-marking.ts`

Course-pack assembly independently reconciles mandatory coverage so rejected candidates cannot become missing curriculum by omission:

- `src/content-factory/assessment-and-marking-with-coverage-reconciliation.ts`
- `src/content-factory/required-coverage-reconciliation.ts`

## Executable Q1 proof

`tests/content-factory-q1-ownership-refresh.test.mjs` fails if the refreshed inventory no longer agrees with the production recovery contract. It verifies that:

- the inventory is explicitly reviewed against the post-Pilot #20 baseline;
- every recovery control is owned by deterministic Revision logic or a fail-closed Revision decision, never generative judgement;
- the inventory candidate ceilings equal the production constants;
- canonical Assessment and Marking Pack slot/candidate references match the production helper functions;
- `candidateNumber` and `maxCandidates` are recorded as Revision-owned inputs at both provider boundaries;
- semantic Assessment Item and Marking Pack content remains generative judgement, preserving the intended division between educational authorship and mechanical production control.

This converts Q1 from a prose-only assertion into an ownership inventory with an executable drift guard tied to the production constants that define the candidate-recovery topology.

## Qualification effect

This is focused Q1 evidence only.

It does **not**:

- call a live model provider;
- run a paid course;
- change learner-facing product behaviour;
- alter the candidate-recovery production implementation;
- authorise Q7 live soak;
- authorise Q8 or full-course confirmation;
- change `content-factory/reliability-qualification.json` from its paused post-Pilot #20 state.

The machine-readable global qualification remains paused deliberately. Q1 evidence may be used in the later governed qualification-state consolidation only alongside the required evidence for the other reset gates.

## Documentation impact

No normative authority change is required. The Reliability Qualification Standard and ADR-0019 already require compiler ownership of mechanically provable fields and bounded candidate recovery.

This change updates current technical/evidence documentation and the canonical current ownership inventory only. Historical Pilot evidence and historical inventory snapshots remain unchanged.
