# Content-production repeatability — approved-main baseline and failure-scenario assessment

**Recorded:** 22 October 2026  
**Classification:** Dated audit/evidence, not active normative authority, new-course approval, or implementation acceptance  
**Main inspected:** `df1adc5b7fd49d52a78f8c5651977a1077ebf118`  
**Workstream:** Content production only; separate from the Recovery R2 learner-integrity implementation.

## Objective and limits

Test the assumption that a new GCSE or A-level course can be produced primarily as governed data and assurance work rather than subject-specific software development. Identify costly failures **before** generating a whole course. This is a read-only repository assessment and scenario tabletop: it does not claim external source reconciliation, paid provider runs, qualified educational review, real elapsed-time measurement, full integration tests, or readiness to publish a new course.

The Founder authorised trying the proposed process, **not** a promotion of the Source-First exception, an exemption from Foundation approval, a new-feature Definition-of-Ready sign-off, a source-licence ruling or any PR merge.

## Sources of truth and current constraints

- `INDEX.md`, `AUTHORITY_HIERARCHY.md`, `KNOWLEDGE_ARCHITECTURE.md`, `70-ai-operating-system/AI Agent Constitution.md`.
- `80-company-workflows/Content Factory Fast-Path Process.md` and `Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`: subject knowledge reused where valid; exact-course mapping, two-round review limits, bounded item repair, no unwarranted regeneration.
- `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md` and `Content Accuracy Assurance Gate.md`: independently established official source/requirement universe and exact examination coverage; material omissions and defects fail closed.
- `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`: educational authority is not commercial/AI-ingestion permission.
- `80-company-workflows/Source-First Course Prototype Experimental Exception.md`: the Psychology method remains experimental and must not silently replace the governing Content Factory.
- `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`: the retained AQA Business 7132/2027 Foundation fingerprint failed a fresh external-source challenge; qualified approval on this particular Foundation path remains paused pending correct recompilation and proof. Separately published Business Fast-Path restricted-pilot material must not be misrepresented as approval of that failed Foundation.
- `docs/technical/Content Factory AI-Assured Foundation Gate.md`, `src/content-factory/foundation-derived-asset.ts`: internal derivation can occur from fully `ai_assured`; the normal Foundation-derived learner-release guard requires exactly matching qualified-human `foundation_approved`. Business Fast-Path and Psychology have distinct, governed restricted-pilot boundaries. These are not interchangeable.
- `60-business-operations/Content Factory Bootstrap Cost Strategy.md`: existing provider-spend ceiling and human-review reserve are planning guards, not demonstrated all-in per-course economics.
- `README.md`: learner packs are discovered from `content/**/index.ts` and delivered through the canonical `/app/` runtime. A new standard course should not require a subject-specific React route.

## Observed implementation friction — evidence, consequence, next test

| ID | Repository observation | Production risk | First proof needed |
| --- | --- | --- | --- |
| R01 | `content/psychology/aqa-a-level/shared/course.ts` imports all 17 Course Truth files and Exam Truth directly from `research/source-first-course-prototype/`. | A research location is still a production input; new course may need bespoke conversion and may confuse historical experiment with approved reusable asset. | Establish a small provider-free production-source adapter/fixture contract without relocating approved historical data. |
| R02 | `content/business/aqa-a-level/shared/learn.ts` imports Fast-Path JSON slices; `src/app/FocusedLearningWorkspace.tsx` imports the AQA 7132 question bank and selects it by exam-board/specification ID. `src/app/AqaBusinessQuestionBank.tsx` is a course-specific surface. | An additional exam board could require another application-specific import/branch. | Feed a synthetic, rights-safe non-Business course through the canonical adapter; count app-code changes. |
| R03 | `src/content-factory/foundation-derived-asset.ts` binds release to one aggregate Foundation fingerprint. A material change makes all old-fingerprint assets release-ineligible. | A local correction can cause broad technical re-attestation or content remake if dependencies are not provable. | Model affected dependency sets and design a fail-closed rebind attestation; never weaken the existing release guard without proof. |
| R04 | `content/psychology/aqa-a-level/content.test.ts` tests 27 Paper 3 option combinations; Business also has paper-alternative arithmetic. | Qualification shapes differ; a simplistic paper total or single optional-question contract fails. | Probe both shapes from structured Exam Truth plus a synthetic GCSE tier/practical profile before mass generation. |
| R05 | Psychology launch assurance run #11 PASS after prior runs found repeated AO2 prompt, marking and distractor-contract problems; see `docs/technical/Psychology Restricted Pilot Integration.md`. | Fixing individual questions instead of shared generator/marking contracts repeats paid review. | Validate a full representative question-family specimen (prompt, stimulus, response demand, AO/marks, answers, rubric) before batch generation. |
| R06 | Foundation first-course plan records Source Universe and semantic-retention omissions despite internal passes. | Self-defined denominators give false completeness and downstream rework. | Independently enumerate official source categories and atomic requirement denominator before Foundation or asset batch completion. |
| R07 | Existing `docs/technical/Content Factory Durable Resume and Spend.md` provides durable semantic replay; first historical mock and launch assurance runs revealed evidence-retention/retry problems. | Failed provider/review steps can cause repeated purchase or unsupported PASS claims. | Inject per-item malformed output, interrupted run and missing artifact in provider-free tests; require saved fail evidence and no double-spend semantics. |
| R08 | `research/two-topic-open-source-reuse-pilot-20261009` PR #584 is open/draft; its human minutes, provider spending and reliability remain unmeasured. | Apparent reusable-source savings may shift work into source verification and expert remediation. | Instrument human time, AI usage, source gaps, correction causes and total release latency on the first complete new course. |

## Scenario walkthroughs and current verdict

These are **desk-simulated** results against observed main contracts, not executed new-course tests.

| Scenario | Injected condition and expected control | Current finding | Verdict |
| --- | --- | --- | --- |
| S01 Second-board Business | Course-specific structured board/assessment mapping of a reused subject node; test unchanged/deepened/new classification. | Reuse is normative but a second-board full run and measured reuse rate are not evidenced; AQA-specific adapters exist. | **UNPROVEN** |
| S02 GCSE science | Higher/foundation tier distinction, required practical, calculation and visual/diagram treatment. | Qualification-neutral schema claims exist, but no completed GCSE source universe or generic proof through these shape differences. | **UNPROVEN** |
| S03 Optional sections | Choose one of three in each of three Psychology option groups; validate all 27 combinations and 96 attempted marks, versus Business paper-alternative semantics. | Existing Psychology and Business content tests explicitly model these different structures. They qualify existing packs, not automated production of a new optional course. | **PARTIAL EXISTING PROOF** |
| S04 Bad question family | Contextless AO2, answer-leaking stimulus, conflicting rubric or double-awarded mark criterion. | Real Psychology fail-holds led to systemic fixes; existing released output tests guard some historical cases. New-family pre-batch qualification not yet evidenced. | **HIGH REWORK RISK** |
| S05 Narrow Foundation correction | Change one truth/rights facet while other assets have identical inputs. | Current whole-Foundation release fingerprint correctly rejects stale assets; safe narrower release re-attestation is not demonstrated. | **SAFETY PASS; REUSE UNPROVEN** |
| S06 Interruption / lost evidence | Cancel mid-batch, malformed provider JSON, lost independent-review packet. | Durable/retry foundations exist; historical failures include missing retained launch-review output. Portability across current production paths not yet proved. | **PARTIAL EXISTING PROOF** |
| S07 New course at learner boundary | Synthetic learner adds course, opens Learn/Practice/Exam Prep/Progress, and has correct score/evidence scope. | Canonical runtime and Psychology restricted route test exist; AQA Business-only special imports remain. | **PARTIAL EXISTING PROOF** |

## Blockers and prioritisation

1. **Hard blocker for publication claims:** source universe/licence identity, material curriculum/exam omissions, or full Foundation approval/release compatibility unresolved. No reinterpretation of review PASS or cheaper method can remove these.
2. **High rework driver:** discover new qualification shapes only after mass content generation. Introduce small *non-publishing, provider-free* shape probes before a paid run.
3. **High rework driver:** defer question-family AO/answer/rubric testing to whole-paper assurance. Prove the hardest representative specimen early; stop a flawed family rather than patching many final questions.
4. **High scaling driver:** Business-specific app imports and bespoke Psychology source adapter. Demonstrate generic course data input before claiming a no-code next course.
5. **High economic uncertainty:** no cross-course all-in elapsed/human/provider-cost distribution. Do not accept `$10–$15` provider expectation as a validated total-course cost or treat `£200` reviewer reserve as a quote.

## Next bounded implementation candidate (not authorised by this audit)

Design **one small qualification-shape contract/probe** on rights-safe synthetic data with cases for:
- paper-alternative and syllabus-option choices, including multi-question option sections;
- tier-specific GCSE requirements and practical/calculation assessment;
- question-family coherent stimulus, AO demand, mark route and answer guidance;
- linked course/topic/evidence IDs, no subject-specific `/app/` route.

The first proof should deliberately demonstrate **one failing or unsupported contract on the current system**, then propose the smallest generic correction. Do not build an entire new orchestrator, regenerate Business/Psychology content, run paid AI, alter official-source permissions or publish a new course to get that result.

**Acceptance of the next candidate:** reproducible test inputs and results; exact failure category and owner; no source text of unknown reuse rights; no new per-subject learner route; no bypass of versioned foundation/asset/publication gates; specific estimated engineering delta. Any material product feature must separately satisfy governed Definition of Ready.

## Documentation impact

This audit changes no normative authority, implementation or technical description. A new index pointer is appropriate for discoverability. Actual process adoption later requires explicit comparison of Foundation-first/Fast-Path with the narrow Source-First experiment, a separate Founder-governed normative change where necessary, and same-PR technical documentation for any code changes. Leave historical research/assurance evidence intact. PR #584 and the ongoing Recovery R2 PR #658 must not be rewritten or overwritten.
