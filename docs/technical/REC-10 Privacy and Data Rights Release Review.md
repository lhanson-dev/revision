# REC-10 — Privacy and Data Rights Release Review

**Status: OPEN — release blocker; technical preparation, not independent UK GDPR/legal approval.**  
**Review date:** 22 October 2026  
**Candidate:** PR #658, canonical learner route `/revision/app/`.  
**Product decision:** Founder agreed on 22 October 2026 to keep unfinished raw mock answers for a maximum of 14 days and to pause interrupted exam timers. Founder did **not** approve PR #658 merge or certify privacy compliance.

## Processing inventory and controls established by candidate

| Area | Confirmed candidate design | Independent release check |
|---|---|---|
| Purpose | Recover in-progress mock exam work and replay a frozen final submission, not marketing or AI training | Confirm privacy notice accurately describes purpose and data recipients |
| Personal data | Learner ID, course/paper/attempt metadata, authored written answers, section choices, flags, position, timing and temporary marking state | Confirm privacy impact/necessity and exact subprocessor access |
| Legal basis | **NOT DETERMINED / NOT APPROVED** in repository authority | Qualified reviewer to document Article 6 basis, balancing or consent conditions if applicable; no invented consent |
| Children's privacy | GCSE/A-level audience; authenticated learner ownership, RLS and least-privilege grants | Owner to document age-appropriate application, child's best interests, DPIA/Children's Code applicability |
| Active-row retention | Original attempt creation anchors <=14-day expiry; expired drafts are inaccessible to authenticated learners ahead of cleanup | Verify server-side guard, timezone, 14-day upper bound and conflict recovery against exact database code |
| Physical deletion | Additive `pg_cron` hourly DELETE candidate, including expired `submitting` rows | Production cron enabled and observed to execute successfully; live rows deleted on schedule |
| Final result | Frozen evidence records reuse stable IDs; raw draft answers/marks/flags/options cleared after successfully confirmed submission | Verify any raw answer text in frozen evidence, telemetry, logs or error monitoring; inspect actual payload |
| Explicit discard | Supported for unfinished drafts, not when actively submitting; accepted scored evidence is independent | Confirm the right to erase/export requests, identity verification and learner-facing instructions |
| Storage location | Candidate private Supabase PostgreSQL table protected by learner-scoped RLS | Verify DPA, controller/processor roles, subprocessors, region/transfers, production/backups access |
| Backups/deletion | **UNKNOWN** — project backup/archive and retention configuration not evidenced | Verify live, backup, PITR and log retention/deletion or beyond-use controls against provider contract |
| Security and incident handling | Strict course/paper scope, CAS against tab collisions, no standing anonymous draft access | Verify service account, privileged support paths, security incident escalation and logging minimisation |
| Privacy information | Short save/expiry notices are present in candidate Exam Prep/ExamSimulator | Review layered age-appropriate complete notice, controller contact, rights, recipients, retention and complaint channels |

## Founder-delegated product privacy triage — 22 October 2026

**Decision: CONDITIONAL PILOT / PUBLIC HARD STOP.** The Founder delegated the product-level privacy risk assessment for REC-10 and explicitly required a final review before unrestricted public availability. The engineering/product reviewer has chosen the following release stages; this is *not* an independent qualified legal opinion, a completed DPIA, an approval of student-data processing, a production migration authorisation or PR #658 merge approval.

| Phase | Product privacy position | Mandatory conditions |
|---|---|---|
| Synthetic/internal QA | Permitted | No real learner data; isolated synthetic environments, existing code/security gates, no real scored evidence |
| Restricted pilot with real learners | CONDITIONAL HOLD | Complete children's-data DPIA and risk mitigations; document the chosen Article 6 legal basis (not invented in this review), age-appropriate point-of-collection and full notice, data subject access/export/erasure procedure with accountable contact, backup/supplier processing scope, 14-day deletion and RLS production verification; record accountable controller's signed pre-pilot go/no-go and exact cohort boundaries |
| Public/unrestricted learner service | HARD STOP until independently signed | Obtain **fresh, independent, appropriately qualified privacy/data-protection review** of the whole learner app (not only exam drafts), clear material findings and record reviewer/date/evidence, then obtain governed Founder public-launch authorisation; track as `PUBLIC-PRIV-01` |

**Risk classification:** Inherent privacy risk is **material/high** because Revision is aimed at school-age learners, temporarily saves identifiable free-text examination work and derives educational evidence. The RLS, bounded retention, data minimisation and pause logic are good risk reductions, but residual risk **cannot yet be rated acceptable for live children**: Article 6 basis, DPIA, full notice, rights-handling, backup retention and a controller's accountable sign-off have not been evidenced. In particular, confirmation of a 14-day application-table deadline does not prove erasure from backups, audit/telemetry or frozen evidence.

**Authority consistency:** `Privacy and Student Data Principles.md` section 12 requires independent verification before production reliance. The new delegation is taken as permission to make the *product recommendation and phased process*, not permission to waive that existing higher-order requirement. A proposed section 12A amendment and `ACR-006` explicitly record this reconciliation for Founder approval when PR #658 is considered. A requested final review at public launch is **additional**; it does not legalise an unreviewed real-child pilot.

**Review references checked 22 October 2026:** ICO Children's Code DPIA and Code Standards; ICO data protection by design and by default (updated February 2026); ICO storage limitation, including backup consideration. These are regulatory guidance sources, not project compliance certification.

**Current decision record:** `REC-10-PROD-PRIV-01`: synthetic internal work may proceed. Production deployment, storage of real child written answers and pilot access **remain HELD until specific pre-pilot conditions are evidenced**. Final independent whole-product review is explicitly scheduled as a condition of public launch (`PUBLIC-PRIV-01`), rather than prematurely described as completed.

## External review and release evidence required

1. Before real-student pilot, the accountable controller signs a dated children's-data DPIA / pre-pilot assessment of purpose, Article 6 lawful basis, transparency, child risks and mitigation, with any qualified external advice required by the risk. **Missing; production student-data HOLD.** A fresh independently qualified complete-product review remains a **separate public launch hard gate**.
2. Publish or approve an age-appropriate privacy notice and learner rights pathway covering draft answers, deletion/export/access and caregiver requests where appropriate. Do not claim the app offers a tested in-product export/delete-all pathway if it does not.
3. Confirm Supabase contract/processing terms, backup/PITR retention, actual deletion-from-backup or documented beyond-use arrangements, logging/data residency, access by privileged operators, and whether an expired response could surface in other copies.
4. Verify nonproduction unit/pgTAP/browser security assurance on the exact PR head. After approved migration, verify the scheduler via `cron.job` and `cron.job_run_details`, actual response deletion and unchanged scored evidence, with a release-gate record. Never plant artificial child answers in production.
5. Inspect the frozen result/evidence payload for raw-answer retention outside the 14-day draft purpose; evidence may follow separate lawful retention only if genuinely limited to already-approved educational evidence.
6. Record reviewer identity/date, decision and remaining exceptions in the governed assurance register. If any item is unresolved, maintain **PR merge HOLD / no student-data deployment**.

## Relevant external guidance (research input, not substitute for qualified approval)

- ICO, Children's Code: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
- ICO, age-appropriate design standards including DPIA/transparency: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/
- ICO, children's data protection rights: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/what-data-protection-rights-do-children-have/
- ICO, lawful bases for children: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/how-do-the-lawful-bases-apply-to-children-s-personal-information/
- ICO, storage limitation and backups: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/

**Documentation impact:** This is a dated technical/privacy evidence checklist under `docs/technical/`, not a new legal/normative policy. Product norm is `10-product-governance/Exam Session Recovery.md`; privacy candidate authority is `40-evidence-and-trust/Privacy and Student Data Principles.md`. Do not rewrite historical audits. Future signed decisions belong in approved governance/assurance records in the same governed PR or a dependent PR before release.

## Release risk closed in candidate: authenticated users outside the pilot

Review of the original schema identified a **high-severity latent exposure**: unrestricted authenticated users could save raw examination answers once the new backend became active. This violated the staged, conditional pilot scope even though RLS prevented cross-learner access. The new candidate requires both signed `app_metadata.revision_rec10_pilot === true` and matching record ownership in the database for every CRUD operation; canonical student UI also hides persistence for nonpilot accounts. The exact real-account production-equivalent pilot/nonpilot browser boundary must be tested before approval. The account administrator must not issue cohort flags until a pre-pilot privacy go/no-go is recorded. The broader required DPIA, lawful basis, parent/child notice, rights request channel, backup/PITR contracts and public `PUBLIC-PRIV-01` review are not satisfied by this engineering correction.
