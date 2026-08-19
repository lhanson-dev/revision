import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const skippedSelfFiles = new Set([
  'scripts/assurance/scan-secrets.mjs',
  'scripts/assurance/scan-secrets.test.mjs',
])

const textExtensions = /\.(?:cjs|css|env|html|js|json|jsx|md|mjs|sql|ts|tsx|txt|yaml|yml)$/i

const directPatterns = [
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g],
  ['OpenAI-style API key', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['Supabase secret key', /\bsb_secret_[A-Za-z0-9_-]{20,}\b/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['Credential-bearing database URL', /\b(?:postgres(?:ql)?|mysql):\/\/[^\s:/]+:[^\s@/]+@[^\s]+/gi],
]

const privilegedLiteral = /\b(SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|GITHUB_[A-Z0-9_]*TOKEN|OPENAI_API_KEY)\b\s*[:=]\s*['"]([^'"\n]{12,})['"]/g
const jwtPattern = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8')
}

export function scanText(path, text) {
  const findings = []

  for (const [kind, pattern] of directPatterns) {
    pattern.lastIndex = 0
    if (pattern.test(text)) findings.push({ path, kind })
  }

  privilegedLiteral.lastIndex = 0
  let literal
  while ((literal = privilegedLiteral.exec(text)) !== null) {
    const value = literal[2]
    if (!/^\$\{|^process\.env|^Deno\.env|^<|^example|^placeholder/i.test(value)) {
      findings.push({ path, kind: `Literal privileged configuration: ${literal[1]}` })
    }
  }

  jwtPattern.lastIndex = 0
  let jwt
  while ((jwt = jwtPattern.exec(text)) !== null) {
    try {
      const payload = JSON.parse(decodeBase64Url(jwt[0].split('.')[1]))
      if (payload?.role === 'service_role') findings.push({ path, kind: 'Legacy Supabase service_role JWT' })
    } catch {
      // Ignore strings that only resemble JWTs.
    }
  }

  if (/^src\//.test(path) && !/\.(test|spec)\.[cm]?[jt]sx?$/.test(path) && /SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(text)) {
    findings.push({ path, kind: 'Privileged Supabase credential reference in browser/application source' })
  }

  return findings
}

export function scanRepository() {
  const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  const findings = []

  for (const path of tracked) {
    if (skippedSelfFiles.has(path) || !textExtensions.test(path)) continue
    let text
    try {
      text = readFileSync(path, 'utf8')
    } catch {
      continue
    }
    findings.push(...scanText(path, text))
  }

  return findings
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const findings = scanRepository()
  if (findings.length > 0) {
    console.error('Repository secret/config scan failed:')
    for (const finding of findings) console.error(`- ${finding.path}: ${finding.kind}`)
    process.exit(1)
  }
  console.log('Repository secret/config scan passed: no privileged credential pattern detected.')
}
