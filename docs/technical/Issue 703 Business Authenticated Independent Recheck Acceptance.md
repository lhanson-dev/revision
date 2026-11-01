# Issue #703 — Business authenticated independent calculation recheck acceptance (candidate)

**Date:** 1 November 2026. **Status:** Draft regression candidate; first retry-enabled CI run #41306350676 was green (9/9 jobs) but the authenticated Plan test failed once before passing on retry. This is a flaky pass, not stable independent acceptance; branch reintegration/validation against current main remains required. Not merged or released. **Dependency:** PR #755 is a separate first evidence/Plan readback slice and still requires its own explicit Founder approval.

## Canonical route and educational boundary

The target is the approved React learner at `/revision/app/`, specifically normal sign-in → AQA A-level Business 7132 → Plan → source-backed focused calculation → Progress. This extends existing #704/#705 tests under Founder-approved FI-001 Gate B scope; no feature, student-visible design, scoring model, schema, source rights or governance change is proposed.

AQA Business 7132 v2.0, §3.2.2, printed page 14, requires calculation of **expected value and net gains**. These must remain different assessment skills. This package tests expected value; net gain and two parallel on-screen repairs remain separate acceptance gaps.

## Added real browser/database test

The CI-invoked `tests/e2e/learner-value-journey.spec.ts` now contains a second isolated real-GoTrue/PostgREST/Playwright scenario:

1. Guard local Supabase scheme, hostname, port 54321 and presence of keys; never use a hosted backend.
2. Create a disposable confirmed ordinary learner, enrol AQA Business, set a future applicable exam and seven-day available time.
3. Save prior review of the exact published decision-tree Learn page using the normal learner service, then build the initial **wrong-and-certain expected-value result** from the published, single-target `rev7132-3.2.2-expected-value-01` and save it as this learner via the ordinary owner-scoped evidence service. This initial answer is *seeded*, not browser-typed.
4. Independently confirm source-backed `rev7132-3.2.2-expected-value-02` as a different fresh question of precisely the same skill.
5. Sign into the canonical browser, open today's real Plan, find an actual supported Leadership focused calculation, and require that it displays the **fresh published prompt**. A fabricated/forced task or alternate direct component mount must not satisfy the assertion.
6. Type the correct new number on-screen, select confidence and require saved feedback. Independently load PostgREST evidence and verify the exact original and new content IDs, source, score, confidence and specification item provenance.
7. Require that the specific immediate recheck need clears after the independent result; reload the normal browser and visit Progress; require that both observations still exist.

The scenario intentionally fails if today's Plan cannot expose or launch the independent selected question, or if the persisted result is wrong/missing. These are real integration defects to investigate, **not** reasons to water down the acceptance criteria.

## Unproven acceptance and release boundary

- First corrected CI #41306350676: all required jobs succeeded, but the new authenticated Plan test was **flaky** (initial failure, successful retry). Treat as unverified repeatability; do not use a green CI badge alone as stable learner proof.
- The first answer is service-seeded. A full on-screen wrong → exact Learn repair → fresh distinct question → adjusted shared Home/REV/Progress/Plan journey is not yet accepted.
- A correct final number is one software-scored result; it does not prove workings, method, AQA AO3/AO4 judgement or durable mastery.
- This test does not establish Psychology course completeness, qualified independent subject review, all Business 42-section coverage, hosted email/signup or production/live learner acceptance.

## Documentation impact

The only intended changes are this scoped CI acceptance test, this technical record and an `INDEX.md` pointer. Product authority already prescribes evidence-sensitive independent rechecking; no normative update or ADR is needed. Historical audits are unchanged. Track actual results and next gaps in #703 and #698 after CI, and do not mark the learner loop complete based on this package.
## First CI failure and corrected test prerequisite

CI #41304933271 passed its static, security, signup and responsive checks but the new real-auth browser test failed to open a calculation recheck among **today's** Plan rows (4/5 database-backed browser tests passed). This did **not** prove the source-backed recheck is absent from the wider programme: the existing planner intentionally places a not-yet-reviewed Learn repair ahead of its independent recheck, potentially on different days. The original test did not distinguish that valid sequencing from a missing recheck. The next version records a genuine prior Learn-page review using the existing owner-scoped service before the missed calculation, so the test specifically exercises the launchable independent check rather than trying to skip a required repair. The complete first-time wrong → learn → later recheck remains separate acceptance; no test assertion about real Plan launch, browser submission or persisted item evidence has been removed. This correction remains **pending re-run verification**.

## Repeatability gate — first corrected CI is flaky

The first attempt of the new browser test in #41306350676 failed at the assertion that a distinct recheck could open from today's real Plan, and its retry passed. All other jobs were green. The reason for that variability is **not yet proven**: it could be timing/race conditions in the test or a genuine intermittent Plan experience problem. Do not assert that prior Learn-page review definitively resolved the original failure. Leave PR draft until an independent diagnostic/repeatability check discriminates these cases; keep the launch-and-persist assertion intact. Recheck full head CI after bringing the branch onto latest main.
