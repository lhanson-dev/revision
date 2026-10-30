#!/usr/bin/env node
/**
 * #698 — export official-version source-first Business 7132 checks alongside
 * SECTION-level published bank supply candidates. This is not an adequate
 * teaching/practice crosswalk or a verified atomic denominator.
 *
 * Usage: node scripts/assurance/export-aqa-business-7132-source-baseline.mjs [destination.json]
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const source = JSON.parse(readFileSync(resolve(root,
  'scripts/assurance/data/aqa-business-7132-official-source-baseline.json'), 'utf8'))
const output = resolve(root, process.argv[2] ??
  'tmp/assurance/aqa-7132-source-first-checkpoints-CANDIDATE.json')
const stdout = execFileSync('npm', [
  'exec', '--', 'vitest', 'run',
  'scripts/assurance/aqa-business-7132-source-baseline.test.ts',
  '--reporter=dot',
], {cwd: root, encoding: 'utf8', maxBuffer: 24 * 1024 * 1024,
  stdio: ['inherit', 'pipe', 'inherit']})
const marker = 'REVISION_BUSINESS_SOURCE_FIRST_BASELINE='
const records = stdout.split(/\r?\n/).filter(line => line.includes(marker))
if (records.length !== 1) throw new Error('Expected exactly one deterministic source review record')
const report = JSON.parse(records[0].slice(records[0].indexOf(marker) + marker.length))
if (report.officialVersion !== source.version || report.exactFounderUploadedPdfShaVerified !== false
  || report.independentlySourceReviewedSections !== 42
  || report.sourceFirstCheckpointsNeedingFullAtomicDecomposition !== 194
  || report.allAdequacyAndLiveAcceptanceUnverified !== true
  || report.sections?.length !== 42) {
  throw new Error('Refusing to write a completeness, source-hash or adequacy claim')
}
const bySection = new Map(report.sections.map(section => [section.section_id, section]))
const checks = source.sections.flatMap(section => section.checkpoints.map(checkpoint => ({
  ...checkpoint,
  sourceLocator: `§${section.section_id}, printed p.${section.printed_page}`,
  scope: section.qualification_scope,
  // Section-level candidate supply is NOT evidence of this checkpoint.
  sectionSupplyCandidatesOnly: bySection.get(section.section_id) ?? null,
  exactCheckpointMappedLearnBlock: null,
  exactCheckpointValidatedPracticeId: null,
  exactCheckpointExamMarkingEvidence: null,
  sourceAtomicity: 'not-yet-complete',
  educationalAdequacy: 'unverified',
  studentLiveAcceptance: 'unverified',
})))
if (checks.length !== 194 || checks.some(c => c.educationalAdequacy !== 'unverified'
  || c.exactCheckpointValidatedPracticeId !== null || c.studentLiveAcceptance !== 'unverified')) {
  throw new Error('Unexpected source-first checkpoint evidence or count')
}
const full = {
  warning: 'PARTIAL OFFICIAL-VERSION SOURCE-FIRST CHECKPOINTS; NOT FULLY ATOMIC AND NOT PDF-HASH VERIFIED',
  sourceVersion: source.version,
  expectedUserPdfSha256: source.founder_upload_expected_sha256,
  userPdfByteParityVerified: false,
  existingLegacyKeywordsAreNotPasses: true,
  summary: {
    officialSections: source.sections.length,
    sourceFirstReviewCheckpoints: checks.length,
    annexSkills: source.annex_quantitative.length,
    assessmentObjectives: source.assessment_objectives.length,
    aLevelPapers: source.a_level_exam_papers.length,
    crosscuttingTopics: source.cross_cutting.length,
    legacyKeywordListItems: report.historicKeywordMatchedNamedItems,
    adequateRequirements: 'not-established',
  },
  checklist: checks,
  annex: source.annex_quantitative,
  assessmentObjectives: source.assessment_objectives,
  aLevelPapers: source.a_level_exam_papers,
  crosscutting: source.cross_cutting,
}
mkdirSync(dirname(output), {recursive: true})
writeFileSync(output, JSON.stringify(full, null, 2) + '\n', 'utf8')
console.log('Source-first candidate checkpoint crosswalk:', output)
console.log(JSON.stringify(full.summary))
console.log('NOT complete curriculum assurance or independent learner acceptance.')
