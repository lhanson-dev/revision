# PR #754 — Course Overview design visual approval

**Founder decision:** 1 November 2026, “approved, continue” in the Revision conversation immediately following review of CI-generated Course Overview design screenshots. This is **visual approval only**, not approval to merge PR #754.

## Reviewed scope

The Founder was shown a combined review image and full desktop **Light** and **Dark** screenshots from [PR #754 CI #4067](https://github.com/lhanson-dev/revision/actions/runs/41301571947). The comparison presented the four activity tiles (Learn, Practice, Exam Prep and Progress), the improved icon/typography treatment, removal of the duplicate bottom Ask REV and retention of top REV. The phone Light screenshot was separately inspected and cited in the status report. The user accepted that visual proposal.

The exact Course Overview desktop C4 captures from the PR #754 head `6888f08c37b25d6bfbd6f63fc15d6e1e5a24d0ed` are approved to replace **only** the two desktop entries in `approvedCourseOverviewDigests`. The mobile hashes are unchanged because the C4 phone comparisons passed and their existing acceptance remains in force. Saved-work-state screenshots not shown remain subject to their functional/visual tests and are not newly approved.

## Captured browser SHA-256 fingerprints

| Surface | Previously accepted | Founder-approved new capture |
| --- | --- | --- |
| Desktop Course Overview Light | `ea47b538ac0dd3e83f5b659a00510b25d5cfdaedfa69e64d9021ef9acf9f4957` | `be3a85f383f25c1b9743fb830a18a5951493e67d51a978307af2770766c4fd1b` |
| Desktop Course Overview Dark | `b0bb9ed6d89b9bb4372b046c7be728ebfd9b18f8fdb7c82157dd0d8649b02de5` | `d01d97559f650c3a656981ba51dd62385c8adcf46fd7f577876cb568fd0115ed` |

Source: [desktop browser artifact #13081877018](https://github.com/lhanson-dev/revision/actions/runs/41301571947/artifacts/13081877018), exact run #4067, and the corresponding browser job log. The values are reported as “Expected value” in the failed Playwright `toContain` assertions because that is the newly captured digest; the “Received array” contains the previously accepted value. Initial capture and retry each yielded the same exact desktop Course Overview digests in this run. This does not assert that the user-visible re-encoded chat thumbnail has identical bytes.

## Exclusions and remaining hold

No visual approval is inferred for unrelated **Home Light** or **Learn Dark** mismatches in CI #4067; leave their protected hashes and fixtures unchanged until the unexpected source is investigated. No screenshot tolerance, masking or algorithm changes are authorised. This visual approval does not itself establish accessibility, educational assurance, current-main integration, successful exact-head CI, Founder-specific PR merge approval or production deployment.

The PR must be refreshed safely against current `main` and re-tested, with only intended visual changes passing the guarded screenshots before the independent merge approval decision.
