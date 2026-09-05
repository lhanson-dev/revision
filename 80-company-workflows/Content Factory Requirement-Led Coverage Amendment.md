# Content Factory Requirement-Led Coverage Amendment

**Status:** Proposed active amendment — Founder instruction 5 September 2026; requires Founder-approved merge  
**Owner:** Founder / Product / Content Operations  
**Applies to:** `Content Factory Foundation and Asset Production Model.md`, Foundation coverage, Course Truth, Exam Truth, Learn, Practice, Exam Prep and asset assurance  
**Purpose:** Make curriculum and exam completeness requirement-led rather than quota-led.

## Governing rule

Revision must produce **whatever is required to cover the complete applicable curriculum and exam requirements for the exact course and cohort**.

The number of curriculum obligations, Course Truth nodes, explanations, worked examples, flashcards, questions, drills, cases, simulations or other artifacts is an **output of that coverage need**. It is never a production target and never evidence of completeness by itself.

A course, Foundation or asset set must not pass because it reached a predetermined quantity.

## Requirement-led completeness

Before Foundation coverage may be called complete, Revision must establish an explicit source-led obligation set for the exact course/cohort. The obligation set must include all applicable curriculum/specification and assessment requirements needed to establish Course Truth and Exam Truth.

Completeness is proven by reconciliation:

1. every applicable obligation is represented;
2. every obligation maps to governed Foundation semantics or Exam Truth as appropriate;
3. every mapping resolves to retained evidence;
4. no applicable obligation remains unmapped, partial or silently omitted; and
5. exclusions, non-applicability and genuine source limitations are explicit rather than inferred from absence.

The acceptance condition is therefore **zero applicable unmapped obligations**, not a required count of obligations or artifacts.

The obligation count may differ materially by subject, awarding body, qualification, specification, component and cohort. A validator must not encode an expected universal or course-specific obligation count merely to prove completeness.

## Course Truth decomposition

Course Truth should be decomposed only as far as needed to represent the governed curriculum accurately and make downstream teaching/evidence mappings reliable.

One specification requirement may require several canonical knowledge/skill nodes; another may require one. The number of nodes follows the semantic structure of the requirement.

A compiler may require that every governed atomic semantic item has a canonical node, but this proves only **internal reconciliation after the requirement universe has been proven**. It must not substitute for source-to-requirement completeness.

## Exam Truth completeness

Exam Truth follows the same rule.

Revision must capture the applicable component structure, assessment objectives, quantitative/practical/synoptic requirements, command/cognitive demands, response families, marking constraints and other assessment rules needed to produce authentic Revision-owned Exam Prep.

Exact numbers that are themselves official assessment facts — for example component marks, timings, weighting, an official minimum quantitative percentage or a verified question count/shape — remain enforceable facts. They are not content-production quotas.

Unsupported precision must not be invented merely to make an exam model appear complete.

## Learner asset production

Learn, Practice and Exam Prep are all **coverage-driven, not quota-driven**.

For each applicable approved Foundation obligation, an asset factory must determine the amount and form of material required for its purpose.

- **Learn:** produce enough teaching material to explain the approved Course Truth clearly, including the examples, methods, misconceptions, relationships and representations that are educationally needed.
- **Practice:** produce enough valid opportunities to retrieve, apply and demonstrate the approved Course Truth with appropriate breadth, variation and difficulty.
- **Exam Prep:** produce enough assessment preparation to cover applicable Exam Truth and Course Truth, including representative command, context, quantitative, synoptic, timing and marking demands where required.

One obligation may justify multiple assets; another may justify one. No global target such as a fixed number of notes, flashcards, questions or mocks may determine whether coverage is complete.

## Counts and telemetry

Counts may still be retained for:

- operational telemetry;
- cost/capacity planning;
- regression diagnosis;
- comparing run shape;
- detecting accidental loss or duplication when a known artifact set is intentionally unchanged; and
- describing what an implementation happened to produce.

Counts must not be used as educational-completeness acceptance criteria unless the number itself is an externally governed fact of the curriculum or assessment structure.

Examples:

- valid: `Paper 1 is 100 marks` where that is a verified assessment fact;
- valid: `this run generated 137 practice items` as telemetry;
- invalid: `the course is complete because it has 100 flashcards`;
- invalid: `the Foundation is complete because it has 82 Course Truth nodes`;
- invalid: `every course must generate the same number of explanations or questions`.

## Fail-closed rule

If the source-led requirement universe cannot be established or reconciled with sufficient confidence, the Foundation must not claim complete coverage.

The correct state is blocked/incomplete with the missing obligation evidence exposed. The factory must not shrink the obligation set to fit existing generated content, infer completeness from asset volume, or rely on later human review to discover omissions that deterministic source reconciliation can expose earlier.

## Human review role

Qualified human review remains mandatory where the Foundation model requires it. Human review judges educational accuracy, depth, emphasis, assessment authenticity and other matters that cannot be reduced to deterministic mapping.

Human review is **not** the primary mechanism for discovering that an explicit curriculum or exam requirement was absent from the machine-readable obligation set. That class of omission should be prevented upstream by requirement-led coverage reconciliation.

## Relationship to existing authority

This amendment clarifies and strengthens the existing rules in `Content Factory Foundation and Asset Production Model.md` that:

- every material examinable curriculum requirement must be represented;
- generated asset volume cannot compensate for a missing Course Truth requirement;
- Practice volume is coverage-driven, not quota-driven; and
- success is not raw content volume.

Where any historical implementation, test, technical document, proof record or earlier workflow language treats a fixed produced quantity as evidence of curriculum/exam completeness, this amendment governs the forward process. Historical evidence remains unchanged as a record of what happened at the time.

## Documentation and implementation consequence

Current implementation must:

- establish a source-led curriculum/exam obligation ledger or equivalent machine-readable contract before declaring Foundation coverage complete;
- deterministically reject applicable unmapped obligations;
- reconcile Course Truth and Exam Truth to that obligation universe;
- remove fixed artifact counts from completeness acceptance criteria;
- retain counts only where they serve telemetry or a genuinely governed numeric fact; and
- update technical documentation and ADRs when the implementation boundary changes.
