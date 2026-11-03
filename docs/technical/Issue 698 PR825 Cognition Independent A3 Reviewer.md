# #698 / #787 — trusted independent A3 reviewer for Psychology Cognition and Development PR #825

**Status:** reviewer infrastructure PROPOSED on governed branch. Not installed until this separate PR is explicitly Founder-approved, merged and production-verified. No independent educational A3 result exists yet for PR #825.

## Reference, source rights and exact learner content

Founder-provided AQA Psychology 7182 v1.4, 1 September 2025, 38-page PDF, SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, §4.3.4 printed page 22. Rights **REFERENCE_ONLY**: the PDF is not supplied to the model and no protected AQA question text is reproduced. Four source-alignment summaries are original concise scope facts: Piaget/conservation; Vygotsky ZPD/scaffolding; Baillargeon violation-of-expectation looking time; Sally–Anne theory of mind, Selman and mirror-neuron limits.

Existing production route: `/revision/app/`, AQA 7182 → Paper 3 option 1 → Cognition and Development → Practice. Candidate content PR [#825](https://github.com/lhanson-dev/revision/pull/825) affects only existing published course packs. Its four new questions are **one-mark topic-scoped choices**, not essay, whole-source-atom proficiency, qualified-examiner standard or genuine learner acceptance.

## Trust and exact-head trigger

This infrastructure deliberately mirrors the **already approved and merged** PR #818 / Relationships A3 pattern but does not broaden PR #816 permissions. It runs on **trusted approved main only**, uses exact PR number **825**, expects original source `content/psychology/aqa-a-level/shared/cognition-development-mcq-v2.ts`, validates OWNER `lhanson-dev` comment and exact 40-character PR head, inertly parses only four static TS object literals, checks exact Git blob parity, and never executes candidate PR code or accesses learner accounts/data. Strict two-line comment accepts normal LF or actual GitHub CRLF, rejects extra lines, wrong owner/PR, dynamic fields or unknown IDs.

Once this infrastructure is separately released, repository OWNER initiates one source-specific blinded A3 review on the open PR #825 by commenting exactly:

```text
revision-run-lf03-pr825-cognition-independent-a3:v1
head_sha: <exact current PR #825 40-character head SHA>
```

The existing trusted reviewer contract runs first with **no provider spend**. The actual provider workflow sends question stems and four original answer options **without author keys or explanations** for independent key selection and adversarial distractor/ambiguity challenge; a separate fresh-context review then checks authored key and explanatory feedback. Material concerns, multiple defensible answers, wrong key, incomplete review or malformed receipt cause **FAIL/HOLD**. Both stages and source/head/provenance must be present before any PASS. AI A3 is independent from question authorship but is **not qualified examiner sign-off**.

- Model: trusted existing `gpt-5.6-terra` provider pattern; `store:false`.
- Conservative per-trigger reserve cap: **US$0.95**; owner comment may incur spend and must not be repeated unnecessarily.
- Retention: exact-head source blob, provider response text/ID/usage persisted **before** validation (including incomplete/failed independent reviews), stage verdicts and fail-closed receipt for 30 days. Short superficial educational justifications are rejected.
- Scope: one PR/content cohort only. No generic reviewer capable of reading arbitrary untrusted files or executing candidate code.

## Assurance / release blockers

Independent reviewer infrastructure PR needs exact-head no-secret node checks, full CI, integration with then-current `main`, specific Founder approval and successful path-to-live. **Only after installation** can owner trigger PR #825 and inspect complete independent receipt; any material content revision needs a fresh exact-head review. PR #825 still separately needs its own exact-head CI, responsive signed-in browser confirmation, current-main integration, Founder merge approval, production verification and authentic WS5 learner acceptance. Other #787 and #698 question/atomic course gaps stay open.

**Documentation impact:** scoped new workflow + reviewer contract + this indexed technical note. No normative authority, learner content, scoring, migration, pricing, account or data change. Historical FAIL/HOLD audits remain intact. This is not a new content-production system or an authorial educational pass.
