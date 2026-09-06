import {
  foundationDiscoveredSourceSchema,
  foundationStructuredEvidenceSchema,
  type FoundationCompilationWorkers,
  type FoundationCurriculumRequirementInput,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import { assertFoundationSourceUniverse } from './foundation-source-universe'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
} from './source-seeds/aqa-a-level-business-7132-2027-source-universe'

export const AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS = {
  formulaeKeyData: 'https://filestore.aqa.org.uk/resources/business/AQA-7131-7132-FORMULAE.PDF',
  specificationUpdates2023: 'https://filestore.aqa.org.uk/resources/business/AQA-7131-7132-SPEC-UPDATES.PDF',
} as const

const formulaSourceId = 'aqa-7131-7132-formulae-key-data'

const quantitativeAlignmentByRequirement: Record<string, string[]> = {
  'aqa-3-1-2': [
    'Calculate market capitalisation as number of issued shares multiplied by current share price.',
  ],
  'aqa-3-4-1': [
    'Calculate added value as sales revenue minus the costs of bought-in goods and services.',
  ],
  'aqa-3-5-1': [
    'Calculate return on investment (%) as profit from the investment divided by cost of the investment, multiplied by 100.',
  ],
  'aqa-3-5-2': [
    'Calculate gross profit as revenue minus cost of sales; operating profit as gross profit minus operating expenses; and profit for the year as operating profit plus profit from other activities minus net finance costs and tax.',
    'Calculate gross profit margin (%) as gross profit divided by revenue multiplied by 100; operating profit margin (%) as operating profit divided by revenue multiplied by 100; and profit for year margin (%) as profit for the year divided by revenue multiplied by 100.',
    'Use the AQA recommended variance convention: variance equals budgeted figure minus actual figure, then interpret favourable or adverse meaning from the business context.',
  ],
  'aqa-3-6-2': [
    'Use the AQA recommended labour turnover (%) presentation: number of staff leaving divided by number of staff employed by the business, multiplied by 100. Alternative formulae may be valid when used appropriately and supported by the data supplied.',
  ],
}

function success<T>(execution: Extract<FoundationWorkerExecution<T>, { status: 'success' }>, output: T): FoundationWorkerExecution<T> {
  return { ...execution, output }
}

function failure(stage: string, error: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `aqa_7132_source_universe:${stage}:${error instanceof Error ? error.message : String(error)}`,
    provenance: {
      id: `aqa-7132-source-universe-${stage}-failed`,
      contextId: `deterministic-aqa-7132-source-universe:${stage}`,
      contractVersion: '1',
      provider: 'revision-deterministic-source-universe',
    },
  }
}

async function assertPdf(fetchImpl: typeof fetch, url: string) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'Revision-Foundation-Source-Universe/1.0' } })
  if (!response.ok) throw new Error(`http_${response.status}:${url}`)
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.includes('pdf')) throw new Error(`expected_pdf:${url}`)
  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0) throw new Error(`empty_pdf:${url}`)
}

function enrichRequirements(requirements: FoundationCurriculumRequirementInput[]) {
  return requirements.map((requirement) => {
    const quantitativeFacts = quantitativeAlignmentByRequirement[requirement.requirementId] ?? []
    const criticalPathFact = requirement.requirementId === 'aqa-3-10-3'
      ? ['Identify the critical path as the longest-duration start-to-finish route through the network; it determines the shortest possible project completion time, with zero total float as a related property of critical activities.']
      : []
    if (quantitativeFacts.length === 0 && criticalPathFact.length === 0) return requirement
    return {
      ...requirement,
      skillsOrKnowledge: [...requirement.skillsOrKnowledge, ...quantitativeFacts, ...criticalPathFact],
      sourceRefs: quantitativeFacts.length > 0
        ? [...new Set([...requirement.sourceRefs, formulaSourceId])]
        : requirement.sourceRefs,
    }
  })
}

export function withAqa7132SourceUniverseGuard(
  workers: FoundationCompilationWorkers,
  fetchImpl: typeof fetch = fetch,
): FoundationCompilationWorkers {
  return {
    ...workers,
    async discoverSources(input) {
      const execution = await workers.discoverSources(input)
      if (execution.status !== 'success') return execution
      try {
        await Promise.all([
          assertPdf(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.formulaeKeyData),
          assertPdf(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.specificationUpdates2023),
        ])
        const existing = foundationDiscoveredSourceSchema.array().parse(execution.output)
        return success(execution, foundationDiscoveredSourceSchema.array().parse([
          ...existing,
          {
            id: formulaSourceId,
            url: AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.formulaeKeyData,
            title: 'AQA AS/A-level Business 7131/7132 Formulae and key data',
            issuer: 'AQA',
            sourceType: 'quantitative_or_skills_annex',
            educationalRole: ['reference-only quantitative truth', 'formula/convention challenge source'],
            versionOrDate: 'revised 09 June 2023; runtime preflight required',
          },
          {
            id: 'aqa-7131-7132-specification-updates-2023',
            url: AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.specificationUpdates2023,
            title: 'AQA AS/A-level Business specification updates for teaching from September 2023',
            issuer: 'AQA',
            sourceType: 'amendment_or_notice',
            educationalRole: ['reference-only source-universe currency challenge'],
            versionOrDate: 'March 2023; runtime preflight required',
          },
        ]))
      } catch (error) {
        return failure('discovery', error)
      }
    },
    async resolveStructuredEvidence(input) {
      const execution = await workers.resolveStructuredEvidence(input)
      if (execution.status !== 'success') return execution
      try {
        const evidence = foundationStructuredEvidenceSchema.parse(execution.output)
        return success(execution, foundationStructuredEvidenceSchema.parse({
          ...evidence,
          curriculumRequirements: enrichRequirements(evidence.curriculumRequirements),
        }))
      } catch (error) {
        return failure('structured-evidence', error)
      }
    },
    async compileCoverage(input) {
      try {
        assertFoundationSourceUniverse({
          profileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
          requirements: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
          sourceEvidence: input.sourceLicenceRegister.sources.map((source) => ({
            id: source.id,
            issuer: source.issuer,
            sourceType: source.sourceType,
            useClass: source.useClass,
          })),
        })
      } catch (error) {
        return failure('coverage', error)
      }
      return workers.compileCoverage(input)
    },
  }
}
