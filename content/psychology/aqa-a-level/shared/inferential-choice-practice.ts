/**
 * Issue #698: original Psychology 7182 scenario-based inferential-test selection
 * and Type I/II error interpretation. AQA v1.4 (2025), sections 4.2.3.3
 * (PDF p21), REFERENCE_ONLY; prompts, data, choices and feedback authored by Revision.
 *
 * Correctly choosing a named test is assessed here by scored recognition.
 * These items do NOT assess actual calculations (except already published sign
 * test), a written justification, or readiness for the full exam.
 */
import { dataDrillSchema, multipleChoiceQuestionSchema } from '../../../schema'

const topic = 'research-methods'
const cases = [
  {
    "id": "psy-rm-select-spearman-01",
    "prompt": "Revision-original practice. A researcher ranks 20 participants from lowest to highest for daily social media use and ranks the same participants for self-reported loneliness. They want to test whether the two ranked variables are associated. Which test is the best choice?",
    "options": [
      "Pearson's r",
      "Spearman's rho",
      "Mann–Whitney U",
      "Chi-squared test"
    ],
    "correctOption": 1,
    "explanation": "The study asks for an association between two ordinal ranked variables measured for the same participants. Spearman's rho assesses ranked association. Mann–Whitney compares independent groups, while Chi-squared uses categorical frequencies."
  },
  {
    "id": "psy-rm-select-pearson-01",
    "prompt": "Revision-original practice. A psychologist measures two continuous interval-level variables for 40 people. The scatterplot suggests an approximately linear relationship and parametric assumptions are judged suitable. Which correlation test is most appropriate?",
    "options": [
      "Wilcoxon signed-rank",
      "Mann–Whitney U",
      "Chi-squared test",
      "Pearson's r"
    ],
    "correctOption": 3,
    "explanation": "Pearson's r is appropriate for a linear association between suitable continuous interval/ratio variables when parametric assumptions are justified. Spearman's rho would be preferred for ranked/ordinal association or unsuitable parametric conditions."
  },
  {
    "id": "psy-rm-select-wilcoxon-01",
    "prompt": "Revision-original practice. The same participants rate anxiety on a five-point ordered scale before and after a relaxation exercise. The researcher wants to test for a difference between the two related sets of ordinal scores, retaining the ranks of differences. Which test fits?",
    "options": [
      "Mann–Whitney U",
      "Wilcoxon signed-rank",
      "Related t-test",
      "Chi-squared test"
    ],
    "correctOption": 1,
    "explanation": "This is a difference question involving related repeated observations and ordinal scores. Wilcoxon signed-rank is the appropriate rank-based test. The related t-test relies on suitable interval/ratio data and parametric assumptions; Mann–Whitney is for independent groups."
  },
  {
    "id": "psy-rm-select-mann-whitney-01",
    "prompt": "Revision-original practice. Two different groups of students use different memory strategies. Their independent scores are ordered categories rather than suitable interval measurements. Which test should compare the groups?",
    "options": [
      "Wilcoxon signed-rank",
      "Unrelated t-test",
      "Mann–Whitney U",
      "Pearson's r"
    ],
    "correctOption": 2,
    "explanation": "The outcome is ordinal and the groups are independent. Mann–Whitney U tests a difference between independent groups without requiring interval-level parametric assumptions. Wilcoxon is for related observations."
  },
  {
    "id": "psy-rm-select-related-t-01",
    "prompt": "Revision-original practice. Each of 24 participants completes a continuous interval-level attention test before and after sleep restriction. The paired differences satisfy the relevant parametric assumptions. Which test compares the two conditions?",
    "options": [
      "Unrelated t-test",
      "Related t-test",
      "Chi-squared test",
      "Spearman's rho"
    ],
    "correctOption": 1,
    "explanation": "The same participants are measured twice, giving paired interval-level differences with suitable parametric assumptions. A related t-test compares the paired means. An unrelated t-test would require independent groups."
  },
  {
    "id": "psy-rm-select-unrelated-t-01",
    "prompt": "Revision-original practice. One group learns with background music and a separate independent group learns in silence. Both groups take the same continuous interval-level score test. Appropriate parametric assumptions are met. Which significance test compares their mean scores?",
    "options": [
      "Pearson's r",
      "Related t-test",
      "Unrelated t-test",
      "Wilcoxon signed-rank"
    ],
    "correctOption": 2,
    "explanation": "The researcher compares interval-level scores for two independent groups with suitable parametric assumptions, so an unrelated t-test is appropriate. A related t-test is for paired observations."
  },
  {
    "id": "psy-rm-select-chi-squared-01",
    "prompt": "Revision-original practice. A psychologist records whether participants prefer morning or evening revision and whether they choose group or solo study. The data form a two-by-two table of frequencies from independent observations. Which test assesses association between these nominal categories?",
    "options": [
      "Spearman's rho",
      "Mann–Whitney U",
      "Pearson's r",
      "Chi-squared test"
    ],
    "correctOption": 3,
    "explanation": "The question concerns association between categorical nominal variables using frequency counts. A Chi-squared test of independence fits when its expected-frequency and independence assumptions are satisfied; correlation coefficients analyse other data types."
  },
  {
    "id": "psy-rm-type-i-error-01",
    "prompt": "Revision-original practice. A study reports a statistically significant improvement from a new learning method. In reality the method has no effect and the null hypothesis is true. Which inferential error has occurred?",
    "options": [
      "Type I: rejecting a true null hypothesis",
      "Type II: retaining a false null hypothesis",
      "No error: significance proves a real effect",
      "Type II: rejecting a true null hypothesis"
    ],
    "correctOption": 0,
    "explanation": "A Type I error is a false positive: rejecting a true null hypothesis. The chosen significance threshold controls the long-run probability of this error under the null, not certainty about any one study."
  },
  {
    "id": "psy-rm-type-ii-error-01",
    "prompt": "Revision-original practice. A new revision intervention really does change performance, but a small noisy study fails to reject the null hypothesis of no difference. What is the possible inferential error?",
    "options": [
      "Type II: failing to reject a false null hypothesis",
      "Type I: rejecting a true null hypothesis",
      "Type I: accepting a true null hypothesis",
      "No error is possible if p is greater than 0.05"
    ],
    "correctOption": 0,
    "explanation": "A Type II error is a false negative: failing to reject a false null hypothesis despite a real effect. A non-significant result does not prove that the null is true."
  }
] as const

export const psychologyInferenceChoiceQuestions = cases.map((entry) => multipleChoiceQuestionSchema.parse({
  id: entry.id,
  topic,
  prompt: entry.prompt,
  options: [...entry.options],
  correctOption: entry.correctOption,
  explanation: entry.explanation,
}))

export const psychologyInferenceChoiceDrills = [
  dataDrillSchema.parse({
    id: 'psy-rm-inference-choice-drill-01',
    title: 'Choose and justify a statistical test',
    prompt: 'On paper, set out a decision table for seven new study descriptions. For each, state whether the research asks about an association or difference, whether measurements are nominal, ordinal or interval, and whether observations are related or independent. Choose and justify Spearman, Pearson, Wilcoxon, Mann–Whitney, related t, unrelated t or Chi-squared. Do not calculate these tests.',
    answer: 'Choose by question, design and scale: Spearman = ranked/ordinal association; Pearson = suitable linear continuous association; Wilcoxon = paired related ordinal difference; Mann–Whitney = independent ordinal difference; related t = suitable parametric paired interval-level difference; unrelated t = suitable parametric independent-groups interval-level difference; Chi-squared = independent nominal-category frequency association. Verify assumptions and do not infer causation from correlation. Only sign-test calculations, as separately practised, are required for the named inferential tests at this specification level.',
  }),
]

/** Sidecar mapping: an asset existing under a topic is not itself a verified examination skill. */
export const psychologyInferenceChoiceRequirementBindings: Record<string, readonly string[]> = {
  "psy-rm-select-spearman-01": [
    "PSY-07-34"
  ],
  "psy-rm-select-pearson-01": [
    "PSY-07-34"
  ],
  "psy-rm-select-wilcoxon-01": [
    "PSY-07-34"
  ],
  "psy-rm-select-mann-whitney-01": [
    "PSY-07-34"
  ],
  "psy-rm-select-related-t-01": [
    "PSY-07-34"
  ],
  "psy-rm-select-unrelated-t-01": [
    "PSY-07-34"
  ],
  "psy-rm-select-chi-squared-01": [
    "PSY-07-34"
  ],
  "psy-rm-type-i-error-01": [
    "PSY-07-33"
  ],
  "psy-rm-type-ii-error-01": [
    "PSY-07-33"
  ],
  "psy-rm-inference-choice-drill-01": [
    "PSY-07-34"
  ]
}
