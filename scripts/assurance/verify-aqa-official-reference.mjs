#!/usr/bin/env node
// #698: verify exact AQA reference bytes without persisting or redistributing them.
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const MAX_PDF_BYTES = 16 * 1024 * 1024
const manifestUrl = new URL('./data/aqa-official-reference-manifest.json', import.meta.url)

export async function readReferenceManifest() {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))
  assertReferenceManifest(manifest)
  return manifest
}

export function assertReferenceManifest(manifest) {
  if (manifest?.schema_version !== 1 || !Array.isArray(manifest.sources) || manifest.sources.length !== 2) {
    throw new Error('Expected a version-one manifest for the two exact AQA references')
  }
  const expected = { 'business-7132': '7132', 'psychology-7182': '7182' }
  if (new Set(manifest.sources.map(source => source.id)).size !== 2) {
    throw new Error('Duplicate or missing reference identity')
  }
  for (const source of manifest.sources) {
    if (source.issuer !== 'AQA' || expected[source.id] !== source.specification_code ||
        source.source_use !== 'REFERENCE_ONLY' || source.allow_pdf_text_in_ai_generation !== false ||
        source.allow_pdf_commit !== false || !/^[a-f0-9]{64}$/.test(source.sha256) ||
        !Number.isInteger(source.pdf_pages) || source.pdf_pages < 1 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(source.version_date) || typeof source.version !== 'string') {
      throw new Error(`Invalid or unsafe reference record: ${source.id ?? 'unknown'}`)
    }
    const url = new URL(source.official_pdf_url)
    if (url.protocol !== 'https:' || url.hostname !== 'www.aqa.org.uk' ||
        !url.pathname.toLowerCase().endsWith('.pdf') || url.username || url.password) {
      throw new Error(`Unapproved PDF origin: ${source.id}`)
    }
  }
  return true
}

export function verifyReferenceBytes(source, input) {
  const bytes = Buffer.from(input)
  if (bytes.length === 0 || bytes.length > MAX_PDF_BYTES ||
      bytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error(`${source.id}: invalid PDF header or size`)
  }
  const actualSha256 = createHash('sha256').update(bytes).digest('hex')
  if (actualSha256 !== source.sha256) {
    throw new Error(`${source.id}: SHA-256 mismatch (expected ${source.sha256}, got ${actualSha256}); source version NOT verified`)
  }
  // Byte identity is not a PDF structural or educational adequacy review.
  return { id: source.id, verified: true, sha256: actualSha256, bytes: bytes.length,
    version: source.version, source_use: source.source_use,
    assurance: 'exact-reference-bytes-only' }
}

async function verifyLocal(source, path) {
  const info = await stat(path)
  if (!info.isFile() || info.size > MAX_PDF_BYTES) {
    throw new Error(`${source.id}: local PDF is missing or too large`)
  }
  return verifyReferenceBytes(source, await readFile(path))
}

async function verifyOfficial(source) {
  // Explicit opt-in only: never used during learner build or as CI network prerequisite.
  const response = await fetch(source.official_pdf_url, {
    headers: { Accept: 'application/pdf' },
    signal: AbortSignal.timeout(25000),
  })
  if (!response.ok || new URL(response.url).hostname !== 'www.aqa.org.uk') {
    throw new Error(`${source.id}: official source unavailable or redirected off approved host`)
  }
  if (Number(response.headers.get('content-length') ?? 0) > MAX_PDF_BYTES || !response.body) {
    throw new Error(`${source.id}: invalid or oversized HTTP body`)
  }
  const chunks = []
  let total = 0
  for await (const chunk of response.body) {
    total += chunk.byteLength
    if (total > MAX_PDF_BYTES) throw new Error(`${source.id}: PDF exceeds size cap`)
    chunks.push(Buffer.from(chunk))
  }
  return verifyReferenceBytes(source, Buffer.concat(chunks))
}

export async function main(args = process.argv.slice(2)) {
  const manifest = await readReferenceManifest()
  if (args.length === 1 && args[0] === '--list') {
    for (const source of manifest.sources) {
      console.log(JSON.stringify({ id: source.id, version: source.version,
        sha256: source.sha256, source_use: source.source_use,
        status: 'reference identity recorded; bytes not checked',
        official_pdf_url: source.official_pdf_url }))
    }
    return
  }
  if (args.length !== 2 || !['--local', '--official'].includes(args[0])) {
    throw new Error('Usage: --list | --local <source-id>:<file-path> | --official <source-id|all>')
  }
  const [mode, target] = args
  const sourceId = mode === '--local' ? target.slice(0, target.indexOf(':')) : target
  if (mode === '--local' && (!target.includes(':') || !target.slice(target.indexOf(':') + 1))) {
    throw new Error('Local syntax: --local business-7132:/path/to/file.pdf')
  }
  const sources = sourceId === 'all' && mode === '--official'
    ? manifest.sources : manifest.sources.filter(source => source.id === sourceId)
  if (sources.length === 0) throw new Error(`Unknown source id: ${sourceId}`)
  for (const source of sources) {
    const result = mode === '--local'
      ? await verifyLocal(source, target.slice(target.indexOf(':') + 1))
      : await verifyOfficial(source)
    console.log('REVISION_AQA_EXACT_SOURCE_VERIFIED=' + JSON.stringify(result))
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error('REVISION_AQA_REFERENCE_HOLD:', error.message)
    process.exitCode = 1
  })
}
