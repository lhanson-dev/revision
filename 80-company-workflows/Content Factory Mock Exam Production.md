---
title: "Content Factory Mock Exam Production"
document_id: "content-factory-mock-exam-production"
document_type: "workflow-authority"
authority: "company-workflows"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-10-04"
last_reviewed: "2026-10-04"
review_cadence: "after each first mock set for a new qualification shape, then with Content Factory process review"
source_of_truth_for: ["Content Factory mock-paper planning", "whole-paper mock assurance", "mock originality and reuse rules", "mock release boundary"]
depends_on: ["Content Factory Fast-Path Process", "Content Accuracy Assurance Gate", "Educational Content Source Licensing and Provenance Standard", "Content Factory Bootstrap Cost Strategy", "AI Agent Constitution"]
supersedes: null
---
# Content Factory Mock Exam Production

## Purpose

Define the governed production contract for Revision-authored mock examinations produced from an already-established Course Truth, Exam Truth and reusable Subject Foundation.

This document does not replace the Content Factory Fast-Path Process. It makes the Fast-Path mock stage explicit at whole-paper level so a qualification can be produced repeatedly without inventing paper rules inside prompts or manually assembling a question collection.

## Entry conditions

Mock production may begin only when:

- exact-course Course Truth exists and its current fingerprint is known;
- Exam Truth exists and records the stable assessment contract for the qualification;
- exact-course assurance has passed for every subject-knowledge dependency used by the mock;
- the source-rights boundary for awarding-body material is `REFERENCE_ONLY` unless a stronger reusable licence is explicitly recorded; and
- the qualification has a versioned Mock Profile that distinguishes published assessment invariants from calibration evidence.

Unchanged passing dependencies are reused by exact fingerprint. Mock production must not repurchase Foundation, Course Truth, Learn, Practice or question-bank assurance merely because a mock is being built.

## Mock Profile

Each qualification requires a versioned Mock Profile before paid mock generation. The profile is a deterministic input, not AI-authored exam truth.

It must record:

- course and qualification identity;
- paper/component count, duration, attempted raw marks and weighting;
- compulsory/choice structure;
- stable question-family and section rules;
- quantitative minimums and other published assessment constraints;
- assessment-objective expectations where published;
- source provenance and rights classification for every awarding-body reference;
- calibration observations needed to create a realistic paper where the awarding body deliberately permits variation; and
- which facts are **invariants** versus **calibration only**.

Past papers, specimen papers, mark schemes and examiner materials may inform calibration under reference-only provenance. A historical tariff, command word, topic placement, case study or dataset must never be promoted to a future-paper invariant merely because it appeared before.

If official sources conflict in a way that changes paper validity, the Mock Profile must preserve the conflict and use the least-assumptive valid rule. It must not silently manufacture a stricter invariant.

## Paper-set planning before generation

A complete mock set must be planned deterministically before any paid generation call.

The plan must prove, as software-checkable data wherever possible:

- every required paper is present exactly once;
- duration, attempted marks, compulsory/choice structure and section totals are valid;
- optional questions are represented without incorrectly inflating the attempted raw-mark total;
- the complete set satisfies the qualification's quantitative requirement;
- planned AO demand is compatible with the published assessment model;
- coverage is deliberately distributed across the course rather than driven by easiest-to-generate topics;
- synoptic questions name only targets genuinely required by the task;
- repetition limits exist within a paper and across the set;
- contexts/stimuli are allocated coherently at paper or question-set level rather than independently per subquestion; and
- no plan relies on predicting future topic likelihood or undocumented examiner preferences.

A paper plan is a production specification, not learner content. It may select from previously accepted question-quality evidence, but it must not become a simple concatenation of the existing question bank.

## Originality and source rights

All learner-facing mock content must be Revision-authored.

Official awarding-body materials may supply assessment rules and calibration facts only within the recorded rights boundary. Protected question wording, case studies, source extracts, datasets, scenarios, distinctive combinations of facts or mark-scheme prose must not be reproduced or closely paraphrased.

Synthetic businesses and synthetic datasets are the default for mock contexts because they reduce rights risk and permit exact control of the evidence required by the questions. Where real organisations or external facts are used, every material fact or dataset must carry rights-safe provenance suitable for commercial use.

The learner label is:

> A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.

Equivalent qualification-specific wording should be used for other awarding bodies.

## Whole-paper generation contract

Generation must operate from the paper plan and shared context/stimulus design. It must not generate unrelated questions and join them afterwards.

For every paper:

- context must contain all information needed to answer the questions without disclosing the answer;
- data and numerical relationships must be internally consistent;
- calculations and formulas must be correct;
- difficulty and response demand must vary realistically through the paper;
- command words, tariffs and response forms must be compatible with the Mock Profile;
- each assessed knowledge target must be demanded by the question and necessary for full marks;
- context-only mentions do not count as assessed coverage;
- marking guidance must not reward knowledge, analysis, evaluation or interpretation absent from the task; and
- the paper must be answerable within the official duration by a prepared candidate.

Existing accepted question-bank assets may be reused only when their exact learner-facing fingerprint is unchanged **and** the whole-paper planner proves they fit the paper's context, progression, coverage and duplication rules. Reuse evidence is not permission to force an otherwise unsuitable question into a paper.

## Mark schemes

Every learner-facing mock paper requires a corresponding Revision-authored mark scheme.

The mark scheme must:

- reconcile exactly to the question and available marks;
- use point-based, calculation or level-of-response treatment appropriate to the task;
- for quantitative work, state the valid method, correct answer, units where relevant and treatment of working;
- for extended responses, separate assessment requirements from indicative valid content and stronger judgement characteristics;
- accept legitimate alternative reasoning where the question permits it;
- preserve AO totals and question totals deterministically; and
- never imply that it is an official awarding-body mark scheme.

Where the learner product shows band-level or estimated feedback rather than exact independent marking, the existing Fast-Path confidence limits continue to apply.

## Assurance

Mocks require both question-level and whole-paper assurance.

Software must own every mechanically provable check, including:

- paper/section/question mark reconciliation;
- duration and component identity;
- choice/compulsory accounting;
- quantitative calculation recomputation;
- AO arithmetic;
- required-target evidence links;
- duplicate IDs and configured repetition limits;
- exact dependency fingerprints; and
- source/provenance completeness.

Fresh-context independent review must judge the semantic checks software cannot prove, using a fixed checklist covering at least:

- question validity;
- mark-scheme validity;
- factual accuracy;
- calculation/data validity;
- case/stimulus coherence;
- realistic progression and difficulty;
- timing realism;
- command-word/tariff realism;
- quantitative balance;
- synoptic validity;
- breadth across the paper and full set;
- cross-paper duplication; and
- resemblance to the approved assessment model without copying protected assessment content.

Material failures fail closed. This includes inaccurate teaching, incorrect calculations, missing required assessment content, invalid question/mark-scheme relationships, marks awarded for undemanded knowledge, misleading stimulus facts, broken paper totals or a paper that is merely a collection of unrelated questions.

The Fast-Path two-fresh-round limit applies to each unresolved mock unit/fingerprint. Do not start a third fresh assurance round for the same unresolved fingerprint; escalate or make a deterministic decision under the existing Fast-Path rule.

## Cost and reuse

Mock production follows the bootstrap optimisation order:

1. deterministic plan and validation before model calls;
2. exact-fingerprint reuse of accepted evidence;
3. compact context containing only the required Course Truth, Exam Truth, Foundation and plan dependencies;
4. bounded generation and independent-review calls;
5. targeted remediation of only changed mock units; and
6. retained per-stage spend evidence.

A qualification-specific pilot may set a lower operational mock-stage cap than the existing course-production ceiling. Exceeding that lower cap must stop before the next provider call; it does not permit weaker assurance.

## Release and learner surface

A generated mock is not publishable merely because generation completed.

Publication requires the applicable Content Accuracy Assurance decision and release evidence for the exact mock fingerprints. Learner-facing mocks must be identified as Revision-authored realistic practice papers, never official awarding-body papers.

Mocks belong in the existing Exam Prep / timed Exam Simulator experience unless separate product authority explicitly changes learner navigation. Mock production must not create a duplicate exam surface by default.

## Documentation and evidence

For each qualification/set, retain:

- Mock Profile and its source provenance;
- deterministic paper plan;
- generated paper and mark-scheme fingerprints;
- generation and assurance ledgers;
- exact reused-evidence receipts;
- independent-review outcomes;
- provider/model/spend evidence;
- release decision; and
- one-line material decisions/fixes in `content-factory/RUN_LOG.md`.

Historical evidence remains immutable. Changed rules or implementations are recorded prospectively through the governed branch/PR.

## Documentation impact

This authority fills a previously implicit Fast-Path mock-paper stage. It does not change the frozen Content Factory architecture, Course Truth/Exam Truth ownership, source-rights policy, two-round rule, Content Accuracy Assurance gate or learner navigation. Technical implementation must be documented separately and indexed.