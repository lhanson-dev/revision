# FI-022 — Learner Plan State Foundation — Analysis Record

**Document type:** product-management working record  
**Authority:** non-authoritative Definition-of-Ready analysis  
**Feature:** FI-022  
**Lifecycle state:** Analyse  
**Analysis started:** 2026-08-24  
**Owner:** Product / Founder  
**Implementation status:** Not started — material production implementation requires explicit human-approved `Ready` status.

## Lifecycle evidence

Founder direction on 24 August 2026 established that Revision should build the basic subscription capability now, before real Stripe integration:

> Revision needs the ability to assign a Student one of three subscriptions at a basic MVP level; new registrations start Free; Free receives everything while the core Student product is tested; real upgrade/billing implementation follows after the core Student product.

This is an explicit human product decision that the bounded foundation belongs in Revision, satisfying `New → To Do`. Active Definition-of-Ready analysis began immediately, so FI-022 is now in `Analyse`.

This direction is **not** an `Analyse → Ready` approval. No production code, migration or Supabase schema change may begin until the final Definition-of-Ready assessment is explicitly approved by the Founder.

## Why FI-022 exists separately from FI-002

FI-002 is already the governed full Subscription Plans / Feature Entitlements and Upgrade Journey and remains in `Analyse`. Its approved authority covers a much broader commercial system: differentiated entitlements, upgrade UX, billing lifecycle, payer/supporter relationships, parent support and later Stripe-backed subscription truth.

The current Founder direction deliberately changes the delivery sequence, not the long-term commercial model.

Trying to implement only a fragment of FI-002 while FI-002 remains blocked on commercial/legal/lifecycle questions would blur the feature lifecycle and make it unclear what was actually Ready. FI-022 therefore isolates the small prerequisite that can safely be completed now:

**durable learner tier identity + Free default + protected manual assignment + central all-access resolution.**

The proposed normative sequencing rule is recorded in `10-product-governance/Pre-Commercial Subscription Foundation.md`.

## Product problem

Core Student journeys and features are being implemented before the paid commercial system. If Revision waits until Stripe/upgrade implementation to introduce plan identity, later commercial work risks requiring account migrations and scattered retrofitting across features.

Conversely, implementing the full FI-002 commercial stack now would distract from the core Student product and introduce payment, child/payer, cancellation and entitlement complexity before it creates testing value.

FI-022 solves the narrow architectural/product problem: **establish the real concept of a Student plan now without allowing commercial complexity or paywalls to slow core Student delivery.**

## User-value hypothesis

During this foundation phase, the Student should experience no new commercial friction. A newly registered Student should simply receive Free and continue into the approved Student journey.

The value is primarily enabling infrastructure: Revision can build and test all core Student features against a stable plan context, and later activate differentiated packages without changing the meaning of the Student's account or educational evidence.

## Approved proposed experience

### New Student

`successful registration → durable plan defaults to Free → normal GJ-01 continues`

There is no tier-choice or payment step in GJ-01.

### Existing Student

Existing accounts receive a bounded Free compatibility state. They are not re-onboarded and are not denied current access.

### Founder/Admin testing

An authorised Founder/Admin can assign a Student:

`Free ↔ Paid ↔ Premium`

through a protected server-controlled operation. The assignment is durable and auditable.

### Access behaviour during core-product testing

For all currently implemented learner-facing core capabilities:

`Free = Paid = Premium = full access`

This is intentionally not the final commercial entitlement matrix.

## Data model recommendation

Current production evidence shows no subscription/entitlement/plan table. `public.profiles` currently stores server-owned classification such as `is_test_user` and `is_admin` and is not client-editable.

Do not use editable Auth `user_metadata` for plan state. Do not overload `profiles` with billing/provider responsibilities.

Recommended conceptual foundation:

```text
learner_plan_state
- user_id uuid primary key -> auth.users(id)
- tier constrained: free | paid | premium
- assignment_source constrained: registration_default | compatibility_default | admin_manual
- assigned_by uuid nullable -> auth.users(id)
- created_at timestamptz
- updated_at timestamptz
```

Exact SQL naming may be refined during implementation if it preserves this responsibility boundary.

The Student may read their own effective plan where needed, but ordinary browser clients must not update the tier. Manual assignment should use an authenticated protected Admin/server boundary after re-verifying Admin authorization.

## Entitlement resolution recommendation

Create one central application/service concept for resolving plan/entitlement context rather than allowing features to branch directly on tier names.

For FI-022 the mapping is deliberately constant:

```text
free    -> current_core_student_access
paid    -> current_core_student_access
premium -> current_core_student_access
```

This means FI-022 proves plan identity and resolution plumbing without creating artificial locks.

Later FI-002 can replace the package mapping and introduce boolean/allowance entitlement decisions behind the same boundary.

## Missing-state behaviour

A missing/invalid plan row is an integrity problem and must be observable.

Because Free has full current-core access in this temporary phase, learner-facing resolution should fail safely to Free/full-current-core rather than accidentally blocking a legitimate Student. Founder/Admin assurance should surface the missing/invalid state for repair.

This behaviour must be explicitly revisited by FI-002 before differentiated paid protection becomes active.

## REV role

**N/A for FI-022.**

REV does not need to explain or sell subscription tiers in this foundation. Introducing commercial conversation would add learner-facing behaviour without helping prove plan-state capability.

## MVP boundary

### Included

- durable Free / Paid / Premium learner plan state;
- Free default for new Students;
- compatibility Free default for existing Students;
- protected Founder/Admin manual tier assignment;
- assignment audit/provenance sufficient for operations;
- learner/effective-plan read path where required;
- central plan resolution boundary;
- temporary full-current-core access for every tier;
- integrity handling for missing/invalid plan state; and
- operational assurance sufficient to prove defaults and assignments work.

### Excluded

- Stripe and payment provider calls;
- checkout, billing and customer portal;
- payer/supporter account relationships;
- parent dashboards;
- real paid entitlement differences;
- locked states/paywalls;
- upgrade prompts or pricing screens;
- payment lifecycle, cancellation, expiry, failed-payment or refunds;
- quantitative usage allowances;
- final customer-facing tier names; and
- commercial conversion analytics.

## Free / Paid / Premium assessment

For this foundation, the three tier states are structurally real but intentionally **not differentiated in learner capability**.

- **Free:** full current core Student product during development/testing.
- **Paid:** same full current core Student product; used to prove durable tier assignment/resolution before commercial activation.
- **Premium:** same full current core Student product; used to prove durable tier assignment/resolution before commercial activation.

This is acceptable for FI-022 because its hypothesis is infrastructure readiness rather than tier conversion. It does not redefine the long-term FI-002 value ladder.

## Upgrade / conversion hypothesis

**N/A for FI-022.**

There is deliberately no real upgrade journey in this foundation. FI-002 owns contextual upgrade discovery, plan comparison, purchase and conversion measurement.

## Measurement contract

Primary hypothesis:

> Revision can reliably establish and resolve a Student's plan tier without introducing commercial friction or changing learner capability during core-product testing.

Required operational events/evidence should be sufficient to answer:

- Did a new Student receive Free?
- Did an existing Student receive the compatibility Free state?
- Can a permitted Admin change the tier?
- Does the changed tier survive reload/session changes?
- Is a missing/invalid plan detectable?
- Are self-assignment/bypass attempts rejected?

A full commercial funnel is deliberately out of scope.

## Founder/Admin assurance

Founder/Admin should be able to see or query, proportionately:

- counts by tier for testing;
- missing/invalid plan-state count;
- manual assignment success/failure;
- recent assignment provenance where investigation is needed; and
- evidence that ordinary learners cannot mutate plan state.

This does not require a full subscription-operations dashboard.

## Risk, trust and accessibility

### Security

Risk: a Student elevates their own plan before real entitlements exist, leaving an insecure foundation for later paid controls.

Control: plan write is server-controlled; browser cannot self-update; protected Admin operation re-verifies identity/authorization; RLS/privileges are tested.

### Commercial semantics

Risk: testing tiers are mistaken for real paid contracts.

Control: no payment status, price, renewal or billing fields are invented; manual `paid`/`premium` state is explicitly a pre-commercial assignment, not evidence of payment.

### Educational truth

Risk: tier becomes entangled with learning evidence.

Control: plan state is account/commercial context only; all educational evidence semantics remain identical across tiers.

### GJ-01 friction

Risk: adding subscriptions creates a commercial step during onboarding.

Control: Free assignment is automatic and invisible; GJ-01 is unchanged.

### Accessibility

There is no required new Student-facing interaction. Any Admin control introduced later must use the governed Interface System and normal keyboard/accessibility standards.

## Technical feasibility and canonical runtime

Feasibility is high.

Current implementation evidence confirms:

- canonical learner runtime: `/app/` → `src/main.tsx` → `AuthGate.tsx` → `PlannerRuntime.tsx`;
- Supabase Auth is canonical authentication;
- `profiles` demonstrates existing server-owned account classification and own-row read patterns;
- protected `admin-operations` already verifies the authenticated user and `profiles.is_admin` before using privileged server capability; and
- no current subscription/plan table exists, so there is no competing production model to migrate.

The implementation should extend these established boundaries rather than create a second learner runtime or trust client metadata.

## Test / assurance approach

FI-022 should be treated as a cross-layer account/authorization change. Required assurance should include:

- migration replay from clean database;
- new Auth user receives exactly one Free plan row;
- existing Auth users are backfilled Free without duplication;
- plan tier constraint rejects invalid values;
- authenticated Student can resolve/read only their own plan as intended;
- authenticated Student cannot update/insert/delete their plan state;
- non-admin caller cannot use manual assignment operation;
- Admin can assign Free/Paid/Premium to a target Student;
- assignment survives reload/new session;
- assignment does not change `is_admin`, experience role, course membership or learning evidence;
- all three tiers resolve to the same current-core capability access;
- missing-state fallback remains full Free access and surfaces an integrity condition;
- database-backed browser assurance proves new-registration/default behaviour where practical; and
- production backend readiness/smoke verifies the required plan-state capability is actually present before the frontend depends on it.

## Documentation / authority impact

### This readiness package

- create `10-product-governance/Pre-Commercial Subscription Foundation.md` as the normative temporary sequencing rule;
- create this FI-022 analysis record;
- index the new authority; and
- record FI-022 in the canonical Product Feature Backlog when this branch is integrated with the then-current `main` lifecycle register.

PR #155 currently also changes the end of `Product Feature Backlog.md` to record FI-021. To avoid manufacturing a parallel-register conflict solely from concurrent governance work, this analysis branch deliberately leaves that shared register untouched until final integration. Before FI-022 can be merged as Ready, the branch must be refreshed against then-current `main` and the canonical backlog must record the approved FI-022 lifecycle state alongside FI-021 rather than overwriting it.

### Implementation package later

When FI-022 implementation actually begins, update in the same governed implementation change as applicable:

- `docs/technical/Authentication Implementation.md` for default plan creation relationship;
- a dedicated current-state subscription/plan implementation record or the appropriate existing subscription technical document, clearly distinguishing FI-022 from future Stripe billing;
- `docs/technical/Production Backend Readiness Gate.md` if a new backend capability/version is required;
- `90-governance-registers/Assurance Coverage Register.md`;
- Admin implementation documentation if manual assignment is added to an Admin surface/service;
- `README.md` if current implementation truth materially changes; and
- `INDEX.md` if a new technical source of truth is created.

The existing Stripe target ADR/architecture and Pricing and Billing Policy remain historically/currently valid and should not be rewritten as though billing were now implemented.

## Definition-of-Ready assessment

- Student problem — **PASS**
- Strategic case — **PASS**; removes a later retrofit while deliberately avoiding distraction from the core Student product
- User value — **PASS**; no new friction now and preserves a clean future upgrade path
- Experience — **PASS**; automatic Free default, no Student commercial step, bounded Admin assignment and explicit recovery behaviour
- Evidence / intelligence — **PASS**; commercial/account context is explicitly separated from learning evidence
- REV role — **N/A**; no REV behaviour needed
- MVP boundary — **PASS**; narrow plan-state foundation with broad commercial system deliberately excluded
- Free / Paid / Premium — **PASS**; three real states with temporary equal access, without redefining the later value ladder
- Upgrade hypothesis — **N/A**; intentionally deferred to FI-002
- Measurement — **PASS**; operational integrity hypothesis and required evidence defined
- Founder/Admin assurance — **PASS**; bounded plan-state integrity/assignment visibility defined
- Risk / trust / accessibility — **PASS**; authorization, commercial-semantics, GJ-01 and educational-truth controls defined
- Technical feasibility — **PASS**; canonical runtime, Auth, Admin boundary and database responsibility identified
- Test / assurance approach — **PASS**; database/RLS/admin/default/persistence/fallback assurance defined
- Documentation / authority impact — **PASS subject to final integration bookkeeping**; normative sequencing authority is defined and the shared backlog update is deliberately deferred to the current-main integration point so concurrent FI-021 state is preserved
- Blocking decisions — **NONE** for the bounded FI-022 scope
- Human Definition-of-Ready approval — **NOT YET GRANTED**

## Product Manager recommendation

**Recommend FI-022 `Analyse → Ready`.**

The feature is intentionally small enough that development should not have to decide product behaviour. The critical rules are explicit: new Students are Free, every tier gets full core access during testing, only a protected Admin path may manually reassign tier, and real commercial differentiation remains FI-002 work.

The remaining lifecycle gate is explicit Founder approval of FI-022 Ready. That approval would permit a later governed implementation branch once the Ready authority/register state is integrated into approved `main`; it would not approve a PR merge or begin implementation by itself.

## Documentation-impact check

This analysis deliberately proposes a new normative pre-commercial sequencing authority because the Founder direction changes what Revision should implement now compared with the broader existing FI-002 MVP description. It does not change approved launch pricing, the future Stripe target, educational truth, GJ-01, or historical FI-002 decisions.

The canonical Product Feature Backlog update is intentionally deferred to final branch integration because concurrent PR #155 owns the current end-of-register FI-021 addition. This avoids stale-branch overwrite and is an explicit application of the current-main integration rule, not an omitted documentation impact.
