# FI-001 — Programme-First First Candidate: Student-Value Gap Check

**Date:** 15 October 2026
**Scope:** Draft PR #636 from approved `main` `931bee72de204e1910c2ad4d6b5fa1c0d0c39873`.
**Decision:** This is a *candidate audit*, not production or educational acceptance. Do not substitute green CI for any unproven SV oracle.

## What is improved

- The canonical planner now computes a course/topic requirement decision joined to real authorised paper milestones, governed scored-evidence proxies and actual week capacities. The same decision gates the detailed task schedule and supports the longer-horizon display; the prior `weekly-focus.ts` topic rotation is no longer the Plan allocator.
- Month and Week can show exam-linked supported topic objectives and a human-readable evidence and treatment rationale even when no distant exact dated tasks have been booked. Distant objectives are provisional and accepted sessions remain learner choices.
- Bounded exact supported Start, paper-date cutoff, missing-input fallback and independent near-range saved-session reads are retained. An unknown required syllabus topic with no approved activity is now explicitly `unsupported-asset`, not silently marked covered.
- Draft pure domain test coverage targets unknown/scoped strong/weak evidence, capacity zero/low/unknown, real paper-dedupe/moves, competing courses, unsupported options and date-key stability.

## Red student-value acceptance gaps (must not merge while present)

| Frozen oracle | Current candidate review | Blocker / next technical work |
| --- | --- | --- |
| SV-01 | **Partial** | Genuine business syllabus mapping is now surfaced; distinct assured initial Learn treatment and progression into later authentic exam demand have not been demonstrated. |
| SV-02 | **Partial** | Candidate scored weakness categorisation changes the rationale, but there is not yet an assured prerequisite-based repair→application→retest pathway. |
| SV-03 | **Partial** | Multiple courses and deadlines are mapped, but coarse fairness and subject non-starvation across actual limited weekly capacity need counterexample tests. |
| SV-04 | **Partial** | Shared course/topic is deduplicated, distinct verified paper response skill obligations and later-paper practice remain to be modelled. |
| SV-05 | **Partial** | Week budget and exact-day safety enforced; 30-minute cross-course fairness and actual day fitting need real-content simulation. |
| SV-06 | **Partial** | Date-sensitive urgency stays in R1; sparse late-start exam demand tradeoffs need full journey proof. |
| SV-07 | **Partial** | No derived debt and accepted-session contract retained; missed-week rerun and five-view plan consequence need end-to-end fixture. |
| SV-08 | **Unverified** | New scored evidence and accepted-session history cannot be considered a tested ahead-of-plan adaptation until checked end-to-end. |
| SV-09 | **Partial** | Gap signal has reasons but no tested misconception-repair and independent confirm cycle; no invented grades allowed. |
| SV-10 | **Partial** | Secure state changes a treatment label; authentically supported high-order demand escalation remains unverified. |
| SV-11 | **Partial** | Deadline recomputation is deterministic; accepted work and paper-skill rerouting after moved exams require full scenario. |
| SV-12 | **Partial** | Unserved/no-time contract exists, but true remaining *required* exam skills vs scarce capacity and clear prioritisation require challenge cases. |
| SV-13 | **Partial** | Unknown exams preserve R1 immediate fallback; no fabricated time promised but Month partial plan/REV explanation requires browser check. |

**Cross-cutting gate:** authentic business and selected Psychology Paper 3 content/AO mapping, 13×five-view real-scenario checks, meaningful phases, realistic near-term preparation, held-out counterexamples, screen-reader/responsive, production usability, actual input-change sensitivities, permitted data semantics and performance comparisons. Record any essential absent published content/metadata as a blocking dependency, not an invented opportunity.

## Governance and documentation impact

PR #633 authority and Founder [programme-first Ready approval](https://github.com/lhanson-dev/revision/pull/633#issuecomment-6188330812) authorise this *implementation*, but not merge. Scope does not authorise new FI-009 spaced retrieval scheduling, FI-010/011 special tests or FI-012 special exam-soon mode. The implementation candidate updates `docs/technical/Adaptive Revision Planner Implementation.md`, the FI-001 backlog/Ready lifecycle and `90-governance-registers/Assurance Coverage Register.md`. R1-11 published-course assurance remains Partial in #621. No historical #629–#632 CI/release facts are reclassified or erased.
