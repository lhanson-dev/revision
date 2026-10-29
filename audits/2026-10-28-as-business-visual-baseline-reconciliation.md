# Proposal: AS Business 7131 visual reference reconciliation

**Status: PROPOSED for Founder review. This file records evidence; it does not grant visual approval or merger approval.**

## Why this is isolated from #699

Business A-level content PR #699 is blocked on four **AQA AS 7131** visual screenshot digests, despite touching no AQA AS content, shared learner UI/CSS or screenshots. The four captures reproduce across separate PR-head CI runs (including #40769573409 and #40781113495) in the same canonical viewport and theme. On an isolated branch based on approved `main`, only the four test digest literals have been updated to the observed **unchanged** student UI output; no product source, component, style, visual fixture, content, plan, progress, or recording has changed. This is a proposed **assurance reference update**, not a visual product redesign.

## Evidence bundle

- [Business audit PR #699 latest run 40781113495](https://github.com/lhanson-dev/revision/actions/runs/40781113495): current screenshots for Desktop Learn light/dark and Tablet Exam Prep light/dark, with initial/retry identical SHA-256 in test logs. Browser-test artifacts `interface-visual-regression-40781113495-desktop-1of2` and `interface-visual-regression-40781113495-tablet-1of1` preserve screenshot/trace evidence.
- [Previous run 40769573409](https://github.com/lhanson-dev/revision/actions/runs/40769573409): same current hashes reproduced. Not a single transient rendering.
- Approved reference snapshots were captured from the previous approved main baseline in the CI artifact `tests/e2e/interface-visual-regression.spec.ts-snapshots/*.png`. They are **reference evidence**, not proof of the current desired design.
- The source of the change is not proven. PR #699 does not modify the AS visual fixture or UI assets. The observed change is a **different page layout and content density**, not merely a slight font-raster difference. A screenshot-hash pass is NOT sufficient educational/browser/learner sign-off.
- Comparison inspected: Desktop Learn old has a taller older shell and less visible learning prose while current uses the more compact reading-first layout and visible lesson text. Tablet Exam Prep old has the older shell/header geometry; current uses a revised navigation/header and paper/session cards. No missing lesson, blank mock card, transient loading or inaccessible content was observed in inspected captures. This judgement is specific to the screenshots, not exhaustive accessibility assurance.

## Exact proposed reference changes

| Surface | Previously approved SHA-256 | Current repeatable SHA-256 |
| --- | --- | --- |
| Desktop Learn light | `fb2fbc220495c1515f704547d8bda2fe43a05589decf92443e9b949da24930dc` | `b7c261ab8a09ffe6d2d9759b4ede288b377ea6b5face95c553e516990e07d87a` |
| Desktop Learn dark | `6259208657efa6d296b071f69de83466bd4e14c3a09fb411263df6ab3606ff3b` | `3adf5a6742bbcee4102a8d49ee67e5ed9488ade1355b0a88ba17882dc564fd99` |
| Tablet Exam Prep light | `9c4fedac7ff928735906fe02953370ac1a8c230640b8462d78a33cb134853997` | `056536438efc8557851de6ab6c32992856e177beb03e0e44f83b90e55a924bb3` |
| Tablet Exam Prep dark | `5cf54eb772be1a0c5b259adcce0e21db47dff516e218d10602afa137f30f0912` | `b3ce313e32d4bf87dcd129d045f0c56b34e6d53ec2f6ed216a7035551a556a41` |

## Required decision / restrictions

This is a **proposed** visual reference change requiring explicit Founder review of four images and approval of their exact current appearance. The Founder's approval of the visual references is not the same as approving the specific PR merge. After visual review and explicit approval, ordinary exact-head checks, current-main integration, approval evidence and governed merger procedure still apply. Do not treat a green CI on this test-only branch as proof of an approved visual baseline. Do not bypass the checks, edit protected tests to skip, or silently add digests without approval.

The related 7132 course content and 7182 Psychology audits remain open under [Issue #698](https://github.com/lhanson-dev/revision/issues/698). No documentation authority, student feature or historical evidence was rewritten; this is a proposed technical visual-regression acceptance update only.
