# LF-05 next six original extended-writing questions — source review and release HOLD

**Date:** 17 November 2026. **Evidence classification:** authored source reconciliation and versioned engineering staging, **not independent A3 or production release evidence**. Programme owners: #698 source assurance and #706 learner writing delivery.

## Current baseline and intended increment

Production at #852 merge has **six** independently checked original training questions (five Business, one Psychology), with un-gated ordinary signed-in access, answer-first guidance and owner-private 14-day drafts. The full original draft denominator is **39**, of which **33** are not published. This branch selects **six of those 33**: three compulsory Psychology questions across Papers 1–2, and three Business questions covering Marketing, Operations and Strategic Position. The selection prioritises Psychology without publishing an unselected Paper 3 option as though it were mandatory.

**All six are staged as `held`.** Neither question nor rubric is visible to any learner, because the current RLS only exposes `status='published'`. The six earlier published questions and their guides remain unchanged. The proposal is to complete exact-version independent blind-question and separately guided A3 and real-signed-in A4 *before promoting these six to published within this governed PR*, then require this PR's distinct Founder merge approval and verified hosted production migration.

## Exact Founder-provided source versions and evidence

- AQA Psychology 7182 v1.4, 1 September 2025, SHA256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`.
- AQA Business 7132 v2.0, 14 June 2023, SHA256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`.
- Both original founder-uploaded PDFs were reopened directly with `pdftotext`; content remains **REFERENCE_ONLY**. Learner prompts and guides are original Revision material, not reproduced AQA questions or official marking schemes.
- The original authoring text of each selected item was compared against the trusted historical reviewed **PR #834 head `675fdc8c53a224fe8fa9a81079b57b15dafef7af`**. Corrected independent review [run #43620992688](https://github.com/lhanson-dev/revision/actions/runs/43620992688), [receipt #14124482254](https://github.com/lhanson-dev/revision/actions/runs/43620992688/artifacts/14124482254) shows no **material** findings on the exact historic six source sections (PASS/MINOR), **not** an A3 PASS/PASS for the newly revised guides.
- The current draft PR #834 is not imported as runtime content and no new official 2027 item tariff is inferred. All items are expressly **16/25-mark-style original training** only; no calibrated examiner scores.

| Candidate | Exact specification support | Historic original A3 (blind / guide) | Targeted new-guide correction | Release |
| --- | --- | --- | --- | --- |
| `PSY-LF05-01` | 7182 §4.1.1 p17; social support and locus of control | minor / minor | Reward sustained comparative judgement even when embedded rather than in final conclusion; no causality overclaim | **HELD** |
| `PSY-LF05-02` | 7182 §4.1.2 p17; working memory subsystems, coding and capacity | minor / minor | Explicitly credit conditional concurrent-task performance; no mandatory separate conclusion or claim of zero cross-component interference | **HELD** |
| `PSY-LF05-07` | 7182 §§4.2.3–4.2.3.2 pp19–20; designs, counterbalancing, ethics and validity | minor / minor | Explain both order and **list-to-condition** counterbalancing; an independent-groups alternative is a justified comparison, not silent substitution | **HELD** |
| `BUS-LF05-03-16` | 7132 §§3.3.1–3.3.4 pp14–16; marketing mix and consumer evidence | pass / minor | Do not invent manufacturing capacity, contribution margin or launch cost; weigh small urban survey and observed price response | **HELD** |
| `BUS-LF05-04-25` | 7132 §3.4.3 p18; efficiency, JIT/JIC and lean methods | minor / minor | AO1 stays focused on lean rather than unrelated capacity concepts; Paper 1 broad essay requires no fictitious case | **HELD** |
| `BUS-LF05-07-25` | 7132 §3.7 pp24–27; strategic internal/external analysis and investment tools | pass / minor | Quantitative metrics vs qualitative evidence should not misclassify SWOT or external-analysis tools as inherently quantitative | **HELD** |

The original A3 reviewer reviewed the *authored* guides, not these replacement wordings. The author made the specific corrections directly; that cannot count as **independent** A3. The targeted new-version review must challenge each independently **question first**, then **whole revised guide**, consider creditworthy alternatives and guard against pseudo-precise AO scores. Older A3 receipts remain unmodified.

## Technical safety and learner acceptance

Migration `supabase/migrations/20261117212000_stage_lf05_next_six_review_candidates.sql` adds the six question+guide pairs with exact SHA256 fingerprints, explicit source and old-review references, but **status HELD**. Its guard requires exactly six pre-existing live records. Existing `LF05` signed-in RLS, first-answer-before-guide, owner-only attempts, retention and Paper 3 choices are untouched. The held rows are excluded from the question selector, so this **PR cannot yet be described as an increase to available questions**.

- New pgTAP test `lf05-next-six-held-content-assurance.test.sql` checks source IDs, subject mix, content+guide identity, original study context, no fabricated case for standalone essays and signed-in denial to held rows.
- Existing first-six tests now explicitly target the six **published** identities so that stage-only additional rows cannot make formerly passed production evidence stale.
- Before publication: new exact-version independent A3 receipt with no material unresolved; publish-state change on this branch and fresh full CI; isolated real Auth Business/Psychology source prompt, save/reload/first-submit/guide/owner-isolation and responsive A4; separate Founder approval for the final PR and hosted migration/smoke evidence. Held-to-published transition **must not** be self-issued in production outside a governed release.
- Paper 3 option-selected Psychology items, material-HOLD items and distinct independent retest variants remain separate #698/#706/#703 work. Three Psychology compulsory candidates are selected deliberately because the current catalogue does not yet enforce student-selected Paper 3 option eligibility.

## Documentation impact

This dated source/quality note is an evidence record, not a rewrite of the first full-bank A3. Technical implementation status, index and pgTAP acceptance are updated in the same PR. No normative behaviour changes: the existing approved Course Learning Blueprint already directs sequential source-checked original written-practice expansion. No new writing engine or governance programme.
