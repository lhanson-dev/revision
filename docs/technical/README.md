# Technical Documentation

This area describes **how Revision currently works** and how approved authority is implemented. It does not define what the product should be.

## Current implementation snapshot

- The governed learner product is the React/Vite application at `/revision/app/`.
- Canonical signed-in runtime: `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`.
- GitHub Pages deploys the built Vite `dist/` artifact from approved `main`.
- Global learner navigation is Home / Plan / REV / Progress / Subjects.
- Home is REV-led and conversation-first while the deterministic adaptive planner remains the authority for planning calculations.
- Supabase provides authentication, learner persistence and protected operational services.
- Learning content is discovered from governed typed content packs and presented through the course/component hierarchy described in the relevant implementation docs.
- Evidence, readiness and planning remain separate concepts in both engine and presentation.
- The approved Calm Teal / Manrope / Living E system is partially implemented in the learner runtime, with further token/component migration still required.

## Key implementation documents

- `REV Homepage Shell Implementation.md` — canonical learner shell, routing, hierarchy and REV/evidence presentation.
- `REV Living E Implementation.md` — current Calm Teal, Manrope, Living E, theme and REV-state implementation.
- `Brand System Production Readiness.md` — canonical brand-asset readiness, implementation gaps and migration sequencing.
- `Adaptive Revision Planner Implementation.md` — current adaptive planner implementation.
- `Authentication Implementation.md` — authentication implementation.
- `Content Factory Architecture.md` and related Content Factory docs — content-production implementation.
- `Production Backend Readiness Gate.md` — production backend readiness controls.
- `Risk-Based Assurance Plan Implementation.md` — change-driven assurance implementation.
- `Target System Architecture.md` and `Technology Stack.md` — current/target architecture and approved technical stack.

When this documentation conflicts with code about **current implementation**, inspect the code and correct the documentation. Neither code nor technical documentation may silently redefine approved product or brand authority.