# REC-10 — Narrow Founder family-test preflight

**Decision status (23 October 2026): TECHNICAL CODE MAY MERGE FOLLOWING FOUNDER PR APPROVAL; REAL-STUDENT ACTIVATION IS PENDING.** This is a pre-test working checklist, not legal advice, an independent report, account enrolment or evidence that the test is currently live. The Founder requested a private test with their son before any public rollout.

## Minimum test boundary and benefits

- **Tester scope:** Founder and one specifically authorised family learner only. No automatic user enrolment or invitation to other students. Any expansion requires a new documented review.
- **Purpose:** assess whether full-paper answers survive refresh/interruption, are restored correctly, are scored honestly and lead to useful educational feedback. Not marketing, profiling, advertising or general external-model training.
- **Where:** canonical `/revision/app/`; production has one Supabase project and no independent family-test backend. Ordinary students remain blocked from REC-10 persistent drafts by verified Auth `app_metadata.revision_rec10_pilot` + RLS. Under-18 use is not assumed legally exempt just because the tester is the Founder's son.
- **Data:** only necessary account ID, paper details, answers/selected choices, progress position, timer/marking fields; original attempt anchors the 14-day maximum before scheduled purge; completed raw drafts scrub on confirmed evidence. Keep child contact/identifying details out of written answers and avoid sensitive content.

## Founder/controller pre-test record — complete before enabling a real learner

| ID | Check / evidence to fill in | Current status | Recorded decision/owner |
|---|---|---|---|
| FAMILY-01 | Name accountable data controller/owner, authorised learner identity (keep personal identifiers in an access-controlled location, **not** a public repo), bounded trial purpose and planned end date | OPEN | Founder/controller to complete |
| FAMILY-02 | Concise child-centred DPIA: processing, necessity, child's best interests, risks and safeguards, remaining risks, proportionality, any necessary advice and dated internal sign-off. Consult ICO Children's Code DPIA guidance. | OPEN | Founder/controller to complete |
| FAMILY-03 | Record the applicable Article 6 lawful basis for each real-data purpose (consent is **not** automatic; parental involvement alone is not a basis), rights/withdrawal arrangements as appropriate | OPEN | Founder/controller to complete |
| FAMILY-04 | Give the child a short understandable notice before collection: what is saved, why, who can access, up to 14 days, when it is deleted, and a verified practical contact for data access/deletion/export | OPEN | Founder/controller to complete |
| FAMILY-05 | Confirm actual Supabase region/processor terms, access to backups/PITR, data retention beyond the live table, system logs and any onward AI transmission; document residual risk and workaround | OPEN | Founder/controller/Engineering |
| FAMILY-06 | Engineering exact-head test green; admin-issued **separate** pilot Auth claim; verify named account allowed, ordinary/test account denied, no child data in CI; actual table/RLS, release-readiness contract and hourly `cron.job` + run details | OPEN | Engineering/release |
| FAMILY-07 | Prove safe deletion and confirmed preservation of independently justified scored evidence in isolated tests; ensure a real manual erasure-request path works and revoke claim when trial ends | OPEN | Engineering/privacy owner |
| FAMILY-08 | Dated pre-test GO/NO-GO, review of residual risks, scope and how incidents will be handled. Document narrow approval in governed evidence without public personal identifiers | OPEN | Founder/controller |

**Go/no-go rule:** This is a *proportionate internal review*, not a requirement to buy an independent legal opinion merely to test one limited feature. If unresolved high risks cannot be mitigated, do not collect the child's data until appropriate qualified advice or ICO consultation resolves them. An approved code merge or green CI is not an approval of this checklist.

## Release sequence and separation

1. Obtain explicit Founder approval for the exact assessed PR #658 change; obey exact-head CI/merge gate. Outstanding independent public-launch reviews remain logged OPEN and are **not** by themselves merge blockers.
2. Confirm backend-ahead additive migration and retention scheduler can safely be enabled without breaking the existing production contract; apply through the normal governed path and observe actual execution before claiming saved answers work.
3. Complete FAMILY-01…08, including child-facing explanation and the internal signed review. Only then grant the named family learner's **server-owned** `revision_rec10_pilot` metadata; refresh Auth session and check real allowed/denied learner journeys.
4. Monitor save/resume/marking reliability, reported incidents, deletion and education correctness. Remove the cohort claim and follow deletion/retention rules at trial end.
5. Log the trial's findings separately. Before public availability, close the whole-service go-to-market register (especially independent `PUBLIC-PRIV-01`) and obtain a separate Founder public-launch decision.

**External resources for the accountable reviewer:** ICO [Children's Code DPIA](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/2-data-protection-impact-assessments/); ICO [children's lawful bases](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/how-do-the-lawful-bases-apply-to-children-s-personal-information/).

**Documentation impact:** This is a current technical/governed checklist, indexed from `INDEX.md`, supporting normative Release & Deployment Standard, Privacy and Student Data Principles, and Exam Session Recovery. It does not rewrite prior audits or purport to supersede approved main before PR #658 is merged.
