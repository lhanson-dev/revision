# ADR-0019 — Content Factory candidate recovery architecture

**Status:** Proposed for Founder-approved merge  
**Date:** 31 August 2026  
**Decision owner:** Founder  
**Applies to:** Content Factory assessment and other generative worker boundaries where normal model variability can produce rejectable candidates

## Context

Revision's goal remains an automated content-production process capable of adding new courses repeatably while producing educational material that students can trust.

The existing Content Factory already separates orchestration, model-assisted workers, deterministic validation, independent educational review and qualified human benchmark review. Reliability Standard v2.0 also states that every model call need not be perfect: normal provider variability should be converted into valid output or truthful fail-closed behaviour without engineering intervention.

Confirmation Pilots #19 and #20 nevertheless exposed two consecutive generic Assessment Item engineering failures.

Pilot #20 is decisive for the architecture. All 13 Learn/Practice work units completed, but the first Assessment Item candidate failed one semantic demand check. The single whole-artifact repair corrected that defect and then exposed a second defect in another subquestion. Production then converted that rejected candidate into a course-level blocker.

Inspection of the production boundary shows two coupled problems:

1. the Assessment Item diagnostic path calls a validator that throws on the first semantic defect, so the repair can receive an incomplete defect set even though the contract describes it as complete diagnostics; and
2. the assessment orchestrator treats a failed Assessment Item or Marking Pack generation execution as a job-level blocker rather than normal candidate rejection that can be recovered automatically.

Reliability Standard v2.0's two-consecutive-confirmation-failure stop-loss is therefore triggered. A third full-course confirmation run is not an acceptable debugging mechanism.

## Decision

Revision will retain the fully automated Content Factory goal and change the production model from **single-artifact transactional generation** to **candidate-based manufacturing with bounded automatic recovery**.

The governing engineering principle is:

> A bad AI-generated candidate is normal production scrap. The Content Factory fails only when it cannot automatically recover within governed educational, retry, infrastructure and spend limits.

The success criteria are deliberately two-dimensional:

1. **educational trust** — generated course content must pass the existing factual, curriculum, pedagogical, assessment and marking assurance controls and be credible for student use; and
2. **production repeatability** — materially different new courses must traverse the same generic production contracts without course-specific engineering intervention, prompt/contract correction after observing a course failure, or manual rescue of ordinary rejected candidates.

Neither dimension can substitute for the other. A pipeline that completes with weak content is not successful, and high-quality content that requires engineering rescue for each new course is not a scalable Content Factory.

### 1. Deterministic production slots

Assessment Blueprint and Question Family contracts define deterministic production slots. Revision owns mechanically provable constraints such as identity, target requirement coverage, response shape, marks, assessment-objective structure where computable, command/demand constraints, and cross-references.

AI workers author only the educational meaning that genuinely benefits from generative judgement.

### 2. Candidate lifecycle

A generative output is a candidate until it has passed the required compiler and assurance checks.

The normal lifecycle is:

`planned slot → candidate generation → complete diagnostics → accept or reject → bounded resample when rejected → freeze accepted artifact → generate dependent artifact`

A rejected candidate is retained as operational provenance where useful but does not become canonical course content.

### 3. Recovery scope

Recovery occurs at the smallest safe scope.

- one bad subquestion must not rewrite unrelated accepted subquestions where the artifact contract can safely support subquestion-level assembly;
- one bad Assessment Item must not invalidate unrelated accepted Assessment Items;
- one bad Marking Pack must not invalidate its already accepted question or unrelated packs;
- accepted sibling artifacts remain stable unless a genuine dependency change invalidates them.

Where a complex assessment shares a case or stimulus, the context may be generated and validated first, frozen, and then used by independently generated question slots.

### 4. Resampling before repeated repair

Targeted repair remains permitted where it is the safest bounded mechanism, but the default recovery from generative semantic rejection is a fresh candidate rather than repeated rewriting of a complex artifact.

No serial unbounded repair loop is permitted.

### 5. Complete diagnostics

Every parseable candidate eligible for repair must receive the complete actionable deterministic defect set before repair. Validators used for this purpose must aggregate independent findings rather than throw after the first safely inspectable defect.

### 6. Course-level blockers

Course-level `blocked` state is reserved for conditions the automated factory cannot safely resolve, including unresolved identity/options, source-rights ambiguity, unrecoverable source/coverage authority defects, material educational ambiguity, exhausted governed candidate/retry/spend ceilings, or infrastructure failure that bounded retry/resume cannot recover.

Ordinary rejected model candidates are not course-level blockers.

### 7. Educational trust remains unchanged

This architecture changes reliability behaviour, not the educational quality threshold.

All existing Content Accuracy Assurance Gate requirements remain in force, including source traceability and rights, deterministic A1/A3/A4 checks, fresh-context independent review, remediation/revalidation and qualified human subject review before benchmark/commercial trust is established.

Automation is successful only when it produces content that passes those gates; finishing a workflow is not sufficient.

## Qualification consequence

Full-course confirmation eligibility is paused after Pilot #20.

Before another full-course confirmation run, the affected Reliability v2 gates must prove the actual candidate-recovery production topology, including:

- simultaneous independent defects are all diagnosed where safely inspectable;
- injected bad candidates are rejected and replaced automatically;
- accepted sibling artifacts survive another candidate's failure;
- multi-question and mixed-demand assessment shapes are exercised rather than only isolated examples;
- Marking Pack rejection/replacement is independently recoverable;
- deterministic full-pipeline simulation still reaches `expert_review_ready` despite deliberate bad-candidate injection;
- repeated runs show recovery stability without code or worker-contract changes;
- the bounded live soak uses the same recovery path as production.

Only a separate governed Q8 transition may restore full-course eligibility after those gates pass.

## Alternatives rejected

### Keep patching individual provider-contract failures

Rejected because Pilots #10–#20 show that whole-course runs have repeatedly discovered new contract classes serially. This does not provide credible repeatability.

### Require first-pass model perfection

Rejected because probabilistic generation will always have a non-zero invalid-output rate. Production reliability must tolerate that variability.

### Abandon automated course production

Rejected because the current failures do not show that automated course creation is infeasible. They show that the recovery architecture around generative assessment candidates is insufficient.

### Lower deterministic or educational validation

Rejected because the product goal is trusted content. Reliability cannot be achieved by accepting weaker content or weakening assurance.

## Consequences

Positive:

- provider variability becomes an expected production condition rather than a routine engineering incident;
- failures are isolated to the smallest affected candidate;
- course success probability no longer depends on every individual generation call succeeding;
- accepted work can be reused, improving cost and restartability;
- educational assurance can focus on content quality rather than JSON/contract debugging;
- the same generic machinery can support new course shapes.

Costs and risks:

- candidate/slot state and provenance become more explicit;
- the orchestrator requires bounded resampling policy and candidate-level budgets;
- some current schemas may need separation between compiler-owned structure and generated educational payload;
- tests and live qualification must model production pools and recovery, not only happy-path artifact acceptance.

## Documentation impact

This ADR records a material architecture decision under existing normative authority. It does not replace the Content Factory Operating Model, Reliability Qualification Standard or Content Accuracy Assurance Gate.

Implementation PRs must update the current technical architecture, qualification harness and code as the candidate-recovery design lands. Historical pilot and qualification evidence remains unchanged.
