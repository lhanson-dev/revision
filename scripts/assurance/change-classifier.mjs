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

const dependencyFiles = new Set([
  'package.json',
  'package-lock.json',
])

const criticalAssuranceFiles = new Set([
  '.github/PULL_REQUEST_TEMPLATE.md',
  'scripts/assurance/critical-assurance-manifest.json',
  'scripts/assurance/validate-critical-assurance.mjs',
  'scripts/assurance/validate-high-risk-pr-evidence.mjs',
  'supabase/tests/database-assurance.test.sql',
  'supabase/tests/learner-plan-assurance.test.sql',
  'supabase/tests/starting-check-assurance.test.sql',
  'supabase/tests/student-first-use-assurance.test.sql',
  'tests/integration/supabase-persistence.test.ts',
  'tests/integration/edge-operations.test.ts',
  'tests/e2e/database-persistence.spec.ts',
  'tests/e2e/student-first-use.spec.ts',
])

const docsExtensions = ['.md', '.mdx']
const destructiveSql = /\b(drop\s+(table|schema|column)|truncate\s+table|delete\s+from|alter\s+table[\s\S]{0,120}\bdrop\b)\b/i

function isDocsOnly(files) {
  return files.length > 0 && files.every((file) =>
    docsExtensions.some((extension) => file.path.endsWith(extension))
      && !criticalAssuranceFiles.has(file.path))
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
      addDomain(affectedDomains, 'assurance-integrity')
      continue
    }

    if (criticalAssuranceFiles.has(path) || path.startsWith('scripts/assurance/')) {
      level = Math.max(level, 3)
      reasons.push(`${path}: critical assurance or release-safety implementation changed.`)
      addDomain(affectedDomains, 'path-to-live')
      addDomain(affectedDomains, 'assurance-integrity')
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

    if (dependencyFiles.has(path)) {
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

    if (path.startsWith('tests/')) {
      level = Math.max(level, 2)
      reasons.push(`${path}: non-critical assurance implementation changed.`)
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
  const dependencyChanged = files.some((file) => dependencyFiles.has(file.path))
  const required = {
    staticValidation: true,
    typecheckLintBuild: risk.level >= 2,
    unitTests: risk.level >= 2,
    integrationDatabaseSecurity: risk.level >= 3,
    targetedBrowser: risk.level >= 2,
    fullRelevantBrowserRegression: risk.level >= 3,
    responsiveAccessibility: risk.level >= 2,
    assuranceContract: risk.level >= 3,
    adversarialReview: risk.level >= 3,
    testSensitivityEvidence: risk.level >= 3,
    criticalAssuranceIntegrity: true,
    independentSecurityAnalysis: risk.level >= 3,
    dependencyVulnerabilityAnalysis: dependencyChanged,
    postDeploymentSmoke: risk.level >= 3,
    rollbackRecoveryReview: risk.level >= 4,
  }

  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    eventName,
    baseSha,
    headSha,
    risk,
    selectionMode: 'conservative-full',
    selectionPolicy: 'Existing Revision CI suites remain mandatory while selective execution is separately calibrated; new adversarial/security controls apply only to Level 3/4 changes, and dependency vulnerability analysis runs only when dependency manifests or lockfiles change.',
    changedFiles: files.map(({ path }) => path),
    requiredAssurance: required,
    executedCiPolicy: {
      assurancePlanAndSecretScan: true,
      criticalAssuranceIntegrity: true,
      highRiskPrEvidence: risk.level >= 3,
      independentSecurityAnalysisOnPullRequest: risk.level >= 3,
      dependencyVulnerabilityAnalysisOnChange: dependencyChanged,
      foundationQuality: true,
      databaseRlsProtectedService: true,
    },
  }
}
