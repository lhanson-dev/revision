# Interface System B7 — Learner Shell Icon Consolidation

**Status:** Proposed on governed branch; not live until PR merge and production verification  
**Task:** Issue #137 — Complete B7 foundation cleanup  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

## Purpose

Record the bounded B7 ownership change that moves recurring learner-shell navigation and account icons from a `PlannerRuntime`-local SVG family into the public Interface System `Icon` registry.

This implements the existing Interface System rule that recurring product icons come through the controlled registry. It does not create new visual authority or redesign learner navigation.

## Ownership change

Before this increment, `PlannerRuntime` defined a local `NavIcon` SVG family for:

- Home;
- Plan;
- Progress;
- Courses;
- Profile;
- Settings;
- Admin;
- Upgrade plan; and
- Log out.

The canonical shell now consumes `Icon` from `src/app/ui/` for those recurring jobs. Where the shared registry did not yet contain the shell job, the registry has been extended centrally.

Shell CSS may continue to own composition-specific icon sizing through the existing `nav-icon` class. It no longer owns the SVG drawing/stroke language for these recurring icons.

## Assurance

`scripts/assurance/b7-shell-icon-ownership.test.mjs` fails if the canonical `PlannerRuntime`:

- reintroduces the local `NavIcon` family;
- contains local `<svg>` icon markup; or
- stops consuming the required controlled icon names.

Normal typecheck, lint, unit/governance assurance, build and responsive browser regression remain required before merge.

## Deliberately excluded

This increment does not claim to resolve:

- the shell-local REV wordmark reconstruction;
- text close glyphs or other recurring control glyphs;
- modal/drawer focus-management ownership;
- Home recommendation identity treatment;
- course-specific symbol/letter iconography;
- compatibility CSS/theme-bridge retirement; or
- journey/page composition redesign.

Those remain separate B7 or journey-programme work.

## Documentation impact

The public component registry is updated because the shared `Icon` contract expands. No normative product, navigation or brand authority change is required, and the historical Design Acceptance Review remains unchanged.
