# Issue #698 — Business 7132 source-to-learner correction slice

This is an implementation note, not educational sign-off for either whole course.

## Exact source and rights
Business: user-supplied AQA 7132 PDF v2.0 (14 June 2023), SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`.
Psychology: user-supplied AQA 7182 PDF v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`.
The binary hashes were independently checked against files accessible in the conversation on 28 October 2026. The version-bound metadata and structural paper/section references are in `research/specification-to-learner/aqa-2027-source-manifest.json`. Both PDFs remain `REFERENCE_ONLY`; their protected prose is not a generation corpus.

## Implemented learner-content correction
The existing Fast-Path node `bus-evi-008` is delivered through `content/business/aqa-a-level/shared/learn.ts` and the ordinary validated AQA 7132 content packs, not through a new site route.

- Learn: an original, fully numbered activity-on-arrow example demonstrates the zero-duration dummy and AND-join, forward/backward event times, total float and critical path; it then recalculates the network after a duration change.
- Practice: the existing construction item `p-construction-activity-on-arrow` now asks for all arrows, event times, float, and the critical path, rather than just a vague drawing description. The new `p-amend-activity-on-arrow` asks for a recalculated path and float after a changed activity duration.
- The new example uses event times `(0/0),(2/2),(5/6),(6/6),(8/8)`, original project duration 8 days, C float 1 day; after C rises to 5 days, times `(0/0),(2/2),(7/7),(7/7),(9/9)`, new project duration 9 days and B float 1 day. These are mathematical cross-check fixtures, not official AQA questions.
- Learner evidence caveat: existing Fast-Path question prompts are currently delivered as answer-reveal flashcards. The revised task makes the construction demand explicit, but **does not establish a graded diagram editor or automated drawing competency evidence**. Progress must not infer performance from revelation of the model response.

## Assurance and acceptance boundary
The original AQA PDF section 3.10.3 (physical PDF page 31) calls for understanding/interpreting network diagrams, amendment, critical path and total float. This slice directly addresses those four demands. The numerical routes and backward/forward formulae were independently recalculated during preparation; full repository CI and real-user browser acceptance have **not** been executed or verified in this connector session. Educational independence and appropriate qualified reviewer approval are not established by this document.

**Current outcome:** one targeted Business Learn/Practice correction proposed for review, not live. No Psychology content or planner code changed. Remaining Issue #698 requirements, full atomic mapping, gap remediation, educational review, learner-site tests and release verification remain open. No provider spend incurred for this slice. Documentation impact: this current implementation evidence note; no changes to the governing Content Factory workflow or learning authority.
