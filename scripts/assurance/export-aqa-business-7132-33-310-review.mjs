#!/usr/bin/env node
/** Run both independently bounded official-spec reviews against real paper packs.
 * Emits a deterministic source-section candidate report, never a coverage pass.
 * Usage: node scripts/assurance/export-aqa-business-7132-33-310-review.mjs [output.json]
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const dest = resolve(root, process.argv[2] ??
  'tmp/assurance/aqa-business-7132-33-310-source-CANDIDATE.json')
function run(test, marker) {
  const output=execFileSync('npm',['exec','--','vitest','run',test,'--reporter=dot'],
    {cwd:root,encoding:'utf8',maxBuffer:24*1024*1024,stdio:['inherit','pipe','inherit']})
  const hits=output.split(/\r?\n/).filter(line=>line.includes(marker))
  if(hits.length!==1)throw Error('Required source report marker missing/duplicated: '+marker)
  return JSON.parse(hits[0].slice(hits[0].indexOf(marker)+marker.length))
}
const a=run('scripts/assurance/aqa-business-7132-33-36-source-review.test.ts',
  'REVISION_BUSINESS_33_36_SOURCE_REVIEW=')
const b=run('scripts/assurance/aqa-business-7132-37-310-source-review.test.ts',
  'REVISION_BUSINESS_ALEVEL_SOURCE_REVIEW=')
if(a.officialSections!==42 || a.reviewedSections!==18 || a.candidateAtoms!==220
  || a.exactFounderUploadedPdfShaVerified!==false
  || a.sourceComplete!==false || a.mappedIndividualAtomEvidence!==false
  || a.teachingAndAssessmentAdequate!==false || a.authenticatedLearnerAcceptance!==false
  || b.sourceSections!==42 || b.reviewedInThisPackage!==18 || b.candidateSkills!==201
  || b.totalAqaSkillDenominatorVerified!==false || b.exactUploadedSourceHashVerified!==false
  || b.liveSkillAdequacyEstablished!==false || b.realLearnerAcceptanceEstablished!==false) {
  throw Error('Refusing unsafe course completeness or learner-mastery claim')
}
const sectionKeys=[...a.sections.map(r=>r.section_id),...b.sections.map(r=>r.section)]
if(sectionKeys.length!==36 || new Set(sectionKeys).size!==36) throw Error('Conflicting section scope')
const report={
  state:'OFFICIAL-VERSION 36-SECTION CANDIDATES; NOT VERIFIED COMPLETE ATOMS OR EXAM READINESS',
  source:'AQA Business 7132 v2.0 June 2023 REFERENCE_ONLY',
  sourceSections:42,
  reviewedCandidateSections:36,
  candidateSkills:421,
  verifiedWholeCourseDenominator:false,
  exactFounderUploadShaVerified:false,
  itemLevelEducationalAdequacy:'unverified',
  actualStudentAcceptance:'unverified',
  priorFirstSixSectionsSeperatePR741:true,
  sections33to36:a,
  sections37to310:b,
}
mkdirSync(dirname(dest),{recursive:true})
writeFileSync(dest,JSON.stringify(report,null,2)+'\n','utf8')
console.log('Candidate source-first Business §§3.3–3.10 report:',dest)
console.log('36 of 42 source sections; 421 *provisional* skills; ZERO course completion claim.')
