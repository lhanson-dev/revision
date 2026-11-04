# LF-06 — Social Influence single-demand flashcards

**Status:** Draft content correction (not merged, not production verified, not accepted by original learner). Owners: #765 LF-06 and #698 AQA Psychology 7182 source/educational assurance.

## Canonical learner path and source

`/revision/app/` → Courses → AQA 7182 Psychology → Practice → Social Influence → Flashcards. Published `content/psychology/aqa-a-level/shared/course.ts` previously generated four **composite** card prompts from Course Truth `PSY-01-01`–`PSY-01-04`, each asking for definitions, evidence, relationships and limits together with a long all-part answer. This is not a single retrieval target.

Source alignment: Founder-supplied official AQA 7182 v1.4 (1 September 2025), §4.1.1 Social Influence; the approved existing `topic-01-social-influence.json` source-to-content truth is evidence, not independent author approval. Revision-original wording; the PDF is REFERENCE_ONLY.

## Small safe increment

13 new short, separately answerable cards replace four composite cards on the **active published** Practice path, specifically:
- PSY-01-01: conformity, compliance, internalisation, normative and informational social influence (five separate retrieval targets)
- PSY-01-02: obedience, agentic-state explanation and legitimacy of authority (three)
- PSY-01-03: dissent/social support and internal locus of control (two)
- PSY-01-04: consistency, commitment and flexibility in minority influence (three).

Each has a `-card-v2` identity; the old four card IDs and their historical student ratings are **not deleted** and must not transfer credit to these replacement concepts. A student who previously rated a broad card positively starts each new atomic card without inherited mastery. The full original source-derived definitions, research, evidence and evaluation remain in Learn. No scored practice item, question key, exam mark, course option, database schema or signed-in permission is changed. Flashcard self-rating does not count as independently scored mastery.

This is one bounded Psychology topic, not a claim that all Psychology/Business cards are repaired. Prior LF-06 Psychology mental-health four-card correction (#796) remains intact.

## Regression and gates

- Exact `content.test.ts` asserts 118 existing Psychology requirements, 130 active cards (was 121: replace four composite Social Influence cards with thirteen), four topic source mappings, complete Learn, new question/answer bounded length, unique IDs and historical self-rating isolation.
- Before merge: independent fresh subject/A2/A3 content judgement for exact cards and their source fit; canonical desktop/tablet/phone/keyboard/zoom saved-session behaviour; full exact-head CI; integration with current approved `main`; specific Founder approval for PR; then verify production and direct learner comprehension.
- Student-facing original LF-06 remains OPEN pending systematic Business/Psychology flashcard inventory, trustworthy atomic coverage and original learner test. No use of repeated card ratings as independently assessed skill proof.

**Documentation-impact check:** Current implementation note and INDEX pointer accompany this content change, historical sources remain unchanged. This is a bounded correction to existing Course Learning Blueprint behaviour, not a new feature or normative rule. No migration/ADR required.
