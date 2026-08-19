# Content Operations Admin v0.1 Amendment

Status: Founder-approved active authority — v0.2

## Purpose

Define the protected Founder-facing administration capability inside Revision's canonical application runtime.

The initial amendment introduced a minimal Content Operations intake surface. v0.2 deliberately brings forward a **small Operations Dashboard** so the Founder can answer a limited set of operational questions without using GitHub, Supabase or deployment consoles for routine visibility.

This remains a bounded internal capability. It does not approve a broad administration platform, weaken learner privacy, replace educational authority, or weaken any content, security, assurance, deployment or merge gate.

## Authority relationship

This document amends `80-company-workflows/Content Factory Operating Model.md` and applies `50-engineering-standards/Observability & Operations Standard.md` to the Founder-facing Admin experience.

The previous v0.1 deferral of user analytics and system-health dashboards is lifted only for the bounded capability defined below.

## Canonical runtime and entry point

Admin is a **role-gated capability inside the canonical `/app/` React runtime**. Revision must not maintain a second standalone `/admin/` application or separate admin login experience.

The standard learner navigation remains Home / Subjects / Progress / REV.

When the signed-in account has database-backed admin access:

- desktop navigation may expose an additional **Admin** item after the ordinary learner destinations;
- mobile must preserve the four-item learner bottom navigation and expose **Admin** through the account/additional-links menu; and
- selecting Admin opens the protected Operations Dashboard inside `/app/`.

The Admin link is a privileged role-specific utility. It does not redefine the standard learner information architecture for ordinary student accounts.

## Founder Operations Dashboard

The Admin landing view should answer the high-level questions:

- Is Revision operating normally?
- Are real learners joining?
- Are learners recording revision activity?
- What kinds of learning activity are being recorded?
- What is happening in Content Operations?
- Is anything known to require Founder attention?

The initial dashboard may therefore show:

- overall system health;
- learner-account counts and recent learner sign-ups;
- learners with recorded activity over defined recent periods;
- recorded learning-activity counts and activity-type mix;
- available course/component counts;
- Content Factory job counts, blockers and jobs awaiting Founder action;
- actionable operational warnings; and
- clear links to protected detail views for Users, Activity, System Health and Content Operations.

Dashboard numbers must remain evidence-based. A value or health state must not imply data Revision does not actually collect.

## Operational metrics rules

- Test/synthetic accounts are excluded from learner statistics by default.
- Admin accounts are excluded from learner-engagement statistics by default so Founder operation/testing does not inflate learner usage.
- "Active learner" must be qualified by the evidence used. Until Revision has a governed product-event stream, activity means **recorded learning activity**, not app visits, reading time or session duration.
- Heterogeneous learning evidence must not be collapsed into a misleading global average score.
- Metrics should be aggregate by default. The initial dashboard does not require exposure of learner email addresses, answers, tutor conversations or other private learning content.
- Missing operational evidence is **Unknown**, never Healthy.
- Health states use the governed plain-language vocabulary: **Healthy**, **Attention needed**, **Unknown**.
- Detail views should explain evidence, impact and next action rather than presenting unexplained technical status codes.

## Content Operations

Content Operations remains part of Admin and includes **Add Course**.

The minimum Add Course input is:

- one official awarding-body course/specification URL; and
- an optional Founder instruction or constraint.

Submitting the form must create the durable Content Factory job record and place it in the approved `requested` lifecycle state. The subsequent pipeline continues under the existing Content Factory operating model.

The protected Content Operations detail view may show course jobs, current factory state, blockers, assurance/CI/deployment state, Founder-action state and later usage/cost evidence where available.

Operational job state is evidence only. It is not educational authority, publication approval or merge approval.

## Authentication and admin assignment

Revision uses the existing application sign-in experience for learners and administrators. There must not be a second admin-specific username/password flow.

Admin access must be explicitly assigned in the Revision database to an authenticated user account.

Admin status must:

- be database-owned rather than inferred from an email address in browser code;
- be non-editable by ordinary authenticated browser clients;
- control whether the role-specific Admin navigation item is presented; and
- be rechecked server-side before privileged operations or cross-user operational aggregates are returned.

The initial administrator remains the existing authenticated account for `leehanson@hotmail.com`.

Future administrators may be assigned or removed by an authorised database operation without changing application code.

## Security and privacy boundary

Browser presentation of an Admin link is not authorization.

The browser must never receive GitHub write credentials, Supabase service-role/secret credentials, AI provider secrets or other privileged factory credentials.

Cross-user operational metrics must be calculated through a trusted server-side boundary after admin authorization has been verified. Ordinary learner RLS policies must not be weakened merely to support Admin reporting.

The initial dashboard is deliberately aggregate-first. It must not expose:

- REV/tutor conversation content;
- learner answers or free-text responses;
- unnecessary learner identity data;
- user impersonation controls; or
- arbitrary database administration.

Any later learner-level operational view requires a separately justified purpose, proportionate privacy design and appropriate authority update.

## Learner separation

Admin shares the `/app/` runtime but remains role-gated operational functionality.

Ordinary learner accounts must not see Admin navigation or Admin controls. Adding operations capability must not change the normal four-destination learner hierarchy or couple learner content rendering to Content Factory implementation.

## Merge and publication boundary

Creating or viewing a course job is not permission to generate unsupported content, publish a pack or merge a PR.

The existing pipeline remains authoritative:

**official URL → job → identity → sources → coverage → generation → deterministic validation → independent review → remediation → exact-head CI → ready for Founder merge approval → explicit Founder merge → deployment verification → pilot live**

Every merge into `main` continues to require explicit Founder approval for that specific PR.

## Still deferred

This amendment does not approve:

- a large enterprise-style back-office platform;
- learner impersonation;
- editing learner scores/progress from Admin;
- reading private REV conversations or free-text learner work;
- bulk user actions or mass communication;
- arbitrary database tools;
- batch course intake or bulk job controls;
- automated merge;
- in-browser human subject benchmark review; or
- replacing the GitHub Issue durable Content Factory job store with a new operational database.

Those capabilities require separate need, authority and assurance before implementation.
