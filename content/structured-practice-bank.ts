import { z } from 'zod'

// Generated, separately assured extended Practice questions travel with a ContentPack,
// not through a subject-specific import in the learner application.
export const structuredPracticeBankRecordSchema = z.object({
  id: z.string().min(1),
  batch: z.string().min(1),
  label: z.string().min(1),
  confidence_label: z.string().min(1),
  target_item_ids: z.array(z.string().min(1)).min(1),
  target_node_ids: z.array(z.string().min(1)),
  namespace: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).optional(),
  // A future qualification supplies its canonical learner topic; the original
  // AQA 7132 records retain the existing section-ID fallback for identity stability.
  topic_id: z.string().min(1).optional(),
  question: z.object({
    id: z.string().min(1),
    family: z.string().min(1),
    command_word: z.string().min(1),
    marks: z.number().int().positive(),
    ao_tags: z.array(z.string().min(1)),
    context: z.string(),
    stem: z.string().min(1),
    table: z.object({
      title: z.string().optional(),
      columns: z.array(z.string()),
      rows: z.array(z.object({ cells: z.array(z.string()) })),
    }).nullable(),
    options: z.array(z.object({ label: z.string(), text: z.string() })),
    calcs: z.array(z.object({
      stated_answer: z.number().finite(),
      unit: z.string(),
      // Opt-in discrete scoring; existing numeric items retain rounding tolerance.
      answer_rule: z.enum(['exact-integer']).optional(),
    }).passthrough()),
    mark_scheme: z.object({
      type: z.string().optional(),
      correct_option: z.string().optional(),
      option_rationale: z.array(z.string()).optional(),
      points: z.array(z.unknown()).optional(),
      levels: z.array(z.unknown()).optional(),
      indicative_content: z.array(z.unknown()).optional(),
      model_answer: z.string().optional(),
    }).passthrough(),
  }).passthrough(),
})
export type StructuredPracticeBankRecord = z.infer<typeof structuredPracticeBankRecordSchema>
