# #705 / #809 — Trusted independent Business A2/A3 guided-repair review

**3 November 2026. Infrastructure proposal; unmerged, not an independent review receipt or content clearance.** Target PR [#809](https://github.com/lhanson-dev/revision/pull/809) remains draft, educational HOLD and requires separate Founder approval after applicable gates. This infrastructure change does not alter the learner website, grades, models, database, claims, or production content.

## Why this additional reviewer is needed

PR #809 repairs two distinct AQA A-level Business 7132 §3.2.2 skill results: **expected value** and **net gain**. It retains the published Foundation node `bus-evi-004`, offers different unscored worked examples in both Practice feedback and FI-001 planned Learn, and requires a separately scored, differently authored question before adjusting progress. The exact-head 9-job engineering CI passed on earlier head `d72e71d3545cf0f10f19cd0ffff3d7b9b5ba0da9`, but neither a green browser suite nor this author's judgement establishes independent A2/A3 pedagogical assurance.

The source of AQA alignment is the Founder-supplied **AQA Business 7132 specification v2.0, 14 June 2023**, printed p14, SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, classified **REFERENCE_ONLY**. Its protected text/PDF is *not transmitted* to a model. The trusted reviewer receives only approved structured scope: understanding/interpreting decision trees and calculating expected value and net gains, plus the real original Revision-authored source files.

## Protected reviewer process

The pre-existing trusted `business-pr777-784-a2a3-review` workflow and reviewer are extended narrowly to **PR #809**, with a **separate marker** and explicit allowlisted source paths/items. The workflow remains on approved main, does not check out or execute unmerged candidate source, verifies every inert Git blob hash and exact PR SHA, requires a same-head completed **nine-job Revision CI** receipt queried directly from GitHub, checks that approved main has not moved since dispatch, validates the Founder-owner comment, and fails closed on missing inputs or credentials. No student information is supplied.

Once this infrastructure PR itself is reviewed, passes CI and receives **its own Founder merge approval**, a comment by owner `lhanson-dev` on **content PR #809** may trigger the educational review:

```text
revision-run-business-guided-repair-a2a3:v1
head_sha: <exact 40-character current PR #809 SHA>
```

**This authorises a review only, not a merge.** The independent model call is a fresh, isolated OpenAI Responses context (`store=false`), with an estimated bounded reserve of at most USD $0.85 per invocation. The official AQA PDF is not transmitted. Model provider failure, new head, wrong account, altered comment, missing source, incomplete review dimensions or a material/blocking finding forces **FAIL/HOLD**.

A structured individual review must challenge:
- **Expected value:** signed outcomes, probability weighting, £96,000 result and negative-loss explanation.
- **Net gain:** distinct certain cost, avoidance of double subtraction, £36,000 result and comparisons with expected value.
- **Pedagogy:** distinguish the two observed skill gaps without claiming a single final-number error identifies a precise failed method step or guarantees mastery; assess educational clarity and teaching usefulness.
- **Integration and rights:** genuine published `bus-evi-004` mapping; source-tagged different independent recheck; FI-001 task and canonical route identity; unscored exposure versus independently assessed evidence; approved structured AQA requirement scope; original Revision-authored material only.

The seven required review dimensions and item IDs `aqa-7132-3.2.2:expected-value`, `aqa-7132-3.2.2:net-gain` and `fi001-plan-to-learn-unscored-repair` must all be present. Machine-readable PASS or FAIL/HOLD, source/CI hashes, findings and limitations are retained as GitHub workflow artifacts for **30 days**. An AI PASS is not a qualified teacher/examiner sign-off or proof of actual student learning.

## Separate gates still mandatory

Even a complete independent AI A2/A3 PASS does not meet #703: two genuine wrong-then-repaired-then-independently-scored same-topic student journeys and post-retest all-surface readback, Psychology parity, dynamic 14-day capacity/exams and written evaluation boundaries remain. PR #809 also needs fresh CI integrated with then-current `main`, a separate exact-head Founder approval and its own approved release/smoke check. Later restricted-pilot learner acceptance and qualified human subject review (before public benchmark claims) follow existing authority.

**Documentation impact:** reviewer script, provider-free contract checks, trusted workflow, this note and INDEX in one separate governed PR. No normative change or ADR needed: this implements `80-company-workflows/Content Accuracy Assurance Gate.md` and the Educational Content Source Licensing and Provenance Standard. Historic evidence and #809 author-side test receipts are not rewritten.
