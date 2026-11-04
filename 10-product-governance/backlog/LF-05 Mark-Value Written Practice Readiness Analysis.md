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

1. From the learner's existing course **Exam Prep** page, offer **Practise by marks** first, with only the available **written-question** mark values and the true count at each value. Paper and topic are optional follow-up filters, not prerequisites: the student must not need to hunt through papers to find a 16-mark response. Counts derive from source-assured original questions; a tariff is not itself a difficulty or mastery level.
2. Student selects a genuinely available written question from the chosen mark-value list. Show the exact question ID, command word, paper/topic/section identity, source/case/stimulus, chosen tariff and AO demand. Business Paper 1 essay alternatives and Psychology Paper 3 topic options must be correctly labelled and must never be double-counted in a whole-paper attempt.
3. Student types an answer **before** guidance is revealed. Existing answer draft behavior applies; do not leak a model before first independent attempt or automatically grant a mark because guidance was opened.
4. Show truthful question-specific marking guidance/model or indicative level descriptors where approved. Student self-assesses AO marks, sees **Self-assessed — not examiner marked**, and can save using the existing evidence path. Never represent a self-assessment as independent mastery, exam grade or AI/examiner scoring.
5. After save, offer **another of the same mark value**, **change mark value**, or return to Exam Prep. Keep existing paper-specific untimed and full timed mock routes intact. Warn and require confirmation before leaving an unsaved long answer; do not promise autosave or durable drafts until separately tested.
6. Empty case: `No verified [N]-mark written questions are available for this course yet` (or `for this paper` if a paper filter is selected). Show genuinely available alternatives without manufacturing a question or silently changing the requested mark tariff. A truthful empty 16-mark state is a *temporary limitation*, not completion of LF-05.
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

Build only after Ready. The chooser must derive actual mark-value counts from eligible source-assured `exam.questions` **and any separately approved, paper-linked practice-only question catalogue**, filtered to written response types; preserve `question.marks`, source IDs, `choiceGroup`/`choiceOption`, paper/section/topic provenance and guidance applicability. Do not guess or hard-code tariffs. `ExamSimulator` already accepts `preferredQuestionId`, but the canonical `ExamPrepSection` controller does not yet pass a marks-selected ID; reuse both rather than building a second answering engine. New Psychology 16-mark practice-only questions must never change existing published 96-mark timed exam totals. Preserve existing signed-in and owner-isolation tests; no access bypass. Prefer no schema migration, with schema design checked before implementation.

Required before learner-test release: exact-head unit/source checks for available written tariffs per actual approved authored paper and practice-only items; Business Paper 1 two 25-mark choice groups and Paper 3 case; Psychology Paper 3 one-from-each option, existing 96-mark paper totals and **real independently reviewed 16-mark standalone Psychology availability**; source/guidance applicability; typed draft → guidance → self-assess → save, unsaved-long-draft leave warning, idempotence, prior zero and historical marks, reload, owner isolation, desktop/tablet/phone, keyboard, 200% zoom, screen reader and live route. Real adult existing-account and original learner retest remain separate from CI.

## 8. Documentation/authority, blocking decisions and human Ready — DoR 15–17

**Proposed normative amendment** (requires explicit Founder approval and governed change to `10-product-governance/Course Learning Blueprint.md` or equivalent active Exam Prep authority, not silently applied here):

> Within authentic Exam Prep, a learner should be able to select genuine **written-question practice by available mark value first**, with optional paper/topic narrowing and source-assured original questions. Each question retains its paper identity, relevant context, exact mark demand and suitable guidance. Practice-only questions must not change the totals or option rules of existing timed mocks. Self-awarded results remain labelled as such and cannot count as independently scored mastery; saved historic evidence must be preserved.

**Remaining Ready blockers:**
- Final Founder-approved learner interaction, precise UI wording and self-assessment evidence acceptance;
- Confirmation of no source/retention changes beyond existing contracts and tier-neutral exposure;
- Independently reviewed and rights-safe **original 2027-relevant Psychology 16-mark question(s)** with item-specific AO/level/indicative guidance under #698; this is now a **required student outcome**, not an optional omitted first release. The Founder asks to practise different lengths, especially 16 marks; a selector alone does not meet that need;
- Normal accessibility/evidence and current-production risk acceptance; and
- **Explicit human Founder Analyse → Ready approval** with record tied to #706. AI review cannot self-authorise Ready.

**Revised recommendation (4 November):** a **marks-first written Practice chooser** in existing Exam Prep, with transparent actual counts, subject/paper context, genuine long-answer questions and explicitly self-assessed feedback. An independently approved **Psychology 16-mark question set** is required to complete the requested learner outcome; a filter with no 16-mark task is not completion.

## Documentation impact

This non-normative, proposed readiness analysis is added to the *existing* issue #706 and INDEX via a governed draft PR. No code, published question, access policy, current normative authority, score or runtime changes occur at this stage. Once human Ready is given, normative authority and code/technical documentation/appropriate acceptance tests should be updated together in the implementation PR, with no rewriting of prior source/audit history.

## 9. 4 November 2026 — source-backed 16-mark scope and remaining decisions

**New Founder instruction:** Complete the product definition, then address the student's feedback that they need to practise **different lengths of written questions, specifically longer ones such as Psychology 16 marks**. This settles the priority and intended product outcome; it is **not** itself explicit \`Analyse → Ready\` authorisation or merge approval. The previously floated possibility of releasing only an unavailable Psychology 16-mark state is **no longer a sufficient LF-05 completion criterion**.

### Distinguish official 2027 course rules from historical paper examples

- The exact Founder-provided **AQA Psychology 7182 v1.4 (1 September 2025)** PDF governs the student's **2027 first-exam cohort**. Its A-level papers are each 96 marks and include multiple choice, short answers and **extended writing** (see assessment summary and scheme of assessment). The PDF **does not specify a universal 16-mark tariff or AO breakdown per extended question**. Derive each authored item's demand from applicable 2027 assessment samples and assurance, not from the total section marks.
- AQA's current public assessment-design explanation (`https://www.aqa.org.uk/professional-development/inside-assessment/bringing-assessment-to-life/psychology`) describes Psychology **8- and 16-mark extended-writing** demands. For the illustrative 16-mark format it explains **AO1 6 marks, with the remaining 10 divided between AO2/AO3 as appropriate**; the exact balance varies with the original scenario's application demand. AQA's assessment-preparation guide (`https://www.aqa.org.uk/resources/psychology/as-and-a-level/psychology/teach/teaching-guide-preparing-for-as-and-a-level-psychology-assessment-podcast`) expressly cautions that a 16-mark question is **not guaranteed on every topic**. These are authoritative AQA *assessment-writing guidance*, but do not replace the updated 2027 Set 3 materials or provide an AQA-approved mark scheme for Revision's newly authored items.
- The AQA 7182 specimen Paper 1 mark scheme hosted at \`https://store.aqa.org.uk/resources/psychology/AQA-71821-SMS.PDF\` (©2014) demonstrates two historical 16-mark level-of-response profiles: an applied Social Influence essay AO1 6 / AO2 4 / AO3 6 and an evaluation of the working-memory model AO1 6 / AO3 10. Older 2023 AQA answers/commentaries index likewise lists 16-mark essays. **These prove the established response *format* only; they do not override the revised 2027 specification, authorise copying AQA text or establish a fixed AO distribution for new 2027 questions.** Updated Sample Assessment Materials Set 3 may require authorised Centre Services access; mark that source evidence as pending where inaccessible.
- The actual published Revision Psychology Paper 1 representative mock has four [4, 8, 6, 6] topic sections; Paper 2 has two such sections plus Research Methods [4, 8, 12, 12, 12]; Paper 3 published option sections are [4, 8, 6, 6]. **No published Psychology mock question is 16 marks.** Existing Business Paper 3 has two 16-mark questions and Paper 1 has four 25-mark printed essay alternatives (two mutually exclusive sections). These authored mock arrays are *not* a guarantee that all AQA-required tariffs are accurately represented.

### Minimum credible v1 experience

1. In the existing \`/revision/app/\` → Courses → Psychology → **Exam Prep**, select **Practise by marks** → choose **16 marks** (when actual published, assured items exist). Show true counts and optional topic/paper filters; explain the original question's command word, context and mark allocation. Offer **at least one**, preferably **two distinct** independently reviewed original Psychology 16-mark essays in different 2027 compulsory topic contexts (recommended candidate scopes: Memory and Issues & Debates, subject to the correct 2027 item-level source and AO review). A single 16-mark example cannot substantiate a claim of comprehensive long-answer coverage.
2. Capture a substantial typed response **before** revealing question-specific Revision-authored indicative content, defensible alternative approaches and suitable **level-based evaluation guidance**. A generic checklist or a 6/8-mark question relabelled as 16 is unacceptable. Credit only genuinely justified AO demands. Results are **self-assessed — not examiner-marked or AI-marked**. Do not turn mere guidance exposure or an uncalibrated self-score into independently verified mastery.
3. Reuse the existing \`ExamPrepSection\` → \`ExamSimulator\` route and evidence semantics. \`ExamSimulator\` already accepts \`preferredQuestionId\`, but the Exam Prep controller does not yet pass a mark-selected ID. Derive eligible marks from published, independently assured **written** question objects. The existing 96-mark Psychology and 100-mark Business timed mocks, including alternatives and Paper 3 option groups, **must remain unmodified**. Any new original 16-mark writing should be **paper-linked practice-only source content** with distinct IDs, explicitly excluded from full-paper totals, not appended as an extra required question to a representative mock. Schema/adapter ownership needs a bounded governed implementation design under #698/#706.
4. Save and review through the existing owner-scoped question evidence path with source/version identity. Allow **another 16-mark question**, switch to another genuine mark length, or return to the paper. Before navigating away from an unsaved long response, warn and confirm. Do not claim that unsubmitted untimed drafts survive refresh: the current \`practiceDraft\` is component state only and is not backed by the timed mock's durable 14-day checkpoint.
5. Prove on the authentic learner route: Psychology 16-mark item(s), at least one shorter Psychology length, Business 16/25 availability where independently assured, correct source and AO guidance, typed-answer → reveal → honest self-assess → save → another item, preserved older zero scores and evidence, and no unrelated paper/option mixing. Explicitly test phone/tablet/desktop, keyboard, 200% zoom, screen reader, invalid/unavailable source and load/save failures, and original learner acceptance. Do not advertise a 16-mark option while the underlying item is unpublished or still under review.

### Updated DoR decision and division of ownership

| DoR areas | Current disposition | Gate |
| --- | --- | --- |
| 1–3 problem, strategy, hypothesis | **Prepared** | Direct LF-05 student report and useful mark-length selection without unrelated traversal |
| 4, 7 experience and MVP | **Proposed** | Founder confirmation of marks-first design, 16-mark outcome, safe exit and paper-linked practice-only content |
| 5, 6 evidence and REV | **Proposed** | Existing self-assessed provenance, no invented score or automatic progress; REV only explains/recommends |
| 8–9 Free/Paid/Premium | **Proposed** | Keep core source-backed self-marked writing genuinely useful on every tier; FI-007 automated marking is separate |
| 10–11 measurement/Founder assurance | **Prepared** | Real availability counts, valid selection/completion/saved evidence, failure/exception rates, no identifiable student text |
| 12–14 risk, feasibility and tests | **Prepared, source dependency** | Existing preferred-question launch and evidence reuse; authoring schema and 16-mark level/rubric evidence still to prove |
| 15 product authority | **BLOCKED pending approval** | Promote the revised §8 authority clause into active Course Learning Blueprint/Exam Prep authority through a governed Founder-approved change before/as Ready |
| 16 product/source blockers | **OPEN** | Authorise marks-first and paper-linked practice-only scope, level guidance/draft safety policy; assure original 2027-relevant 16-mark item set under #698 |
| 17 human Ready approval | **BLOCKED** | Explicit Founder \`LF-05 Analyse → Ready\` decision after DoR 1–16 is complete |

**Recommended delivery order:** (a) complete this indexed non-authoritative #813 decision package; (b) source-check 2027 longer-writing and prepare original 16-mark Psychology item proposals under the existing #698 content owner with A1/A2/A3 reviewer gates; (c) approve the final LF-05 product/evidence/UX authority and obtain explicit human Ready; (d) implement marks-first UI + approved standalone content adapter on a governed feature PR, with its own Founder merge approval; (e) production-proof and have the original learner independently test the actual requested 16-mark experience.

**Documentation impact:** This adds product analysis only, not current runtime or normative authority. The issue #706 and INDEX remain the pointers. Do not retroactively rewrite old source or failed acceptance evidence; any approved normative and implementation changes must be accompanied by the appropriate branch documentation, register and test updates.
