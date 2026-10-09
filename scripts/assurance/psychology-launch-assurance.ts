import { mkdir, writeFile } from 'node:fs/promises'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { z } from 'zod'

import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import {
  psychologyDataDrills,
  psychologyExamTechnique,
  psychologyFlashcards,
  psychologyLearn,
  psychologyQuestions,
  psychologyTopicLinks,
  psychologyTopics,
} from '../../content/psychology/aqa-a-level/shared/course'
import { aqaPsychology7182ExamPapers } from '../../content/psychology/aqa-a-level/shared/exam-papers'

type SubjectTruth = {
  definitionsAndCoreConcepts?: string[]
  modelsResearchAndRelationships?: string[]
  evaluationAndLimits?: string[]
  misconceptionsAndBoundaries?: string[]
  dependencies?: string[]
}

type Requirement = {
  requirementId: string
  subjectTruth: SubjectTruth
  sourceEvidence?: Array<Record<string, unknown>>
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

type EducationalPacket = {
  schemaVersion: 1
  packetType: 'launch_educational'
  packetId: string
  courseId: 'aqa:aqa-a-level:7182'
  topicNumbers: number[]
  requirementIds: string[]
  reviewScopeIds: string[]
  rightsBoundary: {
    officialAqaSourceTextIncluded: false
    webSearchPermitted: false
    referenceBasis: 'approved_course_truth_only'
  }
  topics: Array<{
    topicNumber: number
    topic: string
    productionTopic: unknown
    topicLinks: unknown[]
    requirements: Array<{
      requirementId: string
      courseTruth: SubjectTruth
      learnPage: unknown
      flashcard: unknown
      objectivePractice: unknown
      dataDrill?: unknown
    }>
  }>
  reviewInstruction: string
}

type AssessmentPacket = {
  schemaVersion: 1
  packetType: 'launch_assessment'
  packetId: string
  courseId: 'aqa:aqa-a-level:7182'
  paperId: string
  reviewScopeIds: string[]
  rightsBoundary: {
    officialAqaSourceTextIncluded: false
    webSearchPermitted: false
    referenceBasis: 'approved_structured_exam_truth_and_course_truth'
  }
  approvedCourseTruth: Array<{
    topicNumber: number
    topic: string
    requirements: Array<{
      requirementId: string
      subjectTruth: SubjectTruth
      sourceEvidence: Array<Record<string, unknown>>
      revisionSynthesis: string[]
    }>
  }>
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
  productionPaperGuide: unknown
  productionAssessmentObjectives: unknown
  productionCommandWords: unknown
  productionLevelsNote: unknown
  productionExamTechnique: unknown
  productionMock: unknown
  reviewInstruction: string
}

export type PsychologyLaunchPackets = {
  educational: EducationalPacket[]
  assessment: AssessmentPacket[]
  summary: {
    educationalPacketCount: number
    assessmentPacketCount: number
    topicCount: number
    requirementCount: number
    requirementCoverageCount: number
    assessmentQuestionCount: number
    maximumPacketCharacters: number
  }
}

type EducationalGroup = { id: string; topicNumbers: number[]; requirementIds?: string[] }

const requirementIds = (topic: number, start: number, end: number): string[] =>
  Array.from({ length: end - start + 1 }, (_, index) => `PSY-${String(topic).padStart(2, '0')}-${String(start + index).padStart(2, '0')}`)

const EDUCATIONAL_GROUPS: EducationalGroup[] = [
  { id: 'LAUNCH-EDU-01', topicNumbers: [1, 2, 3] },
  { id: 'LAUNCH-EDU-02', topicNumbers: [4, 5, 6] },
  { id: 'LAUNCH-EDU-03A', topicNumbers: [7], requirementIds: requirementIds(7, 1, 17) },
  { id: 'LAUNCH-EDU-03B', topicNumbers: [7], requirementIds: requirementIds(7, 18, 34) },
  { id: 'LAUNCH-EDU-04', topicNumbers: [8, 9, 10] },
  { id: 'LAUNCH-EDU-05', topicNumbers: [11, 12, 13] },
  { id: 'LAUNCH-EDU-06', topicNumbers: [14, 15, 16, 17] },
]

const ASSESSMENT_PAPERS = ['7182/1', '7182/2', '7182/3'] as const
const MAX_PACKET_CHARACTERS = 500_000
const HARD_MAX_SPEND_USD = 5
const MAX_ATTEMPTS = 2
const MAX_OUTPUT_TOKENS = 10_000
const OUTPUT_DIR = '.artifacts/psychology-launch-assurance'

const unique = <T>(values: T[]): T[] => [...new Set(values)]
const sectionId = (requirementId: string): string => requirementId.toLowerCase().replaceAll('-', '')

function loadTopics(courseTruthDir: string): Topic[] {
  return readdirSync(courseTruthDir)
    .filter((name) => /^topic-\d+.*\.json$/.test(name))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(courseTruthDir, name), 'utf8')) as Topic)
}

function exactSet(actual: string[], expected: string[], label: string): void {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) throw new Error(`${label} mismatch`)
}

function packSize(packet: unknown): number {
  return JSON.stringify(packet).length
}

function assertPacketSize(packet: unknown, packetId: string): void {
  const size = packSize(packet)
  if (size > MAX_PACKET_CHARACTERS) throw new Error(`${packetId} is ${size} characters; split it before provider review`)
}

function learnPageFor(requirementId: string) {
  const id = sectionId(requirementId)
  const group = psychologyLearn.chapters.flatMap((chapter) => chapter.groups).find((candidate) => candidate.id === id)
  if (!group || group.pages.length !== 1) throw new Error(`Missing exact production Learn page for ${requirementId}`)
  return group.pages[0]
}

function flashcardFor(requirementId: string) {
  const found = psychologyFlashcards.find((card) => card.id === `psy-${sectionId(requirementId)}-card`)
  if (!found) throw new Error(`Missing production flashcard for ${requirementId}`)
  return found
}

function questionFor(requirementId: string) {
  const found = psychologyQuestions.find((question) => question.id === `psy-${sectionId(requirementId)}-check`)
  if (!found) throw new Error(`Missing production objective Practice for ${requirementId}`)
  return found
}

function dataDrillFor(topic: Topic, requirement: Requirement) {
  if (topic.topicNumber !== 7) return undefined
  const index = topic.requirements.findIndex((candidate) => candidate.requirementId === requirement.requirementId)
  return index >= 0 && index < psychologyDataDrills.length ? psychologyDataDrills[index] : undefined
}

function productionTopicFor(topicNumber: number) {
  const found = psychologyTopics.find((topic) => topic.order === topicNumber)
  if (!found) throw new Error(`Missing production topic ${topicNumber}`)
  return found
}

function scopedProductionTopicFor(topicNumber: number, requirements: Array<{ requirementId: string }>, split: boolean) {
  const productionTopic = productionTopicFor(topicNumber)
  if (!split) return productionTopic
  const allowedSections = new Set(requirements.map((requirement) => sectionId(requirement.requirementId)))
  return {
    ...productionTopic,
    sections: productionTopic.sections.filter((section) => allowedSections.has(section.id)),
  }
}

function paperTopicNumbers(paper: ExamTruth['assessmentModel']['papers'][number]): number[] {
  return unique(paper.sections.flatMap((section) => {
    const scope = (section as { scope?: { topicNumber?: number; topicNumbers?: number[] } }).scope
    if (!scope) return []
    if (typeof scope.topicNumber === 'number') return [scope.topicNumber]
    return Array.isArray(scope.topicNumbers) ? scope.topicNumbers : []
  }))
}

const examPackByPaperId = new Map<string, unknown>([
  ['7182/1', paper1.exams[0]],
  ['7182/2', paper2.exams[0]],
  ['7182/3', paper3.exams[0]],
])

export function buildPsychologyLaunchPackets(courseTruthDir: string, examTruthPath: string): PsychologyLaunchPackets {
  const topics = loadTopics(courseTruthDir)
  const examTruth = JSON.parse(readFileSync(examTruthPath, 'utf8')) as ExamTruth
  if (examTruth.status !== 'experimental_exam_truth_complete') throw new Error('Completed Psychology Exam Truth is required')

  const topicByNumber = new Map(topics.map((topic) => [topic.topicNumber, topic]))
  const educational = EDUCATIONAL_GROUPS.map((group): EducationalPacket => {
    const selectedTopics = group.topicNumbers.map((topicNumber) => {
      const topic = topicByNumber.get(topicNumber)
      if (!topic) throw new Error(`Missing Course Truth topic ${topicNumber}`)
      const required = group.requirementIds ? new Set(group.requirementIds) : null
      const requirements = topic.requirements
        .filter((requirement) => required === null || required.has(requirement.requirementId))
        .map((requirement) => ({
          requirementId: requirement.requirementId,
          courseTruth: requirement.subjectTruth,
          learnPage: learnPageFor(requirement.requirementId),
          flashcard: flashcardFor(requirement.requirementId),
          objectivePractice: questionFor(requirement.requirementId),
          ...(dataDrillFor(topic, requirement) ? { dataDrill: dataDrillFor(topic, requirement) } : {}),
        }))
      return {
        topicNumber,
        topic: topic.topic,
        productionTopic: scopedProductionTopicFor(topicNumber, requirements, required !== null),
        topicLinks: psychologyTopicLinks.filter((link) => link.topic === productionTopicFor(topicNumber).id),
        requirements,
      }
    })

    const requirementIdsInPacket = selectedTopics.flatMap((topic) => topic.requirements.map((requirement) => requirement.requirementId))
    if (group.requirementIds) exactSet(requirementIdsInPacket, group.requirementIds, `${group.id} requirement slice`)
    const reviewScopeIds = unique(selectedTopics.flatMap((topic) => [
      `PRODUCTION-TOPIC-${topic.topicNumber}`,
      ...topic.topicLinks.map((link) => link.id),
      ...topic.requirements.flatMap((requirement) => [
        requirement.requirementId,
        (requirement.learnPage as { id: string }).id,
        (requirement.flashcard as { id: string }).id,
        (requirement.objectivePractice as { id: string }).id,
        ...((requirement.dataDrill as { id?: string } | undefined)?.id ? [(requirement.dataDrill as { id: string }).id] : []),
      ]),
    ]))

    const packet: EducationalPacket = {
      schemaVersion: 1,
      packetType: 'launch_educational',
      packetId: group.id,
      courseId: 'aqa:aqa-a-level:7182',
      topicNumbers: group.topicNumbers,
      requirementIds: requirementIdsInPacket,
      reviewScopeIds,
      rightsBoundary: {
        officialAqaSourceTextIncluded: false,
        webSearchPermitted: false,
        referenceBasis: 'approved_course_truth_only',
      },
      topics: selectedTopics,
      reviewInstruction: 'Adversarially review the exact production learner content against the supplied approved Course Truth. Check factual fidelity, omissions, misleading simplification or certainty, exam-relevant depth, Learn clarity, misconception treatment, flashcard usefulness, objective-Practice answer validity and distractor quality, Research Methods/data correctness where present, and whether topic connections make a defensible educational claim. Do not rewrite for style. Findings must identify real learner harm or trust risk, not preferences. Treat the supplied Course Truth as the approved factual reference and do not browse the web. When a topic is split across packets, productionTopic is deliberately scoped to only the requirement sections listed in this packet; do not infer an omission from sections assigned to the companion packet.',
    }
    assertPacketSize(packet, packet.packetId)
    return packet
  })

  const assessment = ASSESSMENT_PAPERS.map((paperId): AssessmentPacket => {
    const paperTruth = examTruth.assessmentModel.papers.find((paper) => paper.id === paperId)
    if (!paperTruth) throw new Error(`Missing Exam Truth for ${paperId}`)
    const productionMock = examPackByPaperId.get(paperId)
    if (!productionMock) throw new Error(`Missing production mock for ${paperId}`)
    const paperNumber = Number(paperId.slice(-1))
    const productionPaperGuide = aqaPsychology7182ExamPapers.papers.find((paper) => paper.number === paperNumber)
    if (!productionPaperGuide) throw new Error(`Missing production paper guide for ${paperId}`)
    const questionIds = (productionMock as { questions: Array<{ id: string }> }).questions.map((question) => question.id)
    const approvedCourseTruth = paperTopicNumbers(paperTruth).map((topicNumber) => {
      const topic = topicByNumber.get(topicNumber)
      if (!topic) throw new Error(`Missing Course Truth topic ${topicNumber} for ${paperId}`)
      return {
        topicNumber,
        topic: topic.topic,
        requirements: topic.requirements.map((requirement) => ({
          requirementId: requirement.requirementId,
          subjectTruth: requirement.subjectTruth,
          sourceEvidence: requirement.sourceEvidence ?? [],
          revisionSynthesis: requirement.revisionSynthesis ?? [],
        })),
      }
    })
    const reviewScopeIds = unique([
      `PRODUCTION-PAPER-GUIDE-${paperNumber}`,
      `PRODUCTION-MOCK-${paperNumber}`,
      ...questionIds,
      ...psychologyExamTechnique.map((guide) => guide.id),
    ])
    const packet: AssessmentPacket = {
      schemaVersion: 1,
      packetType: 'launch_assessment',
      packetId: `LAUNCH-ASM-${paperId.replace('/', '-')}`,
      courseId: 'aqa:aqa-a-level:7182',
      paperId,
      reviewScopeIds,
      rightsBoundary: {
        officialAqaSourceTextIncluded: false,
        webSearchPermitted: false,
        referenceBasis: 'approved_structured_exam_truth_and_course_truth',
      },
      approvedCourseTruth,
      structuredExamTruth: {
        course: examTruth.course,
        paper: paperTruth,
        assessmentObjectives: examTruth.assessmentObjectives,
        crossPaperConstraints: examTruth.crossPaperConstraints,
        questionFamilies: examTruth.questionFamilies,
        commandDemandModel: examTruth.commandDemandModel,
        extendedResponse: examTruth.extendedResponse,
        revisionOwnedAssessmentRules: examTruth.revisionOwnedAssessmentRules,
      },
      productionPaperGuide,
      productionAssessmentObjectives: aqaPsychology7182ExamPapers.assessmentObjectives,
      productionCommandWords: aqaPsychology7182ExamPapers.commandWords,
      productionLevelsNote: aqaPsychology7182ExamPapers.levelsNote,
      productionExamTechnique: psychologyExamTechnique,
      productionMock,
      reviewInstruction: 'Adversarially review the exact production Exam Prep and mock content against the supplied structured Exam Truth and approved Course Truth. Use Exam Truth for paper structure, AO demand and assessment conventions; use Course Truth and its source metadata for learner-facing psychology claims and indicative self-marking content. Check paper/section/option structure, timing and marks, AO allocations, prompt-stimulus coherence, authenticity of demand, Research Methods and maths tasks, numerical correctness, self-marking guidance, legitimate conclusions, option handling, and whether any learner-facing wording could teach a wrong exam habit or falsely imply official AQA authorship. Do not assess FI-007 automated marking: it is explicitly out of launch scope. Do not browse the web or reconstruct protected AQA questions or mark schemes.',
    }
    assertPacketSize(packet, packet.packetId)
    return packet
  })

  const expectedRequirementIds = topics.flatMap((topic) => topic.requirements.map((requirement) => requirement.requirementId))
  const actualRequirementIds = educational.flatMap((packet) => packet.requirementIds)
  exactSet(actualRequirementIds, expectedRequirementIds, 'launch educational requirement coverage')

  const assessmentQuestionCount = assessment.reduce((sum, packet) =>
    sum + (packet.productionMock as { questions: unknown[] }).questions.length, 0)
  const maximumPacketCharacters = Math.max(...[...educational, ...assessment].map(packSize))

  return {
    educational,
    assessment,
    summary: {
      educationalPacketCount: educational.length,
      assessmentPacketCount: assessment.length,
      topicCount: topics.length,
      requirementCount: expectedRequirementIds.length,
      requirementCoverageCount: actualRequirementIds.length,
      assessmentQuestionCount,
      maximumPacketCharacters,
    },
  }
}

const severitySchema = z.enum(['blocking', 'material', 'minor'])
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
const providerReviewSchema = z.object({
  packetId: z.string().min(1),
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
type ProviderReview = z.infer<typeof providerReviewSchema>
export type LaunchReview = ProviderReview & {
  reviewedContentIds: string[]
  scopeBinding: 'deterministic_packet_review_scope'
}

function schemaJson(): Record<string, unknown> {
  const value = z.toJSONSchema(providerReviewSchema) as Record<string, unknown>
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

type Usage = { input_tokens?: number; output_tokens?: number; input_tokens_details?: { cached_tokens?: number } }

function observedCostUsd(usage: Usage | undefined): number {
  const input = Math.max(0, usage?.input_tokens ?? 0)
  const output = Math.max(0, usage?.output_tokens ?? 0)
  const cached = Math.min(input, Math.max(0, usage?.input_tokens_details?.cached_tokens ?? 0))
  return Number(((((input - cached) * 2) + (cached * 0.2) + (output * 12)) / 1_000_000).toFixed(8))
}

export function validateLaunchAssuranceMaxSpend(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > HARD_MAX_SPEND_USD) {
    throw new Error(`Psychology launch assurance max spend must be > 0 and <= US$${HARD_MAX_SPEND_USD}`)
  }
  return value
}

export function estimateLaunchAttemptReserveUsd(packet: unknown): number {
  const estimatedInputTokens = Math.ceil(JSON.stringify(packet).length / 3)
  const perAttempt = (estimatedInputTokens * 2 + MAX_OUTPUT_TOKENS * 12) / 1_000_000
  return Number((perAttempt + 0.02).toFixed(8))
}

function reviewHasMaterial(review: ProviderReview): boolean {
  return review.findings.some((finding) => finding.severity === 'blocking' || finding.severity === 'material')
    || review.dimensions.some((dimension) => dimension.status === 'blocking_issue' || dimension.status === 'material_issue')
}

function validateReview(review: ProviderReview, packet: EducationalPacket | AssessmentPacket): void {
  if (review.packetId !== packet.packetId) throw new Error(`${packet.packetId} review returned the wrong packet ID`)
  const shouldHold = reviewHasMaterial(review)
  if (review.decision !== (shouldHold ? 'fail_hold' : 'pass')) throw new Error(`${packet.packetId} decision is inconsistent with findings/dimensions`)
  const allowed = new Set(packet.reviewScopeIds)
  for (const finding of review.findings) {
    for (const id of finding.affectedContentIds) {
      if (!allowed.has(id)) throw new Error(`${packet.packetId} finding references out-of-scope content ${id}`)
    }
  }
}

class ProviderFailure extends Error {
  readonly costUsd: number
  readonly attempts: number
  constructor(message: string, economics: { costUsd: number; attempts: number }) {
    super(message)
    this.name = 'ProviderFailure'
    this.costUsd = economics.costUsd
    this.attempts = economics.attempts
  }
}

async function providerReview(args: {
  packet: EducationalPacket | AssessmentPacket
  model: string
  apiKey: string
  remainingBudgetUsd: number
}): Promise<{ review: LaunchReview; costUsd: number; attempts: number }> {
  let totalCostUsd = 0
  let attempts = 0
  let lastError = ''
  const fail = (message: string): never => { throw new ProviderFailure(message, { costUsd: totalCostUsd, attempts }) }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const reserve = estimateLaunchAttemptReserveUsd(args.packet)
    const remaining = Number((args.remainingBudgetUsd - totalCostUsd).toFixed(8))
    if (reserve > remaining) fail(`incomplete_cost_guard: ${args.packet.packetId} attempt ${attempt} needs US$${reserve}, remaining US$${remaining}`)
    attempts = attempt
    const body = {
      model: args.model,
      store: false,
      reasoning: { context: 'current_turn', effort: 'high' },
      max_output_tokens: MAX_OUTPUT_TOKENS,
      instructions: `You are the fresh independent launch-assurance reviewer for Revision's AQA A-level Psychology 7182 restricted-pilot production pack. You did not generate this material. Find real factual, educational or assessment defects; do not rewrite for preference. Review every content item in packet.reviewScopeIds. Findings may reference only those IDs. A blocking or material issue must force fail_hold. Minor issues may remain minor. FI-007 automated marking is out of scope. Do not browse the web or use protected AQA question/mark-scheme prose. ${attempt > 1 ? `Previous output was unusable: ${lastError}. Return a complete response matching the schema.` : ''}`,
      input: JSON.stringify(args.packet),
      text: { format: { type: 'json_schema', name: 'psychology_launch_review', strict: true, schema: schemaJson() } },
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
    totalCostUsd = Number((totalCostUsd + observedCostUsd(usage)).toFixed(8))

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
      const parsed = providerReviewSchema.parse(JSON.parse(responseText(raw)))
      validateReview(parsed, args.packet)
      return {
        review: { ...parsed, reviewedContentIds: [...args.packet.reviewScopeIds], scopeBinding: 'deterministic_packet_review_scope' },
        costUsd: totalCostUsd,
        attempts,
      }
    } catch (error) {
      lastError = `invalid structured output: ${error instanceof Error ? error.message : String(error)}`
      if (attempt === MAX_ATTEMPTS) fail(lastError)
    }
  }
  fail(`Provider attempts exhausted for ${args.packet.packetId}`)
}

export async function runPsychologyLaunchAssurance(args: {
  courseTruthDir: string
  examTruthPath: string
  reviewedMainSha: string
  maxSpendUsd: number
  model: string
  apiKey: string
}): Promise<Record<string, unknown>> {
  if (!/^[0-9a-f]{40}$/.test(args.reviewedMainSha)) throw new Error('reviewedMainSha must be an exact lowercase 40-character SHA')
  const maxSpendUsd = validateLaunchAssuranceMaxSpend(args.maxSpendUsd)
  if (!args.apiKey.trim()) throw new Error('OPENAI_API_KEY is required for live Psychology launch assurance')
  if (!args.model.trim()) throw new Error('Psychology launch assurance model is required')

  const packets = buildPsychologyLaunchPackets(args.courseTruthDir, args.examTruthPath)
  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(join(OUTPUT_DIR, 'packet-summary.json'), `${JSON.stringify(packets.summary, null, 2)}\n`)

  const reviews: LaunchReview[] = []
  let observedSpendUsd = 0
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
      providerAttempts += result.attempts
      reviews.push(result.review)
      await writeFile(join(OUTPUT_DIR, `${packet.packetId}.review.json`), `${JSON.stringify(result.review, null, 2)}\n`)
      if (observedSpendUsd > maxSpendUsd) throw new Error(`Observed launch-assurance spend exceeded configured ceiling: US$${observedSpendUsd}`)
    }
  } catch (error) {
    if (error instanceof ProviderFailure) {
      observedSpendUsd = Number((observedSpendUsd + error.costUsd).toFixed(8))
      providerAttempts += error.attempts
    }
    completionStatus = 'incomplete'
    failureReason = error instanceof Error ? error.message : String(error)
  }

  const unresolvedFindings = reviews.flatMap((review) => review.findings)
    .filter((finding) => finding.severity === 'blocking' || finding.severity === 'material')
  const unresolvedDimensions = reviews.flatMap((review) => review.dimensions
    .filter((dimension) => dimension.status === 'blocking_issue' || dimension.status === 'material_issue')
    .map((dimension) => ({ packetId: review.packetId, ...dimension })))
  const allPacketsComplete = reviews.length === packets.educational.length + packets.assessment.length
  const finalDecision = completionStatus === 'complete' && allPacketsComplete
    && unresolvedFindings.length === 0 && unresolvedDimensions.length === 0
    ? 'pass'
    : 'fail_hold'

  const receipt = {
    schemaVersion: 1,
    courseId: 'aqa:aqa-a-level:7182',
    assuranceScope: 'restricted_pilot_launch_A2_A3_only',
    reviewedMainSha: args.reviewedMainSha,
    model: args.model,
    completionStatus,
    failureReason,
    finalDecision,
    packetCounts: {
      educational: packets.educational.length,
      assessment: packets.assessment.length,
      required: packets.educational.length + packets.assessment.length,
      completed: reviews.length,
    },
    unresolvedFindings,
    unresolvedDimensions,
    economics: {
      configuredMaximumSpendUsd: maxSpendUsd,
      observedSpendUsd,
      providerAttempts,
    },
    boundaries: {
      fi007AutomatedMarkingReviewed: false,
      markingPacksReviewed: false,
      publicationRequiresSeparateFounderApprovedPromotion: true,
    },
  }

  await writeFile(join(OUTPUT_DIR, 'final-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
  if (finalDecision !== 'pass') throw new Error(`Psychology launch assurance fail-closed: ${failureReason ?? `${unresolvedFindings.length} blocking/material findings; ${unresolvedDimensions.length} blocking/material dimensions`}`)
  return receipt
}
