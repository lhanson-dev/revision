# AI Assurance Review Rules

## Status and relationship

This is an active AI operating rule for Revision. It applies alongside `AI Agent Constitution.md` and `AI Coding & Repository Rules.md` and implements the `AI-Led Development Assurance Standard` for AI-executed repository work.

It does not delegate Founder authority, create a human technical-review gate, or weaken any existing release/security/testing control.

## Core rule

For Level 3 / High and Level 4 / Critical implementation changes, an AI agent must not treat its own successful implementation and self-authored tests as sufficient assurance.

The agent must deliberately create a second assurance reasoning path using the governed assurance contract, independent tooling and a fresh-context adversarial review.

## Before implementation

For Level 3/4 work, before using completed code to decide what correctness means, the executing agent must derive the assurance contract from active authority and relevant current technical constraints.

The contract must identify the important invariants, failure/abuse hypotheses and critical journey/control IDs that the change must preserve.

The agent must not reverse-engineer the requirement from the implementation and then call that a specification.

## During implementation

The implementing agent should:

- keep high-risk changes bounded and reviewable;
- add tests at the lowest layer that can deterministically prove each important invariant;
- include negative/boundary/recovery tests where applicable;
- avoid mocks where the material risk exists at the real database/service boundary;
- preserve existing critical assurance unless authority deliberately changes the required control; and
- escalate uncertainty rather than silently narrowing the assurance scope.

## Fresh-context adversarial review

After implementation and normal assurance are complete, the agent must perform or obtain a fresh-context adversarial review for Level 3/4 work.

The adversarial task is:

> Assume this change contains a serious defect that ordinary happy-path tests missed. Find it or explain what was challenged and why no material unresolved finding remains.

The review input should be limited to what a reviewer needs to challenge the result:

- current governing authority;
- the assurance contract;
- final proposed diff;
- affected technical architecture/documentation; and
- tests/evidence present in the proposed change.

Implementation rationale, private chain-of-thought and prior confidence claims must not be used as evidence that the code is correct.

When the same AI model/session performs both roles, it must explicitly switch to reviewer posture, re-read the above evidence and challenge the implementation from scratch. This is a compensating control, not independent human review, and must be described truthfully.

## Required adversarial questions

Where relevant, the review must actively challenge:

1. Can an unauthenticated or wrong user perform the operation?
2. Can UI restrictions be bypassed by calling the service/database directly?
3. Can data cross learner/account boundaries?
4. Can privileged credentials, service roles or protected operations reach the browser?
5. Does any failure path fail open or report success without durable success?
6. Can retries, duplicates or races corrupt or duplicate learner state?
7. Can partial failure silently lose learner work?
8. Does persisted state reconstruct correctly after reload?
9. Do scoring/readiness/evidence rules match authority rather than implementation convenience?
10. Can planning/context state contaminate educational evidence?
11. Do tests genuinely challenge the implementation, or do they merely reproduce its logic?
12. Has a critical test/control been weakened, skipped, removed or stopped from executing?
13. Is the change broader than necessary, increasing blast radius without need?
14. Is rollback/recovery credible for the risk level?

## Test-sensitivity rule

For Level 3/4 work the PR must identify at least one plausible wrong implementation that the assurance would detect.

The evidence can be a negative/boundary test, deliberate local fault injection, targeted mutation testing, or equivalent deterministic proof.

Do not claim mutation testing occurred when only ordinary tests ran.

## Critical assurance changes

Any change to the following is itself high risk unless a higher risk applies:

- critical RLS/database assurance;
- protected Edge/service authorisation tests;
- critical persistence/browser tests;
- release-lineage or Founder-approval assurance;
- change classification / assurance planning;
- critical-assurance manifest/validator; or
- CI/deployment workflow controls.

An AI agent must not classify weakening the safety system as routine test maintenance.

## Independent tooling

Where Level 3/4 CI runs CodeQL, dependency review or another independent scanner, the agent must investigate material findings rather than dismissing them because application tests pass.

A tool failure caused by a genuine repository/platform incompatibility may be remediated or deliberately governed, but it must not be silently bypassed.

## Founder communication

Before requesting merge approval for Level 3/4 work, the Founder-facing summary must state in plain language:

- what high-risk responsibility changed;
- what invariants were protected;
- what adversarial review challenged;
- whether independent security/dependency analysis passed;
- any material residual technical risk; and
- for Level 4, the relevant residual risk of proceeding without independent human technical review where applicable.

Do not represent Founder approval, AI adversarial review or passing automation as human technical code review.

## Stop conditions

Stop before merge and surface the problem if:

- the assurance contract cannot be derived confidently from authority;
- a required high-risk PR evidence section is missing or dishonest;
- a critical assurance control is missing or suppressed;
- independent security analysis reports an unresolved material finding;
- adversarial review finds an unresolved material defect or design concern;
- required test-sensitivity evidence cannot be established; or
- residual Level 4 risk is materially beyond what the Founder has been told.
