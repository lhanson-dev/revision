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

  it('escalates destructive migrations to critical risk', () => {
    expect(classifyChange([{ path: 'supabase/migrations/20260819000000_example.sql', patch: '+drop table public.learning_evidence;' }])).toMatchObject({ level: 4, label: 'Critical' })
  })

  it('fails safe for unknown executable/config files', () => {
    expect(classifyChange([{ path: 'unknown.config', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
  })

  it('keeps v1 execution conservative while exposing required assurance', () => {
    const plan = buildAssurancePlan({
      files: [{ path: 'src/app/SubjectScreen.tsx', patch: '' }],
      baseSha: 'a'.repeat(40),
      headSha: 'b'.repeat(40),
      eventName: 'pull_request',
    })

    expect(plan.selectionMode).toBe('conservative-full')
    expect(plan.requiredAssurance.targetedBrowser).toBe(true)
    expect(plan.executedCiPolicy.databaseRlsProtectedService).toBe(true)
  })
})
