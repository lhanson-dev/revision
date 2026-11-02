# Issue #703 — distinct same-topic assessed skills visible in the existing Plan

**Status:** Governed PR candidate, unmerged and not live. **Baseline:** approved main `74b168d546c7818b432ddd7efa2f46bd73e47138` (live PR #776). **Trackers:** #703 integration, #704 exact evidence, #705 repair/retest, #698 AQA content adequacy. **Surface:** canonical `/revision/app/#/plan`, real `PlanScreen → createPlanDayBuilder → PlanViews.PlanRow` via shared FI-001.

## Verified integration problem

After PR #776, the existing deterministic FI-001 planner already generated separately keyed `skillFocus` candidates and different authored question IDs for individual deficits. But the actual Day/Week Plan row displayed only `Business · Leadership` and `Practice question · N min`; expected-value and net-gain deficits looked identical. This is a student-facing communication defect, not a reason to build another recommendation engine or alter score attribution.

## Scoped correction

- Read the **existing** `PlannerItem.skillFocus` from the shared scheduled item; where present show a restrained, accessible second line identifying exact AQA specification skill and **repair vs independent recheck**, including missed vs guessed provenance. Generic, unsupported and accepted sessions retain their existing display without invented skill diagnoses.
- The Plan's single Up next/Start action, activity IDs, scheduler, candidate selection, 14-day date and duration logic, marks, persisted evidence, Psychology option applicability and course content remain unchanged. The existing `specItemLabel` function supplies a short human-readable item name; no new content mapping is written.
- Original published AQA Business 7132 §3.2.2 final-number calculations supply two genuinely different source targets: `expected-value-01 → expected-value-02` and `net-gain-01 → net-gain-02`. Individual result credit stays limited to one deterministic final number and confidence. A correct final number does not prove diagram construction, full working, evaluation, durable mastery or readiness.
- **Important educational boundary:** both calculations currently map to the **same** published Learn page, `bus-evi-004`. This PR does **not** falsely claim two independently adequate or different teaching repairs. Whether the shared page adequately repairs both demands is an explicit #698 educational acceptance question. Two independently scored checks are distinct; the lesson asset is shared.

## Reproducible acceptance

- `src/app/plan-skill-focus.test.ts` proves source-backed two-skill diagnoses, different fresh authored questions, skill-scoped independent improvement, regression with no invented third question and honest student labels.
- The current isolated real Auth/PostgREST Playwright suite (`REVISION_BROWSER_DB_INTEGRATION=1`, `tests/e2e/learner-value-journey.spec.ts`) adds a disposable ordinary confirmed Business student, exam and real capacity. It **service-saves** two originally wrong and confident calculations into the normal owner-only EvidenceStore rather than pretending those first mistakes were browser-typed.
- That student logs in in the real browser, navigates the 14-day Day Plan and must find **two differently named and startable** recommended checks, each for the precise *different published* question; types correct responses and checks owner-scoped saved results. After the first correction the second missed skill must still require a recheck; after the second correction both immediate rechecks withdraw. Reload and Progress remain accessible. No synthetic Plan row, forged Auth token, browser API intercept, production environment or examiner grade claim.
- Source-first wrong-answer → direct published Learn repair → independent Plan score has separately passed in live PR #776. This new test proves simultaneous skill separation but **not** full unified Home/REV/Progress adaptive explanation, two different teaching interventions, broader Psychology parity, or a real learner's educational improvement. Do not close #703/#704/#705/#698 based on green CI alone.

## Documentation and authority impact

The active Course Learning Blueprint, Adaptive Revision Planning and Claims and Progress Governance already require defensible named evidence and truthful next actions. The FI-001 Gate B bounded readiness was Founder approved on 29 October. This is an existing-feature connection/UI defect correction: **no new normative decision, ADR, schema, data migration or parallel scheduler**. Update this technical note, INDEX and CI tests in the same governed PR, preserving historical evidence. Fresh exact-head CI (including real Auth/DB and responsive browser checks), current-main integration, Founder approval and production release proof remain separate pending gates.
