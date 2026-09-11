# FI-018 — Teacher and School Insight — Reactivation Record

**Document type:** product-management feature record  
**Authority:** non-authoritative backlog material  
**Feature:** FI-018  
**Lifecycle state:** To Do (reactivated from Parked by Founder direction on 24 August 2026)  
**Captured originally:** 20 August 2026  
**Reactivated:** 24 August 2026  
**Owner:** Product / Founder  
**Implementation status:** Not started  
**Authority context:** `10-product-governance/Subscription Plans and Entitlements v0.5 Amendment.md`

## Product decision

Founder direction on 24 August 2026 establishes that Teacher and School capability belongs in Revision as a deliberate future product/commercial workstream.

This reactivates FI-018 from `Parked` to `To Do`. It does not approve implementation and does not move FI-018 to `Analyse`, `Ready` or `In Progress`.

## Teacher job

The Teacher product is not primarily about assigning Revision work.

Its primary job is to help a Teacher understand Student learning evidence across a class or individual Student so the Teacher can decide where teaching or intervention will have the most value.

The intended Teacher proposition is:

- identify where a class is strong or weak;
- identify where an individual Student may need support;
- understand patterns across specification areas;
- use coverage, understanding and readiness signals where supported by evidence;
- decide what teaching, reteaching or individual intervention deserves attention; and
- later use REV to interpret the evidence and support those decisions.

Revision must not become a general-purpose LMS, homework-management product or full lesson-generation suite by default.

## School concept

School is an organisation, not a fourth user type.

A School may contain Teachers, classes and Students and may act as the Payer for institutional capability.

Teacher and School payment routes must remain independent from the Student/Parent consumer route. A Teacher or School must not require Parents to purchase a consumer subscription for Students to participate in ordinary Teacher/School use.

## Teacher Free direction

Teacher Free should provide a genuine trial of the Teacher proposition with:

- **one active class**;
- Student invitations/linking into that class;
- class-level strengths and weaknesses;
- individual Student drill-down within the approved Teacher-visible evidence boundary; and
- coverage, understanding and readiness signals where supported by evidence.

The Free boundary should be simple and obvious: **one active class**.

Do not invent artificial limits on ordinary reports or class screens merely to create upgrade pressure.

Teacher Free does not include Teacher-facing REV analysis unless a later governed decision explicitly changes that rule.

## Teacher Paid direction

Teacher Paid should unlock clearly named professional-use capabilities rather than vague `deeper insight`.

The intended Paid direction includes:

- multiple active classes, with the exact allowance approved later;
- cross-class analysis where approved;
- on-demand Teacher REV analysis of structured class/Student evidence;
- REV support to identify class teaching priorities; and
- REV support to identify individual intervention priorities.

Teacher Paid does **not** automatically give Paid/Premium Student subscriptions to every Student taught by that Teacher.

## Teacher Premium direction

Premium must include a qualitatively different Teacher capability rather than being only Paid with a higher class count or larger REV allowance.

The intended Premium direction is **proactive Teacher REV intelligence**, subject to later Definition of Ready. Candidate capabilities include:

- proactive recurring weak-area detection;
- cross-class pattern detection;
- priority-change alerts when Student evidence materially changes;
- intervention follow-up, including whether an area appears to have improved after support; and
- scheduled teaching-priority briefs derived from approved evidence.

Exact Premium capabilities and allowances remain unresolved and must be explicit before implementation.

## Subscription clarity rule

Every Teacher tier difference must be either:

- a named capability; or
- a defined, user-meaningful allowance such as active classes or REV analyses.

Words such as `deeper`, `richer`, `advanced` or `more` are not sufficient entitlement definitions on their own.

Exact numeric limits may be agreed and amended later through governed product/commercial decisions without redesigning the feature architecture.

## School-paid direction

A future School proposition may fund:

- multiple Teachers and classes;
- School administration and reporting;
- Teacher Paid/Premium capability; and
- separately approved Student entitlements for some or all Students.

School pricing should not be assumed to be per Teacher. Student-scale and REV/AI cost are material and must be modelled before School pricing becomes approved authority.

A Student should retain one Student account and one underlying learning/evidence history even when School-funded and Parent/personal entitlements coexist.

## Teacher REV architecture/cost direction

Teacher REV should use structured deterministic Student/class summaries where possible rather than sending raw histories for whole classes on every query.

Before FI-018 is `Ready`, define a Teacher/School REV cost model distinct from Student REV allowances, including heavy-use and whole-class analysis behaviour.

Do not promise unlimited high-cost REV usage across a School until measured economics support it.

## Student-first sequencing rule

FI-018 must not block agreement, implementation or testing of the initial Student experience. The Student product must remain independently useful and testable on Free without Teacher or School participation.

## Definition-of-Ready areas

Before `Ready`, resolve at minimum:

- Teacher-visible Student evidence and privacy boundary;
- class membership/invitation model;
- exact Free one-class experience;
- Paid active-class allowance;
- named Paid REV capabilities and allowance;
- named Premium proactive REV capabilities and allowance;
- School organisation/account model;
- Teacher-paid versus School-paid lifecycle;
- School-funded Student entitlement rules;
- overlapping personal/Parent/School entitlements;
- Teacher/School AI cost envelope and pricing model;
- measurement and adoption hypothesis;
- technical feasibility and class-scale performance;
- safeguarding, security and access assurance; and
- journey, persona, commercial and technical documentation impact.
