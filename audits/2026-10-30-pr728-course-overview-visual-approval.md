# PR #728 — Course Overview visual-baseline Founder approval

**Decision:** 30 October 2026, Founder instruction “Approve PR #728 visual change” in the Revision chat.

## Scope and precise authorisation

Following the explicit request to review [desktop Course Overview light](https://github.com/lhanson-dev/revision/pull/728) and dark screenshot captures, the Founder approved the revised section-spotlight appearance on PR #728. Both screenshot previews were presented in chat and linked as light/dark images. They show the **neutral** four-section arrangement beneath REV, not the highlighted saved-work state.

Approval permits updating **only** `approvedCourseOverviewDigests['desktop:light']` and `['desktop:dark']` in `tests/e2e/interface-visual-regression.spec.ts` and running assurance. It does **not** approve PR merge/release, a future changed visual design, in-progress saved-work visuals not shown in those captures, Home/Learn intermittent changes, other device/surface baselines, tolerances or masking.

## Reproduced CI evidence

| Protected screenshot | Prior approved SHA-256 | Approved candidate SHA-256 |
| --- | --- | --- |
| Desktop Course Overview light | `8ef7f730770162cccd4c826df7b900131ff1a8d15770053a65eef0da4ca19132` | `ea47b538ac0dd3e83f5b659a00510b25d5cfdaedfa69e64d9021ef9acf9f4957` |
| Desktop Course Overview dark | `5ac454abb01c9e53e0057b6fb033958d0a7d14274fb5968592498ece07efbb00` | `b0bb9ed6d89b9bb4372b046c7be728ebfd9b18f8fdb7c82157dd0d8649b02de5` |

Sources: [CI 41042176312](https://github.com/lhanson-dev/revision/actions/runs/41042176312) and [CI 41043101546](https://github.com/lhanson-dev/revision/actions/runs/41043101546), desktop browser shard 1/2. Both independent runs and retries logged identical candidate SHA-256 digests. The retained [CI 41043101546 visual artifact](https://github.com/lhanson-dev/revision/actions/runs/41043101546) contains the review screenshots and failed protected comparison traces.

**Digest semantics:** for this test, the `Expected value` in Playwright's failed `toContain` assertion is the browser-produced candidate digest, while `Received array` is the previously approved list. This provenance cites CI log output rather than claiming the re-encoded chat thumbnail has identical PNG bytes.

## Assurance and next gates

Update the two exact protected strings only. Preserve other tested states and their approved digests. In particular, the separately observed Home dark and Learn light initial failures were flaky (passing retry); these are **not approved** for baseline replacement. Refresh the PR mechanically against current approved `main`, verify no unrelated normative/implementation loss, and run exact-head CI again. Inspect authenticated **In progress** screenshots and behaviour separately; do not silently treat this neutral-state approval as approval of an unreviewed state.

**Founder merger decision is separately required** after the candidate is green and a plain-language merge summary is provided. No deployment or production confirmation is implied.

Related: Issue #727, PR #728, previous PR #726 recovery correction.
