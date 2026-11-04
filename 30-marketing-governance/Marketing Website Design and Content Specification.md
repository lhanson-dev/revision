# Marketing Website — Design and Content Specification

**Status:** Proposed — Founder review; becomes normative only following explicit Founder-approved PR merge  
**Version:** 0.1 — 4 November 2026  
**Owner:** Founder / Product / Marketing  
**Scope:** Public marketing/editorial website, waiting list and release messaging. **Not** learner-site implementation approval.  
**Source direction:** Founder conversations, 4 November 2026: market the intended complete launch product while marketing and learner development proceed in parallel; parent and teacher progress visibility are intended launch capabilities.

## 1. Purpose and strategic position

**The job of the website is to explain why Revision matters, establish trust and convert interested visitors to a permissioned waiting list before public learner launch.** At public product launch it should transition to verified access/signup journeys, not be rebuilt from scratch.

Revision is not primarily a content library, a generic AI chatbot or a conventional static revision timetable. It is a personalised revision system that takes much of the burden of deciding what to revise and when off the student, supports learning and practice, uses meaningful evidence of understanding to update priorities, and makes the next useful action clear.

The first audience is UK GCSE/A-level students; parents are important supporting/decision-making visitors; teachers are an intended *bounded progress-support* audience for launch, without a school learning-management system.

### Primary positioning

**Less time planning your revision. More time actually learning.**

Supporting line (proposed): *Revision helps plan what to study, when to study it and where to focus next. As you learn and practise, your plan adapts to your progress—with REV, your personal AI study coach, to guide you.*

This is a **positioning promise**; final present-tense feature copy depends on acceptance evidence at the relevant launch stage.

### What must make us different

The differentiator is the **connected experience**, not a claim that no competitor has AI, planning or quizzes:

1. **Plan:** programme-aware priorities reflect subjects, relevant specification, exams and realistically available time.
2. **Learn and practise:** meaningful revision activities help students understand and demonstrate what they know.
3. **Understand:** assessed evidence identifies strengths, uncertainties and material weaknesses; reading/completion alone is not mastery.
4. **Adapt:** priorities and the wider plan are recalculated as reliable evidence, dates and circumstances change.
5. **Guide:** REV explains priorities, helps with learning and supports learner choice. The deterministic planning engine, not a generative REV response, owns the calculated schedule.
6. **Support:** appropriately authorised parents and teachers can see bounded, useful progress signals so they can help without surveillance.

Do not claim an independently proven end-to-end adaptive repair loop until acceptance demonstrates it.

## 2. Audience, message hierarchy and voice

### Message priority

| Priority | Message | Audience | Evidence condition |
| --- | --- | --- | --- |
| 1 | Less planning, more learning | Student and parent | Promise/experience; avoid promising zero setup or infallible plans |
| 2 | A plan that adapts to knowledge and progress | Student | Demonstrate accepted evidence-to-recommendation behaviour before present-tense launch claim |
| 3 | REV, personal AI study coach | Student | Describe real guidance limits, never imply REV itself calculates planner priorities or is a human |
| 4 | Parents and teachers can support with useful progress insights | Parent and teacher | **Launch target**, subject to bounded permissioned feature acceptance before public-product wording |
| 5 | Built for relevant UK qualifications and exam demands | All | Name only supported courses/boards/qualification versions validated at publication time |

**Tone:** Simple, direct, contemporary, capable and reassuring; no forced slang, lecturing, fear marketing, artificial urgency, gamification language, or guaranteed outcomes. Give students agency: Revision makes recommendations and explains why; the learner may change focus. Never imply someone is at fault for being behind.

**Avoid:** "guaranteed grades", "100% syllabus assured", "AI knows everything", "perfect timetable", "never miss a topic", universal "on track", or comparative "better than Seneca/Up Learn/Save My Exams" unless supported by direct dated evidence.

**Do not reduce Revision to a pure planning service.** Learning, testing, improved understanding and next-step guidance are essential to justify why the plan adapts.

## 3. Release strategy: build together, publish truthfully

Two release stages share one site and brand, but use distinct published claims.

| Stage | Site state | Primary CTA | Copy and feature constraints |
| --- | --- | --- | --- |
| **W — Public marketing / waiting list** | Informational site and collecting minimal mailing-list data, if separately approved | **Join the waitlist** | Describe product ambition and clearly label capabilities still being completed. Do not promise a specific launch date, priority access, course availability or feature completion not authorised by evidence. |
| **P — Public learner product launch** | Marketing site offers access to accepted learner service | **Get started** (plus **Sign in**) | All launch claims must be backed by the actual production product: working adaptive planning, REV guidance, supported subjects, parent insights and bounded teacher visibility. Replace staged/demo content with actual product evidence. |

**Do not delay site design because teacher or learner acceptance remains open.** Conversely, a finished marketing page does not authorise public learner access or prove a product claim. If an advertised launch capability is not ready, resolve the mismatch before Stage P: fix/validate it or obtain an explicit Founder scope-and-copy change. Do not silently ship a misleading claim.

Public marketing-list operation has its **own** data-protection, security and communications review before collecting real contact details. The public learner launch remains separately subject to the Public Learner Launch Gate Register. The present family-testing application stays reachable.

## 4. Information architecture and routes

**MVP: one strong, scrolling homepage**, supported by required transactional/information pages. The sections on Home are anchors, **not** a proliferation of separate marketing pages.

| Destination | Proposed path/anchor | Content and CTA |
| --- | --- | --- |
| Home | Marketing root; existing GitHub Pages base currently \`/revision/\` | Hero, problem, solution, how it works, REV, parent/teacher support, qualification scope, FAQ, final waitlist CTA |
| How it works | \`#how-it-works\` | On-page three-part explanation; no separate page for Stage W |
| For parents & teachers | \`#support\` | On-page role-specific panels; explain authorisation/privacy, launch intent |
| Subjects | \`#subjects\` | Honest initial courses/boards and future expansion; no speculative subject catalogue |
| Waitlist | \`#waitlist\` | Inline form and simple confirmation journey |
| Privacy | \`/revision/privacy\` conceptual | Reviewed plain-language public contact-list notice, retention and rights |
| Thank you | \`/revision/thank-you\` conceptual | Confirm submission or email-confirmation action, avoid false promises |
| Sign in | Existing canonical learner application \`/revision/app/\` | Secondary visible link for existing testers/users; preserve routes/auth/session |

**Route implementation note:** GitHub Pages currently uses a root redirect into \`/revision/app/\` and client hash routes inside the app. These marketing paths are proposed information architecture, **not validated deployable paths**. At implementation readiness resolve exact public origin, SPA/static routing, redirects, links, privacy path and deployment behaviour without breaking \`/revision/app/\`.

Do not build pricing, a blog, dozens of subject pages, a full teacher-sales site or a public product comparison grid for the waiting-list MVP. These can be considered when useful and supported.

### Global site navigation

Approved wordmark (or approved compact form at small widths); anchor links **How it works**, **For parents & teachers**, **Subjects**; dominant **Join the waitlist** CTA; secondary **Sign in**. On narrow mobile screens collapse links into an accessible menu while keeping the primary CTA available. No equal-weight competing actions.

## 5. Homepage narrative and proposed copy

Each section should deliver one idea, one relevant proof visual and a short explanation. Keep the homepage scannable in about two minutes; a visitor must understand the promise from the hero alone.

### H1 — Hero: remove the planning burden

**Headline:** Less time planning your revision. More time actually learning.

**Subheading:** Revision helps plan what to study, when to study it and what matters next. Your plan changes as your understanding develops, and REV helps guide you through the journey.

**CTA Stage W:** Join the waitlist  
**CTA Stage P:** Get started

**Visual:** a representative revision week + a single clear REV next-action explanation; avoid fake readiness percentages, fabricated marks or implausible crowded dashboards. Disclose "Illustrative preview" if it is not a current real-screen capture.

### H2 — Problem: revision is more than choosing resources

**Heading:** Knowing what to revise can be the hardest part.

*You've got different subjects, exams and topics competing for your time. Finding revision materials is one thing. Knowing where to start, what to prioritise and whether you're making progress is another.*

Don't overstate anxiety or imply the learner is irresponsible.

### H2 — How it works: a genuinely connected system

**Heading:** A plan that gets more useful as you learn.

Three compact, ordered parts with real or accurately illustrative UI:

1. **Know where to focus.** Add your subjects, exam dates and realistic available time; Revision works out a useful starting plan.
2. **Learn, practise, improve.** Revise and answer questions to build evidence of what you know and what needs attention.
3. **Keep adapting.** Recommendations change when meaningful performance evidence or circumstances change, so the next step stays relevant.

Show one traceable example end-to-end when product acceptance permits: a specific weakness informs targeted activity and later independent rechecking, then a changed recommendation. Do **not** fabricate scored proof.

### H2 — REV: the personal guide

**Heading:** Meet REV. Your personal AI study coach.

*REV helps explain what you're working on and why. Ask questions, get help understanding difficult topics and explore the next useful step without having to work everything out alone.*

Mention that the plan uses learning evidence and REV explains it; don't anthropomorphise REV or imply it is a human teacher.

### H2 — Parents and teachers: support without surveillance

**Heading:** Better support for the people helping students succeed.

**For parents:** *See a useful picture of revision engagement, progress and areas that may need support, with appropriate permission—not a record of every answer or private conversation.*

**For teachers:** *See progress for students or groups you're authorised to support, identify areas needing extra teaching or practice, and make interventions more relevant.*

**For students:** *Keep ownership of your learning, with clear boundaries on who can see what.*

**Stage W:** Present this as *planned for product launch*, not a live account capability.  
**Stage P:** Replace with proven availability and correctly scoped permissions. Teacher and parent data access is **not** automatically created by being a teacher, parent or payer.

### H2 — Qualification coverage and trust

**Heading:** Designed around your subjects and exams.

Explain syllabus- and assessment-aware preparation. Before publishing precise qualification claims, independently confirm currently supported boards, exact qualification specifications and curriculum/practice assurance status. Current private product work prioritises AQA A-level Business and Psychology; do not imply whole-market GCSE coverage.

Do not suggest endorsement by an exam board without evidence.

### H2 — FAQ

Four to five short questions:

- **What is Revision?** A personalised revision system combining planning, learning, practice and guidance.
- **How does it work out what to revise?** It uses course/exam context and progressively reliable learning evidence; the plan is a recommendation, not an inflexible timetable.
- **Who is it for?** UK GCSE and A-level learners, with supported courses identified at the relevant stage.
- **Can parents and teachers see progress?** Intended bounded launch capability; exact permissions and initial availability must be confirmed before Stage P.
- **What happens when I join?** We will email with relevant access/launch information according to the choices shown in the form; joining is not an entitlement to an account or a promise of launch timing.

### H2 — Closing conversion

**Heading:** Make room for the learning that matters.

**Body Stage W:** *We're preparing Revision for more students. Join the waitlist to hear about availability.*  
**CTA:** Join the waitlist.

One primary action. No fake timers, signup counters, testimonials or urgency devices.

## 6. Visual direction

Use \`20-brand-and-experience/Visual Brand System.md\`, \`Identity Asset Usage Rules.md\` and \`Tone of Voice Framework.md\`. **Do not introduce an unrelated marketing brand.**

- **Identity:** approved Revision wordmark and canonical Living E. No robot mascot, generic AI orb or new symbol. Logo minimum sizes and clear-space rules apply.
- **Colour:** Deep Teal Ink \`#0F2F36\`, Primary Teal \`#2BB6A3\`, Soft Aqua \`#E6FBF4\`, Canvas \`#FAFCFB\`, Graphite \`#132026\`, plus governed supporting surfaces. Use accessible dark text on Primary Teal buttons.
- **Typography:** Manrope for marketing headline/body; use governed marketing display roles (desktop up to 56px / mobile around 40px) and readable 16–18px body. Bricolage display usage is learner-app-specific, not automatic marketing authority.
- **Layout:** editorial, generous white space, asymmetric feature stories; 1200px approximate maximum canvas, 680–760px long-copy width. Keep sections purposeful rather than wrapping every line in a card.
- **Illustration/product:** prefer real screens and appropriately labelled previews. Use REV's Living E subtly where REV actually features. Marketing may be more expressive than the learner app but not distracting.
- **Motion:** short purposeful transitions and subtle real state changes, never decorative fake AI processing; respect reduced motion.
- **Responsive:** narrow mobile through desktop, no horizontal page scroll, accessible mobile navigation, 44–52px touch targets, keyboard access, clear focus, WCAG 2.2 AA target and tested contrast.
- **Performance:** fast loading on typical mobile connections; avoid autoplay media or layout shifts that obscure primary CTA.

## 7. Waiting-list functional requirements

### Collection and data model

**Required:** email address only.  
**Optional:** visitor role (student / parent or carer / teacher / other) and study level (GCSE / A-level / both / not sure). These are for aggregate demand understanding, not qualification verification or access authorisation. Do not request a learner's name, school, date of birth, student identifiers, exam results or REV conversations.

A single explicit signup purpose and transparent notice must identify who is sending which updates. Where optional broader marketing emails are planned, keep that consent separate and unselected by default. Record consent/notice version, timestamp and source in protected storage appropriate for the reviewed purpose; retention and lawful basis require review before activation.

### Journey and states

1. Visitor enters email and optional preferences, opens the linked privacy explanation and submits.
2. Validate syntax, apply abuse/rate-limiting controls and prevent duplicate mailings without leaking registration status.
3. Show a clear submitted / confirmation-pending state according to the approved email-verification approach. Never claim the visitor is subscribed if backend submission failed.
4. Send optional confirm-address email if used; confirm with plain-language success. Preserve entered data on retryable errors.
5. Support unsubscribe, correction and removal; avoid making users create a learner account just to manage mailing-list preferences.
6. Existing learner **Sign in** stays independent. Waitlist signup must **not** grant access, create learner-course memberships or alter authentication.

### Technical/security boundaries (for later Ready analysis)

Use server-controlled validation and protected subscriber data, not public table reads or secrets shipped to the client. Make export, suppression, deduplication, deletion and operational exceptions administrable. Define email provider and delivery/confirm failure handling, spam prevention, privacy notice, consent/suppression records, retention, analytics and monitoring before technical implementation.

Data collection remains **off** until appropriate privacy/comms requirements have been reviewed and verified for this audience.

## 8. Release acceptance: marketing and product together

### Stage W — Waiting-list site acceptance

- Approved headlines, content and brand treatments, including marked planned-vs-available copy.
- Mobile, tablet, desktop, keyboard and screen-reader journeys tested; accessibility failures corrected.
- Waitlist end-to-end submission, validation, duplicate behaviour, failure/retry, consent, unsubscribe, deletion, delivery and safe backend access verified.
- Privacy/contact text reviewed for the actual processing; no child personal-data capture beyond the justified mailing-list scope.
- Stable login entry into the existing canonical app; no regression to signed-in use or saved learner progress.
- SEO metadata/Open Graph, robots/canonical routes, load speed and basic consent-aware analytics tested.
- Founder accepts visual presentation and wording before publication.

### Stage P — Product launch acceptance

- Link every product promise to current approved-main code, production route and representative real-user test evidence, including REV and adaptation claims.
- Authorised parent and **teacher progress visibility** must pass functional, security/privacy, usability and real data-scope acceptance before published present-tense claim.
- Subject/board/version coverage claims verified against finished course and exam acceptance; no unsupported "fully exam-ready" claim.
- Main learner public-launch approvals, including the governed Go-to-Market register and explicit Founder launch decision, remain separate from passing Stage W.
- Replace future-tense disclaimers and illustrative product scenes only as evidence warrants; retain clear limitation text where relevant.

### Measurement and Founder dashboard

Track: landing-page visits, waiting-list submissions, consent-confirmed subscriber count, source/campaign where appropriately permitted, visitor-role selection, form abandonment, failure and unsubscribes. Measure "understood the proposition" through short student/parent/teacher usability sessions. Do not treat raw email count as demand or willingness to pay. At public launch add route-to-verified-account conversion and first useful learning action, not simply clicks.

## 9. Related product scope and concrete dependencies

The student experience remains the product priority; **parent and teacher progress insight are intended public-launch support capabilities**. Teacher visibility must be designed as bounded educational support, **not** FI-018's parked classroom administration/assignments/lesson-planning scope.

Teacher launch design still requires a separate full feature definition before code:
- legitimate teacher/student relationship or verified cohort membership, lifecycle and revocation;
- who authorises access, how learners/guardians are informed and rights are exercised;
- exact allowed per-student versus aggregate signals, minimum cohort considerations and safe handling of small groups;
- no private REV conversations, raw written answers or click-by-click surveillance by default;
- security, permission enforcement in backend/RLS, school safeguarding and applicable privacy review;
- practical teacher actions based on insights, without constructing an LMS;
- free/paid/commercial access decision and complete Definition of Ready, recorded human approval;
- real permitted-user acceptance before claim goes present-tense.

Parent visibility must align to \`Subscription Plans and Entitlements.md\` and \`Privacy and Student Data Principles.md\`: payment alone does not grant supporter access.

## 10. Explicit exclusions

No public learner self-service launch merely because the marketing site is published. No pricing or billing checkout in Stage W. No fabricated student outcomes, teacher testimonials, partner/exam-board endorsements, inflated course coverage, fixed launch dates or fake AI screenshots. No broad teacher classroom/assignment features in this scope. No product feature build, route rewrite or email database migration in this specification PR.

## 11. Governance, conflicts and next gates

- \`Target Audience and Personas.md\` currently classifies teachers as a future persona after core student proof, and \`Product Feature Backlog.md\` parks **FI-018 Teacher/Classroom Tools**. The Founder's 4 November 2026 instruction sets **bounded teacher progress visibility** as a **target for the same public product launch**. The proposed authority update and distinct backlog entry explicitly resolve the priority conflict **if and only if the PR is approved and merged**. FI-018 classroom tooling remains parked.
- \`Visual Brand System.md\` remains canonical for marketing visuals; \`Tone of Voice Framework.md\` for learner language; \`Claims and Progress Governance.md\` for educational claims; \`Adaptive Revision Planning.md\` for planner and REV decision ownership.
- The **waitlist website** requires its own readiness work and human approval before implementation; this document is not a self-approved Ready transition. A future governed feature/implementation PR must prove the canonical marketing root, hosting, data flow and security.
- Documentation impact: this proposed specification plus aligned messaging, audience, backlog and INDEX updates define the new intended launch direction. Technical documentation and code changes follow in their own governed implementation PRs. Historical evidence remains unchanged.
