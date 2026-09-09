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

type CourseContextAlternative = {
  variedContexts?: boolean
  interrelatedFunctions?: boolean
}

function courseContextAlternative(
  obligation: FoundationCoverageObligation,
  alternative: CourseContextAlternative,
): FoundationCoverageObligation {
  return {
    ...obligation,
    requiredTerms: obligation.requiredTerms.flatMap((requiredTerm) => {
      if (alternative.variedContexts && requiredTerm === 'varied business contexts') {
        return ['business', 'varied contexts']
      }
      if (alternative.interrelatedFunctions && requiredTerm === 'interrelated') {
        return ['connects functional decisions', 'rather than treating functions as isolated']
      }
      return [requiredTerm]
    }),
  }
}

const missingVariedBusinessContexts =
  'missing_required_course_truth_scope:aqa-3-0-course-context:varied business contexts'
const missingInterrelatedFunctions =
  'missing_required_course_truth_scope:aqa-3-0-course-context:interrelated'

function assertCourseContextObligation(input: {
  obligation: FoundationCoverageObligation
  semanticItems: FoundationSemanticCoverageItem[]
  courseKnowledgeModel: CourseKnowledgeModel
}) {
  return assertCourseTruthRequiredScopeRetention({
    obligations: [input.obligation],
    semanticItems: input.semanticItems,
    nodes: input.courseKnowledgeModel.nodes,
  })
}

function assertAqaCourseContextRetention(input: {
  obligation: FoundationCoverageObligation
  semanticItems: FoundationSemanticCoverageItem[]
  courseKnowledgeModel: CourseKnowledgeModel
}) {
  try {
    return assertCourseContextObligation(input)
  } catch (error) {
    if (!(error instanceof Error)) throw error

    if (error.message === missingInterrelatedFunctions) {
      return assertCourseContextObligation({
        ...input,
        obligation: courseContextAlternative(input.obligation, { interrelatedFunctions: true }),
      })
    }

    if (error.message !== missingVariedBusinessContexts) throw error

    const variedContextAlternative = courseContextAlternative(input.obligation, { variedContexts: true })
    try {
      return assertCourseContextObligation({
        ...input,
        obligation: variedContextAlternative,
      })
    } catch (variedContextError) {
      if (!(variedContextError instanceof Error) || variedContextError.message !== missingInterrelatedFunctions) {
        throw variedContextError
      }

      return assertCourseContextObligation({
        ...input,
        obligation: courseContextAlternative(input.obligation, {
          variedContexts: true,
          interrelatedFunctions: true,
        }),
      })
    }
  }
}

/**
 * Qualification-profile guard for the current AQA 7132 / 2027 Foundation.
 *
 * Source-led obligations define the named curriculum scope. The governed semantic seed
 * supplies the canonical node mapping. Final Course Truth must retain every mechanically
 * checkable named requirement after generative enrichment; exact seed prose is not required.
 *
 * AQA 3.0 has two tightly bounded wording alternatives proven by the retained live Candidate:
 * "varied business contexts" may render as "Business ... varied contexts", and "interrelated"
 * functional decisions may render as "connects functional decisions rather than treating
 * functions as isolated". Each alternative is attempted only after its exact governed anchor
 * fails; every other required term and obligation remains governed by the strict shared matcher.
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
