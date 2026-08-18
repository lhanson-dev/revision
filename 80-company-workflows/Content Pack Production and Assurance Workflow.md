# Content Pack Production and Assurance Workflow

## Trigger
Any new Revision subject, qualification, specification, paper, component or substantial learning-content pack intended to enter the learner catalogue.

## Purpose
Create new educational content quickly enough for an early-stage product while preserving curriculum fidelity, source provenance, assessment accuracy and a repeatable publication gate.

This workflow governs the production path from identifying a learner's course through to an `available` content pack. It does not make third-party revision material or AI-generated wording an educational authority.

## Governing principles

1. **Identify the exact course before writing content.** Confirm subject, qualification, exam board, specification code and relevant paper/component.
2. **Use primary educational authority first.** The current official specification/syllabus and official assessment materials are the default source of truth for curriculum scope and assessment structure.
3. **Build coverage before volume.** Create a specification coverage blueprint before generating large quantities of notes, flashcards or questions.
4. **Preserve provenance.** Material claims, assessment structure and substantial content areas must remain traceable to the approved sources used to create the pack.
5. **AI may transform but not invent authority.** AI can structure, explain, generate practice and draft learner-facing wording, but generated content still requires curriculum and factual assurance.
6. **Active recall and assessment must be deliberate.** A pack is not complete merely because notes exist. Where appropriate it should include learning, retrieval/practice, exam preparation and evidence-generating activities.
7. **Do not expose unfinished packs as complete.** Use `planned`, `preview` and `available` deliberately.
8. **Publish through a governed branch and PR.** Every pack entering `available` status requires the normal Founder merge approval.

## Source hierarchy for educational content

Use sources in this order unless the subject requires a deliberately approved exception:

1. current official specification or syllabus from the awarding organisation;
2. current official assessment guidance, assessment objectives and paper/component rules;
3. official specimen papers, past papers, mark schemes and examiner guidance/reports where available and appropriate;
4. other deliberately approved primary educational sources required by the specification, such as prescribed texts or official source lists;
5. reputable secondary teaching/revision sources only as supplementary evidence or explanation support.

Secondary sources must not silently override the official specification or assessment authority.

If primary sources conflict, appear outdated, or leave a material ambiguity, stop and resolve the issue before marking the affected content complete.

## Stage 1 — Identify the course precisely

Record at minimum:

- subject;
- qualification level;
- exam board / awarding organisation;
- specification code or identifier;
- paper/component/area being added;
- relevant exam series/year if the structure is time-sensitive;
- learner context where it affects scope, for example a prescribed text or optional module.

Do not start full content production from a vague label such as “A-level Spanish” or “GCSE Maths”.

## Stage 2 — Create the source record

Before content generation, create a short source/provenance record for the pack. It should state:

- source title;
- issuing organisation;
- source type;
- version/date where available;
- URL or repository reference where appropriate;
- what part of the pack the source governs;
- date checked;
- any known limitation or ambiguity.

The record may live alongside the pack or in another deliberately indexed evidence location, but it must travel with the same governed PR when the pack first becomes `available`.

Do not copy large copyrighted source passages into the repository merely to prove provenance. Record the source and derive original learner-facing material.

## Stage 3 — Build the specification coverage blueprint

Before writing the full pack, decompose the official specification into a coverage blueprint.

For each examinable requirement, record enough information to answer:

- what official requirement is being covered;
- which Revision topic/specification area owns it;
- what knowledge, skill or interpretation the learner needs;
- how the requirement may be assessed where the source establishes this;
- which Revision learning/practice/exam-prep elements will cover it;
- whether coverage is complete, partial, not applicable or intentionally deferred.

The blueprint is the completeness control. A high volume of generated content does not compensate for gaps in specification coverage.

Where a subject is skills-led, text-led or component-led rather than topic-led, preserve that authentic structure rather than forcing it into the Business Paper model.

## Stage 4 — Build the typed content pack

Create the new pack under `content/**/index.ts` using the current governed content schema.

The pack should represent only capabilities that are educationally meaningful for that subject/component. The current schema can support, where applicable:

- manifest and learner explanation;
- topics/specification areas;
- learning sections;
- formulas;
- topic relationships;
- flashcards;
- quick-check / multiple-choice questions;
- case/application practice;
- data drills;
- exam technique;
- exam-style questions and simulations.

Do not manufacture empty or artificial content merely to fill every schema capability. If a future subject requires a genuinely different educational structure, treat that as a schema/architecture change rather than distorting the subject.

The pack entry point must validate through `contentPackSchema` and default-export the validated pack so the catalogue can discover it automatically.

## Stage 5 — Produce learning and assessment content

For each substantial specification area, deliberately consider four learner jobs:

### Learn
Can the learner understand the required knowledge/skill in plain language, with examples or connections where useful?

### Practice
Can the learner retrieve and apply the material rather than only reread it?

### Exam Prep
Where an exam/component exists, can the learner practise the actual style, demands, timing and assessment behaviours supported by the official sources?

### Progress evidence
Do the activities create meaningful evidence of understanding or performance, rather than treating a page view as mastery?

Not every area requires every activity type, but omissions should be deliberate rather than accidental.

## Stage 6 — Educational and structural assurance

Before a pack can become `available`, perform two separate assurance passes.

### Structural assurance
CI/schema tests must confirm, as applicable:

- the pack parses against the current schema;
- IDs and topic references are valid and unique;
- manifest topics match actual topic definitions;
- assessment-objective allocations are internally valid;
- exam question marks add to the stated paper total;
- exam duration/total marks agree with manifest metadata;
- the production build discovers the pack;
- the shared learner shell renders it without subject-specific application code.

### Educational assurance
Review the pack against the approved source record and coverage blueprint for:

- complete intended specification coverage;
- factual accuracy;
- correct qualification/paper/component identity;
- correct assessment structure, timing and marks;
- accurate use of assessment objectives where applicable;
- authentic question style without pretending generated questions are official past-paper questions;
- reasonable marking guidance derived from approved assessment principles;
- plain-English explanations that do not change the underlying meaning;
- no unsupported claims, invented curriculum requirements or unverified certainty.

Schema validation is necessary but is not evidence that educational content is correct.

## Stage 7 — Status and publication gate

Use content status deliberately:

- `planned` — identified but not ready for learner testing;
- `preview` — under construction or assurance; excluded from the ordinary pilot learner catalogue;
- `available` — approved for learner use and eligible for automatic catalogue discovery.

A pack must not be changed to `available` until:

- course identity is confirmed;
- primary sources are recorded;
- coverage blueprint is complete for the intended scope;
- structural CI passes;
- educational assurance has been completed;
- known material limitations are documented;
- the PR records the documentation impact and content assurance performed;
- explicit Founder approval is given for that PR merge.

## Stage 8 — Post-publication check

After deployment, verify that:

- the subject/course/paper appears automatically in the canonical `/app/` learner catalogue;
- the generated Subject Home and focused sections resolve correctly;
- supported learning capabilities appear and unsupported/empty ones are not misleadingly exposed;
- evidence records against the correct module/topic IDs;
- global Progress includes the new module correctly;
- REV can include the new module in deterministic prioritisation;
- no subject-specific React route/page was required for an ordinary pack addition.

If adding an ordinary subject requires editing shared React navigation or hard-coding the subject name into the engine, treat that as an architectural defect and stop rather than normalising the exception.

## Minimum PR record for a new pack

Every new-pack PR should state:

- exact subject / qualification / exam board / specification / paper or component;
- pack ID and repository path;
- primary sources used;
- where the coverage blueprint/provenance record lives;
- current status (`planned`, `preview` or `available`);
- educational assurance completed and by what method;
- structural tests/build results;
- known limitations or intentionally deferred coverage;
- whether any schema or shared-engine change was required and why;
- documentation impact;
- canonical learner route/runtime verification where learner behaviour is affected.

## Fast pilot mode

For the Jamie pilot, this workflow should be rigorous but proportionate. We do not need enterprise-scale editorial bureaucracy before testing a second subject.

The minimum acceptable pilot path is:

**Identify → primary sources → coverage blueprint → typed pack → educational check → CI → preview check → Founder-approved `available` merge → production smoke.**

Do not skip source verification, coverage mapping or educational assurance in the name of speed. Those are the controls that prevent a polished but incorrect revision product.

## Future scaling

As Revision moves beyond a small pilot, this workflow can be extended with named content owners/reviewers, automated coverage metrics, source-version monitoring, independent educational review, content change logs and withdrawal/revalidation procedures. Those controls should be added when operational scale justifies them rather than simulated prematurely.
