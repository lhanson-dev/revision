# Issue #665 — Private learner-testing activation preflight

**Status: OPEN, 25 October 2026.** This replaces the historical REC-10 pilot-claim onboarding checklist when the unified-feature PR is approved. It is not evidence of live activation or privacy sign-off.

## Feature model
Every ordinary non-anonymous authenticated learner uses the programme-first planner, published Business 7132 / Psychology 7182 Exam Prep and supported mock recovery by default. No FI-001 or REC-10 per-user feature claims or administrator privileges. `learner_exam_attempts` retains owner-only RLS, creation-anchored 14-day expiry, hourly cleanup, pause-on-interruption, immutable course/paper/attempt identity and post-submission raw-answer scrubbing. The backend must advertise `r2-exam-attempt-open-v2` before the frontend is deployed. Anonymous Supabase Auth sessions are not eligible; owner RLS explicitly checks `is_anonymous` as well as `auth.uid()`.

## Admission and pre-use activation — all OPEN until separately evidenced

| ID | Required evidence | Status |
|---|---|---|
| ADMIT-01 | Live Auth settings read 25 October 2026: `disable_signup=false`, `external.email=true`. The *public* service currently accepts email signup configuration; actual private admission remains OPEN until Auth hook is attached and verified | CONFIRMED PUBLIC CONFIG / OPEN PRIVATE BOUNDARY |
| ADMIT-02 | Selected private-test code and Supabase Before User Created hook prepared in PR #679. SQL hook and signed proof alone are insufficient: operator must enable the hosted Auth hook, open the secret-backed access gate, and prove missing/incorrect code and new Google OAuth signup are rejected by *live Auth* | IMPLEMENTED CANDIDATE / NOT ACTIVE |
| FAMILY-01 | Accountable controller, genuinely limited scope if private, and purpose/end date recorded without a child's identifiers in public GitHub | OPEN |
| FAMILY-02 | Proportionate child-centred risk/DPIA review, lawful basis and necessity assessment, residual risk disposition and dated controller authorisation | OPEN |
| FAMILY-03 | Age-appropriate clear notice; rights, access/export/erasure contact and operating process, including raw draft storage/deletion disclosure | OPEN |
| FAMILY-04 | Region, processor terms, backups/PITR retention, system logs, AI data flows and deletion limitations checked | OPEN |
| FAMILY-05 | Current-head CI, production-equivalent real Auth/RLS two-user isolation, updated migration and scheduler, interrupted/resumed mock, evidence and expiry verified | OPEN |
| FAMILY-06 | Controller GO/NO-GO and incident response recorded before any real child's personal data is used | OPEN |

**Scope separation:** engineering and isolated synthetic tests may proceed before an independent external public-launch privacy report. Actual real-child-data use requires applicable pre-use safeguards. Open-signup/wider learner access requires the public-launch reviews in Issue #663, including `PUBLIC-PRIV-01`; this file does not waive those duties.

**Release order:** approve this exact PR; install/verify backend migration ahead of frontend as required; verify accepted admission/privacy boundary and all test journeys; only then allow the automatic Pages deployment and production use. Do not merge and call the product live while the v2 backend or activation boundary is unverified.

## Founder selection — option 1, private shared-code admission

Founder selected the private admission approach on 25 October 2026. This approves the **approach**, not PR #679 merge or real-child-data processing. The test code is a single strong randomly generated server secret, not per-account eligibility. New students enter it once during email registration. All admitted ordinary signed-in students receive the same learner features; no student is given special metadata. Existing users retain their sign-in. New OAuth identities cannot bypass the admission hook.

**Fail-closed rollout:** Do not enable the new learner-access backend policy until the hosted before-user-created hook demonstrably rejects unauthorised real Auth signups, without breaking existing logins. Until the hook is configured, keeping production signup enabled is **not** private testing. Document the short pre-use controller/legal-basis record and safeguards, then verify the hook with synthetic identities, before inviting the first real learner. A shared code can be passed to more people, so keep it private, rotate immediately if disclosed and record limited scope and revocation. A code alone does not automatically demonstrate named family-only use or meet the children's privacy duties.
