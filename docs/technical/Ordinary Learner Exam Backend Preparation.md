# Issue #665 — ordinary learner exam-draft backend prerequisite

**Status:** Backend-ahead release candidate. Governing issue #665 and separate full learner UI PR #679.

## Purpose

Install the next migration `20261025120000_standard_learner_exam_attempt_access.sql`, after approved and production-applied private signup admission migration `20261025110000`. The change removes **per-account REC-10 claims** from all four exam attempt database policies and restricts draft records instead to their own, non-anonymous authenticated account: `auth.uid() = user_id`; existing 14-day creation-capped raw-draft retention, hourly cleanup, timer, expiry, scope, submission and evidence protections remain. The migration adds read-only `revision_learner_feature_readiness()` contract `r2-exam-attempt-open-v2`, while preserving the already live legacy `revision_release_readiness()` contract.

This backend change is compatible with the existing production frontend. **It does not deploy or unlock new learner screens** or enable new signup. No registration code is retrieved, stored, distributed or switched on. The installed hosted Before User Created Auth hook has already rejected a no-code signup; its private code gate remains off so no new accounts can register.

## Governed sequence

1. Validate this exact current-main-integrated PR with GitHub CI including owner RLS, non-anonymous login, cross-user isolation, expiry, pg_cron and database test suite. Obtain Founder approval for this specific PR; do not merge otherwise.
2. Merge; governed backend process applies SQL and records exact migration version. Verify direct production read-only v1/v2 readiness, all four policies are owner-only, hourly cleanup remains and no signup code state changes.
3. Since production legacy frontend is compatible with new owner RLS, existing live Pages release is not stranded. Proceed immediately with the separate learner UI **PR #679**, merged only after its own Founder approval and exact-head CI. Its Pages release checks both database contracts and Edge Functions and auto-deploys the updated product; there is no manual legal-signoff GitHub variable.
4. After updated code-based account signup UI is live, verify synthetic missing/forged/valid private codes, Google new-account denial, existing login; keep shared code disabled until secure onboarding is deliberately activated. Conduct a proportionate personal-controller internal child-data pre-use decision before any minor's actual educational responses are stored, without turning the external public-launch reviews in #663 into an engineering merge gate.

## Educational and operational limits

Merely removing per-account claims does not certify assessment content or planner quality. Existing Business 7132 and Psychology 7182 source restrictions, mock evidence boundaries, answer scrubbing and student confidence language remain. Full real-browser first-use, Home, Learn, Practice, Plan, REV, Exam Prep, interrupted/resumed original exam, Progress acceptance and any defects require live learner testing on #665.

**Documentation impact:** Proposed change to normative REC-10/Privacy and Student Data Principles follows the prior Founder direction under Issue #665 and is bundled with SQL and pgTAP security. This document records current implementation expectations. Do not rewrite research/history or close public launch gate #663. Any overlap in PR #679 must be reconciled mechanically after this PR merges.
