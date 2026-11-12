# Open-source adaptation economics pilot — Business 3.5, Business 3.10, Psychology Memory

**Status:** EXPERIMENTAL / NOT LEARNER-PUBLISHED / NOT EXPERT-APPROVED
**Date:** 2026-10-09
**Base approved main:** `f974631b907452375963a490a24e85b490c23949`
**Purpose:** Find whether actual, assessable A-level teaching *and assessment* assets can be made more cheaply by adapting properly licensed subject sources rather than authoring afresh.

## Scope and qualification versions

1. **Control, easy:** AQA Business **7132 §3.5**, last examined in 2027. Benchmark retained because it supplies a positive-control finance topic, **not** because prior investment makes it commercially preferred.
2. **Challenge, difficult:** Business **7132 §3.10**, also last examined in 2027; cross-map the relevant concepts to **7138 §3.3.4 Change** and **7138 §3.2.3 Business culture**, first A-level examined in 2028. Crucially, this is **not** a 1:1 mapping. In 7138, Kotter/Schlesinger's four resistance reasons and Lewin force-field analysis remain explicit, but Handy's four types, Kotter/Schlesinger's six interventions and total float/critical-path diagram manipulation are not separately named in those new sections. Check 7138 §3.3.3 and Annex 8 for optional/sophisticated concepts; never falsely label 7132-only requirements as mandatory 7138.
3. **Cross-subject:** AQA Psychology **7182 §3.1.2 Memory**, revised course first examined 2027.

Authoritative board check (REFERENCE_ONLY facts, never teaching prose): 
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/managing-strategic-change
- https://cdn.sanity.io/files/p28bar15/green/48dab3a84bc6cce76b4483b77516ab3a3edf3c77.pdf (7138 v1.1; pp. 28, 34, 39)
- https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification/subject-content/introductory-topics-in-psychology

## Assets and boundaries

Two separate draft learner-facing *research artifacts*:
- `MEMORY-EXPERIMENTAL-LEARNER-ASSETS.md`: topic lesson, **15** flashcards, **10** question quiz with feedback, **one original 16-mark** discussion question and experimental marking guide.
- `BUSINESS-310-EXPERIMENTAL-LEARNER-ASSETS.md`: 7132 §3.10 complete lesson, **15** flashcards, **10** question quiz, **one original 7138-aligned 15-mark Evaluate** question with a Revision-authored indicative marking guide. It clearly states 7132-specific concepts; never implies the 7138 question is an official AQA question.

These files are prototypes only. Nothing enters the learner runtime or publication pipeline. The marking guides are **not** AQA mark schemes or validated automated marking rules.

## Measurable provenance / cost model

Four-way labels (DIRECT / PARTIAL / EVIDENCE / NONE) remain *diagnostics*, never the headline metric. Every **finished asset** must report:

- **Source-derived share (semantic)**: ratio of finished instructional claims/explanation units traceable to eligible item-licensed source evidence. This measures subject-knowledge sourcing, **not** text reuse or production savings. Provide numerator/denominator and method. Do not call a source-covered fact verbatim reuse.
- **Verbatim or closely adapted expression share**: words copied/closely adapted from licensed source passages divided by finished asset words. If written independently, **0%**, irrespective of source-derived claim count.
- **Newly authored expression share**: remaining words constructed for Revision; authoring is still new work even if facts were previously known. **100%** if no wording copied.
- **Relative baseline saving**: only claim a saving after a comparable *from-scratch* asset of equivalent quality is produced and times/costs are measured. A low-literal-reuse output might still reduce source research and fact checking, but cannot evidence a time reduction by itself.
- **Measured provider/API spend**: actual logged invoice/token cost by production stage, currency and exact model. The interactive ChatGPT execution here does **not** expose billed API tokens/cost; record **NOT_MEASURED**, never £0.
- **Measured author/editor minutes**: real person/tool event measurement, timebox and edits. Not auto-inferred from file commit timestamps. Record **NOT_MEASURED** pending instrumented comparison.
- **Measured teacher review minutes**: explicit real teacher start/stop timings, reject/repair counts; record **NOT_MEASURED** pending review.
- **Accuracy**: independent blind review plus deterministic validation. Do not publish unreviewed content or claim confidence unsupported by tests.

Keep **source item** records distinct from book-wide rights. Each must retain exact URL/section, licence/profile, original creator, exceptions, licence-check date, AI input permission and attribution requirements. Prohibited/unknown third-party media is excluded. Sources that are REFERENCE_ONLY can supply bounded qualification facts only, not copyrighted source prose to a worker. No ShareAlike text adaptations without deliberate licence compatibility assessment.

## Key permissible subject-source items

- BCcampus Psychology H5P, *How Memory Functions*, https://opentextbc.ca/h5ppsychology/chapter/how-memory-functions/, page-specific **CC BY 4.0 except where otherwise noted**; no copied images/media.
- BCcampus Psychology H5P, *Problems with Memory*, https://opentextbc.ca/h5ppsychology/chapter/problems-with-memory/, page-specific **CC BY 4.0 except where otherwise noted**; no copied media or quoted third-party studies.
- Dalhousie, *Introduction to Psychology & Neuroscience*, https://pressbooks.atlanticoer-relatlantique.ca/intropsychneuro/chapter/how-memory-functions/; existing prototype register: **CC BY 4.0 except where otherwise noted**. Item rights should be refreshed before literal adaptation.
- LOUIS, *Introduction to Business Administration*, specific chapters `/chapter/management-and-leadership-in-todays-organizations/` and `/chapter/achieving-world-class-operations-management/`; existing promotion register: **CC BY 4.0 except where otherwise noted**. Third-party embedded artwork/examples excluded.
- BCcampus/open textbook *Accounting Principles: A Business Perspective*, https://open.umn.edu/opentextbooks/textbooks/383; promotion register: **CC BY 3.0**; concepts only unless exact passage separately verified.
- For *Handy's named four cultures* and *Kotter & Schlesinger's named framework*, treat the AQA specification as REFERENCE_ONLY for the requirement and use independently written explanations from open generic culture/resistance mechanics. Any purported verbatim re-use of these named frameworks requires a verified separately licensed item. Candidate CC BY article for Handy model: https://www.mdpi.com/2071-1050/18/3/1192 — **item-level rights check required** before material from the paper enters production.

Attribution for open works will be included with actual retained adaptations and licence links. The experimental assets below contain **original wording and original case studies**, so no third-party illustrations, tables, question text or official assessment wording are reproduced.

## Experimental ledger and interpretation

See `REUSE-MEASUREMENT-LEDGER.csv`. Rows start at evidence/measurement state; unobserved values are **NA**. Do not manufacture estimates from the fact that a source was found. A true measured source-reuse ratio requires either (a) deliberately marked, licensed passage-to-output lineage with automated token accounting, or (b) annotated claim-by-claim lineage separately from literal text reuse. Both must preserve source identity.

**Quality gate:** educational accuracy, item-level legal permission, board-version correctness, age suitability, marking reliability and qualified human review where governed are non-negotiable; no production acceptance from this research alone.

## Follow-on experiment

A separate agent run must produce a comparable from-scratch control version for the same output specification, capturing timed operator interventions, API usage/cost, independent findings, and qualified teacher review timing. This draft is not evidence of commercial savings. Defer scale decisions until the complete measurement matrix passes.

## Documentation impact

Research-only addition. No change to normative source-licensing policy, approved Content Factory steps, production code, technical implementation documentation, ADRs or historical evidence. If the experiment later justifies changing the factory, do so in a governed branch/PR with updated normative and implementation documents. Do not merge without explicit Founder approval.
