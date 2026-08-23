# Design Acceptance Review — 23 August 2026

**Status:** Complete — design direction accepted; remediation required before final design acceptance / B7 completion  
**Review type:** Point-in-time design / UX / implementation-conformance audit  
**Baseline:** approved `main` at `1b2967e262086ba90898fb7b9a60cfa883f9dd16`  
**Canonical learner runtime:** `/revision/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` with compatibility `App` consumers  
**Detailed implementation evidence:** `audits/2026-08-23-design-acceptance-review-increments-b-g.md`

## Purpose

Determine whether the current Revision product is visually coherent, usable, accessible and recognisably Revision before B7 compatibility retirement, and identify assurance improvements needed to prevent visible design regressions escaping CI.

This audit records evidence and findings. It does **not** create or amend design authority.

## Governing baseline

The review was anchored in:

- `20-brand-and-experience/Visual Brand System.md`;
- `20-brand-and-experience/Identity Asset Usage Rules.md`;
- `20-brand-and-experience/Product UX Principles.md`;
- `10-product-governance/Global Learner Navigation.md`;
- applicable active product journey authority;
- `50-engineering-standards/Testing & Assurance Standard.md`; and
- `docs/technical/Interface System Operating Standard.md`.

Implementation evidence comes from current `main`, the canonical runtime, current technical documentation and automated assurance. Research/history was not treated as active authority.

## Review method

The review deliberately separated:

1. route coverage;
2. material-state coverage;
3. design-system conformance;
4. rendered visual/design acceptance; and
5. regression ownership.

A temporary Playwright capture harness was used only on the audit branch to render deterministic authenticated learner/Admin states across phone, tablet and desktop, Light/Dark and exam interruption states. CI run `32609889497` / Revision CI #788 produced the capture artifact used for visual inspection. The temporary harness and workflow hook were then removed from the audit branch; they are not proposed production changes.

The capture run also exposed two defects in the temporary capture test itself and one unrelated existing Edge Function integration timeout. Those failures were not classified as product-design findings.

## Overall acceptance result

**Revision does not need a wholesale visual redesign.**

The visual direction is coherent and recognisably one product. Plan, Practice, Exam Simulator and Admin in particular demonstrate the intended system well. Light/Dark translation is materially stronger than before the B3–B6 and theme-integrity work.

However, the product is **not yet at final design acceptance** because several genuine interaction/composition defects and design-system ownership gaps remain.

The main pattern is uneven migration:

- token/theme conformance is ahead of component/identity conformance;
- semantic/browser assurance is ahead of composition/image regression;
- Dark-mode breadth is ahead of equivalent Light-mode state breadth;
- some experiences look modal but are not fully keyboard-modal; and
- compatibility CSS/local component anatomy still creates avoidable drift risk.

## Accepted / strong areas

### Plan

**Strong.** Plan is the clearest example of the intended Interface System: shared page header, surfaces, buttons, fields, statuses, loading and empty states; clear explanation before asking for availability; calm hierarchy; no unnecessary analytics dashboard treatment.

### Global Progress

**Acceptable current compatibility surface.** It is visually coherent and understandable, but its final information architecture must be reassessed when FI-020 Courses replaces the current Subjects/catalogue projection.

### Course overview

**Functionally and visually coherent, structurally transitional.** The hierarchy from course context to Learn / Practice / Exam Prep / Progress works. The current Subject Home hop is not re-approved as final IA because current authority now governs Courses as the learner-facing academic destination.

### Practice and feedback

**Strong UX model.** Activity choice is secondary to the work, scored/unscored distinction is explained, feedback is progressive, and results explain meaning/next action rather than ending at a score.

### Exam Prep / Exam Simulator behaviour

**Strong behavioural design.** Timed exam becomes a dedicated working surface; Pause obscures the paper and freezes time; Stop requires confirmation; results explain mark derivation and next action. The remaining issues are shell/modal integration defects listed below, not a need to redesign the simulator itself.

### Admin / Founder Assurance

**Strong operational hierarchy.** Admin appropriately uses denser composition and first-class tables. Healthy / Attention needed / Unknown remain distinct; Founder Assurance is evidence-based and does not collapse into a misleading confidence score.

## Confirmed remediation findings

The detailed implementation evidence and original observations remain in the companion audit. The following is the consolidated final finding set.

### DAR-001 — Global shell bypasses the shared icon registry

The shell maintains a local SVG icon family instead of consuming/extending the controlled `Icon` registry. This risks visual drift and duplicates system ownership.

**Disposition:** consolidate recurring shell/account navigation icons into the shared registry during the next shell/Courses/B7 work.

### DAR-002 — Recurring control glyphs bypass governed icon/REV identity

`✦`, `×`, `▶`, text arrows and similar glyphs remain in recurring product controls even where shared icons or the Living E should own the job.

**Disposition:** replace recurring control glyphs with controlled icons; use canonical REV identity where the mark represents REV rather than decoration.

### DAR-003 — Light-mode state assurance is narrower than Dark-mode assurance

Dark mode now has a broad rendered semantic sweep; Light mode is mainly covered by targeted tests.

**Disposition:** add bounded Light/Dark contracts for the highest-risk states rather than duplicating every Dark-mode assertion mechanically.

### DAR-004 — No durable visual-regression layer for canonical states

Current tests catch semantic/token/accessibility failures but cannot reliably catch hierarchy, wrapping, spacing, overlap or visual composition regressions.

**Disposition:** introduce a bounded deterministic screenshot set (approximately 15–20 high-value canonical states) with deliberate baseline review.

### DAR-005 — Compatibility cascade remains active pre-B7

Legacy/compatibility CSS still participates in the canonical runtime. This is expected pre-B7, but repeated theme escapes prove it remains a material drift risk.

**Disposition:** B7 must prove zero-live-consumer and ownership consolidation; it must not be treated as simple CSS deletion.

### DAR-006 — Pre-B7 theme-integrity technical documentation is stale

Technical checkpoint documentation still describes the PR #126 Practice follow-up as pending although it is live.

**Disposition:** correct current technical documentation in the governed remediation/B7 work without rewriting historical audits.

### DAR-007 — Authentication reconstructs Revision identity

Sign-in/recovery currently reconstruct the brand using live text/decorative glyphs rather than the canonical approved identity assets.

**Disposition:** consume the canonical wordmark or approved compact Living E treatment at authentication entry.

### DAR-008 — Shell/account/auth are visually migrated but only partially component-owned

Several surfaces copy `ui-*` anatomy or implement local controls rather than consuming the shared React component layer.

**Disposition:** treat these as active compatibility consumers; migrate common jobs to shared primitives rather than copying classes.

### DAR-009 — Shell/Home still contain local type/shape/spacing values where shared roles exist

Some local weights, radii, type clamps and dimensions duplicate governed roles.

**Disposition:** normalise values that duplicate shared roles while preserving legitimate composition-specific dimensions.

### DAR-010 — Home creates an alternate REV halo symbol

The recommendation card uses an arrow inside a REV-style halo, creating a second mark alongside the Living E.

**Disposition:** use the canonical Living E/REV identity or remove the halo identity treatment and use a normal guidance affordance.

### DAR-011 — Course surfaces retain local letter/symbol iconography

Course choices and paper controls still use local letters/symbols beside the controlled icon system.

**Disposition:** migrate recurring UI icon jobs during FI-020/B7; retain letter markers only if deliberately accepted as a recognition device.

### DAR-012 — Focused learning rebuilds common control anatomy locally

B4 styling is semantically migrated, but mode tabs/actions/fields largely remain raw/local markup.

**Disposition:** preserve the focused-work UX while moving genuinely common controls to shared components during B7.

### DAR-013 — Learn nested-card density is confirmed visually

Rendered long-form Learn shows an outer bordered workspace containing another bordered surface for most learning sections. The result is more fragmented/card-like than the intended calm reading/explanation workspace.

**Disposition:** simplify visual section separation in Learn. Keep content structure and progressive disclosure; reduce nested bordered surfaces rather than redesigning the learning model.

### DAR-014 — Modal focus containment is missing as a shared capability

Ask REV, the mobile navigation drawer and Exam Pause/Stop visually claim modal behaviour but do not consistently contain keyboard focus or make the inactive background inert. `AccountModal` solves this separately, demonstrating fragmented ownership.

**Disposition:** **blocking remediation.** Add a reusable modal/drawer focus-management contract with initial focus, containment, background inertness, Escape where allowed and focus return; migrate consumers and add keyboard browser assurance.

### DAR-015 — Exam interruption uses a local play glyph

The prominent resume control uses a text play symbol.

**Disposition:** add/use a controlled play/resume icon if needed, otherwise use the label alone.

### DAR-016 — Admin is visually migrated but structurally local

Admin correctly needs different density, but common buttons/fields/status/icon jobs are still substantially local.

**Disposition:** retain Admin-specific composition/tables while reusing shared primitive anatomy where the interaction job is the same.

### DAR-017 — Persistent Ask REV dock obscures Home content/actions on phone

Rendered 390×844 Home evidence shows the persistent Ask REV dock overlapping the recommendation action area. Current navigation authority explicitly requires the dock not to obscure page actions or content.

**Disposition:** **blocking remediation.** Correct bottom-space reservation/dock positioning for ordinary learner screens and add responsive browser assurance that the dock does not intersect visible actionable content at the supported phone breakpoint.

### DAR-018 — Persistent Ask REV dock remains available during timed Exam Simulator on tablet/mobile

Rendered tablet timed-exam evidence shows the global Ask REV dock still present over the active exam. The simulator is a focused realistic timed-performance environment; tutor access inside the active timed paper undermines that state and competes with the exam controls.

**Disposition:** **blocking remediation.** Suppress the persistent Ask REV dock for the active Exam Simulator/timed-exam state, restore it after leaving the exam, and cover this at phone/tablet breakpoints.

## Final prioritisation

### Blocking current design defects — fix before treating acceptance as complete

1. **DAR-014 — modal/focus contract.**
2. **DAR-017 — mobile Ask REV dock overlap.**
3. **DAR-018 — Ask REV dock during timed Exam Simulator.**
4. **DAR-013 — Learn nested-card density**, because this is a confirmed rendered composition problem rather than only structural debt.

### Consolidation work that can be delivered with the Courses/B7 system migration

- DAR-001, DAR-002, DAR-007, DAR-008, DAR-009, DAR-010, DAR-011, DAR-012, DAR-015, DAR-016.

### Assurance/documentation work required before B7 can be called complete

- DAR-003 Light-mode breadth;
- DAR-004 bounded screenshot regression;
- DAR-006 current technical documentation correction; and
- DAR-005 zero-live-consumer / compatibility retirement proof.

## Recommended delivery sequence

1. Merge this audit evidence after Founder approval.
2. Deliver a focused remediation PR for DAR-014, DAR-017 and DAR-018 with keyboard/responsive regression tests.
3. Deliver the Learn composition correction (DAR-013), either in that remediation increment if it remains coherent or as a separate small design-system PR.
4. Proceed into FI-020/Courses + B7 ownership consolidation, absorbing the icon/identity/shared-component findings rather than polishing the outgoing Subjects structure twice.
5. Add the bounded screenshot regression set and Light-mode parity contracts as part of B7 acceptance assurance.
6. Re-run Design Acceptance after B7 against the resulting production runtime before declaring the Interface System migration complete.

## B7 acceptance constraint

B7 may not be declared complete merely because old files/selectors have been removed.

Completion must prove:

- no live route/state depends on retired compatibility sources;
- surviving common controls/icons/assets are owned by the shared system rather than copied locally;
- accepted learner/Admin compositions retain their hierarchy;
- modal/focus behaviour is correct;
- the mobile/tablet Ask REV dock never obscures learner content and is absent from active timed Exam Simulator states;
- Learn presents as a reading workspace rather than nested-card chrome;
- Light/Dark and responsive canonical-state regression is green; and
- current technical documentation reflects the resulting implementation.

## Documentation-impact check

This is evidence/audit documentation only. It does not amend the Visual Brand System, Product UX Principles, Global Learner Navigation or other normative authority.

The confirmed remediation items implement existing authority and therefore do not require a new product decision. Their implementation PRs must update code, browser assurance and affected technical documentation. Historical evidence must remain historical rather than being rewritten to show the future fixed state.
