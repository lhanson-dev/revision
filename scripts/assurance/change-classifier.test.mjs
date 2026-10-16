import { describe, expect, it } from 'vitest'
import { buildAssurancePlan, classifyChange, selectExecutionScope } from './change-classifier.mjs'

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

  it('escalates central learner planning decisions to high risk', () => {
    for (const path of [
      'src/app/planner-model.ts',
      'src/app/home-task.ts',
      'src/app/PlanScreen.tsx',
      'src/engine/planning/preparation.ts',
    ]) {
      expect(classifyChange([{ path, patch: '' }])).toMatchObject({ level: 3, label: 'High' })
    }
  })

  it('escalates destructive migrations to critical risk', () => {
    expect(classifyChange([{ path: 'supabase/migrations/20260819000000_example.sql', patch: '+drop table public.learning_evidence;' }])).toMatchObject({ level: 4, label: 'Critical' })
  })

  it('fails safe for unknown executable/config files', () => {
    expect(classifyChange([{ path: 'unknown.config', patch: '' }])).toMatchObject({ level: 3, label: 'High' })
  })

  it('only fast-tracks narrowly allowlisted non-executable documentation', () => {
    const docs = [{ path: 'README.md' }, { path: 'docs/technical/Revision CI.md' }, { path: 'audits/2026-10-16-ci.md' }]
    expect(selectExecutionScope(docs, 'pull_request')).toMatchObject({
      mode: 'docs-only', runStatic: false, runBrowser: false, runDatabase: false,
    })
    for (const path of [
      'content/specification.md',
      '50-engineering-standards/Testing & Assurance Standard.md',
      '90-governance-registers/Assurance Coverage Register.md',
      'docs/technical/specification.json',
    ]) {
      expect(selectExecutionScope([{ path }], 'pull_request').mode).toBe('full')
    }
  })

  it('limits targeted browser assurance to extant, isolated spec-only edits', () => {
    const files = [
      { path: 'tests/e2e/interface-visual-regression.spec.ts', exists: true },
      { path: 'tests/e2e/home-refinement.spec.ts', exists: true },
      { path: 'docs/technical/CI.md', exists: true },
    ]
    expect(selectExecutionScope(files, 'pull_request')).toMatchObject({
      mode: 'targeted-e2e',
      runStatic: true,
      runBrowser: true,
      runDatabase: false,
      browserTestFiles: ['tests/e2e/home-refinement.spec.ts', 'tests/e2e/interface-visual-regression.spec.ts'],
    })
    expect(selectExecutionScope([{ path: 'tests/e2e/home-refinement.spec.ts', exists: false }], 'pull_request').mode).toBe('full')
    expect(selectExecutionScope([{ path: 'tests/e2e/database-persistence.spec.ts', exists: true }], 'pull_request').mode).toBe('full')
    expect(selectExecutionScope([{ path: 'tests/e2e/first-use-real-service.spec.ts', exists: true }], 'pull_request').mode).toBe('full')
    expect(selectExecutionScope([...files, { path: 'src/app/HomeSetupEmpty.tsx' }], 'pull_request').mode).toBe('full')
    expect(selectExecutionScope([{ path: 'tests/e2e/eval;rm -rf x.spec.ts' }], 'pull_request').mode).toBe('full')
  })

  it('retains full tests for all main pushes and uncertain or shared changes', () => {
    for (const files of [
      [],
      [{ path: 'src/engine/planning/preparation.ts' }],
      [{ path: 'supabase/migrations/20260903000000.sql' }],
      [{ path: '.github/workflows/ci.yml' }],
      [{ path: 'unknown.config' }],
    ]) {
      expect(selectExecutionScope(files, 'pull_request').mode).toBe('full')
    }
    expect(selectExecutionScope([{ path: 'docs/technical/a.md' }], 'push').mode).toBe('full')
    expect(selectExecutionScope([{ path: 'tests/e2e/home-refinement.spec.ts' }], 'schedule').mode).toBe('full')
  })

  it('publishes exact-head risk-selection scope and mandatory gate policy', () => {
    const plan = buildAssurancePlan({
      files: [{ path: 'src/app/SubjectScreen.tsx', patch: '' }],
      baseSha: 'a'.repeat(40),
      headSha: 'b'.repeat(40),
      eventName: 'pull_request',
    })
    expect(plan.selectionMode).toBe('risk-selected')
    expect(plan.execution.mode).toBe('full')
    expect(plan.requiredAssurance.targetedBrowser).toBe(true)
    expect(plan.executedCiPolicy.databaseRlsProtectedService).toBe(true)
    expect(plan.executedCiPolicy.databaseChecksExecuted).toBe(true)
    expect(plan.baseSha).toBe('a'.repeat(40))
    expect(plan.headSha).toBe('b'.repeat(40))
  })
})
