# #698 / #787 — Psychology Issues and Debates V2 single-decision checks

**State:** draft educational candidate, 3 November 2026. **Not independently A3 approved, not merged or live.** No full-course acceptance claim.

## Source, routes, and bounded defect

Founder-supplied exact AQA A-level Psychology 7182 specification v1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, §4.3.1 printed pp21–22. **REFERENCE_ONLY** rights: original scenarios and author-written choices/feedback; no verbatim exam question or long protected AQA passage in the repository. Source checkpoint inventory: `PSY-7182-431-B01` and `PSY-7182-431-B04`, in the existing six-source-bullet Issues and Debates record. The parent-bullet crosswalk does not substitute for independently decomposed individual conceptual skills.

Canonical authenticated runtime: `/revision/app/#/courses/aqa%3Aaqa-a-level%3A7182/practice/issues-and-debates-in-psychology`. Shared course content is served through the three existing `content/psychology/aqa-a-level/paper-{1,2,3}/index.ts` packs, `shared/course.ts`, content adapter and existing Practice question pool. **Issues and Debates belongs to Paper 3**, not to each paper simply because common Learn/Practice assets are shared. No parallel service, planner or marking system is introduced.

The dated 2 November LF-03 source audit flagged identical multiset answer choices on previous concept-template `PSY-08-01` (gender/cultural bias and universality) and `PSY-08-04` (holism/reductionism). These patterns invite superficial positional/concept recognition rather than distinctly meaningful application. This is a question-quality defect, **not** evidence the underlying published answers were necessarily factually incorrect.

## Candidate change and assurance boundary

Two original context-dependent single-best-answer items `psy-psy0801-check-v2` and `psy-psy0804-check-v2` separately address:

1. Unjustified universal generalisation from a narrow study sample, with careful distinction between poor generalisation and proof of cross-cultural difference.
2. Biological reductionism, its methodological usefulness and limits when wider environmental/social context matters.

Both are one-mark software-marked choice decisions. They do **not** independently validate students' written AO2 application, AO3 extended evaluation, every named §4.3.1 concept, or full Paper 3 exam performance. The other four existing Issues and Debates MCQs remain unchanged and not educationally adjudicated. Do not use this limited A3 candidate to close #698 or #787.

### Historical integrity and entry-point checks

The old six-item pool stays reconstructable only for matching older owner-scoped saved Practice fingerprints. `psychologyLegacyIssuesDebatesQuestions` retains the old exact prompts, option order and keys; `legacyIssuesDebatesPool` switches **only** the two new V2 identities back to their old versions for the compatibility attempt. Unknown fingerprints, different topics or a different qualification fail closed. Old raw selected options, original marks and activity history are never rewritten; old `psy-psy0801-check` and `psy-psy0804-check` evidence is excluded only from **newly derived Psychology 7182 learning inference**, not from historical display or unrelated subjects. New V2 responses are limited topic-level evidence, not proved source-atom mastery.

Dedicated candidate regression asserts the exact current three-pack question content, six unchanged source-bullet locators, present correct-answer indices, distinct current options, concrete Practice conversion, historical-score/inference distinction, source-limited six-question checkpoint recovery and fail-closed unknown drift. These are **tests authored with the change**, not substitutes for unbiased external review. No database migration or normative behaviour change is proposed.


### Dated CI reconciliation (3 November 2026)

Initial candidate head `18463b43fb30818ef237c728306c4284a9742d52` failed [full CI #41603034380](https://github.com/lhanson-dev/revision/actions/runs/41603034380). **Actual failure** was four outdated version/quality contracts: `psychology-launch-assurance.ts` looked up the two old question IDs; the #698 source-to-performance test expected unversioned keys; the global LF-03 pattern-count threshold expected at least ten repeated groups when one had been repaired; and the course test mistakenly asserted Attachment wording for the new Issues and Debates questions. Seven other main CI jobs including actual responsive browser checks, Auth and DB/RLS passed. These historical failed results remain recorded.

The branch then updated the two exact ID contracts without relaxing the all-118 requirement/three-pack evidence checks, restricted the Issues and Debates and Attachment wording assertions to their own topics, and replaced the stale repeated-group count floor with checks that **Relationships, Cognition and Development, and Forensic Psychology** remain explicitly flagged for review. A separate canonical synthetic authenticated Playwright test was added to `tests/e2e/psychology-restricted-pilot-route.spec.ts`, covering six original topic items, both V2 correct keys, exact persisted content IDs and reloading a saved scored session on desktop/tablet/phone. It uses synthetic user/auth and owner-scoped API fixtures, **not** an authentic student account. Later CI results, exact head, independent A3 receipt and production status must be checked separately; test authorship alone is not passing evidence.

A separate trusted reviewer [draft PR #807](https://github.com/lhanson-dev/revision/pull/807) proposes guarded independent blinded-key and separate feedback A3 infrastructure. Its no-secret contract test workflow is not itself a model educational review. It requires separate Founder merger approval before it can be used against exact PR #803 content.

### Release gates pending

- Exact-head fresh-context A3: independent blinded answer/key reconstruction for both original contexts; separately challenge each author-written rationale, plausible distractors, alternative single-best-answer ambiguities and source/AO fit. If material fail, revise and re-run on new exact head.
- Full CI on latest head, including static/unit/build, database/RLS, signup, browser desktop/tablet/phone, and actual authenticated Practice score/save/reload where available.
- Reconcile proposed PR with current approved main, explicit Founder-specific merge approval, post-merge production/path-to-live verification, and real learner acceptance. None is inferred from authoring.
- Keep the wider #787 bank inventory and #698 source-atom/teaching/practice/Exam Prep audit open; record qualified Psychology educator/examiner review separately from AI A3.

## Documentation impact

Existing Course Learning Blueprint, source rights, assessment quality, evidence and planner authorities already cover this correction; **no normative amendment** is required. Implementation, this technical note, indexed pointer and tests live together on the same governed branch/PR. The dated 2 November audit remains unchanged and historically true. Update the primary #698/#787 trackers with the bounded candidate and its exact-head evidence, without prematurely marking full-course assurance complete.
