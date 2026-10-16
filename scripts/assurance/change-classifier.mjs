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

// Explicit, reviewable change-to-journey contract. Only Learn-local
// presentation files are eligible. Unknown, test, configuration, shared and
// cross-journey files must run the full browser suite.
export const learnTargetedSourceFiles = Object.freeze([
  'src/app/ui/learn/BlockLabel.tsx',
  'src/app/ui/learn/Comparison.tsx',
  'src/app/ui/learn/Example.tsx',
  'src/app/ui/learn/Explanation.tsx',
  'src/app/ui/learn/KeyIdea.tsx',
  'src/app/ui/learn/LearnBlock.tsx',
  'src/app/ui/learn/LearnPageLayout.tsx',
  'src/app/ui/learn/Misconception.tsx',
  'src/app/ui/learn/Quantitative.tsx',
  'src/app/ui/learn/Recap.tsx',
  'src/app/ui/learn/Relationship.tsx',
  'src/app/ui/learn/WorkedExample.tsx',
  'src/app/ui/learn/chart-geometry.ts',
  'src/app/ui/learn/layout-plan.ts',
])

// These tests include Learn content, course navigation, responsive layouts,
// accessibility, shared UX regressions and Founder-approved visual contracts.
// A changed file outside the list above invalidates this reduced selection.
export const learnTargetedBrowserSpecs = Object.freeze([
  'tests/e2e/accessibility.spec.ts',
  'tests/e2e/app-responsive.spec.ts',
  'tests/e2e/b7-final-acceptance.spec.ts',
  'tests/e2e/contextual-navigation.spec.ts',
  'tests/e2e/course-dark-theme.spec.ts',
  'tests/e2e/course-navigation-hierarchy.spec.ts',
  'tests/e2e/design-lab.spec.ts',
  'tests/e2e/horizontal-scroll.spec.ts',
  'tests/e2e/interface-system.spec.ts',
  'tests/e2e/interface-visual-regression.spec.ts',
  'tests/e2e/learn-active-trail-navigation.spec.ts',
  'tests/e2e/learn-blocks.spec.ts',
  'tests/e2e/learner-design-consistency.spec.ts',
  'tests/e2e/overlay-focus.spec.ts',
  'tests/e2e/site-theme-integrity.spec.ts',
  'tests/e2e/sitewide-content-canvas.spec.ts',
  'tests/e2e/status-contrast.spec.ts',
])

const learnTargetedSourceSet = new Set(learnTargetedSourceFiles)

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
  const learnChanges = Array.isArray(files) && files.filter(({ path }) => learnTargetedSourceSet.has(path))
  const learnTargeted = !docsOnly && learnChanges.length > 0
    && files.every(({ path }) => learnTargetedSourceSet.has(path) || isSafeDocumentationPath(path))
    && risk.level === 2
  const selectionMode = docsOnly ? 'docs-only' : learnTargeted ? 'learn-targeted' : 'conservative-full'
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
    selectionMode,
    selectionPolicy: docsOnly
      ? 'Approved governance/documentation Markdown-only change: retain secret scanning, database/service assurance and required gate checks; static/unit/build and Playwright browser jobs may be skipped.'
      : learnTargeted
        ? 'Known Learn-local presentation files only: run full static/unit/build and database/security assurance, and the mapped responsive Learn, accessibility, navigation and visual browser journeys.'
        : 'Conservative full CI for any executable, mixed or uncertain change. Unmapped paths fail safe.',
    changedFiles: files.map(({ path }) => path),
    selectedBrowserSpecs: learnTargeted ? [...learnTargetedBrowserSpecs] : [],
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
