# Content Factory — generated content reaching the learner site

**Current implementation checkpoint:** 26 October 2026, branch `content-factory/site-content-ingestion-first`. Technical implementation note, not an educational approval, new licence, or change to release gates.

## One content-to-site path

The canonical learner application is `/revision/app/`. Vite discovers validated `content/**/index.ts` packs via `src/engine/content/content-registry.ts`. Each `contentPackSchema` pack supplies Learn, Practice and Exam Prep through `src/engine/content/content-adapter.ts`. Learner membership controls which available packs a student can see; never expose draft content by marking it `available` without existing release assurance.

**This change closes a real content integration gap.** Previously AQA 7132 Fast-Path Practice flashcards and extended questions were imported directly by `src/app/FocusedLearningWorkspace.tsx`, forcing the learner screen to know the course and where assets came from. The generated Learn material already entered through the AQA course pack. Now all three AQA A-level Business 7132 packs expose generated flashcards and structured bank questions through the same validated pack and adapter as Learn and Exam Prep. The workspace no longer imports either AQA-specific content module. Existing AQA 7132 bank question identifiers retain their original `aqa7132-<batch>-<id>` format and source classification to protect learner evidence continuity; authored question IDs and published exam mocks are unchanged.

## Contract for a new course

- **Learning:** Put suitable authored/generator-assured `LearnCourse` chapters on the pack's `learn` field, mapped to declared learner topic IDs.
- **Recall and Practice:** Put flashcards and MCQs in `flashcards` and `questions`; put extended/calculation Practice records on the optional `practiceBank` field. For a **new qualification** (anything except the existing AQA 7132 compatibility bank), every extended bank record must include `topic_id` matching the pack's declared topic and a stable `namespace` so questions cannot collide with another course. Unscoped records fail `contentPackSchema`.
- **Exam Prep:** Paper-specific original simulated assessments enter `exams` as they do today, independently governed and validated against exact Exam Truth.
- **Publish:** Only an appropriately assured content pack with `manifest.status: 'available'` joins the published catalogue. A successful TypeScript build or structural content pack parse does **not** prove curriculum coverage, response marking validity, factual accuracy or qualified release acceptance.

## Executable real-course proof

`npx vitest run src/engine/content/content-adapter.test.ts content/business/aqa-a-level/content.test.ts`

The tests use **actual published AQA 7132 packs**, not fictional research specimens. They assert all three course packs expose generated retrieval cards and all originally released structured question-bank records from the canonical adapter without losing IDs, and that representative marketing questions can be assembled in the same Practice session path. They also verify real Learn chapters, original mock papers, and reject a non-AQA pack with unscoped bank questions. All existing safety, publication, role/learner evidence, and browser tests remain in normal CI.

## Still to prove for the sole product objective

**This is one existing qualification's site-ingestion proof, not proof that the Content Factory can efficiently author and assure arbitrary new courses.** Before declaring the process successful, produce a *second board or qualification* from an independently complete, rights-approved exact course/Exam Truth, validate Learn/Practice/Exam Prep depth, run the unchanged site adapter **without new subject-specific learner UI imports or branches**, perform the permitted assurance, and measure total human effort, provider cost, retry/rework, time to usable catalogue content, and a real learner's full study journey.

The content licence, Foundation `ai_assured` and release limitations remain as set by existing authority. There is **no approval here to publish 9BS0 research drafts**, bypass source restrictions, or claim a 2027 Edexcel full course. This prevents structural proof from becoming another misleading project completion milestone.

**Documentation impact:** This technical implementation note, existing AQA pack tests, generic adapter, schema and learner Practice source wiring. No new constitutional, normative workflow, product feature or ADR requirement: this is a narrower correction of approved content/data architecture, and historical source evidence remains unchanged.
