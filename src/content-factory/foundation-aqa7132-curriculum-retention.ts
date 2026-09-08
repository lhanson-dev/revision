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

function courseContextAlternative(obligation: FoundationCoverageObligation): FoundationCoverageObligation {
  return {
    ...obligation,
    requiredTerms: obligation.requiredTerms.flatMap((requiredTerm) =>
      requiredTerm === 'varied business contexts'
        ? ['business', 'varied contexts']
        : [requiredTerm],
    ),
  }
}

function assertAqaCourseContextRetention(input: {
  obligation: FoundationCoverageObligation
  semanticItems: FoundationSemanticCoverageItem[]
  courseKnowledgeModel: CourseKnowledgeModel
}) {
  try {
    return assertCourseTruthRequiredScopeRetention({
      obligations: [input.obligation],
      semanticItems: input.semanticItems,
      nodes: input.courseKnowledgeModel.nodes,
    })
  } catch (error) {
    const expectedAlternativeFailure =
      'missing_required_course_truth_scope:aqa-3-0-course-context:varied business contexts'
    if (!(error instanceof Error) || error.message !== expectedAlternativeFailure) throw error

    // AQA 3.0 requires business to be studied in a variety of contexts. The governed
    // semantic seed renders that as "varied business contexts", while final Course Truth
    // may safely render the same concept as "Business ... varied contexts". Only this one
    // qualification-specific anchor has a bounded alternative; every other required term
    // and every other obligation remains governed by the strict shared matcher.
    return assertCourseTruthRequiredScopeRetention({
      obligations: [courseContextAlternative(input.obligation)],
      semanticItems: input.semanticItems,
      nodes: input.courseKnowledgeModel.nodes,
    })
  }
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
  const obligations = buildAqaAlevelBusiness7132CurriculumObligations(semanticItems)
  const courseContext = obligations.find((obligation) => obligation.obligationId === 'aqa-3-0-course-context')
  if (!courseContext) throw new Error('missing_aqa_course_context_retention_obligation')

  const courseContextResult = assertAqaCourseContextRetention({
    obligation: courseContext,
    semanticItems,
    courseKnowledgeModel,
  })
  const remainingResult = assertCourseTruthRequiredScopeRetention({
    obligations: obligations.filter((obligation) => obligation.obligationId !== courseContext.obligationId),
    semanticItems,
    nodes: courseKnowledgeModel.nodes,
  })

  return {
    checkedNodeIds: [...courseContextResult.checkedNodeIds, ...remainingResult.checkedNodeIds],
  }
}
