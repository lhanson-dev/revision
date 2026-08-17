# Authority Migration Register

| Existing proposition / behaviour | Source | Proposed target authority | Current disposition | Founder decision needed? |
|---|---|---|---|---|
| Content hierarchy: Subject → Qualification / Exam Board → Paper or Area | `README.md` | Product Scope & Capability Taxonomy | Candidate authority | Yes |
| Reusable learning pattern: Learn → Recall → Link topics → Answer → Test → Measure progress → Simulate exam | `README.md` | Product Source of Truth / User Journeys | Candidate authority | Yes |
| Progress should be evidence-based rather than click-based | `README.md` | Product Principles / Product Source of Truth | Candidate authority | Yes |
| Multi-subject / multi-board / multi-paper platform model | `README.md`, hub UI | Product Scope & Capability Taxonomy | Candidate authority | Yes |
| Authentication required to access revision hub/modules | root `index.html`, `auth-sync.js` | Product Source of Truth / User Journeys | Implementation only pending decision | Yes |
| Cross-device cloud progress sync | `auth-sync.js`, root UI | Product Source of Truth / Data Governance | Implementation only pending decision | Yes |
| Local fallback and cloud retry behaviour | `auth-sync.js` | Technical documentation | Retain as implementation detail | No, unless product promise is proposed |
| Reset all synced progress | `auth-sync.js` | User Journey / Data Governance | Candidate product behaviour | Yes |
| Full timed exam simulation and AO1–AO4 tracking | `README.md`, `v2.js` | Product Source of Truth / User Journeys | Candidate authority | Yes |
| Adaptive/evidence-aware readiness recommendation | `README.md`, `feedback-v3.js` | Product Source of Truth / Evidence standard | Candidate authority; methodology/claim needs scrutiny | Yes |
| Personal, evidence-aware ongoing Tutor | Founder instruction, 2026-08-17 | `10-product-governance/Personal Study Coach Capability.md` and learner journey | Proposed authority in draft PR; not implemented | Yes |
| Current navy/green/cream visual treatment | HTML/CSS | Visual Brand & Style Guide | Implementation evidence only | Yes before promotion |
| GitHub Pages deployment from `main` | `README.md` | Technical documentation / Release standard | Current implementation detail | Only if promoted to durable standard |

## Rule
No row marked candidate or proposed authority becomes active merely by appearing here. Promotion requires a governed authority document and explicit Founder approval.
