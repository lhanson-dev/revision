# LF-05 original 16-/25-mark-style first six — versioned, independently reviewed staging

**Dated:** 15 November 2026. **Role:** immutable source/readiness evidence for restricted learner release, not official AQA marking criteria, human examiner calibration or live deployment. **Status:** pending separate signed-in A4 tests; six rows staged `held`, zero members admitted.

## Direct official specification comparison

The user-uploaded AQA Business **7132 v2.0 (14 June 2023)** PDF has SHA256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. Direct `pdftotext` inspection reconfirmed §3.1.1 business objectives, §3.2.1 management/leadership, §3.3 marketing and §3.10 managing strategic change. The user-uploaded AQA Psychology **7182 v1.4 (1 September 2025)** PDF has SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`; §4.1.1 directly lists **social support and locus of control** as explanations for resistance to social influence. The PDFs are **REFERENCE_ONLY**: the six question and guide texts are original Revision authoring, not copied AQA protected question or marking scheme.

## Actual independent A3 provenance — six IDs passed both stages

The corrected full-bank original blind/stage-B assessment [run #43620992688](https://github.com/lhanson-dev/revision/actions/runs/43620992688) at exact research head `675fdc8c53a224fe8fa9a81079b57b15dafef7af`, [retained receipt artifact #14124482254](https://github.com/lhanson-dev/revision/actions/runs/43620992688/artifacts/14124482254), records these **six exact identities as PASS/PASS**:

| ID | Subject | Original training demand and scenario | Source | Initial release |
| --- | --- | --- | --- | --- |
| `BUS-LF05-01-25` | Business | Survival versus other objectives; standalone 25-mark-style essay | §3.1.1 | `held`, pending A4 |
| `BUS-LF05-02-16` | Business | Larch Medical Supplies democratic leadership; original fictional stimulus, 16-mark-style | §3.2.1 | `held`, pending A4 |
| `BUS-LF05-02-25` | Business | Effective leadership versus formal decision methods; standalone 25-mark-style | §3.2.1–3.2.3 | `held`, pending A4 |
| `BUS-LF05-03-25` | Business | Marketing research versus effective mix at launch; standalone 25-mark-style | §3.3.1–3.3.4 | `held`, pending A4 |
| `BUS-LF05-10-25` | Business | Organisational culture and successful strategic change; standalone 25-mark-style | §3.10 | `held`, pending A4 |
| `PSY-LF05-01-S1` | Psychology | Social Influence council and Leila; exact original stimulus, 16-mark-style | §4.1.1 | `held`, pending A4 |

For each of five Business IDs, the complete **item section** was compared verbatim against original independent-A3 head and draft research PR #834 current; all were **identical**. For Psychology `PSY-LF05-01-S1`, the complete original question+guide *sections* were similarly identical; later changes to the Memory scenario affected **different** sections and do not invalidate the first Social Influence item's original text. The import uses only the immutable original **reviewed head** and preserves exactly six full question prompts, any original stimulus, and their **six/seven original guide bullets**. The guidance does not include an unverifiable precise 2027 AO numeric breakdown or grant automatic examiner marks. Exemplar-level/official AQA tariff verification remains open; these are **training-style** question lengths only.

The other **16 no-material-A3** candidates are an expedited minor-edit/source/format/A4 queue. The remaining **17 material-HOLD** candidates are **not included** in this import; their newer draft changes need new independent exact-version assurance. The full draft set is **39**, not a verified all-skill AQA course or independent fresh retest bank. The Founder requested the complete 39+ roadmap; this six-item batch is the shortest educationally sound first integration slice, **not** the final intended coverage.

## Technical staging and content-integrity rules

This governed stacked content branch is based on LF-05 implementation [draft PR #850](https://github.com/lhanson-dev/revision/pull/850). The migration `20261115221000_stage_lf05_first_six_original_questions.sql` installs the six verified original prompts, their distinct rubric records, correct `course_id`, `paper_number`, `topic_id`, `skill_ref`, `marks_style` and origin evidence. Each pair gets a SHA-256 fingerprint over **exact ID, prompt, stimulus and guide** computed inside PostgreSQL; a guide cannot be confused with a different revised question. All six are `status='held'` with **zero new admitted accounts** until passed A4 and a specifically approved content-activation change. No name/email/raw answer is encoded in any migration.

For Business four 25-mark-style items link Paper 1; the one contextual Business 16-mark-style item links Paper 2; Psychology Social Influence links Paper 1. They do **not** change a published 96/100-mark timed mock, claim a newly official 2027 Paper 1 item, alter student's option selections, or force grader AO marks. The single course Topic Practice/Exam Prep screen from PR #850 can then request only published records.

The isolated pgTAP test `supabase/tests/lf05-first-six-content-assurance.test.sql` verifies the exact six IDs, subject totals, 16/25 counts, correct stimuli and metadata, matching source fingerprints/guides, and **all held** status. Existing LF-05 synthetic DB tests use ID `BUS-LF05-99-16` to avoid collision and verify backend refusal of guides until confirmed first commit; full Auth/phone/tablet/desktop and explicitly **LF-05 signed-in A4 learner** tests remain separately required.

**Publication/activation is not authorised by this import:** To reach live, correct all migration and CI failures; prove actual signed-in first-save/reload/guide-embargo/first-commit, owner vs other-user, expiry and accessibility; then promote the six exact IDs in a separately approved governed activation step and verify hosted backend/data and production site. Only after a separate accountable Founder/controller pre-use GO for the child's written answers may any real learner be enrolled. The feature must never silently open to all registered users.

**Documentation impact:** this is a dated audit (historical evidence), the source packaging SQL, isolated SQL acceptance test, CI registry update and technical content-status note. The normative Course Learning Blueprint remains the approved 39+ staged-release contract from PR #849 and is not rewritten merely because six questions are staged.


## 15 November — subsequent guarded catalogue eligibility decision (same governed draft)

After the isolated Auth+DB [A4 Business execution on #851's combined candidate run #43770194377](https://github.com/lhanson-dev/revision/actions/runs/43770194377) passed real signed-in save, reload, confirm, rubric embargo, first immutable submission, guide and raw-text scrubbing, the *unmerged* staging migration was revised to put the **same six immutable A3 PASS/PASS original contents in `status='published'`**. This is **catalogue-eligible / cohort-only**, not family-active or a deployed production release. The private pilot membership table is still **empty** by default; SQL and RLS explicitly prove unadmitted signed-in learners cannot see questions, guides or drafts. The versioned Business/Psychology A4 coverage has been broadened in the same PR to exercise **all six question routes** and both subjects' first-write/guide sequences, with new **exact-head CI still required**. Do not treat the historical first A4 run's result as proof of the *new* test and status bytes. No additional material A3-HOLD item is included.

Publication eligibility requires the code+content PRs to obtain *their own specific Founder merge approvals*, exact-head CI, real hosted migration/readiness and release evidence. A separate accountable controller pre-use GO and explicit secured account enrolment are still required before the son's original essay data may be processed. The word `published` is an internal server-catalogue state, **not** a claim that anything has reached the production website.
