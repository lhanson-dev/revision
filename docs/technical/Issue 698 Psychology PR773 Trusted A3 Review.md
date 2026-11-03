# Issue #698 — Trusted independent Psychology Social Influence Practice A3 reviewer

## 2 November 2026 — independently challenged placement evidence (proposed correction, NOT installed)

**The trusted A3 infrastructure of PR #774 is already merged and deployed**, superseding the original prospective-infrastructure status below. Original exact-head [A3 run #41424189543](https://github.com/lhanson-dev/revision/actions/runs/41424189543) reviewed all 12 PR #773 items and all eight dimensions. Its retained [receipt #13130768978](https://github.com/lhanson-dev/revision/actions/runs/41424189543/artifacts/13130768978) concluded `fail_hold` with one material `incorrect_paper_specific_content_pack_placement` finding. All eight original scored answer keys/distractor rationales and four written self-check models received bounded positive review; their educational judgement is **not** promoted to final signoff while the overall A3 is on hold. Preserve that original failed review as historical evidence.

The material finding inferred paper-specific learner exposure solely from the same general Practice questions being assembled under internal `paper-1/2/3` ContentPack filenames. This conflicts with Founder-approved `10-product-governance/Course Content and Assessment Component Placement.md`: **Learn and general Practice appear once at course level; per-paper mock/paper-format material belongs to Exam Prep; internal module identifiers do not decide the learner-facing hierarchy**. Existing approved-main `content/psychology/aqa-a-level/content.test.ts` asserts the three paper packs share `topics`, `learn` and `questions`, while `tests/e2e/psychology-restricted-pilot-route.spec.ts` traverses a single signed-in course Practice route and a separate three-paper Exam Prep route. These tests are structural and simulated browser evidence, **not** independent real-student acceptance.

This branch proposes to supply the *actual source text* of the normative placement authority and bounded excerpts from both approved-main tests to the next independent reviewer. Source files come strictly from the **trusted approved-main checkout**, not the unmerged content PR or model assertions. The reviewer must independently decide whether general Practice is genuinely misrouted, must still identify real mixing into paper-specific mocks if demonstrated, must challenge every original answer and feedback, and must keep all eight original assessment dimensions. An explicit fail-closed source-anchor contract test prevents silent omission if governing authority or routing tests change. The exact PR #773 six inert candidate sources, their blob verification, Founder-only owner trigger, $0.50 cap and protected model runtime are unchanged.

**Release gates:** This is a **new proposed reviewer correction PR**, not an automatic reversal of the original `fail_hold`. It requires exact current-main CI and **distinct Founder approval for the reviewer change** before merge. Only then can the reviewer run again on the **exact still-current PR #773 head**, with a new retained independent receipt. Candidate Practice PR #773 remains draft and unmerged, additionally behind current main and in need of integration/CI, qualified assessment boundary and its **own** separate Founder approval before publication. Do not count one model's changed conclusion as whole-section educational adequacy.

**Documentation impact:** This active technical note describes the reviewer evidence distinction. No normative authority changes, historical reviewer receipts altered, exam content released, schema migration, or scored-progress change. Issue #698 remains the programme owner; #703–705 remain learning-loop dependencies.

---


**Status:** Proposed infrastructure on governed branch; NOT available on approved main until this separate reviewer PR passes CI and receives specific Founder approval.

## Why a separate reviewer is needed

[Draft content PR #773](https://github.com/lhanson-dev/revision/pull/773) adds eight original single-option scored scenario questions and four self-check written drills for AQA Psychology 7182 v1.4, §4.1.1 printed p17. An A2 pass for PR #768 reviewed teaching only; the existing PR #759 and #768 trusted reviewers are hard-bound to other content and cannot certify these A3 questions, keys or model answers.

## Exact-head and security contract

Approved-main-only workflow `.github/workflows/psychology-pr773-a3-review.yml` executes `scripts/assurance/psychology-pr773-a3-review.mjs`, with offline validation in `scripts/assurance/psychology-pr773-a3-review.node-check.mjs`.

After this reviewer is approved and merged, the executing agent can post **only on PR #773**, using the authenticated GitHub Founder account:

```text
revision-run-psychology-social-influence-practice-a3:v1
head_sha: <exact 40-character PR773 head SHA>
```

That comment is a **review trigger**, not merge approval. The workflow requires issue PR number 773, Founder OWNER association, exact two-line marker, same-repository open PR targeting main, matching exact PR head, and trusted workflow `GITHUB_SHA` equal to approved `main`. Unmerged source is fetched through read-only GitHub API by six fixed allowlisted paths, each Git blob SHA independently verified. The workflow **never checks out or executes PR #773 code under the secret**.

A fresh isolated `gpt-5.6-terra` Responses review (`store=false`) independently checks all **12 assets**, with **eight required dimensions**, schema-checked issue register and explicit `pass` vs `fail_hold`; material/blocking findings stop the review. The protected provider API key is restricted to the approved-main reviewer job; a conservative preflight cost budget caps model spend at **USD $0.50**; artifacts are retained for 30 days. Missing keys, invalid claims, stale head, incorrect item IDs/paths, malformed JSON or provider errors fail closed.

## Scope and nonclaims

**Exact AQA source:** Founder-supplied 38-page A-level Psychology 7182 version 1.4, 1 September 2025, SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`; Section 4.1.1 p17, **REFERENCE_ONLY**. Protected original PDF text is not transmitted to the model. Review must challenge all eight original scenario/options/keys/wrong-choice reasons, source-target mapping and all four self-checked writing prompts/models, including no fabricated written marks. A correctly selected MCQ option does not establish complete AO2/AO3 constructed responses, skill mastery, or all 21 Social Influence provisional atoms.

An AI A3 pass **does not** establish that the reviewer independently opened the original AQA PDF, provide qualified examiner signoff, verify authentic signed-in learner results or complete the full #698 audit. Any changed learner Practice candidate needs a fresh exact-head educational review. PR #773 separately requires full current-main CI and explicit Founder merge approval.

## Documentation impact

This indexed note, exact-head reviewer runner, offline tests and workflow are the entire reviewer PR. **No learner-facing changes, database/schema, evidence engine or normative authority changes**; historical PR #768 reviews are not rewritten. The tooling PR must be merged before the independently reviewed student-content PR can be eligible for a separate merge decision.
