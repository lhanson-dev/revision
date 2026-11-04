# #705 — Correct independent AQA Business §3.2.2 reviewer scope after true source challenge

**State:** governed reviewer-source correction candidate, not merged, no new A2/A3 PASS or learner feature release. Date 4 November 2026.

## Historical independent outcome (unchanged)

The trusted run [#41792154094](https://github.com/lhanson-dev/revision/actions/runs/41792154094) reviewed exact candidate head `4db0897fe74d613cbf4bd3bd71af016007afa210`, verified all nine CI jobs, and returned **FAIL/HOLD**. Preserved artifact `13304020935` (30-day retention). The reviewer identified a *valid* material inconsistency: the source Foundation net-gain explanation unconditionally deducted a certain option cost even when that cost might already be included. The candidate #809 corrects it in its actual published JSON, worked examples, self-check and unscored guided repair, and adds source-to-three-paper tests.

The same review also mislabelled `risk`, `uncertainty`, `opportunity cost` as unsupported AQA §3.2.2 item mappings because **its supplied structured review scope was incomplete**. The first attempted review run #41791951606 was an infrastructure preflight failure due an approved-main SHA change and produced no educational receipt. Both historical failures remain unchanged; neither is a PASS.

## Grounded source correction

The actual Founder-supplied official **AQA Business 7132 v2.0, 14 June 2023**, §3.2.2, printed **p14** (PDF page 14) was checked both by local text extraction and visible rendered page review. It explicitly includes:
- The value of evidence/data-based (scientific) versus intuitive decisions.
- Interpretation of decision trees and calculation of **expected value and net gains**.
- Understanding **risks, rewards, uncertainty, opportunity cost and use/value of decision trees**.
- Decision influences: **mission, objectives, ethics, external environment including competition, and resource constraints**.

The already retained source inventory `audits/2026-10-30-aqa-business-7132-section-322-source-to-live.json` identifies 16 provisional demand atoms and distinguishes published coverage from independent teaching adequacy. This inventory is evidence, not new authority or proof all atoms are adequately taught.

The original PDF remains **REFERENCE_ONLY**. No protected PDF, verbatim specification prose or student data is sent to an AI provider. The trusted reviewer receives only concise original structured source facts that are verified by the p14 source. No historical AQA document is rewritten.

The reviewer must distinguish actual AQA §3.2.2 requirements from **optional broader business appraisal** (cost-benefit analysis, sensitivity testing, liquidity, reversibility, stakeholder effects and strategic fit). These can be useful teaching extensions but may not become additional independently verified section obligations by a caption or item-ID guess.

## Bounded change and checks

Only the existing #809 allowlisted review scope, its adversarial instructions and source-reviewer contract tests change; the workflow's authenticated Founder trigger, exact-head PR/CI checks, inert Git blob hashing, `store=false` fresh context, capped provider reserve, fail-closed decisions and all #777/#784/#805/#820 reviewer scopes remain unchanged. The reviewed source list adds the new Foundation source-to-live regression test from #809, without executing any PR code.

Owner approval is needed to merge this separate reviewer correction before issuing a fresh exact-head #809 A2/A3 review. It is **not** approval of #809 content or a waiver of the first material finding. PR #809 also requires fresh exact-head CI and its own Founder merge approval after actual independent PASS and learner acceptance assurance.

## Documentation impact

The reviewer is a trusted approved-main workflow and therefore needs this governed code/tests/documentation PR. Existing Content Accuracy Assurance Gate, Source Licensing and Knowledge Architecture already require complete source-scoped review; no normative source rewrite or ADR is proposed. Historical review receipts remain immutable and continue to be linked.
