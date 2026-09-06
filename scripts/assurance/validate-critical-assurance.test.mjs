import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { validateCriticalAssurance } from './validate-critical-assurance.mjs'

function fixture({ testContent = "import { it } from 'vitest'\nit('protects', () => { expect(true).toBe(true) })\n", workflowIncludesCommand = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'revision-critical-assurance-'))
  mkdirSync(path.join(root, 'tests/integration'), { recursive: true })
  mkdirSync(path.join(root, '.github/workflows'), { recursive: true })
  const protectedPath = 'tests/integration/protected.test.ts'
  const requiredCommand = 'npx vitest run tests/integration/protected.test.ts'
  writeFileSync(path.join(root, protectedPath), testContent)
  writeFileSync(path.join(root, '.github/workflows/ci.yml'), workflowIncludesCommand ? requiredCommand : 'npm test')
  const manifestPath = path.join(root, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify({
    schemaVersion: 1,
    protectedFiles: [{ path: protectedPath, controls: ['SEC-X'] }],
    requiredWorkflowSnippets: [requiredCommand],
    minimumControlIds: ['SEC-X'],
  }))
  return { root, manifestPath }
}

function withFixture(options, assertion) {
  const { root, manifestPath } = fixture(options)
  try {
    assertion({ root, manifestPath })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

describe('critical assurance integrity', () => {
  it('accepts declared, executed critical assurance', () => {
    withFixture({}, ({ root, manifestPath }) => {
      expect(validateCriticalAssurance({ root, manifestPath })).toMatchObject({
        protectedFileCount: 1,
        protectedControlCount: 1,
        workflowInvocationCount: 1,
      })
    })
  })

  it('accepts conditional skips used to scope a critical test to the CI environment where it executes', () => {
    withFixture({ testContent: "import { test } from '@playwright/test'\nconst enabled = process.env.TEST_DB === '1'\ntest('critical', ({}, testInfo) => { test.skip(!enabled || testInfo.project.name !== 'desktop', 'Runs in the dedicated critical job') })\n" }, ({ root, manifestPath }) => {
      expect(validateCriticalAssurance({ root, manifestPath })).toMatchObject({ protectedFileCount: 1 })
    })
  })

  it('rejects unconditionally suppressed critical tests', () => {
    withFixture({ testContent: "import { it } from 'vitest'\nit.skip('disabled critical check', () => {})\n" }, ({ root, manifestPath }) => {
      expect(() => validateCriticalAssurance({ root, manifestPath })).toThrow(/unconditional skip\/todo\/only suppression/)
    })
  })

  it('rejects a critical assurance command removed from CI', () => {
    withFixture({ workflowIncludesCommand: false }, ({ root, manifestPath }) => {
      expect(() => validateCriticalAssurance({ root, manifestPath })).toThrow(/no longer invokes required critical assurance/)
    })
  })

  it('rejects removal of a required control from the manifest', () => {
    const { root, manifestPath } = fixture()
    try {
      writeFileSync(manifestPath, JSON.stringify({
        schemaVersion: 1,
        protectedFiles: [{ path: 'tests/integration/protected.test.ts', controls: ['OTHER'] }],
        requiredWorkflowSnippets: ['npx vitest run tests/integration/protected.test.ts'],
        minimumControlIds: ['SEC-X'],
      }))
      expect(() => validateCriticalAssurance({ root, manifestPath })).toThrow(/no longer protects required control SEC-X/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
