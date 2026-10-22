# Exam Session Recovery — REC-10

**Status:** Founder-approved product rules, 22 October 2026; proposed normative authority effective only upon governed PR #658 merge. Not a claim of production availability.

## Student contract
An authenticated learner undertaking a supported full mock has an exact course, paper, option and assessment-version scoped saved attempt. While unfinished, last *confirmed* answers, section choices, position, flags and marks are restored. A draft does not create marks, coverage, understanding or a completed activity. Finalised scored evidence remains in the existing learning-evidence system.

When a browser refreshes, closes, crashes, sleeps, loses network connectivity or goes into the background, an interrupted attempt returns **paused** at the last safely confirmed state. It does not continue timing invisibly or receive fresh exam time automatically. A student deliberately chooses to continue, subject to course/paper/content validation. Explicit Pause also stops timing where the mock mode permits.

Elapsed examination time consists only of confirmed active-session intervals. The implementation sends active checkpoints around every five seconds and stops crediting time after a gap of 15 seconds; it must never reconstruct an unknown inactive interval as active time. Network/save failure blocks any claim that the latest work or timer increment was saved. Multiple tabs use revision-checked ownership so stale changes cannot overwrite newer work.

An interruption is permanently marked on the mock result, including the full-paper evidence record, and the student sees in plain language that an interrupted mock is **not equivalent to an uninterrupted timed paper**. This marker survives submission retry and later result review. The system does not claim formal examination conditions or proctoring.

## Privacy, retention and learner control
Raw written answers, objective choices and marking drafts are needed only to let the learner continue unfinished work. They are learner-private and never disclosed to supporters, other students or unrelated AI training/marketing systems.

Raw mock draft storage expires no later than **14 calendar days from original creation**, never extended by reopening or editing. The backend must automatically remove expired drafts (hourly cleanup is acceptable); an expiry field without actual deletion does not satisfy this rule. Students can deliberately discard an unfinished attempt without removing separately accepted scored evidence. They must be told at the point of use why answers are saved and when they expire.

After final evidence writes are confirmed, the checkpoint removes raw answers, selections, flags and marking inputs; only minimal frozen non-answer evidence identities and the result remain briefly for idempotent display/retry, themselves capped by the original 14-day expiry. Pending partial submissions must be retried using fixed identities, not silently treated as successful. Any unsettled recovery state approaching expiry is a release risk and must be explicitly assured. Existing educational evidence follows its separate established retention rules.

Access is enforced by authenticated learner-owned database policies, immutable course/paper scope, controlled conflict handling, and server-side expiry. These product decisions do not constitute an independent legal opinion on the full privacy notice, legal basis, rights/export handling, backups or safeguarding; those obligations must be verified before production activation under the Privacy and Student Data Principles.

## Staged privacy acceptance (Founder product direction 22 October 2026)

The product owner is authorised to make an interim **product-risk recommendation**, not to certify legal compliance or approve repository merges. Synthetic internal engineering tests are permitted. Before **any real-student pilot** creates persistent draft records, the accountable controller must document a child-centred DPIA/risk review, lawful processing basis, age-appropriate notice, access/export/erasure channel, supplier and backup risk, and deployment/readiness evidence, and explicitly authorise restricted cohort processing. Missing evidence means the raw-answer feature stays off.

A **fresh, independent, qualified privacy/data-protection review of Revision's complete learner service** is mandatory before unrestricted public learner availability. It must be signed off in `PUBLIC-PRIV-01` and must not be inferred from REC-10 pilot clearance. This phased approach refines review timing but does not waive the general independent/legal verification requirement in `40-evidence-and-trust/Privacy and Student Data Principles.md`. It is a proposed change on draft PR #658, not approved `main` until governed merge.

## Release and acceptance
Work only in the canonical learner route /revision/app/ (ExamPrepSection/ExamSimulator). Preserve supported pilot restrictions and existing AQA Business 7132 / Psychology 7182 paper and syllabus-option boundaries. Use branch PR governance and exact-head automated tests plus controlled browser/database evidence. Update the technical implementation record and registers in the same PR. Founder approval of these rules is **not approval to merge PR #658**.
