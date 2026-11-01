# Issue #703 — Browser-completed Learn reading after a wrong Business calculation

**Date:** 1 November 2026  
**Status:** Acceptance candidate, not merged or live; fresh exact-head CI pending.  
**Scope:** Existing canonical AQA A-level Business 7132 learner journey. No new product behaviour.

## Problem and evidence boundary

Approved PR #763, deployed after merge `af10d63512830eca3b1a6fd308584dbb1946a654`, established a real-auth browser learner who types an incorrect expected-value result in Practice and independently answers a different authored expected-value check launched from Plan. Its prerequisite Learn page `bus-evi-004` had previously been **marked reviewed via the owner-scoped service**, so the learner's real interaction with the teaching page was not proved.

The Course Learning Blueprint requires an intelligible feedback/repair/retest progression, while the Claims and Progress Governance distinguishes reviewed/covered exposure from assessed understanding. The exact AQA skill in this bounded scenario is `aqa-7132-3.2.2:expected-value`; a correct **final number** is not proof of working, method, decision-tree construction, general transfer or exam readiness.

## New test contract

Extend the already CI-invoked `tests/e2e/learner-value-journey.spec.ts` scenario on the existing, disposable real Auth/PostgREST learner. The student must:

1. Begin **without a preseeded Learn exposure** for `bus-evi-004`.
2. Enter a **wrong, certain** number against `expected-value-01` using the real Practice interface; verify the exact independently scored, saved AQA item observation.
3. Exit and explicitly discard only the **unfinished Practice checkpoint** using the existing buttons. Verify the scored incorrect observation and source-mapped new recheck opportunity still exist.
4. Navigate in the **real browser** to the exact published course Learn page `#/courses/{course}/learn/bus-evi-004`. Require a visible authored page and its actual content, then **click the ordinary 'I have read this page' button**. Verify the on-screen acknowledgment and durable owner-scoped Learn exposure.
5. Independently check that this exposure **has not added or changed scored evidence** and has **not cleared** the exact-skill independent retest opportunity.
6. Continue to genuine Day Plan, open a real separate `expected-value-02` check, type and save its correct number; verify both observations and the reassessment need, then reload/open Progress. No manually seeded Plan task, practice result, repair credit, or fake component is permitted.

### Limitations

- The test enters Learn through its existing canonical browser route **after** the mistake; it does **not** prove that the wrong-answer feedback itself links to this exact repair page, nor that Plan automatically chooses this repair as its lead Today's task.
- 'I have read this page' is **reading exposure, not a scored repair or proof the misconception was corrected**. A subsequent new scored question supplies separate bounded evidence for its own final number.
- This one expected-value example does **not** prove net gain, two simultaneous skill faults, independent method or exam-level reasoning, targeted diagnostic feedback, other subject options, or adaptation in Home, REV and Progress. Those remain live #703/#704/#705 and #698 work.
- A real family learner observation, broader multi-date planner repeatability, external educational adequacy of the teaching page and the complete AQA curriculum remain unverified by this test.

## Documentation impact and safety

The code change is exclusively the existing authenticated acceptance test. This same-branch technical note and `INDEX.md` pointer record the new bounded proof. **No** normative course/evidence authority, course content, persisted schema, scorer, learner route implementation, permissions, or production setting is changed. Earlier CI failures and approved narrow tests remain in Git history; source/score identities are preserved. Before changing PR state or seeking specific Founder merge approval, require a passing exact-head full CI and inspect browser/database log for retries, not merely a green parent job. Do not merge without explicit Founder approval of this distinct PR.
