# LF-05 — First Family Original Written Question A3 Reviewer

**Status:** proposed assurance-only infrastructure, unmerged until its own Founder-approved PR. **Not** LF-05 product `Ready`, **not** new learner content or app, and **not** an independent educational pass until a genuine provider review returns a retained result.

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
