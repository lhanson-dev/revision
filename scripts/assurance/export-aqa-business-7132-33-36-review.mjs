#!/usr/bin/env node
/** Export 18-source-section Business candidate atoms with actual published-pack
 * section supply; never a full-source coverage score or education sign-off.
 * Usage: node scripts/assurance/export-aqa-business-7132-33-36-review.mjs [destination.json]
 */
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const dest = resolve(root, process.argv[2] ??
  'tmp/assurance/aqa-business-7132-33-36-source-CANDIDATE.json')
const out = execFileSync('npm', [
  'exec', '--', 'vitest', 'run',
  'scripts/assurance/aqa-business-7132-33-36-source-review.test.ts', '--reporter=dot',
], {cwd:root,encoding:'utf8',maxBuffer:24*1024*1024,stdio:['inherit','pipe','inherit']})
const marker = 'REVISION_BUSINESS_33_36_SOURCE_REVIEW='
const matches = out.split(/\r?\n/).filter(line => line.includes(marker))
if (matches.length !== 1) throw new Error('Missing unique independently executed review record')
const report = JSON.parse(matches[0].slice(matches[0].indexOf(marker) + marker.length))
if (report.officialSections !== 42 || report.reviewedSections !== 18
  || report.candidateAtoms !== 220 || report.exactFounderUploadedPdfShaVerified !== false
  || report.sourceComplete !== false || report.mappedIndividualAtomEvidence !== false
  || report.teachingAndAssessmentAdequate !== false
  || report.authenticatedLearnerAcceptance !== false
  || report.atomicCandidates.length !== 220 || report.sections.length !== 18
  || report.sections.some(row => row.perAtomSkillAssessmentValidated !== false)) {
  throw new Error('Unsafe or misleading source-completeness/learner-adequacy claim')
}
mkdirSync(dirname(dest), {recursive:true})
writeFileSync(dest, JSON.stringify(report,null,2)+'\n','utf8')
console.log('Incomplete, bounded Business source-review candidate:',dest)
console.log('18 of 42 sections; 220 provisional skills; NO full-course coverage or learner-mastery claim.')
