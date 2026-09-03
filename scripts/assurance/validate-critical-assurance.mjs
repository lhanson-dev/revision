import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const defaultManifestPath = path.join(scriptDirectory, 'critical-assurance-manifest.json')
const suppressionPattern = /\b(?:describe|it|test)\.(?:skip|todo|only)\s*\(/g

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function isExecutableTest(filePath) {
  return /(?:\.test|\.spec)\.(?:[cm]?[jt]sx?)$/i.test(filePath)
}

export function validateCriticalAssurance({ root = process.cwd(), manifestPath = defaultManifestPath } = {}) {
  const manifest = readJson(manifestPath)
  if (manifest.schemaVersion !== 1) throw new Error(`Unsupported critical assurance manifest schema ${manifest.schemaVersion}`)
  if (!Array.isArray(manifest.protectedFiles) || manifest.protectedFiles.length === 0) {
    throw new Error('Critical assurance manifest must declare protected files.')
  }

  const errors = []
  const declaredControls = new Set()

  for (const entry of manifest.protectedFiles) {
    if (!entry?.path || !Array.isArray(entry.controls) || entry.controls.length === 0) {
      errors.push('Every protected assurance entry must declare a path and at least one control ID.')
      continue
    }

    entry.controls.forEach((control) => declaredControls.add(control))
    const absolutePath = path.join(root, entry.path)
    if (!existsSync(absolutePath)) {
      errors.push(`Critical assurance file is missing: ${entry.path}`)
      continue
    }

    const content = readFileSync(absolutePath, 'utf8')
    if (content.trim().length < 40) {
      errors.push(`Critical assurance file is unexpectedly empty/small: ${entry.path}`)
      continue
    }

    if (isExecutableTest(entry.path)) {
      const suppressions = [...content.matchAll(suppressionPattern)]
      if (suppressions.length > 0) {
        errors.push(`Critical assurance test contains skip/todo/only suppression: ${entry.path}`)
      }
    }
  }

  for (const controlId of manifest.minimumControlIds ?? []) {
    if (!declaredControls.has(controlId)) errors.push(`Critical assurance manifest no longer protects required control ${controlId}`)
  }

  const workflowPath = path.join(root, '.github/workflows/ci.yml')
  if (!existsSync(workflowPath)) {
    errors.push('Canonical Revision CI workflow is missing: .github/workflows/ci.yml')
  } else {
    const workflow = readFileSync(workflowPath, 'utf8')
    for (const snippet of manifest.requiredWorkflowSnippets ?? []) {
      if (!workflow.includes(snippet)) errors.push(`Revision CI no longer invokes required critical assurance: ${snippet}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Critical assurance integrity failed:\n- ${errors.join('\n- ')}`)
  }

  return {
    protectedFileCount: manifest.protectedFiles.length,
    protectedControlCount: declaredControls.size,
    workflowInvocationCount: (manifest.requiredWorkflowSnippets ?? []).length,
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  const result = validateCriticalAssurance()
  console.log(`Critical assurance integrity: ${result.protectedFileCount} protected files, ${result.protectedControlCount} controls, ${result.workflowInvocationCount} CI invocations verified.`)
}
