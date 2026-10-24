# Stage 5 — shared market-model independent review brief (candidate, NOT approved)

**Status:** OPEN — review has not been commissioned or completed.  
**Reviewer input:** `research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json` at Git blob `2fe25c0da25cecbeca386371e50df472f481a319`.  
**Subject candidate:** `BUS-MKT-010` *proposed only*; no node is allocated or loaded into the effective 81-node Foundation.  
**Effective baseline:** `v0.8-t8-exact-course-remediation`, fingerprint `0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241`.  
**Scope:** only the 8 Edexcel 9BS0 section 1.2 supply, equilibrium and graph skill candidates. The 425 source-reference positions in other sections remain to be decomposed and assured separately.

## Rights and independence boundary

Use Revision's original subject-node draft and its synthetic numeric data, not Pearson specification wording. Pearson Issue 1 has only `REFERENCE_ONLY` alignment status; **do not insert or copy protected Pearson prose, diagrams, past papers or mark schemes into the reviewer/generator context**. The independent subject-truth check may consult `SRC-OER-LOUIS-MICRO-2024` (LOUIS *Microeconomics*, chapter 3, https://louis.pressbooks.pub/microeconomics/chapter/demand-and-supply-3/) under the book's CC BY 4.0 licence, subject to the exclusion of credited third-party media and an operation-specific rights record. Reviewer must verify source version, attribution, numerical meaning and all exclusions before any promotion. Publishing permission is **not granted** by this brief.

Do not expose generating model reasoning or let the original generator assess its own output. The fixed questions below are for a fresh review context, and any reviewer pass is evidence, not qualified-human approval or automatic publication.

## Fixed review questions

| Check | Exact reviewer question | Evidence to record | Blocking when |
|---|---|---|---|
| MKT-R1 subject accuracy | Are all market-demand, market-supply, quantity and equilibrium definitions correct and free of misleading overstatement? | Specific draft field and eligible fact-source ID | Contradicted by an eligible primary/subject textbook source |
| MKT-R2 curve mechanics | Do axes, labels, curve slopes, shifts versus movements and stable-curve assumptions make sense on each diagram? | Diagram contract field and independent reconstructed sketch or table | An axis/label/curve shift would teach an incorrect conclusion |
| MKT-R3 numerical logic | Independently solve the baseline, cost-shock, preference-shock, shortage and surplus examples. Are every price and quantity, units and comparative direction correct? | Independent calculation, source case ID, expected and observed values | Any mathematical contradiction |
| MKT-R4 depth/completeness | Do the six learning outcomes and distinct evidence modes meaningfully teach the eight specified capability candidates at A-level depth rather than just mentioning them? | Each of the eight `EDX-9BS0-MKT-*` IDs and coverage evidence | Any required concept/capability cannot actually be learned or assessed |
| MKT-R5 interpretation | Is the model's treatment of simultaneously shifting curves, delayed clearing, business implications and limitations educationally safe? | Draft field, supported subject reference, concrete correction if needed | A material overgeneralisation or invalid mechanism |
| MKT-R6 provenance and originality | Is every reusable source element covered by its recorded rights and attribution? Are all draft prose/data Revision-original or otherwise properly licensed, with no Pearson source text or third-party diagram reused? | Source/rights record and item IDs; exclusions | Any uncleared source operation or protected content in draft |
| MKT-R7 dependencies | Should this be a shared new Business node, rather than adding an exam-board-specific exception or incorrectly treating operational capacity as market supply? Would an existing AQA 7132 dependency change? | Existing node IDs; proposed new-node ID; dependency impact | Cross-board reuse or affected-course dependencies unaccounted for |
| MKT-R8 student evidence | Could an independently developed Practice item validly establish graph construction/interpretation, causal reasoning and calculation separately? What must the future marking/evidence logic check? | Required evidence modes and precise observable performance | The model would infer mastery from reading or from a different skill |

## Reviewer output contract

For each check return a structured `check_id`, `status` (`PASS`, `BLOCKING_FINDING`, `LIMITED`), `affected_node_fields`, `affected_9BS0_skill_ids`, `independent_observation`, `eligible_source_id_or_original_calculation`, `proposed_smallest_correction` and `reviewer_context_identifier`. Record exact draft blob and effective Foundation fingerprint. Only a cited contradictory source or reproducible calculation error constitutes an automatic blocking factual finding. A stylistic preference is not a blocker. Two-round maximum under the active Fast-Path Process; unresolved disputes escalate without repeated loops.

## Gate, cost and next release decision

Run `node scripts/assurance/edexcel-9bs0-shared-market-node-preflight.mjs` and the targeted Vitest file before review; deterministic results must pass but **do not** change any PASS/HOLD educational status by themselves.

If expert review confirms the subject gap and source rights, prepare a **separate exact-fingerprint changed-node release** with the narrow shared node, affected AQA dependency analysis, provider spending receipts and full subject/foundation assurance; only then consider Edexcel Course Truth/Exam Truth and learner assets. Review costs must be measured against the existing bootstrap guardrails, not silently incurred.

**Current state:** zero independent review attempts, zero reviewer acceptances, zero effective Foundation changes, zero learner assets, zero model-provider charges. `HOLD`.
