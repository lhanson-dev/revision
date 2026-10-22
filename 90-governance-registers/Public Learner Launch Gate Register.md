# Public Learner Launch Gate Register

**Status:** Proposed new current-state governance register in draft PR #658; not approved `main` until Founder-authorised merge.  
**Scope:** Unrestricted/public launch of the Revision learner product, distinct from an informational marketing site or isolated synthetic internal QA.  
**Owner:** Founder for final public launch go/no-go. Qualified independent privacy reviewer for the privacy report.  
**Update rule:** A release gate can change to PASS only on documented, dated, verifiable evidence. An AI opinion, developer test, review intention, product-policy delegation or pilot approval cannot satisfy a required legal/privacy review.

| ID | Gate | Blocking scope | Status | Evidence needed to close | Accountable owner |
|---|---|---|---|---|---|
| PUBLIC-PRIV-01 | Independent final privacy and data-protection review | **Hard stop before unrestricted public learner availability** | **OPEN / NOT APPROVED** | Current, independently authored qualified report on full live learner service; UK GDPR/Children's Code applicability and DPIA; lawful bases; children's interests and age-appropriate notices; rights access/export/erasure; AI suppliers and onward transfers; authentication and supporter access; raw-answer/evidence retention including backups/logs; incident response and safeguarding data boundaries; implementation fixes verified; reviewer/date/exceptions; explicit Founder public-launch decision | Independent qualified reviewer and Founder |

## Phase separation and interim REC-10 decision (22 October 2026)

The Founder delegated the **product** privacy risk recommendation and asked to reserve a definitive review before opening the product to the public. The REC-10 product decision is **conditional controlled-pilot suitability only** after minimum lawful-processing and child-data controls are documented and the accountable controller signs its pre-pilot DPIA and residual-risk position. The automated exam recovery code and its stored raw answers **must not be activated for real students** until that condition, backend migration integrity and specific PR merge approvals are satisfied.

**Not waived:** Existing `40-evidence-and-trust/Privacy and Student Data Principles.md` section 12 still requires legal/privacy verification before production reliance. A final independent review at public launch adds a stronger second gate; it is not permission to run a legally unassessed pilot. The proposed authority reconciliation is tracked in `ACR-006`. No actual privacy reviewer has been appointed, no full-product privacy report exists in the repository, and no public-launch date or final approval is assumed.

## Release operations

Before approving public learner launch, release management must explicitly query this register; if `PUBLIC-PRIV-01` is OPEN, mark the decision **NO-GO**. Evidence must be retained in a governed PR and register updated with reviewer identity, review date, report location, material findings, remediation verification and explicit Founder public-release authorisation. A PR that alters this gate must itself comply with the Founder merge rule.

Other launch conditions (educational acceptance, accessibility, pilot findings, reliability, content and commercial readiness) remain separately governed and are not overridden by this privacy register.

### REC-10 cohort gate and public release separation — candidate follow-up

The proposed PR #658 restricts durable exam drafts by server-signed Auth `app_metadata.revision_rec10_pilot` *plus* owner RLS. This technical measure permits staged testing **only when** the separate documented pre-pilot privacy review has actually approved a bounded real-student cohort. It neither closes `PUBLIC-PRIV-01` nor grants broad public feature eligibility; public cohort unrestriction needs a new governed decision after independent qualified final review.
