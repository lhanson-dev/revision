/**
 * Issue #698 — original AQA 7182 2025 A-level Research Methods, mathematical annex 7.2.
 * The annex includes calculation of standard deviation. These questions and numerical
 * cases are independently authored by Revision, NOT AQA official questions.
 * Explicit population convention (divide by N) removes sample/population ambiguity.
 *
 * Existing generic Practice calculation input scores one final value only (1 mark).
 * These tasks do NOT prove independently assessed written workings, exam-script quality,
 * broader Research Methods competence, or a hosted production learner pass.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

const originalCases = [
  {
    "id": "sd-population-01",
    "scores": [
      2,
      4,
      6,
      8
    ],
    "mean": 5,
    "squares": [
      9,
      1,
      1,
      9
    ],
    "sum": 20,
    "variance": 5,
    "sd": 2.24
  },
  {
    "id": "sd-population-02",
    "scores": [
      4,
      6,
      8,
      10,
      12
    ],
    "mean": 8,
    "squares": [
      16,
      4,
      0,
      4,
      16
    ],
    "sum": 40,
    "variance": 8,
    "sd": 2.83
  },
  {
    "id": "sd-population-03",
    "scores": [
      6,
      7,
      10,
      11
    ],
    "mean": 8.5,
    "squares": [
      6.25,
      2.25,
      2.25,
      6.25
    ],
    "sum": 17,
    "variance": 4.25,
    "sd": 2.06
  },
  {
    "id": "sd-population-04",
    "scores": [
      3,
      6,
      7,
      9,
      10
    ],
    "mean": 7,
    "squares": [
      16,
      1,
      0,
      4,
      9
    ],
    "sum": 30,
    "variance": 6,
    "sd": 2.45
  }
] as const

export const psychologyStandardDeviationPracticeBank = originalCases.map((item) =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    batch: '4.2.3',
    label: 'Revision-original AQA-aligned statistical calculation',
    confidence_label: 'Original arithmetic-verified pilot',
    namespace: 'rev7182',
    topic_id: 'research-methods',
    target_item_ids: ['PSY-07-26'],
    target_node_ids: ['research-methods-psy0726'],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 1,
      ao_tags: ['AO2'],
      context: 'A psychologist records memory-recall scores from an original practice study. Scores are in points. Use the population standard deviation formula, dividing the sum of squared deviations by the number of scores (N), not N − 1.',
      stem: `The scores are ${item.scores.join(', ')} points. Calculate the population standard deviation to two decimal places. Enter the numerical value; your working is not graded in this quick check.`,
      table: null,
      options: [],
      calcs: [{ stated_answer: item.sd, unit: 'points' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{
          marks: 1,
          descriptor: 'Correct population standard deviation, rounded to two decimal places.',
          accept: [`${item.sd} points`],
        }],
        levels: [],
        indicative_content: [],
        model_answer: `Mean = ${item.mean}. Squared deviations from the mean: ${item.squares.join(' + ')} = ${item.sum}. Population variance = ${item.sum} / ${item.scores.length} = ${item.variance}. Population standard deviation = √${item.variance} ≈ ${item.sd} points (two decimal places). The sample formula dividing by N − 1 would give a different result and is not the convention set for this practice question.`,
      },
    },
  }),
)
export const psychologyStandardDeviationRequirementBindings = Object.fromEntries(
  originalCases.map((item) => [`rev7182-4.2.3-${item.id}`, ['PSY-07-26'] as const]),
)
