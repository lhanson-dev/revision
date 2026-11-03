# Issue #698 — Trusted independent A2/A3 educational review for Business PRs #777 / #784

**2 November 2026. Proposed reviewer infrastructure only, unmerged and not executable from approved main before a separately Founder-approved PR merge.** This review runner is intentionally NOT inside the unmerged learner-content PRs.

## Authority and exact learner targets

- Governing: `80-company-workflows/Content Accuracy Assurance Gate.md` (A1 factual alignment, A2 explanations, A3 original practice and A4 marking) and `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.
- Reference source: exact Founder-supplied 42-page AQA Business 7132 v2.0, 14 June 2023, for Summer 2027, SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. Use classification **REFERENCE_ONLY**, no protected original AQA PDF text supplied to the review worker.
- Real affected runtime `/revision/app/` → authenticated AQA Business Course → Marketing Learn / Practice Warm-up / Formulas. Shared `content/business/aqa-a-level/shared/learn.ts` and three paper ContentPacks are the current actual implementation, not a new application.
- Target **PR #777** §3.3.3, printed p16, original market map method, construction self-check and qualitative targeting example; and **PR #784** §3.3.4, printed pp16–17, Boston Matrix and seven Ps Learn + two original self-check exercises. Both content PRs remain independently subject to their own CI, review and Founder approval.

## Why fresh-context review is required

Successful TypeScript/unit/browser/database CI cannot independently establish A2/A3 educational correctness. Both content PRs were authored in one production context, so a fresh-context reviewer must challenge (not simply endorse) each exact candidate after a source-scoped factual check. The unchanged published question bank `3.3:q11–q15` for #777 and `3.3:q31–q32` for #784 provides assessment-demand context; this reviewer does **not** certify existing written Marking Packs/A4 or qualified examiner calibration.

## Protected exact-head contract

`.github/workflows/business-pr777-784-independent-a2a3.yml` runs a no-secret test job on this infrastructure PR. After this infrastructure itself passes CI and obtains **separate explicit Founder approval for its own merge**, the protected provider job can be triggered by an authenticated GitHub PR comment authored by repository owner `lhanson-dev`, **only** on PR #777 or #784, in this exact format:

```text
revision-run-business-marketing-a2a3:v1
head_sha: <exact 40-character current candidate PR SHA>
```

This comment **triggers educational review only**; it cannot grant merge approval. The runner checks:
- named target PR, exact SHA, open PR, `base.ref=main`, same-repository head, owner/OWNER comment association;
- trusted workflow checkout `github.sha` matches then-current approved `main`, and no checked-out/exec/import candidate PR code ever receives provider credentials;
- six fixed allowlisted inert source paths for #777 or five for #784, independently checking Git blob hashes;
- a separate published question bank: Git blob hash checked, then only exact specified question IDs extracted from parsed JSON, never executing untrusted code;
- fresh independent `gpt-5.6-terra` Responses context (`store=false`), structured JSON schema and seven mandatory educational dimensions;
- all named changed assets reviewed; material/blocking findings force `fail_hold`, missing dimensions, malformed findings, unavailable provider keys, stale SHA and truncation fail closed;
- conservative model usage reserve **≤ USD $0.85 per bounded review**. A conservative preflight reserve uses the existing engineering rate assumptions. It does not represent guaranteed real billing; available provider quotas/rates must be observed at runtime.

A 30-day retained receipt records exact target SHA, trusted main SHA, Git blob hashes, source provenance, review model, findings, limitations and decision. This CI does **not** merge, release or alter production data.

## Scope boundaries and required next gates

The model reviewer must challenge all original coordinates/ratios/Boston classifications, scenario logic, sources and educational depth, unclear wording, omissions, A2 pedagogy, A3 self-check explanations and **avoid false claims that showing a model answer independently scores a drawn chart or written evaluation**. If the reviewer returns material/blocking issues, remediate the smallest affected content PR, rerun exact-head CI and invalidate/retrigger prior independent receipt. Existing historical audits are preserved.

A fresh AI review is *not* a qualified AQA teacher/examiner, an A4 written marking calibration, a 42-subsection assurance pass or an authenticated hosted production test. Publication remains **HOLD** until applicable source/rights, educational challenge, CI and release conditions pass. Further expert moderation is required before the product can be marketed as a benchmark educational offering; limited restricted-pilot decisions must be explicitly justified against the Content Accuracy Assurance Gate.

## Documentation-impact decision

Infrastructure changes only: workflow, trusted script, guard tests, this technical contract and INDEX pointer belong in this separate governed PR. No normative authority is being changed. Existing documents already define the required process. No historical assessment record is rewritten, and this reviewer is not evidence until its actual exact-head result is retained and inspected.


## Follow-up: PR #777 first review FAIL/HOLD and reviewer evidence scope correction (2 November 2026)

[Trusted review run #41472160176](https://github.com/lhanson-dev/revision/actions/runs/41472160176) completed against exact candidate #777 head `dda5df2bfbb3c884fb68cadb625a315740aa19ca`, main `99fe1885c3906e809f975c095f35edd45909c9ac`. Retained artifact `13155277875` explicitly states `completed=true, decision=fail_hold`. Reviewer independently verified the plotted coordinates and price comparisons as correct, accepted the source-rights boundary and unscored diagram/written evaluation limitations, and reported two minor language corrections (independently suitable scales, possible overlapping positions, direct price wording). A material integration finding was **a review-input deficiency**: although exact-head nine-job CI had passed, the independent reviewer was given only assertions in test source—not the three paper pack files or trusted CI receipts. **It did not prove the implementation broken**, and **cannot be promoted to PASS** by interpretation.

This correction to the trusted reviewer provides separately Git-hash-verified actual Paper 1/2/3 ContentPack sources at the exact target PR head and fetches completed **latest** GitHub `Revision CI` run plus exactly nine successful jobs by the GitHub Actions read-only API. The trusted workflow gains `actions: read` only. The reviewer prompt must distinguish local authenticated CI from *production* acceptance and A4 independent marking. Missing, stale, incomplete, failed, duplicated or newer pending CI must fail closed before model invocation. Candidate source remains inert and never runs under secrets.

The original PR #777 has been amended with two minor educational text corrections and tests. Reviewer evidence for the old content SHA remains historically valid, but is **invalidated** for any newly corrected head; rerun exact-head CI and independent A2/A3 after both the reviewer-infrastructure fix and candidate updates have been approved as applicable.

This is review evidence plumbing, not a policy change or learner-facing feature. The historical FAIL/HOLD receipt and Issue #698 notes are preserved. No production/section/full-course completion claim.


## Proposed extension — PR #805 Operations §3.4.2 (3 November 2026)

This is a separate, **unmerged reviewer-infrastructure candidate**. The already-approved trusted Business runner originally limits itself to Marketing PRs #777 and #784. The proposed guarded extension adds only PR **#805**, the original eight one-mark Operations §3.4.2 final-value checks and the combined Operations Learn page, without creating a new model-based learner system or weakening the existing owner/exact-head restrictions.

**Structured AQA source facts only:** official Business 7132 v2.0, 14 June 2023, PDF SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, §3.4.2 printed page 18. The source specifies *interpretation, calculation and use* of labour productivity, unit costs (average costs), capacity and capacity utilisation for operational decision-making and planning. Rights stay `REFERENCE_ONLY`; no substantial AQA PDF or protected source question text enters the AI review worker. The original published `3.4:q07/q08/q09` bank records provide bounded published learner assessment context, not examiner calibration.

On approved-main operation, the existing read-only runner for #805 would verify the current open PR identity and full **exact 40-character HEAD SHA**, trusted current `main`, inert allowlisted Git blobs for the current candidate lesson, eight question objects, exact-skill reassessment link, regression tests, technical evidence and three actual paper pack definitions. It independently queries the newest exact-head nine-job GitHub CI receipt and fails closed on missing/failed/replaced CI, missing secrets, excessive cost, stale SHA, malformed results or material educational findings. Candidate files are treated only as **untrusted data** and are never checked out or executed with provider credentials.

The separate fresh-context adversarial A2/A3 model review must recompute all **eight** responses, check method/units/time periods, scenario plausibility, two distinct stimuli per exact AQA skill, Learn repair mapping, existing ID/evidence preservation, original exam-style assessment structure, honest one-mark-only grading and the distinction between numeric correctness and interpretation/use. A machine-readable receipt must include each of the **nine** reviewed asset IDs, all seven existing review dimensions, severity-classified findings, known limitations, exact Git blob hashes and the current successful CI receipt. **A2/A3 pass does not certify AO3/AO4 or qualified AQA examiner approval**, nor prove hosted production learner acceptance or entire §3.4.2 adequacy.

For the specific PR #805, after the infrastructure PR is separately approved and merged, the repository owner may trigger the existing trusted workflow with a GitHub **PR #805 Conversation** comment, using this exact two-line format:

```text
revision-run-business-marketing-a2a3:v1
head_sha: <current exact 40-character #805 commit SHA>
```

The legacy trigger marker is deliberately unchanged to preserve compatibility with #777/#784. Review initiation is **not Founder merge approval**. The caller must use the then-current #805 SHA, not a stale example. Do not submit the trigger before the infrastructure is merged and enabled on approved `main`. Each new #805 commit invalidates the prior scoped review receipt and requires fresh CI and review.

**Documentation impact:** This extension modifies only the existing trusted reviewer, its node guard, workflow and this technical note. The approved content accuracy, source rights, AI operating and merge governance already prescribe the needed controls; no normative authority or ADR change. Historical Marketing receipts are not rewritten. Issue #698 stays the single programme tracker.
