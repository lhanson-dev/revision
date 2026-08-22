# Design Acceptance Review — 22 August 2026

**Status:** Open — Founder visual acceptance in progress  
**Review baseline:** `main` at `6a40afc95dabd55d0a76a758ea722d5108c571ea`  
**Production evidence:** PR #126 path-to-live successful  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0, `20-brand-and-experience/Product UX Principles.md` v0.4, `10-product-governance/Global Learner Navigation.md` v0.7 and applicable product/evidence authorities  
**Purpose:** perform a point-in-time acceptance review of the migrated Revision interface before treating the principal learner/Admin design migration as visually accepted

## Review boundary

This is an audit and acceptance exercise, not a new source of normative product or brand authority.

The review asks two separate questions:

1. **Conformance:** does the current production implementation materially follow the approved product, navigation, UX and Visual Brand System?
2. **Acceptance:** does the resulting live experience actually feel coherent, clear, calm, contemporary, student-appropriate and production-quality when reviewed as a whole rather than as isolated implementation increments?

Automated assurance can prove many objective contracts but cannot replace Founder visual judgement on composition, hierarchy, density, polish and overall product feel.

B7 compatibility retirement remains governed by the existing Interface System implementation contract. This review does not silently add or remove a normative B7 gate. Any later decision to make Design Acceptance a formal lifecycle/release gate requires a separate governed authority change.

## Baseline evidence established

- B1 Interface System foundation is live.
- B2 Plan/Progress migration is live.
- B2.5 reusable component/icon/asset foundation is live.
- B3 Subjects/Subject Home/course migration is live.
- B4 Learn/Practice migration is live.
- B5 Exam Prep/exam experience migration is live.
- B6 Admin migration is live.
- Pre-B7 theme-integrity hardening is production-live through PRs #123–#126.
- PR #126 exact head `d800a06b3aa8c53562eceacb42a86fa0802de9b6` passed Revision CI #722.
- PR #126 merged as `6a40afc95dabd55d0a76a758ea722d5108c571ea`.
- `revision/path-to-live = success` is present on that merge commit, with deployment run `32585745336` completing successfully.

The pre-B7 theme-integrity condition is therefore satisfied. B7 itself has not started.

## Static conformance findings at review start

### DAR-01 — Current navigation implementation conforms to active authority

`Global Learner Navigation.md` v0.7 governs four learner-wide destinations — Home, Plan, Progress and Subjects — plus persistent contextual Ask REV.

Current `PlannerRuntime.tsx` implements:

- desktop left rail with prominent Ask REV above Home / Plan / Progress / Subjects;
- contextual academic branch expansion beneath Subjects;
- one compact account control at the bottom;
- mobile/tablet two-line menu control and navigation drawer;
- collapsed account utilities until the learner opens the account control; and
- persistent bottom Ask REV dock as the only persistent bottom learner action.

**Assessment:** structurally conforming implementation evidence. Founder review below identifies a visual-conformance defect in the desktop Ask REV treatment.

### DAR-02 — README navigation description is stale

`README.md` still describes REV as a peer learner navigation destination and states that mobile retains a five-item persistent bottom navigation bar. That contradicts both the active v0.7 navigation authority and the current implementation.

**Assessment:** documentation defect; current product implementation is not the source of the mismatch.

**Action:** correct current implementation documentation in this review branch.

### DAR-03 — Interface migration documentation is stale after PR #126

`docs/technical/Interface System Implementation.md` still describes pre-B7 theme integrity as in progress and `docs/technical/Interface Theme Integrity Pre-B7.md` still describes the Practice recommendation follow-up as in progress.

PR #126 has now merged and production path-to-live is successful.

**Assessment:** documentation defect.

**Action:** update the technical records with the observed production evidence without rewriting earlier historical findings.

### DAR-04 — Brand System Production Readiness record substantially understates the live migration state

`docs/technical/Brand System Production Readiness.md` still describes B3 as in progress and B4–B6 as future work even though B3–B6 are production-live and the pre-B7 theme-integrity sequence has completed.

**Assessment:** documentation defect affecting current implementation truth.

**Action:** reconcile the readiness matrix and sequence to current `main`.

## Founder review findings — Group A: Shell and global hierarchy

### DAR-A01 — Desktop Ask REV treatment is materially under-emphasised

Founder observation: the desktop Ask REV control looks like an ordinary button, uses a diamond/star glyph and does not read as Revision's key always-available help action.

The active navigation authority already requires desktop Ask REV to receive the strongest branded emphasis. The Visual Brand System establishes the Living E / three horizontal bars as REV's core identity and explicitly rejects substituting unrelated iconography for REV presence.

Current implementation uses a `✦` glyph before `Ask REV`, while the mobile Ask REV dock already uses `RevPresence` / the Living E.

**Assessment:** **Change required — implementation defect against existing authority.** No new product/brand decision is required to correct it.

**Remediation direction:**

- replace the diamond/star glyph with the approved Living E / three-line REV presence;
- give desktop Ask REV materially stronger visual hierarchy than ordinary navigation destinations while remaining calm rather than neon or sci-fi;
- preserve the explicit `Ask REV` label;
- use the existing central semantic tokens and REV component rather than a local palette/icon treatment; and
- assure light/dark, focus, reduced-motion and responsive behaviour.

### DAR-A02 — Founder proposes direct `My Courses` access

Founder observation: learners should be able to get straight to their courses instead of having to navigate through Subjects first.

The desired outcome — faster access to the learner's active courses — is credible. However, the literal proposal of a new permanent `My Courses` peer link conflicts with active `Global Learner Navigation.md` v0.7 and `Information Architecture.md`, which deliberately define four global destinations and warn against duplicate entry points / unnecessary menu complexity.

**Assessment:** **Founder decision required — proposed authority change, not an implementation defect.**

The design review should not add a fifth peer destination automatically. A stronger solution may be to preserve a flat global model while making current courses directly reachable from the Subjects entry (for example, an immediate `My courses` view/child or a re-scoped Subjects entry) rather than maintaining both `Subjects` and `My Courses` as competing global concepts.

No production navigation implementation should change until the Founder approves the intended authority direction.

### DAR-A03 — Founder proposes current subscription tier beneath learner name

Founder observation: the compact learner account control should show the learner's subscription level beneath their name, using `Free`, `Paid` or `Premium` as working labels for now.

FI-002 product policy already requires current-plan visibility and defines the conceptual Free / Paid / Premium ladder. Customer-facing paid-tier names remain unresolved, and the approved billing architecture explicitly records that production subscription state is not yet implemented while FI-002 remains `Analyse`.

**Assessment:** **Direction aligned, implementation blocked by FI-002 readiness/truth source.**

Recommended design requirement for FI-002: once a truthful entitlement/subscription projection exists, the compact account identity treatment should expose the current learner tier directly beneath the learner name. The UI must consume actual entitlement state and must not hard-code or simulate a paid tier before the commercial system exists. Working conceptual labels may remain Free / Paid / Premium until customer-facing names are separately approved.

Because the active navigation authority currently defines the compact account control as avatar/initial + learner name only, making the tier line a permanent shell requirement should be incorporated into the applicable navigation/FI-002 authority before production implementation.

## Founder visual acceptance matrix

Visual acceptance should be performed on the production application rather than inferred from source code. Review representative states rather than only default route loads.

| Review group | Representative surfaces / states | Acceptance focus |
| --- | --- | --- |
| A — Shell and global hierarchy | Desktop rail; mobile/tablet top bar + drawer; account menu; Ask REV dock; contextual Subjects expansion | recognisable hierarchy, REV prominence, calm density, orientation, responsive usability |
| B — Home / Plan / global Progress | Home opening hierarchy and REV input; Today/continuation context; Plan setup and recommendation states; Progress evidence/empty states | useful action obvious, conversation-first Home, explainability, restrained cards, scanability |
| C — Subjects and course hierarchy | Subjects; Subject Home; course Overview; contextual course navigation; course Progress | course/subject orientation, hierarchy without dashboard clutter, active-state clarity |
| D — Learn and Practice | Learn reading state; Practice task state; answer reveal/check; correct/incorrect feedback; written answer; saving/error; visible `REV recommends` guidance | reading focus, task dominance, progressive disclosure, semantic feedback, no theme leakage |
| E — Exam Prep and timed exam | Exam Prep; expanded paper; active timed exam; late-timer state; Pause overlay; Stop confirmation; self-marking/results | calm exam focus, timer/control prominence without stress theatre, interruption clarity, destructive-state clarity |
| F — REV | Contextual Ask REV panel/overlay; expanded REV workspace; current-context hand-off | REV feels present and distinctive without becoming sci-fi; context preserved; learner not forced away from work |
| G — Account and authentication | Sign in; Create account; Profile; Settings; light/dark selection | brand continuity, clean hierarchy, accessible forms, no separate visual system |
| H — Admin / operations | Dashboard; Users; Activity; System Health; Founder Assurance; Content Operations; tables/forms/statuses | recognisably Revision but appropriately dense; truthful status semantics; operational efficiency |

For the learner groups A–G, review both light and dark themes and at minimum representative desktop plus constrained mobile/tablet layouts. Exam interaction should additionally be checked at a practical tablet/landscape size.

## Acceptance criteria

A review group is accepted only when the live experience satisfies the applicable authority and there is no material issue in:

- primary-action hierarchy;
- cognitive load and scanability;
- typography and spacing rhythm;
- surface/card density;
- control consistency and affordance;
- REV identity and prominence;
- responsive composition and touch usability;
- light/dark parity;
- semantic feedback and status clarity;
- accessibility-visible behaviour such as focus and non-colour meaning;
- loading, empty, saving, error and conditional states where material; and
- overall coherence across adjacent surfaces.

A technically valid screen may still fail Design Acceptance if it feels cluttered, generic, visually inconsistent, adult-SaaS-like, childish, institutional, unnecessarily formal or otherwise misses the approved experience principles.

## Review outcome vocabulary

For each review group, record one of:

- **Accepted** — no material design change required.
- **Accepted with minor defects** — direction is accepted; bounded defects may be remediated without reopening the design decision.
- **Change required** — material hierarchy/composition/interaction issue; remediation must be reviewed again before acceptance.
- **Blocked** — the relevant live state cannot yet be credibly reviewed.

Any material new design direction discovered during acceptance must be treated as a proposed authority change rather than silently encoded into implementation.

## Current review state

| Group | State | Notes |
| --- | --- | --- |
| A — Shell and global hierarchy | **Change required** | Ask REV desktop treatment is a confirmed implementation defect. `My Courses` and account-tier placement require Founder/governance decisions before implementation. |
| B — Home / Plan / global Progress | **Ready for Founder review** | Migration live; visual acceptance still required. |
| C — Subjects and course hierarchy | **Ready for Founder review** | Migration live; visual acceptance still required. |
| D — Learn and Practice | **Ready for Founder review** | PR #126 closes the known Practice dark-theme defect and path-to-live is successful. |
| E — Exam Prep and timed exam | **Ready for Founder review** | Migration live; interruption states included in acceptance scope. |
| F — REV | **Ready for Founder review** | Contextual and expanded surfaces exist; holistic acceptance still required. |
| G — Account and authentication | **Ready for Founder review** | Theme-integrity assurance covers authentication/account states. |
| H — Admin / operations | **Ready for Founder review** | Migration live; operational visual acceptance still required. |

## Documentation-impact check

This review exposes stale current-state documentation plus two proposed changes that cross active authority boundaries.

This review branch should therefore:

- correct `README.md` navigation implementation truth;
- update `docs/technical/Interface System Implementation.md` with PR #126 production completion;
- update `docs/technical/Interface Theme Integrity Pre-B7.md` with PR #126 production completion;
- reconcile `docs/technical/Brand System Production Readiness.md` to B1–B6 + pre-B7 current state;
- record the Group A Founder findings without treating unapproved proposals as authority; and
- preserve historical audits and earlier PR evidence unchanged.

The Ask REV remediation is an implementation correction under existing authority and should be handled on its own governed defect branch/PR. Any permanent `My Courses` global-navigation change requires an approved navigation-authority amendment. The current-tier account-line requirement should be incorporated into FI-002/navigation authority before production implementation and must wait for a truthful subscription/entitlement source rather than simulating paid state.
