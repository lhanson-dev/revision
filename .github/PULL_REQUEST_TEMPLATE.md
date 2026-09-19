# Change summary

## What changed?

## Why?

## Change classification
- [ ] Constitutional / governance
- [ ] Product authority
- [ ] Domain authority
- [ ] Implementation
- [ ] Technical documentation
- [ ] Research
- [ ] Audit
- [ ] Defect
- [ ] Maintenance

## Authority
Which active authority governs this change?

Does this change what Revision **should do**?
- [ ] No
- [ ] Yes — authority has been updated/proposed

## Implementation target verification
Complete this section for implementation changes.

**Intended user-facing route(s) / product surface:**

**Canonical runtime / entry point:**

**Primary files/components being changed:**

**Technical source used to establish the canonical target:**

**Compatibility / legacy / migration surfaces that also exist:**

How do tests or production smoke prove this PR changes the intended canonical surface?

- [ ] Canonical runtime/route was resolved before implementation began
- [ ] No compatibility or legacy surface is being mistaken for the governed product
- [ ] Deployment configuration publishes the runtime/surface changed by this PR

## Implementation
Does implementation conform to active authority?
- [ ] Yes
- [ ] Not applicable
- [ ] No — explain

## High-risk AI-led assurance
Complete the four `###` sections below for every Level 3 / High or Level 4 / Critical PR. Level 1/2 PRs may leave the instructional comments untouched.

### Assurance invariants
<!-- State the authority-derived behaviours/security/data/scoring/release invariants that must remain true. Do not derive correctness only from the completed implementation. -->

### Failure and abuse hypotheses
<!-- State plausible wrong, malicious, partial-failure, retry/duplicate, boundary or recovery behaviours the assurance must catch. -->

### Adversarial review
<!-- Record the fresh-context adversarial review: what was challenged, findings/remediation, and residual uncertainty. Do not claim human technical review unless one actually occurred. -->

### Test sensitivity
<!-- Identify at least one plausible incorrect implementation the tests would detect, and the negative/fault-injection/mutation/equivalent evidence that distinguishes safe from unsafe behaviour. -->

## Evidence and testing
What demonstrates the change is safe and correct?

## Documentation integrity
- [ ] No duplicate source of truth introduced
- [ ] Technical documentation does not redefine authority
- [ ] Research has not been presented as approval
- [ ] Historic audits have not been rewritten
- [ ] Relevant registers have been updated

## Founder approval gate
**Every merge into `main` requires explicit Founder approval for this specific PR.**

- [ ] Explicit Founder approval has been given for this PR

Passing tests, review status or technical mergeability do not constitute Founder approval.
