# Issue #698 — AQA Business 7132 §3.1.3 external-environment cost and demand practice

**30 October 2026 · governed candidate; not verified live.** Canonical learner route: `/revision/app/` (React learner app), existing AQA 7132 Business topic and all three published A-level paper ContentPacks. No new learner route or generic Practice engine. Exact official subject reference: AQA Business 7132 **v2.0 June 2023 §3.1.3**, printed **page 13** (PDF physical page index 12); source: https://filestore.aqa.org.uk/resources/business/specifications/AQA-7131-7132-SP-2023.PDF. The official published page was inspected, including its actual rendered table. The original Founder-uploaded PDF binary is not present for an independent byte-for-byte rehash. Rights status is **REFERENCE_ONLY**; all learner explanations and scenarios in this package are Revision-original.

## Independent source review and reuse

The specification calls for understanding **how external conditions influence costs and demand**, naming competition, market conditions, incomes, interest rates, demographics, environmental issues and fair trade. Seven listed factor categories are individually retained in `audits/2026-10-30-aqa-business-7132-section-313-source-to-live.json`; the seven are a *section-scoped factor inventory*, not a complete course denominator, not seven missing course requirements, and not seven independently validated competencies.

The existing actual source Learn `bus-fnd-009` already discusses competition, market conditions, incomes, rates, demographics and environmental concerns with conditional cost/demand mechanisms, and some existing source Practice `bus-fnd-009-p*` is authored but does not prove independently marked, learner-visible section-wide performance. A deeper existing `bus-ext-006` page teaches fair trade but is classified into the **Strategic Position** course topic by the shared topic resolver. To avoid pointing a Business-topic question to a different course topic, one small original **fair-trade cost versus demand** worked example is added to `bus-fnd-009`; its pre-existing node and question IDs and all earlier sections are retained. Existing material was reused rather than regenerated.

## Current release candidate and assessment boundary

Seven Revision-original contextual `MCQ` records in `shared/external-environment-practice.ts` cover the seven named factors. Each has:
- one distinct immutable `rev7132-3.1.3-*` question identity;
- one source requirement `aqa-7132-3.1.3:*`, one matching Business-topic Learn node `bus-fnd-009`, and consistent `topic_id: business`;
- four alternatives, a deterministically scored **single correct selection** (one mark), and individual correct/incorrect rationales;
- causal and conditional explanation, rather than unsupported guaranteed effects.

They are appended through the **same generic validated PracticeBank** in all three actual AQA Business paper ContentPacks. The calculation and other Practice IDs, prior scores and saved learner work are not migrated or overwritten. No new AI marking, question format, persistence schema, access restriction or Plan/REV rule is introduced.

**What this proves:** the released candidate *contains* question assets from which the existing Practice pool can score the one-option response for these seven cases. It **does not** score the learner's own written cost-and-demand causal chains, independently validate nuanced per-factor educational adequacy, establish mastery, prove independent learner-specific repair/retest or demonstrate authenticated site persistence and adaptation. Multi-factor exam-style explanations remain a genuine broader assurance need, under #698/#703/#704/#705/#706. The evidence matrix records teaching and assessment adequacy and live acceptance as **unverified**, not completed. All eight #698 completion checkpoints remain OPEN.

## Automated check and documentation impact

`external-environment-assurance.test.ts` checks the seven source labels and unverified claims, every exact question ID/mapping/node, original contextual alternatives and rationales, the Business Learn topic, the published correct-answer Practice pool in all **three** real paper packs and preservation of earlier question identities. Normal TypeScript, source quality and full required risk-based GitHub CI remain required for this PR before any Founder-specific merge request.

**Documentation-impact check:** technical record + dated source-scope audit + INDEX are updated in the same PR as the actual course content and tests. Approved product/educational authority remains unchanged; no new feature or ADR is proposed. Historical candidate keyword mapping and earlier audits are not revised. Qualified educational/examiner review, original uploaded PDF hash verification, production release and real learner acceptance remain explicitly pending.
