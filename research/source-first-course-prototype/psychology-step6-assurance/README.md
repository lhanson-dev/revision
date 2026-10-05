# Psychology Step 6 — Independent Assurance Runner

**Status:** experimental assurance runner candidate  
**Course:** AQA A-level Psychology 7182  
**Route:** Source-First Course Prototype Experimental Exception

## Purpose

This workspace defines the smallest credible Step 6 assurance route for the Psychology source-first pilot. It does not recreate the legacy Content Factory workflow. It combines deterministic verification with a fresh independent educational/assessment review of the exact retained Psychology candidate before any canonical learner-runtime integration.

The runner exists to answer one question: **is the complete Psychology candidate sufficiently accurate, educationally defensible and assessment-authentic for a restricted pilot, or are there blocking/material defects that must be remediated first?**

## Two-layer assurance

### 1. Deterministic preflight

Normal repository CI performs all checks that can be proved mechanically without provider spend. The Step 6 tests verify that:

- all 17 topics and all 118 Course Truth requirements appear exactly once across nine bounded educational review packets;
- learner-facing material sent for review is bound to exact requirement and Blueprint IDs;
- only rights-safe subject truth and source evidence enter the educational reviewer packets;
- AQA `REFERENCE_ONLY` source text is excluded from provider input;
- every scored Practice Marking Pack is challenged alongside its teaching/Practice context, while topic Exam Prep and full-paper Marking Packs are represented in the three paper-specific assessment review packets;
- the three paper structures, valid Paper 3 option routes and qualification calibration remain tied to approved Exam Truth;
- no packet exceeds the 750,000-character context guard;
- packet schemas, review schemas and final-decision rules are deterministic;
- a separate retained-receipt guard fails closed if any packet decision or dimension remains blocking/material even when the provider omits a duplicate finding;
- the live-review spend guard cannot be configured above **US$5**; and
- no live provider call occurs during normal PR CI.

Existing Psychology Course Truth, Exam Truth, Blueprint, learner-asset and Marking Pack assurance tests remain prerequisites and are rerun by the manual live workflow before provider spend.

### 2. Fresh independent review

After this runner is merged, the live workflow is manually dispatched against an exact current `main` SHA. It creates fresh provider contexts that did not generate the course.

Nine educational review packets cover the whole course and challenge A1/A2 material plus Practice/Practice Marking Packs for:

- factual and curriculum accuracy;
- fidelity to the supplied rights-safe Course Truth and source evidence;
- pedagogical distortion or misleading simplification;
- omitted conditions or unsafe certainty;
- misconception repair quality;
- whether Practice prompts teach or test the intended capability; and
- whether scoreable Practice marking/evidence rules overclaim what the activity demonstrates.

Three assessment review packets are organised by paper and challenge A3/A4 Exam Prep/full-paper material for:

- in-scope and authentic assessment demand;
- internally coherent Revision-owned scenarios/data;
- mark and AO arithmetic;
- rubric/level logic;
- legitimate alternative reasoning routes;
- misconception handling and diagnostic feedback;
- evidence-scope overclaiming; and
- whether the marking contract could teach an incorrect exam habit.

The assessment reviewer receives approved structured Exam Truth facts only. It is not given protected AQA question, mark-scheme or specification prose.

## Issue register and fail-closed decision

Every fresh review returns machine-readable findings containing:

- packet ID;
- affected requirement/item IDs;
- severity (`blocking`, `material`, or `minor`);
- issue type;
- evidence/source/calculation used;
- recommended correction;
- affected artifact/work unit; and
- resolution status.

No-issue/pass outcomes are represented by the packet decision and dimension statuses rather than fake findings. Any `blocking` or `material` finding forces `fail_hold`. A packet cannot report `pass` while carrying a material finding.

The retained-receipt guard independently re-reads all packet decisions, review dimensions and findings after the live review. This closes a fail-open edge case where a reviewer could correctly return `fail_hold` with a `material_issue` or `blocking_issue` dimension but omit a duplicate finding record. In that state the guard rewrites the retained receipt to `fail_hold` and fails the workflow.

Remediation is targeted to the smallest safe affected scope and prior assurance evidence is preserved rather than rewritten.

## Rights boundary

- Official AQA material remains `REFERENCE_ONLY`.
- AQA source text is never copied into the independent-review prompt.
- Structured Exam Truth facts already extracted under the approved reference-only process may be supplied to the assessment reviewer.
- Educational packets contain Revision learner material, rights-safe Course Truth and registered OPEN/LICENSED/REVISION_OWNED evidence only.
- Web search, when enabled for educational challenge, is constrained to domains represented by the packet's permitted reusable sources. Assessment review does not search AQA or the open web.

## Spend boundary

The source-first experiment is explicitly testing a cheaper course-production route. Step 6 therefore uses a hard **US$5 maximum provider-spend ceiling**, well below the historical Content Factory course ceiling.

The runner:

- performs deterministic work before any provider call;
- sends bounded topic groups rather than repeated full-course dumps;
- keeps Research Methods in its own educational packet because that topic is materially denser;
- uses bounded output and at most two attempts per packet;
- conservatively reserves cost before starting another call;
- records observed tokens/searches/spend; and
- stops as incomplete rather than weakening assurance if the remaining budget is insufficient.

A cost stop is not a pass.

## Completion boundary

Merging this runner does **not** complete Step 6. It only makes the fresh independent review executable and inspectable.

Step 6 passes only after a live run tied to exact approved `main` has:

1. rerun the applicable deterministic Psychology assurance;
2. completed every required educational and assessment packet;
3. retained the independent issue register and provider/cost receipt;
4. passed the independent receipt guard; and
5. produced no unresolved blocking/material findings or dimensions.

If the live review finds material defects, those defects are remediated on a governed branch and only the affected assurance is rerun.

Human subject-specialist review remains a later commercial-benchmark gate. It is not required to learn whether this restricted-pilot production method works.

## Documentation impact

This is experimental assurance infrastructure and evidence only.

- No normative authority changes.
- No canonical learner-runtime changes.
- No learner publication status changes.
- No FI-007 production marking implementation.
- No historical Psychology evidence is rewritten.
- Normal PR CI incurs no provider spend.
