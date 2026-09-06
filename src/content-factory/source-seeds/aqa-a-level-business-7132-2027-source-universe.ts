import type { FoundationSourceUniverseRequirement } from '../foundation-source-universe'

export const AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID = 'aqa-7132-2027-source-universe'

/**
 * Independently-declared official source categories required before AQA 7132 / 2027
 * Foundation coverage may be treated as complete. These requirements sit upstream of
 * the curriculum/exam profiles so those profiles cannot certify their own source basis.
 */
export const AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE: FoundationSourceUniverseRequirement[] = [
  {
    sourceId: 'aqa-7132-specification',
    issuer: 'AQA',
    sourceType: 'specification',
    requiredUseClass: 'REFERENCE_ONLY',
    role: 'course_identity',
    rationale: 'Exact qualification, cohort, curriculum and assessment authority.',
  },
  {
    sourceId: 'aqa-7132-subject-content',
    issuer: 'AQA',
    sourceType: 'subject_content',
    requiredUseClass: 'REFERENCE_ONLY',
    role: 'curriculum_scope',
    rationale: 'Official subject-content hierarchy used to challenge curriculum coverage.',
  },
  {
    sourceId: 'aqa-7132-assessment',
    issuer: 'AQA',
    sourceType: 'assessment',
    requiredUseClass: 'REFERENCE_ONLY',
    role: 'exam_scope',
    rationale: 'Official component and assessment-format facts.',
  },
  {
    sourceId: 'aqa-7132-scheme',
    issuer: 'AQA',
    sourceType: 'assessment',
    requiredUseClass: 'REFERENCE_ONLY',
    role: 'exam_scope',
    rationale: 'Official assessment-objective and assessment-rule facts.',
  },
  {
    sourceId: 'aqa-7131-7132-formulae-key-data',
    issuer: 'AQA',
    sourceType: 'quantitative_or_skills_annex',
    requiredUseClass: 'REFERENCE_ONLY',
    role: 'quantitative_truth',
    rationale: 'Current AQA-recommended formulae and quantitative conventions must independently challenge Course Truth rather than be inferred from the curriculum profile.',
  },
  {
    sourceId: 'aqa-7131-7132-specification-updates-2023',
    issuer: 'AQA',
    sourceType: 'amendment_or_notice',
    requiredUseClass: 'REFERENCE_ONLY',
    role: 'source_discovery_surface',
    rationale: 'Current specification-change notice prevents removed or superseded content from silently remaining in the Foundation.',
  },
]
