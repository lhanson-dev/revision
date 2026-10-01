# Content Factory AQA 7132 Question Run 369256 Remediation

**Status:** implementation candidate on governed branch; not merged and not learner-publication approval  
**Source run:** GitHub Actions `36925676050` on main `f284141017a897509da6a6dfe345bd844155e03b`  
**Governing process:** `80-company-workflows/Content Factory Fast-Path Process.md`

## Purpose

Record the narrow remediation required after the resumed AQA A-level Business 7132 question run accepted 219 of 231 planned questions and left 12 unresolved items.

The run reused 116 unchanged accepted questions without re-review. Three batches completed fully: 3.6 (28/28), 3.8-3.9 (18/18) and 3.5-topup (9/9). The 3.5-topup q04 recovery proved the PR #488 magnitude-word correction live: retained generation and blind-answer evidence were reused and only the required fresh review was purchased.

This remediation does not change the pipeline architecture, the fixed question checklist, the two-review limit or the per-batch spend control.

## Founder decision

Ten questions reached the two-review limit. On 1 October 2026 the Founder chose **fix** for all ten. The exact source-run fingerprints and the specific fix instruction for each question are recorded in:

`content-factory/runs/aqa-7132-question-founder-decisions.json`

The ten units are:

- 3.1-3.2: q20, q24, q25, q38 and q41;
- 3.4: q01;
- 3.7: q04, q05 and q07; and
- 3.10: q10.

The decision does not accept the old candidates. Changed inputs must pass fresh deterministic checks and the normal fixed-checklist review.

## Upstream Foundation fixes

Four findings were genuine missing or insufficient mapped teaching, so the Foundation is deepened additively in `QUESTION_ESCALATION_FIXES.json`:

- **BUS-FND-001** — explicit mission/objective relationship and why objectives support direction, resource allocation, coordination, monitoring and corrective action;
- **BUS-FND-009** — explicit environmental-issues teaching and business transmission mechanisms;
- **BUS-OPS-001** — environmental objectives taught on the node actually mapped to the 3.4.1 item; and
- **BUS-STR-009** — Lewin force-field analysis explicitly teaches driving forces, restraining forces and use of the framework.

The additions use sources already registered as promotion-eligible for the affected nodes. They change the Subject Foundation fingerprint, so exact-course T8 assurance and the dependent Learn/Practice nodes must be refreshed before the dependent questions are resumed.

Expected Learn/Practice invalidation is narrow: BUS-FND-001 and BUS-FND-009 in batch 3.1-3.2, BUS-OPS-001 in 3.4, and BUS-STR-009 in 3.10. Unchanged nodes remain eligible for exact-fingerprint reuse.

## Question-only Founder corrections

Six escalations were broken question or mark-scheme construction rather than Foundation gaps:

- 3.1-3.2 q24 — genuinely require social-enterprise knowledge and credit the incorporation/legal-form reasons actually asked for;
- 3.1-3.2 q25 — accept valid investor-return routes such as dividends and capital growth rather than one narrow rationale;
- 3.1-3.2 q41 — do not give the regulator's inspection/enforcement role away in the scenario;
- 3.7 q04 — genuinely require emerging-economy knowledge and align all four marks to the explanation;
- 3.7 q05 — do not embed the definition of licensing in the scenario; and
- 3.7 q07 — do not give multinational knowledge away or reward repetition of supplied facts.

The question runner now includes these Founder-decided corrections in the generation payload **and** in the review-unit fingerprint. This is important: the old escalated fingerprint cannot be reused merely because the question plan ID and target items are unchanged.

## Deterministic checker fixes

Two unresolved questions were false software blockers and therefore do not justify AI regeneration:

1. **3.1-3.2 q03:** `-£60,000` was parsed as positive `60,000` because the sign appeared before the currency symbol. Numeric extraction now recognises a sign before an optional currency symbol.
2. **3.3 q02:** the question expressed market sizes as `£48 million` and `£54 million`, while the calculation inputs were stored as 48 and 54 in the explicitly stated magnitude unit. Numeric matching now retains both the normalised full value and the literal base value when a magnitude word is present, while `numbersIn()` continues to expose the normalised value.

Regression tests cover both failures and the six Founder question-only corrections.

## Resume sequence after merge

Do not immediately repurchase all question work. The governed continuation is:

1. run fresh exact-course T8 assurance for the changed Foundation scope;
2. refresh Learn/Practice only for the affected nodes/batches and verify exact-fingerprint reuse of unchanged nodes;
3. persist those refreshed assets/evidence through the normal governed PR/merge path; then
4. resume `Content Factory AQA Business 7132 Slice Questions` with `batch=all` and `resume_run_id=36925676050`.

The source run `36925676050`, rather than the older `36857736736`, is now the correct resume checkpoint because it contains the 219 accepted questions and the latest blocker evidence.

## Publication and review boundary

Nothing in this remediation makes content learner-publication eligible. Qualified human review remains pending and will occur on the finished course in context, as previously decided.

## Documentation impact

This file records implementation truth and the exact continuation path. No normative authority, ADR or historical evidence is rewritten. The append-only Content Factory run log records the run, Founder decision and individual fixes.
