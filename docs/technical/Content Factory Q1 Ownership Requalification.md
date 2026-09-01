# Content Factory Q1 Ownership Requalification

## Status

This document records the provider-free post-Pilot #20 Q1 compiler/worker ownership evidence for the current candidate-recovery Content Factory topology.

Reviewed implementation baseline:

`721063a9e31e3cf695a99bfa63af74af7d36c7bc`

Active authority:

- `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0;
- `decisions/ADR-0019-content-factory-candidate-recovery.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md` for educational trust.

This evidence does **not** change the overall machine-readable reliability decision from `paused` and does not authorise Q7, a full-course confirmation run or learner publication.

## Purpose

Q1 requires a machine-readable or test-enforced inventory of every material provider contract and mechanically validated field, with each field assigned to a governed ownership class. Any field left under generative ownership must be explicitly challenged to determine whether compiler ownership could replace model authorship without losing useful educational judgement.

Confirmation Pilot #20 changed the production architecture materially. The repository already contained earlier Q1 ownership records, but those records are historical inputs to the prior Reliability v2 qualification chain:

- `content-factory/reliability-contract-inventory.json` is retained as the pre-v2 inventory consumed by the v2-D qualification evidence;
- `content-factory/reliability-pilot19-contract-inventory.json` records the Pilot #19 Assessment Item architecture decision.

Neither historical record should be rewritten to describe the new candidate-recovery topology.

The post-Pilot #20 gap was therefore the absence of a **new current Q1 record** that explicitly classified deterministic production slots, candidate numbering/ceilings, recovery lifecycle state and required-course coverage reconciliation against ADR-0019.

This slice adds that record at:

`content-factory/reliability-pilot20-candidate-ownership-inventory.json`

and makes `src/content-factory/reliability-contract-inventory.test.ts` enforce that current record while the older v2-D and Q2 tests continue to consume their unchanged historical sources.

## Current ownership decision

### Revision/compiler ownership

Revision owns mechanically provable production structure and lifecycle state, including:

- Course Knowledge Model, Learn and Practice artifact/source/work-unit bindings;
- Assessment Blueprint component facts, mark/timing constraints and governed references;
- Question Family identities, scopes and numeric bounds;
- Assessment Item target identity, mark structure and governed cross-references;
- Marking Pack question identity, provenance, aggregate AO arithmetic and structural reconciliation;
- Assessment and Marking Pack candidate attempt coordinates;
- production slot IDs and candidate IDs;
- the two-candidate ceiling for Assessment Items and Marking Packs;
- candidate sequencing reconstructed from durable worker runs;
- accepted/rejected candidate lifecycle disposition;
- recovery exhaustion and explicit course blocking;
- retry/cost/execution provenance;
- required Learn, Practice and Assessment coverage channels derived from the authoritative Coverage Map;
- missing-required-coverage disposition;
- deterministic assurance/version binding;
- expert-review package assembly and exact-version eligibility.

The AI provider does not decide which required curriculum slot exists, which candidate number is being attempted, whether the candidate ceiling may be extended, whether rejected work counts as accepted content, whether required coverage may be omitted, or whether recovery exhaustion may be ignored.

### Bounded locator and repair ownership

Some model output participates in tightly bounded mechanical contracts rather than being accepted as unconstrained generative state:

- Learn/Practice coverage evidence uses provider-supplied bounded locators that Revision resolves against actual generated learner-content strings;
- MCQ selection interaction mechanics and explicit operational command/demand evidence remain eligible for the governed bounded repair path where safe.

### Generative educational judgement retained

Generative ownership remains only where compiler ownership would remove useful educational meaning or judgement. The post-Pilot #20 inventory explicitly records the compiler-ownership challenge for each such field class.

Examples include:

- subject-specific explanations, examples, misconceptions and application contexts;
- pedagogical grouping and mode selection inside governed supported modes;
- learner-facing Practice questions, expected responses and feedback;
- assessment-family intent and demand design;
- original Assessment Item wording/context and genuine educational coverage judgement;
- knowledge/application cognitive classification for structurally valid MCQs;
- subject-specific marking descriptors, valid reasoning routes and diagnostic guidance;
- fresh-context independent educational critique;
- corrected educational content during remediation.

Pilot #19's architectural lesson is preserved: selection interaction mechanics are not the same thing as knowledge/application cognitive judgement. Reassigning the latter to a lexical compiler heuristic would recreate the previously identified over-constraint.

## Candidate recovery ownership

The current production code makes candidate recovery an explicit deterministic orchestration boundary.

Assessment Item slots use:

`assessment-slot:<familyId>:<componentId>`

and candidate attempts use:

`assessment-slot:<familyId>:<componentId>:candidate:<number>`

Marking Pack slots use:

`marking-pack-slot:<assessmentItemId>`

and candidate attempts use:

`marking-pack-slot:<assessmentItemId>:candidate:<number>`

For both artifact classes, the current governed ceiling is two candidates. Candidate numbers are derived from persisted worker-run state rather than chosen by the provider.

Rejected candidates remain operational provenance and do not become canonical course artifacts. Exhausting the governed ceiling leaves the required slot unfilled and creates an explicit blocker.

This implements ADR-0019's principle that ordinary bad AI candidates are production scrap while the required production slot remains authoritative.

## Required coverage ownership

Candidate recovery cannot turn rejection into curriculum omission.

`src/content-factory/required-coverage-reconciliation.ts` derives the mandatory evidence channels for each active Coverage Map requirement from the governed `learnRequired`, `practiceRequired` and `examPrepRequired` flags. Only requirements explicitly marked `deferred` or `not_applicable` are excluded.

Course-pack acceptance therefore remains fail closed when an active requirement lacks a required accepted Learn, Practice or Assessment artifact.

The governing invariant remains:

**reject attempts, not requirements.**

## Executable evidence

Current Q1 evidence is enforced by:

- `content-factory/reliability-pilot20-candidate-ownership-inventory.json` — post-Pilot #20 current ownership inventory;
- `src/content-factory/reliability-contract-inventory.test.ts` — validates that post-Pilot #20 record against current production constants/contracts;
- `src/content-factory/assessment-candidate-recovery.ts` — Assessment slot/candidate identity and bounded candidate sequence;
- `src/content-factory/marking-pack-candidate-recovery.ts` — Marking Pack slot/candidate identity and bounded candidate sequence;
- `src/content-factory/assessment-and-marking.ts` — current Assessment/Marking worker contracts including durable candidate coordinates;
- `src/content-factory/required-coverage-reconciliation.ts` — deterministic required-coverage reconciliation;
- the existing provider-free compiler, validation, Q4 and Q5 regression suites.

The Q1 regression verifies, among other things, that:

- every current declared material boundary appears exactly once in the new Pilot #20 inventory;
- every field uses an approved ownership classification;
- every field left as `generative_judgement` includes an explicit compiler-ownership challenge;
- Q1 cannot be marked PASS while an ownership blocker exists;
- Assessment/Marking candidate coordinates are deterministic;
- current worker contracts are candidate-aware version 3 contracts;
- both candidate ceilings equal two;
- candidate lifecycle/recovery state contains no generative-ownership field;
- required-coverage reconciliation contains no generative-ownership field;
- Pilot #19's MCQ interaction/cognitive-demand separation remains preserved;
- prior Practice evidence and Marking Pack AO compiler-ownership corrections remain intact.

The historical pre-v2 and Pilot #19 ownership records remain byte-for-byte outside this change and continue to support their original qualification tests.

## Qualification effect and limits

This slice provides current provider-free **Q1 evidence** for the post-Pilot #20 candidate-recovery topology.

It deliberately does not update `content-factory/reliability-qualification.json`. The global machine-readable state remains `paused` until the governed requalification sequence is deliberately reconciled on a common implementation head.

At this point:

- current Q4 candidate-recovery topology evidence exists;
- current Q5 restart/reuse/dependency-invalidation evidence exists;
- this slice adds current Q1 ownership evidence;
- Q2 historical replay, Q3 adversarial candidate-recovery matrix and Q6 repeated recovery stability remain to be requalified;
- Q7 live-provider qualification remains prohibited until Q1-Q6 are all PASS on the required implementation basis;
- Q8 remains a separate governed transition after Q1-Q7;
- no provider call or paid course run is part of this evidence;
- no learner-facing content is published.

## Documentation impact

No normative authority change is required. The Reliability Qualification Standard already requires explicit compiler/worker ownership and ADR-0019 already assigns deterministic slot/recovery mechanics to Revision while retaining generative educational judgement only where it adds educational value.

Historical evidence is not rewritten. In particular, `content-factory/reliability-contract-inventory.json`, `content-factory/reliability-pilot19-contract-inventory.json` and prior pilot/qualification records remain historical evidence for the implementation states they describe.
