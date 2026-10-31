# Issue #698 — AQA Business 7132 Paper 1 choice and pacing guidance correction

**31 October 2026 — governed candidate, not merged/live.** Canonical learner route: `/revision/app/` → Courses → AQA A-level Business 7132 → Exam Prep → `ExamPrepPage` → expanded paper, **On the day**. The runtime reads `src/app/exam-prep.ts` → `content/business/aqa-a-level/shared/exam-papers.ts`; `src/app/ui/exam/ExamPrepPage.tsx` renders the flagged `dayRules` and Paper 3 notes. Do not conflate this guide with the separate scored Practice or timed `ExamSimulator`.

## Exact source and issue

The Founder-supplied AQA 7132 **v2.0, 14 June 2023**, 42-page PDF has SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, independently matched in the 31 October audit workspace to Issue #698. Reference-only curriculum/assessment evidence; no PDF prose or official question/mark scheme is copied. Printed **p9** states Paper 1: Sections A 15 MCQs/15 marks; B short answers/35 marks; C and D **one essay from two** /25 marks each. Printed **pp9–10** give all three papers as 120 minutes and 100 marks, and Paper 3 as one compulsory case study with approximately six questions. There is **no prescribed separate 15-minute reading period** in the supplied paper summary.

The current published Exam Prep `dayRules` inaccurately instructs **"Answer every question"**, despite the verified essay alternatives, and says **"about 1 minute a mark"** without reconciling 120 minutes/100 marks. An unverified Paper 3 note prescribes 15 minutes of initial reading. The old regression test explicitly preserved the incorrect `Answer every question` wording, notwithstanding a `needs_check` warning.

## Corrected learner supply

- Directly tell students to answer compulsory items but to choose **one of two essays in each of Paper 1 Sections C and D**. Both sections are mandatory; both alternatives in each section are not.
- Use the mathematically accurate **72 seconds (= 1 minute 12 seconds) per mark as a whole-paper average**, with clear advice to allow reading/checking time and adapt by question. Do not imply AQA prescribes uniform mark-by-mark timing.
- Replace the unexplained Paper 3 **15-minute** reading allocation with a non-prescriptive instruction to read case material and budget the two hours.
- Preserve the existing mandatory `needs_check` metadata for editorial advice and the `Calculator allowed` claim, which **remains unverified**. No promotion to official fact, nor misleading marking endorsement.
- Preserve every paper, 100-mark section structure, exam question/alternative ID, mock, answer and learner progress record. No new product feature, UI component, schema, database, scoring, planner or Psychology change.

## Assurance and limits

The updated `src/app/exam-prep.test.ts` exercises the actual learner guide returned by `examPapersFor('AQA','7132')`, asserts the two essay alternatives and correct on-page guidance, checks the 72-second arithmetic, forbids the old misleading copy, and confirms the reading note is non-prescriptive and remains flagged. The existing three-paper pack tests independently verify essay choice identity and marks. Exact-head CI, canonical signed-in browser verification and production deploy have **not** been claimed here. Scope is **one verified Exam Prep guidance deficiency**, not a whole-course Exam Prep, marker, simulation or requirement-adequacy pass. Qualified educational review and #698/#703 gates remain outstanding.

**Documentation impact:** This focused technical record, regression test, candidate published-guide correction and INDEX pointer travel in one PR. Approved Course Content and Assessment Component Placement, content-rights authority and claims standard are unchanged; no normative change or ADR. Historical records and provisional 501-candidate source inventories remain unmodified.
