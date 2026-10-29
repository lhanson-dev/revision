# Issue #665 — Limited family test: controller pre-use assessment

**Status: DRAFT / NOT AUTHORISED FOR REAL CHILD DATA**  
**Prepared:** 25 October 2026  
**Purpose:** A proportionate, dated pre-use assessment and GO/NO-GO checklist for one Founder-controlled family test, **not** a professional legal opinion, public-launch approval, or proof of compliance.

## 1. Precisely bounded pilot

- **Purpose:** Assess whether the existing A-level Business 7132 and Psychology 7182 learner journeys (first use, Learn, Practice, Plan, original supported mocks, retained drafts and progress) are useful, reliable and educationally clear.
- **Intended people:** The Founder and one family learner (only). No school, outside student, test cohort, paid customer or invitation to the public is authorised. Do not put the minor's name, age, email or answers in this repository.
- **Canonical environment:** `https://lhanson-dev.github.io/revision/app/` and hosted Revision Supabase project `xwwhshpmeogswxfjtpvq` (EU West / Ireland). Public URL reachability is **not** evidence of admission; the hosted Supabase Before User Created hook must reject uninvited new accounts.
- **Start date:** UNSET pending controller GO. **End or review date:** UNSET pending controller decision. Terminate admission by disabling or rotating the private registration gate. Disabling signup does not automatically revoke existing sessions or erase existing records.
- **Accountable controller:** Founder acting in a personal capacity as an individual (confirmed 25 October 2026); not a registered company for this family test. Legal and private contact details are not published in GitHub. Lawful basis, specific use, household-exemption applicability, and remaining children's privacy controls have not been signed off. ICO guidance permits an individual to be a controller but reserves the household exclusion for purely private/household processing without professional or commercial connection. Do not assume it applies to a product-development trial.
- **Authorised invitation list:** Kept privately by controller, never in GitHub. Shared code is not identity verification and may be forwarded; keep distribution minimal and rotate on loss.

## 2. Processing and data map — verify against the deployed runtime

| Processing | Necessity for test | Known controls / limitations |
|---|---|---|
| Supabase Auth email, account identifier, login and first-name metadata | Create and sign in to the private test | Host authentication; new email signup hook rejects missing/forged code while gate disabled. Exact session, email confirmation and deletion operation for a real family learner not signed off |
| Selected A-level courses, exam dates, weekly availability, programme and progress | Personalised useful revision timetable | Learner-specific rows and role/RLS protections; cross-user verification required at activated revision/assessment version |
| Starting checks, Learn/Practice answers, marks, self-assessed responses and inferred strengths/gaps | Adapt practice and show honest progress | Evidence integrity tests exist; some inferred judgements could be inaccurate or stressful — cannot claim certified grade or prognosis |
| Unfinished original mock-paper answers, flags, timing and resume state | Recovery on interruption | Proposed owner-only REC-10 v2 policy still **not deployed**; original-creation anchored raw-draft cap 14 days, hourly cleanup, immediate answer scrubbing on confirmed submission in candidate. Existing scored evidence has a separate retention policy that is not established by 14-day raw-draft expiry |
| Authentication events, infrastructure logs, backup/PITR copies, browser telemetry and processing by suppliers | Diagnostics, operational reliability, recovery | Actual retention, data-rights treatment, processor terms, onward transfer and backup erasure limitations **not verified** |
| Any AI-assisted grading, inference or other third-party transmission | Only if the active learner flow actually uses it | Actual provider(s), payloads, onward use, transfers and opt-out mechanisms must be mapped before any use involving a minor; do not assert no AI transfer without evidence |

No marketing outreach, parent dashboard, cross-learner ranking, unrelated model training or sale/sharing of answers is authorised by this limited test. Reject processing beyond an educationally necessary purpose until assessed.

## 3. Child-centred DPIA / risk register (preliminary engineering assessment)

Ratings are a **provisional product/security judgement**, not approved legal conclusions.

| Risk | Starting concern | Evidence or planned control | Residual / decision |
|---|---|---|---|
| Internet visitor registers without invitation | High — public URL, potentially identifiable minor data | Hosted Before User Created hook; Founder observed exact “Private testing requires a valid registration code” denial on 25 October at 16:33; Auth logs independently recorded two matches. Gate currently **off**. | Positive valid-code signup, Google-new-user rejection and existing-user sign-in still unverified. KEEP HOLD |
| Minor's answers or readiness exposed to another account | High | Proposed owner-only RLS with non-anonymous Auth checks and local multi-user tests passed; production still has original four REC-10 pilot-claim policies. | Verify exact deployed owner-v2 RLS using two distinct synthetic users, restore/discard/resubmit and cross-owner denial. KEEP HOLD |
| Raw long-form answers retained beyond necessity | High | Proposed raw draft expiry anchored to creation (14 days), hourly deletion schedule and submission scrubbing; existing cron observed hourly. | Verify live deletion/scrub, backups/logs/PITR and scored-evidence retention separately; communicate residual copies. KEEP HOLD |
| Inaccurate educational profiling or grade inference | Medium–high | Evidence-strength and self-marking distinctions; original mocks not formal exam simulation | Confirm confidence wording, no high-stakes use and learner ability to question/reset progress during supervised test. OPEN |
| Shared code disclosed or account/session compromised | Medium–high | Strong generated server-only registration code, HMAC proof tied to email/time, existing-user password sign-in, same learner features for all admitted | Limit distribution, provide code rotation and incident response; Supabase warns breached-password protection disabled. OPEN |
| Learner cannot understand or exercise data rights | High | Draft plain-language privacy explanation below | Confirm working rights/erasure contact, support and verification/deletion route (including Auth vs learning evidence), child-accessible notice before invitation. KEEP HOLD |
| Supplier transfer, backup, logs or AI exposure not understood | High/unknown | Supabase project EU West / Ireland; no inference of backup or AI processing geography from region | Confirm actual subprocessors, DPA, configured retention, backup restore/erasure limits and any AI answer transmission; no real minor test while materially unknown. KEEP HOLD |

## 4. Provisional plain-language explanation to give the learner (not a published privacy notice)

> Revision is a test study website. It saves your courses, exam dates, revision activity, answers and progress so your study plan can adapt. If you start a supported mock exam and leave, the test version may save your unfinished answers for up to 14 days and let you continue. Your parent/test organiser can explain how to stop testing or ask about deleting your data. Revision's progress indicators are estimates for learning, not official exam grades. Please avoid putting private information about yourself or other people in written answers. The test is voluntary: you can stop at any time.

**This does not substitute for a complete privacy notice.** Before real use, include verified controller identity/contact, purposes, lawful basis, recipient categories, retention by data class, any overseas transfers, rights and complaint route in an age-appropriate location accessible to the learner and parent. Do not promise instant deletion from backups or complete automatic erase without proof.

## 4A. Read-only deletion-coverage investigation (25 October 2026)

Production PostgreSQL metadata check, without reading any learner records: **all 19 public tables with a `user_id` column have a direct `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` relationship** (19/19; none missing). This is strong structural evidence that deleting an Auth user will cascade to these identified learner-owned tables. It is **not** a verified end-to-end erasure workflow: the provider admin delete may fail, there may be other linked datasets, logs, backups, AI supplier copies, retained records or authentication constraints. Before the family trial, a supervised synthetic-account deletion should prove the real operational procedure and explicitly record residual copies, recovery window and response owner. No deletion or user modification occurred during this metadata check.

## 5. Minimum controller decision and acceptance evidence

The accountable Founder/controller must record a **dated GO / NO-GO** *outside public GitHub where child-identifying details would appear*, and a non-sensitive completion reference in Issue #665 when permitted. The following are outstanding unless supported by separately cited evidence.

- [x] Controller capacity: individual Founder, personally responsible (25 October 2026).
- [ ] Private contact, exact test scope, invitation log, fixed review/end date and code rotation/revocation route remain to be recorded.
- [ ] Article 6 lawful basis and necessity/proportionality considered and recorded; particular child risks identified and residual risks explicitly accepted or mitigated (professional advice if high unresolved risk).
- [ ] Parent- and age-appropriate learner privacy information shown before first real test; export/access/erasure and complaints contact works in practice.
- [ ] Supabase processor/DPA, region versus actual subprocessors/transfers, backups/PITR/logs retention and AI/data-transfer paths reviewed; no unsupported retention assurances.
- [x] Hosted negative missing-code signup rejected with observed 16:33 message and related Auth log evidence (Issue #665).
- [ ] Hosted forged/valid-code signups tested with synthetic identities, new Google OAuth account creation denied and pre-existing sign-in unaffected; synthetic account cleanup evidenced.
- [ ] Exactly intended testers admitted; no stored private registration secret in repository/browser logs or issue comments; avoid circulation or rotate after use.
- [ ] Production v2 exam RLS, expiry/cron and two-owner isolation verified; latest-head CI and live first-use/full learner journey accepted; no release marker set until evidence is recorded.
- [ ] Founder/controller explicitly authorises **real minor data processing for this limited test**, separate from PR #679 merge approval and later public-launch approval.

**Current decision: NO-GO for real minor data.** No automatic conversion of this engineering draft into Founder sign-off. The restricted infrastructure can be tested using synthetic identities while incomplete.

## 6. Incident and termination plan (verify operational ownership)

If the admission code leaks, disable or rotate the database registration gate, check Auth audit events, suspend invitations and investigate scope. Existing accounts/tokens are not automatically revoked by code rotation; separately sign out/invalidate affected sessions, suspend accounts if necessary, preserve necessary incident evidence, and assess notification duties. For a deletion request, verify identity, establish which Auth and learning records/backups are in scope, execute an approved deletion/export process and communicate exceptions/retention truthfully. The Founder/controller must name a real responder and escalation route before test start. Stop testing if the protection mechanism, answer isolation or retention is in doubt.

## 7. Sources and boundaries

- ICO individual controllers: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/what-are-controllers-and-processors/
- ICO household limitation: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/exemptions/a-guide-to-the-data-protection-exemptions/
- ICO Children's Code, DPIA: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/2-data-protection-impact-assessments/
- ICO children's rights/transparency: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/what-data-protection-rights-do-children-have/
- ICO DPIA template: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/annex-d-dpia-template/
- Internal governing references: `40-evidence-and-trust/Privacy and Student Data Principles.md`, `10-product-governance/Exam Session Recovery.md`, `50-engineering-standards/Security Standard.md` and `docs/technical/REC-10 Family Test Preflight.md`.
- Evidence: Issue #665 dated 25 October 2026 live negative signup check, merged PR #684 dormant admission migration, candidate PR #679 real-GoTrue CI #3639 and pending hosted/tester acceptance.

**Documentation-impact check:** This is a proposed current operational assessment, not a new normative authority, and creates no change to law, approved learning behaviour, permissions, or historical audit. Maintain alongside PR #679's technical release preflight. Do not close Issue #663 or represent this draft as external qualified legal/privacy review.

## Proposed change to admission scope — 26 October 2026

The Founder has now expressly requested standard account signup for the family learner **without** a private code. This **supersedes** the earlier proposed shared-code admission design if the implementing PR is approved and released. A publicly accessible application with self-service signup **cannot enforce a two-person-only population**; the "limited family" language in this record then describes intended participants and the controller's own trial, not an actual admission restriction. The earlier private-code checklist should not be used as an activation step. Keep data rights, learner transparency, safeguard/necessity review and risk disclosures open for real child data, while independent public-launch reviews remain under #663. No individual learner identity or secret should be added to the repository.
