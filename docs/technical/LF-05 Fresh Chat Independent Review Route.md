# LF-05 — independent fresh ChatGPT review, no paid API dependency

**Proposed operational alternative to the current trusted-main A3 API method; no content publication or independent verdict is implied.**

## Current problem and approved boundary

PR #854 contains **33 unpublished original Business/Psychology written questions**, complementing six existing live originals. The independent GitHub reviewer on approved main failed with `insufficient_quota / credit_balance_exhausted` at [run #45663098981](https://github.com/lhanson-dev/revision/actions/runs/45663098981), before reviewing any item on that exact candidate version. This is not a negative educational verdict. The API method is useful but not mandatory under the current `80-company-workflows/Content Accuracy Assurance Gate.md` fresh-context independence rule.

**Do not confuse:** (a) an independent AI fresh-context review, (b) an author-run checklist or this same Revision project chat, (c) qualified-human examiner validation, and (d) complete source/learner acceptance. A separate chat outside the authoring project gives a meaningful context boundary, but its independence and use of source references still need human-reliable provenance, not a self-issued PASS.

## Ready-to-use frozen review packets

All question and guide inputs are **original Revision work**. For readable reviews, they are split into 11 batches of three with no prior reviewer labels. Each batch has two distinct documents.

- [Portable packet manifest, batch IDs and links](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/README.md)
- [Batch 01 — BLIND input](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-01-blind.md)
- [Batch 01 — GUIDE input (DO NOT reveal until blind answer frozen)](https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/batch-01-guided.md)

The source SQL blobs are pinned in every packet: six-item `572840fc1c9e4dd0a0f07e1bccb387ee59b18d5b` and 27-item `e58ac284a8114ae26dbe7e9253729def5521912e`. The two canonical source packet Git blobs are `8715ef0ba2bb10b167a86168763323a653a7812e` (blind) and `2ed2406698a681bd1036df950d9abbdbc6c565f6` (guided). If any source answer or question changes, regenerate the corresponding batch and invalidate its earlier findings.

**Source rights:** The AQA documents are educational reference authorities, not automatically licensed for bulk AI ingestion. The fresh reviewer must consult only the approved source-use category, references and permitted *structured* alignment facts, or independently accessed public materials in a way permitted by the Source Licence Register. Do not paste or upload complete protected AQA PDFs just because they exist in this project. If the legal source-use gate is unresolved, mark the affected input HOLD rather than supplying it to a new external chat.

## Fastest Founder handoff — one fresh chat, two messages

Open a **new ChatGPT conversation outside the Revision project**. Copy the following kickoff. This process does not start another chat automatically, does not consume separate API billing credits, and does not provide a qualified-human expert.

```text
Act as an INDEPENDENT adversarial AQA A-level educational reviewer. This conversation is new and outside the Revision authoring project. Do not use old project memory, authored answer guides or historic reviewer verdicts. You must not assume the author was correct.

Read the 33-item original question-only review materials by opening the 11 BLIND batch links in this immutable GitHub manifest:
https://github.com/lhanson-dev/revision/blob/5af3a7da290551cc3489a67763a9e3527b83a300/audits/lf05-fresh-chat-review/README.md

DO NOT open any GUIDED packet. Check against source-rights-permitted AQA Business 7132 v2.0 and Psychology 7182 v1.4 structured qualification references and publicly accessible official source sections. Do not reproduce long protected AQA text or invent source facts or official mark allocations. If source access/rights are insufficient, mark HOLD.

Independently assess all 33 EXACT question IDs, in 11 consecutive batches of 3, for source fit, valid assessment demand, ambiguity, arithmetic, context, paper/option choice and legitimate answer routes. Return 11 JSON objects in the specified {"items":[...]} form, each with three IDs and distinct pass/minor/material/blocking verdicts and substantive sourceFit, reasoning, alternatives and corrections. Do not copy previous verdicts. Keep an issue register. If output must be split, continue until every blind item is independently addressed. Freeze your stage-1 answers and STOP; do not look at the guidance until I explicitly authorise Stage 2. Do not represent this review as examiner-calibrated marking.
```

Save the full 33 blind verdicts. Then send the same separate conversation:

```text
Stage 1 is frozen. You may now open ONLY the 11 matching GUIDED packet links in the same immutable manifest. Compare each authored guide against the exact frozen blind verdict for that ID and source references, without changing Stage 1. Produce 11 new three-ID JSON GUIDE verdict objects with separate pass/minor/material/blocking outcomes, full substantive reasons and fair-credit checks. Flag any error and stop if a packet cannot be accessed or matched. Do not publish or self-certify the questions. Return both frozen review stages as separate structured results.
```

If the reviewer cannot access the GitHub files, supply **only the 11 original blind packet files** in Stage 1, then **only their matched guided packets** after the blind outputs are frozen. This two-message fast path preserves the same independence requirements as the manual three-item workflow below.

## Stage 1 — paste this into a NEW ChatGPT conversation outside the Revision project

```text
You are an independent adversarial educational quality reviewer. You did not create the attached original Revision questions or their guides. Do not rely on previous Revision project chats, author assertions or historic model verdicts. Use only the supplied original question-only packet and legally permitted primary-source references.

Qualification references: AQA A-level Business 7132 v2.0 and AQA A-level Psychology 7182 v1.4 as applicable. Verify exact section meanings and paper structures; do not invent 2027 tariffs or treat "16/25-mark-style training" as an official AQA paper allocation. Never invent source headings, calculations, compulsory optional Psychology topics, mark allocations or evidence.

Review exactly the THREE item IDs in the attached batch. Do NOT ask for or read authored answer guidance yet. Independently assess whether each question tests an in-scope specification requirement; command, context, assumptions, difficulty, AO demand, quantitative accuracy, plausible alternative answers and exam-style classification. Identify issues even if the author seems confident. If primary-source evidence is unavailable, say so and do NOT award an unsupported PASS.

Return ONE valid JSON object and nothing else:
{"items":[{"id":"EXACT-ID","verdict":"pass","sourceFit":"Exact source section/facts and limits (at least 15 characters).","reasoning":"Specific independent appraisal, factual checks and calculations (at least 15 characters).","alternatives":"Valid alternate answers or exclusions (at least 15 characters).","corrections":"Required corrections or No correction required. (at least 15 characters)."}]}
Use severity "pass", "minor", "material", or "blocking" for EACH of the three IDs, and explain every material/blocking finding with accurate source verification. Do not invent missing items or return one group verdict.
```

Freeze/copy the complete Stage 1 JSON and its date/time before sharing any guide. For the **fastest one-chat workflow**, repeat Stage 1 for all 11 blind batches first, saving 33 question verdicts, and only then move to the guided batches. This keeps every blind item unseen by the authored guidance. If the reviewer saw its own or another batch's authored guidance early, start a fresh conversation for the unreviewed blind items and record that session boundary.

## Stage 2 — only after Stage 1 is frozen

```text
The independent blind question review has now been frozen; its output is below. Do not revise it retrospectively.

Now review the attached matching, exact-version original Revision-authored guidance for precisely the same three IDs. Challenge concepts, quantitative work, alternate-credit fairness, applicability to the source exam, invalid pseudo-precise grades/marks, context assumptions and omitted evaluation. The guidance is qualitative SELF-REVIEW, not official AQA marking.

Here is the FROZEN Stage 1 JSON:
[PASTE UNMODIFIED STAGE 1 JSON]

Return ONE new valid JSON object of the same {"items":[...]} shape and exact ID order, with distinct GUIDE verdicts and 15+ character evidence/reasoning in every field. Do not average or silently promote an earlier question verdict. Do not accept misleading authored guidance merely because an original question is sound.
```

Complete all **11 batches** in the independent fresh chat, recording both JSON outputs for each ID. One new ChatGPT conversation **outside the Revision project** is sufficient if all blind batches are completed before showing any guided batches. Separate new conversations per batch are also valid where capacity limits require it. A Founder-operated new chat is a necessary one-time handoff: this current authoring chat cannot itself create another independent ChatGPT conversation.

## Evidence intake, no extra API bill

1. Keep a private short note of the new conversation reference and timestamp for each batch. Do not publish private conversations, confidential personal data or source text that lacks reuse permission.
2. Copy the two distinct JSON outputs unchanged into the `batches` field of a receipt matching `audits/lf05-fresh-chat-review/receipt.template.json` in draft PR #854. The receipt stores no raw PDF and must identify exact candidate SQL and canonical review-packet Git blobs. If an item changes, its evidence must be repeated on the new exact source.
3. The read-only checker `node scripts/assurance/lf05-pr854-fresh-chat-check.mjs <receipt.json>` verifies four source blobs, all 33 IDs across 11 batches, exact included question and guide packets, complete structured verdicts, a distinct frozen blind timestamp before guide disclosure, and source-rights/context provenance assertions. This does **not** establish independence cryptographically, endorse the source rights, confirm answers, or award publication PASS.
4. Source-adjudicate each material/blocking finding with the applicable authoritative facts; record fixes and re-review changed bytes. Preserve prior API failures and review receipts without rewriting history. The current #854 question/guide SQL remains HELD until review, signed-in A4, independent source/rights checks, backend readiness, final CI and that PR's own Founder merge approval are complete.

**Documentation impact:** The proposed `80-company-workflows/Content Accuracy Assurance Gate.md` amendment recognises this independent fresh-chat transfer route as an equivalent *method*, not a lesser assurance threshold. This protocol, reviewer validation script/tests and INDEX update together on the same governed PR. The original API reviewer remains optional; no production permission, site copy, writing draft or student progress is changed by adopting this procedure.
