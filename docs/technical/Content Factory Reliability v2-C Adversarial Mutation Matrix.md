# Content Factory Reliability v2-C Adversarial Mutation Matrix

**Implementation status:** implemented on governed V2-C branch; pending exact-head assurance and Founder-approved merge  
**Date:** 29 August 2026  
**Work item:** V2-C  
**Base `main`:** `e5dbef58ab10ffca7c118048b294f2dc8eef5d37`

## Purpose

Implement the Reliability v2 adversarial provider-free mutation matrix required by the active `Content Factory Reliability Qualification Standard` and the approved v2 sequence in `Content Factory Reliability Qualification Harness.md`.

V2-C exists to discover generic provider-contract and compiler-boundary defects cheaply, before Revision spends money on another full-course run. It extends the historical replay work in V2-B: known historical failures remain permanent regression evidence, while V2-C systematically perturbs plausible provider output around the same production boundaries.

This work does **not** claim Q3 PASS, Q1-Q6 PASS, live-soak eligibility or full-course pilot eligibility. Those state transitions belong to V2-D and later governed work.

## Production boundaries exercised

The V2-C matrix deliberately reuses production implementation rather than creating a qualification-only validator:

- `assessment-integrity.ts` for structured assessment command/demand, mark-total, requirement-reference and exact-evidence integrity;
- the live OpenAI worker adapter for bounded Practice evidence-locator resolution, using a fake transport so no external provider call is made;
- `openai-marking-pack-v2-compiler.ts` for provider schema enforcement, complete diagnostics, deterministic rubric compilation, one bounded targeted repair and whole-artifact revalidation.

Synthetic fixture content is used only to exercise process contracts. It is not educational benchmark evidence.

## Governed subject shapes

Every V2-C mutation class is exercised against all five Reliability v2 subject shapes:

1. quantitative / business / economics;
2. mathematics;
3. science;
4. essay / humanities;
5. language / prescribed-text.

The scenarios vary calculation, analysis, evaluation, application and structured-response characteristics while keeping all content invented and rights-safe.

## Mutation classes

The machine-readable record is `content-factory/reliability-v2-c-adversarial-mutation-matrix.json`.

The executable matrix covers:

- blank, whitespace-only and malformed values at structured boundaries;
- duplicated, missing and harmlessly reordered requirement references;
- inconsistent assessment mark totals;
- provider attempts to author compiler-owned rubric IDs and numeric mark bands;
- contiguous, in-range deterministic rubric bands compiled from educational quality levels;
- multiple simultaneous Marking Pack defects in one parseable candidate;
- mixed valid and invalid bounded Practice evidence locators;
- plausible alternative command phrasing that still satisfies the governed demand;
- provider paraphrase where an exact assessment evidence excerpt is required;
- command/demand metadata mismatch;
- one targeted Marking Pack repair receiving the complete first-pass diagnostic set;
- repair failure after that single attempt, with truthful fail-closed behaviour;
- valid Marking Pack and Practice output completing without an unnecessary second provider call.

## Generic defects exposed and corrected

V2-C identified two reusable boundary weaknesses before any paid provider call.

### Whitespace-only structured text

Several assessment-integrity strings used `z.string().min(1)`. A value containing only spaces therefore satisfied the nominal non-empty contract.

The shared assessment-integrity string schema now trims before applying the non-empty check. This also hardens provider-facing Marking Pack subquestion answer requirements because the V2 provider schema deliberately reuses the governed marking-guidance schema.

This is a generic contract correction, not a subject-specific prompt rule.

### Duplicate requirement references

Structured assessment validation compared requirement-reference sets with exact evidence-reference sets. Duplicate entries in `requirementIds` could therefore collapse into the same set and survive validation.

The validator now explicitly rejects repeated requirement IDs inside a subquestion before set comparison.

Harmless reordering remains valid because order is not educational meaning; missing, duplicated or paraphrased evidence remains invalid.

## Marking Pack mutation behaviour

V2-C exercises the V2-A compiler boundary in three modes.

### Valid first pass

A valid candidate:

- produces no diagnostics;
- is compiled into deterministic rubric IDs and contiguous numeric bands;
- preserves compiler-owned subquestion marks and aggregate AO arithmetic;
- uses exactly one provider execution.

### Simultaneous defects and targeted repair

A parseable invalid candidate can contain several independent defects at once, including duplicated guidance, AO-total mismatch, dropped application/analysis/evaluation demand, missing calculation method treatment, missing calculation accuracy treatment and insufficient extended-response levels.

The current production diagnostic function inspects the whole candidate before repair. The executable V2-C test derives the complete first-pass code set, then proves every code is present in the one targeted repair instruction.

A valid repaired candidate is revalidated as a whole and succeeds after exactly two provider executions in total.

### Repair remains invalid

When the repair returns the same invalid candidate, the production worker fails closed with `marking_pack_v2_after_complete_diagnostic_repair` after exactly two provider executions. It does not enter a serial repair loop.

## Bounded evidence-locator mutation

For every governed subject shape, the Practice provider boundary is exercised with two teaching-point locators in one candidate:

- a valid locator resolves to exact generated activity text;
- a second locator is mutated to point at a non-existent activity.

The mixed candidate fails the provider contract without retry. A wholly valid locator set succeeds in one call.

This preserves the Reliability v2 principle that the model may choose a bounded structured location while Revision resolves the final exact evidence value.

## Provider-free assurance

The V2-C suite uses controlled fake HTTP responses at the same worker adapter boundary used by production. It does not call OpenAI or another external model provider and therefore has no provider spend.

The machine record deliberately states:

- `providerCallsRequired: false`;
- `liveSoakIncluded: false`;
- `q3Passed: false`;
- `overallReliabilityV2Passed: false`;
- next work item `V2-D`.

The mutation-seed inventory is retained for V2-D repeated/order-varied qualification; V2-C itself establishes the adversarial case catalogue and executable production-boundary behaviour rather than claiming Q6 repeated stability.

## V2-D hand-off

After V2-C merges, V2-D must run Q1-Q6 on one exact implementation head and produce the governed qualification evidence:

- Q1 compiler/worker ownership inventory;
- Q2 V2-B historical corpus;
- Q3 this adversarial subject-shape matrix;
- Q4 deterministic full-pipeline simulation;
- Q5 restart/reuse/dependency invalidation;
- Q6 repeated stability with varied mutation order/seeds.

No live provider call belongs in V2-D Q1-Q6.

Only after Q1-Q6 PASS may the separate V2-E bounded live worker soak begin.

## Documentation impact

No normative authority changes are required. V2-C implements the already-approved Reliability v2 standard and technical sequence.

This PR:

- adds the machine-readable V2-C mutation record;
- adds this technical implementation record;
- updates shared assessment-integrity implementation where the adversarial matrix exposed generic defects;
- adds executable provider-free regression assurance;
- does not rewrite V2-B, Pilot #1-#18 or other historical evidence;
- does not change the qualification status to `qualified`;
- does not enable paid full-course pilots;
- does not introduce a new architecture decision requiring an ADR.

`INDEX.md` already points to the active Reliability Qualification Standard and the Reliability Qualification Harness, which remain the canonical entry points for this programme. A separate new normative index entry is therefore not required by this implementation increment.
