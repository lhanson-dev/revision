import { contentFactoryAssessmentWorkerContracts } from './assessment-and-marking'
import { contentFactoryAssuranceWorkerContracts } from './assurance-and-remediation'
import { contentFactoryIntakeWorkerContracts, fingerprintValue } from './intake-to-knowledge-model'
import { contentFactoryLearningPracticeWorkerContracts } from './learning-and-practice'

export const durableWorkerMethods = [
  'resolveIdentity',
  'discoverSources',
  'resolveStructuredEvidence',
  'compileBoardAlignment',
  'compileCoverage',
  'compileKnowledgeModel',
  'planLearningBlueprint',
  'generateLearningCollateral',
  'generatePracticeCollateral',
  'compileAssessmentBlueprint',
  'generateQuestionFamilies',
  'generateAssessmentItem',
  'generateMarkingPack',
  'independentReview',
  'remediate',
] as const

export type DurableWorkerMethod = typeof durableWorkerMethods[number]

export type DurableWorkerDependencyNode = {
  contractVersion: string
  dependsOn: DurableWorkerMethod[]
}

export type DurableWorkerDependencyPolicy = Record<DurableWorkerMethod, DurableWorkerDependencyNode>

function integrityVersion(baseVersion: string, revision: string) {
  return `${baseVersion}+${revision}`
}

// These semantic versions describe the effective worker boundary used by durable
// reuse, including deterministic or generative post-provider integrity controls.
// Pilot #16 advanced the Course Knowledge Model, Learn, Practice, assessment-item
// and Marking Pack boundaries. Provider-free requalification then advanced Learn
// and Practice to v2 for their course-agnostic generation guardrails. Pilot #17
// exposed a generic assessment-item provider representation defect: an optional
// data-point unit could be emitted as an empty string. Assessment-item semantics
// therefore advanced to output-integrity-v2. Reliability v2-A after Pilot #18
// transfers Marking Pack rubric IDs/bands and structured aggregate AO arithmetic
// to compiler ownership and makes repair validation whole-artifact/complete-
// diagnostic, so legacy Marking Packs cannot be durably reused across that change.
// The first Q7 soak exposed omitted Assessment Item subquestion maxMark,
// requirementIds and coverageEvidence before the repair boundary; v3 admitted the
// genuinely provider-owned omission class into one complete-diagnostic repair.
// The second Q7 soak exposed duplicate provider authorship of requirement IDs;
// output-integrity-v4 derives subquestion requirementIds from coverageEvidence.
// Confirmation Pilot #19 then exposed a semantic-validation architecture defect:
// MCQ interaction wording was incorrectly required to carry a second lexical cue
// for knowledge/application cognitive demand. output-integrity-v5 separates the
// mechanically validated selection interaction from those MCQ cognitive labels,
// while preserving explicit lexical guards for calculation, interpretation,
// analysis and evaluation. Post-Pilot #20 candidate recovery moves candidate
// numbering and the two-candidate ceiling into durable orchestration state. The
// Assessment Item worker input contract is therefore v3 and output-integrity-v6
// prevents pre-durable Assessment candidates from being reused across head changes.
// The next ADR-0019 slice applies the same durable candidate ownership to Marking
// Packs: the generic input contract advances to v3 and output-integrity-v3 prevents
// pre-recovery Marking Pack executions from being reused as candidate-aware work.
const currentIntegrityVersions = {
  courseKnowledgeModel: integrityVersion(contentFactoryIntakeWorkerContracts.knowledgeModel.contractVersion, 'output-integrity-v1'),
  learningCollateral: integrityVersion(contentFactoryLearningPracticeWorkerContracts.learningCollateral.contractVersion, 'output-integrity-v2'),
  practiceCollateral: integrityVersion(contentFactoryLearningPracticeWorkerContracts.practiceCollateral.contractVersion, 'output-integrity-v2'),
  assessmentItem: integrityVersion(contentFactoryAssessmentWorkerContracts.assessmentItem.contractVersion, 'output-integrity-v6'),
  markingPack: integrityVersion(contentFactoryAssessmentWorkerContracts.markingPack.contractVersion, 'output-integrity-v3'),
} as const

export const currentDurableWorkerDependencyPolicy: DurableWorkerDependencyPolicy = {
  resolveIdentity: {
    contractVersion: contentFactoryIntakeWorkerContracts.identity.contractVersion,
    dependsOn: [],
  },
  discoverSources: {
    contractVersion: contentFactoryIntakeWorkerContracts.sourceDiscovery.contractVersion,
    dependsOn: ['resolveIdentity'],
  },
  resolveStructuredEvidence: {
    contractVersion: contentFactoryIntakeWorkerContracts.structuredEvidence.contractVersion,
    dependsOn: ['discoverSources'],
  },
  compileBoardAlignment: {
    contractVersion: contentFactoryIntakeWorkerContracts.boardAlignment.contractVersion,
    dependsOn: ['resolveStructuredEvidence'],
  },
  compileCoverage: {
    contractVersion: contentFactoryIntakeWorkerContracts.coverage.contractVersion,
    dependsOn: ['resolveStructuredEvidence', 'compileBoardAlignment'],
  },
  compileKnowledgeModel: {
    contractVersion: currentIntegrityVersions.courseKnowledgeModel,
    dependsOn: ['resolveStructuredEvidence', 'compileBoardAlignment', 'compileCoverage'],
  },
  planLearningBlueprint: {
    contractVersion: contentFactoryLearningPracticeWorkerContracts.learningBlueprint.contractVersion,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel'],
  },
  generateLearningCollateral: {
    contractVersion: currentIntegrityVersions.learningCollateral,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel', 'planLearningBlueprint'],
  },
  generatePracticeCollateral: {
    contractVersion: currentIntegrityVersions.practiceCollateral,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel', 'planLearningBlueprint'],
  },
  compileAssessmentBlueprint: {
    contractVersion: contentFactoryAssessmentWorkerContracts.assessmentBlueprint.contractVersion,
    dependsOn: ['compileBoardAlignment', 'compileCoverage', 'compileKnowledgeModel'],
  },
  generateQuestionFamilies: {
    contractVersion: contentFactoryAssessmentWorkerContracts.questionFamily.contractVersion,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel', 'compileAssessmentBlueprint'],
  },
  generateAssessmentItem: {
    contractVersion: currentIntegrityVersions.assessmentItem,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel', 'compileAssessmentBlueprint', 'generateQuestionFamilies'],
  },
  generateMarkingPack: {
    contractVersion: currentIntegrityVersions.markingPack,
    dependsOn: ['compileKnowledgeModel', 'compileAssessmentBlueprint', 'generateQuestionFamilies', 'generateAssessmentItem'],
  },
  independentReview: {
    contractVersion: contentFactoryAssuranceWorkerContracts.independentReview.contractVersion,
    dependsOn: [
      'compileBoardAlignment',
      'compileCoverage',
      'compileKnowledgeModel',
      'planLearningBlueprint',
      'generateLearningCollateral',
      'generatePracticeCollateral',
      'compileAssessmentBlueprint',
      'generateQuestionFamilies',
      'generateAssessmentItem',
      'generateMarkingPack',
    ],
  },
  remediate: {
    contractVersion: contentFactoryAssuranceWorkerContracts.remediation.contractVersion,
    dependsOn: ['independentReview'],
  },
}

export function cloneDurableWorkerDependencyPolicy(
  policy: DurableWorkerDependencyPolicy = currentDurableWorkerDependencyPolicy,
): DurableWorkerDependencyPolicy {
  return Object.fromEntries(
    durableWorkerMethods.map((method) => [method, {
      contractVersion: policy[method].contractVersion,
      dependsOn: [...policy[method].dependsOn],
    }]),
  ) as DurableWorkerDependencyPolicy
}

export function withDurableWorkerContractVersion(
  policy: DurableWorkerDependencyPolicy,
  method: DurableWorkerMethod,
  contractVersion: string,
): DurableWorkerDependencyPolicy {
  const next = cloneDurableWorkerDependencyPolicy(policy)
  next[method] = { ...next[method], contractVersion }
  return next
}

export function durableWorkerDependencyClosure(
  method: DurableWorkerMethod,
  policy: DurableWorkerDependencyPolicy = currentDurableWorkerDependencyPolicy,
) {
  const visiting = new Set<DurableWorkerMethod>()
  const visited = new Set<DurableWorkerMethod>()
  const closure: Array<{ method: DurableWorkerMethod; contractVersion: string }> = []

  const visit = (current: DurableWorkerMethod) => {
    if (visited.has(current)) return
    if (visiting.has(current)) throw new Error(`Durable worker dependency cycle detected at ${current}`)
    const node = policy[current]
    if (!node) throw new Error(`Missing durable worker dependency policy for ${current}`)

    visiting.add(current)
    for (const dependency of node.dependsOn) visit(dependency)
    visiting.delete(current)
    visited.add(current)
    closure.push({ method: current, contractVersion: node.contractVersion })
  }

  visit(method)
  return closure.sort((left, right) => left.method.localeCompare(right.method))
}

export async function durableWorkerDependencyFingerprint(
  method: DurableWorkerMethod,
  policy: DurableWorkerDependencyPolicy = currentDurableWorkerDependencyPolicy,
) {
  return fingerprintValue({
    schemaVersion: 1,
    method,
    dependencies: durableWorkerDependencyClosure(method, policy),
  })
}
