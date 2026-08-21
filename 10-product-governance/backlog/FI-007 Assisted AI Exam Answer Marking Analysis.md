# FI-007 — Assisted / AI Exam-Answer Marking Analysis

**Document type:** product feature analysis  
**Authority:** non-authoritative product-management analysis; records Founder-approved analysis decisions but does not by itself promote FI-007 into normative product authority  
**Status:** Analyse  
**Owner:** Product / Founder  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Last updated:** 2026-08-21  

## Purpose

Define FI-007 sufficiently to satisfy Revision's governed Definition of Ready before any material implementation begins.

This record must be read with:

- `80-company-workflows/Feature Definition and Measurement Workflow.md`;
- `10-product-governance/Scope and Capability Taxonomy.md`;
- `10-product-governance/Product System Model.md`;
- `20-brand-and-experience/Product UX Principles.md`;
- `20-brand-and-experience/Tone of Voice Framework.md`;
- `20-brand-and-experience/Emotional Experience Principles.md`;
- `40-evidence-and-trust/Evidence Trust and Educational Integrity.md`; and
- `40-evidence-and-trust/Claims and Progress Governance.md`.

FI-007 remains in `Analyse`. Founder approval of an individual analysis decision does not constitute the final `Analyse → Ready` approval.

---

## 1. Current product problem

Revision already supports exam-style written questions and marking guidance, but the learner currently performs the final judgement themselves. That creates a weak point in the assessment loop: the student is asked to interpret marking guidance accurately at the moment when they are least likely to know whether their own answer is strong.

A useful assisted-marking capability should therefore do more than return a number. It should help the learner understand:

- what their answer demonstrated;
- where marks were earned;
- where marks were missed;
- how the answer could be improved; and
- what the result means for the next useful revision action.

The strategic value is strongest when reliable marking evidence can participate in Revision's wider loop:

`answer → marking/feedback evidence → learner state → readiness/planner/REV → next action`

The product must not create false confidence by sounding examiner-like when the evidence or marking reliability is insufficient.

---

## 2. Founder-approved MVP boundary — 21 August 2026

**Decision status:** Approved analysis decision.  
**Lifecycle effect:** FI-007 remains `Analyse`; this decision satisfies the MVP-boundary direction but does not complete the Definition of Ready.  

### MVP proposition

A learner completes a **supported Revision exam-style written question using typed text**. Revision evaluates the answer against the **governed marking pack for that exact question** and returns:

- a confidence-controlled provisional mark where sufficiently reliable;
- an explanation of where marks were earned;
- an explanation of where marks were missed;
- concrete improvement guidance; and
- a route to improve and resubmit the answer.

Where the first attempt is sufficiently reliable, the resulting structured marking record may become learning/exam-readiness evidence subject to the evidence model's normal confidence, weighting and corroboration rules.

### Supported content boundary

The MVP marks only questions for which Revision controls or has deliberately assured the full assessment context required for reliable marking.

Each supported question must have, as applicable:

- exact question identity and wording;
- correct qualification, exam board, specification and assessment-component context;
- maximum mark;
- specification/topic mapping;
- assessment-objective mapping where relevant;
- governed marking guidance / rubric / mark scheme appropriate to the question;
- relevant level descriptors or indicative content where the assessment model requires them;
- approved provenance sufficient to trace the marking basis; and
- an explicit indication that the question is eligible for assisted marking.

The marking request therefore operates on a bounded contract conceptually equivalent to:

`known question + known assessment context + governed marking pack + learner answer`

It is not a generic instruction to an AI model to infer how an arbitrary answer should be marked.

### Initial subject/catalogue boundary

The first implementation should prove the marking approach within a narrow assured catalogue rather than launch across all subjects and boards simultaneously.

The expected starting point is the existing assured AQA Business pilot, subject to later technical/content feasibility confirmation during this analysis.

Catalogue expansion must follow proven marking quality and content-pack readiness rather than precede them.

### Answer-input boundary

MVP input is **typed text only**.

This deliberately removes handwriting recognition, image ingestion and OCR uncertainty from the first reliability test. Those are separate capabilities that may be assessed later once marking quality on clean textual answers has been demonstrated.

---

## 3. Founder-approved learner result direction

The result should be concise, useful and improvement-oriented rather than a long AI essay.

The minimum result should contain:

1. **Mark outcome** — a Revision-assessed provisional mark where confidence permits.
2. **What you did well** — grounded in the learner's actual answer and governed marking criteria.
3. **Where marks were missed** — explicit gaps, weaknesses or underdeveloped reasoning.
4. **How to improve** — a small number of prioritised, concrete actions.
5. **Primary next action** — improve/resubmit the answer where pedagogically useful.

Learner-facing wording must not imply that Revision is the awarding body, an examiner of record or a guaranteed substitute for human examiner judgement.

The detailed end-to-end learner marking experience was Founder-approved on 21 August 2026 and is recorded in section 11.

---

## 4. Resubmission is inside MVP

The MVP should allow the learner to act on feedback, improve the answer and submit it again.

This is necessary because the strongest product value is not merely `answer → mark`; it is:

`answer → feedback → improvement → reassessment → next action`.

### Evidence distinction

The original unaided attempt and a revised post-feedback attempt must not be treated as equivalent evidence.

At minimum, the evidence contract must distinguish:

- independent first attempt;
- assisted/improved attempt after Revision feedback; and
- subsequent attempts where prior feedback may materially influence performance.

A high-scoring revised answer may demonstrate learning and successful application of feedback, but it must not automatically be interpreted as equally strong evidence of independent exam readiness.

Repeated resubmission must not mechanically inflate mastery/readiness merely because the learner can iterate toward a maximum mark with assistance.

---

## 5. Confidence-controlled marking behaviour

Marking confidence is a first-class part of the MVP, even if the learner-facing experience uses simpler language than the internal evidence model.

The system must be capable of distinguishing at least conceptually between:

### Sufficiently high confidence

Revision may provide a numerical provisional mark and grounded feedback. The resulting evidence may be eligible for normal downstream processing, subject to validated weighting rules.

### Medium / qualified confidence

Revision may provide a mark range, explicitly provisional mark or otherwise qualified outcome if validation demonstrates that such behaviour is safer than a false-precision exact mark. The resulting evidence should carry reduced strength/confidence downstream.

### Insufficient confidence

Revision must not invent precision.

It should decline to provide a confident numerical result while still helping the learner review the answer where safe and useful. This may include grounded qualitative feedback or directing the learner to the governed marking guidance.

The exact confidence model and thresholds remain unresolved and require validation against human-marked benchmark data.

---

## 6. Evidence-system boundary

The AI marking component must not directly declare mastery, readiness, predicted grade or final topic state.

Its responsibility is to produce a structured marking evidence record describing what occurred, including as applicable:

- question identity;
- course/specification/component context;
- learner answer / answer reference;
- attempt type;
- mark awarded and maximum mark;
- marking confidence;
- assessment-objective signals;
- topic/specification signals;
- marking-method/version metadata;
- marking-pack/version metadata; and
- material exception/review state.

Revision's deterministic learner-state/evidence logic then decides what the evidence means in combination with other evidence.

This preserves the existing separation between evidence collection and higher-level readiness/mastery interpretation.

One AI-marked answer must not automatically redefine a learner's overall position, particularly where earlier or stronger evidence conflicts with it.

---

## 7. Explicit MVP exclusions

The following are **not part of the FI-007 MVP**:

- handwritten-answer marking;
- photographs of answers;
- OCR;
- learner-uploaded PDFs or documents;
- marking an arbitrary question pasted from elsewhere;
- unrestricted past-paper question ingestion;
- every exam board or subject at launch;
- whole-paper automated marking;
- automatic Exam Simulator full-paper marking;
- voice answers;
- handwriting-quality assessment;
- teacher/classroom marking workflows;
- comparison/ranking against other learners;
- predicted grades derived from a single marked answer;
- fully conversational tutoring during the marking interaction;
- AI rewriting the learner's complete answer as the default feedback mechanism;
- marking where Revision lacks a governed marking source; and
- numeric marks for guided/unscored activities that do not have an approved mark allocation and marking model.

These exclusions are deliberate risk controls, not a statement that the capabilities can never be considered later.

---

## 8. Question-type sequencing principle

The MVP should not prove itself first on the hardest, most subjective high-mark essays.

Validation and implementation should progress from question types with more bounded marking semantics toward questions requiring increasingly judgement-heavy level/band decisions.

Conceptually:

1. structured short/medium written responses;
2. more analytical level-based responses; then
3. high-mark evaluative responses where adjacent-band judgement is materially harder.

This sequencing is intended to reveal the limits of the marking approach rather than maximise impressive-looking demo coverage.

The exact first supported question set remains a Definition-of-Ready decision and should be selected using representative assessment demand rather than only easy examples.

---

## 9. MVP validation objective

The critical MVP question is:

**Can Revision mark bounded supported exam answers closely enough to trusted human marking that the resulting feedback is safe and useful for learners?**

Usage volume alone is not proof of product success.

### Required benchmark approach

Before production trust is established, FI-007 requires a human-marked benchmark dataset containing representative answers such as:

- weak answers;
- average answers;
- strong answers;
- incomplete answers;
- borderline level/band answers;
- unusual but valid answers; and
- answers containing plausible but incorrect content.

The benchmark should be independently human-marked to a standard sufficient to act as the reference comparison.

### Candidate marking-quality measures

The final validation contract remains to be approved, but should assess at minimum where relevant:

- exact-mark agreement;
- agreement within an acceptable mark tolerance;
- correct level/band allocation;
- assessment-objective agreement;
- false-credit rate;
- false-penalty rate;
- unsupported/fabricated marking-criterion rate;
- confidence calibration;
- stability/repeatability of marking;
- material disagreement rate requiring review; and
- quality/actionability of improvement feedback.

Borderline answers require deliberate emphasis because apparently plausible AI marking can still be materially unreliable at boundaries.

A zero-tolerance control should apply to fabrication of assessment criteria that do not exist in the governed marking pack.

The exact quantitative release thresholds remain unresolved and must be set before `Ready`.

---

## 10. Relationship to adjacent features

### FI-003 — Full REV Intelligent AI Tutor

FI-007 may eventually use REV to explain feedback or coach a learner through improvement. The MVP does not require the full conversational tutor experience and must remain viable as a bounded marking capability.

### FI-020 — AI Case-Study Feedback and Coaching

Guided/unscored case-study activities remain coaching rather than formal marking unless they are deliberately converted into assured exam-style questions with governed marks and marking criteria. Formal marking then belongs under FI-007.

### FI-002 — Subscription Plans / Feature Entitlements

Final Free/Paid/Premium packaging is unresolved for FI-007 and must be completed before the feature is `Ready`. Educational truth, marking confidence and safety controls may not be degraded by tier.

### Exam Simulator

Whole-paper automatic marking is deliberately outside MVP. FI-007 should first prove reliable bounded question-level marking. Exam Simulator integration can be assessed later once the marking engine has passed the applicable reliability gate.

---

## 11. Founder-approved end-to-end learner marking experience — 21 August 2026

**Decision status:** Approved analysis decision.  
**Lifecycle effect:** FI-007 remains `Analyse`; this closes the MVP experience/simplicity decision but does not complete the Definition of Ready.  

### 11.1 Entry point

Assisted marking is **embedded into supported written exam-question practice**. It is not a separate generic `AI Marker` destination in the MVP.

The learner enters a supported question through the normal Practice or later Exam Prep context, sees the question and mark allocation, writes a typed answer, and uses the primary action:

**Mark my answer**

The marking interaction must preserve the academic context already established by the activity. The learner should not need to select the subject, board, specification or marking scheme again.

A separate confirmation screen before marking is not required.

### 11.2 Independent-attempt protection

Where the attempt is intended to contribute meaningful independent exam-performance evidence, governed marking guidance must not be revealed before the learner's first submission.

If hints, marking guidance or REV assistance materially shape the answer before submission, Revision may still mark the answer, but the evidence record must represent the attempt as assisted rather than independent.

The product should not hide useful help simply to manufacture stronger evidence; it should instead preserve truthful evidence semantics about how the answer was produced.

### 11.3 Submission behaviour

When the learner selects **Mark my answer**, Revision must:

- preserve an immutable snapshot/reference of what was submitted;
- create the attempt before starting the marking request;
- prevent the submitted first attempt from being silently overwritten by later edits;
- prevent accidental duplicate submissions from creating misleading evidence; and
- retain the answer safely if the downstream marking operation fails.

An empty answer should receive a simple inline prompt to enter an answer first.

Revision should not reject an answer merely because it appears short, weak or incomplete. Those are legitimate assessment outcomes and should be marked accordingly where the marking contract supports it.

### 11.4 Processing state

The default processing state should remain simple:

**Marking your answer…**

Revision may use the established REV visual treatment or restrained motion to make the state feel responsive, but it must not invent fake multi-stage AI progress such as claiming to be checking specific assessment objectives unless those stages correspond to real product behaviour.

The learner's work must already be saved before this state begins.

If the marking operation fails, the experience should state what happened, confirm that the answer is safe and offer a clear retry path, for example:

**We couldn't mark that just now. Your answer is saved.**

**Try again**

### 11.5 Result hierarchy

For a normal reliable mark, the primary result hierarchy is:

1. **Mark**, for example `7 / 9`.
2. A short plain-language interpretation, for example `Strong application. Your analysis needs one more step.`
3. A small source label such as **Revision-assessed mark**.
4. **What you did well**.
5. **Where you missed marks**.
6. **Make it stronger** — normally one to three prioritised improvement actions.
7. A context-sensitive primary next action.
8. Secondary progressive disclosure such as **See how this was marked**.

The first result view should be scannable. The product should not dump the full mark scheme or a long AI explanation onto the learner before the useful interpretation.

**See how this was marked** may progressively reveal relevant assessment objectives, mark/level reasoning, governed marking criteria and the parts of the learner response that support the judgement where the validated marking design can do so reliably.

### 11.6 Learner-facing confidence behaviour

Internal confidence must change product behaviour rather than forcing the learner to interpret a pseudo-precise AI-confidence percentage.

#### Normal / high-confidence result

Show a numerical provisional mark and grounded feedback, labelled so that it is clear the result is Revision-assessed rather than an official awarding-body mark.

A large confidence badge or percentage is not required when there is no material uncertainty for the learner to act on.

#### Borderline / qualified result

Where validation supports a range more honestly than an exact number, Revision may show a bounded result such as:

**Likely 6–7 / 9**

with a short explanation that the answer is close to a marking boundary and a human marker could reasonably differ.

#### Low-confidence result

Revision must not provide a precise numerical mark when it cannot do so reliably.

The result should say plainly that Revision cannot give a reliable mark, while still offering grounded qualitative review, the relevant marking guidance where appropriate and a route to check/review the judgement.

The exact confidence thresholds and mapping to these states remain subject to benchmark validation before `Ready`.

### 11.7 Disputed mark / review experience

A learner must have a simple way to challenge a result, using language such as:

**Think this mark is wrong? → Check this mark**

The product should avoid examiner-like language such as `Appeal` for the normal learner interaction.

The technical arbitration mechanism remains unresolved, but the experience rule is fixed: a review must be deliberately designed and must not simply re-run the same unconstrained marking request and show whichever result appears on the second pass.

If a checked mark changes materially, Revision must explain that the judgement changed rather than silently replacing the original record.

### 11.8 Improve and resubmit

Where improvement is the most useful next action, the primary CTA is:

**Improve my answer**

The learner returns to their answer with the relevant feedback available, edits the answer and then selects:

**Mark my improved answer**

The original attempt remains preserved.

A later result may explicitly show improvement, for example `8 / 9 — up from 6 / 9`, and explain what changed in the answer that made it stronger.

The experience should help the learner understand:

`what I wrote → what I changed → why it became better`

The evidence layer continues to distinguish independent and feedback-assisted attempts.

### 11.9 Context-sensitive next action

The result screen should not always force resubmission.

The primary next action should respond to the result, for example:

- substantial improvement opportunity → **Improve my answer**;
- strong/full response → **Next question**;
- low marking confidence → **Check this mark** or **Review marking guidance**;
- clear knowledge gap → a later bounded route to **Review this topic** where the wider product model supports it.

This keeps FI-007 connected to the wider Revision loop rather than ending at a score.

### 11.10 Model-answer rule

A complete model/full-mark answer should **not** be the default immediate response to an imperfect first attempt.

The intended learning sequence is:

`feedback → learner improves → resubmits`

A strong example answer may be available later through secondary disclosure where educationally useful, but AI should not routinely replace the learner's thinking by presenting the finished answer before they have attempted improvement.

### 11.11 REV role in the experience

FI-007 remains usable as a bounded marking capability without requiring a full conversational REV session.

REV may be available in context to explain feedback or help the learner understand a weakness, but the MVP marking flow should not automatically turn every result into an open-ended chat.

REV assistance that materially shapes a subsequent answer must be represented truthfully in the attempt/evidence semantics.

### 11.12 Mobile and accessibility behaviour

The information hierarchy must work mobile-first rather than designing a desktop marking dashboard and shrinking it later.

On narrow screens, the result should stack naturally in the same order: mark/interpretation → useful feedback → next action → deeper disclosure.

During answer improvement, desktop/tablet may use a side-by-side or tabbed answer/feedback treatment where it remains usable; mobile should stack or switch views rather than create cramped parallel panes.

The implementation must meet Revision's WCAG 2.2 AA target and in particular:

- not communicate result meaning through colour alone;
- support full keyboard operation;
- move/focus the learner sensibly when asynchronous marking completes;
- expose processing and error states accessibly;
- keep long answers and feedback readable at supported viewport sizes; and
- provide screen-reader-compatible structure for marks, feedback headings and actions.

### 11.13 Approved experience flow

The approved MVP experience is therefore:

`supported question → independent or truthfully assisted typed answer → Mark my answer → saved attempt → simple marking state → confidence-controlled result → concise explanation → improve/resubmit or appropriate next action → structured evidence → wider Revision loop`

This deliberately makes **improvement and learning**, not the novelty of an AI score, the centre of the feature.

---

## 12. Definition-of-Ready position after learner-experience decision

The current position is:

- Student problem and target user — **PARTIAL**; core problem is defined, but target learner/use context needs final wording.
- Strategic case — **PARTIAL**; strong fit established, opportunity-cost case still to complete.
- User-value hypothesis — **PARTIAL**; needs final falsifiable hypothesis and success measures.
- Experience and simplicity — **PASS for MVP analysis direction**; Founder approved the end-to-end learner marking experience on 2026-08-21, including submission, processing, result hierarchy, uncertainty, disputed-mark recovery, resubmission and mobile/accessibility behaviour. Final UI artefacts remain implementation/design work within this approved behaviour.
- Evidence / intelligence model — **PARTIAL**; major evidence boundary and independent-versus-assisted attempt distinction are agreed, weighting/confidence thresholds remain unresolved.
- REV role — **PARTIAL**; bounded in the learner journey, but the final cross-feature role and entitlement implications still need closure.
- MVP boundary — **PASS for analysis direction**; Founder approved 2026-08-21.
- Free / Paid / Premium — **BLOCKED**; not yet decided.
- Upgrade / conversion hypothesis — **BLOCKED**; depends on tiering.
- Measurement contract — **PARTIAL**; marking-quality direction established, quantitative thresholds and product metrics unresolved.
- Admin / Founder assurance — **BLOCKED**.
- Risk / trust / accessibility — **PARTIAL**; learner-facing uncertainty, failure recovery, answer preservation and accessibility direction are now defined, but control design remains incomplete.
- Technical feasibility and dependencies — **BLOCKED** pending structured marking-pack/data/model feasibility analysis.
- Test and assurance approach — **PARTIAL**; benchmark principle agreed, full assurance architecture unresolved.
- Documentation / authority impact — **PARTIAL**; likely authorities identified, final promotion set not yet prepared.
- Blocking decisions — **REMAIN**.
- Human Definition-of-Ready approval — **NOT REQUESTED**.

FI-007 therefore remains correctly in `Analyse`.

---

## 13. Next analysis decision

The next material product decision is **Free / Paid / Premium packaging and usage allowances** for FI-007.

This decision should determine:

- whether assisted marking itself is available on Free or only a bounded allowance is available;
- what materially stronger repeat-use value Paid receives;
- whether Premium adds deeper REV coaching, larger allowances, richer longitudinal insight or another defensible benefit;
- what happens when an allowance is reached;
- how upgrade value is discoverable without surprising a learner after they have already completed an answer;
- how a parent/payer understands the value where they are the purchaser;
- how AI cost-to-serve affects allowances without creating arbitrary educational degradation; and
- which parts of marking truth, confidence, evidence integrity, safety and accessibility must remain identical regardless of tier.

The packaging decision should follow the already-approved FI-002 principle that Free proves the value, Paid compounds the value and Premium maximises the value, rather than turning Free into a non-functional demo.

---

## 14. Documentation impact check

This change records a Founder-approved decision within active FI-007 analysis. It does **not** promote FI-007 into normative product authority, change implementation truth or move the feature to `Ready`.

No current code, technical documentation, ADR, assurance register, `INDEX.md` entry or numbered normative authority requires amendment solely to record this analysis decision.

Before `Analyse → Ready`, the applicable normative product/evidence/experience/commercial authority must be updated so the approved feature behaviour does not live only in this backlog analysis record.
