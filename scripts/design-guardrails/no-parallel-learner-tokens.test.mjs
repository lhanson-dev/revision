import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The learner source is governed by one canonical semantic token system.
 * Scan production code and alternate browser fixtures for retired --rv-* declarations
 * and var() references. Source history in documentation is not production code.
 */
const root = join(import.meta.dirname, '..', '..')
const sourceRoot = join(root, 'src')

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(css|tsx?)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe('single canonical learner token system', () => {
  it('has no legacy v2 token declarations or runtime references', () => {
    const offenders = sourceFiles(sourceRoot).flatMap((path) => {
      const text = readFileSync(path, 'utf8')
      const matches = text.match(/--rv-[a-z][\w-]*\s*:|var\(\s*--rv-[\w-]+/gi) ?? []
      return matches.length ? [`${relative(root, path)}: ${[...new Set(matches)].join(', ')}`] : []
    })
    expect(offenders).toEqual([])
  })

  it('retains explicit roles for all five governed learning statuses', () => {
    const tokens = readFileSync(join(sourceRoot, 'app', 'brand-tokens.css'), 'utf8')
    for (const state of ['gotit', 'nearly', 'needswork', 'started', 'notstarted']) {
      expect(tokens).toContain(`--learning-status-${state}:`)
      expect(tokens).toContain(`--learning-status-${state}-tint:`)
      expect(tokens).toContain(`--learning-status-${state}-ink:`)
    }
  })
})
