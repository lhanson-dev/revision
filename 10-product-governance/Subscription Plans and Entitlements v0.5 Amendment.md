# Subscription Plans and Entitlements — v0.5 Amendment

**Document type:** product authority amendment  
**Authority:** product  
**Status:** proposed governed authority — Founder direction captured 24 August 2026  
**Owner:** Founder  
**Amends:** `10-product-governance/Subscription Plans and Entitlements.md` v0.4  
**Purpose:** Record the agreed commercial model clarifications for Student, Parent, Teacher and School while preserving a genuinely useful Free Student product and keeping future numeric allowances adjustable through governed decisions.

## Authority relationship

This amendment deliberately preserves the historical v0.4 authority rather than rewriting the earlier decision record. Where this amendment conflicts with v0.4 on the topics below, this amendment is the proposed newer authority once merged.

It does **not** approve implementation. FI-002 remains in `Analyse` until its full Definition of Ready and explicit human `Ready` approval are complete. Parent and Teacher/School product features remain separate product workstreams and must complete their own governed definitions before implementation.

## Canonical user and commercial language

Revision has three user types:

- **Student** — uses Revision to study and revise;
- **Parent** — supports a linked Student; and
- **Teacher** — uses Student learning evidence to understand class and individual needs and improve teaching/intervention decisions.

**School** is an organisation, not a fourth user type.

**Payer** is a commercial responsibility, not a user type. Depending on the product route, the payer may be:

- an adult Student;
- a Parent;
- a Teacher; or
- a School.

Use Student, Parent and Teacher in product, product-governance and ordinary company language. Use `Payer` only when the responsibility for payment, billing, renewal, cancellation or invoices is materially relevant. Internal implementation concepts must not leak into user-facing language or create competing names for the same person.

## Independent commercial routes

Revision must support two independent commercial routes that may coexist on the same Student account:

1. **Student / Parent consumer route** — a Student uses Revision independently, pays themselves where eligible, or has a Parent pay for stronger Student capability.
2. **Teacher / School education route** — a Teacher uses Revision independently for Teacher insight, or a School pays for Teacher/School capability and may separately fund approved Student entitlements.

Neither route depends on the other.

A Student must remain able to use Revision meaningfully with:

- no Parent account;
- no Teacher account;
- no School membership; and
- no paid subscription.

A Teacher or School must not require a Parent to purchase a consumer subscription so that a Student can participate in ordinary Teacher/School use. Where a Teacher/School workflow requires paid Student capability, that capability must be funded by the Teacher/School route rather than using the Teacher as a sales channel to Parents.

## Student-first independence rule

The subscription model, Parent feature and Teacher/School feature must **not block agreement, prototyping, implementation or testing of the initial Student solution**.

Revision's first Student proposition must be capable of being tested end-to-end with the core Student persona on Free.

Commercial packaging may later place clear limits around approved capabilities, but it must not require Parent, Teacher or School functionality to prove that Revision can:

- onboard a Student;
- understand their course context;
- give a useful starting point;
- guide useful revision;
- create learning evidence;
- show meaningful progress; and
- recommend a useful next action.

The Student product remains the primary product and the baseline from which Parent and Teacher/School value is derived.

## Subscription clarity principle

Every Free, Paid and Premium proposition must be understandable without interpretation.

Every material tier difference must be expressed as either:

1. a **named capability** — what the user can now do; or
2. a **defined allowance** — how much of an approved capability they can use.

Terms such as `more`, `deeper`, `richer`, `enhanced`, `greater`, `advanced` or similar adjectives must not be the sole definition of a tier difference.

A user must be able to answer immediately:

- **What do I have now?**
- **What exactly do I get if I upgrade?**

Quantitative limits should use units meaningful to the user, for example:

- active classes;
- Exam Simulator uses;
- assisted marked answers;
- REV sessions or another clearly explained user-facing unit; or
- other capability-specific allowances.

Do not expose tokens, compute units, provider credits or other internal cost measures merely because they are convenient to meter.

## Limits are governed configuration, not permanent product doctrine

The product architecture must support capability entitlements and quantitative allowances that can be changed later without redesigning the underlying feature.

Exact numeric limits do not need to be fixed before the relevant feature has enough value, usage and cost evidence to support a responsible decision.

For each limited capability, the eventual numeric allowance must be chosen from:

- genuine usefulness on Free;
- clear upgrade value;
- realistic usage distributions;
- cost-to-serve, including REV/AI variable cost where material;
- heavy-use tail behaviour;
- conversion and retention evidence; and
- operational sustainability.

Changing an approved numeric allowance later is a governed product/commercial configuration decision. It does not require rethinking the entire subscription architecture unless the capability or tier proposition itself materially changes.

## Cross-tier rule

Across Student, Parent and Teacher products:

- **Free must be independently useful.**
- **Paid must remove a meaningful constraint or unlock a clearly named repeat-use capability.**
- **Premium must include at least one materially different high-value capability, not merely larger numeric limits.**

Premium may also include higher allowances, but `Paid with bigger limits` is not a sufficient Premium proposition by itself.

Safety, accessibility, educational truth, scoring/evidence semantics and legitimate preservation of work must not be degraded to manufacture upgrade pressure.

## Student subscription direction

Student Free must continue to demonstrate Revision's real proposition across the Student's genuine programme rather than using course count as the core paywall.

Potential entitlement boundaries should be concentrated on capabilities where a limit is understandable and commercially defensible, including separately approved higher-cost or repeat-use capabilities such as:

- Exam Simulator usage;
- assisted exam-answer marking;
- REV/AI usage;
- higher-cost content or interaction modes; and
- other future capabilities that explicitly complete their own Definition of Ready.

The exact Student allowance values remain unresolved and must be approved feature by feature.

An eligible adult Student may be the Payer for their own plan. A Parent may instead pay for a linked Student. In either case, payment creates the Student entitlement; it does not create a separate duplicate Student identity.

## Parent product direction

Parent is a separate product experience but is linked to the Student account and learning picture.

A linked Parent should have a **useful Free Parent view** sufficient to answer a basic reassurance question such as whether Revision is being used and how things broadly appear to be going.

This supersedes the prior v0.4 assumption that the Parent dashboard exists only behind a Paid/Premium linked relationship.

The Parent is not primarily purchasing a separate `Parent subscription`. Where a Parent pays for stronger consumer capability, they purchase or fund the **Student's subscription**. The Student receives the corresponding Student entitlement, and the linked Parent experience may gain clearly defined additional capabilities associated with that Student tier.

Parent tier differences must use named capabilities or defined allowances. Candidate directions to define through the separate Parent feature include:

- Free: useful high-level linked Student view;
- Paid-linked Student: clearly defined additional Parent reporting/notification capabilities; and
- Premium-linked Student: separately named REV-supported Parent guidance capability where approved.

Payment must never buy progressively deeper access to private Student data. REV conversations, private notes, raw answers/work and detailed surveillance remain outside automatic Parent visibility unless separately governed.

A Parent may initiate the relationship: Parent account/purchase → invite Student → Student creates their own full Student account and completes canonical Student onboarding → Student accepts link → the purchased Student entitlement and Parent link become active according to the approved relationship rules.

## Teacher product direction

The primary Teacher job is **learning insight and teaching/intervention support**, not assignment administration.

The Teacher product should help a Teacher understand:

- where a class is strong or weak;
- where an individual Student may need support;
- patterns across specification areas;
- coverage, understanding and readiness signals where supported by evidence; and
- what teaching or intervention is most likely to deserve attention next.

Revision must not drift into a general-purpose LMS or full lesson-planning suite merely because Teacher functionality exists.

### Teacher Free

Teacher Free should provide a genuine trial of the Teacher proposition with **one active class**.

The one-class limit is the primary simple scale boundary for Free. The Free Teacher experience should be able to demonstrate useful class and individual insight rather than restricting the number of ordinary reports or artificially throttling basic analysis screens.

Teacher Free does not include Teacher-facing REV analysis unless separately approved later.

### Teacher Paid

Teacher Paid should unlock clearly defined professional-use capability, including:

- multiple active classes, with the exact paid class allowance to be approved later;
- cross-class analysis where approved; and
- **on-demand Teacher REV analysis** that interprets structured Student/class evidence and helps identify teaching or individual intervention priorities.

Teacher Paid must not automatically grant Paid/Premium Student entitlement to every Student taught by that Teacher.

### Teacher Premium

Teacher Premium must provide a materially different Teacher capability rather than merely a higher class count or larger REV allowance.

The intended qualitative direction is **proactive Teacher REV intelligence**, for example approved capabilities that can identify changing class patterns, recurring weak areas, intervention follow-up or priority changes without requiring the Teacher to manually interrogate every dashboard.

Exact Premium Teacher capabilities and allowances remain part of FI-018 Definition-of-Ready work.

## School concept and education funding

A School is an organisation that may contain Teachers, classes and Students.

School payment is a separate institutional route from an individual Teacher subscription.

A future School proposition may fund:

- multiple Teacher accounts/classes;
- School administration and reporting;
- Teacher Paid/Premium capabilities; and
- separately approved Student entitlements for some or all Students.

Student entitlements funded by a School must remain technically distinguishable from the Student's personal/Parent-funded entitlement so that access can change safely when School membership changes without deleting the Student's learning history or personal account.

A Student should have one Student identity and one underlying learning/evidence history. Do not create separate `school Student` and `personal Student` accounts for the same person merely because different payers exist.

Where multiple valid entitlement sources coexist, the product should calculate the Student's effective access from the applicable grants while preserving provenance and lifecycle rules.

## Teacher/School REV cost rule

Teacher-facing REV creates a different variable-cost profile from Student REV and must have its own commercial modelling before implementation is Ready.

Teacher REV should reason over structured, deterministic Student/class summaries where possible rather than repeatedly sending raw histories for whole classes to an AI model.

Teacher/School pricing and allowances must account for:

- number of active Teachers/classes/Students where relevant;
- actual Teacher REV usage;
- cost of cohort/class analysis;
- support/administration and School onboarding cost;
- institutional sales cost where material; and
- any separately funded Student REV entitlement.

Do not promise unlimited high-cost REV use across an entire School until measured economics prove it sustainable.

## Product sequencing

This commercial model is designed so the workstreams can progress independently:

1. **Student core** — prove the Student proposition first; Free must remain enough to test the complete core loop.
2. **FI-002 subscription platform** — provide reusable entitlement and billing infrastructure without becoming a prerequisite for validating the Student experience.
3. **Parent feature** — define linking, Free Parent value and tier-linked Parent capabilities as a separate product feature.
4. **Teacher/School feature** — define Teacher insight, one-class Free, paid multi-class/REV capability and School organisation/funding as a separate product feature.

Commercial architecture should avoid making later Parent/Teacher/School support unnecessarily difficult, but the Student MVP must not be delayed merely to implement those later surfaces.

## Documentation impact

This amendment requires alignment of:

- `10-product-governance/Subscription Plans and Entitlements.md` when this amendment is consolidated;
- `10-product-governance/Core User Journeys.md` when Parent and Teacher/School journeys are promoted;
- `10-product-governance/Target Audience and Personas.md` for Teacher and School direction;
- `10-product-governance/Authentication Experience.md` when Parent/Teacher experiences are enabled;
- `20-brand-and-experience/Product UX Principles.md` for subscription clarity;
- `60-business-operations/Pricing and Billing Policy.md` when Teacher/School prices are approved;
- `60-business-operations/AI Cost and Allowance Policy.md` when Teacher REV cost envelopes are approved;
- the canonical Product Feature Backlog and relevant feature analysis records; and
- technical documentation only after the relevant feature reaches human-approved `Ready` and implementation begins.

Historical decision records must not be rewritten to imply that this model existed before 24 August 2026.
