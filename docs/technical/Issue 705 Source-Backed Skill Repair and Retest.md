# Issue #705 — source-backed skill repair and independent recheck (B2a)

**State:** Candidate implementation branch; not merged or live. Gate B human Ready approved in PR #711. Follows B1 persisted single-target Business answer provenance, production PR #712. The canonical route is `/revision/app/` and one FI-001 programme; Home, Plan and REV use the same candidate and schedule result.

## What this bounded slice does

1. Inspect the learner's already saved *software-scored*, single-target source-tagged multiple-choice results **for the same authorised course module and topic**. A definitely wrong answer indicates one observed gap; a correct answer explicitly guessed indicates uncertainty; neither alone proves mastery.
2. Cross-check the evidence item ID/spec requirement against the *still published* question. Ignore legacy topic-only evidence, multi-target answers, foreign course evidence and stale/unmapped question identities. Keep the latest credible result by spec item.
3. Find a genuinely **different, never previously attempted** published, software-scored question for precisely the same item. Only then create a supported independent-recheck intent. Repeated question, depleted bank, unrelated course-pack MCQ and multi-skill mark can never masquerade as independent confirmation.
4. If the exact published Foundation node ID resolves to an actual Learn page that the learner has not already explicitly reviewed, offer a specific repair page for an observed missed answer. A nearby topic explanation without exact node link is not called specific remediation. A later independent check explicitly follows the repair, in the same shared programme priority.
5. Carry the one selected question identity all the way to a real Plan/Home **Start** activity; never silently substitute a generic course-pack question. The existing Home quick-check answers save the original mapped v2 evidence with stable retry identity, and when the task is completed the same Plan/Home/REV data reloads and recalculates. If the published target disappears, Start displays unavailable rather than granting score or invented study minutes.

**The exact authored source, not a model, selects all interventions.** If content is missing, the candidate is absent and the content-supply obligation stays on #698/#704. Recheck priority is small and remains in FI-001's single scoring function; no second planner. Exam deadlines and option topic selection are inherited from previously verified `scopeTopicIds` candidates. The full horizon remains coarse and truthful.

## Evidence and trust boundaries

A single wrong answer is not a general topic weakness, and one correct retest is not a mastery claim. Self-rated flashcards, self-marked writing, calculation evidence without atomic tags, and exposure do **not** become equivalent evidence. Reading a repair page is exposure only. An already reviewed page is not repeatedly offered as a new independent repair. The same question ID is never recycled as a fresh proof, even across retries or when the answer was uncertain. No new persistence table, schema migration, model provider, premium gating, child identity logging or changing previously saved history.

## Assurance and remaining programme

Unit test fixtures cover two different wrong skills in one topic, later independent correct, correct-but-guessed, exhausted source inventory, foreign module/topic, tampered mapping and lack of matching repair page. Existing real published Business/Psychology planner and browser/DB suites run on exact integrated PR head. The feature remains only **B2a**: #705 stays open for educationally calibrated content breadth, Psychology mapping (currently many generic course packs have no exact source tags), durable mixed-assessment status, late review policy without invented intervals, real account acceptance and final programme feasibility (#694).

Review the documented lack of alternative independent bank questions in the released 231-item Business JSON snapshot: 59 single-target MCQs refer to 59 distinct items, so none of those alone supports a new same-item independent recheck; legacy original slice material may change actual availability. Shortage must be reported as a production source/content gap, not concealed by the UI or interpreted as completed learner preparation.

**Documentation impact:** Source-backed algorithm, canonical start path, tests and this technical note are updated in this PR. Existing Adaptive Revision Planning/Course Learning Blueprint and claims boundaries already authorise this bounded method; no normative policy change required. Preserve historical #698 audit and existing #704 implementation note. Subsequent PRs must keep technical docs and educational assurance registers aligned.
