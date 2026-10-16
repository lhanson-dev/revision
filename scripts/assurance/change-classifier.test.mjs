import { describe, expect, it } from 'vitest'
import { buildAssurancePlan, classifyChange, learnTargetedSourceFiles, learnTargetedBrowserSpecs } from './change-classifier.mjs'

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

  it('selects documentation-only assurance only when every changed path is Markdown', () => {
    const base = { baseSha: 'a'.repeat(40), headSha: 'b'.repeat(40), eventName: 'pull_request' }
    const docs = buildAssurancePlan({
      ...base,
      files: [
        { path: 'docs/technical/Example.md', patch: '' },
        { path: '50-engineering-standards/Testing & Assurance Standard.md', patch: '' },
      ],
    })
    expect(docs.selectionMode).toBe('docs-only')
    expect(docs.executedCiPolicy).toMatchObject({
      assurancePlanAndSecretScan: true,
      foundationQuality: true,
      foundationStaticUnitBuild: false,
      responsiveBrowser: false,
      databaseRlsProtectedService: true,
    })
    for (const changed of [
      [{ path: 'README.md', patch: '' }, { path: 'src/app/SubjectScreen.tsx', patch: '' }],
      [{ path: 'content/learner-lesson.md', patch: '' }],
      [{ path: 'src/learning/lesson.md', patch: '' }],
      [{ path: 'public/learner-guide.md', patch: '' }],
      [{ path: 'tests/fixtures/topic.md', patch: '' }],
      [{ path: '.github/CONTRIBUTING.md', patch: '' }],
      [{ path: 'unclassified/notes.md', patch: '' }],
      [{ path: 'scripts/assurance/change-classifier.mjs', patch: '' }],
      [{ path: '.github/workflows/ci.yml', patch: '' }],
      [{ path: 'unknown-file', patch: '' }],
      [],
    ]) {
      const plan = buildAssurancePlan({ ...base, files: changed })
      expect(plan.selectionMode).toBe('conservative-full')
      expect(plan.executedCiPolicy.foundationStaticUnitBuild).toBe(true)
      expect(plan.executedCiPolicy.responsiveBrowser).toBe(true)
    }
  })

  it('maps bounded Learn presentation changes to an explicit responsive browser journey set', () => {
    const base = { baseSha: 'a'.repeat(40), headSha: 'b'.repeat(40), eventName: 'pull_request' }
    for (const path of learnTargetedSourceFiles) {
      const plan = buildAssurancePlan({ ...base, files: [
        { path, patch: '' },
        { path: 'docs/technical/Example.md', patch: '' },
      ] })
      expect(plan.risk).toMatchObject({ level: 2, label: 'Medium' })
      expect(plan.selectionMode).toBe('learn-targeted')
      expect(plan.selectedBrowserSpecs).toEqual(learnTargetedBrowserSpecs)
      expect(plan.executedCiPolicy).toMatchObject({
        foundationStaticUnitBuild: true, responsiveBrowser: true, databaseRlsProtectedService: true,
      })
    }
    expect(learnTargetedBrowserSpecs.length).toBeGreaterThanOrEqual(12)
    expect(learnTargetedBrowserSpecs).toContain('tests/e2e/learn-blocks.spec.ts')
    expect(learnTargetedBrowserSpecs).toContain('tests/e2e/learn-active-trail-navigation.spec.ts')
    expect(learnTargetedBrowserSpecs).toContain('tests/e2e/accessibility.spec.ts')
    expect(learnTargetedBrowserSpecs).toContain('tests/e2e/interface-visual-regression.spec.ts')
  })

  it('falls back to full regression for Learn changes mixed with unowned or high-risk files', () => {
    const base = { baseSha: 'a'.repeat(40), headSha: 'b'.repeat(40), eventName: 'pull_request' }
    const owned = { path: 'src/app/ui/learn/layout-plan.ts', patch: '' }
    for (const additional of [
      'src/app/ui/index.ts',
      'src/app/ui/learn/index.ts',
      'src/app/ui/learn/fixtures.ts',
      'src/app/planner-model.ts',
      'src/app/practice-session.ts',
      'tests/e2e/learn-blocks.spec.ts',
      'content/business/aqa-a-level/topic.md',
      'supabase/migrations/20261015000000_more.sql',
      '.github/workflows/ci.yml',
      'playwright.config.ts',
    ]) {
      const plan = buildAssurancePlan({ ...base, files: [owned, { path: additional, patch: '' }] })
      expect(plan.selectionMode).toBe('conservative-full')
      expect(plan.selectedBrowserSpecs).toEqual([])
    }
    expect(buildAssurancePlan({ ...base, files: [{ path: 'src/app/ui/learn/Unmapped.tsx', patch: '' }] }).selectionMode)
      .toBe('conservative-full')
  })

  it('keeps executable change assurance conservative while exposing required assurance', () => {
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
