import { describe, expect, it } from 'vitest'
import { buildAssurancePlan, classifyChange } from './change-classifier.mjs'

describe('change assurance classifier', () => {
  it('classifies documentation-only changes as low risk', () => {
    expect(classifyChange([{ path: 'docs/technical/Example.md', patch: '' }])).toMatchObject({ level: 1, label: 'Low' })
  })

  it('classifies bounded learner UI changes as medium risk', () => {
    expect(classifyChange([{ path: 'src/app/SubjectScreen.tsx', patch: '' }])).toMatchObject({ level: 2, label: 'Medium' })
  })

  it('classifies auth, persistence and workflow changes as high risk', () => {
    expect(classifyChange([{ path: 'src/services/auth/session.ts', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
    expect(classifyChange([{ path: '.github/workflows/ci.yml', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
  })

  it('treats critical assurance and release-safety changes as high risk', () => {
    expect(classifyChange([{ path: 'scripts/assurance/change-classifier.test.mjs', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
    expect(classifyChange([{ path: 'tests/integration/edge-operations.test.ts', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
    expect(classifyChange([{ path: '.github/PULL_REQUEST_TEMPLATE.md', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
  })

  it('keeps ordinary non-critical test maintenance at medium risk', () => {
    expect(classifyChange([{ path: 'tests/e2e/non-critical-example.spec.ts', patch: '' }])).toMatchObject({ level: 2, label: 'Medium' })
  })

  it('escalates destructive migrations to critical risk', () => {
    expect(classifyChange([{ path: 'supabase/migrations/20260819000000_example.sql', patch: '+drop table public.learning_evidence;' }])).toMatchObject({ level: 4, label: 'Critical' })
  })

  it('fails safe for unknown executable/config files', () => {
    expect(classifyChange([{ path: 'unknown.config', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
  })

  it('keeps ordinary execution conservative without adding high-risk ceremony to medium changes', () => {
    const plan = buildAssurancePlan({
      files: [{ path: 'src/app/SubjectScreen.tsx', patch: '' }],
      baseSha: 'a'.repeat(40),
      headSha: 'b'.repeat(40),
      eventName: 'pull_request',
    })

    expect(plan.schemaVersion).toBe(2)
    expect(plan.selectionMode).toBe('conservative-full')
    expect(plan.requiredAssurance.targetedBrowser).toBe(true)
    expect(plan.requiredAssurance.adversarialReview).toBe(false)
    expect(plan.requiredAssurance.independentSecurityAnalysis).toBe(false)
    expect(plan.requiredAssurance.dependencyVulnerabilityAnalysis).toBe(false)
    expect(plan.requiredAssurance.criticalAssuranceIntegrity).toBe(true)
    expect(plan.executedCiPolicy.databaseRlsProtectedService).toBe(true)
  })

  it('declares the compensating assurance required for high-risk changes without unnecessary dependency registry coupling', () => {
    const plan = buildAssurancePlan({
      files: [{ path: 'src/services/auth/session.ts', patch: '' }],
      baseSha: 'a'.repeat(40),
      headSha: 'b'.repeat(40),
      eventName: 'pull_request',
    })

    expect(plan.requiredAssurance).toMatchObject({
      assuranceContract: true,
      adversarialReview: true,
      testSensitivityEvidence: true,
      criticalAssuranceIntegrity: true,
      independentSecurityAnalysis: true,
      dependencyVulnerabilityAnalysis: false,
    })
    expect(plan.executedCiPolicy.highRiskPrEvidence).toBe(true)
    expect(plan.executedCiPolicy.independentSecurityAnalysisOnPullRequest).toBe(true)
    expect(plan.executedCiPolicy.dependencyVulnerabilityAnalysisOnChange).toBe(false)
  })

  it('requires dependency vulnerability analysis when package manifests or lockfiles change', () => {
    for (const path of ['package.json', 'package-lock.json']) {
      const plan = buildAssurancePlan({
        files: [{ path, patch: '' }],
        baseSha: 'a'.repeat(40),
        headSha: 'b'.repeat(40),
        eventName: 'pull_request',
      })

      expect(plan.risk).toMatchObject({ level: 3, label: 'High' })
      expect(plan.requiredAssurance.independentSecurityAnalysis).toBe(true)
      expect(plan.requiredAssurance.dependencyVulnerabilityAnalysis).toBe(true)
      expect(plan.executedCiPolicy.dependencyVulnerabilityAnalysisOnChange).toBe(true)
    }
  })
})
