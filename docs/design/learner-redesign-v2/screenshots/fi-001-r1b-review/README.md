# FI-001 R1b independent-review visual evidence — 13 October 2026

**Review evidence only. Not approved baselines, not merge approval.**

The protected Home phone/desktop Light/Dark SHA-256 assertions are unchanged. The four candidate assertions remain red pending visual-baseline review/approval. Original CI #38380380403 recorded the same four Home gate failures. Its artifact is `interface-visual-regression-38380380403`, ID `11803826886`; the connector could identify the artifact, but this executor could not download its screenshot ZIP because the artifact/file download hosts returned 403. No original CI screenshot inspection is claimed.

These retained images reproduce the existing pinned visual fixture in the **same local Chromium/browser environment**, with synthetic learner data and the normal production-build app. `main/` uses approved main `9afcbe36e83166b5adf498c07a84c625b431a794`; `candidate/` uses the corrected #617 runtime before its review-fix commit. No screenshot CSS, fake production tasks or baseline-digest amendments were introduced. Local captures of unmodified main also differ from the approved CI digests, so local rasterisation hashes are **not** proposed replacement CI baselines.

| View | Approved-main runtime reproduction | Corrected candidate reproduction |
| --- | --- | --- |
| Desktop Light | [Before](main/desktop-light.png) | [After](candidate/desktop-light.png) |
| Desktop Dark | [Before](main/desktop-dark.png) | [After](candidate/desktop-dark.png) |
| Phone Light | [Before](main/phone-light.png) | [After](candidate/phone-light.png) |
| Phone Dark | [Before](main/phone-dark.png) | [After](candidate/phone-dark.png) |

## Inspection findings

All eight images were inspected. The same saved AS Business course/topic and Quick check appear in this missing-setup fixture. The intentional R1b change replaces the invented scheduled-duration presentation with **Not scheduled**, removes minutes from the unscheduled Start label and describes the action as supported unscheduled practice. The factual reason is longer than the superseded independent Home rule's reason.

On desktop the extra reason line increases the hero's content-driven height by about 26px; the narrower Start text shortens that button and moves Open Plan left. The REV mark stays centred in its existing column; the Plan/Exams cards move down with the hero. On phone the metadata and reason each take an additional line, increasing the hero by about 46px. Controls remain full-width in the existing stacked pattern. The fixed navigation, content margins, brand/REV identity, typography, palette, radii and hierarchy are preserved. No unintended Home style or navigation change was found in these paired reproductions.

The separate shared Information Status token changes only its foreground from `#3c72a2` to `#32628c` on the existing `#e9f1f9` surface, improving normal-text contrast from 4.47:1 to 5.65:1. No Information Status is present in this Home fixture. Its real Plan component is independently tested in both themes.

## Unresolved gate

Founder visual-baseline approval is still required for the **four changed Home CI captures** before any new digests can be accepted, under `CLAUDE.md`'s visual-baseline rule and the existing protected assertions. Review the final exact-head CI artifact and these expected content differences; inspect for runner/font rasterisation differences as well. Do not copy these local hashes into approved constants or infer approval from the R1 product Ready decision. The implementation remains draft and must not merge.
