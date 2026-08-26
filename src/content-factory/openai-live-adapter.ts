import { z } from 'zod'
import {
  courseKnowledgeModelSchema,
  questionFamilySchema,
} from './schema'
import {
  fingerprintValue,
  type IntakeToKnowledgeModelWorkers,
  type WorkerExecution,
} from './intake-to-knowledge-model'
import {
  executableLearningBlueprintSchema,
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
  type LearningPracticeWorkers,
} from './learning-and-practice'
import {
  assessmentItemWorkerOutputSchema,
  executableAssessmentBlueprintSchema,
  markingPackWorkerOutputSchema,
  type AssessmentAndMarkingWorkers,
} from './assessment-and-marking'
import {
  independentReviewFindingSchema,
  remediationWorkerOutputSchema,
  type AssuranceAndRemediationWorkers,
} from './assurance-and-remediation'

const independentReviewProviderFindingSchema = independentReviewFindingSchema.omit({ workUnitId: true })

const independentReviewWorkerOutputSchema = z.object({
  reviewedCommit: z.string().regex(/^[0-9a-f]{40}$/),
  contentFingerprint: z.string().min(1),
  decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
  findings: z.array(independentReviewProviderFindingSchema).default([]),
})

const questionFamilyWorkerOutputSchema = z.object({
  questionFamilies: z.array(questionFamilySchema).min(1),
})

const assessmentItemProviderOutputSchema = assessmentItemWorkerOutputSchema.omit({
  componentId: true,
  questionFamilyId: true,
  requirementIds: true,
  format: true,
  maxMark: true,
})

export interface OpenAIModelRoute {
  model: string
  inputUsdPerMillion: number
  cachedInputUsdPerMillion: number
  outputUsdPerMillion: number
  cacheWriteMultiplier?: number
  longContextThresholdTokens?: number
  longContextInputMultiplier?: number
  longContextOutputMultiplier?: number
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  maxOutputTokens?: number
}

export interface OpenAIContentFactoryAdapterConfig {
  apiKey: string
  generation: OpenAIModelRoute
  independentReview: OpenAIModelRoute
  maxSpendUsd?: number
  endpoint?: string
  maxRetries?: number
  fetchImpl?: typeof fetch
  sleep?: (milliseconds: number) => Promise<void>
  resolveArtifactRef?: (value: unknown) => string | undefined
  questionFamilyPolicies?: Record<string, {
    title: string
    componentId: string
    maxMark: number
    assessmentObjectiveIds: string[]
    responseShape: string
    contextRequired: boolean
  }>
  assessmentItemPolicies?: Record<string, {
    requirementIds: string[]
    maxMark: number
    format: 'written_question' | 'case_question' | 'calculation' | 'mixed'
  }>
}

type RouteKind = 'generation' | 'independent_review'

type ResponseUsage = {
  input_tokens?: number
  output_tokens?: number
  input_tokens_details?: {
    cached_tokens?: number
    cache_write_tokens?: number
  }
}

type ResponsesApiBody = {
  status?: string
  output_text?: string
  output?: Array<{
    type?: string
    content?: Array<{ type?: string; text?: string; refusal?: string }>
  }>
  usage?: ResponseUsage
  error?: { message?: string }
}

function compactJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const converted = z.toJSONSchema(schema) as Record<string, unknown>
  delete converted.$schema
  return converted
}

function sanitizedName(workerId: string) {
  return workerId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64)
}

function outputText(body: ResponsesApiBody) {
  if (typeof body.output_text === 'string' && body.output_text.trim()) return body.output_text
  const chunks: string[] = []
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'refusal' && content.refusal) throw new Error(`Provider refusal: ${content.refusal}`)
      if (content.type === 'output_text' && typeof content.text === 'string') chunks.push(content.text)
    }
  }
  if (chunks.length === 0) throw new Error('OpenAI response contained no structured output text')
  return chunks.join('')
}

function usageCost(usage: ResponseUsage | undefined, route: OpenAIModelRoute) {
  if (!usage) return undefined
  const inputTokens = Math.max(0, usage.input_tokens ?? 0)
  const outputTokens = Math.max(0, usage.output_tokens ?? 0)
  const cachedTokens = Math.min(inputTokens, Math.max(0, usage.input_tokens_details?.cached_tokens ?? 0))
  const cacheWriteTokens = Math.min(inputTokens - cachedTokens, Math.max(0, usage.input_tokens_details?.cache_write_tokens ?? 0))
  const uncachedTokens = inputTokens - cachedTokens - cacheWriteTokens
  const isLongContext = inputTokens > (route.longContextThresholdTokens ?? 272_000)
  const inputMultiplier = isLongContext ? (route.longContextInputMultiplier ?? 2) : 1
  const outputMultiplier = isLongContext ? (route.longContextOutputMultiplier ?? 1.5) : 1
  const cacheWriteMultiplier = route.cacheWriteMultiplier ?? 1.25
  const cost = (
    uncachedTokens * route.inputUsdPerMillion * inputMultiplier
    + cachedTokens * route.cachedInputUsdPerMillion * inputMultiplier
    + cacheWriteTokens * route.inputUsdPerMillion * inputMultiplier * cacheWriteMultiplier
    + outputTokens * route.outputUsdPerMillion * outputMultiplier
  ) / 1_000_000
  return Number(cost.toFixed(8))
}

function estimateMaxCallCost(requestBody: unknown, route: OpenAIModelRoute) {
  // Deliberately conservative: structured JSON commonly tokenises more efficiently than
  // three characters/token, so using three avoids relying on optimistic estimates.
  const estimatedInputTokens = Math.ceil(JSON.stringify(requestBody).length / 3)
  const maxOutputTokens = route.maxOutputTokens ?? 8_000
  const isLongContext = estimatedInputTokens > (route.longContextThresholdTokens ?? 272_000)
  const inputMultiplier = isLongContext ? (route.longContextInputMultiplier ?? 2) : 1
  const outputMultiplier = isLongContext ? (route.longContextOutputMultiplier ?? 1.5) : 1
  const conservativeInputRate = route.inputUsdPerMillion * Math.max(1, route.cacheWriteMultiplier ?? 1.25)
  return Number((
    estimatedInputTokens * conservativeInputRate * inputMultiplier
    + maxOutputTokens * route.outputUsdPerMillion * outputMultiplier
  ) / 1_000_000)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown provider error'
}

function defaultSleep(milliseconds: number) {
  return new Promise<void>((resolve) => globalThis.setTimeout(resolve, milliseconds))
}

export class OpenAIStructuredWorkerClient {
  private readonly endpoint: string
  private readonly maxRetries: number
  private readonly fetchImpl: typeof fetch
  private readonly sleep: (milliseconds: number) => Promise<void>
  private readonly maxSpendUsd?: number
  private budgetConsumedUsd = 0

  constructor(private readonly config: OpenAIContentFactoryAdapterConfig) {
    if (!config.apiKey.trim()) throw new Error('OpenAI API key is required for the live Content Factory adapter')
    if (config.maxSpendUsd !== undefined && (!Number.isFinite(config.maxSpendUsd) || config.maxSpendUsd <= 0)) {
      throw new Error('OpenAI live Content Factory maxSpendUsd must be a positive finite number')
    }
    this.endpoint = config.endpoint ?? 'https://api.openai.com/v1/responses'
    this.maxRetries = config.maxRetries ?? 2
    this.fetchImpl = config.fetchImpl ?? fetch
    this.sleep = config.sleep ?? defaultSleep
    this.maxSpendUsd = config.maxSpendUsd
  }

  budgetSnapshot() {
    return { maxSpendUsd: this.maxSpendUsd, conservativeConsumedUsd: Number(this.budgetConsumedUsd.toFixed(8)) }
  }

  async run(input: {
    workerId: string
    contractVersion: string
    routeKind: RouteKind
    outputSchema: z.ZodType
    instructions: string
    payload: unknown
  }): Promise<WorkerExecution<unknown>> {
    const route = input.routeKind === 'independent_review' ? this.config.independentReview : this.config.generation
    const runId = `${input.workerId}-${globalThis.crypto.randomUUID()}`
    const contextId = `openai-${input.workerId}-${globalThis.crypto.randomUUID()}`
    let retryCount = 0

    const requestBody = {
      model: route.model,
      store: false,
      prompt_cache_options: { mode: 'explicit' },
      reasoning: { context: 'current_turn', effort: route.reasoningEffort ?? 'medium' },
      max_output_tokens: route.maxOutputTokens ?? 8_000,
      instructions: [
        'You are a bounded worker inside Revision Content Factory v2.',
        'Use only the structured facts supplied in the payload. Do not browse, quote or reconstruct awarding-body source prose.',
        'Never claim that Revision-authored content is official, endorsed, examiner-produced or human-calibrated.',
        'Return only data matching the requested JSON schema. Keep identifiers lowercase and machine-safe.',
        input.instructions,
      ].join('\n'),
      input: JSON.stringify(input.payload),
      text: {
        format: {
          type: 'json_schema',
          name: sanitizedName(input.workerId),
          strict: false,
          schema: compactJsonSchema(input.outputSchema),
        },
      },
    }
    const conservativeAttemptCostUsd = estimateMaxCallCost(requestBody, route)

    while (retryCount <= this.maxRetries) {
      if (this.maxSpendUsd !== undefined && this.budgetConsumedUsd + conservativeAttemptCostUsd > this.maxSpendUsd) {
        return {
          status: 'infrastructure_failure',
          error: `content_factory_spend_ceiling_reached: refusing ${input.workerId}; conservative consumed $${this.budgetConsumedUsd.toFixed(4)} + next-call reserve $${conservativeAttemptCostUsd.toFixed(4)} exceeds $${this.maxSpendUsd.toFixed(2)} ceiling`,
          provenance: { id: runId, contextId, contractVersion: input.contractVersion, provider: 'openai', model: route.model, retryCount },
        }
      }

      try {
        const response = await this.fetchImpl(this.endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        let body: ResponsesApiBody
        try {
          body = await response.json() as ResponsesApiBody
        } catch {
          // A request was sent but provider usage is unknowable. Reserve the conservative
          // estimate so repeated malformed/infrastructure responses cannot bypass the cap.
          this.budgetConsumedUsd += conservativeAttemptCostUsd
          throw new Error(`OpenAI returned non-JSON response with HTTP ${response.status}`)
        }

        const observedCost = usageCost(body.usage, route)
        this.budgetConsumedUsd += observedCost ?? conservativeAttemptCostUsd

        if (!response.ok) {
          const providerMessage = body.error?.message ? `: ${body.error.message.slice(0, 300)}` : ''
          const retryable = response.status === 429 || response.status >= 500
          if (retryable && retryCount < this.maxRetries) {
            retryCount += 1
            await this.sleep(Math.min(2_000, 250 * 2 ** retryCount))
            continue
          }
          return {
            status: retryable ? 'infrastructure_failure' : 'failure',
            error: `OpenAI request failed with HTTP ${response.status}${providerMessage}`,
            provenance: { id: runId, contextId, contractVersion: input.contractVersion, provider: 'openai', model: route.model, retryCount, usageCost: observedCost },
          }
        }

        if (body.status && body.status !== 'completed') {
          return {
            status: 'infrastructure_failure',
            error: `OpenAI response status was ${body.status}`,
            provenance: { id: runId, contextId, contractVersion: input.contractVersion, provider: 'openai', model: route.model, retryCount, usageCost: observedCost },
          }
        }

        const parsedJson = JSON.parse(outputText(body)) as unknown
        const output = input.outputSchema.parse(parsedJson)
        return {
          status: 'success',
          output,
          provenance: {
            id: runId,
            contextId,
            contractVersion: input.contractVersion,
            provider: 'openai',
            model: route.model,
            retryCount,
            usageCost: observedCost,
          },
        }
      } catch (error) {
        if (retryCount < this.maxRetries) {
          retryCount += 1
          await this.sleep(Math.min(2_000, 250 * 2 ** retryCount))
          continue
        }
        return {
          status: 'infrastructure_failure',
          error: errorMessage(error),
          provenance: { id: runId, contextId, contractVersion: input.contractVersion, provider: 'openai', model: route.model, retryCount },
        }
      }
    }

    return {
      status: 'infrastructure_failure',
      error: 'OpenAI retry loop exhausted unexpectedly',
      provenance: { id: runId, contextId, contractVersion: input.contractVersion, provider: 'openai', model: route.model, retryCount },
    }
  }
}

function downgradeSuccess(execution: WorkerExecution<unknown>, error: string): WorkerExecution<unknown> {
  if (execution.status !== 'success') return execution
  return { status: 'failure', error, provenance: execution.provenance }
}

function sorted(values: string[]) {
  return [...values].sort()
}

function sameSet(left: string[], right: string[]) {
  const a = sorted([...new Set(left)])
  const b = sorted([...new Set(right)])
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function reviewWorkUnitId(value: unknown) {
  if (typeof value !== 'object' || value === null) return undefined
  const workUnitId = (value as { workUnitId?: unknown }).workUnitId
  return typeof workUnitId === 'string' && workUnitId.length > 0 ? workUnitId : undefined
}

function reviewArtifactIndex(input: Parameters<AssuranceAndRemediationWorkers['independentReview']>[0], resolver?: (value: unknown) => string | undefined) {
  if (!resolver) return []
  const entries: Array<{ artifactRef: string; artifactType: string; workUnitId?: string; value: unknown }> = []
  const add = (artifactType: string, value: unknown, workUnitId?: string) => {
    const artifactRef = resolver(value)
    if (artifactRef) entries.push({ artifactRef, artifactType, ...(workUnitId ? { workUnitId } : {}), value })
  }
  add('board_alignment', input.boardAlignment)
  add('coverage_map', input.coverageMap)
  add('course_knowledge_model', input.courseKnowledgeModel)
  add('learning_blueprint', input.learningBlueprint)
  add('assessment_blueprint', input.assessmentBlueprint)
  input.questionFamilies.forEach((value) => add('question_family', value))
  input.learningArtifacts.forEach((value) => add('learning', value, reviewWorkUnitId(value)))
  input.practiceArtifacts.forEach((value) => add('practice', value, reviewWorkUnitId(value)))
  input.assessmentItems.forEach((value) => add('assessment_item', value))
  input.markingPacks.forEach((value) => add('marking_pack', value))
  return entries
}

export type OpenAIModelAssistedWorkers = Pick<IntakeToKnowledgeModelWorkers, 'compileKnowledgeModel'>
  & LearningPracticeWorkers
  & AssessmentAndMarkingWorkers
  & AssuranceAndRemediationWorkers

export function createOpenAIModelAssistedWorkers(config: OpenAIContentFactoryAdapterConfig): OpenAIModelAssistedWorkers {
  const client = new OpenAIStructuredWorkerClient(config)

  return {
    async compileKnowledgeModel(input) {
      const fingerprint = await fingerprintValue({
        jobId: input.jobId,
        boardAlignmentFingerprint: input.boardAlignment.fingerprint,
        requirements: input.requirements,
      })
      const execution = await client.run({
        workerId: 'content-factory.course-knowledge-model',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: courseKnowledgeModelSchema,
        instructions: 'Build a compact but complete reusable subject knowledge model. Set schemaVersion=1, jobId exactly as supplied and fingerprint exactly to requiredFingerprint. Every curriculum requirement must be represented by at least one node whose id is exactly that requirementId. Use only permitted sourceRefs already attached to that requirement. Add formulas only where genuinely applicable; add misconceptions and varied application contexts. Board-alignment refs may only use IDs present in the supplied Board Alignment.',
        payload: { ...input, requiredFingerprint: fingerprint },
      })
      if (execution.status !== 'success') return execution
      const model = courseKnowledgeModelSchema.parse(execution.output)
      const missingRequirementNodes = input.requirements.map((requirement) => requirement.requirementId).filter((id) => !model.nodes.some((node) => node.id === id))
      if (model.fingerprint !== fingerprint || missingRequirementNodes.length > 0) {
        return downgradeSuccess(execution, `Course Knowledge Model contract mismatch; missing requirement nodes: ${missingRequirementNodes.join(', ') || 'none'}`)
      }
      return execution
    },

    async planLearningBlueprint(input) {
      return client.run({
        workerId: 'content-factory.learning-blueprint',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: executableLearningBlueprintSchema,
        instructions: 'Plan readable Learn and purposeful Practice work units. Set schemaVersion=1, jobId and knowledgeModelFingerprint exactly as supplied. Cover every knowledge node and every non-deferred requirement. Keep shared course material course-scoped. Each work unit requiring learning must include explanation; add worked_example where it materially helps. Each work unit requiring practice must include one or more of retrieval, flashcard, short_answer, application or quantitative. Do not use exam_practice in this blueprint.',
        payload: input,
      })
    },

    async generateLearningCollateral(input) {
      return client.run({
        workerId: 'content-factory.learning-collateral',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: learningCollateralWorkerOutputSchema,
        instructions: 'Create concise but substantial student learning collateral for the exact work unit. Explain meaning before detail, connect ideas to realistic business contexts, surface misconceptions, and end with a useful next action. Generate sections only when explanation is selected and workedExamples only when worked_example is selected. Do not mention source URLs, AQA wording, official mark schemes or endorsement.',
        payload: input,
      })
    },

    async generatePracticeCollateral(input) {
      return client.run({
        workerId: 'content-factory.practice-collateral',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: practiceCollateralWorkerOutputSchema,
        instructions: 'Create active practice for every practice mode selected in the work unit and no unselected modes. Each activity must have an answer expectation, explanation and specific improvement action. Prefer application and quantitative reasoning where supported by the supplied knowledge nodes. Do not imitate protected exam questions.',
        payload: input,
      })
    },

    async compileAssessmentBlueprint(input) {
      const fingerprint = await fingerprintValue({ jobId: input.jobId, components: input.components, assessmentObjectives: input.assessmentObjectives, assessmentRequirements: input.assessmentRequirements })
      return client.run({
        workerId: 'content-factory.assessment-blueprint',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: executableAssessmentBlueprintSchema,
        instructions: 'Create a Revision-owned assessment blueprint consistent with the supplied component marks, timing, objectives and structured board-alignment requirements. Set schemaVersion=1, jobId exactly, fingerprint exactly to requiredFingerprint and boardAlignmentFingerprint exactly to the supplied value. Question-family IDs must be stable lowercase identifiers. The component markTotal and timingMinutes must exactly match supplied component facts where present.',
        payload: { ...input, requiredFingerprint: fingerprint },
      })
    },

    async generateQuestionFamilies(input) {
      const policies = Object.fromEntries(input.requestedFamilyIds.map((id) => [id, config.questionFamilyPolicies?.[id]]).filter((entry) => entry[1]))
      const execution = await client.run({
        workerId: 'content-factory.question-family',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: questionFamilyWorkerOutputSchema,
        instructions: 'Return one object with a questionFamilies array containing exactly one reusable Question Family for every requestedFamilyId and no others. Reuse structured assessment demands without copying any awarding-body question or mark-scheme wording. If familyPolicies are supplied, obey their component, exact mark range, AO IDs, response shape and context requirement. Keep calibrationStatus not_calibrated and markingPackTemplateVersion="1".',
        payload: { ...input, familyPolicies: policies },
      })
      if (execution.status !== 'success') return execution
      const families = questionFamilyWorkerOutputSchema.parse(execution.output).questionFamilies
      if (!sameSet(families.map((family) => family.id), input.requestedFamilyIds)) return downgradeSuccess(execution, 'Question Family output did not match the exact requested IDs')
      for (const family of families) {
        const policy = config.questionFamilyPolicies?.[family.id]
        if (!policy) continue
        if (!sameSet(family.componentScope, [policy.componentId]) || family.markRange.min !== policy.maxMark || family.markRange.max !== policy.maxMark || !sameSet(family.assessmentObjectiveIds, policy.assessmentObjectiveIds)) {
          return downgradeSuccess(execution, `Question Family ${family.id} did not preserve its governed pilot policy`)
        }
      }
      return { ...execution, output: families }
    },

    async generateAssessmentItem(input) {
      const policy = config.assessmentItemPolicies?.[input.questionFamily.id]
      const execution = await client.run({
        workerId: 'content-factory.assessment-item',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: policy ? assessmentItemProviderOutputSchema : assessmentItemWorkerOutputSchema,
        instructions: policy
          ? 'Create one original Revision-owned exam-style question for the exact target component and Question Family. Never reproduce or closely mimic a known past-paper question. Use the supplied targetPolicy requirementIds, maxMark and format to shape the question, but do not return those governed target fields; Revision injects them deterministically after provider validation. Use only supplied knowledgeNodeIds. Context, when required, must be an original fictional business scenario with internally consistent data.'
          : 'Create one original Revision-owned exam-style question for the exact target component and Question Family. Never reproduce or closely mimic a known past-paper question. Set componentId and questionFamilyId exactly. Use only supplied requirementIds and knowledgeNodeIds. Context, when required, must be an original fictional business scenario with internally consistent data.',
        payload: { ...input, targetPolicy: policy },
      })
      if (execution.status !== 'success' || !policy) return execution
      const generated = assessmentItemProviderOutputSchema.parse(execution.output)
      const item = assessmentItemWorkerOutputSchema.parse({
        ...generated,
        componentId: input.targetComponentId,
        questionFamilyId: input.questionFamily.id,
        requirementIds: policy.requirementIds,
        maxMark: policy.maxMark,
        format: policy.format,
      })
      return { ...execution, output: item }
    },

    async generateMarkingPack(input) {
      return client.run({
        workerId: 'content-factory.marking-pack',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: markingPackWorkerOutputSchema,
        instructions: 'Create question-specific Revision marking guidance for the supplied Revision-owned question. AO allocations, if used, must total the question maxMark. Preserve all application, analysis and evaluation demands from the Question Family. Indicative content must be explicitly non-exhaustive in spirit: include multiple valid reasoning routes and do not imply only listed answers can score. Do not invent examiner authority, official wording, anchors or human calibration.',
        payload: input,
      })
    },

    async independentReview(input) {
      const artifactIndex = reviewArtifactIndex(input, config.resolveArtifactRef)
      const execution = await client.run({
        workerId: 'content-factory.independent-review',
        contractVersion: '1',
        routeKind: 'independent_review',
        outputSchema: independentReviewWorkerOutputSchema,
        instructions: 'Act as a fresh-context adversarial educational and assessment reviewer, not a proofreader. Challenge factual accuracy, curriculum/coverage completeness, pedagogy, question authenticity, internal calculation consistency, AO/marking-pack logic, ambiguity and whether feedback would help a student improve. Respect source-rights metadata: REFERENCE_ONLY material is alignment evidence, not generative source text. Use artifactRef values only from artifactIndex. Do not return workUnitId; Revision derives work-unit scope deterministically from the referenced artifact when one exists. Blocking/material findings require fail_hold; minor-only findings require conditional_pass; no open findings permits pass. Do not waive defects merely to complete the pilot.',
        payload: { ...input, artifactIndex },
      })
      if (execution.status !== 'success') return execution
      const output = independentReviewWorkerOutputSchema.parse(execution.output)
      const workUnitsByArtifactRef = new Map(artifactIndex
        .filter((entry): entry is typeof entry & { workUnitId: string } => typeof entry.workUnitId === 'string')
        .map((entry) => [entry.artifactRef, entry.workUnitId]))
      const findings = output.findings.map((finding) => {
        const workUnitId = workUnitsByArtifactRef.get(finding.artifactRef)
        return independentReviewFindingSchema.parse(workUnitId ? { ...finding, workUnitId } : finding)
      })
      return { ...execution, output: { ...output, findings } }
    },

    async remediate(input) {
      return client.run({
        workerId: 'content-factory.targeted-remediation',
        contractVersion: '1',
        routeKind: 'generation',
        outputSchema: remediationWorkerOutputSchema,
        instructions: 'Correct only the supplied downstream artifact for exactly the supplied findings. Preserve all governed identity, provenance, source references, fingerprints, question identifiers and calibration status. If the target is an assessment item, also return a corrected dependent Marking Pack that exactly matches the corrected question. Resolve exactly the supplied finding IDs and do not invent expert calibration.',
        payload: input,
      })
    },
  }
}
