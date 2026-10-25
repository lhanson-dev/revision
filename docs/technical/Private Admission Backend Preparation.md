# Issue #665 — Private admission backend-ahead release

**Status: governed release candidate; not an active private admission control.**

## Scope and compatibility
This is a **dormant infrastructure-only** prerequisite of the Founder-selected private tester admission implementation in Issue #665 and its frontend/unified learner feature PR #679. Merging this backend-only PR does **not** alter the active Auth signup policy, existing sign-ins, the live learner UI, the FI-001/REC-10 feature gates or the four current exam-attempt RLS policies.

The migration `20261025110000_add_private_registration_admission.sql` installs `revision_private.family_signup_control` and `public.revision_before_user_created(jsonb)`. The control starts with `enabled=false`, with a project-local randomly generated 128-bit code that must never be printed in public logs, copied into source, or posted to GitHub. Public/learner database roles cannot read the secret or execute the Auth hook. Only `supabase_auth_admin` has the controlled permissions required for the hooked SQL path. Direct pgTAP assertions verify privilege boundaries and proof rejection/acceptance logic; PR #679 separately proved actual isolated GoTrue Auth hook invocation.

## Boundaries
**The migration must not enable, attach, or activate the hosted Supabase Auth Before User Created hook.** Supabase's hosted hook is a provider-level Auth setting, separate from SQL and **not available through the connected Supabase management actions**. The existing registration route remains open on production until the hosted hook is installed and verified. A database migration is not evidence of a family-only admission boundary.

Do not activate the secret gate, share the code, sign up real children, relax exam draft RLS, set `REVISION_PRIVATE_ADMISSION_VERIFIED` or merge PR #679 as a side effect of this infrastructure step. The separate controller pre-use child-data decision and private admission live negative/positive tests remain outstanding. The public launch requirements tracked under Issue #663 are not waived.

## Governed sequence
1. Merge this narrowly scoped PR **only after explicit Founder approval for this specific PR**, with exact-head CI and independent release checks.
2. Apply the migration to the production Supabase project through the governed migration mechanism and verify that the function exists, the secret gate is **disabled**, and existing release readiness/old exam RLS remain unchanged. Record the applied migration and read-only evidence under Issue #665.
3. Configure Supabase hosted Auth → Hooks → Before User Created to use `public.revision_before_user_created` after a checked operational plan. With the gate still disabled, all new signups will be denied; this is a deliberate planned temporary restriction, not permission to process real child data.
4. On the accountable controller's documented pre-use GO/NO-GO, securely distribute the server-generated code to intended private testers and activate it. Verify denied missing/forged code, valid synthetic email signup, existing login and new OAuth-account denial against **hosted** Auth. Rotate or disable if compromised.
5. Verify exam backend v2, owner isolation, retention and cleanup; only then progress PR #679 through its separate explicit Founder approval, gated production deployment and full 14-step learner acceptance.

## Documentation impact
This PR changes the **backend implementation only** and adds its current technical staging record and assurance. It does not amend product policy, authorise private tester enrolment, or supersede existing normative restrictions. The proposed normative updates to make all ordinary learner features universal are retained in PR #679, not silently promoted here. Historical audits and research are unchanged.
