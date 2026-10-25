# Issue #665 — Private learner-testing activation preflight

**Status: OPEN (negative hosted admission test passed; positive admission and controller sign-off pending), 25 October 2026.** This replaces the historical REC-10 pilot-claim onboarding checklist when the unified-feature PR is approved. It is not evidence of live activation or privacy sign-off.

## Feature model
Every ordinary non-anonymous authenticated learner uses the programme-first planner, published Business 7132 / Psychology 7182 Exam Prep and supported mock recovery by default. No FI-001 or REC-10 per-user feature claims or administrator privileges. `learner_exam_attempts` retains owner-only RLS, creation-anchored 14-day expiry, hourly cleanup, pause-on-interruption, immutable course/paper/attempt identity and post-submission raw-answer scrubbing. The backend must advertise `r2-exam-attempt-open-v2` before the frontend is deployed. Anonymous Supabase Auth sessions are not eligible; owner RLS explicitly checks `is_anonymous` as well as `auth.uid()`.

## Admission and pre-use activation — all OPEN until separately evidenced

| ID | Required evidence | Status |
|---|---|---|
| ADMIT-01 | Hosted Before User Created hook is active for tested email signup: Founder saw `Private testing requires a valid registration code` at 16:33 UTC; independent Auth logs showed two corresponding denials and no recent new registrations. With secret gate disabled, unauthorised signup was rejected. This is **negative test only** | NEGATIVE SIGNUP PASS / POSITIVE TEST OPEN |
| ADMIT-02 | Hook invocation verified by hosted negative test while gate disabled. To complete: controller GO/NO-GO, securely activate shared code, synthetic valid-code and forged-code signups, new Google user denial and existing account sign-in. Do not infer full admission from a single negative test | PARTIAL — POSITIVE/HOSTED OAuth EVIDENCE OPEN |
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

### Release fail-closed marker

The Pages `backend-readiness` job now requires repository variable `REVISION_PRIVATE_ADMISSION_VERIFIED=true`, set **only after** hosted Auth hook attachment, secret gate activation, unauthorised/authorised live synthetic signup checks and private processing controller GO/NO-GO. This is an operational release record and not a per-learner entitlement; it does not grant access, and setting it without the actual provider control proves nothing. Until verified, the automatic frontend deployment fails closed. Clearing the variable immediately blocks new releases, although it is not a revocation mechanism for an already deployed site; revoke/rotate admission using the provider control.

**Assurance expectation:** the dedicated CI job `Real Auth private signup admission assurance` must pass. It enables the hook on a disposable local Supabase instance, checks missing/forged/valid code behaviour and ordinary learner sign-in. Live hosted Auth negative/positive admission verification remains a separate release prerequisite.

### Production backend reconciliation (25 October 2026)

The dormant private-admission schema from merged PR #684 is present and verified with `enabled=false`; it does **not** yet enforce signup. The owner-only exam-policy migration remains uninstalled and is now ordered after that production migration as `20261025120000_standard_learner_exam_attempt_access.sql`. Hosted hook configuration and the accountable controller's real-minor pre-use decision remain open. Passing local Auth tests does not close ADMIT-02 or FAMILY-06.

### Pre-use controller assessment (draft; no sign-off)

A child-centred proportionate first-pass assessment, with the purpose/data map, residual risk register, planned learner explanation and controller GO/NO-GO fields, is in `docs/technical/Private Family Test Pre-use Assessment.md`. It identifies unverified lawful basis, processing entity, data-rights route, supplier/backup/AI flows, pilot review date and live owner-v2 data protection. **None** are marked passed on the basis of a local test or the Founder merely selecting private admission. The negative signup result is recorded on Issue #665 with the observed 16:33 UTC log evidence, without personal identifiers or code exposure.
