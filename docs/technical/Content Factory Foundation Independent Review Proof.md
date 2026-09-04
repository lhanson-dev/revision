# Content Factory Foundation Independent Review Proof

**Status:** Operational proof harness released; four retained real-course proofs have run. The fourth proved the full review → remediation → deterministic re-assurance → fresh re-review loop and stopped correctly at the three-cycle limit because two structural Foundation-quality findings remained.  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation lineage:** Slice 3B PR #298; proof harness PR #299; controlled invocation PR #300; blocker diagnostics PR #301; remediation fingerprint-contract repair PR #302; bounded remediation-capacity/diagnostics repair PR #303.

## Purpose

Prove the released Slice 3B Foundation assurance boundary against a retained real-course **AQA A-level Business 7132 — 2027 cohort** Foundation Candidate before Slice 3C qualified expert review begins.

The assurance proof reuses an exact retained Foundation Candidate and does not generate learner-facing assets. When independent review shows that the retained Foundation itself was compiled at an insufficient structural granularity, the correct next step is governed upstream Foundation recompilation rather than unlimited remediation of the stale candidate.

## Proof boundary

The main-only workflow `.github/workflows/content-factory-foundation-independent-review-proof.yml`:

1. verifies the exact retained source artifact identity and digest;
2. downloads the retained Foundation Candidate and compilation worker-run ledger;
3. recomputes the retained aggregate Foundation fingerprint;
4. extracts all retained generation context IDs from the compilation ledger;
5. reconstructs the Foundation job at the canonical `assuring` boundary;
6. binds generation-context evidence into non-material Candidate provenance;
7. establishes deterministic PASS against the exact current `main` implementation commit and Foundation fingerprint;
8. invokes the released independent-review provider route in a genuinely fresh context;
9. rejects any generation/review/remediation context reuse;
10. persists structured independent-review evidence;
11. if blocking/material findings are eligible for local correction, invokes the released smallest-safe targeted-remediation path;
12. requires a materially new Foundation fingerprint for material correction;
13. reruns deterministic assurance on every remediated candidate;
14. runs another fresh independent review after successful deterministic re-assurance;
15. stops at the released remediation-cycle limit or upstream recompilation boundary rather than weakening the gate; and
16. uploads the full proof evidence and records the outcome on Issue #289.

## Controlled invocation

The proof remains deliberately non-automatic because it makes bounded paid provider calls. It may be started by main-only `workflow_dispatch` or by the exact Issue #289 owner command:

`revision-run-foundation-independent-review-proof:v1`

The issue-comment trigger ignores other issues, other users, non-owner associations and non-exact command text. Paid proof runs must not be repeated blindly after a retained failure.

## First retained real-course proof outcome

Workflow run `33842046624` ran on approved `main` commit `7474068be3f7958b2e8c3233ed96d96858cbc8e3`.

The independent reviewer produced three material findings:

- quantitative Course Truth lacked sufficient formula/procedure, variable/unit, interpretation, assumption and misconception detail;
- the Paper 2 Question Family lacked a defensible constituent mark/demand/quantitative/timing progression; and
- the Paper 3 Question Family lacked a sufficiently explicit internal mark/demand/evidence/quantitative/timing sequence.

The retained Foundation fingerprint remained `5b9a8496128b67d78c00a6075fe46ca70cad08bbc10bed6f4ce8f16b97e6efd8`. Deterministic assurance remained `pass`, independent review was `fail_hold`, learner-facing asset count remained `0`, and conservative provider spend was `$0.2488 / $12.00`.

The runtime correctly failed closed, but this run exposed an observability gap: no remediation record was retained and the final operational blocker reason was absent from proof evidence. PR #301 added durable blocker diagnostics before another paid run.

## Second retained real-course proof outcome

Workflow run `33845049342` ran on approved `main` commit `1989f306cc1a742e2eccb65f53a38c5f338fabba` after blocker diagnostics were released.

The run failed closed before a remediation record could be retained. Deterministic assurance remained `pass`, independent review remained `fail_hold`, remediation cycles remained `0`, learner-facing asset count remained `0`, and conservative provider spend was `$0.2022 / $12.00`.

The retained blocker isolated a provider-contract defect: semantic Course Truth remediation did not contain `correctedArtifact.fingerprint`, and dependent Exam Truth did not contain `correctedArtifact.courseKnowledgeModelFingerprint`. Those are compiler-owned derived fields. PR #302 removed the contradictory model requirement and restored the fields deterministically in Revision before the remediation core independently recomputed and validated them.

## Third retained real-course proof outcome

Workflow run `33872089814` ran on approved `main` commit `afd867c18cbac1ee0f602010df21820bf71a2945` after the fingerprint-contract repair.

The fingerprint defect did not recur. The targeted-remediation provider reached OpenAI but returned status `incomplete`; the runtime failed closed before retaining a remediation record. Deterministic assurance remained `pass`, independent review remained `fail_hold`, learner-facing asset count remained `0`, and conservative provider spend was `$0.2420 / $12.00`.

The released adapter did not yet retain `incomplete_details.reason`, so `max_tokens` was treated as a high-confidence diagnosis rather than reconstructed fact. PR #303 raised only targeted-remediation generation capacity from 12,000 to 32,000 output tokens, kept independent review at 12,000, retained the `$12` whole-proof ceiling, and added non-completed response reason/token diagnostics.

## Fourth retained real-course proof outcome

Workflow run `33881398927` ran on approved `main` commit `45813911d10a012b0477ed43a6259fdb0e57db22` after PR #303. Retained evidence artifact:

- artifact id: `9940183840`;
- artifact digest: `sha256:93abb65e6d88292cadf02225478cc07546673510dadf4a1ceaf3b7669c9567f8`.

The provider-capacity failure did **not** recur. The released Slice 3B loop completed three targeted remediation cycles, created three materially changed Foundation candidates/fingerprints, reran deterministic assurance after each correction and performed four fresh independent reviews. No provider response was incomplete and no infrastructure blocker remained.

The final remediated Foundation fingerprint was:

`ae57b118251b5124b020c9505f7582b00d29104560c6020212fff5754aa9acfb`

Final retained state:

- deterministic assurance: `pass`;
- independent review: `fail_hold`;
- fresh review contexts: `4`;
- retained remediation cycles: `3`;
- provider spend: `$0.530818 / $12.00`;
- learner-facing assets: `0`;
- final operational blocker: `foundation-remediation-cycle-limit-aqa-a-level-business-7132-foundation-b7f5ec6f6997-1788467414643-candidate-1-r1-r2-r3`.

The blocker reason was that blocking/material findings remained after the governed three-cycle limit. The cycle limit therefore worked as intended; it must not be raised merely to obtain a PASS.

### Remaining structural findings after review cycle four

Two material findings remained:

1. **Quantitative minimum is not operationalised.** The Foundation states the requirement that quantitative skills account for at least 10% of overall marks, but the retained Exam Truth does not convert that into an enforceable generation constraint. With three 100-mark papers, downstream full-assessment generation needs a governed aggregate minimum of at least 30 quantitative marks and deterministic validation that the generated set satisfies it, including interpretation credit where appropriate.
2. **Course Truth nodes are too coarse for controlled generation.** Several coverage requirements are considered complete through a single broad topical node even though the governed Revision-owned seed already lists multiple `skillsOrKnowledge` items. This leaves too much detail to downstream model reconstruction and creates omission/uneven-depth risk.

These findings are educational/Foundation-structure evidence, not provider or infrastructure failure.

## Governed follow-up after the fourth proof

Another remediation run against the old retained Foundation is not the correct next action. The fourth proof showed that the limiting defects originate in Foundation compilation structure itself.

The next governed compilation hardening therefore:

- keeps the existing rights-governed Revision-owned source seed;
- deterministically creates canonical atomic node IDs for every existing `skillsOrKnowledge` entry rather than mapping each broad requirement to one node;
- makes v2 coverage complete only when at least one canonical node exists for every governed `skillsOrKnowledge` item;
- asks the model to enrich only those exact canonical atomic nodes, without inventing source scope or identifiers;
- adds an Exam Truth v2 compiler-owned quantitative coverage plan bound to the verified `quantitative-minimum` assessment requirement;
- for AQA 7132, records a qualification-total minimum of `30 / 300` marks, the eligible Question Families and a generation validation rule `sum_quantitative_marks_gte_minimum`;
- preserves that quantitative plan and schema version mechanically through later AI remediation; and
- keeps v1 retained artifacts readable so historical evidence is not reinterpreted.

Because canonical coverage and Course Truth identity change, this is an upstream Foundation recompilation boundary. After the hardening is released, Revision must run a fresh Foundation live proof first. Slice 3B independent review must then be rebound to that new retained Foundation artifact/fingerprint; the old `5b9a...` source candidate must not be treated as the new proof input.

## Success condition

The independent-review proof passes only when the final exact Foundation Candidate remains in `assuring` state with:

- deterministic assurance `pass`;
- independent review `pass`;
- final review decision `pass`;
- all review/remediation context IDs distinct from retained generation contexts and from each other;
- provider spend within the configured bounded proof budget; and
- learner-facing asset count still `0`.

A clean first review is valid. If blocking/material findings occur, a PASS is valid only after the complete retained remediation → new fingerprint → deterministic re-assurance → fresh re-review chain reaches PASS within the governed cycle limit.

## Fail-closed outcomes

The proof blocks progression when any required deterministic evidence fails, generation-context provenance is missing, context separation is violated, provider evidence is invalid/incomplete, an upstream Source Rights/Board Alignment/Foundation coverage defect requires recompilation, remediation violates exact dependency closure, a claimed material correction does not change the Foundation fingerprint, deterministic re-assurance fails, blocking/material findings remain after the bounded remediation limit, or the final candidate lacks both deterministic and independent-review PASS.

Any unresolved operational blocker is retained verbatim in proof evidence and Issue #289 output. Non-completed provider responses additionally retain status/reason and token usage where supplied.

## Evidence retained

Uploaded proof evidence records source workflow/artifact/digest identity, source/final Foundation fingerprints, reviewed implementation commit, excluded generation contexts, fresh review/remediation contexts, provider-response diagnostics, spend, final state/blockers, review reports/refs, remediation records/refs, corrected artifacts, final Candidate and learner-facing asset count.

## Governance boundary

A successful Slice 3B proof establishes only that the exact Foundation version has passed deterministic assurance and fresh-context independent AI review under the released implementation.

It does **not** establish qualified subject/assessment expert approval, `foundation_approved`, permission to start learner-facing asset factories, publication approval, or repository merge approval. Slice 3C remains a separate mandatory qualified-human approval gate.

## Documentation impact

This document preserves all four retained proof outcomes as historical operational evidence and records the new structural recompilation requirement exposed by the fourth proof. It does not change normative Content Factory authority. The Foundation hardening implements the existing authority that Course Truth be sufficiently complete and precise and that Exam Truth encode applicable quantitative assessment requirements. Historical Slice 2B/3A and earlier Slice 3B proof evidence remains historical and is not rewritten as if it had used the new v2 compilation contracts.
