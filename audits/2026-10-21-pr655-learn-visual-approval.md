# PR #655 — Learn visual-baseline approval provenance

**21 October 2026 — Founder-authorised visual acceptance only.**

## Scope and decision

The Founder replied: **"Approve PR #655 Learn visual baselines"** after receiving desktop Learn light-mode and dark-mode captures of the explicit **"I have read this page"** action. The acceptance covers the two desktop Learn screenshots only. The feature records voluntary learner-confirmed reading, not a scored correct answer or exam readiness.

**Not approved:** merging or releasing PR #655, new product behaviours beyond the reviewed Learn page, other visual baselines, or removal of CI/database/RLS/educational acceptance gates.

## Independently verified CI evidence

Both displayed Learn changes were present in the branch before approval. Their SHA-256 browser screenshot digests were logged by Playwright's strict compare failure, on both initial and retry in **two different CI runs**:

| Capture | Previously approved digest | Newly Founder-approved digest |
| --- | --- | --- |
| Desktop Learn light | `f3304b023cbaddabdacf20194e4125e5aea77e29106b51d684b9555fc9d27062` | `fb2fbc220495c1515f704547d8bda2fe43a05589decf92443e9b949da24930dc` |
| Desktop Learn dark | `24a3903d8aabc8900141d9e64568ee27e539d0e3ddd875a55b658b143a18c8f0` | `6259208657efa6d296b071f69de83466bd4e14c3a09fb411263df6ab3606ff3b` |

- CI run [39619945324](https://github.com/lhanson-dev/revision/actions/runs/39619945324), candidate `80d1ae26c487cdb5774344de5afc25f76f587926`, desktop shard 1/2.
- CI run [39621582738](https://github.com/lhanson-dev/revision/actions/runs/39621582738), candidate `d330225bf97ca3ebbe5e3da2a3944a66291e06e9`, desktop shard 1/2.
- Both logs contain identical 64-character light/dark digests on original and repeat attempts.
- Screenshots were presented in-chat to Founder for review; checked CI digest text, not a claimed direct independent PNG-byte recomputation.

## Implementation and release boundary

Only `approvedLearnScreenshotDigests['desktop:light']` and `['desktop:dark']` in `tests/e2e/interface-visual-regression.spec.ts` change. No unrelated test loosening, viewport change, code modification, or production migration is authorised by this decision.

**Release remains HOLD** pending exact-head CI, resolution of independent phone accessibility target-size failure, required production R2 database migration/readiness gate and explicit separate Founder approval for merging PR #655. Documentation is indexed without overwriting historical captures.
