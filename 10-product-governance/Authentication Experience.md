---
title: "Authentication Experience"
document_id: "revision-authentication-experience"
document_type: "domain-authority"
authority: "product"
status: "active"
version: "0.3"
owner: "Founder"
effective_date: "2026-08-23"
last_reviewed: "2026-08-23"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["account sign-in and account-creation experience", "post-registration Student Parent Teacher experience routing", "FI-002 Student payer and linked-supporter account-role boundary"]
depends_on: ["Core User Journeys", "Subscription Plans and Entitlements", "Product UX Principles", "Privacy and Student Data Principles", "Security Standard"]
supersedes: null
---
# Authentication Experience

## Purpose

Make account access simple enough that authentication does not become a barrier to useful revision, while establishing the correct primary product experience for each account and preserving secure, recoverable identities and clear separation between Student, payer, linked-supporter and future Teacher permissions.

## Canonical account entry experience

Revision uses one authentication entry experience at `/app/` for the initial product.

The default returning-user path is:

**Continue with Google when available** or **email + password → Sign in**.

The default new-user path is:

**Continue with Google when available** or **First name + email + password → Create account**.

Sign in and Create account must be presented as distinct modes rather than two competing submit actions on the same form.

After a new account is created successfully, Revision must establish the user's intended primary product experience before continuing into product onboarding.

## Primary experience selection after registration

Every newly registered account must be shown the three core Revision experience types:

1. **Student**;
2. **Parent**; and
3. **Teacher**.

This is a short routing decision, not a persona questionnaire.

### Initial availability

For the initial product:

- **Student** is the only enabled and selectable option.
- **Parent** must remain visible but unavailable and must be clearly marked **Coming soon**.
- **Teacher** must remain visible but unavailable and must be clearly marked **Coming soon**.

Parent and Teacher must not route into the Student experience as a fallback, and selecting or attempting to interact with those unavailable options must not imply that those experiences or permissions currently exist.

The unavailable state must be accessible and unambiguous: it must not rely on colour alone, and assistive technologies must be able to determine that Parent and Teacher are currently unavailable.

Selecting **Student** records the account's primary experience as Student and continues directly into the Student first-use journey without asking unnecessary profile questions.

The primary experience choice should persist so a Student is not asked to make the same selection on every sign-in.

When Parent or Teacher experiences are later launched, enabling either option requires its own governed product scope, permissions, journeys and implementation readiness. This authority does not pre-approve those future experiences merely because their options are visible.

## Experience type is not a permission or commercial role

The Student / Parent / Teacher selector determines which primary product experience the account intends to use. It is not itself a billing, relationship or data-access permission model.

In particular:

- **Student** means the person is entering the Revision study and revision experience.
- **Parent** identifies the intended future parent/supporter experience; it does not by itself make the person a payer or grant access to Student information.
- **Teacher** identifies the intended future Teacher experience; it does not grant school, class or Student-data permissions merely because the experience type exists.

A Student may also be an adult payer. A Parent may later be a payer, linked supporter, both or neither. Commercial roles and data-access permissions remain separately governed.

## Canonical Student terminology

**Student** is the canonical Revision term for the person using the study and revision product.

Do not maintain `learner` as a parallel internal synonym for the same Revision account/entity. Existing stored or technical identifiers may remain temporarily only where a deliberate compatibility migration is required; new product, governance and implementation work should use Student.

## First name and Student data minimisation

Email account creation asks for first name because Revision uses it for Student-facing personalisation, including the Home and REV greeting.

Do not require surname, date of birth, school or other profile data merely to create an ordinary Student account unless a separately governed need is established.

FI-002 does not create a need to collect the Student's date of birth solely so that a subscription can be purchased. The initial commercial model uses an adult billing-customer rule instead. Exact age-assurance or payer-verification mechanics still require current legal/privacy validation before implementation.

When an identity provider supplies a usable first/given name, Revision should use that metadata rather than immediately asking the Student to enter the same information again.

## FI-002 account-role model

Revision must treat authentication identity, primary experience type and commercial/support roles as related but distinct concepts.

The approved FI-002 roles are:

- **Student** — owns and uses the study account, Student work, educational evidence and REV relationship.
- **Billing customer / payer** — owns the subscription contract, payment method, invoices, renewal and cancellation responsibilities.
- **Linked supporter** — holds explicit permission to access the separately governed Paid/Premium parent-support dashboard for a Student.

One authenticated person may hold more than one role. An adult Student may therefore be both Student and payer. A Parent may commonly be both payer and linked supporter. Role combination must not remove the underlying permission boundaries.

Payment alone must not create linked-supporter permission. A payer who is not validly linked as a supporter must not receive Student progress or other parent-dashboard information merely because they funded the subscription.

## Adult billing-customer rule for FI-002 MVP

For the initial UK FI-002 product, the billing customer must be **18 or over**.

This is a Revision product-policy rule for MVP simplicity and risk control; it is not a statement that every contract made by a person under 18 would necessarily be legally invalid in every UK jurisdiction or circumstance.

An adult Student may pay for their own subscription. Where the Student is under 18, the commercial entitlement may be funded through a separate adult payer account.

The precise checkout declaration, age-assurance method, legal wording and provider implementation are not approved by this authority and must be validated before production use.

## Linking Student and supporter accounts

FI-002 must support a secure relationship-linking model without exposing Student account existence through unrestricted search.

The approved product paths are:

- **Student-led link:** Student chooses to link a parent/supporter → Revision creates a secure invitation/link → adult signs in or creates an account → adult accepts the relationship and, where relevant, completes the subscription journey.
- **Adult-led purchase/link:** adult starts from an appropriate pricing/purchase journey → adult signs in or creates a payer account → Revision creates an invitation for the Student → Student accepts the relationship before supporter access to Student information becomes active.

The first FI-002 implementation should support one primary payer/supporter relationship per Student subscription. Broader family plans, multiple-parent/guardian household management and gift-subscription workflows remain outside the MVP unless separately governed.

The exact verification mechanism, invitation expiry/recovery, unlinking safeguards and exceptional support process remain Definition-of-Ready work.

## Student transparency

A Student with an active linked supporter must be able to see clearly:

- who is linked;
- that the linked person may receive the approved parent-dashboard information; and
- what that person can and cannot see.

This explanation must use age-appropriate language and must remain available after the original linking moment rather than being disclosed only once.

## Social authentication

Google is the first approved social identity provider for the Student experience.

A provider option must only be shown when it is actually enabled in the configured authentication service. Revision must fail closed rather than advertise a provider that will produce a broken sign-in journey.

Additional providers such as Microsoft or Apple require a deliberate later decision based on Student value, operational complexity, privacy/security implications and evidence of need. The login screen should not become a wall of provider buttons.

FI-002 does not require adult payer/supporter accounts to use a different identity provider merely because their commercial role differs from the Student's role. Exact adult-account entry UX may be designed within the approved role boundary during implementation definition.

## Email/password authentication

Email and password remain a supported path so users are not required to use a third-party identity provider.

Password creation should use a clear minimum requirement and browser password-manager-compatible fields.

## Account recovery

The main sign-in experience must provide a visible `Forgot password?` action for email/password accounts.

Recovery should return the user to the appropriate canonical Revision application/account surface, allow them to choose a new password and then continue without creating a duplicate identity.

Recovery must not silently change primary experience type, Student/payer/supporter relationships or grant supporter access that did not exist before recovery.

## Experience rules

- Make the primary action obvious.
- Keep required account data minimal.
- Keep the post-registration experience selector to Student / Parent / Teacher rather than turning it into a profile questionnaire.
- Keep Student as the only enabled initial experience; show Parent and Teacher clearly as **Coming soon** until separately governed launch readiness is achieved.
- Do not ask a social-login user to repeat profile data that the trusted provider has already supplied and Revision can safely use.
- Do not make social login mandatory.
- Do not expose provider credentials or privileged authentication configuration to the browser.
- Keep authentication and experience selection usable on mobile, tablet and desktop and compatible with keyboard navigation and password managers.
- Authentication errors should be explained in plain language and must not reveal unnecessary account-existence information.
- Do not make payment status a substitute for explicit Student-data permission.
- Do not expose Student lookup/search mechanisms that reveal whether a named child or email address has a Revision account.

## Future simplification

Passwordless email, passkeys and additional identity providers may be considered later. They are not part of the initial approved authentication set and should be introduced only when they clearly reduce Student or adult-account friction without creating disproportionate support, privacy or security complexity.
