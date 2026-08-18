import { contentManifestSchema } from '../../../schema'

export const manifest = contentManifestSchema.parse({
  id: 'business-aqa-a-level-7132-paper-3',
  schemaVersion: 1,
  status: 'preview',
  subject: { id: 'business', name: 'Business' },
  qualification: { id: 'aqa-a-level', name: 'AQA A-level' },
  examBoard: { id: 'aqa', name: 'AQA' },
  specificationCode: '7132',
  paper: { id: 'paper-3', name: 'Paper 3: Business 3', number: 3, durationMinutes: 120, totalMarks: 100 },
  learnerExperience: {
    title: 'AQA A-level Business Paper 3',
    what_is_this: 'Revision for the full AQA 7132 course, with Paper 3 practice centred on one integrated compulsory case study.',
    why_it_matters: 'Paper 3 rewards holistic business thinking: interpreting the case, connecting functional and strategic issues, and making supported judgements.',
    what_you_are_trying_to_do: 'Use the full course flexibly inside one business context, prioritising the evidence and strategic issues that matter most.',
    how_results_are_worked_out: 'Revision combines full-course evidence with case-study and extended-response performance. Readiness should reflect both knowledge and the ability to integrate it.',
    what_to_do_next: 'Repair the weakest evidenced topic, then practise connecting it to other functions in the integrated Paper 3 case.',
  },
  topicIds: ['business','leadership','marketing','operations','finance','hr','strategic-position','strategic-direction','strategic-methods','strategic-change'],
})
