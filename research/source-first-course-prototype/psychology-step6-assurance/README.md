# Psychology Step 6 — Independent Assurance Runner

**Status:** experimental assurance runner merged; Step 6 not yet passed  
**Course:** AQA A-level Psychology 7182  
**Route:** Source-First Course Prototype Experimental Exception

## Purpose

This workspace defines the smallest credible Step 6 assurance route for the Psychology source-first pilot. It does not recreate the legacy Content Factory workflow. It combines deterministic verification with a fresh independent educational/assessment review of the exact retained Psychology candidate before any canonical learner-runtime integration.

The runner exists to answer one question: **is the complete Psychology candidate sufficiently accurate, educationally defensible and assessment-authentic for a restricted pilot, or are there blocking/material defects that must be remediated first?**

## First live execution evidence

The first manually dispatched live run was GitHub Actions run `37377166434` against exact `main` `c2d82ecf76c8c5cb89c30e9c8e0a39a7d15c03c5`.

- exact-current-`main` verification passed;
- the complete deterministic Psychology prerequisite suite passed;
- the live-review test then stopped at Vitest's inherited default 5,000 ms test timeout before the independent review could complete;
- the retained artifact contained only the deterministic packet summary and no provider review or provider/cost receipt; and
- this run therefore establishes neither a Step 6 pass nor a Psychology content finding.

Repository evidence cannot establish whether a provider request that was interrupted by the timeout incurred any external charge, so no zero-spend claim is made for that failed attempt.

The live test now has an explicit 40-minute timeout inside the workflow's existing 45-minute job timeout. This changes only the execution allowance for the already-authorised bounded review; it does not change packet scope, reviewer rules, provider model, retry limits, rights boundaries, the US$5 spend ceiling or the fail-closed completion criteria.

## Second live execution evidence

The second manually dispatched live run was GitHub Actions run `37379737288` against exact `main` `5e17e2d6da96efe93ed26f60ad2eaeeb511f2a54`.

- exact-current-`main` verification passed;
- the complete deterministic Psychology prerequisite suite passed;
- the corrected live-test timeout allowed the provider review to run for about two minutes rather than failing at five seconds;
- the first live packet then returned an incomplete provider response with `reason=max_output_tokens` under the runner's 6,000-token output ceiling;
- no review packet completed and no Psychology blocking/material finding was produced;
- the retained receipt correctly failed closed, but its economics incorrectly recorded zero provider attempts / zero observed spend because failed-packet usage was only accumulated after a successful packet return; and
- repository evidence therefore does not support a zero-spend claim for this run.

The follow-up runner correction increases structured-output headroom to 16,000 tokens while retaining the same two-attempt limit and the same hard US$5 ceiling. It also preserves observed usage, searches and provider-attempt counts when a provider response is incomplete, malformed or otherwise unusable after a request has been made. Normal PR CI remains provider-free.

## Third live execution evidence

The third manually dispatched live run was GitHub Actions run `37443542788` against exact `main` `59d414893da9ba7b32929dcaa6de4efe536afaa7`.

- exact-current-`main` verification and the complete deterministic Psychology prerequisite suite passed;
- the 16,000-token output headroom was sufficient for the provider to return structured review output rather than terminating on `max_output_tokens`;
- the runner made two provider attempts for the first educational packet and then failed closed because the returned `reviewedContentIds` did not exactly match the runner's requirement-only list for `EDU-01`;
- no review packet was accepted and no Psychology blocking/material finding was retained;
- the corrected economics evidence worked as intended: the receipt records two provider attempts, three web-search calls and US$0.654498 observed provider spend; and
- the run therefore establishes a provider-contract/scope-binding defect, not a Psychology content defect.

The defect is that the provider was told to review every content ID in a packet while educational validation treated only requirement IDs as valid reviewed IDs. That is ambiguous for packets that also contain Learn sections, Practice activities and Practice Marking Packs, and the same narrow-ID risk exists for assessment Marking Packs.

The follow-up correction makes the deterministic packet review scope explicit. Educational scope includes the requirement plus its exact Learn, Practice and scoreable Practice Marking Pack IDs. Assessment scope includes the target assessment items plus the supplied topic-set, scored-paper and Marking Pack IDs. The provider no longer has to echo this clerical list: the runner binds the retained review to the exact packet scope itself, while every finding remains fail-closed and must reference only an ID inside that deterministic scope. This removes a bookkeeping failure mode without weakening independent challenge.

## Fourth live execution evidence

The fourth manually dispatched live run was GitHub Actions run `37454898310` against exact `main` `42e985acc126be63af6eefed1d2d7c2eabaf5d83`.

- exact-current-`main` verification and the complete deterministic Psychology prerequisite suite passed;
- the deterministic review-scope binding introduced after run 3 worked;
- eleven educational packets completed and retained substantive independent reviews before the spend guard stopped the twelfth educational packet;
- all eleven completed packets returned `fail_hold`, with 18 blocking findings, 44 material findings, 16 blocking review dimensions and 19 material review dimensions;
- the findings were highly repetitive and concentrated in deterministic learner-asset/Practice/Marking-Pack generation rather than the underlying 118-item Course Truth;
- observed provider spend was US$3.641016 across 11 provider attempts and 16 web-search calls;
- the hard US$5 ceiling stopped before `EDU-08` because the old guard reserved two worst-case attempts for the next packet; and
- the retained workflow artifact is `11409033560`, digest `sha256:c7c3700400450ed4df647c1ca34239140af5b5f788ddeda9238576d206d08695`.

The systemic defect families exposed by the run are:

1. accurate boundary statements were being turned into supposed misconceptions and then marked as invalid;
2. recognition/discrimination tasks referred to missing response options;
3. comparison prompts sometimes used internal IDs, fragments or undefined/self-referential targets;
4. some quantitative, interpretation and ordering activities lacked the concrete stimulus required to attempt the task;
5. contextual-application activities asked learners to invent the context while their Marking Packs claimed evidence from a supplied context;
6. Practice evidence mappings and Marking Pack criterion claims diverged for several modes;
7. learner-facing labels could fall back to internal requirement IDs or sentence fragments;
8. generic purposeful-visual text alternatives and some worked examples did not carry the information required by the declared treatment;
9. learner provenance admitted source classifications outside the reviewer's reusable-source boundary; and
10. `marking_pack_complete` wording overstated the status of explicitly uncalibrated Step 5 candidates.

The remediation is applied primarily at the generator/contract layer rather than patching individual Psychology questions. It narrows quantitative treatment classification to genuine Research Methods quantitative requirements, derives learner labels only from rights-safe subject truth, generates explicit misconception/recognition/comparison/task stimuli, rotates Practice focus across multi-part requirements, carries supplied context/options/data into scoreable Practice Marking Packs, aligns criterion evidence claims with the mapped Practice capability, filters learner provenance to `OPEN`/`LICENSED`/`REVISION_OWNED` sources, and makes purposeful-visual text alternatives information-equivalent rather than referential placeholders. Three claim-level provenance defects identified by the live reviewer are corrected at Course Truth rather than hidden downstream: PSY-07-33 replaces the non-standard NIST provenance entry with a CC BY 4.0 OpenStax hypothesis-testing source for critical-value decision logic; PSY-09-02 replaces the item-level ShareAlike source with a CC BY Frontiers source covering Duck's four dissolution phases; and PSY-13-03 replaces the mixed-attribution page with a CC BY 4.0 Scientific Reports source covering genetic vulnerability, neural mechanisms and starvation/nutritional-state confounding.

The spend guard is also tightened without changing the US$5 ceiling: it now reserves one worst-case provider attempt immediately before that attempt, then re-checks the remaining budget before any retry. This preserves fail-closed spend control while avoiding the run-4 behaviour where budget for an unused second attempt prevented a first attempt that still fit inside the hard ceiling.

## Two-layer assurance

### 1. Deterministic preflight

Normal repository CI performs all checks that can be proved mechanically without provider spend. The Step 6 tests verify that:

- all 17 topics and all 118 Course Truth requirements appear exactly once across thirteen bounded educational review packets;
- dense Research Methods is split into four exact requirement slices rather than weakening the 750,000-character context guard;
- topics 12 and 13 are reviewed separately because their combined packet also exceeded the same fixed context guard;
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

The live workflow is manually dispatched against an exact current `main` SHA. It creates fresh provider contexts that did not generate the course.

Thirteen educational review packets cover the whole course and challenge A1/A2 material plus Practice/Practice Marking Packs for:

- factual and curriculum accuracy;
- fidelity to the supplied rights-safe Course Truth and source evidence;
- pedagogical distortion or misleading simplification;
- omitted conditions or unsafe certainty;
- misconception repair quality;
- whether Practice prompts teach or test the intended capability; and
- whether scoreable Practice marking/evidence rules overclaim what the activity demonstrates.

Research Methods is deliberately split into four requirement slices (`PSY-07-01`–`09`, `10`–`17`, `18`–`23`, and `24`–`34`) because the unsplit topic is too large for the bounded context contract. Topics 12 and 13 are also separate packets because their combined review package was 832,111 characters. These changes affect review packaging only; all 118 requirements remain covered exactly once.

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

No-issue/pass outcomes are represented by the packet decision and dimension statuses rather than fake findings. Any `blocking` or `material` finding or review dimension forces `fail_hold`. A packet cannot report `pass` while carrying a material review state.

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
- sends bounded topic/requirement groups rather than repeated full-course dumps;
- splits groups only when the deterministic size guard proves it necessary;
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
