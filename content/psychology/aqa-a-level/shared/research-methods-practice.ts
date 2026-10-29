/**
 * #698: Original, exact-specification AQA 7182 Research Methods practice.
 *
 * Source scope: user-supplied AQA 7182 v1.4 (1 September 2025), specification
 * pp 18–20 and mathematical requirements pp 35–37. REFERENCE_ONLY: no protected
 * AQA prose, specimen questions or marking-scheme text is reproduced.
 *
 * These are independently scored multiple-choice interpretation/calculation
 * checks using the existing learner Practice surface; they do NOT prove a
 * student can show calculation working, construct graphs or select a
 * statistical test independently in a full written assessment.
 */
import { dataDrillSchema, multipleChoiceQuestionSchema } from '../../../schema'

const topic = 'research-methods'

export const psychologyResearchMethodsAppliedQuestions = [
  multipleChoiceQuestionSchema.parse({
    id: 'psy-rm-applied-mean-01',
    topic,
    prompt: 'A psychologist records recall scores of 4, 6, 6, 8 and 11 words. What is the mean recall score?',
    options: ['6 words', '7 words', '7.5 words', '8 words'],
    correctOption: 1,
    explanation: 'Add all five scores (4 + 6 + 6 + 8 + 11 = 35) and divide by five. Mean = 7 words. The median and mode are both 6; they are not the mean.',
  }),
  multipleChoiceQuestionSchema.parse({
    id: 'psy-rm-applied-sign-test-01',
    topic,
    prompt: 'Five participants have Before/After scores: A 5/7, B 6/6, C 9/4, D 3/8, E 7/9. For a sign test where + means After is greater than Before, which effective n and smaller sign count (S) are correct?',
    options: ['n = 5, S = 1', 'n = 4, S = 1', 'n = 4, S = 3', 'n = 5, S = 0'],
    correctOption: 1,
    explanation: 'The signs are A +, B tie, C −, D + and E +. Exclude the tie, leaving n = 4; the smaller of three plus signs and one minus sign is S = 1. A critical value, significance level and one-/two-tailed convention are also needed before deciding significance.',
  }),
  multipleChoiceQuestionSchema.parse({
    id: 'psy-rm-applied-spearman-01',
    topic,
    prompt: 'Twelve participants have ranked revision time and exam-anxiety scores. Spearman’s rho is −0.62. The question supplies a two-tailed critical magnitude of 0.587 at 5% significance. Which conclusion is justified?',
    options: [
      'There is no significant association because the coefficient is negative.',
      'Revision time causes anxiety to decrease in every participant.',
      'There is a statistically significant negative association under the supplied critical-value rule, but causation has not been established.',
      'The observed result is significant only if rho is greater than +0.587.',
    ],
    correctOption: 2,
    explanation: 'Compare the absolute observed rho of 0.62 with the supplied critical magnitude of 0.587: 0.62 is larger. The association is negative and significant by this supplied two-tailed decision rule, but correlation does not prove causation or individual certainty.',
  }),
  multipleChoiceQuestionSchema.parse({
    id: 'psy-rm-applied-histogram-01',
    topic,
    prompt: 'A histogram of a continuous variable uses two unequal class widths. Class A spans 0–10 with frequency 12; class B spans 10–15 with frequency 12. Which statement correctly compares their bar heights?',
    options: [
      'Both bars have equal height because the frequencies are equal.',
      'Class A must be twice as tall because its class is wider.',
      'Bar height equals frequency multiplied by width, so class A is twice as tall.',
      'Class B is twice as tall because frequency density is 12/5 = 2.4 versus 12/10 = 1.2 for class A.',
    ],
    correctOption: 3,
    explanation: 'For unequal histogram class widths, height is frequency density = frequency ÷ class width. Class A: 12 ÷ 10 = 1.2. Class B: 12 ÷ 5 = 2.4. The bars have the same area (frequency 12), but B is twice as high.',
  }),
]

export const psychologyResearchMethodsAppliedDrills = [
  dataDrillSchema.parse({
    id: 'psy-rm-applied-drill-average',
    title: 'Calculate mean, median, mode and range',
    prompt: 'On paper, show calculations for the scores 4, 6, 6, 8, 11. Find mean, median, mode and range. Explain why the mean is different from the modal value.',
    answer: 'Mean = (4+6+6+8+11)/5 = 35/5 = 7. Median = the third score in the ordered list = 6. Mode = 6 (the most frequent score). Range = 11−4 = 7. The mean uses all five values and is pulled upwards by the score of 11; mode identifies the most frequent score.',
  }),
  dataDrillSchema.parse({
    id: 'psy-rm-applied-drill-sign-test',
    title: 'Apply a sign test to paired data',
    prompt: 'Using paired Before/After scores A 5/7, B 6/6, C 9/4, D 3/8, E 7/9, assign each pair +/−/tie, remove ties, give effective n and S. Explain what information is still needed for a significance decision.',
    answer: 'A +, B tie, C −, D +, E +. Exclude B: effective n = 4. Three plus, one minus: S = 1. You must know the chosen significance level, whether the hypothesis is directional (one-tailed) or non-directional (two-tailed), and the matching critical value before inferring significance.',
  }),
  dataDrillSchema.parse({
    id: 'psy-rm-applied-drill-histogram',
    title: 'Construct histogram bar heights from unequal widths',
    prompt: 'On paper construct a histogram with frequency-density heights for class A 0–10 frequency 12, and class B 10–15 frequency 12. Give the class widths, densities and expected bar-area ratio.',
    answer: 'A width 10, density 12/10 = 1.2. B width 5, density 12/5 = 2.4. Heights must be 1.2 and 2.4, so B is twice as high. Areas are equal at 12 frequency units each. Do not use frequency directly for bar height when class widths differ.',
  }),
]

/**
 * Durable source-to-published-asset crosswalk for this bounded correction.
 * The underlying Course Truth requirement IDs remain authoritative; this
 * metadata does not change the learner Practice or data-drill schema.
 */
export const psychologyResearchMethodsAppliedRequirementBindings: Readonly<Record<string, readonly string[]>> = {
  'psy-rm-applied-mean-01': ['PSY-07-26'],
  'psy-rm-applied-sign-test-01': ['PSY-07-32', 'PSY-07-33'],
  'psy-rm-applied-spearman-01': ['PSY-07-29', 'PSY-07-33', 'PSY-07-34'],
  'psy-rm-applied-histogram-01': ['PSY-07-27'],
  'psy-rm-applied-drill-average': ['PSY-07-26'],
  'psy-rm-applied-drill-sign-test': ['PSY-07-32', 'PSY-07-33'],
  'psy-rm-applied-drill-histogram': ['PSY-07-27'],
}
