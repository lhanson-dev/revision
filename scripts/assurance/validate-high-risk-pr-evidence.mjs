import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const requiredSections = [
  { heading: 'Assurance invariants', minimumLength: 80 },
  { heading: 'Failure and abuse hypotheses', minimumLength: 80 },
  { heading: 'Adversarial review', minimumLength: 80 },
  { heading: 'Test sensitivity', minimumLength: 60 },
]

function arg(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function cleanEvidence(value) {
  return value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*[-*]\s*$/gm, '')
    .trim()
}

function section(body, heading) {
  const marker = `### ${heading}`
  const start = body.indexOf(marker)
  if (start < 0) return null
  const tail = body.slice(start + marker.length)
  const nextHeading = tail.search(/\n#{1,3}\s+/)
  return cleanEvidence(nextHeading >= 0 ? tail.slice(0, nextHeading) : tail)
}

export function validateHighRiskPrEvidence({ plan, event }) {
  if (!plan?.risk || !Number.isInteger(plan.risk.level)) throw new Error('Assurance plan risk level is missing or invalid.')
  if (plan.risk.level < 3) return { required: false, validatedSections: [] }

  if (!event?.pull_request) {
    return { required: false, validatedSections: [], reason: 'High-risk PR evidence is enforced on pull_request events; main push evidence is inherited from the governed PR.' }
  }

  const body = event.pull_request.body ?? ''
  const errors = []
  const validatedSections = []

  for (const requirement of requiredSections) {
    const value = section(body, requirement.heading)
    if (value === null) {
      errors.push(`Missing PR section: ### ${requirement.heading}`)
      continue
    }
    if (value.length < requirement.minimumLength) {
      errors.push(`PR section "${requirement.heading}" is too thin to provide inspectable high-risk assurance evidence.`)
      continue
    }
    if (/^(?:pending|tbd|n\/?a|none|not applicable)[\s.!-]*$/i.test(value)) {
      errors.push(`PR section "${requirement.heading}" contains placeholder evidence.`)
      continue
    }
    validatedSections.push(requirement.heading)
  }

  if (errors.length > 0) {
    throw new Error(`High-risk PR assurance evidence failed:\n- ${errors.join('\n- ')}`)
  }

  return { required: true, validatedSections }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  const planPath = arg('--plan') ?? 'assurance-plan.json'
  const eventPath = arg('--event') ?? process.env.GITHUB_EVENT_PATH
  if (!eventPath) throw new Error('GitHub event path is required.')
  const plan = JSON.parse(readFileSync(planPath, 'utf8'))
  const event = JSON.parse(readFileSync(eventPath, 'utf8'))
  const result = validateHighRiskPrEvidence({ plan, event })
  if (result.required) console.log(`High-risk PR evidence validated: ${result.validatedSections.join(', ')}.`)
  else console.log(result.reason ?? 'High-risk PR evidence not required for this risk level.')
}
