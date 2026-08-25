# Awarding Body URL Content Intake Workflow

## Purpose
Make the minimum input for adding a new Revision subject/course an official awarding-body course or specification URL, while preserving the controls in `Content Pack Production and Assurance Workflow.md` and the source-use rules in `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`.

This workflow is an intake extension to Stages 1–3 of the Content Pack Production and Assurance Workflow. It does not weaken source, licensing, coverage, accuracy, CI, publication or human-review gates.

## Preferred Founder input

For an ordinary new course, the Founder may provide only an official awarding-body course/qualification URL, with an instruction such as:

> Add this course to Revision using the approved content workflow: [official URL]

The Founder should not have to manually provide subject, qualification, awarding body, specification code, paper names or assessment structure when those can be resolved reliably.

At scale, the Founder may provide a batch of official course URLs. Each resolved course should normally become its own durable Content Factory job and governed branch/PR boundary so status, assurance and approval remain attributable.

## Critical distinction: identity pointer is not reuse permission

An official awarding-body URL is the preferred **identity and alignment pointer**. It is not automatically permission to copy, transform, ingest into a generative-AI context or commercially reuse every linked resource.

Before any discovered source enters a generative worker context, it must pass the source-rights classification required by `Educational Content Source Licensing and Provenance Standard.md`.

The factory must fail closed when rights are unknown or ambiguous.

## Intake rules

When an official course/qualification URL is supplied, the agent/system must:

1. verify that the URL identifies the relevant official awarding-body qualification rather than a third-party revision page;
2. resolve the subject, qualification level, awarding body and specification code/identifier;
3. establish whether the qualification/specification is current for the learner/exam cohort and record withdrawal/replacement dates where relevant;
4. identify known papers/components, options and published assessment structure needed to establish course identity;
5. discover the official and other authoritative sources that may be needed for curriculum truth, assessment truth and alignment;
6. classify every material source under the approved source-rights model before substantial source content is supplied to AI;
7. compile permitted curriculum/subject authority from `OPEN`, `REVISION_OWNED` or appropriately `LICENSED` material;
8. compile structured Board Alignment facts through the approved process, including from `REFERENCE_ONLY` material where permitted, without passing protected source prose downstream merely because it is publicly accessible;
9. create the source/provenance and source-licence records;
10. build the structured coverage blueprint before substantial learner content is generated;
11. preserve subject-authentic structure rather than forcing the course into an existing Business-shaped content model.

The supplied URL is the **starting identity/alignment pointer**, not automatically the only source required and not automatically an AI-ingestion source.

## Source-use behaviour

### OPEN / REVISION_OWNED / LICENSED
May enter downstream worker contexts only within the recorded permission/attribution/restriction boundary.

### REFERENCE_ONLY
May be used only through the approved factual/alignment verification process. Downstream generation workers receive approved structured facts and source references, not substantial protected source text, unless a licence specifically permits broader use.

### PROHIBITED / UNKNOWN
Must not enter generation. `UNKNOWN` or material ambiguity creates a `source_rights_review_required` blocker.

The system must not evade a restrictive source classification by automatically paraphrasing the source before generation.

## Confirmation behaviour

Do not ask the Founder to repeat information that can be resolved safely from approved sources.

Before full content production, the job should contain a concise resolved intake summary with:

- subject;
- qualification;
- awarding body;
- specification code/identifier;
- current cohort/series validity where relevant;
- identified papers/components;
- unresolved learner-specific options;
- source-rights blockers, if any.

Proceed without additional Founder interaction when the requested scope and source-use basis are unambiguous.

Ask/surface a focused blocker only when a genuine choice remains unresolved, for example:

- prescribed text, film or literary work;
- optional module/topic;
- tier or pathway;
- language option;
- paper/component subset where the Founder requests less than the whole course;
- exam cohort where multiple specifications plausibly apply;
- source-rights/licensing ambiguity that cannot be cleared by an approved reusable rule.

Do not use clarification as a substitute for reading permitted authority or applying the source-rights gate.

## Default scope when only a course URL is supplied

If the URL identifies a qualification containing multiple compulsory papers/components and the Founder says **add the course**, treat the course as the requested product scope and model its compulsory papers/components according to the governed course/component architecture.

If the Founder says **add this paper/component**, scope production to that component while establishing enough whole-course context to understand shared, synoptic or cross-component requirements through permitted sources and approved alignment facts.

Where the current content schema cannot represent the authentic course structure without distortion, stop and classify that as a schema/architecture requirement rather than silently simplifying the subject.

## Source safety, currency and licensing currency

The system must not assume that the first search result, an old PDF or a familiar specification code is current.

It must establish, through permitted official/authoritative evidence as applicable:

- current qualification/specification identity;
- first/last assessment dates where relevant;
- amendments/notices that materially affect content;
- current paper/component structure;
- current source-use/licensing classification.

A source may remain authoritative but become unusable for a planned AI/commercial use if its permission terms change. That must invalidate the affected downstream stage rather than being ignored.

## Output into the main Content Factory workflow

Successful intake should produce:

**course identity pointer → source discovery → source-rights classification → permitted curriculum authority + structured Board Alignment → source/licence register → coverage blueprint → Course Knowledge Model → downstream Content Factory v2 production.**

The scalable execution path is governed by `Content Factory Operating Model.md` together with `Content Factory v2 Expert Review Ready Amendment.md`. Those documents own orchestration/job state; they do not replace educational, source-rights, publication or human-review controls.

All existing Founder approval boundaries remain required.

## Documentation impact

This workflow now explicitly separates awarding-body authority from permission to use awarding-body material in AI-assisted/commercial content production. That source-rights gate is a material Content Factory v2 change and must remain aligned with the Content Pack Production workflow, Content Accuracy Assurance Gate, Source/Coverage template and technical Content Factory architecture as implementation proceeds.
