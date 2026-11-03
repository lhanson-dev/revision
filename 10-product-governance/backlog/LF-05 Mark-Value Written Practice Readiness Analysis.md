# LF-05 — Mark-value written exam practice: bounded Definition of Ready candidate

**Lifecycle:** Analyse; **NOT Ready, NOT In Progress, NOT Live**.  
**Decision owner:** Founder. **Existing tracker:** #706 (under #703), original learner request #765 LF-05, authored-content/source owner #698.  
**Applicable learner cohort:** private 2027 AQA A-level Business 7132 and AQA A-level Psychology 7182.  
**Primary product authority:** Course Learning Blueprint; Course Content and Assessment Component Placement; Claims and Progress Governance; Exam Session Recovery; Feature Definition and Measurement Workflow.  
**This is a product-management candidate, not a new authoritative feature, independent subject review or permission to implement.**

## 1. Proven source and existing canonical runtime

The actual learner app route is `/revision/app/` → enrolled course → **Exam Prep** → published paper → **Practise untimed**. `src/app/ExamPrepSection.tsx` opens the real `ExamSimulator` with `autoStart='untimed'`. The current simulator already provides: actual question mark tariff, paper context/case and question stimulus, typed response, reveal of authored marking guidance, AO-by-AO self-mark controls, and **Record this result** with self-assessed provenance. Keyed multiple choice uses the authored correct choice instead of learner-awarded marks. A separate timed mock/session-recovery path exists. Do not build a second question engine.

**Verified published mock tariff inventory, not claims of exam-board completeness:**

| Exact course | Existing source-backed paper questions/mark tariffs | Important boundary |
| --- | --- | --- |
| AQA Business 7132 Paper 1 | 15 × 1-mark MCQs; 7 written items: 4, 4, 4, 5, 6, 6, 6; 4 × 25-mark authored essay alternatives | Paper 1 100-mark attempted paper uses one alternative in each of two essay choice groups; the 150 printed-question marks must not be presented as 150 required |
| Business Paper 2 | 4, 6, 9, 14, 4, 6, 9, 14, 4, 6, 10, 14 | Three data-response groups; source/context must stay attached |
| Business Paper 3 | 12, 12, 16, 16, 20, 24 | Original authored integrated business case / appendices stay with question |
| Psychology 7182 Paper 1 | Repeated 4, 8, 6, 6 four-question generic section pattern | The representative published mock does **not** contain a Psychology 16-mark essay |
| Psychology Paper 2 | Two repeated 4, 8, 6, 6 sections and Research Methods 4, 8, 12, 12, 12 | Do not substitute a 12-mark research question for a 16-mark evaluation request |
| Psychology Paper 3 | Repeated 4, 8, 6, 6 within each published selectable topic option | Respect one chosen topic per option group; do not intermingle exclusive alternatives in the learner's route |

Source assertions: `content/business/aqa-a-level/content.test.ts`, `content/psychology/aqa-a-level/content.test.ts` and published `exam` objects. These are authored Revision mock assets. The existing Psychology 16-mark extended-response content requirement is **not fulfilled by a matching published asset**; the authoring, exact source demand, AO allocation and substantive review are a separate #698 deliverable. Every displayed item needs individual assurance, not just existence.

## 2. Student problem, strategic purpose and falsifiable value hypothesis — DoR 1–3

A learner wants to practise genuine AQA written questions at an identifiable mark demand (for example, a substantive Business 25-mark essay or Psychology longer evaluation), compare their independent answer with specific guidance and identify what to improve. Today they must enter a paper and traverse questions sequentially; the authored mock catalogue has genuine mark tariffs but no purposeful mark-demand selector. This undermines rapid targeted written practice.

**Hypothesis:** when the learner can choose an *actually available and source-appropriate* mark tariff and paper/question, they can find, attempt, self-review and save the intended written question without traversing irrelevant questions or mistaking a generic short question for extended exam writing. Verify through task completion, accuracy of chosen demand, usefulness feedback and saved-evidence integrity, not raw click counts.

**Alternative/do nothing:** the current paper-level untimed navigator already works and should remain a fallback. Avoid duplicating a planner, grading engine or question-generation service.

## 3. Proposed minimum learner experience — DoR 4, 6–7

One small enhancement **inside existing Exam Prep**:

1. Student selects the course they already study, a published paper, and **Written question / marks**. Display *available counts by exact tariff only* from source-approved authored paper questions; do not imply arbitrary unseen bands are available. Mark tariffs are numbers, not a difficulty claim.
2. Learner selects a genuinely available written question. Display its exact question ID, source/case/stimulus, paper/section/option applicability, authored tariff and AO demand. For Business Paper 1 essay alternatives and Psychology Paper 3 choice groups, explicitly label choices and prevent double-counting of mutually exclusive alternatives in a paper attempt.
3. Student types an answer **before** guidance is revealed. Existing answer draft behavior applies; do not leak a model before first independent attempt or automatically grant a mark because guidance was opened.
4. Show truthful question-specific marking guidance/model or indicative level descriptors where approved. Student self-assesses AO marks, sees **Self-assessed — not examiner marked**, and can save using the existing evidence path. Never represent a self-assessment as independent mastery, exam grade or AI/examiner scoring.
5. After save, offer review/try another source-approved question or return to Exam Prep. The current paper navigator and timed/mock route remain available.
6. Empty case: `No verified [N]-mark written questions are available for this paper yet` and show actual alternatives rather than manufacturing a question or silently switching tariff.
7. Loading/save failure, missing/incompatible source data, suspended session, account switch and reload fail safely: keep the typed answer where already supported; do not double-record or erase prior paper/zero-score history.

**REV role:** can explain why this kind of writing is worth doing and recommend already-valid sources, never produce invented scores or imply the learner has demonstrated independent skill from a self-marked response. No new AI vendor, autonomous marking or upgraded learner claims.

**MVP exclusions:** assisted AI marking (FI-007), generic pasted questions, file uploads/handwriting, all-exam-board catalogue, generating questions on demand, automatic predicted grades, historical mark rewrites, and the claim that every AQA tariff is populated.

## 4. Evidence and trust — DoR 5 and 12

Reuse `ExamSimulator`'s governed question / version ID and existing `createSelfAssessedExamQuestionEvidence` contract; retain raw historic answers, marks and old checkpoints. A self-awarded AO mark remains separate from software-keyed independent correctness. A second attempt must be distinct and may not overwrite or retroactively inflate earlier evidence. Source materials must be original/licensed, AQA-accurate and subject-reviewed before publication. Treat displayed marking guidance as *Revision-authored*, never official AQA or independent examiner judgement.

The existing paper's published source may contain an insufficient indicative mark explanation for a long answer. That deficiency is not solved by a selector: #698 must independently review rubric / indicative content / AO and level alignment per authored 16/25-mark item, with no invented tariff.

## 5. Free/Paid/Premium and upgrade hypothesis — DoR 8–9

**Proposal (not approved):** every learner tier receives the same valid self-marked written-question selector and same published authored content; there is no provider cost for local navigation or honest AO self-assessment. Gating basic exam preparation or educational truth would violate product/evidence authority.

There is **no LF-05-specific conversion fence**. Across the wider site, Paid and Premium can still offer separately governed higher-value benefits. Distinct FI-007 paid automated marking allowances must not be introduced under LF-05; FI-007 remains Analyse and separate.

## 6. Measurement and Founder visibility — DoR 10–11

Proposed privacy-conscious events/derived counters: valid authored tariff inventory, selected course/paper/mark value, question opened, independent answer drafted, guidance revealed, self-assessed result saved, restarted draft, failed save, resume and return to a different question. Do **not** log raw answers, names, private case text or child identifiers in third-party analytics.

Primary success: ability to select/complete/save intended marked written question from existing catalogue on first attempt. Guardrails: no wrong tariff; no missing stimulus/mark guidance; no invalid paper-topic/option mix; no duplicate score; zero prior history loss; no mastery claim from mere self-marking. Founder assurance needs aggregate availability by course/tariff plus exceptions and release identity, not individual learner answers.

## 7. Technical plan and test acceptance — DoR 13–14

Build only after Ready. Read-only selectors are derived from `exam.questions`, `question.marks`, `responseType`, `choiceGroup`, `choiceOption`, paper ID and approved source suitability; **never hard-code arbitrary tariff labels**. Reuse `ExamPrepSection` and `ExamSimulator` so question/marking/storage semantics remain unchanged. Preserve existing synthetic signed-in and owner-isolation test harness, no new access bypass. Prefer no schema migration.

Required before learner-test release: exact-head unit/source checks for available tariffs per actual published paper; Business Paper 1 two 25-mark choice groups and Paper 3 case; Psychology Paper 3 one-from-each option and unsupported 16-mark absence; source/guidance applicability; typed draft → reveal → self-mark → save; idempotence, pre-existing zero and historical marks, reload, owner isolation, desktop/tablet/phone, keyboard, 200% zoom, screen reader and production route. Real adult existing-account and original learner test remain separate from CI.

## 8. Documentation/authority, blocking decisions and human Ready — DoR 15–17

**Proposed normative amendment** (requires explicit Founder approval and governed change to `10-product-governance/Course Learning Blueprint.md` or equivalent active Exam Prep authority, not silently applied here):

> Within authentic Exam Prep, where the published source has sufficiently assured original questions and marking guidance, a learner should be able to choose written-question practice by actual paper and supported mark tariff. Only real available question demands may be offered. Authored context remains attached. Ungraded/self-awarded results are accurately labelled and cannot be treated as independently scored mastery; mutually exclusive paper options and historical evidence are preserved.

**Remaining Ready blockers:**
- Final Founder-approved learner interaction, precise UI wording and self-assessment evidence acceptance;
- Confirmation of no source/retention changes beyond existing contracts and tier-neutral exposure;
- Independently assured question/rubric source package for a genuinely applicable Psychology 16-mark extended response under #698, or explicit Founder approval of a **limited first release with a truthful unavailable 16-mark state** (not full LF-05 closure);
- Normal accessibility/evidence and current-production risk acceptance; and
- **Explicit human Founder Analyse → Ready approval** with record tied to #706. AI review cannot self-authorise Ready.

**Decision recommendation:** a **bounded mark-value selector** in existing Exam Prep with transparent unavailable-tariff states, self-mark only, for both courses. Maintain full LF-05 open until the actual extended-response question/rubric deficit is fixed and learner accepted.

## Documentation impact

This non-normative, proposed readiness analysis is added to the *existing* issue #706 and INDEX via a governed draft PR. No code, published question, access policy, current normative authority, score or runtime changes occur at this stage. Once human Ready is given, normative authority and code/technical documentation/appropriate acceptance tests should be updated together in the implementation PR, with no rewriting of prior source/audit history.
