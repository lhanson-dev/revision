#!/usr/bin/env node
/**
 * One-shot, reproducible, published-content-only provisional AQA crosswalk.
 * Test imports use the actual Vite content registry; this Node wrapper owns
 * output files so src/ frontend tests never require Node type declarations.
 *
 * Usage: node scripts/assurance/export-published-qualification-crosswalk.mjs [destination.json]
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const output = resolve(root, process.argv[2] ?? 'tmp/assurance/aqa-7132-7182-published-coverage-provisional.json')
const stdout = execFileSync('npm', [
  'exec', '--', 'vitest', 'run',
  'src/app/published-requirement-assurance.test.ts',
  '--reporter=dot',
], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 24 * 1024 * 1024,
  stdio: ['inherit', 'pipe', 'inherit'],
})
const marker = 'REVISION_SOURCE_TO_LIVE_SUPPLY_AUDIT='
const candidates = stdout.split(/\r?\n/)
  .filter(line => line.includes(marker))
if (candidates.length !== 1) {
  throw new Error('Expected one deterministic crosswalk record from the verified Vitest run')
}
const raw = candidates[0].slice(candidates[0].indexOf(marker) + marker.length).trim()
const report = JSON.parse(raw)
if (report?.status?.startsWith('PROVISIONAL:') !== true
  || report?.exactSpecificationPdfHashesVerified !== false
  || report?.reports?.length !== 2
  || report?.reports?.some(item => item.sourceUniverseStatus !== 'provisional-not-independently-enumerated')) {
  throw new Error('Refusing to write an unlabelled or unverified syllabus coverage claim')
}
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, JSON.stringify(report, null, 2) + '\n', 'utf8')
console.log('Provisional source-to-live crosswalk created:', output)
for (const item of report.summary.qualifications) {
  console.log(item.course, JSON.stringify(item))
}
console.log('This file does NOT prove complete AQA syllabus coverage, teaching adequacy or mastery.')
