# FI-001 — Supervised A-level learner comprehension study protocol
**Prepared:** 20 October 2026  
**Candidate:** PR #637 (exact deployed/tested commit to be recorded at execution)  
**Status:** STUDY PACKAGE PREPARED — STUDENT COMPREHENSION NOT YET OBSERVED  
**Owner:** Product / educational QA; supervised researcher, accountable safeguarding contact, and consent controller to be appointed before recruitment.

## Decision and ethical boundary
This is a supervised **usability / explanation comprehension** study, not a learning-outcome efficacy trial, a demonstration of improved grades, or permission to release the candidate to unsupervised students. Do not expose participants to unassured marks or tell them that self-marked responses have been assessed by an examiner. Use a deliberately controlled test environment and approved, non-identifying seeded accounts. The FI-001 educational/content gate and the release gate remain separate.

### Eligibility and sample
Recruit 6–8 A-level learners aged approximately 16–18 from the intended UK audience, including learners studying Business and/or Psychology, varied prior confidence, one or more limited-time situations, and participants who use mobile or accessibility support. Avoid implying statistical representativeness. Record characteristics only to the extent needed to explain findings; do not record diagnosis, full legal names, grades, or detailed health/learning disclosures. Include a first-use participant; seek external support/recruitment if sample bias is excessive. No participants have been recruited or observed for this checkpoint.

### Safeguards before any contact
1. Get written research approval and a named accountable adult/safeguarding escalation contact. Explain to participants in age-appropriate language that this tests the product, not their academic ability; withdrawing or skipping tasks carries no consequence.
2. Record informed participant consent; obtain parent/guardian permission where required by applicable consent, organisation and safeguarding rules. Do not assume an A-level student is legally an adult.
3. Use pseudonymous study identifiers and seeded fictional exam dates/results and subjects rather than real login, real private learning evidence or real examination profiles. No unsupervised invitation to production. Moderator must not request personally identifiable answers or real distress disclosures.
4. Do not collect audio, screen video, raw essays, REV transcripts or free-form sensitive learner content by default. If additional recording is genuinely needed, obtain separate specific permission and approve secure access, retention and deletion before collection. Capture only task outcomes, anonymised observations, severity and verbatim short quotations with explicit consent.
5. Retention periods, information notice, deletion workflow and controller/processor handling must be explicitly confirmed under the privacy authority before launch, not invented here. Reconfirm accessibility and safeguarding response procedure. Stop immediately on discomfort or any serious risk; refer through approved safeguarding channels, never improvise automatic reporting.

## Set-up and execution
- **Environment:** accessible test build of exact reviewed commit, authenticated canonical `/revision/app/`, with only pilot-authorised original course content and controlled starting evidence; desktop/mobile as applicable. Verify against study start SHA; hide or explain unassured full-paper marking. Have a facilitator check route and assets before students arrive.
- **Session:** 35–45 minutes individually, moderator plus note-taker where practical; participant controls the application. Explain think-aloud as optional, without teaching the product. Record task completion and comprehension *before* any help. Only after recording initial response may moderator clarify.
- **Script:** “Imagine these are the exams and study results for a test student. Use Revision to tell us what you would do; there is no test of your own knowledge. Please say when anything is confusing.”
- **Counterbalancing:** vary order of learner fixtures and which course has the nearer paper. Do not repeatedly train the participant with solutions to later tasks. Include both fresh and return-user perspectives.
- **Required starting fixtures:** B1: Business 7132 three papers, known realistic dates, no scored evidence; B2: Business/Psychology 7182 with selected valid options, contrasted corroborated strengths and weaknesses, competing dates, low availability; B3: one missed week and one new valid result, with real persisted-shaped re-read; B4: genuinely insufficient remaining capacity / no future dates. Use published mapped content IDs, not invented starts. Archive and version the fixture IDs and date/timezone used.
- **Critical facilitator rule:** Never point at the correct button/answer or justify an activity before the student first responds. Show the intended explanation only after recording their own interpretation.

## Participant tasks and measures
| ID | Independent prompt | What to observe (without teaching) |
|---|---|---|
| U1 | “What exactly would you do first today? Start it.” | Correct exact supported activity, perceived duration, independent start, navigation errors, confidence |
| U2 | “What are you trying to achieve this week?” | Names useful topic and treatment outcome, bounded time, no impression all syllabus covered |
| U3 | “Show how this connects to the next exam and to your later exams.” | Distinguishes shared course knowledge and paper skills; correctly identifies remaining-paper obligations |
| U4 | “Why this rather than your other subject or topic?” | Cites plausible evidence, exam proximity and trade-off; does not infer zero knowledge from missing evidence |
| U5 | “You’ve just got this practice result. What does it prove and what does it not prove?” | Distinguishes objective check vs written self-assessment, insufficient evidence, no invented predicted grade |
| U6 | “Imagine you missed last week's revision. What now?” | No presumed overdue debt, clear revised action, no claim their knowledge automatically declined |
| U7 | “Now you improve in one weak topic, or the exam moves. What changed and why?” | Understands changes in priority across Home/Plan/REV, no bogus completed-exam activity |
| U8 | “You have much less time than the recommended work needs. What will not fit?” | Locates realistic omission, recognises no comprehensive coverage/guarantee, knows how to revise time input |
| U9 | “What happens if you have not set dates or availability?” | Distinguishes unknown from zero, can start useful unscheduled work |

For each task record: unaided completion (yes/no), accurate explanation (correct / partial / incorrect), elapsed time by stopwatch, errors and backtracks, prompts required (0/1/2+), uncertainty, accessibility barrier, and risk severity. Do not convert completion speed into mastery. Track the exact screenshot/route, wording, content and changed state relevant to the finding.

## Predeclared decision rules
- **Critical integrity: 100%** of observed participants must be able to recognise the distinction between an authored check and examiner-marked written performance after using the built-in explanation; any material false-readiness or mistaken full-coverage claim caused by the UI is a blocking educational defect, irrespective of aggregate success.
- **Core orientation: at least 80%** complete U1 and accurately explain U2/U4 without facilitator steering, and identify a valid next action after changed circumstances (U6/U7). This threshold is a proposed *usability acceptance rule*, not a claim of statistical reliability; failures still require case-by-case review.
- **Known uncertainty and scarcity:** no participant should be actively misled to think absent evidence equals zero mastery, missed work equals knowledge loss, or a limited calendar guarantees exam readiness. Treat each observed misleading outcome as a blocking or material finding depending on consequence.
- **Accessibility:** no participant should be unable to complete a critical path due to keyboard, screen reader, target or comprehension barriers. Record separately from generic task success and triage against the active accessibility standard.
- If sample or real-activity authenticity is inadequate, verdict = **NOT YET OBSERVED / INCONCLUSIVE**, never PASS. Education/qualified content review and software CI cannot substitute for students' own independent comprehension.

## Observation form (duplicate per participant)
Study ID / date / tested commit / device-accessibility support / facilitator / consent version:
Fixture and order:
| Task | Start/finish or time | Unprompted? | Meaning correct/partial/incorrect | Assistance | Exact observed problem/quote | Severity | Evidence pointer |
|---|---|---|---|---|---|---|---|
| U1–U9 | | | | | | | |
Final participant summary: understood today/week/exams/why/result/adaptation? No-identifiable-content notes.  
Issues: ID, severity, reproducible exact route/fixture, student impact, correction owner and retest result.  
Review sign-off: facilitator / Product / safeguarding lead where implicated / educational specialist for substantive claims.

## Exit and acceptance record
Publish aggregated, anonymised task counts and adverse cases, unresolved accessibility/safeguarding issues, environment SHA, observation dates, tested learner-facing wording, decision by scenario and explicit uncertainties. Preserve participant confidentiality. Re-run only materially impacted tasks after corrections, with new participants where training makes repeat testing invalid. Until such evidence exists: **student-comprehension acceptance NOT YET OBSERVED; no claim of student learning benefit.**
