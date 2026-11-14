# LF-05 — First Family Original Written Question A3 Reviewer

**Status:** Reviewer infrastructure merged in Founder-approved PR #846 on 14 November 2026. First full-bank provider run #43599092313 completed with an educational **HOLD** (the original evidence is retained). An improved reviewer input packet is proposed in a separate governed PR and is **not effective before its own Founder-approved merge**. None of this makes LF-05 `Ready`, publishes learner content or creates examiner-verified marks.

## Scope

Supports the initial **four** original Revision *training* question-guide candidates from draft research PR #834:

- `PSY-LF05-02` standalone Working Memory Model, 16-mark style.
- `PSY-LF05-01-S1` separate Social Influence contextual variant, 16-mark style.
- `BUS-LF05-05-16` contextual Harbour Furniture financing, 16-mark style.
- `BUS-LF05-03-25` standalone Paper 1-style Marketing essay, 25-mark style.

AQA 7182 v1.4 (2027) and Business 7132 v2.0 supplied specifications are **REFERENCE_ONLY**. The reviewer sees bounded structured alignment facts prepared for internal review, not a PDF or protected awarding-body official stem/mark scheme. The reviewed material is original Revision wording. No claim that the source-2027 specific item tariff or calibrated examiner-grade marking is established.

## Secure trigger and workflow

Reviewer source and workflow must be separately **Founder-approved and merged to trusted `main`** before a provider run. A GitHub owner may then comment on the original **research PR #834** with exactly:

```text
revision-run-lf05-pr834-blind-a3:v1
head_sha: <40-lowercase-hex-HEAD-SHA-OF-PR-834>
```

This is the only supported execution trigger and is a deliberate provider-spend opt-in, not a request to merge or publish questions. Never post the marker automatically or impersonate the Founder. If the PR head changes after comment creation, the runner fails closed; the owner must issue a new exact-head request.

The workflow `.github/workflows/lf05-pr834-blind-a3.yml` handles an `issue_comment` event only when its source is `lhanson-dev` with OWNER association on #834. The script **revalidates** the exact event format, PR state, PR head and repository identity before using the provider key. It runs the script from `main`, **never** checking out, executing or importing untrusted PR code. The four candidate markdown files are fetched as inert text by immutable commit SHA, with Git blob checksums stored in the receipt.

The reviewer is limited to **two** independent `gpt-5.6-terra` OpenAI Responses requests with `store:false` and `max_output_tokens:8000` each, without exposure of the API key to branch content. Actual provider expenditure depends on input/output usage; no fixed monetary cost is promised. Do not run before the accountable provider-spend decision.

## Independence and result semantics

**Stage A (blind):** receives only a bounded four-question research brief and structured source facts, not the authors' indicative guides. A separate model context must challenge source fit, scope, case/situation, command, alternatives, AO profile and 2027 tariff uncertainty. Return all four item verdicts and substantive reasons. A `material` or `blocking` finding causes HOLD.

**Stage B (guided):** a **separate isolated request**, after Stage A is persisted, receives the frozen independent response and **four exact authored guide sections**. It challenges factual and calculation errors, rubric levels, creditable alternative responses, AO allocations and self-assessment overclaim. Stage B findings must be traceable to exact item IDs and versioned source hashes. A material issue forces HOLD; remediation requires a corrected item/guide and fresh review.

The retained `.artifacts/lf05-pr834-blind-a3/receipt.json` includes exact candidate head, file hashes, model and usage, both staged review outputs, limitations and `hold` or `a3_pass_training_only`. Upload uses a 30-day GitHub Actions artifact. A successful tool run with no valid receipt is **not** an A3 pass. Even `a3_pass_training_only` is **not** AQA item tariff verification, qualified human examiner calibration, automatic numeric grading or student publication. LF-05 human Ready, the conditional restricted family data controller go/no-go, production integration/security testing, and specific code/content PR approval are separate.

## Local, secret-free checks

```bash
node --test scripts/assurance/lf05-pr834-blind-a3-review.node-check.mjs
```

Checks owner/authentication, exact SHA marker, fail-closed input slicing, item identity, independent stage completeness, material HOLD and no code execution of candidate content. `pull_request` CI runs these contract tests without provider secrets; the provider calls are **never** triggered automatically by changes to a PR.

## Documentation impact

Assurance infrastructure only: the workflow, script, unit contract tests, this technical note and `INDEX.md` on one governed branch/PR. Does not change `src/`, `content/`, Supabase, existing learner scores, mock totals, public/private eligibility or active course authority. Reviewed A3 receipts belong in the relevant #698/#706 evidence trail, with historical failures preserved, and authoring source #834 remains a separate PR. No merge without specific Founder approval.

## 14 November 2026 — entire 37-original + 2 contextual-variant independent-review extension

The Founder requests **one managed educational review and one eventual governed content release**, **not** individual Founder decisions for each question. The additional trusted-`main` `lf05-pr834-all37-a3-review.mjs` runner covers **all 17 Psychology topic-family originals**, **all 10 Business contextual 16-mark originals**, **all 10 Business standalone 25-mark originals**, and the **two separately authored contextual Psychology variants**. It keeps the original bank denominator exactly **37**, with **two extra scenario candidates**. It does not silently promote research drafts.

Trigger only after this PR receives a separate Founder merge approval and its trusted runner reaches main. The Founder-owned review comment on open research PR #834 must be exactly:

```text
revision-run-lf05-pr834-all37-a3:v1
head_sha: <exact-40-lowercase-hex-current-PR834-head>
```

The trigger is a **single opt-in for the entire proposed 39-candidate review**, not a per-question approval or permission to publish. No such review has been initiated or passed by merely merging code. The same GitHub event and branch/source protections as above apply.

**Technical contract:** The runner reads only four fixed, inert research files pinned to the reviewed SHA: 17 Psychology originals, 20 Business originals, two proposed Psychology scenario stems and their separate marking guide. It checks all 37 IDs, 2 additional IDs, version and provisional AO arithmetic; Business contextual 16s must include a real original case and all authored guides must include alternatives and qualitative level support. Those checks establish only the source-structure invariant, not educational truth.

It then reviews at most **6 candidates per isolated batch**. A fresh Stage A sees only question, context, specification locator as an **untrusted candidate claim** and trusted verified structured AQA 7182 v1.4/7132 v2.0 alignment facts. It must independently propose strong and weak reasoning, alternative answers, AO and cognitive-demand concerns. Stage B receives the frozen Stage A outcome plus the relevant authored guide and provisional AO proposal, to challenge factual accuracy, case quantitative arithmetic, levels, false precision and omission of valid alternatives. Seven batches, **at most 14 provider calls**, maximum 7,500 output tokens per call, and a **$6 conservative estimated budget ceiling** from reported token counts. This is a *planning cap, not a provider invoice guarantee*. Missing provider evidence, incomplete denominator, budget exceedance or any material/blocking verdict yields **HOLD**; all evidence seen before a failure is retained in a versioned receipt.

A `PASS_TRAINING_ONLY` item is eligible for **further governed publication decision**, not for an official or examiner-assessed AQA numerical mark. Learner-facing guidance can support honest holistic self-assessment **after submission**, not FI-007 automated marking. If some items fail, retain explicit per-ID HOLD and correct/re-review them; do not publish a false `39/39` count. The Founder approves the **batch product/release PR**, not each individual item; the independent reviewer judges each question individually as evidence, and there are no per-item Founder approval prompts.

**Updated dependency chain:** #834 contains authored research and must not be merged as if those drafts are published assets. #846 installs independent-review infrastructure only. #706 records LF-05 `Analyse → Ready` and the governed privacy/retention/access decisions. Only after the reviewed item versions are eligible and LF-05 has explicit human Ready may a governed full-bank learner content + code PR be implemented in the canonical `/revision/app/` Practice/Exam Prep route. That implementation PR must include current `main` integration, RLS/expiry/autosave/recovery/first-submission tests, accurate item counts, technical documentation/registers, and one separate specific Founder merge approval for the release.

**Documentation impact:** This reviewer technical note, reviewer scripts, their tests, the workflow and INDEX in PR #846 describe the executable batch assurance. They do not change course authority, live questions, saved raw responses, scoring, registration or timed mock totals.

## 14 November 2026 — first full-bank review failure and evidence-informed reviewer correction

First real [run #43599092313](https://github.com/lhanson-dev/revision/actions/runs/43599092313) completed **39/39** candidate question+guide challenges across seven batches using 14 provider calls, with conservative estimated spend **$1.951475**. Its final review result was **HOLD**: blind stages **13 pass / 11 minor / 15 material**; guided stages **0 pass / 2 minor / 37 material**. The retained [full receipt artifact](https://github.com/lhanson-dev/revision/actions/runs/43599092313/artifacts/14116490885) is original evidence (30-day Actions retention). The dated [audit/triage](../../audits/2026-11-14-lf05-all39-initial-A3-hold-and-packet-triage.md) preserves all item verdicts and relevant root causes without rewriting the history.

**Packet flaw:** the initial guided reviewer got only each per-item text from the authored research document, excluding the original **shared Psychology four-level training grid**, both **shared Business 16-/25-mark holistic training guides**, and the **shared contextual Psychology qualitative anchors**. Many comments therefore assert a missing grid which exists in the source. A generic source section list also left the reviewer uncertain about known granular Psychology and Business topics, while some Business Paper 1 25-mark questions were wrongly treated as automatically requiring a supplied case.

**Proposed corrective runner change (not automatically a question fix):**
- Supply source-extracted, bounded shared author grids only in **Stage B** together with individual question marking guidance. Maintain **Stage A question-only** blindness; assert all three shared guides are present and fail closed if they are missing.
- Add precise, paraphrased and verified AQA 7182 v1.4 subject facts for §4.1.1 resistance to social influence, §4.1.2 WMM components, §4.3.6 anorexia explanations, §4.3.8 social psychological aggression, §4.3.9 forensic profiling and §4.3.10 addiction, plus AQA Business 7132 v2.0 §3.10.2 culture.
- Tell the reviewer to evaluate rather than invent a compulsory case for standalone Paper 1 25-mark essays, consistent with the supplied 7132 v2.0 paper structure.
- Continue flagging truly misleading AO allocations, flawed formulae, inadequate answerability and unfair alternative-credit guidance. **A shared training grid is not proof of examiner calibration or a 2027 per-item AQA tariff.**

The unchanged A3 runner remains the authority for the original run; a corrected runner must land through a separately Founder-approved PR and have its own exact-head tests. A later review must be version-pinned and preserve **both** receipts without pretending the first HOLD never happened. The current student experience and raw essay data remain untouched. All 39 candidates are still **not approved for publication**.

**Documentation-impact check:** reviewer technical note plus preserved historical audit and relevant INDEX pointer in the correction PR; no learner code, catalogues, rights classification, current evidence scores or active product authority changes.
