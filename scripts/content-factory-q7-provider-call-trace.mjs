import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { classifyProviderInstructions } from './content-factory-q7-evidence-lib.mjs'

const traceFile = process.env.CONTENT_FACTORY_Q7_TRACE_FILE
const originalFetch = globalThis.fetch?.bind(globalThis)

if (traceFile && originalFetch) {
  mkdirSync(dirname(traceFile), { recursive: true })
  globalThis.fetch = async (input, init) => {
    try {
      if (typeof init?.body === 'string') {
        const body = JSON.parse(init.body)
        const instructions = typeof body.instructions === 'string' ? body.instructions : ''
        if (instructions.includes('You are a bounded worker inside Revision Content Factory v2.')) {
          const payload = typeof body.input === 'string' ? JSON.parse(body.input) : undefined
          const jobId = payload?.jobId
          if (typeof jobId === 'string' && jobId.startsWith('q7-')) {
            const event = {
              recordedAt: new Date().toISOString(),
              jobId,
              requestName: body.text?.format?.name ?? null,
              callKind: classifyProviderInstructions(instructions),
            }
            appendFileSync(traceFile, `${JSON.stringify(event)}\n`, 'utf8')
          }
        }
      }
    } catch {
      // Evidence tracing must never mutate provider request behaviour. Any missing
      // or malformed trace is detected by the candidate-aware normalizer.
    }
    return originalFetch(input, init)
  }
}
