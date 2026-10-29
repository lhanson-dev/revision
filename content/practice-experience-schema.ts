import { z } from 'zod'

/**
 * Practice Experience Matrix — the learner-experience layer over a course's
 * Course Truth, Exam Truth and Learning Blueprint.
 *
 * It does not add curriculum or assessment truth. For every specification
 * requirement it records which engaging practice formats to use, what the
 * specification precisely demands (and does not demand), and the synoptic
 * links that matter for evaluation marks. Every format maps onto Practice
 * activity modes the learner-asset builders already produce, so the site can
 * render a format without a new activity runtime.
 *
 * Subject-agnostic on purpose: the same schema can describe AQA Business,
 * Edexcel 9BS0 or any later course.
 */

/** Practice activity modes produced by the existing learner-asset builders. */
export const practiceActivityModes = [
  'retrieval_prompt_flashcard',
  'recognition_discrimination_check',
  'classification_matching_ordering',
  'contextual_application_scenario',
  'reasoning_chain_construction',
  'compare_justify_task',
  'calculation_quantitative_drill',
  'interpretation_data_graph_source',
  'misconception_diagnostic',
  'mixed_topic_retrieval',
  'short_constructed_response',
] as const

export const practiceDemands = [
  'recall',
  'describe',
  'explain',
  'apply',
  'compare',
  'evaluate',
  'calculate',
  'interpret_data',
  'choose_test',
] as const

const formatIdSchema = z.string().regex(/^[a-z][a-z0-9_]*$/)
const percentRangeSchema = z.tuple([z.number().min(0).max(100), z.number().min(0).max(100)])
  .refine(([low, high]) => low <= high, 'Range must run low to high')

export const practiceFormatSchema = z.object({
  id: formatIdSchema,
  name: z.string().min(1),
  learnerDescription: z.string().min(1),
  typicalMinutes: z.number().int().positive().max(20),
  assessmentObjectives: z.array(z.enum(['AO1', 'AO2', 'AO3', 'AO4'])).min(1),
  practiceModes: z.array(z.enum(practiceActivityModes)).min(1),
})

export const practiceExperienceRequirementSchema = z.object({
  requirementId: z.string().min(1),
  /** First format is the lead format for this requirement. */
  formats: z.array(formatIdSchema).min(1).max(4),
  demands: z.array(z.enum(practiceDemands)).min(1),
  /** Researchers, studies, models and terms the specification names for this point. */
  namedInSpecification: z.array(z.string().min(1)),
  /** Where the specification is precise about scope (what is and is not required). */
  specificationBoundary: z.string().min(1).optional(),
  issuesAndDebatesLinks: z.array(z.string().min(1)),
  crossTopicLinks: z.array(z.string().min(1)),
  /** Revision-authored, student-relevant situation to frame Apply It / Clinic tasks. */
  scenarioHook: z.string().min(1).optional(),
  /** `care`: third-person fictional cases only, no personal-disclosure prompts. */
  sensitivity: z.enum(['standard', 'care']),
})

export const practiceExperienceMatrixSchema = z.object({
  schemaVersion: z.literal(1),
  status: z.string().min(1),
  checkedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  course: z.object({
    awardingBody: z.string().min(1),
    qualification: z.string().min(1),
    subject: z.string().min(1),
    specificationCode: z.string().min(1),
    specificationVersion: z.string().min(1),
    firstAlevelExams: z.string().min(1),
  }),
  purpose: z.string().min(1),
  rights: z.object({ aqaUseClass: z.literal('REFERENCE_ONLY'), content: z.string().min(1) }),
  courseMixTargets: z.object({
    source: z.string().min(1),
    ao3ShareOfAssessmentPercent: percentRangeSchema,
    researchMethodsShareOfAssessmentPercent: percentRangeSchema,
    mathematicalSkillsShareOfAssessmentMinimumPercent: z.number().min(0).max(100),
    rule: z.string().min(1),
  }),
  formats: z.array(practiceFormatSchema).min(1),
  requirements: z.array(practiceExperienceRequirementSchema).min(1),
}).superRefine((matrix, context) => {
  const formatIds = new Set<string>()
  matrix.formats.forEach((format, index) => {
    if (formatIds.has(format.id)) context.addIssue({ code: 'custom', path: ['formats', index, 'id'], message: `Duplicate format ${format.id}` })
    formatIds.add(format.id)
  })
  const requirementIds = new Set<string>()
  matrix.requirements.forEach((requirement, index) => {
    if (requirementIds.has(requirement.requirementId)) {
      context.addIssue({ code: 'custom', path: ['requirements', index], message: `Duplicate requirement ${requirement.requirementId}` })
    }
    requirementIds.add(requirement.requirementId)
    requirement.formats.forEach((formatId) => {
      if (!formatIds.has(formatId)) {
        context.addIssue({ code: 'custom', path: ['requirements', index, 'formats'], message: `${requirement.requirementId} uses unknown format ${formatId}` })
      }
    })
    if (new Set(requirement.formats).size !== requirement.formats.length) {
      context.addIssue({ code: 'custom', path: ['requirements', index, 'formats'], message: `${requirement.requirementId} repeats a format` })
    }
    if (requirement.sensitivity === 'care' && requirement.scenarioHook && /\byou(r|'re)?\b/i.test(requirement.scenarioHook)) {
      context.addIssue({ code: 'custom', path: ['requirements', index, 'scenarioHook'], message: `${requirement.requirementId} is sensitive: its hook must be third-person` })
    }
  })
  matrix.requirements.forEach((requirement, index) => {
    ;[...requirement.issuesAndDebatesLinks, ...requirement.crossTopicLinks].forEach((link) => {
      if (!requirementIds.has(link)) {
        context.addIssue({ code: 'custom', path: ['requirements', index], message: `${requirement.requirementId} links to unknown requirement ${link}` })
      }
      if (link === requirement.requirementId) {
        context.addIssue({ code: 'custom', path: ['requirements', index], message: `${requirement.requirementId} links to itself` })
      }
    })
  })
})

export type PracticeFormat = z.infer<typeof practiceFormatSchema>
export type PracticeExperienceRequirement = z.infer<typeof practiceExperienceRequirementSchema>
export type PracticeExperienceMatrix = z.infer<typeof practiceExperienceMatrixSchema>

/** One requirement's practice design as carried inside a learner ContentPack. */
export const contentPackPracticeDesignSchema = practiceExperienceRequirementSchema.extend({
  topicId: z.string().min(1),
  /** The learner topic section this design applies to. */
  sectionId: z.string().min(1),
  /** Paper 3-style option group number, or null when the topic is compulsory. */
  optionGroup: z.number().int().positive().nullable(),
})

export const contentPackPracticeExperienceSchema = z.object({
  formats: z.array(practiceFormatSchema).min(1),
  designs: z.array(contentPackPracticeDesignSchema).min(1),
})

export type ContentPackPracticeDesign = z.infer<typeof contentPackPracticeDesignSchema>
export type ContentPackPracticeExperience = z.infer<typeof contentPackPracticeExperienceSchema>
