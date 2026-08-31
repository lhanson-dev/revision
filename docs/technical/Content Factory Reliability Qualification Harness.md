# Content Factory Reliability Qualification Harness

## Status

The Content Factory is **paused after Confirmation Pilot #20** under the Reliability v2.0 stop-loss.

- Post-Pilot #19 Q1–Q6 provider-free qualification: historical **PASS**.
- Post-Pilot #19 Q7 bounded live-worker soak attempt 4: historical **PASS**.
- Post-Pilot #19 Q8 confirmation-pilot eligibility: historical **qualified**.
- Confirmation Pilot #19: generic engineering failure.
- Confirmation Pilot #20: second consecutive generic engineering/recovery failure.
- Current machine state: **paused**.
- `livePilotEligible`: **false**.
- Next full-course confirmation: **not permitted** until the candidate-recovery production topology is implemented, requalified through Q1–Q7 and separately restored through Q8.

Active authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

Current machine-readable state: `content-factory/reliability-qualification.json`.

Current stop-loss evidence: `content-factory/reliability-pilot20-stop-loss-architecture-review.json`.

Architecture decision: `decisions/ADR-0019-content-factory-candidate-recovery.md`.

No educational assurance requirement is lowered by this reset. `80-company-workflows/Content Accuracy Assurance Gate.md` remains the authority for trusted learner content.

## Reliability objective

The post-Pilot #20 objective is no longer to prove that individual model calls are usually valid. It is to prove that the **production system remains reliable when ordinary model candidates are invalid**.

The target is:

`deterministic production slot → generated candidate → complete diagnostics → accept or reject → bounded automatic resampling/recovery → freeze accepted artifact → dependent generation/assurance → expert_review_ready`

A rejected candidate is expected production scrap. It is not itself a course failure.

The factory is reliable only when it can recover automatically from expected candidate variability while retaining all educational assurance and spend controls.

## Success definition: trusted and repeatable

The Content Factory succeeds only when both of these outcomes are demonstrated together:

1. **Trusted content** — the resulting Learn, Practice, Assessment Item and Marking Pack artifacts satisfy the applicable A1–A4 accuracy/assurance controls, independent educational challenge and later qualified human benchmark review. Finishing the pipeline is not evidence that content can be trusted by students.
2. **Repeatable production** — materially different new courses can traverse the same generic production contracts without course-specific engineering changes, prompt/worker-contract correction after observing a course failure, or manual rescue of ordinary rejected candidates.

This is the scale target for adding courses. Neither first-pass provider perfection nor one successful Business course is sufficient evidence.

## Why the post-Pilot #19 qualification was insufficient

Historical Reliability v2 qualification had previously reached Q1–Q7 PASS and a separate Q8 transition made Pilot #19 eligible.

Pilot #19 exposed the generic Assessment Item engineering-contract class:

`assessment_mcq_cognitive_demand_lexical_overconstraint`

The deterministic validator incorrectly treated every `responseDemands[]` value as requiring independent lexical proof in the learner-facing command. That was valid for explicit operational demands such as calculation, interpretation, analysis and evaluation, but invalid for structurally valid selection MCQs whose educational cognitive classification was `knowledge` or `application`.

The factory returned to `paused`, the Assessment Item boundary was corrected and Reliability v2 Q1–Q7 was repeated.

The fourth bounded live soak then accepted 20/20 Assessment Item and Marking Pack samples across all five governed subject shapes. A separate Q8 restored confirmation-pilot eligibility.

That evidence was real, but Pilot #20 exposed a property that the qualification did not prove: **automatic recovery of a real production assessment topology when more than one independent defect exists and an individual candidate is rejected**.

The qualification therefore tested the production validators and compilers but did not sufficiently prove the production failure/recovery topology.

## Confirmation Pilot #20

Pilot #20 ran on approved `main`:

`b240ea9b6e2d56a644048c6085162c58429aef33`

Workflow:

`33420994194`

Job issue:

`#260`

Artifact:

- ID `9769262820`
- digest `sha256:155b3e5d229e82c7d5f2af7e1b43f2ae7050f53a8ccd198c8de5c800a6b35b6d`

Observed:

- 13 Learn/Practice work units planned;
- 13/13 Learn/Practice work units completed;
- 5 Question Families produced;
- 37 total worker executions;
- 30 provider worker executions;
- known provider spend **US$0.670708**;
- zero human interventions;
- zero markable Assessment Items accepted before the run blocked;
- no learner publication;
- final state `blocked` rather than `expert_review_ready`.

The first Assessment Item candidate failed calculation-demand validation for q1. The one complete-candidate repair corrected that failure but then exposed an interpretation-demand failure for q5.

The resulting production error was:

`assessment_item_v2_after_complete_diagnostic_repair`

### Generic root cause

The failure is classified as:

`assessment_candidate_recovery_and_complete_diagnostic_architecture_failure`

Two production behaviours are coupled:

1. `diagnoseAssessmentItemV2Candidate()` runs the semantic structured validator in a `try/catch`. The validator can throw after the first safely inspectable semantic defect, so that one thrown error can be presented to the repair worker as though it were the complete diagnostic set.
2. `runAssessmentAndMarkingFactory()` converts an Assessment Item or Marking Pack worker failure directly into `blockJob(...)`. A rejectable candidate therefore becomes a course-level blocker rather than a bounded candidate-level recovery event.

This is generic architecture. It is not an AQA Business-specific educational defect.

## Stop-loss

Pilots #19 and #20 are two consecutive confirmation-course attempts exposing generic engineering classes.

Reliability Standard v2.0 therefore prohibits a third full-course confirmation merely to discover the next failure.

The factory remains paused until the affected production architecture has materially changed and been requalified.

Maturity remains:

**0 consecutive materially different real courses reaching `expert_review_ready` without engineering/worker-contract correction between runs.**

## Candidate-recovery architecture

ADR-0019 defines the replacement production model.

### Deterministic production slots

The factory plans the required assessment inventory from governed Assessment Blueprint / Question Family constraints.

Mechanically provable properties belong to Revision/compiler ownership where educational meaning is not lost.

### Candidate generation

A model output is not canonical content merely because the provider call succeeded. It is a candidate.

Candidates must pass compilation and deterministic/educational checks before acceptance.

### Candidate rejection and replacement

A rejected candidate is discarded from canonical course content and automatically resampled within a bounded retry/candidate/spend policy.

Fresh resampling is preferred to repeatedly rewriting a complex candidate where semantic variation is the failure source.

### Smallest-safe recovery

- invalid subquestion → replace/recover the smallest safely independent question slot;
- invalid Assessment Item → replace that item without regenerating accepted siblings;
- invalid Marking Pack → replace that pack while preserving the frozen accepted Assessment Item;
- shared case/stimulus → validate and freeze context before independently generating dependent slots where the assessment shape permits it.

### Course-level blocker

The course becomes blocked only when automation cannot safely recover, for example:

- unresolved identity/learner option;
- source-rights ambiguity;
- unrecoverable authority/coverage problem;
- material educational ambiguity that cannot safely be automated;
- exhausted governed candidate/retry/spend ceiling;
- non-recoverable infrastructure state.

An ordinary bad candidate is not itself a course blocker.

## Requalification requirements after Pilot #20

All Q1–Q7 gates are reset because qualification must exercise the new production topology rather than reuse the old transactional-generation proof.

### Q1 — ownership inventory

Re-evaluate Assessment Item and Marking Pack fields under the candidate/slot model.

Compiler ownership must be preferred for mechanically provable structure.

### Q2 — historical replay

The permanent corpus must include Pilot #20 as a generic recovery architecture regression.

Historical records remain unchanged.

### Q3 — adversarial provider-free matrix

In addition to existing shape/mutation coverage, qualification must deliberately inject:

- multiple independent defects in one parseable candidate;
- candidate rejection followed by a valid fresh candidate;
- repeated rejected candidates followed by recovery within bounds;
- Assessment Item rejection without sibling invalidation;
- Marking Pack rejection without Assessment Item invalidation;
- recovery exhaustion that truthfully blocks;
- mixed-demand multi-question assessment artifacts;
- shared-context/case assessment shapes where applicable.

### Q4 — deterministic full-pipeline simulation

The provider-free full-course simulation must reach `expert_review_ready` **despite deliberate bad-candidate injection**.

A simulation where every generated candidate is valid is insufficient evidence.

### Q5 — restart/reuse/dependency invalidation

Qualification must prove accepted sibling artifacts remain reusable after another candidate fails and that resuming the job does not regenerate unrelated accepted work.

### Q6 — repeated recovery stability

The recovery topology must pass repeatedly with varied mutations/order and no code/worker-contract changes between repetitions.

### Q7 — bounded live soak

The next live worker soak must exercise the **same candidate rejection/resampling path as production**.

It must not merely sample isolated first-pass worker acceptance.

At least some live samples must exercise controlled candidate rejection and automatic replacement before Q7 can support a repeatability claim.

A new generic engineering class still fails Q7.

### Q8

Only after the reset Q1–Q7 gates pass may a separate governed Q8 transition restore `qualified` / `livePilotEligible: true`.

No Q8 restoration occurs in this architecture/reset work.

## Historical Q7 execution history

Historical evidence remains historical truth and is not rewritten.

### Attempt 1 — workflow `33265434110`

- 20/20 executed
- 13 accepted / 7 controlled fail-closed
- 9 targeted repairs
- known spend US$0.423906
- generic class: `assessment_subquestion_required_structure_omission_before_targeted_repair`
- result: **Q7 FAIL**

### Attempt 2 — workflow `33282967568`

- 20/20 executed
- 17 accepted / 3 controlled fail-closed
- 15 targeted repairs
- known spend US$0.455962
- generic class: `assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`
- result: **Q7 FAIL**

### Attempt 3 — workflow `33364521121`

- 20/20 executed
- 16 accepted / 4 controlled fail-closed
- 12 targeted repairs
- known spend US$0.432952
- result: historical **Q7 PASS**

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`.

### Attempt 4 — workflow `33395187056`

- 20/20 executed;
- 20/20 accepted;
- 10/10 Assessment Item accepted;
- 10/10 Marking Pack accepted;
- five subject shapes;
- 8 targeted repairs;
- 0 infrastructure incidents;
- 0 engineering-boundary breaches;
- known spend US$0.384316;
- result: historical post-Pilot #19 **Q7 PASS**.

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-004.json`.

This PASS remains historically true. It does not satisfy the new candidate-recovery qualification because it did not prove the recovery topology later shown missing by Pilot #20.

## Historical Q8

`content-factory/reliability-v2-f-q8-eligibility-002.json` remains the historical record that correctly made Pilot #20 eligible under the then-current qualified evidence.

It is not rewritten after the later failure.

Current eligibility is controlled by `content-factory/reliability-qualification.json`, which is now paused.

## Current machine state

`content-factory/reliability-qualification.json` records:

- `status: paused`;
- `livePilotEligible: false`;
- `qualifiedEvidence: null`;
- latest failure = Pilot #20;
- Pilot #19 retained in failure history;
- historical Q7 PASS attempt 4 retained;
- Q1–Q7 = `required_after_pilot20_architecture_reset`.

The live-pilot preflight must therefore fail before paid provider execution.

## Cost position

Historical Q7 soak spend remains:

- attempt 1: US$0.423906
- attempt 2: US$0.455962
- attempt 3: US$0.432952
- attempt 4: US$0.384316
- cumulative: **US$1.697136**

Pilot #19 separately stopped at approximately US$0.7151.

Pilot #20 stopped at **US$0.670708**.

The US$20 confirmation-course ceiling remains unchanged. The candidate-recovery architecture must use bounded candidate-level retry/spend limits underneath that course ceiling.

## Documentation impact

No normative authority change is required in this reset. Reliability Standard v2.0 already requires expected model variability to be handled without engineering intervention, compiler-first ownership, complete diagnostics and the two-confirmation stop-loss architecture review. The candidate-recovery design is an architecture decision within those rules, not a reduction or redefinition of the educational/reliability policy.

This architecture/reset change:

- adds an append-only Pilot #20 stop-loss evidence record;
- records ADR-0019;
- pauses current machine qualification;
- updates this indexed technical qualification source;
- updates executable qualification-state tests;
- updates `INDEX.md` so ADR-0019 is discoverable;
- does not rewrite historical Pilot, Q7 or Q8 evidence;
- does not run a provider, course or publication action.

The implementation PRs that introduce candidate recovery must update `docs/technical/Content Factory Architecture.md`, the relevant implementation plan and code/tests as the new topology lands.
