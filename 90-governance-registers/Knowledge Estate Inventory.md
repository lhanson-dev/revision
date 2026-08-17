# Knowledge Estate Inventory

**Migration:** Light Adoption
**Snapshot basis:** repository `main` at start of adoption.

| Source | Current role | Classification | Candidate future owner | Risk / note |
|---|---|---|---|---|
| `README.md` | Product description + repo structure + learning/progress principles | Mixed candidate authority + implementation description | Product Governance + Technical Docs | Important source, but mixes intended rules with current implementation |
| `index.html` | Root auth flow and Revision Hub | Current implementation truth | Technical Docs; candidate Product/Journey evidence | Shows auth-required hub, account creation/sign-in and subject navigation |
| `subjects/business/index.html` | Business subject landing | Current implementation truth | Technical Docs; candidate Journey evidence | Current subject-navigation implementation |
| `subjects/business/aqa-as/paper-2/index.html` | Paper 2 module UI | Current implementation truth | Technical Docs; candidate Journey/UX evidence | Live module surface |
| `subjects/business/aqa-as/paper-2/auth-sync.js` | Auth + local/cloud progress sync/reset | Current implementation truth | Technical Docs; candidate Product/Data/Trust evidence | Long-term intent of mandatory auth/cloud sync still needs explicit decision |
| `subjects/business/aqa-as/paper-2/app-core.js` | Core navigation/recall behaviours | Current implementation truth | Technical Docs; candidate Journey evidence | Implementation, not automatic authority |
| `subjects/business/aqa-as/paper-2/app-test.js` | Quick test + case-study behaviours | Current implementation truth | Technical Docs; candidate Journey evidence | Implementation, not automatic authority |
| `subjects/business/aqa-as/paper-2/v2.js` | Progress model, data lab, exam simulation | Current implementation truth | Technical Docs; candidate Product/Journey evidence | Encodes substantial learning/readiness behaviour |
| `subjects/business/aqa-as/paper-2/feedback-v3.js` | Adaptive/evidence-aware readiness | Current implementation truth | Technical Docs; candidate Product Principle evidence | Needs explicit definition of readiness methodology/claims |
| `data-core.js`, `data-recall.js`, `data-test.js` | Revision content/question data | Current implementation/content truth | Product/Content Governance later | Content quality/evidence standard not yet governed |
| `styles.css` + inline root CSS | Current visual implementation | Current implementation truth | Technical Docs; future Brand/Visual authority | Do not treat current styling as final brand authority |

## Current assessment
No material legacy-document conflict was found in the first discovery pass. The primary migration risk is **unresolved intent**: several important behaviours exist in code but have not yet been deliberately approved as durable product rules.