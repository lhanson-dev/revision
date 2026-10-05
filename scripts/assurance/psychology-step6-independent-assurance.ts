import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'

import { derivePsychologyLearnerAssets } from '../content/derive-psychology-learner-assets'
import { derivePsychologyMarkingPacks } from '../content/derive-psychology-marking-packs'

type SourceEvidence = {
  url: string
  classification: string
  licence?: string
  supports?: string[]
}

type SubjectTruth = {
  definitionsAndCoreConcepts?: string[]
  modelsResearchAndRelationships?: string[]
  evaluationAndLimits?: string[]
  misconceptionsAndBoundaries?: string[]
  dependencies?: string[]
}

type Requirement = {
  requirementId: string
  boardAlignment: { summary: string; classification: string }
  subjectTruth: SubjectTruth
  sourceEvidence?: SourceEvidence[]
  revisionSynthesis?: string[]
}

type Topic = {
  topicNumber: number
  topic: string
  requirements: Requirement[]
}

type ExamTruth = {
  status: string
  course: Record<string, unknown>
  assessmentModel: {
    papers: Array<{
      id: string
      name: string
      durationMinutes: number
      rawMarks: number
      sections: unknown[]
      attemptRule?: string
    }>
  }
  assessmentObjectives: Record<string, unknown>
  crossPaperConstraints: Record<string, unknown>
  questionFamilies: unknown[]
  commandDemandModel: Record<string, unknown>
  extendedResponse: Record<string, unknown>
  revisionOwnedAssessmentRules: string[]
}

type EducationalReviewPacket = {
  schemaVersion: 1
  packetType: 'educational'
  packetId: string
  courseId: 'aqa:aqa-a-level:7182'
  topicNumbers: number[]
  topics: string[]
  requirementIds: string[]
  permittedSourceDomains: string[]
  rightsBoundary: {
    officialAqaSourceTextIncluded: false
    permittedReusableSourceClasses: string[]
  }
  requirements: Array<{
    requirementId: string
    topicNumber: number
    topic: string
    boardAlignment: { summary: string; classification: 'REFERENCE_ONLY' }
    subjectTruth: SubjectTruth
    reusableSourceEvidence: SourceEvidence[]
    revisionSynthesis: string[]
    learn: unknown
    practice: unknown[]
    practiceEvidenceMappings: unknown[]
    practiceMarkingPacks: unknown[]
  }>
  reviewInstruction: string
}

type AssessmentReviewPacket = {
  schemaVersion: 1
  packetType: 'assessment'
  packetId: string
  courseId: 'aqa:aqa-a-level:7182'
  paperId: string
  reviewedContentIds: string[]
  rightsBoundary: {
    officialAqaSourceTextIncluded: false
    webSearchPermitted: false
    examTruthUse: 'structured_assessment_facts_only'
  }
  structuredExamTruth: {
    course: Record<string, unknown>
    paper: ExamTruth['assessmentModel']['papers'][number]
    assessmentObjectives: Record<string, unknown>
    crossPaperConstraints: Record<string, unknown>
    questionFamilies: unknown[]
    commandDemandModel: Record<string, unknown>
    extendedResponse: Record<string, unknown>
    revisionOwnedAssessmentRules: string[]
  }
  topicExamPrep: unknown[]
  topicMarkingPacks: unknown[]
  scoredPaperSimulation: unknown
  fullPaperQuestionMarkingPacks: unknown[]
  reviewInstruction: string
}

export type PsychologyStep6Packets = {
  educational: EducationalReviewPacket[]
  assessment: AssessmentReviewPacket[]
  summary: {
    educationalPacketCount: number
    assessmentPacketCount: number
    topicCount: number
    requirementCount: number
    educationalRequirementCoverageCount: number
    assessmentContentCoverageCount: number
    maximumPacketCharacters: number
  }
}

type EducationalGroup = {
  id: string
  topicNumbers: number[]
  requirementIds?: string[]
}

const requirementIds = (topic: number, start: number, end: number): string[] =>
  Array.from({ length: end - start + 1 }, (_, index) => `PSY-${String(topic).padStart(2, '0')}-${String(start + index).padStart(2, '0')}`)

const EDUCATIONAL_GROUPS: EducationalGroup[] = [
  { id: 'EDU-01', topicNumbers: [1, 2] },
  { id: 'EDU-02', topicNumbers: [3, 4] },
  { id: 'EDU-03', topicNumbers: [5, 6] },
  { id: 'EDU-04A', topicNumbers: [7], requirementIds: requirementIds(7, 1, 9) },
  { id: 'EDU-04B', topicNumbers: [7], requirementIds: requirementIds(7, 10, 17) },
  { id: 'EDU-04C', topicNumbers: [7], requirementIds: requirementIds(7, 18, 23) },
  { id: 'EDU-04D', topicNumbers: [7], requirementIds: requirementIds(7, 24, 34) },
  { id: 'EDU-05', topicNumbers: [8, 9] },
  { id: 'EDU-06', topicNumbers: [10, 11] },
  { id: 'EDU-07A', topicNumbers: [12] },
  { id: 'EDU-07B', topicNumbers: [13] },
  { id: 'EDU-08', topicNumbers: [14, 15] },
  { id: 'EDU-09', topicNumbers: [16, 17] },
]

const ASSESSMENT_PAPERS = ['7182/1', '7182/2', '7182/3'] as const
const REUSABLE_SOURCE_CLASSES = new Set(['OPEN', 'LICENSED', 'REVISION_OWNED'])
const MAX_PACKET_CHARACTERS = 750_000
const HARD_MAX_SPEND_USD = 5
const MAX_ATTEMPTS = 2
const MAX_OUTPUT_TOKENS = 16_000
const OUTPUT_DIR = '.artifacts/psychology-step6-independent-assurance'

const unique = <T>(values: T[]): T[] => [...new Set(values)]

function sourceDomain(url: string): string {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
}

function loadTopics(courseTruthDir: string): Topic[] {
  return readdirSync(courseTruthDir)
    .filter((name) => /^topic-\d+.*\.json$/.test(name))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(courseTruthDir, name), 'utf8')) as Topic)
}

function exactSet(actual: string[], expected: string[], label: string): void {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) {
    throw new Error(`${label} mismatch`)
  }
}

function packSize(packet: unknown): number {
  return JSON.stringify(packet).length
}

function assertPacketSize(packet: unknown, packetId: string): void {
  const size = packSize(packet)
  if (size > MAX_PACKET_CHARACTERS) {
    throw new Error(`${packetId} is ${size} characters; split the packet before provider review`)
  }
}

export function validateStep6MaxSpend(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > HARD_MAX_SPEND_USD) {
    throw new Error(`Psychology Step 6 max spend must be > 0 and <= US$${HARD_MAX_SPEND_USD}`)
  }
  return value
}

export function buildPsychologyStep6Packets(courseTruthDir: string, examTruthPath: string): PsychologyStep6Packets {
  const topics = loadTopics(courseTruthDir)
  const assets = derivePsychologyLearnerAssets(courseTruthDir, examTruthPath)
  const marking = derivePsychologyMarkingPacks(courseTruthDir, examTruthPath)
  const examTruth = JSON.parse(readFileSync(examTruthPath, 'utf8')) as ExamTruth
  if (examTruth.status !== 'experimental_exam_truth_complete') throw new Error('Completed Psychology Exam Truth is required')

  const topicByNumber = new Map(topics.map((topic) => [topic.topicNumber, topic]))
  const learnByRequirementId = new Map(
    assets.learn.chapters.flatMap((chapter) => chapter.sections.map((section) => [section.requirementIds[0], section] as const)),
  )
  const practiceByRequirementId = new Map<string, typeof assets.practice.activities>()
  for (const activity of assets.practice.activities) {
    for (const requirementId of activity.requirementIds) {
      const current = practiceByRequirementId.get(requirementId) ?? []
      current.push(activity)
      practiceByRequirementId.set(requirementId, current)
    }
  }
  const practiceMappingsByItem = new Map(marking.practice.evidenceMappings.map((mapping) => [mapping.itemId, mapping]))
  const practicePacksByItem = new Map(marking.practice.markingPacks.map((pack) => [pack.itemId, pack]))

  const educational = EDUCATIONAL_GROUPS.map((group): EducationalReviewPacket => {
    const groupTopics = group.topicNumbers.map((topicNumber) => {
      const topic = topicByNumber.get(topicNumber)
      if (!topic) throw new Error(`Missing Psychology topic ${topicNumber}`)
      return topic
    })
    const requiredIds = group.requirementIds ? new Set(group.requirementIds) : null
    const requirements = groupTopics.flatMap((topic) => topic.requirements
      .filter((requirement) => requiredIds === null || requiredIds.has(requirement.requirementId))
      .map((requirement) => {
        if (requirement.boardAlignment.classification !== 'REFERENCE_ONLY') {
          throw new Error(`${requirement.requirementId} has unexpected Board Alignment classification`)
        }
        const reusableSourceEvidence = (requirement.sourceEvidence ?? []).filter((source) => REUSABLE_SOURCE_CLASSES.has(source.classification))
        if (reusableSourceEvidence.length === 0) throw new Error(`${requirement.requirementId} has no reusable source evidence for independent review`)
        const excluded = (requirement.sourceEvidence ?? []).filter((source) => !REUSABLE_SOURCE_CLASSES.has(source.classification))
        if (excluded.some((source) => source.classification === 'PROHIBITED' || source.classification === 'UNKNOWN')) {
          throw new Error(`${requirement.requirementId} contains prohibited or unresolved reusable evidence`)
        }
        const learn = learnByRequirementId.get(requirement.requirementId)
        if (!learn) throw new Error(`Missing Learn section for ${requirement.requirementId}`)
        const practice = practiceByRequirementId.get(requirement.requirementId) ?? []
        const practiceEvidenceMappings = practice.map((activity) => practiceMappingsByItem.get(activity.id)).filter((value) => value !== undefined)
        const practiceMarkingPacks = practice.map((activity) => practicePacksByItem.get(activity.id)).filter((value) => value !== undefined)
        return {
          requirementId: requirement.requirementId,
          topicNumber: topic.topicNumber,
          topic: topic.topic,
          boardAlignment: { summary: requirement.boardAlignment.summary, classification: 'REFERENCE_ONLY' as const },
          subjectTruth: requirement.subjectTruth,
          reusableSourceEvidence,
          revisionSynthesis: requirement.revisionSynthesis ?? [],
          learn,
          practice,
          practiceEvidenceMappings,
          practiceMarkingPacks,
        }
      }))
    if (group.requirementIds) exactSet(requirements.map((requirement) => requirement.requirementId), group.requirementIds, `${group.id} requirement slice`)
    const packet: EducationalReviewPacket = {
      schemaVersion: 1,
      packetType: 'educational',
      packetId: group.id,
      courseId: 'aqa:aqa-a-level:7182',
      topicNumbers: [...group.topicNumbers],
      topics: groupTopics.map((topic) => topic.topic),
      requirementIds: requirements.map((requirement) => requirement.requirementId),
      permittedSourceDomains: unique(requirements.flatMap((requirement) => requirement.reusableSourceEvidence.map((source) => sourceDomain(source.url)))),
      rightsBoundary: {
        officialAqaSourceTextIncluded: false,
        permittedReusableSourceClasses: [...REUSABLE_SOURCE_CLASSES],
      },
      requirements,
      reviewInstruction: 'Adversarially review every listed requirement and its exact derived learner treatment. Find and classify factual distortion, source-fidelity problems, pedagogical oversimplification, omitted conditions, misleading certainty, misconception-repair errors, or Practice prompts that do not validly exercise the intended capability. Do not rewrite for style. Use only the supplied rights-safe subject truth and reusable source evidence, plus web evidence restricted to the permitted source domains. AQA Board Alignment is structured placement context only and must not be treated as reusable source text.',
    }
    assertPacketSize(packet, packet.packetId)
    return packet
  })

  const topicSetByPaper = new Map<string, typeof assets.examPrep.topicSets>()
  for (const set of assets.examPrep.topicSets) {
    const current = topicSetByPaper.get(set.paperId) ?? []
    current.push(set)
    topicSetByPaper.set(set.paperId, current)
  }
  const topicPackByItem = new Map(marking.examPrep.topicMarkingPacks.map((pack) => [pack.itemId, pack]))
  const fullPackById = new Map(marking.examPrep.fullPaperQuestionMarkingPacks.map((pack) => [pack.id, pack]))
  const scoredPaperByPaperId = new Map(marking.examPrep.scoredPaperSimulations.map((paper) => [paper.paperId, paper]))

  const assessment = ASSESSMENT_PAPERS.map((paperId): AssessmentReviewPacket => {
    const paper = examTruth.assessmentModel.papers.find((candidate) => candidate.id === paperId)
    if (!paper) throw new Error(`Missing Exam Truth for ${paperId}`)
    const topicSets = topicSetByPaper.get(paperId) ?? []
    const topicQuestionIds = topicSets.flatMap((set) => set.questions.map((question) => question.id))
    const topicMarkingPacks = topicQuestionIds.map((id) => {
      const pack = topicPackByItem.get(id)
      if (!pack) throw new Error(`Missing topic Marking Pack ${id}`)
      return pack
    })
    const scoredPaperSimulation = scoredPaperByPaperId.get(paperId)
    if (!scoredPaperSimulation) throw new Error(`Missing scored paper simulation ${paperId}`)
    const paperMarkingPackIds = scoredPaperSimulation.sections.flatMap((section) => [
      ...(section.questions ?? []).map((question) => question.markingPackId),
      ...(section.options ?? []).flatMap((option) => option.questions.map((question) => question.markingPackId)),
    ])
    const fullPaperQuestionMarkingPacks = paperMarkingPackIds.map((id) => {
      const pack = fullPackById.get(id)
      if (!pack) throw new Error(`Missing full-paper Marking Pack ${id}`)
      return pack
    })
    const reviewedContentIds = unique([
      ...topicQuestionIds,
      ...fullPaperQuestionMarkingPacks.map((pack) => pack.itemId),
    ])
    const packet: AssessmentReviewPacket = {
      schemaVersion: 1,
      packetType: 'assessment',
      packetId: `ASM-${paperId.replace('/', '-')}`,
      courseId: 'aqa:aqa-a-level:7182',
      paperId,
      reviewedContentIds,
      rightsBoundary: {
        officialAqaSourceTextIncluded: false,
        webSearchPermitted: false,
        examTruthUse: 'structured_assessment_facts_only',
      },
      structuredExamTruth: {
        course: examTruth.course,
        paper,
        assessmentObjectives: examTruth.assessmentObjectives,
        crossPaperConstraints: examTruth.crossPaperConstraints,
        questionFamilies: examTruth.questionFamilies,
        commandDemandModel: examTruth.commandDemandModel,
        extendedResponse: examTruth.extendedResponse,
        revisionOwnedAssessmentRules: examTruth.revisionOwnedAssessmentRules,
      },
      topicExamPrep: topicSets,
      topicMarkingPacks,
      scoredPaperSimulation,
      fullPaperQuestionMarkingPacks,
      reviewInstruction: 'Adversarially review every listed Revision-owned assessment item and Marking Pack. Check exact-course scope, authentic demand, scenario/data coherence, mark and AO logic, rubric/level logic, legitimate alternative reasoning, misconception and diagnostic accuracy, evidence-scope integrity, and risk of teaching an incorrect exam habit. Use only the supplied structured Exam Truth and rights-safe Marking Pack content. Do not browse the web or reconstruct protected AQA questions/mark schemes.',
    }
    assertPacketSize(packet, packet.packetId)
    return packet
  })

  const expectedRequirementIds = topics.flatMap((topic) => topic.requirements.map((requirement) => requirement.requirementId))
  const educationalRequirementIds = educational.flatMap((packet) => packet.requirementIds)
  exactSet(educationalRequirementIds, expectedRequirementIds, 'Step 6 educational requirement coverage')

  const expectedTopicAssessmentIds = assets.examPrep.topicSets.flatMap((set) => set.questions.map((question) => question.id))
  const expectedPaperAssessmentIds = marking.examPrep.fullPaperQuestionMarkingPacks.map((pack) => pack.itemId)
  const assessmentIds = assessment.flatMap((packet) => packet.reviewedContentIds)
  exactSet(assessmentIds, unique([...expectedTopicAssessmentIds, ...expectedPaperAssessmentIds]), 'Step 6 assessment item coverage')

  const maximumPacketCharacters = Math.max(...[...educational, ...assessment].map(packSize))
  return {
    educational,
    assessment,
    summary: {
      educationalPacketCount: educational.length,
      assessmentPacketCount: assessment.length,
      topicCount: topics.length,
      requirementCount: expectedRequirementIds.length,
      educationalRequirementCoverageCount: educationalRequirementIds.length,
      assessmentContentCoverageCount: assessmentIds.length,
      maximumPacketCharacters,
    },
  }
}

const severitySchema = z.enum(['blocking', 'material', 'minor', 'no_issue'])
const dimensionStatusSchema = z.enum(['pass', 'minor_issue', 'material_issue', 'blocking_issue'])
const findingSchema = z.object({
  id: z.string().min(1),
  severity: severitySchema,
  issueType: z.string().min(1),
  affectedContentIds: z.array(z.string().min(1)).min(1),
  evidence: z.string().min(1),
  recommendedCorrection: z.string().min(1),
  affectedArtifact: z.string().min(1),
  resolutionStatus: z.literal('open'),
})
const reviewSchema = z.object({
  packetId: z.string().min(1),
  reviewedContentIds: z.array(z.string().min(1)).min(1),
  decision: z.enum(['pass', 'fail_hold']),
  dimensions: z.array(z.object({
    dimension: z.string().min(1),
    status: dimensionStatusSchema,
    summary: z.string().min(1),
  })).min(1),
  findings: z.array(findingSchema),
  knownLimitations: z.array(z.string()),
  summary: z.string().min(1),
})

export type PsychologyStep6Review = z.infer<typeof reviewSchema>

function schemaJson(): Record<string, unknown> {
  const value = z.toJSONSchema(reviewSchema) as Record<string, unknown>
  delete value.$schema
  return value
}

function responseText(body: Record<string, unknown>): string {
  if (typeof body.output_text === 'string' && body.output_text.trim()) return body.output_text
  const output = Array.isArray(body.output) ? body.output : []
  const chunks: string[] = []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : []
    for (const part of content) {
      if (!part || typeof part !== 'object') continue
      const typed = part as { type?: string; text?: string; refusal?: string }
      if (typed.type === 'refusal' && typed.refusal) throw new Error(`Provider refusal: ${typed.refusal}`)
      if (typed.type === 'output_text' && typed.text) chunks.push(typed.text)
    }
  }
  if (chunks.length === 0) throw new Error('Provider returned no structured output text')
  return chunks.join('')
}

function searchCount(body: Record<string, unknown>): number {
  const output = Array.isArray(body.output) ? body.output : []
  return output.filter((item) => item && typeof item === 'object' && (item as { type?: string }).type === 'web_search_call').length
}

type Usage = {
  input_tokens?: number
  output_tokens?: number
  input_tokens_details?: { cached_tokens?: number }
}

function observedCostUsd(usage: Usage | undefined, searches: number): number {
  const input = Math.max(0, usage?.input_tokens ?? 0)
  const output = Math.max(0, usage?.output_tokens ?? 0)
  const cached = Math.min(input, Math.max(0, usage?.input_tokens_details?.cached_tokens ?? 0))
  return Number(((((input - cached) * 2) + (cached * 0.2) + (output * 12)) / 1_000_000 + searches * 0.01).toFixed(8))
}

function conservativeReserveUsd(packet: unknown, web: boolean): number {
  const estimatedInputTokens = Math.ceil(JSON.stringify(packet).length / 3)
  const estimatedSearches = web ? 3 : 0
  const perAttempt = (estimatedInputTokens * 2 + MAX_OUTPUT_TOKENS * 12) / 1_000_000 + estimatedSearches * 0.01
  return Number((perAttempt * MAX_ATTEMPTS + 0.05).toFixed(8))
}

function hasMaterialFinding(review: PsychologyStep6Review): boolean {
  return review.findings.some((finding) => finding.severity === 'blocking' || finding.severity === 'material')
    || review.dimensions.some((dimension) => dimension.status === 'blocking_issue' || dimension.status === 'material_issue')
}

function validateReview(review: PsychologyStep6Review, packetId: string, expectedIds: string[]): void {
  if (review.packetId !== packetId) throw new Error(`${packetId} review returned the wrong packet ID`)
  exactSet(review.reviewedContentIds, expectedIds, `${packetId} reviewed content IDs`)
  const material = hasMaterialFinding(review)
  if (review.decision !== (material ? 'fail_hold' : 'pass')) {
    throw new Error(`${packetId} decision is inconsistent with its findings/dimensions`)
  }
  const expected = new Set(expectedIds)
  for (const finding of review.findings) {
    if (finding.severity === 'no_issue') throw new Error(`${packetId} must not create no_issue findings; use dimensions for passes`)
    for (const id of finding.affectedContentIds) if (!expected.has(id)) throw new Error(`${packetId} finding references out-of-packet content ${id}`)
  }
}

class ProviderReviewFailure extends Error {
  readonly costUsd: number
  readonly searches: number
  readonly attempts: number

  constructor(message: string, economics: { costUsd: number; searches: number; attempts: number }) {
    super(message)
    this.name = 'ProviderReviewFailure'
    this.costUsd = economics.costUsd
    this.searches = economics.searches
    this.attempts = economics.attempts
  }
}

async function providerReview(args: {
  packet: EducationalReviewPacket | AssessmentReviewPacket
  model: string
  apiKey: string
  remainingBudgetUsd: number
}): Promise<{ review: PsychologyStep6Review; costUsd: number; searches: number; attempts: number }> {
  const web = args.packet.packetType === 'educational'
  const reserve = conservativeReserveUsd(args.packet, web)
  if (reserve > args.remainingBudgetUsd) {
    throw new Error(`incomplete_cost_guard: ${args.packet.packetId} requires conservative reserve US$${reserve}, remaining US$${args.remainingBudgetUsd.toFixed(8)}`)
  }

  let totalCostUsd = 0
  let totalSearches = 0
  let completedAttempts = 0
  let lastError = ''
  const fail = (message: string): never => {
    throw new ProviderReviewFailure(message, {
      costUsd: totalCostUsd,
      searches: totalSearches,
      attempts: completedAttempts,
    })
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    completedAttempts = attempt
    const body: Record<string, unknown> = {
      model: args.model,
      store: false,
      reasoning: { context: 'current_turn', effort: 'high' },
      max_output_tokens: MAX_OUTPUT_TOKENS,
      instructions: `You are the fresh independent assurance reviewer for Revision's AQA A-level Psychology 7182 source-first restricted-pilot candidate. You did not generate this material. Your role is adversarial error detection, not rewriting or style improvement. Review every content ID in the packet. Return blocking/material findings whenever publication would risk factual, educational, assessment or marking harm. Minor issues may remain minor. Do not use AQA protected prose. Keep the structured response concise: use dimensions for pass states and create findings only for actual issues. ${attempt > 1 ? `The previous attempt was unusable: ${lastError}. Return a complete response satisfying the same contract.` : ''}`,
      input: JSON.stringify(args.packet),
      text: { format: { type: 'json_schema', name: 'psychology_step6_review', strict: true, schema: schemaJson() } },
    }
    if (web) {
      const domains = args.packet.permittedSourceDomains
      if (domains.length === 0) throw new Error(`${args.packet.packetId} has no permitted web-search domains`)
      body.tools = [{ type: 'web_search', search_context_size: 'medium', filters: { allowed_domains: domains } }]
      body.tool_choice = 'required'
    }

    let response: Response
    let raw: Record<string, unknown>
    try {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${args.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      raw = await response.json() as Record<string, unknown>
    } catch (error) {
      lastError = `provider transport failure: ${error instanceof Error ? error.message : String(error)}`
      if (attempt === MAX_ATTEMPTS) fail(lastError)
      continue
    }

    const usage = (raw.usage && typeof raw.usage === 'object' ? raw.usage : undefined) as Usage | undefined
    const searches = searchCount(raw)
    const attemptCost = observedCostUsd(usage, searches)
    totalCostUsd = Number((totalCostUsd + attemptCost).toFixed(8))
    totalSearches += searches

    if (!response.ok) {
      lastError = `provider HTTP ${response.status}: ${JSON.stringify(raw).slice(0, 800)}`
      if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) continue
      fail(lastError)
    }

    if (raw.status === 'incomplete') {
      lastError = `provider response incomplete: ${JSON.stringify(raw.incomplete_details ?? {})}`
      if (attempt === MAX_ATTEMPTS) fail(lastError)
      continue
    }

    try {
      const parsed = JSON.parse(responseText(raw))
      const review = reviewSchema.parse(parsed)
      const expectedIds = args.packet.packetType === 'educational' ? args.packet.requirementIds : args.packet.reviewedContentIds
      validateReview(review, args.packet.packetId, expectedIds)
      return { review, costUsd: totalCostUsd, searches: totalSearches, attempts: completedAttempts }
    } catch (error) {
      lastError = `invalid structured output: ${error instanceof Error ? error.message : String(error)}`
      if (attempt === MAX_ATTEMPTS) fail(lastError)
    }
  }

  fail(`Provider attempts exhausted for ${args.packet.packetId}`)
}

export async function runPsychologyStep6IndependentAssurance(args: {
  courseTruthDir: string
  examTruthPath: string
  reviewedMainSha: string
  maxSpendUsd: number
  model: string
  apiKey: string
}): Promise<Record<string, unknown>> {
  if (!/^[0-9a-f]{40}$/.test(args.reviewedMainSha)) throw new Error('reviewedMainSha must be an exact lowercase 40-character SHA')
  const maxSpendUsd = validateStep6MaxSpend(args.maxSpendUsd)
  if (!args.apiKey.trim()) throw new Error('OPENAI_API_KEY is required for live Psychology Step 6 assurance')
  if (!args.model.trim()) throw new Error('Psychology Step 6 review model is required')

  const packets = buildPsychologyStep6Packets(args.courseTruthDir, args.examTruthPath)
  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(join(OUTPUT_DIR, 'packet-summary.json'), `${JSON.stringify(packets.summary, null, 2)}\n`)

  const reviews: PsychologyStep6Review[] = []
  let observedSpendUsd = 0
  let searches = 0
  let providerAttempts = 0
  let completionStatus = 'complete'
  let failureReason: string | null = null

  try {
    for (const packet of [...packets.educational, ...packets.assessment]) {
      const result = await providerReview({
        packet,
        model: args.model,
        apiKey: args.apiKey,
        remainingBudgetUsd: Number((maxSpendUsd - observedSpendUsd).toFixed(8)),
      })
      observedSpendUsd = Number((observedSpendUsd + result.costUsd).toFixed(8))
      searches += result.searches
      providerAttempts += result.attempts
      reviews.push(result.review)
      await writeFile(join(OUTPUT_DIR, `${packet.packetId}.review.json`), `${JSON.stringify(result.review, null, 2)}\n`)
      if (observedSpendUsd > maxSpendUsd) throw new Error(`Observed Step 6 spend exceeded configured ceiling: US$${observedSpendUsd}`)
    }
  } catch (error) {
    if (error instanceof ProviderReviewFailure) {
      observedSpendUsd = Number((observedSpendUsd + error.costUsd).toFixed(8))
      searches += error.searches
      providerAttempts += error.attempts
    }
    completionStatus = 'incomplete'
    failureReason = error instanceof Error ? error.message : String(error)
  }

  const unresolvedMaterialFindings = reviews.flatMap((review) => review.findings).filter((finding) => finding.severity === 'blocking' || finding.severity === 'material')
  const unresolvedMaterialDimensions = reviews.flatMap((review) => review.dimensions
    .filter((dimension) => dimension.status === 'blocking_issue' || dimension.status === 'material_issue')
    .map((dimension) => ({ packetId: review.packetId, ...dimension })))
  const failHoldPacketIds = reviews.filter((review) => review.decision === 'fail_hold').map((review) => review.packetId)
  const allPacketsComplete = reviews.length === packets.educational.length + packets.assessment.length
  const finalDecision = completionStatus === 'complete'
    && allPacketsComplete
    && failHoldPacketIds.length === 0
    && unresolvedMaterialFindings.length === 0
    && unresolvedMaterialDimensions.length === 0
    ? 'pass'
    : 'fail_hold'
  const receipt = {
    schemaVersion: 1,
    artifactType: 'psychology_step6_independent_assurance_receipt',
    courseId: 'aqa:aqa-a-level:7182',
    reviewedMainSha: args.reviewedMainSha,
    model: args.model,
    completionStatus,
    finalDecision,
    failureReason,
    packetCounts: {
      required: packets.educational.length + packets.assessment.length,
      completed: reviews.length,
      educational: packets.educational.length,
      assessment: packets.assessment.length,
    },
    coverage: packets.summary,
    assuranceClasses: ['A1', 'A2', 'A3', 'A4'],
    failHoldPacketIds,
    unresolvedBlockingOrMaterialFindings: unresolvedMaterialFindings,
    unresolvedBlockingOrMaterialDimensions: unresolvedMaterialDimensions,
    knownLimitations: [
      'This is independent AI assurance for a restricted pilot, not qualified human subject-specialist benchmark approval.',
      'Marking Packs remain uncalibrated against independently human-marked learner anchors; production automated marking is not authorised by this receipt.',
    ],
    economics: {
      configuredMaximumSpendUsd: maxSpendUsd,
      observedSpendUsd,
      providerAttempts,
      webSearchCalls: searches,
      paidSourceLicenceSpendGbp: 0,
    },
    nextStep: finalDecision === 'pass'
      ? 'Retain this exact-version assurance evidence in a governed PR, then proceed to Step 7 canonical learner-runtime integration for the restricted pilot.'
      : 'Target remediation only to affected requirements/items and rerun the dependent assurance before Step 7.',
  }
  await writeFile(join(OUTPUT_DIR, 'final-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)

  if (finalDecision !== 'pass') {
    const issueCount = unresolvedMaterialFindings.length + unresolvedMaterialDimensions.length
    throw new Error(`Psychology Step 6 assurance did not pass: ${failureReason ?? `${issueCount} unresolved blocking/material review states`}`)
  }
  return receipt
}
