import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const OUT='.artifacts/content-factory-business-subject-foundation-v08-reassurance'
const child=spawnSync(process.execPath,['scripts/assurance/business-subject-foundation-v08-t8-remediation-reassurance.mjs'],{stdio:'inherit',env:process.env})
if(child.error)throw child.error
if(child.status!==0)process.exit(child.status??1)
let receipt
try{receipt=JSON.parse(await readFile(`${OUT}/reassurance-receipt.json`,'utf8'))}catch{throw new Error('v0.8 reassurance ended without a retained final receipt; cost/provider pause is not assurance success')}
if(receipt.status!=='complete'||receipt.finalDecision!=='pass')throw new Error(`v0.8 reassurance not passed: ${JSON.stringify({status:receipt.status,finalDecision:receipt.finalDecision,nextGate:receipt.nextGate})}`)
console.log(JSON.stringify({status:'pass',candidateFingerprint:receipt.candidateFingerprint,observedSpendUsd:receipt.observedSpendUsd,nextGate:receipt.nextGate},null,2))
