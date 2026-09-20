import { z } from 'zod'
import {
  type ProviderLearningTeachingPointEvidence,
  type ProviderPracticeTeachingPointEvidence,
} from './provider-coverage-evidence'
import { courseKnowledgeModelSchema } from './schema'

const courseTruthPrefix = 'Course Truth ['
const formulaPrefix = 'Formula or quantitative procedure ['
const misconceptionPrefix = 'Misconception to diagnose and repair ['
const applicationContextPrefix = 'Required application context ['
const evidenceDemandPrefix = 'Required evidence demand ['

function unique(values: string[]) {
  return [...new Set(values)]
}

function isAtomicTeachingPoint(teachingPoint: string) {
  return [
    courseTruthPrefix,
    formulaPrefix,
    misconceptionPrefix,
    applicationContextPrefix,
    evidenceDemandPrefix,
  ].some((prefix) => teachingPoint.startsWith(prefix))
}

/**
 * Turns the structured facts already present on each exact Course Truth node into
 * node-bound generation obligations. These labels are assurance metadata, not
 * learner-facing copy and not a new source of curriculum truth.
 */
export function deriveFoundationCourseLearningAtomicTeachingPoints(nodesInput: unknown) {
  const nodes = z.array(courseKnowledgeModelSchema.shape.nodes.element).min(1).parse(nodesInput)
  return unique(nodes.flatMap((node) => {
    const marker = `[${node.id}]`
    return [
      `Course Truth ${marker}: ${node.summary}`,
      ...node.formulas.map((formula) => `Formula or quantitative procedure ${marker}: ${formula}`),
      ...node.misconceptions.map((misconception) => `Misconception to diagnose and repair ${marker}: ${misconception}`),
      ...node.applicationContexts.map((context) => `Required application context ${marker}: ${context}`),
      ...node.evidenceTypes.map((evidenceType) => `Required evidence demand ${marker}: ${evidenceType}`),
    ]
  }))
}

function requireActivePracticeField(entry: ProviderPracticeTeachingPointEvidence) {
  if (entry.location.field !== 'prompt' && entry.location.field !== 'expectedResponse') {
    throw new Error(`Atomic Blueprint obligation ${entry.teachingPoint} must be evidenced in an active Practice prompt or expected response`)
  }
}

function requirePracticeMode(entry: ProviderPracticeTeachingPointEvidence, expectedMode: ProviderPracticeTeachingPointEvidence['location']['mode']) {
  if (entry.location.mode !== expectedMode) {
    throw new Error(`Atomic Blueprint obligation ${entry.teachingPoint} must be exercised in ${expectedMode} Practice, not ${entry.location.mode}`)
  }
}

function evidenceDemandMode(teachingPoint: string): ProviderPracticeTeachingPointEvidence['location']['mode'] | null {
  const demand = teachingPoint.toLowerCase()
  if (['quantitative', 'calculation', 'ratio', 'numerical'].some((term) => demand.includes(term))) return 'quantitative'
  if (['construction', 'construct', 'completion', 'amendment', 'procedure', 'method'].some((term) => demand.includes(term))) return 'short_answer'
  if ([
    'graph',
    'chart',
    'diagram interpretation',
    'data interpretation',
    'graphical interpretation',
    'framework',
    'model application',
    'application',
    'contextual',
    'case',
    'evaluation',
    'judgement',
    'judgment',
    'decision making',
    'synoptic',
    'cross-topic',
    'cross topic',
    'cross-functional',
    'interrelationship',
    'integrat',
    'mixed-topic',
    'mixed topic',
  ].some((term) => demand.includes(term))) return 'application'
  if ([
    'compare',
    'comparison',
    'comparative',
    'discriminat',
    'distinguish',
    'analysis',
    'analyse',
    'reasoning',
    'diagnosis',
    'diagnostic',
    'causal',
    'cause',
    'consequence',
    'mechanism',
    'sequence',
    'process',
    'ordered stages',
    'exam response',
    'extended response',
    'essay',
    'source response',
  ].some((term) => demand.includes(term))) return 'short_answer'
  return null
}

/**
 * Provider-v5 generation guidance derived from the same deterministic rules used
 * by the post-generation validator. Keeping the instructions here prevents the
 * provider prompt and fail-closed evidence boundary from drifting apart.
 */
export function foundationAtomicLearningEvidenceGuidance() {
  return [
    'Atomic coverageEvidence placement rules are mandatory and override generic evidence-location guidance.',
    'Course Truth [nodeId] summaries must point to section_explanation or section_key_point, never introduction or next_action.',
    'Formula or quantitative procedure [nodeId] obligations must point to worked_example_setup, worked_example_step or worked_example_conclusion.',
    'Misconception to diagnose and repair [nodeId] obligations must point to misconception_correction.',
    'Required application context [nodeId] and Required evidence demand [nodeId] obligations must point to an exact Learn field that genuinely teaches that exact node-bound obligation.',
  ].join(' ')
}

export function foundationAtomicPracticeEvidenceGuidance(requiredTeachingPoints: string[]) {
  const modeAssignments = requiredTeachingPoints
    .filter((teachingPoint) => teachingPoint.startsWith(evidenceDemandPrefix))
    .map((teachingPoint) => ({ teachingPoint, mode: evidenceDemandMode(teachingPoint) }))
    .filter((entry): entry is { teachingPoint: string; mode: ProviderPracticeTeachingPointEvidence['location']['mode'] } => Boolean(entry.mode))
    .map((entry) => `${entry.teachingPoint} -> ${entry.mode}`)

  return [
    'Atomic coverageEvidence placement rules are mandatory and override generic evidence-location guidance.',
    'Every atomic Course Truth obligation must point to an active Practice prompt or expectedResponse, never explanation or improvementAction.',
    'Formula or quantitative procedure [nodeId] obligations must use quantitative Practice.',
    'Required application context [nodeId] obligations must use application Practice.',
    'Misconception to diagnose and repair [nodeId] obligations must use retrieval Practice.',
    modeAssignments.length > 0
      ? `Required evidence demand mode assignments for this work unit: ${modeAssignments.join('; ')}.`
      : 'Required evidence demand [nodeId] obligations with no deterministic mode assignment may use any selected compatible Practice mode, but must still use an active prompt or expectedResponse.',
  ].join(' ')
}

export function validateFoundationAtomicLearningEvidenceLocations(
  evidence: ProviderLearningTeachingPointEvidence[],
) {
  for (const entry of evidence) {
    if (!isAtomicTeachingPoint(entry.teachingPoint)) continue

    if (entry.teachingPoint.startsWith(courseTruthPrefix)) {
      if (entry.location.area !== 'section_explanation' && entry.location.area !== 'section_key_point') {
        throw new Error(`Atomic Course Truth obligation ${entry.teachingPoint} must be taught in the Learn explanation body`)
      }
    }
    if (entry.teachingPoint.startsWith(formulaPrefix) && !entry.location.area.startsWith('worked_example_')) {
      throw new Error(`Atomic formula/procedure obligation ${entry.teachingPoint} must be worked through in a Learn worked example`)
    }
    if (entry.teachingPoint.startsWith(misconceptionPrefix) && entry.location.area !== 'misconception_correction') {
      throw new Error(`Atomic misconception obligation ${entry.teachingPoint} must be evidenced in an explicit Learn misconception correction`)
    }
  }
}

export function validateFoundationAtomicPracticeEvidenceLocations(
  evidence: ProviderPracticeTeachingPointEvidence[],
) {
  for (const entry of evidence) {
    if (!isAtomicTeachingPoint(entry.teachingPoint)) continue
    requireActivePracticeField(entry)

    if (entry.teachingPoint.startsWith(formulaPrefix)) requirePracticeMode(entry, 'quantitative')
    if (entry.teachingPoint.startsWith(applicationContextPrefix)) requirePracticeMode(entry, 'application')
    if (entry.teachingPoint.startsWith(misconceptionPrefix)) requirePracticeMode(entry, 'retrieval')
    if (entry.teachingPoint.startsWith(evidenceDemandPrefix)) {
      const expectedMode = evidenceDemandMode(entry.teachingPoint)
      if (expectedMode) requirePracticeMode(entry, expectedMode)
    }
  }
}
