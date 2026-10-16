import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { learnTargetedBrowserSpecs, practiceTargetedBrowserSpecs } from './change-classifier.mjs'

const projects = new Set(['phone', 'tablet', 'desktop'])

export function browserCliArguments({ project, mode, fileList, shard = '1/1' }) {
  if (!projects.has(project)) throw new Error('Unknown browser project; refusing to select tests.')
  // Playwright is fullyParallel: these two desktop shards partition the same
  // tests that a single desktop project would execute, without excluding any.
  // Other projects cannot silently become partially sharded.
  const allowedShards = project === 'desktop' ? ['1/1', '1/2', '2/2'] : ['1/1']
  if (!allowedShards.includes(shard)) throw new Error(`Unrecognised ${project} browser shard: ${shard}`)
  const shardArgs = shard === '1/1' ? [] : [`--shard=${shard}`]
  if (mode === 'conservative-full') {
    if (fileList) throw new Error('Full regression must not carry a targeted file selection.')
    return ['test', `--project=${project}`, ...shardArgs]
  }
  const expected = mode === 'learn-targeted' ? learnTargetedBrowserSpecs
    : mode === 'practice-targeted' ? practiceTargetedBrowserSpecs
      : null
  if (!expected) throw new Error('Unsupported browser assurance selection mode.')
  const files = fileList?.split(',') ?? []
  if (files.join(',') !== expected.join(',') || files.length === 0) {
    throw new Error(`Browser selection does not exactly match the governed ${mode} journey coverage map.`)
  }
  for (const path of files) {
    if (!existsSync(path)) throw new Error(`Mapped browser spec is missing: ${path}`)
  }
  return ['test', ...files, `--project=${project}`, ...shardArgs]
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const project = process.argv[2]
  try {
    const args = browserCliArguments({
      project,
      mode: process.env.REVISION_BROWSER_SELECTION,
      fileList: process.env.REVISION_BROWSER_FILES || '',
      shard: process.env.REVISION_BROWSER_SHARD || '1/1',
    })
    const run = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', ...args], { stdio: 'inherit' })
    if (run.error) throw run.error
    process.exit(run.status ?? 1)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
