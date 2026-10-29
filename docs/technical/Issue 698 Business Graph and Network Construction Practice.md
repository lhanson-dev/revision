# Issue #698 — Business 7132 break-even graph and network diagram rehearsal

**29 October 2026. Proposed content-only correction on canonical /revision/app/. Not merged or live.**

## Source and requirement (verification boundary)

AQA AS/A-level Business **7132**, version **2.0 June 2023**, official 42-page specification `https://filestore.aqa.org.uk/resources/business/specifications/AQA-7131-7132-SP-2023.PDF` (official web text located and checked; original user-uploaded bytes **not re-acquired or rehashed** in this conversation). Repo manifest pins the intended PDF as SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. **Exact-byte parity remains unverified**. Curriculum-use classification: `REFERENCE_ONLY`; all added teaching and data are original Revision examples.

- **3.5.2 Analysing financial performance**, printed p **20**, source PDF physical page **19**: construction and interpretation of break-even charts, calculation and *illustration* of effects of price/output/cost changes; contribution, break-even output, margin of safety and total contribution remain distinct obligations. This slice teaches construction, separate **price and fixed-cost** amendments, and output/margin-of-safety illustration, but **not** complete teaching/assessment adequacy of every 3.5.2 subrequirement or drawn student performance.
- **3.10.3 Managing strategic implementation**, printed p **31**, physical page **30**: interpret and amend network diagrams, identify critical path and total float. Original one-case timing exercise remains published.

## Observed implementation and correction

Before this slice, the published authored Learn page `understanding-break-even` in `finance` already contained a quantitative chart and one numeric worked break-even example. A student could **view** a completed chart, but no step-by-step draw/amend method was present in that authored page. The published `a-level-network-amendment-01` DataDrill asked for revised path timing and then revealed an answer, but did not ask the student to actually construct a network. In `src/app/FocusedLearningWorkspace.tsx`, `formulas-data` DataDrills show `prompt` then reveal `answer` via **Show model answer**. They do **not** save a student drawing or independently verify its correctness, do not award scored evidence and cannot indicate diagram skill mastery.

Content-only correction:

1. Add an original five-step worked construction/amendment example on existing `understanding-break-even` Learn page. Keep page ID, original graph and all earlier blocks; axes, TR/TC plotted points, fixed-cost intercept, break-even intersection, separately changed price, cost and forecast output, and limitations are explicit.
2. Add one original paper-drawing/reveal model answer with independently recalculated price, fixed-cost and forecast-output amendments `a-level-data-drill-25` to existing shared `dataDrills`. The original 24 existing data-drill identities are unchanged.
3. Retain `a-level-network-amendment-01` unchanged, and add `a-level-network-amendment-02` for the student to sketch dependencies, join, recalculate critical paths and branch float after changed activity duration.
4. All **three published** Business paper ContentPacks import these same shared teaching/Practice objects through `contentPackSchema` and `LearningContentAdapter`. This is course-level Learn/Practice, not three duplicated new syllabi.

**Learner usability limitation:** DataDrills are currently a **course-wide ordered set**, not matched by topic, and the new chart drill is late in that set. Discovery and reliable targeted Plan launch are **not** established by this content correction. A genuinely new interactive graph-input, upload/image comparison or calibrated diagram evaluation mode requires separately governed feature Ready, accessibility, storage/privacy and marking validation; the present bounded correction does not implement or authorise that. A self-checked paper sketch is legitimate *rehearsal*, **not independently assessed practice** for the #698 Gate 2 pass/fail denominator.

## Assurance, data integrity and programme

`content/business/aqa-a-level/graph-construction-practice.test.ts` checks the real three available packs, the actual Learn page and original chart retention, both construction prompts and unscored limitations, untouched prior network exercise, old data-drill IDs and recomputed numeric answers. Normal exact-head full CI, responsive site assurance and published production release require verification before merging. **No real learner browser acceptance is claimed.**

No change to score semantics, Practice marker, student evidence schema, identity, authentication, planner, application route, historical records or publishing status. Old evidence IDs are preserved. Relevant audit row remains **teaching improved, manual rehearsal present, independently marked diagram construction UNSUPPORTED / UNVERIFIED**, not a full curriculum coverage PASS. Full exact-PDF atomic inventory, complete Business and Psychology teaching/performance inspection, #704 skill evidence, #705 independent retest, hosted signed-in acceptance and independent qualified examiner review remain separate open gates.

**Documentation-impact check:** content-only patch and its regression tests plus this technical assurance note and INDEX pointer. No proposed normative change: approved Course Learning Blueprint already distinguishes teaching, rehearsal and assessed performance. Existing source-rights policy unchanged. History not rewritten. #698 primary tracker, #703 integration tracker.
