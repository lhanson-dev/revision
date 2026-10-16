import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { learnTargetedBrowserSpecs } from './change-classifier.mjs'

const projects = new Set(['phone', 'tablet', 'desktop'])

export function browserCliArguments({ project, mode, fileList }) {
  if (!projects.has(project)) throw new Error('Unknown browser project; refusing to select tests.')
  if (mode === 'conservative-full') {
    if (fileList) throw new Error('Full regression must not carry a targeted file selection.')
    return ['test', `--project=${project}`]
  }
  if (mode !== 'learn-targeted') throw new Error('Unsupported browser assurance selection mode.')
  const files = fileList?.split(',') ?? []
  if (files.join(',') !== learnTargetedBrowserSpecs.join(',') || files.length === 0) {
    throw new Error('Browser selection does not exactly match the governed Learn journey coverage map.')
  }
  for (const path of files) {
    if (!existsSync(path)) throw new Error(`Mapped browser spec is missing: ${path}`)
  }
  return ['test', ...files, `--project=${project}`]
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const project = process.argv[2]
  try {
    const args = browserCliArguments({
      project,
      mode: process.env.REVISION_BROWSER_SELECTION,
      fileList: process.env.REVISION_BROWSER_FILES || '',
    })
    const run = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', ...args], { stdio: 'inherit' })
    if (run.error) throw run.error
    process.exit(run.status ?? 1)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
