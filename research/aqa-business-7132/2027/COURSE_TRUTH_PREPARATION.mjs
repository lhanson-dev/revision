import mapping from './SPECIFICATION_MAPPING.mjs'

const courseTruthId = (section) => `CT-AQA-7132-${section.replaceAll('.', '-')}`

export const aqaBusiness7132CourseTruthPreparation = {
  schema_version: 1,
  preparation_id: 'aqa-business-7132-2027-course-truth-preparation-v1',
  authority_status: 'research_evidence_only',
  status: 'prepared_pending_v07_subject_gap_reassurance',
  course: {
    course_id: 'aqa:aqa-a-level:7132',
    awarding_body: 'AQA',
    qualification: 'A-level Business',
    specification_code: '7132',
    exam_year: 2027,
  },
  promotion_dependency: {
    required_subject_foundation_version: 'v0.7-aqa-7132-gap-reconciliation',
    required_subject_foundation_fingerprint: '64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53',
    required_targeted_reassurance_node_id: 'BUS-FIN-008',
    required_targeted_reassurance_decision: 'pass',
    promotion_before_dependency_pass_prohibited: true,
  },
  rights_boundary: {
    awarding_body_material_classification: 'REFERENCE_ONLY',
    protected_awarding_body_prose_is_not_course_teaching_truth: true,
    projection_uses_rights_safe_requirement_summaries_from: mapping.mapping_id,
  },
  requirements: mapping.requirements.map((requirement) => ({
    course_truth_id: courseTruthId(requirement.source_section),
    requirement_id: requirement.requirement_id,
    source_section: requirement.source_section,
    title: requirement.title,
    rights_safe_requirement_summary: requirement.rights_safe_requirement_summary,
    mapped_subject_node_ids: requirement.mapped_subject_node_ids,
    course_specific_facets: requirement.required_course_facets,
    quantitative_methods: requirement.required_quantitative_methods,
    mapping_classification: requirement.gap_classification,
    projection_status: requirement.source_section === '3.1.2'
      ? 'blocked_pending_v07_reassurance'
      : 'prepared_from_assured_subject_truth_and_course_alignment',
  })),
}

aqaBusiness7132CourseTruthPreparation.summary = {
  lowest_level_requirement_count: aqaBusiness7132CourseTruthPreparation.requirements.length,
  mapped_requirement_count: aqaBusiness7132CourseTruthPreparation.requirements.filter((item) => item.mapped_subject_node_ids.length > 0).length,
  blocked_requirement_ids: aqaBusiness7132CourseTruthPreparation.requirements.filter((item) => item.projection_status.startsWith('blocked')).map((item) => item.requirement_id),
  ready_for_promotion_when: 'BUS-FIN-008 v0.7 targeted reassurance PASS is retained against the exact v0.7 candidate fingerprint, then deterministic projection is revalidated.',
}

export default aqaBusiness7132CourseTruthPreparation
