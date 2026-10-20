# FI-001 / PR #637 — Home Practice-question visual baseline approval

**Founder decision:** On 18 October 2026 the Founder explicitly said: “Approve PR #637 Home visual baselines at 2f9c286b — desktop and phone, light and dark.”

**Approved head:** `2f9c286b52a2b54e1ae5948d1206547317a615cb` on draft [PR #637](https://github.com/lhanson-dev/revision/pull/637). This is **approval of four Home visual baselines only**; it is not approval to merge this PR, to release, to widen the educational evidence scope or to repin another visual.

**Reviewed purpose:** Distinguish an existing **scored Practice question** recommendation on canonical Home from the different **unscored Learn Quick check**. Related exact Home, Plan and REV naming and preserving the original scoring/Start/evidence semantics were already added to the candidate. The new approved captures change visible wording, not the approved layout or planner engine.

## Approved exact screenshot digests

All values below are SHA-256 of the actual Playwright PNG capture bytes, obtained as `Expected value` in the exact-head CI visual assertion logs. `Received array` carries the previous approved value. The source run and its retry agreed on each new digest; the prior run reproduced the same new values.

| Home case | Previously approved PNG SHA-256 | Approved replacement PNG SHA-256 |
|---|---|---|
| Phone · light | `47d5f153515b778dd79dab6bd35fd73918d1b5a1b4d8c8918e49b499f2856eb4` | `3ed761458c8e16aeafffa90080b5544c58d51a4bb9c676fce97a6158908887d7` |
| Phone · dark | `5b6c3f993641752c0c1889a552272d40d18f0749d802e6455670d2c8eb84896b` | `0c56bdbef0a552b518c13d0c79ab653f82f3a8bd997ac3793a605af3471a5b98` |
| Desktop · light | `0018cdcc656f188de5b9b2ac0b442d7d92c73ed36354146ec35f376f6ef48661` | `2846970e1d9484a8463deb12c56ebb150d5d5a92ba573e86f394a0940fb9ad50` |
| Desktop · dark | `8f6d19aec968e8a153b152c7d13a14176d002ddc3a20cbf2acf5ff2c14664a45` | `18da37793c2776624c8451aaf827b137632bb1a5dbdb2e314952a32821940841` |

**Evidence:** [Exact-head Revision CI #39116844038](https://github.com/lhanson-dev/revision/actions/runs/39116844038) from `2f9c286b`; earlier reproducing [CI #39116363394](https://github.com/lhanson-dev/revision/actions/runs/39116363394) from `defa8b8a`, where no subsequent product rendering changes were made. Initial and retry mismatch values were equal for all four. The browser failure at the reviewed head was caused by these four intentionally changed PNG hashes. The other functional browser assertion failures from the previous candidate were corrected at the reviewed head; static/unit/build and database/RLS passed. The exact reviewed screenshots were compared in the Founder discussion; independently recomputing PNG hashes from the artifact ZIP has **not** been claimed.

**Scope control:** Only `approvedHomeScreenshotDigests` phone/desktop × light/dark in `tests/e2e/interface-visual-regression.spec.ts` is modified, alongside a provenance comment; no other approved screenshot digest, capture algorithm, viewport, mask, fixture or retry rule is changed. The new PR commit also updates this approval record and technical/audit/index links. Fresh exact-head CI and the repository's merge integration gates remain required; educational acceptance is **HOLD**, and no Founder approval to merge PR #637 was given.
