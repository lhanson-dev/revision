# Content Factory Foundation v2 Recompilation Checkpoint

**Status:** Retained real-course v2 Foundation compilation proof complete; Slice 3B source rebind in progress  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`  
**Related assurance history:** `docs/technical/Content Factory Foundation Independent Review Proof.md`

## Purpose

Record the fresh upstream Foundation recompilation required after the fourth retained Slice 3B proof showed that the historical AQA A-level Business 7132 Foundation was structurally too coarse for controlled downstream generation.

This checkpoint is append-only operational evidence. It does not reinterpret the four earlier Slice 3B independent-review proofs and does not change normative Content Factory authority.

## Released compiler boundary

PR #304 hardened Foundation compilation so that:

- existing governed `skillsOrKnowledge` entries compile to deterministic atomic canonical Course Truth node identities;
- Foundation coverage v2 cannot claim structural completeness with fewer canonical nodes than the governed knowledge/skill items it represents;
- the Course Truth provider enriches the exact canonical nodes rather than deciding curriculum identity;
- Exam Truth v2 carries a compiler-owned quantitative coverage plan linked to the verified assessment requirement;
- AQA A-level Business 7132 records a qualification-total quantitative minimum of 10%, represented as at least 30 marks across the three 100-mark papers;
- the generation validation contract is `sum_quantitative_marks_gte_minimum` with interpretation credit required; and
- subsequent AI remediation must preserve the v2 schema version and compiler-owned quantitative plan.

PR #304 merged to approved `main` as `48e547c44c5def0e22b3f33b1e5f762f1cd93ce4`. Post-merge Revision CI #1560 and Pages #236 passed on that exact commit.

## Retained v2 Foundation live proof

The governed **Content Factory Foundation Live Proof** ran once as workflow run `33896487722` on exact released `main` `48e547c44c5def0e22b3f33b1e5f762f1cd93ce4`.

Retained artifact:

- artifact id: `9945993178`;
- artifact name: `content-factory-foundation-live-proof-48e547c44c5def0e22b3f33b1e5f762f1cd93ce4`;
- artifact digest: `sha256:c151f91c92313771a805eef10615951f674a85bd66519b83ff242cedbc58a18a`;
- retained proof file: `aqa-a-level-business-7132-foundation-48e547c44c5d-1788540075670.json`.

The live compilation test passed and retained a complete Foundation Candidate with:

- course: **AQA A-level Business 7132 — 2027 cohort**;
- Foundation fingerprint: `950c002c325e4d6a980d2588c707b3c541a3316b9fe5b7ce446fd51b1e481fac`;
- Course Truth nodes: `82`;
- canonical coverage nodes: `82`;
- Course Truth compiler completeness: `complete`;
- Exam Truth compiler completeness: `complete`;
- quantitative minimum: `10%` of qualification marks;
- total qualification assessment marks: `300`;
- minimum quantitative marks: `30`;
- eligible Question Families: Paper 1 MCQ, short answer and essay; Paper 2 data response; Paper 3 case study;
- quantitative generation validation: `sum_quantitative_marks_gte_minimum`;
- interpretation credit required: `true`;
- live provider generation runs: Course Truth, Exam Truth and Question Families;
- conservative provider spend: `$0.129068 / $12.00`;
- learner-facing assets: `0`.

The retained live proof correctly records deterministic assurance and independent review as `pending`. Successful compilation is not educational assurance, expert approval or `foundation_approved`.

## Slice 3B source rebind

The released independent-review workflow was still deliberately pinned to the historical Slice 2B source proof:

- workflow run `33802600001`;
- Foundation fingerprint `5b9a8496128b67d78c00a6075fe46ca70cad08bbc10bed6f4ce8f16b97e6efd8`.

That historical candidate is stale for the v2 structural-hardening proof and must not be reviewed again as though it were the new Foundation.

The governed rebind changes only the retained source identity used by `.github/workflows/content-factory-foundation-independent-review-proof.yml` to the exact v2 artifact above. The independent-review implementation, deterministic precondition, fresh-context separation, remediation dependency closure, three-cycle limit, $12 whole-proof spend ceiling and zero-learner-asset rule are unchanged.

After this source rebind is exact-head assured, Founder-approved, merged and production-verified, one governed Slice 3B proof may run against the new `950c...` Foundation. A failed proof must be diagnosed from retained evidence rather than blindly rerun.

## Progression boundary

Slice 3B is not complete at this checkpoint.

The exact current v2 Foundation may progress toward Slice 3C only if the released Slice 3B chain establishes:

1. deterministic assurance PASS for the exact current Foundation fingerprint and reviewed implementation commit;
2. genuinely fresh independent-review context distinct from all retained generation contexts;
3. no unresolved blocking/material finding after any permitted smallest-safe remediation;
4. deterministic re-assurance after each material correction;
5. fresh re-review after remediation; and
6. final independent-review PASS within the existing three-cycle limit.

Even a clean Slice 3B PASS does not constitute qualified expert approval. Slice 3C remains mandatory before `foundation_approved` and before any learner-facing asset factory may start.

## Documentation impact

This checkpoint records new implementation evidence only. No normative authority changes. Historical proof evidence is preserved rather than rewritten. The core Foundation-gated implementation plan and independent-review proof history remain the governing technical sequence/history; this file records the exact v2 recompilation and source-binding handoff needed to continue that sequence.
