# Repeatable course production — controlled provider-free proof protocol

**Status:** Proposed research/proof protocol, not normative authority or an approved new-course job  
**Baseline:** [22 October 2026 audit](../../audits/2026-10-22-content-production-repeatability-baseline.md) on `main` `df1adc5b7fd49d52a78f8c5651977a1077ebf118`

## First test: prove one generic course shape, not a catalogue

This protocol is designed to expose a **reproducible cross-course failure before any new whole-course generation**. It uses small synthetic and rights-safe inputs. It cannot establish full curriculum coverage, licensing, educational accuracy, cost or commercial suitability.

Candidate courses are *hypotheses only*: a second A-level Business board (for example Pearson Edexcel 9BS0, after checking its current cohort/specification from the official publisher) and a GCSE science qualification (for example AQA GCSE Biology 8461, after checking current tier/practical/specification requirements). The official source universe and source-use permissions must be verified in a separate governed intake before these examples become a real course job.

## Sequence: preflight without premature engineering

| Order | Provider-free activity | Input | Required recorded outcome |
| --- | --- | --- | --- |
| 0 | Pin current approved main and unchanged production/release authority. | Main SHA + authority links | Scope/rights and no-release boundary declared. |
| 1 | Build a qualification-shape matrix before creating new Foundation content. | Existing Business/Psychology structured paper profiles plus synthetic second-board and GCSE case records | Feature inventory: option semantics, tiers, practicals, calculations, written marking, stimulus/table, diagram need. Unmodelled cases explicitly `UNSUPPORTED`; never silently accepted. |
| 2 | Select one highest-risk fully connected specimen per **distinct** question family. | Rights-safe, independently authored scenario + explicit truth/Exam Truth fixture | A valid question, answer route, AO/marks, correct stimulus, options and mapping all round-trip; deliberately defective version is rejected. |
| 3 | Verify learner identity and evidence mapping without publishing. | A synthetic course ID and topic/skill IDs that are not Business 7132 or Psychology 7182 | Shared content-adapter projection emits correct course, topic and evidence identities; no fabricated course-wide mastery from a paper-specific question. |
| 4 | Exercise negative dependencies and provider failure. | Changed local truth facet, unchanged separate facet, mock question, malformed AI review and missing retained artifact | Changed dependencies invalidate, unaffected content cannot be declared releasable without exact current Foundation/release attestation; loss of proof or ambiguous rights always HOLD; recover unchanged valid provider units without resetting cost. |
| 5 | Record results and **only then** choose the smallest generic engineering delta. | PASS/FAIL/UNSUPPORTED table with exact paths and evidence | One scoped next PR; no speculative universal schema, route, queue, or orchestration redesign. |

## Negative fixtures that must not pass silently

| Fixture | Expected behaviour |
| --- | --- |
| Missing required official source category or amended specification | Source-universe/qualification acceptance HOLD; no fake completeness. |
| `REFERENCE_ONLY` text supplied as substantial generative input | Source-rights rejection; original independently-authored learner content only. |
| GCSE higher-only requirement attributed to foundation-tier evidence | Wrong academic identity/coverage, therefore blocked. |
| Required practical described only in notes but not assessed where Exam Truth demands it | Missing teaching or assessment obligation, therefore blocked. |
| Paper alternative and whole-topic syllabus option treated interchangeably | Invalid attempted-marks/selection shape, therefore blocked. |
| AO2 question without an independent context or a key disclosed in the stimulus | Reject before batch generation (or explicit contextual review HOLD if not mechanically decidable). |
| Prompt calls for one developed limitation but rubric awards a conclusion mark | Prompt/rubric contradiction, therefore blocked. |
| Foundation material fingerprint changes and an old asset is presented for release | Preserve existing fail-closed block; potential narrow reuse only after separately validated re-attestation. |
| Last AI review packet not retained but aggregate status claims PASS | HOLD; missing evidence is not a pass. |
| Standard new course requires another hard-coded learner subject import/route | Portability FAIL; identify generic adapter contract gap. |

## Efficiency rules for the trial

1. **Test geometry before content volume:** one each of ordinary recall, applied/quantitative, extended-response and special-option/tier/practical families that the new qualification actually requires. Do not force a fixed activity quota on all topics.
2. **Repair at the owning level:** local asset -> item; duplicate failures across assets -> generation/review contract; curriculum/source ambiguity -> Foundation; route or evidence identity -> common content adapter.
3. **Retain evidence per unit:** input fingerprint, governing contract, validator decision, reviewer context (if any), elapsed worker time, cost, error classification, downstream dependency keys and exact retained proof.
4. **Cap repeats:** follow the existing Fast-Path two-round review escalation rule and maximum provider retry policy. If the defect persists, classify and escalate; do not run a third opaque review round.
5. **No paid or production release on this trial:** avoid speculative AI spend, new official-content ingestion and learner publication. This is a feasibility gate and does not change user-facing features.
6. **Re-run dependent integrated gates:** a small unit PASS does not prove completeness, full-paper authenticity, independent Source Universe validity or student-facing use.

## Trial evidence record (to fill from actual executable work)

| Field | Result |
| --- | --- |
| Exact current main / branch head used | Not executed yet |
| Input fixture commit/reference | Not executed yet |
| Existing Business and Psychology regression runs | Not executed yet |
| Synthetic qualification-shape checks | Not executed yet |
| Unsupported shape(s) discovered | Not executed yet |
| Generic engineering defect(s) reproduced | Not executed yet |
| Any source-rights / foundation / release checks bypassed | Must be **No** |
| Provider spend | **$0 planned**; observed value not yet measured |
| Human time and execution duration | Not measured yet |
| Next implementation scope and required Ready/authority decision | Pending proof findings |

## Stop conditions and scope control

Stop any affected specimen immediately if a content source has unresolved AI/commercial permissions; if its official requirement universe is unknown; if an evaluation tries to present a generated specimen as student-ready; or if the change would require a governance override not yet explicitly approved. Other independent specimens may continue when lawful/safe.

Any subsequent PR changing the course factory must identify canonical runtime/entry point, exact affected contracts, regression coverage and documentation impacts. Actual Founder approval remains required for every merge. Do not conflate the Foundation educational sign-off with repository approval or deployment verification.

## Documentation impact

This file is a research/test protocol and does not change authority, software or live content. Its eventual findings should become dated audit evidence. Only a deliberately selected process decision belongs in `80-company-workflows/`; a real adapter/compiler change belongs in code and `docs/technical/`, with a governed PR.
