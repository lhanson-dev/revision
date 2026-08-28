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
    contractVersion: contentFactoryIntakeWorkerContracts.knowledgeModel.contractVersion,
    dependsOn: ['resolveStructuredEvidence', 'compileBoardAlignment', 'compileCoverage'],
  },
  planLearningBlueprint: {
    contractVersion: contentFactoryLearningPracticeWorkerContracts.learningBlueprint.contractVersion,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel'],
  },
  generateLearningCollateral: {
    contractVersion: contentFactoryLearningPracticeWorkerContracts.learningCollateral.contractVersion,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel', 'planLearningBlueprint'],
  },
  generatePracticeCollateral: {
    contractVersion: contentFactoryLearningPracticeWorkerContracts.practiceCollateral.contractVersion,
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
    contractVersion: contentFactoryAssessmentWorkerContracts.assessmentItem.contractVersion,
    dependsOn: ['compileCoverage', 'compileKnowledgeModel', 'compileAssessmentBlueprint', 'generateQuestionFamilies'],
  },
  generateMarkingPack: {
    contractVersion: contentFactoryAssessmentWorkerContracts.markingPack.contractVersion,
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
