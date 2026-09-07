# Content Factory External Source Challenge Quantitative Remediation

**Status:** Active remediation evidence under ADR-0024  
**Parent initiative:** Issue #289 — Content Factory foundation-gated course production  
**Normative authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`, `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`, and `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`  
**Related implementation:** `docs/technical/Content Factory Foundation Source Universe Challenge.md`

## Purpose

Record the fresh external-source challenge of the AQA A-level Business 7132 / 2027 Foundation after deterministic assurance and ordinary fresh-context independent review passed, and document the implementation correction required before qualified expert review.

This is an implementation/provenance correction under existing authority. It does not change source-rights policy, Foundation approval criteria or learner-facing product behaviour.

## Exact challenged Foundation

The challenged Foundation was retained by Foundation Live Proof run `34049089770`:

- source artifact: `9994019707`;
- source content head: `ea8b1143270f70477dc5964f863c0e8e764bf3d5`;
- job: `aqa-a-level-business-7132-foundation-ea8b1143270f-1788716165887`;
- candidate: `aqa-a-level-business-7132-foundation-ea8b1143270f-1788716165887-candidate-1`;
- Foundation fingerprint: `4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d`;
- learner-facing assets: `0`.

After PR #332 was released on `main` at `bc377f0765ef64dcf15dc146f3299211816be693`:

- deterministic re-assurance run `34063780855` passed 19 checks with zero failures; and
- fresh independent-review run `34063818271` passed with zero material/blocking findings, zero remediation cycles and zero unresolved blockers.

Those passes remain valid evidence for the boundaries they test. They do not override a later external-source challenge finding.

## Fresh external-source challenge decision

On 7 September 2026 a fresh-context external-source challenge was performed against Source Universe profile `aqa-7132-2027-source-universe` and all six required source categories.

Challenge context:

`chatgpt-external-source-challenge-aqa7132-2027-20260907T062300Z`

Decision:

**`fail_hold`**

Material finding:

`aqa-7132-quantitative-formula-coverage-gap`

The current AQA Formulae and key data guide contains applicable 7132 calculation conventions that the exact Foundation names as calculable skills but does not retain as explicit governed Course Truth formulas. The missing groups are:

- revenue, total variable cost, total cost and profit;
- decision-tree expected value and net gain;
- market growth and market share;
- labour productivity, unit cost and capacity utilisation;
- contribution per unit, total contribution, break-even output and margin of safety; and
- employee costs as a percentage of turnover and labour cost per unit.

AQA marks employee retention rate as removed from the specification from September 2023. It must remain excluded.

The prior Foundation therefore must not progress to qualified expert review or `foundation_approved`.

## Remediation boundary

The correction belongs in the existing `REFERENCE_ONLY` qualification-alignment boundary, not in generative source inputs and not in curriculum provenance.

The implementation:

1. adds controlled structured quantitative alignment facts for every missing current formula group;
2. retains those facts in Board Alignment with source `aqa-7131-7132-formulae-key-data`;
3. deterministically overlays the exact formulas onto the governed Course Truth nodes for requirements `3.1.1`, `3.2.2`, `3.3.1`, `3.4.2`, `3.5.2` and `3.6.2`;
4. keeps Course Truth `sourceRefs` restricted to permitted curriculum sources;
5. keeps protected AQA prose outside generative worker contexts; and
6. explicitly regresses that the removed employee-retention-rate formula is not reintroduced.

This extends the same alignment mechanism already used for market capitalisation, added value, ROI, profit measures/margins, variance, labour turnover and critical-path convention. It does not relax source-rights controls.

## Expert-review package handoff hardening

The external challenge also exposed a downstream operational defect: `.github/workflows/content-factory-foundation-expert-review-package.yml` was still pinned to the historical pre-Source-Universe proof chain and fingerprint.

That historical package must never be reused for the current Foundation.

The workflow is therefore changed to accept an explicit exact proof identity at dispatch time:

- source Live Proof run ID;
- source artifact ID;
- source head SHA;
- source Foundation fingerprint;
- independent-review run ID;
- independent-review artifact ID;
- reviewed implementation commit;
- final reviewed Foundation fingerprint; and
- the structured external-source challenge JSON.

The workflow independently verifies both workflow runs are successful `main` runs of the expected workflows; verifies exact artifact ownership, names, heads, expiry and immutable digests; downloads exactly one JSON proof from each artifact; verifies the source and review proof chain is internally consistent; verifies the final candidate passed deterministic and independent review with zero unresolved blockers and zero learner assets; and only then invokes the existing exact-fingerprint expert-package contract.

This removes the repeated one-off rebind problem while keeping workflow dispatch as the explicit package input boundary required by the existing Source Universe challenge implementation.

## Required next proof chain

Because the quantitative correction changes material Board Alignment and Course Truth dependencies, the old fingerprint `4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d` is superseded for progression purposes.

After this remediation is released:

1. run a completely fresh main-only AQA 7132 / 2027 Foundation Live Proof;
2. retain the new exact Foundation fingerprint and zero-learner-asset evidence;
3. run deterministic assurance against that exact proof;
4. run a genuinely fresh independent review against the same proof;
5. perform a new external-source challenge against the exact final reviewed fingerprint;
6. only if that challenge passes, dispatch the reusable expert-review package workflow with the exact source/review identities and passing challenge JSON; and
7. obtain genuinely qualified human subject and assessment review before any `foundation_approved` transition.

No historical candidate, challenge or expert package may substitute for this fresh chain.

## Documentation impact

No normative authority or ADR changes are required. Issue #289 retains the exact `fail_hold` challenge checkpoint. This document records the implementation remediation and reusable expert-package handoff. Historical evidence remains unchanged.
