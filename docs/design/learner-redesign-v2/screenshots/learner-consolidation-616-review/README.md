# Learner design consolidation #616 — unapproved review evidence

Download `review-bundle.zip`, extract it and open `visual-review.html`. The gallery filters actual application states by viewport and theme; full-page supplements are separately labelled. Fixed overlays are captured as actual viewports. `evidence-manifest.json` records each PNG hash, corresponding computed-style JSON, viewport dimensions and capture provenance.

Application rendering is based on commit `880d7a8b8d19a6754dfbca6bed6949f441462aeb` (application code identical to the preceding corrective code commit `141bd4ca028268e223d0b81d8c6a52d72bf3886b`). Later commits package evidence and enable the same captures in CI; they do not alter application rendering. Integration base is approved main `e9d1266791f234753780ffbb489f0126ce12eadf`.

- 54 production-build browser cases passed across phone/tablet/desktop and Light/Dark: 168 computed learner states.
- Six supplemental Learn production-component fixture cases passed: 12 computed states, labelled `component-learn-*`. These are dev-only fixtures, not deployed learner routes or evidence of content availability.
- The bundle contains 314 PNGs, including viewport captures and full-page supplements, plus 180 computed-state records. Manrope and Bricolage font-face loading is asserted; early fallback-font captures are excluded.
- `original-six/` separately diagnoses the initial PR at `8f6d23712d1e5145558efa434e770fc6927bea5d` against original approved base `f07bbbb0b8f2059e4fcd7f5cf811a8e0975b0a54`. It is not the current candidate.
- Synthetic network-edge learner data is used. Real authentication, RLS, protected services and evidence persistence retain their separate CI ownership.

**No baseline or merge approval is recorded here.** Local screenshot hashes are provenance only; historical approved CI hashes remain unchanged. Founder review of changed visual baselines, exact-head CI, current-main integration and explicit PR-specific merge approval remain separate gates. Issue #616 remains open.

Classification and limits: `audits/2026-10-13-learner-design-consistency-616.md`.

Independent ChatGPT review verified all image/computed-record hashes and found no material visual blocker in representative captures inspected. This does not constitute Founder visual approval.

## Subsequent approval — 13 October 2026

The original unapproved evidence description above is historical. The Founder subsequently approved the images ("images are approved so you can continue"). The corresponding 20 CI visual baseline updates and provenance are recorded in `audits/2026-10-13-learner-616-visual-approval.md`. This is visual acceptance only; exact-head CI, distinct PR #618 merge approval and production verification remain separate gates.
