# Content Factory Reliability Qualification Harness

## Status

The Content Factory is **paused after Confirmation Pilot #20** under the Reliability v2.0 two-confirmation stop-loss.

Current machine state:

- `status: paused`;
- `livePilotEligible: false`;
- Q1–Q7 require requalification against the candidate-recovery production topology;
- no further full-course confirmation run is permitted until that requalification passes and a separate governed Q8 transition restores eligibility;
- maturity remains **zero consecutive successful materially different real courses**.

Active authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

Current machine-readable state: `content-factory/reliability-qualification.json`.

Current stop-loss evidence: `content-factory/reliability-pilot20-stop-loss-architecture-review.json`.

Architecture decision: `decisions/ADR-0019-content-factory-candidate-recovery.md`.

No educational assurance requirement is lowered by this reset. `80-company-workflows/Content Accuracy Assurance Gate.md` remains the authority for trusted learner content.

## Reliability objective

The reliability objective is now expressed operationally as:

`deterministic production slot → AI candidate → complete diagnostics → accept or reject → bounded automatic recovery/resampling → frozen valid artifact → dependent artifact → independent assurance`

A rejected AI candidate is expected production variability. It becomes a Content Factory reliability failure only when the factory cannot recover automatically within governed educational, retry, infrastructure and spend limits.

This is a stricter practical interpretation of the existing Reliability v2 objective that normal model variability must be converted into valid output or truthful fail-closed behaviour without engineering intervention.

## Why the factory is paused

### Confirmation Pilot #19

Pilot #19 exposed the generic Assessment Item class:

`assessment_mcq_cognitive_demand_lexical_overconstraint`

A structurally valid selection MCQ carrying knowledge/application cognitive demand could be rejected because the validator required artificial additional lexical command evidence.

The Assessment Item boundary was corrected and Reliability v2 Q1–Q7 was repeated. Q7 attempt #4 accepted 20/20 live samples and Q8 subsequently restored confirmation-pilot eligibility.

Pilot #19 remains historical evidence. It is not rewritten by this reset.

### Confirmation Pilot #20

Pilot #20 ran on approved `main`:

`b240ea9b6e2d56a644048c6085162c58429aef33`

Durable execution evidence:

- workflow run: `33420994194`;
- GitHub job issue: `#260`;
- artifact ID: `9769262820`;
- artifact digest: `sha256:155b3e5d229e82c7d5f2af7e1b43f2ae7050f53a8ccd198c8de5c800a6b35b6d`;
- known provider spend: **US$0.670708** of the US$20 course ceiling;
- 37 recorded worker runs, including 30 OpenAI runs;
- 13/13 Learn/Practice work units completed;
- five Question Families completed;
- zero markable Assessment Items accepted;
- zero Marking Packs produced;
- no learner publication;
- no human intervention before the engineering block.

The blocking Assessment Item failure was:

1. initial candidate — q1 did not visibly ask for its claimed calculation demand;
2. single whole-artifact repair — q1 was corrected, but q5 then did not visibly ask for its claimed interpretation demand;
3. the Assessment Item worker returned failure and the course moved to `blocked`.

## Root-cause architecture finding

Pilot #20 is classified as:

`assessment_candidate_recovery_and_complete_diagnostic_architecture_failure`

Two reusable production behaviours combine to create the failure.

### 1. Complete diagnostics were not actually complete

The Assessment Item v2 diagnostic path calls the strict structured validator once and catches the resulting exception as a diagnostic entry.

The strict validator throws when it encounters the first safely inspectable semantic contract failure. Therefore a parseable multi-subquestion artifact can contain several independent defects while the repair worker receives only the first one.

This reproduces the serial-discovery pattern Reliability v2 was intended to eliminate.

### 2. Candidate rejection was escalated to course failure

The assessment factory treats a failed Assessment Item generation execution as a course-level worker failure and moves the job to `blocked`.

That means whole-course success currently depends too strongly on every required generative artifact surviving its bounded generation/repair attempt.

For probabilistic generation, this is not a credible scaling invariant.

## Stop-loss decision

Pilots #19 and #20 are two consecutive confirmation-course attempts exposing new reusable engineering/contract classes.

Reliability Standard v2.0 therefore prohibits a third full-course confirmation attempt merely to discover the next defect.

The machine qualification state is paused until the affected production topology is redesigned and requalified.

## Candidate-recovery architecture

ADR-0019 defines the replacement production model.

### Deterministic production slots

The Assessment Blueprint and Question Family contracts define what must be manufactured.

Revision should own mechanically provable structure wherever educational meaning is not lost, including IDs, target coverage, marks/totals, response shape, cross-references and other deterministic constraints.

AI workers should provide the educational judgement that genuinely benefits from generative reasoning.

### Candidate lifecycle

Generative output is provisional until accepted.

Normal flow:

1. create deterministic slot;
2. generate candidate;
3. collect complete actionable deterministic diagnostics;
4. accept valid candidate or reject invalid candidate;
5. automatically resample/recover within bounded policy;
6. freeze accepted artifact;
7. generate and independently validate dependent Marking Pack;
8. continue until the Assessment Blueprint is satisfied.

### Recovery isolation

Recovery must affect the smallest safe unit.

- one bad subquestion must not rewrite unrelated accepted subquestions where safe assembly is possible;
- one rejected Assessment Item must not invalidate unrelated accepted Assessment Items;
- one rejected Marking Pack must not invalidate its accepted question or unrelated packs;
- accepted sibling artifacts remain stable unless a genuine dependency change invalidates them.

For shared case/stimulus assessments, a validated context may be frozen first and question slots generated independently against it.

### Repair versus resampling

One bounded validator-directed repair may remain useful for genuinely repairable representation defects.

For generative semantic rejection, fresh candidate resampling is preferred to repeated rewriting of a complex artifact with many already-valid invariants.

There must be no unbounded repair loop.

### Course-level blockers

Course-level `blocked` status should be reserved for failures automation cannot safely resolve, such as:

- unresolved identity, tier, option, text or pathway;
- source-rights ambiguity;
- unrecoverable source/coverage authority defect;
- material educational ambiguity requiring human judgement;
- exhausted candidate/retry/spend ceiling;
- infrastructure state that bounded retry/resume cannot recover.

Ordinary rejected AI candidates are not course-level blockers.

## Educational trust criteria remain unchanged

Repeatability does not mean accepting weaker content.

A course can reach `expert_review_ready` only when all applicable Content Accuracy Assurance Gate controls remain satisfied.

This includes:

- rights-safe and source-traceable inputs;
- A1 factual/alignment assurance;
- A2 explanation assurance;
- A3 original assessment assurance;
- A4 Marking Pack assurance;
- deterministic arithmetic, totals, references and compatibility checks;
- fresh-context independent educational review;
- targeted remediation and revalidation;
- an exact-version portable expert package;
- qualified human subject review as the benchmark trust gate before serious commercial reliance.

The automated factory is successful only when it produces content capable of passing these controls. Pipeline completion alone is not a quality claim.

## Requalification requirements after Pilot #20

Q1–Q7 must be repeated against the actual candidate-recovery topology.

### Q1 — ownership inventory

Re-evaluate Assessment Item and Marking Pack fields so mechanically provable structure moves to compiler ownership where educational meaning permits.

Explicitly identify candidate/slot ownership, immutable accepted fields and resampling boundaries.

### Q2 — historical failure replay

Pilot #20 becomes permanent regression evidence in addition to the existing historical corpus.

The modern expected outcome is not merely that q1 and q5 can both be made valid. The production architecture must avoid serial course-level discovery of those defects.

### Q3 — adversarial matrix

Add deliberate cases containing:

- multiple independently invalid subquestions in one parseable candidate;
- mixed valid and invalid sibling slots;
- repeated invalid fresh candidates followed by a valid candidate;
- invalid Marking Pack candidates after a valid frozen Assessment Item;
- duplicate/near-duplicate candidate rejection where selection/pool logic is introduced;
- combinations that must exhaust the bounded policy and fail closed truthfully.

### Q4 — deterministic full-pipeline simulation

The full provider-free course simulation must reach `expert_review_ready` while deliberately injecting bad Assessment Item and Marking Pack candidates that are rejected and replaced automatically.

A happy-path-only simulation is insufficient.

### Q5 — restart/reuse/dependency isolation

Prove that accepted sibling questions, contexts, Learn/Practice artifacts and unrelated Marking Packs survive another candidate's rejection and resume correctly.

Spend and retry provenance must remain truthful.

### Q6 — repeated recovery stability

Repeat the provider-free matrix with varied candidate failures/order/seeds or equivalent deterministic variation.

No code or worker-contract correction may be required between repetitions.

### Q7 — bounded live worker soak

The next live soak must execute the **same candidate recovery/resampling path as production**, not only isolated worker calls that bypass orchestration behaviour.

It must include multi-question/mixed-demand production shapes and demonstrate that live provider rejections can be recovered without engineering intervention.

Only after Q1–Q7 PASS may a separate Q8 transition restore `qualified` / `livePilotEligible: true`.

## Historical Q7 position

The existing Q7 attempts remain historical evidence:

- attempt 1 — workflow `33265434110`, 13/20 accepted, Q7 FAIL, US$0.423906;
- attempt 2 — workflow `33282967568`, 17/20 accepted, Q7 FAIL, US$0.455962;
- attempt 3 — workflow `33364521121`, 16/20 accepted with controlled educational/semantic fail-closed outputs, historical Q7 PASS, US$0.432952;
- attempt 4 — workflow `33395187056`, 20/20 accepted across five governed subject shapes, post-Pilot #19 Q7 PASS, US$0.384316.

Cumulative known historical Q7 spend remains **US$1.697136**.

Attempt #4 remains valid historical evidence of the worker boundary it tested. Pilot #20 shows that it did not adequately prove the full production recovery topology.

## Current machine state

`content-factory/reliability-qualification.json` now records:

- `status: paused`;
- latest failure: Pilot #20;
- classification: `new_generic_engineering_contract_class`;
- defect class: `assessment_candidate_recovery_and_complete_diagnostic_architecture_failure`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`;
- Q1–Q7 required after the Pilot #20 architecture reset.

The historical Q7 and Q8 evidence files are preserved unchanged.

## Maturity

The maturity sequence remains **zero**.

The existing maturity criterion remains three consecutive materially different real courses, across more than one governed subject shape, reaching `expert_review_ready` on their initial factory run without reusable engineering/code/worker-contract correction between course runs.

Normal candidate rejection and automatic recovery under the approved factory design will not count as engineering correction; that behaviour is the repeatability mechanism we now intend to qualify.

## Documentation impact

No normative authority change is required for this reset. Reliability Standard v2.0 already requires:

- automatic handling of normal model variability without engineering intervention;
- compiler-first ownership;
- complete diagnostics;
- provider-free and live qualification;
- the two-consecutive-confirmation stop-loss.

This architecture/reset change:

- adds an append-only Pilot #20 stop-loss evidence record;
- records ADR-0019;
- pauses current machine qualification;
- updates this indexed technical qualification source;
- does not rewrite historical Pilot, Q7 or Q8 evidence;
- does not run a provider, course or publication action.

The current Content Factory Architecture and implementation documentation must be updated alongside the implementation PRs that introduce candidate/slot state, automatic resampling and recovery-aware orchestration.
