#!/usr/bin/env node
/** Review six source sections' atom-to-live supply candidates, not a course completeness pass.
 * Run: node scripts/assurance/export-aqa-business-7132-31-32-review.mjs [output.json]
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const output = resolve(root, process.argv[2] ??
  'tmp/assurance/aqa-business-7132-31-32-source-to-published-CANDIDATE.json')
const stdout = execFileSync('npm', [
  'exec', '--', 'vitest', 'run',
  'scripts/assurance/aqa-business-7132-31-32-source-review.test.ts', '--reporter=dot',
], {cwd:root, encoding:'utf8', maxBuffer:24*1024*1024, stdio:['inherit','pipe','inherit']})
const prefix = 'REVISION_BUSINESS_31_32_SOURCE_TO_PUBLISHED_CANDIDATES='
const lines = stdout.split(/\r?\n/).filter(line => line.includes(prefix))
if (lines.length !== 1) throw new Error('Expected one source-to-published candidate record')
const report = JSON.parse(lines[0].slice(lines[0].indexOf(prefix) + prefix.length))
if (report.totalOfficialSections !== 42 || report.sectionsReviewedInThisPackage !== 6
  || report.candidateAtomsReviewedInThisPackage !== 80
  || report.uploadedPdfHashVerified !== false
  || report.teachingAndExamAdequacyVerified !== false
  || report.authenticatedLearnerAcceptanceVerified !== false
  || report.rows.length !== 80 || report.rows.some(r => r.evidenceClass !== 'PUBLISHED-SUPPLY-ONLY'
    || r.examinationAdequacy !== 'unverified' || r.realLearnerAcceptance !== 'unverified')) {
  throw new Error('Refusing misleading completeness, PDF parity or learner-readiness claims')
}
mkdirSync(dirname(output), {recursive:true})
writeFileSync(output, JSON.stringify(report,null,2)+'\n','utf8')
console.log('Partial six-section source-to-published candidate report:', output)
console.log('NOT a verified whole-specification inventory, educational sufficiency or student mastery.')
