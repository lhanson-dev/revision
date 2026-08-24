# FI-021 — Student First-Use Onboarding / GJ-01 — Analysis Record

**Document type:** product-management working record  
**Authority:** non-authoritative Definition-of-Ready analysis  
**Feature:** FI-021  
**Lifecycle state:** Analyse — complete; Ready decision pending explicit Founder approval  
**Analysis started:** 2026-08-23  
**Readiness refreshed:** 2026-08-24 against approved `main` `c8b746f09c477846b1627a80ba6565d58d6e87df`  
**Owner:** Product / Founder  
**Implementation status:** Not started — material production implementation is prohibited until explicit human-approved `Ready` status.

## Lifecycle evidence

On 23 August 2026 the Founder reviewed and design-locked the GJ-01 post-signup Student journey through PR #154, merged as `0c2452b547d273c791a2b4542553a5a5b190d986`.

After that merge, Product recommended creating and analysing FI-021 Student First-Use Onboarding with FI-006 as its explicit evidence dependency. The Founder replied `ok next`. That records the human product decision that FI-021 belongs in Revision and authorises `New → To Do → Analyse`. It did **not** approve `Ready` or implementation.

PR #156 subsequently completed and integrated the FI-006 Definition of Ready on 24 August 2026. Approved `main` now contains the directional starting-check evidence contract, deterministic recommendation rule and skip/partial/no-question fallback required by FI-021.

This refresh therefore closes the remaining FI-021 product blockers and brings FI-021 to its own independent `Analyse → Ready` decision. The human Ready gate remains outstanding and cannot be inferred.

## Governing context

FI-021 implements an already accepted first-use product direction. Read together:

- `10-product-governance/Authentication Experience.md` — newly registered users choose Student / Parent / Teacher before product onboarding; only Student is enabled initially;
- `10-product-governance/Core User Journeys.md` — PR #155 promotes the Founder-reviewed GJ-01 sequence into normative product direction;
- `10-product-governance/Product System Model.md` — approved FI-006 directional starting-check evidence semantics;
- `40-evidence-and-trust/Claims and Progress Governance.md` — starting-check evidence must not create coverage/mastery/readiness/grade claims by itself;
- `40-evidence-and-trust/Privacy and Student Data Principles.md` — proportionate collection and bounded analytics;
- `20-brand-and-experience/Product UX Principles.md` — obvious next action, progressive disclosure, mobile/responsive accessibility;
- `80-company-workflows/Feature Definition and Measurement Workflow.md` — complete Definition-of-Ready and human approval requirements;
- `research/GJ-01 Student Onboarding Screen Contract - 2026-08-23.md` — Founder-reviewed design evidence for the locked screen hierarchy and responsive treatment; and
- FI-020 Learner Courses plus FI-006 Initial Course Starting Check as implementation dependencies with their own governed product contracts.

Research remains implementation input rather than normative authority. PR #155 promotes the accepted first-use behaviour into `Core User Journeys.md` so development will not depend on research as product policy.

## Current implementation and canonical surface

The canonical learner entry remains `/app/`.

Current implementation evidence on approved `main` confirms:

- `/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` is the canonical learner runtime;
- `AuthGate.tsx` owns authentication/session admission and currently admits an authenticated session into the learner runtime;
- the legacy authentication branch inside `src/app/App.tsx` is compatibility code, not a second user-facing entry point;
- FI-020 provides persisted authenticated learner-course membership using the canonical course identity and Courses runtime; and
- learner-course programme state is separate from learning evidence.

FI-021 must therefore add its post-auth first-use gate at the canonical `/app/` boundary. It must not create a second learner runtime, onboarding-only course model or parallel course identity.

## Student problem — PASS

A newly registered Student can authenticate before Revision knows enough context to guide them intelligently. Without FI-021, the Student can arrive in the ordinary authenticated runtime before Revision has established:

- that Student is the chosen primary experience;
- the exact supported course the Student studies;
- any cautious starting signal about where useful revision should begin; or
- a credible first action.

That forces the Student to interpret the product and assemble setup independently before Revision demonstrates its core value.

## Strategic case — PASS

FI-021 proves the core Revision loop immediately:

`Student identity → course context → limited starting evidence → useful recommendation → revision activity → feedback → stronger evidence → next recommendation`

The credible alternative is to retain a generic post-signup Home and ask the learner to discover Courses, the starting check and useful work themselves. That is simpler technically but materially weaker against Revision's approved first-value and simplicity principles.

The feature is worth the opportunity cost now because GJ-01 is the primary Student entry journey and depends on foundations already established by authentication, FI-020 and FI-006.

## User-value hypothesis — PASS

**Hypothesis:** If a newly registered Student is taken through the short GJ-01 sequence before normal Home, they will reach a genuinely useful first revision activity with less interpretation/setup effort while Revision gains enough trustworthy context to make the first Home state meaningful.

The hypothesis is falsified if eligible Students abandon the flow at material rates, cannot resolve a supported course, fail to reach useful work, or reach Home without a credible next action.

## Experience and simplicity — PASS

### Primary path

`successful signup → choose account type → Student → add first course → Course added / course ready → starting check → cautious first recommendation → exact useful activity → useful feedback → meaningful Student Home`

Locked experience rules:

- Student / Parent / Teacher are visible after registration; only Student is enabled initially;
- phone/tablet experience options use compact rows with icon/title together;
- the selector is a routing decision, not a persona questionnaire;
- only one exact supported course is required before first value;
- course resolution is progressive and stops asking redundant questions once course identity is known;
- the Course-added state uses an accessible success cue, a dominant `<Course> is ready.`-style title and one obvious `Find my starting point` next action;
- the starting check is short, low-stakes and explained before it begins;
- the first recommendation acknowledges limited evidence;
- `Start revision` opens the exact supported useful activity rather than another discovery screen;
- feedback explains what happened and what to do next; and
- normal Student Home appears after enough context exists to be useful.

### Recovery and alternative states

The remaining alternative-path blocker is resolved by the approved FI-006 contract:

- **completed check:** use directional observations under the deterministic FI-006 rule;
- **partially completed:** use answered observations only where they provide a valid signal; never invent missing answers;
- **Skip for now:** go directly to a deterministic useful course starter activity, never generic empty Home;
- **interrupted/reload:** preserve completed state where practical and allow safe resume or skip;
- **no eligible assured questions:** fail gracefully to the deterministic useful starter activity and record an operational exception;
- **course save / experience-state load-save / activity load failure:** show an understandable recoverable error; do not silently drop the new Student into an unscoped shell.

The Student remains free to choose a different area after the recommendation.

## Evidence / intelligence model — PASS

FI-021 consumes FI-006's approved **directional starting-check evidence**. It does not invent a second evidence model.

Starting-check answers may influence the immediate first recommendation but must not by themselves:

- mark coverage;
- mark understanding, proficiency or mastery;
- create or increase readiness;
- count toward ordinary readiness thresholds;
- create an estimated grade or on-track claim; or
- permanently label the Student strong or weak.

Normal Learn/Practice/exam activity after the recommendation creates the stronger learning evidence that may confirm, weaken or overturn the early signal.

### Deterministic first-recommendation rule

FI-021 uses the approved FI-006 rule:

1. consider sampled topics answered incorrectly;
2. if one or more exist, choose the earliest such topic in canonical course order;
3. otherwise choose the earliest eligible course topic without stronger normal evidence, falling back to the earliest eligible course topic;
4. route into the course-defined useful starter activity for that topic, preferring an existing focused Learn/Practice target; and
5. explain the result as an early starting point rather than a judgement of ability.

This closes the previous tie-break blocker.

## REV role — PASS

REV is an explanatory product voice in FI-021; FI-003 Full REV Tutor is not an MVP dependency.

REV may:

- explain why course context matters;
- explain why the short starting check helps;
- explain a provisional first recommendation; and
- acknowledge uncertainty while Revision is still learning about the Student.

REV must not turn onboarding into a chat interview, claim broad understanding from sparse evidence, add unnecessary setup questions or become scoring/routing-critical.

## MVP boundary — PASS

### Included

1. post-auth primary-experience routing;
2. durable Student primary-experience selection;
3. new-account versus existing-account onboarding eligibility;
4. guided first-course setup using FI-020 persisted learner-course membership;
5. transition into FI-006 starting-check behaviour;
6. cautious deterministic first recommendation using FI-006 outputs;
7. direct route into an existing supported Learn/Practice activity;
8. first-activity feedback and transition into meaningful Student Home;
9. durable onboarding completion state and safe resume behaviour; and
10. bounded telemetry and Founder assurance for the full GJ-01 funnel.

### Deliberately excluded

- public marketing/landing pages;
- redesign of the existing signup form;
- Parent onboarding;
- Teacher onboarding;
- subscription purchase or entitlement gates;
- collection of surname, school, date of birth, target grade, full timetable, revision availability or learning-style questionnaires merely for onboarding;
- a full REV tutor implementation;
- final breadth of the supported course catalogue;
- a general-purpose onboarding framework for every future account experience; and
- FI-006 periodic/repeated check-ins.

## Account-experience persistence — PASS at definition level

Primary experience is durable product-routing state. It is **not** administrator permission, billing role, payer role or Student-data permission.

The implementation should use dedicated application state rather than overloading security-sensitive/database-owned profile classification or editable Auth metadata as an authorization source.

Recommended minimum conceptual shape:

```text
account_experience_state
- user_id uuid primary key → auth.users(id)
- primary_experience text constrained to governed values
- onboarding_completed_at timestamptz nullable
- created_at timestamptz
- updated_at timestamptz
```

Exact schema/function naming remains an engineering implementation detail. Required semantics are:

- owner-scoped application state;
- only the enabled `student` experience may be established by the browser in the initial release;
- Parent/Teacher values remain reserved until separately governed and enabled; and
- the record must never become an authorization grant.

## Existing-account compatibility — PASS

Accounts that already existed before FI-021 must not be unexpectedly re-onboarded.

The implementation should use a bounded one-time compatibility seed/equivalent migration so pre-existing Student accounts are recorded as Student/onboarding-complete, while accounts created after the migration are not automatically marked complete.

The implementation must prove this distinction with database-backed assurance and must not alter existing course membership, evidence or administrator classification.

## Free / Paid / Premium — PASS

FI-021 is foundational and identical across **Free, Paid and Premium**.

Primary experience, course identity, truthful starting evidence, first useful revision and first-use completion are required for Revision to operate correctly and demonstrate its core proposition. Onboarding is not an upgrade surface and must not be degraded to manufacture conversion pressure.

Later activities or deeper REV capability reached after onboarding remain subject to their own entitlement authority.

## Upgrade / conversion hypothesis — N/A

No paywall, upgrade prompt or conversion funnel is part of FI-021 MVP. The feature may indirectly improve conversion by proving Revision's value earlier, but commercial interruption is deliberately excluded from first-use onboarding.

## Measurement contract — PASS

### Primary hypothesis measure

**Eligible new Student → first useful revision completed**

### Required funnel semantics

At minimum distinguish:

`onboarding eligible/started → account type viewed → Student selected → first-course setup viewed → first course added → starting check offered → started → completed/partial/skipped → recommendation shown → recommendation accepted/overridden → first useful activity started → first useful activity completed → feedback viewed → onboarding completed / Student Home entered`

### Core measures

- eligible Student GJ-01 completion rate;
- step-by-step drop-off with denominators;
- first supported course-add success rate;
- starting-check start/completion/partial/skip rates;
- recommendation acceptance/override rate;
- first useful activity start/completion rate;
- time from course added to first useful activity;
- onboarding error/retry rate;
- interrupted-onboarding successful-resume rate; and
- repeat-onboarding defect rate for completed/seeded accounts.

Do not duplicate raw learning answers into general onboarding analytics. Learning answers remain governed educational evidence with starting-check provenance; product telemetry stores only the minimum event/context required for funnel and operational measurement.

## Founder/Admin assurance — PASS

Founder assurance should answer:

- Are eligible new Students completing first-use onboarding?
- Where are they dropping out?
- Are course-resolution failures blocking first value?
- Are Students completing, partially completing or skipping the starting check?
- Are Students reaching and completing useful work rather than merely Home?
- Are existing/completed Students being incorrectly re-onboarded?
- Are experience-state persistence or load failures occurring?
- Has any starting-check evidence incorrectly affected coverage/mastery/readiness? Expected exception count: zero.

A small journey funnel plus actionable failure counts is preferred over vanity account totals.

## Risk / trust / accessibility — PASS with implementation controls

### Educational claims

- sparse starting-check evidence must use cautious language;
- no strong mastery/proficiency/readiness/grade claim may be created from the starting sample; and
- first recommendations must remain explicitly provisional where evidence is limited.

### Privacy / data minimisation

- primary experience and onboarding completion have a direct product purpose;
- do not collect additional profile data merely because onboarding exists; and
- onboarding analytics must not duplicate sensitive answer content.

### Security / authorization

- experience state is product-routing state, not authorization;
- owner-only RLS and bounded browser writes are required;
- onboarding/profile updates must not permit modification of database-owned classifications such as `profiles.is_admin`.

### Accessibility / responsive design

Production must preserve the locked phone/tablet/desktop hierarchy and satisfy the WCAG 2.2 AA baseline, including keyboard completion, visible focus, programmatic labels, explicit disabled/unavailable semantics, readable recovery states, touch targets, Light/Dark support and no horizontal overflow.

### Existing-user safety

The migration must fail safely for current Students. Existing users must not lose course membership/evidence or become trapped behind first-use screens.

## Technical feasibility and dependencies — PASS

The canonical React/Supabase architecture provides the necessary building blocks:

- authenticated `/app/` boundary and `AuthGate`;
- persisted FI-020 learner-course membership and catalogue identity;
- FI-006 directional evidence semantics and deterministic recommendation contract;
- persisted learning evidence and deterministic recommendation/readiness logic; and
- database/RLS/browser assurance patterns.

No new external service is required for FI-021 MVP.

### Dependency sequencing

- **FI-020:** course-membership implementation exists in the canonical learner runtime and is the only permitted course persistence model for FI-021.
- **FI-006:** product/evidence contract is human-approved Ready and integrated into `main`; FI-021 implementation may depend on its implementation delivery, but no fundamental FI-021 product decision remains open.

Implementation may sequence FI-006 and FI-021 in separate small PRs or a deliberately coordinated integration sequence, but FI-021 must not duplicate FI-006 evidence logic or bypass its provenance/readiness protections.

A frontend release requiring new Supabase state must follow the Production Backend Readiness Gate rather than assuming Pages deployment can apply migrations.

## Test and assurance approach — PASS

FI-021 implementation should be treated as a high-risk cross-layer journey because it touches authentication admission, persistence, educational evidence dependency and the primary new-Student path.

### Unit / state-machine

Prove:

- existing/completed Student bypasses onboarding;
- new account without experience state sees account selection;
- Student selection leads to first-course setup;
- Parent/Teacher remain unavailable;
- exact saved-course state advances the journey;
- completed onboarding does not repeat;
- interrupted onboarding resumes safely;
- recommendation preserves exact course/activity context; and
- deterministic skip/partial/all-correct/incorrect outcomes match FI-006.

### Database / RLS

Prove:

- experience state is owner-only;
- anonymous and cross-user reads/writes are denied;
- allowed experience values are constrained;
- existing-user compatibility seed applies only to pre-existing accounts;
- post-migration accounts are not auto-completed;
- experience state cannot alter database-owned administrator classification; and
- starting-check provenance survives persistence and remains excluded from ordinary readiness/mastery/coverage calculations.

### Integration / browser

Prove:

- email signup/session → account selector → first course → starting check → recommendation → exact useful activity → feedback → Home;
- equivalent Google-auth new-account routing where provider testing is feasible;
- skip/partial/interrupted/no-question paths;
- existing authenticated Student ordinary `/app/` path;
- course/persistence/activity failure recovery;
- phone/tablet/desktop responsive hierarchy;
- keyboard/accessibility completion; and
- Light/Dark theme behaviour.

### Production smoke

After release verify, using synthetic/non-sensitive data where possible:

- a governed new-account path can enter first-use onboarding; and
- an existing completed Student still reaches the normal runtime without re-onboarding.

## Documentation and authority impact — PASS

This readiness PR performs the normative/product-management work required before implementation:

- `10-product-governance/Core User Journeys.md` v0.8 promotes GJ-01 from design evidence into normative product direction;
- this analysis record captures the complete FI-021 Definition of Ready against current `main`; and
- `10-product-governance/backlog/Product Feature Backlog.md` registers FI-021 and its current lifecycle/Ready-decision state.

No production code changes belong in this PR.

When implementation starts, update as applicable:

- `docs/technical/Authentication Implementation.md` — post-auth experience/onboarding gate;
- a dedicated Student onboarding implementation record if the state machine/persistence warrants one;
- `docs/technical/Target System Architecture.md` — durable account-experience/onboarding state if material;
- `docs/technical/Production Backend Readiness Gate.md` — release contract if a new database capability is introduced;
- `90-governance-registers/Assurance Coverage Register.md` — GJ-01 assurance;
- `INDEX.md` — if a new canonical technical record is introduced; and
- FI-021 lifecycle/register evidence as implementation moves to `In Progress` and later `Live`.

Historical research/audits remain historical and must not be rewritten as implementation truth.

## Blocking decisions resolved — PASS

The previous blockers are resolved:

1. **FI-006 evidence contract:** resolved and integrated through PR #156 into approved `main`.
2. **Skip for now:** resolved — deterministic useful course starter activity, never generic Home.
3. **Normative GJ-01 promotion:** included on PR #155 through `Core User Journeys.md` v0.8.
4. **First-recommendation selection/tie-break:** resolved by FI-006 deterministic canonical-topic-order rule.
5. **Canonical lifecycle register:** FI-021 is added to `Product Feature Backlog.md` on this refreshed PR.

No fundamental product, commercial, evidence, trust or experience decision remains for development to invent.

## Human Definition-of-Ready approval — PENDING

The complete applicable Definition of Ready now passes, but `Analyse → Ready` requires explicit human approval. AI may recommend the transition but may not self-approve it.

---

# Definition-of-Ready decision

- Student problem — **PASS**
- Strategic case — **PASS**
- User value — **PASS**
- Experience — **PASS**
- Evidence / intelligence — **PASS**
- REV role — **PASS**
- MVP boundary — **PASS**
- Free / Paid / Premium — **PASS**
- Upgrade hypothesis — **N/A**
- Measurement — **PASS**
- Founder/Admin assurance — **PASS**
- Risk / trust / accessibility — **PASS**
- Technical feasibility — **PASS**
- Test / assurance approach — **PASS**
- Documentation / authority impact — **PASS**
- Blocking decisions — **NONE**
- Human Definition-of-Ready approval — **PENDING**

## Product Manager recommendation

**Recommend FI-021 `Analyse → Ready`.**

The scope is sufficiently defined to begin governed implementation without reopening a fundamental product decision. Implementation must still wait for the explicit Founder Ready approval, and any material change to the approved product/evidence boundary must return through proportionate product governance rather than being invented in code.

## Documentation-impact check

This refresh updates normative GJ-01 authority and the canonical feature lifecycle register in the same governed PR. No technical implementation documentation is changed because production implementation has not started. Historical design/research evidence is preserved unchanged.