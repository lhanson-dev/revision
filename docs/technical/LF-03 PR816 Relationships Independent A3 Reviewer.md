# #787 — Trusted exact-head independent Relationships A3 reviewer (PR #816)

**Status (4 November 2026):** Trusted reviewer infrastructure merged in PR #818 and verified on production. The separate original Relationships PR #816 independent review passed on its prior exact head; this reviewer receipt remains content-bound and does **not** authorise a merge. This workflow remains distinct from the separate Founder approval required for PR #816.

## Purpose and source boundary

PR #816 proposes four original AQA Psychology 7182 v1.4 §4.3.2 **Relationships** one-mark applied MCQs in the existing `/revision/app/#/courses/aqa%3Aaqa-a-level%3A7182/practice/relationships` route. The Founder-uploaded AQA v1.4 PDF (SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`) is `REFERENCE_ONLY` and **not** passed to the provider. The approved source truth and printed AQA §4.3.2 were checked for attraction/filter theory, relationship theories, online gating/deception and parasocial bonds. Source truth is not automatically educational approval.

The trusted reviewer reads *only inert question text*, exact file `content/psychology/aqa-a-level/shared/relationships-mcq-v2.ts` and four mapped IDs `psy-psy0901-check-v2` through `psy-psy0904-check-v2`, at the PR's exact current source SHA. It never executes PR code with secrets, never approves merges and never accesses learner records.

## Trusted execution and precise trigger

After Founder separately approves and merges the **infrastructure PR**, the owner adds this two-line comment to the **open** content PR #816:

```
revision-run-lf03-pr816-relationships-independent-a3:v1
head_sha: <exact current 40-character PR #816 SHA>
```

The workflow executes only trusted approved `main` code, checks GitHub authenticated owner identity, exact PR number, the head SHA, exact Git blob identity, and rejects dynamically constructed or changed question structures. It runs a **blind-key/distractor/source challenge** without authored correct keys or explanations; then a separate fresh-context check of authored feedback *after* the blinded answer is locked. Each of the four items must receive a material critique, be identified correctly, have no material/blocked issue or competing correct answer and match authored keyed positions; otherwise the receipt fails closed.

The implementation uses `store=false`, model `gpt-5.6-terra`, high reasoning and a **conservative $0.95 maximum reserve per triggered run**, with reviewer contract tests before any provider call. It preserves an exact-head provenance receipt for 30 days under `.artifacts/lf03-pr816-relationships-independent-a3/`. Repeated comments cause repeated provider spend; use only one exact-head trigger unless the content SHA changes and review must be repeated.

## Independence and what cannot be claimed

Two API calls with separate fresh contexts are intended as **independent AI educational A3** for these four choices, not an AQA examiner qualification, not actual learner response data and not proof of full §4.3.2, extended AO2/AO3 or adequate distractor discrimination. A3 minor concerns remain visible and may justify further reauthoring. Any question text change after a receipt requires a new exact-head review before a content merge.

After the content PR's A3 gate, still require full exact-head CI, latest-main integration, **specific Founder approval for PR #816**, successful six-job production release and an actual original learner retest. Neither infrastructure approval nor a successful A3 trigger authorises the other merge.

## Documentation impact

New trusted workflow and exact-head reviewer contract tests, this technical note and INDEX pointer are governed together. No UI, learner assessment, scoring, model-marking feature, session content, old marks, database, subscription or normative rule changes. All #787 remaining Business/Psychology item reviews stay open and are not silently replaced by four A3 results.

## 4 November 2026 — executed A3 evidence, not fresh current-head review

- The trusted reviewer was merged in [PR #818](https://github.com/lhanson-dev/revision/pull/818); its release #41666176559 passed all six governed jobs. The first previously required owner comment [#6608145404](https://github.com/lhanson-dev/revision/pull/816#issuecomment-6608145404) actually triggered [independent review run #41666277535](https://github.com/lhanson-dev/revision/actions/runs/41666277535).
- [Artifact #13244528585](https://github.com/lhanson-dev/revision/actions/runs/41666277535/artifacts/13244528585) recorded a **PASS** for the four blind keys 2/0/3/1 and a separate authored-feedback challenge on PR #816 prior head `5c24236a092483855d56b2d2f11fdfcb75123121`, source blob `ad96b281613e045222758e3acfa2e114cb90528c`. The review did not find a material competing correct key, but noted minor wording/distractor clues and cannot establish actual student discrimination.
- The 4 November approved-main integration and technical-document updates to #816 **do not modify the independently reviewed source blob**, as checked from the new head. This prior receipt is therefore evidence about exactly that unchanged authored content, **not** a new reviewer run on the integration commit. Any authored-content change requires fresh independent review before an educational-content release decision; repeated reviewer comments also incur additional provider cost.
- The separate #816 exact-head full CI, specific Founder merge approval, production deployment and observed learner retest are independent required gates. #787 and #765 remain open for wider-bank and actual learner acceptance.
