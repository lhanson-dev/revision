---
title: "Testing & Assurance Standard"
document_id: "revision-testing-assurance"
document_type: "standard"
authority: "engineering"
status: "active"
version: "0.3"
owner: "Founder"
effective_date: "2026-08-17"
last_reviewed: "2026-08-19"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["automated assurance", "test risk classification", "assurance coverage", "defect severity"]
depends_on: ["ADR-0006", "ADR-0007", "ADR-0009"]
supersedes: null
---
# Testing & Assurance Standard

## Principle
Automation is the default source of regression confidence. Manual testing is reserved for targeted usability and exploratory judgement.

Assurance must describe what is actually evidenced, not imply confidence from test volume alone. Revision should be able to answer not only "did CI pass?" but also "which important user journeys, data boundaries and security controls were exercised, how recently, and what remains uncovered?"

## Required layers
- schema/content validation
- TypeScript/type checks
- lint/code-quality checks
- unit tests for engine/domain rules
- integration tests for important boundaries
- Playwright browser tests for core journeys
- automated accessibility checks where practical
- responsive viewport checks for learner-facing core journeys
- production build validation
- post-deployment smoke checks

## Assurance evidence model
Founder assurance is organised into six evidence domains. A domain may be reported Healthy only when current evidence exists for the controls that have been declared required for that domain.

### 1. Production availability
Evidence that the canonical live product is reachable and serving the expected production artifact.

At minimum:
- canonical `/app/` route responds successfully;
- the expected React production marker/build asset is present;
- retired/legacy routes are not being served where retirement is part of the release contract.

Availability alone does not prove a user journey or data path works.

### 2. Path to live
Evidence that a proposed change can move safely from branch to production.

At minimum:
- dependency installation;
- typecheck;
- lint;
- automated unit/integration/browser assurance required by the change risk;
- production build;
- explicit Founder merge approval;
- successful deployment from `main`;
- post-deployment production smoke.

The Admin surface should distinguish PR CI from production deployment evidence. A green PR is not the same as a healthy live deployment.

### 3. Critical user journeys
Revision maintains an assurance matrix for the current critical journeys derived from active product authority. Journey assurance should state whether coverage is:
- **Production-smoked** — exercised against the deployed production surface;
- **Browser-covered** — exercised end-to-end in automated browser assurance with controlled test data/mocks;
- **Integration-covered** — important service/data boundary covered without a full browser journey;
- **Unit-covered** — domain logic covered in isolation;
- **Not yet covered**.

The assurance matrix should begin with the currently prioritised learner journeys in `10-product-governance/Core User Journeys.md`, including authentication/account entry, learner Home/REV entry, subject/course navigation, Learn, Practice, Exam Prep, Progress, evidence persistence, and Admin access where applicable.

A journey must not be presented as fully covered merely because one component inside it has a unit test.

### 4. Data and database integrity
Assurance should explicitly cover material data responsibilities, including:
- learner-owned data isolation;
- progress/evidence persistence and retrieval;
- test/admin data exclusion from live learner metrics;
- migration privileges and compatibility where relevant;
- critical database functions/RPC privilege boundaries;
- failure behaviour that preserves learner work where required.

Database assurance should use deterministic SQL/integration verification where practical rather than relying only on UI tests.

### 5. Security and privacy controls
Assurance should map tests to the controls in the Security Standard and privacy authority, including:
- authentication required where expected;
- ordinary users cannot access admin/other-user data;
- RLS ownership boundaries;
- privileged credentials remain server-side;
- privileged database functions are not executable by browser roles;
- protected operations re-authorise server-side rather than relying on UI visibility;
- sensitive learner content is not unnecessarily exposed by operational surfaces.

A security control without current automated or explicitly recorded manual evidence should be shown as uncovered/Unknown, not Healthy.

### 6. Educational/content assurance
Learner-content factual and assessment assurance remains governed by the Content Accuracy Assurance Gate and content production workflow. Founder assurance may summarise current pack assurance/publication state but must not collapse educational assurance into software test coverage.

## Coverage model
Revision should maintain two complementary coverage views.

### Journey/control coverage
The primary Founder measure is **declared critical coverage**, not raw line coverage. It answers: of the journeys and controls Revision says are critical today, how many have current automated evidence at the required layer?

Each critical journey/control record should contain:
- stable ID and name;
- owning authority/source;
- risk level;
- required assurance layers;
- implemented automated tests/checks;
- latest successful evidence and commit/deployment where applicable;
- status: Covered / Partial / Uncovered / Unknown;
- gap/next action.

### Code coverage
Statement/branch/function coverage may be introduced as a supplementary engineering diagnostic. It must not be presented to the Founder as product assurance by itself. No minimum percentage is authorised until baseline instrumentation exists and a threshold has been deliberately set from observed risk/value rather than chosen arbitrarily.

## Build-on-change rule
Every material feature, defect fix or architecture change must update assurance along with the implementation.

The change must identify:
1. which critical journeys/controls are affected;
2. whether existing tests still prove them;
3. which new/updated automated assurance is required;
4. whether the Founder assurance matrix changes;
5. whether a new production smoke is required.

A new critical journey or security/data responsibility is not complete until its intended assurance ownership is recorded, even if some tests are deferred deliberately.

## Responsive assurance
Core learner journeys must be assured on representative mobile, tablet and laptop/desktop viewport classes.

At minimum, automated browser coverage should verify that critical journeys:
- remain navigable and functionally complete at representative phone, tablet and desktop widths;
- do not introduce unintended horizontal page scrolling;
- keep primary controls and explanatory/result content visible and operable;
- support touch-sized interaction targets and do not rely on hover-only behaviour;
- preserve exam, assessment, progress and subject-selection functionality across device classes.

Major learner-facing layout changes should include targeted responsive Playwright coverage. Manual device testing may supplement this for usability judgement, but it does not replace automated viewport regression checks.

## Risk-based CI
Low-risk changes run lightweight relevant checks. Medium-risk changes run targeted behavioural checks. High-risk changes to auth, data, progress, readiness, exams, migrations or shared engine run the full regression suite.

Any learner-facing change that materially alters layout, navigation, forms, assessment interactions, exam experience or progress presentation must include responsive regression coverage appropriate to its risk.

## Defect severity
Revision uses the following operational severity model for known defects. Severity is based on user/business impact, not implementation difficulty.

### P0 — Critical
A live issue causing or credibly risking one or more of:
- widespread inability to use the core product;
- material learner data loss/corruption;
- security/privacy breach or exposure of privileged credentials/data;
- materially incorrect educational behaviour that creates immediate serious learner harm across a broad/core flow;
- uncontrolled publication/merge/deployment bypass of a non-negotiable governance gate.

P0 requires immediate Founder visibility and release/operational action. Overall assurance cannot be Healthy while an unresolved P0 exists.

### P1 — High
A serious issue materially degrading a core journey or control, but without the catastrophic/widespread impact of P0, for example:
- authentication or a critical learner journey broken for a meaningful subset of users;
- progress/evidence not reliably saving;
- an important RLS/admin/security control failing without confirmed exposure;
- production deployment unhealthy while an older safe version remains available;
- a material educational/content defect in available content requiring prompt correction.

An unresolved P1 must surface as **Attention needed** and should normally block release of related changes until disposition is explicit.

### P2 — Medium
A meaningful defect with a workaround or limited scope that does not prevent the core product/control from functioning, for example:
- non-critical feature behaviour incorrect;
- material UX/accessibility degradation with a viable alternative path;
- incomplete operational visibility where the underlying service remains healthy;
- lower-risk content/presentation defect that should be corrected but does not invalidate the wider pack/journey.

P2 is tracked and prioritised but does not automatically make the whole system unhealthy. The Admin assurance view should show the open count and the affected domain/journey.

Lower-severity cosmetic or minor maintenance findings may be tracked separately and should not inflate P0/P1/P2 counts.

## Defect evidence and lifecycle
A defect counted in Founder assurance must have a durable record containing at least:
- severity;
- affected production/user journey/control;
- observed evidence;
- current status;
- owner/next action where known;
- linked fix PR when one exists;
- verification/closure evidence.

A failed automated critical check may create or update a defect record automatically later, but automation must not silently downgrade or close a P0/P1 without evidence that the affected control/journey is restored.

## Test data
Automated tests use dedicated test identities and synthetic data. Test activity is excluded from live metrics/reporting by default.

## Learner clarity
Where structurally possible, validation must require learner-facing activities/results to provide the explanatory content needed to state what the activity is, why it matters, what the learner should achieve, how results are derived, and what to do next.
