# LF-06 — Psychology mental-health atomic flashcards

**State:** Candidate on governed branch; not merged, deployed or independently learner-accepted. Issue #765 LF-06; wider assessment/content review stays #698/#787.

## Canonical learner journey and source

The canonical `/revision/app/` → Courses → AQA Psychology 7182 → Practice → Clinical Psychology and Mental Health → Flashcards uses the common `psychologyFlashcards` from `content/psychology/aqa-a-level/shared/course.ts` through the standard content adapter. The first published definitions card formerly required recall of four different definitions plus relationships and limitations in one prompt. This is an unsuitable single-card retrieval demand.

Exact syllabus reference: Founder-supplied AQA Psychology 7182 v1.4 (1 September 2025), §4.1.4, printed p18, which requires definitions of mental health: deviation from ideal mental health, deviation from social/cultural norms, failure to function adequately and statistical infrequency. Authored answers are original concise paraphrases and include careful interpretive boundaries; no examiner endorsement is asserted.

## Bounded correction

Replace only `psy-psy0401-card` with four explicit, individually answerable definition cards using newly versioned IDs (`psy-psy0401-*-card-v2`). Keep every other 117 requirement card, all three existing Psychology paper packs, Learn materials, scored questions, exam papers and question identities unchanged. No database migration.

The former card ID is deliberately not reused: its prior self-rated evidence remains retained under that ID, and must not be reinterpreted as a rating for any of the new cards. New cards begin unassessed; flashcard self-ratings still are not independently scored mastery.

The standard flashcard deck remains capped at 12 cards and uses existing saved rating/ordering mechanics. Tests assert four exact new IDs, unique IDs, single-demand prompts, topic identity and course total 121 (former 118 minus one plus four).

## Assurance / remaining work

Exact-head CI (static, unit, build, responsive, security and data-path suites) and current-main integration are required. Live authenticated learner test and independent AQA-alignment/readability review remain outstanding. This is **one targeted correction**, not the complete Business/Psychology flashcard-quality audit; other long compound cards are a known open risk.

**Documentation impact:** Existing Course Learning Blueprint and Learner Design System already govern atomic meaningful active retrieval; no normative authority change, ADR or schema change. This implementation note and INDEX pointer accompany the code and tests. Retain historical evidence unchanged.
