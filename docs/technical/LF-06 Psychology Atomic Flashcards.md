# LF-06 — Psychology mental-health atomic flashcards

**State:** Released to production through PR #796 on 3 November 2026. Authenticated reporting-learner, accessibility and independent qualified educational acceptance remain outstanding. Issue #765 LF-06; wider content assurance stays #698/#787.

## Canonical learner journey and source

The canonical `/revision/app/` → Courses → AQA Psychology 7182 → Practice → Clinical Psychology and Mental Health → Flashcards uses the common `psychologyFlashcards` from `content/psychology/aqa-a-level/shared/course.ts` through the standard content adapter. The first published definitions card formerly required recall of four different definitions plus relationships and limitations in one prompt. This is an unsuitable single-card retrieval demand.

Exact syllabus reference: Founder-supplied AQA Psychology 7182 v1.4 (1 September 2025), §4.1.4, printed p18, which requires definitions of mental health: deviation from ideal mental health, deviation from social/cultural norms, failure to function adequately and statistical infrequency. Authored answers are original concise paraphrases and include careful interpretive boundaries; no examiner endorsement is asserted.

## Bounded correction

Replace only `psy-psy0401-card` with four explicit, individually answerable definition cards using newly versioned IDs (`psy-psy0401-*-card-v2`). Keep every other 117 requirement card, all three existing Psychology paper packs, Learn materials, scored questions, exam papers and question identities unchanged. No database migration.

The former card ID is deliberately not reused: its prior self-rated evidence remains retained under that ID, and must not be reinterpreted as a rating for any of the new cards. New cards begin unassessed; flashcard self-ratings still are not independently scored mastery.

The standard flashcard deck remains capped at 12 cards and uses existing saved rating/ordering mechanics. Tests assert four exact new IDs, unique IDs, single-demand prompts, topic identity and course total 121 (former 118 minus one plus four).

## Source and evidence boundaries

The exact Founder-provided AQA Psychology 7182 PDF (SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`) lists **four definitions in the field of mental health** in §4.1.4, printed page 18. These four retrieval prompts specifically address those definitions; they are not an exam-preparation or evaluation-completeness claim. The unchanged PSY-04-01 Learn page still supplies the full approved Course Truth explanation, Jahoda's ideal mental-health criteria, related research distinctions and evaluative limitations.

The existing launch-review and source-to-learner audit originally assumed *one flashcard per Course Truth requirement*. The initial candidate's [CI #41517333971](https://github.com/lhanson-dev/revision/actions/runs/41517333971) correctly failed these safeguards: the count changed from 118 to 121; `psy-psy0401-card` was deliberately retired; the launch review could not find its former ID. The isolated signup job also failed because a local Supabase test attempted to bind port 54322 while already in use; this was not an application sign-up defect. Do **not** treat the initial failing run as acceptance.

Corrections now expose `psychologyFlashcardsForRequirement` as the single source mapping: 117 requirements retain one existing card each; PSY-04-01 maps to exactly four new cards. The independent Psychology launch packet contains **all four** cards and review-scope IDs (not one arbitrary representative). Course and source-to-performance tests require the exact 118 requirement/121 card counts, preserve all published cards in all three paper packs and verify the original full Learn explanation was not discarded. No retired card is made active merely to satisfy a count.

Historical flashcard evidence on `psy-psy0401-card` remains present under the old content ID in persistence but is not mapped to or credited to any new card ID. Existing scored questions, marking and progress thresholds are untouched; short self-rated retrieval does not assert independently measured mastery.

## Assurance / remaining work

At the pre-merge stage, exact-head CI and current-main integration were required; their verified outcome is recorded below. Live authenticated original learner testing, high-zoom/screen-reader acceptance and qualified educational AQA alignment/readability review remain outstanding. This is **one targeted correction**, not the complete Business/Psychology flashcard-quality audit; other long compound cards remain a known open risk.

**Documentation impact:** Existing Course Learning Blueprint and Learner Design System already govern atomic meaningful active retrieval; no normative authority change, ADR or schema change. This implementation note and INDEX pointer accompany the code and tests. Retain historical evidence unchanged.

## Verified release receipt — 3 November 2026

The Founder explicitly approved **merge PR #796** after [latest exact-head CI #41549150393](https://github.com/lhanson-dev/revision/actions/runs/41549150393) completed **success across all 9 required jobs**. Machine-readable exact-commit approval was recorded under the Founder GitHub login in [comment #6591737921](https://github.com/lhanson-dev/revision/pull/796#issuecomment-6591737921), and the trusted `revision/founder-approval=success`, timestamp and zero-behind integration were independently checked immediately before merging.

[PR #796](https://github.com/lhanson-dev/revision/pull/796) was squash-merged as `e6ed983916116300bfdfb9b9af88b14d0b19a53a`. [Governed production release #41550534115](https://github.com/lhanson-dev/revision/actions/runs/41550534115) **completed successfully**: release lineage, backend readiness, build, Pages deploy, production smoke and exact merge-commit `revision/path-to-live=success` all passed. Separate [post-merge CI #41550534219](https://github.com/lhanson-dev/revision/actions/runs/41550534219) is independently assessed; production release success does not automatically establish its conclusion.

**Learner impact:** Four individually answerable flashcards replace a single broad mental-health definitions warm-up in the live Psychology Practice experience. This is **not** a new scored examination item or reliable skill-mastery signal. Original composite-card historical self-ratings remain on their retired content ID and do not transfer to the four new cards. Learn teaching, scored questions, exam papers and saved student records remain unchanged. No database migration and no normative authority amendment.

**Still open:** Original reporting-learner authenticated testing, keyboard/high-zoom/screen-reader checks, independent qualified educational review, and a complete systematic atomic-card audit across Psychology and Business. Track under #765/#698, not as closed from this release alone.
