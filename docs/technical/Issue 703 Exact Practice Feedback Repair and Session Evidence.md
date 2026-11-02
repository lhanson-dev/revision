# Issue #703 — exact Learn repair from Practice feedback; honest session skill attribution

**Scope:** Bounded learner-loop integration on canonical `/revision/app/` (Courses → Practice → Learn; Plan/REV/Progress use existing FI-001 and persisted evidence). **State:** Governed PR candidate; not merged or live; exact-head CI/isolated authenticated browser pending. Main baseline `63ad63f6b2aa4835a7484e3b59b85a0a03bfdf2c`. Links: #703 integration, #704 evidence, #705 repair/recheck, #698 educational source ownership.

## Problem

The published Business expected-value wrong-number real-auth journey had verified saved objective evidence, manual Learn-page exposure and a distinct, later Plan reassessment, but **Practice feedback did not itself open the exact repair**. Its only button advanced to another question. Separately, the Practice end-of-session skill map awarded one full result to **all** tagged items of a multi-skill question, and could present written/self-marked mark points as scored atomic skills. The latter contradicted the established single-target persistence/evidence contract.

## Candidate implementation

- Reuse the **existing** versioned `objectiveItemMappingForPractice` gate. A wrong software-scored single-target source question may show the exact published Foundation Learn page only when its node ID resolves to a page with the same topic. Multi-target, generic course-pack, missing or mismatched pages produce **no** precise repair link. The student retains the normal Next question button and can keep or resume unfinished Practice.
- The link is presented after a **saved** wrong MCQ or final-number result, never before. It uses existing `onOpenLearnPage` and normal course Learn reading/review routes; no new recommendation engine, scheduler, evidence table, mark, session completion or reading-as-mastery credit. The feedback intentionally allows a secondary, student-chosen Learn repair alongside Next; it is a bounded enhancement of the existing one-primary-action feedback pattern, not a new compulsory interruption.
- Practice summary skill tiles are restricted to **first independently attempted, single-target, source-mapped, software-scored MCQ/calculation outcomes**; a coached retry of the same question inside the session cannot turn an initial miss into positive proof. Multi-target results and written/self-assessed mark points are not assigned atomic skill credit. Existing untested supported targets remain identifiable. Copy now states these are *answer results*, not proof of complete understanding.
- Existing normal written self-assessment stays unchanged, including its explicit marking limitations; this PR does not enable uncalibrated AI marking or infer workings from a final number.

## Acceptance proof and exclusions

Targeted unit tests guard exact source mapping, missing/ambiguous/mismatched published pages, multi-skill scored-credit refusal, coached-retry refusal, self-assessed written exclusion and untested targets. The existing disposable **local real-Auth/PostgREST Playwright** Business journey is extended to require:

`wrong certain expected-value-01 typed in ordinary Practice → source-backed feedback Read link → actual bus-evi-004 Learn page → browser click I have read this page → unchanged saved score and pending independent need → resume/discard only unfinished checkpoint → genuine Plan Start → independently scored expected-value-02 → evidence readback → reload/Progress`.

If the link is unavailable or does not navigate, the browser test must fail. No production/child learner account is used in the test. A reading acknowledgement is **exposure**, a newly correct final number is one bounded result, and no claim of method, mastery, exam readiness or full real-student completion follows.

**Still open:** Business two distinct simultaneous skill faults and distinct learner-facing treatments; diagnosis-specific advice for untagged/unsupported content; Psychology Research Methods and selected Paper 3 options; real Home/REV/Plan/Progress cross-surface reaction and 14-day/missed/exam urgency/capacity acceptance; complete source-to-live educational adequacy (#698) and calibrated written marking (#706). CI/browser evidence, signed-in production smoke and specific Founder merge approval are separate gates.

## Governance/documentation impact

The existing Blueprint, adaptive planning and claims authorities already require precise scored evidence and repair/retest, so no normative policy change or ADR is justified for this scoped fix. This technical note, `INDEX.md`, code and regression belong to one PR. Historical audits remain unchanged; #703/#704/#705 stay open until their broader acceptance is proven. The bounded secondary Learn action is explicitly documented as a deviation from the old one-action feedback presentation, subject to Founder review with this PR. No database migration, new processing category or release-scope escalation.
