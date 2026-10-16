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
  'src/app/planner-model.ts',
  'src/app/home-task.ts',
  'src/app/home-v3-model.ts',
  'src/app/plan-weekly-capacity.ts',
  'src/app/plan-weekly-capacity.test.ts',
  'src/app/PlanScreen.tsx',
  'src/app/PlanProgrammeOutlook.tsx',
  'src/app/PlannerHomeScreen.tsx',
  'src/app/navigation.ts',
])

const docsExtensions = ['.md', '.mdx']
// Only these governance/documentation paths are safe to shortcut. Markdown
// inside src, content, public, tests, config or unknown folders can be
// runtime/learner-facing material and must retain full assurance.
const documentRootFiles = new Set([
  'README.md',
  'INDEX.md',
  'AGENTS.md',
  'CLAUDE.md',
  'START_HERE.md',
  'AUTHORITY_HIERARCHY.md',
  'KNOWLEDGE_ARCHITECTURE.md',
  'MIGRATING_EXISTING_PROJECT.md',
])
const documentPrefixes = [
  '00-company-foundation/',
  '10-product-governance/',
  '20-brand-and-experience/',
  '30-marketing-governance/',
  '40-evidence-and-trust/',
  '50-engineering-standards/',
  '60-business-operations/',
  '70-ai-operating-system/',
  '80-company-workflows/',
  '90-governance-registers/',
  'docs/',
  'decisions/',
  'audits/',
  'research/',
  'archive/',
]
function isSafeDocumentationPath(path) {
  return docsExtensions.some((extension) => path.endsWith(extension))
    && (documentRootFiles.has(path) || documentPrefixes.some((prefix) => path.startsWith(prefix)))
}

const destructiveSql = /\b(drop\s+(table|schema|column)|truncate\s+table|delete\s+from|alter\s+table[\s\S]{0,120}\bdrop\b)\b/i

function isDocsOnly(files) {
  return files.length > 0 && files.every((file) => isSafeDocumentationPath(file.path))
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

    if (!isSafeDocumentationPath(path)) {
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
  // Only the proven documentation-only category may skip executable suites.
  // Unknown, mixed or executable changes continue to run the complete suite.
  const docsOnly = isDocsOnly(files)
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
    selectionMode: docsOnly ? 'docs-only' : 'conservative-full',
    selectionPolicy: docsOnly
      ? 'Approved governance/documentation Markdown-only change: retain secret scanning, database/service assurance and required gate checks; static/unit/build and Playwright browser jobs may be skipped.'
      : 'Conservative full CI for any executable, mixed or uncertain change. Unmapped paths fail safe.',
    changedFiles: files.map(({ path }) => path),
    requiredAssurance: required,
    executedCiPolicy: {
      assurancePlanAndSecretScan: true,
      foundationQuality: true,
      foundationStaticUnitBuild: !docsOnly,
      responsiveBrowser: !docsOnly,
      databaseRlsProtectedService: true,
    },
  }
}
