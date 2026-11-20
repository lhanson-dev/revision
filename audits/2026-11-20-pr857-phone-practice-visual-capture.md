# PR #857 — course Practice phone visual capture and baseline decision (20 November 2026)

## Status and source

This is **dated implementation evidence on an unmerged draft PR**, not a separate Founder merge approval or a declaration that PR #857 is released.

- Proposed branch: `feat/practice-two-choice-layout-20261118`, PR #857.
- Actual browser CI run: [#44636624711](https://github.com/lhanson-dev/revision/actions/runs/44636624711), head `59a3cdb37ecee0bfcffa17d824613496a68ea97b`.
- Phone artifact: `interface-visual-regression-44636624711-phone-1of1`, artifact ID `14583993664`.
- Reviewed screenshots: Playwright trace attachments `practice-light-phone.png` and `practice-dark-phone.png` in `test-results/interface-visual-regressio-*-practice-*-visual-contract-phone/trace.zip`, not the earlier standalone mock.
- Rendered app route: authenticated AQA AS Business Course Practice, phone 390×844 (screenshots).
- The Founder previously approved the **design direction** of two top-level activity choices with a connected expansion surface. The Founder has **not** approved merging this PR.

## Observed screenshot evidence

The actual light and dark screenshots both show:
- Existing course identity and Practice navigation.
- "How would you like to practise?" heading with a short explanatory introduction.
- Current topic/status and Change topic.
- Quick questions presented as a card with Scored status, information on contribution to Understanding and Exam readiness, and a question count teaser.
- No excessive horizontal overflow, overlapping header controls, or unreadable light/dark foreground contrast in the captured viewport.

The phone viewport cuts through the first activity card above the fixed bottom navigation: the rest of the page, the second activity card and expanded controls are **not proved by this screenshot alone**. Separate responsive and accessible interaction checks must remain green. Browser screenshot review is not complete live-learner acceptance.

| Theme | Actual PNG SHA-256 (run #44636624711) |
|---|---|
| Light | `6ca169c7d7d359b93cf375a7ee4dc9a1a3d1247e11a52bf7372949fe11e514c1` |
| Dark | `4907d030885732960c8129277f0f90f56b59579b8c27c3e566d3b8cdef17a0f3` |

Both theme screenshots were recovered as exact PNG attachments, visually inspected and hashed against their bytes. Prior active screenshot hashes represented the old Course Practice page and correctly failed the redesigned page. The prior PR #655 design approval and its hashes remain historical evidence in `audits/2026-10-21-pr655-practice-phone-light-visual-approval.md`.

## Baseline change and guardrails

`tests/e2e/interface-visual-regression.spec.ts` now expects only the two observed **new-layout** image digests for the relevant phone Practice states, retaining the exact-hash fail-closed protection. Old active digests are not added as alternatives, because that would permit the old design to pass unnoticed. The rest of the screenshot matrix is untouched.

The screenshot hashes are grounded in a specific CI artifact, not fabricated or blindly copied from assertion failures. Successful fresh exact-commit CI, code review and separate explicit Founder merge approval are still mandatory. Changes to product scoring, answer saving, assessment evidence and catalogue eligibility are out of scope.
