# ADR-0024 — Foundation Source Universe and external-source challenge

**Status:** Proposed for Founder approval with the implementing PR  
**Date:** 6 September 2026  
**Decision owner:** Founder / Content Factory  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`; `80-company-workflows/Content Factory Requirement-Led Coverage Amendment.md`

## Context

PR #318 corrected a closed-world completeness defect by introducing independently source-led Curriculum Coverage and Exam Coverage Maps. A later fresh AI pre-review of the AQA A-level Business 7132 Foundation still found material quantitative omissions and a variance-convention contradiction because the new source-led profile itself did not include AQA's separate Formulae and key data resource.

The system had moved the completeness denominator upstream but still allowed a manually curated profile to act as the complete source universe. It could therefore prove 100% coverage of an incomplete denominator.

## Decision

Foundation completeness will have a third upstream assurance layer:

`Source Universe → Curriculum/Exam requirement universes → Course Truth/Exam Truth → deterministic/independent assurance → external-source challenge → qualified expert review`

For each exact course/cohort, Revision must explicitly declare and reconcile the official/authoritative source categories needed to establish curriculum, assessment, quantitative/practical and amendment truth. Missing required source categories fail closed before coverage completeness can be claimed.

Before a Foundation is described as ready for qualified expert review, a fresh-context external-source challenge must explicitly assume that Revision's Source Universe and requirement universes may be wrong and attempt to find omissions, contradictions or stale requirements using current permitted official/authoritative evidence.

## AQA 7132 consequence

The AQA 7132 / 2027 Source Universe must include, at minimum, the current specification/subject-content/assessment sources, the AQA Formulae and key data resource and the September-2023 specification-update notice. These awarding-body sources remain `REFERENCE_ONLY`; only controlled structured facts enter the Foundation process.

The quantitative alignment facts exposed by the formula guide become governed structured Foundation inputs, including the recommended variance convention, profit-margin calculations, market capitalisation, added value, return on investment and labour-turnover presentation.

## Assurance boundary

A passing curriculum/exam reconciliation is insufficient when the Source Universe is incomplete. Deterministic checks must reject missing mandatory source categories. Independent review must receive evidence that the Source Universe gate passed. The external-source challenge remains distinct from ordinary artifact review because its purpose is to attack the denominator itself.

## Historical evidence

Previous AQA Foundation candidates, proof runs and review packages remain historically accurate. They must not be rewritten to imply this Source Universe gate existed when they were produced.

## Documentation impact

This decision updates the active requirement-led coverage authority and requires implementation/technical documentation for source-universe discovery, rights classification, deterministic gating, external challenge and expert-package evidence.
