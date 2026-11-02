import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * LF-03 / #787 and #698: original AQA Psychology 7182 v1.4 Attachment
 * §4.1.3, printed p18, requirements PSY-03-04/05 only. These replace two
 * templated recognition questions with a repeated four-answer option set.
 * They are not AQA copyrighted exam questions or official mark schemes.
 * New stable IDs preserve historical answers; independent blind A3 remains
 * required before this draft is eligible for publication.
 */
export const attachmentMcqV2 = {
  'PSY-03-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0304-check-v2',
    topic: 'attachment',
    prompt: 'Two infants are separated from their original caregivers for six months. One receives continuous, responsive care from a familiar substitute. The other experiences frequent caregiver changes and little one-to-one attention. Which interpretation best follows from attachment research?',
    options: [
      'Both infants must show identical effects because physical separation alone determines deprivation.',
      'Only the sex or biological relationship of the new caregiver can explain different outcomes.',
      'Stable responsive care differs from institutional deprivation; separation alone cannot predict every outcome.',
      'The second situation proves that any later supportive care cannot affect developmental outcomes.',
    ],
    correctOption: 2,
    explanation: 'Separation from an original caregiver is not identical to deprivation of stable, responsive attachment care. The two scenarios differ in continuity and quality of care, so physical separation alone cannot predict the outcome. Bowlby highlighted risks from prolonged deprivation, and institutionalisation evidence shows variable outcomes rather than inevitable irreversible harm. This scenario alone does not demonstrate a causal effect.',
  }),
  'PSY-03-05': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0305-check-v2',
    topic: 'attachment',
    prompt: 'An adult recalls secure, supportive early caregiving but becomes wary of trusting others after several later relationship setbacks. Following a sustained supportive friendship, they gradually feel able to seek help again. What does an internal-working-model explanation predict?',
    options: [
      'Expectations shaped by early attachment can also be updated through later relationship experiences.',
      'Early attachment determines adult relationship behaviour regardless of later experience.',
      'Changing expectations prove that early attachments cannot influence any adult relationships.',
      'A later friendship permits reliable diagnosis of the adult’s infancy attachment classification.',
    ],
    correctOption: 0,
    explanation: 'An internal working model represents expectations about self, others and relationship support. Early attachment experiences can influence later interpretations and support seeking, but those expectations are not permanently fixed. Later relationship experiences may revise them. This short scenario cannot prove the causal importance of early care or diagnose an infant attachment classification retrospectively.',
  }),
} as const
