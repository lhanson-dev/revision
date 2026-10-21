# PR #655 — Practice phone light visual baseline approval

**21 October 2026 — Founder visual approval, not merge authorisation.**

## Decision and scope

The Founder explicitly replied **"Approve PR #655 Practice phone light visual baseline"** after a screenshot from the phone Practice CI trace was shown for review. This authorises pinning **one** phone, Practice, light-theme visual digest changed by the Courses breadcrumb touch-target accessibility correction. The existing Practice interactions, course identity, approved desktop/tablet visual contracts and dark phone screenshot are not modified under this approval.

This does **not** authorise merging PR #655, releasing the frontend, changing production learning claims or relaxing test, security or educational standards.

## Reproducible comparison evidence

CI run [39626816583](https://github.com/lhanson-dev/revision/actions/runs/39626816583) on exact candidate `26ea749c272376638b04a7f54f7effeb5fab020e`, phone job `119314470987`, failed precisely one browser test: `tests/e2e/interface-visual-regression.spec.ts` “phone practice light visual contract”. The unchanged dark Practice baseline and all other phone functional/accessibility browser cases passed.

| Surface | Previously pinned SHA-256 | Founder-approved captured SHA-256 |
| --- | --- | --- |
| Phone Practice light | `913382d155a8e55c3053dad2bee856050386fe89feb487e951adc507c0cc87f3` | `87dd606cdd1063eaa3844d9d5aa3e5940b213edfbf76b6f72cb922a63e8de425` |

The new digest appears in the GitHub Actions strict screenshot-check failure on both original execution and retry. The reviewed capture was presented in this conversation as a phone Practice light-mode CI trace. This evidence proves test-run digest provenance; it is not a claim to have separately recomputed the image bytes in the chat.

## Implementation and release boundary

Only `approvedCanvasScreenshotDigests['phone:practice:light']` is changed in `tests/e2e/interface-visual-regression.spec.ts`. All other visual hashes and functional assertions remain untouched. The release remains **HOLD** pending exact-head CI, the remaining production-readiness migration and independently verified backend contract, and an **explicit separate Founder merge approval for PR #655**.
