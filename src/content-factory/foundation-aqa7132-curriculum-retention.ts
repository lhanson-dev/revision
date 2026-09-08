import type { CourseKnowledgeModel } from './schema'
import {
  assertCourseTruthRequiredScopeRetention,
  type FoundationCoverageObligation,
  type FoundationSemanticCoverageItem,
} from './requirement-led-coverage'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './source-seeds/aqa-a-level-business-7132-2027'
import { buildAqaAlevelBusiness7132CurriculumObligations } from './source-seeds/aqa-a-level-business-7132-2027-coverage'

export function aqaAlevelBusiness7132SemanticCoverageItems(): FoundationSemanticCoverageItem[] {
  return AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.flatMap((requirement) =>
    requirement.skillsOrKnowledge.map((text, knowledgeItemIndex) => ({
      id: `${requirement.requirementId}.s${String(knowledgeItemIndex + 1).padStart(2, '0')}`,
      requirementId: requirement.requirementId,
      officialReference: requirement.officialReference,
      knowledgeItemIndex,
      text,
    })),
  )
}

function courseTruthRetentionObligations(semanticItems: FoundationSemanticCoverageItem[]): FoundationCoverageObligation[] {
  return buildAqaAlevelBusiness7132CurriculumObligations(semanticItems).map((obligation) => {
    if (obligation.obligationId !== 'aqa-3-0-course-context') return obligation

    // AQA 3.0 requires business to be studied in a variety of contexts. The governed
    // semantic seed renders that as "varied business contexts", while final Course Truth
    // may safely render the same concept as "Business ... varied contexts". Keep the
    // generic matcher strict and make this qualification-specific retention contract
    // require both the business domain and the varied-context concept without depending
    // on one generated word order.
    return {
      ...obligation,
      requiredTerms: obligation.requiredTerms.flatMap((requiredTerm) =>
        requiredTerm === 'varied business contexts'
          ? ['business', 'varied contexts']
          : [requiredTerm],
      ),
    }
  })
}

/**
 * Qualification-profile guard for the current AQA 7132 / 2027 Foundation.
 *
 * Source-led obligations define the named curriculum scope. The governed semantic seed
 * supplies the canonical node mapping. Final Course Truth must retain every mechanically
 * checkable named requirement after generative enrichment; exact seed prose is not required.
 */
export function assertAqaAlevelBusiness7132CourseTruthRetention(courseKnowledgeModel: CourseKnowledgeModel) {
  const semanticItems = aqaAlevelBusiness7132SemanticCoverageItems()
  return assertCourseTruthRequiredScopeRetention({
    obligations: courseTruthRetentionObligations(semanticItems),
    semanticItems,
    nodes: courseKnowledgeModel.nodes,
  })
}
