# AI-Led Assurance Workflow

## Status

Active workflow supplement to `Governed Implementation Workflow.md` for AI-led Level 3 / High and Level 4 / Critical implementation changes.

Authority: `50-engineering-standards/AI-Led Development Assurance Standard.md`.

AI operating rules: `70-ai-operating-system/AI Assurance Review Rules.md`.

## Purpose

Compensate for the absence of routine independent human technical code review without imposing maximum assurance on ordinary low/medium-risk changes.

This workflow does not replace the normal feature-readiness, canonical-runtime, current-main integration, Founder approval or production verification workflow.

## Applicability

- Level 1: not required.
- Level 2: not required unless uncertainty causes escalation.
- Level 3: required.
- Level 4: required with additional critical-release controls from the Testing & Assurance Standard.

If risk classification is uncertain, escalate rather than skip this workflow.

## 1. Derive the assurance contract

Before completed implementation becomes the basis for deciding what should be true:

1. read current authority and relevant technical documentation;
2. identify affected Assurance Coverage Register controls/journeys;
3. state the invariants the change must preserve;
4. state plausible failure/abuse hypotheses;
5. identify required negative/boundary/recovery tests; and
6. identify at least one plausible wrong implementation the tests must detect.

Record the contract in the PR under the governed high-risk assurance sections.

The contract may be refined when new risks are discovered, but implementation must not silently redefine the requirement.

## 2. Implement in the smallest safe scope

Keep high-risk deltas narrow enough to reason about. Separate unrelated UI/copy/refactor work from security/data/scoring/release changes when that reduces blast radius and review complexity.

Implement the authority-approved behaviour and the assurance required to prove it.

## 3. Run normal risk-based assurance

Run the Testing & Assurance Standard layers required by the change, including real database/service boundaries where the material risk lives there.

Existing Revision CI remains conservative-full until a separate governed change proves selective execution safe.

## 4. Protect the assurance system

CI must run the critical-assurance integrity validator.

If a protected assurance asset or its invocation has disappeared, become suppressed, or been weakened structurally, stop. Changes to those assets are high risk and require this workflow themselves.

## 5. Run independent automated analysis

For Level 3/4 pull requests, run the repository-supported independent analysis controls:

- dependency review for newly introduced vulnerable dependencies; and
- CodeQL for JavaScript/TypeScript security findings.

Material findings must be resolved or deliberately governed before merge. Passing application tests do not override a material independent scanner finding.

## 6. Prove test sensitivity

Record at least one plausible defect the assurance is capable of detecting.

Preferred evidence, in descending order where practical:

1. targeted automated mutation result from an approved domain harness;
2. deliberate local fault injection that causes the intended test to fail;
3. negative/boundary test whose assertion directly distinguishes the safe and unsafe behaviour; or
4. equivalent deterministic evidence.

Do not run full-repository mutation/fuzz suites merely to create ceremony. Target the changed critical responsibility.

## 7. Fresh-context adversarial review

After implementation and normal tests are complete, perform the adversarial review defined in `AI Assurance Review Rules.md`.

Review from authority + assurance contract + final diff + tests, not from the builder's explanation of why the solution is correct.

Record:

- what was challenged;
- material findings;
- remediation performed; and
- residual uncertainty/limitations.

An unresolved material finding blocks merge.

## 8. Final integration and assurance

Before merge, apply the normal current-`main` integration rule.

If the final integration candidate changes materially, rerun the relevant high-risk assurance and refresh the adversarial review where the changed delta invalidates prior evidence.

A purely mechanical current-main refresh may retain the underlying assurance contract, but head-specific automated evidence must be regenerated as required by existing release governance.

## 9. Founder merge summary

The Founder summary must explain the actual risk and assurance in plain language. For Level 3/4 include:

- the high-risk responsibility changed;
- important protected invariants;
- adversarial review result;
- independent scanner result;
- test-sensitivity evidence; and
- material residual risk.

For Level 4, explicitly state the residual risk of proceeding without independent human technical review when relevant.

Then follow the existing explicit Founder approval and release-lineage process.

## 10. Production evidence

After merge, continue through normal deployment/backend-readiness/production-smoke evidence. AI-led assurance does not make a green PR equivalent to healthy Production.

## Deep assurance outside ordinary PRs

Longer-running mutation/property/fuzz/security sweeps may be run periodically, before major releases, or when a domain's risk justifies them.

The existence of deep assurance must not make those expensive suites mandatory for every low/medium-risk PR unless a separate governed decision establishes that need.

## Completion criteria

This workflow is complete for a Level 3/4 PR only when:

- the assurance contract is recorded;
- required automated assurance is green;
- critical-assurance integrity is green;
- required independent analysis is green or an explicitly governed exception exists;
- test-sensitivity evidence is recorded;
- adversarial review has no unresolved material finding;
- documentation/register impact is current; and
- the PR has been integrated/revalidated with current `main` under the normal workflow.
