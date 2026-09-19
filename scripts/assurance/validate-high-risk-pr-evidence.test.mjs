import { describe, expect, it } from 'vitest'
import { validateHighRiskPrEvidence } from './validate-high-risk-pr-evidence.mjs'

const completeBody = `
### Assurance invariants
Learner-owned data must remain isolated, required critical assurance must continue to execute, and the release path must fail closed if evidence is missing.

### Failure and abuse hypotheses
A change could accidentally downgrade a security-sensitive file to medium risk, suppress a critical test, or allow high-risk work to proceed with self-confirming happy-path evidence only.

### Adversarial review
A fresh-context review challenges the final diff from authority and tests, specifically looking for weakened classification, suppressed assurance and failure-open behaviour; no unresolved material finding remains.

### Test sensitivity
Classifier and validator tests deliberately assert the unsafe alternatives so a downgrade, removed CI invocation or suppressed protected test causes the suite to fail.
`

describe('high-risk PR evidence validation', () => {
  it('does not add ceremony to low/medium-risk PRs', () => {
    expect(validateHighRiskPrEvidence({
      plan: { risk: { level: 2 } },
      event: { pull_request: { body: '' } },
    })).toMatchObject({ required: false })
  })

  it('requires complete evidence for high-risk PRs', () => {
    expect(validateHighRiskPrEvidence({
      plan: { risk: { level: 3 } },
      event: { pull_request: { body: completeBody } },
    })).toMatchObject({
      required: true,
      validatedSections: ['Assurance invariants', 'Failure and abuse hypotheses', 'Adversarial review', 'Test sensitivity'],
    })
  })

  it('rejects missing or placeholder high-risk evidence', () => {
    expect(() => validateHighRiskPrEvidence({
      plan: { risk: { level: 4 } },
      event: { pull_request: { body: '### Assurance invariants\nPending' } },
    })).toThrow(/High-risk PR assurance evidence failed/)
  })

  it('does not require a second PR body on the post-merge main push', () => {
    expect(validateHighRiskPrEvidence({
      plan: { risk: { level: 3 } },
      event: { ref: 'refs/heads/main' },
    })).toMatchObject({ required: false })
  })
})
