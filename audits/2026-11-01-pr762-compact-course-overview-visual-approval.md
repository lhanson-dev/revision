# PR #762 — Founder visual approval for compact editorial Course Overview

**Date:** 1 November 2026. **Approval:** Founder replied “looks good, please continue” after viewing the actual desktop Light/Dark and mobile Light/Dark comparison images captured from CI #4107. This is **visual-only approval of the compact design**, not permission to merge PR #762.

## What was reviewed

The reviewed visuals were `/mnt/data/pr762-desktop-review.png` and `/mnt/data/pr762-mobile-review.png`, assembled from [CI #4107](https://github.com/lhanson-dev/revision/actions/runs/41312296896) artefacts #13086236966 (desktop browser 1/2) and #13086386586 (phone browser 1/1). These showed the four Learn / Practice / Exam Prep / Progress tiles in desktop and mobile, light and dark, with compact icon-right treatment, text-left layout and the removal of the old stacked Open buttons. No extra learner features were presented.

The C4 phone viewport previously captured only the upper Course Overview, despite the full-page evidence showing the tiles. This was fixed in PR head `f04417dde20fea6f44d59ad75b4bc26ef20ab0d7` by scrolling the tiles into view before the dedicated C4 phone snapshot. The source layout remains identical to the visuals approved from #4107. The changed C4 **phone crops** were independently checked using [CI #4108](https://github.com/lhanson-dev/revision/actions/runs/41313097340) phone browser artifact #13085939122; they show the approved tile composition and not a different design.

## Scoped replacement of protected C4 digests

The exact browser screenshot SHA-256 values below were emitted by CI #4108 on head `f04417dde20fea6f44d59ad75b4bc26ef20ab0d7`, and each repeated on its retry.

| C4 viewport/theme | Previous PR #754 approved SHA-256 | Approved compact design SHA-256 |
| --- | --- | --- |
| Desktop Light | `be3a85f383f25c1b9743fb830a18a5951493e67d51a978307af2770766c4fd1b` | `fe06e8f58b74ce5e5643619dfdf461f000131d42305d5dfac2fe61bbd3fae282` |
| Desktop Dark | `d01d97559f650c3a656981ba51dd62385c8adcf46fd7f577876cb568fd0115ed` | `9e129c4f116b90e5b3924aaf9b7c6164bb7f2e75e199631602fb02545b944616` |
| Phone Light | `fa07b3e1b999642e14c3b588ab0063ef020f1572c579d9289f17a6c1901f43af` | `7bc726bedccc1bbea8ff8e9965de2fe301edb25e111a560ab271b491b98d3cc8` |
| Phone Dark | `d0cfca9db327fae04bad5a322c677c66df56b1a604a470b745f8d32d946c9b1c` | `69e45ef85c1ab8ee41a6d308c598f888a00e6d0adc03cd918a06cc53b2a03fd7` |

C4 renders four learner navigational tiles, not saved-session content. Saved-work behaviour still requires its existing functional recovery tests. No additional approval is inferred for progress metrics, adaptive decisions, live learner data or anything outside these C4 renders.

## Prohibitions and release hold

- Leave **all** unrelated B7, Home, Plan, Learn, Practice, Exam Prep and Admin visual baselines unchanged. CI #4107 had a transient unrelated Plan Light screenshot mismatch that passed retry; CI #4108 passed the Plan screenshot without modification.
- Do not weaken image comparison, mask parts of a screenshot, adjust screenshot tolerance, or alter the governed visual evidence history for PR #754.
- Do not infer that design approval means integration, accessibility acceptance, PR merge approval or production availability. Test exact head with latest main, preserve verified saved-work semantics and request **separate Founder approval of PR #762 merge** only when the required CI and documentation pass.
