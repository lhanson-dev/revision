# Content Factory Foundation Curriculum and Exam Coverage Implementation

**Status:** Released through PR #318; portable expert-review reconciliation hardening in follow-on implementation  
**Governing authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`  
**Decision record:** `decisions/ADR-0023-requirement-led-content-coverage.md`

## Purpose

Record the implementation correction made after qualified-human review of AQA A-level Business 7132 exposed that the Foundation approval path could prove internal consistency without proving complete curriculum and exam coverage.

This work is Foundation-only. It does not generate or govern Learn, Practice or Exam Prep material.

## Failure exposed by the AQA Business review

The earlier Foundation path proved that Revision faithfully compiled the requirement set it already held. It did not prove that the requirement set itself represented the complete applicable curriculum and exam definition.

That created an upstream omission risk: a missing specification requirement could be absent from the semantic seed, then remain invisible through deterministic assurance, independent AI review and the qualified-human package because each downstream stage reviewed the same narrower universe.

For AQA A-level Business, an earlier `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` record already contained substantially richer coverage evidence. The Foundation-native migration did not carry that source-level coverage forward as an enforced completeness input.

PR #318 corrected that architecture rather than merely patching individual human-review findings.

## Source-led coverage boundary

Foundation completeness is now governed by two independently established requirement universes.

### Curriculum Coverage Map

Conceptual shape:

```text
Curriculum
  Area
    Topic
      Subtopic / explicit requirement
        -> governed semantic item(s)
        -> canonical Course Truth node(s)
```

For AQA 7132 / 2027, `src/content-factory/source-seeds/aqa-a-level-business-7132-2027-coverage.ts` defines the source-led curriculum universe independently of the semantic seed. Every applicable lowest-level obligation must map to governed semantics and the corresponding canonical Course Truth nodes.

A parent heading is not evidence that all children are covered. There is no fixed topic or node target: the count is an output of the applicable specification.

### Exam Coverage Map

Conceptual shape:

```text
Qualification
  Paper / component
    Structure / assessment requirement
      -> Board Alignment / Assessment Blueprint / Question Family evidence
```

`src/content-factory/source-seeds/aqa-a-level-business-7132-2027-exam-coverage.ts` defines the current AQA 7132 / 2027 exam obligation set used by the guard. It includes the current paper structures, the Paper 1 9-mark analyse family, current overall AO ranges, the quantitative minimum and the governed pre-calibration boundary for unsupported Paper 2 / Paper 3 constituent precision.

## Completeness rule

A Foundation cannot claim complete Course Truth or Exam Truth unless:

- zero applicable curriculum obligations are unmapped to governed semantics and Course Truth; and
- zero applicable exam obligations are unmapped to Exam Truth evidence.

Official numeric facts remain enforceable because they are requirements themselves. Generated content volume is not a completeness measure.

## Deterministic implementation

`src/content-factory/requirement-led-coverage.ts` contains the reusable fail-closed reconciliation primitives.

For curriculum coverage it verifies source obligation identity, semantic mappings, required named scope and canonical Course Truth node identity.

For exam coverage it verifies source-led assessment obligations, exact evidence mappings and mechanically checkable required scope.

Neither requirement universe is derived by reflecting the generated Foundation artifact being validated.

## AQA compiler and remediation integration

`src/content-factory/foundation-precalibration-assembly.ts` applies the AQA 7132 source-led guard during compilation:

1. curriculum reconciliation must pass before Foundation coverage is accepted;
2. externally governed Exam Truth facts are normalised without inventing unsupported detail; and
3. the Exam Coverage Map must reconcile after Question Families are assembled.

`src/content-factory/foundation-aqa7132-review-coverage-guard.ts` carries the same invariant through the assurance lifecycle. It checks source-led curriculum and exam coverage before independent review, before remediation and again after successful remediation before the corrected Foundation can proceed to deterministic re-assurance.

This closes the earlier risk that a review/remediation cycle could silently drop a source-led obligation after initial compilation.

## Qualified-human approval evidence

The qualified-human reviewer must be able to inspect not only the generated Foundation artifacts but also the requirement universes against which completeness was claimed.

The current expert-package hardening therefore adds an explicit package-level `foundation_coverage_reconciliation` evidence object. For AQA 7132 / 2027 it resolves:

- the exact curriculum profile and every applicable curriculum obligation;
- official references, source references and required named scope;
- semantic-item and canonical Course Truth node mappings;
- the exact exam profile and every applicable exam obligation;
- the Board Alignment, Assessment Blueprint and relevant Question Family artifact mappings used as Exam Truth evidence; and
- the exact Source Licence Register entries on which those obligations depend.

The portable expert bundle moves to schema version 2 and writes `coverage-reconciliation.json`. Packaging fails closed if the reconciliation cannot be rebuilt from the approved source-led profiles, if required source references are absent, if curriculum mappings do not resolve to exact Course Truth nodes, if exam obligations do not reconcile, or if the reconciliation points outside the exact resolved review bundle.

The reconciliation is an evidence artifact derived from approved source-led profiles. It is not a new competing Foundation authority or a self-defined requirement baseline.

## Human-review role

Deterministic reconciliation proves explicit coverage. It does not replace qualified educational and assessment judgement.

The human reviewer must still challenge:

- whether the interpreted curriculum/exam requirement universe is correct for the exact cohort;
- factual and conceptual accuracy;
- sufficient depth and emphasis;
- assessment authenticity;
- response and marking expectations;
- ambiguity and valid alternative interpretations; and
- whether any source boundary has been misapplied.

An applicable requirement missing from the supplied reconciliation is itself a Foundation defect. Blocking or material findings require `fail_hold`.

## Fresh AQA proof sequence

The historical AQA Foundation Candidate, independent-review proof and expert package remain historical evidence of the previous implementation state and must not be reused for approval.

The corrected sequence is:

1. run a fresh AQA 7132 / 2027 Foundation live proof on approved `main`;
2. retain the new Candidate, exact source artifact identity and Foundation fingerprint;
3. bind deterministic assurance to that exact retained proof and run it without regenerating paid Foundation output;
4. run fresh-context independent review against the same exact Foundation fingerprint;
5. if remediation is required, apply the guarded remediation/re-assurance loop until blocking/material findings are resolved or the Foundation remains held;
6. assemble a new expert-review bundle including `coverage-reconciliation.json` and the exact Foundation artifacts; and
7. submit that exact package to a qualified subject/assessment human reviewer.

Only a later passing qualified-human submission can support creation of Approved Course Foundation v1. No learner-facing assets are produced in this sequence.

## Proof orchestration

The governed live proof remains main-only, spend-capped and zero-learner-asset. The workflow supports a manual `workflow_dispatch` and, after the follow-on hardening is released, an owner-only exact Issue #289 command:

```text
revision-run-foundation-live-proof:v1
```

The owner-command path mirrors the already-governed independent-review and expert-package command pattern. It changes orchestration only; it does not weaken the main-only, source-rights, spend or assurance boundaries.

Downstream deterministic assurance must not be triggered against stale retained evidence. Its workflow remains bound to an exact source proof identity and must be deliberately rebound to the new live-proof run/artifact/digest/fingerprint before use.

## Documentation impact

The normative completeness rule is already approved through PR #318 in `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md` and ADR-0023.

The follow-on portable-bundle and command-trigger work implements that approved decision and does not create a new product or governance decision. Historical ADRs, proof artifacts and human-review evidence remain unchanged.