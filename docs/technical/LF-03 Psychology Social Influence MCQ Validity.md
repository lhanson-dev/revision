# LF-03 — Psychology Social Influence multiple-choice quality correction

**Status:** Candidate on branch `fix/765-lf03-social-influence-mcq-validity`; not merged, deployed or learner-accepted.

**Canonical user route:** `/revision/app/` → Courses → AQA A-level Psychology 7182 → Practice → Social influence → multiple-choice questions. The canonical React runtime gets content through the three published `content/psychology/aqa-a-level/paper-{1,2,3}/index.ts` packs and the shared `src/app/practice-questions.ts` adapter. No second learner app.

**Source and scope:** Founder-supplied AQA Psychology 7182 v1.4 (1 September 2025), §4.1.1, printed page 17; original/reference-only source. Four specification bullets: conformity and Asch; obedience/Milgram/authority; resistance/social support/locus of control; minority consistency/commitment/flexibility. #698 owns full subject adequacy, not this defect PR.

## Reproduced from published source

The former `content/psychology/aqa-a-level/shared/course.ts` created four topic questions by calling `objectivePracticeOptions` once per broad prototype requirement. That function drew the three distractors from the other three *same-topic requirements*, so every question presented an order variation on the same four broad concept labels. Its stem was a machine-extracted first-definition cloze, not an applied scenario. Correct position was a stable hash, not independently authored for a four-item learner session. This is source-level reproduction of the reported repeated-answer pattern; the reporting learner's actual screenshots/browser session and exact choice order have not been reproduced.

The four previous active published IDs were:
`psy-psy0101-check`, `psy-psy0102-check`, `psy-psy0103-check`, `psy-psy0104-check`.

## Narrow fix

- Four new, original, individually written scenario prompts, each aimed at a distinct AQA §4.1.1 concept: compliance vs internalisation; Milgram-style location and legitimacy; a dissenting ally and resistance; minority consistency with flexibility.
- Four specific, uniquely worded options per question, with plausible distractors and relevant explanations. Deliberately different keyed positions: B, D, A, C. Neither random shuffling nor a generic distractor pool substitutes for educational validity.
- Use `social-influence-objective-questions.ts` only for the four affected Social Influence questions. All other Psychology questions and the existing Practice component remain unchanged.
- Version the **four changed question IDs** with `-v2` because their prompts, choices and keys differ materially. Older event records keep their original IDs, marks and question versions; the new Practice pool no longer serves those identities. No row deletion, event rewrite, migration or changed progress calculation.
- The existing course-pack question adapter still produces a single one-mark objective answer at **topic** level. It does not become precise AQA skill evidence or demonstrate mastery, AO2 writing or independent retesting; that belongs to #703–705.

## Acceptance boundaries

- Automated test: exact four authored question contracts, no duplicate option text across the four, valid keys/explanations, B/D/A/C distribution, unchanged generic adapter contract, changed IDs, and identical questions in all three published Psychology packs.
- Existing full TypeScript, unit, build, desktop, tablet, phone, database and security CI must pass on exact PR head, combined with the then-current `main`.
- Educational A3/A4 fresh independent content review should verify the four original stems, keys and distractors against exact AQA source requirements before release. #698 is responsible for that review; neither green unit tests nor plausible AI-generated prose is qualified educator sign-off.
- Production/authenticated user checks remain required for the reported four-question flow, small screens, high zoom, keyboard/screen-reader behaviour, save/reload, answer feedback and previous-score preservation. No such acceptance is claimed at PR creation.
- This does **not** fix LF-04 missing Business/Psychology source context, nor supersede draft #773 (new separate 8 scored and 4 written Social Influence tasks). Coordinate question validity with #698 and do not merge both branches without integration review.

**Documentation-impact check:** existing Course Learning Blueprint, Tone of Voice Framework, Product UX Principles and Claims/Progress rules already cover this defect; no new normative authority. Code, new regression test, this technical note, `INDEX.md` and `90-governance-registers/Defect Register.md` are updated together. Historical learner observations remain unaltered.
