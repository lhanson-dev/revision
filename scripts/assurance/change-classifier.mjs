const riskLabels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' }

const highRiskPrefixes = [
  'src/services/auth/',
  'src/services/supabase/',
  'src/services/progress/',
  'src/services/planning/',
  'src/engine/evidence/',
  'src/engine/readiness/',
  'src/engine/planning/',
]

const highRiskFiles = new Set([
  'src/app/App.tsx',
  'src/app/PlannerRuntime.tsx',
  'src/app/navigation.ts',
])

const docsExtensions = ['.md', '.mdx']
const destructiveSql = /\b(drop\s+(table|schema|column)|truncate\s+table|delete\s+from|alter\s+table[\s\S]{0,120}\bdrop\b)\b/i

function isDocsOnly(files) {
  return files.length > 0 && files.every((file) => docsExtensions.some((extension) => file.path.endsWith(extension)))
}

function addDomain(domains, name) {
  if (!domains.includes(name)) domains.push(name)
}

export function classifyChange(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return {
      level: 3,
      label: riskLabels[3],
      reasons: ['No changed files could be determined; assurance escalated fail-safe.'],
      affectedDomains: ['path-to-live'],
    }
  }

  if (isDocsOnly(files)) {
    return {
      level: 1,
      label: riskLabels[1],
      reasons: ['All changed files are documentation/Markdown.'],
      affectedDomains: ['governance-documentation'],
    }
  }

  let level = 1
  const reasons = []
  const affectedDomains = []

  for (const file of files) {
    const path = file.path
    const patch = file.patch ?? ''

    if (path.startsWith('supabase/migrations/') && destructiveSql.test(patch)) {
      level = Math.max(level, 4)
      reasons.push(`${path}: destructive migration pattern requires critical release assurance.`)
      addDomain(affectedDomains, 'data-database')
      addDomain(affectedDomains, 'path-to-live')
      continue
    }

    if (path.startsWith('.github/workflows/')) {
      level = Math.max(level, 3)
      reasons.push(`${path}: CI/deployment path changed.`)
      addDomain(affectedDomains, 'path-to-live')
      continue
    }

    if (path.startsWith('supabase/')) {
      level = Math.max(level, 3)
      reasons.push(`${path}: database, RLS or protected service boundary changed.`)
      addDomain(affectedDomains, 'data-database')
      addDomain(affectedDomains, 'security-privacy')
      continue
    }

    if (path.startsWith('content/')) {
      level = Math.max(level, 3)
      reasons.push(`${path}: learner educational content changed.`)
      addDomain(affectedDomains, 'educational-content')
      continue
    }

    if (path === 'package.json' || path === 'package-lock.json') {
      level = Math.max(level, 3)
      reasons.push(`${path}: dependency/build contract changed.`)
      addDomain(affectedDomains, 'path-to-live')
      addDomain(affectedDomains, 'security-privacy')
      continue
    }

    if (path === 'vite.config.ts') {
      level = Math.max(level, 3)
      reasons.push(`${path}: production build/runtime configuration changed.`)
      addDomain(affectedDomains, 'path-to-live')
      continue
    }

    if (highRiskFiles.has(path) || highRiskPrefixes.some((prefix) => path.startsWith(prefix))) {
      level = Math.max(level, 3)
      reasons.push(`${path}: shared runtime, auth, persistence, evidence or planning layer changed.`)
      addDomain(affectedDomains, 'critical-journeys')
      if (/auth|supabase|services\/progress|services\/planning/.test(path)) addDomain(affectedDomains, 'security-privacy')
      continue
    }

    if (path.startsWith('tests/') || path.startsWith('scripts/assurance/')) {
      level = Math.max(level, 2)
      reasons.push(`${path}: assurance implementation changed.`)
      addDomain(affectedDomains, 'path-to-live')
      continue
    }

    if (path.startsWith('src/') || /\.(css|scss|html)$/.test(path)) {
      level = Math.max(level, 2)
      reasons.push(`${path}: bounded application behaviour changed.`)
      addDomain(affectedDomains, 'critical-journeys')
      continue
    }

    if (!docsExtensions.some((extension) => path.endsWith(extension))) {
      level = Math.max(level, 3)
      reasons.push(`${path}: unclassified non-documentation change escalated fail-safe.`)
      addDomain(affectedDomains, 'path-to-live')
    }
  }

  if (reasons.length === 0) {
    reasons.push('No executable change category matched; assurance retained at low risk.')
    addDomain(affectedDomains, 'governance-documentation')
  }

  return { level, label: riskLabels[level], reasons: [...new Set(reasons)], affectedDomains }
}

export function buildAssurancePlan({ files, baseSha, headSha, eventName }) {
  const risk = classifyChange(files)
  const required = {
    staticValidation: true,
    typecheckLintBuild: risk.level >= 2,
    unitTests: risk.level >= 2,
    integrationDatabaseSecurity: risk.level >= 3,
    targetedBrowser: risk.level >= 2,
    fullRelevantBrowserRegression: risk.level >= 3,
    responsiveAccessibility: risk.level >= 2,
    postDeploymentSmoke: risk.level >= 3,
    rollbackRecoveryReview: risk.level >= 4,
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    eventName,
    baseSha,
    headSha,
    risk,
    selectionMode: 'conservative-full',
    selectionPolicy: 'Classifier is evidence-only in v1. Existing CI suites remain mandatory while classification data is calibrated.',
    changedFiles: files.map(({ path }) => path),
    requiredAssurance: required,
    executedCiPolicy: {
      assurancePlanAndSecretScan: true,
      foundationQuality: true,
      databaseRlsProtectedService: true,
    },
  }
}
