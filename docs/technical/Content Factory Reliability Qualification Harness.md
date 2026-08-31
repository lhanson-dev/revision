# Content Factory Reliability Qualification Harness

## Status

The Content Factory has completed **post-Pilot #19 Reliability v2 Q1–Q7 qualification**.

- Q1–Q6 provider-free qualification: **PASS**.
- Q7 post-Pilot #19 bounded live-worker soak: **PASS**.
- Machine state: **paused**.
- `qualifiedEvidence`: `null`.
- `livePilotEligible`: **false**.
- Next governed step: **V2-F/Q8**, a separate eligibility transition before any further paid full-course confirmation pilot may run.

Active authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

Current machine-readable state: `content-factory/reliability-qualification.json`.

The reliability objective remains:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

## Why qualification was repeated after Pilot #19

Historical Reliability v2 qualification had previously reached Q1–Q7 PASS and a separate Q8 transition made Pilot #19 eligible.

Pilot #19 then exposed a new generic Assessment Item engineering-contract class:

`assessment_mcq_cognitive_demand_lexical_overconstraint`

The deterministic validator incorrectly treated every `responseDemands[]` value as requiring independent lexical proof in the learner-facing command. That was valid for explicit operational demands such as calculation, interpretation, analysis and evaluation, but invalid for structurally valid selection MCQs whose educational cognitive classification was `knowledge` or `application`.

The factory was therefore returned to `paused`, and the affected Assessment Item/Marking Pack boundary was deliberately reviewed rather than sending another whole course through a debugging run.

## Architecture correction

PR #255 corrected the reusable Assessment Item boundary.

The corrected model separates:

1. **interaction mechanics** — selection remains mechanically validated;
2. **MCQ cognitive meaning** — knowledge/application are educational classifications for structurally valid MCQs and do not require an artificial second command verb;
3. **explicit operational demands** — calculation, interpretation, analysis and evaluation retain learner-facing command guards.

The Assessment Item durable semantic version advanced to:

`2+output-integrity-v5`

Dependent Assessment Items, Marking Packs and downstream assurance were invalidated where required; unrelated Learn/Practice artifacts remained reusable.

No additional Marking Pack ownership transfer was required. Mechanical identity, aggregate arithmetic and rubric skeleton constraints remain compiler-owned/fail-closed; subject-specific marking meaning remains generative educational judgement.

## Provider-free Q1–Q6 requalification

Approved `main` `119cde951b9cd76410d7c091ee00b872c00f4a39` passed post-merge Revision CI `33383475298` / run #1313.

`content-factory/reliability-post-pilot19-requalification.json` records the current Q1–Q6 PASS.

The provider-free matrix proves, among other things:

- valid `selection + knowledge` MCQ is accepted;
- valid `selection + application` MCQ is accepted;
- calculation without an explicit calculation command still fails closed;
- interpretation without an explicit interpretation command still fails closed;
- non-MCQ knowledge still requires compatible command evidence where the interaction contract does not supply the MCQ semantic context;
- historical requirement-cross-reference compiler ownership remains intact;
- all five governed subject shapes traverse the deterministic pipeline;
- dependency-aware invalidation does not repurchase unrelated Learn/Practice work;
- repeated provider-free stability remains green.

This evidence made Q7 eligible but did not restore full-course execution.

## Q7 execution history

Historical Q7 evidence remains historical truth and is not rewritten.

### Attempt 1 — workflow `33265434110`

- main `69d7abb7d3236616b687cbed480e7584ceb69fc9`
- 20/20 executed
- 13 accepted / 7 controlled fail-closed
- 9 targeted repairs
- known spend US$0.423906
- generic class: `assessment_subquestion_required_structure_omission_before_targeted_repair`
- result: **Q7 FAIL**, corrected and provider-free requalified

### Attempt 2 — workflow `33282967568`

- main `f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9`
- 20/20 executed
- 17 accepted / 3 controlled fail-closed
- 15 targeted repairs
- known spend US$0.455962
- generic class: `assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`
- result: **Q7 FAIL**, corrected and provider-free requalified

### Attempt 3 — workflow `33364521121`

- main `9755c7a40d5e61b76a49e51480e7c5403642e593`
- 20/20 executed
- 16 accepted / 4 controlled fail-closed
- 12 targeted repairs
- known spend US$0.432952
- zero infrastructure incidents
- zero escaped engineering-boundary exceptions
- no new generic engineering class after manual educational-vs-engineering classification
- result: **historical Q7 PASS**

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`.

That historical PASS made the earlier Q8 transition possible. Pilot #19 later exposed a new class that required qualification to be repeated; it does not rewrite attempt 3.

### Attempt 4 — post-Pilot #19 workflow `33395187056`

Approved `main`:

`02fbccbd1979460b63f3e0ee7f85ee2d1fede3c9`

Artifact:

- ID `9759214890`
- digest `sha256:bae4232a51535614ba6ad7bd7e7d4a85b177f7aa5d45136c0b3026e8ad08178e`

Observed:

- 20/20 planned live samples executed;
- **20/20 accepted**;
- Assessment Item **10/10 accepted**;
- Marking Pack **10/10 accepted**;
- five governed subject shapes covered;
- quantitative/business/economics knowledge MCQ covered;
- quantitative/business/economics application MCQ covered;
- mathematics calculation demand covered;
- science analysis and interpretation demands covered;
- essay/humanities evaluation covered;
- language/prescribed-text analysis covered;
- 8 bounded targeted repairs exercised and successfully revalidated;
- 0 controlled fail-closed samples;
- 0 infrastructure incidents;
- 0 engineering-boundary breaches;
- provider/model `openai` / `gpt-5.6-terra`;
- known spend **US$0.384316**;
- unpriced samples 0;
- full-course assembly false;
- learner publication false.

The workflow itself completed successfully. `automaticQ7PassCandidate` was true and no engineering-vs-educational manual classification was required.

Durable evidence:

`content-factory/reliability-v2-e-q7-live-soak-evidence-004.json`

Classification:

`q7_pass_no_new_generic_engineering_contract_class`

Result: **post-Pilot #19 Q7 PASS**.

## Current machine state

`content-factory/reliability-qualification.json` records:

- Q1–Q7: `pass`;
- `status: paused`;
- `q7PassEvidence: content-factory/reliability-v2-e-q7-live-soak-evidence-004.json`;
- previous historical Q7 PASS retained in `q7PassEvidenceHistory`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

This is deliberate. Q7 PASS is reliability evidence only. It does not itself authorise a full-course run.

The paid live-pilot preflight must continue to fail before provider execution while `status !== qualified`.

## Q8 next step

The next reliability step is **V2-F/Q8 — full-course confirmation eligibility**.

Q8 must be a separate governed PR that:

- reviews the approved-main Q1–Q7 evidence;
- makes no provider call;
- does not itself run a course;
- changes the machine state to `qualified` / `livePilotEligible: true` only if the evidence remains valid;
- receives exact-head assurance and explicit Founder merge approval.

Only after Q8 merges may the next real course run be treated as a confirmation pilot.

## Maturity and stop-loss

Pilot #19 does not count toward maturity because it did not reach `expert_review_ready` on its initial full factory run without an engineering correction.

The maturity sequence remains at **zero consecutive successful materially different real courses**.

Reliability Standard v2.0 still requires three consecutive materially different real courses, representing more than one governed subject shape, to reach `expert_review_ready` without reusable engineering/code/worker-contract correction between them.

The formal two-consecutive-confirmation-failure stop-loss remains unchanged. Revision performed the architecture review after the first post-Q8 generic failure as a more conservative application of the same compiler-first and cost-control principles.

## Cost position

Known Q7 soak spend:

- attempt 1: US$0.423906
- attempt 2: US$0.455962
- attempt 3: US$0.432952
- attempt 4: US$0.384316
- cumulative: **US$1.697136**

Attempt 4 used 7.68632% of the US$5 per-soak ceiling.

Decision: **retain the US$5 Q7 ceiling**.

Pilot #19 separately stopped at approximately US$0.7151 under its US$20 course ceiling.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already governs:

- compiler-first ownership;
- Q1–Q7 qualification;
- the distinction between educational rejection and a generic engineering class;
- bounded Q7 live-soak evidence;
- the separate Q8 eligibility transition;
- maturity and stop-loss.

This evidence step:

- adds append-only attempt-4 Q7 evidence;
- updates current machine-readable qualification state;
- updates the Q7 live-soak technical record;
- updates this indexed qualification harness;
- updates executable assurance tests.

Historical Pilot #19, Q7 attempts 1–3, earlier Q8 evidence and provider-free requalification records remain unchanged.

`INDEX.md` remains correct because this file is already the indexed technical reliability source. No ADR is required because the target architecture and governing workflow are unchanged.
