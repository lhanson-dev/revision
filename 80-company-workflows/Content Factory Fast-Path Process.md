# Content Factory — Fast-Path Process

**Status:** Approved by the Founder, 30 September 2026 (adopted through ADR-0029)
**Date:** 30 September 2026
**Owner:** Founder
**Applies to:** every course the Content Factory produces, starting with AQA A-level Business 7132

## Purpose and principles

This process turns an exact course (for example AQA A-level Business 7132) into student-ready content in days, not weeks, with evidence for why it can be trusted. It runs the same way for every course and replaces redesign-as-you-go.

It is built on what went wrong in the first six weeks. Most of the time went into three architecture restarts and into making the AI pipeline run reliably. The current Subject Knowledge Foundation approach (ADR-0028) then went from nothing to the exact-course check in three days. The architecture is right; the process around it needs to be fixed and lighter.

Six rules:

1. **The architecture is frozen.** Subject Knowledge Foundation → Specification Mapping → Course Truth + Exam Truth → Learning Blueprint → Learn, Practice, Exam Prep. Changes need a real defect, not a better idea.
2. **Software proves what can be proven.** Coverage, formulas, calculations, links, totals and structure are checked mechanically before any AI review runs.
3. **AI reviewers answer fixed questions.** Never "find anything wrong". Each reviewer gets a checklist, and each finding must name the check it failed.
4. **Only proven teaching errors block.** A wrong fact, formula or missing examinable item blocks. A weak citation or a matter of opinion is logged and fixed in a batch.
5. **Review rounds are capped.** Two rounds per item. Anything still disputed goes to the Founder as a clear decision, not a third loop.
6. **Failures stay small.** One bad item fails that item, never the whole run. Fixes recheck only what changed and what depends on it.

## The pipeline

Every course goes through the same eight steps. Steps 1–4 establish what is true and required; steps 5–8 build what students use.

| Step | What it produces | Trial stage |
| --- | --- | --- |
| 1 Foundation | Reusable subject knowledge nodes; deepened only if a course needs more | T2–T3 |
| 2 Spec mapping | Every named specification item mapped to a node | T4–T5 |
| 3 Course + Exam Truth | What the course requires, and how the board tests it | T6–T7 |
| 4 Course gate | Coverage proven by software, accuracy reviewed by AI | T8 |
| 5 Blueprint | Learning treatment per item, no asset quotas | T9 |
| 6 Learn + Practice | Explanations, retrieval, application, calculation | T10 |
| 7 Exam questions | Original questions with mark schemes, answered blind by a reviewer | T11 |
| 8 Mocks | Full papers matching the board's structure, marks and timing | T11 |
| Release | Content released with confidence labels | T12 |

At every step: software checks first, then a fixed-checklist AI review. A blocking finding fixes only that item (max 2 rounds), then the Founder decides.

For a second board in the same subject, step 1 is mostly reuse, so most of the work is steps 2–4 and exam-specific content.

## Checks

Every check is either software-proven or AI-reviewed against a fixed checklist. Software runs first; AI only judges what software cannot.

**Software-proven (pass or fail, never loops)**

| Check | What it proves | Stage |
| --- | --- | --- |
| Item-level coverage | Every named item in the specification (concept, formula, model, skill) is taught by at least one node | Mapping |
| Prerequisite closure | Every node a course uses has its prerequisites in the course too | Course Truth |
| Formula and calculation | Every formula computes; every worked example and answer recalculates to the stated result | Foundation, Learn, Practice, questions |
| Exam structure | Papers, marks, timings and assessment-objective totals match Exam Truth | Exam Truth, mocks |
| Question links | Every question has a mark scheme, a target node, command word, marks and assessment objective | Questions |
| Mock composition | Marks, timing, topic spread and question-type spread fall within Exam Truth limits | Mocks |
| Provenance and rights | Every item traces to its sources; no awarding-body text is reused as teaching copy | All |
| Dependency freshness | Nothing depends on an outdated version of anything upstream | All |

**AI-reviewed (fixed checklist, fresh context, no access to the generator's reasoning)**

| Review | Fixed questions | Stage |
| --- | --- | --- |
| Accuracy | Is each definition, fact and causal claim correct? Cite the source that confirms or contradicts it | Foundation |
| Depth | Is this at A-level depth: not too shallow, not beyond the course? | Foundation, Learn |
| Mapping sense | Does each mapped node actually teach what the requirement asks, not just share a topic? | Mapping |
| Question validity | Does the question test its target node at its stated command level? Can it be answered without the target knowledge? Does it give away the answer? | Questions |
| Answer reconstruction | Reviewer answers the question blind, then compares with the mark scheme. Disagreement is a finding | Questions |
| Exam authenticity | Would this question sit naturally in a real AQA paper for its marks and command word? | Questions, mocks |
| Teaching quality | Is the explanation clear, correct and coherent for a 16–18 year old? | Learn |

Use a second model provider only where the same model is most likely to share the same blind spot: answer reconstruction for calculations and extended questions, and accuracy review of new Foundation nodes. Elsewhere one fresh reviewer is enough.

## What blocks release and what doesn't

A finding blocks only if it would teach a student something wrong or leave out something examinable. Everything else is logged and fixed without stopping the line.

| Finding type | Example from v0.3–v0.8 | Blocks? | Action |
| --- | --- | --- | --- |
| Wrong teaching | ROCE capital-employed denominator; revenue defined too narrowly | Yes | Fix the item, recheck it and its dependants |
| Missing examinable item | Margin formula absent; AQA named items not taught | Yes | Add to the node, rerun item-level coverage |
| Broken question or mark scheme | Answer doesn't match mark scheme; question gives away its answer | Yes | Fix or discard the question |
| Weak citation | Teaching correct, but source doesn't state it directly | No | Add a better source in the next batch |
| Opinion or style | Reviewer would phrase it differently | No | Log; review in batches |
| Out of scope | Beyond what the course requires | No | Log only |

In the v0.3–v0.6 rounds, most material findings were weak citations. Under this rule most of those rounds would not have been needed.

**Round limit.** An item gets at most two review rounds. If the same issue is still disputed after round two, it goes to the escalation list.

**Escalation to the Founder.** One short entry per issue: what is disputed, the evidence on each side, and the options. The Founder decides: accept, fix a specific way, or remove the item. The decision is recorded and the item never re-enters the loop on the same point.

**A reviewer disagreeing is not proof of an error.** A blocking finding must cite the check it failed and, for accuracy, the source that contradicts the content. Findings without that are logged, not actioned.

## Handling failures

A failure affects the smallest unit possible: one node, one asset or one question. The run carries on around it.

- **AI call failures** (truncated output, malformed JSON, timeout, refusal): retry up to 3 times, then mark that one item `failed` and continue. Earlier ID mismatches and truncations stopped whole runs; that must not happen again.
- **Runs resume.** Every completed item is saved with its fingerprint. A rerun skips anything whose inputs haven't changed.
- **Fixes are targeted.** Fixing a node rechecks that node, then only the course mappings, Learn, Practice, questions and mocks that depend on it. Nothing else is regenerated or re-reviewed.
- **A fix is reviewed like new content.** The corrected item goes through the same software checks and a fresh AI review. It counts towards the two-round limit.
- **Failed items are visible, not hidden.** At the end of a run there is one list: passed, fixed, logged, escalated, failed. A course can release with logged items but not with blocking or failed ones.

Process documents are not written per fix. A fix is recorded as one line in the run log (`content-factory/RUN_LOG.md`: date · item · what · why · which check). New standards or ADRs are only for genuine architecture changes.

## Confidence labels and product claims

Every item carries one of four labels, recorded automatically from which checks it passed. Where confidence is lower, the product promises less rather than launch waiting.

| Label | Meaning | Example |
| --- | --- | --- |
| Proven | Passed software checks that fully determine correctness | A calculation answer; mock mark totals |
| Source-confirmed | AI accuracy review confirmed it against a cited authoritative source | A definition; a causal relationship |
| Reviewed | Passed fixed-checklist AI review, no single source settles it | Explanation quality; question authenticity |
| Limited | Known to be hard to assure without experts | Exact marks on 16–25 mark essays |

Product claims by content type:

- **Learn, retrieval practice, calculations, short answers:** full use, no caveat needed.
- **Exam-style questions:** presented as "AQA-style practice", never "AQA questions".
- **Essay and extended-response marking:** show a mark band plus specific feedback (what was strong, what was missing, what to do next), not an exact mark. Labelled as an estimate.
- **Mocks:** "a realistic practice paper built to AQA's structure", with band-level predictions only.

When experts become available, their first job is to sample the Reviewed and Limited items and measure how often AI review was wrong. That tells you which labels can be upgraded.

## Adding the next course

A second board in the same subject should mostly reuse; a new subject pays once for its Foundation. Timings below are estimates to test, not promises, until one course has run through the full process.

| Course | What's reused | What's new | Estimated time |
| --- | --- | --- | --- |
| Second Business board (e.g. Edexcel 9BS0) | Most Foundation nodes, much of Learn and Practice | Spec mapping, Exam Truth, node deepening where the board asks for more, exam questions, mocks | Days to 2 weeks |
| New subject (e.g. AQA A-level Biology) | The pipeline, checks and rules | A full Subject Foundation, then everything downstream | 2–4 weeks the first time |
| Same subject, later exam year | Everything unchanged | Only items affected by specification or guidance changes | Days |

**The reuse test.** For the second Business board, record how many Foundation nodes were reused unchanged, deepened or added. If most need to be rebuilt, the Foundation is too AQA-shaped and needs fixing before a third board.

**The subject test.** The first non-Business subject should be one that stresses the design differently. Biology is a good candidate: practical skills, required practicals, diagrams and maths content will expose Business-specific assumptions without the extra difficulty of essay-heavy subjects like History.

## Next steps

The next job is to prove steps 5–8 (trial stages T9–T12) on one slice, not to perfect steps 1–4 further.

- [x] Record the architecture freeze and these rules as the governing process for the factory
- [ ] Split the 42 AQA requirements into named items (every concept, formula, model and skill) and add the item-level coverage check
- [ ] Rerun the exact-course check (T8) with the round limit and blocking rules; resolve the 4 open findings
- [ ] Take AQA 3.5 (financial performance) through Learning Blueprint, Learn, Practice, 10–15 exam-style questions and marking
- [ ] Review the 3.5 slice as a student would use it, and record what broke
- [ ] Fix what the slice exposed, then run the rest of AQA 7132 through the same process
- [ ] Start the second Business board and measure reuse

## Rules for AI tools working on this

These are also in `CLAUDE.md` (and `AGENTS.md` points every tool there). They exist to stop the drift that cost the first six weeks.

1. Do not propose changes to the architecture unless a check has failed because of it. Name the failed check.
2. Do not write new standards, amendments or ADRs to fix a single defect. Log the fix in one line.
3. Do not ask an AI reviewer to "find any problems". Use the fixed checklist for that stage.
4. Do not treat a weak citation as blocking. Log it for the next source batch.
5. Do not start a third review round on the same issue. Escalate it to the Founder.
6. Do not regenerate or re-review anything whose inputs haven't changed.
7. Do not let one failed AI call stop a run. Retry, then mark that item failed and continue.
8. Prefer a software check over an AI judgement whenever the answer can be computed or looked up.
9. When unsure whether something blocks, ask: would a student learn something wrong, or miss something examinable? If not, it doesn't block.
