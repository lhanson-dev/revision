---
title: "Authentication Experience"
document_id: "revision-authentication-experience"
document_type: "domain-authority"
authority: "product"
status: "active"
version: "0.1"
owner: "Founder"
effective_date: "2026-08-18"
last_reviewed: "2026-08-18"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["learner sign-in and account-creation experience"]
depends_on: ["Core User Journeys", "Product UX Principles", "Privacy and Student Data Principles", "Security Standard"]
supersedes: null
---
# Authentication Experience

## Purpose

Make account access simple enough that authentication does not become a barrier to starting useful revision while preserving secure, recoverable learner accounts.

## Canonical entry experience

Revision uses one learner application and one authentication entry experience at `/app/`.

The default returning-user path is:

**Continue with Google when available** or **email + password → Sign in**.

The default new-user path is:

**Continue with Google when available** or **First name + email + password → Create account**.

Sign in and Create account must be presented as distinct modes rather than two competing submit actions on the same form.

## First name

Email account creation asks for first name because Revision uses it for learner-facing personalisation, including the Home and REV greeting.

Do not require surname, date of birth, school or other profile data merely to create an ordinary learner account unless a separately governed need is established.

When an identity provider supplies a usable first/given name, Revision should use that metadata rather than immediately asking the learner to enter the same information again.

## Social authentication

Google is the first approved social identity provider for the learner experience.

A provider option must only be shown when it is actually enabled in the configured authentication service. Revision must fail closed rather than advertise a provider that will produce a broken sign-in journey.

Additional providers such as Microsoft or Apple require a deliberate later decision based on learner value, operational complexity, privacy/security implications and evidence of need. The login screen should not become a wall of provider buttons.

## Email/password authentication

Email and password remain a supported path so learners are not required to use a third-party identity provider.

Password creation should use a clear minimum requirement and browser password-manager-compatible fields.

## Account recovery

The main sign-in experience must provide a visible `Forgot password?` action for email/password accounts.

Recovery should return the learner to the canonical Revision application, allow them to choose a new password and then continue without introducing a separate account surface.

## Experience rules

- Make the primary action obvious.
- Keep required account data minimal.
- Do not ask a social-login user to repeat profile data that the trusted provider has already supplied and Revision can safely use.
- Do not make social login mandatory.
- Do not expose provider credentials or privileged authentication configuration to the browser.
- Keep authentication usable on mobile, tablet and desktop and compatible with keyboard navigation and password managers.
- Authentication errors should be explained in plain language and must not reveal unnecessary account-existence information.

## Future simplification

Passwordless email, passkeys and additional identity providers may be considered later. They are not part of the initial approved authentication set and should be introduced only when they clearly reduce learner friction without creating disproportionate support or security complexity.
