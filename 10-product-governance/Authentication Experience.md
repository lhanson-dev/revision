---
title: "Authentication Experience"
document_id: "revision-authentication-experience"
document_type: "domain-authority"
authority: "product"
status: "active"
version: "0.2"
owner: "Founder"
effective_date: "2026-08-18"
last_reviewed: "2026-08-21"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["learner sign-in and account-creation experience", "FI-002 learner payer and linked-supporter account-role boundary"]
depends_on: ["Core User Journeys", "Subscription Plans and Entitlements", "Product UX Principles", "Privacy and Student Data Principles", "Security Standard"]
supersedes: null
---
# Authentication Experience

## Purpose

Make account access simple enough that authentication does not become a barrier to starting useful revision while preserving secure, recoverable learner accounts and clear separation between learner, payer and linked-supporter roles.

## Canonical learner entry experience

Revision uses one learner application and one authentication entry experience at `/app/`.

The default returning-user path is:

**Continue with Google when available** or **email + password → Sign in**.

The default new-user path is:

**Continue with Google when available** or **First name + email + password → Create account**.

Sign in and Create account must be presented as distinct modes rather than two competing submit actions on the same form.

## First name and learner data minimisation

Email account creation asks for first name because Revision uses it for learner-facing personalisation, including the Home and REV greeting.

Do not require surname, date of birth, school or other profile data merely to create an ordinary learner account unless a separately governed need is established.

FI-002 does not create a need to collect the learner's date of birth solely so that a subscription can be purchased. The initial commercial model uses an adult billing-customer rule instead. Exact age-assurance or payer-verification mechanics still require current legal/privacy validation before implementation.

When an identity provider supplies a usable first/given name, Revision should use that metadata rather than immediately asking the learner to enter the same information again.

## FI-002 account-role model

Revision must treat authentication identity and commercial/support roles as related but distinct concepts.

The approved FI-002 roles are:

- **Learner** — owns and uses the learning account, learner work, educational evidence and REV relationship.
- **Billing customer / payer** — owns the subscription contract, payment method, invoices, renewal and cancellation responsibilities.
- **Linked supporter** — holds explicit permission to access the separately governed Paid/Premium parent-support dashboard for a learner.

One authenticated person may hold more than one role. An adult learner may therefore be both learner and payer. A parent may commonly be both payer and linked supporter. Role combination must not remove the underlying permission boundaries.

Payment alone must not create linked-supporter permission. A payer who is not validly linked as a supporter must not receive learner progress or other parent-dashboard information merely because they funded the subscription.

## Adult billing-customer rule for FI-002 MVP

For the initial UK FI-002 product, the billing customer must be **18 or over**.

This is a Revision product-policy rule for MVP simplicity and risk control; it is not a statement that every contract made by a person under 18 would necessarily be legally invalid in every UK jurisdiction or circumstance.

An adult learner may pay for their own subscription. Where the learner is under 18, the commercial entitlement may be funded through a separate adult payer account.

The precise checkout declaration, age-assurance method, legal wording and provider implementation are not approved by this authority and must be validated before production use.

## Linking learner and supporter accounts

FI-002 must support a secure relationship-linking model without exposing learner account existence through unrestricted search.

The approved product paths are:

- **Learner-led link:** learner chooses to link a parent/supporter → Revision creates a secure invitation/link → adult signs in or creates an account → adult accepts the relationship and, where relevant, completes the subscription journey.
- **Adult-led purchase/link:** adult starts from an appropriate pricing/purchase journey → adult signs in or creates a payer account → Revision creates an invitation for the learner → learner accepts the relationship before supporter access to learner information becomes active.

The first FI-002 implementation should support one primary payer/supporter relationship per learner subscription. Broader family plans, multiple-parent/guardian household management and gift-subscription workflows remain outside the MVP unless separately governed.

The exact verification mechanism, invitation expiry/recovery, unlinking safeguards and exceptional support process remain Definition-of-Ready work.

## Learner transparency

A learner with an active linked supporter must be able to see clearly:

- who is linked;
- that the linked person may receive the approved parent-dashboard information; and
- what that person can and cannot see.

This explanation must use age-appropriate language and must remain available after the original linking moment rather than being disclosed only once.

## Social authentication

Google is the first approved social identity provider for the learner experience.

A provider option must only be shown when it is actually enabled in the configured authentication service. Revision must fail closed rather than advertise a provider that will produce a broken sign-in journey.

Additional providers such as Microsoft or Apple require a deliberate later decision based on learner value, operational complexity, privacy/security implications and evidence of need. The login screen should not become a wall of provider buttons.

FI-002 does not require adult payer/supporter accounts to use a different identity provider merely because their commercial role differs from the learner's role. Exact adult-account entry UX may be designed within the approved role boundary during implementation definition.

## Email/password authentication

Email and password remain a supported path so learners are not required to use a third-party identity provider.

Password creation should use a clear minimum requirement and browser password-manager-compatible fields.

## Account recovery

The main sign-in experience must provide a visible `Forgot password?` action for email/password accounts.

Recovery should return the user to the appropriate canonical Revision application/account surface, allow them to choose a new password and then continue without creating a duplicate identity.

Recovery must not silently change learner/payer/supporter relationships or grant supporter access that did not exist before recovery.

## Experience rules

- Make the primary action obvious.
- Keep required account data minimal.
- Do not ask a social-login user to repeat profile data that the trusted provider has already supplied and Revision can safely use.
- Do not make social login mandatory.
- Do not expose provider credentials or privileged authentication configuration to the browser.
- Keep authentication usable on mobile, tablet and desktop and compatible with keyboard navigation and password managers.
- Authentication errors should be explained in plain language and must not reveal unnecessary account-existence information.
- Do not make payment status a substitute for explicit learner-data permission.
- Do not expose learner lookup/search mechanisms that reveal whether a named child or email address has a Revision account.

## Future simplification

Passwordless email, passkeys and additional identity providers may be considered later. They are not part of the initial approved authentication set and should be introduced only when they clearly reduce learner or adult-account friction without creating disproportionate support, privacy or security complexity.
