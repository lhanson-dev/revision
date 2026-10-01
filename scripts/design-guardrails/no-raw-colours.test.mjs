import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guardrail: no raw hex colours outside src/app/brand-tokens.css.
 *
 * Colour values live in the token file only. Components and page CSS read them through variables
 * (and subject colours through src/app/subject-palette.ts).
 *
 * The files below already contained raw hex before this rule existed (counted 1 Oct 2026). They may
 * keep what they have but not add more, and the screen redesign PRs remove them. Do NOT add a file
 * to this list or raise a count to make a build pass: use a token instead.
 */
const knownLegacyHexCounts = {
  'src/app/AuthGate.tsx': 4,
  'src/app/DesignLab.tsx': 8,
  'src/app/app.css': 49,
  'src/app/content-operations.css': 22,
  'src/app/course-overview-rev-feature.css': 1,
  'src/app/exam.css': 15,
  'src/app/founder-assurance.css': 13,
  'src/app/hierarchy.css': 15,
  'src/app/home-view.ts': 8,
  'src/app/planner-rev.css': 8,
  'src/app/planner-today.css': 10,
  'src/app/planner.css': 22,
  'src/app/profile-edit.css': 1,
  'src/app/returning-home.css': 1,
  'src/app/rev-home.css': 48,
}

const repoRoot = join(import.meta.dirname, '..', '..')
const hexPattern = /#[0-9a-fA-F]{3,8}\b/g

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(css|tsx?)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

function hexCount(text) {
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, '') // comments
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/&#\d+;|&#x[0-9a-fA-F]+;/g, '') // HTML entities
  return (stripped.match(hexPattern) ?? []).length
}

describe('no raw hex colours outside brand-tokens.css', () => {
  const files = sourceFiles(join(repoRoot, 'src'))
    .map((path) => ({ name: relative(repoRoot, path).replace(/\\/g, '/'), text: readFileSync(path, 'utf8') }))
    .filter(({ name }) => name !== 'src/app/brand-tokens.css')

  it('adds no new raw hex colours', () => {
    const problems = files
      .map(({ name, text }) => ({ name, count: hexCount(text), allowed: knownLegacyHexCounts[name] ?? 0 }))
      .filter(({ count, allowed }) => count > allowed)
      .map(({ name, count, allowed }) => `${name}: ${count} raw hex colours (allowed ${allowed}). Use a token from brand-tokens.css.`)
    expect(problems).toEqual([])
  })

  it('keeps the legacy list honest: lower a count when a file gets cleaner, remove it at zero', () => {
    const stale = Object.entries(knownLegacyHexCounts)
      .map(([name, allowed]) => ({ name, allowed, count: hexCount(files.find((file) => file.name === name)?.text ?? '') }))
      .filter(({ count, allowed }) => count < allowed)
      .map(({ name, count, allowed }) => `${name}: now ${count}, list says ${allowed}. Lower it.`)
    expect(stale).toEqual([])
  })
})
