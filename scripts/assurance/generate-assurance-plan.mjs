import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { buildAssurancePlan } from './change-classifier.mjs'

function arg(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const baseSha = arg('--base') || process.env.REVISION_BASE_SHA
const headSha = arg('--head') || process.env.REVISION_HEAD_SHA || 'HEAD'
const eventName = arg('--event') || process.env.REVISION_EVENT_NAME || 'unknown'
const output = arg('--output') || 'assurance-plan.json'

if (!baseSha || !headSha) {
  throw new Error('Assurance plan requires base and head SHAs.')
}

const names = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACDMRTUXB', baseSha, headSha], { encoding: 'utf8' })
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

const files = names.map((path) => {
  let patch = ''
  if (path.startsWith('supabase/migrations/')) {
    patch = execFileSync('git', ['diff', '--unified=0', baseSha, headSha, '--', path], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  }
  return { path, patch }
})

const plan = buildAssurancePlan({ files, baseSha, headSha, eventName })
writeFileSync(output, `${JSON.stringify(plan, null, 2)}\n`)

console.log(`Revision assurance plan: Level ${plan.risk.level} / ${plan.risk.label}`)
for (const reason of plan.risk.reasons) console.log(`- ${reason}`)
console.log(`Selection mode: ${plan.selectionMode}`)
